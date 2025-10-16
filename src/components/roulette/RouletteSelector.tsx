'use client';

import { RouletteType } from '@/types';

interface RouletteSelectorProps {
  selectedType: RouletteType;
  onTypeChange: (type: RouletteType) => void;
}

export const RouletteSelector = ({ selectedType, onTypeChange }: RouletteSelectorProps) => {
  return (
    <div className="roulette-selector">
      <button
        className={`roulette-type-btn ${selectedType === '150' ? 'active' : ''}`}
        onClick={() => onTypeChange('150')}
        type="button"
      >
        Ruleta 150
      </button>
      <button
        className={`roulette-type-btn ${selectedType === '300' ? 'active' : ''}`}
        onClick={() => onTypeChange('300')}
        type="button"
      >
        Ruleta 300
      </button>
    </div>
  );
};
