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
            Guía Completa de RubPlay - Sistema de Ruleta
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
          {/* Sección: ¿Qué es RubPlay? */}
          <section className="help-section">
            <h3 className="help-section-title">
              <span className="section-icon">🎮</span>
              ¿Qué es RubPlay?
            </h3>
            <div className="help-description">
              <p>
                <strong>RubPlay</strong> es una plataforma de ruleta online donde puedes apostar con la moneda virtual <strong>RUX</strong>. 
                El sistema funciona con <strong>mesas</strong> que se completan cuando <strong>15 jugadores</strong> realizan sus apuestas, 
                y luego la ruleta gira automáticamente para determinar los ganadores.
              </p>
            </div>
          </section>

          {/* Sección: Sistema de Moneda RUX */}
          <section className="help-section">
            <h3 className="help-section-title">
              <span className="section-icon">💰</span>
              Sistema de Moneda RUX
            </h3>
            <div className="help-grid">
              <div className="help-card">
                <h4 className="card-title">💵 ¿Qué es RUX?</h4>
                <p>
                  <strong>RUX</strong> es la moneda virtual de RubPlay. Todas las apuestas, premios, depósitos y retiros 
                  se realizan en RUX. Puedes depositar fondos mediante depósitos aprobados y retirar tus ganancias 
                  cuando lo desees.
                </p>
              </div>
              
              <div className="help-card">
                <h4 className="card-title">📊 Ver tu Saldo</h4>
                <p>
                  Tu saldo en RUX se muestra en el <strong>Dashboard</strong>, junto con tus estadísticas: 
                  <strong>Ganancias totales</strong>, <strong>Pérdidas totales</strong> y tu <strong>Neto</strong> 
                  (diferencia entre ganancias y pérdidas). El saldo se actualiza en <strong>tiempo real</strong> 
                  cuando realizas apuestas o recibes premios.
                </p>
              </div>
            </div>
          </section>

          {/* Sección: Tipos de Ruleta */}
          <section className="help-section">
            <h3 className="help-section-title">
              <span className="section-icon">🎰</span>
              Tipos de Ruleta y Mesas
            </h3>
            
            <div className="help-grid">
              <div className="help-card">
                <h4 className="card-title">🎯 Ruleta 150 RUX</h4>
                <ul className="bet-list">
                  <li><strong>Apuesta fija:</strong> 150 RUX por jugador</li>
                  <li><strong>Premio principal:</strong> 70% del total apostado (máximo 1.575 RUX si se llena)</li>
                  <li><strong>Premios secundarios:</strong> 10% cada uno (máximo 225 RUX cada uno)</li>
                  <li><strong>Ideal para:</strong> Principiantes o jugadores con presupuesto moderado</li>
                </ul>
              </div>

              <div className="help-card">
                <h4 className="card-title">🎯 Ruleta 300 RUX</h4>
                <ul className="bet-list">
                  <li><strong>Apuesta fija:</strong> 300 RUX por jugador</li>
                  <li><strong>Premio principal:</strong> 70% del total apostado (máximo 3.150 RUX si se llena)</li>
                  <li><strong>Premios secundarios:</strong> 10% cada uno (máximo 450 RUX cada uno)</li>
                  <li><strong>Ideal para:</strong> Jugadores experimentados con mayor presupuesto</li>
                </ul>
              </div>
            </div>

            <div className="help-card full-width">
              <h4 className="card-title">📋 Estado de las Mesas</h4>
              <p>
                Cada mesa puede estar en diferentes estados que puedes ver en el dashboard:
              </p>
              <ul className="bet-list">
                <li><strong>Abierta (Open):</strong> La mesa está aceptando apuestas. Puedes ver cuántos jugadores han apostado (ej: 8/15)</li>
                <li><strong>Esperando Resultado (Waiting for Result):</strong> La mesa está completa con 15 jugadores y lista para girar</li>
                <li><strong>Girando (Spinning):</strong> La ruleta está en movimiento determinando los ganadores</li>
                <li><strong>Cerrada (Closed):</strong> La ronda terminó, se mostraron los ganadores y se está preparando una nueva mesa</li>
              </ul>
            </div>
          </section>

          {/* Sección: Cómo Funcionan las Apuestas */}
          <section className="help-section">
            <h3 className="help-section-title">
              <span className="section-icon">🎯</span>
              Cómo Funcionan las Apuestas
            </h3>
            
            <div className="help-steps">
              <div className="help-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Selecciona tu Ruleta</h4>
                  <p>
                    Elige entre <strong>Ruleta 150 RUX</strong> o <strong>Ruleta 300 RUX</strong> según tu presupuesto. 
                    Asegúrate de tener suficiente saldo en RUX (mínimo 150 para ruleta básica, 300 para ruleta premium).
                  </p>
                </div>
              </div>

              <div className="help-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Elige tu Número</h4>
                  <p>
                    La ruleta tiene <strong>15 números del 1 al 15</strong>. Haz clic directamente en un 
                    número <strong>disponible</strong> (que no esté ocupado por otro jugador). 
                    Verás cuáles números están disponibles en la sección "Apuestas Actuales".
                  </p>
                </div>
              </div>

              <div className="help-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Confirma tu Apuesta</h4>
                  <p>
                    Una vez seleccionado tu número, haz clic en el botón <strong>"Apostar [150/300] RUX"</strong>. 
                    Tu saldo se descontará <strong>inmediatamente</strong> y tu nombre aparecerá en el número elegido.
                  </p>
                  <p className="warning-text">
                    ⚠️ <strong>Importante:</strong> Solo puedes apostar <strong>una vez por mesa</strong>. 
                    No puedes cambiar tu número ni apostar de nuevo hasta que la mesa se cierre y se abra una nueva.
                  </p>
                </div>
              </div>

              <div className="help-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Espera a que se Complete la Mesa</h4>
                  <p>
                    La mesa necesita <strong>15 jugadores</strong> para completarse. Puedes ver el progreso en tiempo real 
                    en el dashboard: "Actividad por Mesa" muestra cuántos jugadores han apostado (ej: 12/15). 
                    Cuando llegue a <strong>15/15</strong>, el contador se resetea a <strong>0/15</strong> indicando que 
                    la ruleta está lista para girar.
                  </p>
                </div>
              </div>

              <div className="help-step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h4>La Ruleta Gira Automáticamente</h4>
                  <p>
                    Cuando los 15 números se llenan, la ruleta <strong>gira automáticamente</strong>. 
                    No necesitas hacer nada más. La animación mostrará el giro y después de unos segundos 
                    se revelarán los <strong>3 ganadores</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="help-card full-width warning-card">
              <h4 className="card-title">⚠️ Reglas de Apuesta</h4>
              <ul className="bet-list">
                <li>El monto de apuesta es <strong>FIJO</strong>: 150 RUX para Ruleta 150, 300 RUX para Ruleta 300</li>
                <li><strong>Una sola apuesta por usuario por mesa</strong>. No puedes apostar múltiples veces en la misma ronda</li>
                <li>Solo puedes elegir números <strong>disponibles</strong> (no ocupados por otros jugadores)</li>
                <li>Si ya apostaste en una mesa, deberás esperar a que se cierre y se abra una nueva para apostar de nuevo</li>
                <li>Tu saldo debe ser suficiente: <strong>150 RUX mínimo</strong> para Ruleta 150, <strong>300 RUX mínimo</strong> para Ruleta 300</li>
              </ul>
            </div>
          </section>

          {/* Sección: Sistema de Premios y Ganadores */}
          <section className="help-section">
            <h3 className="help-section-title">
              <span className="section-icon">🏆</span>
              Sistema de Premios y Ganadores
            </h3>
            
            <div className="help-card full-width">
              <h4 className="card-title">🎯 Cómo se Determinan los Ganadores</h4>
              <p>
                Cuando la ruleta gira, siempre hay <strong>3 ganadores</strong> por cada ronda:
              </p>
              <ol className="game-steps">
                <li>
                  <strong>Ganador Principal (🥇):</strong> El puntero principal se detiene en un número. 
                  El jugador que apostó en ese número gana el <strong>premio principal (70% del total apostado)</strong>.
                </li>
                <li>
                  <strong>Ganador Secundario Izquierdo (🥈):</strong> El jugador que apostó en el número 
                  <strong> inmediatamente a la izquierda</strong> del ganador principal gana el 
                  <strong>10% del total apostado</strong>.
                </li>
                <li>
                  <strong>Ganador Secundario Derecho (🥉):</strong> El jugador que apostó en el número 
                  <strong> inmediatamente a la derecha</strong> del ganador principal gana el 
                  <strong>10% del total apostado</strong>.
                </li>
              </ol>
              
              <div className="example-box">
                <h5>📝 Ejemplo Práctico:</h5>
                <p>
                  Si una mesa de <strong>150 RUX</strong> se completa con 15 jugadores:
                </p>
                <ul>
                  <li><strong>Total apostado:</strong> 15 × 150 = 2.250 RUX</li>
                  <li>Si el número <strong>8</strong> gana como principal:</li>
                  <li>→ El jugador del número 8 gana: <strong>1.575 RUX</strong> (70%)</li>
                  <li>→ El jugador del número 7 (izquierda) gana: <strong>225 RUX</strong> (10%)</li>
                  <li>→ El jugador del número 9 (derecha) gana: <strong>225 RUX</strong> (10%)</li>
                  <li>→ La casa retiene: <strong>225 RUX</strong> (10%)</li>
                </ul>
              </div>
            </div>

            <div className="help-grid">
              <div className="help-card">
                <h4 className="card-title">💰 Distribución de Premios</h4>
                <div className="payout-table">
                  <div className="payout-row">
                    <span>🥇 Ganador Principal</span>
                    <span className="payout payout-main">70%</span>
                  </div>
                  <div className="payout-row">
                    <span>🥈 Secundario Izquierdo</span>
                    <span className="payout payout-secondary">10%</span>
                  </div>
                  <div className="payout-row">
                    <span>🥉 Secundario Derecho</span>
                    <span className="payout payout-secondary">10%</span>
                  </div>
                  <div className="payout-row">
                    <span>🏠 Ganancias Casa</span>
                    <span className="payout payout-house">10%</span>
                  </div>
                </div>
              </div>

              <div className="help-card">
                <h4 className="card-title">⚡ Premios Automáticos</h4>
                <p>
                  Los premios se <strong>acreditan automáticamente</strong> a tu saldo en RUX cuando termina la ronda. 
                  No necesitas hacer nada adicional. Verás una notificación si eres ganador y tu saldo se actualizará 
                  instantáneamente.
                </p>
                <p className="success-text">
                  ✅ Tu saldo y estadísticas (Ganancias) se actualizan en tiempo real mediante actualizaciones automáticas.
                </p>
              </div>
            </div>

            <div className="help-card full-width">
              <h4 className="card-title">🔄 Sistema de Números Adyacentes</h4>
              <p>
                Los números adyacentes funcionan de forma <strong>circular</strong>. Esto significa que:
              </p>
              <ul className="bet-list">
                <li>Si gana el número <strong>1</strong>: los secundarios son el número <strong>15</strong> (izquierda) y el número <strong>2</strong> (derecha)</li>
                <li>Si gana el número <strong>15</strong>: los secundarios son el número <strong>14</strong> (izquierda) y el número <strong>1</strong> (derecha)</li>
                <li>Para cualquier otro número: izquierda = número - 1, derecha = número + 1</li>
              </ul>
            </div>
          </section>

          {/* Sección: Ejemplo de Juego Completo */}
          <section className="help-section">
            <h3 className="help-section-title">
              <span className="section-icon">🎬</span>
              Ejemplo de Juego Completo
            </h3>
            <div className="help-steps">
              <div className="help-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Inicio</h4>
                  <p>
                    Entras a <strong>Ruleta 150 RUX</strong>. Tu saldo es <strong>500 RUX</strong>. 
                    La mesa muestra <strong>3/15</strong> jugadores. Veo que el número 7 está disponible.
                  </p>
                </div>
              </div>

              <div className="help-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Realizas tu Apuesta</h4>
                  <p>
                    Haces clic en el número 7 y luego en <strong>"Apostar 150 RUX"</strong>. 
                    Tu saldo baja a <strong>350 RUX</strong> y tu nombre aparece en el número 7. 
                    La mesa ahora muestra <strong>4/15</strong>.
                  </p>
                </div>
              </div>

              <div className="help-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>La Mesa se Completa</h4>
                  <p>
                    Más jugadores van apostando. El dashboard muestra el progreso: <strong>8/15</strong>, 
                    <strong> 12/15</strong>, finalmente <strong>15/15</strong>. 
                    El contador se resetea a <strong>0/15</strong> y la ruleta comienza a girar automáticamente.
                  </p>
                </div>
              </div>

              <div className="help-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Resultados</h4>
                  <p>
                    La ruleta se detiene y el número <strong>6</strong> es el ganador principal. 
                    Como apostaste en el número 7 (que está inmediatamente a la derecha del 6), 
                    eres el <strong>Ganador Secundario Derecho</strong> y recibes <strong>225 RUX</strong> 
                    (10% del total apostado: 15 × 150 = 2.250 RUX).
                  </p>
                </div>
              </div>

              <div className="help-step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h4>Premio Acreditado</h4>
                  <p>
                    Recibes una notificación: <strong>"🎉 ¡Ganaste! Has ganado 225 RUX"</strong>. 
                    Tu saldo se actualiza automáticamente a <strong>575 RUX</strong> 
                    (350 + 225). Tu estadística de <strong>Ganancias</strong> aumenta en 225 RUX.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sección: Actualizaciones en Tiempo Real */}
          <section className="help-section">
            <h3 className="help-section-title">
              <span className="section-icon">⚡</span>
              Actualizaciones en Tiempo Real
            </h3>
            <div className="help-grid">
              <div className="help-card">
                <h4 className="card-title">🔄 Sistema SSE (Server-Sent Events)</h4>
                <p>
                  RubPlay usa tecnología de <strong>actualizaciones en tiempo real</strong>. Esto significa que:
                </p>
                <ul className="bet-list">
                  <li>Ves cuando otros jugadores apuestan <strong>instantáneamente</strong></li>
                  <li>El progreso de la mesa (ej: 8/15) se actualiza <strong>sin recargar</strong></li>
                  <li>Los resultados y ganadores aparecen <strong>automáticamente</strong></li>
                  <li>Tu saldo se actualiza <strong>en tiempo real</strong> cuando apuestas o ganas</li>
                </ul>
              </div>

              <div className="help-card">
                <h4 className="card-title">📱 Dashboard Interactivo</h4>
                <p>
                  En el <strong>Dashboard</strong> puedes ver:
                </p>
                <ul className="bet-list">
                  <li><strong>Actividad por Mesa:</strong> Progreso en tiempo real de cada ruleta (ej: 12/15)</li>
                  <li><strong>Tu Saldo:</strong> Actualizado automáticamente con cada transacción</li>
                  <li><strong>Ganancias Totales:</strong> Suma de todos tus premios ganados</li>
                  <li><strong>Pérdidas Totales:</strong> Suma de todas tus apuestas realizadas</li>
                  <li><strong>Neto:</strong> Diferencia entre ganancias y pérdidas (puede ser positivo o negativo)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección: Consejos y Mejores Prácticas */}
          <section className="help-section">
            <h3 className="help-section-title">
              <span className="section-icon">💡</span>
              Consejos y Mejores Prácticas
            </h3>
            <div className="tips-grid">
              <div className="tip-card">
                <h4>🎯 Gestiona tu Presupuesto</h4>
                <p>
                  Antes de jugar, decide cuánto puedes permitirte perder. Recuerda que cada apuesta es 
                  <strong>150 RUX o 300 RUX</strong> dependiendo de la ruleta. No apuestes más de lo que 
                  puedes permitirte perder.
                </p>
              </div>

              <div className="tip-card">
                <h4>⏰ Elige el Momento Adecuado</h4>
                <p>
                  Si una mesa tiene pocos jugadores (ej: 2/15), puede tomar tiempo en llenarse. Si prefieres 
                  acción más rápida, espera a que una mesa esté más llena antes de apostar.
                </p>
              </div>

              <div className="tip-card">
                <h4>🎲 Los Números son Aleatorios</h4>
                <p>
                  El resultado es completamente <strong>aleatorio y justo</strong>. No hay estrategia que garantice 
                  ganar. Cada ronda es independiente y todos los números tienen la misma probabilidad de ganar.
                </p>
              </div>

              <div className="tip-card">
                <h4>💰 Apuesta Inteligente</h4>
                <p>
                  Considera que si ganas como <strong>secundario</strong> recibes solo el 10% (ej: 225 RUX en mesa 150), 
                  pero si ganas como <strong>principal</strong> recibes el 70% (ej: 1.575 RUX en mesa 150). 
                  La probabilidad es la misma para todos los números.
                </p>
              </div>

              <div className="tip-card">
                <h4>📊 Monitorea tus Estadísticas</h4>
                <p>
                  Revisa tu <strong>Neto</strong> en el dashboard regularmente. Si está negativo, considera 
                  hacer una pausa. Las estadísticas te ayudan a entender tu desempeño general.
                </p>
              </div>

              <div className="tip-card">
                <h4>🔄 Una Mesa a la Vez</h4>
                <p>
                  Puedes apostar en ambas ruletas (150 y 300) simultáneamente, pero solo <strong>una vez por mesa</strong>. 
                  Si apostaste en Ruleta 150, deberás esperar a que esa mesa se complete y cierre antes de apostar de nuevo.
                </p>
              </div>
            </div>
          </section>

          {/* Sección: Preguntas Frecuentes */}
          <section className="help-section">
            <h3 className="help-section-title">
              <span className="section-icon">❓</span>
              Preguntas Frecuentes (FAQ)
            </h3>
            
            <div className="faq-list">
              <div className="faq-item">
                <h4 className="faq-question">¿Puedo cambiar mi número después de apostar?</h4>
                <p className="faq-answer">
                  <strong>No.</strong> Una vez que apuestas, tu número está fijo para esa mesa. Solo puedes apostar de nuevo cuando 
                  la mesa se cierre y se abra una nueva.
                </p>
              </div>

              <div className="faq-item">
                <h4 className="faq-question">¿Qué pasa si no se completa la mesa de 15 jugadores?</h4>
                <p className="faq-answer">
                  La ruleta <strong>solo gira cuando hay exactamente 15 jugadores</strong>. Si una mesa no se completa, 
                  permanecerá abierta esperando más jugadores. Tu apuesta queda registrada hasta que la mesa se complete.
                </p>
              </div>

              <div className="faq-item">
                <h4 className="faq-question">¿Cuánto puedo ganar máximo?</h4>
                <p className="faq-answer">
                  Depende del tipo de ruleta:
                  <ul>
                    <li><strong>Ruleta 150:</strong> Máximo <strong>1.575 RUX</strong> como ganador principal (si los 15 jugadores apostaron)</li>
                    <li><strong>Ruleta 300:</strong> Máximo <strong>3.150 RUX</strong> como ganador principal (si los 15 jugadores apostaron)</li>
                  </ul>
                  Como ganador secundario: máximo 225 RUX (150) o 450 RUX (300).
                </p>
              </div>

              <div className="faq-item">
                <h4 className="faq-question">¿Cuándo se acreditan los premios?</h4>
                <p className="faq-answer">
                  Los premios se acreditan <strong>automáticamente e instantáneamente</strong> cuando termina la ronda y se determinan 
                  los ganadores. Verás una notificación y tu saldo se actualizará de inmediato.
                </p>
              </div>

              <div className="faq-item">
                <h4 className="faq-question">¿Puedo apostar en ambas ruletas al mismo tiempo?</h4>
                <p className="faq-answer">
                  <strong>Sí.</strong> Puedes tener una apuesta activa en Ruleta 150 y otra en Ruleta 300 simultáneamente. 
                  Son mesas independientes que funcionan por separado.
                </p>
              </div>

              <div className="faq-item">
                <h4 className="faq-question">¿Qué son los números adyacentes?</h4>
                <p className="faq-answer">
                  Son los números <strong>inmediatamente al lado</strong> del ganador principal. Si gana el número 5, 
                  los ganadores secundarios son los números 4 (izquierda) y 6 (derecha). Los números son circulares: 
                  si gana el número 1, los secundarios son el número 15 (izquierda) y el número 2 (derecha).
                </p>
              </div>

              <div className="faq-item">
                <h4 className="faq-question">¿Cómo funciona el sistema de depósitos y retiros?</h4>
                <p className="faq-answer">
                  Puedes depositar RUX mediante diferentes métodos de pago (aprobará un administrador) y retirar tus ganancias 
                  cuando lo desees. Los retiros también requieren aprobación administrativa. Consulta las secciones de 
                  <strong>Depósitos</strong> y <strong>Retiros</strong> en el menú para más detalles.
                </p>
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
