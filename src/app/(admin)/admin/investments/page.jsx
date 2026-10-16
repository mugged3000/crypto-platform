'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/currency';

const STATUS_META = {
  PENDING:   { label: 'Pending',   color: '#eab308' },
  ACTIVE:    { label: 'Active',    color: '#22c55e' },
  COMPLETED: { label: 'Completed', color: '#818cf8' },
  REJECTED:  { label: 'Rejected',  color: '#ef4444' },
  CANCELLED: { label: 'Cancelled', color: '#5a5a78' },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700,
      color: meta.color,
      background: `${meta.color}18`,
      border: `1px solid ${meta.color}35`,
      padding: '3px 10px', borderRadius: 100,
      whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  );
}

export default function AdminInvestmentsPage() {
  const pageRef  = useRef(null);
  const [investments, setInvestments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState('PENDING');
  const [actionId,    setActionId]    = useState(null);

  // For seed/release modal
  const [modal,       setModal]       = useState(null);
  const [modalAmount, setModalAmount] = useState('');
  const [modalNote,   setModalNote]   = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.inv-row') || [],
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [investments] });

  useEffect(() => {
    fetchInvestments();
  }, [filter]);

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/investments?status=${filter}`);
      const data = await res.json();
      if (res.ok) setInvestments(data.investments);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (inv) => {
    setActionId(inv.id);
    try {
      const res  = await fetch(`/api/admin/investments/${inv.id}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Investment approved');
        fetchInvestments();
      } else {
        toast.error(data.error || 'Failed');
      }
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (inv, note) => {
    setActionId(inv.id);
    try {
      const res  = await fetch(`/api/admin/investments/${inv.id}/reject`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ note }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Investment rejected');
        fetchInvestments();
      } else {
        toast.error(data.error || 'Failed');
      }
    } finally {
      setActionId(null);
    }
  };

  const handleModalSubmit = async () => {
    if (!modalAmount || isNaN(parseFloat(modalAmount))) {
      toast.error('Enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = modal.type === 'seed'
        ? `/api/admin/investments/${modal.inv.id}/seed`
        : `/api/admin/investments/${modal.inv.id}/release`;

      const res  = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ amount: modalAmount, note: modalNote }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(modal.type === 'seed' ? 'Amount seeded to user' : 'Investment released and completed');
        setModal(null);
        setModalAmount('');
        setModalNote('');
        fetchInvestments();
      } else {
        toast.error(data.error || 'Failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={pageRef}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 24, fontWeight: 800, color: '#f0f0fa',
          marginBottom: 4, letterSpacing: '-0.02em',
        }}>
          Investment Requests
        </h1>
        <p style={{ fontSize: 13.5, color: '#5a5a78' }}>
          Review proof of payment, approve investments, seed balances, release profits.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 20,
        overflowX: 'auto', paddingBottom: 4,
      }}>
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              flexShrink: 0, padding: '8px 16px',
              borderRadius: 100, fontSize: 12.5, fontWeight: 600,
              background: filter === key ? `${meta.color}18` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filter === key ? `${meta.color}50` : 'rgba(255,255,255,0.08)'}`,
              color: filter === key ? meta.color : '#9898b8',
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {meta.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 20 }}></i>
        </div>
      ) : investments.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
        }}>
          <i className="fas fa-chart-line" style={{
            fontSize: 28, color: '#3a3a52',
            marginBottom: 12, display: 'block',
          }}></i>
          <div style={{ fontSize: 14, color: '#5a5a78' }}>
            No {filter.toLowerCase()} investments
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {investments.map((inv) => (
            <div
              key={inv.id}
              className="inv-row"
              style={{
                background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: '20px',
                opacity: 0,
              }}
            >
              {/* Top row */}
              <div style={{
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', gap: 12, marginBottom: 14,
                flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{
                    fontSize: 15, fontWeight: 700,
                    color: '#f0f0fa', marginBottom: 4,
                  }}>
                    {inv.user?.firstName} {inv.user?.lastName}
                  </div>
                  <div style={{ fontSize: 12, color: '#5a5a78', marginBottom: 2 }}>
                    {inv.user?.email}
                  </div>
                  <div style={{ fontSize: 12, color: '#5a5a78' }}>
                    Plan: <span style={{ color: '#c9a84c', fontWeight: 600 }}>{inv.planName}</span>
                    {' · '}
                    {new Date(inv.createdAt).toLocaleString()}
                  </div>
                </div>
                <StatusPill status={inv.status} />
              </div>

              {/* Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: 12, marginBottom: 16,
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 10,
              }}>
                {[
                  { label: 'Amount Sent',  value: formatCurrency(inv.amount),        color: '#f0f0fa' },
                  { label: 'Rate',         value: `${inv.rate}%`,                     color: '#c9a84c' },
                  { label: 'Exp. Profit',  value: formatCurrency(inv.expectedProfit), color: '#22c55e' },
                  { label: 'Total Return', value: formatCurrency(inv.expectedReturn), color: '#818cf8' },
                  { label: 'Seeded',       value: formatCurrency(inv.seededAmount),   color: '#f97316' },
                  { label: 'Released',     value: formatCurrency(inv.releasedAmount), color: '#c9a84c' },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 10, color: '#5a5a78', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: item.color }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Proof image + TX hash */}
              <div style={{
                display: 'flex', gap: 12,
                marginBottom: 16, flexWrap: 'wrap',
              }}>
                {inv.proofImageUrl && (
                  <a
                    href={inv.proofImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px', borderRadius: 8,
                      background: 'rgba(201,168,76,0.08)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      color: '#c9a84c', fontSize: 12, fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <i className="fas fa-image"></i>
                    View Payment Proof
                  </a>
                )}
                {inv.txHash && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#9898b8', fontSize: 12,
                    fontFamily: 'monospace',
                  }}>
                    TX: {inv.txHash.slice(0, 20)}...
                  </div>
                )}
              </div>

              {/* Admin note */}
              {inv.adminNote && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8, marginBottom: 14,
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  fontSize: 12, color: '#9898b8',
                }}>
                  <i className="fas fa-note-sticky" style={{ color: '#ef4444', marginRight: 6 }}></i>
                  {inv.adminNote}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>

                {/* PENDING actions */}
                {inv.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(inv)}
                      disabled={actionId === inv.id}
                      style={{
                        padding: '9px 18px', borderRadius: 8,
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        background: 'rgba(34,197,94,0.12)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        color: '#22c55e',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <i className="fas fa-check"></i>
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const note = prompt('Reason for rejection (shown to user):');
                        if (note !== null) handleReject(inv, note);
                      }}
                      disabled={actionId === inv.id}
                      style={{
                        padding: '9px 18px', borderRadius: 8,
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
                  </>
                )}

                {/* ACTIVE actions */}
                {inv.status === 'ACTIVE' && (
                  <>
                    <button
                      onClick={() => setModal({ type: 'seed', inv })}
                      style={{
                        padding: '9px 18px', borderRadius: 8,
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        background: 'rgba(249,115,22,0.1)',
                        border: '1px solid rgba(249,115,22,0.3)',
                        color: '#f97316',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <i className="fas fa-syringe"></i>
                      Seed Amount
                    </button>
                    <button
                      onClick={() => setModal({ type: 'release', inv })}
                      style={{
                        padding: '9px 18px', borderRadius: 8,
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        background: 'rgba(201,168,76,0.12)',
                        border: '1px solid rgba(201,168,76,0.3)',
                        color: '#c9a84c',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <i className="fas fa-unlock"></i>
                      Release & Complete
                    </button>
                  </>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seed / Release Modal */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            background: '#16162a',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 16, padding: '32px',
            width: '100%', maxWidth: 440,
            position: 'relative',
          }}>
            {/* Top accent */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              borderRadius: '16px 16px 0 0',
              background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
            }} />

            <h3 style={{
              fontSize: 18, fontWeight: 800, color: '#f0f0fa',
              marginBottom: 6, letterSpacing: '-0.01em',
            }}>
              {modal.type === 'seed' ? '💉 Seed Amount to User' : '🔓 Release & Complete Investment'}
            </h3>

            <p style={{ fontSize: 13, color: '#5a5a78', marginBottom: 24, lineHeight: 1.6 }}>
              {modal.type === 'seed'
                ? `Credit a dummy amount to ${modal.inv.user?.firstName}'s dashboard balance. This shows in their account immediately.`
                : `Release final payout to ${modal.inv.user?.firstName}. This credits their balance and marks the investment as completed.`}
            </p>

            {/* User + investment info */}
            <div style={{
              padding: '12px 14px', borderRadius: 10, marginBottom: 20,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              fontSize: 13, color: '#9898b8',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <div>User: <strong style={{ color: '#f0f0fa' }}>{modal.inv.user?.firstName} {modal.inv.user?.lastName}</strong></div>
              <div>Plan: <strong style={{ color: '#c9a84c' }}>{modal.inv.planName}</strong></div>
              <div>Invested: <strong style={{ color: '#f0f0fa' }}>{formatCurrency(modal.inv.amount)}</strong></div>
              <div>Expected return: <strong style={{ color: '#22c55e' }}>{formatCurrency(modal.inv.expectedReturn)}</strong></div>
            </div>

            {/* Amount input */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                fontSize: 13, fontWeight: 600, color: '#9898b8',
                display: 'block', marginBottom: 6,
              }}>
                Amount to {modal.type === 'seed' ? 'credit' : 'release'} ($)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#5a5a78', fontSize: 14,
                }}>$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value)}
                  placeholder={modal.type === 'release'
                    ? (modal.inv.expectedReturn / 100).toFixed(2)
                    : (modal.inv.amount / 100).toFixed(2)}
                  autoFocus
                  style={{
                    width: '100%', padding: '12px 14px 12px 28px',
                    borderRadius: 10, fontSize: 15, fontWeight: 600,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f0f0fa', outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Note input */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                fontSize: 13, fontWeight: 600, color: '#9898b8',
                display: 'block', marginBottom: 6,
              }}>
                Note to user (optional)
              </label>
              <input
                type="text"
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                placeholder={modal.type === 'seed'
                  ? 'e.g. Investment confirmed'
                  : 'e.g. Starter Plan matured — profit released'}
                style={{
                  width: '100%', padding: '12px 14px',
                  borderRadius: 10, fontSize: 13,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f0f0fa', outline: 'none',
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleModalSubmit}
                disabled={submitting}
                style={{
                  flex: 1, padding: '13px', borderRadius: 10,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  background: submitting
                    ? 'rgba(201,168,76,0.4)'
                    : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                  color: '#0a0a0f', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {submitting
                  ? <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                  : modal.type === 'seed' ? 'Seed Balance' : 'Release & Complete'}
              </button>
              <button
                onClick={() => { setModal(null); setModalAmount(''); setModalNote(''); }}
                disabled={submitting}
                style={{
                  padding: '13px 20px', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  background: 'transparent', color: '#9898b8',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}