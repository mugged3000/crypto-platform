'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const ACTION_COLORS = {
  KYC_APPROVED: '#22c55e', KYC_REJECTED: '#ef4444', KYC_RESUBMIT_REQUESTED: '#f97316',
  USER_UPDATED: '#818cf8',
  PLAN_CREATED: '#22c55e', PLAN_UPDATED: '#c9a84c', PLAN_ACTIVATED: '#22c55e', PLAN_DEACTIVATED: '#f97316', PLAN_DELETED: '#ef4444',
  TICKET_REPLIED: '#818cf8', TICKET_STATUS_CHANGED: '#c9a84c',
};

function actionColor(action) {
  return ACTION_COLORS[action] || '#5a5a78';
}

function formatAction(action) {
  return action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export default function AuditLogsPage() {
  const pageRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [availableActions, setAvailableActions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  useGSAP(() => {
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.log-row') || [],
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, stagger: 0.03, ease: 'power2.out' }
    );
  }, { scope: pageRef, dependencies: [logs] });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/audit-logs?action=${actionFilter}&page=${page}`);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setLogs(data.logs);
          setTotalPages(data.totalPages);
          setAvailableActions(data.availableActions);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [actionFilter, page]);

  return (
    <div ref={pageRef}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0fa', marginBottom: 4, letterSpacing: '-0.02em' }}>
          Audit Logs
        </h1>
        <p style={{ fontSize: 13.5, color: '#5a5a78' }}>
          A complete trail of every admin action taken on the platform.
        </p>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {['ALL', ...availableActions].map((a) => {
          const active = actionFilter === a;
          const color = a === 'ALL' ? '#c9a84c' : actionColor(a);
          return (
            <button
              key={a}
              onClick={() => { setActionFilter(a); setPage(1); }}
              style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                background: active ? `${color}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? `${color}50` : 'rgba(255,255,255,0.08)'}`,
                color: active ? color : '#9898b8', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {a === 'ALL' ? 'All Actions' : formatAction(a)}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 20 }}></i>
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
          <i className="fas fa-scroll" style={{ fontSize: 28, color: '#3a3a52', marginBottom: 12, display: 'block' }}></i>
          <div style={{ fontSize: 14, color: '#5a5a78' }}>No audit log entries yet</div>
        </div>
      ) : (
        <>
          <div style={{
            background: 'linear-gradient(145deg, rgba(20,20,36,0.85), rgba(12,12,22,0.9))',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden',
          }}>
            {logs.map((log, i) => {
              const color = actionColor(log.action);
              const isExpanded = expandedId === log.id;
              return (
                <div key={log.id} className="log-row" style={{ borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                      background: `${color}15`, border: `1px solid ${color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    }}>
                      {log.admin.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={log.admin.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <i className="fas fa-user-shield" style={{ fontSize: 13, color }}></i>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, color: '#f0f0fa' }}>
                        <strong>{log.admin.firstName} {log.admin.lastName}</strong>
                        <span style={{ color: '#9898b8' }}> — </span>
                        <span style={{ color, fontWeight: 600 }}>{formatAction(log.action)}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: '#5a5a78', marginTop: 2 }}>
                        {log.targetType} · {log.targetId.slice(0, 8)}... · {new Date(log.createdAt).toLocaleString()}
                        {log.ipAddress && ` · ${log.ipAddress}`}
                      </div>
                    </div>

                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{ fontSize: 11, color: '#5a5a78' }}></i>
                  </div>

                  {isExpanded && log.details && (
                    <div style={{
                      padding: '0 20px 16px 68px',
                    }}>
                      <pre style={{
                        margin: 0, padding: '12px 14px', borderRadius: 10,
                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)',
                        fontSize: 11.5, color: '#9898b8', overflowX: 'auto', fontFamily: 'monospace',
                      }}>
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: page === 1 ? '#3a3a52' : '#9898b8', cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <span style={{ padding: '8px 14px', fontSize: 12.5, color: '#5a5a78' }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: page === totalPages ? '#3a3a52' : '#9898b8', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
