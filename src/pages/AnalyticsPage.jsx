import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useReports } from '../context/ReportContext';

export function AnalyticsPage() {
  const { reports } = useReports();

  const stats = useMemo(() => {
    const total = reports.length;
    const reopened = reports.filter(r => r.status === 'reopened').length;
    const completed = reports.filter(r => r.status === 'completed').length;
    const resolvedByMod = reports.filter(r => r.status === 'resolved_by_moderator').length;
    
    // Success rate is completed / (completed + reopened) 
    // to show how many resolution attempts were successful vs bounced back
    const resolutionAttempts = completed + reopened;
    const successRate = resolutionAttempts === 0 ? 0 : Math.round((completed / resolutionAttempts) * 100);

    return { total, reopened, successRate };
  }, [reports]);

  const barData = [
    { name: 'Mon', reports: 4, resolved: 3 },
    { name: 'Tue', reports: 7, resolved: 5 },
    { name: 'Wed', reports: 2, resolved: 2 },
    { name: 'Thu', reports: 5, resolved: 4 },
    { name: 'Fri', reports: 8, resolved: 6 },
    { name: 'Sat', reports: 12, resolved: 8 },
    { name: 'Sun', reports: 9, resolved: 7 },
  ];

  const pieData = [
    { name: 'Harassment', value: 45 },
    { name: 'Violence Risk', value: 30 },
    { name: 'Domestic Conflict', value: 15 },
    { name: 'Other', value: 10 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#ec4899', '#64748b'];

  const StatCard = ({ title, value, subtext, isUp, delay, icon: Icon = TrendingUp, highlight = false }) => (
    <Card className={cn(
      "animate-fade-in-up hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] relative overflow-hidden group",
      highlight && "border-primary-500/30 bg-primary-900/10"
    )} style={{ animationDelay: delay }}>
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-16 h-16 text-primary-500" />
      </div>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <div className="flex items-end gap-3">
          <h3 className="text-3xl font-bold text-brand-dark dark:text-white">{value}</h3>
          <div className={cn("flex items-center text-sm font-medium mb-1", isUp ? "text-emerald-400" : "text-red-400")}>
            {isUp ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
            {subtext}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark dark:text-white">Platform Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400">Deep insights into community safety metrics and conflict resolution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Safety Reports" value={stats.total.toString()} subtext="+12.5%" isUp={true} delay="0ms" />
        <StatCard title="Resolution Success Rate" value={`${stats.successRate}%`} subtext="of attempts confirmed" isUp={stats.successRate >= 80} delay="100ms" highlight={true} />
        <StatCard title="Reopened Cases" value={stats.reopened.toString()} subtext="require attention" isUp={false} delay="200ms" icon={AlertTriangle} />
        <StatCard title="Average Resolution Time" value="4.2h" subtext="-1.5h" isUp={true} delay="300ms" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle>Weekly Safety Incident Volume</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Bar dataKey="reports" fill="#3b82f6" radius={[6, 6, 0, 0]} name="New Reports" barSize={12} />
                <Bar dataKey="resolved" fill="#10b981" radius={[6, 6, 0, 0]} name="Resolved" barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: '500' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none drop-shadow-lg">
              <span className="block text-4xl font-bold text-brand-dark dark:text-white">{stats.total}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-medium mt-1">Total</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-2 w-full">
              {pieData.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: COLORS[i], color: COLORS[i] }}></div>
                  <span className="font-medium">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
