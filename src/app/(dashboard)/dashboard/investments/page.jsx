'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';
import { PAYMENT_METHODS } from '@/lib/paymentMethods';
import { formatCurrency } from '@/lib/currency';

const STATUS_META = {
  PENDING:   { label: 'Pending Review', color: '#eab308' },
  ACTIVE:    { label: 'Active',         color: '#22c55e' },
  COMPLETED: { label: 'Completed',      color: '#818cf8' },
  REJECTED:  { label: 'Rejected',       color: '#ef4444' },
  CANCELLED: { label: 'Cancelled',      color: '#5a5a78' },
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

function daysRemaining(maturityDate) {
  if (!maturityDate) return null;
  const diff = new Date(maturityDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function maturityProgress(inv) {
  if (!inv.startDate || !inv.maturityDate) return 0;
  const start = new Date(inv.startDate).getTime();
  const end   = new Date(inv.maturityDate).getTime();
  const now   = Date.now();
  if (now >= end) return 100;
  if (now <= start) return 0;
  return Math.round(((now - start) / (end - start)) * 100);
}

export default function InvestmentsPage() {
  const pageRef  = useRef(null);
  const fileRef  = useRef(null);

  const [plans,           setPlans]           = useState([]);
  const [loadingPlans,    setLoadingPlans]    = useState(true);
  const [investments,     setInvestments]     = useState([]);
  const [loadingHistory,  setLoadingHistory]  = useState(true);
  const [refreshKey,      setRefreshKey]      = useState(0);
  const [showForm,        setShowForm]        = useState(false);

  // Form state
  const [selectedPlan,   setSelectedPlan]   = useState('');
  const [amount,         setAmount]         = useState('');
  const [method,         setMethod]         = useState('');
  const [walletAddress,  setWalletAddress]  = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [txHash,         setTxHash]         = useState('');
  const [proof,          setProof]          = useState(null);
  const [errors,         setErrors]         = useState({});
  const [submitting,     setSubmitting]     = useState(false);
  const [copied,         setCopied]         = useState(false);

  // Calculated preview
  const plan         = plans.find((p) => p.id === selectedPlan);
  const amountCents  = Math.round(parseFloat(amount || 0) * 100);
  const expProfit    = plan && amountCents > 0 ? Math.round(amountCents * (plan.rate / 100)) : 0;
  const expReturn    = amountCents + expProfit;

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.inv-section') || [],
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [loadingPlans, loadingHistory] });

  // Load plans
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch('/api/investment-plans');
        const data = await res.json();
        if (res.ok) setPlans(data.plans);
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, []);

  // Load investment history
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res  = await fetch('/api/user/investments');
        const data = await res.json();
        if (!cancelled && res.ok) setInvestments(data.investments);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  // Load wallet address when method changes
  useEffect(() => {
    if (!method) { setWalletAddress(null); return; }
    let cancelled = false;
    (async () => {
      setLoadingAddress(true);
      try {
        const res  = await fetch(`/api/wallet-addresses?method=${method}`);
        const data = await res.json();
        if (!cancelled && res.ok) {
          setWalletAddress(data.addresses?.[0] || null);
        }
      } finally {
        if (!cancelled) setLoadingAddress(false);
      }
    })();
    return () => { cancelled = true; };
  }, [method]);

  const copyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!selectedPlan) newErrors.planId = 'Please select a plan';
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Enter the amount you sent';
    }
    if (!method) newErrors.method = 'Select the crypto you used';
    if (!proof)  newErrors.proof  = 'Upload your payment screenshot';

    if (plan) {
      if (amountCents < plan.minAmount) {
        newErrors.amount = `Minimum for this plan is ${formatCurrency(plan.minAmount)}`;
      }
      if (plan.maxAmount && amountCents > plan.maxAmount) {
        newErrors.amount = `Maximum for this plan is ${formatCurrency(plan.maxAmount)}`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('planId',  selectedPlan);
      fd.append('amount',  amount);
      fd.append('method',  method);
      fd.append('proof',   proof);
      if (txHash) fd.append('txHash', txHash);

      const res  = await fetch('/api/user/investments', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else toast.error(data.error || 'Submission failed');
        return;
      }

      toast.success('Investment request submitted! Admin will confirm shortly.');
      setShowForm(false);
      setSelectedPlan(''); setAmount(''); setMethod('');
      setWalletAddress(null); setTxHash(''); setProof(null); setErrors({});
      if (fileRef.current) fileRef.current.value = '';
      setRefreshKey((k) => k + 1);

    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={pageRef} style={{ maxWidth: 760 }}>

      {/* Header */}
      <div className="inv-section" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{
            fontSize: 24, fontWeight: 800, color: '#f0f0fa',
            marginBottom: 4, letterSpacing: '-0.02em',
          }}>
            Investments
          </h1>
          <p style={{ fontSize: 13.5, color: '#5a5a78' }}>
            Choose a plan, send crypto, upload proof — admin confirms your investment.
          </p>
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: showForm
              ? 'rgba(255,255,255,0.05)'
              : 'linear-gradient(135deg, #c9a84c, #a8722a)',
            color: showForm ? '#9898b8' : '#0a0a0f',
            border: showForm ? '1px solid rgba(255,255,255,0.1)' : 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s ease',
          }}
        >
          <i className={`fas ${showForm ? 'fa-xmark' : 'fa-plus'}`}></i>
          {showForm ? 'Cancel' : 'New Investment'}
        </button>
      </div>

      {/* Investment Form */}
      {showForm && (
        <div className="inv-section" style={{
          background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 16, padding: '28px',
          marginBottom: 24, position: 'relative', overflow: 'hidden',
        }}>
          {/* Top accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
          }} />

          <div style={{
            fontSize: 15, fontWeight: 700, color: '#f0f0fa',
            marginBottom: 20,
          }}>
            Submit Investment Request
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Step 1 — Pick plan */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>
                  Step 1 — Choose a Plan
                </label>
                {loadingPlans ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                    <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c' }}></i>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 10,
                  }}>
                    {plans.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlan(p.id);
                          setErrors((prev) => ({ ...prev, planId: '' }));
                        }}
                        style={{
                          padding: '14px 12px', borderRadius: 12,
                          textAlign: 'left', cursor: 'pointer',
                          background: selectedPlan === p.id
                            ? 'rgba(201,168,76,0.12)'
                            : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${selectedPlan === p.id
                            ? 'rgba(201,168,76,0.4)'
                            : 'rgba(255,255,255,0.08)'}`,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{
                          fontSize: 13, fontWeight: 700,
                          color: selectedPlan === p.id ? '#c9a84c' : '#f0f0fa',
                          marginBottom: 4,
                        }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#c9a84c', marginBottom: 2 }}>
                          {p.rate}%
                        </div>
                        <div style={{ fontSize: 11, color: '#5a5a78' }}>
                          {p.duration} days · Min {formatCurrency(p.minAmount)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {errors.planId && (
                  <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.planId}</span>
                )}
              </div>

              {/* Step 2 — Pick crypto method */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>
                  Step 2 — Select Crypto You Will Send
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: 8,
                }}>
                  {Object.entries(PAYMENT_METHODS).map(([key, m]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setMethod(key);
                        setErrors((prev) => ({ ...prev, method: '' }));
                      }}
                      style={{
                        padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                        background: method === key ? `${m.color}18` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${method === key ? `${m.color}60` : 'rgba(255,255,255,0.08)'}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <i className={m.icon} style={{
                        fontSize: 16,
                        color: method === key ? m.color : '#9898b8',
                      }}></i>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: method === key ? m.color : '#9898b8',
                      }}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.method && (
                  <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.method}</span>
                )}
              </div>

              {/* Show wallet address to send to */}
              {method && (
                <div style={{
                  padding: '16px',
                  borderRadius: 12,
                  background: 'rgba(201,168,76,0.05)',
                  border: '1px solid rgba(201,168,76,0.2)',
                }}>
                  <div style={{
                    fontSize: 12, color: '#9898b8',
                    marginBottom: 8, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    Step 3 — Send {PAYMENT_METHODS[method]?.label} to this address
                  </div>

                  {loadingAddress ? (
                    <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c' }}></i>
                  ) : walletAddress ? (
                    <>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                      }}>
                        <code style={{
                          flex: 1, fontSize: 12.5, color: '#f0f0fa',
                          wordBreak: 'break-all', fontFamily: 'monospace',
                          lineHeight: 1.6,
                        }}>
                          {walletAddress.address}
                        </code>
                        <button
                          type="button"
                          onClick={copyAddress}
                          style={{
                            flexShrink: 0, padding: '7px 12px',
                            borderRadius: 8, fontSize: 11.5, fontWeight: 700,
                            background: copied
                              ? 'rgba(34,197,94,0.15)'
                              : 'rgba(201,168,76,0.15)',
                            color: copied ? '#22c55e' : '#c9a84c',
                            border: `1px solid ${copied
                              ? 'rgba(34,197,94,0.3)'
                              : 'rgba(201,168,76,0.3)'}`,
                            cursor: 'pointer', whiteSpace: 'nowrap',
                          }}
                        >
                          {copied
                            ? <><i className="fas fa-check"></i> Copied</>
                            : <><i className="fas fa-copy"></i> Copy</>}
                        </button>
                      </div>
                      {walletAddress.network && (
                        <div style={{ fontSize: 11, color: '#5a5a78', marginBottom: 4 }}>
                          Network: {walletAddress.network}
                        </div>
                      )}
                      {walletAddress.instructions && (
                        <div style={{ fontSize: 12, color: '#9898b8', lineHeight: 1.6 }}>
                          {walletAddress.instructions}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: 13, color: '#9898b8' }}>
                      No address configured for this method yet. Contact support.
                    </div>
                  )}
                </div>
              )}

              {/* Amount */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>
                  Step 4 — Amount You Sent (USD equivalent)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#5a5a78', fontSize: 14,
                  }}>$</span>
                  <input
                    type="number" min="1" step="0.01"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setErrors((prev) => ({ ...prev, amount: '' }));
                    }}
                    placeholder="0.00"
                    style={{
                      width: '100%', padding: '12px 14px 12px 28px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${errors.amount
                        ? 'rgba(239,68,68,0.5)'
                        : 'rgba(255,255,255,0.08)'}`,
                      color: '#f0f0fa', fontSize: 14, outline: 'none',
                    }}
                  />
                </div>
                {errors.amount && (
                  <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.amount}</span>
                )}

                {/* Live profit preview */}
                {plan && amountCents > 0 && (
                  <div style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', flexDirection: 'column', gap: 6,
                    marginTop: 4,
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: 12, color: '#9898b8',
                    }}>
                      <span>Plan</span>
                      <span style={{ color: '#f0f0fa' }}>{plan.name} ({plan.rate}%)</span>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: 12, color: '#9898b8',
                    }}>
                      <span>Expected profit</span>
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>
                        +{formatCurrency(expProfit)}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: 13, color: '#c9a84c', fontWeight: 700,
                      paddingTop: 6,
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <span>Total at maturity</span>
                      <span>{formatCurrency(expReturn)}</span>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: 11, color: '#5a5a78',
                    }}>
                      <span>Duration</span>
                      <span>{plan.duration} days</span>
                    </div>
                  </div>
                )}
              </div>

              {/* TX Hash */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>
                  Transaction Hash{' '}
                  <span style={{ color: '#5a5a78', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x..."
                  style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#f0f0fa', fontSize: 13, outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              {/* Proof upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>
                  Step 5 — Upload Payment Screenshot
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `1.5px dashed ${errors.proof
                      ? 'rgba(239,68,68,0.5)'
                      : proof
                      ? 'rgba(201,168,76,0.4)'
                      : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: 12,
                    padding: proof ? 14 : '28px 16px',
                    textAlign: 'center', cursor: 'pointer',
                    background: proof
                      ? 'rgba(201,168,76,0.04)'
                      : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {proof ? (
                    <div style={{ fontSize: 13, color: '#f0f0fa', fontWeight: 600 }}>
                      <i className="fas fa-file-image" style={{ color: '#c9a84c', marginRight: 8 }}></i>
                      {proof.name}
                      <div style={{ fontSize: 11, color: '#5a5a78', fontWeight: 400, marginTop: 4 }}>
                        Tap to change
                      </div>
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-cloud-arrow-up" style={{
                        fontSize: 22, color: '#5a5a78',
                        marginBottom: 8, display: 'block',
                      }}></i>
                      <div style={{ fontSize: 13, color: '#9898b8' }}>
                        Screenshot or receipt of your crypto transfer
                      </div>
                      <div style={{ fontSize: 11, color: '#5a5a78', marginTop: 4 }}>
                        JPG, PNG, WEBP or PDF · max 5MB
                      </div>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => {
                      setProof(e.target.files?.[0] || null);
                      setErrors((prev) => ({ ...prev, proof: '' }));
                    }}
                    style={{ display: 'none' }}
                  />
                </div>
                {errors.proof && (
                  <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.proof}</span>
                )}
              </div>

              {/* Info box */}
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                background: 'rgba(129,140,248,0.06)',
                border: '1px solid rgba(129,140,248,0.15)',
                fontSize: 12.5, color: '#9898b8', lineHeight: 1.6,
              }}>
                <i className="fas fa-circle-info" style={{
                  color: '#818cf8', marginRight: 8,
                }}></i>
                After submitting, admin will verify your payment and
                activate your investment. This usually takes a few hours.
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '14px', borderRadius: 10,
                  fontSize: 14, fontWeight: 700,
                  background: submitting
                    ? 'rgba(201,168,76,0.4)'
                    : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                  color: '#0a0a0f', border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s ease',
                  boxShadow: submitting ? 'none' : '0 4px 20px rgba(201,168,76,0.25)',
                }}
              >
                {submitting
                  ? <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
                  : <><i className="fas fa-paper-plane"></i> Submit Investment Request</>}
              </button>

            </div>
          </form>
        </div>
      )}

      {/* My Investments */}
      <div className="inv-section">
        <div style={{
          fontSize: 15, fontWeight: 700,
          color: '#f0f0fa', marginBottom: 14,
        }}>
          My Investments
        </div>

        {loadingHistory ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
            <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c' }}></i>
          </div>
        ) : investments.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
          }}>
            <i className="fas fa-chart-line" style={{
              fontSize: 28, color: '#3a3a52',
              marginBottom: 12, display: 'block',
            }}></i>
            <div style={{ fontSize: 14, color: '#9898b8', marginBottom: 4 }}>
              No investments yet
            </div>
            <div style={{ fontSize: 12, color: '#5a5a78' }}>
              Click "New Investment" to get started
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {investments.map((inv) => {
              const progress  = maturityProgress(inv);
              const remaining = daysRemaining(inv.maturityDate);
              return (
                <div key={inv.id} style={{
                  background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 14, padding: '18px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* Top accent */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: `linear-gradient(90deg, transparent, ${STATUS_META[inv.status]?.color || '#c9a84c'}, transparent)`,
                  }} />

                  {/* Header row */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start',
                    justifyContent: 'space-between', gap: 12, marginBottom: 12,
                  }}>
                    <div>
                      <div style={{
                        fontSize: 15, fontWeight: 700,
                        color: '#f0f0fa', marginBottom: 3,
                      }}>
                        {inv.planName}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#5a5a78' }}>
                        Submitted {new Date(inv.createdAt).toLocaleDateString()}
                        {inv.txHash && (
                          <span style={{ marginLeft: 8, fontFamily: 'monospace' }}>
                            · {inv.txHash.slice(0, 12)}...
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusPill status={inv.status} />
                  </div>

                  {/* Progress bar — only for ACTIVE */}
                  {inv.status === 'ACTIVE' && inv.startDate && (
                    <>
                      <div style={{
                        height: 5,
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 4, overflow: 'hidden', marginBottom: 6,
                      }}>
                        <div style={{
                          height: '100%', width: `${progress}%`,
                          background: 'linear-gradient(90deg, #a8722a, #c9a84c)',
                          borderRadius: 4,
                        }} />
                      </div>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: 11, color: '#5a5a78', marginBottom: 12,
                      }}>
                        <span>{progress}% complete</span>
                        <span>{remaining} day{remaining === 1 ? '' : 's'} remaining</span>
                      </div>
                    </>
                  )}

                  {/* Stats row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12,
                    paddingTop: 12,
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div>
                      <div style={{
                        fontSize: 10, color: '#5a5a78',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        marginBottom: 3,
                      }}>
                        Amount Sent
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0fa' }}>
                        {formatCurrency(inv.amount)}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: 10, color: '#5a5a78',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        marginBottom: 3,
                      }}>
                        Expected Profit
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>
                        +{formatCurrency(inv.expectedProfit)}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: 10, color: '#5a5a78',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        marginBottom: 3,
                      }}>
                        {inv.status === 'COMPLETED' ? 'Paid Out' : 'Total Return'}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#c9a84c' }}>
                        {formatCurrency(
                          inv.status === 'COMPLETED'
                            ? inv.releasedAmount
                            : inv.expectedReturn
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pending message */}
                  {inv.status === 'PENDING' && (
                    <div style={{
                      marginTop: 12, padding: '10px 14px', borderRadius: 8,
                      background: 'rgba(234,179,8,0.06)',
                      border: '1px solid rgba(234,179,8,0.15)',
                      fontSize: 12, color: '#9898b8',
                    }}>
                      <i className="fas fa-clock" style={{
                        color: '#eab308', marginRight: 8,
                      }}></i>
                      Waiting for admin to verify your payment.
                      This usually takes a few hours.
                    </div>
                  )}

                  {/* Rejected message */}
                  {inv.status === 'REJECTED' && inv.adminNote && (
                    <div style={{
                      marginTop: 12, padding: '10px 14px', borderRadius: 8,
                      background: 'rgba(239,68,68,0.06)',
                      border: '1px solid rgba(239,68,68,0.15)',
                      fontSize: 12, color: '#9898b8',
                    }}>
                      <i className="fas fa-circle-xmark" style={{
                        color: '#ef4444', marginRight: 8,
                      }}></i>
                      {inv.adminNote}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}