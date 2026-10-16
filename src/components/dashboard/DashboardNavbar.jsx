'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardNavbar({ user, onMenuClick }) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header style={{
      height: 64,
      background: 'rgba(16,16,26,0.95)',
      borderBottom: '1px solid rgba(201,168,76,0.08)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>

      {/* Hamburger — now shown at every screen size, not just mobile, so
          desktop users can toggle the sidebar too. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onMenuClick}
          className="navbar-menu-btn"
          style={{
            background: 'none', border: 'none',
            color: '#9898b8', cursor: 'pointer', fontSize: 18,
            padding: 4,
          }}
        >
          <i className="fas fa-bars"></i>
        </button>

        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0fa' }}>
            Dashboard
          </div>
          <div style={{ fontSize: 12, color: '#5a5a78' }}>
            Welcome back, {user?.firstName}
          </div>
        </div>
      </div>

      {/* Right — notifications + profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#9898b8', cursor: 'pointer', fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease', position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)';
              e.currentTarget.style.color = '#c9a84c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#9898b8';
            }}
          >
            <i className="fas fa-bell"></i>
            {/* Badge */}
            <div style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, borderRadius: '50%',
              background: '#ef4444',
              boxShadow: '0 0 6px #ef4444',
            }} />
          </button>

          {/* Dropdown */}
          {notifOpen && (
            <div style={{
              position: 'absolute', top: 48, right: 0,
              width: 300,
              background: '#16162a',
              border: '1px solid rgba(201,168,76,0.15)',
              borderRadius: 12,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              zIndex: 100,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f0fa' }}>
                  Notifications
                </span>
                <span style={{ fontSize: 11, color: '#c9a84c', cursor: 'pointer' }}>
                  Mark all read
                </span>
              </div>
              <div style={{ padding: '8px 0' }}>
                <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                  <i className="fas fa-bell-slash" style={{ fontSize: 24, color: '#5a5a78', marginBottom: 8, display: 'block' }}></i>
                  <span style={{ fontSize: 13, color: '#5a5a78' }}>No notifications yet</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile avatar */}
        <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: user?.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #c9a84c, #a8722a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#0a0a0f',
            cursor: 'pointer', overflow: 'hidden',
            boxShadow: '0 0 16px rgba(201,168,76,0.2)',
            transition: 'box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 24px rgba(201,168,76,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 16px rgba(201,168,76,0.2)';
          }}
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <>{user?.firstName?.[0]}{user?.lastName?.[0]}</>
            )}
          </div>
        </Link>

      </div>

    </header>
  );
}