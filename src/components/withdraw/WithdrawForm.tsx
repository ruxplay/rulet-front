'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { 
  useCreateWithdrawalMutation,
  useCheckEligibilityQuery,
  useGetAllowedMethodsQuery,
} from '@/store/api/withdrawalApi';
import { BankTransferFields } from './BankTransferFields';
import { PagoMovilFields } from './PagoMovilFields';
import { UsdtFields } from './UsdtFields';
import Swal from 'sweetalert2';
import type { WithdrawalPaymentMethod } from '@/types';

interface WithdrawFormData {
  cedula: string;
  telefono: string;
  banco: string;
  monto: number;
  payment_method: WithdrawalPaymentMethod | '';
  // Campos específicos para bank_transfer
  accountType: string;
  accountNumber: string;
  accountHolder: string;
  // Campos específicos para pago_movil
  phoneNumber: string;
  // Campos específicos para usdt
  network: string;
  walletAddress: string;
}

interface WithdrawFormErrors {
  cedula?: string;
  telefono?: string;
  banco?: string;
  monto?: string;
  payment_method?: string;
  general?: string;
  // Campos específicos
  accountType?: string;
  accountNumber?: string;
  accountHolder?: string;
  phoneNumber?: string;
  network?: string;
  walletAddress?: string;
}

