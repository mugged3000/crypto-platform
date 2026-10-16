'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';

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

function TicketDetail({ ticketId, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const threadEndRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/support/tickets/${ticketId}`);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setTicket(data.ticket);
        else toast.error(data.error || 'Could not load ticket');
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
      const res = await fetch(`/api/admin/support/tickets/${ticketId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Could not send reply'); return; }
      setReply('');
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status) => {
    setChangingStatus(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success('Status updated');
        setRefreshKey((k) => k + 1);
      } else {
        toast.error('Failed to update status');
      }
    } finally {
      setChangingStatus(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 20 }}></i>
      </div>
    );
  }
  if (!ticket) return null;

  return (
    <div>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#9898b8', fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
        <i className="fas fa-arrow-left" style={{ fontSize: 11 }}></i> Back to tickets
      </button>

      <div style={{ background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '20px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0fa', marginBottom: 4 }}>{ticket.subject}</div>
            <div style={{ fontSize: 12, color: '#5a5a78' }}>
              {ticket.user.firstName} {ticket.user.lastName} ({ticket.user.email}) · {ticket.category} · Opened {timeAgo(ticket.createdAt)}
            </div>
          </div>
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={changingStatus}
            style={{
              padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: `${STATUS_META[ticket.status].color}18`,
              border: `1px solid ${STATUS_META[ticket.status].color}40`,
              color: STATUS_META[ticket.status].color, cursor: 'pointer', outline: 'none',
            }}
          >
            {Object.entries(STATUS_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
          </select>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 420, overflowY: 'auto' }}>
          {ticket.replies.map((r) => (
            <div key={r.id} style={{ display: 'flex', gap: 10, flexDirection: r.isAdminReply ? 'row-reverse' : 'row' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                background: r.isAdminReply ? 'linear-gradient(135deg, #c9a84c, #a8722a)' : 'rgba(129,140,248,0.15)',
                border: r.isAdminReply ? 'none' : '1px solid rgba(129,140,248,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: r.isAdminReply ? '#0a0a0f' : '#818cf8',
              }}>
                {r.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.author.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : r.isAdminReply ? (
                  <i className="fas fa-shield-halved"></i>
                ) : (
                  `${r.author.firstName?.[0] || ''}${r.author.lastName?.[0] || ''}`
                )}
              </div>
              <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: r.isAdminReply ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: 12,
                  background: r.isAdminReply ? 'rgba(201,168,76,0.1)' : 'rgba(129,140,248,0.08)',
                  border: `1px solid ${r.isAdminReply ? 'rgba(201,168,76,0.2)' : 'rgba(129,140,248,0.2)'}`,
                  fontSize: 13.5, color: '#e8e8f0', lineHeight: 1.6,
                }}>
                  {r.message}
                </div>
                <span style={{ fontSize: 10.5, color: '#5a5a78' }}>
                  {r.isAdminReply ? 'You (Admin)' : `${r.author.firstName}`} · {timeAgo(r.createdAt)}
                </span>
              </div>
            </div>
          ))}
          <div ref={threadEndRef} />
        </div>

        <form onSubmit={handleReply} style={{ display: 'flex', gap: 10, padding: '16px 22px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <input
            value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply..."
            style={{ flex: 1, padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f0fa', fontSize: 13.5, outline: 'none' }}
          />
          <button type="submit" disabled={sending || !reply.trim()} style={{
            padding: '11px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: (sending || !reply.trim()) ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
            color: '#0a0a0f', border: 'none', cursor: (sending || !reply.trim()) ? 'not-allowed' : 'pointer',
          }}>
            {sending ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminSupportPage() {
  const pageRef = useRef(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('OPEN');
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.ticket-row') || [],
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [tickets, activeTicketId] });

  useEffect(() => {
    if (activeTicketId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/support/tickets?status=${status}`);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setTickets(data.tickets);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [status, activeTicketId, refreshKey]);

  if (activeTicketId) {
    return <TicketDetail ticketId={activeTicketId} onBack={() => { setActiveTicketId(null); setRefreshKey((k) => k + 1); }} />;
  }

  return (
    <div ref={pageRef}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0fa', marginBottom: 4, letterSpacing: '-0.02em' }}>Support Tickets</h1>
        <p style={{ fontSize: 13.5, color: '#5a5a78' }}>Respond to user inquiries across your platform.</p>
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
      ) : tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
          <i className="fas fa-headset" style={{ fontSize: 28, color: '#3a3a52', marginBottom: 12, display: 'block' }}></i>
          <div style={{ fontSize: 14, color: '#5a5a78' }}>No {status !== 'ALL' ? status.toLowerCase().replace('_', ' ') : ''} tickets</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tickets.map((t) => (
            <div key={t.id} className="ticket-row" onClick={() => setActiveTicketId(t.id)} style={{
              background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', opacity: 0,
              transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                background: t.user.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#0a0a0f',
              }}>
                {t.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  `${t.user.firstName?.[0] || ''}${t.user.lastName?.[0] || ''}`
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0fa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</div>
                <div style={{ fontSize: 12, color: '#5a5a78', marginTop: 2 }}>
                  {t.user.firstName} {t.user.lastName} · {t.category} · {t._count.replies} msg{t._count.replies === 1 ? '' : 's'} · {timeAgo(t.updatedAt)}
                </div>
              </div>
              <StatusPill status={t.status} />
              <i className="fas fa-chevron-right" style={{ fontSize: 11, color: '#5a5a78' }}></i>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
