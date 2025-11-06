import { StepsSection } from '@/components/sections/StepsSection';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="main-container">
      <main className="home-content">
        {/* Sección Principal */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">Juega la Ruleta</h1>
              <h2 className="hero-subtitle">y Gana Estupendos Premios</h2>
              <p className="hero-description">
                La mejor experiencia de ruleta online con premios reales y juegos justos. 
                Únete a miles de jugadores que ya disfrutan de nuestra plataforma.
              </p>
              <div className="hero-features">
                <div className="feature-item">
                  <span className="feature-icon">🎰</span>
                  <span className="feature-text">Ruleta Online</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <span className="feature-text">100% Seguro</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💰</span>
                  <span className="feature-text">Premios Reales</span>
                </div>
              </div>
            </div>
            <div className="hero-image">
              <div className="promo-image">
                <Image
                  src="/inicio.jpg"
                  alt="Imagen Promocional"
                  fill
                  className="promo-image-content"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Registro */}
        <section className="register-section">
          <div className="register-content">
            <h3 className="register-title">¡Únete a RubPlay!</h3>
            <p className="register-subtitle">
              Si todavía no eres usuario, abre tu cuenta, es gratis y solo toma unos segundos
            </p>
            <div className="register-actions">
              <Link href="/register" className="btn-primary">
                <span className="btn-icon">🎯</span>
                Registrarse Ahora
              </Link>
            </div>
          </div>
        </section>

        {/* Sección de Pasos - Usando el nuevo componente */}
        <StepsSection />
      </main>
    </div>
  );
}