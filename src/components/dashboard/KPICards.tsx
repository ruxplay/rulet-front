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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="kpi-cards">
      <div className="dashboard-card">
        <h4>Saldo</h4>
        <div className="kpi-value">{formatCurrency(balance)} RUX</div>
        <div className="kpi-trend">Saldo actual</div>
      </div>
      <div className="dashboard-card">
        <h4>Ganancias</h4>
        <div className="kpi-value kpi-success">{formatCurrency(wins)} RUX</div>
        <div className="kpi-trend">Total ganado</div>
      </div>
      <div className="dashboard-card">
        <h4>Pérdidas</h4>
        <div className="kpi-value kpi-danger">{formatCurrency(losses)} RUX</div>
        <div className="kpi-trend">Total perdido</div>
      </div>
      <div className={`dashboard-card ${neto < 0 ? 'kpi-net-negative' : ''}`}>
        <h4>Neto</h4>
        <div className={`kpi-value ${neto >= 0 ? 'kpi-primary' : 'kpi-danger'}`}>
          {neto >= 0 ? '+' : ''}{formatCurrency(neto)} RUX
        </div>
        <div className="kpi-trend">{neto >= 0 ? 'Tendencia positiva' : 'Tendencia negativa'}</div>
      </div>
    </div>
  );
};
