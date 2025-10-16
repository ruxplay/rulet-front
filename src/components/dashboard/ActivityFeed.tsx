export const ActivityFeed = () => {
  const activities = [
    {
      time: '12:45',
      description: 'Apuesta de 150 en número #7',
      status: 'Aceptada'
    },
    {
      time: '12:41',
      description: 'Resultado mesa 300 — Ganaste 1.575',
      status: 'Liquidado',
      isWin: true
    },
    {
      time: '12:30',
      description: 'Depósito recibido 200',
      status: 'Aprobado'
    },
    {
      time: '12:10',
      description: 'Ticket soporte creado #RP-1023',
      status: 'Pendiente'
    }
  ];

  return (
    <div className="dashboard-card activity-feed">
      <h3>Actividad Reciente</h3>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <div key={index} className="activity-item">
            <div className="activity-time">{activity.time}</div>
            <div className={`activity-description ${activity.isWin ? 'activity-win' : ''}`}>
              {activity.description}
            </div>
            <div className="activity-tag">{activity.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
