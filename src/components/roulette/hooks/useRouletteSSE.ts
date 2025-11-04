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
import { updateUserStats } from '@/store/slices/authSlice';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { adminDepositsApi } from '@/store/api/adminDepositsApi';
import { adminWithdrawalsApi } from '@/store/api/adminWithdrawalsApi';
import { rouletteApi } from '@/store/api/rouletteApi';

export const useRouletteSSE = (type: RouletteType, currentMesaId?: string | null) => {
  const [winners, setWinners] = useState<RouletteWinners | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isWaitingForResult, setIsWaitingForResult] = useState(false);
  const [currentMesaIdForSpin, setCurrentMesaIdForSpin] = useState<string | null>(null);
  
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

  useEffect(() => {
    currentMesaIdRef.current = currentMesaId || null;
  }, [currentMesaId]);

  useEffect(() => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    if (modalTimeoutRef.current) {
      clearTimeout(modalTimeoutRef.current);
      modalTimeoutRef.current = null;
    }

    const sseUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.RULETA.SSE_ENDPOINTS.STREAM}`;
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {};
    eventSource.onerror = (error) => console.error('❌ ERROR SSE:', error);

    // --- Eventos principales ---
    eventSource.addEventListener('mesa.closed', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // 🟢 LOG DE LO QUE ENVÍA EL BACKEND
        console.log('📡 BACKEND ENVÍA - mesa.closed:', {
          mesaId: data.mesaId,
          type: data.type,
          ganadorPrincipal: {
            username: data.winners?.main?.username,
            sector: data.winners?.main?.index,
            numero: data.winners?.main?.index !== undefined ? data.winners.main.index + 1 : null,
            prize: data.winners?.main?.prize
          },
          ganadorIzquierdo: {
            username: data.winners?.left?.username,
            sector: data.winners?.left?.index,
            numero: data.winners?.left?.index !== undefined ? data.winners.left.index + 1 : null,
            prize: data.winners?.left?.prize
          },
          ganadorDerecho: {
            username: data.winners?.right?.username,
            sector: data.winners?.right?.index,
            numero: data.winners?.right?.index !== undefined ? data.winners.right.index + 1 : null,
            prize: data.winners?.right?.prize
          }
        });
        
        if (data.winners && data.mesaId && currentMesaIdRef.current && data.mesaId === currentMesaIdRef.current) {
          if (usernameRef.current && data.winners) {
            const winners = data.winners;
            let totalWinnings = 0;
            if (winners.main?.username === usernameRef.current) totalWinnings += winners.main.prize || 0;
            if (winners.left?.username === usernameRef.current) totalWinnings += winners.left.prize || 0;
            if (winners.right?.username === usernameRef.current) totalWinnings += winners.right.prize || 0;
            if (totalWinnings > 0) {
              dispatch(updateUserStats({ wins: totalWinnings }));
            }
          }
          setWinners(data.winners);
          modalTimeoutRef.current = setTimeout(() => setShowModal(true), 15000);
        }
        const mesaType = data.type || '150';
        dispatch(rouletteApi.util.invalidateTags([
          { type: 'RouletteMesa', id: mesaType },
          { type: 'Roulette', id: mesaType },
          { type: 'RouletteMesa', id: mesaType === '150' ? '300' : '150' },
          { type: 'Roulette', id: mesaType === '150' ? '300' : '150' }
        ]));
      } catch (error) {
        console.error('❌ Error parsing mesa.closed:', error);
      }
    });

    eventSource.addEventListener('mesa.updated', (event) => {
      try {
        const data: MesaUpdatedEvent['payload'] = JSON.parse(event.data);
        const mesa = data.mesa;
        const shouldReset = mesa.filledCount === 15;
        setMesaActivity(prev => ({
          ...prev,
          [mesa.mesaId]: {
            type: data.type,
            activePlayers: shouldReset ? 0 : mesa.filledCount,
            maxPlayers: 15,
            status: mesa.status === 'waiting_for_result' ? 'waiting' : (mesa.status as any),
            etaSeconds: prev[mesa.mesaId]?.etaSeconds,
            spinStartTime: prev[mesa.mesaId]?.spinStartTime,
          }
        }));
        dispatch(rouletteApi.util.invalidateTags([
          { type: 'RouletteMesa', id: data.type },
          { type: 'Roulette', id: data.type }
        ]));
      } catch (error) {
        console.error('❌ Error parsing mesa.updated:', error);
      }
    });

    eventSource.addEventListener('mesa.spinning', (event) => {
      try {
        const data: MesaSpinningEvent['payload'] = JSON.parse(event.data);
        setMesaActivity(prev => ({
          ...prev,
          [data.mesaId]: {
            ...prev[data.mesaId],
            activePlayers: 0,
            maxPlayers: 15,
            status: 'spinning',
            etaSeconds: data.etaSeconds,
            spinStartTime: data.spinStartTime,
          }
        }));
        dispatch(rouletteApi.util.invalidateTags([
          { type: 'RouletteMesa', id: data.type },
          { type: 'Roulette', id: data.type }
        ]));
      } catch (error) {
        console.error('❌ Error parsing mesa.spinning:', error);
      }
    });

    eventSource.addEventListener('snapshot', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data['150'] || data['300']) {
          Object.entries(data).forEach(([type, mesaData]: [string, any]) => {
            if (mesaData?.mesa) {
              const mesa = mesaData.mesa;
              setMesaActivity(prev => ({
                ...prev,
                [mesa.mesaId]: {
                  type: type as RouletteType,
                  activePlayers: mesa.filledCount ?? 0,
                  maxPlayers: 15,
                  status: mesa.status === 'waiting_for_result' ? 'waiting' : (mesa.status ?? 'waiting'),
                  etaSeconds: mesa.etaSeconds || undefined,
                }
              }));
            }
          });
          dispatch(rouletteApi.util.invalidateTags([
            { type: 'RouletteMesa', id: '150' },
            { type: 'Roulette', id: '150' },
            { type: 'RouletteMesa', id: '300' },
            { type: 'Roulette', id: '300' }
          ]));
        } else if (data.mesa) {
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
            }
          }));
          dispatch(rouletteApi.util.invalidateTags([
            { type: 'RouletteMesa', id: mesaType },
            { type: 'Roulette', id: mesaType }
          ]));
        }
      } catch (error) {
        console.error('❌ Error parsing snapshot:', error);
      }
    });

    eventSource.addEventListener('mesa.waiting_for_result', (event) => {
      try {
        const data: MesaWaitingForResultEvent['payload'] = JSON.parse(event.data);
        const mesa = data.mesa;
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

    eventSource.addEventListener('user.balance.updated', (event) => {
      try {
        const data: UserBalanceUpdatedEvent['payload'] = JSON.parse(event.data);
        if (!data?.username) return;
        if (data.username === usernameRef.current) {
          dispatch(updateUserStats({
            balance: data.balance,
            wins: data.wins,
            losses: data.losses
          }));
          switch (data.reason) {
            case 'deposit_approved':
              if (data.depositAmount !== undefined)
                alertsRef.current.showSuccess('✅ Depósito Aprobado', `Tu depósito de ${data.depositAmount} RUX ha sido aprobado`);
              break;
            case 'deposit_rejected':
              if (data.depositAmount !== undefined)
                alertsRef.current.showError('❌ Depósito Rechazado', `Tu depósito de ${data.depositAmount} RUX ha sido rechazado`);
              break;
            case 'bet':
              if (data.betAmount !== undefined)
                alertsRef.current.showInfo('💸 Apuesta Realizada', `Has apostado ${data.betAmount} RUX`);
              break;
            case 'spin_prize':
              if (data.prize !== undefined) {
                const prizeAmount = data.prize;
                setTimeout(() => {
                  alertsRef.current.showSuccess('🎉 ¡Ganaste!', `¡Felicitaciones! Has ganado ${prizeAmount} RUX`);
                }, 16000);
              }
              break;
            case 'withdrawal_approved':
              if (data.withdrawalAmount !== undefined)
                alertsRef.current.showInfo('✅ Retiro Aprobado', `Tu retiro de ${data.withdrawalAmount} RUX ha sido procesado`);
              break;
            case 'withdrawal_rejected':
              if (data.withdrawalAmount !== undefined)
                alertsRef.current.showInfo('ℹ️ Retiro Rechazado', `Tu retiro de ${data.withdrawalAmount} RUX ha sido rechazado`);
              break;
          }
        }
      } catch (error) {
        console.error('❌ Error parsing user.balance.updated:', error);
      }
    });

    eventSource.addEventListener('bet.placed', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data?.username) return;
        if (data.username === usernameRef.current) {
          dispatch(updateUserStats({
            balance: data.balance,
            losses: data.losses
          }));
        }
      } catch (error) {
        console.error('❌ Error parsing bet.placed:', error);
      }
    });

    eventSource.addEventListener('deposit.created', (event) => {
      try {
        const deposit: DepositEventPayload = JSON.parse(event.data);
        dispatch(adminDepositsApi.util.invalidateTags(['Deposit']));
        if (roleRef.current === 'admin') {
          alertsRef.current.showInfo('💰 Nuevo Depósito Pendiente', `${deposit.fullName || deposit.username} - ${deposit.amount} RUX (${deposit.paymentMethod})`);
        }
      } catch (error) {
        console.error('❌ Error parsing deposit.created:', error);
      }
    });

    eventSource.addEventListener('deposit.approved', (event) => {
      try {
        const deposit: DepositEventPayload = JSON.parse(event.data);
        dispatch(adminDepositsApi.util.invalidateTags(['Deposit']));
        if (roleRef.current === 'admin') {
          alertsRef.current.showSuccess('✅ Depósito Aprobado', `${deposit.username} - ${deposit.amount} RUX`);
        }
      } catch (error) {
        console.error('❌ Error parsing deposit.approved:', error);
      }
    });

    eventSource.addEventListener('deposit.rejected', (event) => {
      try {
        const deposit: DepositEventPayload = JSON.parse(event.data);
        dispatch(adminDepositsApi.util.invalidateTags(['Deposit']));
        if (roleRef.current === 'admin') {
          alertsRef.current.showError('❌ Depósito Rechazado', `${deposit.username} - ${deposit.amount} RUX`);
        }
      } catch (error) {
        console.error('❌ Error parsing deposit.rejected:', error);
      }
    });

    eventSource.addEventListener('withdrawal.created', (event) => {
      try {
        const withdrawal: WithdrawalEventPayload = JSON.parse(event.data);
        dispatch(adminWithdrawalsApi.util.invalidateTags(['Withdrawal']));
        if (roleRef.current === 'admin') {
          alertsRef.current.showInfo('💸 Nuevo Retiro Pendiente', `${withdrawal.username} - ${withdrawal.monto} RUX (${withdrawal.payment_method})`);
        }
      } catch (error) {
        console.error('❌ Error parsing withdrawal.created:', error);
      }
    });

    eventSource.addEventListener('withdrawal.approved', (event) => {
      try {
        const withdrawal: WithdrawalEventPayload = JSON.parse(event.data);
        dispatch(adminWithdrawalsApi.util.invalidateTags(['Withdrawal']));
        if (roleRef.current === 'admin') {
          alertsRef.current.showSuccess('✅ Retiro Aprobado', `${withdrawal.username} - ${withdrawal.monto} RUX`);
        }
      } catch (error) {
        console.error('❌ Error parsing withdrawal.approved:', error);
      }
    });

    eventSource.addEventListener('withdrawal.rejected', (event) => {
      try {
        const withdrawal: WithdrawalEventPayload = JSON.parse(event.data);
        dispatch(adminWithdrawalsApi.util.invalidateTags(['Withdrawal']));
        if (roleRef.current === 'admin') {
          alertsRef.current.showError('❌ Retiro Rechazado', `${withdrawal.username} - ${withdrawal.monto} RUX`);
        }
      } catch (error) {
        console.error('❌ Error parsing withdrawal.rejected:', error);
      }
    });

    eventSource.addEventListener('house.total_earnings.updated', (event) => {
      try {
        const totalEarnings = JSON.parse(event.data);
        dispatch(rouletteApi.util.invalidateTags([
          { type: 'Roulette', id: 'total-house-earnings' }
        ]));
      } catch (error) {
        console.error('❌ Error parsing house.total_earnings.updated:', error);
      }
    });

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
