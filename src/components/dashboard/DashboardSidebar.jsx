'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { companyLinks, legalLinks } from '@/lib/siteConfig';

const navItems = [
  {
    group: 'Overview',
    links: [
      { label: 'Dashboard',    href: '/dashboard',              icon: 'fas fa-grid-2' },
      { label: 'Investments',  href: '/dashboard/investments',  icon: 'fas fa-chart-line' },
      { label: 'Transactions', href: '/dashboard/transactions', icon: 'fas fa-arrow-right-arrow-left' },
    ],
  },
  {
    group: 'Finance',
    links: [
      { label: 'Deposit',    href: '/dashboard/deposit',    icon: 'fas fa-circle-arrow-down' },
      { label: 'Withdraw',   href: '/dashboard/withdraw',   icon: 'fas fa-circle-arrow-up' },
      { label: 'Referrals',  href: '/dashboard/referrals',  icon: 'fas fa-users' },
    ],
  },
  {
    group: 'Account',
    links: [
      { label: 'KYC Verify',  href: '/dashboard/kyc',      icon: 'fas fa-id-card' },
      { label: 'Support',     href: '/dashboard/support',   icon: 'fas fa-headset' },
      { label: 'Settings',    href: '/dashboard/settings',  icon: 'fas fa-gear' },
    ],
  },
];

export default function DashboardSidebar({ user, isOpen, onClose }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [infoOpen, setInfoOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('vaultex_token');
    localStorage.removeItem('vaultex_user');
    router.push('/login');
  };

  return (
    <>
      <aside style={{
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
      className="dashboard-sidebar"
      >

        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/" style={{
            textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(201,168,76,0.25)',
            }}>
              <i className="fas fa-chart-line" style={{ color: '#0a0a0f', fontSize: 12 }}></i>
            </div>
            <span style={{
              fontSize: 16, fontWeight: 900,
              background: 'linear-gradient(135deg, #f0f0fa, #c9a84c)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              VAULTEX
            </span>
          </Link>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: 'none', border: 'none',
              color: '#5a5a78', cursor: 'pointer', fontSize: 16,
            }}
          >
            <i className="fas fa-xmark"></i>
          </button>
        </div>

        {/* User info */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: user?.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#0a0a0f',
              flexShrink: 0, overflow: 'hidden',
            }}>
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <>{user?.firstName?.[0]}{user?.lastName?.[0]}</>
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: '#f0f0fa', whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{
                fontSize: 11, color: '#5a5a78',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Nav links */}
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
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={li}
                    href={link.href}
                    style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 8,
                      background: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
                      border: `1px solid ${isActive ? 'rgba(201,168,76,0.2)' : 'transparent'}`,
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                    >
                      <i className={link.icon} style={{
                        fontSize: 14,
                        color: isActive ? '#c9a84c' : '#5a5a78',
                        width: 16, textAlign: 'center',
                      }}></i>
                      <span style={{
                        fontSize: 13, fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#c9a84c' : '#9898b8',
                      }}>
                        {link.label}
                      </span>

                      {/* Active indicator */}
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

          {/* Legal & Info dropdown — each entry opens its own page */}
          <div style={{ marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => setInfoOpen((o) => !o)}
              aria-expanded={infoOpen}
              aria-controls="sidebar-info-links"
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                background: infoOpen ? 'rgba(255,255,255,0.04)' : 'transparent',
                border: '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="fas fa-circle-info" style={{ fontSize: 14, color: '#5a5a78', width: 16, textAlign: 'center' }}></i>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#9898b8' }}>Legal &amp; Info</span>
              </span>
              <i
                className="fas fa-chevron-down"
                style={{
                  fontSize: 10, color: '#5a5a78',
                  transform: infoOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                }}
              ></i>
            </button>

            {infoOpen && (
              <div
                id="sidebar-info-links"
                style={{ marginTop: 4, marginLeft: 18, paddingLeft: 10, borderLeft: '1px solid rgba(255,255,255,0.06)' }}
              >
                {[...companyLinks, ...legalLinks].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    style={{ textDecoration: 'none', display: 'block', padding: '8px 10px', borderRadius: 6 }}
                    className="sidebar-info-link"
                  >
                    <span style={{ fontSize: 12.5, color: '#8888a8' }}>{link.label}</span>
                  </Link>
                ))}
                <style>{`
                  .sidebar-info-link:hover { background: rgba(255,255,255,0.04); }
                  .sidebar-info-link:hover span { color: #c9a84c !important; }
                `}</style>
              </div>
            )}
          </div>
        </nav>

        {/* Logout */}
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '11px 12px',
              borderRadius: 8, background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.15)',
              color: '#ef4444', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            }}
          >
            <i className="fas fa-right-from-bracket" style={{ fontSize: 13 }}></i>
            Sign Out
          </button>
        </div>

      </aside>

    </>
  );
}