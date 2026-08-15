'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const steps = [
  {
    number: '01',
    title: 'Create Your Account',
    description:
      'Sign up in minutes. Verify your email and access your personal investment dashboard instantly.',
    icon: 'fas fa-user-plus',
    color: '#818cf8',
    coinImg: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    coinName: 'BTC',
    points: [
      'Free registration',
      'Email verification',
      'Secure dashboard access',
    ],
  },
  {
    number: '02',
    title: 'Choose a Plan & Pay',
    description:
      'Browse our investment plans, select your preferred amount, and send payment to our BTC wallet. Upload your proof.',
    icon: 'fas fa-wallet',
    color: '#c9a84c',
    coinImg: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    coinName: 'ETH',
    points: [
      'Multiple crypto options',
      'Upload payment proof',
      'Admin verifies payment',
    ],
  },
  {
    number: '03',
    title: 'Earn & Withdraw',
    description:
      'Once confirmed, watch your returns grow. When your plan matures, withdraw directly to your crypto wallet.',
    icon: 'fas fa-chart-line',
    color: '#22c55e',
    coinImg: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    coinName: 'SOL',
    points: [
      'Returns credited to dashboard',
      'Withdraw anytime',
      'Track all transactions',
    ],
  },
];

// Kite-like clip paths — each card different
const kiteClips = [
  'polygon(50% 0%, 100% 35%, 92% 100%, 8% 100%, 0% 35%)',
  'polygon(8% 0%, 92% 0%, 100% 65%, 50% 100%, 0% 65%)',
  'polygon(50% 0%, 100% 35%, 92% 100%, 8% 100%, 0% 35%)',
];

