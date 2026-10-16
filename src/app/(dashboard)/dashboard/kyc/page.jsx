'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';

const DOC_TYPES = [
  { value: 'PASSPORT',        label: 'Passport',              needsBack: false },
  { value: 'NATIONAL_ID',     label: 'National ID Card',      needsBack: true  },
  { value: 'DRIVERS_LICENSE', label: "Driver's License",      needsBack: true  },
];

const STATUS_META = {
  NOT_SUBMITTED:       { label: 'Not Submitted',       color: '#5a5a78', icon: 'fas fa-circle-minus' },
  PENDING:              { label: 'Under Review',        color: '#eab308', icon: 'fas fa-clock' },
  APPROVED:             { label: 'Verified',             color: '#22c55e', icon: 'fas fa-circle-check' },
  REJECTED:              { label: 'Rejected',             color: '#ef4444', icon: 'fas fa-circle-xmark' },
  RESUBMIT_REQUESTED:     { label: 'Resubmission Needed',  color: '#f97316', icon: 'fas fa-rotate' },
};

function FileDropSlot({ label, hint, file, onChange, error, accept }) {
  const inputRef = useRef(null);
  const previewUrl = file && file.type?.startsWith('image/') ? URL.createObjectURL(file) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          border: `1.5px dashed ${error ? 'rgba(239,68,68,0.5)' : file ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.15)'}`,
          borderRadius: 12,
          padding: file ? 12 : '28px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: file ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s ease',
        }}
      >
        {file ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                background: 'rgba(201,168,76,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="fas fa-file-pdf" style={{ color: '#c9a84c', fontSize: 18 }}></i>
              </div>
            )}
            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: '#f0f0fa', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </div>
              <div style={{ fontSize: 11, color: '#5a5a78' }}>Tap to change</div>
            </div>
          </div>
        ) : (
          <>
            <i className="fas fa-cloud-arrow-up" style={{ fontSize: 22, color: '#5a5a78', marginBottom: 8, display: 'block' }}></i>
            <div style={{ fontSize: 12.5, color: '#9898b8' }}>{hint}</div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          style={{ display: 'none' }}
        />
      </div>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#ef4444' }}>
          <i className="fas fa-circle-exclamation" style={{ fontSize: 11 }}></i>{error}
        </div>
      )}
    </div>
  );
}

