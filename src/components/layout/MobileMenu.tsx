'use client';

import React from 'react';
import Link from 'next/link';
import { AuthForm } from './AuthForm';
import { UserInfo } from './UserInfo';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  loginData: { username: string; password: string };
  setLoginData: (data: { username: string; password: string }) => void;
  errors: { username?: string; password?: string; general?: string };
  isLoading: boolean;
  isVerifying: boolean;
  handleLogin: (e: React.FormEvent) => void;
  authState: {
    user: {
      fullName?: string;
      username?: string;
    } | null;
  };
  handleLogout: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  loginData,
  setLoginData,
  errors,
  isLoading,
  isVerifying,
  handleLogin,
  authState,
  handleLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="mobile-menu">
      <div className="mobile-menu-content">
        <Link href="/" className="mobile-nav-link" onClick={onClose}>
          Inicio
        </Link>
        {isAuthenticated && (
          <>
            <Link href="/dashboard" className="mobile-nav-link" onClick={onClose}>
              Dashboard
            </Link>
            <Link href="/roulette/150" className="mobile-nav-link" onClick={onClose}>
              Ruleta
            </Link>
          </>
        )}

        {!isAuthenticated && (
          <AuthForm
            loginData={loginData}
            setLoginData={setLoginData}
            errors={errors}
            isLoading={isLoading}
            isVerifying={isVerifying}
            handleLogin={handleLogin}
            variant="mobile"
            onMobileMenuClose={onClose}
          />
        )}

        {isAuthenticated && (
          <UserInfo
            authState={authState}
            handleLogout={handleLogout}
            variant="mobile"
            onMobileMenuClose={onClose}
          />
        )}
      </div>
    </div>
  );
};
