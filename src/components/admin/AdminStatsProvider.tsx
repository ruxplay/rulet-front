'use client';

import React, { useState, useEffect } from 'react';
import { useGetAllUsersQuery } from '@/store/api/usersApi';
import { useGetAllDepositsQuery } from '@/store/api/adminDepositsApi';
import { useGetAllWithdrawalsQuery } from '@/store/api/adminWithdrawalsApi';
import { useGetCurrentMesaQuery } from '@/store/api/rouletteApi';
import { AdminContent } from './AdminContent';

interface ActiveMesa {
  type: '150' | '300';
  mesaId: string;
  status: string;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  houseEarnings: number;
  activeMesas: number;
  activeMesasDetail: ActiveMesa[];
}

export const AdminStatsProvider: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    houseEarnings: 0,
    activeMesas: 0,
    activeMesasDetail: [],
  });

  // Obtener datos de usuarios
  const { data: usersData } = useGetAllUsersQuery();
  
  // Obtener datos de depósitos
  const { data: depositsData } = useGetAllDepositsQuery({
    status: undefined,
    username: undefined,
  });
  
  // Obtener datos de retiros
  const { data: withdrawalsData } = useGetAllWithdrawalsQuery({
    status: undefined,
    username: undefined,
  });

  // Obtener mesas de ruleta 150 y 300
  const { data: mesa150Data } = useGetCurrentMesaQuery('150');
  const { data: mesa300Data } = useGetCurrentMesaQuery('300');

  // Calcular estadísticas
  useEffect(() => {
    // Obtener detalles de mesas activas
    const activeMesasDetail: ActiveMesa[] = [];
    
    if (mesa150Data?.mesa && (mesa150Data.mesa.status === 'open' || mesa150Data.mesa.status === 'spinning')) {
      activeMesasDetail.push({
        type: '150',
        mesaId: mesa150Data.mesa.mesaId,
        status: mesa150Data.mesa.status,
      });
    }
    
    if (mesa300Data?.mesa && (mesa300Data.mesa.status === 'open' || mesa300Data.mesa.status === 'spinning')) {
      activeMesasDetail.push({
        type: '300',
        mesaId: mesa300Data.mesa.mesaId,
        status: mesa300Data.mesa.status,
      });
    }
    
    const activeMesas = activeMesasDetail.length;

    // Calcular ganancias totales de la casa
    const houseEarnings = [
      mesa150Data?.mesa?.houseEarnings || 0,
      mesa300Data?.mesa?.houseEarnings || 0
    ].reduce((sum, val) => sum + Number(val), 0);

    const newStats: DashboardStats = {
      totalUsers: usersData?.users?.length || 0,
      activeUsers: usersData?.users?.filter(u => u.isActive !== false).length || 0,
      pendingDeposits: depositsData?.deposits?.filter(d => d.status === 'pending').length || 0,
      pendingWithdrawals: withdrawalsData?.withdrawals?.filter(w => w.status === 'pending').length || 0,
      houseEarnings,
      activeMesas,
      activeMesasDetail,
    };

    setStats(newStats);
  }, [usersData, depositsData, withdrawalsData, mesa150Data, mesa300Data]);

  return <AdminContent stats={stats} />;
};
