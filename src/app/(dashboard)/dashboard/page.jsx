'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';

const statCards = [
  {
    label:  'Total Balance',
    key:    'balance',
    icon:   'fas fa-wallet',
    color:  '#c9a84c',
    prefix: '$',
    format: (v) => (v / 100).toLocaleString('en-US', { minimumFractionDigits: 2 }),
  },
  {
    label:  'Active Investments',
    key:    'investments',
    icon:   'fas fa-chart-line',
    color:  '#818cf8',
    prefix: '',
    format: (v) => v,
  },
  {
    label:  'Total Deposited',
    key:    'totalDeposited',
    icon:   'fas fa-circle-arrow-down',
    color:  '#22c55e',
    prefix: '$',
    format: (v) => (v / 100).toLocaleString('en-US', { minimumFractionDigits: 2 }),
  },
  {
    label:  'Total Profit',
    key:    'totalProfit',
    icon:   'fas fa-trophy',
    color:  '#f97316',
    prefix: '$',
    format: (v) => (v / 100).toLocaleString('en-US', { minimumFractionDigits: 2 }),
  },
];

export default function DashboardPage() {
  const pageRef = useRef(null);
  const cardsRef = useRef([]);

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    balance: 0, investments: 0,
    totalDeposited: 0, totalProfit: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem('vaultex_user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setStats({
        balance:        u.balance || 0,
        investments:    0,
        totalDeposited: u.totalDeposited || 0,
        totalProfit:    u.totalProfit || 0,
      });
    }
  }, []);

  useGSAP(() => {
    gsap.fromTo(
      cardsRef.current.filter(Boolean),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
    );
  }, { scope: pageRef });

  return (
    <div ref={pageRef}>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 28,
      }}
      className="stats-grid"
      >
        {statCards.map((card, i) => (
          <div
            key={i}
            ref={(el) => (cardsRef.current[i] = el)}
            style={{
              background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '4px 16px 16px 16px',
              padding: '20px',
              position: 'relative',
              overflow: 'hidden',
              opacity: 0,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${card.color}30`;
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.3)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Top accent */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent, ${card.color}, transparent)`,
            }} />

            {/* Icon */}
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${card.color}15`,
              border: `1px solid ${card.color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
            }}>
              <i className={card.icon} style={{ color: card.color, fontSize: 16 }}></i>
            </div>

            <div style={{ fontSize: 12, color: '#5a5a78', marginBottom: 6, fontWeight: 500 }}>
              {card.label}
            </div>
            <div style={{
              fontSize: 22, fontWeight: 800,
              color: '#f0f0fa', letterSpacing: '-0.02em',
            }}>
              {card.prefix}{card.format(stats[card.key])}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 28,
      }}
      className="actions-grid"
      >
        {[
          { label: 'Make a Deposit',    href: '/dashboard/deposit',   icon: 'fas fa-circle-arrow-down', color: '#22c55e', desc: 'Fund your account' },
          { label: 'Start Investing',   href: '/dashboard/investments', icon: 'fas fa-chart-line',       color: '#c9a84c', desc: 'Browse plans' },
          { label: 'Withdraw Funds',    href: '/dashboard/withdraw',  icon: 'fas fa-circle-arrow-up',   color: '#818cf8', desc: 'Cash out anytime' },
        ].map((action, i) => (
          <Link key={i} href={action.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px 16px 4px 16px',
              padding: '20px',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${action.color}30`;
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
                width: 44, height: 44, borderRadius: 12,
                background: `${action.color}15`,
                border: `1px solid ${action.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <i className={action.icon} style={{ color: action.color, fontSize: 18 }}></i>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0fa', marginBottom: 2 }}>
                  {action.label}
                </div>
                <div style={{ fontSize: 12, color: '#5a5a78' }}>
                  {action.desc}
                </div>
              </div>
              <i className="fas fa-arrow-right" style={{
                marginLeft: 'auto', color: '#5a5a78', fontSize: 12,
              }}></i>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent transactions — empty state */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '4px 16px 16px 16px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0fa' }}>
            Recent Transactions
          </div>
          <Link href="/dashboard/transactions" style={{
            fontSize: 12, color: '#c9a84c',
            textDecoration: 'none', fontWeight: 600,
          }}>
            View All
          </Link>
        </div>

        {/* Empty state */}
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <i className="fas fa-receipt" style={{ color: '#c9a84c', fontSize: 22 }}></i>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0fa', marginBottom: 6 }}>
            No transactions yet
          </div>
          <div style={{ fontSize: 13, color: '#5a5a78', marginBottom: 24 }}>
            Make your first deposit to get started
          </div>
          <Link href="/dashboard/deposit" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '10px 24px', borderRadius: 8,
              background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
              color: '#0a0a0f', border: 'none',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(201,168,76,0.25)',
            }}>
              Make a Deposit
            </button>
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .actions-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}