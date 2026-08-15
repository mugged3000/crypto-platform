'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ── Crypto ticker data ─────────────────────────────────────────
const cryptoTicker = [
  { symbol: 'BTC', name: 'Bitcoin',  price: '$63,248.50', change: '+2.4%',  up: true  },
  { symbol: 'ETH', name: 'Ethereum', price: '$3,481.20',  change: '+1.8%',  up: true  },
  { symbol: 'SOL', name: 'Solana',   price: '$148.90',    change: '-0.6%',  up: false },
  { symbol: 'BNB', name: 'BNB',      price: '$412.30',    change: '+3.1%',  up: true  },
  { symbol: 'XRP', name: 'Ripple',   price: '$0.5821',    change: '-1.2%',  up: false },
  { symbol: 'ADA', name: 'Cardano',  price: '$0.4523',    change: '+0.9%',  up: true  },
  { symbol: 'DOT', name: 'Polkadot', price: '$7.234',     change: '+2.1%',  up: true  },
  { symbol: 'LTC', name: 'Litecoin', price: '$82.15',     change: '-0.4%',  up: false },
  { symbol: 'USDT', name: 'Tether',  price: '$1.0001',    change: '+0.0%',  up: true  },
  { symbol: 'MATIC', name: 'Polygon', price: '$0.8821',   change: '+4.2%',  up: true  },
];

// Coin icon colors
const coinColors = {
  BTC:   '#f7931a',
  ETH:   '#627eea',
  SOL:   '#9945ff',
  BNB:   '#f3ba2f',
  XRP:   '#346aa9',
  ADA:   '#0033ad',
  DOT:   '#e6007a',
  LTC:   '#bfbbbb',
  USDT:  '#26a17b',
  MATIC: '#8247e5',
};

const coinIcons = {
  BTC:   'fab fa-bitcoin',
  ETH:   'fab fa-ethereum',
  SOL:   'fas fa-sun',
  BNB:   'fas fa-coins',
  XRP:   'fas fa-water',
  ADA:   'fas fa-circle',
  DOT:   'fas fa-dot-circle',
  LTC:   'fas fa-coins',
  USDT:  'fas fa-dollar-sign',
  MATIC: 'fas fa-gem',
};

// Bullet points
const bulletPoints = [
  'Fast Account Opening and Management.',
  'Secure & Transparent Investments.',
  'Wide Range of Investment Plans.',
  'Daily Returns & Profit Tracking.',
  'Advanced Portfolio Management.',
];

// Investment rows shown in the portfolio card
const investments = [
  { plan: 'Starter Plan', amount: '$2,500',  profit: '+$125',   days: '30d', pct: 65, color: '#818cf8' },
  { plan: 'Growth Plan',  amount: '$10,000', profit: '+$1,200', days: '60d', pct: 82, color: '#c9a84c' },
  { plan: 'Elite Plan',   amount: '$12,350', profit: '+$2,470', days: '90d', pct: 40, color: '#22c55e' },
];

