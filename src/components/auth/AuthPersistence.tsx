'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { useAppDispatch } from '@/lib/store/hooks';
import { setUser, clearUser } from '@/store/slices/authSlice';

export const AuthPersistence: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isVerifying, authState } = useAuth();

  useEffect(() => {
    // Solo actuar cuando termine de verificar
    if (!isVerifying) {
      if (authState?.user) {
        // Usuario válido encontrado, mantener en Redux
        dispatch(setUser(authState.user));
      } else if (!authState?.isAuthenticated) {
        // No autenticado, limpiar Redux
        dispatch(clearUser());
      }
    }
  }, [isVerifying, authState, dispatch]);

  // No renderiza nada, solo maneja persistencia
  return null;
};

export default AuthPersistence;
