'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { useCreateDepositMutation } from '@/store/api/depositApi';
import { ReceiptUpload } from './ReceiptUpload';
import Swal from 'sweetalert2';

interface DepositFormData {
  amount: number;
  reference: string;
  bank: string;
}

interface DepositFormErrors {
  amount?: string;
  reference?: string;
  bank?: string;
  receipt?: string;
  general?: string;
}

interface DepositFormProps {
  onSuccess: () => void;
}

export const DepositForm: React.FC<DepositFormProps> = ({ onSuccess }) => {
  const { authState } = useAuth();
  const [createDeposit, { isLoading }] = useCreateDepositMutation();

  const [formData, setFormData] = useState<DepositFormData>({
    amount: 0,
    reference: '',
    bank: '',
  });

  const [errors, setErrors] = useState<DepositFormErrors>({});
  const [receiptData, setReceiptData] = useState<{
    receiptUrl: string;
    receiptPublicId: string;
    receiptFormat: string;
    receiptBytes: number;
  } | null>(null);

  const [currentStep, setCurrentStep] = useState(1);


  const validateField = (name: string, value: string | number) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'amount':
        if (!value || Number(value) < 50) {
          newErrors.amount = 'El monto mínimo es 50 BS';
        } else {
          delete newErrors.amount;
        }
        break;

      case 'reference':
        if (!value || String(value).length < 3) {
          newErrors.reference = 'El número de referencia es requerido';
        } else if (String(value).length > 100) {
          newErrors.reference = 'La referencia no puede exceder 100 caracteres';
        } else {
          delete newErrors.reference;
        }
        break;

      case 'bank':
        if (!value) {
          newErrors.bank = 'Debe seleccionar el banco de origen';
        } else {
          delete newErrors.bank;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
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
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.receipt;
      return newErrors;
    });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validar paso 1
      const step1Errors = [];
      if (!formData.amount || formData.amount < 50) step1Errors.push('amount');
      if (!formData.reference) step1Errors.push('reference');
      if (!formData.bank) step1Errors.push('bank');
      
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
    
    if (!receiptData) {
      setErrors(prev => ({ ...prev, receipt: 'Debes subir un comprobante' }));
      return;
    }

    if (!authState.user?.username) {
      setErrors(prev => ({ ...prev, general: 'Usuario no autenticado' }));
      return;
    }

    try {
      const depositData = {
        username: authState.user.username,
        amount: formData.amount,
        reference: formData.reference,
        bank: formData.bank,
        paymentMethod: 'bank_transfer',
        ...receiptData,
      };

      await createDeposit(depositData).unwrap();

      await Swal.fire({
        title: '¡Depósito Enviado!',
        text: 'Tu solicitud de depósito ha sido enviada y será revisada por nuestro equipo.',
        icon: 'success',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#00ff9c',
      });

      onSuccess();

    } catch (error: unknown) {
      console.error('Error creating deposit:', error);
      const message = (error as { data?: { error?: string } })?.data?.error || 'Error al crear el depósito. Inténtalo nuevamente.';
      setErrors({ general: message });
    }
  };


  return (
    <div className="deposit-form-container">
      <div className="deposit-form">
        {/* Header */}
        <div className="form-header">
          <h1 className="form-title">Recargar Saldo</h1>
          <p className="form-subtitle">
            Completa la información para solicitar tu recarga
          </p>
        </div>

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
        <form onSubmit={handleSubmit} className="deposit-form-content">
          
          {/* Error General */}
          {errors.general && (
            <div className="error-general">
              <span className="error-message">{errors.general}</span>
            </div>
          )}

          {/* Paso 1: Información del Depósito */}
          {currentStep === 1 && (
            <div className="form-step">
              <h2 className="step-title">💰 Información del Depósito</h2>
              
              <div className="payment-method-info">
                <div className="method-info">
                  <h3>💳 Transferencia Bancaria</h3>
                  <p>Realiza una transferencia bancaria a nuestra cuenta y sube el comprobante</p>
                  
                  <div className="bank-info">
                    <h4>Datos de la Cuenta:</h4>
                    <div className="bank-details">
                      <div className="bank-item">
                        <span className="bank-label">Banco:</span>
                        <span className="bank-value">Banco</span>
                      </div>
                      <div className="bank-item">
                        <span className="bank-label">Cuenta:</span>
                        <span className="bank-value">00000 - Cuenta C</span>
                      </div>
                      <div className="bank-item">
                        <span className="bank-label">Titular:</span>
                        <span className="bank-value">Rulet Games C.A.</span>
                      </div>
                      <div className="bank-item">
                        <span className="bank-label">Número:</span>
                        <span className="bank-value">000000000</span>
                      </div>
                      <div className="bank-item">
                        <span className="bank-label">Cédula:</span>
                        <span className="bank-value">00000000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="amount" className="form-label">
                  Monto a recargar
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className={`form-input ${errors.amount ? 'error' : ''}`}
                  placeholder="Ej: 2000"
                  min="50"
                  step="50"
                />
                {errors.amount && <span className="error-message">{errors.amount}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="reference" className="form-label">
                  Número de referencia
                </label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  className={`form-input ${errors.reference ? 'error' : ''}`}
                  placeholder="Número de transferencia"
                />
                {errors.reference && <span className="error-message">{errors.reference}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="bank" className="form-label">
                  Banco de origen
                </label>
                <select
                  id="bank"
                  name="bank"
                  value={formData.bank}
                  onChange={handleInputChange}
                  className={`form-select ${errors.bank ? 'error' : ''}`}
                >
                  <option value="">Seleccione su banco</option>
                  <option value="Banesco">Banesco</option>
                  <option value="Venezuela">Banco de Venezuela</option>
                  <option value="Mercantil">Banco Mercantil</option>
                  <option value="Provincial">Banco Provincial</option>
                  <option value="Bicentenario">Banco Bicentenario</option>
                  <option value="Otro">Otro Banco</option>
                </select>
                {errors.bank && <span className="error-message">{errors.bank}</span>}
              </div>

              <button 
                type="button" 
                onClick={nextStep}
                className="btn-primary"
                disabled={!formData.amount || !formData.reference || !formData.bank || 
                         errors.amount || errors.reference || errors.bank}
              >
                Continuar
              </button>
            </div>
          )}

          {/* Paso 2: Comprobante */}
          {currentStep === 2 && (
            <div className="form-step">
              <h2 className="step-title">📄 Comprobante de Pago</h2>
              
              <div className="form-group">
                <label className="form-label">
                  Subir Comprobante
                </label>
                <ReceiptUpload
                  onUpload={handleReceiptUpload}
                  error={errors.receipt}
                  disabled={isLoading}
                />
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
                  <span className="summary-value">Transferencia Bancaria</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Monto:</span>
                  <span className="summary-value">{formData.amount.toFixed(2)} BS</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Referencia:</span>
                  <span className="summary-value">{formData.reference}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Banco:</span>
                  <span className="summary-value">{formData.bank}</span>
                </div>
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
    </div>
  );
};

export default DepositForm;