export default function KycPage() {
  const pageRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState('NOT_SUBMITTED');
  const [latest, setLatest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [docType, setDocType] = useState('');
  const [docFront, setDocFront] = useState(null);
  const [docBack, setDocBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [errors, setErrors] = useState({});

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.kyc-section') || [],
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [loading] });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/user/kyc');
        const data = await res.json();
        if (res.ok) {
          setKycStatus(data.kycStatus);
          setLatest(data.latest);
        }
      } catch {
        toast.error('Could not load your verification status');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedDocMeta = DOC_TYPES.find((d) => d.value === docType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!docType) newErrors.docType = 'Please select a document type';
    if (!docFront) newErrors.docFront = 'Front of document is required';
    if (selectedDocMeta?.needsBack && !docBack) newErrors.docBack = 'Back of document is required';
    if (!selfie) newErrors.selfie = 'A selfie holding your document is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('docType', docType);
      formData.append('docFront', docFront);
      if (docBack) formData.append('docBack', docBack);
      formData.append('selfie', selfie);

      const res = await fetch('/api/user/kyc', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else toast.error(data.error || 'Submission failed');
        return;
      }

      toast.success('Documents submitted for review');
      setKycStatus('PENDING');
      setLatest(data.submission);
      setShowForm(false);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 20 }}></i>
      </div>
    );
  }

  const meta = STATUS_META[kycStatus] || STATUS_META.NOT_SUBMITTED;
  const canSubmit = ['NOT_SUBMITTED', 'REJECTED', 'RESUBMIT_REQUESTED'].includes(kycStatus);

  return (
    <div ref={pageRef} style={{ maxWidth: 640 }}>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0fa', marginBottom: 4, letterSpacing: '-0.02em' }}>
          Identity Verification
        </h1>
        <p style={{ fontSize: 13.5, color: '#5a5a78' }}>
          Verify your identity to unlock full withdrawal limits.
        </p>
      </div>

      {/* Status card */}
      <div className="kyc-section" style={{
        background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))',
        border: `1px solid ${meta.color}30`,
        borderRadius: 16,
        padding: '24px 26px',
        marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
          background: `${meta.color}18`, border: `1px solid ${meta.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className={meta.icon} style={{ fontSize: 18, color: meta.color }}></i>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: meta.color }}>{meta.label}</div>
          <div style={{ fontSize: 12.5, color: '#5a5a78', marginTop: 2 }}>
            {kycStatus === 'NOT_SUBMITTED' && "You haven't submitted any verification documents yet."}
            {kycStatus === 'PENDING' && `Submitted ${latest ? new Date(latest.createdAt).toLocaleDateString() : ''} — our team typically reviews within 24–48 hours.`}
            {kycStatus === 'APPROVED' && 'Your identity has been verified. Full account limits are unlocked.'}
            {(kycStatus === 'REJECTED' || kycStatus === 'RESUBMIT_REQUESTED') &&
              (latest?.adminNote || 'Your submission needs another look — please resubmit with clearer documents.')}
          </div>
        </div>

        {canSubmit && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '10px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700,
              background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
              color: '#0a0a0f', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
            }}
          >
            <i className="fas fa-upload" style={{ fontSize: 12 }}></i>
            {kycStatus === 'NOT_SUBMITTED' ? 'Start Verification' : 'Resubmit'}
          </button>
        )}
      </div>

      {/* Progress steps */}
      {kycStatus !== 'NOT_SUBMITTED' && (
        <div className="kyc-section" style={{
          display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20, padding: '0 4px',
        }}>
          {['Submitted', 'Under Review', kycStatus === 'REJECTED' ? 'Rejected' : 'Verified'].map((step, i) => {
            const activeIdx = kycStatus === 'PENDING' ? 1 : (kycStatus === 'APPROVED' || kycStatus === 'REJECTED') ? 2 : 0;
            const isDone = i < activeIdx || (kycStatus === 'APPROVED' && i <= 2);
            const isActive = i === activeIdx;
            const stepColor = (kycStatus === 'REJECTED' && i === 2) ? '#ef4444'
              : (isDone || isActive) ? '#c9a84c' : '#3a3a52';
            return (
              <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: stepColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: '#0a0a0f',
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 10.5, color: stepColor, whiteSpace: 'nowrap' }}>{step}</span>
                </div>
                {i < 2 && (
                  <div style={{ flex: 1, height: 2, background: i < activeIdx ? '#c9a84c' : '#2a2a3e', margin: '0 6px', marginBottom: 16 }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload form */}
      {showForm && canSubmit && (
        <div className="kyc-section" style={{
          background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: '26px',
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => { setDocType(e.target.value); setErrors((p) => ({ ...p, docType: '' })); }}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${errors.docType ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: docType ? '#f0f0fa' : '#5a5a78', fontSize: 14, outline: 'none',
                  }}
                >
                  <option value="">Select a document type...</option>
                  {DOC_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                {errors.docType && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#ef4444' }}>
                    <i className="fas fa-circle-exclamation" style={{ fontSize: 11 }}></i>{errors.docType}
                  </div>
                )}
              </div>

              <FileDropSlot
                label="Front of Document"
                hint="Clear photo, all corners visible"
                file={docFront}
                onChange={(f) => { setDocFront(f); setErrors((p) => ({ ...p, docFront: '' })); }}
                error={errors.docFront}
                accept="image/jpeg,image/png,image/webp,application/pdf"
              />

              {selectedDocMeta?.needsBack && (
                <FileDropSlot
                  label="Back of Document"
                  hint="Clear photo, all corners visible"
                  file={docBack}
                  onChange={(f) => { setDocBack(f); setErrors((p) => ({ ...p, docBack: '' })); }}
                  error={errors.docBack}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                />
              )}

              <FileDropSlot
                label="Selfie Holding Document"
                hint="Your face and the document clearly visible together"
                file={selfie}
                onChange={(f) => { setSelfie(f); setErrors((p) => ({ ...p, selfie: '' })); }}
                error={errors.selfie}
                accept="image/jpeg,image/png,image/webp"
              />

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                    background: submitting ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                    color: '#0a0a0f', border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {submitting
                    ? <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
                    : <><i className="fas fa-paper-plane"></i> Submit for Review</>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  style={{
                    padding: '13px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                    background: 'transparent', color: '#9898b8',
                    border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Info note */}
      {!showForm && (
        <div className="kyc-section" style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          padding: '14px 16px', borderRadius: 12,
          background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)',
        }}>
          <i className="fas fa-circle-info" style={{ color: '#c9a84c', fontSize: 13, marginTop: 2 }}></i>
          <span style={{ fontSize: 12.5, color: '#9898b8', lineHeight: 1.6 }}>
            All documents are transmitted securely and only used to verify your identity.
            We never share your documents with third parties.
          </span>
        </div>
      )}
    </div>
  );
}
