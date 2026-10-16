'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/currency';

export default function ReferralsPage() {
  const pageRef = useRef(null);

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  useGSAP(() => {
    if (!data) return;
    gsap.fromTo(
      pageRef.current?.querySelectorAll('.ref-card') || [],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
    );
  }, { scope: pageRef, dependencies: [data] });

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch('/api/user/referrals');
        const json = await res.json();
        if (res.ok) setData(json);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const copyLink = () => {
    if (!data?.referralLink) return;
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode);
    toast.success('Referral code copied!');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <i className="fas fa-spinner fa-spin" style={{ color: '#c9a84c', fontSize: 22 }}></i>
      </div>
    );
  }

  return (
    <div ref={pageRef} style={{ maxWidth: 720 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 24, fontWeight: 800,
          color: '#f0f0fa', marginBottom: 4,
          letterSpacing: '-0.02em',
        }}>
          Referrals
        </h1>
        <p style={{ fontSize: 13.5, color: '#5a5a78' }}>
          Invite friends and earn commission when they invest.
        </p>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 14, marginBottom: 24,
      }}
      className="ref-stats-grid"
      >
        {[
          {
            label: 'Total Referrals',
            value: data?.totalReferrals ?? 0,
            icon:  'fas fa-users',
            color: '#818cf8',
            format: (v) => v,
          },
          {
            label: 'Total Earned',
            value: data?.totalEarned ?? 0,
            icon:  'fas fa-trophy',
            color: '#22c55e',
            format: (v) => formatCurrency(v),
          },
          {
            label: 'Pending',
            value: data?.pendingCommission ?? 0,
            icon:  'fas fa-clock',
            color: '#eab308',
            format: (v) => formatCurrency(v),
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="ref-card"
            style={{
              background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '4px 16px 16px 16px',
              padding: '20px',
              position: 'relative', overflow: 'hidden',
              opacity: 0,
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
            }} />
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: `${stat.color}15`,
              border: `1px solid ${stat.color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <i className={stat.icon} style={{ color: stat.color, fontSize: 15 }}></i>
            </div>
            <div style={{ fontSize: 11, color: '#5a5a78', marginBottom: 4 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f0f0fa' }}>
              {stat.format(stat.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Referral link card */}
      <div
        className="ref-card"
        style={{
          background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: '4px 20px 20px 20px',
          padding: '28px',
          marginBottom: 24,
          position: 'relative', overflow: 'hidden',
          opacity: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
        }} />

        <div style={{
          fontSize: 15, fontWeight: 700,
          color: '#f0f0fa', marginBottom: 6,
        }}>
          Your Referral Link
        </div>
        <p style={{ fontSize: 13, color: '#5a5a78', marginBottom: 20, lineHeight: 1.6 }}>
          Share this link with friends. When they register and invest,
          you earn a commission automatically.
        </p>

        {/* Referral link */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#5a5a78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Referral Link
          </div>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'center',
          }}>
            <div style={{
              flex: 1, padding: '11px 14px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: 13, color: '#9898b8',
              wordBreak: 'break-all', lineHeight: 1.5,
            }}>
              {data?.referralLink}
            </div>
            <button
              onClick={copyLink}
              style={{
                flexShrink: 0,
                padding: '11px 18px',
                borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: copied
                  ? 'rgba(34,197,94,0.15)'
                  : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                color: copied ? '#22c55e' : '#0a0a0f',
                border: copied ? '1px solid rgba(34,197,94,0.3)' : 'none',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'all 0.2s ease',
              }}
            >
              <i className={copied ? 'fas fa-check' : 'fas fa-copy'}></i>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Referral code */}
        <div>
          <div style={{ fontSize: 11, color: '#5a5a78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Referral Code
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              padding: '11px 20px',
              borderRadius: 10,
              background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.2)',
              fontSize: 18, fontWeight: 800,
              color: '#c9a84c', letterSpacing: '0.1em',
            }}>
              {data?.referralCode}
            </div>
            <button
              onClick={copyCode}
              style={{
                padding: '11px 16px', borderRadius: 10,
                fontSize: 13, fontWeight: 600,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#9898b8', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)';
                e.currentTarget.style.color = '#c9a84c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = '#9898b8';
              }}
            >
              <i className="fas fa-copy"></i> Copy Code
            </button>
          </div>
        </div>

        {/* How it works */}
        <div style={{
          marginTop: 20, padding: '14px 16px', borderRadius: 10,
          background: 'rgba(129,140,248,0.06)',
          border: '1px solid rgba(129,140,248,0.15)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#818cf8', marginBottom: 8 }}>
            <i className="fas fa-circle-info" style={{ marginRight: 6 }}></i>
            How referrals work
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'Share your link or code with friends',
              'They register using your link',
              'You earn commission when they invest',
              'Commission is credited to your balance',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#9898b8' }}>
                <span style={{ color: '#818cf8', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Referral history */}
      <div
        className="ref-card"
        style={{
          background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '4px 16px 16px 16px',
          overflow: 'hidden',
          opacity: 0,
        }}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          fontSize: 14, fontWeight: 700, color: '#f0f0fa',
        }}>
          People You Referred ({data?.totalReferrals ?? 0})
        </div>

        {!data?.referrals?.length ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <i className="fas fa-user-plus" style={{
              fontSize: 28, color: '#3a3a52',
              marginBottom: 12, display: 'block',
            }}></i>
            <div style={{ fontSize: 14, color: '#5a5a78', marginBottom: 4 }}>
              No referrals yet
            </div>
            <div style={{ fontSize: 12, color: '#3a3a52' }}>
              Share your link to start earning
            </div>
          </div>
        ) : (
          <div>
            {data.referrals.map((ref, i) => (
              <div key={ref.id} style={{
                display: 'flex', alignItems: 'center',
                gap: 14, padding: '14px 20px',
                borderBottom: i < data.referrals.length - 1
                  ? '1px solid rgba(255,255,255,0.04)'
                  : 'none',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #818cf8, #4f46e5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#fff',
                }}>
                  {ref.referee.firstName?.[0]}{ref.referee.lastName?.[0]}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f0f0fa' }}>
                    {ref.referee.firstName} {ref.referee.lastName}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#5a5a78' }}>
                    Joined {new Date(ref.referee.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Commission */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: ref.isPaid ? '#22c55e' : '#eab308',
                  }}>
                    {ref.commissionEarned > 0
                      ? formatCurrency(ref.commissionEarned)
                      : 'Pending'}
                  </div>
                  <div style={{ fontSize: 11, color: '#5a5a78' }}>
                    {ref.commissionRate}% commission
                  </div>
                </div>

                {/* Status */}
                <span style={{
                  fontSize: 10.5, fontWeight: 700,
                  color: ref.isPaid ? '#22c55e' : '#eab308',
                  background: ref.isPaid ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                  border: `1px solid ${ref.isPaid ? 'rgba(34,197,94,0.3)' : 'rgba(234,179,8,0.3)'}`,
                  padding: '3px 9px', borderRadius: 100,
                  flexShrink: 0,
                }}>
                  {ref.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .ref-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}