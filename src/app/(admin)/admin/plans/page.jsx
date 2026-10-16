'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/currency';

const emptyForm = { name: '', description: '', minAmount: '', maxAmount: '', rate: '', duration: '', sortOrder: '' };

function PlanModal({ plan, onClose, onSaved }) {
  const isEdit = !!plan;
  const [form, setForm] = useState(
    isEdit
      ? {
          name: plan.name, description: plan.description || '',
          minAmount: (plan.minAmount / 100).toString(),
          maxAmount: plan.maxAmount ? (plan.maxAmount / 100).toString() : '',
          rate: plan.rate.toString(), duration: plan.duration.toString(),
          sortOrder: plan.sortOrder.toString(),
        }
      : emptyForm
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/admin/plans/${plan.id}` : '/api/admin/plans';
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else toast.error(data.error || 'Failed to save plan');
        return;
      }
      toast.success(isEdit ? 'Plan updated' : 'Plan created');
      onSaved();
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%', padding: '11px 14px', borderRadius: 9,
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${hasError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
    color: '#f0f0fa', fontSize: 13.5, outline: 'none',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: '#16162a', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 16,
        padding: '32px', width: '100%', maxWidth: 480, position: 'relative', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '16px 16px 0 0', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f0f0fa', marginBottom: 20 }}>
          {isEdit ? 'Edit Plan' : 'New Investment Plan'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#9898b8', display: 'block', marginBottom: 5 }}>Name</label>
              <input name="name" value={form.name} onChange={handleChange} style={inputStyle(errors.name)} placeholder="e.g. Starter Plan" />
              {errors.name && <span style={{ fontSize: 11.5, color: '#ef4444' }}>{errors.name}</span>}
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#9898b8', display: 'block', marginBottom: 5 }}>Description</label>
              <input name="description" value={form.description} onChange={handleChange} style={inputStyle()} placeholder="Optional short description" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#9898b8', display: 'block', marginBottom: 5 }}>Min Amount ($)</label>
                <input name="minAmount" type="number" step="0.01" value={form.minAmount} onChange={handleChange} style={inputStyle(errors.minAmount)} placeholder="100" />
                {errors.minAmount && <span style={{ fontSize: 11.5, color: '#ef4444' }}>{errors.minAmount}</span>}
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#9898b8', display: 'block', marginBottom: 5 }}>Max Amount ($)</label>
                <input name="maxAmount" type="number" step="0.01" value={form.maxAmount} onChange={handleChange} style={inputStyle()} placeholder="No limit" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#9898b8', display: 'block', marginBottom: 5 }}>Return Rate (%)</label>
                <input name="rate" type="number" step="0.01" value={form.rate} onChange={handleChange} style={inputStyle(errors.rate)} placeholder="15" />
                {errors.rate && <span style={{ fontSize: 11.5, color: '#ef4444' }}>{errors.rate}</span>}
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#9898b8', display: 'block', marginBottom: 5 }}>Duration (days)</label>
                <input name="duration" type="number" value={form.duration} onChange={handleChange} style={inputStyle(errors.duration)} placeholder="30" />
                {errors.duration && <span style={{ fontSize: 11.5, color: '#ef4444' }}>{errors.duration}</span>}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#9898b8', display: 'block', marginBottom: 5 }}>Sort Order</label>
              <input name="sortOrder" type="number" value={form.sortOrder} onChange={handleChange} style={inputStyle()} placeholder="0" />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" disabled={submitting} style={{
                flex: 1, padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                background: submitting ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                color: '#0a0a0f', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
              }}>
                {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Plan'}
              </button>
              <button type="button" onClick={onClose} disabled={submitting} style={{
                padding: '13px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                background: 'transparent', color: '#9898b8', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
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

export default function AdminPlansPage() {
  const pageRef = useRef(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalPlan, setModalPlan] = useState(undefined); // undefined = closed, null = new, object = edit
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyId, setBusyId] = useState(null);

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.plan-row') || [],
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [plans] });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/plans');
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setPlans(data.plans);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const toggleActive = async (plan) => {
    setBusyId(plan.id);
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      if (res.ok) {
        toast.success(plan.isActive ? 'Plan deactivated' : 'Plan activated');
        setRefreshKey((k) => k + 1);
      } else {
        toast.error('Failed to update plan');
      }
    } finally {
      setBusyId(null);
    }
  };

  const deletePlan = async (plan) => {
    if (!confirm(`Delete "${plan.name}"? This can't be undone unless it has existing investments.`)) return;
    setBusyId(plan.id);
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(data.error || 'Failed to delete plan');
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div ref={pageRef}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0fa', marginBottom: 4, letterSpacing: '-0.02em' }}>Investment Plans</h1>
          <p style={{ fontSize: 13.5, color: '#5a5a78' }}>Create and manage the plans users can invest in.</p>
        </div>
        <button
          onClick={() => setModalPlan(null)}
          style={{
            padding: '11px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 700,
            background: 'linear-gradient(135deg, #c9a84c, #a8722a)', color: '#0a0a0f',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
          }}
        >
          <i className="fas fa-plus" style={{ fontSize: 11 }}></i> New Plan
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 20 }}></i>
        </div>
      ) : plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
          <i className="fas fa-layer-group" style={{ fontSize: 28, color: '#3a3a52', marginBottom: 12, display: 'block' }}></i>
          <div style={{ fontSize: 14, color: '#5a5a78', marginBottom: 16 }}>No plans yet</div>
          <button onClick={() => setModalPlan(null)} style={{
            padding: '10px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700,
            background: 'linear-gradient(135deg, #c9a84c, #a8722a)', color: '#0a0a0f', border: 'none', cursor: 'pointer',
          }}>
            Create your first plan
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {plans.map((plan) => (
            <div key={plan.id} className="plan-row" style={{
              background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
              border: `1px solid ${plan.isActive ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.15)'}`,
              borderRadius: 14, padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', opacity: 0,
            }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#f0f0fa' }}>{plan.name}</span>
                  {!plan.isActive && (
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.12)', padding: '2px 8px', borderRadius: 100 }}>
                      INACTIVE
                    </span>
                  )}
                </div>
                {plan.description && <div style={{ fontSize: 12, color: '#5a5a78', marginTop: 3 }}>{plan.description}</div>}
              </div>

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 10, color: '#5a5a78', textTransform: 'uppercase' }}>Rate</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#c9a84c' }}>{plan.rate}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#5a5a78', textTransform: 'uppercase' }}>Duration</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0fa' }}>{plan.duration}d</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#5a5a78', textTransform: 'uppercase' }}>Range</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>
                    {formatCurrency(plan.minAmount)} – {plan.maxAmount ? formatCurrency(plan.maxAmount) : '∞'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#5a5a78', textTransform: 'uppercase' }}>Investors</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0fa' }}>{plan._count.investments}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <button
                  onClick={() => setModalPlan(plan)}
                  disabled={busyId === plan.id}
                  style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9898b8', cursor: 'pointer' }}
                >
                  <i className="fas fa-pen" style={{ marginRight: 6 }}></i>Edit
                </button>
                <button
                  onClick={() => toggleActive(plan)}
                  disabled={busyId === plan.id}
                  style={{
                    padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                    background: plan.isActive ? 'rgba(249,115,22,0.1)' : 'rgba(34,197,94,0.1)',
                    border: `1px solid ${plan.isActive ? 'rgba(249,115,22,0.3)' : 'rgba(34,197,94,0.3)'}`,
                    color: plan.isActive ? '#f97316' : '#22c55e',
                  }}
                >
                  {plan.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deletePlan(plan)}
                  disabled={busyId === plan.id}
                  style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12.5, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer' }}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalPlan !== undefined && (
        <PlanModal
          plan={modalPlan}
          onClose={() => setModalPlan(undefined)}
          onSaved={() => { setModalPlan(undefined); setRefreshKey((k) => k + 1); }}
        />
      )}
    </div>
  );
}
