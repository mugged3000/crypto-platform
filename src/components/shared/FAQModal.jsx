'use client';

import { useRef, useState, useEffect } from 'react';

export const faqs = [
  {
    q: 'How do I start investing with VAULTEX?',
    a: 'Create a free account, verify your email, choose the plan that fits your budget, and send payment to the wallet address shown at checkout. Once confirmed, your investment goes live on your dashboard.',
    icon: 'fas fa-rocket',
    color: '#818cf8',
  },
  {
    q: 'Which cryptocurrencies do you accept?',
    a: 'We currently accept BTC, ETH, USDT, BNB, and SOL for deposits and withdrawals, with more networks being added regularly based on demand.',
    icon: 'fab fa-bitcoin',
    color: '#c9a84c',
  },
  {
    q: 'How are returns calculated and paid out?',
    a: 'Returns accrue daily based on your plan\'s fixed rate and are credited straight to your dashboard balance. You can track exact profit, per day, in real time — no manual calculations needed.',
    icon: 'fas fa-chart-line',
    color: '#22c55e',
  },
  {
    q: 'Is my investment secure?',
    a: 'Yes. Funds are held in segregated, insured cold-storage wallets protected by multi-layer encryption. We never use client funds for anything other than what your plan specifies.',
    icon: 'fas fa-shield-halved',
    color: '#ef4444',
  },
  {
    q: 'Can I withdraw my funds at any time?',
    a: 'You can request a withdrawal at any point once your plan\'s maturity period is reached. Early withdrawal options vary by plan — details are shown before you invest.',
    icon: 'fas fa-vault',
    color: '#818cf8',
  },
  {
    q: 'What\'s the minimum amount I can invest?',
    a: 'Our Starter plan begins at just $100, making it easy to get started regardless of your budget. Higher-tier plans unlock better rates as your investment grows.',
    icon: 'fas fa-coins',
    color: '#c9a84c',
  },
  {
    q: 'How long does withdrawal processing take?',
    a: 'Most withdrawals are processed within a few hours. In rare cases of high network congestion, it may take up to 24 hours for funds to reach your wallet.',
    icon: 'fas fa-clock',
    color: '#22c55e',
  },
  {
    q: 'Are there any hidden fees?',
    a: 'None. The rate you see on your plan is exactly what you earn — network fees for withdrawals are the only cost, and those are shown upfront before you confirm.',
    icon: 'fas fa-receipt',
    color: '#ef4444',
  },
];

