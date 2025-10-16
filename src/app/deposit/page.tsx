'use client';

import { DepositModal } from '@/components/deposit';
import { ProtectedPage } from '@/components/auth';
import { useState } from 'react';

export default function DepositPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <ProtectedPage redirectTo="/">
      <div className="deposit-page">
        <div className="deposit-page-content">
          <h1>Recargar Saldo</h1>
          <p>Selecciona el método de pago que prefieras</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            Recargar Saldo
          </button>
        </div>
        
        <DepositModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
    </ProtectedPage>
  );
}
