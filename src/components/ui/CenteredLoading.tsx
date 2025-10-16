'use client';

import React from 'react';

interface CenteredLoadingProps {
  message?: string;
}

export const CenteredLoading: React.FC<CenteredLoadingProps> = ({ 
  message = "Cargando..." 
}) => (
  <div className="centered-loading">
    <div className="loading-content">
      <div className="loading-spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  </div>
);

export default CenteredLoading;
