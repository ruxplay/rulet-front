'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './AuthForm';
import { UserInfo } from './UserInfo';
import { MobileMenu } from './MobileMenu';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { useRouletteSSE } from '@/components/roulette/hooks/useRouletteSSE';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  
  const {
    loginData,
    setLoginData,
    errors,
    isAuthenticated,
    isLoading,
    isVerifying,
    authState,
    handleLogin,
    handleLogout,
  } = useAuth();
  
  // Conectar al SSE para recibir eventos en tiempo real en TODAS las páginas
  // El hook interno ya verifica si el usuario está autenticado antes de conectar
  useRouletteSSE('150', null);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link href="/" className="logo">
          <Image
            src="/logo.png"
            alt="RubPlay Logo"
            width={40}
            height={40}
            style={{ objectFit: 'contain' }}
          />
          <span className="logo-text">RubPlay</span>
        </Link>

        {/* Nav */}
        <nav className="desktop-nav">
          {(!isAuthenticated || authState.user?.role === 'admin') && (
            <Link href="/" className="nav-link">
              Inicio
            </Link>
          )}
          {isAuthenticated && (
            <>
              <Link href="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link href="/roulette/150" className="nav-link">
                Ruleta
              </Link>
              {authState.user?.role === 'admin' && (
                <Link href="/admin" className="nav-link admin-link">
                  Dashboard Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Login Form */}
        {!isAuthenticated && (
          <AuthForm
            loginData={loginData}
            setLoginData={setLoginData}
            errors={errors}
            isLoading={isLoading}
            isVerifying={isVerifying}
            handleLogin={handleLogin}
            variant="desktop"
            onOpenForgotPassword={() => setShowForgotPasswordModal(true)}
          />
        )}

        {/* Usuario autenticado */}
        {isAuthenticated && (
          <UserInfo
            authState={authState}
            handleLogout={handleLogout}
            variant="desktop"
          />
        )}

        {/* Botón móvil */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="mobile-menu-button"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Menú móvil */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        loginData={loginData}
        setLoginData={setLoginData}
        errors={errors}
        isLoading={isLoading}
        isVerifying={isVerifying}
        handleLogin={handleLogin}
        authState={authState}
        handleLogout={handleLogout}
        onOpenForgotPassword={() => setShowForgotPasswordModal(true)}
      />
      
      {/* Modal de recuperación de contraseña (renderizado fuera del MobileMenu) */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </header>
  );
};
