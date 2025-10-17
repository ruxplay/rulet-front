'use client';

import { useEffect, useRef, useState } from 'react';
import { RouletteType, RouletteWinners, UserBalanceUpdatedEvent, MesaWaitingForResultEvent, MesaResultSubmittedEvent } from '@/types';
import { API_CONFIG } from '@/lib/api/config';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { updateUserBalance, updateUserWins, updateUserLosses, updateUserStats } from '@/store/slices/authSlice';

export const useRouletteSSE = (type: RouletteType, currentMesaId?: string | null) => {
  const [winners, setWinners] = useState<RouletteWinners | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Debug: rastrear cambios en showModal
  useEffect(() => {
    console.log('🔍 useRouletteSSE - showModal cambió:', showModal);
  }, [showModal]);
  const [isWaitingForResult, setIsWaitingForResult] = useState(false);
  const [currentMesaIdForSpin, setCurrentMesaIdForSpin] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentMesaIdRef = useRef<string | null>(null);
  const modalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useAppDispatch();
  const currentUsername = useAppSelector((state) => state.auth.user?.username);

  // Actualizar ref cuando cambie currentMesaId
  useEffect(() => {
    currentMesaIdRef.current = currentMesaId || null;
  }, [currentMesaId]);

  useEffect(() => {
    console.log('🔍 useRouletteSSE - useEffect ejecutándose para type:', type);
    
    // Cerrar conexión anterior si existe
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Limpiar timeout anterior si existe
    if (modalTimeoutRef.current) {
      clearTimeout(modalTimeoutRef.current);
      modalTimeoutRef.current = null;
    }

    // Crear nueva conexión SSE - usar el stream unificado que emite eventos de usuario
    const sseUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.RULETA.SSE_ENDPOINTS.STREAM}`;
    
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    // Evento de conexión
    eventSource.onopen = () => {
      console.log('🔌 SSE conectado a:', sseUrl);
    };

    // Evento de error
    eventSource.onerror = (error) => {
      console.error('❌ ERROR SSE:', error);
    };

    // Log general para todos los eventos SSE
    eventSource.onmessage = (event) => {
      console.log('📡 Evento SSE recibido:', event.type, event.data);
    };

    // Evento: mesa cerrada con ganadores
    eventSource.addEventListener('mesa.closed', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('🎯 SSE mesa.closed recibido:', data);
        
        // Solo mostrar ganadores si es la mesa actual
        console.log('🔍 Verificando mesa.closed:', {
          hasWinners: !!data.winners,
          mesaId: data.mesaId,
          currentMesaId: currentMesaIdRef.current,
          isCurrentMesa: data.mesaId === currentMesaIdRef.current
        });
        
        if (data.winners && data.mesaId && currentMesaIdRef.current && data.mesaId === currentMesaIdRef.current) {
          
          // Verificar si el usuario actual es ganador y actualizar wins
          if (currentUsername && data.winners) {
            const winners = data.winners;
            let totalWinnings = 0;
            
            // Verificar si el usuario ganó como principal
            if (winners.main && winners.main.username === currentUsername) {
              totalWinnings += winners.main.prize || 0;
            }
            
            // Verificar si el usuario ganó como secundario (izquierda)
            if (winners.left && winners.left.username === currentUsername) {
              totalWinnings += winners.left.prize || 0;
            }
            
            // Verificar si el usuario ganó como secundario (derecha)
            if (winners.right && winners.right.username === currentUsername) {
              totalWinnings += winners.right.prize || 0;
            }
            
            // Actualizar ganancias si el usuario ganó algo
            if (totalWinnings > 0) {
              console.log('🏆 Usuario ganó:', totalWinnings);
              // Usar el nuevo reducer combinado para actualizar wins
              dispatch(updateUserStats({
                wins: totalWinnings
              }));
            } else {
              console.log('❌ Usuario no ganó nada en esta ronda');
            }
          }
          
          // Establecer ganadores inmediatamente
          setWinners(data.winners);
          
          // Mostrar modal después de 15 segundos
          console.log('🎯 Programando modal de ganadores en 15 segundos...');
          modalTimeoutRef.current = setTimeout(() => {
            console.log('🎯 Mostrando modal de ganadores después de 15 segundos');
            setShowModal(true);
          }, 15000); // 15 segundos de delay
        } else {
        }
      } catch (error) {
        console.error('❌ Error parsing mesa.closed:', error);
      }
    });

    // Evento: mesa actualizada
    eventSource.addEventListener('mesa.updated', () => {
      // Evento recibido pero no procesado actualmente
    });

    // Evento: mesa girando
    eventSource.addEventListener('mesa.spinning', () => {
      // Evento recibido pero no procesado actualmente
    });

    // Evento: snapshot inicial
    eventSource.addEventListener('snapshot', () => {
      // Evento recibido pero no procesado actualmente
    });

    // Evento: mesa lista para girar (ruleta física)
    eventSource.addEventListener('mesa.waiting_for_result', (event) => {
      try {
        const data: MesaWaitingForResultEvent['payload'] = JSON.parse(event.data);
        console.log('🎰 Mesa lista para girar:', data);
        if (data.mesaId && currentMesaIdRef.current && data.mesaId === currentMesaIdRef.current) {
          setIsWaitingForResult(true);
          setCurrentMesaIdForSpin(data.mesaId);
          console.log('✅ Mesa lista para girar ruleta física:', data.mesaId);
        }
      } catch (error) {
        console.error('❌ Error parsing mesa.waiting_for_result:', error);
      }
    });

    // Evento: resultado enviado al backend
    eventSource.addEventListener('mesa.result_submitted', (event) => {
      try {
        const data: MesaResultSubmittedEvent['payload'] = JSON.parse(event.data);
        console.log('📤 Resultado enviado al backend:', data);
        if (data.mesaId && currentMesaIdRef.current && data.mesaId === currentMesaIdRef.current) {
          setIsWaitingForResult(false);
          setCurrentMesaIdForSpin(null);
          console.log('✅ Resultado procesado por el backend');
        }
      } catch (error) {
        console.error('❌ Error parsing mesa.result_submitted:', error);
      }
    });

    // Evento: balance de usuario actualizado
    eventSource.addEventListener('user.balance.updated', (event) => {
      try {
        const data: UserBalanceUpdatedEvent['payload'] = JSON.parse(event.data);
        console.log('🔔 SSE user.balance.updated recibido:', { data, currentUsername });
        if (!data || !data.username) return;
        if (data.username === currentUsername) {
          console.log('✅ Actualizando balance del usuario:', { balance: data.balance });
          // Actualizar solo el balance ya que losses y wins no están en el payload
          dispatch(updateUserBalance(data.balance));
        }
      } catch (error) {
        console.error('❌ Error parsing user.balance.updated:', error);
      }
    });

    // Evento: apuesta realizada (para actualizar pérdidas)
    eventSource.addEventListener('bet.placed', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('🎯 SSE bet.placed recibido:', { data, currentUsername });
        if (!data || !data.username) return;
        if (data.username === currentUsername) {
          console.log('💸 Usuario realizó apuesta, actualizando stats:', { bet: data.bet, balance: data.balance, losses: data.losses });
          // Usar el nuevo reducer combinado para actualizar múltiples campos
          dispatch(updateUserStats({
            balance: data.balance,
            losses: data.losses
          }));
        }
      } catch (error) {
        console.error('❌ Error parsing bet.placed:', error);
      }
    });

    // Cleanup al desmontar
    return () => {
      console.log('🧹 useRouletteSSE - Limpiando conexión SSE');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
        modalTimeoutRef.current = null;
      }
    };
  }, [type, currentUsername, dispatch]);

  // Función para cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setWinners(null);
    if (modalTimeoutRef.current) {
      clearTimeout(modalTimeoutRef.current);
      modalTimeoutRef.current = null;
    }
  };

  return {
    winners,
    showModal,
    closeModal,
    isWaitingForResult,
    currentMesaIdForSpin,
    setWinners,
    setShowModal
  };
};
