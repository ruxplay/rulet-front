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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && winners) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [show, winners]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
        setTimeout(() => onClose(), 300);
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isVisible, onClose]);

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

  if (!show || !winners) return null;

  const betAmount = type === '150' ? 150 : 300;
  const totalApostado = winners.totals.totalApostado;

  return (
    <div
      className={`darkpremium-backdrop ${isVisible ? 'visible' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`darkpremium-container ${isVisible ? 'visible' : ''}`}>
        <header className="dp-header">
          <div className="dp-title">
            <span className="dp-icon">🏆</span>
            <h2>GANADORES RULETA {betAmount}</h2>
          </div>
          <p className="dp-subtitle">
            Mesa #{winners.mesaId} • Total Apostado: {formatCurrency(totalApostado ?? 0)}
          </p>
          <button className="dp-close" onClick={handleCloseClick} aria-label="Cerrar modal">
            ✕
          </button>
        </header>

        <section className="dp-content">
          <div className="dp-card main">
            <div className="dp-card-header">
              <div className="rank">
                <span>🥇</span> GANADOR PRINCIPAL
              </div>
              <div className="prize">{formatCurrency(winners.main.prize ?? 0)}</div>
            </div>
            <div className="dp-card-body">
              <h3>{winners.main.username}</h3>
              <div className="info">
                <div><strong>Número:</strong> #{winners.main.index + 1}</div>
                <div><strong>Apuesta:</strong> {formatCurrency(winners.main.bet ?? 0)}</div>
              </div>
            </div>
          </div>

          <div className="dp-grid">
            <div className="dp-card secondary">
              <div className="dp-card-header">
                <div className="rank"><span>🥈</span> IZQUIERDO</div>
                <div className="prize">{formatCurrency(winners.left.prize ?? 0)}</div>
              </div>
              <div className="dp-card-body">
                <h3>{winners.left.username}</h3>
                <div className="info">
                  <div><strong>Número:</strong> #{winners.left.index + 1}</div>
                  <div><strong>Apuesta:</strong> {formatCurrency(winners.left.bet ?? 0)}</div>
                </div>
              </div>
            </div>

            <div className="dp-card secondary">
              <div className="dp-card-header">
                <div className="rank"><span>🥉</span> DERECHO</div>
                <div className="prize">{formatCurrency(winners.right.prize ?? 0)}</div>
              </div>
              <div className="dp-card-body">
                <h3>{winners.right.username}</h3>
                <div className="info">
                  <div><strong>Número:</strong> #{winners.right.index + 1}</div>
                  <div><strong>Apuesta:</strong> {formatCurrency(winners.right.bet ?? 0)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="dp-stats">
            <div><span>Total Apostado</span><strong>{formatCurrency(winners.totals.totalApostado ?? 0)}</strong></div>
            <div><span>Premio Principal</span><strong>{formatCurrency(winners.totals.premioPrincipal ?? 0)}</strong></div>
            <div><span>Premios Secundarios</span><strong>{formatCurrency((winners.totals.premioSecundario ?? 0) * 2)}</strong></div>
          </div>
        </section>

        <footer className="dp-footer">
          <p>Los premios se acreditarán automáticamente a tu saldo.</p>
          <button className="dp-btn" onClick={handleCloseClick}>Continuar Jugando</button>
        </footer>
      </div>
    </div>
  );
};