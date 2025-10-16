'use client';

import { useEffect, useRef, useState } from 'react';
import { RouletteType, RouletteWinners, UserBalanceUpdatedEvent } from '@/types';
import { API_CONFIG } from '@/lib/api/config';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { updateUserBalance } from '@/store/slices/authSlice';

export const useRouletteSSE = (type: RouletteType, currentMesaId?: string | null) => {
  const [winners, setWinners] = useState<RouletteWinners | null>(null);
  const [showModal, setShowModal] = useState(false);
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
        
        // Solo mostrar ganadores si es la mesa actual
        if (data.winners && data.mesaId && currentMesaIdRef.current && data.mesaId === currentMesaIdRef.current) {
          
          // Establecer ganadores inmediatamente
          setWinners(data.winners);
          
          // Mostrar modal después de 6 segundos (duración de la animación)
          modalTimeoutRef.current = setTimeout(() => {
            setShowModal(true);
          }, 6000);
        } else {
        }
      } catch (error) {
        console.error('❌ Error parsing mesa.closed:', error);
      }
    });

    // Evento: mesa actualizada
    eventSource.addEventListener('mesa.updated', (event) => {
      try {
        const data = JSON.parse(event.data);
      } catch (error) {
        console.error('❌ Error parsing mesa.updated:', error);
      }
    });

    // Evento: mesa girando
    eventSource.addEventListener('mesa.spinning', (event) => {
      try {
        const data = JSON.parse(event.data);
      } catch (error) {
        console.error('❌ Error parsing mesa.spinning:', error);
      }
    });

    // Evento: snapshot inicial
    eventSource.addEventListener('snapshot', (event) => {
      try {
        const data = JSON.parse(event.data);
      } catch (error) {
        console.error('❌ Error parsing snapshot:', error);
      }
    });

    // Evento: balance de usuario actualizado
    eventSource.addEventListener('user.balance.updated', (event) => {
      try {
        const data: UserBalanceUpdatedEvent['payload'] = JSON.parse(event.data);
        console.log('🔔 SSE user.balance.updated recibido:', { data, currentUsername });
        if (!data || !data.username) return;
        if (data.username === currentUsername) {
          console.log('✅ Actualizando balance del usuario:', data.balance);
          dispatch(updateUserBalance(data.balance));
        }
      } catch (error) {
        console.error('❌ Error parsing user.balance.updated:', error);
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
  }, [type]);

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
    closeModal
  };
};
