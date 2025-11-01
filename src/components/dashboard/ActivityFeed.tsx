"use client";

import React, { useMemo } from 'react';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { useGetUserHistoryQuery, UserHistoryItemType } from '@/store/api/usersApi';

interface ActivityItemViewModel {
  time: string;
  date: string;
  description: string;
  status: string;
  isWin?: boolean;
}

export const ActivityFeed = (): React.ReactElement => {
  const { authState } = useAuth();
  const username: string | undefined = authState.user?.username;

  const { data } = useGetUserHistoryQuery(
    {
      username: username || '',
      limit: 100,
      offset: 0,
      // tipos por defecto: deposits, withdrawals, bets
    },
    { skip: !username }
  );

  const activities: ActivityItemViewModel[] = useMemo(() => {
    if (!data?.items || data.items.length === 0) return [];

    // Tomar el último de cada tipo (ya vienen ordenados DESC)
    const lastDeposit = data.items.find((i) => i.type === ('deposit' as UserHistoryItemType));
    const lastWithdrawal = data.items.find((i) => i.type === ('withdrawal' as UserHistoryItemType));
    const lastBet = data.items.find((i) => i.type === ('bet' as UserHistoryItemType));

    const list: ActivityItemViewModel[] = [];

    if (lastBet) {
      const at = new Date(lastBet.at);
      const time = at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const date = at.toLocaleDateString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const betData = lastBet.data as Record<string, unknown>;
      const betAmount = (betData?.bet as string | number | undefined) ?? '-';
      const sectorIndex = (betData?.sectorIndex as number | undefined);
      const numero = Number.isFinite(sectorIndex) ? (Number(sectorIndex) + 1) : undefined;
      const ruletaType = (betData?.type as string | undefined) ?? undefined;
      const mesaId = (betData?.mesaId as string | number | undefined) ?? undefined;
      const won = betData?.won as boolean | undefined;
      const payout = betData?.payout as string | number | null | undefined;

      const parts: string[] = [];
      if (numero !== undefined) {
        parts.push(`Apuesta de ${betAmount} en número #${numero}`);
      } else {
        parts.push(`Apuesta de ${betAmount}`);
      }
      if (ruletaType) parts.push(`Ruleta ${ruletaType}`);
      if (mesaId !== undefined) parts.push(`Mesa ${mesaId}`);
      const description = parts.join(' • ');

      const status = won === true
        ? (payout != null ? `Ganaste ${payout}` : 'Ganaste')
        : won === false
          ? 'Perdida'
          : 'Procesando';

      list.push({ time, date, description, status, isWin: won === true });
    }

    if (lastDeposit) {
      const at = new Date(lastDeposit.at);
      const time = at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const date = at.toLocaleDateString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const depData = lastDeposit.data as Record<string, unknown>;
      const amount = (depData?.amount as number | string | undefined) ?? '-';
      const status = (depData?.status as string | undefined) ?? 'Procesando';
      const description = `Depósito recibido ${amount}`;
      list.push({ time, date, description, status });
    }

    if (lastWithdrawal) {
      const at = new Date(lastWithdrawal.at);
      const time = at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const date = at.toLocaleDateString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const wdData = lastWithdrawal.data as Record<string, unknown>;
      const amount = (wdData?.monto as number | string | undefined) ?? '-';
      const status = (wdData?.status as string | undefined) ?? 'Procesando';
      const description = `Retiro solicitado ${amount}`;
      list.push({ time, date, description, status });
    }

    // Ordenar por hora (por si alguno tiene misma fecha) ya que los 3 pueden ser de momentos distintos
    return list.sort((a, b) => a.time.localeCompare(b.time)).reverse();
  }, [data]);

  return (
    <div className="dashboard-card activity-feed">
      <h3>Actividad Reciente</h3>
      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="activity-item">
            <div className="activity-description">Sin actividad reciente</div>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-time">Fecha: {activity.date} — Hora: {activity.time}</div>
              <div className={`activity-description ${activity.isWin ? 'activity-win' : ''}`}>
                {activity.description}
              </div>
              <div className={`activity-tag ${
                activity.status.toLowerCase().includes('ganaste') || activity.status.toLowerCase() === 'approved'
                  ? 'activity-status-success'
                  : activity.status.toLowerCase().includes('perdi') || activity.status.toLowerCase() === 'rejected'
                  ? 'activity-status-danger'
                  : activity.status.toLowerCase() === 'pending' || activity.status.toLowerCase() === 'procesando'
                  ? 'activity-status-warning'
                  : 'activity-status-default'
              }`}>
                {activity.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
