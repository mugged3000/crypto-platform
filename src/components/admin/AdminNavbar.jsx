'use client';

export default function AdminNavbar({ user, sidebarOpen, onMenuClick }) {
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

      {/* Left — hamburger button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

        {/* Hamburger — always visible, toggles sidebar */}
        <button
          onClick={onMenuClick}
          style={{
            width: 40, height: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            background: sidebarOpen
              ? 'rgba(201,168,76,0.1)'
              : 'rgba(255,255,255,0.04)',
            border: `1px solid ${sidebarOpen
              ? 'rgba(201,168,76,0.3)'
              : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)';
            e.currentTarget.style.background  = 'rgba(201,168,76,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = sidebarOpen
              ? 'rgba(201,168,76,0.3)'
              : 'rgba(255,255,255,0.08)';
            e.currentTarget.style.background = sidebarOpen
              ? 'rgba(201,168,76,0.1)'
              : 'rgba(255,255,255,0.04)';
          }}
        >
          {/* Animated hamburger lines */}
          <span style={{
            display: 'block',
            width: 18, height: 2,
            background: sidebarOpen ? '#c9a84c' : '#9898b8',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            transform: sidebarOpen ? 'rotate(45deg) translateY(7px)' : 'none',
          }} />
          <span style={{
            display: 'block',
            width: sidebarOpen ? 0 : 14,
            height: 2,
            background: '#9898b8',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            opacity: sidebarOpen ? 0 : 1,
          }} />
          <span style={{
            display: 'block',
            width: 18, height: 2,
            background: sidebarOpen ? '#c9a84c' : '#9898b8',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            transform: sidebarOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
          }} />
        </button>

        {/* Admin badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px',
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.15)',
          borderRadius: 8,
        }}>
          <i className="fas fa-shield-halved" style={{ color: '#c9a84c', fontSize: 13 }}></i>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#c9a84c' }}>
            Admin Panel
          </span>
        </div>
      </div>

      {/* Right — admin info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 13, color: '#5a5a78' }}
          className="admin-name-label"
        >
          Signed in as
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0fa' }}>
          {user?.firstName} {user?.lastName}
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: 'linear-gradient(135deg, #c9a84c, #a8722a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#0a0a0f',
          boxShadow: '0 0 16px rgba(201,168,76,0.2)',
        }}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .admin-name-label { display: none !important; }
        }
      `}</style>
    </header>
  );
}