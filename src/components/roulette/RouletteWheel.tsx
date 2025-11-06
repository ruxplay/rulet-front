'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import Image from 'next/image';
import { RouletteType, RouletteSector } from '@/types';
import { SectorButton } from './SectorButton';
import '@/styles/components/sector-button.css';

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
  mesaId?: string | null; // Para sincronización determinística
}

export interface RouletteWheelRef {
  animateSpin: (finalRotation: number) => Promise<void>;
  highlightSector: (sectorIndex: number) => void;
  clearHighlight: () => void;
  startPhysicalSpin: (winningSector?: number) => void;
  detectWinningSector: () => number;
}

export const RouletteWheel = forwardRef<RouletteWheelRef, RouletteWheelProps>(
  ({ type, sectors, rotation, highlightedSector, onSectorClick, isLoading, isPhysicalMode = false, onPhysicalSpin, shouldAutoSpin = false, mesaId }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);
    const currentRotationRef = useRef(rotation);
    const isSpinningRef = useRef(false);
    const expectedWinningSectorRef = useRef<number | null>(null); // Guardar el sector esperado del backend
    const originalTargetRotationRef = useRef<number | null>(null); // Guardar targetRotation original sin normalizar
    
    // Estado para forzar re-render de botones SVG durante la animación
    const [currentAnimationRotation, setCurrentAnimationRotation] = useState(rotation);
    const [forceRender, setForceRender] = useState(0); // Estado adicional para forzar re-render
    const [isMounting, setIsMounting] = useState(true); // Estado para ocultar durante el montaje inicial

    const NUM_SECTORS = 15;
    const [canvasSize, setCanvasSize] = useState<number>(400);

    // Función para dibujar la ruleta
    const drawWheel = useCallback((
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      currentRotation: number,
      highlightSector?: number | null
    ) => {
      // Paleta de colores de la aplicación (15 colores únicos - sin repeticiones)
      const colors = [
        '#0A192F', // 1. Azul Petróleo Oscuro (Primary)
        '#00FF9C', // 2. Verde Neón (Secondary)
        '#FF8C42', // 3. Naranja (combina con la paleta)
        '#000000', // 4. Negro
        '#3498db', // 5. Azul Información (Info)
        '#20B2AA', // 6. Azul Agua Marina
        '#dc2626', // 7. Rojo Intenso (Ganador Secundario)
        '#dcf30a', // 8. Amarillo Intenso (Ganador Terciario)
        '#2c3e50', // 9. Azul Petróleo Claro (Primary Light)
        '#C7A008', // 10. Dorado (color hover del botón admin en header)
        '#00CED1', // 11. Turquesa Claro (combina con la paleta)
        '#9ED54A', // 12. Verde-Amarillo (gradiente difuminado del botón Continuar Jugando)
        '#FF6B6B', // 13. Coral/Rosa Suave (buen contraste para números)
        '#B0B0B0', // 14. Gris Muted (Text Muted - de la paleta extendida)
        '#8B5CF6'  // 15. Púrpura Violeta 
      ];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      // Margen dinámico: en móviles reduce el espacio para ampliar visualmente el círculo
      const dynamicMargin = Math.max(6, Math.round(canvas.width * 0.02));
      const radius = canvas.width / 2 - dynamicMargin;

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
        const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 480px)').matches;
        const numberFontSize = isMobile ? 12 : 18;
        ctx.font = `bold ${numberFontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText((i + 1).toString(), 0, 0);
        ctx.restore();

        // Información del jugador si existe
        const sectorData = sectors[i];
        if (sectorData && sectorData.username) {
          const isMobileForName = typeof window !== 'undefined' && window.matchMedia('(max-width: 480px)').matches;
          const nameOffset = isMobileForName ? -15 : -25; // Más alejado del centro en móvil
          const infoX = centerX + (radius + nameOffset) * Math.cos(textAngle);
          const infoY = centerY + (radius + nameOffset) * Math.sin(textAngle);
          
          ctx.save();
          ctx.translate(infoX, infoY);
          ctx.rotate(textAngle + Math.PI / 2);
          ctx.fillStyle = '#fff';
          const nameFontSize = isMobileForName ? 9 : 15; // 9px en móvil, 15px en PC/tablet
          ctx.font = `bold ${nameFontSize}px Arial`;
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
        
        // Detectar si es móvil para aplicar estilos diferentes
        const isMobileForHighlight = typeof window !== 'undefined' && window.matchMedia('(max-width: 480px)').matches;
        
        if (isMobileForHighlight) {
          // Móvil: verde neón más delgado
          ctx.fillStyle = 'rgba(0, 255, 156, 0.2)'; // Verde neón semitransparente
          ctx.fill();
          ctx.strokeStyle = '#00FF9C'; // Verde neón sólido
          ctx.lineWidth = 1.5; // Borde delgado
        } else {
          // Desktop: estilo original
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.8)';
          ctx.lineWidth = 3;
        }
        ctx.stroke();
      }

      // Centro de la ruleta ahora se dibuja como imagen HTML/CSS fuera del canvas
      // Los punteros ahora se dibujan como elementos HTML/CSS fuera del canvas
    }, [sectors]);

    // Sistema anti-doble clic SIMPLIFICADO
    const lastClickTimeRef = useRef<number>(0);
    const lastClickSectorRef = useRef<number>(-1);
    const CLICK_DEBOUNCE_TIME = 100; // 100ms entre clics (reducido)

    // Función para manejar clic en el canvas - SISTEMA RESPONSIVE MEJORADO
    const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // PREVENIR DOBLE CLIC: Verificar tiempo y sector
      const currentTime = Date.now();
      const rect = canvas.getBoundingClientRect();
      
      // DETECCIÓN DE DISPOSITIVO MÓVIL
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      // COORDENADAS RESPONSIVE: Ajustar para móviles
      let clickX, clickY;
      
      if (isMobile) {
        // Para móviles: usar coordenadas escaladas
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        clickX = (event.clientX - rect.left) * scaleX - canvas.width / 2;
        clickY = (event.clientY - rect.top) * scaleY - canvas.height / 2;
        
        console.log('📱 Coordenadas móviles:', {
          clientX: event.clientX,
          clientY: event.clientY,
          rectLeft: rect.left,
          rectTop: rect.top,
          rectWidth: rect.width,
          rectHeight: rect.height,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          scaleX: scaleX,
          scaleY: scaleY,
          clickX: Math.round(clickX),
          clickY: Math.round(clickY)
        });
      } else {
        // Para desktop: usar coordenadas normales
        clickX = event.clientX - rect.left - canvas.width / 2;
        clickY = event.clientY - rect.top - canvas.height / 2;
      }
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = canvas.width / 2 - 20;
      const distance = Math.sqrt(clickX * clickX + clickY * clickY);

    
      const maxRadius = radius + 40; // Expandir hacia afuera
      const minRadius = 20; // Permitir clics cerca del centro
      
      // Verificar que el clic esté en el área válida
      if (distance >= maxRadius || distance <= minRadius) return;

      // SISTEMA DE DETECCIÓN COMPLETA - TODA LA FORMA DEL SECTOR
      const selectedSector = getSectorFromClickPositionComplete(clickX, clickY, radius, currentRotationRef.current);
      
      // ANTI-DOBLE CLIC SIMPLIFICADO: Solo bloquear si es exactamente el mismo sector y muy reciente
      if (currentTime - lastClickTimeRef.current < CLICK_DEBOUNCE_TIME && 
          lastClickSectorRef.current === selectedSector) {
        console.log('🚫 Doble clic prevenido:', {
          sector: selectedSector + 1,
          timeDiff: currentTime - lastClickTimeRef.current,
          lastSector: lastClickSectorRef.current + 1
        });
        return;
      }

      // Actualizar referencias de tiempo y sector
      lastClickTimeRef.current = currentTime;
      lastClickSectorRef.current = selectedSector;
      
      // Debug visual - mostrar información detallada del clic
      console.log('🎯 Clic detectado (Responsive):', {
        dispositivo: isMobile ? 'MÓVIL' : 'DESKTOP',
        clickX: Math.round(clickX),
        clickY: Math.round(clickY),
        distance: Math.round(distance),
        minRadius: minRadius,
        radius: Math.round(radius),
        maxRadius: Math.round(maxRadius),
        clickAngle: Math.round((Math.atan2(clickY, clickX) * 180) / Math.PI),
        selectedSector: selectedSector,
        numeroVisual: selectedSector + 1,
        currentRotation: Math.round((currentRotationRef.current * 180) / Math.PI),
        timeSinceLastClick: currentTime - lastClickTimeRef.current,
        devicePixelRatio: devicePixelRatio
      });

      onSectorClick(selectedSector);
    }, [onSectorClick]);

    // Función para determinar el sector - DETECCIÓN SIMPLIFICADA Y CONFIABLE
    const getSectorFromClickPositionComplete = useCallback((clickX: number, clickY: number, radius: number, currentRotation: number): number => {
      // Calcular el ángulo del clic
      const clickAngle = Math.atan2(clickY, clickX);
      
      // Normalizar el ángulo para que esté entre 0 y 2π
      const normalizedClickAngle = (clickAngle + 2 * Math.PI) % (2 * Math.PI);
      
      // Calcular el ángulo ajustado por la rotación actual
      const adjustedAngle = (normalizedClickAngle - currentRotation + 2 * Math.PI) % (2 * Math.PI);
      
      // Calcular el sector basado en el ángulo ajustado - SIN CORRECCIÓN INCORRECTA
      const anglePerSector = (2 * Math.PI) / NUM_SECTORS;
      const sector = Math.floor(adjustedAngle / anglePerSector);
      
      // Debug específico para sectores problemáticos
      if (sector >= 9 && sector <= 13) { // Sectores 10, 11, 12, 13, 14
        console.log('🔍 Debug sector (REVERTIDO):', {
          sector: sector,
          numeroVisual: sector + 1,
          clickAngle: Math.round((clickAngle * 180) / Math.PI),
          normalizedAngle: Math.round((normalizedClickAngle * 180) / Math.PI),
          adjustedAngle: Math.round((adjustedAngle * 180) / Math.PI),
          currentRotation: Math.round((currentRotation * 180) / Math.PI),
          clickX: Math.round(clickX),
          clickY: Math.round(clickY)
        });
      }
      
      // Asegurar que el sector esté en el rango correcto
      return Math.max(0, Math.min(NUM_SECTORS - 1, sector));
    }, [NUM_SECTORS]);

    // Función para animar el giro con desaceleración realista (COMPORTAMIENTO ORIGINAL)
    const animateSpin = useCallback((finalRotation: number): Promise<void> => {
      return new Promise((resolve) => {
        // Cancelar cualquier animación actual
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        
        isSpinningRef.current = true; // Marcar que estamos girando
        const startRotation = currentRotationRef.current;
        const rotationDelta = finalRotation - startRotation;
        const duration = 6000; // 6 segundos con giro rápido
        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Función de desaceleración suave sin bounce (ease-out-cubic simple)
          const easeOut = 1 - Math.pow(1 - progress, 3);
          
          const currentRotation = startRotation + rotationDelta * easeOut;
          
          currentRotationRef.current = currentRotation;
          // Actualizar estado para sincronizar botones SVG con la animación
          setCurrentAnimationRotation(currentRotation);
          setForceRender(prev => prev + 1); // Forzar re-render de botones SVG
          
          // Debug: Log cada frame para verificar sincronización
          if (Math.floor(elapsed / 1000) !== Math.floor((elapsed - 16) / 1000)) {
            // Log eliminado para reducir spam en consola
          }

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
            
            const finalDrawRotation = currentRotationRef.current;
            
            // La animación ya terminó en el valor correcto, simplemente dibujar
            setCurrentAnimationRotation(finalDrawRotation);
            setForceRender(prev => prev + 1); // Forzar re-render final
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                drawWheel(ctx, canvas, finalDrawRotation);
              }
            }
            
         
            const expectedSector = expectedWinningSectorRef.current;
            const expectedNumber = expectedSector !== null ? expectedSector + 1 : null;
            
            // Declarar originalTargetRotation antes de usarlo
            const originalTargetRotation = originalTargetRotationRef.current;
            
           
            const anglePerSector = (2 * Math.PI) / NUM_SECTORS;
            const arrowOffset = 0.098; // 5.6° en radianes (corregido)
            
           
            let calculatedSector = expectedSector; // Por defecto, usar el esperado
            let calculatedNumber = expectedNumber;
            
            if (originalTargetRotation !== null) {
             
              const visualOffsetSectors = 8; // Mismo valor que en calculateTargetRotation
              const visualOffset = visualOffsetSectors * anglePerSector;
              const sectorCenterAngle = -originalTargetRotation + Math.PI / 2 - arrowOffset + visualOffset;
              const normalizedSectorCenterAngle = ((sectorCenterAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
              
        
              const sectorIndex = (normalizedSectorCenterAngle - anglePerSector / 2) / anglePerSector;
         
              calculatedSector = Math.round(sectorIndex) % NUM_SECTORS;
              if (calculatedSector < 0) calculatedSector += NUM_SECTORS;
              calculatedNumber = calculatedSector + 1;
              
              // DEBUG: Log detallado del cálculo
              console.log('🔍 DEBUG Cálculo sector desde targetRotation:', {
                originalTargetRotation,
                originalTargetRotationDegrees: (originalTargetRotation * 180) / Math.PI,
                sectorCenterAngle,
                sectorCenterAngleDegrees: (sectorCenterAngle * 180) / Math.PI,
                normalizedSectorCenterAngle,
                normalizedSectorCenterAngleDegrees: (normalizedSectorCenterAngle * 180) / Math.PI,
                sectorIndex,
                calculatedSector,
                expectedSector,
                diferencia: calculatedSector - (expectedSector || 0)
              });
            } else {
              // Fallback: calcular desde finalDrawRotation usando la misma lógica
              const adjustedRotation = finalDrawRotation + (Math.PI / 2) - arrowOffset;
              const normalizedAdjustedRotation = ((adjustedRotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
              calculatedSector = Math.floor(normalizedAdjustedRotation / anglePerSector) % NUM_SECTORS;
              calculatedNumber = calculatedSector + 1;
            }
            
         
            const arrowGlobalAngle = -Math.PI / 2 + arrowOffset; // Posición global de la flecha en el canvas
            
            // Normalizar finalDrawRotation (que ya usa normalizedTargetRotation si está disponible)
            const normalizedDrawRotation = ((finalDrawRotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
            

            let angleRelativeToSector0 = arrowGlobalAngle - normalizedDrawRotation;
            angleRelativeToSector0 = ((angleRelativeToSector0 % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
            
            // El sector que contiene este ángulo es:
            const visualSectorIndex = Math.floor(angleRelativeToSector0 / anglePerSector) % NUM_SECTORS;
            const visualSectorNumber = visualSectorIndex < 0 ? visualSectorIndex + NUM_SECTORS + 1 : visualSectorIndex + 1;
            
            // Calcular valores para comparación en el log
            // Nota: originalTargetRotation ya está declarado arriba
            const normalizedTargetRotation = originalTargetRotation !== null 
              ? ((originalTargetRotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
              : normalizedDrawRotation;
            
            // Verificar que normalizedDrawRotation sea igual a normalizedTargetRotation (debería serlo)
            const diferenciaNormalizacion = Math.abs(normalizedTargetRotation - normalizedDrawRotation) * 180 / Math.PI;
            
            console.log('🎯 RULETA SE DETIENE VISUALMENTE (SIN SALTOS):', {
              sectorIndexEsperado: expectedSector,
              numeroEnRuletaEsperado: expectedNumber,
              sectorIndexCalculado: calculatedSector,
              numeroEnRuletaCalculado: calculatedNumber,
              coinciden: expectedSector === calculatedSector,
              originalTargetRotationDegrees: originalTargetRotation !== null ? (originalTargetRotation * 180) / Math.PI : null,
              finalDrawRotationDegrees: (finalDrawRotation * 180) / Math.PI,
              // 🔍 CORRECCIÓN: Mostrar valores normalizados
              normalizedTargetRotationDegrees: (normalizedTargetRotation * 180) / Math.PI,
              normalizedDrawRotationDegrees: (normalizedDrawRotation * 180) / Math.PI,
              diferenciaNormalizacion: diferenciaNormalizacion,
              // ✅ Si diferenciaNormalizacion es 0, significa que la animación terminó correctamente sin saltos
              sinSaltos: diferenciaNormalizacion < 0.1,
              arrowOffsetApplied: arrowOffset,
              arrowOffsetDegrees: (arrowOffset * 180) / Math.PI,
              // 🔍 DATOS VISUALES REALES - Calculados con normalizedDrawRotation (valor real usado para dibujar)
              arrowGlobalAngleDegrees: (arrowGlobalAngle * 180) / Math.PI,
              angleRelativeToSector0Degrees: (angleRelativeToSector0 * 180) / Math.PI,
              sectorVisualmenteBajoFlecha: visualSectorIndex,
              numeroVisualmenteBajoFlecha: visualSectorNumber,
              desfaseVisual: expectedSector !== null ? visualSectorIndex - expectedSector : null,
              desfaseVisualGrados: expectedSector !== null ? ((visualSectorIndex - expectedSector) * (360 / NUM_SECTORS)) : null,
              nota: 'Animación termina naturalmente sin saltos - finalDrawRotation ya tiene la estructura correcta'
            });
            
           
            isSpinningRef.current = false; // Marcar que terminó el giro
            resolve();
          }
        };

        animationRef.current = requestAnimationFrame(animate);
      });
    }, [drawWheel]);

    const calculateTargetRotation = useCallback((winningSector: number) => {
      const anglePerSector = (2 * Math.PI) / NUM_SECTORS;
      
   
      const sectorCenterAngle = winningSector * anglePerSector + (anglePerSector / 2);
      
   
      
      // CORRECCIÓN: Usar el desplazamiento real de la flecha (5.6°, no 24°)
      const arrowOffset = 0.098; // 5.6° en radianes (desplazamiento real de la flecha verde)
      
      const visualOffsetSectors = 8; // 8 sectores de compensación
      const visualOffset = visualOffsetSectors * anglePerSector; // 192° en radianes
      
      let targetRotation = -sectorCenterAngle + Math.PI / 2 - arrowOffset + visualOffset;
      
      // Normalizar la rotación para que esté entre 0 y 2π
      targetRotation = ((targetRotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
      
      console.log('🎯 Calculando rotación objetivo con COMPENSACIÓN VISUAL:', {
        winningSector,
        anglePerSector,
        sectorCenterAngle: sectorCenterAngle,
        sectorCenterDegrees: (sectorCenterAngle * 180) / Math.PI,
        arrowOffset: arrowOffset,
        arrowOffsetDegrees: (arrowOffset * 180) / Math.PI,
        visualOffsetSectors: visualOffsetSectors,
        visualOffset: visualOffset,
        visualOffsetDegrees: (visualOffset * 180) / Math.PI,
        targetRotation: targetRotation,
        targetRotationDegrees: (targetRotation * 180) / Math.PI,
        expectedPosition: 'Centro del sector alineado con flecha verde (con compensación visual de +8 sectores)'
      });
      
      return targetRotation;
    }, [NUM_SECTORS]);

    // Función para giro prolongado (sin sector específico)
    const startProlongedSpin = useCallback(() => {
      console.log('🔄 Iniciando giro prolongado...');
      const startTime = Date.now();
      const startRotation = currentRotationRef.current;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        
        // Giro dinámico con velocidad alta inicial
        let rotationSpeed;
        if (elapsed < 4000) {
          // Primera fase: velocidad alta constante (4 segundos)
          rotationSpeed = 0.8; // Velocidad muy alta
        } else if (elapsed < 7000) {
          // Segunda fase: velocidad media (3 segundos más)
          rotationSpeed = 0.5; // Velocidad media
        } else if (elapsed < 10000) {
          // Tercera fase: velocidad baja (3 segundos más)
          rotationSpeed = 0.3; // Velocidad baja
        } else {
          // Cuarta fase: velocidad muy baja continua (hasta que llegue el backend)
          rotationSpeed = 0.15; // Velocidad muy baja pero continua
        }
        
        // Calcular rotación con velocidad mucho más alta
        const currentRotation = startRotation + (elapsed * rotationSpeed * 0.15);
        
        // Debug: Log cada segundo
        if (Math.floor(elapsed / 1000) !== Math.floor((elapsed - 16) / 1000)) {
          console.log('🔄 Giro prolongado - Segundo:', Math.floor(elapsed / 1000), 'isSpinning:', isSpinningRef.current, 'currentRotation:', Math.round(currentRotation * 100) / 100);
        }
        
        currentRotationRef.current = currentRotation;
        setCurrentAnimationRotation(currentRotation);
        
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawWheel(ctx, canvas, currentRotation, highlightedSector);
          }
        }
        
        // Continuar girando hasta que llegue el resultado del backend
        if (isSpinningRef.current) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          console.log('🛑 Giro prolongado detenido - isSpinningRef.current = false');
        }
      };
      
      animate();
    }, [drawWheel, highlightedSector]);

    // Función para ajustar al sector final cuando llegue el resultado del backend
    const adjustToFinalSector = useCallback((winningSector: number) => {
      console.log('🎯 Ajustando al sector final:', winningSector);
      
      // Cancelar cualquier animación actual
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      const startRotation = currentRotationRef.current;
      const targetRotation = calculateTargetRotation(winningSector);
      const adjustmentDuration = 4000; // 4 segundos para el ajuste final más suave
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / adjustmentDuration, 1);
        
        // Easing suave para el ajuste final
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentRotation = startRotation + (targetRotation - startRotation) * easeOut;
        
        currentRotationRef.current = currentRotation;
        setCurrentAnimationRotation(currentRotation);
        
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
          // Asegurar que termine exactamente en la posición correcta
          currentRotationRef.current = targetRotation;
          setCurrentAnimationRotation(targetRotation);
          
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              drawWheel(ctx, canvasRef.current, targetRotation, highlightedSector);
            }
          }
          
          isSpinningRef.current = false;
          console.log('🎯 Giro prolongado completado, sector ganador:', winningSector);
        }
      };
      
      animate();
    }, [drawWheel, highlightedSector, calculateTargetRotation]);

    // Función determinística para generar un número "aleatorio" basado en mesaId
    // Esto asegura que todos los clientes generen el mismo valor
    const deterministicRandom = useCallback((seed: string | null | undefined): number => {
      if (!seed) return 0.5; // Valor por defecto si no hay seed
      
      // Crear un hash simple del seed
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir a 32 bits
      }
      
      // Normalizar a un valor entre 0 y 1
      return Math.abs(Math.sin(hash)) % 1;
    }, []);

    // Función para iniciar giro físico - TRANSICIÓN SUAVE AL RESULTADO DEL BACKEND
    const startPhysicalSpin = useCallback((winningSector?: number) => {
      if (isSpinningRef.current) return;
      
      isSpinningRef.current = true;
      console.log('🎰 Iniciando giro físico de la ruleta...');
      
      // Si hay sector específico del backend, hacer transición suave
      if (winningSector !== undefined) {
        console.log('🎯 Transición suave al sector del backend:', winningSector);
        
        // Guardar el sector esperado del backend para usarlo en la detección
        expectedWinningSectorRef.current = winningSector;
        
        // Normalizar rotación inicial a 0 para todos los clientes
        currentRotationRef.current = 0;
        
        const targetRotation = calculateTargetRotation(winningSector);
        
        // CORRECCIÓN: Guardar targetRotation ANTES de normalizar para usarlo en detección visual
        originalTargetRotationRef.current = targetRotation;
        
        // CORRECCIÓN CRÍTICA: Normalizar targetRotation UNA SOLA VEZ para evitar desfases
        // Esta normalización debe ser la misma que se usará al final de la animación
        const normalizedTargetRotation = ((targetRotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
        
        // Usar rotaciones adicionales determinísticas basadas en mesaId
        // Esto asegura que todos los clientes agreguen las mismas vueltas
        const deterministicValue = deterministicRandom(mesaId);
        const extraRotationsRaw = (deterministicValue * 4 + 6) * Math.PI; // 6-10 vueltas determinísticas
        
        // CORRECCIÓN CRÍTICA: Calcular vueltas completas como múltiplos exactos de 2π
        // Esto asegura que al normalizar finalRotation, obtengamos exactamente normalizedTargetRotation
        const vueltasCompletas = Math.floor(extraRotationsRaw / (2 * Math.PI));
        const extraRotations = vueltasCompletas * (2 * Math.PI); // Solo múltiplos exactos de 2π
        
        // Calcular finalRotation de forma que al normalizar sea exactamente normalizedTargetRotation
        // Esto elimina la necesidad de ajustes al final que causan saltos
        const finalRotation = normalizedTargetRotation + extraRotations;
        
        console.log('🎯 Rotación sincronizada:', {
          winningSector,
          targetRotation: normalizedTargetRotation,
          extraRotations,
          finalRotation,
          mesaId
        });
        
        animateSpin(finalRotation);
        return;
      }
      
      // COMPORTAMIENTO ORIGINAL: Giro aleatorio con múltiples vueltas
      console.log('🎲 Giro inmediato con sector aleatorio (comportamiento original)');
      const randomSector = Math.floor(Math.random() * 15);
      const targetRotation = calculateTargetRotation(randomSector);
      // Agregar giros adicionales para hacer más emocionante
      const extraRotations = (Math.random() * 6 + 8) * Math.PI; // 8-14 vueltas para giro rápido
      const finalRotation = targetRotation + extraRotations;
      animateSpin(finalRotation);
    }, [animateSpin, calculateTargetRotation, deterministicRandom, mesaId]);

    // Función para detectar el sector ganador
    const detectWinningSector = useCallback(() => {
      // SOLUCIÓN: Si tenemos el sector esperado del backend, usarlo directamente
      if (expectedWinningSectorRef.current !== null) {
        const expectedSector = expectedWinningSectorRef.current;
        console.log('🔍 Usando sector esperado del backend:', {
          sectorIndex: expectedSector,
          numeroEnRuleta: expectedSector + 1,
          source: 'Backend directo (sin cálculo de rotación)'
        });
        return expectedSector;
      }
      
      // FALLBACK: Calcular basándonos en la rotación (para giros sin backend)
      const currentRotation = currentRotationRef.current;
      const normalizedRotation = ((currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const anglePerSector = (2 * Math.PI) / NUM_SECTORS;
      const arrowOffset = 0.098; // 5.6° en radianes (corregido - desplazamiento real de la flecha)
      // La flecha está desplazada a la DERECHA, así que ajustamos a la IZQUIERDA
      const adjustedRotation = normalizedRotation + (Math.PI / 2) - arrowOffset;
      const sector = Math.floor(adjustedRotation / anglePerSector) % NUM_SECTORS;
      
      console.log('🔍 Calculando sector por rotación (fallback):', {
        rotation: currentRotation,
        normalizedRotation,
        arrowOffset: arrowOffset,
        arrowOffsetDegrees: (arrowOffset * 180) / Math.PI,
        adjustedRotation,
        adjustedRotationDegrees: (adjustedRotation * 180) / Math.PI,
        sector,
        anglePerSector
      });
      
      return sector;
    }, [NUM_SECTORS]);

  

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

    // Ajustar tamaño del canvas al contenedor (para mayor nitidez y tamaño máximo en móvil)
    useEffect(() => {
      const resizeCanvas = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const size = Math.floor(container.clientWidth);
        if (size <= 0) return;

        canvas.width = size;
        canvas.height = size;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;

        setCanvasSize(size);

        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawWheel(ctx, canvas, currentRotationRef.current, highlightedSector ?? undefined);
        }

        // Una vez que el canvas esté listo, mostrar el componente después de un breve delay
        if (isMounting) {
          setTimeout(() => {
            setIsMounting(false);
          }, 250); // 250ms para ocultar el efecto espiral
        }
      };

      resizeCanvas();
      const observer = new ResizeObserver(() => resizeCanvas());
      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, [drawWheel, highlightedSector, isMounting]);

    // Efecto para dibujar la ruleta estática cuando rotation = 0
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Solo dibujar ruleta estática cuando rotation = 0 (sin animación)
      if (rotation === 0) {
        currentRotationRef.current = rotation;
        setCurrentAnimationRotation(rotation);
        drawWheel(ctx, canvas, rotation, highlightedSector);
      }
    }, [rotation, highlightedSector, drawWheel]);

    // ELIMINADO: Este useEffect causaba interferencias con la animación
    // La sincronización se maneja directamente en animateSpin

    // Resetear estado de montaje cuando cambia el tipo de ruleta
    useEffect(() => {
      setIsMounting(true);
    }, [type]);

    // Limpiar animación al desmontar
    useEffect(() => {
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, []);

  return (
    <div className={`roulette-wheel-container ${isMounting ? 'roulette-mounting' : ''}`} ref={containerRef}>
      <div className="roulette-wheel-shadow"></div>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="roulette-wheel-canvas"
        onClick={handleCanvasClick}
      />
      <div className="roulette-wheel-center">
        <Image
          src="/logo.png"
          alt="RuxPlay Logo"
          width={60}
          height={60}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <img src="/rombo.png" alt="Ganador principal" className="roulette-pointer roulette-main-pointer" />
      <img src="/rombo.png" alt="Ganador izquierdo" className="roulette-pointer roulette-left-pointer" />
      <img src="/rombo.png" alt="Ganador derecho" className="roulette-pointer roulette-right-pointer" />
    </div>
  );
  }
);

RouletteWheel.displayName = 'RouletteWheel';