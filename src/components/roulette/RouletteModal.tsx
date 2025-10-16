'use client';

import { RouletteType, RouletteWinners } from '@/types';

interface RouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  winners: RouletteWinners | null;
  type: RouletteType;
  formatCurrency: (value: number) => string;
}

export const RouletteModal = ({ 
  isOpen, 
  onClose, 
  winners, 
  type, 
  formatCurrency 
}: RouletteModalProps) => {
  if (!isOpen || !winners) return null;

  const betAmount = type === '150' ? 150 : 300;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="winner-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="winnerModalTitle"
    >
      <div className="winner-modal">
        <button 
          className="winner-modal-close"
          onClick={onClose}
          aria-label="Cerrar"
          type="button"
        >
          &times;
        </button>
        
        <h2 id="winnerModalTitle" className="winner-modal-title">
          ¡Ganadores de la Ruleta {betAmount}!
        </h2>
        
        <div className="winner-modal-content">
          {/* Ganador principal */}
          <div className="winner-item main-winner">
            <div className="winner-icon">🏆</div>
            <div className="winner-info">
              <div className="winner-title">Ganador Principal</div>
              <div className="winner-name">{winners.main.username}</div>
              <div className="winner-details">
                Número <strong>{winners.main.index + 1}</strong> - 
                Premio <strong>{formatCurrency(winners.main.prize)}</strong>
              </div>
            </div>
          </div>

          {/* Ganadores secundarios */}
          <div className="winner-item secondary-winner">
            <div className="winner-icon">🥈</div>
            <div className="winner-info">
              <div className="winner-title">Ganador Secundario Izquierdo</div>
              <div className="winner-name">{winners.left.username}</div>
              <div className="winner-details">
                Número <strong>{winners.left.index + 1}</strong> - 
                Premio <strong>{formatCurrency(winners.left.prize)}</strong>
              </div>
            </div>
          </div>

          <div className="winner-item secondary-winner">
            <div className="winner-icon">🥉</div>
            <div className="winner-info">
              <div className="winner-title">Ganador Secundario Derecho</div>
              <div className="winner-name">{winners.right.username}</div>
              <div className="winner-details">
                Número <strong>{winners.right.index + 1}</strong> - 
                Premio <strong>{formatCurrency(winners.right.prize)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="winner-summary">
          <div className="summary-row">
            <span className="summary-label">Total apostado:</span>
            <span className="summary-value">
              {formatCurrency(winners.totals.totalApostado)}
            </span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label">Ganancias de la casa:</span>
            <span className="summary-value house">
              {formatCurrency(winners.totals.gananciasCasa)}
            </span>
          </div>
        </div>

        <div className="winner-modal-footer">
          <p className="winner-note">
            Los premios han sido acreditados a los ganadores
          </p>
          
          <button 
            className="winner-modal-btn"
            onClick={onClose}
            type="button"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
