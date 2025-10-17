import { useAuth } from '@/components/layout/hooks/useAuth';
import { useAppDispatch } from '@/lib/store/hooks';
import { initializeUserStats } from '@/store/slices/authSlice';
import { useEffect } from 'react';

export const KPICards = () => {
  const { authState } = useAuth();
  const dispatch = useAppDispatch();

  // Inicializar stats si no existen
  useEffect(() => {
    if (authState.user && (authState.user.wins === undefined || authState.user.losses === undefined)) {
      console.log('🔧 Inicializando stats del usuario...');
      dispatch(initializeUserStats());
    }
  }, [authState.user, dispatch]);

  // Debug: Ver qué datos llegan de Redux
  console.log('🔍 KPICards - authState completo:', authState);
  console.log('🔍 KPICards - authState.user:', authState.user);
  console.log('🔍 KPICards - balance:', authState.user?.balance);
  console.log('🔍 KPICards - wins:', authState.user?.wins);
  console.log('🔍 KPICards - losses:', authState.user?.losses);

  if (!authState.user) {
    return (
      <div className="kpi-cards">
        <div className="dashboard-card">
          <h4>Cargando...</h4>
          <div className="kpi-value">---</div>
        </div>
      </div>
    );
  }

  const balance = authState.user.balance || "0.00";
  const wins = authState.user.wins || 0;
  const losses = authState.user.losses || 0;
  const neto = wins - losses;

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="kpi-cards">
      <div className="dashboard-card">
        <h4>Saldo</h4>
        <div className="kpi-value">{formatCurrency(balance)}</div>
        <div className="kpi-trend">Saldo actual</div>
      </div>
      <div className="dashboard-card">
        <h4>Ganancias</h4>
        <div className="kpi-value kpi-success">{formatCurrency(wins)}</div>
        <div className="kpi-trend">Total ganado</div>
      </div>
      <div className="dashboard-card">
        <h4>Pérdidas</h4>
        <div className="kpi-value kpi-danger">{formatCurrency(losses)}</div>
        <div className="kpi-trend">Total perdido</div>
      </div>
      <div className="dashboard-card">
        <h4>Neto</h4>
        <div className={`kpi-value ${neto >= 0 ? 'kpi-primary' : 'kpi-danger'}`}>
          {neto >= 0 ? '+' : ''}{formatCurrency(neto)}
        </div>
        <div className="kpi-trend">{neto >= 0 ? 'Tendencia positiva' : 'Tendencia negativa'}</div>
      </div>
    </div>
  );
};
