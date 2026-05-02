import React from 'react';
import { UserDashboard } from './UserDashboard';
import { ModeratorDashboard } from './ModeratorDashboard';

import { useAuth } from '../context/AuthContext';

export function DashboardHub() {
  const { userProfile } = useAuth();
  const role = userProfile?.role || 'user';

  if (role === 'moderator') {
    return <ModeratorDashboard />;
  }

  return <UserDashboard />;
}
