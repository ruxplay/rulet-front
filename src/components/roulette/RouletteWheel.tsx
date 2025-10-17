'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { RouletteType, RouletteSector } from '@/types';

interface RouletteWheelProps {
  type: RouletteType;
  sectors: Array<RouletteSector | null>;
  rotation: number;
  highlightedSector?: number | null;
  onSectorClick: (sectorIndex: number) => void;
  isLoading?: boolean;
  isPhysicalMode?: boolean;
  onPhysicalSpin?: (winningSector: number) => void;
  shouldAutoSpin?: boolean;
}

export interface RouletteWheelRef {
  animateSpin: (finalRotation: number) => Promise<void>;
  highlightSector: (sectorIndex: number) => void;
  clearHighlight: () => void;
  startPhysicalSpin: (winningSector?: number) => void;
  detectWinningSector: () => number;
}

export const RouletteWheel = forwardRef<RouletteWheelRef, RouletteWheelProps>(
  ({ sectors, rotation, highlightedSector, onSectorClick, isLoading, isPhysicalMode = false, onPhysicalSpin, shouldAutoSpin = false }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const currentRotationRef = useRef(rotation);
    const isSpinningRef = useRef(false);

    const NUM_SECTORS = 15;

    // Función para dibujar la ruleta
    const drawWheel = useCallback((
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      currentRotation: number,
      highlightSector?: number | null
    ) => {
      const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#8AC24A', '#F06292', '#7986CB', '#FF7043',
        '#26A69A', '#7E57C2', '#DCE775', '#FF8A65', '#81C784'
      ];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = canvas.width / 2 - 20;

      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dibujar círculo exterior
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.lineWidth = 10;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.stroke();

      const anglePerSector = (2 * Math.PI) / NUM_SECTORS;

      // Dibujar sectores
      for (let i = 0; i < NUM_SECTORS; i++) {
        const startAngle = currentRotation + i * anglePerSector;
        const endAngle = startAngle + anglePerSector;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        // Color del sector
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        // Borde del sector
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Número del sector
        const textAngle = startAngle + anglePerSector / 2;
        const textX = centerX + (radius / 1.8) * Math.cos(textAngle);
        const textY = centerY + (radius / 1.8) * Math.sin(textAngle);
        
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText((i + 1).toString(), 0, 0);
        ctx.restore();

        // Información del jugador si existe
        const sectorData = sectors[i];
        if (sectorData && sectorData.username) {
          const infoX = centerX + (radius - 25) * Math.cos(textAngle);
          const infoY = centerY + (radius - 25) * Math.sin(textAngle);
          
          ctx.save();
          ctx.translate(infoX, infoY);
          ctx.rotate(textAngle + Math.PI / 2);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 2;

          const name = sectorData.username.length > 10
            ? `${sectorData.username.substring(0, 8)}...`
            : sectorData.username;

          ctx.fillText(name, 0, 0);
          ctx.restore();
        }
      }

      // Resaltar sector seleccionado
      if (highlightSector !== null && highlightSector !== undefined) {
        const startAngle = currentRotation + highlightSector * anglePerSector;
        const endAngle = startAngle + anglePerSector;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Dibujar centro
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Los punteros ahora se dibujan como elementos HTML/CSS fuera del canvas
    }, [sectors]);

    // Función para manejar clic en el canvas
    const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = canvas.width / 2 - 20;

      const x = event.clientX - rect.left - centerX;
      const y = event.clientY - rect.top - centerY;
      const distance = Math.sqrt(x * x + y * y);

      if (distance >= radius) return;

      const angle = Math.atan2(y, x);
      const normalizedAngle = (angle - currentRotationRef.current + 2 * Math.PI) % (2 * Math.PI);
      const selectedSector = Math.floor(normalizedAngle / (2 * Math.PI / NUM_SECTORS));

      onSectorClick(selectedSector);
    }, [onSectorClick]);

    // Función para animar el giro con desaceleración realista
    const animateSpin = useCallback((finalRotation: number): Promise<void> => {
      return new Promise((resolve) => {
        const startRotation = currentRotationRef.current;
        const rotationDelta = finalRotation - startRotation;
        const duration = 4000; // 4 segundos para más emoción
        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Función de desaceleración más realista (ease-out-cubic con bounce)
          let easeOut;
          if (progress < 0.8) {
            // Primera fase: desaceleración suave
            easeOut = 1 - Math.pow(1 - progress / 0.8, 4);
          } else {
            // Segunda fase: desaceleración final con micro-bounce
            const finalProgress = (progress - 0.8) / 0.2;
            const bounce = Math.sin(finalProgress * Math.PI * 3) * 0.1 * (1 - finalProgress);
            easeOut = 0.8 + (0.2 * finalProgress) + bounce;
          }
          
          const currentRotation = startRotation + rotationDelta * easeOut;
          
          currentRotationRef.current = currentRotation;

          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              drawWheel(ctx, canvas, currentRotation);
            }
          }

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            // Asegurar que termine exactamente en la rotación final
            currentRotationRef.current = finalRotation;
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                drawWheel(ctx, canvas, finalRotation);
              }
            }
            resolve();
          }
        };

        animationRef.current = requestAnimationFrame(animate);
      });
    }, [drawWheel]);

    // Función para calcular la rotación objetivo que haga que los punteros apunten al sector correcto
    const calculateTargetRotation = useCallback((winningSector: number) => {
      const anglePerSector = (2 * Math.PI) / NUM_SECTORS;
      
      // Calcular la rotación para que el sector ganador quede exactamente en 12 en punto (0 grados)
      // El sector ganador debe estar en la posición 0 grados (12 en punto)
      let targetRotation = winningSector * anglePerSector;
      
      // Ajustar para que el centro del sector quede exactamente en 12 en punto
      // Restamos la mitad del ángulo del sector para centrarlo
      targetRotation = targetRotation - (anglePerSector / 2);
      
      // Rotar en sentido contrario para que el sector quede en 12 en punto
      targetRotation = -targetRotation;
      
      // Normalizar la rotación para que esté entre 0 y 2π
      targetRotation = ((targetRotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
      
      console.log('🎯 Calculando rotación objetivo:', {
        winningSector,
        anglePerSector,
        targetRotation: targetRotation,
        targetRotationDegrees: (targetRotation * 180) / Math.PI,
        sectorCenterDegrees: (winningSector * anglePerSector * 180) / Math.PI,
        expectedPosition: '12 en punto (0 grados)'
      });
      
      return targetRotation;
    }, [NUM_SECTORS]);

    // Función para iniciar giro físico con sector ganador del backend
    const startPhysicalSpin = useCallback((winningSector?: number) => {
      if (isSpinningRef.current) return;
      
      isSpinningRef.current = true;
      console.log('🎰 Iniciando giro físico de la ruleta...');
      
      if (winningSector === undefined) {
        console.log('❌ No se proporcionó winningSector del backend');
        isSpinningRef.current = false;
        return;
      }
      
      console.log('🎯 Sector ganador del backend:', winningSector);
      
      // Simular giro físico con animación hacia el sector específico
      const spinDuration = 4000; // 4 segundos
      const startTime = Date.now();
      const startRotation = currentRotationRef.current;
      
      // Calcular rotación final para que el sector ganador quede en 12 en punto
      const targetRotation = calculateTargetRotation(winningSector);
      const finalRotation = startRotation + (Math.random() * 8 + 4) * Math.PI + (targetRotation - startRotation);
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // Easing function para desaceleración natural con micro-bounce
        let easeOut;
        if (progress < 0.8) {
          // Ease-out cúbico para la mayor parte de la animación
          easeOut = 1 - Math.pow(1 - progress / 0.8, 3);
        } else {
          // Micro-bounce para el final
          const finalProgress = (progress - 0.8) / 0.2;
          easeOut = 0.8 + 0.2 * (1 - Math.pow(1 - finalProgress, 4));
        }
        
        const currentRotation = startRotation + (finalRotation - startRotation) * easeOut;
        currentRotationRef.current = currentRotation;
        
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawWheel(ctx, canvas, currentRotation, highlightedSector);
          }
        }
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Asegurar que la rotación final sea exacta
          currentRotationRef.current = targetRotation;
          
          // Dibujar la ruleta en la posición final correcta
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              drawWheel(ctx, canvasRef.current, targetRotation, highlightedSector);
            }
          }
          
          isSpinningRef.current = false;
          console.log('🎯 Animación completada, sector ganador:', winningSector);
        }
      };
      
      animate();
    }, [drawWheel, highlightedSector, calculateTargetRotation]);

    // Función para detectar el sector ganador
    const detectWinningSector = useCallback(() => {
      const currentRotation = currentRotationRef.current;
      
      // Normalizar la rotación
      const normalizedRotation = ((currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      
      // Calcular el sector basado en la rotación
      const anglePerSector = (2 * Math.PI) / NUM_SECTORS;
      
      // Ajustar para que el sector 0 esté en 12 en punto
      const adjustedRotation = normalizedRotation + (anglePerSector / 2);
      const sector = Math.floor(adjustedRotation / anglePerSector) % NUM_SECTORS;
      
      console.log('🔍 Detección física:', {
        rotation: currentRotation,
        normalizedRotation,
        adjustedRotation,
        sector,
        anglePerSector
      });
      
      return sector;
    }, [NUM_SECTORS]);

    // Efecto para giro automático (DESHABILITADO - se maneja desde useRoulette)
    // useEffect(() => {
    //   console.log('🎰 shouldAutoSpin cambió:', { shouldAutoSpin, isSpinning: isSpinningRef.current });
    //   if (shouldAutoSpin && !isSpinningRef.current) {
    //     console.log('🎰 Giro automático activado');
    //     startPhysicalSpin();
    //   }
    // }, [shouldAutoSpin, startPhysicalSpin]);

    // Exponer métodos al componente padre
    useImperativeHandle(ref, () => ({
      animateSpin,
      highlightSector: (sectorIndex: number) => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawWheel(ctx, canvas, currentRotationRef.current, sectorIndex);
          }
        }
      },
      clearHighlight: () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawWheel(ctx, canvas, currentRotationRef.current);
          }
        }
      },
      startPhysicalSpin,
      detectWinningSector
    }), [animateSpin, drawWheel, startPhysicalSpin, detectWinningSector]);

    // Efecto para dibujar la ruleta cuando cambian las props
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Si hay rotación > 0, ejecutar animación
      if (rotation > 0) {
        animateSpin(rotation);
      } else {
        // Dibujar ruleta estática
        currentRotationRef.current = rotation;
        drawWheel(ctx, canvas, rotation, highlightedSector);
      }
    }, [rotation, highlightedSector, drawWheel, animateSpin]);

    // Limpiar animación al desmontar
    useEffect(() => {
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, []);

  return (
    <div className="roulette-wheel-container">
      <div className="roulette-wheel-shadow"></div>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="roulette-wheel-canvas"
        onClick={handleCanvasClick}
      />
      <div className="roulette-wheel-center"></div>
      
      {/* Punteros profesionales para los 3 ganadores */}
      <div className="roulette-pointer roulette-main-pointer"></div>
      <div className="roulette-pointer roulette-left-pointer"></div>
      <div className="roulette-pointer roulette-right-pointer"></div>
    </div>
  );
  }
);

RouletteWheel.displayName = 'RouletteWheel';
