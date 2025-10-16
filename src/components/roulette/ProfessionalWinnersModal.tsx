'use client';

import { useEffect, useState } from 'react';
import { RouletteWinners } from '@/types';

interface ProfessionalWinnersModalProps {
  show: boolean;
  onClose: () => void;
  winners: RouletteWinners | null;
  formatCurrency: (value: number) => string;
  type: '150' | '300';
}

export const ProfessionalWinnersModal = ({ 
  show, 
  onClose, 
  winners, 
  formatCurrency,
  type
}: ProfessionalWinnersModalProps) => {
  const [timeLeft, setTimeLeft] = useState(60); // 1 minuto
  const [isVisible, setIsVisible] = useState(false);

  // Debug: Log cuando el modal se muestra
  useEffect(() => {
    if (show) {
    }
  }, [show, winners]);

  // Auto-cierre después de 1 minuto
  useEffect(() => {
    if (show && winners) {
      setIsVisible(true);
      setTimeLeft(60);
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsVisible(false);
            setTimeout(() => onClose(), 300); // Delay para animación
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [show, winners, onClose]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show) {
        setIsVisible(false);
        setTimeout(() => onClose(), 300);
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [show, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsVisible(false);
      setTimeout(() => onClose(), 300);
    }
  };

  const handleCloseClick = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  if (!show || !winners) {
    return null;
  }

  const betAmount = type === '150' ? 150 : 300;
  const totalApostado = winners.totals.totalApostado;

  return (
    <div 
      className={`professional-modal-backdrop ${isVisible ? 'visible' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`professional-modal-container ${isVisible ? 'visible' : ''}`}>
        {/* Header con timer */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">
              <span className="title-icon">🏆</span>
              ¡GANADORES DE LA RULETA {betAmount}!
            </h2>
            <div className="modal-subtitle">
              Mesa #{winners.mesaId} • Total apostado: {formatCurrency(totalApostado)}
            </div>
          </div>
          
          <div className="modal-controls">
            <div className="timer-display">
              <span className="timer-icon">⏱️</span>
              <span className="timer-text">{timeLeft}s</span>
            </div>
            <button
              className="modal-close-btn"
              onClick={handleCloseClick}
              aria-label="Cerrar modal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="modal-content">
          {/* Ganador principal */}
          <div className="winner-card main-winner-card">
            <div className="winner-header">
              <div className="winner-rank">
                <span className="rank-icon">🥇</span>
                <span className="rank-text">GANADOR PRINCIPAL</span>
              </div>
              <div className="winner-prize">
                {formatCurrency(winners.main.prize)}
              </div>
            </div>
            
            <div className="winner-details">
              <div className="winner-name">{winners.main.username}</div>
              <div className="winner-info">
                <span className="info-item">
                  <span className="info-label">Número:</span>
                  <span className="info-value">#{winners.main.index + 1}</span>
                </span>
                <span className="info-item">
                  <span className="info-label">Apuesta:</span>
                  <span className="info-value">{formatCurrency(winners.main.bet)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Ganadores secundarios */}
          <div className="secondary-winners-section">
            <h3 className="section-title">Ganadores Secundarios</h3>
            
            <div className="secondary-winners-grid">
              {/* Ganador izquierdo */}
              <div className="winner-card secondary-winner-card">
                <div className="winner-header">
                  <div className="winner-rank">
                    <span className="rank-icon">🥈</span>
                    <span className="rank-text">IZQUIERDO</span>
                  </div>
                  <div className="winner-prize">
                    {formatCurrency(winners.left.prize)}
                  </div>
                </div>
                
                <div className="winner-details">
                  <div className="winner-name">{winners.left.username}</div>
                  <div className="winner-info">
                    <span className="info-item">
                      <span className="info-label">Número:</span>
                      <span className="info-value">#{winners.left.index + 1}</span>
                    </span>
                    <span className="info-item">
                      <span className="info-label">Apuesta:</span>
                      <span className="info-value">{formatCurrency(winners.left.bet)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Ganador derecho */}
              <div className="winner-card secondary-winner-card">
                <div className="winner-header">
                  <div className="winner-rank">
                    <span className="rank-icon">🥉</span>
                    <span className="rank-text">DERECHO</span>
                  </div>
                  <div className="winner-prize">
                    {formatCurrency(winners.right.prize)}
                  </div>
                </div>
                
                <div className="winner-details">
                  <div className="winner-name">{winners.right.username}</div>
                  <div className="winner-info">
                    <span className="info-item">
                      <span className="info-label">Número:</span>
                      <span className="info-value">#{winners.right.index + 1}</span>
                    </span>
                    <span className="info-item">
                      <span className="info-label">Apuesta:</span>
                      <span className="info-value">{formatCurrency(winners.right.bet)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de estadísticas */}
          <div className="stats-summary">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Apostado</span>
                <span className="stat-value">{formatCurrency(winners.totals.totalApostado)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Premio Principal</span>
                <span className="stat-value">{formatCurrency(winners.totals.premioPrincipal)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Premios Secundarios</span>
                <span className="stat-value">{formatCurrency(winners.totals.premioSecundario * 2)}</span>
              </div>
              <div className="stat-item house">
                <span className="stat-label">Ganancias Casa</span>
                <span className="stat-value">{formatCurrency(winners.totals.gananciasCasa)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="footer-info">
            <span className="footer-text">
              Los premios se acreditarán automáticamente a tu saldo
            </span>
          </div>
          <button 
            className="continue-btn"
            onClick={handleCloseClick}
          >
            Continuar Jugando
          </button>
        </div>
      </div>
    </div>
  );
};
