'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function PageLoader({ onComplete }) {
  const loaderRef     = useRef(null);
  const logoRef       = useRef(null);
  const textRef       = useRef(null);
  const barRef        = useRef(null);
  const barFillRef    = useRef(null);
  const percentRef    = useRef(null);
  const taglineRef    = useRef(null);
  const overlayRef    = useRef(null);
  const particlesRef  = useRef(null);
  const dotsRef       = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Prevent scroll while loading
    document.body.style.overflow = 'hidden';

    // ── Phase 1: Logo appears ──────────────────────────────────
    tl.fromTo(logoRef.current,
      { scale: 0.4, opacity: 0, rotation: -15 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.9, ease: 'back.out(1.7)' }
    );

    // ── Phase 2: Text slides up ────────────────────────────────
    tl.fromTo(textRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
      '-=0.3'
    );

    // ── Phase 3: Tagline fades in ──────────────────────────────
    tl.fromTo(taglineRef.current,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
      '-=0.1'
    );

    // ── Phase 4: Progress bar appears ─────────────────────────
    tl.fromTo(barRef.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.4, ease: 'power2.out' },
      '+=0.1'
    );

    // ── Phase 5: Progress bar fills + counter ─────────────────
    const counter = { val: 0 };
    tl.to(counter, {
      val: 100,
      duration: 1.8,
      ease: 'power1.inOut',
      onUpdate: () => {
        const v = Math.round(counter.val);
        if (percentRef.current) percentRef.current.textContent = v + '%';
        if (barFillRef.current) barFillRef.current.style.width = v + '%';
      },
    }, '-=0.1');

    // ── Phase 6: Dots pulse while loading ─────────────────────
    tl.fromTo(dotsRef.current.querySelectorAll('span'),
      { opacity: 0.2 },
      {
        opacity: 1,
        duration: 0.4,
        stagger: { each: 0.2, repeat: 3, yoyo: true },
        ease: 'power1.inOut',
      },
      '-=1.8'
    );

    // ── Phase 7: Exit — curtain wipe up ───────────────────────
    tl.to(textRef.current, { opacity: 0, y: -10, duration: 0.3, ease: 'power2.in' }, '+=0.2');
    tl.to(taglineRef.current, { opacity: 0, duration: 0.3 }, '-=0.3');
    tl.to(barRef.current, { opacity: 0, duration: 0.3 }, '-=0.3');
    tl.to(percentRef.current, { opacity: 0, duration: 0.3 }, '-=0.3');

    tl.to(logoRef.current, {
      scale: 1.15,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
    }, '-=0.1');

    tl.to(overlayRef.current, {
      yPercent: -100,
      duration: 0.8,
      ease: 'power4.inOut',
      onComplete: () => {
        document.body.style.overflow = '';
        if (onComplete) onComplete();
      },
    });

    return () => {
      tl.kill();
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <div
      ref={loaderRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'all',
      }}
    >
      {/* Main overlay */}
      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0a0a0f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}
      >
        {/* Radial glow behind logo */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Particles */}
        <div ref={particlesRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: i % 3 === 0 ? 3 : 2,
                height: i % 3 === 0 ? 3 : 2,
                borderRadius: '50%',
                background: 'rgba(201,168,76,0.4)',
                left: `${8 + i * 7.5}%`,
                top: `${20 + (i % 5) * 15}%`,
                animation: `float ${3 + (i % 3)}s ease-in-out ${i * 0.3}s infinite alternate`,
              }}
            />
          ))}
        </div>

        {/* Logo mark */}
        <div
          ref={logoRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
            opacity: 0,
          }}
        >
          {/* Icon */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 22,
            background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 60px rgba(201,168,76,0.35), 0 0 120px rgba(201,168,76,0.1)',
            marginBottom: 20,
            position: 'relative',
          }}>
            {/* Inner ring */}
            <div style={{
              position: 'absolute',
              inset: -3,
              borderRadius: 25,
              border: '1px solid rgba(201,168,76,0.3)',
            }} />
            <div style={{
              position: 'absolute',
              inset: -8,
              borderRadius: 30,
              border: '1px solid rgba(201,168,76,0.1)',
            }} />
            <i
              className="fas fa-chart-line"
              style={{ color: '#0a0a0f', fontSize: 32 }}
            ></i>
          </div>
        </div>

        {/* Brand name */}
        <div
          ref={textRef}
          style={{ opacity: 0, textAlign: 'center', marginBottom: 8 }}
        >
          <span style={{
            fontSize: 42,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #f0f0fa 0%, #c9a84c 55%, #a8722a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'block',
            lineHeight: 1,
          }}>
            VAULTEX
          </span>
        </div>

        {/* Tagline */}
        <div
          ref={taglineRef}
          style={{
            opacity: 0,
            fontSize: 13,
            color: '#5a5a78',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 500,
            marginBottom: 52,
          }}
        >
          Premium Investment Platform
        </div>

        {/* Progress section */}
        <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Bar track */}
          <div
            ref={barRef}
            style={{
              width: '100%',
              height: 2,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 2,
              overflow: 'hidden',
              opacity: 0,
              transformOrigin: 'left',
            }}
          >
            {/* Bar fill */}
            <div
              ref={barFillRef}
              style={{
                height: '100%',
                width: '0%',
                background: 'linear-gradient(90deg, #a8722a, #c9a84c, #e8c96a)',
                borderRadius: 2,
                boxShadow: '0 0 8px rgba(201,168,76,0.6)',
                transition: 'width 0.05s linear',
              }}
            />
          </div>

          {/* Counter + dots */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div
              ref={dotsRef}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {['Loading', '.', '.', '.'].map((s, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 11,
                    color: '#5a5a78',
                    letterSpacing: '0.05em',
                    fontWeight: i === 0 ? 500 : 700,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
            <span
              ref={percentRef}
              style={{
                fontSize: 11,
                color: '#c9a84c',
                fontWeight: 700,
                letterSpacing: '0.05em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              0%
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}