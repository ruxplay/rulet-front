import { useUserData } from './hooks/useUserData';

export const KPICards = () => {
  const { data: userData, isLoading } = useUserData();

  if (isLoading) {
    return (
      <div className="kpi-cards">
        <div className="dashboard-card">
          <h4>Cargando...</h4>
          <div className="kpi-value">---</div>
        </div>
      </div>
    );
  }

  const balance = userData?.user?.balance || "0.00";
  const wins = userData?.user?.wins || 0;
  const losses = userData?.user?.losses || 0;
  const neto = wins - losses;

  return (
    <div className="kpi-cards">
      <div className="dashboard-card">
        <h4>Saldo</h4>
        <div className="kpi-value">{balance}</div>
        <div className="kpi-trend">Saldo actual</div>
      </div>
      <div className="dashboard-card">
        <h4>Ganancias</h4>
        <div className="kpi-value kpi-success">{wins}</div>
        <div className="kpi-trend">Total ganado</div>
      </div>
      <div className="dashboard-card">
        <h4>Pérdidas</h4>
        <div className="kpi-value kpi-danger">{losses}</div>
        <div className="kpi-trend">Total perdido</div>
      </div>
      <div className="dashboard-card">
        <h4>Neto</h4>
        <div className={`kpi-value ${neto >= 0 ? 'kpi-primary' : 'kpi-danger'}`}>
          {neto >= 0 ? '+' : ''}{neto}
        </div>
        <div className="kpi-trend">{neto >= 0 ? 'Tendencia positiva' : 'Tendencia negativa'}</div>
      </div>
    </div>
  );
};
