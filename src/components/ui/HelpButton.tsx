'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { HelpModal } from './HelpModal';

export const HelpButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // No mostrar el botón de ayuda en el Dashboard Admin
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <button 
        className="help-button"
        onClick={openModal}
        aria-label="Abrir ayuda"
        title="¿Necesitas ayuda?"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <path d="M12 17h.01"/>
        </svg>
      </button>

      {isModalOpen && (
        <HelpModal onClose={closeModal} />
      )}
    </>
  );
};
