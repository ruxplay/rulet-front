'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  useGetCurrentMesaQuery,
  usePlaceBetMutation,
  useSpinMesaMutation
} from '@/store/api/rouletteApi';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { RouletteType, RouletteWinners } from '@/types';
import { useRouletteSSE } from './useRouletteSSE';
import { useAppDispatch } from '@/lib/store/hooks';
import { updateUserBalance } from '@/store/slices/authSlice';

export const useRoulette = (type: RouletteType) => {
  const { authState } = useAuth();
  const username = authState.user?.username;
  const dispatch = useAppDispatch();


  // Estados locales
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  // Queries y mutations
  const { 
    data: mesaData, 
    isLoading, 
    error,
    refetch 
  } = useGetCurrentMesaQuery(type, {
    pollingInterval: 5000, // Polling cada 5 segundos
    skip: !username,
    // Forzar nueva petición cada vez que cambie el tipo
    refetchOnMountOrArgChange: true
  });

  // SSE para ganadores en tiempo real
  const { winners: sseWinners, showModal: sseShowModal, closeModal: sseCloseModal } = useRouletteSSE(type, mesaData?.mesa?.mesaId);


  const [placeBetMutation, { isLoading: isPlacingBet }] = usePlaceBetMutation();
  const [spinMesaMutation] = useSpinMesaMutation();

  // Función para formatear moneda
  const formatCurrency = useCallback((value: number) => {
    return value.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, []);

  // Función para realizar apuesta
  const placeBet = useCallback(async () => {
    // Permitir apostar incluso si no hay mesa activa (para crear la primera mesa)
    const isNoActiveMesa = (error as { status?: number; data?: { code?: string } })?.status === 404 || (error as { status?: number; data?: { code?: string } })?.data?.code === 'NO_ACTIVE_MESA';
    
    if (!username || selectedSector === null) {
      return;
    }

    // Si no hay mesa activa, permitir apostar para crear la primera mesa
    if (!mesaData?.mesa && !isNoActiveMesa) {
      return;
    }

    try {
      const result = await placeBetMutation({
        type,
        username,
        sectorIndex: selectedSector
      }).unwrap();

      console.log('🎯 Respuesta completa de placeBet:', result);
      console.log('🎯 Balance en respuesta:', (result as { balance?: number | string })?.balance);

      // Si el backend devuelve balance actualizado, reflejarlo en Redux
      if ((result as { balance?: number | string })?.balance !== undefined) {
        console.log('✅ Balance recibido, actualizando Redux:', (result as { balance?: number | string }).balance);
        dispatch(updateUserBalance((result as { balance?: number | string }).balance!));
      } else {
        console.log('❌ No se recibió balance en la respuesta de placeBet');
      }

      // Limpiar selección
      setSelectedSector(null);
      
      // Refrescar datos
      refetch();
    } catch (error: unknown) {
      console.error('❌ ERROR USUARIO 15:', error);
      throw error;
    }
  }, [username, selectedSector, mesaData, type, placeBetMutation, refetch, error, dispatch]);

  // Función para manejar clic en sector
  const handleSectorClick = useCallback((sectorIndex: number) => {
    // Permitir selección incluso si no hay mesa activa (para crear la primera mesa)
    const isNoActiveMesa = (error as { status?: number; data?: { code?: string } })?.status === 404 || (error as { status?: number; data?: { code?: string } })?.data?.code === 'NO_ACTIVE_MESA';

    if (isNoActiveMesa) {
      // Si no hay mesa activa, permitir selección para crear la primera mesa
      setSelectedSector(sectorIndex);
      return;
    }

    // Si hay mesa activa, aplicar las validaciones normales
    if (!mesaData?.mesa || mesaData.mesa.status !== 'open') {
      return;
    }

    // Verificar si el sector está ocupado
    if (mesaData.mesa.sectors[sectorIndex]) {
      return;
    }

    // Verificar si el usuario ya apostó
    const userAlreadyBet = mesaData.mesa.sectors.some(
      (sector: { username?: string } | null) => sector && sector.username === username
    );
    if (userAlreadyBet) {
      return;
    }

    setSelectedSector(sectorIndex);
  }, [mesaData, username, error]);

  // Efecto para manejar cambios en la mesa
  useEffect(() => {
    if (mesaData?.mesa) {
      // Si la mesa cambió, limpiar selección
      if (mesaData.mesa.status !== 'open') {
        setSelectedSector(null);
      }
    }
  }, [mesaData?.mesa]);

  // Efecto para manejar el giro automático cuando la mesa se llena
  useEffect(() => {
    if (mesaData?.mesa && mesaData.mesa.status === 'spinning') {
      // Llamar a spinMesa cuando el status sea "spinning"
      const handleSpin = async () => {
        try {
          setIsSpinning(true);
          
          const result = await spinMesaMutation({
            type,
            mesaId: mesaData.mesa.mesaId
          }).unwrap();
          
          // Actualizar la rotación para la animación
          setRotation(result.finalRotation);
          
          // Esperar un poco antes de refrescar para que se complete la animación
          setTimeout(() => {
            refetch();
            setIsSpinning(false);
            setRotation(0); // Resetear rotación
          }, 2000);
        } catch (error: unknown) {
          console.error('❌ ERROR EN GIRO AUTOMÁTICO:', error);
          setIsSpinning(false);
        }
      };

      handleSpin();
    }
  }, [mesaData?.mesa?.status, mesaData?.mesa?.mesaId, type, spinMesaMutation, refetch]);

  // Efecto para limpiar selección cuando cambia el tipo
  useEffect(() => {
    setSelectedSector(null);
  }, [type]);

  return {
    // Datos
    mesa: mesaData?.mesa || null,
    isLoading,
    error,
    
    // Estados locales
    selectedSector,
    rotation,
    isSpinning,
    
    // SSE para ganadores
    lastWinners: sseWinners,
    showWinnerModal: sseShowModal,
    setShowWinnerModal: sseCloseModal,
    
    // Funciones
    setSelectedSector: handleSectorClick,
    placeBet,
    formatCurrency,
    
    // Estados de loading
    isPlacingBet,
    
    // Funciones adicionales
    refetch
  };
};
