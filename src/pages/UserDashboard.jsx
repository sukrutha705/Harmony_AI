import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileText, Clock, CheckCircle2, Activity, MessageSquare, AlertTriangle, MapPin, Calendar, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { useReports } from '../context/ReportContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapAutoCenter({ loc }) {
  const map = useMap();
  useEffect(() => {
    if (loc) {
      map.setView([loc.lat, loc.lng], 13);
    }
  }, [loc, map]);
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

export function UserDashboard() {
  const { reports, confirmResolution, reopenReport } = useReports();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const userId = currentUser?.uid || 'user_1';
  
  const [selectedReportIdForConfirm, setSelectedReportIdForConfirm] = useState(null);

  const isDark = useTheme();
  // --- Hotspot & Location State ---
  const [userLoc, setUserLoc] = useState(null);
  const [locError, setLocError] = useState(false);
  const [nearbyReports, setNearbyReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [highRiskAlert, setHighRiskAlert] = useState(false);

  // Distance helper in km
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocError(false);
        },
        (err) => {
          console.error("Location access denied", err);
          setLocError(true);
        }
      );
    } else {
      setLocError(true);
    }

    const interval = setInterval(() => {
      // Periodic ping if needed, reports context updates live
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!userLoc || !reports) return;
    
    // Filter nearby (5km radius)
    const nearby = reports.filter(r => {
      if (!r.location) return false;
      const dist = getDistance(userLoc.lat, userLoc.lng, r.location.lat, r.location.lng);
      return dist < 5 && r.status !== 'completed';
    });
    setNearbyReports(nearby);

    const clusters = {};
    nearby.forEach(r => {
      const area = r.location_label || "Nearby Area";
      if (!clusters[area]) clusters[area] = { count: 0, highCount: 0, recentCount: 0, reports: [] };
      clusters[area].count += 1;
      clusters[area].reports.push(r);
      if (r.priority === 'High') clusters[area].highCount += 1;
      const hoursDiff = (new Date() - new Date(r.createdAt)) / (1000 * 60 * 60);
      if (hoursDiff < 48) clusters[area].recentCount += 1;
    });

    let hasHighRiskAlert = false;
    const detectedHotspots = Object.keys(clusters).map(area => {
      const c = clusters[area];
      let riskLevel = 'Low';
      if (c.highCount >= 2 || (c.count >= 3 && c.recentCount >= 2)) {
        riskLevel = 'High';
        hasHighRiskAlert = true;
      } else if (c.highCount === 1 || c.count >= 2) {
        riskLevel = 'Medium';
      }
      return { area, count: c.count, riskLevel, reports: c.reports };
    });

    setHotspots(detectedHotspots.sort((a,b) => {
      const w = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return w[b.riskLevel] - w[a.riskLevel];
    }));
    setHighRiskAlert(hasHighRiskAlert);

  }, [userLoc, reports]);

  // Filter reports personalized to this user
  const userReports = reports.filter(r => r.userId === userId);

  const pendingCount = userReports.filter(r => r.status === 'pending' || r.status === 'urgent' || r.status === 'in_progress').length;

  const PriorityTag = ({ priority }) => {
    const colors = {
      High: 'bg-red-500/20 text-red-400 border-red-500/30',
      Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    };
    return (
      <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase", colors[priority])}>
        {priority}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <Badge variant="success">Completed</Badge>;
      case 'resolved_by_moderator': return <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 animate-pulse text-[10px]">Awaiting Confirmation</Badge>;
      case 'in_progress': return <Badge variant="outline" className="text-primary-400 border-primary-500/30 bg-primary-500/10 text-[10px]">In Progress</Badge>;
      case 'reopened': return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">Reopened</Badge>;
      default: return <Badge variant="secondary" className="text-[10px]">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* HERO SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white dark:bg-white dark:bg-dark-800/40 p-8 rounded-3xl border border-slate-200 dark:border-white/5 backdrop-blur-xl">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">User Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Real-time localized safety monitoring.</p>
        </div>
        <div className="flex gap-4">
          <Card className="px-6 py-4 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">My Reports</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{userReports.length}</h3>
          </Card>
          <Card className="px-6 py-4 bg-primary-500/10 border-primary-500/10">
            <p className="text-[10px] uppercase font-bold text-primary-400 tracking-widest mb-1">Active</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{pendingCount}</h3>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: PERSONAL HISTORY */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-400" /> My Incident History
            </h2>
          </div>
          
          {userReports.length === 0 ? (
            <Card className="p-16 text-center bg-white dark:bg-white dark:bg-dark-800/20 border-dashed border-slate-300 dark:border-white/10 rounded-3xl">
              <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">You haven't filed any reports yet.</p>
              <Button variant="gradient" className="mt-6" onClick={() => navigate('/dashboard/report')}>Report Incident</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {userReports.map((report) => (
                <Card key={report.id} className="p-6 bg-white dark:bg-white dark:bg-dark-800/40 border-slate-200 dark:border-white/5 hover:border-primary-500/20 transition-all group">
                  <div className="flex flex-col sm:flex-row justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
                          {report.displayId || "ID-NEW"}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{report.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 uppercase font-bold">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary-400" /> {report.location_label}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-primary-400" /> Published: {new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                      {report.moderatorResponse && (
                        <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-sm text-slate-700 dark:text-slate-300">
                          <p className="text-[10px] font-black text-primary-400 uppercase mb-1">Moderator Note</p>
                          {report.moderatorResponse}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3 min-w-[120px]">
                      <PriorityTag priority={report.priority} />
                      {getStatusBadge(report.status)}
                      {report.status === 'resolved_by_moderator' && (
                        <Button size="sm" variant="gradient" onClick={() => setSelectedReportIdForConfirm(report.id)}>Verify</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: NEARBY HOTSPOTS & MAP */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 group">
              <MapPin className="w-5 h-5 text-accent-green group-hover:rotate-12 transition-transform" /> 
              Live Nearby Incidents
            </h2>
            {highRiskAlert && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                <div>
                  <h3 className="text-red-500 font-bold text-sm">⚠️ High-Risk Activity Detected</h3>
                  <p className="text-red-400/80 text-xs mt-1">There are severe incidents reported near your current location. Please stay alert and avoid marked hotspot zones.</p>
                </div>
              </div>
            )}
          </div>

          <Card className="flex flex-col bg-white dark:bg-white dark:bg-dark-800/20 backdrop-blur-3xl border-slate-200 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-3xl">
            {/* Interactive Map */}
            <div className="h-64 w-full relative bg-slate-50 dark:bg-dark-900 border-b border-slate-200 dark:border-white/5">
              {!userLoc && !locError && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-50 dark:bg-dark-900/80 backdrop-blur-sm">
                  <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse flex items-center gap-2"><MapPin className="w-4 h-4" /> Locating you...</p>
                </div>
              )}
              {locError && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-50 dark:bg-dark-900/80 backdrop-blur-sm p-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                  <p className="text-slate-900 dark:text-white font-bold text-sm">Location Access Denied</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Please enable location services to view nearby hotspots. You can still file reports manually.</p>
                </div>
              )}
              {userLoc && (
                <MapContainer 
                  center={[userLoc.lat, userLoc.lng]} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%', background: isDark ? '#0f172a' : '#f8fafc' }}
                  zoomControl={false}
                  className="z-0"
                >
                  <TileLayer
                    key={isDark ? 'dark' : 'light'}
                    url={isDark 
                      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  />
                  {/* User Marker */}
                  <CircleMarker 
                    center={[userLoc.lat, userLoc.lng]}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8, weight: 2 }}
                    radius={6}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                      <span className="font-bold text-blue-500">You</span>
                    </Tooltip>
                  </CircleMarker>

                  {/* Incident Markers */}
                  {nearbyReports.map((report) => (
                    <CircleMarker 
                      key={report.id} 
                      center={[report.location.lat, report.location.lng]}
                      pathOptions={{ 
                        color: report.priority === 'High' ? '#ef4444' : report.priority === 'Medium' ? '#f59e0b' : '#10b981',
                        fillColor: report.priority === 'High' ? '#ef4444' : report.priority === 'Medium' ? '#f59e0b' : '#10b981',
                        fillOpacity: 0.6,
                        weight: 2
                      }}
                      radius={10}
                    >
                      <Popup className="custom-popup">
                        <div className="p-2 min-w-[150px] bg-white dark:bg-dark-900 text-slate-900 dark:text-white rounded-lg">
                          <h4 className="text-xs font-bold mb-1">{report.title}</h4>
                          <Badge variant={report.priority === 'High' ? 'destructive' : 'secondary'} className="text-[9px] mb-2">
                            {report.priority} Risk
                          </Badge>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">"{report.description}"</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                  <MapAutoCenter loc={userLoc} />
                </MapContainer>
              )}
            </div>

            <CardHeader className="bg-gradient-to-r from-white/5 to-transparent border-b border-slate-200 dark:border-white/5 px-6 py-4">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-accent-green flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-pulse" /> Hotspot Zones
                </span>
                <Badge variant="outline" className="text-[10px] bg-accent-green/10 border-accent-green/20 text-accent-green">
                  {hotspots.length} Zones
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0 overflow-y-auto max-h-[300px] custom-scrollbar">
              {hotspots.length === 0 ? (
                <div className="p-10 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-slate-900 dark:text-white font-bold mb-1">No incidents nearby. You're safe.</p>
                  <p className="text-slate-500 text-xs">There are no active reports within your vicinity.</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-200 dark:divide-white/5">
                  {hotspots.map((spot, idx) => (
                    <div key={idx} className="group p-5 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-accent-green transition-colors flex items-center gap-2">
                          {spot.area}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Activity className="w-3 h-3" /> {spot.count} active incident{spot.count > 1 ? 's' : ''}
                        </p>
                      </div>
                      <Badge className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-3",
                        spot.riskLevel === 'High' ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" :
                        spot.riskLevel === 'Medium' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                        "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      )}>
                        {spot.riskLevel} Risk
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RESOLUTION MODAL */}
      {selectedReportIdForConfirm && (() => {
        const reportToConfirm = reports.find(r => r.id === selectedReportIdForConfirm);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-200/80 dark:bg-white dark:bg-dark-950/80 backdrop-blur-2xl transition-all duration-500">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent-green/5 via-transparent to-primary-500/5" />
            
            <Card className="relative w-full max-w-lg bg-white/90 dark:bg-slate-50 dark:bg-dark-900/90 border border-slate-300 dark:border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-[2rem] overflow-hidden animate-in zoom-in-95 fade-in duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-green to-transparent opacity-50" />
              
              <CardHeader className="pt-10 pb-6 text-center relative z-10">
                <div className="relative w-24 h-24 mx-auto mb-6 group">
                  <div className="absolute inset-0 bg-accent-green/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-full h-full bg-white dark:bg-dark-800 border border-accent-green/30 rounded-full flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-12 h-12 text-accent-green drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                  SECURITY VERIFICATION
                </CardTitle>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 px-6 leading-relaxed">
                  The area safety responder has marked this incident as resolved. Please review the evidence and verify your safety.
                </p>
              </CardHeader>
              
              <CardContent className="px-8 pb-10 space-y-8 relative z-10">
                <div className="space-y-4">
                  {reportToConfirm?.moderatorProofUrl && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-300 dark:border-white/10 group shadow-2xl">
                      <img src={reportToConfirm.moderatorProofUrl} alt="Resolution Proof" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <Badge className="bg-accent-green/90 text-slate-900 dark:text-white border-none text-[10px] font-bold tracking-widest px-3 py-1 shadow-lg backdrop-blur-md">
                          OFFICIAL PROOF
                        </Badge>
                        <span className="text-slate-900 dark:text-white/70 text-[10px] font-mono tracking-widest">
                          {reportToConfirm.displayId}
                        </span>
                      </div>
                    </div>
                  )}

                  {reportToConfirm?.moderatorResponse && (
                    <div className="relative p-5 bg-slate-50 dark:bg-white dark:bg-dark-800/50 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-sm">
                      <p className="text-[10px] font-bold text-accent-green uppercase tracking-widest mb-2 flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" /> Responder Notes
                      </p>
                      <p className="italic text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        "{reportToConfirm.moderatorResponse}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-14 rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300 transition-all duration-300 font-bold tracking-wide" 
                    onClick={() => { reopenReport(selectedReportIdForConfirm); setSelectedReportIdForConfirm(null); }}
                  >
                    STILL AT RISK
                  </Button>
                  <Button 
                    className="flex-1 h-14 rounded-xl bg-accent-green hover:bg-emerald-400 text-dark-950 font-black tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300" 
                    onClick={() => { confirmResolution(selectedReportIdForConfirm); setSelectedReportIdForConfirm(null); }}
                  >
                    YES, I AM SAFE
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}
