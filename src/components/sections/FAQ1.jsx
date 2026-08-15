'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const faqs = [
  {
    q: 'How do I start investing with VAULTEX?',
    a: 'Create a free account, verify your email, choose the plan that fits your budget, and send payment to the wallet address shown at checkout. Once confirmed, your investment goes live on your dashboard.',
    color: '#818cf8',
  },
  {
    q: 'Which cryptocurrencies do you accept?',
    a: 'We currently accept BTC, ETH, USDT, BNB, and SOL for deposits and withdrawals, with more networks being added regularly based on demand.',
    color: '#c9a84c',
  },
  {
    q: 'How are returns calculated and paid out?',
    a: 'Returns accrue daily based on your plan\'s fixed rate and are credited straight to your dashboard balance. You can track exact profit, per day, in real time — no manual calculations needed.',
    color: '#22c55e',
  },
  {
    q: 'Is my investment secure?',
    a: 'Yes. Funds are held in segregated, insured cold-storage wallets protected by multi-layer encryption. We never use client funds for anything other than what your plan specifies.',
    color: '#ef4444',
  },
  {
    q: 'Can I withdraw my funds at any time?',
    a: 'You can request a withdrawal at any point once your plan\'s maturity period is reached. Early withdrawal options vary by plan — details are shown before you invest.',
    color: '#818cf8',
  },
  {
    q: 'What\'s the minimum amount I can invest?',
    a: 'Our Starter plan begins at just $100, making it easy to get started regardless of your budget. Higher-tier plans unlock better rates as your investment grows.',
    color: '#c9a84c',
  },
  {
    q: 'How long does withdrawal processing take?',
    a: 'Most withdrawals are processed within a few hours. In rare cases of high network congestion, it may take up to 24 hours for funds to reach your wallet.',
    color: '#22c55e',
  },
  {
    q: 'Are there any hidden fees?',
    a: 'None. The rate you see on your plan is exactly what you earn — network fees for withdrawals are the only cost, and those are shown upfront before you confirm.',
    color: '#ef4444',
  },
];

