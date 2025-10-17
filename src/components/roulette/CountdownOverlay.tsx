'use client';

interface CountdownOverlayProps {
  countdown: number | null;
  isAutoSpinning: boolean;
  isSpinning?: boolean;
}

export const CountdownOverlay = ({ countdown, isAutoSpinning, isSpinning = false }: CountdownOverlayProps) => {
  if (!countdown && !isAutoSpinning && !isSpinning) return null;

  return (
    <div className="countdown-overlay">
      <div className="countdown-content">
        {countdown ? (
          <>
            <div className="countdown-number">{countdown}</div>
            <div className="countdown-text">¡La ruleta gira en...</div>
          </>
        ) : isSpinning ? (
          <>
            <div className="countdown-spinning girando">🎰</div>
            <div className="countdown-text girando">¡GIRANDO!</div>
          </>
        ) : (
          <>
            <div className="countdown-spinning">🎰</div>
            <div className="countdown-text">¡GIRANDO!</div>
          </>
        )}
      </div>
    </div>
  );
};
