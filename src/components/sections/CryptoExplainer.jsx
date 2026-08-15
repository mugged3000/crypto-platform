'use client';

import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, useGSAP, MotionPathPlugin);

const explainerPoints = [
  {
    icon: 'fas fa-cube',
    title: 'What Is Blockchain?',
    description: 'A distributed ledger that records every transaction transparently and immutably — no single party controls it.',
    color: '#818cf8',
  },
  {
    icon: 'fas fa-shield-halved',
    title: "Why It's Secure",
    description: 'Cryptographic verification makes transactions nearly impossible to alter or fake once confirmed on-chain.',
    color: '#c9a84c',
  },
  {
    icon: 'fas fa-arrow-trend-up',
    title: 'Why Invest In Crypto',
    description: 'Digital assets offer growth potential unmatched by traditional markets — when paired with the right strategy.',
    color: '#22c55e',
  },
];

const flowSteps = [
  { icon: 'fas fa-wallet',      label: 'You Deposit',        desc: 'Send crypto to your unique VAULTEX wallet address.', color: '#818cf8', coin: 'fab fa-bitcoin' },
  { icon: 'fas fa-link',        label: 'Blockchain Confirms', desc: 'Your transaction is verified and secured on-chain.',  color: '#c9a84c', coin: 'fab fa-ethereum' },
  { icon: 'fas fa-chart-line',  label: 'Funds Deployed',     desc: 'Capital is put to work across your chosen plan.',     color: '#22c55e', coin: 'fas fa-coins' },
  { icon: 'fas fa-sack-dollar', label: 'You Earn Daily',     desc: 'Returns accrue automatically to your dashboard.',     color: '#ef4444', coin: 'fas fa-sun' },
];

const iconClip = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';

// Chart bar heights (%) — ascending trend, feeds both the bars and the SVG line
const barHeights = [35, 50, 30, 62, 45, 70, 55, 82];
const trendPoints = barHeights
  .map((h, i) => `${(i + 0.5) * 40},${150 - (h / 100) * 150}`)
  .join(' L');
const trendPath = `M${trendPoints}`;

const risingCoins = [
  { icon: 'fab fa-bitcoin',  color: '#f7931a', left: '12%', delay: 0 },
  { icon: 'fab fa-ethereum', color: '#627eea', left: '32%', delay: 1.4 },
  { icon: 'fas fa-coins',    color: '#c9a84c', left: '55%', delay: 2.6 },
  { icon: 'fas fa-sun',      color: '#9945ff', left: '74%', delay: 0.7 },
  { icon: 'fas fa-dollar-sign', color: '#26a17b', left: '90%', delay: 2 },
];