export const WithdrawForm: React.FC = () => {
  const router = useRouter();
  const { authState } = useAuth();
  const { user } = authState;
  const username = user?.username ?? '';

  const [formData, setFormData] = useState<WithdrawFormData>({
    cedula: '',
    telefono: '',
    banco: '',
    monto: 0,
    payment_method: '',
    accountType: '',
    accountNumber: '',
    accountHolder: '',
    phoneNumber: '',
    network: '',
    walletAddress: '',
  });

  const [errors, setErrors] = useState<WithdrawFormErrors>({});

  // Verificar elegibilidad
  const { data: eligibilityData, isLoading: isLoadingEligibility } = useCheckEligibilityQuery(
    username,
    { skip: !username }
  );

  // Obtener métodos permitidos
  const { data: allowedMethodsData, isLoading: isLoadingMethods } = useGetAllowedMethodsQuery(
    username,
    { skip: !username }
  );

  const [createWithdrawal, { isLoading: isSubmitting }] = useCreateWithdrawalMutation();

  // Usar balance de Redux (igual que el Dashboard) para consistencia
  const balanceFromRedux = user?.balance ?? 0;
  const balanceValue = typeof balanceFromRedux === 'string' ? parseFloat(balanceFromRedux) : balanceFromRedux;
  const availableBalance = eligibilityData?.availableBalance ?? balanceValue;
  const minAmount = 150; // Monto mínimo en RUX

  const validateField = (name: string, value: string | number) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'monto':
        if (!value || Number(value) < minAmount) {
          newErrors.monto = `El monto mínimo es ${minAmount} RUX`;
        } else if (Number(value) > availableBalance) {
          newErrors.monto = 'Saldo insuficiente';
        } else {
          delete newErrors.monto;
        }
        break;

      case 'cedula':
        if (!value || String(value).length < 6) {
          newErrors.cedula = 'La cédula debe tener al menos 6 caracteres';
        } else if (String(value).length > 20) {
          newErrors.cedula = 'La cédula no puede exceder 20 caracteres';
        } else {
          delete newErrors.cedula;
        }
        break;

      case 'telefono':
        if (!value || String(value).length < 10) {
          newErrors.telefono = 'El teléfono debe tener al menos 10 dígitos';
        } else if (String(value).length > 20) {
          newErrors.telefono = 'El teléfono no puede exceder 20 caracteres';
        } else {
          delete newErrors.telefono;
        }
        break;

      case 'banco':
        if (!value || String(value).length < 3) {
          newErrors.banco = 'El banco es requerido';
        } else {
          delete newErrors.banco;
        }
        break;

      case 'payment_method':
        if (!value) {
          newErrors.payment_method = 'Debe seleccionar un método de pago';
        } else {
          delete newErrors.payment_method;
        }
        break;

      // Validaciones específicas para bank_transfer
      case 'accountType':
        if (!value) {
          newErrors.accountType = 'El tipo de cuenta es requerido';
        } else {
          delete newErrors.accountType;
        }
        break;

      case 'accountNumber':
        if (!value || String(value).length < 5) {
          newErrors.accountNumber = 'El número de cuenta es requerido';
        } else {
          delete newErrors.accountNumber;
        }
        break;

      case 'accountHolder':
        if (!value || String(value).length < 3) {
          newErrors.accountHolder = 'El nombre del titular es requerido';
        } else {
          delete newErrors.accountHolder;
        }
        break;

      // Validaciones específicas para pago_movil
      case 'phoneNumber':
        if (!value || String(value).length < 10) {
          newErrors.phoneNumber = 'El teléfono de Pago Móvil es requerido';
        } else {
          delete newErrors.phoneNumber;
        }
        break;

      // Validaciones específicas para usdt
      case 'network':
        if (!value) {
          newErrors.network = 'Debe seleccionar una red blockchain';
        } else {
          delete newErrors.network;
        }
        break;

      case 'walletAddress':
        if (!value || String(value).length < 10) {
          newErrors.walletAddress = 'La dirección de wallet es requerida';
        } else {
          delete newErrors.walletAddress;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'monto' ? Number(value) : value,
    }));
    
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos los campos
    const fieldsToValidate = Object.keys(formData) as Array<keyof WithdrawFormData>;
    fieldsToValidate.forEach((field) => {
      validateField(field, formData[field]);
    });

    // Si hay errores, no enviar
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Verificar que todos los campos estén llenos
    if (!formData.cedula || !formData.telefono || !formData.banco || formData.monto <= 0 || !formData.payment_method) {
      setErrors({ general: 'Por favor, completa todos los campos' });
      return;
    }

    if (!username) {
      setErrors({ general: 'Usuario no identificado' });
      return;
    }

    try {
      // Construir payload según el método de pago
      const withdrawalData: any = {
        username,
        cedula: formData.cedula,
        telefono: formData.telefono,
        banco: formData.banco,
        monto: formData.monto,
        payment_method: formData.payment_method as WithdrawalPaymentMethod,
      };

      // Agregar campos específicos según el método
      if (formData.payment_method === 'bank_transfer') {
        withdrawalData.accountType = formData.accountType;
        withdrawalData.accountNumber = formData.accountNumber;
        withdrawalData.accountHolder = formData.accountHolder;
      } else if (formData.payment_method === 'pago_movil') {
        withdrawalData.phoneNumber = formData.phoneNumber;
        withdrawalData.accountHolder = formData.accountHolder;
      } else if (formData.payment_method === 'usdt') {
        withdrawalData.network = formData.network;
        withdrawalData.walletAddress = formData.walletAddress;
      }

      const result = await createWithdrawal(withdrawalData).unwrap();

      await Swal.fire({
        icon: 'success',
        title: '¡Retiro Solicitado!',
        text: `Tu solicitud de retiro de ${formData.monto} RUX fue enviada exitosamente. Estará en revisión.`,
        confirmButtonText: 'Ir al Dashboard',
      });

      // Redirigir al dashboard
      router.push('/dashboard');
    } catch (error: unknown) {
      let errorMessage = 'Error al procesar la solicitud';
      
      if (error && typeof error === 'object' && 'data' in error) {
        const errorData = error.data as { error?: string };
        errorMessage = errorData?.error ?? errorMessage;

        switch (errorData?.error) {
          case 'USER_NOT_FOUND':
            errorMessage = 'Usuario no encontrado';
            break;
          case 'NO_WINS_TO_WITHDRAW':
            errorMessage = 'No tienes ganancias para retirar';
            break;
          case 'INSUFFICIENT_FUNDS':
            errorMessage = 'Saldo insuficiente';
            break;
          case 'MINIMUM_AMOUNT_NOT_MET':
            errorMessage = `El monto mínimo es ${minAmount} RUX`;
            break;
          case 'PENDING_WITHDRAWAL_EXISTS':
            errorMessage = 'Ya tienes un retiro pendiente de aprobación. Espera a que se procese antes de solicitar otro.';
            break;
          case 'PAYMENT_METHOD_NOT_ALLOWED':
            errorMessage = 'Método de pago no permitido para tu cuenta';
            break;
          default:
            break;
        }
      }

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'Entendido',
      });

      setErrors({ general: errorMessage });
    }
  };

  // Cargando datos de elegibilidad
  if (isLoadingEligibility || isLoadingMethods) {
    return (
      <div className="withdraw-loading">
        <div className="loading-spinner"></div>
        <p>Verificando elegibilidad...</p>
      </div>
    );
  }

  // Función para obtener mensaje amigable según el código de error
  const getEligibilityMessage = (reason?: string): string => {
    switch (reason) {
      case 'USER_NOT_FOUND':
        return 'Usuario no encontrado';
      case 'NO_WINS_TO_WITHDRAW':
        return 'No tienes ganancias para retirar';
      case 'PENDING_WITHDRAWAL_EXISTS':
        return 'Ya tienes un retiro pendiente de aprobación. Espera a que se procese antes de solicitar otro.';
      default:
        return 'No cumples con los requisitos para retirar en este momento';
    }
  };

  // Debug para ver eligibilityData
  console.log('🔍 WithdrawForm - eligibilityData:', eligibilityData);
  console.log('🔍 WithdrawForm - eligible:', eligibilityData?.eligible);
  console.log('🔍 WithdrawForm - reason:', eligibilityData?.reason);
  console.log('🔍 WithdrawForm - username:', username);

  // Usuario no elegible
  if (eligibilityData && !eligibilityData.eligible) {
    return (
      <div className="withdraw-not-eligible">
        <div className="not-eligible-icon">⚠️</div>
        <h3>No puedes retirar en este momento</h3>
        <p>{getEligibilityMessage(eligibilityData.reason)}</p>
      </div>
    );
  }

  const allowedMethods = allowedMethodsData?.allowedMethods ?? [];

  // Si no hay métodos permitidos
  if (allowedMethods.length === 0) {
    return (
      <div className="withdraw-not-eligible">
        <div className="not-eligible-icon">⚠️</div>
        <h3>No puedes retirar</h3>
        <p>Debes depositar primero para poder retirar fondos</p>
      </div>
    );
  }

  return (
    <div className="withdraw-form-container">
      <div className="withdraw-info-card">
        <h4>💵 Información de Balance</h4>
        <div className="balance-info">
          <div className="balance-item">
            <span className="balance-label">Balance disponible:</span>
            <span className="balance-value">{availableBalance.toFixed(2)} RUX</span>
          </div>
        </div>
        <p className="balance-note">
          Solo puedes retirar si has ganado en la ruleta. El monto mínimo es {minAmount} RUX.
        </p>
        {allowedMethods.length > 0 && (
          <p className="balance-note method-note">
            Puedes retirar por los métodos que usaste para depositar.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="withdraw-form">
        <div className="form-group">
          <label htmlFor="payment_method" className="form-label">
            Método de Pago *
          </label>
          <select
            id="payment_method"
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className={`form-select ${errors.payment_method ? 'error' : ''}`}
          >
            <option value="">Selecciona un método</option>
            {allowedMethods.map((method) => {
              let label = '';
              if (method === 'usdt') label = '₿ USDT (Criptomoneda)';
              else if (method === 'bank_transfer') label = '💳 Transferencia Bancaria';
              else if (method === 'pago_movil') label = '📱 Pago Móvil';
              
              return (
                <option key={method} value={method}>
                  {label}
                </option>
              );
            })}
          </select>
          {errors.payment_method && <span className="error-message">{errors.payment_method}</span>}
        </div>

        {/* Campos específicos según el método de pago */}
        {formData.payment_method === 'bank_transfer' && (
          <BankTransferFields
            formData={{
              accountType: formData.accountType,
              accountNumber: formData.accountNumber,
              accountHolder: formData.accountHolder,
            }}
            errors={{
              accountType: errors.accountType,
              accountNumber: errors.accountNumber,
              accountHolder: errors.accountHolder,
            }}
            onChange={(field: string, value: string) => {
              setFormData((prev) => ({ ...prev, [field]: value }));
              validateField(field, value);
            }}
          />
        )}

        {formData.payment_method === 'pago_movil' && (
          <PagoMovilFields
            formData={{
              banco: formData.banco,
              phoneNumber: formData.phoneNumber,
              accountHolder: formData.accountHolder,
            }}
            errors={{
              banco: errors.banco,
              phoneNumber: errors.phoneNumber,
              accountHolder: errors.accountHolder,
            }}
            onChange={(field: string, value: string) => {
              setFormData((prev) => ({ ...prev, [field]: value }));
              validateField(field, value);
            }}
          />
        )}

        {formData.payment_method === 'usdt' && (
          <UsdtFields
            formData={{
              network: formData.network,
              walletAddress: formData.walletAddress,
            }}
            errors={{
              network: errors.network,
              walletAddress: errors.walletAddress,
            }}
            onChange={(field: string, value: string) => {
              setFormData((prev) => ({ ...prev, [field]: value }));
              validateField(field, value);
            }}
          />
        )}

        <div className="form-group">
          <label htmlFor="monto" className="form-label">
            Monto a Retirar (RUX) *
          </label>
          <input
            type="number"
            id="monto"
            name="monto"
            value={formData.monto || ''}
            onChange={handleChange}
            min={minAmount}
            max={availableBalance}
            step="0.01"
            className={`form-input ${errors.monto ? 'error' : ''}`}
            placeholder="Mínimo 150 RUX"
          />
          {errors.monto && <span className="error-message">{errors.monto}</span>}
          {formData.monto > 0 && formData.monto < availableBalance && (
            <span className="form-help">
              Disponible: {availableBalance.toFixed(2)} RUX
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="cedula" className="form-label">
            Cédula de Identidad *
          </label>
          <input
            type="text"
            id="cedula"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            className={`form-input ${errors.cedula ? 'error' : ''}`}
            placeholder="V-12345678"
          />
          {errors.cedula && <span className="error-message">{errors.cedula}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="telefono" className="form-label">
            Teléfono de Contacto *
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className={`form-input ${errors.telefono ? 'error' : ''}`}
            placeholder="+58 412 1234567"
          />
          {errors.telefono && <span className="error-message">{errors.telefono}</span>}
        </div>

        {/* No mostrar "Banco" común cuando es pago_movil, ya está en el subcomponente */}
        {formData.payment_method !== 'pago_movil' && (
          <div className="form-group">
            <label htmlFor="banco" className="form-label">
              Banco Destino *
            </label>
            <input
              type="text"
              id="banco"
              name="banco"
              value={formData.banco}
              onChange={handleChange}
              className={`form-input ${errors.banco ? 'error' : ''}`}
              placeholder={formData.payment_method === 'usdt' ? 'usdt' : 'Banesco, Mercantil, BVC...'}
            />
            {errors.banco && <span className="error-message">{errors.banco}</span>}
          </div>
        )}

        {errors.general && (
          <div className="error-banner">
            <span>⚠️ {errors.general}</span>
          </div>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Solicitar Retiro'}
        </button>
      </form>
    </div>
  );
};

