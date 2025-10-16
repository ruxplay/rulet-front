'use client';

import { useAuth } from '@/components/layout/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CenteredLoading } from '@/components/ui/CenteredLoading';

interface ProtectedPageProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedPage: React.FC<ProtectedPageProps> = ({
  children,
  redirectTo = '/',
  fallback = <CenteredLoading message="Verificando acceso..." />,
  allowedRoles = [] // Array vacío por defecto (permite todos los roles)
}) => {
  const router = useRouter();
  const { isAuthenticated, isVerifying, authState } = useAuth();
  const user = authState.user;

  useEffect(() => {
    // Solo redirigir si ya terminó de verificar y no está autenticado
    if (!isVerifying && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isVerifying, isAuthenticated, router, redirectTo]);

  // Verificar roles: si no se especifican roles, permite todos
  const hasPermission = allowedRoles.length === 0 || 
    (user && user.role && allowedRoles.includes(user.role));

  // Mostrar loading mientras se verifica la autenticación
  if (isVerifying) {
    return <>{fallback}</>;
  }

  // Si no está autenticado o no tiene permisos, no renderizar nada (ya se redirigió)
  if (!isAuthenticated || !hasPermission) {
    return null;
  }

  // Si está autenticado y tiene permisos, renderizar el contenido protegido
  return <>{children}</>;
};

export default ProtectedPage;
