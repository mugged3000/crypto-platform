'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Account', 'Deposit', 'Withdrawal', 'Investment', 'KYC', 'Other'];

const STATUS_META = {
  OPEN:        { label: 'Open',        color: '#818cf8' },
  IN_PROGRESS: { label: 'In Progress', color: '#eab308' },
  RESOLVED:    { label: 'Resolved',    color: '#22c55e' },
  CLOSED:      { label: 'Closed',      color: '#5a5a78' },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.OPEN;
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

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ── New ticket form ──────────────────────────────────────────────
function NewTicketForm({ onCreated, onCancel }) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (!category) newErrors.category = 'Please select a category';
    if (!message.trim()) newErrors.message = 'Please describe your issue';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, category, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else toast.error(data.error || 'Could not create ticket');
        return;
      }
      toast.success('Ticket submitted');
      onCreated(data.ticket);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16, padding: '26px', marginBottom: 20,
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0fa', marginBottom: 18 }}>
        New Support Ticket
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>Subject</label>
              <input
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setErrors((p) => ({ ...p, subject: '' })); }}
                placeholder="Brief summary of your issue"
                style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${errors.subject ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: '#f0f0fa', fontSize: 14, outline: 'none',
                }}
              />
              {errors.subject && <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.subject}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setErrors((p) => ({ ...p, category: '' })); }}
                style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${errors.category ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: category ? '#f0f0fa' : '#5a5a78', fontSize: 14, outline: 'none',
                }}
              >
                <option value="">Select...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.category}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b8' }}>Message</label>
            <textarea
              value={message}
              onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: '' })); }}
              placeholder="Describe your issue in detail..."
              rows={5}
              style={{
                padding: '12px 14px', borderRadius: 10, resize: 'vertical',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${errors.message ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: '#f0f0fa', fontSize: 14, outline: 'none', fontFamily: 'inherit',
              }}
            />
            {errors.message && <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.message}</span>}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1, padding: '12px', borderRadius: 10, fontSize: 13.5, fontWeight: 700,
                background: submitting ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                color: '#0a0a0f', border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {submitting
                ? <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
                : <><i className="fas fa-paper-plane"></i> Submit Ticket</>}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              style={{
                padding: '12px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 700,
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
  );
}