// Inner card shape — different per card
const cardRadius = [
  '4px 40px 40px 40px',
  '40px 4px 40px 40px',
  '40px 40px 4px 40px',
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const titleRef   = useRef(null);
  const lineRef    = useRef(null);
  const cardsRef   = useRef([]);

  useGSAP(() => {

    // Title
    gsap.fromTo(titleRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 85%',
        },
      }
    );

    // Line draws
    gsap.fromTo(lineRef.current,
      { scaleX: 0 },
      {
        scaleX: 1, duration: 1.4, ease: 'power2.inOut',
        transformOrigin: 'left center',
        scrollTrigger: {
          trigger: lineRef.current,
          start: 'top 80%',
        },
      }
    );

    // Cards — alternating left/right
    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const fromX = i % 2 === 0 ? -100 : 100;

      gsap.fromTo(card,
        { x: fromX, opacity: 0 },
        {
          x: 0, opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          },
        }
      );

      // Coin float
      const coin = card.querySelector('.coin-img');
      if (coin) {
        gsap.fromTo(coin,
          { scale: 0, rotation: -30, opacity: 0 },
          {
            scale: 1, rotation: 0, opacity: 1,
            duration: 0.7,
            ease: 'back.out(2)',
            delay: 0.4,
            scrollTrigger: {
              trigger: card,
              start: 'top 82%',
            },
          }
        );
        gsap.to(coin, {
          y: -14,
          duration: 2.5 + i * 0.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.6,
        });
      }
    });

  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      style={{
        background: '#0a0a0f',
        padding: '100px 0 120px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Responsive styles */}
      <style>{`
        .hiw-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          align-items: start;
        }
        .hiw-connecting-line {
          display: block;
        }
        .hiw-card-inner {
          padding: 52px 28px 32px !important;
        }

        @media (max-width: 1024px) {
          .hiw-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .hiw-card-inner {
            padding: 48px 18px 24px !important;
          }
        }

        @media (max-width: 768px) {
          .hiw-grid {
            grid-template-columns: 1fr;
            gap: 48px;
            max-width: 420px;
            margin: 0 auto;
          }
          .hiw-connecting-line {
            display: none !important;
          }
          .hiw-card-inner {
            padding: 52px 24px 28px !important;
          }
        }

        @media (max-width: 480px) {
          .hiw-grid {
            max-width: 100%;
          }
        }

        .hiw-card-wrap {
          opacity: 0;
          position: relative;
          padding-top: 32px;
        }

        .hiw-card-body {
          background: linear-gradient(145deg, rgba(22,22,42,0.95) 0%, rgba(14,14,24,0.98) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          position: relative;
          overflow: hidden;
          transition: all 0.35s ease;
          cursor: default;
        }

        .hiw-card-body:hover {
          transform: translateY(-8px);
        }
      `}</style>

      {/* BG radial glow */}
      <div style={{
        position: 'absolute',
        top: '45%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        height: 800,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Title */}
        <div
          ref={titleRef}
          style={{ textAlign: 'center', marginBottom: 80, opacity: 0 }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 18px',
            borderRadius: 100,
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.2)',
            fontSize: 11,
            fontWeight: 700,
            color: '#c9a84c',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            <i className="fas fa-route" style={{ fontSize: 10 }}></i>
            Simple Process
          </div>

          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: '#f0f0fa',
            marginBottom: 14,
            lineHeight: 1.1,
          }}>
            How It{' '}
            <span style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Works
            </span>
          </h2>

          <p style={{
            fontSize: 16,
            color: '#5a5a78',
            maxWidth: 460,
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Three simple steps to start earning from your crypto investments today.
          </p>
        </div>

        {/* Connecting line */}
        <div
          className="hiw-connecting-line"
          style={{
            position: 'relative',
            marginBottom: -20,
            padding: '0 14%',
          }}
        >
          <div style={{
            height: 1,
            background: 'rgba(255,255,255,0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div
              ref={lineRef}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, #818cf8, #c9a84c, #22c55e)',
                transformOrigin: 'left',
                transform: 'scaleX(0)',
                boxShadow: '0 0 10px rgba(201,168,76,0.3)',
              }}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="hiw-grid">
          {steps.map((step, i) => (
            <div
              key={i}
              className="hiw-card-wrap"
              ref={(el) => (cardsRef.current[i] = el)}
            >

              {/* Floating coin */}
              <div
                className="coin-img"
                style={{
                  position: 'absolute',
                  top: -4,
                  right: 16,
                  width: 54,
                  height: 54,
                  zIndex: 4,
                  opacity: 0,
                  filter: `drop-shadow(0 8px 20px ${step.color}70)`,
                }}
              >
                <img
                  src={step.coinImg}
                  alt={step.coinName}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              {/* Kite shape behind icon */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 20,
                zIndex: 2,
              }}>
                {/* Kite diamond icon holder */}
                <div style={{
                  width: 56,
                  height: 56,
                  background: `linear-gradient(135deg, ${step.color}cc, ${step.color}44)`,
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 28px ${step.color}50`,
                  position: 'relative',
                }}>
                  <i
                    className={step.icon}
                    style={{ color: '#0a0a0f', fontSize: 20 }}
                  ></i>
                </div>
              </div>

              {/* Main card — kite-inspired shape */}
              <div
                className="hiw-card-body"
                style={{
                  borderRadius: cardRadius[i],
                  clipPath: i === 1
                    ? 'polygon(0% 0%, 100% 0%, 100% 80%, 85% 100%, 15% 100%, 0% 80%)'
                    : i === 0
                    ? 'polygon(0% 6%, 85% 0%, 100% 0%, 100% 100%, 0% 100%)'
                    : 'polygon(0% 0%, 100% 0%, 100% 100%, 15% 100%, 0% 94%)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${step.color}35`;
                  e.currentTarget.style.boxShadow = `
                    0 28px 60px rgba(0,0,0,0.4),
                    0 0 0 1px ${step.color}15,
                    inset 0 1px 0 ${step.color}18
                  `;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Top accent */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${step.color}90, transparent)`,
                }} />

                {/* Watermark */}
                <div style={{
                  position: 'absolute',
                  bottom: -10,
                  right: 10,
                  fontSize: 80,
                  fontWeight: 900,
                  color: `${step.color}07`,
                  lineHeight: 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  letterSpacing: '-0.04em',
                }}>
                  {step.number}
                </div>

                <div className="hiw-card-inner">

                  {/* Title */}
                  <h3 style={{
                    fontSize: 'clamp(15px, 2vw, 18px)',
                    fontWeight: 800,
                    color: '#f0f0fa',
                    marginBottom: 10,
                    letterSpacing: '-0.01em',
                  }}>
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: 'clamp(12px, 1.4vw, 13.5px)',
                    color: '#5a5a78',
                    lineHeight: 1.75,
                    marginBottom: 20,
                  }}>
                    {step.description}
                  </p>

                  {/* Divider */}
                  <div style={{
                    height: 1,
                    background: `linear-gradient(90deg, ${step.color}30, transparent)`,
                    marginBottom: 18,
                  }} />

                  {/* Points */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {step.points.map((point, j) => (
                      <div key={j} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}>
                        {/* Kite shaped check icon */}
                        <div style={{
                          width: 20,
                          height: 20,
                          background: `${step.color}18`,
                          border: `1px solid ${step.color}40`,
                          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <i
                            className="fas fa-check"
                            style={{ fontSize: 7, color: step.color }}
                          ></i>
                        </div>
                        <span style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: '#9898b8',
                          fontWeight: 500,
                        }}>
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* Step connector dot — mobile only */}
              {i < steps.length - 1 && (
                <div style={{
                  display: 'none',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 16,
                }}
                className="mobile-connector"
                >
                  <div style={{
                    width: 2,
                    height: 32,
                    background: `linear-gradient(180deg, ${step.color}, ${steps[i + 1].color})`,
                    borderRadius: 2,
                  }} />
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: steps[i + 1].color,
                    boxShadow: `0 0 10px ${steps[i + 1].color}`,
                  }} />
                </div>
              )}

            </div>
          ))}
        </div>

      </div>

      {/* Mobile connector visibility */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-connector {
            display: flex !important;
          }
        }
      `}</style>

    </section>
  );
}