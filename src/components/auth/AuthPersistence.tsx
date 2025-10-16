'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { useAppDispatch } from '@/lib/store/hooks';
import { setUser, clearUser } from '@/store/slices/authSlice';

export const AuthPersistence: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isVerifying, authData, verifyError } = useAuth();

  useEffect(() => {
    // Solo actuar cuando termine de verificar
    if (!isVerifying) {
      if (authData?.user) {
        // Usuario válido encontrado, mantener en Redux
        dispatch(setUser(authData.user));
      } else if (verifyError) {
        // Error de verificación, limpiar Redux
        dispatch(clearUser());
      }
    }
  }, [isVerifying, authData, verifyError, dispatch]);

  // No renderiza nada, solo maneja persistencia
  return null;
};

export default AuthPersistence;
