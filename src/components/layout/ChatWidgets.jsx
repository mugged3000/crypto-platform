'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

// 4 small toasts, shown one after another.
// delay = ms after page load. action = which chat the toast opens when clicked.
const TOASTS = [
  { id: 1, delay: 3000,  icon: '👋', text: 'Hi! Need any help?',                    action: 'smartsupp' },
  { id: 2, delay: 7500,  icon: '💰', text: 'Questions about our plans?',            action: 'smartsupp' },
  { id: 3, delay: 12000, icon: '💳', text: 'Help with deposits or withdrawals?',    action: 'smartsupp' },
  { id: 4, delay: 16500, icon: '💬', text: 'Prefer WhatsApp? Message us',           action: 'whatsapp'  },
];

const TOAST_LIFETIME = 6000; // ms each toast stays on screen

/* ------------------------------------------------------------------ */
/*  Compact toast                                                      */
/* ------------------------------------------------------------------ */
function Toast({ toast, onClose, onAction }) {
  const ref = useRef(null);
  const closing = useRef(false);

  const close = useCallback(() => {
    if (closing.current || !ref.current) return;
    closing.current = true;
    gsap.to(ref.current, {
      x: 30,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => onClose(toast.id),
    });
  }, [onClose, toast.id]);

  useEffect(() => {
    const el = ref.current;
    gsap.fromTo(
      el,
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }
    );
    const t = setTimeout(close, TOAST_LIFETIME);
    return () => {
      clearTimeout(t);
      gsap.killTweensOf(el);
    };
  }, [close]);

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={() => { onAction(toast.action); close(); }}
      onKeyDown={(e) => { if (e.key === 'Enter') { onAction(toast.action); close(); } }}
      style={{
        opacity: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 10px 9px 14px',
        maxWidth: 'min(260px, calc(100vw - 48px))',
        background: 'rgba(22,22,42,0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(201,168,76,0.22)',
        borderRadius: 999,
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        cursor: 'pointer',
        pointerEvents: 'auto',
        transition: 'border-color 0.2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.22)'; }}
    >
      <span style={{ fontSize: 15, lineHeight: 1 }}>{toast.icon}</span>
      <span style={{ fontSize: 13, color: '#e4e4f0', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {toast.text}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); close(); }}
        aria-label="Dismiss"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: 'none',
          color: '#8888a8',
          cursor: 'pointer',
          width: 22,
          height: 22,
          borderRadius: '50%',
          fontSize: 10,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <i className="fas fa-xmark"></i>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main widget                                                        */
