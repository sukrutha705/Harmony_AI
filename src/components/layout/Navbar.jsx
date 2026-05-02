import React, { useState } from 'react';
import { Bell, Search, Menu, X, AlertTriangle, ShieldCheck, MessageSquare } from 'lucide-react';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { userProfile, currentUser } = useAuth();

  const notifications = [
    { id: 1, title: 'New High-Risk Incident', desc: 'Harassment reported near transit stop', time: '2m ago', type: 'urgent', read: false },
    { id: 2, title: 'Incident Addressed', desc: 'Conflict case #102 marked addressed', time: '1h ago', type: 'success', read: true },
    { id: 3, title: 'Threat Alert Escalated', desc: 'Review AI insights for report #104', time: '3h ago', type: 'info', read: true },
  ];

  return (
    <header className="h-16 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-brand-dark/80 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 shadow-sm dark:shadow-lg transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden text-slate-500 hover:text-brand-dark dark:text-slate-400 dark:hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            className="relative p-2 text-slate-500 hover:text-brand-dark dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-pink shadow-[0_0_8px_rgba(236,72,153,0.8)] border border-dark-900 animate-pulse"></span>
          </button>

          {/* Smart Notifications Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-card p-0 rounded-2xl overflow-hidden shadow-2xl animate-slideDown border border-slate-200 dark:border-white/10 origin-top-right">
              <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-dark-800/50">
                <h3 className="font-semibold text-brand-dark dark:text-white">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-brand-dark dark:text-slate-400 dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className={cn("p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer", !notif.read && "bg-brand-accent/5 dark:bg-primary-500/5")}>
                    <div className="flex gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", 
                        notif.type === 'urgent' ? 'bg-red-500/20 text-red-400' :
                        notif.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-primary-500/20 text-primary-400'
                      )}>
                        {notif.type === 'urgent' && <AlertTriangle className="w-4 h-4" />}
                        {notif.type === 'success' && <ShieldCheck className="w-4 h-4" />}
                        {notif.type === 'info' && <MessageSquare className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-sm font-medium", !notif.read ? "text-brand-dark dark:text-white" : "text-slate-600 dark:text-slate-300")}>{notif.title}</p>
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-accent-pink mt-1 shrink-0 shadow-[0_0_5px_rgba(236,72,153,0.5)]"></span>}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{notif.desc}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-slate-50 dark:bg-dark-800/50 text-center border-t border-slate-200 dark:border-white/5">
                <button className="text-sm text-brand-dark dark:text-primary-400 hover:opacity-80 font-medium">View all notifications</button>
              </div>
            </div>
          )}
        </div>
        
        <ThemeToggle />

        <div className="h-9 w-9 rounded-full bg-brand-accent flex items-center justify-center p-0.5 cursor-pointer hover:shadow-md transition-all group">
          <div className="w-full h-full rounded-full bg-brand-dark flex items-center justify-center text-xs font-bold text-white group-hover:bg-transparent group-hover:text-brand-dark transition-colors uppercase">
            {userProfile?.name ? userProfile.name.substring(0, 2) : (currentUser?.email ? currentUser.email.substring(0, 2) : 'U')}
          </div>
        </div>
      </div>
    </header>
  );
}
