'use client';

import { useRouter } from 'next/navigation';
import { RouletteType } from '@/types';

interface RoulettePageSelectorProps {
  currentType: RouletteType;
}

export const RoulettePageSelector = ({ currentType }: RoulettePageSelectorProps) => {
  const router = useRouter();

  return (
    <div className="roulette-selector">
      <button
        className={`roulette-type-btn ${currentType === '150' ? 'active' : ''}`}
        onClick={() => router.push('/roulette/150')}
        type="button"
      >
        Ruleta 150
      </button>
      <button
        className={`roulette-type-btn ${currentType === '300' ? 'active' : ''}`}
        onClick={() => router.push('/roulette/300')}
        type="button"
      >
        Ruleta 300
      </button>
    </div>
  );
};
