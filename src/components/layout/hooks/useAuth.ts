'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useLoginMutation,
  useVerifyAuthQuery,
  useLogoutMutation,
  authApi,
} from '@/store/api/authApi';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  setUser,
  clearUser,
  setError,
  clearError,
} from '@/store/slices/authSlice';
import { API_CONFIG } from '@/lib/api/config';
import { loginSchema } from '@/lib/validations/auth';

export const useAuth = () => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const router = useRouter();
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  
  const [login, { isLoading }] = useLoginMutation();
  const [logout] = useLogoutMutation();

  const shouldSkipVerify = false; // Habilitar verificación automática

  const {
    data: authData,
    isLoading: isVerifying,
    refetch: refetchAuth,
  } = useVerifyAuthQuery(undefined, {
    skip: shouldSkipVerify,
  });

  const isAuthenticated = !!authState.user && authState.isAuthenticated;

  // 🔄 Verificación manual solo al cargar la página
  useEffect(() => {
    const checkAuthOnLoad = async () => {
      // Solo verificar si no hay usuario en Redux y no está haciendo logout
      if (!authState.user && !isLoggingOut && !authState.isAuthenticated) {
        try {
          // Hacer petición directa al endpoint de verify
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}/verify`, {
            method: 'GET',
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.user) {
              // Siempre usar username para consistencia
              const userWithFallback = {
                ...data.user,
                fullName: data.user.username // Siempre usar username
              };
              
              dispatch(setUser(userWithFallback));
            }
          }
        } catch (error) {
          // Error silencioso en verificación
        }
      }
    };

    checkAuthOnLoad();
  }, []); // Solo ejecutar una vez al montar el componente

  // 🔑 LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    dispatch(clearError());
    setIsLoggingOut(false);
    dispatch(clearUser());

    try {
      // Validar con Zod
      const validatedData = loginSchema.parse(loginData);
      const isEmail = validatedData.username.includes('@');

      const payload = isEmail
        ? { email: validatedData.username, password: validatedData.password }
        : { username: validatedData.username, password: validatedData.password };

      const result = await login(payload).unwrap();

      
      // Soporte flexible según formato del backend
      const user = result.user || result?.data?.user || result;

      if (!user) throw new Error('Respuesta inesperada del servidor');
      
      // Siempre usar username para consistencia
      const userWithConsistentName = {
        ...user,
        fullName: user.username // Siempre usar username
      };
      
      dispatch(setUser(userWithConsistentName));

      setLoginData({ username: '', password: '' });

      // Redireccionar al dashboard
      router.push('/dashboard');
    } catch (error: any) {
      dispatch(clearUser());

      // Siempre mostrar solo "Credenciales inválidas" sin importar el tipo de error
      const message = 'Credenciales inválidas';
      dispatch(setError(message));
      setErrors({ general: message });
    }
  };

  // 🚪 LOGOUT
  const handleLogout = async () => {
    // Marcar como haciendo logout INMEDIATAMENTE
    setIsLoggingOut(true);
    
    // Limpiar estado de Redux INMEDIATAMENTE
    dispatch(clearUser());
    
    // Limpiar cookies manualmente INMEDIATAMENTE (más agresivo)
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;';
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;';
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=strict;';
    
    // Resetear API state
    dispatch(authApi.util.resetApiState());

    // Redireccionar inmediatamente
    router.push('/');
    
    // Llamar logout al backend (en background, sin await)
    logout(undefined).unwrap().catch(() => {
      // Error silencioso en logout
    });
    
    // NO resetear isLoggingOut - se mantiene hasta recargar la página
  };

  return {
    // Estado
    loginData,
    setLoginData,
    errors,
    isAuthenticated,
    isLoading,
    isVerifying,
    authState,
    
    // Funciones
    handleLogin,
    handleLogout,
  };
};
