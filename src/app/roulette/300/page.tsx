'use client';

import { useEffect, useRef } from 'react';
import {
  RouletteWheel,
  RouletteControls,
  RouletteBets,
 
  ProfessionalWinnersModal,
  RoulettePageSelector,
  useRoulette,
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
  
    handlePhysicalSpin,
    isWaitingForNewMesa,
    sseWinners // ← AGREGADO: Obtener sseWinners desde useRoulette
  } = useRoulette('300');

  // Debug: Log del estado de la mesa
  useEffect(() => {
    // Log eliminado para reducir spam
  }, [mesa, isLoading, error, selectedSector, isSpinning, countdown, isAutoSpinning, sseWinners]);
  
  // Obtener ganadores desde SSE (usando el hook de useRoulette, no duplicado)
  // const { winners: sseWinners } = useRouletteSSE('300', mesa?.mesaId); // ← ELIMINADO: Duplicado

  // ELIMINADO: Este useEffect causaba el primer giro innecesario
  // Ahora solo esperamos el resultado del backend para hacer UN SOLO GIRO

  // Efecto para ajustar al sector final cuando llega el resultado del backend
  useEffect(() => {
    if (sseWinners && sseWinners.main && rouletteWheelRef.current) {
      console.log('🎯 sseWinners recibidos, esperando 3 segundos antes de girar...');
      
      // Delay de 3 segundos después de recibir los datos del backend
      const timeoutId = setTimeout(() => {
        console.log('🎯 Iniciando giro después del delay de 3 segundos');
        rouletteWheelRef.current?.startPhysicalSpin(sseWinners.main.index);
      }, 3000);
      
      // Cleanup del timeout si el componente se desmonta
      return () => clearTimeout(timeoutId);
    }
  }, [sseWinners]);



  return (
    <div className="roulette-page">
      <div className="roulette-container">
        {/* Header */}
        <div className="roulette-header">
          <h1 className="roulette-title">Rulet</h1>
          
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
              mesaId={mesa?.mesaId}
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
