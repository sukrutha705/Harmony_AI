import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { User, Mail, Phone, MapPin, Hash, BadgeInfo } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
  const { userProfile, currentUser } = useAuth();
  
  if (!userProfile && !currentUser) return null;

  // Merge the Firestore profile with the basic Firebase auth user
  const profile = {
    name: userProfile?.name || currentUser?.displayName || 'User',
    email: userProfile?.email || currentUser?.email || '',
    phone: userProfile?.phone || '',
    role: userProfile?.role || 'user',
    gender: userProfile?.gender || '',

    address: userProfile?.address || '',
    idNumber: userProfile?.idNumber || ''
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark dark:text-white">Profile</h1>
        <p className="text-slate-600 dark:text-slate-400">View your personal and account details.</p>
      </div>

      <Card className="animate-fade-in-up">
        <CardHeader className="border-b border-slate-200 dark:border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-brand-dark dark:bg-brand-accent flex items-center justify-center shadow-md">
              <span className="text-3xl font-bold text-brand-accent dark:text-brand-dark">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div>
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={profile.role === 'moderator' ? 'default' : 'secondary'} className="capitalize">
                  {profile.role}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Email Address</p>
                  <p className="text-brand-dark dark:text-white">{profile.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Phone Number</p>
                  <p className="text-brand-dark dark:text-white">{profile.phone || 'Not provided'}</p>
                </div>
              </div>

              {profile.role === 'user' && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Gender</p>
                    <p className="text-brand-dark dark:text-white capitalize">{profile.gender || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {profile.role === 'user' && (
                <>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Address</p>
                      <p className="text-brand-dark dark:text-white">{profile.address || 'Not provided'}</p>
                    </div>
                  </div>
                </>
              )}

              {profile.role === 'moderator' && (
                <div className="flex items-start gap-3">
                  <BadgeInfo className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Official ID Number</p>
                    <p className="text-brand-dark dark:text-white font-mono">{profile.idNumber || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
