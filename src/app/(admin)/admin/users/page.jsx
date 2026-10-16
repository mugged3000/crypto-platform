'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { formatCurrency } from '@/lib/currency';

const STATUS_META = {
  ACTIVE:    { label: 'Active',    color: '#22c55e' },
  SUSPENDED: { label: 'Suspended', color: '#f97316' },
  BANNED:    { label: 'Banned',    color: '#ef4444' },
  FROZEN:    { label: 'Frozen',    color: '#818cf8' },
};

const KYC_META = {
  NOT_SUBMITTED:       { label: 'No KYC',  color: '#5a5a78' },
  PENDING:              { label: 'Pending', color: '#eab308' },
  APPROVED:              { label: 'Verified', color: '#22c55e' },
  REJECTED:               { label: 'Rejected', color: '#ef4444' },
  RESUBMIT_REQUESTED:      { label: 'Resubmit', color: '#f97316' },
};

function Pill({ meta }) {
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 700, color: meta.color,
      background: `${meta.color}18`, border: `1px solid ${meta.color}35`,
      padding: '3px 9px', borderRadius: 100, whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  );
}

export default function AdminUsersPage() {
  const pageRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.user-row') || [],
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, stagger: 0.03, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [users] });

  // Debounce search input.
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ status, page: String(page), ...(search ? { search } : {}) });
        const res = await fetch(`/api/admin/users?${params}`);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setUsers(data.users);
          setTotalPages(data.totalPages);
          setTotal(data.total);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [status, page, search]);

  return (
    <div ref={pageRef}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0fa', marginBottom: 4, letterSpacing: '-0.02em' }}>
          Users
        </h1>
        <p style={{ fontSize: 13.5, color: '#5a5a78' }}>{total} registered user{total === 1 ? '' : 's'}</p>
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a5a78', fontSize: 12 }}></i>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or referral code..."
            style={{
              width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#f0f0fa', fontSize: 13, outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['ALL', ...Object.keys(STATUS_META)].map((s) => {
            const meta = s === 'ALL' ? { label: 'All', color: '#c9a84c' } : STATUS_META[s];
            const active = status === s;
            return (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1); }}
                style={{
                  padding: '9px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600,
                  background: active ? `${meta.color}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? `${meta.color}50` : 'rgba(255,255,255,0.08)'}`,
                  color: active ? meta.color : '#9898b8', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 20 }}></i>
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
          <i className="fas fa-users" style={{ fontSize: 28, color: '#3a3a52', marginBottom: 12, display: 'block' }}></i>
          <div style={{ fontSize: 14, color: '#5a5a78' }}>No users match your search</div>
        </div>
      ) : (
        <>
          <div style={{
            background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden',
          }}>
            {users.map((u, i) => (
              <Link key={u.id} href={`/admin/users/${u.id}`} style={{ textDecoration: 'none' }}>
                <div className="user-row" style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer',
                  borderBottom: i < users.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                    background: u.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#0a0a0f',
                  }}>
                    {u.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f0f0fa' }}>{u.firstName} {u.lastName}</div>
                    <div style={{ fontSize: 11.5, color: '#5a5a78' }}>{u.email}</div>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 700, color: '#c9a84c', minWidth: 90, textAlign: 'right' }}>
                    {formatCurrency(u.balance)}
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <Pill meta={STATUS_META[u.status]} />
                    <Pill meta={KYC_META[u.kycStatus]} />
                  </div>

                  <i className="fas fa-chevron-right" style={{ fontSize: 11, color: '#5a5a78', flexShrink: 0 }}></i>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: page === 1 ? '#3a3a52' : '#9898b8', cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}>Previous</button>
              <span style={{ padding: '8px 14px', fontSize: 12.5, color: '#5a5a78' }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: page === totalPages ? '#3a3a52' : '#9898b8', cursor: page === totalPages ? 'not-allowed' : 'pointer',
              }}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
