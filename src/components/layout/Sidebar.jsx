import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus2, MessageSquare, BarChart3, User, LogOut, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const role = userProfile?.role || 'user';
  const userLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/report', icon: FilePlus2, label: 'Report Incident' },
    { to: '/dashboard/chat', icon: MessageSquare, label: 'AI Chat' },
    { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  const moderatorLinks = [
    { to: '/dashboard', icon: Shield, label: 'Moderator Hub' },
    { to: '/dashboard/analytics', icon: BarChart3, label: 'Platform Analytics' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  const links = role === 'moderator' ? moderatorLinks : userLinks;

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-emerald-800/50 dark:border-white/5 bg-emerald-900 dark:bg-brand-dark/80 backdrop-blur-xl h-screen sticky top-0 shadow-xl dark:shadow-2xl transition-colors">
      <div className="h-16 flex items-center px-6 border-b border-white/10 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-dark dark:bg-brand-accent flex items-center justify-center">
            <span className="text-brand-accent dark:text-brand-dark font-bold text-lg">H</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Harmony AI</span>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="mb-4 px-2 text-xs font-semibold text-emerald-100/70 dark:text-slate-400 uppercase tracking-wider">
          Menu
        </div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-white/10 dark:bg-brand-accent/10 text-white dark:text-brand-accent border border-white/20 dark:border-brand-accent/20 shadow-sm"
                  : "text-emerald-100/80 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-white border border-transparent"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white dark:bg-brand-accent rounded-r-full" />
                )}
                <link.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white dark:text-brand-accent" : "group-hover:text-white")} />
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 dark:border-white/5">
        <button
          onClick={async () => {
            await logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-emerald-100/80 dark:text-slate-400 hover:bg-red-500/20 dark:hover:bg-red-500/10 hover:text-red-300 dark:hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