// ── Ticket detail / thread view ──────────────────────────────────
function TicketDetail({ ticketId, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const threadEndRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/user/support/tickets/${ticketId}`);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setTicket(data.ticket);
        else toast.error(data.error || 'Could not load ticket');
      } catch {
        if (!cancelled) toast.error('Network error loading ticket');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ticketId, refreshKey]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.replies?.length]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/user/support/tickets/${ticketId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Could not send reply');
        return;
      }
      setReply('');
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
        <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 20 }}></i>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', color: '#9898b8',
          fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0,
        }}
      >
        <i className="fas fa-arrow-left" style={{ fontSize: 11 }}></i> Back to tickets
      </button>

      <div style={{
        background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0fa', marginBottom: 4 }}>
              {ticket.subject}
            </div>
            <div style={{ fontSize: 12, color: '#5a5a78' }}>
              {ticket.category} · Opened {timeAgo(ticket.createdAt)}
            </div>
          </div>
          <StatusPill status={ticket.status} />
        </div>

        {/* Thread */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 420, overflowY: 'auto' }}>
          {ticket.replies.map((r) => (
            <div key={r.id} style={{
              display: 'flex', gap: 10,
              flexDirection: r.isAdminReply ? 'row' : 'row-reverse',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                background: r.isAdminReply ? 'rgba(129,140,248,0.15)' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                border: r.isAdminReply ? '1px solid rgba(129,140,248,0.3)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: r.isAdminReply ? '#818cf8' : '#0a0a0f',
              }}>
                {r.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.author.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : r.isAdminReply ? (
                  <i className="fas fa-headset"></i>
                ) : (
                  `${r.author.firstName?.[0] || ''}${r.author.lastName?.[0] || ''}`
                )}
              </div>
              <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: r.isAdminReply ? 'flex-start' : 'flex-end' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: 12,
                  background: r.isAdminReply ? 'rgba(129,140,248,0.08)' : 'rgba(201,168,76,0.1)',
                  border: `1px solid ${r.isAdminReply ? 'rgba(129,140,248,0.2)' : 'rgba(201,168,76,0.2)'}`,
                  fontSize: 13.5, color: '#e8e8f0', lineHeight: 1.6,
                }}>
                  {r.message}
                </div>
                <span style={{ fontSize: 10.5, color: '#5a5a78' }}>
                  {r.isAdminReply ? 'Support Team' : 'You'} · {timeAgo(r.createdAt)}
                </span>
              </div>
            </div>
          ))}
          <div ref={threadEndRef} />
        </div>

        {/* Reply box */}
        {ticket.status !== 'CLOSED' ? (
          <form onSubmit={handleReply} style={{
            display: 'flex', gap: 10, padding: '16px 22px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type a reply..."
              style={{
                flex: 1, padding: '11px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f0f0fa', fontSize: 13.5, outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              style={{
                padding: '11px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: (sending || !reply.trim()) ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                color: '#0a0a0f', border: 'none',
                cursor: (sending || !reply.trim()) ? 'not-allowed' : 'pointer',
              }}
            >
              {sending ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
            </button>
          </form>
        ) : (
          <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 12.5, color: '#5a5a78', textAlign: 'center' }}>
            This ticket is closed. Open a new ticket if you need further help.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function SupportPage() {
  const pageRef = useRef(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.support-section') || [],
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [loading, activeTicketId] });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/user/support/tickets');
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setTickets(data.tickets);
      } catch {
        if (!cancelled) toast.error('Could not load your tickets');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const refreshTickets = () => setRefreshKey((k) => k + 1);

  if (activeTicketId) {
    return (
      <div ref={pageRef} style={{ maxWidth: 680 }}>
        <TicketDetail
          ticketId={activeTicketId}
          onBack={() => { setActiveTicketId(null); refreshTickets(); }}
        />
      </div>
    );
  }

  return (
    <div ref={pageRef} style={{ maxWidth: 680 }}>

      <div className="support-section" style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 12, flexWrap: 'wrap', marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0fa', marginBottom: 4, letterSpacing: '-0.02em' }}>
            Support
          </h1>
          <p style={{ fontSize: 13.5, color: '#5a5a78' }}>
            Get help with your account, deposits, withdrawals, or anything else.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '10px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700,
              background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
              color: '#0a0a0f', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
            }}
          >
            <i className="fas fa-plus" style={{ fontSize: 11 }}></i> New Ticket
          </button>
        )}
      </div>

      {showForm && (
        <div className="support-section">
          <NewTicketForm
            onCreated={(ticket) => {
              setShowForm(false);
              refreshTickets();
              setActiveTicketId(ticket.id);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="support-section">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 18 }}></i>
          </div>
        ) : tickets.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
          }}>
            <i className="fas fa-headset" style={{ fontSize: 26, color: '#3a3a52', marginBottom: 12, display: 'block' }}></i>
            <div style={{ fontSize: 14, color: '#9898b8', marginBottom: 4 }}>No support tickets yet</div>
            <div style={{ fontSize: 12.5, color: '#5a5a78' }}>Open a ticket if you run into any issues.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTicketId(t.id)}
                style={{
                  background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 14, padding: '16px 18px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer', transition: 'border-color 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className="fas fa-headset" style={{ fontSize: 13, color: '#c9a84c' }}></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0fa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.subject}
                  </div>
                  <div style={{ fontSize: 12, color: '#5a5a78', marginTop: 2 }}>
                    {t.category} · {t._count.replies} {t._count.replies === 1 ? 'message' : 'messages'} · {timeAgo(t.updatedAt)}
                  </div>
                </div>
                <StatusPill status={t.status} />
                <i className="fas fa-chevron-right" style={{ fontSize: 11, color: '#5a5a78' }}></i>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
