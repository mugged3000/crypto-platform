'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';

export default function AdminPage() {
  const pageRef = useRef(null);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch('/api/admin/stats');
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.admin-card') || [],
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
    );
  }, { scope: pageRef, dependencies: [loading] });

  const statCards = [
    { label: 'Total Users',          value: stats?.totalUsers ?? '—',         icon: 'fas fa-users',              color: '#818cf8' },
    { label: 'Pending Investments',  value: stats?.pendingInvestments ?? '—', icon: 'fas fa-chart-line',         color: '#eab308' },
    { label: 'Pending Deposits',     value: stats?.pendingDeposits ?? '—',    icon: 'fas fa-circle-arrow-down',  color: '#22c55e' },
    { label: 'Pending Withdrawals',  value: stats?.pendingWithdrawals ?? '—', icon: 'fas fa-circle-arrow-up',   color: '#ef4444' },
  ];

  const quickLinks = [
    { label: 'Review Investments',  href: '/admin/investments', icon: 'fas fa-chart-line',        color: '#eab308', desc: 'Approve or reject investment requests' },
    { label: 'Review Deposits',     href: '/admin/deposits',    icon: 'fas fa-circle-arrow-down', color: '#22c55e', desc: 'Confirm payments and credit users' },
    { label: 'Review Withdrawals',  href: '/admin/withdrawals', icon: 'fas fa-circle-arrow-up',  color: '#ef4444', desc: 'Process and approve withdrawals' },
    { label: 'Manage Users',        href: '/admin/users',       icon: 'fas fa-users',             color: '#818cf8', desc: 'View, ban, freeze user accounts' },
    { label: 'Manage Plans',        href: '/admin/plans',       icon: 'fas fa-layer-group',       color: '#c9a84c', desc: 'Create and edit investment plans' },
    { label: 'Wallet Addresses',    href: '/admin/wallets',     icon: 'fas fa-wallet',            color: '#f97316', desc: 'Manage deposit wallet addresses' },
  ];

  return (
    <div ref={pageRef}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 24, fontWeight: 800,
          color: '#f0f0fa', marginBottom: 4,
          letterSpacing: '-0.02em',
        }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: 13.5, color: '#5a5a78' }}>
          Full control over the platform. Every action is logged.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, marginBottom: 28,
      }}
      className="admin-stats-grid"
      >
        {statCards.map((card, i) => (
          <div
            key={i}
            className="admin-card"
            style={{
              background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '4px 16px 16px 16px',
              padding: '20px',
              position: 'relative', overflow: 'hidden',
              opacity: 0,
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent, ${card.color}, transparent)`,
            }} />
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: `${card.color}15`,
              border: `1px solid ${card.color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
            }}>
              <i className={card.icon} style={{ color: card.color, fontSize: 15 }}></i>
            </div>
            <div style={{ fontSize: 11, color: '#5a5a78', marginBottom: 4, fontWeight: 500 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#f0f0fa' }}>
              {loading ? (
                <i className="fas fa-spinner fa-spin" style={{ fontSize: 16, color: '#5a5a78' }}></i>
              ) : card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick action links */}
      <div style={{
        fontSize: 15, fontWeight: 700,
        color: '#f0f0fa', marginBottom: 14,
      }}>
        Quick Actions
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 14,
      }}
      className="admin-actions-grid"
      >
        {quickLinks.map((link, i) => (
          <Link key={i} href={link.href} style={{ textDecoration: 'none' }}>
            <div
              className="admin-card"
              style={{
                background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px 16px 4px 16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                opacity: 0,
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${link.color}30`;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.3)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${link.color}15`,
                  border: `1px solid ${link.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <i className={link.icon} style={{ color: link.color, fontSize: 16 }}></i>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0fa' }}>
                  {link.label}
                </div>
                <i className="fas fa-arrow-right" style={{
                  marginLeft: 'auto', color: '#5a5a78', fontSize: 12,
                }}></i>
              </div>
              <div style={{ fontSize: 12, color: '#5a5a78', lineHeight: 1.5 }}>
                {link.desc}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .admin-actions-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .admin-stats-grid { grid-template-columns: 1fr !important; }
          .admin-actions-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}