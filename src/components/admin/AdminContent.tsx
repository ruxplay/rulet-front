'use client';

import React from 'react';

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

interface AdminContentProps {
  stats?: DashboardStats;
}

export const AdminContent: React.FC<AdminContentProps> = ({ stats }) => {
  return (
    <main className="admin-content">
      <div className="admin-content-container">
        <div className="admin-welcome">
          <h2>Bienvenido al Panel Administrativo</h2>
          <p>Desde aquí puedes gestionar todos los aspectos de la plataforma.</p>
        </div>
        
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <h3>Usuarios Totales</h3>
            <p className="stat-number">{stats?.totalUsers || 0}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Depósitos Pendientes</h3>
            <p className="stat-number">{stats?.pendingDeposits || 0}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Ganancias Casa</h3>
            <p className="stat-number">
              {stats?.houseEarnings ? new Intl.NumberFormat('es-VE', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(stats.houseEarnings) : '0 RUB'}
            </p>
          </div>
          <div className="admin-stat-card">
            <h3>Mesas Activas</h3>
            <p className="stat-number">{stats?.activeMesas || 0}</p>
            {stats?.activeMesasDetail && stats.activeMesasDetail.length > 0 && (
              <div className="mesas-detail">
                {stats.activeMesasDetail.map((mesa, index) => (
                  <div key={index} className="mesa-item">
                    <div className="mesa-info">
                      <span className="mesa-type">Ruleta {mesa.type}</span>
                      <span className="mesa-id">ID: {mesa.mesaId}</span>
                    </div>
                    <span className="mesa-status">{mesa.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
