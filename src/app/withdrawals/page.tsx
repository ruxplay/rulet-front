"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { useGetUserWithdrawalsQuery } from '@/store/api/withdrawalApi';
import { ProtectedPage } from '@/components/auth';

const WithdrawalsHistory: React.FC = () => {
  const { authState } = useAuth();
  const username = authState.user?.username;

  const { data: withdrawalsData, isLoading, error } = useGetUserWithdrawalsQuery(username!, {
    skip: !username,
  });

  const withdrawals = [...(withdrawalsData?.withdrawals || [])].sort((a, b) => {
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
      case 'completed':
        return '#2563eb';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      completed: 'Completado',
    };
    return map[status] || status;
  };

  const getMethodText = (method: string) => {
    const map: Record<string, string> = {
      bank_transfer: 'Transferencia Bancaria',
      pago_movil: 'Pago Móvil',
      usdt: 'USDT',
    };
    return map[method] || method;
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
              <h1 className="history-title">Historial de Retiros</h1>
              <Link href="/withdraw" className="btn-primary">
                Nuevo Retiro
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
              <h1 className="history-title">Historial de Retiros</h1>
              <Link href="/withdraw" className="btn-primary">
                Nuevo Retiro
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
            <h1 className="history-title">Historial de Retiros</h1>
            <Link href="/withdraw" className="btn-primary">
              Nuevo Retiro
            </Link>
          </div>

          {withdrawals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" />
                </svg>
              </div>
              <h3>No tienes retiros aún</h3>
              <p>Solicita tu primer retiro cuando tengas ganancias disponibles</p>
              <Link href="/withdraw" className="btn-primary">
                Solicitar Retiro
              </Link>
            </div>
          ) : (
            <div className="deposits-list">
              {withdrawals.map((w) => (
                <div key={w.id} className="deposit-card">
                  <div className="deposit-header">
                    <div className="deposit-info">
                      <h3 className="deposit-amount">
                        {Number(w.monto).toFixed(2)} RUX
                      </h3>
                      <span className="deposit-reference">
                        {getMethodText(w.payment_method)}
                      </span>
                    </div>
                    <div 
                      className="deposit-status"
                      style={{ backgroundColor: getStatusColor(w.status) }}
                    >
                      {getStatusText(w.status)}
                    </div>
                  </div>

                  <div className="deposit-details">
                    {w.payment_method === 'bank_transfer' && (
                      <>
                        <div className="detail-row">
                          <span className="detail-label">Tipo de cuenta:</span>
                          <span className="detail-value">{w.accountType}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Cuenta:</span>
                          <span className="detail-value">{w.accountNumber}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Titular:</span>
                          <span className="detail-value">{w.accountHolder}</span>
                        </div>
                      </>
                    )}

                    {w.payment_method === 'pago_movil' && (
                      <>
                        <div className="detail-row">
                          <span className="detail-label">Teléfono:</span>
                          <span className="detail-value">{w.phoneNumber}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Titular:</span>
                          <span className="detail-value">{w.accountHolder}</span>
                        </div>
                      </>
                    )}

                    {w.payment_method === 'usdt' && (
                      <>
                        <div className="detail-row">
                          <span className="detail-label">Red:</span>
                          <span className="detail-value">{w.network}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Wallet:</span>
                          <span className="detail-value">{w.walletAddress}</span>
                        </div>
                      </>
                    )}

                    <div className="detail-row">
                      <span className="detail-label">Fecha:</span>
                      <span className="detail-value">{formatDate(w.createdAt)}</span>
                    </div>

                    {w.processedAt && (
                      <div className="detail-row">
                        <span className="detail-label">Procesado:</span>
                        <span className="detail-value">{formatDate(w.processedAt)}</span>
                      </div>
                    )}

                    {w.notes && (
                      <div className="detail-row">
                        <span className="detail-label">Notas:</span>
                        <span className="detail-value">{w.notes}</span>
                      </div>
                    )}
                  </div>

                  {w.status === 'pending' && (
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

export default WithdrawalsHistory;


