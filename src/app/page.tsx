import { Header } from '@/components/layout/Header';

export default function HomePage() {
  return (
    <div className="main-container">
      <Header />
      
      <main className="home-content">
        {/* Sección Principal */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">Juega la Ruleta</h1>
              <h2 className="hero-subtitle">y Gana Estupendos Premios</h2>
              <p className="hero-description">
                La mejor experiencia de ruleta online con premios reales y juegos justos
              </p>
            </div>
            <div className="hero-image">
              <div className="promo-image">
                <span className="promo-text">Imagen Promocional</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Registro */}
        <section className="register-section">
          <div className="register-content">
            <h3 className="register-title">Regístrate</h3>
            <p className="register-subtitle">
              Si todavía no eres usuario, abre tu cuenta, es gratis y solo toma unos segundos
            </p>
          </div>
        </section>

        {/* Sección de Pasos */}
        <section className="steps-section">
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h4 className="step-title">REGÍSTRATE</h4>
              <p className="step-description">
                Si todavía no eres usuario, abre tu cuenta, es gratis y solo toma unos segundos
              </p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h4 className="step-title">APUESTA</h4>
              <p className="step-description">
                Realiza tu apuesta en nuestra increíble oferta de eventos y mercados
              </p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h4 className="step-title">GANA</h4>
              <p className="step-description">
                Recibe bonos extras por tus ganancias con nuestras increíbles promociones
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}