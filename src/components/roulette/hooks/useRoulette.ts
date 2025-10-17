'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  useGetCurrentMesaQuery,
  usePlaceBetMutation,
  useSpinMesaMutation,
  useSubmitSpinResultMutation,
  useAdvanceMesaMutation
} from '@/store/api/rouletteApi';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { RouletteType } from '@/types';
import { useRouletteSSE } from './useRouletteSSE';
import { useAppDispatch } from '@/lib/store/hooks';
import { updateUserBalance, updateUserLosses } from '@/store/slices/authSlice';

export const useRoulette = (type: RouletteType) => {
  const { authState } = useAuth();
  const username = authState.user?.username;
  const dispatch = useAppDispatch();

  // Debug de autenticación (comentado para evitar spam en consola)
  // console.log('🔐 Estado de autenticación:', {
  //   isAuthenticated: authState.isAuthenticated,
  //   username: username,
  //   user: authState.user ? 'Usuario presente' : 'Usuario ausente'
  // });


  // Estados locales
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isPhysicalMode, setIsPhysicalMode] = useState(true); // Activar modo físico por defecto
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [lastSpunMesaId, setLastSpunMesaId] = useState<string | null>(null);
  const [isWaitingForNewMesa, setIsWaitingForNewMesa] = useState(false);
  const [persistentWinners, setPersistentWinners] = useState<any>(null);

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
  const { 
    winners: sseWinners, 
    showModal: sseShowModal, 
    closeModal: sseCloseModal,
    isWaitingForResult,
    currentMesaIdForSpin,
    setWinners,
    setShowModal
  } = useRouletteSSE(type, mesaData?.mesa?.mesaId);

  // Debug: rastrear cambios en el modal
  useEffect(() => {
    console.log('🔍 useRoulette - sseShowModal cambió:', sseShowModal);
  }, [sseShowModal]);

  // Sincronizar ganadores persistentes con SSE
  useEffect(() => {
    if (sseWinners && !isWaitingForNewMesa) {
      setPersistentWinners(sseWinners);
    }
  }, [sseWinners, isWaitingForNewMesa]);

  // Debug logs para el modal (comentado para evitar spam en consola)
  // useEffect(() => {
  //   console.log('🎯 Estado del modal:', {
  //     sseWinners: !!sseWinners,
  //     sseShowModal,
  //     mesaId: mesaData?.mesa?.mesaId,
  //     currentMesaIdForSpin
  //   });
  // }, [sseWinners, sseShowModal, mesaData?.mesa?.mesaId, currentMesaIdForSpin]);


  const [placeBetMutation, { isLoading: isPlacingBet }] = usePlaceBetMutation();
  const [spinMesaMutation] = useSpinMesaMutation();
  const [submitSpinResultMutation] = useSubmitSpinResultMutation();
  const [advanceMesaMutation] = useAdvanceMesaMutation();

  // Función para formatear moneda
  const formatCurrency = useCallback((value: number) => {
    return value.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, []);

  // Función para realizar apuesta
  const placeBet = useCallback(async () => {
    console.log('🎯 placeBet iniciado:', { 
      username, 
      selectedSector, 
      mesaData: !!mesaData, 
      type,
      error: error ? 'Hay error' : 'Sin error'
    });
    
    // Permitir apostar incluso si no hay mesa activa (para crear la primera mesa)
    const isNoActiveMesa = (error as { status?: number; data?: { code?: string } })?.status === 404 || (error as { status?: number; data?: { code?: string } })?.data?.code === 'NO_ACTIVE_MESA';
    
    if (!username || selectedSector === null) {
      console.error('❌ Validación fallida:', { username: !!username, selectedSector });
      return;
    }

    // Si no hay mesa activa, permitir apostar para crear la primera mesa
    if (!mesaData?.mesa && !isNoActiveMesa) {
      console.log('❌ No hay mesa activa y no es error de NO_ACTIVE_MESA');
      return;
    }

    try {
      console.log('🔄 Enviando apuesta al backend...');
      console.log('🔄 Datos de la apuesta:', {
        type,
        username,
        sectorIndex: selectedSector,
        url: `/api/roulette/${type}/bet`
      });
      
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

      // Actualizar pérdidas (el usuario perdió la apuesta)
      const betAmount = type === '150' ? 150 : 300;
      console.log('💸 Registrando pérdida:', betAmount);
      dispatch(updateUserLosses(betAmount));

      // Limpiar selección
      setSelectedSector(null);
      
      // Refrescar datos
      refetch();
    } catch (error: unknown) {
      console.error('❌ ERROR USUARIO 15:', error);
      console.error('❌ Tipo de error:', typeof error);
      console.error('❌ Error stringified:', JSON.stringify(error));
      
      // Información adicional del error
      if (error && typeof error === 'object') {
        const errorObj = error as any;
        console.error('❌ Error status:', errorObj.status);
        console.error('❌ Error data:', errorObj.data);
        console.error('❌ Error message:', errorObj.message);
        console.error('❌ Error name:', errorObj.name);
      }
      
      throw error;
    }
  }, [username, selectedSector, mesaData, type, placeBetMutation, refetch, error, dispatch]);

  // Función para manejar giro físico
  const handlePhysicalSpin = useCallback(async (winningSector: number) => {
    // Usar mesaId de mesaData si currentMesaIdForSpin no está disponible
    const mesaIdToUse = currentMesaIdForSpin || mesaData?.mesa?.mesaId;
    
    if (!mesaIdToUse) {
      console.error('❌ No hay mesa activa para girar');
      return;
    }

    try {
      console.log('🎰 Enviando resultado de giro físico:', {
        mesaId: mesaIdToUse,
        winningSector,
        type
      });

      const payload = {
        mesaId: mesaIdToUse,
        winningSector,
        operatorId: username || 'operator',
        timestamp: new Date().toISOString()
      };
      
      console.log('🎰 Payload completo:', JSON.stringify(payload, null, 2));

      const result = await submitSpinResultMutation({ type, data: payload }).unwrap();

      console.log('✅ Resultado enviado exitosamente:', result);
      console.log('🎯 Resultado completo:', JSON.stringify(result, null, 2));
      
      // Marcar esta mesa como girada para prevenir doble giro
      setLastSpunMesaId(mesaIdToUse);
      
      // Los ganadores se establecen automáticamente desde el SSE
      console.log('🎯 Resultado enviado, esperando ganadores desde SSE...');
      
      // Limpiar estados después del giro
      setIsSpinning(false);
      setIsAutoSpinning(false);
      setCountdown(null);
      setSelectedSector(null); // Limpiar selección de sector
      
      // DELAY DE 60 SEGUNDOS antes de refrescar datos y crear nueva mesa
      // (15 segundos para resultados + 45 segundos para modal)
      console.log('⏰⏰⏰ ESPERANDO 60 SEGUNDOS ANTES DE CREAR NUEVA MESA... ⏰⏰⏰');
      setIsWaitingForNewMesa(true);
      // Mantener ganadores visibles durante el delay
      setPersistentWinners(sseWinners);
      setTimeout(() => {
        console.log('🔄🔄🔄 60 SEGUNDOS COMPLETADOS, REFRESCANDO DATOS... 🔄🔄🔄');
        setIsWaitingForNewMesa(false);
        setPersistentWinners(null);
        // Cerrar modal explícitamente
        setShowModal(false);
        refetch();
      }, 60000); // 60 segundos de delay total
      
    } catch (error: unknown) {
      console.error('❌ Error al enviar resultado:', error);
      
      // Log detallado del error
      if (error && typeof error === 'object') {
        const errorObj = error as { status?: number; data?: any };
        console.error('❌ Error status:', errorObj.status);
        console.error('❌ Error data:', errorObj.data);
        
        if (errorObj.data) {
          console.error('❌ Error message:', errorObj.data.error || errorObj.data.message);
        }
        
        // Si es error 400, limpiar estados pero no lanzar error
        if (errorObj.status === 400) {
          console.log('⚠️ Error 400 - Limpiando estados y forzando cierre de mesa');
          
          // Marcar esta mesa como girada para prevenir doble giro (incluso con error)
          setLastSpunMesaId(mesaIdToUse);
          
          setIsSpinning(false);
          setIsAutoSpinning(false);
          setCountdown(null);
          setSelectedSector(null); // Limpiar selección de sector
          
          // Forzar cierre de mesa usando advanceMesa
          try {
            console.log('🔄 Intentando cerrar mesa con advanceMesa...');
            advanceMesaMutation({
              type,
              closedMesaId: mesaIdToUse
            }).then(() => {
              console.log('✅ Mesa cerrada exitosamente');
            }).catch((advanceError) => {
              console.log('⚠️ Error al cerrar mesa:', advanceError);
            });
          } catch (advanceError) {
            console.log('⚠️ Error al cerrar mesa:', advanceError);
          }
          
          refetch();
          return;
        }
      }
      
      setIsSpinning(false);
      setIsAutoSpinning(false);
      setCountdown(null);
      setSelectedSector(null); // Limpiar selección de sector
      throw error;
    }
  }, [currentMesaIdForSpin, mesaData?.mesa?.mesaId, submitSpinResultMutation, type, username, refetch]);

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
    // Solo iniciar countdown si no hay countdown activo, no está girando y no se ha girado esta mesa
    if (mesaData?.mesa && 
        mesaData.mesa.status === 'waiting_for_result' && 
        !isAutoSpinning && 
        !countdown && 
        !isSpinning &&
        lastSpunMesaId !== mesaData.mesa.mesaId) {
      console.log('🎰 Mesa lista para girar - iniciando countdown:', mesaData.mesa.mesaId);
      setIsAutoSpinning(true);
      setCountdown(3);
      
      // Countdown de 3 segundos
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            console.log('🎯 ¡GIRANDO RULETA!');
            setCountdown(null);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Después del countdown, activar giro físico de la ruleta
      setTimeout(() => {
        console.log('🎰 Iniciando giro físico de la ruleta...');
        setIsSpinning(true);
        
        // Llamar directamente al giro físico de la ruleta
        // Esto se manejará desde el componente padre que tiene la ref
      }, 3000);
      
    } else if (mesaData?.mesa && mesaData.mesa.status === 'spinning') {
      console.log('🎰 Mesa girando:', mesaData.mesa.mesaId);
      setIsSpinning(true);
      setSelectedSector(null); // Limpiar selección cuando empieza a girar
    } else if (mesaData?.mesa && mesaData.mesa.status === 'closed') {
      console.log('🎰 Mesa cerrada:', mesaData.mesa.mesaId);
      // Solo limpiar estados si no estamos esperando nueva mesa
      if (!isWaitingForNewMesa) {
        setIsSpinning(false);
        setIsAutoSpinning(false);
        setCountdown(null);
        setSelectedSector(null); // Limpiar selección de sector
      }
    }
  }, [mesaData?.mesa?.status, mesaData?.mesa?.mesaId, isAutoSpinning, countdown, isSpinning, lastSpunMesaId]);

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
    isPhysicalMode,
    countdown,
    isAutoSpinning,
    
    // SSE para ganadores y modo físico
    lastWinners: persistentWinners || sseWinners,
    showWinnerModal: sseShowModal,
    setShowWinnerModal: sseCloseModal,
    isWaitingForResult,
    currentMesaIdForSpin,
    isWaitingForNewMesa,
    
    // Funciones
    setSelectedSector: handleSectorClick,
    placeBet,
    handlePhysicalSpin,
    formatCurrency,
    
    // Estados de loading
    isPlacingBet,
    
    // Funciones adicionales
    refetch
  };
};
