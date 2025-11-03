'use client';

import { useRouletteSSE } from '@/components/roulette/hooks/useRouletteSSE';
import { RouletteType } from '@/types';

export const RuletaMetrics = () => {
  // Obtener datos de actividad de mesas desde SSE para ambos tipos
  const { mesaActivity: mesaActivity150 } = useRouletteSSE('150' as RouletteType, null);
  const { mesaActivity: mesaActivity300 } = useRouletteSSE('300' as RouletteType, null);

  // Combinar actividades y seleccionar por tipo
  const allMesasActivity = { ...mesaActivity150, ...mesaActivity300 } as Record<string, { type?: RouletteType; activePlayers: number; maxPlayers: number }>;
  const allMesas = Object.values(allMesasActivity);

  const mesa150 = allMesas.find((m) => m.type === '150') || null;
  const mesa150Percentage = mesa150 ? Math.round((mesa150.activePlayers / mesa150.maxPlayers) * 100) : 0;
  const mesa150Players = mesa150 ? `${mesa150.activePlayers}/${mesa150.maxPlayers}` : '0/15';

  const mesa300 = allMesas.find((m) => m.type === '300') || null;
  const mesa300Percentage = mesa300 ? Math.round((mesa300.activePlayers / mesa300.maxPlayers) * 100) : 0;
  const mesa300Players = mesa300 ? `${mesa300.activePlayers}/${mesa300.maxPlayers}` : '0/15';
  
  // (ETA removido)
  
  return (
    <div className="ruleta-metrics-panel">
      <div className="dashboard-card">
        <h3>Actividad por Mesa</h3>
        <div className="progress-container">
          <div className="progress-item">
            <div>Ruleta 150</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${mesa150Percentage}%`}}></div>
            </div>
            <div>{mesa150Players}</div>
          </div>
          <div className="progress-item">
            <div>Ruleta 300</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${mesa300Percentage}%`}}></div>
            </div>
            <div>{mesa300Players}</div>
          </div>
          {/* ETA Giro removido */}
        </div>
      </div>
      
      {/* Distribución de Premios removida del dashboard del usuario */}
    </div>
  );
};
