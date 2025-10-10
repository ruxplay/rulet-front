'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';

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
}

export default function RegisterPage() {
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
        if (value && !/^[0-9+\-\s()]+$/.test(value)) {
          newErrors.phone = 'Formato de teléfono inválido';
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
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (type !== 'checkbox') {
      validateField(name, value);
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
      // Aquí iría la llamada al backend
      console.log('Registrando usuario:', formData);
      
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirigir a página de éxito o login
      alert('¡Registro exitoso!');
      
    } catch (error) {
      console.error('Error en el registro:', error);
      alert('Error en el registro. Inténtalo de nuevo.');
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
      <Header />
      <div className="register-page">
        <div className="register-container">
          {/* Header */}
          <div className="register-header">
            <Link href="/" className="back-link">
              ← Volver al inicio
            </Link>
            <h1 className="register-title">Crear Cuenta en RubPlay</h1>
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
                disabled={!formData.fullName || !formData.username || !formData.email || Object.keys(errors).length > 0}
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
                  Teléfono (Opcional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="Ej: +57 300 123 4567"
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
                  disabled={!formData.password || !formData.confirmPassword || Object.keys(errors).length > 0}
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

        {/* Footer */}
        <div className="register-footer">
          <p>
            ¿Ya tienes cuenta? <Link href="/login" className="login-link">Inicia sesión</Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
