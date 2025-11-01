'use client';

import Link from 'next/link';

export const QuickActions = () => {
  return (
    <div className="quick-actions">
      <Link href="/roulette/150" className="action-btn">
        Ruleta 150
      </Link>
      <Link href="/roulette/300" className="action-btn">
        Ruleta 300
      </Link>
      <Link href="/deposit" className="action-btn action-random">
        Recargar Saldo
      </Link>
      <Link href="/withdraw" className="action-btn">
        Retirar
      </Link>
      {/** Botón de Soporte removido a solicitud */}
    </div>
  );
};
