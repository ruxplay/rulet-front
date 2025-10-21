import React from 'react';

interface SectorButtonProps {
  sectorIndex: number;
  color: string;
  angle: number;
  radius: number;
  centerX: number;
  centerY: number;
  anglePerSector: number;
  onClick: (sectorIndex: number) => void;
  isHighlighted?: boolean;
}

export const SectorButton: React.FC<SectorButtonProps> = ({
  sectorIndex,
  color,
  angle,
  radius,
  centerX,
  centerY,
  anglePerSector,
  onClick,
  isHighlighted = false
}) => {
  const startAngle = angle;
  const endAngle = angle + anglePerSector;

  // Calcular las coordenadas del sector
  const x1 = centerX + radius * Math.cos(startAngle);
  const y1 = centerY + radius * Math.sin(startAngle);
  const x2 = centerX + radius * Math.cos(endAngle);
  const y2 = centerY + radius * Math.sin(endAngle);

  // Crear el path del sector
  const largeArcFlag = anglePerSector > Math.PI ? 1 : 0;
  const pathData = [
    `M ${centerX} ${centerY}`,
    `L ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    'Z'
  ].join(' ');

  const handleClick = () => {
    onClick(sectorIndex);
  };

  return (
    <path
      d={pathData}
      fill={color}
      fillOpacity={isHighlighted ? 0.3 : 0.15} // Transparencia muy sutil
      stroke="none"
      className="sector-button"
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        filter: isHighlighted ? 'brightness(1.1)' : 'brightness(1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.fillOpacity = '0.25';
        e.currentTarget.style.filter = 'brightness(1.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.fillOpacity = isHighlighted ? '0.3' : '0.15';
        e.currentTarget.style.filter = isHighlighted ? 'brightness(1.1)' : 'brightness(1)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.fillOpacity = '0.4';
        e.currentTarget.style.filter = 'brightness(1.2)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.fillOpacity = '0.25';
        e.currentTarget.style.filter = 'brightness(1.15)';
      }}
    />
  );
};
