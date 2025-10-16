'use client';

import { RouletteType, RouletteMesa } from '@/types';

interface RouletteControlsProps {
  type: RouletteType;
  mesa: RouletteMesa | null;
  selectedSector: number | null;
  onPlaceBet: () => Promise<void>;
  isPlacingBet: boolean;
  isLoading: boolean;
  error: any;
}

export const RouletteControls = ({
  type,
  mesa,
  selectedSector,
  onPlaceBet,
  isPlacingBet,
  isLoading,
  error
}: RouletteControlsProps) => {
  const betAmount = type === '150' ? 150 : 300;

  const handlePlaceBet = async () => {
    try {
      await onPlaceBet();
    } catch (error) {
      console.error('Error al apostar:', error);
    }
  };

  const getButtonText = () => {
    if (isPlacingBet) return 'Apostando...';
    if (isLoading) return 'Cargando...';
    
    // Si no hay mesa activa pero hay sector seleccionado, permitir apostar
    if (!mesa && selectedSector !== null) {
      return `Crear Mesa y Apostar ${betAmount}`;
    }
    
    if (!mesa) return 'Cargando mesa...';
    if (mesa.status === 'spinning') return 'Ruleta girando...';
    if (mesa.status === 'closed') return 'Mesa cerrada';
    if (selectedSector === null) return `Selecciona un número (${betAmount})`;
    return `Apostar ${betAmount}`;
  };

  const isButtonDisabled = () => {
    // Permitir apostar si es error 404 (no hay mesa activa) y hay sector seleccionado
    const isNoActiveMesa = error?.status === 404 || error?.data?.code === 'NO_ACTIVE_MESA';
    
    if (isNoActiveMesa && selectedSector !== null) {
      return isLoading || isPlacingBet;
    }
    
    // Si no hay mesa activa pero hay sector seleccionado, permitir apostar
    if (!mesa && selectedSector !== null) {
      return isLoading || isPlacingBet;
    }
    
    return (
      isLoading ||
      isPlacingBet ||
      !mesa ||
      mesa.status !== 'open' ||
      selectedSector === null
    );
  };

  const getStatusMessage = () => {
    if (error) {
      // Si es error 404, significa que no hay mesa activa (normal para primera vez)
      if (error?.status === 404 || error?.data?.code === 'NO_ACTIVE_MESA') {
        return {
          text: `No hay mesa activa para Ruleta ${betAmount}. Haz la primera apuesta para crear la mesa.`,
          type: 'info'
        };
      }
      
      return {
        text: 'Error al cargar la mesa',
        type: 'error'
      };
    }

    if (!mesa) {
      return {
        text: 'Cargando mesa disponible...',
        type: 'loading'
      };
    }

    if (mesa.status === 'spinning') {
      return {
        text: 'La ruleta está girando, espera los resultados...',
        type: 'spinning'
      };
    }

    if (mesa.status === 'closed') {
      return {
        text: 'La mesa está cerrada. Espera a la siguiente mesa.',
        type: 'closed'
      };
    }

    if (selectedSector !== null) {
      return {
        text: `Número ${selectedSector + 1} seleccionado`,
        type: 'success'
      };
    }

    return {
      text: `Haz clic en un número para apostar ${betAmount}`,
      type: 'info'
    };
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="roulette-controls">
      <div className="bet-controls">
        <button
          className="bet-button"
          onClick={handlePlaceBet}
          disabled={isButtonDisabled()}
          type="button"
        >
          {getButtonText()}
        </button>
        
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      </div>

      {/* Información de la mesa */}
      {mesa && (
        <div className="mesa-info">
          <div className="mesa-id">
            <span className="id-label">Mesa ID:</span>
            <span className="id-value">{mesa.mesaId}</span>
          </div>
          
          <div className="mesa-status">
            <span className="status-label">Estado:</span>
            <span className={`status-value ${mesa.status}`}>
              {mesa.status === 'open' && 'Abierta'}
              {mesa.status === 'spinning' && 'Girando'}
              {mesa.status === 'closed' && 'Cerrada'}
            </span>
          </div>
          
          <div className="mesa-progress">
            <span className="progress-label">Progreso:</span>
            <span className="progress-value">
              {mesa.filledCount} / 15 sectores
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(mesa.filledCount / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
