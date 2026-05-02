import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Sparkles, Send, ShieldAlert, Activity, CheckCircle2, Mic, MicOff, BarChart2, Camera, MapPin, Image as ImageIcon, Video, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/ui/Skeleton';
import { useReports } from '../context/ReportContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function ReportIssuePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const speechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const [volume, setVolume] = useState(0);
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Refs to prevent stale closures in Speech API
  const descriptionRef = useRef(description);
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    descriptionRef.current = description;
  }, [description]);

  useEffect(() => {
    isListeningRef.current = isListening;
    if (recognitionRef.current) {
      if (isListening) {
        try { 
          recognitionRef.current.start(); 
        } catch (e) {
          console.warn("Recognition already started or failed:", e);
        }
      } else {
        recognitionRef.current.stop();
      }
    }
  }, [isListening]);

  // Debounced AI analysis for real-time transcription sync
  useEffect(() => {
    if (!description || description.length < 5 || isListening) return;
    
    const timeoutId = setTimeout(() => {
      handleRealAnalysis(description);
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [description, isListening]);

  // Camera & Evidence state
  const [evidenceUrl, setEvidenceUrl] = useState(null);
  const [incidentLocation, setIncidentLocation] = useState(null);
  const [photoLocation, setPhotoLocation] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [evidenceTimestamp, setEvidenceTimestamp] = useState(null);

  const { addReport } = useReports();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const userId = currentUser?.uid || 'user_1';

  useEffect(() => {
    // Setup Volume Meter
    let audioStream;
    const startVolumeMeter = async () => {
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: false,
            autoGainControl: true
          } 
        });
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(audioStream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (!isListening) {
            setVolume(0);
            return;
          }
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for(let i=0; i<bufferLength; i++) sum += dataArray[i];
          const average = sum / bufferLength;
          setVolume(average);
          requestAnimationFrame(updateVolume);
        };
        updateVolume();
      } catch (err) {
        console.error("Volume meter failed:", err);
      }
    };

    if (isListening) startVolumeMeter();
    
    return () => {
      if (audioStream) audioStream.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [isListening]);

  useEffect(() => {
    // Auto-capture location on mount
    autoCaptureLocation();
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    let sessionBaseText = '';

    recognitionRef.current.onstart = () => {
      sessionBaseText = descriptionRef.current;
    };
    
    recognitionRef.current.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setDescription((sessionBaseText + ' ' + currentTranscript).trim());
    };

    recognitionRef.current.onerror = (event) => {
      if (event.error !== 'no-speech') {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      }
    };

    recognitionRef.current.onend = () => {
      if (isListeningRef.current) {
        sessionBaseText = descriptionRef.current;
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Restart failed, retrying...");
        }
      } else {
        if (descriptionRef.current.length > 5) {
          handleRealAnalysis(descriptionRef.current);
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopCamera();
    };
  }, []);

  const toggleListening = () => {
    setIsListening(prev => !prev);
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    setEvidenceUrl(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      setEvidenceUrl(dataUrl);
      setEvidenceTimestamp(new Date().toISOString());
      stopCamera();
      autoCaptureLocation(true, true);
    }
  };

  const autoCaptureLocation = (force = false, isPhoto = false) => {
    if (!navigator.geolocation) return;
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newCoords = { lat, lng };
        
        if (isPhoto) {
          setPhotoLocation(newCoords);
        } else {
          setIncidentLocation(newCoords);
        }
        
        if (locationLabel && !force && !isPhoto) {
          setIsLocating(false);
          return;
        }

        try {
          if (!isPhoto) setLocationLabel('Detecting location...');
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          if (data && data.address) {
            const { road, suburb, neighbourhood, city, town, village } = data.address;
            const localArea = road || neighbourhood || suburb || "";
            const cityArea = city || town || village || "";
            let friendlyAddress = [localArea, cityArea].filter(Boolean).join(", ");
            if (!friendlyAddress) friendlyAddress = data.display_name.split(',').slice(0, 2).join(',');
            
            if (!isPhoto) setLocationLabel(friendlyAddress.trim());
          }
        } catch (error) {
          console.error("Geocoding failed", error);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Location error", error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const fetchLocationSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`);
      const data = await response.json();
      setLocationSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleLocationInputChange = (val) => {
    setLocationLabel(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchLocationSuggestions(val);
    }, 5000);
  };

  const selectSuggestion = (suggestion) => {
    setLocationLabel(suggestion.display_name);
    setIncidentLocation({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    });
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  const handleRealAnalysis = async (textToAnalyze = description) => {
    if (!textToAnalyze || textToAnalyze.trim().length < 5) {
      setAiAnalysis(null);
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const response = await fetch("http://localhost:5000/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToAnalyze }),
      });

      if (!response.ok) throw new Error("Backend analysis failed");

      const data = await response.json();
      
      setAiAnalysis({
        priority: data.priority || 'Low',
        category: data.category || 'General Safety',
        department: data.department || 'Police',
        riskLevel: data.priority || 'Low',
        confidence: data.confidence || '85%',
        escalationLikelihood: data.escalationLikelihood || 'Analysis complete.',
      });
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setAiAnalysis({
        priority: 'Low',
        category: 'General Safety',
        department: 'Police',
        riskLevel: 'Low',
        confidence: 'Local Fallback',
        escalationLikelihood: 'Analysis failed, using local detection.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const finalCategory = aiAnalysis?.category || 'General';
    const finalPriority = aiAnalysis?.priority || 'Low';
    const finalDepartment = aiAnalysis?.department || 'General Review';

    if (!locationLabel) {
      alert("Please specify the Incident Area.");
      setIsSubmitting(false);
      return;
    }

    let finalIncidentLocation = incidentLocation;

    if (!finalIncidentLocation && locationLabel) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationLabel)}&limit=1&countrycodes=in`);
        const data = await response.json();
        if (data && data[0]) {
          finalIncidentLocation = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
      } catch (e) {
        console.error("Final geocode failed", e);
      }
    }

    const reportData = {
      userId,
      title,
      description,
      location_label: locationLabel,
      category: finalCategory,
      priority: finalPriority,
      department: finalDepartment,
      status: 'pending',
      evidenceUrl,
      location: finalIncidentLocation,
      photoLocation,
      evidenceLocation: photoLocation || finalIncidentLocation, 
      evidenceTimestamp: new Date().toISOString(),
    };

    try {
      await addReport(reportData);
      alert('Report submitted successfully! 📍');
      navigate('/dashboard');
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Error submitting report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          Report an Incident
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Your safety report is completely anonymous. Our AI will analyze the risk and route it to the right department.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in-up shadow-xl border-slate-200 dark:border-white/5">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Incident Area</label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => autoCaptureLocation(true)}
                    disabled={isLocating}
                    className="h-7 text-[10px] uppercase tracking-wider text-primary-400"
                  >
                    <MapPin className={cn("w-3 h-3 mr-1", isLocating && "animate-bounce")} />
                    {isLocating ? "Detecting..." : "Use My Location"}
                  </Button>
                </div>
                <div className="relative">
                  <Input 
                    placeholder="e.g. Market Square, Street 12" 
                    required 
                    value={locationLabel}
                    onChange={(e) => handleLocationInputChange(e.target.value)}
                    className="bg-white/50 dark:bg-dark-900/50"
                  />
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
                      {locationSuggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          type="button"
                          className="w-full px-4 py-3 text-left text-sm hover:bg-slate-100 dark:hover:bg-white/5 flex items-start gap-3 border-b border-slate-100 dark:border-white/5 last:border-0"
                          onClick={() => selectSuggestion(suggestion)}
                        >
                          <MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                          <span className="truncate text-slate-700 dark:text-slate-300">{suggestion.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                <Input 
                  placeholder="Summary of the issue" 
                  required 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              {speechSupported && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-800/50 border border-slate-200 dark:border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Advanced AI Sentimental Hub</h3>
                    {isListening && (
                      <div className="flex gap-1 items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-red-500 uppercase">Recording...</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    type="button"
                    variant={isListening ? "destructive" : "outline"}
                    className={cn("w-full h-12 gap-2 rounded-xl transition-all", isListening && "animate-pulse")}
                    onClick={toggleListening}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {isListening ? "Stop Sentimental Analysis" : "Start Sentimental Analysis"}
                  </Button>
                </div>
              )}

              <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                  {isAnalyzing && (
                    <span className="text-[10px] font-bold text-primary-500 animate-pulse uppercase">AI Analyzing...</span>
                  )}
                </div>
                <Textarea 
                  placeholder="Describe what is happening in detail..." 
                  required 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => handleRealAnalysis(description)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Visual Evidence</label>
                  {!isCameraOpen && !evidenceUrl && (
                    <Button type="button" variant="outline" size="sm" onClick={startCamera} className="gap-2">
                      <Camera className="w-4 h-4" /> Capture
                    </Button>
                  )}
                </div>

                {isCameraOpen && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-black aspect-video flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <Button type="button" variant="destructive" size="icon" className="rounded-full" onClick={stopCamera}>
                        <X className="w-5 h-5" />
                      </Button>
                      <Button type="button" variant="gradient" size="icon" className="rounded-full w-12 h-12 border-2 border-white" onClick={capturePhoto}>
                        <Camera className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />

                {evidenceUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-dark-900">
                    <img src={evidenceUrl} alt="Evidence" className="w-full h-40 object-cover" />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm" 
                      className="absolute top-2 right-2 h-7"
                      onClick={() => { setEvidenceUrl(null); setPhotoLocation(null); }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 dark:border-white/5 pt-4">
              <Button type="submit" variant="gradient" className="w-full gap-2" disabled={isSubmitting || isCameraOpen}>
                {isSubmitting ? 'Submitting...' : <>Submit Anonymous Report <Send className="w-4 h-4" /></>}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="lg:h-full">
          {(isAnalyzing || aiAnalysis) ? (
            <Card className="h-full border-primary-500/20 bg-primary-500/5 shadow-2xl animate-fade-in-up flex flex-col">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-primary-400">
                  <Sparkles className="w-4 h-4" /> AI Analysis Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6 flex-1">
                {isAnalyzing ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <Skeleton className="h-20 w-full rounded-2xl" />
                  </div>
                ) : aiAnalysis && (
                  <>
                    <div className="grid gap-4">
                      <div className="bg-white/50 dark:bg-dark-900/50 rounded-2xl p-4 border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                          <Activity className="w-3 h-3" /> Incident Category
                        </div>
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{aiAnalysis.category}</p>
                      </div>
                      
                      <div className={cn(
                        "rounded-2xl p-4 border",
                        aiAnalysis.priority === 'High' ? 'bg-red-500/10 border-red-500/20' :
                        aiAnalysis.priority === 'Moderate' ? 'bg-amber-500/10 border-amber-500/20' :
                        'bg-emerald-500/10 border-emerald-500/20'
                      )}>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                          <ShieldAlert className="w-3 h-3" /> Risk Priority
                        </div>
                        <p className={cn(
                          "text-lg font-bold",
                          aiAnalysis.priority === 'High' ? 'text-red-500' :
                          aiAnalysis.priority === 'Moderate' ? 'text-amber-500' :
                          'text-emerald-500'
                        )}>{aiAnalysis.priority}</p>
                      </div>

                      <div className="bg-white/50 dark:bg-dark-900/50 rounded-2xl p-4 border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                          <CheckCircle2 className="w-3 h-3" /> Target Department
                        </div>
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{aiAnalysis.department}</p>
                      </div>

                      <div className="bg-white/50 dark:bg-dark-900/50 rounded-2xl p-4 border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                          <Sparkles className="w-3 h-3" /> AI Insight
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{aiAnalysis.escalationLikelihood}"</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Engine Confidence</span>
                      <Badge variant="outline" className="bg-primary-500/10 border-primary-500/30 text-primary-500">
                        {aiAnalysis.confidence} MATCH
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-dark-900/20">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-dark-800 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Live AI Sentinel</h3>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                Provide a description to activate the Harmony AI Engine. We'll automatically determine risk and department routing in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
