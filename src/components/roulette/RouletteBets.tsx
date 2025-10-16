'use client';

import { RouletteType, RouletteSector } from '@/types';

interface RouletteBetsProps {
  type: RouletteType;
  sectors?: Array<RouletteSector | null>;
  filledCount?: number;
}

export const RouletteBets = ({ type, sectors, filledCount }: RouletteBetsProps) => {
  const betAmount = type === '150' ? 150 : 300;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getEmptySectors = () => {
    if (!sectors) return [];
    return sectors.map((sector, index) => 
      sector ? null : index
    ).filter(index => index !== null) as number[];
  };

  const emptySectors = getEmptySectors();

  // Si no hay sectores, mostrar mensaje
  if (!sectors || sectors.length === 0) {
    return (
      <div className="roulette-bets">
        <div className="bets-header">
          <h3 className="bets-title">Apuestas Actuales - Ruleta {betAmount}</h3>
          <div className="bets-summary">
            <span className="filled-count">0 / 15</span>
            <span className="empty-count">15 disponibles</span>
          </div>
        </div>
        
        <div className="no-bets-message">
          <p>No hay mesa activa para esta ruleta.</p>
          <p>Haz la primera apuesta para crear la mesa.</p>
        </div>
        
        <div className="bets-info">
          <div className="total-bet">
            <span className="info-label">Total apostado:</span>
            <span className="info-value">0,00</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="roulette-bets">
      <div className="bets-header">
        <h3 className="bets-title">Apuestas Actuales - Ruleta {betAmount}</h3>
        <div className="bets-summary">
          <span className="filled-count">{filledCount} / 15</span>
          <span className="empty-count">{emptySectors.length} disponibles</span>
        </div>
      </div>

      <div className="bets-grid">
        {sectors.map((sector, index) => (
          <div 
            key={index} 
            className={`bet-slot ${sector ? 'occupied' : 'empty'}`}
          >
            <div className="slot-number">
              {index + 1}
            </div>
            
            {sector ? (
              <div className="slot-content">
                <div className="player-name">
                  {sector.username.length > 12 
                    ? `${sector.username.substring(0, 10)}...` 
                    : sector.username
                  }
                </div>
                <div className="bet-amount">
                  {formatCurrency(sector.bet)}
                </div>
              </div>
            ) : (
              <div className="slot-content empty">
                <div className="empty-text">Disponible</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="bets-info">
        <div className="total-bet">
          <span className="info-label">Total apostado:</span>
          <span className="info-value">
            {formatCurrency((filledCount || 0) * betAmount)}
          </span>
        </div>
        
        {(filledCount || 0) > 0 && (
          <div className="potential-prize">
            <span className="info-label">Premio principal:</span>
            <span className="info-value">
              {formatCurrency((filledCount || 0) * betAmount * 0.70)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
