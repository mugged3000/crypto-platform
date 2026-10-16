'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/currency';
import { PAYMENT_METHODS } from '@/lib/paymentMethods';

const STATUS_META = {
  PENDING:    { label: 'Pending',    color: '#eab308' },
  PROCESSING: { label: 'Processing', color: '#818cf8' },
  APPROVED:   { label: 'Approved',   color: '#22c55e' },
  REJECTED:   { label: 'Rejected',   color: '#ef4444' },
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

export default function AdminWithdrawalsPage() {
  const pageRef = useRef(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState('PENDING');
  const [actionId,    setActionId]    = useState(null);

  // Approve modal state
  const [approveModal, setApproveModal] = useState(null);
  const [txHash,       setTxHash]       = useState('');
  const [submitting,   setSubmitting]   = useState(false);

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.wd-row') || [],
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [withdrawals] });

  useEffect(() => { fetchWithdrawals(); }, [filter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/withdrawals?status=${filter}`);
      const data = await res.json();
      if (res.ok) setWithdrawals(data.withdrawals);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSubmit = async () => {
    setSubmitting(true);
    try {
      const res  = await fetch(`/api/admin/withdrawals/${approveModal.id}/approve`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ txHash }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Withdrawal approved');
        setApproveModal(null);
        setTxHash('');
        fetchWithdrawals();
      } else {
        toast.error(data.error || 'Failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (wd) => {
    const note = prompt('Reason for rejection (amount will be refunded to user):');
    if (note === null) return;
    setActionId(wd.id);
    try {
      const res  = await fetch(`/api/admin/withdrawals/${wd.id}/reject`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ note }),
      });
      const data = await res.json();
      if (res.ok) { toast.success('Withdrawal rejected — amount refunded to user'); fetchWithdrawals(); }
      else toast.error(data.error || 'Failed');
    } finally { setActionId(null); }
  };

  return (
    <div ref={pageRef}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0fa', marginBottom: 4, letterSpacing: '-0.02em' }}>
          Withdrawal Requests
        </h1>
        <p style={{ fontSize: 13.5, color: '#5a5a78' }}>
          Send crypto to user's wallet address, then approve here with the TX hash.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            flexShrink: 0, padding: '8px 16px', borderRadius: 100, fontSize: 12.5, fontWeight: 600,
            background: filter === key ? `${meta.color}18` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${filter === key ? `${meta.color}50` : 'rgba(255,255,255,0.08)'}`,
            color: filter === key ? meta.color : '#9898b8', cursor: 'pointer',
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
      ) : withdrawals.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16,
        }}>
          <i className="fas fa-circle-arrow-up" style={{ fontSize: 28, color: '#3a3a52', marginBottom: 12, display: 'block' }}></i>
          <div style={{ fontSize: 14, color: '#5a5a78' }}>No {filter.toLowerCase()} withdrawals</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {withdrawals.map((wd) => {
            const pm = PAYMENT_METHODS[wd.method];
            return (
              <div key={wd.id} className="wd-row" style={{
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
                      {wd.user.firstName} {wd.user.lastName}
                    </div>
                    <div style={{ fontSize: 12, color: '#5a5a78', marginBottom: 2 }}>{wd.user.email}</div>
                    <div style={{ fontSize: 12, color: '#5a5a78' }}>{new Date(wd.createdAt).toLocaleString()}</div>
                  </div>
                  <StatusPill status={wd.status} />
                </div>

                {/* Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 12, marginBottom: 14,
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10,
                }}>
                  {[
                    { label: 'Amount',     value: formatCurrency(wd.amount),    color: '#f0f0fa' },
                    { label: 'Net Payout', value: formatCurrency(wd.netAmount), color: '#c9a84c' },
                    { label: 'Fee',        value: formatCurrency(wd.networkFee), color: '#5a5a78' },
                    { label: 'Method',     value: pm?.label || wd.method,       color: '#9898b8' },
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

                {/* Destination address */}
                <div style={{
                  padding: '12px 14px', borderRadius: 10, marginBottom: 14,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: 11, color: '#5a5a78', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Send {pm?.label || wd.method} to this address
                  </div>
                  <div style={{
                    fontSize: 13, color: '#f0f0fa', fontFamily: 'monospace',
                    wordBreak: 'break-all', lineHeight: 1.6,
                  }}>
                    {wd.walletAddress}
                  </div>
                </div>

                {/* TX hash (if approved) */}
                {wd.txHash && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 8, marginBottom: 14,
                    background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
                    fontSize: 12, color: '#9898b8', fontFamily: 'monospace',
                  }}>
                    <i className="fas fa-link" style={{ color: '#22c55e', marginRight: 6 }}></i>
                    TX: {wd.txHash}
                  </div>
                )}

                {/* Admin note */}
                {wd.adminNote && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 8, marginBottom: 14,
                    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                    fontSize: 12, color: '#9898b8',
                  }}>
                    <i className="fas fa-note-sticky" style={{ color: '#ef4444', marginRight: 6 }}></i>
                    {wd.adminNote}
                  </div>
                )}

                {/* Actions — only PENDING */}
                {wd.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setApproveModal(wd)}
                      disabled={actionId === wd.id}
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
                      Approve & Mark Sent
                    </button>
                    <button
                      onClick={() => handleReject(wd)}
                      disabled={actionId === wd.id}
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
                      Reject & Refund
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Approve Modal — enter TX hash */}
      {approveModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: '#16162a', border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 16, padding: '32px', width: '100%', maxWidth: 440, position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              borderRadius: '16px 16px 0 0',
              background: 'linear-gradient(90deg, transparent, #22c55e, transparent)',
            }} />

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f0f0fa', marginBottom: 6 }}>
              Approve Withdrawal
            </h3>
            <p style={{ fontSize: 13, color: '#5a5a78', marginBottom: 20, lineHeight: 1.6 }}>
              You have sent <strong style={{ color: '#c9a84c' }}>{formatCurrency(approveModal.netAmount)}</strong> to{' '}
              <strong style={{ color: '#f0f0fa' }}>{approveModal.user.firstName}</strong>'s wallet.
              Enter the transaction hash below to confirm.
            </p>

            {/* Destination reminder */}
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 18,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              fontSize: 12, color: '#9898b8', fontFamily: 'monospace', wordBreak: 'break-all',
            }}>
              {approveModal.walletAddress}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8', display: 'block', marginBottom: 6 }}>
                Transaction Hash (optional)
              </label>
              <input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x... or blockchain TX ID"
                autoFocus
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f0f0fa', fontSize: 13, outline: 'none', fontFamily: 'monospace',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleApproveSubmit}
                disabled={submitting}
                style={{
                  flex: 1, padding: '13px', borderRadius: 10,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  background: submitting ? 'rgba(34,197,94,0.4)' : 'rgba(34,197,94,0.9)',
                  color: '#fff', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {submitting
                  ? <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                  : <><i className="fas fa-check"></i> Confirm Sent</>}
              </button>
              <button
                onClick={() => { setApproveModal(null); setTxHash(''); }}
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