/* ------------------------------------------------------------------ */
export default function ChatWidgets() {
  const [toasts, setToasts] = useState([]);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const stoppedRef = useRef(false);     // true once the user opens a chat
  const smartsuppFailed = useRef(false); // true if the script is missing/blocked

  /* ---------- Load Smartsupp ---------- */
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_SMARTSUPP_KEY;
    if (!key) {
      smartsuppFailed.current = true;
      console.warn('[ChatWidgets] NEXT_PUBLIC_SMARTSUPP_KEY is missing. Add it to .env.local and restart `npm run dev`.');
      return;
    }
    if (window.smartsupp) return; // already loaded (also guards React strict mode)

    window._smartsupp = window._smartsupp || {};
    window._smartsupp.key = key;
    window._smartsupp.hideWidget = true; // hide Smartsupp's own bubble, we use our button
    window._smartsupp.color = '#c9a84c'; // brand gold for the chat header and bubbles (dashboard settings may override)

    // Queue stub so clicks before the script finishes loading are not lost
    const stub = function () { stub._.push(arguments); };
    stub._ = [];
    window.smartsupp = stub;

    const script = document.createElement('script');
    script.id = 'smartsupp-script';
    script.async = true;
    script.charset = 'utf-8';
    script.src = 'https://www.smartsuppchat.com/loader.js?';
    script.onerror = () => {
      smartsuppFailed.current = true;
      console.error('[ChatWidgets] Smartsupp script failed to load (ad blocker, network, or wrong key).');
    };
    document.head.appendChild(script);
  }, []);

  /* ---------- Schedule the 4 toasts ---------- */
  useEffect(() => {
    const timers = TOASTS.map((t) =>
      setTimeout(() => {
        if (stoppedRef.current) return;
        // newest on top so older toasts are not pushed around
        setToasts((prev) => (prev.some((p) => p.id === t.id) ? prev : [t, ...prev]));
      }, t.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  /* ---------- Animate the two buttons in ---------- */
  useEffect(() => {
    gsap.fromTo(leftRef.current,  { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.5 });
    gsap.fromTo(rightRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.65 });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ---------- Actions ---------- */
  const openWhatsApp = () => {
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2347041964380';
    const message = encodeURIComponent("Hello! I'm interested in investing with VAULTEX.");
    window.open(`https://wa.me/${number}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const openSmartsupp = () => {
    stoppedRef.current = true;
    console.log('[ChatWidgets] live chat clicked', {
      hasKey: !!process.env.NEXT_PUBLIC_SMARTSUPP_KEY,
      smartsuppReady: typeof window.smartsupp === 'function',
      failed: smartsuppFailed.current,
    });

    // If Smartsupp is not available, do something useful instead of nothing
    if (smartsuppFailed.current || typeof window.smartsupp !== 'function') {
      openWhatsApp();
      return;
    }
    window.smartsupp('chat:open');
  };

  const handleToastAction = (action) => {
    if (action === 'whatsapp') openWhatsApp();
    else openSmartsupp();
  };

  const hoverIn = (shadow) => (e) => {
    e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
    e.currentTarget.style.boxShadow = shadow;
  };
  const hoverOut = (shadow) => (e) => {
    e.currentTarget.style.transform = 'translateY(0) scale(1)';
    e.currentTarget.style.boxShadow = shadow;
  };

  const waShadow = '0 4px 20px rgba(37,211,102,0.4)';
  const waShadowHover = '0 10px 32px rgba(37,211,102,0.5)';
  const chatShadow = '0 4px 20px rgba(201,168,76,0.4)';
  const chatShadowHover = '0 10px 32px rgba(201,168,76,0.5)';

  // High, but below Smartsupp's own chat window so that window opens on top
  const Z = 2147483000;

  return (
    <>
      {/* LEFT: WhatsApp */}
      <div ref={leftRef} style={{ position: 'fixed', bottom: 28, left: 24, zIndex: Z, opacity: 0 }}>
        <button
          onClick={openWhatsApp}
          title="Chat on WhatsApp"
          aria-label="Chat on WhatsApp"
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: '#25d366',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, color: '#fff',
            boxShadow: waShadow,
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={hoverIn(waShadowHover)}
          onMouseLeave={hoverOut(waShadow)}
        >
          <i className="fab fa-whatsapp"></i>
        </button>
      </div>

      {/* RIGHT: toasts + live chat button */}
      <div
        ref={rightRef}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 24,
          zIndex: Z,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 12,
          opacity: 0,
          pointerEvents: 'none', // wrapper ignores clicks, children opt back in
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          {toasts.map((t) => (
            <Toast key={t.id} toast={t} onClose={removeToast} onAction={handleToastAction} />
          ))}
        </div>

        <button
          onClick={openSmartsupp}
          title="Live Chat Support"
          aria-label="Open live chat"
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: '#0a0a0f',
            boxShadow: chatShadow,
            transition: 'all 0.25s ease',
            position: 'relative',
            pointerEvents: 'auto',
          }}
          onMouseEnter={hoverIn(chatShadowHover)}
          onMouseLeave={hoverOut(chatShadow)}
        >
          <i className="fas fa-headset"></i>
          <span style={{
            position: 'absolute', inset: -4,
            borderRadius: '50%',
            border: '2px solid rgba(201,168,76,0.4)',
            animation: 'chatPulse 2s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        </button>
      </div>

      <style>{`
        @keyframes chatPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%      { transform: scale(1.15); opacity: 0; }
        }
      `}</style>
    </>
  );
}