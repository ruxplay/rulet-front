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
    isLoading: isVerifying,
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
              
              // Debug: Verificar que el role esté llegando
              console.log('🔍 useAuth - Usuario recibido del backend:', data.user);
              console.log('🔍 useAuth - Role del usuario:', data.user.role);
              
              dispatch(setUser(userWithFallback));
            }
          }
        } catch {
          // Error silencioso en verificación
        }
      }
    };

    checkAuthOnLoad();
  }, [authState.isAuthenticated, authState.user, dispatch, isLoggingOut]); // Dependencias necesarias

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
      const normalizedUsername = validatedData.username.trim().toLowerCase();
      const isEmail = normalizedUsername.includes('@');

      const payload = isEmail
        ? { email: normalizedUsername, password: validatedData.password }
        : { username: normalizedUsername, password: validatedData.password };

      console.log('🔍 useAuth - Payload enviado al backend:', payload);

      const result = await login(payload).unwrap();

      
      // Soporte flexible según formato del backend
      const user = result.user;

      if (!user) throw new Error('Respuesta inesperada del servidor');
      
      // Verificar si el usuario está activo
      const isUserActive = user && typeof user === 'object' && 'isActive' in user 
        ? (user as Record<string, unknown>).isActive 
        : true; // Si no viene isActive, asumir que está activo
      
      console.log('🔍 useAuth LOGIN - Usuario recibido del backend:', user);
      console.log('🔍 useAuth LOGIN - isActive del usuario:', isUserActive);
      
      // Si el usuario está inactivo, mostrar error y no permitir login
      if (isUserActive === false) {
        dispatch(clearUser());
        setErrors({ general: 'Usuario inactivo - Tu cuenta ha sido desactivada' });
        return;
      }
      
      // Siempre usar username para consistencia
      const userWithConsistentName = {
        ...user,
        fullName: (user as { username?: string }).username // Siempre usar username
      };
      
      // Debug: Verificar que el role esté llegando en login
      console.log('🔍 useAuth LOGIN - Role del usuario:', user && typeof user === 'object' && 'role' in user ? (user as Record<string, unknown>).role : 'No disponible');
      
      dispatch(setUser(userWithConsistentName as unknown as { id: number; username: string; email: string; fullName: string; role?: 'user' | 'admin'; balance?: number | string }));

      setLoginData({ username: '', password: '' });

      // Redireccionar al dashboard
      router.push('/dashboard');
    } catch {
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
    
    // Cerrar sesión en backend y luego redirigir
    try {
      await logout(undefined).unwrap();
    } catch {
      // Error silencioso en logout backend; continuamos con la redirección
    } finally {
      // Asegurar limpieza de estado de API
      dispatch(authApi.util.resetApiState());
      // Redireccionar después de que el backend procese el logout
      router.push('/');
    }
    
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
