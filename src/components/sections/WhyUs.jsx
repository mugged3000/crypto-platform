'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const stats = [
  { icon: 'fas fa-sack-dollar',          value: 28.4,  decimals: 1, prefix: '$', suffix: 'M+', label: 'Total Invested',   color: '#818cf8' },
  { icon: 'fas fa-users',                value: 12400, decimals: 0, prefix: '',  suffix: '+',  label: 'Active Investors', color: '#c9a84c' },
  { icon: 'fas fa-hand-holding-dollar',  value: 9.2,   decimals: 1, prefix: '$', suffix: 'M+', label: 'Total Paid Out',   color: '#22c55e' },
  { icon: 'fas fa-server',               value: 99.9,  decimals: 1, prefix: '',  suffix: '%',  label: 'Platform Uptime',  color: '#ef4444' },
];

const features = [
  {
    icon: 'fas fa-shield-halved',
    color: '#818cf8',
    title: 'Bank-Grade Security',
    description: 'Multi-layer encryption and cold storage keep your funds protected around the clock.',
  },
  {
    icon: 'fas fa-bolt',
    color: '#c9a84c',
    title: 'Instant Withdrawals',
    description: 'Request a withdrawal and receive it in your wallet within hours — not days.',
  },
  {
    icon: 'fas fa-chart-pie',
    color: '#22c55e',
    title: 'Transparent Returns',
    description: 'Track every cent of profit in real time on your dashboard. No hidden calculations, ever.',
  },
  {
    icon: 'fas fa-headset',
    color: '#ef4444',
    title: '24/7 Support',
    description: 'Our team is on hand around the clock to help with any question, anywhere in the world.',
  },
  {
    icon: 'fas fa-file-shield',
    color: '#818cf8',
    title: 'Regulated & Insured',
    description: 'Client funds are held in segregated accounts and backed by comprehensive insurance.',
  },
  {
    icon: 'fas fa-earth-americas',
    color: '#c9a84c',
    title: 'Global Access',
    description: 'Invest from anywhere in the world with support for all major cryptocurrencies.',
  },
];

// Kite-inspired icon holders, alternating like the rest of the site
const iconClip = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';

