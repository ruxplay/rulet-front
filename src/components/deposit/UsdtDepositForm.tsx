'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { useCreateDepositMutation } from '@/store/api/depositApi';
import { ReceiptUpload } from './ReceiptUpload';
import { CopyButton } from '@/components/ui/CopyButton';
import { useExchangeRate } from '@/lib/services/exchangeRateService';
import Swal from 'sweetalert2';

interface UsdtDepositFormData {
  usdtAmount: number;
  walletAddress: string;
  transactionHash: string;
}

interface UsdtDepositFormErrors {
  usdtAmount?: string;
  walletAddress?: string;
  transactionHash?: string;
  receipt?: string;
  general?: string;
  [key: string]: string | undefined;
}

interface UsdtDepositFormProps {
  onSuccess: () => void;
}

export const UsdtDepositForm: React.FC<UsdtDepositFormProps> = ({ onSuccess }) => {
  const { authState } = useAuth();
  const [createDeposit, { isLoading }] = useCreateDepositMutation();
  const { rateData, loading: isLoadingRate, convertUsdtToRub } = useExchangeRate();

  const [formData, setFormData] = useState<UsdtDepositFormData>({
    usdtAmount: 0,
    walletAddress: '',
    transactionHash: '',
  });

  const [errors, setErrors] = useState<UsdtDepositFormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    receiptUrl: string;
    receiptPublicId: string;
    receiptFormat: string;
    receiptBytes: number;
  } | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [showQrModal, setShowQrModal] = useState(false);

  // Calcular monto en RUB usando la nueva tasa con margen
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  useEffect(() => {
    const calculateAmount = async () => {
      if (formData.usdtAmount > 0 && rateData) {
        const amount = await convertUsdtToRub(formData.usdtAmount);
        setCalculatedAmount(amount);
      } else {
        setCalculatedAmount(0);
      }
    };

    calculateAmount();
  }, [formData.usdtAmount, rateData, convertUsdtToRub]);

  const validateField = (name: string, value: string | number) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'usdtAmount':
        if (!value || Number(value) <= 0) {
          newErrors.usdtAmount = 'La cantidad en USDT debe ser mayor a 0';
        } else if (Number(value) < 1) {
          newErrors.usdtAmount = 'El monto mínimo es 1 USDT';
        } else {
          delete newErrors.usdtAmount;
        }
        break;

      case 'walletAddress':
        if (!value || String(value).length < 10) {
          newErrors.walletAddress = 'La dirección de wallet es requerida';
        } else if (!String(value).startsWith('0x') && !String(value).startsWith('T') && !String(value).startsWith('1')) {
          newErrors.walletAddress = 'Formato de dirección de wallet inválido';
        } else {
          delete newErrors.walletAddress;
        }
        break;

      case 'transactionHash':
        if (value && String(value).length < 10) {
          newErrors.transactionHash = 'El hash de transacción debe tener al menos 10 caracteres';
        } else {
          delete newErrors.transactionHash;
        }
        break;
    }

    setErrors(newErrors);
  };

  // Función helper para determinar si debe mostrarse el error de un campo
  const shouldShowError = (fieldName: string): boolean => {
    return (touchedFields.has(fieldName) || hasAttemptedSubmit) && !!errors[fieldName];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Marcar el campo como tocado
    setTouchedFields((prev) => new Set(prev).add(name));
    
    // Limpiar errores específicos del campo
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      delete newErrors.general;
      return newErrors;
    });

    validateField(name, newValue);
  };

  const handleReceiptUpload = (fileData: {
    receiptUrl: string;
    receiptPublicId: string;
    receiptFormat: string;
    receiptBytes: number;
  }) => {
    setReceiptData(fileData);
    setTouchedFields((prev) => new Set(prev).add('receipt'));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.receipt;
      return newErrors;
    });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Marcar que se intentó avanzar
      setHasAttemptedSubmit(true);
      
      // Marcar todos los campos del paso 1 como tocados
      setTouchedFields((prev) => {
        const newSet = new Set(prev);
        newSet.add('usdtAmount');
        newSet.add('walletAddress');
        return newSet;
      });
      
      // Validar paso 1
      const step1Errors = [];
      if (!formData.usdtAmount || formData.usdtAmount < 1) step1Errors.push('usdtAmount');
      if (!formData.walletAddress) step1Errors.push('walletAddress');
      
      if (step1Errors.length > 0) {
        setErrors(prev => ({
          ...prev,
          general: 'Por favor completa todos los campos requeridos'
        }));
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar que se intentó enviar
    setHasAttemptedSubmit(true);
    setTouchedFields((prev) => {
      const newSet = new Set(prev);
      newSet.add('receipt');
      return newSet;
    });
    
    if (!receiptData) {
      setErrors(prev => ({ ...prev, receipt: 'Debes subir un comprobante' }));
      return;
    }

    if (!authState.user?.username) {
      setErrors(prev => ({ ...prev, general: 'Usuario no autenticado' }));
      return;
    }

    if (!rateData) {
      setErrors(prev => ({ ...prev, general: 'No se pudo obtener la tasa de cambio actual' }));
      return;
    }

    try {
      const depositData = {
        username: authState.user.username,
        amount: calculatedAmount,
        reference: `USDT_${Date.now()}`,
        bank: 'USDT Wallet',
        paymentMethod: 'usdt' as const,
        usdtAmount: formData.usdtAmount,
        exchangeRate: rateData.finalRate, // Envía tasa con margen (297.0045 RUB/USDT)
        walletAddress: formData.walletAddress,
        transactionHash: formData.transactionHash,
        ...receiptData,
      };

      // Información de verificación removida

      await createDeposit(depositData).unwrap();

      await Swal.fire({
        title: '¡Depósito USDT Enviado!',
        text: `Tu solicitud de depósito de ${formData.usdtAmount} USDT por ${calculatedAmount.toFixed(2)} RUB ha sido enviada y será revisada por nuestro equipo.`,
        icon: 'success',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#00ff9c',
      });

      onSuccess();

    } catch (error: unknown) {
      console.error('Error creating USDT deposit:', error);
      const message = (error as { data?: { error?: string } })?.data?.error || 'Error al crear el depósito USDT. Inténtalo nuevamente.';
      setErrors({ general: message });
    }
  };

  return (
    <div className="usdt-deposit-form">
      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
        <div className="progress-steps">
          <span className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</span>
          <span className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</span>
          <span className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="usdt-form-content">
        
        {/* Error General */}
        {errors.general && (
          <div className="error-general">
            <span className="error-message">{errors.general}</span>
          </div>
        )}

        {/* Paso 1: Información USDT */}
        {currentStep === 1 && (
          <div className="form-step">
            <h2 className="step-title">₿ Información del Depósito USDT</h2>
            
                   <div className="usdt-info">
                     <div className="rate-info">
                       <span>Tasa oficial: </span>
                       <span className="rate-value">
                         {isLoadingRate ? 'Cargando...' : 
                          rateData ? `${rateData.officialRate} RUB/USDT` : 'No disponible'}
                       </span>
                     </div>
                     <div className="rate-info">
                       <span>Tasa final (con margen): </span>
                       <span className="rate-value-final">
                         {isLoadingRate ? 'Cargando...' : 
                          rateData ? `${rateData.finalRate} RUB/USDT` : 'No disponible'}
                       </span>
                     </div>
                     <div className="rate-info">
                       <span>Margen aplicado: </span>
                       <span className="rate-margin">
                         {isLoadingRate ? 'Cargando...' : 
                          rateData ? `+${rateData.marginPercentage}%` : 'No disponible'}
                       </span>
                     </div>
                   </div>

                   <div className="wallet-info">
                     <h4>📋 Datos de Binance</h4>
                     <div className="wallet-details">
                       {/* QR Code */}
                       <div className="binance-qr-container">
                         <h3 className="binance-qr-preview-title">ESCANEAR CÓDIGO QR</h3>
                         <div className="binance-qr-preview">
                           <Image
                             src="/binance.jpg"
                             alt="Binance QR Code"
                             width={250}
                             height={250}
                             className="binance-qr-image"
                             priority
                           />
                         </div>
                         <button
                           type="button"
                           onClick={() => setShowQrModal(true)}
                           className="binance-qr-view-btn"
                         >
                           Ver
                         </button>
                       </div>
                       
                       {/* Modal para ver QR completo */}
                       {showQrModal && (
                         <div className="binance-qr-modal-overlay" onClick={() => setShowQrModal(false)}>
                           <div className="binance-qr-modal-content" onClick={(e) => e.stopPropagation()}>
                             <button
                               type="button"
                               className="binance-qr-modal-close"
                               onClick={() => setShowQrModal(false)}
                             >
                               ×
                             </button>
                             <h3 className="binance-qr-modal-title">Escanear código QR</h3>
                             <Image
                               src="/binance.jpg"
                               alt="Binance QR Code Completo"
                               width={400}
                               height={400}
                               className="binance-qr-modal-image"
                               priority
                             />
                           </div>
                         </div>
                       )}
                       
                       <div className="wallet-copy-item">
                         <span className="wallet-copy-label">Binance ID:</span>
                         <span className="wallet-copy-text">53723619</span>
                         <CopyButton 
                           text="53723619" 
                           label="Binance ID"
                           className="small"
                         />
                       </div>
                       
                       <div className="wallet-item">
                         <span className="wallet-label">Monto mínimo:</span>
                         <span className="wallet-value">1 USDT</span>
                       </div>
                       
                       <div className="copy-all-section">
                         <CopyButton 
                           text={`Binance ID: 53723619\nMonto mínimo: 1 USDT`}
                           label="todo"
                           className="copy-all-button"
                         />
                       </div>
                       
                       <div className="wallet-instructions">
                         <strong>Instrucciones:</strong> Escanea el código QR con tu aplicación de Binance o ingresa el Binance ID mostrado arriba. Las comisiones son muy bajas y la confirmación es rápida (1-3 minutos).
                       </div>
                     </div>
                   </div>

            <div className="form-group">
              <label htmlFor="usdtAmount" className="form-label">
                Cantidad en USDT
              </label>
              <input
                type="number"
                id="usdtAmount"
                name="usdtAmount"
                value={formData.usdtAmount || ''}
                onChange={handleInputChange}
                className={`form-input ${shouldShowError('usdtAmount') ? 'error' : ''}`}
                placeholder="Ej: 1"
                min="1"
                step="0.01"
              />
              {shouldShowError('usdtAmount') && <span className="error-message">{errors.usdtAmount}</span>}
              
                     {formData.usdtAmount > 0 && rateData && (
                       <div className="conversion-info">
                         <strong className="conversion-amount">Recibirás: {calculatedAmount.toFixed(2)} RUB</strong>
                       </div>
                     )}
            </div>

            <div className="form-group">
              <label htmlFor="walletAddress" className="form-label">
                Dirección de Wallet USDT
              </label>
              <input
                type="text"
                id="walletAddress"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleInputChange}
                className={`form-input ${shouldShowError('walletAddress') ? 'error' : ''}`}
                placeholder="Ej: 0x742d35Cc6634C0532925a3b8D..."
              />
              {shouldShowError('walletAddress') && <span className="error-message">{errors.walletAddress}</span>}
              <div className="field-help">
                Dirección de tu wallet desde donde enviaste los USDT
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="transactionHash" className="form-label">
                Hash de Transacción (Opcional)
              </label>
              <input
                type="text"
                id="transactionHash"
                name="transactionHash"
                value={formData.transactionHash}
                onChange={handleInputChange}
                className={`form-input ${shouldShowError('transactionHash') ? 'error' : ''}`}
                placeholder="Ej: 0x1234567890abcdef..."
              />
              {shouldShowError('transactionHash') && <span className="error-message">{errors.transactionHash}</span>}
              <div className="field-help">
                Hash de la transacción en la blockchain (opcional pero recomendado)
              </div>
            </div>

            <button 
              type="button" 
              onClick={nextStep}
              className="btn-primary"
              disabled={!formData.usdtAmount || !formData.walletAddress || 
                       !!errors.usdtAmount || !!errors.walletAddress}
            >
              Continuar
            </button>
          </div>
        )}

        {/* Paso 2: Comprobante */}
        {currentStep === 2 && (
          <div className="form-step">
            <h2 className="step-title">📄 Comprobante de Transacción</h2>
            
            <div className="form-group">
              <label className="form-label">
                Subir Comprobante
              </label>
                <ReceiptUpload
                  onUpload={handleReceiptUpload}
                  error={shouldShowError('receipt') ? errors.receipt : undefined}
                  disabled={isLoading}
                />
              <div className="field-help">
                Captura de pantalla de la transacción o comprobante del envío de USDT
              </div>
            </div>

            <div className="step-buttons">
              <button type="button" onClick={prevStep} className="btn-secondary">
                Anterior
              </button>
              <button 
                type="button" 
                onClick={nextStep}
                className="btn-primary"
                disabled={!receiptData}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Confirmación */}
        {currentStep === 3 && (
          <div className="form-step">
            <h2 className="step-title">✅ Revisar y Confirmar</h2>
            
            <div className="confirmation-summary">
              <div className="summary-item">
                <span className="summary-label">Método:</span>
                <span className="summary-value">USDT (Criptomoneda)</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">USDT:</span>
                <span className="summary-value">{formData.usdtAmount} USDT</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Equivale a:</span>
                <span className="summary-value">{calculatedAmount.toFixed(2)} RUB</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Tasa Final:</span>
                <span className="summary-value">{rateData?.finalRate.toFixed(2) || 'N/A'} RUB/USDT</span>
              </div>
              {/* Campos técnicos ocultos para el usuario */}
              {/* <div className="summary-item">
                <span className="summary-label">Tasa Oficial:</span>
                <span className="summary-value">{rateData?.officialRate.toFixed(2) || 'N/A'} RUB/USDT</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Margen:</span>
                <span className="summary-value">+{rateData?.marginPercentage || 'N/A'}%</span>
              </div> */}
              <div className="summary-item">
                <span className="summary-label">Wallet:</span>
                <span className="summary-value">{formData.walletAddress}</span>
              </div>
              {formData.transactionHash && (
                <div className="summary-item">
                  <span className="summary-label">Hash:</span>
                  <span className="summary-value">{formData.transactionHash}</span>
                </div>
              )}
            </div>

            <div className="step-buttons">
              <button type="button" onClick={prevStep} className="btn-secondary">
                Anterior
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isLoading || !receiptData}
              >
                {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default UsdtDepositForm;
