import { useUserData } from './hooks/useUserData';
import { useState } from 'react';
import Link from 'next/link';

export const DashboardSidebar = () => {
  const { data: userData, isLoading } = useUserData();
  const [showUserInfo, setShowUserInfo] = useState(false);

  const toggleUserInfo = () => {
    setShowUserInfo(!showUserInfo);
  };

  return (
    <div className="dashboard-sidebar">
      <div className="dashboard-card">
        <div className="sidebar-header">
          <h3 className="sidebar-title">Información del Usuario</h3>
          <button 
            onClick={toggleUserInfo}
            className="toggle-info-button"
          >
            {showUserInfo ? 'Ocultar' : 'Ver'}
          </button>
        </div>
        <div className="user-info">
          <div className="info-item">
            <span>Nombre:</span>
            <span>
              {isLoading ? 'Cargando...' : 
               showUserInfo ? (userData?.user?.fullName || 'N/A') : '••••••••••••••••••••'}
            </span>
          </div>
          <div className="info-item">
            <span>Email:</span>
            <span>
              {isLoading ? 'Cargando...' : 
               showUserInfo ? (userData?.user?.email || 'N/A') : '••••••••••••••••••••'}
            </span>
          </div>
          <div className="info-item">
            <span>Teléfono:</span>
            <span>
              {isLoading ? 'Cargando...' : 
               showUserInfo ? (userData?.user?.phone || 'N/A') : '••••••••••••••••••••'}
            </span>
          </div>
          <div className="info-item">
            <span>Miembro desde:</span>
            <span>
              {isLoading ? 'Cargando...' : 
               showUserInfo ? (userData?.user?.createdAt ? new Date(userData.user.createdAt).toLocaleDateString('es-ES') : 'N/A') : '••••••••••••••••••••'}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h3 className="sidebar-title">Mesas en Vivo</h3>
        <div className="live-list">
          <div className="live-item">
            <div className="live-header">
              <div>150</div>
              <div>12/15</div>
            </div>
            <div className="live-meter">
              <div className="live-fill" style={{width: '80%'}}></div>
            </div>
            <div className="live-status">Gira en ~1m</div>
          </div>
          <div className="live-item">
            <div className="live-header">
              <div>300</div>
              <div>5/15</div>
            </div>
            <div className="live-meter">
              <div className="live-fill" style={{width: '33%'}}></div>
            </div>
            <div className="live-status">Nuevo ciclo</div>
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h3 className="sidebar-title">Últimos Ganadores</h3>
        <div className="winner-list">
          <div className="winner-item">
            <span>Mesa 150:</span>
            <span>@Ana — 1.575</span>
          </div>
          <div className="winner-item">
            <span>Mesa 300:</span>
            <span>@Luis — 3.150</span>
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h3 className="sidebar-title">Tickets de Soporte</h3>
        <div className="winner-list">
          <div className="winner-item">
            <span>Pendientes</span>
            <span>1</span>
          </div>
          <div className="winner-item">
            <span>Resueltos</span>
            <span>3</span>
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h3 className="sidebar-title">Acciones Rápidas</h3>
        <div className="quick-links">
          <Link href="/deposit" className="quick-link">
            💰 Recargar Saldo
          </Link>
          <Link href="/deposits" className="quick-link">
            📋 Historial de Depósitos
          </Link>
          <Link href="/withdraw" className="quick-link">
            💸 Retirar Fondos
          </Link>
        </div>
      </div>
    </div>
  );
};
