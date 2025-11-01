"use client";

import React, { useCallback, useMemo, useState } from "react";
import { ProtectedPage } from "@/components/auth/ProtectedPage";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useGetUserHistoryQuery, UserHistoryItemType } from "@/store/api/usersApi";
import Link from "next/link";
import "@/styles/components/user-history.css";

type HistoryTypeFilter = {
  deposits: boolean;
  withdrawals: boolean;
  bets: boolean;
};

const DEFAULT_LIMIT = 50;

export default function AdminUsersHistoryPage(): React.ReactElement {
  const [username, setUsername] = useState<string>("");
  const [typedUsername, setTypedUsername] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);
  const [offset, setOffset] = useState<number>(0);
  const [types, setTypes] = useState<HistoryTypeFilter>({ deposits: true, withdrawals: true, bets: true });
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);

  const typesCsv: string | undefined = useMemo(() => {
    const selected: Array<keyof HistoryTypeFilter> = Object.entries(types)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key as keyof HistoryTypeFilter);
    if (selected.length === 0) return undefined;
    return selected.join(",");
  }, [types]);

  const { data, error, isFetching, isLoading, refetch } = useGetUserHistoryQuery(
    {
      username,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      types: typesCsv,
      limit,
      offset,
    },
    { skip: !username }
  );

  const onSubmitSearch = useCallback((): void => {
    setOffset(0);
    setUsername(typedUsername.trim());
  }, [typedUsername]);

  const onChangeType = useCallback((name: keyof HistoryTypeFilter) => {
    setOffset(0);
    setTypes((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const onApplyDates = useCallback(() => {
    setOffset(0);
    void refetch();
  }, [refetch]);

  const onLoadMore = useCallback(() => {
    if (!data?.pagination?.hasMore) return;
    setOffset((prev) => prev + limit);
  }, [data?.pagination?.hasMore, limit]);

  const isObjectRecord = (val: unknown): val is Record<string, unknown> => {
    return typeof val === "object" && val !== null && !Array.isArray(val);
  };

  const renderItem = (item: { type: UserHistoryItemType; id: number; at: string; data: unknown }): React.ReactElement => {
    const dateLabel = new Date(item.at).toLocaleString();
    const payload = isObjectRecord(item.data) ? item.data : {};

    const typeBadge = (
      <span className={`badge type-${item.type}`}>
        {item.type === "deposit" && "Depósito"}
        {item.type === "withdrawal" && "Retiro"}
        {item.type === "bet" && "Apuesta"}
      </span>
    );

    const status = typeof payload.status === "string" ? payload.status : undefined;
    const statusBadge = status ? <span className={`pill pill-${status}`}>{status}</span> : null;

    const renderFields = () => {
      if (item.type === "deposit") {
        const amount = typeof payload.amount === "number" || typeof payload.amount === "string" ? String(payload.amount) : "-";
        const method = typeof payload.paymentMethod === "string" ? payload.paymentMethod : "-";
        const reference = typeof payload.reference === "string" ? payload.reference : "-";
        const processedBy = typeof payload.processedBy === "string" ? payload.processedBy : "-";
        const processedAt = typeof payload.processedAt === "string" ? new Date(payload.processedAt).toLocaleString() : "-";
        const usernameField = typeof payload.username === "string" ? payload.username : "-";
        const fullName = typeof payload.fullName === "string" ? payload.fullName : "-";
        const receiptUrl = typeof payload.receiptUrl === "string" ? payload.receiptUrl : undefined;

        return (
          <div className="history-grid">
            <div className="field"><span className="label">Usuario</span><span className="value">{usernameField}</span></div>
            <div className="field"><span className="label">Nombre</span><span className="value">{fullName}</span></div>
            <div className="field"><span className="label">Monto</span><span className="value">{amount}</span></div>
            <div className="field"><span className="label">Método</span><span className="value">{method}</span></div>
            <div className="field"><span className="label">Referencia</span><span className="value mono">{reference}</span></div>
            <div className="field"><span className="label">Procesado por</span><span className="value">{processedBy}</span></div>
            <div className="field"><span className="label">Procesado el</span><span className="value">{processedAt}</span></div>
            {receiptUrl && (
              <div className="field image">
                <span className="label">Comprobante</span>
                <img
                  src={receiptUrl}
                  alt="Comprobante de depósito"
                  className="receipt-thumbnail"
                  onClick={() => setReceiptModalUrl(receiptUrl)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        );
      }

      if (item.type === "withdrawal") {
        const amount = typeof payload.monto === "number" || typeof payload.monto === "string" ? String(payload.monto) : "-";
        const method = typeof payload.payment_method === "string" ? payload.payment_method : "-";
        const account = typeof payload.accountNumber === "string" ? payload.accountNumber : "-";
        const accountHolder = typeof payload.accountHolder === "string" ? payload.accountHolder : "-";
        const usernameField = typeof payload.username === "string" ? payload.username : "-";
        const processedBy = typeof payload.processedBy === "string" ? payload.processedBy : "-";
        const processedAt = typeof payload.processedAt === "string" ? new Date(payload.processedAt).toLocaleString() : "-";

        return (
          <div className="history-grid">
            <div className="field"><span className="label">Usuario</span><span className="value">{usernameField}</span></div>
            <div className="field"><span className="label">Monto</span><span className="value">{amount}</span></div>
            <div className="field"><span className="label">Método</span><span className="value">{method}</span></div>
            <div className="field"><span className="label">Cuenta</span><span className="value mono ellipsis">{account}</span></div>
            <div className="field"><span className="label">Titular</span><span className="value">{accountHolder}</span></div>
            <div className="field"><span className="label">Procesado por</span><span className="value">{processedBy}</span></div>
            <div className="field"><span className="label">Procesado el</span><span className="value">{processedAt}</span></div>
          </div>
        );
      }

      // bet
      const betAmount = typeof payload.bet === "number" || typeof payload.bet === "string" ? String(payload.bet) : "-";
      const mesaId = typeof payload.mesaId === "string" ? payload.mesaId : "-";
      const sectorIndex = typeof payload.sectorIndex === "number" ? payload.sectorIndex : Number(payload.sectorIndex);
      const numero = Number.isFinite(sectorIndex) ? String(sectorIndex + 1) : "-";
      const usernameField = typeof payload.username === "string" ? payload.username : "-";
      const ruletaType = typeof payload.type === "string" ? payload.type : "-";
      const won = typeof (payload as Record<string, unknown>).won === "boolean" ? (payload as Record<string, unknown>).won as boolean : null;
      const payoutRaw = (payload as Record<string, unknown>).payout;
      const payout = payoutRaw !== null && payoutRaw !== undefined ? String(payoutRaw) : null;
      const mesaStatus = typeof (payload as Record<string, unknown>).mesaStatus === "string" ? (payload as Record<string, unknown>).mesaStatus as string : null;

      const winningMain = (payload as Record<string, unknown>).winningMain as { index: number; number: number; username: string; prize: number; bet: number } | null | undefined;
      const winningLeft = (payload as Record<string, unknown>).winningLeft as { index: number; number: number; username: string; prize: number; bet: number } | null | undefined;
      const winningRight = (payload as Record<string, unknown>).winningRight as { index: number; number: number; username: string; prize: number; bet: number } | null | undefined;

      const hasWinners = winningMain !== null && winningMain !== undefined || winningLeft !== null && winningLeft !== undefined || winningRight !== null && winningRight !== undefined;

      return (
        <div className="history-grid">
          <div className="field"><span className="label">Usuario</span><span className="value">{usernameField}</span></div>
          <div className="field"><span className="label">RULETA</span><span className="value">{betAmount}</span></div>
          <div className="field"><span className="label">Ruleta</span><span className="value">{ruletaType}</span></div>
          <div className="field"><span className="label">Mesa</span><span className="value mono">{mesaId}</span></div>
          <div className="field"><span className="label">Número Apostado</span><span className="value">{numero}</span></div>
          {mesaStatus !== null && (
            <div className="field"><span className="label">Estado Mesa</span><span className="value"><span className="badge mesa-status">{mesaStatus}</span></span></div>
          )}
          {won !== null && (
            <div className="field">
              <span className="label">Resultado</span>
              <span className={`value`}>
                <span className={`pill ${won ? "pill-won" : "pill-lost"}`}>
                  {won ? "Ganó" : "Perdió"}
                </span>
              </span>
            </div>
          )}
          {won === null && mesaStatus && (
            <div className="field">
              <span className="label">Resultado</span>
              <span className="value">
                <span className="pill pill-pending">
                  {mesaStatus === 'open' || mesaStatus === 'spinning' || mesaStatus === 'waiting_for_result' ? "Esperando resultado..." : "Sin resultado"}
                </span>
              </span>
            </div>
          )}
          {payout !== null && (
            <div className="field"><span className="label">Payout</span><span className="value">{payout}</span></div>
          )}
          {mesaStatus === 'closed' && hasWinners && (
            <div className="winners-section">
              {winningMain !== null && winningMain !== undefined && (
                <div className="winner-item winner-main">
                  <span className="winner-label">Ganador Principal</span>
                  <span className="winner-value">
                    Número <strong>{winningMain.number}</strong> - {winningMain.username} - Premio: <strong>{winningMain.prize}</strong>
                  </span>
                </div>
              )}
              {(winningLeft !== null && winningLeft !== undefined) || (winningRight !== null && winningRight !== undefined) ? (
                <div className="winners-sides">
                  {winningLeft !== null && winningLeft !== undefined && (
                    <div className="winner-item winner-side">
                      <span className="winner-label">Ganador Izquierdo</span>
                      <span className="winner-value">
                        Número <strong>{winningLeft.number}</strong> - {winningLeft.username} - Premio: <strong>{winningLeft.prize}</strong>
                      </span>
                    </div>
                  )}
                  {winningRight !== null && winningRight !== undefined && (
                    <div className="winner-item winner-side">
                      <span className="winner-label">Ganador Derecho</span>
                      <span className="winner-value">
                        Número <strong>{winningRight.number}</strong> - {winningRight.username} - Premio: <strong>{winningRight.prize}</strong>
                      </span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="history-item" data-type={item.type} key={`${item.type}-${item.id}-${item.at}`}>
        <div className="history-item-header">
          <div className="left">
            {typeBadge}
            <span className="history-item-id">#{item.id}</span>
          </div>
          <div className="right">
            {statusBadge}
            <span className="history-item-date">{dateLabel}</span>
          </div>
        </div>
        <div className="history-item-body-compact">
          {renderFields()}
        </div>
      </div>
    );
  };

  const isForbidden = Boolean(
    error && typeof error === "object" && error !== null && "status" in error && (error as { status?: unknown }).status === 403
  );

  const isNotFoundUser = Boolean(
    error && typeof error === "object" && error !== null && "status" in error && (error as { status?: unknown }).status === 404
  );

  return (
    <ProtectedPage allowedRoles={["admin"]}>
      <AdminDashboard
        pageTitle="Historial de Usuarios"
        pageDescription="Consulta el historial unificado (depósitos, retiros y apuestas) por usuario"
      >
        <div className="admin-content">
          <div className="history-controls">
            <div className="row">
              <div className="col">
                <label htmlFor="username-input">Username</label>
                <input
                  id="username-input"
                  type="text"
                  value={typedUsername}
                  onChange={(e) => setTypedUsername(e.target.value)}
                  placeholder="Ej: alice, gabriel"
                  className="input"
                />
              </div>
              <div className="col">
                <label>&nbsp;</label>
                <button className="btn-primary" onClick={onSubmitSearch} disabled={!typedUsername.trim()}>
                  Buscar
                </button>
              </div>
              <div className="col">
                <label htmlFor="limit-input">Límite</label>
                <input
                  id="limit-input"
                  type="number"
                  min={1}
                  max={200}
                  value={limit}
                  onChange={(e) => setLimit(Math.max(1, Math.min(200, Number(e.target.value) || DEFAULT_LIMIT)))}
                  className="input"
                />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label htmlFor="date-from">Desde (ISO)</label>
                <input
                  id="date-from"
                  type="datetime-local"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input"
                />
              </div>
              <div className="col">
                <label htmlFor="date-to">Hasta (ISO)</label>
                <input
                  id="date-to"
                  type="datetime-local"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="input"
                />
              </div>
              <div className="col">
                <label>&nbsp;</label>
                <button className="btn-secondary" onClick={onApplyDates} disabled={!username}>
                  Aplicar fechas
                </button>
              </div>
            </div>

            <div className="row">
              <div className="col types-group">
                <label>Tipos</label>
                <div className="types-inline">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={types.deposits}
                      onChange={() => onChangeType("deposits")}
                    />
                    Depósitos
                  </label>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={types.withdrawals}
                      onChange={() => onChangeType("withdrawals")}
                    />
                    Retiros
                  </label>
                  <label className="checkbox">
                    <input type="checkbox" checked={types.bets} onChange={() => onChangeType("bets")} />
                    Apuestas
                  </label>
                </div>
              </div>
            </div>
          </div>

          {!username && (
            <div className="empty-state">
              <p>Ingresa un username para consultar su historial.</p>
              <p>
                También puedes ir a la gestión de usuarios y elegir uno:
                <Link href="/admin/users" className="admin-link"> Ir a Usuarios</Link>
              </p>
            </div>
          )}

          {username && isLoading && (
            <div className="loading-state">
              <div className="loading-spinner" />
              <span>Cargando historial...</span>
            </div>
          )}

          {username && isForbidden && (
            <div className="error-state">
              <span>No tienes permiso para ver el historial de este usuario (403).</span>
            </div>
          )}

          {username && isNotFoundUser && (
            <div className="error-state">
              <span>Usuario no encontrado (404).</span>
            </div>
          )}

          {username && !isLoading && !isFetching && data && (
            <div className="history-results">
              <div className="history-meta">
                <div>
                  <strong>Usuario:</strong> {data.username}
                </div>
                <div>
                  <strong>Límite:</strong> {data.pagination.limit} &nbsp;|&nbsp; <strong>Offset:</strong> {data.pagination.offset}
                </div>
              </div>

              {(() => {
                const allItems = data.items || [];
                if (allItems.length === 0) {
                  return <div className="empty-state">El usuario no tiene registros en el historial.</div>;
                }
                const allowed = new Set<UserHistoryItemType>([
                  ...(types.deposits ? (["deposit"] as const) : []),
                  ...(types.withdrawals ? (["withdrawal"] as const) : []),
                  ...(types.bets ? (["bet"] as const) : []),
                ]);
                if (allowed.size === 0) {
                  return <div className="empty-state">Selecciona al menos un tipo para ver resultados.</div>;
                }
                const displayed = allItems.filter((it) => allowed.has(it.type as UserHistoryItemType));
                if (displayed.length === 0) {
                  return <div className="empty-state">No hay resultados para los tipos seleccionados.</div>;
                }
                return (
                  <div className="history-list">
                    {displayed.map(renderItem)}
                  </div>
                );
              })()}

              {data.pagination.hasMore && (
                <div className="history-actions">
                  <button className="btn-primary" onClick={onLoadMore}>
                    Cargar más
                  </button>
                </div>
              )}
            </div>
          )}
          {receiptModalUrl && (
            <div className="receipt-modal-overlay" role="dialog" aria-modal="true" onClick={() => setReceiptModalUrl(null)}>
              <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
                <img src={receiptModalUrl} alt="Comprobante" className="receipt-modal-image" />
                <button className="receipt-modal-close" onClick={() => setReceiptModalUrl(null)} aria-label="Cerrar">✕</button>
              </div>
            </div>
          )}
        </div>
      </AdminDashboard>
    </ProtectedPage>
  );
}


