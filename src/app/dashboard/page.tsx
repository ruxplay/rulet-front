'use client';

import { ProtectedPage } from '@/components/auth';
import { useRouletteSSE } from '@/components/roulette/hooks/useRouletteSSE';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KPICards } from '@/components/dashboard/KPICards';
import { RuletaMetrics } from '@/components/dashboard/RuletaMetrics';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default function DashboardPage() {
  // Conectar al SSE para actualizaciones en tiempo real
  // Usamos '150' como tipo por defecto, pero el hook escucha todos los eventos
  useRouletteSSE('150', null);

  return (
    <ProtectedPage redirectTo="/">
      <div className="dashboard-shell">
        <DashboardHeader />
        
        <div className="dashboard-grid">
          <div className="dashboard-main">
            <QuickActions />
            <KPICards />
            <RuletaMetrics />
            <ActivityFeed />
          </div>
          
          <DashboardSidebar />
        </div>
      </div>
    </ProtectedPage>
  );
}
