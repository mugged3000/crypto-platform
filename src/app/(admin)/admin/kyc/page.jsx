'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';

const STATUS_META = {
  PENDING:              { label: 'Pending',   color: '#eab308' },
  APPROVED:              { label: 'Approved',  color: '#22c55e' },
  REJECTED:               { label: 'Rejected',   color: '#ef4444' },
  RESUBMIT_REQUESTED:      { label: 'Resubmit',    color: '#f97316' },
};

const DOC_LABELS = { PASSPORT: 'Passport', NATIONAL_ID: 'National ID', DRIVERS_LICENSE: "Driver's License" };

function ReviewModal({ submission, onClose, onDone }) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(null); // 'approve' | 'reject' | 'resubmit' | null

  const handleApprove = async () => {
    setSubmitting('approve');
    try {
      const res = await fetch(`/api/admin/kyc/${submission.id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) { toast.success('KYC approved'); onDone(); }
      else toast.error(data.error || 'Failed to approve');
    } finally {
      setSubmitting(null);
    }
  };

  const handleRejectOrResubmit = async (allowResubmit) => {
    if (!note.trim()) {
      toast.error('Please add a note explaining why');
      return;
    }
    setSubmitting(allowResubmit ? 'resubmit' : 'reject');
    try {
      const res = await fetch(`/api/admin/kyc/${submission.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note, allowResubmit }),
      });
      const data = await res.json();
      if (res.ok) { toast.success(allowResubmit ? 'Resubmission requested' : 'Submission rejected'); onDone(); }
      else toast.error(data.error || 'Failed');
    } finally {
      setSubmitting(null);
    }
  };

  const docs = [
    { label: 'Front of Document', url: submission.docFrontUrl },
    { label: 'Back of Document', url: submission.docBackUrl },
    { label: 'Selfie with Document', url: submission.selfieUrl },
  ].filter((d) => d.url);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#16162a', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 16, padding: '30px', width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '16px 16px 0 0', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            background: submission.user.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#0a0a0f',
          }}>
            {submission.user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={submission.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              `${submission.user.firstName?.[0] || ''}${submission.user.lastName?.[0] || ''}`
            )}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0fa' }}>{submission.user.firstName} {submission.user.lastName}</div>
            <div style={{ fontSize: 12, color: '#5a5a78' }}>{submission.user.email} · {DOC_LABELS[submission.docType] || submission.docType}</div>
          </div>
        </div>

        {/* Document images */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 22 }}>
          {docs.map((d) => (
            <div key={d.label}>
              <div style={{ fontSize: 11, color: '#9898b8', marginBottom: 6, fontWeight: 600 }}>{d.label}</div>
              {d.url.endsWith('.pdf') ? (
                <a href={d.url} target="_blank" rel="noreferrer" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  height: 140, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#c9a84c', textDecoration: 'none', fontSize: 12, gap: 8,
                }}>
                  <i className="fas fa-file-pdf" style={{ fontSize: 24 }}></i> View PDF
                </a>
              ) : (
                <a href={d.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.url} alt={d.label} style={{
                    width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                  }} />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Note */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: '#9898b8', display: 'block', marginBottom: 6 }}>
            Note (required for reject / resubmit — shown to the user)
          </label>
          <textarea
            value={note} onChange={(e) => setNote(e.target.value)} rows={3}
            placeholder="e.g. Document photo is blurry, please retake in better lighting"
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 9, resize: 'vertical',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0f0fa', fontSize: 13, outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={handleApprove} disabled={!!submitting} style={{
            flex: 1, minWidth: 140, padding: '12px', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
            background: submitting === 'approve' ? 'rgba(34,197,94,0.4)' : 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e',
          }}>
            <i className="fas fa-check" style={{ marginRight: 6 }}></i>
            {submitting === 'approve' ? 'Approving...' : 'Approve'}
          </button>
          <button onClick={() => handleRejectOrResubmit(true)} disabled={!!submitting} style={{
            flex: 1, minWidth: 140, padding: '12px', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
            background: submitting === 'resubmit' ? 'rgba(249,115,22,0.4)' : 'rgba(249,115,22,0.15)',
            border: '1px solid rgba(249,115,22,0.4)', color: '#f97316',
          }}>
            <i className="fas fa-rotate" style={{ marginRight: 6 }}></i>
            {submitting === 'resubmit' ? 'Sending...' : 'Request Resubmit'}
          </button>
          <button onClick={() => handleRejectOrResubmit(false)} disabled={!!submitting} style={{
            flex: 1, minWidth: 140, padding: '12px', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
            background: submitting === 'reject' ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444',
          }}>
            <i className="fas fa-xmark" style={{ marginRight: 6 }}></i>
            {submitting === 'reject' ? 'Rejecting...' : 'Reject'}
          </button>
        </div>

        <button onClick={onClose} disabled={!!submitting} style={{
          width: '100%', marginTop: 10, padding: '10px', borderRadius: 9, fontSize: 13, fontWeight: 600,
          background: 'transparent', color: '#5a5a78', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
        }}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function AdminKycPage() {
  const pageRef = useRef(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('PENDING');
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.kyc-row') || [],
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [submissions] });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/kyc?status=${status}`);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setSubmissions(data.submissions);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [status, refreshKey]);

  return (
    <div ref={pageRef}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0fa', marginBottom: 4, letterSpacing: '-0.02em' }}>Identity Verification</h1>
        <p style={{ fontSize: 13.5, color: '#5a5a78' }}>Review submitted documents and approve or reject KYC requests.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {['ALL', ...Object.keys(STATUS_META)].map((s) => {
          const meta = s === 'ALL' ? { label: 'All', color: '#c9a84c' } : STATUS_META[s];
          const active = status === s;
          return (
            <button key={s} onClick={() => setStatus(s)} style={{
              flexShrink: 0, padding: '8px 16px', borderRadius: 100, fontSize: 12.5, fontWeight: 600,
              background: active ? `${meta.color}18` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${active ? `${meta.color}50` : 'rgba(255,255,255,0.08)'}`,
              color: active ? meta.color : '#9898b8', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              {meta.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 20 }}></i>
        </div>
      ) : submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
          <i className="fas fa-id-card" style={{ fontSize: 28, color: '#3a3a52', marginBottom: 12, display: 'block' }}></i>
          <div style={{ fontSize: 14, color: '#5a5a78' }}>No submissions to review</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {submissions.map((s) => (
            <div key={s.id} className="kyc-row" onClick={() => setActiveSubmission(s)} style={{
              background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', opacity: 0,
              transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                background: s.user.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0a0a0f',
              }}>
                {s.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  `${s.user.firstName?.[0] || ''}${s.user.lastName?.[0] || ''}`
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0fa' }}>{s.user.firstName} {s.user.lastName}</div>
                <div style={{ fontSize: 12, color: '#5a5a78', marginTop: 2 }}>
                  {DOC_LABELS[s.docType] || s.docType} · {s.user.country || 'Unknown'} · Submitted {new Date(s.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, color: STATUS_META[s.status].color,
                background: `${STATUS_META[s.status].color}18`, border: `1px solid ${STATUS_META[s.status].color}35`,
                padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap',
              }}>
                {STATUS_META[s.status].label}
              </span>
              <i className="fas fa-chevron-right" style={{ fontSize: 11, color: '#5a5a78' }}></i>
            </div>
          ))}
        </div>
      )}

      {activeSubmission && (
        <ReviewModal
          submission={activeSubmission}
          onClose={() => setActiveSubmission(null)}
          onDone={() => { setActiveSubmission(null); setRefreshKey((k) => k + 1); }}
        />
      )}
    </div>
  );
}
