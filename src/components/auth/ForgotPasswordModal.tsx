'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { API_CONFIG } from '@/lib/api/config';
import './ForgotPasswordModal.css';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps): React.ReactElement | null => {
  const { showSuccess, showError } = useSweetAlert();
  const [identifier, setIdentifier] = useState<string>(''); // email o username
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  // Limpiar email al cerrar
  useEffect(() => {
    if (!isOpen) {
      setIdentifier('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsSubmitting(true);
    try {
      const trimmed = identifier.trim();
      const payload = trimmed.includes('@')
        ? { email: trimmed }
        : { username: trimmed };

      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_PASSWORD_FORGOT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (res.ok) {
        await showSuccess(
          'Revisa tu correo',
          'Si existe una cuenta asociada a este correo, recibirás instrucciones para restablecer tu contraseña en los próximos minutos.'
        );
        onClose();
      } else {
        // Fallback genérico (el backend debería responder 200 siempre)
        await showSuccess(
          'Revisa tu correo',
          'Si existe una cuenta asociada a este correo, recibirás instrucciones para restablecer tu contraseña en los próximos minutos.'
        );
        onClose();
      }
    } catch (err) {
      await showError('Error', 'No se pudo procesar la solicitud en este momento. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [identifier, showSuccess, showError, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="forgot-password-modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgotPasswordModalTitle"
    >
      <div className="forgot-password-modal">
        <button 
          className="forgot-password-modal-close"
          onClick={onClose}
          aria-label="Cerrar modal"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="forgot-password-modal-header">
          <div className="forgot-password-icon">🔐</div>
          <h2 id="forgotPasswordModalTitle" className="forgot-password-modal-title">
            Recuperar Contraseña
          </h2>
          <p className="forgot-password-modal-subtitle">
            Ingresa tu correo electrónico o usuario y te enviaremos instrucciones para restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="forgot-password-input-wrapper">
            <label htmlFor="forgot-identifier" className="forgot-password-label">
              Email o usuario
            </label>
            <input
              id="forgot-identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="forgot-password-input"
              placeholder="usuario@correo.com o usuario123"
              required
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="forgot-password-modal-footer">
            <button 
              type="button"
              className="forgot-password-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="forgot-password-btn-submit"
              disabled={isSubmitting || !identifier.trim()}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