export default function WhyUs() {
  const sectionRef  = useRef(null);
  const titleRef    = useRef(null);
  const statCardsRef = useRef([]);
  const statNumberRef = useRef([]);
  const featureCardsRef = useRef([]);

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

    // Stat cards — fade/slide in, then count up
    statCardsRef.current.forEach((card, i) => {
      if (!card) return;

      gsap.fromTo(card,
        { y: 36, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          delay: i * 0.08,
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
          },
        }
      );

      const stat = stats[i];
      const proxy = { val: 0 };
      const el = statNumberRef.current[i];

      gsap.to(proxy, {
        val: stat.value,
        duration: 1.8,
        ease: 'power2.out',
        delay: 0.15 + i * 0.08,
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
        },
        onUpdate: () => {
          if (!el) return;
          const formatted = stat.decimals > 0
            ? proxy.val.toFixed(stat.decimals)
            : Math.round(proxy.val).toLocaleString('en-US');
          el.textContent = `${stat.prefix}${formatted}${stat.suffix}`;
        },
      });
    });

    // Feature cards — alternating rise, staggered
    featureCardsRef.current.forEach((card, i) => {
      if (!card) return;

      gsap.fromTo(card,
        { y: 44, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          delay: (i % 3) * 0.1,
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
          },
        }
      );

      const icon = card.querySelector('.whyus-icon');
      if (icon) {
        gsap.fromTo(icon,
          { scale: 0, rotation: -20, opacity: 0 },
          {
            scale: 1, rotation: 0, opacity: 1,
            duration: 0.6, ease: 'back.out(2)',
            delay: 0.2 + (i % 3) * 0.1,
            scrollTrigger: {
              trigger: card,
              start: 'top 86%',
            },
          }
        );
      }
    });

  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="why-us"
      style={{
        background: '#0a0a0f',
        padding: '110px 0 120px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .whyus-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 90px;
        }
        .whyus-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        .whyus-stat-card { opacity: 0; }
        .whyus-feature-card { opacity: 0; }

        .whyus-stat-body {
          background: linear-gradient(145deg, rgba(22,22,42,0.9) 0%, rgba(14,14,24,0.95) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          padding: 28px 22px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .whyus-stat-body:hover {
          transform: translateY(-6px);
        }

        .whyus-feature-body {
          background: linear-gradient(145deg, rgba(22,22,42,0.95) 0%, rgba(14,14,24,0.98) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 32px 26px;
          position: relative;
          overflow: hidden;
          height: 100%;
          transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
        }
        .whyus-feature-body:hover {
          transform: translateY(-8px);
        }

        @media (max-width: 1024px) {
          .whyus-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .whyus-features-grid { grid-template-columns: repeat(2, 1fr); gap: 22px; }
        }
        @media (max-width: 640px) {
          .whyus-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .whyus-features-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; }
        }
      `}</style>

      {/* BG radial glow */}
      <div style={{
        position: 'absolute',
        top: '10%', right: '-10%',
        width: 700, height: 700,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '5%', left: '-10%',
        width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative' }}>

        {/* Title */}
        <div ref={titleRef} style={{ textAlign: 'center', marginBottom: 64, opacity: 0 }}>
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
            <i className="fas fa-shield-halved" style={{ fontSize: 10 }}></i>
            Why Choose Us
          </div>

          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: '#f0f0fa',
            marginBottom: 14,
            lineHeight: 1.1,
          }}>
            Built On Trust &{' '}
            <span style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Transparency
            </span>
          </h2>

          <p style={{
            fontSize: 16,
            color: '#5a5a78',
            maxWidth: 480,
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Thousands of investors trust VAULTEX to grow their crypto — here's why they stay.
          </p>
        </div>

        {/* Stats */}
        <div className="whyus-stats-grid">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="whyus-stat-card"
              ref={(el) => (statCardsRef.current[i] = el)}
            >
              <div
                className="whyus-stat-body"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${stat.color}40`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, ${stat.color}80, transparent)`,
                }} />
                <div style={{
                  width: 42, height: 42,
                  background: `${stat.color}18`,
                  border: `1px solid ${stat.color}40`,
                  clipPath: iconClip,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <i className={stat.icon} style={{ fontSize: 15, color: stat.color }}></i>
                </div>
                <div
                  ref={(el) => (statNumberRef.current[i] = el)}
                  style={{
                    fontSize: 'clamp(22px, 3vw, 30px)',
                    fontWeight: 800,
                    color: '#f0f0fa',
                    letterSpacing: '-0.02em',
                    marginBottom: 6,
                  }}
                >
                  {stat.prefix}0{stat.suffix}
                </div>
                <div style={{ fontSize: 12.5, color: '#5a5a78', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="whyus-features-grid">
          {features.map((feature, i) => (
            <div
              key={i}
              className="whyus-feature-card"
              ref={(el) => (featureCardsRef.current[i] = el)}
            >
              <div
                className="whyus-feature-body"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${feature.color}35`;
                  e.currentTarget.style.boxShadow = `
                    0 24px 50px rgba(0,0,0,0.35),
                    0 0 0 1px ${feature.color}15,
                    inset 0 1px 0 ${feature.color}18
                  `;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Watermark */}
                <div style={{
                  position: 'absolute',
                  bottom: -14, right: 6,
                  fontSize: 70,
                  fontWeight: 900,
                  color: `${feature.color}06`,
                  lineHeight: 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}>
                  <i className={feature.icon}></i>
                </div>

                <div
                  className="whyus-icon"
                  style={{
                    width: 52, height: 52,
                    background: `linear-gradient(135deg, ${feature.color}cc, ${feature.color}44)`,
                    clipPath: iconClip,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 24px ${feature.color}40`,
                    marginBottom: 22,
                  }}
                >
                  <i className={feature.icon} style={{ color: '#0a0a0f', fontSize: 19 }}></i>
                </div>

                <h3 style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: '#f0f0fa',
                  marginBottom: 10,
                  letterSpacing: '-0.01em',
                }}>
                  {feature.title}
                </h3>

                <p style={{
                  fontSize: 13.5,
                  color: '#9898b8',
                  lineHeight: 1.75,
                }}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}