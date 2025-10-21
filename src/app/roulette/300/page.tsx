'use client';

import { useEffect, useRef } from 'react';
import {
  RouletteWheel,
  RouletteControls,
  RouletteBets,
  RouletteResults,
  ProfessionalWinnersModal,
  RoulettePageSelector,
  useRoulette,
  useRouletteSSE
} from '@/components/roulette';
import { RouletteWheelRef } from '@/components/roulette/RouletteWheel';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { ProtectedPage } from '@/components/auth/ProtectedPage';

function Roulette300Content() {
  // Obtener información del usuario
  const { authState } = useAuth();
  
  // Referencia para la ruleta
  const rouletteWheelRef = useRef<RouletteWheelRef>(null);
  
  useEffect(() => {
    const user = authState.user as { balance?: number | string };
    const balance = user?.balance;
    console.log('🔎 Balance (authState.user):', { user, balance });
  }, [authState.user]);

  const {
    mesa,
    isLoading,
    error,
    selectedSector,
    setSelectedSector,
    placeBet,
    isPlacingBet,
    lastWinners,
    showWinnerModal,
    setShowWinnerModal,
    formatCurrency,
    isSpinning,
    rotation,
    isPhysicalMode,
    countdown,
    isAutoSpinning,
    isWaitingForResult,
    currentMesaIdForSpin,
    handlePhysicalSpin,
    isWaitingForNewMesa
  } = useRoulette('300');

  // Debug: Log del estado de la mesa
  useEffect(() => {
    console.log('🔍 Estado de la mesa en página 300:', {
      mesa,
      isLoading,
      error,
      selectedSector,
      isSpinning,
      countdown,
      isAutoSpinning
    });
  }, [mesa, isLoading, error, selectedSector, isSpinning, countdown, isAutoSpinning]);
  
  // Obtener ganadores desde SSE
  const { winners: sseWinners } = useRouletteSSE('300', mesa?.mesaId);

  // Efecto para activar el giro prolongado cuando isSpinning cambia
  useEffect(() => {
    if (isSpinning && rouletteWheelRef.current) {
      console.log('🎰 Activando giro prolongado desde isSpinning:', isSpinning);
      // Iniciar giro prolongado (sin sector específico, esperando resultado del backend)
      rouletteWheelRef.current.startPhysicalSpin();
    }
  }, [isSpinning]);

  // Efecto para ajustar al sector final cuando llega el resultado del backend
  useEffect(() => {
    console.log('🔍 sseWinners cambió:', sseWinners);
    if (sseWinners && sseWinners.main && rouletteWheelRef.current) {
      console.log('🎯 Ajustando al sector final del backend:', sseWinners.main.index);
      rouletteWheelRef.current.startPhysicalSpin(sseWinners.main.index);
    } else {
      console.log('❌ No se puede ajustar al sector final:', {
        hasSseWinners: !!sseWinners,
        hasMain: !!(sseWinners && sseWinners.main),
        hasRef: !!rouletteWheelRef.current,
        sseWinners
      });
    }
  }, [sseWinners]);

  // Función para manejar el giro físico desde el botón
  const handlePhysicalSpinFromButton = () => {
    console.log('🎰 Botón GIRAR RULETA presionado');
    if (rouletteWheelRef.current) {
      console.log('🎯 Iniciando giro físico...');
      rouletteWheelRef.current.startPhysicalSpin();
    } else {
      console.error('❌ Referencia de ruleta no disponible');
    }
  };

  return (
    <div className="roulette-page">
      <div className="roulette-container">
        {/* Header */}
        <div className="roulette-header">
          <h1 className="roulette-title">Ruleta</h1>
          
          {/* Selector de páginas */}
          <RoulettePageSelector currentType="300" />
          
          {/* Información del usuario */}
          <div className="roulette-user-info">
            <span>Usuario: {authState.user?.username || 'No definido'}</span>
            <span className="balance">Saldo: {(authState.user as { balance?: number | string })?.balance !== undefined ? formatCurrency(Number((authState.user as { balance?: number | string }).balance!)) : 'No definido'}</span>
          </div>
          
          {/* Countdown simple */}
          {countdown && (
            <div className="countdown-display">
              ¡La ruleta gira en {countdown}!
            </div>
          )}
          
          {/* Indicador de espera después del giro */}
          {isWaitingForNewMesa && (
            <div className="waiting-display">
              ⏰ Preparando nueva mesa en 60 segundos...
            </div>
          )}
        </div>

        {/* Contenido principal */}
        <div className="roulette-content">
          {/* Ruleta */}
          <div className="roulette-wheel-section">
            <RouletteWheel
              ref={rouletteWheelRef}
              type="300"
              sectors={mesa?.sectors || Array(15).fill(null)}
              rotation={rotation}
              highlightedSector={selectedSector}
              onSectorClick={setSelectedSector}
              isLoading={isLoading || isSpinning}
              isPhysicalMode={isPhysicalMode}
              onPhysicalSpin={handlePhysicalSpin}
            />
          </div>

          {/* Controles */}
          <div className="roulette-controls-section">
            <RouletteControls
              type="300"
              mesa={mesa}
              selectedSector={selectedSector}
              onPlaceBet={placeBet}
              isPlacingBet={isPlacingBet}
              isLoading={isLoading || isSpinning}
              error={(error as { status?: number; data?: { code?: string } } | null) || null}
            />
          </div>

          {/* Apuestas actuales */}
          <div className="roulette-bets-section">
            <RouletteBets
              type="300"
              sectors={mesa?.sectors || []}
              filledCount={mesa?.filledCount || 0}
            />
          </div>
        </div>

        {/* Resultados - OCULTADO: Solo se muestra el modal profesional */}
        {/* <div className="roulette-results-section">
          <RouletteResults
            type="300"
            winners={lastWinners}
            formatCurrency={formatCurrency}
          />
        </div> */}

        {/* Modal profesional de ganadores */}
        <ProfessionalWinnersModal
          show={showWinnerModal}
          onClose={setShowWinnerModal}
          winners={lastWinners}
          formatCurrency={formatCurrency}
          type="300"
        />
      </div>
    </div>
  );
}

export default function Roulette300Page() {
  return (
    <ProtectedPage>
      <Roulette300Content />
    </ProtectedPage>
  );
}
