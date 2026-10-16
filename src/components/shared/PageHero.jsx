'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// Reusable header for inner pages: breadcrumb, icon, title, subtitle and an
// optional meta pill (e.g. "Last updated …").
export default function PageHero({ eyebrow, title, subtitle, icon, breadcrumb = [], meta, children }) {
  const ref = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      ref.current.querySelectorAll('.hero-item'),
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.09, ease: 'power3.out', delay: 0.1 }
    );
  }, { scope: ref });

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '150px 24px 64px',
        background: '#0a0a0f',
        borderBottom: '1px solid rgba(201,168,76,0.08)',
      }}
    >
      <div style={{
        position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)',
        width: 900, height: 520, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.09) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
        {breadcrumb.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="hero-item"
            style={{
              opacity: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: 8, fontSize: 12.5, color: '#5a5a78', marginBottom: 28, flexWrap: 'wrap',
            }}
          >
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {crumb.href ? (
                  <Link href={crumb.href} style={{ color: '#8888a8', textDecoration: 'none' }}>{crumb.label}</Link>
                ) : (
                  <span style={{ color: '#c9a84c' }}>{crumb.label}</span>
                )}
                {i < breadcrumb.length - 1 && <i className="fas fa-chevron-right" style={{ fontSize: 8 }}></i>}
              </span>
            ))}
          </nav>
        )}

        {icon && (
          <div className="hero-item" style={{
            opacity: 0, width: 64, height: 64, borderRadius: 18, margin: '0 auto 22px',
            background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(201,168,76,0.12)',
          }}>
            <i className={icon} style={{ color: '#c9a84c', fontSize: 24 }}></i>
          </div>
        )}

        {eyebrow && (
          <div className="hero-item" style={{
            opacity: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#c9a84c', marginBottom: 14,
          }}>
            {eyebrow}
          </div>
        )}

        <h1 className="hero-item" style={{
          opacity: 0, fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800,
          letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 18,
          background: 'linear-gradient(135deg, #f0f0fa 0%, #c9a84c 85%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          {title}
        </h1>

        {subtitle && (
          <p className="hero-item" style={{
            opacity: 0, fontSize: 16.5, color: '#8888a8', lineHeight: 1.75,
            maxWidth: 640, margin: '0 auto',
          }}>
            {subtitle}
          </p>
        )}

        {meta && (
          <div className="hero-item" style={{
            opacity: 0, display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 26,
            padding: '7px 16px', borderRadius: 999, fontSize: 12.5, color: '#9898b8',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <i className="far fa-clock" style={{ fontSize: 11, color: '#c9a84c' }}></i>
            {meta}
          </div>
        )}

        {children}
      </div>
    </section>
  );
}