// NOTE: render this as a SIBLING of <nav>, not a child of it. If it's nested
// inside the navbar element, the navbar's `backdrop-filter` (applied once the
// page is scrolled) creates a CSS "containing block" for position:fixed
// descendants, which pins this modal inside the ~80px navbar strip instead of
// the full viewport. Keeping it outside <nav> avoids that entirely.
export default function FAQModal({ open, onClose, onMouseEnter, onMouseLeave }) {
  const backdropRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  return (
    <div
      ref={backdropRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => { if (e.target === backdropRef.current) onClose?.(); }}
      aria-hidden={!open}
      className="faq-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(6,6,10,0.7)',
        backdropFilter: open ? 'blur(8px)' : 'none',
        display: 'flex',
        justifyContent: 'center',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.25s ease',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .faq-scroll {
          scrollbar-width: thin;
          scrollbar-color: #c9a84c rgba(255,255,255,0.06);
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          touch-action: pan-y;
        }
        .faq-scroll::-webkit-scrollbar { width: 10px; }
        .faq-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          margin: 4px 0;
        }
        .faq-scroll::-webkit-scrollbar-thumb {
          background: #c9a84c;
          border-radius: 10px;
          border: 2px solid rgba(12,12,20,0.99);
        }
        .faq-scroll::-webkit-scrollbar-thumb:hover { background: #e8c96a; }
        .faq-item-btn:hover .faq-item-q { color: #f0f0fa; }

        .faq-backdrop { padding: 90px 20px 30px; align-items: center; }
        .faq-card { max-height: calc(100vh - 120px); }

        @media (max-width: 640px) {
          .faq-backdrop { padding: 24px 12px 16px; align-items: flex-start; }
          .faq-card { max-height: calc(100vh - 40px); border-radius: 18px; }
          .faq-header { padding: 24px 20px 16px !important; padding-right: 54px !important; }
          .faq-scroll-body { padding: 4px 16px 16px 18px !important; }
          .faq-footer { padding: 14px 20px !important; }
        }
      `}</style>

      <div
        className="faq-card"
        style={{
          width: '100%',
          maxWidth: 680,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(160deg, rgba(22,22,42,0.98) 0%, rgba(12,12,20,0.99) 100%)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 22,
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          position: 'relative',
          transform: open ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
          opacity: open ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close FAQ"
          style={{
            position: 'absolute',
            top: 22, right: 22,
            width: 34, height: 34,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#9898b8',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            zIndex: 2,
          }}
        >
          <i className="fas fa-xmark" style={{ fontSize: 14 }}></i>
        </button>

        {/* Header — fixed, does not scroll */}
        <div className="faq-header" style={{ padding: '30px 30px 20px', flexShrink: 0, paddingRight: 60 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 100,
            background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
            fontSize: 11, fontWeight: 700, color: '#c9a84c',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14,
            lineHeight: 1,
          }}>
            <i className="fas fa-circle-question" style={{ fontSize: 10 }}></i>
            Got Questions
          </div>
          <h3 style={{
            fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, color: '#f0f0fa',
            margin: '0 0 8px', lineHeight: 1.2, letterSpacing: '-0.01em',
          }}>
            Frequently Asked Questions
          </h3>
          <p style={{ fontSize: 13.5, color: '#7a7a98', margin: 0, lineHeight: 1.6 }}>
            Everything you need to know before you invest.
          </p>
        </div>

        {/* Accordion — this is the ONLY part that scrolls */}
        <div
          className="faq-scroll faq-scroll-body"
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'scroll',
            padding: '4px 24px 24px 30px',
          }}
        >
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                style={{
                  background: isOpen ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)',
                  border: `1px solid ${isOpen ? `${faq.color}40` : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                  marginBottom: 12,
                  transition: 'background 0.25s ease, border-color 0.25s ease',
                }}
              >
                <button
                  className="faq-item-btn"
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 18px',
                    cursor: 'pointer', userSelect: 'none',
                    background: 'none', border: 'none', textAlign: 'left',
                    font: 'inherit', boxSizing: 'border-box',
                  }}
                >
                  <div style={{
                    width: 34, height: 34, flexShrink: 0,
                    borderRadius: 10,
                    background: `${faq.color}18`,
                    border: `1px solid ${faq.color}${isOpen ? '55' : '30'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className={faq.icon} style={{ fontSize: 13, color: faq.color }}></i>
                  </div>

                  <span
                    className="faq-item-q"
                    style={{
                      flex: 1,
                      fontSize: 14.5, fontWeight: 600, lineHeight: 1.4,
                      color: isOpen ? '#f0f0fa' : '#d8d8ea',
                    }}
                  >
                    {faq.q}
                  </span>

                  <div style={{
                    width: 22, height: 22, flexShrink: 0,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isOpen ? `${faq.color}20` : 'transparent',
                  }}>
                    <i
                      className="fas fa-chevron-down"
                      style={{
                        fontSize: 10, color: isOpen ? faq.color : '#7a7a98',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                      }}
                    ></i>
                  </div>
                </button>

                {isOpen && (
                  <p style={{
                    fontSize: 13, color: '#9898b8', lineHeight: 1.75,
                    margin: 0, padding: '0 18px 18px 66px', boxSizing: 'border-box',
                  }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer — fixed, does not scroll */}
        <div className="faq-footer" style={{
          padding: '16px 30px', flexShrink: 0,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 12.5, color: '#5a5a78' }}>
            Still have questions?
          </span>
          <a
            href="#contact"
            onClick={onClose}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12.5, fontWeight: 700, color: '#c9a84c',
              textDecoration: 'none',
            }}
          >
            Contact support
            <i className="fas fa-arrow-right" style={{ fontSize: 10 }}></i>
          </a>
        </div>
      </div>
    </div>
  );
}