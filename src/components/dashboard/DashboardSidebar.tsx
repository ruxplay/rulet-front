import { useAuth } from '@/components/layout/hooks/useAuth';
import { useState } from 'react';
import Link from 'next/link';
import { EditProfileModal } from '@/components/auth/EditProfileModal';

export const DashboardSidebar = () => {
  const { authState } = useAuth();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const toggleUserInfo = () => {
    setShowUserInfo(!showUserInfo);
  };

  const user = authState.user;
  const phone = (user as { phone?: string }).phone;
  const createdAt = (user as { createdAt?: string }).createdAt;

  return (
    <div className="dashboard-sidebar">
      <div className="dashboard-card">
        <div className="sidebar-header">
          <h3 className="sidebar-title">Información del Usuario</h3>
          <div className="sidebar-header-actions">
            <button 
              onClick={toggleUserInfo}
              className="toggle-info-button"
            >
              {showUserInfo ? 'Ocultar' : 'Ver'}
            </button>
            <button 
              onClick={() => setShowEditModal(true)}
              className="edit-profile-button"
              title="Editar perfil"
            >
              ✏️
            </button>
          </div>
        </div>
        <div className="user-info">
          <div className="info-item">
            <span>Nombre:</span>
            <span>
              {showUserInfo ? (user?.fullName || 'N/A') : '••••••••••••••••••••'}
            </span>
          </div>
          <div className="info-item">
            <span>Email:</span>
            <span>
              {showUserInfo ? (user?.email || 'N/A') : '••••••••••••••••••••'}
            </span>
          </div>
          <div className="info-item">
            <span>Teléfono:</span>
            <span>
              {showUserInfo ? (phone || 'N/A') : '••••••••••••••••••••'}
            </span>
          </div>
          <div className="info-item">
            <span>Miembro desde:</span>
            <span>
              {showUserInfo ? (createdAt ? new Date(createdAt).toLocaleDateString('es-ES') : 'N/A') : '••••••••••••••••••••'}
            </span>
          </div>
        </div>
      </div>

      {/** Sección "Mesas en Vivo" removida a solicitud */}

      {/** Secciones "Últimos Ganadores" y "Tickets de Soporte" removidas a solicitud */}

      <div className="dashboard-card">
        <h3 className="sidebar-title">Acciones Rápidas</h3>
        <div className="quick-links">
          <Link href="/deposit" className="quick-link">
            💰 Recargar Saldo
          </Link>
          <Link href="/deposits" className="quick-link">
            📋 Historial de Depósitos
          </Link>
          <Link href="/withdrawals" className="quick-link">
            📋 Historial de Retiros
          </Link>
          <Link href="/withdraw" className="quick-link">
            💸 Retirar Fondos
          </Link>
          <Link href="/history" className="quick-link">
            🗂️ Historial de Usuario
          </Link>
        </div>
      </div>

      {/* Modal de Edición de Perfil */}
      <EditProfileModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
      />
    </div>
  );
};