export default function HeroSection() {
  const sectionRef   = useRef(null);
  const tickerBarRef = useRef(null);
  const tickerRef    = useRef(null);
  const badgeRef     = useRef(null);
  const headlineRef  = useRef(null);
  const bulletsRef   = useRef(null);
  const ctaRef       = useRef(null);
  const visualRef    = useRef(null);
  const marqueeRef   = useRef(null);

  // ── Ticker infinite scroll ─────────────────────────────────
  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const ticker = tickerRef.current;

    const clone = marquee.cloneNode(true);
    ticker.appendChild(clone);

    const anim = gsap.to(ticker, {
      x: () => -marquee.offsetWidth,
      duration: 35,
      ease: 'none',
      repeat: -1,
    });

    // Pause on hover
    const pause = () => anim.pause();
    const resume = () => anim.resume();

    ticker.parentElement.addEventListener('mouseenter', pause);
    ticker.parentElement.addEventListener('mouseleave', resume);

    return () => {
      anim.kill();
      clone.remove();
      ticker.parentElement.removeEventListener('mouseenter', pause);
      ticker.parentElement.removeEventListener('mouseleave', resume);
    };
  }, []);

  // ── Entry animations ───────────────────────────────────────
  useGSAP(() => {
    console.log('[HeroSection] entrance timeline building…');
    const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'power4.out' } });

    // Ticker bar glides down first, setting the pace for everything else
    tl.fromTo(tickerBarRef.current,
      { y: -22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 }
    );

    tl.fromTo(badgeRef.current,
      { y: 18, opacity: 0, filter: 'blur(6px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7 },
      '-=0.35'
    );

    tl.fromTo(headlineRef.current.querySelectorAll('.hero-line'),
      { y: 46, opacity: 0, filter: 'blur(9px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.14 },
      '-=0.3'
    );

    tl.fromTo(bulletsRef.current.querySelectorAll('.bullet-item'),
      { x: -24, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.55, stagger: 0.09, ease: 'power2.out' },
      '-=0.45'
    );

    tl.fromTo(ctaRef.current.querySelectorAll('a'),
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, stagger: 0.12, ease: 'power2.out' },
      '-=0.25'
    );

    // Portfolio card scales and un-blurs into place rather than just sliding
    tl.fromTo(visualRef.current,
      { x: 70, opacity: 0, scale: 0.94, filter: 'blur(10px)' },
      { x: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.05, ease: 'power3.out' },
      '-=0.85'
    );

    // Rows cascade in once the card has mostly landed
    tl.fromTo(visualRef.current.querySelectorAll('.portfolio-row'),
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.09, ease: 'power2.out' },
      '-=0.55'
    );

    // Floating badges pop in last with a soft spring
    tl.fromTo(visualRef.current.querySelectorAll('.floating-badge'),
      { scale: 0.7, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.55, stagger: 0.1, ease: 'back.out(1.7)' },
      '-=0.15'
    );

    // Continuous gentle float on the visual, starting once it has settled
    gsap.to(visualRef.current, {
      y: -16,
      duration: 3.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: 1.7,
    });

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="home" style={{ background: '#0a0a0f', paddingTop: 80 }}>

      {/* ── Crypto Ticker Bar ─────────────────────────────────── */}
      <div
        ref={tickerBarRef}
        style={{
          background: 'rgba(16,16,26,0.95)',
          borderTop: '1px solid rgba(201,168,76,0.1)',
          borderBottom: '1px solid rgba(201,168,76,0.1)',
          padding: '10px 0',
          overflow: 'hidden',
          position: 'relative',
          opacity: 0,
        }}
      >
        {/* Left fade */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
          background: 'linear-gradient(90deg, #10101a, transparent)',
          pointerEvents: 'none',
        }} />
        {/* Right fade */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
          background: 'linear-gradient(-90deg, #10101a, transparent)',
          pointerEvents: 'none',
        }} />

        {/* Scrolling track */}
        <div
          ref={tickerRef}
          style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', willChange: 'transform' }}
        >
          <div ref={marqueeRef} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {cryptoTicker.map((coin, i) => (
              <div
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0 28px',
                  borderRight: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {/* Coin icon */}
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: `${coinColors[coin.symbol]}22`,
                  border: `1px solid ${coinColors[coin.symbol]}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <i
                    className={coinIcons[coin.symbol]}
                    style={{ fontSize: 11, color: coinColors[coin.symbol] }}
                  ></i>
                </div>

                {/* Symbol */}
                <span style={{ fontSize: 13, fontWeight: 700, color: '#e8e8f0' }}>
                  {coin.symbol}
                </span>

                {/* Price */}
                <span style={{ fontSize: 13, color: '#9898b8' }}>
                  {coin.price}
                </span>

                {/* Change */}
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: coin.up ? '#22c55e' : '#ef4444',
                }}>
                  {coin.up ? '▲' : '▼'} {coin.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero Content ──────────────────────────────────────── */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '80px 24px 100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 60,
        flexWrap: 'wrap',
      }}>

        {/* Left — Text content */}
        <div style={{ flex: '1 1 480px', maxWidth: 580 }}>

          {/* Badge */}
          <div ref={badgeRef} style={{ opacity: 0, marginBottom: 28 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 16px',
              borderRadius: 100,
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.2)',
              fontSize: 12,
              fontWeight: 600,
              color: '#c9a84c',
              letterSpacing: '0.04em',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px #22c55e',
                animation: 'pulseGreen 2s ease-in-out infinite',
              }} />
              TRUSTED CRYPTO INVESTMENT PLATFORM
            </span>
          </div>

          {/* Headline */}
          <div ref={headlineRef} style={{ marginBottom: 28 }}>
            <div className="hero-line" style={{
              opacity: 0,
              fontSize: 'clamp(36px, 5vw, 58px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#f0f0fa',
              marginBottom: 4,
            }}>
              Start Your Journey
            </div>
            <div className="hero-line" style={{
              opacity: 0,
              fontSize: 'clamp(36px, 5vw, 58px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 16,
            }}>
              <span style={{ color: '#f0f0fa' }}>with</span>
              <span style={{
                background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}> VAULTEX</span>
            </div>
            <div className="hero-line" style={{
              opacity: 0,
              fontSize: 'clamp(15px, 2vw, 18px)',
              fontWeight: 500,
              color: '#9898b8',
              lineHeight: 1.5,
            }}>
              VAULTEX is the most trusted{' '}
              <span style={{ color: '#c9a84c', fontWeight: 600 }}>
                Crypto Investment Platform
              </span>
            </div>
          </div>

          {/* Bullet points */}
          <div
            ref={bulletsRef}
            style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}
          >
            {bulletPoints.map((point, i) => (
              <div
                key={i}
                className="bullet-item"
                style={{
                  opacity: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <i className="fas fa-chevron-right" style={{ fontSize: 8, color: '#c9a84c' }}></i>
                </div>
                <span style={{ fontSize: 15, color: '#b8b8d0', fontWeight: 500 }}>
                  {point}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div
            ref={ctaRef}
            style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
          >
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  padding: '14px 32px',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
                  color: '#0a0a0f',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.25s ease',
                  boxShadow: '0 4px 24px rgba(201,168,76,0.25)',
                  letterSpacing: '0.01em',
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 36px rgba(201,168,76,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(201,168,76,0.25)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px) scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1)';
                }}
              >
                Start Investing
                <i className="fas fa-arrow-right" style={{ fontSize: 13 }}></i>
              </button>
            </Link>

            <Link href="#plans" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  padding: '14px 32px',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'transparent',
                  color: '#9898b8',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.25s ease',
                  letterSpacing: '0.01em',
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)';
                  e.currentTarget.style.color = '#c9a84c';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.background = 'rgba(201,168,76,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = '#9898b8';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <i className="fas fa-play-circle" style={{ fontSize: 15 }}></i>
                View Plans
              </button>
            </Link>
          </div>

        </div>

        {/* Right — Visual */}
        <div ref={visualRef} className="hero-visual">

          {/* Outer glow ring */}
          <div className="hero-visual-glow" />

          {/* Decorative corner shapes */}
          <div className="hero-visual-corner hero-visual-corner--tr" />
          <div className="hero-visual-corner hero-visual-corner--bl" />

          {/* Frame = the gold "border", Card = the dark content, both chamfered so the
              cut edges get a real visible border instead of a bare clipped background. */}
          <div className="portfolio-frame">
            <div className="portfolio-card">

              {/* Top shimmer line */}
              <div className="portfolio-shimmer" />

              {/* Diagonal watermark */}
              <div className="portfolio-watermark">VX</div>

              {/* Card header */}
              <div className="portfolio-header">
                <div>
                  <div className="portfolio-label">Active Portfolio</div>
                  <div className="portfolio-total">$24,850.00</div>
                </div>
                <div className="portfolio-change-wrap">
                  <div className="portfolio-change">↑ +18.5%</div>
                  <div className="portfolio-change-sub">vs last month</div>
                </div>
              </div>

              {/* Divider */}
              <div className="portfolio-divider" />

              {/* Investment rows */}
              {investments.map((inv, i) => (
                <div key={i} className="portfolio-row" style={{ marginBottom: i < investments.length - 1 ? 14 : 0, opacity: 0 }}>
                  <div className="portfolio-row-top">
                    <div className="portfolio-row-left">
                      <div className="portfolio-dot" style={{ background: inv.color, boxShadow: `0 0 8px ${inv.color}88` }} />
                      <div>
                        <div className="portfolio-plan">{inv.plan}</div>
                        <div className="portfolio-meta">{inv.amount} · {inv.days} plan</div>
                      </div>
                    </div>
                    <span className="portfolio-profit">{inv.profit}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="portfolio-progress-track">
                    <div
                      className="portfolio-progress-fill"
                      style={{
                        width: `${inv.pct}%`,
                        background: `linear-gradient(90deg, ${inv.color}88, ${inv.color})`,
                        boxShadow: `0 0 6px ${inv.color}66`,
                      }}
                    />
                  </div>

                  <div className="portfolio-progress-label">
                    <span>Progress</span>
                    <span style={{ color: inv.color, fontWeight: 600 }}>{inv.pct}%</span>
                  </div>
                </div>
              ))}

              {/* Bottom total */}
              <div className="portfolio-footer">
                <div className="portfolio-footer-left">
                  <i className="fas fa-trophy" style={{ color: '#c9a84c', fontSize: 13 }}></i>
                  <span>Total Profit Earned</span>
                </div>
                <span className="portfolio-footer-total">+$3,795.00</span>
              </div>

            </div>
          </div>

          {/* Floating badge — top right */}
          <div className="floating-badge floating-badge--secure" style={{ opacity: 0 }}>
            <i className="fas fa-shield-alt" style={{ color: '#0a0a0f', fontSize: 13 }}></i>
            <span>100% Secure</span>
          </div>

          {/* Floating badge — bottom left */}
          <div className="floating-badge floating-badge--investors" style={{ opacity: 0 }}>
            <div className="floating-badge-pulse" />
            <span>12,400+ Active Investors</span>
          </div>

        </div>
      </div>

      {/* Keyframe + responsive rules for the portfolio card */}
      <style>{`
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }

        .hero-visual {
          flex: 1 1 340px;
          max-width: 460px;
          width: 100%;
          opacity: 0;
          position: relative;
          padding: 20px 20px 20px 0;
          margin: 0 auto;
        }

        .hero-visual-glow {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 420px;
          height: 420px;
          max-width: 90%;
          aspect-ratio: 1 / 1;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-visual-corner {
          position: absolute;
          width: 60px;
          height: 60px;
          pointer-events: none;
        }
        .hero-visual-corner--tr {
          top: 10px; right: 10px;
          border-top: 2px solid rgba(201,168,76,0.3);
          border-right: 2px solid rgba(201,168,76,0.3);
          border-radius: 0 12px 0 0;
        }
        .hero-visual-corner--bl {
          bottom: 10px; left: 10px;
          border-bottom: 2px solid rgba(201,168,76,0.3);
          border-left: 2px solid rgba(201,168,76,0.3);
          border-radius: 0 0 0 12px;
        }

        /* ── Chamfered frame + card ──────────────────────────────
           Both layers share the same clip-path shape (small chamfer on
           three corners, a bigger brand chamfer bottom-left). The frame
           is 1.5px larger all round and painted with the gold gradient,
           so the "border" actually shows up along the cut edges instead
           of stopping dead at the diagonal like a plain clip-path does. */
        .portfolio-frame {
          position: relative;
          padding: 1.5px;
          background: linear-gradient(160deg, rgba(201,168,76,0.55), rgba(201,168,76,0.08) 40%, rgba(201,168,76,0.35));
          clip-path: polygon(
            16px 0, calc(100% - 16px) 0, 100% 16px,
            100% calc(100% - 16px), calc(100% - 16px) 100%,
            56px 100%, 0 calc(100% - 56px), 0 16px
          );
          filter: drop-shadow(0 28px 60px rgba(0,0,0,0.55)) drop-shadow(0 0 30px rgba(201,168,76,0.06));
        }

        .portfolio-card {
          position: relative;
          overflow: hidden;
          background: linear-gradient(160deg, rgba(30,30,52,0.97) 0%, rgba(16,16,26,0.99) 100%);
          padding: clamp(22px, 5vw, 32px) clamp(18px, 4vw, 28px);
          clip-path: polygon(
            15px 0, calc(100% - 15px) 0, 100% 15px,
            100% calc(100% - 15px), calc(100% - 15px) 100%,
            55px 100%, 0 calc(100% - 55px), 0 15px
          );
        }

        .portfolio-shimmer {
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.7), transparent);
        }

        .portfolio-watermark {
          position: absolute;
          bottom: -20px; right: -14px;
          font-size: clamp(64px, 12vw, 100px);
          font-weight: 900;
          color: rgba(201,168,76,0.03);
          letter-spacing: -0.05em;
          pointer-events: none;
          user-select: none;
          line-height: 1;
        }

        .portfolio-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 24px;
        }
        .portfolio-label {
          font-size: 11px; color: #5a5a78; margin-bottom: 6px;
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;
        }
        .portfolio-total {
          font-size: clamp(24px, 5vw, 30px); font-weight: 800; color: #f0f0fa; letter-spacing: -0.02em;
        }
        .portfolio-change-wrap {
          display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0;
        }
        .portfolio-change {
          padding: 5px 12px; border-radius: 20px;
          background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25);
          font-size: 12px; font-weight: 700; color: #22c55e; white-space: nowrap;
        }
        .portfolio-change-sub { font-size: 11px; color: #5a5a78; }

        .portfolio-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(201,168,76,0.15), transparent);
          margin-bottom: 20px;
        }

        .portfolio-row {
          padding: 14px 16px;
          border-radius: 14px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.2s ease;
        }
        .portfolio-row:hover {
          background: rgba(201,168,76,0.05);
          border-color: rgba(201,168,76,0.15);
        }
        .portfolio-row-top {
          display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 10px;
        }
        .portfolio-row-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .portfolio-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .portfolio-plan { font-size: 13px; font-weight: 600; color: #e8e8f0; margin-bottom: 2px; }
        .portfolio-meta { font-size: 11px; color: #5a5a78; white-space: nowrap; }
        .portfolio-profit { font-size: 13px; font-weight: 700; color: #22c55e; flex-shrink: 0; }

        .portfolio-progress-track { height: 3px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
        .portfolio-progress-fill { height: 100%; border-radius: 2px; }
        .portfolio-progress-label { display: flex; justify-content: space-between; margin-top: 6px; font-size: 10px; color: #5a5a78; }

        .portfolio-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 18px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.04); gap: 12px;
        }
        .portfolio-footer-left { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #5a5a78; }
        .portfolio-footer-total {
          font-size: 16px; font-weight: 800;
          background: linear-gradient(135deg, #c9a84c, #e8c96a);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          white-space: nowrap;
        }

        .floating-badge {
          position: absolute;
          display: flex; align-items: center; gap: 8px;
          padding: 10px 16px;
          font-size: 12px; font-weight: 700;
          z-index: 2;
        }
        .floating-badge--secure {
          top: 0; right: -8px;
          background: linear-gradient(135deg, #c9a84c, #a8722a);
          border-radius: 14px 14px 14px 4px;
          box-shadow: 0 8px 28px rgba(201,168,76,0.4);
          color: #0a0a0f;
        }
        .floating-badge--investors {
          bottom: 0; left: -8px;
          background: rgba(10,10,15,0.98);
          border: 1px solid rgba(34,197,94,0.3);
          border-radius: 4px 14px 14px 14px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.5);
          color: #22c55e;
          font-weight: 600;
        }
        .floating-badge-pulse {
          width: 8px; height: 8px; border-radius: 50%;
          background: #22c55e; box-shadow: 0 0 10px #22c55e;
          animation: pulseGreen 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .hero-visual {
            max-width: 420px;
            padding: 30px 8px 8px;
          }
        }

        @media (max-width: 480px) {
          .hero-visual { padding: 24px 4px 4px; }
          .floating-badge { padding: 8px 12px; font-size: 11px; }
          .floating-badge--secure { right: 4px; top: -6px; }
          .floating-badge--investors { left: 4px; bottom: -6px; }
          .portfolio-frame,
          .portfolio-card {
            clip-path: polygon(
              12px 0, calc(100% - 12px) 0, 100% 12px,
              100% calc(100% - 12px), calc(100% - 12px) 100%,
              40px 100%, 0 calc(100% - 40px), 0 12px
            );
          }
        }
      `}</style>

    </section>
  );
}