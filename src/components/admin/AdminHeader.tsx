'use client';

import React from 'react';
import { useAuth } from '@/components/layout/hooks/useAuth';

interface AdminHeaderProps {
  pageTitle?: string;
  pageDescription?: string;
  stats?: {
    totalUsers?: number;
    activeUsers?: number;
    inactiveUsers?: number;
    adminUsers?: number;
    normalUsers?: number;
    totalDeposits?: number;
    pendingDeposits?: number;
    approvedDeposits?: number;
    rejectedDeposits?: number;
    totalAmount?: number;
    totalWithdrawals?: number;
    pendingWithdrawals?: number;
    approvedWithdrawals?: number;
    rejectedWithdrawals?: number;
    totalWithdrawalAmount?: number;
  };
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  pageTitle, 
  pageDescription,
  stats,
  onToggleSidebar,
  isSidebarOpen
}) => {
  const { authState } = useAuth();

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <div className="admin-header-main">
          <div className="admin-header-left">
            <div className="admin-header-top">
              <button 
                className="sidebar-toggle-btn"
                onClick={onToggleSidebar}
                title={isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
                aria-label={isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {isSidebarOpen ? (
                    // Flecha hacia la izquierda (ocultar)
                    <path d="M15 18L9 12L15 6"/>
                  ) : (
                    // Flecha hacia la derecha (mostrar)
                    <path d="M9 18L15 12L9 6"/>
                  )}
                </svg>
              </button>
              <h1 className="admin-header-title">Dashboard Administrativo</h1>
            </div>
            {pageTitle && (
              <div className="admin-page-info">
                <h2 className="admin-page-title">{pageTitle}</h2>
                {pageDescription && (
                  <p className="admin-page-description">{pageDescription}</p>
                )}
              </div>
            )}
          </div>
          {stats && (
            <div className="admin-page-stats">
              {/* Estadísticas de usuarios */}
              {stats.totalUsers !== undefined && (
                <>
                  <div className="stat-item">
                    <span className="stat-number">{stats.totalUsers}</span>
                    <span className="stat-label">usuarios totales</span>
                  </div>
                  <div className="stat-item stat-active">
                    <span className="stat-number">{stats.activeUsers}</span>
                    <span className="stat-label">usuarios activos</span>
                  </div>
                  <div className="stat-item stat-inactive">
                    <span className="stat-number">{stats.inactiveUsers}</span>
                    <span className="stat-label">usuarios eliminados</span>
                  </div>
                  <div className="stat-item stat-admin">
                    <span className="stat-number">{stats.adminUsers}</span>
                    <span className="stat-label">administradores</span>
                  </div>
                  <div className="stat-item stat-user">
                    <span className="stat-number">{stats.normalUsers}</span>
                    <span className="stat-label">usuarios normales</span>
                  </div>
                </>
              )}
              
              {/* Estadísticas de depósitos */}
              {stats.totalDeposits !== undefined && (
                <>
                  <div className="stat-item stat-deposits">
                    <span className="stat-number">{stats.totalDeposits}</span>
                    <span className="stat-label">depósitos totales</span>
                  </div>
                  <div className="stat-item stat-pending">
                    <span className="stat-number">{stats.pendingDeposits}</span>
                    <span className="stat-label">pendientes</span>
                  </div>
                  <div className="stat-item stat-approved">
                    <span className="stat-number">{stats.approvedDeposits}</span>
                    <span className="stat-label">aprobados</span>
                  </div>
                  <div className="stat-item stat-rejected">
                    <span className="stat-number">{stats.rejectedDeposits}</span>
                    <span className="stat-label">rechazados</span>
                  </div>
                  <div className="stat-item stat-amount">
                    <span className="stat-number">
                      {stats.totalAmount ? new Intl.NumberFormat('es-VE', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(stats.totalAmount) : '0'}
                    </span>
                    <span className="stat-label">monto total</span>
                  </div>
                </>
              )}
              
              {/* Estadísticas de retiros */}
              {stats.totalWithdrawals !== undefined && (
                <>
                  <div className="stat-item stat-deposits">
                    <span className="stat-number">{stats.totalWithdrawals}</span>
                    <span className="stat-label">retiros totales</span>
                  </div>
                  <div className="stat-item stat-pending">
                    <span className="stat-number">{stats.pendingWithdrawals}</span>
                    <span className="stat-label">pendientes</span>
                  </div>
                  <div className="stat-item stat-approved">
                    <span className="stat-number">{stats.approvedWithdrawals}</span>
                    <span className="stat-label">aprobados</span>
                  </div>
                  <div className="stat-item stat-rejected">
                    <span className="stat-number">{stats.rejectedWithdrawals}</span>
                    <span className="stat-label">rechazados</span>
                  </div>
                  <div className="stat-item stat-amount">
                    <span className="stat-number">
                      {stats.totalWithdrawalAmount ? new Intl.NumberFormat('es-VE', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(stats.totalWithdrawalAmount) : '0'}
                    </span>
                    <span className="stat-label">monto total</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
