'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import DashboardFooter from '@/components/dashboard/DashboardFooter';

export default function DashboardLayout({ children }) {
  const router    = useRouter();
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const stored = localStorage.getItem('vaultex_user');
    const token  = localStorage.getItem('vaultex_token');

    if (!stored || !token) {
      router.replace('/login');
      return;
    }

    setUser(JSON.parse(stored));
    setLoading(false);
  }, [router]);

  useEffect(() => {
    // The Settings page updates localStorage directly (e.g. after an avatar
    // upload or profile edit) and then dispatches this event so the navbar
    // and sidebar — which hold their own copy of `user` in this layout's
    // state — pick up the change immediately, without needing a full page
    // reload to re-read localStorage.
    const onUserUpdated = () => {
      const stored = localStorage.getItem('vaultex_user');
      if (stored) setUser(JSON.parse(stored));
    };
    window.addEventListener('vaultex:user-updated', onUserUpdated);
    return () => window.removeEventListener('vaultex:user-updated', onUserUpdated);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(201,168,76,0.3)',
        }}>
          <i className="fas fa-chart-line" style={{ color: '#0a0a0f', fontSize: 20 }}></i>
        </div>
        <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 20 }}></i>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
    }}>
      {/* Sidebar */}
      <DashboardSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 40,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Main content */}
      <div style={{
        flex: 1,
        marginLeft: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        overflow: 'hidden',
      }}>
        <DashboardNavbar
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          maxWidth: '100%',
        }}>
          {children}
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}