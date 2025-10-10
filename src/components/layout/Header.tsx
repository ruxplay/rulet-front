'use client';

import { useState } from 'react';

export const Header = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', loginData);
  };

  return (
    <header className="header">
      <div className="header-container">
        
        {/* Logo */}
        <a href="/" className="logo">
          <div className="logo-icon">
            <span className="logo-text">R</span>
          </div>
          <span className="logo-text">RubPlay</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <a href="/" className="nav-link">
            Inicio
          </a>
          <a href="#casino" className="nav-link">
            Casino
          </a>
          
          {/* Desktop Login Form */}
          <form onSubmit={handleLogin} className="header-login-form">
            <div className="login-inputs-container">
              <input
                type="email"
                placeholder="Correo"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                className="header-login-input"
              />
              <div className="login-separator"></div>
              <input
                type="password"
                placeholder="Contraseña"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="header-login-input"
              />
              <button
                type="submit"
                className="header-login-button"
              >
                Ingresar
              </button>
              <a href="/register" className="nav-link register-link">
                Regístrate
              </a>
            </div>
          </form>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="mobile-menu-button"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <a href="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Inicio
            </a>
            <a href="#casino" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Casino
            </a>
            
            {/* Mobile Login Form */}
            <form onSubmit={handleLogin} className="mobile-login-form">
              <div className="mobile-login-title">Iniciar Sesión</div>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                className="mobile-login-input"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="mobile-login-input"
              />
              <button
                type="submit"
                className="mobile-login-button"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ingresar
              </button>
              <a 
                href="/register"
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Regístrate
              </a>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};