"use client";

import React, { useCallback, useMemo, useState } from "react";
import { ProtectedPage } from "@/components/auth/ProtectedPage";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import "@/styles/components/roulette-history.css";
import "@/styles/components/user-history.css";
import { useGetRouletteReportQuery, useGetWinnersQuery } from "@/store/api/rouletteApi";

type RouletteType = "150" | "300";

interface WinnerData {
  username: string;
  bet: number;
  prize: number;
  index: number;
}

interface WinnersData {
  mesaId: string;
  seed: string;
  main: WinnerData;
  left: WinnerData | null;
  right: WinnerData | null;
  totals: {
    totalApostado: number;
    premioPrincipal: number;
    premioSecundario: number;
    gananciasCasa: number;
    percentages: {
      main: number;
      secondary: number;
      house: number;
    };
  };
  house: {
    percentage: number;
    amount: number;
  };
  timestamp: string;
}

interface ArrayWinnerData extends WinnerData {
  sectorIndex?: number;
  payout?: number;
}

interface RouletteMesaItem {
  mesaId: string;
  type: RouletteType;
  closedAt: string;
  winners: WinnersData | ArrayWinnerData[] | null;
  houseEarnings: number;
}

export default function AdminRouletteHistoryPage(): React.ReactElement {
  const [type, setType] = useState<RouletteType>("150");
  const [limit, setLimit] = useState<number>(10);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const {
    data: winnersData,
    isLoading: isLoadingWinners,
    isFetching: isFetchingWinners,
    error: winnersError,
    refetch: refetchWinners,
  } = useGetWinnersQuery({ type, limit });

  const {
    data: reportData,
    isLoading: isLoadingReport,
    isFetching: isFetchingReport,
    error: reportError,
    refetch: refetchReport,
  } = useGetRouletteReportQuery({
    type,
    dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
    dateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
  });

  const winners: RouletteMesaItem[] = useMemo(
    () => ((winnersData?.mesas as unknown as RouletteMesaItem[]) ?? []),
    [winnersData?.mesas]
  );

  // Filtro en cliente por rango de fechas (closedAt)
  const filteredWinners: RouletteMesaItem[] = useMemo(() => {
    if (!winners || winners.length === 0) return [];
    const fromMs = dateFrom ? new Date(dateFrom).getTime() : null;
    const toMs = dateTo ? new Date(dateTo).getTime() : null;
    return winners.filter((mesa) => {
      const closedAtMs = new Date(mesa.closedAt).getTime();
      if (!Number.isFinite(closedAtMs)) return false;
      if (fromMs !== null && closedAtMs < fromMs) return false;
      if (toMs !== null && closedAtMs > toMs) return false;
      return true;
    });
  }, [winners, dateFrom, dateTo]);

  const totalMesas = useMemo(() => reportData?.mesas ?? winners.length, [reportData?.mesas, winners.length]);

  const totalHouse = useMemo(
    () => reportData?.totalHouse ?? winners.reduce((acc, m) => acc + (m.houseEarnings || 0), 0),
    [reportData?.totalHouse, winners]
  );

  const formatDate = (iso: string): string => new Date(iso).toLocaleString();

  const onRefresh = useCallback(() => {
    void refetchWinners();
    void refetchReport();
  }, [refetchWinners, refetchReport]);

  const isLoading = isLoadingWinners || isFetchingWinners || isLoadingReport || isFetchingReport;
  const errorMessage = winnersError || reportError ? "Error al cargar datos" : null;

  return (
    <ProtectedPage allowedRoles={["admin"]}>
      <AdminDashboard
        pageTitle="Historial de Ruletas"
        pageDescription="Mesas cerradas con ganadores y totales por rango"
        stats={{
          totalWithdrawals: 0,
          pendingWithdrawals: 0,
          approvedWithdrawals: 0,
          rejectedWithdrawals: 0,
          totalWithdrawalAmount: 0,
        }}
      >
        <div className="admin-content">
          <div className="roulette-controls">
            <div className="row">
              <div className="col">
                <label htmlFor="type-select">Tipo de mesa</label>
                <select
                  id="type-select"
                  className="input"
                  value={type}
                  onChange={(e) => setType(e.target.value as RouletteType)}
                >
                  <option value="150">150</option>
                  <option value="300">300</option>
                </select>
              </div>
              <div className="col">
                <label htmlFor="limit-input">Límite (winners)</label>
                <input
                  id="limit-input"
                  className="input"
                  type="number"
                  min={1}
                  max={200}
                  value={limit}
                  onChange={(e) =>
                    setLimit(Math.max(1, Math.min(200, Number(e.target.value) || 10)))
                  }
                />
              </div>
              <div className="col">
                <label>&nbsp;</label>
                <button className="btn-primary" onClick={onRefresh}>
                  Actualizar
                </button>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label htmlFor="date-from">Desde</label>
                <input
                  id="date-from"
                  className="input"
                  type="datetime-local"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="col">
                <label htmlFor="date-to">Hasta</label>
                <input
                  id="date-to"
                  className="input"
                  type="datetime-local"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className="col">
                <label>&nbsp;</label>
                <button className="btn-secondary" onClick={onRefresh}>
                  Aplicar rango
                </button>
              </div>
            </div>
          </div>

          <div className="roulette-stats">
            <div className="stat">
              <span className="label">Total mesas</span>
              <span className="value">{totalMesas}</span>
            </div>
            <div className="stat">
              <span className="label">Ganancia de la casa</span>
              <span className="value">{totalHouse}</span>
            </div>
          </div>

          {isLoading && (
            <div className="loading-state">
              <div className="loading-spinner" />
              <span>Cargando historial...</span>
            </div>
          )}

          {errorMessage && (
            <div className="error-state">
              <span>{errorMessage}</span>
            </div>
          )}

          {!isLoading && !errorMessage && (
            <div className="roulette-list">
              {filteredWinners.length === 0 ? (
                <div className="empty-state">
                  No hay mesas cerradas para los filtros seleccionados.
                </div>
              ) : (
                filteredWinners.map((mesa) => (
                  <div className="roulette-card" key={`${mesa.mesaId}-${mesa.closedAt}`}>
                    <div className="card-header">
                      <div className="left">
                        <span className="badge mesa-type">Ruleta {mesa.type}</span>
                        <span className="mesa-id">Mesa ID {mesa.mesaId}</span>
                      </div>
                      <div className="right">
                        <span className="pill pill-closed">Cerrada</span>
                        <span className="date">{formatDate(mesa.closedAt)}</span>
                      </div>
                    </div>

                    <div className="card-body">
                      {(() => {
                        const winnersObj = Array.isArray(mesa.winners)
                          ? null
                          : (mesa.winners as WinnersData | null);

                        if (winnersObj && winnersObj.main) {
                          return (
                            <>
                              <div className="meta">
                                <div className="field">
                                  <span className="label">Ganancia Casa</span>
                                  <span className="value">{mesa.houseEarnings}</span>
                                </div>
                                <div className="field">
                                  <span className="label">Total Apostado</span>
                                  <span className="value">
                                    {winnersObj.totals?.totalApostado || 0}
                                  </span>
                                </div>
                                {winnersObj.totals && (
                                  <>
                                    <div className="field">
                                      <span className="label">Premio Principal</span>
                                      <span className="value">
                                        {winnersObj.totals.premioPrincipal}
                                      </span>
                                    </div>
                                    <div className="field">
                                      <span className="label">Premio Secundario</span>
                                      <span className="value">
                                        {winnersObj.totals.premioSecundario}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>

                              <div className="winners-section">
                                {winnersObj.main && (
                                  <div className="winner-item winner-main">
                                    <span className="winner-label">Ganador Principal</span>
                                    <span className="winner-value">
                                      Número <strong>{winnersObj.main.index + 1}</strong> -{" "}
                                      {winnersObj.main.username} - Apuesta:{" "}
                                      <strong>{winnersObj.main.bet}</strong> - Premio:{" "}
                                      <strong>{winnersObj.main.prize}</strong>
                                    </span>
                                  </div>
                                )}

                                {(winnersObj.left || winnersObj.right) && (
                                  <div className="winners-sides">
                                    {winnersObj.left && (
                                      <div className="winner-item winner-side">
                                        <span className="winner-label">Ganador Izquierdo</span>
                                        <span className="winner-value">
                                          Número <strong>{winnersObj.left.index + 1}</strong> -{" "}
                                          {winnersObj.left.username} - Apuesta:{" "}
                                          <strong>{winnersObj.left.bet}</strong> - Premio:{" "}
                                          <strong>{winnersObj.left.prize}</strong>
                                        </span>
                                      </div>
                                    )}
                                    {winnersObj.right && (
                                      <div className="winner-item winner-side">
                                        <span className="winner-label">Ganador Derecho</span>
                                        <span className="winner-value">
                                          Número <strong>{winnersObj.right.index + 1}</strong> -{" "}
                                          {winnersObj.right.username} - Apuesta:{" "}
                                          <strong>{winnersObj.right.bet}</strong> - Premio:{" "}
                                          <strong>{winnersObj.right.prize}</strong>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </>
                          );
                        } else if (Array.isArray(mesa.winners) && mesa.winners.length > 0) {
                          const arrayWinners = mesa.winners as ArrayWinnerData[];
                          return (
                            <>
                              <div className="meta">
                                <div className="field">
                                  <span className="label">Ganancia Casa</span>
                                  <span className="value">{mesa.houseEarnings}</span>
                                </div>
                                <div className="field">
                                  <span className="label">Ganadores</span>
                                  <span className="value">{arrayWinners.length}</span>
                                </div>
                              </div>

                              <div className="winners-table-wrapper">
                                <table className="winners-table">
                                  <thead>
                                    <tr>
                                      <th>Usuario</th>
                                      <th>Número Apostado</th>
                                      <th>Apuesta</th>
                                      <th>Payout</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {arrayWinners.map((w, idx) => (
                                      <tr key={`${mesa.mesaId}-w-${idx}`}>
                                        <td className="user">{w.username}</td>
                                        <td>
                                          {Number.isFinite(w.sectorIndex)
                                            ? (w.sectorIndex! + 1)
                                            : w.sectorIndex}
                                        </td>
                                        <td>{w.bet}</td>
                                        <td className="payout">{w.payout}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          );
                        } else {
                          return (
                            <div
                              className="empty-state"
                              style={{
                                textAlign: "center",
                                color: "#6b7280",
                                padding: "1rem",
                              }}
                            >
                              No hay ganadores registrados
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </AdminDashboard>
    </ProtectedPage>
  );
}
