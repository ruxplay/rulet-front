'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { API_CONFIG } from '@/lib/api/config';
import Swal from 'sweetalert2';
import '@/styles/components/EditProfileModal.css';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UpdateProfileData {
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string | null;
  password?: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  password?: string;
  general?: string;
}

export const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps): React.ReactElement | null => {
  const { authState, handleLogout } = useAuth();
  const { showError } = useSweetAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const user = authState.user;
  const userPhone = (user as { phone?: string | null })?.phone;

  // Estado inicial siempre con password vacío - NUNCA inicializar con valores del usuario
  const [formData, setFormData] = useState<UpdateProfileData>(() => ({
    username: '',
    email: '',
    fullName: '',
    phone: null,
    password: '', // SIEMPRE vacío desde el inicio
  }));

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Limpiar password cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        username: '',
        email: '',
        fullName: '',
        phone: null,
        password: '', // Limpiar password al cerrar
      });
      setShowPassword(false); // También ocultar la contraseña
      setErrors({});
    }
  }, [isOpen]);

  // Inicializar datos cuando se abre el modal - SIEMPRE con password vacío
  useEffect(() => {
    if (isOpen && user) {
      // Forzar que password siempre esté vacío, incluso si hay algún valor previo
      setFormData({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
        phone: userPhone || null,
        password: '', // SIEMPRE vacío - nunca mostrar contraseña existente
      });
      setErrors({});
      setShowPassword(false); // Asegurar que la contraseña esté oculta
    } else if (isOpen) {
      // Si el modal se abre pero no hay usuario, también limpiar password
      setFormData({
        username: '',
        email: '',
        fullName: '',
        phone: null,
        password: '', // Forzar vacío
      });
      setShowPassword(false);
      setErrors({});
    }
  }, [isOpen, user, userPhone]);

  // Manejar Escape y bloqueo de scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Validaciones en tiempo real
  const validateField = useCallback((name: string, value: string): void => {
    const newErrors = { ...errors };

    switch (name) {
      case 'username':
        if (!value || value.trim() === '') {
          newErrors.username = 'El nombre de usuario es requerido';
        } else if (value.length < 3) {
          newErrors.username = 'El usuario debe tener al menos 3 caracteres';
        } else if (value.length > 50) {
          newErrors.username = 'El usuario no puede tener más de 50 caracteres';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.username = 'El usuario solo puede contener letras, números y guiones bajos';
        } else {
          delete newErrors.username;
        }
        break;

      case 'email':
        if (!value || value.trim() === '') {
          newErrors.email = 'El correo electrónico es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Formato de correo inválido';
        } else {
          delete newErrors.email;
        }
        break;

      case 'fullName':
        if (!value || value.trim() === '') {
          newErrors.fullName = 'El nombre completo es requerido';
        } else if (value.length < 2) {
          newErrors.fullName = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.length > 120) {
          newErrors.fullName = 'El nombre no puede tener más de 120 caracteres';
        } else {
          delete newErrors.fullName;
        }
        break;

      case 'phone':
        if (!value || value.trim() === '') {
          newErrors.phone = 'El teléfono es requerido';
        } else if (!/^\d+$/.test(value)) {
          newErrors.phone = 'El teléfono solo puede contener números';
        } else if (value.length < 7) {
          newErrors.phone = 'El teléfono debe tener al menos 7 caracteres';
        } else if (value.length > 20) {
          newErrors.phone = 'El teléfono no puede tener más de 20 caracteres';
        } else {
          delete newErrors.phone;
        }
        break;

      case 'password':
        if (value && value.length < 6) {
          newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  }, [errors]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    
    // Para teléfono, solo permitir números
    let processedValue = value;
    if (name === 'phone') {
      processedValue = value.replace(/\D/g, ''); // Eliminar todo lo que no sea número
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'phone' ? (processedValue || '') : processedValue,
    }));

    // Limpiar TODOS los errores cuando el usuario modifica cualquier campo
    // Esto incluye errores del backend (como "El usuario ya existe")
    setErrors(prev => {
      const newErrors: FormErrors = {};
      // Solo mantener errores de validación de otros campos que no se están modificando
      // Pero limpiar el error del campo actual y el error general
      Object.keys(prev).forEach(key => {
        if (key !== name && key !== 'general') {
          newErrors[key as keyof FormErrors] = prev[key as keyof FormErrors];
        }
      });
      return newErrors;
    });

    // Validar el campo modificado después de limpiar errores
    validateField(name, value);
  }, [validateField]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!user?.id) {
      showError('Error: Usuario no identificado');
      return;
    }

    // Cerrar el modal de edición temporalmente para mostrar la advertencia
    onClose();
    
    // Mostrar advertencia antes de actualizar
    const confirmResult = await Swal.fire({
      title: '⚠️ Advertencia',
      html: `
        <p>Al actualizar tu perfil, se cerrará tu sesión automáticamente para aplicar los cambios.</p>
        <p style="margin-top: 10px; color: #94a3b8;">Deberás iniciar sesión nuevamente con tus datos actualizados.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00ff9c',
      cancelButtonColor: '#64748b',
      background: '#1e293b',
      color: '#ffffff',
      customClass: {
        popup: 'swal2-dark',
        title: 'swal2-title-dark',
        htmlContainer: 'swal2-html-container-dark',
      },
      allowOutsideClick: false,
      allowEscapeKey: true,
    });

    // Si el usuario cancela, no hacer nada (el modal ya está cerrado)
    if (!confirmResult.isConfirmed) {
      return;
    }

    // Validar que los campos obligatorios estén presentes
    if (!formData.username || formData.username.trim() === '') {
      setErrors({ username: 'El nombre de usuario es requerido' });
      return;
    }

    if (!formData.email || formData.email.trim() === '') {
      setErrors({ email: 'El correo electrónico es requerido' });
      return;
    }

    if (!formData.fullName || formData.fullName.trim() === '') {
      setErrors({ fullName: 'El nombre completo es requerido' });
      return;
    }

    // Validar que el teléfono esté presente (es requerido)
    if (!formData.phone || formData.phone.trim() === '') {
      setErrors({ phone: 'El teléfono es requerido' });
      return;
    }

    // Preparar datos: siempre enviar campos obligatorios
    const dataToSend: UpdateProfileData = {
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      phone: formData.phone || null,
    };

    // Solo agregar password si se proporcionó
    if (formData.password && formData.password.trim()) {
      dataToSend.password = formData.password;
    }

    // Validar que no haya errores de validación
    // Nota: errors puede tener errores de validación, pero si el usuario modificó los campos,
    // esos errores ya deberían estar limpios. Solo validamos aquí como medida de seguridad.
    const hasValidationErrors = Object.keys(errors).some(key => key !== 'general');
    if (hasValidationErrors) {
      setErrors(prev => ({ ...prev, general: 'Por favor corrige los errores antes de guardar' }));
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_PROFILE(user.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el perfil');
      }

      const result = await response.json();

      // Mostrar mensaje de éxito
      await Swal.fire({
        title: '✅ Perfil actualizado',
        text: 'Tu perfil se ha actualizado exitosamente. Cerrando sesión...',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#1e293b',
        color: '#ffffff',
        customClass: {
          popup: 'swal2-dark',
          title: 'swal2-title-dark',
        },
        zIndex: 3000, // Asegurar que esté por encima del modal de edición (z-index: 2000)
      } as unknown as Parameters<typeof Swal.fire>[0]);

      // Cerrar modal primero
      onClose();
      
      // Limpiar password después de actualizar
      setFormData(prev => ({ ...prev, password: '' }));
      
      // Cerrar sesión y forzar recarga completa de la página
      // Esto asegura que el usuario inicie sesión nuevamente con los datos actualizados
      // y limpia completamente todos los estados (Redux, SSE, efectos, etc.)
      await handleLogout();
      
      // Forzar recarga completa de la página para limpiar todo el estado
      // Esto cierra conexiones SSE, limpia Redux, y evita reautenticaciones automáticas
      window.location.href = '/';

    } catch (error: unknown) {
      let errorMessage = 'Error al actualizar el perfil';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, formData, userPhone, errors, handleLogout, showError, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="edit-profile-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editProfileModalTitle"
      onClick={handleBackdropClick}
    >
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="edit-profile-modal-close"
          aria-label="Cerrar"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <div className="edit-profile-modal-header">
          <h2 id="editProfileModalTitle" className="edit-profile-modal-title">
            ✏️ Editar Perfil
          </h2>
          <p className="edit-profile-modal-subtitle">
            Actualiza tu información personal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          {errors.general && (
            <div className="edit-profile-error-general">
              <span>{errors.general}</span>
            </div>
          )}

          <div className="edit-profile-form-group">
            <label htmlFor="username" className="edit-profile-label">
              Nombre de Usuario <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`edit-profile-input ${errors.username ? 'error' : ''}`}
              placeholder="Ej: juanperez123"
              minLength={3}
              maxLength={50}
              required
            />
            {errors.username && (
              <span className="edit-profile-error-message">{errors.username}</span>
            )}
          </div>

          <div className="edit-profile-form-group">
            <label htmlFor="email" className="edit-profile-label">
              Correo Electrónico <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`edit-profile-input ${errors.email ? 'error' : ''}`}
              placeholder="Ej: juan@email.com"
              required
            />
            {errors.email && (
              <span className="edit-profile-error-message">{errors.email}</span>
            )}
          </div>

          <div className="edit-profile-form-group">
            <label htmlFor="fullName" className="edit-profile-label">
              Nombre Completo <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`edit-profile-input ${errors.fullName ? 'error' : ''}`}
              placeholder="Ej: Juan Pérez"
              minLength={2}
              maxLength={120}
              required
            />
            {errors.fullName && (
              <span className="edit-profile-error-message">{errors.fullName}</span>
            )}
          </div>

          <div className="edit-profile-form-group">
            <label htmlFor="phone" className="edit-profile-label">
              Teléfono <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              className={`edit-profile-input ${errors.phone ? 'error' : ''}`}
              placeholder="Ej: 04144446186"
              minLength={7}
              maxLength={20}
              required
              inputMode="numeric"
              pattern="[0-9]*"
            />
            {errors.phone && (
              <span className="edit-profile-error-message">{errors.phone}</span>
            )}
          </div>

          <div className="edit-profile-form-group">
            <label htmlFor="password" className="edit-profile-label">
              Nueva Contraseña (Opcional)
            </label>
            <div className="edit-profile-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password || ''}
                onChange={handleInputChange}
                className={`edit-profile-input ${errors.password ? 'error' : ''}`}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder="Dejar vacío para no cambiar"
                minLength={6}
              />
              <button
                type="button"
                className="edit-profile-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <span className="edit-profile-error-message">{errors.password}</span>
            )}
            <p className="edit-profile-hint">
              Deja este campo vacío si no deseas cambiar tu contraseña
            </p>
          </div>

          <div className="edit-profile-modal-footer">
            <button
              type="button"
              className="edit-profile-btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="edit-profile-btn-submit"
              disabled={isLoading || Object.keys(errors).filter(key => key !== 'general').length > 0}
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

