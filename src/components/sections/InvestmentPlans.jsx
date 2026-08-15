'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const plans = [
  {
    name: 'Starter',
    min: 100,
    max: 999,
    rate: 5,
    duration: 30,
    color: '#818cf8',
    icon: 'fas fa-seedling',
    coinImg: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    featured: false,
    perks: [
      'Daily profit tracking',
      'Email notifications',
      'Basic support',
      'BTC & USDT accepted',
    ],
  },
  {
    name: 'Growth',
    min: 1000,
    max: 4999,
    rate: 12,
    duration: 60,
    color: '#c9a84c',
    icon: 'fas fa-chart-line',
    coinImg: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    featured: true,
    perks: [
      'Priority confirmation',
      'SMS + Email alerts',
      'Priority support',
      'All crypto accepted',
    ],
  },
  {
    name: 'Elite',
    min: 5000,
    max: 19999,
    rate: 20,
    duration: 90,
    color: '#22c55e',
    icon: 'fas fa-gem',
    coinImg: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    featured: false,
    perks: [
      'Fast-track approval',
      'Dedicated manager',
      '24/7 VIP support',
      'All crypto accepted',
    ],
  },
  {
    name: 'VIP',
    min: 20000,
    max: null,
    rate: 35,
    duration: 180,
    color: '#ef4444',
    icon: 'fas fa-crown',
    coinImg: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    featured: false,
    perks: [
      'Instant approval',
      'Personal account manager',
      'Exclusive VIP support',
      'Custom crypto options',
    ],
  },
];

// Kite-inspired clip paths — each card different
const clips = [
  'polygon(0% 4%, 100% 0%, 100% 96%, 0% 100%)',
  'polygon(0% 0%, 100% 4%, 100% 100%, 0% 96%)',
  'polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%)',
  'polygon(0% 0%, 96% 0%, 100% 100%, 4% 100%)',
];

const cardRadius = [
  '4px 32px 32px 32px',
  '32px 4px 32px 32px',
  '32px 32px 4px 32px',
  '32px 32px 32px 4px',
];

function formatMoney(n) {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
  return '$' + n;
}

