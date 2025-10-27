'use client';

import React from 'react';
import Link from 'next/link';

interface AdminSidebarProps {
  isOpen?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = true }) => {
  return (
    <aside className={`admin-sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="admin-sidebar-header">
        <h2>Panel Admin</h2>
      </div>
      <nav className="admin-sidebar-nav">
        <Link href="/admin" className="admin-nav-link">
          📊 Dashboard
        </Link>
        <Link href="/admin/users" className="admin-nav-link">
          👥 Usuarios
        </Link>
        <Link href="/admin/deposits" className="admin-nav-link">
          💰 Depósitos
        </Link>
        <Link href="/admin/withdrawals" className="admin-nav-link">
          💸 Retiros
        </Link>
      </nav>
    </aside>
  );
};
