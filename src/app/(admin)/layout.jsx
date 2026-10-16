'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminNavbar from '@/components/admin/AdminNavbar';

export default function AdminLayout({ children }) {
  const router        = useRouter();
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('vaultex_user');
    const token  = localStorage.getItem('vaultex_token');

    if (!stored || !token) {
      router.replace('/login');
      return;
    }

    const parsedUser = JSON.parse(stored);

    if (parsedUser.role !== 'ADMIN') {
      router.replace('/dashboard');
      return;
    }

    setUser(parsedUser);
    setLoading(false);
  }, [router]);

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
        }}>
          <i className="fas fa-shield-halved" style={{ color: '#0a0a0f', fontSize: 20 }}></i>
        </div>
        <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 20 }}></i>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex' }}>

      {/* Sidebar */}
      <AdminSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Dark overlay — clicking it closes sidebar on mobile */}
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

      {/* Right side — navbar + page content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        // On desktop, push content right to make room for the fixed sidebar
        marginLeft: 260,
        transition: 'margin-left 0.3s ease',
      }}
      className="admin-content-area"
      >
        <AdminNavbar
          user={user}
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
        />

        <main style={{
          flex: 1,
          padding: '28px 24px',
          overflowY: 'auto',
        }}>
          {children}
        </main>
      </div>

      {/* Responsive: on mobile, sidebar takes no layout space */}
      <style>{`
        @media (max-width: 1023px) {
          .admin-content-area {
            margin-left: 0 !important;
          }
        }
      `}</style>

    </div>
  );
}