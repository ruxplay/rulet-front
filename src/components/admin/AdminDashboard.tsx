'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminContent } from './AdminContent';

interface AdminDashboardProps {
  children?: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  stats?: {
    totalUsers?: number;
    activeUsers?: number;
    inactiveUsers?: number;
    adminUsers?: number;
    normalUsers?: number;
    totalDeposits?: number;
    pendingDeposits?: number;
    approvedDeposits?: number;
    rejectedDeposits?: number;
    totalAmount?: number;
    totalWithdrawals?: number;
    pendingWithdrawals?: number;
    approvedWithdrawals?: number;
    rejectedWithdrawals?: number;
    totalWithdrawalAmount?: number;
  };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  children, 
  pageTitle, 
  pageDescription,
  stats 
}) => {
  // Determinar si está en móvil
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Verificar al cargar
    checkMobile();

    // Verificar al cambiar tamaño de ventana
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar sidebar automáticamente en móvil
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`admin-dashboard ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <AdminSidebar isOpen={isSidebarOpen} />
      <div className="admin-main">
        <AdminHeader 
          pageTitle={pageTitle} 
          pageDescription={pageDescription} 
          stats={stats}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        {children || <AdminContent />}
      </div>
    </div>
  );
};
