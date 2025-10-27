'use client';

import React, { useState } from 'react';
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { DepositsTable } from '@/components/admin/DepositsTable';

interface DepositStats {
  totalDeposits: number;
  pendingDeposits: number;
  approvedDeposits: number;
  rejectedDeposits: number;
  totalAmount: number;
}

export default function AdminDepositsPage() {
  const [stats, setStats] = useState<DepositStats>({
    totalDeposits: 0,
    pendingDeposits: 0,
    approvedDeposits: 0,
    rejectedDeposits: 0,
    totalAmount: 0,
  });

  const handleStatsChange = (newStats: DepositStats) => {
    setStats(newStats);
  };

  return (
    <ProtectedPage allowedRoles={['admin']}>
      <AdminDashboard 
        pageTitle="Gestión de Depósitos"
        pageDescription="Administra y revisa todas las solicitudes de depósito de los usuarios"
        stats={stats}
      >
        <DepositsTable onStatsChange={handleStatsChange} />
      </AdminDashboard>
    </ProtectedPage>
  );
}