export default function CryptoExplainer() {
  const sectionRef   = useRef(null);
  const titleRef     = useRef(null);
  const sceneWrapRef = useRef(null);
  const pointsRef    = useRef([]);
  const flowRef      = useRef(null);
  const nodesRef     = useRef([]);
  const lineRef      = useRef(null);
  const coinRef      = useRef(null);

  const barsRef       = useRef([]);
  const trendPathRef  = useRef(null);
  const trendDotRef   = useRef(null);
  const coinsSceneRef = useRef([]);
  const vaultGlowRef  = useRef(null);
  const counterRef    = useRef(null);

  const loopTlRef      = useRef(null);
  const counterInterval = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [sceneStarted, setSceneStarted] = useState(false);

  const togglePlay = () => {
    if (!loopTlRef.current) return;
    if (playing) {
      loopTlRef.current.pause();
      clearInterval(counterInterval.current);
    } else {
      loopTlRef.current.play();
      startCounter();
    }
    setPlaying(!playing);
  };

  const startCounter = () => {
    clearInterval(counterInterval.current);
    counterInterval.current = setInterval(() => {
      if (!counterRef.current) return;
      const current = parseFloat(counterRef.current.dataset.value || '24850');
      const next = current + Math.random() * 3.2;
      counterRef.current.dataset.value = next;
      counterRef.current.textContent = `$${next.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    }, 900);
  };

  useEffect(() => () => clearInterval(counterInterval.current), []);

  useGSAP(() => {
    gsap.fromTo(titleRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: titleRef.current, start: 'top 85%' },
      }
    );

    gsap.fromTo(sceneWrapRef.current,
      { x: -60, opacity: 0, scale: 0.96 },
      {
        x: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: sceneWrapRef.current, start: 'top 85%' },
      }
    );

    pointsRef.current.forEach((point, i) => {
      if (!point) return;
      gsap.fromTo(point,
        { x: 50, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          delay: 0.15 + i * 0.1,
          scrollTrigger: { trigger: sceneWrapRef.current, start: 'top 85%' },
        }
      );
    });

    // ── Animated trading scene — entrance, then an infinite ambient loop ──
    ScrollTrigger.create({
      trigger: sceneWrapRef.current,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        setSceneStarted(true);

        const pathEl = trendPathRef.current;
        const pathLen = pathEl ? pathEl.getTotalLength() : 500;
        gsap.set(pathEl, { strokeDasharray: pathLen, strokeDashoffset: pathLen });

        const entrance = gsap.timeline();

        entrance.to(pathEl, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' });

        barsRef.current.forEach((bar, i) => {
          if (!bar) return;
          entrance.fromTo(bar,
            { height: '0%' },
            { height: `${barHeights[i]}%`, duration: 0.7, ease: 'power3.out' },
            0.1 + i * 0.08
          );
        });

        entrance.fromTo(vaultGlowRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2.2)' },
          0.3
        );

        // Once entrance settles, kick off the continuous ambient loop
        entrance.call(() => {
          const loop = gsap.timeline({ repeat: -1 });

          // Trend dot travels the exact SVG path on loop
          loop.fromTo(trendDotRef.current,
            { opacity: 0 },
            {
              opacity: 1, duration: 0.2,
            }, 0
          );
          loop.to(trendDotRef.current, {
            motionPath: { path: pathEl, align: pathEl, alignOrigin: [0.5, 0.5] },
            duration: 3,
            ease: 'power1.inOut',
          }, 0);
          loop.to(trendDotRef.current, { opacity: 0, duration: 0.3 }, 2.7);

          // Bars gently breathe
          barsRef.current.forEach((bar, i) => {
            if (!bar) return;
            loop.to(bar, {
              height: `${Math.max(barHeights[i] - 8, 12)}%`,
              duration: 1.4,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: 1,
            }, i * 0.12);
          });

          // Vault glow pulses
          loop.to(vaultGlowRef.current, {
            boxShadow: '0 0 0 16px rgba(201,168,76,0)',
            duration: 1.6,
            ease: 'sine.out',
            repeat: 1,
            yoyo: true,
          }, 0);

          loopTlRef.current = loop;
          startCounter();
        });

        // Coins rising — independent infinite loops, started alongside
        coinsSceneRef.current.forEach((coin, i) => {
          if (!coin) return;
          gsap.fromTo(coin,
            { y: 0, opacity: 0 },
            {
              y: -170, opacity: 0,
              duration: 4.5,
              ease: 'power1.out',
              repeat: -1,
              delay: risingCoins[i].delay,
              keyframes: { opacity: [0, 1, 1, 0], easeEach: 'power1.inOut' },
            }
          );
        });
      },
    });

    // Flow diagram — line draws, nodes pop in, coin travels the path on loop
    gsap.fromTo(lineRef.current,
      { scaleX: 0 },
      {
        scaleX: 1, duration: 1.4, ease: 'power2.inOut', transformOrigin: 'left center',
        scrollTrigger: { trigger: flowRef.current, start: 'top 80%' },
      }
    );

    nodesRef.current.forEach((node, i) => {
      if (!node) return;
      gsap.fromTo(node,
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2.2)',
          delay: 0.3 + i * 0.15,
          scrollTrigger: { trigger: flowRef.current, start: 'top 80%' },
        }
      );
    });

    if (coinRef.current && flowRef.current) {
      ScrollTrigger.create({
        trigger: flowRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          const track = flowRef.current.querySelector('.explainer-track');
          const width = track ? track.offsetWidth : 0;
          gsap.fromTo(coinRef.current,
            { x: 0, opacity: 0 },
            {
              x: width, opacity: 1, duration: 4.5, ease: 'none', repeat: -1,
              delay: 1.6,
              onRepeat: () => gsap.set(coinRef.current, { opacity: 0 }),
              onStart: () => gsap.to(coinRef.current, { opacity: 1, duration: 0.3 }),
            }
          );
        },
      });
    }
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="learn"
      style={{
        background: '#0a0a0f',
        padding: '110px 0 120px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .explainer-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 56px;
          align-items: center;
          margin-bottom: 110px;
        }
        .explainer-scene-frame {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          aspect-ratio: 16 / 10;
          background: linear-gradient(160deg, rgba(30,30,52,0.97), rgba(10,10,15,0.99));
          border: 1px solid rgba(201,168,76,0.18);
          box-shadow: 0 32px 70px rgba(0,0,0,0.5);
          cursor: pointer;
        }
        .explainer-play-btn {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, opacity 0.3s ease;
        }
        .explainer-scene-frame:hover .explainer-play-btn {
          transform: scale(1.08);
          box-shadow: 0 0 0 14px rgba(201,168,76,0.08);
        }
        .explainer-point {
          opacity: 0;
          display: flex;
          gap: 16px;
          padding: 18px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .explainer-point:last-child { border-bottom: none; }

        .explainer-chart-bars {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 0 8%;
        }
        .explainer-chart-bar {
          width: 8%;
          height: 0%;
          border-radius: 4px 4px 0 0;
          background: linear-gradient(180deg, #e8c96a, #a8722a);
          box-shadow: 0 0 14px rgba(201,168,76,0.35);
        }
        .explainer-coins-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .explainer-rising-coin {
          position: absolute;
          bottom: 8%;
          width: 26px; height: 26px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(10,10,15,0.7);
          backdrop-filter: blur(2px);
          opacity: 0;
        }

        .explainer-track {
          position: relative;
          padding: 0 6%;
        }
        .explainer-flow-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .explainer-node { opacity: 0; }

        @media (max-width: 900px) {
          .explainer-grid { grid-template-columns: 1fr; gap: 44px; }
          .explainer-flow-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
        }
        @media (max-width: 520px) {
          .explainer-flow-grid { grid-template-columns: 1fr; max-width: 320px; margin: 0 auto; }
        }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '5%', left: '-8%',
        width: 650, height: 650, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative' }}>

        {/* Title */}
        <div ref={titleRef} style={{ textAlign: 'center', marginBottom: 64, opacity: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 100,
            background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
            fontSize: 11, fontWeight: 700, color: '#c9a84c',
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20,
          }}>
            <i className="fas fa-graduation-cap" style={{ fontSize: 10 }}></i>
            Learn The Basics
          </div>

          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, letterSpacing: '-0.02em',
            color: '#f0f0fa', marginBottom: 14, lineHeight: 1.1,
          }}>
            Understand{' '}
            <span style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Crypto Investing
            </span>
          </h2>

          <p style={{ fontSize: 16, color: '#5a5a78', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            A live look at how your capital moves, grows, and gets tracked — every step of the way.
          </p>
        </div>

        {/* Animated scene + explainer points */}
        <div className="explainer-grid">

          {/* Animated trading scene */}
          <div ref={sceneWrapRef} style={{ opacity: 0 }}>
            <div className="explainer-scene-frame" onClick={togglePlay}>

              {/* Chart bars */}
              <div className="explainer-chart-bars">
                {barHeights.map((h, i) => (
                  <div key={i} className="explainer-chart-bar" ref={(el) => (barsRef.current[i] = el)} />
                ))}
              </div>

              {/* Trend line + traveling glow dot */}
              <svg
                viewBox="0 0 320 150"
                preserveAspectRatio="none"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              >
                <path
                  ref={trendPathRef}
                  d={trendPath}
                  fill="none"
                  stroke="url(#trendGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="50%" stopColor="#c9a84c" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
              </svg>
              <div
                ref={trendDotRef}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#e8c96a',
                  boxShadow: '0 0 14px 4px rgba(232,201,106,0.7)',
                  opacity: 0,
                }}
              />

              {/* Rising coins */}
              <div className="explainer-coins-layer">
                {risingCoins.map((coin, i) => (
                  <div
                    key={i}
                    className="explainer-rising-coin"
                    ref={(el) => (coinsSceneRef.current[i] = el)}
                    style={{ left: coin.left, border: `1px solid ${coin.color}50` }}
                  >
                    <i className={coin.icon} style={{ fontSize: 11, color: coin.color }}></i>
                  </div>
                ))}
              </div>

              {/* Brand mark */}
              <div style={{
                position: 'absolute', top: 20, left: 22,
                display: 'flex', alignItems: 'center', gap: 10, zIndex: 2,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className="fas fa-chart-line" style={{ color: '#0a0a0f', fontSize: 12 }}></i>
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: '#f0f0fa', letterSpacing: '-0.01em' }}>
                  VAULTEX
                </span>
              </div>

              {/* Live portfolio counter */}
              <div style={{
                position: 'absolute', top: 18, right: 20, zIndex: 2,
                textAlign: 'right',
                background: 'rgba(10,10,15,0.5)',
                borderRadius: 10, padding: '8px 12px',
                border: '1px solid rgba(201,168,76,0.15)',
              }}>
                <div style={{ fontSize: 9.5, color: '#5a5a78', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>
                  Live Portfolio
                </div>
                <div ref={counterRef} data-value="24850" style={{ fontSize: 15, fontWeight: 800, color: '#c9a84c' }}>
                  $24,850.00
                </div>
              </div>

              {/* Vault glow icon */}
              <div
                ref={vaultGlowRef}
                style={{
                  position: 'absolute', bottom: 20, right: 22, zIndex: 2,
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(201,168,76,0.15)',
                  border: '1px solid rgba(201,168,76,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0,
                }}
              >
                <i className="fas fa-vault" style={{ color: '#c9a84c', fontSize: 15 }}></i>
              </div>

              {/* Caption + live badge */}
              <div style={{
                position: 'absolute', bottom: 18, left: 22, zIndex: 2,
                fontSize: 12, color: '#9898b8', fontWeight: 500, maxWidth: '55%',
              }}>
                Your capital, growing in real time on-chain
              </div>

              <div style={{
                position: 'absolute', bottom: 18, left: 22, transform: 'translateY(-22px)', zIndex: 2,
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 10.5, fontWeight: 700, color: '#22c55e',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#22c55e',
                  boxShadow: '0 0 8px #22c55e',
                }} />
                Live
              </div>

              {/* Play / pause toggle */}
              {sceneStarted && (
                <div
                  className="explainer-play-btn"
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(201,168,76,0.4)',
                    zIndex: 3,
                    opacity: playing ? 0 : 1,
                  }}
                >
                  <i className={`fas ${playing ? 'fa-pause' : 'fa-play'}`} style={{ color: '#0a0a0f', fontSize: 18, marginLeft: playing ? 0 : 3 }}></i>
                </div>
              )}
            </div>
          </div>

          {/* Explainer points */}
          <div>
            {explainerPoints.map((point, i) => (
              <div
                key={point.title}
                className="explainer-point"
                ref={(el) => (pointsRef.current[i] = el)}
              >
                <div style={{
                  width: 44, height: 44, flexShrink: 0,
                  background: `${point.color}18`,
                  border: `1px solid ${point.color}40`,
                  clipPath: iconClip,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={point.icon} style={{ fontSize: 16, color: point.color }}></i>
                </div>
                <div>
                  <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#f0f0fa', marginBottom: 6 }}>
                    {point.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: '#9898b8', lineHeight: 1.7 }}>
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ── Animated blockchain flow diagram ─────────────────── */}
        <div ref={flowRef}>
          <h3 style={{
            textAlign: 'center', fontSize: 'clamp(20px, 2.6vw, 26px)', fontWeight: 800,
            color: '#f0f0fa', marginBottom: 48, letterSpacing: '-0.01em',
          }}>
            How Your Money{' '}
            <span style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Moves
            </span>
          </h3>

          <div className="explainer-track">
            {/* Connecting line + traveling coin */}
            <div style={{
              height: 1, background: 'rgba(255,255,255,0.05)',
              position: 'relative', overflow: 'hidden', marginBottom: 40,
            }}>
              <div
                ref={lineRef}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, #818cf8, #c9a84c, #22c55e, #ef4444)',
                  transformOrigin: 'left', transform: 'scaleX(0)',
                  boxShadow: '0 0 10px rgba(201,168,76,0.3)',
                }}
              />
              <div
                ref={coinRef}
                style={{
                  position: 'absolute', top: '50%', left: 0,
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
                  transform: 'translateY(-50%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 14px rgba(201,168,76,0.6)',
                  opacity: 0,
                }}
              >
                <i className="fas fa-coins" style={{ fontSize: 9, color: '#0a0a0f' }}></i>
              </div>
            </div>

            <div className="explainer-flow-grid">
              {flowSteps.map((step, i) => (
                <div
                  key={step.label}
                  className="explainer-node"
                  ref={(el) => (nodesRef.current[i] = el)}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{
                    width: 56, height: 56, margin: '0 auto 18px',
                    background: `linear-gradient(135deg, ${step.color}cc, ${step.color}44)`,
                    clipPath: iconClip,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 24px ${step.color}45`,
                  }}>
                    <i className={step.icon} style={{ color: '#0a0a0f', fontSize: 19 }}></i>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#f0f0fa', marginBottom: 6 }}>
                    {step.label}
                  </div>
                  <p style={{ fontSize: 12.5, color: '#5a5a78', lineHeight: 1.6, maxWidth: 200, margin: '0 auto' }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}