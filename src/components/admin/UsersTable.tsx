'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useGetAllUsersQuery, useUpdateUserMutation, useDeleteUserMutation, useReactivateUserMutation, User } from '@/store/api/usersApi';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { CenteredLoading } from '@/components/ui/CenteredLoading';
import { Pagination } from './Pagination';
import { SearchBar } from './SearchBar';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import '@/styles/components/users-table.css';
import '@/styles/components/pagination.css';
import '@/styles/components/search-bar.css';
import '@/styles/components/sweetalert.css';

interface UsersTableProps {
  onStatsChange?: (stats: { 
    totalUsers: number; 
    activeUsers: number; 
    inactiveUsers: number; 
    adminUsers: number; 
    normalUsers: number; 
  }) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ onStatsChange }) => {
  const { isAuthenticated, isVerifying, authState } = useAuth();
  const { data, error, isLoading, refetch } = useGetAllUsersQuery(undefined, {
    skip: !isAuthenticated || isVerifying, // Solo hacer query si está autenticado y no está verificando
  });
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [reactivateUser] = useReactivateUserMutation();
  const { showSuccess, showError, showWarning, showConfirm } = useSweetAlert();
  
  // Helper function para determinar si un usuario está activo
  const isUserActive = (user: User): boolean => {
    // Si el backend no devuelve isActive, asumir que está activo
    // Solo considerar inactivo si explícitamente isActive es false
    return user.isActive !== false;
  };

  // Helper function para manejar errores de forma segura
  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      
      // Manejar errores específicos de RTK Query
      if (errorObj.error === 'PARSING_ERROR') {
        return 'Error de formato: El servidor no devolvió datos válidos. Verifica que el backend esté funcionando correctamente.';
      }
      if (errorObj.status === 'FETCH_ERROR') {
        return 'Error de conexión: No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      }
      if (errorObj.status === 'TIMEOUT_ERROR') {
        return 'Error de tiempo: La solicitud tardó demasiado. Inténtalo de nuevo.';
      }
      
      // Verificar si es un error de API con estructura { data: { error: string } }
      if ('data' in errorObj && errorObj.data && typeof errorObj.data === 'object') {
        const dataObj = errorObj.data as Record<string, unknown>;
        if ('error' in dataObj && typeof dataObj.error === 'string') {
          return dataObj.error;
        }
      }
      
      // Verificar si es un error estándar con { message: string }
      if ('message' in errorObj && typeof errorObj.message === 'string') {
        return errorObj.message;
      }
      
      // Manejar errores de estado HTTP
      if ('status' in errorObj && typeof errorObj.status === 'number') {
        const statusText = typeof errorObj.statusText === 'string' ? errorObj.statusText : 'Error del servidor';
        return `Error ${errorObj.status}: ${statusText}`;
      }
      
      // Manejar errores con originalStatus
      if ('originalStatus' in errorObj && typeof errorObj.originalStatus === 'number') {
        const data = typeof errorObj.data === 'string' ? errorObj.data : 'Error del servidor';
        return `Error ${errorObj.originalStatus}: ${data}`;
      }
    }
    return 'Error desconocido';
  };
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'username' | 'email' | 'role'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filtrar usuarios basado en la búsqueda y estado
  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    
    console.log('🔍 ===== INICIANDO FILTRADO DE USUARIOS =====');
    console.log('🔍 Total usuarios recibidos:', data.users.length);
    console.log('🔍 Filtro de estado actual:', userStatusFilter);
    console.log('🔍 Término de búsqueda:', searchTerm);
    console.log('🔍 Tipo de búsqueda:', searchType);
    
    console.log('🔍 ===== ANÁLISIS DE ESTADOS isActive =====');
    console.log('🔍 Usuarios con isActive === true:', data.users.filter(u => u.isActive === true).length);
    console.log('🔍 Usuarios con isActive === false:', data.users.filter(u => u.isActive === false).length);
    console.log('🔍 Usuarios con isActive === undefined:', data.users.filter(u => u.isActive === undefined).length);
    console.log('🔍 Usuarios con isActive === null:', data.users.filter(u => u.isActive === null).length);
    
    console.log('🔍 ===== ANÁLISIS CON FUNCIÓN HELPER =====');
    console.log('🔍 Usuarios considerados activos:', data.users.filter(u => isUserActive(u)).length);
    console.log('🔍 Usuarios considerados inactivos:', data.users.filter(u => !isUserActive(u)).length);
    
    let filtered = data.users;
    
    // Filtrar por estado de usuario (activo/inactivo)
    if (userStatusFilter !== 'all') {
      console.log('🔍 Aplicando filtro de estado:', userStatusFilter);
      filtered = filtered.filter((user) => {
        const isActive = isUserActive(user);
        console.log(`🔍 Usuario ${user.username}: isActive=${user.isActive}, considerado activo=${isActive}`);
        if (userStatusFilter === 'active') return isActive;
        if (userStatusFilter === 'inactive') return !isActive;
        return true;
      });
      console.log('🔍 Usuarios después del filtro de estado:', filtered.length);
    }
    
    // Si no hay término de búsqueda y el tipo es "all", mostrar todos los filtrados
    if (!searchTerm.trim() && searchType === 'all') {
      console.log('🔍 Sin búsqueda, devolviendo todos los filtrados:', filtered.length);
      return filtered;
    }
    
    // Si no hay término de búsqueda pero el tipo no es "all", no mostrar nada
    if (!searchTerm.trim()) {
      console.log('🔍 Sin término de búsqueda pero tipo no es all, devolviendo array vacío');
      return [];
    }

    const term = searchTerm.toLowerCase();
    
    const searchFiltered = filtered.filter((user) => {
      switch (searchType) {
        case 'username':
          return user.username.toLowerCase().includes(term);
        case 'email':
          return user.email.toLowerCase().includes(term);
        case 'role':
          return user.role?.toLowerCase().includes(term) || false;
        case 'all':
        default:
          return (
            user.username.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.fullName?.toLowerCase().includes(term) ||
            user.role?.toLowerCase().includes(term) ||
            false
          );
      }
    });
    
    console.log('🔍 Usuarios después del filtro de búsqueda:', searchFiltered.length);
    console.log('🔍 ===== RESULTADO FINAL DEL FILTRADO =====');
    console.log('🔍 Usuarios que se mostrarán en la tabla:', searchFiltered.length);
    console.log('🔍 Lista de usuarios filtrados:', searchFiltered.map(u => ({
      username: u.username,
      isActive: u.isActive,
      isConsideredActive: isUserActive(u)
    })));
    return searchFiltered;
  }, [data?.users, searchTerm, searchType, userStatusFilter]);

  // Calcular usuarios paginados basados en los filtrados
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredUsers.length / itemsPerPage);
  }, [filteredUsers.length, itemsPerPage]);

  // Pasar estadísticas al componente padre
  useEffect(() => {
    if (data?.users && onStatsChange) {
      console.log('📋 ===== DATOS COMPLETOS DEL BACKEND =====');
      console.log('📋 Total usuarios recibidos:', data.users.length);
      console.log('📋 Respuesta completa del backend:', data);
      
      console.log('📋 ===== ANÁLISIS DETALLADO DE USUARIOS =====');
      data.users.forEach((user, index) => {
        console.log(`📋 Usuario ${index + 1}:`, {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
          isActiveType: typeof user.isActive,
          hasIsActiveField: 'isActive' in user,
          allFields: Object.keys(user),
          isConsideredActive: isUserActive(user)
        });
      });
      
      console.log('📋 ===== RESUMEN DE ESTADOS =====');
      console.log('📋 Usuarios con isActive === true:', data.users.filter(u => u.isActive === true).length);
      console.log('📋 Usuarios con isActive === false:', data.users.filter(u => u.isActive === false).length);
      console.log('📋 Usuarios con isActive === undefined:', data.users.filter(u => u.isActive === undefined).length);
      console.log('📋 Usuarios con isActive === null:', data.users.filter(u => u.isActive === null).length);
      console.log('📋 Usuarios considerados activos por función:', data.users.filter(u => isUserActive(u)).length);
      console.log('📋 Usuarios considerados inactivos por función:', data.users.filter(u => !isUserActive(u)).length);
      
      const stats = {
        totalUsers: data.users.length,
        activeUsers: data.users.filter(u => isUserActive(u)).length,
        inactiveUsers: data.users.filter(u => !isUserActive(u)).length,
        adminUsers: data.users.filter(u => u.role === 'admin').length,
        normalUsers: data.users.filter(u => u.role === 'user').length,
      };
      
      console.log('📋 ===== ESTADÍSTICAS FINALES =====');
      console.log('📋 Stats que se envían al componente padre:', stats);
      
      onStatsChange(stats);
    }
  }, [data?.users, onStatsChange]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      balance: user.balance,
      wins: user.wins,
      losses: user.losses,
      role: user.role,
    });
  };

  const handleTestConnection = async () => {
    try {
      console.log('Probando conexión con el backend...');
      
      // Hacer una petición simple para probar la conexión
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        await showError('Error de formato', `El servidor devolvió ${contentType} en lugar de JSON. Respuesta: ${text.substring(0, 200)}...`);
        return;
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      await showSuccess('Conexión exitosa', 'El backend está funcionando correctamente');
      
    } catch (error: unknown) {
      console.error('Error testing connection:', error);
      const errorMessage = getErrorMessage(error);
      await showError('Error de conexión', errorMessage);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      await showSuccess('Datos actualizados', 'La lista de usuarios se ha refrescado correctamente');
    } catch (error) {
      console.error('Error refreshing data:', error);
      await showError('Error al refrescar', 'No se pudieron actualizar los datos');
    }
  };

  const handleSave = async () => {
    if (!editingUser) return;
    
    setIsUpdating(true);
    
    try {
      // Validar datos antes de enviar
      if (!editForm.username?.trim()) {
        await showWarning('Campo requerido', 'El nombre de usuario es requerido');
        return;
      }
      
      if (!editForm.email?.trim()) {
        await showWarning('Campo requerido', 'El email es requerido');
        return;
      }
      
      if (!editForm.fullName?.trim()) {
        await showWarning('Campo requerido', 'El nombre completo es requerido');
        return;
      }
      
      console.log('🔵 INICIANDO ACTUALIZACIÓN DE USUARIO');
      console.log('🔵 ID del usuario:', editingUser.id);
      console.log('🔵 Datos que se van a enviar:', editForm);
      console.log('🔵 Estructura completa del request:', {
        id: editingUser.id,
        data: { user: editForm }
      });
      
      // Verificar que el usuario esté autenticado
      if (!isAuthenticated) {
        await showError('Error de autenticación', 'Debes estar autenticado para actualizar usuarios');
        return;
      }
      
      console.log('🟡 ENVIANDO REQUEST AL SERVIDOR...');
      const result = await updateUser({
        id: editingUser.id,
        data: {
          ...editForm,
          phone: editForm.phone || undefined // Convertir null a undefined
        }
      }).unwrap();
      
      console.log('🟢 RESPUESTA DEL SERVIDOR RECIBIDA:');
      console.log('🟢 Resultado completo:', result);
      console.log('🟢 Usuario actualizado:', result.user);
      console.log('🟢 Datos que se enviaron:', editForm);
      console.log('🟢 Comparación de roles:');
      console.log('   - Rol enviado:', editForm.role);
      console.log('   - Rol devuelto:', result.user.role);
      console.log('   - ¿Son iguales?:', editForm.role === result.user.role);
      
      // Forzar refresco de datos después de la actualización
      console.log('🔄 REFRESCANDO DATOS DESPUÉS DE LA ACTUALIZACIÓN...');
      await refetch();
      console.log('✅ REFRESCO COMPLETADO');
      
      setEditingUser(null);
      setEditForm({});
      
      // Mostrar mensaje de éxito
      await showSuccess('¡Usuario actualizado!', 'Los cambios se han guardado correctamente');
      
      // Log adicional para verificar el estado
      console.log('📊 ESTADO DESPUÉS DE LA ACTUALIZACIÓN:');
      console.log('📊 editingUser:', editingUser);
      console.log('📊 editForm:', editForm);
      
    } catch (error: unknown) {
      console.log('🔴 ERROR EN LA ACTUALIZACIÓN:');
      console.log('🔴 Error completo:', error);
      console.log('🔴 Tipo de error:', typeof error);
      console.log('🔴 Detalles del error:', {
        status: error && typeof error === 'object' && 'status' in error ? (error as Record<string, unknown>).status : undefined,
        statusText: error && typeof error === 'object' && 'statusText' in error ? (error as Record<string, unknown>).statusText : undefined,
        data: error && typeof error === 'object' && 'data' in error ? (error as Record<string, unknown>).data : undefined,
        message: error && typeof error === 'object' && 'message' in error ? (error as Record<string, unknown>).message : undefined,
        originalStatus: error && typeof error === 'object' && 'originalStatus' in error ? (error as Record<string, unknown>).originalStatus : undefined,
        error: error && typeof error === 'object' && 'error' in error ? (error as Record<string, unknown>).error : undefined
      });
      console.log('🔴 Stack trace:', error && typeof error === 'object' && 'stack' in error ? (error as Record<string, unknown>).stack : undefined);
      
      const errorMessage = getErrorMessage(error);
      console.log('🔴 Mensaje de error final:', errorMessage);
      await showError('Error al actualizar', errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReactivate = async (userId: number) => {
    const result = await showConfirm(
      '¿Reactivar usuario?',
      'Esta acción reactivará el usuario y podrá iniciar sesión nuevamente. ¿Estás seguro de que quieres reactivar este usuario?'
    );
    
    if (result.isConfirmed) {
      try {
        console.log('🔄 INICIANDO REACTIVACIÓN DE USUARIO');
        console.log('🔄 ID del usuario:', userId);
        
        // Verificar que el usuario esté autenticado
        if (!isAuthenticated) {
          await showError('Error de autenticación', 'Debes estar autenticado para reactivar usuarios');
          return;
        }
        
        console.log('🟡 ENVIANDO REQUEST DE REACTIVACIÓN AL SERVIDOR...');
        const result = await reactivateUser(userId).unwrap();
        
        console.log('🟢 RESPUESTA DEL SERVIDOR RECIBIDA:');
        console.log('🟢 Resultado completo:', result);
        console.log('🟢 Usuario reactivado:', result.user);
        
        // Forzar refresco de datos después de la reactivación
        console.log('🔄 REFRESCANDO DATOS DESPUÉS DE LA REACTIVACIÓN...');
        await refetch();
        console.log('✅ REFRESCO COMPLETADO');
        
        // Mostrar mensaje de éxito
        await showSuccess('¡Usuario reactivado!', 'El usuario ha sido reactivado correctamente y puede iniciar sesión nuevamente.');
        
      } catch (error: unknown) {
        console.log('🔴 ERROR EN LA REACTIVACIÓN:');
        console.log('🔴 Error completo:', error);
        const errorMessage = getErrorMessage(error);
        console.log('🔴 Mensaje de error final:', errorMessage);
        await showError('Error al reactivar usuario', errorMessage);
      }
    }
  };

  const handleDelete = async (userId: number) => {
    const result = await showConfirm(
      '¿Eliminar usuario?',
      'Esta acción realizará una eliminación lógica del usuario. El usuario no podrá iniciar sesión pero se conservará toda su información para auditoría. ¿Estás seguro de que quieres eliminar este usuario?'
    );
    
    if (result.isConfirmed) {
      try {
        console.log('🗑️ INICIANDO ELIMINACIÓN DE USUARIO');
        console.log('🗑️ ID del usuario:', userId);
        
        // Verificar que el usuario esté autenticado
        if (!isAuthenticated) {
          await showError('Error de autenticación', 'Debes estar autenticado para eliminar usuarios');
          return;
        }
        
        console.log('🟡 ENVIANDO REQUEST DE ELIMINACIÓN AL SERVIDOR...');
        const result = await deleteUser(userId).unwrap();
        
        console.log('🟢 RESPUESTA DEL SERVIDOR RECIBIDA:');
        console.log('🟢 Resultado completo:', result);
        console.log('🟢 Mensaje:', result.message);
        
        // Si eliminamos el último usuario de la página actual, ir a la página anterior
        if (paginatedUsers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        
        // Forzar refresco de datos después de la eliminación
        console.log('🔄 REFRESCANDO DATOS DESPUÉS DE LA ELIMINACIÓN...');
        await refetch();
        console.log('✅ REFRESCO COMPLETADO');
        
        // Mostrar mensaje de éxito
        await showSuccess('¡Usuario eliminado!', 'El usuario ha sido eliminado correctamente. Se realizó una eliminación lógica, conservando toda la información para auditoría.');
        
      } catch (error: unknown) {
        console.log('🔴 ERROR EN LA ELIMINACIÓN:');
        console.log('🔴 Error completo:', error);
        console.log('🔴 Tipo de error:', typeof error);
        console.log('🔴 Detalles del error:', {
          status: error && typeof error === 'object' && 'status' in error ? (error as Record<string, unknown>).status : undefined,
          statusText: error && typeof error === 'object' && 'statusText' in error ? (error as Record<string, unknown>).statusText : undefined,
          data: error && typeof error === 'object' && 'data' in error ? (error as Record<string, unknown>).data : undefined,
          message: error && typeof error === 'object' && 'message' in error ? (error as Record<string, unknown>).message : undefined,
          originalStatus: error && typeof error === 'object' && 'originalStatus' in error ? (error as Record<string, unknown>).originalStatus : undefined,
          error: error && typeof error === 'object' && 'error' in error ? (error as Record<string, unknown>).error : undefined
        });
        
        const errorMessage = getErrorMessage(error);
        console.log('🔴 Mensaje de error final:', errorMessage);
        await showError('Error al eliminar usuario', errorMessage);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll hacia arriba de la tabla
    const tableContainer = document.querySelector('.users-table-container');
    if (tableContainer) {
      tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSearch = (term: string, type: 'all' | 'username' | 'email' | 'role') => {
    setSearchTerm(term);
    setSearchType(type);
    setCurrentPage(1); // Reset a la primera página al buscar
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchType('all');
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toLocaleString('es-ES', {
      style: 'currency',
      currency: 'RUB',
    });
  };

  if (isVerifying) {
    return <CenteredLoading message="Verificando autenticación..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-error">
        <h3>Acceso denegado</h3>
        <p>Debes estar autenticado como administrador para acceder a esta página.</p>
      </div>
    );
  }

  // Verificar si el usuario es admin
  if (authState.user?.role !== 'admin') {
    return (
      <div className="admin-error">
        <h3>Permisos insuficientes</h3>
        <p>Esta página solo está disponible para administradores.</p>
        <p>Tu rol actual: <strong>{authState.user?.role || 'No definido'}</strong></p>
      </div>
    );
  }

  if (isLoading) {
    return <CenteredLoading message="Cargando usuarios..." />;
  }

  if (error) {
    console.error('Error loading users:', error);
        return (
          <div className="admin-error">
            <h3>Error al cargar usuarios</h3>
            <p>No se pudieron cargar los usuarios. Inténtalo de nuevo.</p>
            <details style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
              <summary>Detalles del error</summary>
              <pre style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f1f5f9', borderRadius: '0.25rem', overflow: 'auto' }}>
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Recargar página
              </button>
              <button
                onClick={handleTestConnection}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Probar conexión
              </button>
              <button
                onClick={handleRefresh}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                🔄 Refrescar datos
              </button>
            </div>
          </div>
        );
  }

  return (
    <div className="users-table-container">
      {/* Filtros de estado */}
      <div className="user-filters">
        <div className="status-filter">
          <label htmlFor="status-filter">Estado:</label>
          <select
            id="status-filter"
            value={userStatusFilter}
            onChange={(e) => {
              setUserStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
              setCurrentPage(1);
            }}
            className="status-select"
          >
            <option value="all">Todos los usuarios</option>
            <option value="active">Solo activos</option>
            <option value="inactive">Solo eliminados</option>
          </select>
        </div>
        <div className="filter-stats">
          <span className="filter-count">
            Mostrando {filteredUsers.length} de {data?.users?.length || 0} usuarios
          </span>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <SearchBar
        onSearch={handleSearch}
        onClear={handleClearSearch}
        totalResults={filteredUsers.length}
      />

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Nombre</th>
              <th>Saldo</th>
              <th>Ganancias</th>
              <th>Rol</th>
              <th>Último Login</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr 
                key={user.id} 
                className={`${editingUser?.id === user.id ? 'editing' : ''} ${!isUserActive(user) ? 'user-inactive' : ''}`}
              >
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      value={editForm.username || ''}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    <div className="username-cell">
                      <span className="username">{user.username}</span>
                      {!isUserActive(user) && (
                        <span className="status-badge" title="Usuario eliminado">
                          Eliminado
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    <span className="email">{user.email}</span>
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      value={editForm.fullName || ''}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    <span className="full-name">{user.fullName}</span>
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.balance || ''}
                      onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    <span className="balance">{formatBalance(user.balance)}</span>
                  )}
                </td>
                <td>
                  <div className="wins-losses">
                    <span className="wins">+{user.wins}</span>
                    <span className="losses">-{user.losses}</span>
                  </div>
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <select
                      value={editForm.role || 'user'}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'user' | 'admin' })}
                      className="edit-select"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Admin</option>
                    </select>
                         ) : (
                           <span className={`role role-${user.role}`}>
                             <span className="role-emoji">{user.role === 'admin' ? '👑' : '👤'}</span>
                             <span className="role-text">{user.role === 'admin' ? 'Admin' : 'Usuario'}</span>
                           </span>
                         )}
                </td>
                <td>
                  <span className="last-login">
                    {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    {editingUser?.id === user.id ? (
                      <>
                               <button
                                 onClick={handleSave}
                                 className="btn-save"
                                 title="Guardar cambios"
                                 disabled={isUpdating}
                                 style={{
                                   opacity: isUpdating ? 0.6 : 1,
                                   cursor: isUpdating ? 'not-allowed' : 'pointer'
                                 }}
                               >
                                 {isUpdating ? '⏳' : '✅'}
                               </button>
                        <button
                          onClick={() => {
                            setEditingUser(null);
                            setEditForm({});
                          }}
                          className="btn-cancel"
                          title="Cancelar"
                        >
                          ❌
                        </button>
                      </>
                    ) : !isUserActive(user) ? (
                      <div className="inactive-actions">
                        <button
                          onClick={() => handleReactivate(user.id)}
                          className="btn-reactivate"
                          title="Reactivar usuario"
                        >
                          🔄
                        </button>
                        <span className="inactive-info" title="Usuario eliminado - Solo lectura">
                          Eliminado
                        </span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(user)}
                          className="btn-edit"
                          title="Editar usuario"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="btn-delete"
                          title="Eliminar usuario"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {filteredUsers.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
};
