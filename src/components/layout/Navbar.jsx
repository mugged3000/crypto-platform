'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FAQModal from '../shared/FAQModal';
import { platformLinks, companyLinks, legalLinks } from '@/lib/siteConfig';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Every nav link lives inside one dropdown, grouped by purpose.
const menuGroups = [
  { heading: 'Explore', links: platformLinks },
  { heading: 'Company', links: companyLinks },
  { heading: 'Legal',   links: legalLinks },
];

// Small grace period so the pointer can travel from the trigger to the
// panel without the dropdown closing underneath it.
const MENU_CLOSE_DELAY = 140;

// Reads the login flag from localStorage without a setState-in-effect.
// The server snapshot is always "logged out", so hydration stays consistent.
const subscribeToStorage = (cb) => {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
};
const getLoggedIn = () => !!localStorage.getItem('vaultex_token');
const getLoggedInServer = () => false;

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const navRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef(null);
  const actionsRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileOverlayRef = useRef(null);
  const menuWrapRef = useRef(null);
  const menuCloseTimer = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false); // mobile Legal dropdown
  const [activeSection, setActiveSection] = useState('home');
  const [faqOpen, setFaqOpen] = useState(false);
  const loggedIn = useSyncExternalStore(subscribeToStorage, getLoggedIn, getLoggedInServer);

  const openMenu = () => {
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
    setMenuOpen(true);
  };
  const scheduleCloseMenu = () => {
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
    menuCloseTimer.current = setTimeout(() => setMenuOpen(false), MENU_CLOSE_DELAY);
  };
  const closeMenuNow = () => {
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
    setMenuOpen(false);
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

    // Animate the wrapper rather than the buttons inside it: which buttons
    // exist depends on login state, which is only known after mount.
    tl.fromTo(
      actionsRef.current,
      { x: 20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
      '-=0.4'
    );
  }, { scope: navRef });

  // Scroll state + (on the landing page only) which section is in view.
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      if (!isHome) return;
      const ids = platformLinks.filter((l) => !l.isFaq).map((l) => l.id);
      for (const id of [...ids].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => {
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // Slide-in drawer animation from the right
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
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.04, ease: 'power2.out', delay: 0.15 }
      );
    } else {
      document.body.style.overflow = '';
      gsap.to(overlay, { opacity: 0, duration: 0.3, ease: 'power2.in', pointerEvents: 'none' });
      gsap.to(menu, { x: '100%', duration: 0.4, ease: 'power3.in' });
    }
  }, [mobileOpen]);

  const isLinkActive = (link) =>
    link.id ? isHome && activeSection === link.id : pathname === link.href;

  // Closes the drawer and collapses the Legal dropdown so it starts closed next time.
  const closeMobile = () => {
    setMobileOpen(false);
    setLegalOpen(false);
  };

  const handleLinkClick = (e, link) => {
    closeMobile();
    closeMenuNow();

    if (link.isFaq) {
      e.preventDefault();
      setFaqOpen(true);
      return;
    }

    // On the landing page, "/#section" links scroll smoothly instead of
    // reloading. From any other page they navigate home, then jump to it.
    if (isHome && link.href.startsWith('/#')) {
      e.preventDefault();
      const target = document.querySelector(link.href.slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
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

  const containerStyle = { maxWidth: 1200, margin: '0 auto', padding: '0 24px' };

  const barStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 80,
  };

  // Shared by every link in the mobile drawer
  const renderMobileLink = (link) => {
    const active = isLinkActive(link);
    return (
      <Link
        key={link.label}
        href={link.href}
        onClick={(e) => handleLinkClick(e, link)}
        className="mobile-link"
        style={{
          display: 'block',
          opacity: 0,
          padding: '11px 16px',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 500,
          textAlign: 'right',
          textDecoration: 'none',
          color: active ? '#c9a84c' : '#e4e4f0',
          background: active ? 'rgba(201,168,76,0.08)' : 'transparent',
          transition: 'all 0.2s ease',
        }}
      >
        {link.label}
      </Link>
    );
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

            {/* Desktop dropdown — every nav link lives in here */}
            <div
              ref={linksRef}
              className="nav-desktop-links"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <div
                ref={menuWrapRef}
                style={{ position: 'relative' }}
                onMouseEnter={openMenu}
                onMouseLeave={scheduleCloseMenu}
              >
                <button
                  type="button"
                  className="nav-link btn-bounce"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  aria-controls="nav-dropdown-panel"
                  onClick={() => setMenuOpen((o) => !o)}
                  style={{
                    opacity: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.01em',
                    color: menuOpen ? '#c9a84c' : '#e4e4f0',
                    background: menuOpen ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${menuOpen ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    transition: 'color 0.2s ease, background 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  <i className="fas fa-bars-staggered" style={{ fontSize: 12 }}></i>
                  Menu
                  <i
                    className="fas fa-chevron-down"
                    style={{
                      fontSize: 9,
                      transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s ease',
                    }}
                  ></i>
                </button>

                {/* Panel */}
                <div
                  id="nav-dropdown-panel"
                  role="menu"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    marginTop: 12,
                    width: 700,
                    maxWidth: 'calc(100vw - 32px)',
                    padding: 14,
                    borderRadius: 18,
                    background: 'rgba(16,16,26,0.98)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(201,168,76,0.18)',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
                    display: 'grid',
                    gridTemplateColumns: '1.1fr 0.9fr 1.2fr',
                    gap: 6,
                    opacity: menuOpen ? 1 : 0,
                    visibility: menuOpen ? 'visible' : 'hidden',
                    pointerEvents: menuOpen ? 'auto' : 'none',
                    transform: menuOpen ? 'translate(-50%, 0)' : 'translate(-50%, -8px)',
                    transition: 'opacity 0.2s ease, transform 0.25s ease, visibility 0.2s',
                  }}
                >
                  {/* Hover bridge so the pointer doesn't fall through the gap */}
                  <div style={{ position: 'absolute', top: -14, left: 0, right: 0, height: 14 }} />

                  {menuGroups.map((group) => (
                    <div key={group.heading} style={{ padding: '6px 4px' }}>
                      <div style={{
                        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em',
                        textTransform: 'uppercase', color: '#5a5a78', padding: '4px 10px 8px',
                      }}>
                        {group.heading}
                      </div>
                      {group.links.map((link) => {
                        const active = isLinkActive(link);
                        return (
                          <Link
                            key={link.label}
                            href={link.href}
                            role="menuitem"
                            onClick={(e) => handleLinkClick(e, link)}
                            className="nav-dd-item"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 11,
                              padding: '9px 10px',
                              borderRadius: 10,
                              textDecoration: 'none',
                              background: active ? 'rgba(201,168,76,0.08)' : 'transparent',
                            }}
                          >
                            <span style={{
                              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: active ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${active ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.06)'}`,
                            }}>
                              <i className={link.icon} style={{ fontSize: 12, color: active ? '#c9a84c' : '#9898b8' }}></i>
                            </span>
                            <span style={{ minWidth: 0 }}>
                              <span style={{
                                display: 'block', fontSize: 13.5, fontWeight: 600,
                                color: active ? '#c9a84c' : '#e4e4f0',
                              }}>
                                {link.label}
                              </span>
                              <span style={{ display: 'block', fontSize: 11.5, color: '#5a5a78', marginTop: 1 }}>
                                {link.desc}
                              </span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Buttons */}
            <div
              ref={actionsRef}
              className="nav-desktop-actions"
              style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0 }}
            >
              {loggedIn ? (
                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                  <button
                    className="btn-bounce"
                    style={{
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
                    }}
                  >
                    Dashboard
                    <i className="fas fa-arrow-right" style={{ fontSize: 11 }}></i>
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <button
                      className="btn-bounce"
                      style={{
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
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => (mobileOpen ? closeMobile() : setMobileOpen(true))}
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
                display: 'block', width: 24, height: 2, background: 'white', borderRadius: 2,
                transition: 'all 0.3s ease',
                transform: mobileOpen ? 'rotate(45deg) translateY(7px)' : 'none',
              }} />
              <span style={{
                display: 'block', width: mobileOpen ? 0 : 16, height: 2, background: 'white', borderRadius: 2,
                transition: 'all 0.3s ease', opacity: mobileOpen ? 0 : 1,
              }} />
              <span style={{
                display: 'block', width: 24, height: 2, background: 'white', borderRadius: 2,
                transition: 'all 0.3s ease',
                transform: mobileOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
              }} />
            </button>

          </div>
        </div>

        {/* Dim overlay behind the drawer */}
        <div
          ref={mobileOverlayRef}
          onClick={closeMobile}
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
            width: '82vw',
            maxWidth: 340,
            height: '100vh',
            transform: 'translateX(100%)',
            background: 'rgba(10,10,15,0.98)',
            backdropFilter: 'blur(24px)',
            borderLeft: '1px solid rgba(201,168,76,0.12)',
            zIndex: 49,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            padding: '84px 24px 28px',
            gap: 2,
            overflowY: 'auto',
          }}
        >
          {menuGroups.map((group) => {
            const isLegal = group.heading === 'Legal';

            // Explore + Company stay as plain lists
            if (!isLegal) {
              return (
                <div key={group.heading} style={{ marginBottom: 14 }}>
                  <div style={{
                    fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: '#5a5a78', padding: '0 16px 6px', textAlign: 'right',
                  }}>
                    {group.heading}
                  </div>
                  {group.links.map(renderMobileLink)}
                </div>
              );
            }

            // Legal becomes a collapsible dropdown (mobile only)
            return (
              <div key={group.heading} style={{ marginBottom: 14 }}>
                <button
                  type="button"
                  className="mobile-link"
                  onClick={() => setLegalOpen((o) => !o)}
                  aria-expanded={legalOpen}
                  aria-controls="mobile-legal-panel"
                  style={{
                    opacity: 0,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 8,
                    padding: '11px 16px',
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: 'pointer',
                    color: legalOpen ? '#c9a84c' : '#e4e4f0',
                    background: legalOpen ? 'rgba(201,168,76,0.08)' : 'transparent',
                    border: 'none',
                    transition: 'color 0.2s ease, background 0.2s ease',
                  }}
                >
                  <i
                    className="fas fa-chevron-down"
                    style={{
                      fontSize: 10,
                      transform: legalOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s ease',
                    }}
                  ></i>
                  {group.heading}
                </button>

                <div
                  id="mobile-legal-panel"
                  style={{
                    display: 'grid',
                    gridTemplateRows: legalOpen ? '1fr' : '0fr',
                    visibility: legalOpen ? 'visible' : 'hidden',
                    transition: legalOpen
                      ? 'grid-template-rows 0.3s ease, visibility 0s'
                      : 'grid-template-rows 0.3s ease, visibility 0s 0.3s',
                  }}
                >
                  <div style={{ overflow: 'hidden', minHeight: 0 }}>
                    {group.links.map(renderMobileLink)}
                  </div>
                </div>
              </div>
            );
          })}

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            paddingTop: 20,
            marginTop: 'auto',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            {loggedIn ? (
              <Link href="/dashboard" onClick={closeMobile} style={{ textDecoration: 'none' }}>
                <button className="btn-bounce" style={{
                  width: '100%', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  background: 'linear-gradient(135deg, #c9a84c, #a8722a)', color: '#0a0a0f', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  Dashboard
                  <i className="fas fa-arrow-right" style={{ fontSize: 12 }}></i>
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={closeMobile} style={{ textDecoration: 'none' }}>
                  <button className="btn-bounce" style={{
                    width: '100%', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    background: 'transparent', color: '#9898b8', border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    Login
                  </button>
                </Link>

                <Link href="/register" onClick={closeMobile} style={{ textDecoration: 'none' }}>
                  <button className="btn-bounce" style={{
                    width: '100%', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #c9a84c, #a8722a)', color: '#0a0a0f', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    Get Started
                    <i className="fas fa-arrow-right" style={{ fontSize: 12 }}></i>
                  </button>
                </Link>
              </>
            )}
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
          .nav-dd-item {
            transition: background 0.2s ease;
          }
          .nav-dd-item:hover {
            background: rgba(255,255,255,0.05) !important;
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

      {/* Rendered as a sibling of <nav> — see the note in FAQModal. */}
      <FAQModal open={faqOpen} onClose={() => setFaqOpen(false)} />
    </>
  );
}