'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  useGetCurrentMesaQuery,
  usePlaceBetMutation,
  useSpinMesaMutation,
  useAdvanceMesaMutation
} from '@/store/api/rouletteApi';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { RouletteType, RouletteWinners } from '@/types';
import { useRouletteSSE } from './useRouletteSSE';
import { useAppDispatch } from '@/lib/store/hooks';
import { updateUserBalance, updateUserLosses } from '@/store/slices/authSlice';

export const useRoulette = (type: RouletteType) => {
  const { authState } = useAuth();
  const username = authState.user?.username;
  const dispatch = useAppDispatch();

  // Estados locales
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isPhysicalMode, setIsPhysicalMode] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [lastSpunMesaId, setLastSpunMesaId] = useState<string | null>(null);
  const [isWaitingForNewMesa, setIsWaitingForNewMesa] = useState(false);
  const [persistentWinners, setPersistentWinners] = useState<RouletteWinners | null>(null);

  // Queries y mutations
  const {
    data: mesaData,
    isLoading,
    error,
    refetch
  } = useGetCurrentMesaQuery(type, {
    pollingInterval: 5000,
    skip: !username,
    refetchOnMountOrArgChange: true
  });

  // SSE para ganadores en tiempo real
  const {
    winners: sseWinners,
    showModal: sseShowModal,
    closeModal: sseCloseModal,
    isWaitingForResult,
    currentMesaIdForSpin,
    setWinners,
    setShowModal
  } = useRouletteSSE(type, mesaData?.mesa?.mesaId);

  // Sincronizar ganadores persistentes con SSE
  useEffect(() => {
    if (sseWinners && !isWaitingForNewMesa) {
      setPersistentWinners(sseWinners);
    }
  }, [sseWinners, isWaitingForNewMesa]);

  const [placeBetMutation, { isLoading: isPlacingBet }] = usePlaceBetMutation();
  const [spinMesaMutation] = useSpinMesaMutation();
  const [advanceMesaMutation] = useAdvanceMesaMutation();

  // Formato de moneda
  const formatCurrency = useCallback((value: number) => {
    return value.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, []);

  // Manejo de giro físico (placeholder)
  const handlePhysicalSpin = useCallback((winningSector: number) => {
    // Lógica adicional cuando termine el giro físico (si aplica)
  }, []);

  // Realizar apuesta
  const placeBet = useCallback(async () => {
    const isNoActiveMesa =
      (error as { status?: number; data?: { code?: string } })?.status === 404 ||
      (error as { status?: number; data?: { code?: string } })?.data?.code === 'NO_ACTIVE_MESA';

    if (!username || selectedSector === null) {
      console.error('❌ Validación fallida:', { username: !!username, selectedSector });
      return;
    }

    if (!mesaData?.mesa && !isNoActiveMesa) {
      console.error('❌ No hay mesa activa y no es error de NO_ACTIVE_MESA');
      return;
    }

    try {
      const result = await placeBetMutation({
        type,
        username,
        sectorIndex: selectedSector
      }).unwrap();

      if ((result as { balance?: number | string })?.balance !== undefined) {
        dispatch(updateUserBalance((result as { balance?: number | string }).balance!));
      } else {
        console.error('❌ No se recibió balance en la respuesta de placeBet');
      }

      const betAmount = type === '150' ? 150 : 300;
      dispatch(updateUserLosses(betAmount));

      setSelectedSector(null);
      refetch();
    } catch (error: unknown) {
      console.error('❌ ERROR al realizar apuesta:', error);
      console.error('❌ Tipo de error:', typeof error);

      if (error && typeof error === 'object') {
        const err = error as Record<string, unknown>;
        const errorInfo: Record<string, unknown> = {
          status: 'status' in err ? err.status : undefined,
          originalStatus: 'originalStatus' in err ? err.originalStatus : undefined,
          message: 'message' in err ? err.message : undefined,
        };

        if ('data' in err && err.data && typeof err.data === 'object') {
          const errorData = err.data as Record<string, unknown>;
          errorInfo.data = {
            error: 'error' in errorData ? errorData.error : undefined,
            message: 'message' in errorData ? errorData.message : undefined,
            code: 'code' in errorData ? errorData.code : undefined,
            ...errorData,
          };
        }

        console.error('❌ Error completo:', errorInfo);
        console.error('❌ Error status:', errorInfo.status);
        console.error('❌ Error data:', errorInfo.data);
        console.error(
          '❌ Error message:',
          (errorInfo.data as Record<string, unknown>)?.error ??
          (errorInfo.data as Record<string, unknown>)?.message ??
          errorInfo.message
        );
      } else if (error instanceof Error) {
        console.error('❌ Error estándar:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      } else {
        console.error('❌ Error desconocido:', error);
      }

      throw error;
    }
  }, [username, selectedSector, mesaData, type, placeBetMutation, refetch, error, dispatch]);

  // Seleccionar sector
  const handleSectorClick = useCallback(
    (sectorIndex: number) => {
      const isNoActiveMesa =
        (error as { status?: number; data?: { code?: string } })?.status === 404 ||
        (error as { status?: number; data?: { code?: string } })?.data?.code === 'NO_ACTIVE_MESA';

      if (isNoActiveMesa) {
        setSelectedSector(sectorIndex);
        return;
      }

      if (!mesaData?.mesa || mesaData.mesa.status !== 'open') return;
      if (mesaData.mesa.sectors[sectorIndex]) return;

      const userAlreadyBet = mesaData.mesa.sectors.some(
        (sector: { username?: string } | null) => sector && sector.username === username
      );
      if (userAlreadyBet) return;

      setSelectedSector(sectorIndex);
    },
    [mesaData, username, error]
  );

  // Limpiar selección al cambiar la mesa
  useEffect(() => {
    if (mesaData?.mesa && mesaData.mesa.status !== 'open') {
      setSelectedSector(null);
    }
  }, [mesaData?.mesa]);

  // Limpiar selección al cambiar tipo
  useEffect(() => {
    setSelectedSector(null);
  }, [type]);

  return {
    // Datos
    mesa: mesaData?.mesa || null,
    isLoading,
    error,

    // Estados
    selectedSector,
    rotation,
    isSpinning,
    isPhysicalMode,
    countdown,
    isAutoSpinning,

    // SSE
    lastWinners: persistentWinners || sseWinners,
    showWinnerModal: sseShowModal,
    setShowWinnerModal: sseCloseModal,
    isWaitingForResult,
    currentMesaIdForSpin,
    isWaitingForNewMesa,
    sseWinners,

    // Funciones
    setSelectedSector: handleSectorClick,
    placeBet,
    formatCurrency,
    handlePhysicalSpin,

    // Estado de carga
    isPlacingBet,

    // Utilidades
    refetch
  };
};
