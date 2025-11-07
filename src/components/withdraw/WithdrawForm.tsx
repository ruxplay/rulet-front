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
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

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

  // Función de validación síncrona que retorna errores sin actualizar estado
  const validateForm = (data: WithdrawFormData): WithdrawFormErrors => {
    const validationErrors: WithdrawFormErrors = {};

    // Validar campos comunes
    if (!data.cedula || String(data.cedula).length < 6) {
      validationErrors.cedula = 'La cédula debe tener al menos 6 caracteres';
    } else if (String(data.cedula).length > 20) {
      validationErrors.cedula = 'La cédula no puede exceder 20 caracteres';
    }

    if (!data.telefono || String(data.telefono).length < 10) {
      validationErrors.telefono = 'El teléfono debe tener al menos 10 dígitos';
    } else if (String(data.telefono).length > 20) {
      validationErrors.telefono = 'El teléfono no puede exceder 20 caracteres';
    } else if (!/^\d+$/.test(String(data.telefono))) {
      validationErrors.telefono = 'El teléfono solo puede contener números';
    }

    if (!data.monto || Number(data.monto) < minAmount) {
      validationErrors.monto = `El monto mínimo es ${minAmount} RUX`;
    } else if (Number(data.monto) > availableBalance) {
      validationErrors.monto = 'Saldo insuficiente';
    }

    if (!data.payment_method) {
      validationErrors.payment_method = 'Debe seleccionar un método de pago';
    }

    // Validar campos según el método de pago
    if (data.payment_method === 'bank_transfer') {
      if (!data.accountType) {
        validationErrors.accountType = 'El tipo de cuenta es requerido';
      }
      if (!data.accountNumber || String(data.accountNumber).length < 5) {
        validationErrors.accountNumber = 'El número de cuenta es requerido';
      }
      if (!data.accountHolder || String(data.accountHolder).length < 3) {
        validationErrors.accountHolder = 'El nombre del titular es requerido';
      }
      if (!data.banco || String(data.banco).length < 3) {
        validationErrors.banco = 'El banco es requerido';
      }
    } else if (data.payment_method === 'pago_movil') {
      if (!data.banco || String(data.banco).length < 3) {
        validationErrors.banco = 'El banco es requerido';
      }
      if (!data.phoneNumber || String(data.phoneNumber).length < 10) {
        validationErrors.phoneNumber = 'El teléfono de Pago Móvil es requerido';
      } else if (!/^\d+$/.test(String(data.phoneNumber))) {
        validationErrors.phoneNumber = 'El teléfono solo puede contener números';
      }
      if (!data.accountHolder || String(data.accountHolder).length < 3) {
        validationErrors.accountHolder = 'El nombre del titular es requerido';
      }
    } else if (data.payment_method === 'usdt') {
      if (!data.network) {
        validationErrors.network = 'Debe seleccionar una red blockchain';
      }
      if (!data.walletAddress || String(data.walletAddress).length < 10) {
        validationErrors.walletAddress = 'La dirección de wallet es requerida';
      }
      if (!data.banco || String(data.banco).length < 3) {
        validationErrors.banco = 'El banco es requerido';
      }
    }

    return validationErrors;
  };

  // Función para validar un campo individual y actualizar estado
  const validateField = (name: string, value: string | number) => {
    const currentData = { ...formData, [name]: name === 'monto' ? Number(value) : value };
    const validationErrors = validateForm(currentData);
    
    // Si cambió el método de pago, limpiar errores de campos que ya no aplican
    const newErrors = { ...errors };
    
    if (name === 'payment_method') {
      // Limpiar errores de campos específicos de métodos anteriores
      delete newErrors.accountType;
      delete newErrors.accountNumber;
      delete newErrors.accountHolder;
      delete newErrors.phoneNumber;
      delete newErrors.network;
      delete newErrors.walletAddress;
      delete newErrors.banco;
    }
    
    // Actualizar el error del campo que se está validando
    if (validationErrors[name as keyof WithdrawFormErrors]) {
      newErrors[name as keyof WithdrawFormErrors] = validationErrors[name as keyof WithdrawFormErrors];
    } else {
      delete newErrors[name as keyof WithdrawFormErrors];
    }
    
    // También validar y actualizar errores de campos relacionados si el método de pago cambió
    if (name === 'payment_method') {
      Object.keys(validationErrors).forEach((key) => {
        if (validationErrors[key as keyof WithdrawFormErrors]) {
          newErrors[key as keyof WithdrawFormErrors] = validationErrors[key as keyof WithdrawFormErrors];
        } else {
          delete newErrors[key as keyof WithdrawFormErrors];
        }
      });
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Filtrar solo números para campos de teléfono
    let processedValue = value;
    if (name === 'telefono' || name === 'phoneNumber') {
      // Solo permitir números
      processedValue = value.replace(/[^0-9]/g, '');
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'monto' ? Number(processedValue) : processedValue,
    }));
    
    // Marcar el campo como tocado
    setTouchedFields((prev) => new Set(prev).add(name));
    
    // Limpiar error general cuando se modifica cualquier campo
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.general;
      return newErrors;
    });
    
    validateField(name, processedValue);
  };

  // Función para verificar si el formulario es válido
  const isFormValid = (): boolean => {
    const validationErrors = validateForm(formData);
    return Object.keys(validationErrors).length === 0;
  };

  // Función helper para determinar si debe mostrarse el error de un campo
  const shouldShowError = (fieldName: string): boolean => {
    return (touchedFields.has(fieldName) || hasAttemptedSubmit) && !!errors[fieldName as keyof WithdrawFormErrors];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar que se intentó enviar el formulario
    setHasAttemptedSubmit(true);
    
    // Marcar todos los campos como tocados
    const allFields = Object.keys(formData) as Array<keyof WithdrawFormData>;
    setTouchedFields(new Set(allFields.map(f => String(f))));

    // Validar todos los campos de forma síncrona
    const validationErrors = validateForm(formData);
    
    // Actualizar el estado de errores con todos los errores encontrados
    setErrors(validationErrors);

    // Si hay errores, no enviar
    if (Object.keys(validationErrors).length > 0) {
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
            className={`form-select ${shouldShowError('payment_method') ? 'error' : ''}`}
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
          {shouldShowError('payment_method') && <span className="error-message">{errors.payment_method}</span>}
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
            shouldShowError={shouldShowError}
            onChange={(field: string, value: string) => {
              setFormData((prev) => ({ ...prev, [field]: value }));
              setTouchedFields((prev) => new Set(prev).add(field));
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.general;
                return newErrors;
              });
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
            shouldShowError={shouldShowError}
            onChange={(field: string, value: string) => {
              setFormData((prev) => ({ ...prev, [field]: value }));
              setTouchedFields((prev) => new Set(prev).add(field));
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.general;
                return newErrors;
              });
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
            shouldShowError={shouldShowError}
            onChange={(field: string, value: string) => {
              setFormData((prev) => ({ ...prev, [field]: value }));
              setTouchedFields((prev) => new Set(prev).add(field));
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.general;
                return newErrors;
              });
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
            className={`form-input ${shouldShowError('monto') ? 'error' : ''}`}
            placeholder="Mínimo 150 RUX"
          />
          {shouldShowError('monto') && <span className="error-message">{errors.monto}</span>}
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
            className={`form-input ${shouldShowError('cedula') ? 'error' : ''}`}
            placeholder="V-12345678"
          />
          {shouldShowError('cedula') && <span className="error-message">{errors.cedula}</span>}
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
            className={`form-input ${shouldShowError('telefono') ? 'error' : ''}`}
            placeholder="Ej: 04144446186"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          {shouldShowError('telefono') && <span className="error-message">{errors.telefono}</span>}
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
              className={`form-input ${shouldShowError('banco') ? 'error' : ''}`}
              placeholder={formData.payment_method === 'usdt' ? 'usdt' : 'Banesco, Mercantil, BVC...'}
            />
            {shouldShowError('banco') && <span className="error-message">{errors.banco}</span>}
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
          disabled={isSubmitting || !isFormValid()}
        >
          {isSubmitting ? 'Enviando...' : 'Solicitar Retiro'}
        </button>
      </form>
    </div>
  );
};