export default function InvestmentPlans() {
  const sectionRef   = useRef(null);
  const titleRef     = useRef(null);
  const cardsRef     = useRef([]);
  const calcRef      = useRef(null);

  const [calcAmount, setCalcAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(plans[1]);

  // Live profit calculation
  const amount    = parseFloat(calcAmount) || 0;
  const profit    = amount * (selectedPlan.rate / 100);
  const total     = amount + profit;
  const daily     = profit / selectedPlan.duration;
  const isValid   = amount >= selectedPlan.min &&
    (selectedPlan.max === null || amount <= selectedPlan.max);

  useGSAP(() => {

    // Title
    gsap.fromTo(titleRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 85%',
        },
      }
    );

    // Cards fan in
    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      // First two from left, last two from right
      const fromX = i < 2 ? -80 : 80;
      const fromY = 40;

      gsap.fromTo(card,
        { x: fromX, y: fromY, opacity: 0 },
        {
          x: 0, y: 0, opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          delay: i * 0.1,
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
          },
        }
      );

      // Coin float
      const coin = card.querySelector('.plan-coin');
      if (coin) {
        gsap.fromTo(coin,
          { scale: 0, opacity: 0, rotation: 20 },
          {
            scale: 1, opacity: 1, rotation: 0,
            duration: 0.6,
            ease: 'back.out(2)',
            delay: 0.5 + i * 0.1,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
            },
          }
        );
        gsap.to(coin, {
          y: -12,
          rotation: 5,
          duration: 2.8 + i * 0.3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.4,
        });
      }
    });

    // Calculator slides up
    gsap.fromTo(calcRef.current,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: {
          trigger: calcRef.current,
          start: 'top 88%',
        },
      }
    );

  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="plans"
      style={{
        background: '#0a0a0f',
        padding: '110px 0 120px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          align-items: start;
        }
        .plan-card {
          opacity: 0;
          position: relative;
          cursor: default;
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .plan-card:hover {
          transform: translateY(-10px);
        }
        .plan-card.featured-card {
          transform: translateY(-8px);
        }
        .plan-card.featured-card:hover {
          transform: translateY(-16px);
        }
        .calc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }
        .plan-tab {
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          outline: none;
        }

        @media (max-width: 1024px) {
          .plans-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        @media (max-width: 640px) {
          .plans-grid {
            grid-template-columns: 1fr;
            max-width: 380px;
            margin: 0 auto;
          }
          .calc-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>

      {/* BG glow */}
      <div style={{
        position: 'absolute',
        top: '30%', left: '20%',
        width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%', right: '10%',
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(129,140,248,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Title */}
        <div
          ref={titleRef}
          style={{ textAlign: 'center', marginBottom: 72, opacity: 0 }}
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
            <i className="fas fa-layer-group" style={{ fontSize: 10 }}></i>
            Investment Plans
          </div>

          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: '#f0f0fa',
            marginBottom: 14,
            lineHeight: 1.1,
          }}>
            Choose Your{' '}
            <span style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Plan
            </span>
          </h2>

          <p style={{
            fontSize: 16,
            color: '#5a5a78',
            maxWidth: 480,
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Select the plan that matches your investment goals and start earning today.
          </p>
        </div>

        {/* Plans grid */}
        <div className="plans-grid" style={{ marginBottom: 80 }}>
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`plan-card ${plan.featured ? 'featured-card' : ''}`}
              ref={(el) => (cardsRef.current[i] = el)}
            >
              {/* Featured badge */}
              {plan.featured && (
                <div style={{
                  position: 'absolute',
                  top: -14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 5,
                  background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
                  borderRadius: 20,
                  padding: '5px 16px',
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#0a0a0f',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 16px rgba(201,168,76,0.4)',
                }}>
                  ⭐ Most Popular
                </div>
              )}

              {/* Floating coin */}
              <div
                className="plan-coin"
                style={{
                  position: 'absolute',
                  top: plan.featured ? 16 : 8,
                  right: 12,
                  width: 44,
                  height: 44,
                  zIndex: 4,
                  opacity: 0,
                  filter: `drop-shadow(0 6px 16px ${plan.color}60)`,
                }}
              >
                <img
                  src={plan.coinImg}
                  alt={plan.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              {/* Card */}
              <div
                style={{
                  background: plan.featured
                    ? `linear-gradient(145deg, rgba(30,26,16,0.98) 0%, rgba(20,18,10,0.99) 100%)`
                    : 'linear-gradient(145deg, rgba(20,20,36,0.95) 0%, rgba(12,12,22,0.98) 100%)',
                  border: plan.featured
                    ? `1px solid rgba(201,168,76,0.35)`
                    : `1px solid rgba(255,255,255,0.06)`,
                  borderRadius: cardRadius[i],
                  clipPath: clips[i],
                  padding: '32px 24px 28px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: plan.featured
                    ? `0 0 0 1px rgba(201,168,76,0.1), 0 20px 60px rgba(0,0,0,0.5)`
                    : '0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                {/* Top accent */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${plan.color}, transparent)`,
                }} />

                {/* Watermark */}
                <div style={{
                  position: 'absolute',
                  bottom: -20, right: -8,
                  fontSize: 72,
                  fontWeight: 900,
                  color: `${plan.color}07`,
                  lineHeight: 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  letterSpacing: '-0.04em',
                }}>
                  {plan.rate}%
                </div>

                {/* Plan name */}
                <div style={{ marginBottom: 20, paddingTop: plan.featured ? 8 : 0 }}>
                  {/* Icon kite */}
                  <div style={{
                    width: 42,
                    height: 42,
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    background: `linear-gradient(135deg, ${plan.color}cc, ${plan.color}55)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                    boxShadow: `0 0 20px ${plan.color}40`,
                  }}>
                    <i
                      className={plan.icon}
                      style={{ color: '#0a0a0f', fontSize: 16 }}
                    ></i>
                  </div>

                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: plan.color,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}>
                    {plan.name} Plan
                  </div>

                  <div style={{
                    fontSize: 'clamp(28px, 3vw, 36px)',
                    fontWeight: 900,
                    color: '#f0f0fa',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    marginBottom: 4,
                  }}>
                    {plan.rate}
                    <span style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: plan.color,
                    }}>%</span>
                  </div>

                  <div style={{
                    fontSize: 12,
                    color: '#5a5a78',
                    marginBottom: 16,
                  }}>
                    return in {plan.duration} days
                  </div>

                  {/* Min/max */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: `${plan.color}10`,
                    border: `1px solid ${plan.color}20`,
                    marginBottom: 20,
                  }}>
                    <i
                      className="fas fa-dollar-sign"
                      style={{ fontSize: 10, color: plan.color }}
                    ></i>
                    <span style={{ fontSize: 12, color: '#9898b8', fontWeight: 500 }}>
                      {formatMoney(plan.min)} —{' '}
                      {plan.max ? formatMoney(plan.max) : 'Unlimited'}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div style={{
                  height: 1,
                  background: `linear-gradient(90deg, ${plan.color}30, transparent)`,
                  marginBottom: 16,
                }} />

                {/* Perks */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 9,
                  marginBottom: 24,
                }}>
                  {plan.perks.map((perk, j) => (
                    <div key={j} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                    }}>
                      <div style={{
                        width: 18,
                        height: 18,
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                        background: `${plan.color}18`,
                        border: `1px solid ${plan.color}35`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <i
                          className="fas fa-check"
                          style={{ fontSize: 7, color: plan.color }}
                        ></i>
                      </div>
                      <span style={{
                        fontSize: 'clamp(11px, 1.2vw, 13px)',
                        color: '#9898b8',
                        fontWeight: 500,
                      }}>
                        {perk}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link href="/register" style={{ textDecoration: 'none', display: 'block' }}>
                  <button
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      background: plan.featured
                        ? 'linear-gradient(135deg, #c9a84c, #a8722a)'
                        : `${plan.color}18`,
                      color: plan.featured ? '#0a0a0f' : plan.color,
                      border: plan.featured ? 'none' : `1px solid ${plan.color}35`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.25s ease',
                      letterSpacing: '0.02em',
                      boxShadow: plan.featured
                        ? '0 4px 20px rgba(201,168,76,0.3)'
                        : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (plan.featured) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 32px rgba(201,168,76,0.45)';
                      } else {
                        e.currentTarget.style.background = `${plan.color}28`;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 8px 24px ${plan.color}25`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = plan.featured
                        ? '0 4px 20px rgba(201,168,76,0.3)'
                        : 'none';
                      if (!plan.featured) {
                        e.currentTarget.style.background = `${plan.color}18`;
                      }
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(0.97)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1)';
                    }}
                  >
                    Get Started
                    <i className="fas fa-arrow-right" style={{ fontSize: 12 }}></i>
                  </button>
                </Link>

              </div>
            </div>
          ))}
        </div>

        {/* ── Profit Calculator ─────────────────────────────── */}
        <div
          ref={calcRef}
          style={{
            opacity: 0,
            background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
            border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: '4px 40px 40px 40px',
            padding: 'clamp(28px, 4vw, 48px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top accent */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
          }} />

          <div className="calc-grid">

            {/* Left — inputs */}
            <div>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#c9a84c',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}>
                <i className="fas fa-calculator" style={{ marginRight: 8 }}></i>
                Profit Calculator
              </div>
              <h3 style={{
                fontSize: 'clamp(20px, 3vw, 28px)',
                fontWeight: 800,
                color: '#f0f0fa',
                marginBottom: 8,
                letterSpacing: '-0.02em',
              }}>
                Calculate Your Returns
              </h3>
              <p style={{
                fontSize: 14,
                color: '#5a5a78',
                marginBottom: 28,
                lineHeight: 1.6,
              }}>
                Enter an amount and select a plan to see your expected profit instantly.
              </p>

              {/* Plan tabs */}
              <div style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginBottom: 20,
              }}>
                {plans.map((plan, i) => (
                  <button
                    key={i}
                    className="plan-tab"
                    onClick={() => setSelectedPlan(plan)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      background: selectedPlan.name === plan.name
                        ? `${plan.color}22`
                        : 'rgba(255,255,255,0.04)',
                      color: selectedPlan.name === plan.name
                        ? plan.color
                        : '#5a5a78',
                      border: selectedPlan.name === plan.name
                        ? `1px solid ${plan.color}40`
                        : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {plan.name}
                  </button>
                ))}
              </div>

              {/* Amount input */}
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <div style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 14,
                  color: '#c9a84c',
                  fontWeight: 700,
                }}>
                  $
                </div>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  placeholder={`Min $${selectedPlan.min.toLocaleString()}`}
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 32px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${
                      calcAmount && !isValid
                        ? 'rgba(239,68,68,0.4)'
                        : 'rgba(255,255,255,0.08)'
                    }`,
                    color: '#f0f0fa',
                    fontSize: 15,
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = calcAmount && !isValid
                      ? 'rgba(239,68,68,0.4)'
                      : 'rgba(255,255,255,0.08)';
                  }}
                />
              </div>

              {/* Validation message */}
              {calcAmount && !isValid && (
                <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 0 }}>
                  Amount must be between ${selectedPlan.min.toLocaleString()}
                  {selectedPlan.max ? ` and $${selectedPlan.max.toLocaleString()}` : '+'}
                </p>
              )}
            </div>

            {/* Right — results */}
            <div>
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedPlan.color}20`,
                borderRadius: '16px 16px 16px 4px',
                padding: '28px 24px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Accent */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, ${selectedPlan.color}, transparent)`,
                }} />

                {/* Selected plan info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <img
                    src={selectedPlan.coinImg}
                    alt={selectedPlan.name}
                    style={{ width: 32, height: 32, objectFit: 'contain' }}
                  />
                  <div>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: selectedPlan.color,
                    }}>
                      {selectedPlan.name} Plan
                    </div>
                    <div style={{ fontSize: 11, color: '#5a5a78' }}>
                      {selectedPlan.rate}% in {selectedPlan.duration} days
                    </div>
                  </div>
                </div>

                {/* Result rows */}
                {[
                  { label: 'Principal',       value: amount > 0 ? `$${amount.toLocaleString()}` : '—', color: '#9898b8' },
                  { label: 'Expected Profit', value: amount > 0 && isValid ? `+$${profit.toFixed(2)}` : '—', color: '#22c55e' },
                  { label: 'Daily Return',    value: amount > 0 && isValid ? `+$${daily.toFixed(2)}/day` : '—', color: selectedPlan.color },
                  { label: 'Total Return',    value: amount > 0 && isValid ? `$${total.toFixed(2)}` : '—', color: '#f0f0fa' },
                ].map((row, j) => (
                  <div key={j} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: j < 3 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  }}>
                    <span style={{ fontSize: 13, color: '#5a5a78' }}>{row.label}</span>
                    <span style={{
                      fontSize: j === 3 ? 18 : 14,
                      fontWeight: j === 3 ? 800 : 600,
                      color: row.color,
                      letterSpacing: j === 3 ? '-0.02em' : 0,
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}

                {/* Maturity date */}
                {amount > 0 && isValid && (
                  <div style={{
                    marginTop: 16,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: `${selectedPlan.color}10`,
                    border: `1px solid ${selectedPlan.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <i
                      className="fas fa-calendar-check"
                      style={{ color: selectedPlan.color, fontSize: 12 }}
                    ></i>
                    <span style={{ fontSize: 12, color: '#9898b8' }}>
                      Matures on{' '}
                      <strong style={{ color: selectedPlan.color }}>
                        {new Date(
                          Date.now() + selectedPlan.duration * 86400000
                        ).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </strong>
                    </span>
                  </div>
                )}

                {/* CTA */}
                <Link href="/register" style={{ textDecoration: 'none', display: 'block', marginTop: 20 }}>
                  <button
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
                      color: '#0a0a0f',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.25s ease',
                      boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(201,168,76,0.45)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.3)';
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.97)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                  >
                    Start Investing Now
                    <i className="fas fa-arrow-right" style={{ fontSize: 12 }}></i>
                  </button>
                </Link>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}