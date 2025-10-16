export const RuletaMetrics = () => {
  return (
    <div className="ruleta-metrics-panel">
      <div className="dashboard-card">
        <h3>Actividad por Mesa</h3>
        <div className="progress-container">
          <div className="progress-item">
            <div>150</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '80%'}}></div>
            </div>
            <div>12/15</div>
          </div>
          <div className="progress-item">
            <div>300</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '33%'}}></div>
            </div>
            <div>5/15</div>
          </div>
          <div className="progress-item">
            <div>ETA Giro</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '62%'}}></div>
            </div>
            <div>~1m 50s</div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-card">
        <h3>Distribución de Premios</h3>
        <div className="donut-container">
          <div className="pie-chart">
            <div className="pie-slice principal" data-percentage="70">
            </div>
            <div className="pie-slice secundario-izq" data-percentage="10">
            </div>
            <div className="pie-slice secundario-der" data-percentage="10">
            </div>
            <div className="pie-slice casa" data-percentage="10">
            </div>
          </div>
          <div className="pie-legend">
            <div className="legend-item">
              <span className="legend-color principal"></span>
              <span>Principal 70%</span>
            </div>
            <div className="legend-item">
              <span className="legend-color secundario-izq"></span>
              <span>Secundario Izq 10%</span>
            </div>
            <div className="legend-item">
              <span className="legend-color secundario-der"></span>
              <span>Secundario Der 10%</span>
            </div>
            <div className="legend-item">
              <span className="legend-color casa"></span>
              <span>Casa 10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
