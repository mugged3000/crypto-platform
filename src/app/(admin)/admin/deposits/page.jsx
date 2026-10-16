'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/currency';
import { PAYMENT_METHODS } from '@/lib/paymentMethods';

const STATUS_META = {
  PENDING:  { label: 'Pending',  color: '#eab308' },
  APPROVED: { label: 'Approved', color: '#22c55e' },
  REJECTED: { label: 'Rejected', color: '#ef4444' },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, color: meta.color,
      background: `${meta.color}18`, border: `1px solid ${meta.color}35`,
      padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  );
}

export default function AdminDepositsPage() {
  const pageRef = useRef(null);
  const [deposits,  setDeposits]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('PENDING');
  const [actionId,  setActionId]  = useState(null);

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.dep-row') || [],
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [deposits] });

  useEffect(() => { fetchDeposits(); }, [filter]);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/deposits?status=${filter}`);
      const data = await res.json();
      if (res.ok) setDeposits(data.deposits);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (dep) => {
    if (!confirm(`Approve $${(dep.amount / 100).toFixed(2)} deposit from ${dep.user.firstName}?`)) return;
    setActionId(dep.id);
    try {
      const res  = await fetch(`/api/admin/deposits/${dep.id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) { toast.success('Deposit approved'); fetchDeposits(); }
      else toast.error(data.error || 'Failed');
    } finally { setActionId(null); }
  };

  const handleReject = async (dep) => {
    const note = prompt('Reason for rejection (shown to user):');
    if (note === null) return;
    setActionId(dep.id);
    try {
      const res  = await fetch(`/api/admin/deposits/${dep.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (res.ok) { toast.success('Deposit rejected'); fetchDeposits(); }
      else toast.error(data.error || 'Failed');
    } finally { setActionId(null); }
  };

  return (
    <div ref={pageRef}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0fa', marginBottom: 4, letterSpacing: '-0.02em' }}>
          Deposit Requests
        </h1>
        <p style={{ fontSize: 13.5, color: '#5a5a78' }}>
          Review payment proofs and approve or reject deposit requests.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            flexShrink: 0, padding: '8px 16px', borderRadius: 100, fontSize: 12.5, fontWeight: 600,
            background: filter === key ? `${meta.color}18` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${filter === key ? `${meta.color}50` : 'rgba(255,255,255,0.08)'}`,
            color: filter === key ? meta.color : '#9898b8', cursor: 'pointer', whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
          }}>
            {meta.label}
          </button>
        ))}
        <button onClick={() => setFilter('ALL')} style={{
          flexShrink: 0, padding: '8px 16px', borderRadius: 100, fontSize: 12.5, fontWeight: 600,
          background: filter === 'ALL' ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${filter === 'ALL' ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.08)'}`,
          color: filter === 'ALL' ? '#c9a84c' : '#9898b8', cursor: 'pointer',
        }}>
          All
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 20 }}></i>
        </div>
      ) : deposits.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16,
        }}>
          <i className="fas fa-circle-arrow-down" style={{ fontSize: 28, color: '#3a3a52', marginBottom: 12, display: 'block' }}></i>
          <div style={{ fontSize: 14, color: '#5a5a78' }}>No {filter.toLowerCase()} deposits</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {deposits.map((dep) => {
            const pm = PAYMENT_METHODS[dep.method];
            return (
              <div key={dep.id} className="dep-row" style={{
                background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: '20px', opacity: 0,
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex', alignItems: 'flex-start',
                  justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap',
                }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0fa', marginBottom: 3 }}>
                      {dep.user.firstName} {dep.user.lastName}
                    </div>
                    <div style={{ fontSize: 12, color: '#5a5a78', marginBottom: 2 }}>
                      {dep.user.email}
                    </div>
                    <div style={{ fontSize: 12, color: '#5a5a78' }}>
                      {new Date(dep.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <StatusPill status={dep.status} />
                </div>

                {/* Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 12, marginBottom: 14,
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 10,
                }}>
                  {[
                    { label: 'Amount',  value: formatCurrency(dep.amount), color: '#c9a84c' },
                    { label: 'Method',  value: pm?.label || dep.method,    color: '#f0f0fa' },
                    { label: 'Network', value: dep.walletAddress?.network || '—', color: '#9898b8' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 10, color: '#5a5a78', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: item.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {i === 1 && pm && <i className={pm.icon} style={{ fontSize: 13, color: pm.color }}></i>}
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Proof + TX hash */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                  {dep.proofImageUrl && (
                    <a href={dep.proofImageUrl} target="_blank" rel="noreferrer" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px', borderRadius: 8,
                      background: 'rgba(201,168,76,0.08)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      color: '#c9a84c', fontSize: 12, fontWeight: 600,
                      textDecoration: 'none',
                    }}>
                      <i className="fas fa-image"></i>
                      View Payment Proof
                    </a>
                  )}
                  {dep.txHash && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#9898b8', fontSize: 12, fontFamily: 'monospace',
                    }}>
                      TX: {dep.txHash.slice(0, 24)}...
                    </div>
                  )}
                </div>

                {/* Admin note */}
                {dep.adminNote && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 8, marginBottom: 14,
                    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                    fontSize: 12, color: '#9898b8',
                  }}>
                    <i className="fas fa-note-sticky" style={{ color: '#ef4444', marginRight: 6 }}></i>
                    {dep.adminNote}
                  </div>
                )}

                {/* Actions — only for PENDING */}
                {dep.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleApprove(dep)}
                      disabled={actionId === dep.id}
                      style={{
                        padding: '9px 20px', borderRadius: 8,
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        background: 'rgba(34,197,94,0.12)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        color: '#22c55e',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <i className="fas fa-check"></i>
                      Approve & Credit Balance
                    </button>
                    <button
                      onClick={() => handleReject(dep)}
                      disabled={actionId === dep.id}
                      style={{
                        padding: '9px 20px', borderRadius: 8,
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#ef4444',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <i className="fas fa-xmark"></i>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}