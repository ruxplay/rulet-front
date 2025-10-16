'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DepositForm } from './DepositForm';
import { UsdtDepositForm } from './UsdtDepositForm';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState<'bank_transfer' | 'usdt' | null>(null);
  const router = useRouter();

  const handleMethodSelect = (method: 'bank_transfer' | 'usdt') => {
    setSelectedMethod(method);
  };

  const handleBack = () => {
    setSelectedMethod(null);
  };

  const handleClose = () => {
    setSelectedMethod(null);
    onClose();
    router.push('/dashboard'); // Redirigir al dashboard
  };

  if (!isOpen) return null;

  return (
    <div className="deposit-modal-overlay">
      <div className="deposit-modal">
        <div className="modal-header">
          <h2 className="modal-title">Recargar Saldo</h2>
          <button onClick={handleClose} className="modal-close-btn">
            ✕
          </button>
        </div>

        <div className="modal-content">
          {!selectedMethod ? (
            <div className="method-selection">
              <p className="method-description">
                Selecciona el método de pago que prefieras para recargar tu saldo
              </p>
              
              <div className="method-options">
                <div 
                  className="method-option"
                  onClick={() => handleMethodSelect('bank_transfer')}
                >
                  <div className="method-icon">
                    <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19M17,12H12V17H10V12H5V10H10V5H12V10H17V12Z" />
                    </svg>
                  </div>
                  <div className="method-info">
                    <h3>💳 Transferencia Bancaria</h3>
                    <p>Realiza una transferencia a nuestra cuenta bancaria</p>
                    <ul>
                      <li>Proceso tradicional y seguro</li>
                      <li>Comprobante de transferencia</li>
                      <li>Revisión manual por administración</li>
                    </ul>
                  </div>
                </div>

                <div 
                  className="method-option"
                  onClick={() => handleMethodSelect('usdt')}
                >
                  <div className="method-icon">
                    <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
                    </svg>
                  </div>
                  <div className="method-info">
                    <h3>₿ USDT (Criptomoneda)</h3>
                    <p>Envía USDT desde tu wallet de criptomonedas</p>
                    <ul>
                      <li>Transacciones rápidas y globales</li>
                      <li>Tasas de cambio en tiempo real</li>
                      <li>Proceso automatizado</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="form-container">
              <div className="form-header">
                <button onClick={handleBack} className="back-btn">
                  ← Volver a métodos
                </button>
                <h3>
                  {selectedMethod === 'bank_transfer' ? '💳 Transferencia Bancaria' : '₿ USDT (Criptomoneda)'}
                </h3>
              </div>
              
              {selectedMethod === 'bank_transfer' ? (
                <DepositForm onSuccess={handleClose} />
              ) : (
                <UsdtDepositForm onSuccess={handleClose} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
