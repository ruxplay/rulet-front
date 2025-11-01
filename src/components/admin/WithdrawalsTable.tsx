'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useGetAllWithdrawalsQuery, useUpdateWithdrawalStatusMutation, type WithdrawalWithUser } from '@/store/api/adminWithdrawalsApi';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { Pagination } from './Pagination';
import '@/styles/components/pagination.css';

interface WithdrawalsTableProps {
  onStatsChange: (stats: WithdrawalStats) => void;
}

interface WithdrawalStats {
  totalWithdrawals: number;
  pendingWithdrawals: number;
  approvedWithdrawals: number;
  rejectedWithdrawals: number;
  totalAmount: number;
  totalWithdrawalAmount: number;
}

export const WithdrawalsTable: React.FC<WithdrawalsTableProps> = ({ onStatsChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [viewingWithdrawal, setViewingWithdrawal] = useState<WithdrawalWithUser | null>(null);
  const [editingWithdrawal, setEditingWithdrawal] = useState<WithdrawalWithUser | null>(null);
  const [editForm, setEditForm] = useState({
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    notes: '',
  });

  const itemsPerPage = 10;

  // Queries
  const { 
    data: allWithdrawalsData, 
    isLoading: isLoadingAll, 
    refetch: refetchAll 
  } = useGetAllWithdrawalsQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
    username: searchTerm || undefined,
  });

  const { 
    data: withdrawalsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetAllWithdrawalsQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  });

  const [updateWithdrawalStatus] = useUpdateWithdrawalStatusMutation();

  const { showSuccess, showError, showConfirm } = useSweetAlert();

  // Calculate stats
  const withdrawalStats = useMemo(() => {
    if (!allWithdrawalsData?.withdrawals) {
      return {
        totalWithdrawals: 0,
        pendingWithdrawals: 0,
        approvedWithdrawals: 0,
        rejectedWithdrawals: 0,
        totalAmount: 0,
        totalWithdrawalAmount: 0,
      };
    }

    const withdrawals = allWithdrawalsData.withdrawals;
    
    return {
      totalWithdrawals: withdrawals.length,
      pendingWithdrawals: withdrawals.filter((w: WithdrawalWithUser) => w.status === 'pending').length,
      approvedWithdrawals: withdrawals.filter((w: WithdrawalWithUser) => w.status === 'approved').length,
      rejectedWithdrawals: withdrawals.filter((w: WithdrawalWithUser) => w.status === 'rejected').length,
      totalAmount: withdrawals.reduce((sum: number, w: WithdrawalWithUser) => sum + Number(w.monto), 0),
      totalWithdrawalAmount: withdrawals.reduce((sum: number, w: WithdrawalWithUser) => sum + Number(w.monto), 0),
    };
  }, [allWithdrawalsData?.withdrawals]);

  useEffect(() => {
    onStatsChange(withdrawalStats);
  }, [withdrawalStats, onStatsChange]);

  // Filter
  const filteredWithdrawals = useMemo(() => {
    if (!withdrawalsData?.withdrawals) return [];
    
    let filtered = withdrawalsData.withdrawals;
    
    if (searchTerm) {
      filtered = filtered.filter((withdrawal: WithdrawalWithUser) => 
        withdrawal.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.cedula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.telefono?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [withdrawalsData?.withdrawals, searchTerm]);

  const handleStatusUpdate = async (withdrawalId: number) => {
    // Validar que el estado no sea 'pending' (solo se pueden aprobar o rechazar)
    if (editForm.status === 'pending') {
      await showError('Error', 'Solo se pueden aprobar o rechazar retiros. No puedes mantener el estado como pendiente.');
      return;
    }

    const result = await showConfirm(
      'Confirmar Cambio de Estado',
      `¿Estás seguro de que quieres ${editForm.status === 'approved' ? 'aprobar' : 'rechazar'} este retiro?`
    );

    if (result.isConfirmed) {
      try {
        const updateData = {
          status: editForm.status as 'approved' | 'rejected',
          processedBy: 'admin',
          notes: editForm.notes || undefined,
        };

        await updateWithdrawalStatus({ id: withdrawalId, data: updateData }).unwrap();
        
        await showSuccess(
          'Estado Actualizado',
          `El retiro ha sido ${editForm.status === 'approved' ? 'aprobado' : 'rechazado'} correctamente.`
        );
        
        setEditingWithdrawal(null);
        setViewingWithdrawal(null);
        setEditForm({ status: 'pending', notes: '' });
        refetch();
        
      } catch (error: unknown) {
        await showError('Error al actualizar el estado', String(error));
      }
    }
  };

  const handleEdit = (withdrawal: WithdrawalWithUser) => {
    setEditingWithdrawal(withdrawal);
    setEditForm({
      status: withdrawal.status,
      notes: withdrawal.notes || '',
    });
  };

  const handleViewAll = (withdrawal: WithdrawalWithUser) => {
    setViewingWithdrawal(withdrawal);
    setEditForm({
      status: withdrawal.status as 'pending' | 'approved' | 'rejected',
      notes: withdrawal.notes || '',
    });
  };

  const formatAmount = (monto: number): string => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'RUX',
      minimumFractionDigits: 2,
    }).format(monto);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
    };
    return statusMap[status] || status;
  };

  if (isLoading) {
    return <div className="loading">Cargando retiros...</div>;
  }

  if (error) {
    return <div className="error">Error al cargar los retiros</div>;
  }

  return (
    <div className="withdrawals-table-container">
      <div className="table-header">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por usuario, nombre, cédula o teléfono..."
          className="search-input"
        />
        <div className="table-actions">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
            className="filter-select"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
          </select>
          <span className="results-count">
            {filteredWithdrawals.length} retiros encontrados
          </span>
        </div>
      </div>

      <div className="withdrawals-table-wrapper">
        <table className="withdrawals-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Monto</th>
              <th>Banco</th>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredWithdrawals.map((withdrawal: WithdrawalWithUser) => (
              <tr key={withdrawal.id}>
                <td>{withdrawal.id}</td>
                <td><span className="username">{withdrawal.username}</span></td>
                <td className="amount">{formatAmount(withdrawal.monto)}</td>
                <td className="bank">{withdrawal.banco}</td>
                <td><span className="user-name">{withdrawal.user?.fullName || 'N/A'}</span></td>
                <td>{withdrawal.cedula}</td>
                <td>{withdrawal.telefono}</td>
                <td>
                  <span className={`status-badge status-${withdrawal.status}`}>
                    {getStatusText(withdrawal.status)}
                  </span>
                </td>
                <td className="date">{formatDate(withdrawal.createdAt)}</td>
                <td className="actions">
                  <button onClick={() => handleViewAll(withdrawal)} className="btn-view-all" title="Ver todos los detalles">
                    👁️
                  </button>
                  <button onClick={() => handleEdit(withdrawal)} className="btn-edit" title="Editar estado">
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil((withdrawalsData?.withdrawals?.length || 0) / itemsPerPage)}
        onPageChange={setCurrentPage}
        totalItems={withdrawalsData?.withdrawals?.length || 0}
        itemsPerPage={itemsPerPage}
      />

      {/* View Modal */}
      {viewingWithdrawal && (
        <div className="modal-overlay" onClick={() => setViewingWithdrawal(null)}>
          <div className="modal-content view-all-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles Completos del Retiro #{viewingWithdrawal.id}</h3>
              <button className="btn-close" onClick={() => setViewingWithdrawal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="deposit-details-grid">
                <div className="detail-group">
                  <h4>Información del Usuario</h4>
                  <div className="detail-item">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value detail-id">{viewingWithdrawal.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Usuario:</span>
                    <span className="detail-value">{viewingWithdrawal.username}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Nombre Completo:</span>
                    <span className="detail-value">{viewingWithdrawal.user?.fullName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Monto:</span>
                    <span className="detail-value">{formatAmount(viewingWithdrawal.monto)}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Información de Contacto y Pago</h4>
                  <div className="detail-item">
                    <span className="detail-label">Cédula:</span>
                    <span className="detail-value">{viewingWithdrawal.cedula}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Teléfono:</span>
                    <span className="detail-value">{viewingWithdrawal.telefono}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Banco:</span>
                    <span className="detail-value">{viewingWithdrawal.banco}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Método de Pago:</span>
                    <span className="detail-value">{viewingWithdrawal.payment_method}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Estado y Procesamiento</h4>
                  <div className="detail-item">
                    <span className="detail-label">Estado:</span>
                    <span className={`detail-value status-badge status-${viewingWithdrawal.status}`}>
                      {getStatusText(viewingWithdrawal.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Procesado por:</span>
                    <span className="detail-value">{viewingWithdrawal.processedBy || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fecha de Procesamiento:</span>
                    <span className="detail-value">
                      {viewingWithdrawal.processedAt ? formatDate(viewingWithdrawal.processedAt) : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Notas:</span>
                    <span className="detail-value">{viewingWithdrawal.notes || 'Sin notas'}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Fechas</h4>
                  <div className="detail-item">
                    <span className="detail-label">Fecha de Creación:</span>
                    <span className="detail-value">{formatDate(viewingWithdrawal.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Última Actualización:</span>
                    <span className="detail-value">{formatDate(viewingWithdrawal.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-group">
                <h4>Editar Estado del Retiro</h4>
                <div className="form-group">
                  <label htmlFor="edit-status">Estado:</label>
                  <select
                    id="edit-status"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'pending' | 'approved' | 'rejected' })}
                    className="form-select"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="approved">Aprobado</option>
                    <option value="rejected">Rechazado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-notes">Notas:</label>
                  <textarea
                    id="edit-notes"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Agregar notas sobre el procesamiento del retiro..."
                    rows={3}
                    className="form-textarea"
                  />
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" onClick={() => setViewingWithdrawal(null)}>
                    Cancelar
                  </button>
                  <button 
                    className="btn-save" 
                    onClick={() => handleStatusUpdate(viewingWithdrawal.id)}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingWithdrawal && (
        <div className="modal-overlay" onClick={() => setEditingWithdrawal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Estado del Retiro #{editingWithdrawal.id}</h3>
              <button className="btn-close" onClick={() => setEditingWithdrawal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="status-select-modal">Estado:</label>
                <select
                  id="status-select-modal"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'pending' | 'approved' | 'rejected' })}
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
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Agregar notas sobre el procesamiento del retiro..."
                  rows={3}
                  className="form-textarea"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditingWithdrawal(null)}>
                Cancelar
              </button>
              <button 
                className="btn-save" 
                onClick={() => handleStatusUpdate(editingWithdrawal.id)}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

