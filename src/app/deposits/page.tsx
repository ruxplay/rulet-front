'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { useGetUserDepositsQuery } from '@/store/api/depositApi';
import { ProtectedPage } from '@/components/auth';

const DepositHistory: React.FC = () => {
  const { authState } = useAuth();
  const username = authState.user?.username;
  
  const { data: depositsData, isLoading, error } = useGetUserDepositsQuery(username!, {
    skip: !username,
  });

  const deposits = [...(depositsData?.deposits || [])].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ffa502';
      case 'approved':
        return '#00ff9c';
      case 'rejected':
        return '#ff4757';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <ProtectedPage redirectTo="/">
        <div className="deposit-history-container">
          <div className="deposit-history">
            <div className="history-header">
              <h1 className="history-title">Historial de Depósitos</h1>
              <Link href="/deposit" className="btn-primary">
                Nuevo Depósito
              </Link>
            </div>
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <span>Cargando historial...</span>
            </div>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  if (error) {
    return (
      <ProtectedPage redirectTo="/">
        <div className="deposit-history-container">
          <div className="deposit-history">
            <div className="history-header">
              <h1 className="history-title">Historial de Depósitos</h1>
              <Link href="/deposit" className="btn-primary">
                Nuevo Depósito
              </Link>
            </div>
            <div className="error-state">
              <span>Error al cargar el historial. Inténtalo nuevamente.</span>
            </div>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage redirectTo="/">
      <div className="deposit-history-container">
        <div className="deposit-history">
          <div className="history-header">
            <h1 className="history-title">Historial de Depósitos</h1>
            <Link href="/deposit" className="btn-primary">
              Nuevo Depósito
            </Link>
          </div>

          {deposits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" />
                </svg>
              </div>
              <h3>No tienes depósitos aún</h3>
              <p>Realiza tu primer depósito para comenzar a jugar</p>
              <Link href="/deposit" className="btn-primary">
                Hacer Depósito
              </Link>
            </div>
          ) : (
            <div className="deposits-list">
              {deposits.map((deposit) => (
                <div key={deposit.id} className="deposit-card">
                  <div className="deposit-header">
                    <div className="deposit-info">
                      <h3 className="deposit-amount">
                        {Number(deposit.amount).toFixed(2)} RUX
                      </h3>
                      <span className="deposit-reference">
                        Ref: {deposit.reference}
                      </span>
                    </div>
                    <div 
                      className="deposit-status"
                      style={{ backgroundColor: getStatusColor(deposit.status) }}
                    >
                      {getStatusText(deposit.status)}
                    </div>
                  </div>

                  <div className="deposit-details">
                    <div className="detail-row">
                      <span className="detail-label">Método:</span>
                      <span className="detail-value">
                        {deposit.paymentMethod === 'bank_transfer' ? 'Transferencia Bancaria' : 'USDT'}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Banco:</span>
                      <span className="detail-value">{deposit.bank}</span>
                    </div>

                    {deposit.paymentMethod === 'usdt' && deposit.usdtAmount && (
                      <div className="detail-row">
                        <span className="detail-label">USDT:</span>
                        <span className="detail-value">{deposit.usdtAmount} USDT</span>
                      </div>
                    )}

                    <div className="detail-row">
                      <span className="detail-label">Fecha:</span>
                      <span className="detail-value">{formatDate(deposit.createdAt)}</span>
                    </div>

                    {deposit.processedAt && (
                      <div className="detail-row">
                        <span className="detail-label">Procesado:</span>
                        <span className="detail-value">{formatDate(deposit.processedAt)}</span>
                      </div>
                    )}

                    {deposit.notes && (
                      <div className="detail-row">
                        <span className="detail-label">Notas:</span>
                        <span className="detail-value">{deposit.notes}</span>
                      </div>
                    )}
                  </div>

                  {deposit.status === 'pending' && (
                    <div className="deposit-pending">
                      <div className="pending-indicator">
                        <div className="pending-dot"></div>
                        <span>En revisión</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
};

export default DepositHistory;
