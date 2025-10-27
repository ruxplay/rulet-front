'use client';

import React from 'react';
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminStatsProvider } from '@/components/admin/AdminStatsProvider';

export default function AdminPage() {
  return (
    <ProtectedPage allowedRoles={['admin']}>
      <AdminDashboard>
        <AdminStatsProvider />
      </AdminDashboard>
    </ProtectedPage>
  );
}
