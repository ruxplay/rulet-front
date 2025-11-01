'use client';

import { useRouletteSSE } from '@/components/roulette/hooks/useRouletteSSE';
import { RouletteType } from '@/types';

export const RuletaMetrics = () => {
  // Obtener datos de actividad de mesas desde SSE
  const { mesaActivity } = useRouletteSSE('150' as RouletteType, null);
  
  // Obtener todas las mesas activas
  const mesas = Object.values(mesaActivity);
  
  // Mesa para tipo 150 (primera encontrada o null)
  const mesa150 = mesas[0] || null;
  const mesa150Percentage = mesa150 
    ? Math.round((mesa150.activePlayers / mesa150.maxPlayers) * 100) 
    : 0;
  const mesa150Players = mesa150 
    ? `${mesa150.activePlayers}/${mesa150.maxPlayers}` 
    : '0/15';
  
  // Mesa para tipo 300 (segunda encontrada o null)
  const mesa300 = mesas[1] || null;
  const mesa300Percentage = mesa300 
    ? Math.round((mesa300.activePlayers / mesa300.maxPlayers) * 100) 
    : 0;
  const mesa300Players = mesa300 
    ? `${mesa300.activePlayers}/${mesa300.maxPlayers}` 
    : '0/15';
  
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
