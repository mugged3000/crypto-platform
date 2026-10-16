'use client';

import { useState } from 'react';

const topics = [
  'General question',
  'Account & login',
  'Deposits & withdrawals',
  'Investment plans',
  'Identity verification (KYC)',
  'Compliance / report a concern',
  'Partnership or press',
];

const emptyForm = { name: '', email: '', topic: topics[0], message: '', website: '' };

const fieldBase = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 10,
  fontSize: 14,
  color: '#f0f0fa',
  background: 'rgba(10,10,15,0.6)',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(255,255,255,0.1)',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color .2s ease, box-shadow .2s ease',
};

export default function ContactForm() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [serverError, setServerError] = useState('');

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const focus = (e) => {
    e.target.style.borderColor = 'rgba(201,168,76,0.55)';
    e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.08)';
  };
  const blur = (key) => (e) => {
    e.target.style.borderColor = errors[key] ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)';
    e.target.style.boxShadow = 'none';
  };

  const validate = () => {
    const er = {};
    if (form.name.trim().length < 2) er.name = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) er.email = 'Please enter a valid email address';
    if (form.message.trim().length < 10) er.message = 'Please write at least a few words (10+ characters)';
    return er;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;

    setStatus('sending');
    setServerError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setServerError(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('sent');
      setForm(emptyForm);
    } catch {
      setServerError('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  const labelStyle = { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#9898b8', marginBottom: 8 };
  const errStyle = { fontSize: 12, color: '#ef4444', marginTop: 6 };

  if (status === 'sent') {
    return (
      <div style={{
        padding: '64px 32px', borderRadius: 22, textAlign: 'center',
        background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
        border: '1px solid rgba(34,197,94,0.25)',
      }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-check" style={{ color: '#22c55e', fontSize: 24 }}></i>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f0f0fa', marginBottom: 10 }}>Message sent</h2>
        <p style={{ fontSize: 14.5, color: '#8888a8', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 24px' }}>
          Thanks for reaching out. We’ll reply to the email address you provided.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          style={{ padding: '11px 24px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: '#e4e4f0', background: 'transparent', border: '1px solid rgba(255,255,255,0.14)' }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        padding: 32, borderRadius: 22, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
        border: '1px solid rgba(201,168,76,0.15)',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f0f0fa', marginBottom: 6 }}>Send us a message</h2>
      <p style={{ fontSize: 13.5, color: '#8888a8', marginBottom: 26 }}>All fields are required.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 18 }}>
        <div>
          <label htmlFor="cf-name" style={labelStyle}>Full name</label>
          <input id="cf-name" type="text" autoComplete="name" value={form.name} onChange={set('name')} onFocus={focus} onBlur={blur('name')} placeholder="Jane Doe" style={{ ...fieldBase, borderColor: errors.name ? 'rgba(239,68,68,0.6)' : undefined }} />
          {errors.name && <div style={errStyle}>{errors.name}</div>}
        </div>
        <div>
          <label htmlFor="cf-email" style={labelStyle}>Email address</label>
          <input id="cf-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} onFocus={focus} onBlur={blur('email')} placeholder="you@example.com" style={{ ...fieldBase, borderColor: errors.email ? 'rgba(239,68,68,0.6)' : undefined }} />
          {errors.email && <div style={errStyle}>{errors.email}</div>}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label htmlFor="cf-topic" style={labelStyle}>Topic</label>
        <select id="cf-topic" value={form.topic} onChange={set('topic')} onFocus={focus} onBlur={blur('topic')} style={{ ...fieldBase, appearance: 'none', cursor: 'pointer' }}>
          {topics.map((t) => <option key={t} value={t} style={{ background: '#16162a' }}>{t}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label htmlFor="cf-message" style={labelStyle}>Message</label>
        <textarea id="cf-message" rows={6} value={form.message} onChange={set('message')} onFocus={focus} onBlur={blur('message')} placeholder="How can we help?" style={{ ...fieldBase, resize: 'vertical', lineHeight: 1.6, borderColor: errors.message ? 'rgba(239,68,68,0.6)' : undefined }} />
        {errors.message && <div style={errStyle}>{errors.message}</div>}
      </div>

      {/* Honeypot — hidden from people, tempting to bots */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
      </div>

      {status === 'error' && (
        <div role="alert" style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 10, fontSize: 13.5, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        style={{
          width: '100%', padding: '14px 24px', borderRadius: 10, fontSize: 14.5, fontWeight: 700,
          cursor: status === 'sending' ? 'not-allowed' : 'pointer', border: 'none', color: '#0a0a0f',
          background: 'linear-gradient(135deg, #c9a84c, #a8722a)', opacity: status === 'sending' ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}
      >
        {status === 'sending'
          ? <><i className="fas fa-spinner fa-spin"></i> Sending…</>
          : <>Send message <i className="fas fa-paper-plane" style={{ fontSize: 12 }}></i></>}
      </button>
    </form>
  );
}