import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShieldAlert, CheckCircle, MapPin, Image as ImageIcon, Send, Clock, AlertTriangle, Upload, Check, X, BarChart2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useReports } from '../context/ReportContext';
import { calculateDistance } from '../lib/geoUtils';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom component to handle map centering
function MapAutoCenter({ reports }) {
  const map = useMap();
  useEffect(() => {
    const validLocs = reports.filter(r => r.location).map(r => [r.location.lat, r.location.lng]);
    if (validLocs.length > 0) {
      map.fitBounds(validLocs, { padding: [50, 50], maxZoom: 15 });
    }
  }, [reports, map]);
  return null;
}

function useTheme() {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

export function ModeratorDashboard() {
  const { reports, markInProgress, resolveReport } = useReports();
  const [tab, setTab] = useState('ongoing'); // ongoing | completed
  const [sortBy, setSortBy] = useState('newest');
  const [resolvingId, setResolvingId] = useState(null);
  const isDark = useTheme();
  const [responseText, setResponseText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [hoveredReport, setHoveredReport] = useState(null);
  
  // Proof state
  const [proofUrl, setProofUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [hotspots, setHotspots] = useState([]);

  // Filtering & Sorting Logic
  const filteredReports = reports
    .filter(r => tab === 'ongoing' ? r.status !== 'completed' : r.status === 'completed')
    .filter(r => selectedDepartment === 'All' || r.department === selectedDepartment)
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const pMap = { High: 3, Medium: 2, Low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Hotspot Calculation
  useEffect(() => {
    if (!reports) return;
    const clusters = {};
    reports
      .filter(r => r.status !== 'completed')
      .filter(r => selectedDepartment === 'All' || r.department === selectedDepartment)
      .forEach(r => {
        const area = r.location_label || "Unknown Area";
        if (!clusters[area]) clusters[area] = { count: 0, highCount: 0, reports: [], location: r.location };
        clusters[area].count += 1;
        clusters[area].reports.push(r);
        if (r.priority === 'High') clusters[area].highCount += 1;
      });

    const detectedHotspots = Object.keys(clusters).map(area => {
      const c = clusters[area];
      let riskLevel = 'Low';
      if (c.highCount >= 2 || c.count >= 3) riskLevel = 'High';
      else if (c.highCount === 1 || c.count >= 2) riskLevel = 'Medium';
      return { area, count: c.count, riskLevel, location: c.location };
    });

    setHotspots(detectedHotspots.sort((a,b) => {
      const w = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return w[b.riskLevel] - w[a.riskLevel];
    }));
  }, [reports]);

  const urgentCount = reports.filter(r => (r.priority === 'High' || r.status === 'reopened') && r.status !== 'completed').length;

  const handleProofUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResolveSubmit = (report) => {
    if (!responseText.trim() || !proofUrl) {
      alert("Response text and photo proof are mandatory.");
      return;
    }
    
    // We no longer track moderator location, so we mark as resolved directly
    resolveReport(report.id, responseText, proofUrl, true);
    setResolvingId(null);
    setResponseText('');
    setProofUrl(null);
  };

  const PriorityTag = ({ priority }) => {
    const colors = {
      High: 'bg-red-500/20 text-red-400 border-red-500/30',
      Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    };
    return (
      <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase", colors[priority])}>
        <div className={cn("w-1.5 h-1.5 rounded-full", priority === 'High' ? 'bg-red-400 animate-pulse' : priority === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400')} />
        {priority}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* HEADER & TABS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary-400" />
            Command Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Real-time community oversight and incident response.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <select 
            className="h-10 bg-white dark:bg-dark-800 border border-slate-300 dark:border-white/10 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 ring-primary-500/30 text-slate-700 dark:text-white font-bold"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="Police">Police Department</option>
            <option value="Women Safety Cell">Women Safety Cell</option>
            <option value="Municipal Corporation">BBMP / Civic</option>
            <option value="Traffic Police">Traffic Police</option>
            <option value="Fire Department">Fire & Safety</option>
            <option value="Cyber Cell">Cyber Cell</option>
            <option value="Child Protection">Child Protection</option>
            <option value="Emergency Response">Medical / Emergency</option>
          </select>

          <div className="flex bg-white dark:bg-dark-800 p-1.5 rounded-2xl border border-slate-300 dark:border-white/10 shadow-2xl">
            <Button 
              variant={tab === 'ongoing' ? 'gradient' : 'ghost'} 
              size="sm" 
              onClick={() => setTab('ongoing')}
              className="rounded-xl px-6"
            >
              Active ({reports.filter(r => r.status !== 'completed').length})
            </Button>
            <Button 
              variant={tab === 'completed' ? 'gradient' : 'ghost'} 
              size="sm" 
              onClick={() => setTab('completed')}
              className="rounded-xl px-6"
            >
              Resolved ({reports.filter(r => r.status === 'completed').length})
            </Button>
          </div>
          <Badge variant="destructive" className="h-10 px-4 text-sm animate-pulse">Critical: {urgentCount}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REPORT LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-dark-800/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-sm">
             <h2 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs flex items-center gap-2">
               <BarChart2 className="w-4 h-4 text-primary-400" /> 
               {tab === 'ongoing' ? 'Live Incident Queue' : 'Historical Archive'}
             </h2>
             <select 
               className="bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-white/10 text-xs rounded-xl px-4 py-2 outline-none focus:ring-2 ring-primary-500/30"
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value)}
             >
               <option value="newest">Latest First</option>
               <option value="priority">High Priority First</option>
             </select>
          </div>

          {filteredReports.length === 0 ? (
            <Card className="p-20 text-center bg-white dark:bg-dark-800/20 border-dashed border-slate-300 dark:border-white/10">
              <CheckCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">No reports found in this section.</p>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <Card key={report.id} className={cn("group transition-all duration-500 border-slate-200 dark:border-white/5 hover:border-primary-500/30", report.status === 'reopened' ? 'ring-2 ring-red-500/50 bg-red-500/5' : 'bg-white dark:bg-dark-800/40')}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20 uppercase tracking-tighter">
                          {report.displayId}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">{report.category}</Badge>
                        <PriorityTag priority={report.priority} />
                      </div>
                      <CardTitle className="text-xl text-slate-900 dark:text-white group-hover:text-primary-400 transition-colors">{report.title}</CardTitle>
                    </div>
                    
                    {tab === 'ongoing' && (
                      <div className="flex gap-2">
                        {report.status === 'pending' && (
                          <Button variant="outline" size="sm" className="h-9 gap-2 border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-white/5" onClick={() => markInProgress(report.id)}>
                            <Clock className="w-4 h-4" /> Review
                          </Button>
                        )}
                        
                        {report.status === 'resolved_by_moderator' ? (
                          <Badge variant="outline" className="h-9 px-4 border-amber-500/30 text-amber-400 bg-amber-500/10 animate-pulse">
                            Awaiting User Confirmation
                          </Badge>
                        ) : (
                          <Button 
                            variant={resolvingId === report.id ? "ghost" : "gradient"} 
                            size="sm" 
                            className="h-9 gap-2"
                            onClick={() => setResolvingId(resolvingId === report.id ? null : report.id)}
                          >
                            <CheckCircle className="w-4 h-4" /> {resolvingId === report.id ? 'Cancel' : 'Resolve'}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{report.description}</p>
                  
                  {/* Evidence Display */}
                  <div className="flex flex-wrap gap-6 p-4 rounded-2xl bg-black/20 border border-slate-200 dark:border-white/5">
                    {report.evidenceUrl && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><ImageIcon className="w-3 h-3" /> User Evidence</p>
                        <img src={report.evidenceUrl} className="h-24 w-40 object-cover rounded-xl border border-slate-300 dark:border-white/10" alt="Evidence" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><MapPin className="w-3 h-3" /> Location Detail</p>
                      <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-900 dark:text-white font-bold">{report.location_label || "No area name provided"}</p>
                          {report.location && (
                            <p className="text-[10px] text-primary-400 mt-1 font-mono">{report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}</p>
                          )}
                        </div>
                        {report.location && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10"
                            onClick={() => window.open(`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`, '_blank')}
                          >
                            <MapPin className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resolve UI */}
                  {resolvingId === report.id && (
                    <div className="pt-4 border-t border-slate-200 dark:border-white/5 animate-slideDown space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Describe the resolution actions..." value={responseText} onChange={(e) => setResponseText(e.target.value)} />
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 gap-2 border-slate-300 dark:border-white/10" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="w-4 h-4" /> {proofUrl ? "Photo Ready" : "Upload Proof"}
                          </Button>
                          <input type="file" className="hidden" ref={fileInputRef} onChange={handleProofUpload} />
                          <Button variant="gradient" className="flex-1" onClick={() => handleResolveSubmit(report)}>Finalize</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* INTERACTIVE MAP */}
        <div className="lg:col-span-1">
          <Card className="h-[650px] flex flex-col relative overflow-hidden bg-slate-50 dark:bg-dark-900 border-slate-300 dark:border-white/10 shadow-3xl sticky top-24">
            <CardHeader className="absolute top-0 left-0 w-full z-30 bg-gradient-to-b from-dark-900 via-dark-900/80 to-transparent pb-10 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase tracking-tighter">
                  <MapPin className="w-6 h-6 text-accent-green" /> Live Conflict Map
                </CardTitle>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Interactive tracker</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-[10px] border-slate-300 dark:border-white/10 gap-2 hover:bg-primary-500/10"
                onClick={() => {
                  const coords = reports.filter(r => r.location).map(r => `${r.location.lat},${r.location.lng}`).join('/');
                  window.open(`https://www.google.com/maps/dir/${coords}`, '_blank');
                }}
              >
                <MapPin className="w-3 h-3" /> View Global Map
              </Button>
            </CardHeader>

            <div className="flex-1 w-full h-full relative">
              <MapContainer 
                center={[20.5937, 78.9629]} 
                zoom={5} 
                style={{ height: '100%', width: '100%', background: isDark ? '#0f172a' : '#f8fafc' }}
                zoomControl={false}
                className="z-10"
              >
                <TileLayer
                  key={isDark ? 'dark' : 'light'}
                  url={isDark 
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                
                {reports
                  .filter(r => r.location)
                  .filter(r => selectedDepartment === 'All' || r.department === selectedDepartment)
                  .map((report) => (
                    <CircleMarker 
                      key={report.id} 
                      center={[report.location.lat, report.location.lng]}
                    pathOptions={{ 
                      color: report.priority === 'High' ? '#ef4444' : report.priority === 'Medium' ? '#f59e0b' : '#10b981',
                      fillColor: report.priority === 'High' ? '#ef4444' : report.priority === 'Medium' ? '#f59e0b' : '#10b981',
                      fillOpacity: 0.6,
                      weight: 2
                    }}
                    radius={8}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                      <div className="p-3 min-w-[200px] max-w-[250px] bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-white/10 rounded-xl shadow-3xl space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-2">
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", 
                            report.priority === 'High' ? 'text-red-400' : 
                            report.priority === 'Medium' ? 'text-amber-400' : 'text-emerald-400')}>
                            {report.priority} Risk
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">{report.displayId}</span>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1">{report.title}</h4>
                          <Badge variant="outline" className="text-[8px] h-4 uppercase">{report.category}</Badge>
                        </div>

                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                          "{report.description.substring(0, 80)}..."
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/5">
                          <span className="text-[9px] text-primary-400 font-bold uppercase">{report.status}</span>
                          <span className="text-[9px] text-slate-500">{new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                    </Tooltip>
                    <Popup className="custom-popup">
                      <div className="p-2 min-w-[150px] bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={report.priority === 'High' ? 'destructive' : 'secondary'} className="text-[9px]">
                            {report.priority}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-bold mb-1">{report.title}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {report.location_label}
                        </p>
                        <p className="text-[10px] text-primary-400 mt-2 font-bold uppercase tracking-tighter">
                          Status: {report.status.replace('_', ' ')}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
                
                <MapAutoCenter reports={reports} />
              </MapContainer>

              {/* Map UI Overlay (Legend) */}
              <div className="absolute bottom-6 left-6 right-6 p-5 bg-white dark:bg-dark-800/90 backdrop-blur-xl border border-slate-300 dark:border-white/10 rounded-2xl shadow-2xl space-y-4 z-[1000]">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Severity Legend</p>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Live Syncing</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs text-slate-700 dark:text-slate-300">Critical</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-xs text-slate-700 dark:text-slate-300">Medium</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-slate-700 dark:text-slate-300">Low</span></div>
                </div>
              </div>
            </div>

            {/* Hotspots Section for Moderators */}
            <div className="bg-white dark:bg-dark-900 border-t border-slate-300 dark:border-white/10 p-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Active Hotspot Clusters
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {hotspots.map((spot, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{spot.area}</p>
                      <p className="text-[10px] text-slate-500">{spot.count} incidents</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-[8px] uppercase", 
                        spot.riskLevel === 'High' ? "bg-red-500/20 text-red-400" : 
                        spot.riskLevel === 'Medium' ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400")}>
                        {spot.riskLevel}
                      </Badge>
                      {spot.location && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-primary-400 hover:bg-primary-500/10"
                          onClick={() => window.open(`https://www.google.com/maps?q=${spot.location.lat},${spot.location.lng}`, '_blank')}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
