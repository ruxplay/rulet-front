'use client';

import React from 'react';
import Link from 'next/link';

interface AuthFormProps {
  loginData: { username: string; password: string };
  setLoginData: (data: { username: string; password: string }) => void;
  errors: { username?: string; password?: string; general?: string };
  isLoading: boolean;
  isVerifying: boolean;
  handleLogin: (e: React.FormEvent) => void;
  variant: 'desktop' | 'mobile';
  onMobileMenuClose?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  loginData,
  setLoginData,
  errors,
  isLoading,
  isVerifying,
  handleLogin,
  variant,
  onMobileMenuClose,
}) => {
  const isMobile = variant === 'mobile';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Llamar al handleLogin original
    await handleLogin(e);
    
    // Si hay onMobileMenuClose y es móvil, cerrar el menú después de un breve delay
    if (isMobile && onMobileMenuClose) {
      setTimeout(() => {
        onMobileMenuClose();
      }, 100);
    }
  };

  if (isMobile) {
    return (
      <form onSubmit={handleSubmit} className="mobile-login-form">
        <div className="mobile-login-title">Iniciar Sesión</div>

        {errors.general && (
          <div className="mobile-error-general">
            <span>{errors.general}</span>
          </div>
        )}

        <input
          type="text"
          placeholder="Usuario o Email"
          value={loginData.username}
          onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
          className={`mobile-login-input ${errors.username ? 'error' : ''}`}
        />
        {errors.username && <span>{errors.username}</span>}

        <input
          type="password"
          placeholder="Contraseña"
          value={loginData.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          className={`mobile-login-input ${errors.password ? 'error' : ''}`}
        />
        {errors.password && <span>{errors.password}</span>}

        <button
          type="submit"
          disabled={isLoading || !loginData.username.trim() || !loginData.password.trim()}
          className="mobile-login-button"
        >
          {isLoading ? 'Ingresando...' : 'Ingresar'}
        </button>
        <Link href="/register" className="mobile-nav-link" onClick={onMobileMenuClose}>
          Regístrate
        </Link>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="header-login-form">
      {errors.general && (
        <div className="header-error-general">
          <span>{errors.general}</span>
        </div>
      )}

      <div className="login-inputs-container">
        <div className="header-input-wrapper">
          <input
            type="text"
            placeholder="Usuario o Email"
            value={loginData.username}
            onChange={(e) =>
              setLoginData({ ...loginData, username: e.target.value })
            }
            className={`header-login-input ${errors.username ? 'error' : ''}`}
          />
          {errors.username && (
            <span className="header-field-error">{errors.username}</span>
          )}
        </div>

        <div className="header-input-wrapper">
          <input
            type="password"
            placeholder="Contraseña"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            className={`header-login-input ${errors.password ? 'error' : ''}`}
          />
          {errors.password && (
            <span className="header-field-error">{errors.password}</span>
          )}
        </div>

        <button
          type="submit"
          className="header-login-button"
          disabled={isLoading || isVerifying || !loginData.username.trim() || !loginData.password.trim()}
        >
          {isLoading ? 'Ingresando...' : 'Ingresar'}
        </button>
        <Link href="/register" className="nav-link register-link">
          Regístrate
        </Link>
      </div>
    </form>
  );
};
