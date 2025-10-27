'use client';

import React, { useState, useCallback } from 'react';
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { UsersTable } from '@/components/admin/UsersTable';

export default function AdminUsersPage() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    normalUsers: number;
  } | undefined>(undefined);

  const handleStatsChange = useCallback((newStats: { 
    totalUsers: number; 
    activeUsers: number; 
    inactiveUsers: number; 
    adminUsers: number; 
    normalUsers: number; 
  }) => {
    setStats(newStats);
  }, []);

  return (
    <ProtectedPage allowedRoles={['admin']}>
      <AdminDashboard 
        pageTitle="Gestión de Usuarios"
        pageDescription="Administra todos los usuarios del sistema"
        stats={stats}
      >
        <UsersTable onStatsChange={handleStatsChange} />
      </AdminDashboard>
    </ProtectedPage>
  );
}
