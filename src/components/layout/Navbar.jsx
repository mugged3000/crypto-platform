'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FAQModal from '../shared/FAQModal';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Plans', href: '#plans' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'FAQ', href: '#faq', isFaq: true },
];

// Small delay before closing so the cursor can travel from the link
// down into the modal without it disappearing underneath it.
const FAQ_CLOSE_DELAY = 150;

export default function Navbar() {
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef(null);
  const actionsRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileOverlayRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [faqOpen, setFaqOpen] = useState(false);
  const faqCloseTimer = useRef(null);

  const openFaq = () => {
    if (faqCloseTimer.current) clearTimeout(faqCloseTimer.current);
    setFaqOpen(true);
  };
  const scheduleCloseFaq = () => {
    if (faqCloseTimer.current) clearTimeout(faqCloseTimer.current);
    faqCloseTimer.current = setTimeout(() => setFaqOpen(false), FAQ_CLOSE_DELAY);
  };
  const closeFaqNow = () => {
    if (faqCloseTimer.current) clearTimeout(faqCloseTimer.current);
    setFaqOpen(false);
  };

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.2 });

    tl.fromTo(
      logoRef.current,
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
    );

    tl.fromTo(
      linksRef.current.querySelectorAll('.nav-link'),
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
      '-=0.4'
    );

    tl.fromTo(
      actionsRef.current.querySelectorAll('button, a'),
      { x: 20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
      '-=0.4'
    );
  }, { scope: navRef });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      const sections = navLinks.map((l) => l.href.replace('#', ''));
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Slide-in drawer animation from the right, instead of the old height-drop
  useEffect(() => {
    const menu = mobileMenuRef.current;
    const overlay = mobileOverlayRef.current;
    if (!menu) return;

    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      gsap.to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.out', pointerEvents: 'all' });
      gsap.fromTo(
        menu,
        { x: '100%' },
        { x: '0%', duration: 0.5, ease: 'power3.out' }
      );
      gsap.fromTo(
        menu.querySelectorAll('.mobile-link'),
        { x: 24, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.15 }
      );
    } else {
      document.body.style.overflow = '';
      gsap.to(overlay, { opacity: 0, duration: 0.3, ease: 'power2.in', pointerEvents: 'none' });
      gsap.to(menu, { x: '100%', duration: 0.4, ease: 'power3.in' });
    }
  }, [mobileOpen]);

  const handleNavClick = (e, href, isFaq) => {
    e.preventDefault();
    setMobileOpen(false);
    if (isFaq) {
      openFaq();
      return;
    }
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    transition: 'all 0.5s ease',
    background: scrolled ? 'rgba(16,16,26,0.92)' : 'transparent',
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(201,168,76,0.12)' : 'none',
    boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
  };

  const containerStyle = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
  };

  const barStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 80,
  };

  return (
     <>
    <nav ref={navRef} style={navStyle}>
      <div style={containerStyle}>
        <div style={barStyle}>

          {/* Logo */}
          <div ref={logoRef} style={{ opacity: 0 }}>
            <Link
              href="/"
              style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(201,168,76,0.25)',
              }}>
                <i className="fas fa-chart-line" style={{ color: '#0a0a0f', fontSize: 14 }}></i>
              </div>
              <span style={{
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #f0f0fa 0%, #c9a84c 60%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                VAULTEX
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div
            ref={linksRef}
            className="nav-desktop-links"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.isFaq)}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }
                    if (link.isFaq) openFaq();
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#9898b8';
                      e.currentTarget.style.background = 'transparent';
                    }
                    if (link.isFaq) scheduleCloseFaq();
                  }}
                  className="nav-link btn-bounce"
                  style={{
                    opacity: 0,
                    padding: '10px 18px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: 'none',
                    color: isActive || (link.isFaq && faqOpen) ? '#c9a84c' : '#9898b8',
                    background: isActive || (link.isFaq && faqOpen) ? 'rgba(201,168,76,0.08)' : 'transparent',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.01em',
                  }}
                >
                  {link.label}
                  {link.isFaq && (
                    <i
                      className="fas fa-chevron-down"
                      style={{
                        fontSize: 9, marginLeft: 6,
                        transform: faqOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                      }}
                    ></i>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Buttons */}
          <div
            ref={actionsRef}
            className="nav-desktop-actions"
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button
                className="btn-bounce"
                style={{
                  opacity: 0,
                  padding: '10px 24px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'transparent',
                  color: '#9898b8',
                  border: '1px solid rgba(255,255,255,0.1)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)';
                  e.currentTarget.style.color = '#c9a84c';
                  e.currentTarget.style.background = 'rgba(201,168,76,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = '#9898b8';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Login
              </button>
            </Link>

            <Link href="/register" style={{ textDecoration: 'none' }}>
              <button
                className="btn-bounce"
                style={{
                  opacity: 0,
                  padding: '10px 24px',
                  borderRadius: 8,
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
                  boxShadow: '0 0 0 rgba(201,168,76,0)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(201,168,76,0.35)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #d4b05a, #b87d32)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 rgba(201,168,76,0)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #c9a84c, #a8722a)';
                }}
              >
                Get Started
                <i className="fas fa-arrow-right" style={{ fontSize: 11 }}></i>
              </button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{
              display: 'none',
              flexDirection: 'column',
              gap: 5,
              padding: 8,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              zIndex: 51,
            }}
            className="mobile-hamburger"
          >
            <span style={{
              display: 'block',
              width: 24,
              height: 2,
              background: 'white',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              transform: mobileOpen ? 'rotate(45deg) translateY(7px)' : 'none',
            }} />
            <span style={{
              display: 'block',
              width: mobileOpen ? 0 : 16,
              height: 2,
              background: 'white',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              opacity: mobileOpen ? 0 : 1,
            }} />
            <span style={{
              display: 'block',
              width: 24,
              height: 2,
              background: 'white',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              transform: mobileOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
            }} />
          </button>

        </div>
      </div>

      {/* Dim overlay behind the drawer */}
      <div
        ref={mobileOverlayRef}
        onClick={() => setMobileOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 48,
        }}
      />

      {/* Mobile Menu — vertical drawer sliding in from the right */}
      <div
        ref={mobileMenuRef}
        className="nav-mobile-menu"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '78vw',
          maxWidth: 320,
          height: '100vh',
          transform: 'translateX(100%)',
          background: 'rgba(10,10,15,0.98)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(201,168,76,0.12)',
          zIndex: 49,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'stretch',
          padding: '32px 28px',
          gap: 4,
        }}
      >
        {navLinks.map((link) => {
          const isActive = activeSection === link.href.replace('#', '');
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href, link.isFaq)}
              className="mobile-link"
              style={{
                opacity: 0,
                padding: '14px 16px',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 500,
                textAlign: 'right',
                textDecoration: 'none',
                color: isActive ? '#c9a84c' : '#e4e4f0',
                background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {link.label}
            </Link>
          );
        })}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          paddingTop: 20,
          marginTop: 12,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            style={{ textDecoration: 'none' }}
          >
            <button className="btn-bounce" style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              background: 'transparent',
              color: '#9898b8',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              Login
            </button>
          </Link>

          <Link
            href="/register"
            onClick={() => setMobileOpen(false)}
            style={{ textDecoration: 'none' }}
          >
            <button className="btn-bounce" style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
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
            }}>
              Get Started
              <i className="fas fa-arrow-right" style={{ fontSize: 12 }}></i>
            </button>
          </Link>
        </div>
      </div>

      <style>{`
        .btn-bounce {
          transition: transform 0.2s ease;
        }
        .btn-bounce:hover {
          animation: navBtnBounce 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .btn-bounce:active {
          animation: none;
          transform: scale(0.94);
          transition: transform 0.12s ease;
        }
        @keyframes navBtnBounce {
          0%   { transform: translateY(0) scale(1); }
          30%  { transform: translateY(-7px) scale(1.07); }
          55%  { transform: translateY(-1px) scale(0.97); }
          75%  { transform: translateY(-4px) scale(1.02); }
          100% { transform: translateY(-2px) scale(1); }
        }
        @media (max-width: 768px) {
          .nav-desktop-links,
          .nav-desktop-actions {
            display: none !important;
          }
          .mobile-hamburger {
            display: flex !important;
          }
        }
      `}</style>
</nav>

    <FAQModal
      open={faqOpen}
      onClose={closeFaqNow}
      onMouseEnter={openFaq}
      onMouseLeave={scheduleCloseFaq}
    />
    </>
  );
}