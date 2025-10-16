'use client';

import { useEffect } from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal = ({ onClose }: HelpModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="help-modal-backdrop" onClick={handleBackdropClick}>
      <div className="help-modal-container">
        <div className="help-modal-header">
          <h2 className="help-modal-title">
            <span className="help-icon">❓</span>
            Guía de Ayuda - RubPlay
          </h2>
          <button 
            className="help-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="help-modal-content">
          {/* Sección de Inicio Rápido */}
          <section className="help-section">
            <h3 className="help-section-title">
              <span className="section-icon">🚀</span>
              Inicio Rápido
            </h3>
            <div className="help-steps">
              <div className="help-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Regístrate</h4>
                  <p>Crear tu cuenta toma solo <strong>1 minuto</strong>. Completa el formulario con tus datos básicos.</p>
                </div>
              </div>
              <div className="help-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Haz tu Depósito</h4>
                  <p>Deposita un mínimo de <strong>150</strong> para comenzar a jugar. Aceptamos dos métodos de pago.</p>
                </div>
              </div>
              <div className="help-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>¡Comienza a Jugar!</h4>
                  <p>Elige la mesa de <strong>150</strong> o <strong>300</strong>, selecciona tu número y espera a que los <strong>15 espacios</strong> se completen para que la ruleta gire automáticamente.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Sección de Cómo Jugar Ruleta */}
          <section className="help-section">
            <h3 className="help-section-title">
              <span className="section-icon">🎰</span>
              Cómo Jugar Ruleta Online
            </h3>
            
            <div className="help-grid">
              <div className="help-card">
                <h4 className="card-title">🎯 Objetivo del Juego</h4>
                <p>La ruleta tiene <strong>15 espacios numerados (1-15)</strong>. Si el puntero principal se detiene en tu número, eres el <strong>Ganador Principal</strong>. Los números inmediatamente a la izquierda y derecha del ganador principal se llevan premios <strong>secundarios</strong>.</p>
              </div>

              <div className="help-card">
                <h4 className="card-title">🧩 Cómo se Apuesta</h4>
                <ul className="bet-list">
                  <li>Elige la mesa: <strong>150</strong> o <strong>300</strong>.</li>
                  <li>Haz clic en un <strong>número disponible</strong> del 1 al 15.</li>
                  <li><strong>Una apuesta por usuario y por mesa</strong>.</li>
                  <li>Cuando los 15 espacios se llenan, la ruleta <strong>gira automáticamente</strong>.</li>
                </ul>
              </div>

              <div className="help-card">
                <h4 className="card-title">🎲 Distribución de Premios</h4>
                <div className="payout-table">
                  <div className="payout-row">
                    <span>Ganador Principal</span>
                    <span className="payout">70% del total apostado</span>
                  </div>
                  <div className="payout-row">
                    <span>Ganadores Secundarios (2)</span>
                    <span className="payout">8.85% cada uno</span>
                  </div>
                  <div className="payout-row">
                    <span>Casa (operación)</span>
                    <span className="payout">12.3% del total</span>
                  </div>
                  <div className="payout-row">
                    <span>Pozo</span>
                    <span className="payout">15 × apuesta (150 o 300)</span>
                  </div>
                </div>
              </div>

              <div className="help-card">
                <h4 className="card-title">⚡ Pasos para Jugar</h4>
                <ol className="game-steps">
                  <li>Elige mesa: 150 o 300.</li>
                  <li>Haz clic sobre tu número (1-15) disponible.</li>
                  <li>Espera a que se llenen los 15 espacios.</li>
                  <li>La ruleta gira y se muestran <strong>3 ganadores</strong>.</li>
                  <li>Los premios se acreditan <strong>automáticamente</strong> a tu saldo.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Sección de Consejos */}
          <section className="help-section">
            <h3 className="help-section-title">
              <span className="section-icon">💡</span>
              Consejos para Principiantes
            </h3>
            <div className="tips-grid">
              <div className="tip-card">
                <h4>🎯 Elige tu Mesa</h4>
                <p>Puedes jugar en dos mesas: <strong>150</strong> o <strong>300</strong>. La mesa de 150 tiene premios menores pero es más accesible para principiantes.</p>
              </div>
              <div className="tip-card">
                <h4>⏰ Una Apuesta por Mesa</h4>
                <p>Solo puedes apostar <strong>una vez por mesa</strong>. Una vez que elijas tu número, no podrás cambiar hasta la siguiente mesa.</p>
              </div>
              <div className="tip-card">
                <h4>🎲 Elige Números Disponibles</h4>
                <p>Solo puedes seleccionar números que no estén ocupados. Haz clic directamente en el número deseado en la ruleta.</p>
              </div>
              <div className="tip-card">
                <h4>💰 Gestiona tu Saldo</h4>
                <p>Necesitas al menos <strong>150</strong> para la mesa básica o <strong>300</strong> para la mesa premium. Controla tu presupuesto antes de apostar.</p>
              </div>
            </div>
          </section>

          {/* Sección de Soporte */}
          <section className="help-section">
            <h3 className="help-section-title">
              <span className="section-icon">🆘</span>
              ¿Necesitas Más Ayuda?
            </h3>
            <div className="support-info">
              <p>Si tienes más preguntas o necesitas asistencia técnica:</p>
              <div className="contact-methods">
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <span>soporte@rubplay.com</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">💬</span>
                  <span>Chat en vivo 24/7</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📱</span>
                  <span>WhatsApp: +591 XXX XXX XXX</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="help-modal-footer">
          <button className="help-modal-close-btn" onClick={onClose}>
            Entendido, ¡Gracias!
          </button>
        </div>
      </div>
    </div>
  );
};
