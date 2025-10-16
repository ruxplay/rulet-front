'use client';

import { ProtectedPage } from '@/components/auth';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KPICards } from '@/components/dashboard/KPICards';
import { RuletaMetrics } from '@/components/dashboard/RuletaMetrics';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default function DashboardPage() {
  


  return (
    <ProtectedPage redirectTo="/">
      <div className="dashboard-shell">
        <DashboardHeader />
        
        <div className="dashboard-grid">
          <div className="dashboard-main">
            <KPICards />
            <RuletaMetrics />
            <ActivityFeed />
            <QuickActions />
          </div>
          
          <DashboardSidebar />
        </div>
      </div>
    </ProtectedPage>
  );
}
