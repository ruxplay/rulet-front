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
}

export interface RouletteWheelRef {
  animateSpin: (finalRotation: number) => Promise<void>;
  highlightSector: (sectorIndex: number) => void;
  clearHighlight: () => void;
}

export const RouletteWheel = forwardRef<RouletteWheelRef, RouletteWheelProps>(
  ({ sectors, rotation, highlightedSector, onSectorClick, isLoading }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const currentRotationRef = useRef(rotation);

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

      // Dibujar punteros
      const drawPointer = (x: number, y: number, rotation: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-15, -30);
        ctx.lineTo(15, -30);
        ctx.closePath();
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.restore();
      };

      // Puntero principal
      drawPointer(centerX, centerY - 20, 0);
      
      // Punteros laterales
      drawPointer(centerX - 90, centerY + 10, -0.5);
      drawPointer(centerX + 90, centerY + 10, 0.5);
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

    // Función para animar el giro
    const animateSpin = useCallback((finalRotation: number): Promise<void> => {
      return new Promise((resolve) => {
        const startRotation = currentRotationRef.current;
        const rotationDelta = finalRotation - startRotation;
        const duration = 6000; // 6 segundos (como el archivo original)
        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function (ease-out)
          const easeOut = 1 - Math.pow(1 - progress, 3);
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
            resolve();
          }
        };

        animationRef.current = requestAnimationFrame(animate);
      });
    }, [drawWheel]);

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
      }
    }));

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
      <div className="wheel-container">
        <div className="wheel-shadow"></div>
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="wheel"
          onClick={handleCanvasClick}
        />
        <div className="wheel-center"></div>
        {isLoading && rotation === 0 && (
          <div className="wheel-loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">Cargando...</div>
          </div>
        )}
      </div>
    );
  }
);

RouletteWheel.displayName = 'RouletteWheel';
