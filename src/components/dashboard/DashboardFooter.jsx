import Link from 'next/link';
import { legalLinks, siteConfig } from '@/lib/siteConfig';

// Slim footer for the user dashboard: keeps the legal pages one click away
// and repeats the key risk reminder.
export default function DashboardFooter() {
  const links = [...legalLinks, { label: 'Contact', href: '/contact' }];

  return (
    <footer style={{
      padding: '18px 24px',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px 24px',
    }}>
      <span style={{ fontSize: 12, color: '#5a5a78', lineHeight: 1.6 }}>
        © {new Date().getFullYear()} {siteConfig.name}. Investing involves risk — returns are not guaranteed.
      </span>

      <nav aria-label="Legal" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px' }}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="dash-footer-link"
            style={{ fontSize: 12, color: '#8888a8', textDecoration: 'none' }}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <style>{`
        .dash-footer-link { transition: color 0.2s ease; }
        .dash-footer-link:hover { color: #c9a84c !important; }
      `}</style>
    </footer>
  );
}