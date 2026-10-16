'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';
import { PAYMENT_METHODS } from '@/lib/paymentMethods';
import { formatCurrency } from '@/lib/currency';

const STATUS_META = {
  PENDING:  { label: 'Pending Review', color: '#eab308' },
  APPROVED: { label: 'Approved',        color: '#22c55e' },
  REJECTED: { label: 'Rejected',         color: '#ef4444' },
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

export default function DepositPage() {
  const pageRef = useRef(null);
  const fileRef = useRef(null);

  const [method, setMethod] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [proof, setProof] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [deposits, setDeposits] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.deposit-section') || [],
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [loadingHistory] });

  // Load wallet addresses whenever the chosen method changes.
  useEffect(() => {
    if (!method) return;
    let cancelled = false;
    (async () => {
      setLoadingAddresses(true);
      try {
        const res = await fetch(`/api/wallet-addresses?method=${method}`);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setAddresses(data.addresses);
          setSelectedAddress(data.addresses[0] || null);
        }
      } finally {
        if (!cancelled) setLoadingAddresses(false);
      }
    })();
    return () => { cancelled = true; };
  }, [method]);

  // Deposit history.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/user/deposits');
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setDeposits(data.deposits);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const copyAddress = () => {
    if (!selectedAddress) return;
    navigator.clipboard.writeText(selectedAddress.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt < 1) newErrors.amount = 'Minimum deposit is $1.00';
    if (!method) newErrors.method = 'Please select a payment method';
    if (!proof) newErrors.proof = 'Proof of payment is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('method', method);
      if (selectedAddress) formData.append('walletAddressId', selectedAddress.id);
      if (txHash) formData.append('txHash', txHash);
      formData.append('proof', proof);

      const res = await fetch('/api/user/deposits', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else toast.error(data.error || 'Submission failed');
        return;
      }

      toast.success('Deposit submitted for review');
      setAmount(''); setTxHash(''); setProof(null); setMethod('');
      setAddresses([]); setSelectedAddress(null);
      if (fileRef.current) fileRef.current.value = '';
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={pageRef} style={{ maxWidth: 640 }}>

      <div className="deposit-section" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0fa', marginBottom: 4, letterSpacing: '-0.02em' }}>
          Deposit Funds
        </h1>
        <p style={{ fontSize: 13.5, color: '#5a5a78' }}>
          Send funds to the address below, then submit proof for review.
        </p>
      </div>

      <div className="deposit-section" style={{
        background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, padding: '26px', marginBottom: 20,
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Method selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
                {Object.entries(PAYMENT_METHODS).map(([key, m]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setMethod(key); setErrors((p) => ({ ...p, method: '' })); }}
                    style={{
                      padding: '12px 10px', borderRadius: 10, cursor: 'pointer',
                      background: method === key ? `${m.color}18` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${method === key ? `${m.color}60` : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <i className={m.icon} style={{ fontSize: 16, color: method === key ? m.color : '#9898b8' }}></i>
                    <span style={{ fontSize: 11, fontWeight: 600, color: method === key ? m.color : '#9898b8' }}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
              {errors.method && <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.method}</span>}
            </div>

            {/* Wallet address to send to */}
            {method && (
              loadingAddresses ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                  <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c' }}></i>
                </div>
              ) : selectedAddress ? (
                <div style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)',
                }}>
                  <div style={{ fontSize: 11.5, color: '#9898b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Send to this {PAYMENT_METHODS[method].label} address
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <code style={{
                      flex: 1, fontSize: 12.5, color: '#f0f0fa', wordBreak: 'break-all',
                      fontFamily: 'monospace',
                    }}>
                      {selectedAddress.address}
                    </code>
                    <button
                      type="button"
                      onClick={copyAddress}
                      style={{
                        flexShrink: 0, padding: '7px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 700,
                        background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(201,168,76,0.15)',
                        color: copied ? '#22c55e' : '#c9a84c',
                        border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(201,168,76,0.3)'}`,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      {copied ? <><i className="fas fa-check"></i> Copied</> : <><i className="fas fa-copy"></i> Copy</>}
                    </button>
                  </div>
                  {selectedAddress.network && (
                    <div style={{ fontSize: 11, color: '#5a5a78', marginTop: 6 }}>Network: {selectedAddress.network}</div>
                  )}
                  {selectedAddress.instructions && (
                    <div style={{ fontSize: 11.5, color: '#9898b8', marginTop: 8, lineHeight: 1.6 }}>{selectedAddress.instructions}</div>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: '14px 16px', borderRadius: 12, fontSize: 12.5, color: '#9898b8',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  No deposit address is configured for {PAYMENT_METHODS[method].label} yet. Please contact support.
                </div>
              )
            )}

            {/* Amount */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>Amount (USD)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a5a78', fontSize: 14 }}>$</span>
                <input
                  type="number" min="1" step="0.01"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: '' })); }}
                  placeholder="0.00"
                  style={{
                    width: '100%', padding: '12px 14px 12px 28px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${errors.amount ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: '#f0f0fa', fontSize: 14, outline: 'none',
                  }}
                />
              </div>
              {errors.amount && <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.amount}</span>}
            </div>

            {/* Tx hash (optional) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>
                Transaction Hash <span style={{ color: '#5a5a78', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x..."
                style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f0f0fa', fontSize: 13.5, outline: 'none', fontFamily: 'monospace',
                }}
              />
            </div>

            {/* Proof upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>Proof of Payment</label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `1.5px dashed ${errors.proof ? 'rgba(239,68,68,0.5)' : proof ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: 12, padding: proof ? 12 : '24px 16px', textAlign: 'center', cursor: 'pointer',
                  background: proof ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.02)',
                }}
              >
                {proof ? (
                  <div style={{ fontSize: 13, color: '#f0f0fa', fontWeight: 600 }}>
                    <i className="fas fa-file-check" style={{ color: '#c9a84c', marginRight: 8 }}></i>
                    {proof.name}
                    <div style={{ fontSize: 11, color: '#5a5a78', fontWeight: 400, marginTop: 4 }}>Tap to change</div>
                  </div>
                ) : (
                  <>
                    <i className="fas fa-cloud-arrow-up" style={{ fontSize: 20, color: '#5a5a78', marginBottom: 6, display: 'block' }}></i>
                    <div style={{ fontSize: 12.5, color: '#9898b8' }}>Screenshot or receipt of your transaction</div>
                  </>
                )}
                <input
                  ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => { setProof(e.target.files?.[0] || null); setErrors((p) => ({ ...p, proof: '' })); }}
                  style={{ display: 'none' }}
                />
              </div>
              {errors.proof && <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.proof}</span>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                background: submitting ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                color: '#0a0a0f', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {submitting
                ? <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
                : <><i className="fas fa-paper-plane"></i> Submit Deposit</>}
            </button>
          </div>
        </form>
      </div>

      {/* History */}
      <div className="deposit-section">
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0fa', marginBottom: 12 }}>Deposit History</div>
        {loadingHistory ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
            <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c' }}></i>
          </div>
        ) : deposits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: '#5a5a78', fontSize: 13 }}>
            No deposits yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {deposits.map((d) => (
              <div key={d.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
              }}>
                <i className={PAYMENT_METHODS[d.method]?.icon || 'fas fa-coins'} style={{ color: PAYMENT_METHODS[d.method]?.color, fontSize: 14, width: 18 }}></i>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f0f0fa' }}>{formatCurrency(d.amount)}</div>
                  <div style={{ fontSize: 11, color: '#5a5a78' }}>{new Date(d.createdAt).toLocaleString()}</div>
                </div>
                <StatusPill status={d.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
