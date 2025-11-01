'use client';

import React, { useState, useEffect } from 'react';
import { useGetAllUsersQuery } from '@/store/api/usersApi';
import { useGetAllDepositsQuery } from '@/store/api/adminDepositsApi';
import { useGetAllWithdrawalsQuery } from '@/store/api/adminWithdrawalsApi';
import { useGetCurrentMesaQuery, useGetTotalHouseEarningsQuery } from '@/store/api/rouletteApi';
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

  // Obtener mesas de ruleta 150 y 300 (para mesas activas)
  const { data: mesa150Data } = useGetCurrentMesaQuery('150');
  const { data: mesa300Data } = useGetCurrentMesaQuery('300');

  // Obtener total de ganancias de la casa (todas las mesas cerradas)
  // Se actualiza automáticamente vía SSE cuando se cierra una mesa
  const { data: totalEarningsData } = useGetTotalHouseEarningsQuery();

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

    // Obtener ganancias totales de la casa desde el endpoint dedicado
    // Este endpoint suma todas las mesas cerradas y se actualiza automáticamente vía SSE
    const houseEarnings = totalEarningsData?.total || 0;
    
    // Debug: Log para verificar datos
    console.log('💰 Ganancias Casa - Debug:', {
      totalEarningsData,
      houseEarnings150: totalEarningsData?.[150] || 0,
      houseEarnings300: totalEarningsData?.[300] || 0,
      totalFinal: houseEarnings,
      mesasActivas: {
        mesa150: mesa150Data?.mesa?.mesaId,
        mesa300: mesa300Data?.mesa?.mesaId
      }
    });

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
  }, [usersData, depositsData, withdrawalsData, mesa150Data, mesa300Data, totalEarningsData]);

  return <AdminContent stats={stats} />;
};
