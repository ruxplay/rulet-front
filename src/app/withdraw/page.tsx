'use client';

import { WithdrawForm } from '@/components/withdraw';
import { ProtectedPage } from '@/components/auth';

export default function WithdrawPage() {
  return (
    <ProtectedPage redirectTo="/">
      <div className="withdraw-page">
        <div className="withdraw-page-header">
          <h1>💸 Retirar Fondos</h1>
          <p>Transfiere tus ganancias a tu cuenta bancaria</p>
        </div>
        
        <div className="withdraw-page-content">
          <WithdrawForm />
        </div>
      </div>
    </ProtectedPage>
  );
}

