'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  useGetAllDepositsQuery, 
  useUpdateDepositStatusMutation,
  Deposit,
  DepositStats
} from '@/store/api/adminDepositsApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
// Using simple input instead of SearchBar
import { Pagination } from './Pagination';

interface DepositsTableProps {
  onStatsChange: (stats: DepositStats) => void;
}

export const DepositsTable: React.FC<DepositsTableProps> = ({ onStatsChange }) => {
  const { showSuccess, showError, showConfirm } = useSweetAlert();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [viewingDeposit, setViewingDeposit] = useState<Deposit | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [editForm, setEditForm] = useState({
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    notes: '',
  });

  // Queries - obtener todos los depósitos para estadísticas
  const { 
    data: allDepositsData, 
    isLoading: isLoadingAll, 
    error: errorAll, 
    refetch: refetchAll 
  } = useGetAllDepositsQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
    username: searchTerm || undefined,
  });

  // Queries - obtener depósitos paginados para la tabla
  const { 
    data: depositsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetAllDepositsQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
    username: searchTerm || undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  });

  // Calcular estadísticas desde los datos de depósitos
  const depositStats = useMemo(() => {
    console.log('🔍 Calculando estadísticas - allDepositsData:', allDepositsData);
    
    if (!allDepositsData?.deposits) {
      console.log('⚠️ No hay datos de depósitos disponibles');
      return {
        totalDeposits: 0,
        pendingDeposits: 0,
        approvedDeposits: 0,
        rejectedDeposits: 0,
        totalAmount: 0,
      };
    }

    const deposits = allDepositsData.deposits;
    console.log('📊 Depósitos encontrados:', deposits.length);
    
    const totalDeposits = deposits.length;
    const pendingDeposits = deposits.filter(d => d.status === 'pending').length;
    const approvedDeposits = deposits.filter(d => d.status === 'approved').length;
    const rejectedDeposits = deposits.filter(d => d.status === 'rejected').length;
    const totalAmount = deposits.reduce((sum, d) => sum + Number(d.amount), 0);

    const stats = {
      totalDeposits,
      pendingDeposits,
      approvedDeposits,
      rejectedDeposits,
      totalAmount,
    };
    
    console.log('📈 Estadísticas calculadas:', stats);
    return stats;
  }, [allDepositsData?.deposits]);

  // Notificar cambios en estadísticas al componente padre
  useEffect(() => {
    onStatsChange(depositStats);
  }, [depositStats, onStatsChange]);
  
  const [updateDepositStatus] = useUpdateDepositStatusMutation();


  // Filtrar depósitos localmente para búsqueda
  const filteredDeposits = useMemo(() => {
    if (!depositsData?.deposits) return [];
    
    let filtered = depositsData.deposits;
    
    if (searchTerm) {
      filtered = filtered.filter(deposit => 
        deposit.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [depositsData?.deposits, searchTerm]);

  // Función para obtener el mensaje de error
  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      
      // Error de RTK Query
      if ('data' in errorObj && errorObj.data && typeof errorObj.data === 'object') {
        const data = errorObj.data as Record<string, unknown>;
        if ('error' in data && typeof data.error === 'string') {
          return data.error;
        }
        if ('message' in data && typeof data.message === 'string') {
          return data.message;
        }
      }
      
      // Error estándar
      if ('message' in errorObj && typeof errorObj.message === 'string') {
        return errorObj.message;
      }
    }
    return 'Error desconocido';
  };

  // Manejar actualización de estado
  const handleStatusUpdate = async (depositId: number) => {
    if (!editingDeposit) return;

    const result = await showConfirm(
      'Confirmar Cambio de Estado',
      `¿Estás seguro de que quieres cambiar el estado del depósito a "${editForm.status}"?`
    );

    if (result.isConfirmed) {
      try {
        const updateData = {
          status: editForm.status,
          processedBy: 'admin', // TODO: Obtener del usuario autenticado
          notes: editForm.notes || undefined,
        };

        console.log('🔄 Enviando actualización de depósito:', {
          depositId,
          updateData
        });

        const response = await updateDepositStatus({ id: depositId, data: updateData }).unwrap();
        
        console.log('✅ Respuesta del servidor:', response);
        
        await showSuccess(
          'Estado Actualizado',
          `El depósito ha sido ${editForm.status === 'approved' ? 'aprobado' : 'rechazado'} correctamente.`
        );
        
        setEditingDeposit(null);
        setEditForm({ status: 'pending', notes: '' });
        refetch();
        
      } catch (error: unknown) {
        console.error('❌ Error updating deposit status:', error);
        
        // Obtener más detalles del error
        let errorMessage = 'Error desconocido al actualizar el estado del depósito';
        
        if (error && typeof error === 'object') {
          const errorObj = error as Record<string, unknown>;
          
          console.log('🔍 Tipo de error:', typeof error);
          console.log('🔍 Error object keys:', Object.keys(errorObj));
          console.log('🔍 Error object values:', Object.values(errorObj));
          
          // Error de RTK Query
          if ('data' in errorObj && errorObj.data) {
            const data = errorObj.data as Record<string, unknown>;
            const serverMessage = data.error as string;
            
            // Detectar mensaje específico del backend
            if (serverMessage === 'Solo se pueden procesar depósitos pendientes') {
              errorMessage = 'Solo se pueden procesar depósitos pendientes';
            } else {
              errorMessage = serverMessage || 'Error del servidor';
            }
            
            console.error('📋 Error data:', data);
          }
          // Error estándar
          else if ('message' in errorObj) {
            errorMessage = errorObj.message as string;
          }
          // Error de red o HTTP
          else if ('status' in errorObj) {
            const status = errorObj.status as number;
            errorMessage = `Error HTTP ${status}: ${errorObj.statusText || 'Error de conexión'}`;
          }
          
          // Log completo del error para debugging
          console.error('🔍 Error completo:', JSON.stringify(errorObj, null, 2));
        }
        
        await showError('Solo se pueden actualizar los estados en estado pendiente', errorMessage);
      }
    }
  };

  // Manejar apertura del modal de edición
  const handleEdit = (deposit: Deposit) => {
    setEditingDeposit(deposit);
    setEditForm({
      status: deposit.status,
      notes: deposit.notes || '',
    });
  };

  // Manejar apertura del modal de visualización completa
  const handleViewAll = (deposit: Deposit) => {
    setViewingDeposit(deposit);
    // Inicializar el formulario con los datos del depósito
    setEditForm({
      status: deposit.status as 'pending' | 'approved' | 'rejected',
      notes: deposit.notes || '',
    });
  };

  // Manejar clic en miniatura del comprobante
  const handleReceiptClick = () => {
    setShowReceiptModal(true);
  };


  // Manejar guardado desde modal Ver Todo
  const handleSaveFromViewModal = async () => {
    if (!viewingDeposit) return;

    const result = await showConfirm(
      'Confirmar Cambio de Estado',
      `¿Estás seguro de que quieres cambiar el estado del depósito a "${editForm.status}"?`
    );

    if (result.isConfirmed) {
      try {
        console.log('🔄 Enviando actualización de depósito desde modal Ver Todo:', {
          depositId: viewingDeposit.id,
          updateData: editForm,
        });

        const updateData = {
          status: editForm.status,
          processedBy: 'admin', // Obtener del contexto de autenticación
          notes: editForm.notes,
        };

        const response = await updateDepositStatus({ 
          id: viewingDeposit.id, 
          data: updateData 
        }).unwrap();

        console.log('✅ Actualización exitosa desde modal Ver Todo:', response);

        await showSuccess(
          'Estado Actualizado',
          `El depósito ha sido ${editForm.status === 'approved' ? 'aprobado' : 'rechazado'} correctamente.`
        );

        // Actualizar el depósito en el modal actual
        if (viewingDeposit) {
          const updatedDeposit = {
            ...viewingDeposit,
            status: editForm.status,
            notes: editForm.notes,
            processedBy: 'admin',
            processedAt: new Date().toISOString(),
          };
          setViewingDeposit(updatedDeposit);
          
          // También actualizar en la lista de depósitos si está visible
          if (editingDeposit && editingDeposit.id === viewingDeposit.id) {
            setEditingDeposit(updatedDeposit);
          }
        }

        // Refetch datos para actualizar la tabla
        refetchAll();
        refetch();
        
      } catch (error: unknown) {
        console.error('❌ Error updating deposit status from view modal:', error);
        
        // Obtener más detalles del error
        let errorMessage = 'Error desconocido al actualizar el estado del depósito';
        
        if (error && typeof error === 'object') {
          const errorObj = error as Record<string, unknown>;
          
          console.log('🔍 Tipo de error:', typeof error);
          console.log('🔍 Error object keys:', Object.keys(errorObj));
          console.log('🔍 Error object values:', Object.values(errorObj));
          
          // Error de RTK Query
          if ('data' in errorObj && errorObj.data) {
            const data = errorObj.data as Record<string, unknown>;
            const serverMessage = data.error as string;
            
            // Detectar mensaje específico del backend
            if (serverMessage === 'Solo se pueden procesar depósitos pendientes') {
              errorMessage = 'Solo se pueden procesar depósitos pendientes';
            } else {
              errorMessage = serverMessage || 'Error del servidor';
            }
            
            console.error('📋 Error data:', data);
          }
          // Error estándar
          else if ('message' in errorObj) {
            errorMessage = errorObj.message as string;
          }
          // Error de red o HTTP
          else if ('status' in errorObj) {
            const status = errorObj.status as number;
            errorMessage = `Error HTTP ${status}: ${errorObj.statusText || 'Error de conexión'}`;
          }
          
          // Log completo del error para debugging
          console.error('🔍 Error completo:', JSON.stringify(errorObj, null, 2));
        }
        
        await showError('Solo se pueden actualizar los estados en estado pendiente', errorMessage);
      }
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formatear monto
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Obtener texto del estado en español
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      default: return 'Desconocido';
    }
  };

  if (isLoading) {
    return (
      <div className="deposits-loading">
        <div className="loading-spinner"></div>
        <p>Cargando depósitos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deposits-error">
        <p>Error al cargar los depósitos: {getErrorMessage(error)}</p>
        <button onClick={() => refetch()} className="btn-retry">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="deposits-table-container">
      {/* Filtros y búsqueda */}
      <div className="deposits-filters">
        <div className="search-input-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuario, nombre o referencia..."
            className="search-input"
          />
        </div>
        
        <div className="status-filter">
          <label htmlFor="status-select">Filtrar por estado:</label>
          <select
            id="status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
            className="status-select"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
          </select>
        </div>
        
        <div className="filter-stats">
          <span className="filter-count">
            {filteredDeposits.length} depósitos encontrados
          </span>
        </div>
      </div>

      {/* Tabla de depósitos */}
      <div className="deposits-table-wrapper">
        <table className="deposits-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Monto</th>
              <th>Referencia</th>
              <th>Banco</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Comprobante</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeposits.map((deposit) => (
              <tr key={deposit.id}>
                <td>{deposit.id}</td>
                <td>
                  <span className="username">{deposit.username}</span>
                </td>
                <td className="amount">{formatAmount(deposit.amount)}</td>
                <td className="reference">{deposit.reference}</td>
                <td className="bank">{deposit.bank}</td>
                <td>
                  <span className="user-name">
                    {deposit.fullName || 'N/A'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${deposit.status}`}>
                    {getStatusText(deposit.status)}
                  </span>
                </td>
                <td className="date">{formatDate(deposit.createdAt)}</td>
                <td>
                  <div className="receipt-thumbnail-container">
                    <img
                      src={deposit.receiptUrl}
                      alt="Comprobante"
                      className="receipt-thumbnail-small"
                      onClick={() => {
                        setViewingDeposit(deposit);
                        setShowReceiptModal(true);
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <a
                      href={deposit.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-view-receipt hidden"
                      title="Ver comprobante"
                    >
                      📄
                    </a>
                  </div>
                </td>
                <td className="actions">
                  <button
                    onClick={() => handleViewAll(deposit)}
                    className="btn-view-all"
                    title="Ver todos los detalles"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => handleEdit(deposit)}
                    className="btn-edit"
                    title="Editar estado"
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {depositsData && depositsData.deposits.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredDeposits.length / itemsPerPage)}
          onPageChange={setCurrentPage}
          totalItems={filteredDeposits.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Modal de edición */}
      {editingDeposit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Estado del Depósito #{editingDeposit.id}</h3>
              <button
                onClick={() => setEditingDeposit(null)}
                className="btn-close"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="status-select-modal">Estado:</label>
                <select
                  id="status-select-modal"
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ 
                    ...prev, 
                    status: e.target.value as 'pending' | 'approved' | 'rejected'
                  }))}
                  className="form-select"
                >
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobado</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notas (opcional):</label>
                <textarea
                  id="notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                  className="form-textarea"
                  rows={3}
                  placeholder="Agregar notas sobre el procesamiento del depósito..."
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setEditingDeposit(null)}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleStatusUpdate(editingDeposit.id)}
                className="btn-save"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualización completa */}
      {viewingDeposit && (
        <div className="modal-overlay">
          <div className="modal-content view-all-modal">
            <div className="modal-header">
              <h3>Detalles Completos del Depósito #{viewingDeposit.id}</h3>
              <button
                onClick={() => setViewingDeposit(null)}
                className="btn-close"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="deposit-details-grid">
                <div className="detail-group">
                  <h4>Información Básica</h4>
                  <div className="detail-item">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">{viewingDeposit.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Usuario:</span>
                    <span className="detail-value">{viewingDeposit.username}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Nombre Completo:</span>
                    <span className="detail-value">{viewingDeposit.fullName || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Monto:</span>
                    <span className="detail-value">{formatAmount(viewingDeposit.amount)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Referencia:</span>
                    <span className="detail-value">{viewingDeposit.reference}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Banco:</span>
                    <span className="detail-value">{viewingDeposit.bank}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Estado y Procesamiento</h4>
                  <div className="detail-item">
                    <span className="detail-label">Estado:</span>
                    <span className={`detail-value status-badge status-${viewingDeposit.status}`}>
                      {getStatusText(viewingDeposit.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Método de Pago:</span>
                    <span className="detail-value">{viewingDeposit.paymentMethod}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Procesado por:</span>
                    <span className="detail-value">{viewingDeposit.processedBy || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fecha de Procesamiento:</span>
                    <span className="detail-value">
                      {viewingDeposit.processedAt ? formatDate(viewingDeposit.processedAt) : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Notas:</span>
                    <span className="detail-value">{viewingDeposit.notes || 'Sin notas'}</span>
                  </div>
                </div>

                {viewingDeposit.paymentMethod === 'usdt' && (
                  <div className="detail-group">
                    <h4>Información USDT</h4>
                    <div className="detail-item">
                      <span className="detail-label">Monto USDT:</span>
                      <span className="detail-value">{viewingDeposit.usdtAmount || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tasa de Cambio:</span>
                      <span className="detail-value">{viewingDeposit.exchangeRate || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Dirección Wallet:</span>
                      <span className="detail-value">{viewingDeposit.walletAddress || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Hash de Transacción:</span>
                      <span className="detail-value">{viewingDeposit.transactionHash || 'N/A'}</span>
                    </div>
                  </div>
                )}

                <div className="detail-group">
                  <h4>Información del Comprobante</h4>
                  <div className="detail-item">
                    <span className="detail-label">Comprobante:</span>
                    <div className="receipt-preview">
                      <img 
                        src={viewingDeposit.receiptUrl} 
                        alt="Comprobante de depósito"
                        className="receipt-thumbnail"
                        onClick={handleReceiptClick}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <a 
                        href={viewingDeposit.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="detail-link hidden"
                      >
                        Ver Comprobante
                      </a>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Formato:</span>
                    <span className="detail-value">{viewingDeposit.receiptFormat}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tamaño:</span>
                    <span className="detail-value">{viewingDeposit.receiptBytes} bytes</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Fechas</h4>
                  <div className="detail-item">
                    <span className="detail-label">Fecha de Creación:</span>
                    <span className="detail-value">{formatDate(viewingDeposit.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Última Actualización:</span>
                    <span className="detail-value">{formatDate(viewingDeposit.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Edición - Siempre Visible */}
            <div className="modal-edit-section">
              <h4>Editar Estado del Depósito</h4>
              <div className="form-group">
                <label htmlFor="status-select-view-modal">Estado:</label>
                <select
                  id="status-select-view-modal"
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    status: e.target.value as 'pending' | 'approved' | 'rejected'
                  }))}
                  className="form-select"
                >
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobado</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="notes-textarea-view-modal">Notas:</label>
                <textarea
                  id="notes-textarea-view-modal"
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  className="form-textarea"
                  placeholder="Agregar notas sobre el procesamiento del depósito..."
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setViewingDeposit(null)}
                className="btn-cancel"
              >
                Cerrar
              </button>
              <button
                onClick={handleSaveFromViewModal}
                className="btn-save"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de imagen completa del comprobante */}
      {showReceiptModal && viewingDeposit && (
        <div className="receipt-modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={viewingDeposit.receiptUrl} 
              alt="Comprobante de depósito completo"
              className="receipt-modal-image"
            />
            <button 
              className="receipt-modal-close"
              onClick={() => setShowReceiptModal(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