export default function FAQ() {
  const sectionRef  = useRef(null);
  const titleRef    = useRef(null);
  const itemsRef     = useRef([]);
  const panelRef     = useRef([]);
  const iconRef      = useRef([]);
  const ctaRef       = useRef(null);

  const [openIndex, setOpenIndex] = useState(0);

  useGSAP(() => {

    // Title
    gsap.fromTo(titleRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: titleRef.current, start: 'top 85%' },
      }
    );

    // Accordion items — stagger in
    itemsRef.current.forEach((item, i) => {
      if (!item) return;
      gsap.fromTo(item,
        { y: 28, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          delay: i * 0.06,
          scrollTrigger: { trigger: item, start: 'top 90%' },
        }
      );
    });

    // Support CTA card
    gsap.fromTo(ctaRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ctaRef.current, start: 'top 90%' },
      }
    );

    // Open the first item by default, once its entrance has settled
    const firstPanel = panelRef.current[0];
    if (firstPanel) {
      gsap.set(firstPanel, { height: 'auto' });
    }

  }, { scope: sectionRef });

  const toggle = (i) => {
    const wasOpen = openIndex === i;
    const nextIndex = wasOpen ? -1 : i;

    // Close currently open panel (if different from clicked one)
    if (openIndex !== -1 && openIndex !== i) {
      const prevPanel = panelRef.current[openIndex];
      const prevIcon  = iconRef.current[openIndex];
      if (prevPanel) {
        gsap.to(prevPanel, { height: 0, duration: 0.4, ease: 'power3.inOut' });
      }
      if (prevIcon) {
        gsap.to(prevIcon, { rotate: 0, duration: 0.35, ease: 'power2.out' });
      }
    }

    const panel = panelRef.current[i];
    const icon  = iconRef.current[i];

    if (panel) {
      if (wasOpen) {
        gsap.to(panel, { height: 0, duration: 0.4, ease: 'power3.inOut' });
      } else {
        gsap.set(panel, { height: 'auto' });
        const target = panel.offsetHeight;
        gsap.fromTo(panel,
          { height: openIndex === i ? panel.offsetHeight : 0 },
          { height: target, duration: 0.45, ease: 'power3.inOut' }
        );
      }
    }
    if (icon) {
      gsap.to(icon, { rotate: wasOpen ? 0 : 180, duration: 0.35, ease: 'power2.out' });
    }

    setOpenIndex(nextIndex);
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      style={{
        background: '#0a0a0f',
        padding: '110px 0 130px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .faq-item { opacity: 0; }
        .faq-panel { height: 0; overflow: hidden; }
        .faq-question {
          cursor: pointer;
          user-select: none;
          transition: background 0.25s ease;
        }
        .faq-question:hover {
          background: rgba(255,255,255,0.02);
        }
      `}</style>

      {/* BG radial glow */}
      <div style={{
        position: 'absolute',
        top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800, height: 800,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px', position: 'relative' }}>

        {/* Title */}
        <div ref={titleRef} style={{ textAlign: 'center', marginBottom: 60, opacity: 0 }}>
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
            <i className="fas fa-circle-question" style={{ fontSize: 10 }}></i>
            Got Questions
          </div>

          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: '#f0f0fa',
            marginBottom: 14,
            lineHeight: 1.1,
          }}>
            Frequently Asked{' '}
            <span style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Questions
            </span>
          </h2>

          <p style={{
            fontSize: 16,
            color: '#5a5a78',
            maxWidth: 460,
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Everything you need to know before you start investing with VAULTEX.
          </p>
        </div>

        {/* Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 56 }}>
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="faq-item"
                ref={(el) => (itemsRef.current[i] = el)}
                style={{
                  background: 'linear-gradient(145deg, rgba(22,22,42,0.9) 0%, rgba(14,14,24,0.95) 100%)',
                  border: `1px solid ${isOpen ? `${faq.color}35` : 'rgba(255,255,255,0.06)'}`,
                  borderLeft: `2px solid ${isOpen ? faq.color : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                  transition: 'border-color 0.3s ease',
                }}
              >
                <div
                  className="faq-question"
                  onClick={() => toggle(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '18px 22px',
                  }}
                >
                  <span style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: isOpen ? '#f0f0fa' : '#d8d8ea',
                    letterSpacing: '-0.005em',
                  }}>
                    {faq.q}
                  </span>
                  <div
                    ref={(el) => (iconRef.current[i] = el)}
                    style={{
                      width: 26, height: 26,
                      borderRadius: '50%',
                      background: isOpen ? `${faq.color}20` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isOpen ? `${faq.color}50` : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <i className="fas fa-chevron-down" style={{ fontSize: 10, color: isOpen ? faq.color : '#9898b8' }}></i>
                  </div>
                </div>

                <div
                  className="faq-panel"
                  ref={(el) => (panelRef.current[i] = el)}
                  style={{ height: i === 0 ? 'auto' : 0 }}
                >
                  <p style={{
                    fontSize: 13.5,
                    color: '#9898b8',
                    lineHeight: 1.8,
                    padding: '0 22px 20px',
                  }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support CTA */}
        <div
          ref={ctaRef}
          style={{
            opacity: 0,
            background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 18,
            padding: '32px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 46, height: 46,
              borderRadius: '50%',
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <i className="fas fa-headset" style={{ color: '#c9a84c', fontSize: 17 }}></i>
            </div>
            <div>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: '#f0f0fa', marginBottom: 3 }}>
                Still have questions?
              </div>
              <div style={{ fontSize: 13, color: '#9898b8' }}>
                Our support team is online 24/7 to help you out.
              </div>
            </div>
          </div>

          <button
            style={{
              padding: '12px 26px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
              color: '#0a0a0f',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 20px rgba(201,168,76,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(201,168,76,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.2)';
            }}
          >
            Contact Support
            <i className="fas fa-arrow-right" style={{ fontSize: 12 }}></i>
          </button>
        </div>

      </div>
    </section>
  );
}