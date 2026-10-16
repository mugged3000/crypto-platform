'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';
import { PAYMENT_METHODS } from '@/lib/paymentMethods';

const emptyForm = { method: '', label: '', address: '', network: '', instructions: '' };

function WalletModal({ wallet, onClose, onSaved }) {
  const isEdit = !!wallet;
  const [form, setForm] = useState(
    isEdit
      ? {
          method:       wallet.method,
          label:        wallet.label,
          address:      wallet.address,
          network:      wallet.network || '',
          instructions: wallet.instructions || '',
        }
      : emptyForm
  );
  const [errors,    setErrors]    = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url    = isEdit ? `/api/admin/wallets/${wallet.id}` : '/api/admin/wallets';
      const method = isEdit ? 'PATCH' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else toast.error(data.error || 'Failed');
        return;
      }
      toast.success(isEdit ? 'Wallet updated' : 'Wallet address added');
      onSaved();
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 9,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f0f0fa', fontSize: 13.5, outline: 'none',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: '#16162a', border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: 16, padding: '32px', width: '100%', maxWidth: 480, position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          borderRadius: '16px 16px 0 0',
          background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
        }} />

        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f0f0fa', marginBottom: 20 }}>
          {isEdit ? 'Edit Wallet Address' : 'Add Wallet Address'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Method */}
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#9898b8', display: 'block', marginBottom: 6 }}>
                Payment Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                {Object.entries(PAYMENT_METHODS).map(([key, m]) => (
                  <button
                    key={key} type="button"
                    onClick={() => { setForm((p) => ({ ...p, method: key })); setErrors((p) => ({ ...p, method: '' })); }}
                    style={{
                      padding: '10px 8px', borderRadius: 9, cursor: 'pointer',
                      background: form.method === key ? `${m.color}18` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${form.method === key ? `${m.color}60` : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <i className={m.icon} style={{ fontSize: 15, color: form.method === key ? m.color : '#9898b8' }}></i>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: form.method === key ? m.color : '#9898b8' }}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
              {errors.method && <span style={{ fontSize: 11.5, color: '#ef4444' }}>{errors.method}</span>}
            </div>

            {/* Label */}
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#9898b8', display: 'block', marginBottom: 5 }}>
                Label (e.g. "USDT TRC-20")
              </label>
              <input name="label" value={form.label} onChange={handleChange} style={inputStyle} placeholder="USDT TRC-20" />
              {errors.label && <span style={{ fontSize: 11.5, color: '#ef4444' }}>{errors.label}</span>}
            </div>

            {/* Address */}
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#9898b8', display: 'block', marginBottom: 5 }}>
                Wallet Address
              </label>
              <input
                name="address" value={form.address} onChange={handleChange}
                style={{ ...inputStyle, fontFamily: 'monospace' }}
                placeholder="Your crypto wallet address"
              />
              {errors.address && <span style={{ fontSize: 11.5, color: '#ef4444' }}>{errors.address}</span>}
            </div>

            {/* Network */}
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#9898b8', display: 'block', marginBottom: 5 }}>
                Network <span style={{ color: '#5a5a78', fontWeight: 400 }}>(optional — e.g. TRC-20, ERC-20)</span>
              </label>
              <input name="network" value={form.network} onChange={handleChange} style={inputStyle} placeholder="TRC-20" />
            </div>

            {/* Instructions */}
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#9898b8', display: 'block', marginBottom: 5 }}>
                Instructions for user <span style={{ color: '#5a5a78', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                name="instructions" value={form.instructions} onChange={handleChange}
                style={inputStyle} placeholder="e.g. Only send USDT on TRC-20 network"
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" disabled={submitting} style={{
                flex: 1, padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                background: submitting ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                color: '#0a0a0f', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
              }}>
                {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Wallet'}
              </button>
              <button type="button" onClick={onClose} disabled={submitting} style={{
                padding: '13px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                background: 'transparent', color: '#9898b8',
                border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
              }}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminWalletsPage() {
  const pageRef = useRef(null);
  const [wallets,     setWallets]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(undefined);
  const [refreshKey,  setRefreshKey]  = useState(0);
  const [busyId,      setBusyId]      = useState(null);

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.wallet-row') || [],
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [wallets] });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res  = await fetch('/api/admin/wallets');
        const data = await res.json();
        if (!cancelled && res.ok) setWallets(data.wallets);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const toggleActive = async (wallet) => {
    setBusyId(wallet.id);
    try {
      const res = await fetch(`/api/admin/wallets/${wallet.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isActive: !wallet.isActive }),
      });
      if (res.ok) {
        toast.success(wallet.isActive ? 'Wallet disabled' : 'Wallet enabled');
        setRefreshKey((k) => k + 1);
      }
    } finally { setBusyId(null); }
  };

  const deleteWallet = async (wallet) => {
    if (!confirm(`Delete "${wallet.label}"? This cannot be undone.`)) return;
    setBusyId(wallet.id);
    try {
      const res = await fetch(`/api/admin/wallets/${wallet.id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Wallet deleted'); setRefreshKey((k) => k + 1); }
      else toast.error('Failed to delete');
    } finally { setBusyId(null); }
  };

  return (
    <div ref={pageRef}>
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0fa', marginBottom: 4, letterSpacing: '-0.02em' }}>
            Wallet Addresses
          </h1>
          <p style={{ fontSize: 13.5, color: '#5a5a78' }}>
            These are the addresses shown to users on the deposit page.
          </p>
        </div>
        <button
          onClick={() => setModal(null)}
          style={{
            padding: '11px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 700,
            background: 'linear-gradient(135deg, #c9a84c, #a8722a)', color: '#0a0a0f',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <i className="fas fa-plus" style={{ fontSize: 11 }}></i>
          Add Wallet
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 20 }}></i>
        </div>
      ) : wallets.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16,
        }}>
          <i className="fas fa-wallet" style={{ fontSize: 28, color: '#3a3a52', marginBottom: 12, display: 'block' }}></i>
          <div style={{ fontSize: 14, color: '#5a5a78', marginBottom: 16 }}>No wallet addresses yet</div>
          <button onClick={() => setModal(null)} style={{
            padding: '10px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700,
            background: 'linear-gradient(135deg, #c9a84c, #a8722a)', color: '#0a0a0f', border: 'none', cursor: 'pointer',
          }}>
            Add your first wallet
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {wallets.map((wallet) => {
            const pm = PAYMENT_METHODS[wallet.method];
            return (
              <div key={wallet.id} className="wallet-row" style={{
                background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
                border: `1px solid ${wallet.isActive ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.15)'}`,
                borderRadius: 14, padding: '18px 20px',
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', opacity: 0,
              }}>
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: pm ? `${pm.color}15` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${pm ? `${pm.color}30` : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={pm?.icon || 'fas fa-wallet'} style={{ fontSize: 18, color: pm?.color || '#9898b8' }}></i>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f0f0fa' }}>
                      {wallet.label}
                    </span>
                    {!wallet.isActive && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#ef4444',
                        background: 'rgba(239,68,68,0.12)',
                        padding: '2px 7px', borderRadius: 100,
                      }}>
                        DISABLED
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#5a5a78', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 2 }}>
                    {wallet.address}
                  </div>
                  {wallet.network && (
                    <div style={{ fontSize: 11, color: '#5a5a78' }}>Network: {wallet.network}</div>
                  )}
                  {wallet.instructions && (
                    <div style={{ fontSize: 11, color: '#9898b8', marginTop: 2 }}>{wallet.instructions}</div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => setModal(wallet)}
                    disabled={busyId === wallet.id}
                    style={{
                      padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#9898b8', cursor: 'pointer',
                    }}
                  >
                    <i className="fas fa-pen" style={{ marginRight: 6 }}></i>Edit
                  </button>
                  <button
                    onClick={() => toggleActive(wallet)}
                    disabled={busyId === wallet.id}
                    style={{
                      padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                      background: wallet.isActive ? 'rgba(249,115,22,0.1)' : 'rgba(34,197,94,0.1)',
                      border: `1px solid ${wallet.isActive ? 'rgba(249,115,22,0.3)' : 'rgba(34,197,94,0.3)'}`,
                      color: wallet.isActive ? '#f97316' : '#22c55e',
                    }}
                  >
                    {wallet.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => deleteWallet(wallet)}
                    disabled={busyId === wallet.id}
                    style={{
                      padding: '8px 12px', borderRadius: 8, fontSize: 12.5,
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#ef4444', cursor: 'pointer',
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal !== undefined && (
        <WalletModal
          wallet={modal}
          onClose={() => setModal(undefined)}
          onSaved={() => { setModal(undefined); setRefreshKey((k) => k + 1); }}
        />
      )}
    </div>
  );
}