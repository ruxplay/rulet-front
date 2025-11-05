'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { API_CONFIG } from '@/lib/api/config';
import '@/styles/components/auth-pages.css';

export const ResetPasswordContent = (): React.ReactElement => {
  const params = useSearchParams();
  const router = useRouter();
  const { showError, showSuccess, showInfo } = useSweetAlert();

  const token = useMemo(() => (params?.get('token') || '').trim(), [params]);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const verify = async (): Promise<void> => {
      if (!token || token.length < 10) {
        setIsVerifying(false);
        setIsValid(false);
        return;
      }
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_PASSWORD_VERIFY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = (await res.json()) as { valid?: boolean };
        setIsValid(Boolean(data?.valid));
      } catch {
        setIsValid(false);
      } finally {
        setIsVerifying(false);
      }
    };
    verify();
  }, [token]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!token || !password.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_PASSWORD_RESET}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      if (res.ok) {
        await showSuccess('Contraseña actualizada', 'Ya puedes iniciar sesión con tu nueva contraseña.');
        router.push('/');
        return;
      }
      const data = (await res.json()) as { code?: string };
      switch (data?.code) {
        case 'INVALID_OR_USED_TOKEN':
          await showError('Token inválido', 'El enlace ya fue utilizado o es inválido.');
          break;
        case 'TOKEN_EXPIRED':
          await showError('Token expirado', 'Vuelve a solicitar la recuperación de contraseña.');
          break;
        case 'USER_NOT_FOUND':
          await showError('Usuario no encontrado', 'Vuelve a intentar el proceso de recuperación.');
          break;
        default:
          await showError('Error', 'No se pudo restablecer la contraseña.');
      }
    } catch {
      await showError('Error', 'No se pudo restablecer la contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  }, [token, password, showSuccess, showError, router]);

  if (isVerifying) {
    return (
      <div className="auth-page-container">
        <h1 className="auth-page-title">Restablecer contraseña</h1>
        <p className="auth-info">Verificando enlace...</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="auth-page-container">
        <h1 className="auth-page-title">Enlace no válido</h1>
        <p className="auth-error">Tu enlace es inválido o ha expirado. Vuelve a solicitarlo.</p>
      </div>
    );
  }

  return (
    <div className="auth-page-container">
      <h1 className="auth-page-title">Restablecer contraseña</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-form-group">
          <label htmlFor="reset-password" className="auth-label">
            Nueva contraseña
          </label>
          <input
            id="reset-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            required
            autoFocus
          />
        </div>
        <button type="submit" className="auth-submit" disabled={isSubmitting || password.trim().length < 6}>
          {isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </form>
    </div>
  );
};

