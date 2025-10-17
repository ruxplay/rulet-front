'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setUser, clearUser } from '@/store/slices/authSlice';

export const AuthPersistence: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isVerifying, authState } = useAuth();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Solo actuar cuando termine de verificar y no haya inicializado
    if (!isVerifying && !hasInitialized.current) {
      if (authState?.user && !reduxUser) {
        // Usuario válido encontrado, mantener en Redux
        console.log('🔧 AuthPersistence: Estableciendo usuario en Redux');
        dispatch(setUser(authState.user));
        hasInitialized.current = true;
      } else if (!authState?.isAuthenticated && reduxUser) {
        // No autenticado, limpiar Redux
        console.log('🔧 AuthPersistence: Limpiando usuario de Redux');
        dispatch(clearUser());
        hasInitialized.current = true;
      }
    }
  }, [isVerifying, authState?.user, authState?.isAuthenticated, reduxUser, dispatch]);

  // No renderiza nada, solo maneja persistencia
  return null;
};

export default AuthPersistence;
