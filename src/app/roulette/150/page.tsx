'use client';

import { useEffect } from 'react';
import {
  RouletteWheel,
  RouletteControls,
  RouletteBets,
  RouletteResults,
  ProfessionalWinnersModal,
  RoulettePageSelector,
  useRoulette
} from '@/components/roulette';
import { useAuth } from '@/components/layout/hooks/useAuth';
import { ProtectedPage } from '@/components/auth/ProtectedPage';

function Roulette150Content() {
  // Obtener información del usuario
  const { authState } = useAuth();
  
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
    rotation
  } = useRoulette('150');

  return (
    <div className="roulette-page">
      <div className="roulette-container">
        {/* Header */}
        <div className="roulette-header">
          <h1 className="roulette-title">Ruleta</h1>
          
          {/* Selector de páginas */}
          <RoulettePageSelector currentType="150" />
          
          {/* Información del usuario */}
          <div className="user-info" style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            color: 'white',
            fontSize: '14px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <strong>Usuario:</strong> {authState.user?.username || 'No definido'}
              </div>
              <div>
                <strong>Saldo:</strong> {(authState.user as { balance?: number | string })?.balance !== undefined ? formatCurrency(Number((authState.user as { balance?: number | string }).balance!)) : 'No definido'}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="roulette-content">
          {/* Ruleta */}
          <div className="roulette-wheel-section">
            <RouletteWheel
              type="150"
              sectors={mesa?.sectors || Array(15).fill(null)}
              rotation={rotation}
              highlightedSector={selectedSector}
              onSectorClick={setSelectedSector}
              isLoading={isLoading || isSpinning}
            />
          </div>

          {/* Controles */}
          <div className="roulette-controls-section">
            <RouletteControls
              type="150"
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
              type="150"
              sectors={mesa?.sectors || []}
              filledCount={mesa?.filledCount || 0}
            />
          </div>
        </div>

        {/* Resultados */}
        <div className="roulette-results-section">
          <RouletteResults
            type="150"
            winners={lastWinners}
            formatCurrency={formatCurrency}
          />
        </div>

        {/* Modal profesional de ganadores */}
        <ProfessionalWinnersModal
          show={showWinnerModal}
          onClose={setShowWinnerModal}
          winners={lastWinners}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
}

export default function Roulette150Page() {
  return (
    <ProtectedPage>
      <Roulette150Content />
    </ProtectedPage>
  );
}
