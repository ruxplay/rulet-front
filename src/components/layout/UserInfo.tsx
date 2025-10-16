'use client';

import React from 'react';

interface UserInfoProps {
  authState: {
    user: {
      fullName?: string;
      username?: string;
    } | null;
  };
  handleLogout: () => void;
  variant: 'desktop' | 'mobile';
  onMobileMenuClose?: () => void;
}

export const UserInfo: React.FC<UserInfoProps> = ({
  authState,
  handleLogout,
  variant,
  onMobileMenuClose,
}) => {
  const isMobile = variant === 'mobile';

  if (isMobile) {
    return (
      <div className="mobile-user-info">
        <span>
          Hola, {authState.user?.fullName || authState.user?.username || 'Usuario'}
        </span>
        <button
          onClick={() => {
            handleLogout();
            onMobileMenuClose?.();
          }}
          className="mobile-logout-button"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="header-user-info">
      <div className="user-welcome">
        <span>
          Hola, {authState.user?.fullName || authState.user?.username || 'Usuario'}
        </span>
      </div>
      <button onClick={handleLogout} className="header-logout-button">
        Cerrar Sesión
      </button>
    </div>
  );
};
