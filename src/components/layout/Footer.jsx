'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const linkColumns = [
  {
    heading: 'Platform',
    links: [
      { label: 'Home', href: '#home' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Investment Plans', href: '#plans' },
      { label: 'Why Us', href: '#why-us' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Press Kit', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms of Service', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Risk Disclosure', href: '#' },
      { label: 'AML Policy', href: '#' },
      { label: 'Compliance', href: '#' },
    ],
  },
];

const socials = [
  { icon: 'fab fa-x-twitter',  href: '#', color: '#818cf8' },
  { icon: 'fab fa-telegram',   href: '#', color: '#c9a84c' },
  { icon: 'fab fa-discord',    href: '#', color: '#22c55e' },
  { icon: 'fab fa-instagram',  href: '#', color: '#ef4444' },
  { icon: 'fab fa-linkedin-in', href: '#', color: '#818cf8' },
];

const acceptedCoins = [
  { symbol: 'BTC', color: '#f7931a', icon: 'fab fa-bitcoin' },
  { symbol: 'ETH', color: '#627eea', icon: 'fab fa-ethereum' },
  { symbol: 'USDT', color: '#26a17b', icon: 'fas fa-dollar-sign' },
  { symbol: 'BNB', color: '#f3ba2f', icon: 'fas fa-coins' },
  { symbol: 'SOL', color: '#9945ff', icon: 'fas fa-sun' },
];

export default function Footer() {
  const sectionRef = useRef(null);
  const topRef      = useRef(null);
  const columnsRef  = useRef([]);
  const bottomRef   = useRef(null);

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useGSAP(() => {
    gsap.fromTo(topRef.current,
      { y: 36, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: topRef.current, start: 'top 90%' },
      }
    );

    columnsRef.current.forEach((col, i) => {
      if (!col) return;
      gsap.fromTo(col,
        { y: 28, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          delay: i * 0.08,
          scrollTrigger: { trigger: col, start: 'top 92%' },
        }
      );
    });

    gsap.fromTo(bottomRef.current,
      { opacity: 0 },
      {
        opacity: 1, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: bottomRef.current, start: 'top 95%' },
      }
    );
  }, { scope: sectionRef });

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
    <footer
      ref={sectionRef}
      style={{
        background: '#08080d',
        borderTop: '1px solid rgba(201,168,76,0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .footer-top-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 40px;
        }
        .footer-social {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s ease, background 0.3s ease;
        }
        .footer-social:hover {
          transform: translateY(-4px) scale(1.06);
        }
        .footer-link {
          transition: color 0.2s ease, padding-left 0.2s ease;
          display: inline-block;
        }
        .footer-link:hover {
          color: #c9a84c !important;
          padding-left: 4px;
        }
        .footer-newsletter-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .footer-newsletter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(201,168,76,0.35);
        }
        .footer-coin {
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .footer-coin:hover {
          transform: translateY(-3px);
        }

        @media (max-width: 1024px) {
          .footer-top-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px 24px;
          }
        }
        @media (max-width: 640px) {
          .footer-top-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }
        }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        bottom: '-20%', left: '50%',
        transform: 'translateX(-50%)',
        width: 900, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 0', position: 'relative' }}>

        <div ref={topRef} className="footer-top-grid" style={{ opacity: 0, marginBottom: 56 }}>

          {/* Brand column */}
          <div ref={(el) => (columnsRef.current[0] = el)} style={{ opacity: 0 }}>
            <Link
              href="/"
              style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 18 }}
            >
              <div style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(201,168,76,0.25)',
              }}>
                <i className="fas fa-chart-line" style={{ color: '#0a0a0f', fontSize: 14 }}></i>
              </div>
              <span style={{
                fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #f0f0fa 0%, #c9a84c 60%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                VAULTEX
              </span>
            </Link>

            <p style={{ fontSize: 13.5, color: '#5a5a78', lineHeight: 1.75, marginBottom: 22, maxWidth: 300 }}>
              A trusted crypto investment platform helping thousands grow their wealth through secure, transparent, and rewarding plans.
            </p>

            {/* Accepted coins */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {acceptedCoins.map((coin) => (
                <div
                  key={coin.symbol}
                  className="footer-coin"
                  title={coin.symbol}
                  style={{
                    width: 30, height: 30,
                    borderRadius: '50%',
                    background: `${coin.color}18`,
                    border: `1px solid ${coin.color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <i className={coin.icon} style={{ fontSize: 11, color: coin.color }}></i>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: 10 }}>
              {socials.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="footer-social"
                  style={{
                    width: 36, height: 36,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#9898b8',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${social.color}50`;
                    e.currentTarget.style.background = `${social.color}15`;
                    e.currentTarget.style.color = social.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.color = '#9898b8';
                  }}
                >
                  <i className={social.icon} style={{ fontSize: 14 }}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {linkColumns.map((col, i) => (
            <div key={col.heading} ref={(el) => (columnsRef.current[i + 1] = el)} style={{ opacity: 0 }}>
              <h4 style={{
                fontSize: 12.5, fontWeight: 700, color: '#f0f0fa',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                marginBottom: 20,
              }}>
                {col.heading}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="footer-link"
                    style={{ fontSize: 13.5, color: '#8888a8', textDecoration: 'none' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

        </div>

        {/* Newsletter strip */}
        <div
          ref={(el) => (columnsRef.current[4] = el)}
          style={{
            opacity: 0,
            background: 'linear-gradient(135deg, rgba(201,168,76,0.07), rgba(201,168,76,0.015))',
            border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: 18,
            padding: '28px 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
            marginBottom: 56,
          }}
        >
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: '#f0f0fa', marginBottom: 4 }}>
              Get market insights in your inbox
            </div>
            <div style={{ fontSize: 13, color: '#5a5a78' }}>
              Weekly updates on crypto trends and new investment plans. No spam.
            </div>
          </div>

          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                padding: '12px 18px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(10,10,15,0.6)',
                color: '#f0f0fa',
                fontSize: 13.5,
                outline: 'none',
                minWidth: 220,
              }}
            />
            <button
              type="submit"
              className="footer-newsletter-btn"
              style={{
                padding: '12px 24px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                background: subscribed
                  ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                  : 'linear-gradient(135deg, #c9a84c, #a8722a)',
                color: '#0a0a0f',
                border: 'none',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {subscribed ? (
                <>Subscribed <i className="fas fa-check"></i></>
              ) : (
                <>Subscribe <i className="fas fa-paper-plane" style={{ fontSize: 11 }}></i></>
              )}
            </button>
          </form>
        </div>

        {/* Bottom bar */}
        <div
          ref={bottomRef}
          style={{
            opacity: 0,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '26px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 12.5, color: '#5a5a78' }}>
            © {new Date().getFullYear()} VAULTEX. All rights reserved.
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#5a5a78' }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
              animation: 'footerPulse 2s ease-in-out infinite',
            }} />
            All systems operational
          </div>
        </div>

      </div>

      <style>{`
        @keyframes footerPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
      `}</style>
    </footer>
  );
}