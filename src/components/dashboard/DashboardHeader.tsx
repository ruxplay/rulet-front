import { useUserData } from './hooks/useUserData';

export const DashboardHeader = () => {
  const { data: userData, isLoading } = useUserData();

  // Debug: ver qué datos llegan

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-header">
      <div className="dashboard-brand">
        <div>
          <div className="dashboard-brand-subtitle">
            Dashboard RubPlay
          </div>
          <div className="dashboard-brand-title">
            Bienvenido, {isLoading ? 'Cargando...' : userData?.user?.fullName || 'Usuario'}
          </div>
        </div>
      </div>
      <div className="dashboard-user">
        <div className="dashboard-meta">
          <div>
            Último acceso: {isLoading ? 'Cargando...' : 
              userData?.user?.lastLogin ? formatDate(userData.user.lastLogin) : 'N/A'}
          </div>
          <div>Zona horaria: GMT-4</div>
        </div>
      </div>
    </div>
  );
};
