'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/currency';

const TYPE_META = {
  DEPOSIT:              { label: 'Deposit',      icon: 'fas fa-arrow-down',       color: '#22c55e' },
  WITHDRAWAL:           { label: 'Withdrawal',    icon: 'fas fa-arrow-up',          color: '#ef4444' },
  INVESTMENT:           { label: 'Investment',      icon: 'fas fa-seedling',           color: '#818cf8' },
  PROFIT:               { label: 'Profit',            icon: 'fas fa-chart-line',           color: '#c9a84c' },
  REFERRAL_COMMISSION:  { label: 'Referral Bonus',      icon: 'fas fa-user-plus',              color: '#f97316' },
  REFUND:               { label: 'Refund',                icon: 'fas fa-rotate-left',              color: '#eab308' },
  ADJUSTMENT:            { label: 'Adjustment',              icon: 'fas fa-sliders',                    color: '#5a5a78' },
};

const FILTERS = ['ALL', 'DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'PROFIT', 'REFERRAL_COMMISSION', 'REFUND', 'ADJUSTMENT'];

export default function TransactionsPage() {
  const pageRef = useRef(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.tx-section') || [],
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [loading] });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/user/transactions?type=${filter}`);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setTransactions(data.transactions);
        else toast.error(data.error || 'Could not load transactions');
      } catch {
        if (!cancelled) toast.error('Network error loading transactions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [filter]);

  return (
    <div ref={pageRef} style={{ maxWidth: 760 }}>

      <div className="tx-section" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0fa', marginBottom: 4, letterSpacing: '-0.02em' }}>
          Transaction History
        </h1>
        <p style={{ fontSize: 13.5, color: '#5a5a78' }}>
          A complete record of everything that&apos;s happened on your account.
        </p>
      </div>

      {/* Filters */}
      <div className="tx-section" style={{
        display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto', paddingBottom: 4,
      }}>
        {FILTERS.map((f) => {
          const meta = f === 'ALL' ? { label: 'All', color: '#c9a84c' } : TYPE_META[f];
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 100, fontSize: 12.5, fontWeight: 600,
                background: active ? `${meta.color}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? `${meta.color}50` : 'rgba(255,255,255,0.08)'}`,
                color: active ? meta.color : '#9898b8',
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease',
              }}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="tx-section">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 18 }}></i>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16,
          }}>
            <i className="fas fa-receipt" style={{ fontSize: 26, color: '#3a3a52', marginBottom: 12, display: 'block' }}></i>
            <div style={{ fontSize: 14, color: '#9898b8' }}>No transactions to show</div>
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden',
          }}>
            {transactions.map((tx, i) => {
              const meta = TYPE_META[tx.type] || TYPE_META.ADJUSTMENT;
              const isPositive = tx.amount >= 0;
              return (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                  borderBottom: i < transactions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `${meta.color}15`, border: `1px solid ${meta.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className={meta.icon} style={{ fontSize: 14, color: meta.color }}></i>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f0f0fa' }}>
                      {tx.description || meta.label}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#5a5a78', marginTop: 2 }}>
                      {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isPositive ? '#22c55e' : '#ef4444' }}>
                      {isPositive ? '+' : ''}{formatCurrency(tx.amount)}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#5a5a78', marginTop: 2 }}>
                      Bal: {formatCurrency(tx.balanceAfter)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
