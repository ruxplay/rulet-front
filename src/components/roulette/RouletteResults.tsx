'use client';

import { RouletteType, RouletteWinners } from '@/types';

interface RouletteResultsProps {
  type: RouletteType;
  winners?: RouletteWinners | null;
  formatCurrency: (value: number) => string;
}

export const RouletteResults = ({ type, winners, formatCurrency }: RouletteResultsProps) => {
  const betAmount = type === '150' ? 150 : 300;

  // Si no hay ganadores, no mostrar nada
  if (!winners) {
    return null;
  }

  return (
    <div className="roulette-results">
      <div className="results-header">
        <h3 className="results-title">
          Resultado de la Ruleta {betAmount} (Mesa {winners.mesaId})
        </h3>
      </div>

      <div className="winners-section">
        {/* Ganador principal */}
        <div className="winner-card main-winner">
          <div className="winner-header">
            <span className="winner-label">Ganador Principal</span>
            <span className="winner-prize">
              {formatCurrency(winners.main.prize ?? 0)}
            </span>
          </div>
          <div className="winner-details">
            <div className="winner-name">{winners.main.username}</div>
            <div className="winner-info">
              Número <strong>{winners.main.index + 1}</strong> - 
              Apuesta: <strong>{formatCurrency(winners.main.bet ?? 0)}</strong>
            </div>
          </div>
        </div>

        {/* Ganadores secundarios */}
        <div className="secondary-winners">
          <div className="winner-card secondary-winner">
            <div className="winner-header">
              <span className="winner-label">Ganador Secundario Izquierdo</span>
              <span className="winner-prize">
                {formatCurrency(winners.left.prize ?? 0)}
              </span>
            </div>
            <div className="winner-details">
              <div className="winner-name">{winners.left.username}</div>
              <div className="winner-info">
                Número <strong>{winners.left.index + 1}</strong> - 
                Apuesta: <strong>{formatCurrency(winners.left.bet ?? 0)}</strong>
              </div>
            </div>
          </div>

          <div className="winner-card secondary-winner">
            <div className="winner-header">
              <span className="winner-label">Ganador Secundario Derecho</span>
              <span className="winner-prize">
                {formatCurrency(winners.right.prize ?? 0)}
              </span>
            </div>
            <div className="winner-details">
              <div className="winner-name">{winners.right.username}</div>
              <div className="winner-info">
                Número <strong>{winners.right.index + 1}</strong> - 
                Apuesta: <strong>{formatCurrency(winners.right.bet ?? 0)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de totales */}
      <div className="results-summary">
        <div className="summary-item">
          <span className="summary-label">Total apostado:</span>
          <span className="summary-value">
            {formatCurrency(winners.totals.totalApostado ?? 0)}
          </span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">Premio principal:</span>
          <span className="summary-value">
            {formatCurrency(winners.totals.premioPrincipal ?? 0)}
          </span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">Premios secundarios:</span>
          <span className="summary-value">
            {formatCurrency((winners.totals.premioSecundario ?? 0) * 2)}
          </span>
        </div>
        
        <div className="summary-item house">
          <span className="summary-label">Ganancias de la casa:</span>
          <span className="summary-value">
            {formatCurrency(winners.totals.gananciasCasa ?? 0)}
          </span>
        </div>
      </div>

      {/* Porcentajes */}
      <div className="results-percentages">
        <div className="percentage-item">
          <span className="percentage-label">Premio principal:</span>
          <span className="percentage-value">{winners.totals.percentages.main}%</span>
        </div>
        
        <div className="percentage-item">
          <span className="percentage-label">Premio secundario:</span>
          <span className="percentage-value">{winners.totals.percentages.secondary}%</span>
        </div>
        
        <div className="percentage-item">
          <span className="percentage-label">Casa:</span>
          <span className="percentage-value">{winners.totals.percentages.house}%</span>
        </div>
      </div>

      <div className="results-footer">
        <p className="results-note">
          Los premios han sido acreditados a los ganadores
        </p>
      </div>
    </div>
  );
};
