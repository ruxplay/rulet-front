'use client';

import React, { useState } from 'react';
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { WithdrawalsTable } from '@/components/admin/WithdrawalsTable';

interface WithdrawalsStats {
  totalWithdrawals: number;
  pendingWithdrawals: number;
  approvedWithdrawals: number;
  rejectedWithdrawals: number;
  totalAmount: number;
  totalWithdrawalAmount: number;
}

export default function AdminWithdrawalsPage() {
  const [stats, setStats] = useState<WithdrawalsStats>({
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    approvedWithdrawals: 0,
    rejectedWithdrawals: 0,
    totalAmount: 0,
    totalWithdrawalAmount: 0,
  });

  const handleStatsChange = (newStats: WithdrawalsStats) => {
    setStats(newStats);
  };

  return (
    <ProtectedPage allowedRoles={['admin']}>
      <AdminDashboard 
        pageTitle="Gestión de Retiros"
        pageDescription="Administra y revisa todas las solicitudes de retiro de los usuarios"
        stats={{
          totalWithdrawals: stats.totalWithdrawals,
          pendingWithdrawals: stats.pendingWithdrawals,
          approvedWithdrawals: stats.approvedWithdrawals,
          rejectedWithdrawals: stats.rejectedWithdrawals,
          totalWithdrawalAmount: stats.totalWithdrawalAmount,
        }}
      >
        <WithdrawalsTable onStatsChange={handleStatsChange} />
      </AdminDashboard>
    </ProtectedPage>
  );
}

