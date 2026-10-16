'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  {
    group: 'Overview',
    links: [
      { label: 'Dashboard',   href: '/admin',            icon: 'fas fa-grid-2' },
      { label: 'Audit Logs',  href: '/admin/audit-logs', icon: 'fas fa-scroll' },
    ],
  },
  {
    group: 'Manage',
    links: [
      { label: 'Users',       href: '/admin/users',       icon: 'fas fa-users' },
      { label: 'Investments', href: '/admin/investments', icon: 'fas fa-chart-line' },
      { label: 'Deposits',    href: '/admin/deposits',    icon: 'fas fa-circle-arrow-down' },
      { label: 'Withdrawals', href: '/admin/withdrawals', icon: 'fas fa-circle-arrow-up' },
      { label: 'KYC',         href: '/admin/kyc',         icon: 'fas fa-id-card' },
      { label: 'Support',     href: '/admin/support',     icon: 'fas fa-headset' },
    ],
  },
  {
    group: 'Settings',
    links: [
      { label: 'Plans',   href: '/admin/plans',   icon: 'fas fa-layer-group' },
      { label: 'Wallets', href: '/admin/wallets', icon: 'fas fa-wallet' },
    ],
  },
];

export default function AdminSidebar({ user, isOpen, onClose }) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('vaultex_token');
    localStorage.removeItem('vaultex_user');
    router.push('/login');
  };

  return (
    <>
      <aside
        className="admin-sidebar"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 260,
          height: '100vh',
          background: '#10101a',
          borderRight: '1px solid rgba(201,168,76,0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          overflowY: 'auto',
        }}
      >
        {/* Logo + Admin badge */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontSize: 18, fontWeight: 900,
              background: 'linear-gradient(135deg, #f0f0fa, #c9a84c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 4,
            }}>
              VAULTEX
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '2px 8px',
              borderRadius: 4,
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.25)',
              fontSize: 10,
              fontWeight: 700,
              color: '#c9a84c',
              letterSpacing: '0.08em',
            }}>
              <i className="fas fa-shield-halved" style={{ fontSize: 9 }}></i>
              ADMIN PANEL
            </div>
          </div>

          <button
            onClick={onClose}
            className="admin-sidebar-close"
            style={{
              background: 'none', border: 'none',
              color: '#5a5a78', cursor: 'pointer', fontSize: 16,
            }}
          >
            <i className="fas fa-xmark"></i>
          </button>
        </div>

        {/* Admin info */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px',
            background: 'rgba(201,168,76,0.06)',
            border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#0a0a0f',
              flexShrink: 0,
            }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: '#f0f0fa',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 11, color: '#c9a84c', fontWeight: 600 }}>
                Administrator
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {navItems.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 10, fontWeight: 700,
                color: '#5a5a78', letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0 8px', marginBottom: 6,
              }}>
                {group.group}
              </div>

              {group.links.map((link, li) => {
                const isActive = pathname === link.href ||
                  (link.href !== '/admin' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={li}
                    href={link.href}
                    style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}
                  >
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 8,
                        background: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
                        border: `1px solid ${isActive ? 'rgba(201,168,76,0.2)' : 'transparent'}`,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <i className={link.icon} style={{
                        fontSize: 14,
                        color: isActive ? '#c9a84c' : '#5a5a78',
                        width: 16, textAlign: 'center',
                      }}></i>
                      <span style={{
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#c9a84c' : '#9898b8',
                      }}>
                        {link.label}
                      </span>
                      {isActive && (
                        <div style={{
                          marginLeft: 'auto',
                          width: 4, height: 4, borderRadius: '50%',
                          background: '#c9a84c',
                          boxShadow: '0 0 8px #c9a84c',
                        }} />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Back to site + logout */}
        <div style={{
          padding: '12px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#9898b8', fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <i className="fas fa-arrow-left" style={{ fontSize: 11 }}></i>
              Back to Dashboard
            </button>
          </Link>

          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.15)',
              color: '#ef4444', fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          >
            <i className="fas fa-right-from-bracket" style={{ fontSize: 12 }}></i>
            Sign Out
          </button>
        </div>
      </aside>

     <style>{`
  @media (min-width: 1024px) {
    .admin-sidebar {
      transform: translateX(0) !important;
    }
    .admin-sidebar-close {
      display: none !important;
    }
  }
`}</style>
    </>
  );
}