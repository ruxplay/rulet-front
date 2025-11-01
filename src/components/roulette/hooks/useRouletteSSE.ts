'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  RouletteType, 
  RouletteWinners, 
  UserBalanceUpdatedEvent, 
  MesaWaitingForResultEvent, 
  MesaResultSubmittedEvent,
  MesaUpdatedEvent,
  MesaSpinningEvent,
  DepositEventPayload,
  WithdrawalEventPayload 
} from '@/types';
import { API_CONFIG } from '@/lib/api/config';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {  updateUserStats } from '@/store/slices/authSlice';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { adminDepositsApi } from '@/store/api/adminDepositsApi';
import { adminWithdrawalsApi } from '@/store/api/adminWithdrawalsApi';
import { rouletteApi } from '@/store/api/rouletteApi';

export const useRouletteSSE = (type: RouletteType, currentMesaId?: string | null) => {
  const [winners, setWinners] = useState<RouletteWinners | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Debug: rastrear cambios en showModal
  const [isWaitingForResult, setIsWaitingForResult] = useState(false);
  const [currentMesaIdForSpin, setCurrentMesaIdForSpin] = useState<string | null>(null);
  
  // Estado para actividad de mesas
  const [mesaActivity, setMesaActivity] = useState<{
    [mesaId: string]: {
      type?: RouletteType;
      activePlayers: number;
      maxPlayers: number;
      status: 'waiting' | 'spinning' | 'closed';
      etaSeconds?: number;
      spinStartTime?: string;
    };
  }>({});
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentMesaIdRef = useRef<string | null>(null);
  const modalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useAppDispatch();
  const currentUsername = useAppSelector((state) => state.auth.user?.username);
  const currentUserRole = useAppSelector((state) => state.auth.user?.role);
  const { showSuccess, showInfo, showError } = useSweetAlert();

  // Refs para evitar que cambien las dependencias del efecto SSE
  const alertsRef = useRef({ showSuccess, showInfo, showError });
  const usernameRef = useRef(currentUsername);
  const roleRef = useRef(currentUserRole);

  useEffect(() => {
    alertsRef.current = { showSuccess, showInfo, showError };
  }, [showSuccess, showInfo, showError]);

  useEffect(() => {
    usernameRef.current = currentUsername;
  }, [currentUsername]);

  useEffect(() => {
    roleRef.current = currentUserRole;
  }, [currentUserRole]);

  // Actualizar ref cuando cambie currentMesaId
  useEffect(() => {
    currentMesaIdRef.current = currentMesaId || null;
  }, [currentMesaId]);

  useEffect(() => {
    // Cerrar conexión anterior si existe
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Limpiar timeout anterior si existe
    if (modalTimeoutRef.current) {
      clearTimeout(modalTimeoutRef.current);
      modalTimeoutRef.current = null;
    }

    // Crear nueva conexión SSE - Stream unificado para ambas ruletas + eventos de usuario (depósitos, apuestas, premios)
    const sseUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.RULETA.SSE_ENDPOINTS.STREAM}`;
    
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    // Evento de conexión
    eventSource.onopen = () => {
    };

    // Evento de error
    eventSource.onerror = (error) => {
      console.error('❌ ERROR SSE:', error);
    };

    // Log general para todos los eventos SSE (sin nombre específico)
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
          if (usernameRef.current && data.winners) {
            const winners = data.winners;
            let totalWinnings = 0;
            
            // Verificar si el usuario ganó como principal
            if (winners.main && winners.main.username === usernameRef.current) {
              totalWinnings += winners.main.prize || 0;
            }
            
            // Verificar si el usuario ganó como secundario (izquierda)
            if (winners.left && winners.left.username === usernameRef.current) {
              totalWinnings += winners.left.prize || 0;
            }
            
            // Verificar si el usuario ganó como secundario (derecha)
            if (winners.right && winners.right.username === usernameRef.current) {
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
        
        // Invalidar cache de RTK Query cuando una mesa se cierra (puede ser 150 o 300)
        // Invalidamos ambos tipos para asegurar que el AdminStatsProvider se actualice
        const mesaType = data.type || '150'; // Intentar obtener el tipo, default a '150'
        dispatch(rouletteApi.util.invalidateTags([
          { type: 'RouletteMesa', id: mesaType },
          { type: 'Roulette', id: mesaType },
          // También invalidar el otro tipo por seguridad
          { type: 'RouletteMesa', id: mesaType === '150' ? '300' : '150' },
          { type: 'Roulette', id: mesaType === '150' ? '300' : '150' }
        ]));
      } catch (error) {
        console.error('❌ Error parsing mesa.closed:', error);
      }
    });

    // Evento: mesa actualizada
    eventSource.addEventListener('mesa.updated', (event) => {
      try {
        const data: MesaUpdatedEvent['payload'] = JSON.parse(event.data);
        const mesa = data.mesa;
        
        // Resetear contador a 0/15 cuando la mesa llega a 15/15 (sin importar el status)
        // Esto permite que el dashboard muestre 0/15 listo para el siguiente juego
        // El reset ocurre cuando filledCount === 15 porque la mesa está completa
        const shouldReset = mesa.filledCount === 15;
        
        if (shouldReset) {
          console.log('🔄 Reseteando contador a 0/15 - Mesa completada:', {
            mesaId: mesa.mesaId,
            type: data.type,
            filledCount: mesa.filledCount,
            status: mesa.status
          });
        }
        
        setMesaActivity(prev => {
          const prevMesa = prev[mesa.mesaId] || undefined;
          return {
            ...prev,
            [mesa.mesaId]: {
              type: data.type,
              activePlayers: shouldReset ? 0 : mesa.filledCount,
              maxPlayers: 15,
              status: mesa.status === 'waiting_for_result' ? 'waiting' : (mesa.status as 'waiting' | 'spinning' | 'closed'), 
              // Mantener ETA si existe
              etaSeconds: prevMesa?.etaSeconds,
              spinStartTime: prevMesa?.spinStartTime,
            }
          };
        });
        
        // Invalidar cache de RTK Query para actualizar queries relacionadas (AdminStatsProvider, etc.)
        dispatch(rouletteApi.util.invalidateTags([
          { type: 'RouletteMesa', id: data.type },
          { type: 'Roulette', id: data.type }
        ]));
      } catch (error) {
        console.error('❌ Error parsing mesa.updated:', error);
      }
    });

    // Evento: mesa girando
    eventSource.addEventListener('mesa.spinning', (event) => {
      try {
        const data: MesaSpinningEvent['payload'] = JSON.parse(event.data);
        console.log('🎰 Mesa girando:', data);
        
        setMesaActivity(prev => {
          const prevMesa = prev[data.mesaId];
          // Cuando la mesa está girando, significa que ya llegó a 15/15
          // Siempre mostrar 0/15 (listo para siguiente juego)
          
          return {
            ...prev,
            [data.mesaId]: {
              ...prevMesa,
              activePlayers: 0, // Resetear a 0 cuando está girando
              maxPlayers: 15,
              status: 'spinning',
              etaSeconds: data.etaSeconds,
              spinStartTime: data.spinStartTime,
            }
          };
        });
        
        // Invalidar cache de RTK Query para actualizar queries relacionadas (AdminStatsProvider, etc.)
        dispatch(rouletteApi.util.invalidateTags([
          { type: 'RouletteMesa', id: data.type },
          { type: 'Roulette', id: data.type }
        ]));
        
      } catch (error) {
        console.error('❌ Error parsing mesa.spinning:', error);
      }
    });

    // Evento: snapshot inicial
    eventSource.addEventListener('snapshot', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // El snapshot puede venir en dos formatos:
        // 1. Para endpoint /stream: { "150": {...}, "300": {...} }
        // 2. Para endpoint /:type/stream: { type, mesa }
        
        if (data['150'] || data['300']) {
          // Formato para endpoint unificado (ambas ruletas)
          Object.entries(data).forEach(([type, mesaData]: [string, any]) => {
            if (mesaData?.mesa) {
              const mesa = mesaData.mesa;
              setMesaActivity(prev => ({
                ...prev,
                [mesa.mesaId]: {
                  type: (type as RouletteType),
                  activePlayers: mesa.filledCount ?? 0,
                  maxPlayers: 15,
                  status: mesa.status === 'waiting_for_result' ? 'waiting' : (mesa.status ?? 'waiting'),
                  etaSeconds: mesa.etaSeconds || undefined,
                  spinStartTime: undefined,
                }
              }));
            }
          });
          
          // Invalidar cache de RTK Query para ambas ruletas en snapshot unificado
          dispatch(rouletteApi.util.invalidateTags([
            { type: 'RouletteMesa', id: '150' },
            { type: 'Roulette', id: '150' },
            { type: 'RouletteMesa', id: '300' },
            { type: 'Roulette', id: '300' }
          ]));
        } else if (data.mesa) {
          // Formato para endpoint por tipo
          const mesa = data.mesa;
          const mesaType = (data.type as RouletteType | undefined) || '150';
          setMesaActivity(prev => ({
            ...prev,
            [mesa.mesaId]: {
              type: mesaType,
              activePlayers: mesa.filledCount ?? 0,
              maxPlayers: 15,
              status: mesa.status === 'waiting_for_result' ? 'waiting' : (mesa.status ?? 'waiting'),
              etaSeconds: mesa.etaSeconds || undefined,
              spinStartTime: undefined,
            }
          }));
          
          // Invalidar cache de RTK Query para el tipo específico
          dispatch(rouletteApi.util.invalidateTags([
            { type: 'RouletteMesa', id: mesaType },
            { type: 'Roulette', id: mesaType }
          ]));
        }
      } catch (error) {
        console.error('❌ Error parsing snapshot:', error);
      }
    });

    // Evento: mesa lista para girar (ruleta física)
    eventSource.addEventListener('mesa.waiting_for_result', (event) => {
      try {
        const data: MesaWaitingForResultEvent['payload'] = JSON.parse(event.data);
        const mesa = data.mesa;
        
        // Actualizar actividad de la mesa con la información completa
        // Si filledCount es 15, mostrar 0/15 (mesa completa, lista para siguiente juego)
        const activePlayers = mesa.filledCount === 15 ? 0 : mesa.filledCount;
        
        setMesaActivity(prev => ({
          ...prev,
          [mesa.mesaId]: {
            type: data.type,
            activePlayers,
            maxPlayers: 15,
            status: 'waiting',
            etaSeconds: prev[mesa.mesaId]?.etaSeconds,
            spinStartTime: prev[mesa.mesaId]?.spinStartTime,
          }
        }));
        
        // Invalidar cache de RTK Query para actualizar queries relacionadas (AdminStatsProvider, etc.)
        dispatch(rouletteApi.util.invalidateTags([
          { type: 'RouletteMesa', id: data.type },
          { type: 'Roulette', id: data.type }
        ]));
        
        if (mesa.mesaId && currentMesaIdRef.current && mesa.mesaId === currentMesaIdRef.current) {
          setIsWaitingForResult(true);
          setCurrentMesaIdForSpin(mesa.mesaId);
        }
      } catch (error) {
        console.error('❌ Error parsing mesa.waiting_for_result:', error);
      }
    });

    // Evento: resultado enviado al backend
    eventSource.addEventListener('mesa.result_submitted', (event) => {
      try {
        const data: MesaResultSubmittedEvent['payload'] = JSON.parse(event.data);
        if (data.mesaId && currentMesaIdRef.current && data.mesaId === currentMesaIdRef.current) {
          setIsWaitingForResult(false);
          setCurrentMesaIdForSpin(null);
        }
      } catch (error) {
        console.error('❌ Error parsing mesa.result_submitted:', error);
      }
    });

    // Evento: balance de usuario actualizado
    eventSource.addEventListener('user.balance.updated', (event) => {
      try {
        const data: UserBalanceUpdatedEvent['payload'] = JSON.parse(event.data);
        console.log('🔔 SSE user.balance.updated recibido:', { data, currentUsername: usernameRef.current });
        if (!data || !data.username) return;
        if (data.username === usernameRef.current) {
          console.log('✅ Actualizando estado del usuario:', { 
            balance: data.balance, 
            wins: data.wins, 
            losses: data.losses 
          });
          
          // Actualizar TODO el estado del usuario (balance, wins, losses)
          dispatch(updateUserStats({
            balance: data.balance,
            wins: data.wins,
            losses: data.losses
          }));
          
          // Mostrar notificación según la razón
          switch (data.reason) {
            case 'deposit_approved':
              if (data.depositAmount !== undefined) {
                alertsRef.current.showSuccess(
                  '✅ Depósito Aprobado',
                  `Tu depósito de ${data.depositAmount} RUX ha sido aprobado y agregado a tu balance`
                );
              }
              break;
            case 'deposit_rejected':
              if (data.depositAmount !== undefined) {
                alertsRef.current.showError(
                  '❌ Depósito Rechazado',
                  `Tu depósito de ${data.depositAmount} RUX ha sido rechazado. Revisa los detalles en la sección de depósitos`
                );
              }
              break;
            case 'bet':
              if (data.betAmount !== undefined) {
                alertsRef.current.showInfo(
                  '💸 Apuesta Realizada',
                  `Has apostado ${data.betAmount} RUX en la ruleta ${data.type || '150'}`
                );
              }
              break;
            case 'spin_prize':
              if (data.prize !== undefined) {
                alertsRef.current.showSuccess(
                  '🎉 ¡Ganaste!',
                  `¡Felicitaciones! Has ganado ${data.prize} RUX`
                );
              }
              break;
            case 'withdrawal_approved':
              if (data.withdrawalAmount !== undefined) {
                alertsRef.current.showInfo(
                  '✅ Retiro Aprobado',
                  `Tu retiro de ${data.withdrawalAmount} RUX ha sido aprobado y procesado`
                );
              }
              break;
            case 'withdrawal_rejected':
              if (data.withdrawalAmount !== undefined) {
                alertsRef.current.showInfo(
                  'ℹ️ Retiro Rechazado',
                  `Tu retiro de ${data.withdrawalAmount} RUX ha sido rechazado. El balance bloqueado ha sido devuelto`
                );
              }
              break;
          }
        }
      } catch (error) {
        console.error('❌ Error parsing user.balance.updated:', error);
      }
    });

    // Evento: apuesta realizada (para actualizar pérdidas)
    eventSource.addEventListener('bet.placed', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('🎯 SSE bet.placed recibido:', { data, currentUsername: usernameRef.current });
        if (!data || !data.username) return;
        if (data.username === usernameRef.current) {
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

    // Evento: nuevo depósito creado
    eventSource.addEventListener('deposit.created', (event) => {
      try {
        const deposit: DepositEventPayload = JSON.parse(event.data);
        console.log('💰 SSE deposit.created recibido:', { deposit });
        
        // Invalidar cache de RTK Query para refrescar la tabla de depósitos
        dispatch(adminDepositsApi.util.invalidateTags(['Deposit']));
        
        // Mostrar notificación al admin
        if (roleRef.current === 'admin') {
          alertsRef.current.showInfo(
            '💰 Nuevo Depósito Pendiente',
            `${deposit.fullName || deposit.username} - ${deposit.amount} RUX (${deposit.paymentMethod})`
          );
        }
      } catch (error) {
        console.error('❌ Error parsing deposit.created:', error);
      }
    });

    // Evento: depósito aprobado
    eventSource.addEventListener('deposit.approved', (event) => {
      try {
        const deposit: DepositEventPayload = JSON.parse(event.data);
        console.log('✅ SSE deposit.approved recibido:', { deposit });
        
        // Invalidar cache de RTK Query
        dispatch(adminDepositsApi.util.invalidateTags(['Deposit']));
        
        // Mostrar notificación al admin
        if (roleRef.current === 'admin') {
          alertsRef.current.showSuccess(
            '✅ Depósito Aprobado',
            `${deposit.username} - ${deposit.amount} RUX`
          );
        }
      } catch (error) {
        console.error('❌ Error parsing deposit.approved:', error);
      }
    });

    // Evento: depósito rechazado
    eventSource.addEventListener('deposit.rejected', (event) => {
      try {
        const deposit: DepositEventPayload = JSON.parse(event.data);
        console.log('❌ SSE deposit.rejected recibido:', { deposit });
        
        // Invalidar cache de RTK Query
        dispatch(adminDepositsApi.util.invalidateTags(['Deposit']));
        
        // Mostrar notificación al admin
        if (roleRef.current === 'admin') {
          alertsRef.current.showError(
            '❌ Depósito Rechazado',
            `${deposit.username} - ${deposit.amount} RUX`
          );
        }
      } catch (error) {
        console.error('❌ Error parsing deposit.rejected:', error);
      }
    });

    // Evento: nuevo retiro creado
    eventSource.addEventListener('withdrawal.created', (event) => {
      try {
        const withdrawal: WithdrawalEventPayload = JSON.parse(event.data);
        console.log('💸 SSE withdrawal.created recibido:', { withdrawal });
        
        // Invalidar cache de RTK Query para refrescar la tabla de retiros
        dispatch(adminWithdrawalsApi.util.invalidateTags(['Withdrawal']));
        
        // Mostrar notificación al admin
        if (roleRef.current === 'admin') {
          alertsRef.current.showInfo(
            '💸 Nuevo Retiro Pendiente',
            `${withdrawal.username} - ${withdrawal.monto} RUX (${withdrawal.payment_method})`
          );
        }
      } catch (error) {
        console.error('❌ Error parsing withdrawal.created:', error);
      }
    });

    // Evento: retiro aprobado
    eventSource.addEventListener('withdrawal.approved', (event) => {
      try {
        const withdrawal: WithdrawalEventPayload = JSON.parse(event.data);
        console.log('✅ SSE withdrawal.approved recibido:', { withdrawal });
        
        // Invalidar cache de RTK Query
        dispatch(adminWithdrawalsApi.util.invalidateTags(['Withdrawal']));
        
        // Mostrar notificación al admin
        if (roleRef.current === 'admin') {
          alertsRef.current.showSuccess(
            '✅ Retiro Aprobado',
            `${withdrawal.username} - ${withdrawal.monto} RUX`
          );
        }
      } catch (error) {
        console.error('❌ Error parsing withdrawal.approved:', error);
      }
    });

    // Evento: retiro rechazado
    eventSource.addEventListener('withdrawal.rejected', (event) => {
      try {
        const withdrawal: WithdrawalEventPayload = JSON.parse(event.data);
        console.log('❌ SSE withdrawal.rejected recibido:', { withdrawal });
        
        // Invalidar cache de RTK Query
        dispatch(adminWithdrawalsApi.util.invalidateTags(['Withdrawal']));
        
        // Mostrar notificación al admin
        if (roleRef.current === 'admin') {
          alertsRef.current.showError(
            '❌ Retiro Rechazado',
            `${withdrawal.username} - ${withdrawal.monto} RUX`
          );
        }
      } catch (error) {
        console.error('❌ Error parsing withdrawal.rejected:', error);
      }
    });

    // Evento: actualización de ganancias totales de la casa
    eventSource.addEventListener('house.total_earnings.updated', (event) => {
      try {
        const totalEarnings = JSON.parse(event.data);
        console.log('💰 SSE house.total_earnings.updated recibido:', totalEarnings);
        
        // Invalidar cache de RTK Query para que AdminStatsProvider refetch automáticamente
        dispatch(rouletteApi.util.invalidateTags([
          { type: 'Roulette', id: 'total-house-earnings' }
        ]));
      } catch (error) {
        console.error('❌ Error parsing house.total_earnings.updated:', error);
      }
    });

    // Cleanup al desmontar
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
        modalTimeoutRef.current = null;
      }
    };
  }, []);

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
    mesaActivity,
    setWinners,
    setShowModal
  };
};
