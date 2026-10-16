'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/currency';

const STATUS_META = {
  ACTIVE:    { label: 'Active',    color: '#22c55e' },
  SUSPENDED: { label: 'Suspended', color: '#f97316' },
  BANNED:    { label: 'Banned',    color: '#ef4444' },
  FROZEN:    { label: 'Frozen',    color: '#818cf8' },
};

const KYC_META = {
  NOT_SUBMITTED:       { label: 'Not Submitted',  color: '#5a5a78' },
  PENDING:              { label: 'Pending Review', color: '#eab308' },
  APPROVED:              { label: 'Verified',        color: '#22c55e' },
  REJECTED:               { label: 'Rejected',          color: '#ef4444' },
  RESUBMIT_REQUESTED:      { label: 'Resubmit Needed',     color: '#f97316' },
};

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12, padding: '14px 16px',
    }}>
      <div style={{ fontSize: 10.5, color: '#5a5a78', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: color || '#f0f0fa' }}>{value}</div>
    </div>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      disabled={disabled}
      style={{
        width: 40, height: 22, borderRadius: 100, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: checked ? 'linear-gradient(135deg, #c9a84c, #a8722a)' : 'rgba(255,255,255,0.1)',
        position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: checked ? 20 : 2,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s ease',
      }} />
    </button>
  );
}

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const pageRef = useRef(null);

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [savingField, setSavingField] = useState(null);

  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.detail-section') || [],
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [loading] });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setUser(data.user);
          setTransactions(data.recentTransactions);
        } else {
          toast.error(data.error || 'Could not load user');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, refreshKey]);

  const updateField = async (field, value) => {
    setSavingField(field);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        toast.success('Updated');
      } else {
        toast.error(data.error || 'Update failed');
      }
    } finally {
      setSavingField(null);
    }
  };

  const handleAdjust = async () => {
    if (!adjustAmount || isNaN(parseFloat(adjustAmount))) {
      toast.error('Enter a valid amount');
      return;
    }
    setAdjusting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balanceAdjustment: adjustAmount, adjustmentNote: adjustNote }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Balance adjusted');
        setShowAdjust(false); setAdjustAmount(''); setAdjustNote('');
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(data.error || 'Adjustment failed');
      }
    } finally {
      setAdjusting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 20 }}></i>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div ref={pageRef} style={{ maxWidth: 800 }}>
      <button
        onClick={() => router.push('/admin/users')}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
          color: '#9898b8', fontSize: 13, cursor: 'pointer', marginBottom: 18, padding: 0,
        }}
      >
        <i className="fas fa-arrow-left" style={{ fontSize: 11 }}></i> Back to users
      </button>

      {/* Header */}
      <div className="detail-section" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          background: user.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, color: '#0a0a0f',
        }}>
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
          )}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#f0f0fa' }}>{user.firstName} {user.lastName}</div>
          <div style={{ fontSize: 13, color: '#5a5a78' }}>{user.email}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: STATUS_META[user.status].color,
            background: `${STATUS_META[user.status].color}18`, border: `1px solid ${STATUS_META[user.status].color}35`,
            padding: '5px 12px', borderRadius: 100,
          }}>
            {STATUS_META[user.status].label}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: KYC_META[user.kycStatus].color,
            background: `${KYC_META[user.kycStatus].color}18`, border: `1px solid ${KYC_META[user.kycStatus].color}35`,
            padding: '5px 12px', borderRadius: 100,
          }}>
            {KYC_META[user.kycStatus].label}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="detail-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 24 }}>
        <StatCard label="Balance" value={formatCurrency(user.balance)} color="#c9a84c" />
        <StatCard label="Deposited" value={formatCurrency(user.totalDeposited)} />
        <StatCard label="Withdrawn" value={formatCurrency(user.totalWithdrawn)} />
        <StatCard label="Profit" value={formatCurrency(user.totalProfit)} color="#22c55e" />
        <StatCard label="Investments" value={user._count.investments} />
        <StatCard label="Referrals" value={user._count.referrals} />
      </div>

      {/* Account moderation */}
      <div className="detail-section" style={{
        background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '22px', marginBottom: 20,
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0fa', marginBottom: 16 }}>Account Controls</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#9898b8', marginBottom: 8 }}>Account Status</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => updateField('status', key)}
                  disabled={savingField === 'status'}
                  style={{
                    padding: '8px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                    background: user.status === key ? `${meta.color}18` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${user.status === key ? `${meta.color}50` : 'rgba(255,255,255,0.08)'}`,
                    color: user.status === key ? meta.color : '#9898b8',
                  }}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 6 }}>
            {[
              { key: 'canDeposit', label: 'Can Deposit' },
              { key: 'canWithdraw', label: 'Can Withdraw' },
              { key: 'canInvest', label: 'Can Invest' },
            ].map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#f0f0fa' }}>{label}</span>
                <Toggle checked={user[key]} onChange={(v) => updateField(key, v)} disabled={savingField === key} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Balance adjustment */}
      <div className="detail-section" style={{
        background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '22px', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showAdjust ? 16 : 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0fa' }}>Manual Balance Adjustment</div>
          {!showAdjust && (
            <button
              onClick={() => setShowAdjust(true)}
              style={{
                padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 700,
                background: 'linear-gradient(135deg, #c9a84c, #a8722a)', color: '#0a0a0f', border: 'none', cursor: 'pointer',
              }}
            >
              Adjust Balance
            </button>
          )}
        </div>

        {showAdjust && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#9898b8', display: 'block', marginBottom: 5 }}>
                Amount ($) — use a negative number to deduct
              </label>
              <input
                type="number" step="0.01" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="e.g. 50 or -25" autoFocus
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 9,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f0f0fa', fontSize: 14, outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#9898b8', display: 'block', marginBottom: 5 }}>Note (shown in transaction history)</label>
              <input
                value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} placeholder="Reason for adjustment"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 9,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f0f0fa', fontSize: 13, outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleAdjust} disabled={adjusting} style={{
                flex: 1, padding: '11px', borderRadius: 9, fontSize: 13.5, fontWeight: 700,
                background: adjusting ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                color: '#0a0a0f', border: 'none', cursor: adjusting ? 'not-allowed' : 'pointer',
              }}>
                {adjusting ? 'Applying...' : 'Apply Adjustment'}
              </button>
              <button onClick={() => { setShowAdjust(false); setAdjustAmount(''); setAdjustNote(''); }} disabled={adjusting} style={{
                padding: '11px 18px', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                background: 'transparent', color: '#9898b8', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
              }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent transactions */}
      <div className="detail-section">
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0fa', marginBottom: 12 }}>Recent Transactions</div>
        {transactions.length === 0 ? (
          <div style={{ fontSize: 13, color: '#5a5a78', padding: '20px 0', textAlign: 'center' }}>No transactions yet</div>
        ) : (
          <div style={{
            background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden',
          }}>
            {transactions.map((tx, i) => (
              <div key={tx.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px',
                borderBottom: i < transactions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 13, color: '#f0f0fa' }}>{tx.description || tx.type}</div>
                  <div style={{ fontSize: 11, color: '#5a5a78' }}>{new Date(tx.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: tx.amount >= 0 ? '#22c55e' : '#ef4444' }}>
                  {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
