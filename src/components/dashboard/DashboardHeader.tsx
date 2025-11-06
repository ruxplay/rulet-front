import { useAuth } from '@/components/layout/hooks/useAuth';

export const DashboardHeader = () => {
  const { authState } = useAuth();

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

  const user = authState.user;
  const lastLogin = (user as { lastLogin?: string }).lastLogin;

  return (
    <div className="dashboard-header">
      <div className="dashboard-brand">
        <div>
          <div className="dashboard-brand-subtitle">
            Dashboard RuxPlay
          </div>
          <div className="dashboard-brand-title">
            Bienvenido, {user?.fullName || 'Usuario'}
          </div>
        </div>
      </div>
      <div className="dashboard-user">
        <div className="dashboard-meta">
          <div>
            Último acceso: {lastLogin ? formatDate(lastLogin) : 'N/A'}
          </div>
          <div>Zona horaria: GMT-4</div>
        </div>
      </div>
    </div>
  );
};
