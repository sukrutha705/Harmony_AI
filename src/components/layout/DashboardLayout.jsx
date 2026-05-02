import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function DashboardLayout() {
  // Mock role, could be derived from context/state later
  const role = localStorage.getItem('role') || 'user';

  return (
    <div className="flex h-screen w-full bg-brand-light dark:bg-brand-dark overflow-hidden transition-colors">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="mx-auto max-w-6xl relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
