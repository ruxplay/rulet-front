'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRegisterMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/lib/store/hooks';
import { setUser, setError, clearError } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { PrivacyPolicyModal } from '@/components/auth/PrivacyPolicyModal';

interface FormData {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  general?: string;
  [key: string]: string | undefined; // permitir acceso dinámico por nombre de campo
}

const isApiError = (err: unknown): err is { data?: { error?: string } } => {
  if (typeof err !== 'object' || err === null || !('data' in err)) return false;
  const data = (err as { data?: unknown }).data;
  return typeof data === 'object' && data !== null;
};

const isZodError = (err: unknown): err is { errors: Array<{ path?: string[]; message?: string }> } => {
  return (
    typeof err === 'object' &&
    err !== null &&
    Array.isArray((err as { errors?: unknown[] }).errors)
  );
};

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validaciones en tiempo real
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'fullName':
        if (!value) {
          newErrors.fullName = 'El nombre completo es requerido';
        } else if (value.length < 2) {
          newErrors.fullName = 'El nombre debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          newErrors.fullName = 'El nombre solo puede contener letras y espacios';
        } else {
          delete newErrors.fullName;
        }
        break;

      case 'username':
        if (!value) {
          newErrors.username = 'El usuario es requerido';
        } else if (value.length < 3) {
          newErrors.username = 'El usuario debe tener al menos 3 caracteres';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.username = 'El usuario solo puede contener letras, números y guiones bajos';
        } else {
          delete newErrors.username;
        }
        break;

      case 'email':
        if (!value) {
          newErrors.email = 'El correo electrónico es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Formato de correo inválido';
        } else {
          delete newErrors.email;
        }
        break;

      case 'phone':
        if (!value || value.trim() === '') {
          newErrors.phone = 'El teléfono es requerido';
        } else if (!/^[0-9]+$/.test(value)) {
          newErrors.phone = 'El teléfono solo debe contener números';
        } else {
          delete newErrors.phone;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'La contraseña es requerida';
        } else if (value.length < 6) {
          newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        } else {
          delete newErrors.password;
          // Calcular fortaleza de contraseña
          let strength = 0;
          if (value.length >= 6) strength += 20;
          if (value.length >= 8) strength += 20;
          if (/[A-Z]/.test(value)) strength += 20;
          if (/[0-9]/.test(value)) strength += 20;
          if (/[^A-Za-z0-9]/.test(value)) strength += 20;
          setPasswordStrength(strength);
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Para teléfono, solo permitir números
    let processedValue = value;
    if (name === 'phone') {
      processedValue = value.replace(/\D/g, ''); // Eliminar todo lo que no sea número
    }
    
    const newValue = type === 'checkbox' ? checked : processedValue;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (type !== 'checkbox') {
      // Limpiar errores específicos del campo cuando el usuario modifica
      setErrors(prev => {
        const newErrors = { ...prev };
        // Limpiar errores específicos del campo modificado
        delete newErrors[name];
        // También limpiar error general si existe
        delete newErrors.general;
        return newErrors;
      });
      
      validateField(name, processedValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar términos y condiciones
    if (!formData.acceptTerms) {
      setErrors(prev => ({ ...prev, acceptTerms: 'Debes aceptar los términos y condiciones' }));
      return;
    }

    setIsLoading(true);
    
    try {
      // Limpiar errores previos
      dispatch(clearError());
      setErrors({});
      
      // Validar que el teléfono esté presente (es requerido)
      if (!formData.phone || formData.phone.trim() === '') {
        setErrors({ phone: 'El teléfono es requerido' });
        setIsLoading(false);
        return;
      }

      // Preparar datos para el backend (sin confirmPassword y acceptTerms)
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
      };

      // Llamar a la API de registro
      const result = await register(registerData).unwrap();
      
      // NO guardar usuario en Redux - solo se registró, no inició sesión
      
      // Mostrar alert de éxito
      await Swal.fire({
        title: '¡Registro Exitoso!',
        text: 'Por favor inicia sesión para continuar',
        icon: 'success',
        confirmButtonText: 'Iniciar Sesión',
        confirmButtonColor: '#00ff9c',
        allowOutsideClick: false,
        allowEscapeKey: false
      });
      
      // Redirigir al home para iniciar sesión
      router.push('/');
      
    } catch (error: unknown) {
      console.error('Error en registro:', error);
      
      // Manejar errores de Zod (validación del backend)
      if (isZodError(error)) {
        const zodErrors: Record<string, string> = {};
        for (const { path, message } of error.errors) {
          if (path && path.length > 0) {
            zodErrors[path[0]] = message || 'Error de validación';
          }
        }
        setErrors(zodErrors);
        return; // No mostrar error general si hay errores de validación
      }
      // Manejar errores del backend (RTK Query)
      else if (isApiError(error) && error.data?.error) {
        dispatch(setError(error.data.error));
        setErrors({ general: error.data.error });
      } else {
        dispatch(setError('Error al crear la cuenta. Inténtalo nuevamente.'));
        setErrors({ general: 'Error al crear la cuenta. Inténtalo nuevamente.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return '#ff4757';
    if (passwordStrength < 80) return '#ffa502';
    return '#00ff9c';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return 'Débil';
    if (passwordStrength < 80) return 'Media';
    return 'Fuerte';
  };

  return (
    <div className="main-container">
      <div className="register-page">
        <div className="register-container">
          {/* Header */}
          <div className="register-header">
            <Link href="/" className="back-link">
              ← Volver al inicio
            </Link>
            <h1 className="register-title">Crear Cuenta en RuxPlay</h1>
            <p className="register-subtitle">
              Únete a la mejor plataforma de ruleta online
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
        <form onSubmit={handleSubmit} className="register-form">
          
          {/* Error General */}
          {errors.general && (
            <div className="error-general">
              <span className="error-message">{errors.general}</span>
            </div>
          )}
          
          {/* Paso 1: Información Personal */}
          {currentStep === 1 && (
            <div className="form-step">
              <h2 className="step-title">👤 Información Personal</h2>
              
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  placeholder="Ej: Juan Pérez"
                />
                {errors.fullName && (
                  <span className="error-message">{errors.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  placeholder="Ej: juanperez123"
                />
                {errors.username && (
                  <span className="error-message">{errors.username}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Ej: juan@email.com"
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <button 
                type="button" 
                onClick={nextStep}
                className="btn-primary"
                disabled={!formData.fullName || !formData.username || !formData.email || !!errors.fullName || !!errors.username || !!errors.email}
              >
                Continuar
              </button>
            </div>
          )}

          {/* Paso 2: Seguridad */}
          {currentStep === 2 && (
            <div className="form-step">
              <h2 className="step-title">🔒 Configuración de Seguridad</h2>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Mínimo 6 caracteres"
                />
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill" 
                        style={{ 
                          width: `${passwordStrength}%`,
                          backgroundColor: getPasswordStrengthColor()
                        }}
                      ></div>
                    </div>
                    <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                )}
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Repite tu contraseña"
                />
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="Ej: 04144446186"
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>

              <div className="step-buttons">
                <button type="button" onClick={prevStep} className="btn-secondary">
                  Anterior
                </button>
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="btn-primary"
                  disabled={!formData.password || !formData.confirmPassword || !formData.phone || !!errors.password || !!errors.confirmPassword || !!errors.phone}
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
                  <span className="summary-label">Nombre:</span>
                  <span className="summary-value">{formData.fullName}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Usuario:</span>
                  <span className="summary-value">{formData.username}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Email:</span>
                  <span className="summary-value">{formData.email}</span>
                </div>
                {formData.phone && (
                  <div className="summary-item">
                    <span className="summary-label">Teléfono:</span>
                    <span className="summary-value">{formData.phone}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">
                    Acepto los <a href="#" className="terms-link">términos y condiciones</a> y la <a href="#" className="terms-link">política de privacidad</a>
                  </span>
                  <button
                    type="button"
                    className="terms-view-btn"
                    onClick={() => setShowPrivacyModal(true)}
                    aria-label="Ver política de privacidad"
                  >
                      Ver
                  </button>
                </label>
                {errors.acceptTerms && (
                  <span className="error-message">{errors.acceptTerms}</span>
                )}
              </div>

              <div className="step-buttons">
                <button type="button" onClick={prevStep} className="btn-secondary">
                  Anterior
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={!formData.acceptTerms || isLoading}
                >
                  {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer .*/}
        <div className="register-footer">
          <p>
            ¿Ya tienes cuenta? <Link href="/" className="login-link">Inicia sesión</Link>
          </p>
        </div>
        </div>
      </div>

      {/* Modal Política de Privacidad */}
      <PrivacyPolicyModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
      />
    </div>
  );
}
