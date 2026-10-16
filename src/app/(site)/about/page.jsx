import Link from 'next/link';
import PageHero from '@/components/shared/PageHero';
import Team from '@/components/sections/Team';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: 'About Us — VAULTEX',
  description: 'Learn who is behind VAULTEX, what we stand for and how we run the platform.',
};

const values = [
  { icon: 'fas fa-eye',           color: '#818cf8', title: 'Transparency',   text: 'Plan terms are shown before you invest, and every deposit, payout and balance change is visible in your dashboard.' },
  { icon: 'fas fa-shield-halved', color: '#c9a84c', title: 'Security',       text: 'Verified accounts, optional two-factor authentication and an audit trail of administrator actions keep the platform accountable.' },
  { icon: 'fas fa-handshake',     color: '#22c55e', title: 'Accountability', text: 'We explain risk plainly, never guarantee outcomes, and own our mistakes when we make them.' },
  { icon: 'fas fa-headset',       color: '#ef4444', title: 'Real support',   text: 'Every account has access to support tickets, and every ticket is answered by a person on our team.' },
];

const steps = [
  { n: '01', title: 'Verified accounts',   text: 'Users confirm their email and complete identity verification, which helps keep the platform safe for everyone.' },
  { n: '02', title: 'Reviewed movements',  text: 'Deposits and withdrawals are reviewed by our team before they are confirmed or released.' },
  { n: '03', title: 'Clear tracking',      text: 'Balances, investments and transactions are recorded in the dashboard so you can see exactly where you stand.' },
  { n: '04', title: 'Accountable actions', text: 'Administrator decisions are logged, so there is always a record of who did what, and when.' },
];

export default function AboutPage() {
  return (
    <>
      <style>{`
        .about-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
        .about-values { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        .about-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        .about-card { transition: transform .3s ease, border-color .3s ease; }
        .about-card:hover { transform: translateY(-6px); border-color: rgba(201,168,76,0.3) !important; }
        @media (max-width: 1024px) {
          .about-values, .about-steps { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 800px) {
          .about-grid-2 { grid-template-columns: 1fr; gap: 32px; }
        }
        @media (max-width: 560px) {
          .about-values, .about-steps { grid-template-columns: 1fr; }
        }
      `}</style>

      <PageHero
        eyebrow="About us"
        title={`Investing in crypto, made clear`}
        subtitle={`${siteConfig.name} is built for people who want a straightforward way to put digital assets to work — with the terms, the risks and the numbers laid out in plain sight.`}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'About Us' }]}
      />

      {/* Mission */}
      <section style={{ padding: '88px 24px' }}>
        <div className="about-grid-2" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 14 }}>
              Our mission
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 38px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, color: '#f0f0fa', marginBottom: 20 }}>
              Make professional-style investing accessible to everyone
            </h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.85, color: '#9898b8', marginBottom: 16 }}>
              Many people are curious about crypto but put off by complicated products and unclear terms. We set out to build a platform where you can pick a plan, see exactly what it involves and follow your progress without guesswork.
            </p>
            <p style={{ fontSize: 15.5, lineHeight: 1.85, color: '#9898b8' }}>
              We also believe honesty matters more than hype. Investing in digital assets carries real risk, so we explain it clearly, and we ask you to read our <Link href="/legal/risk-disclosure" style={{ color: '#c9a84c', textDecoration: 'none', fontWeight: 600 }}>Risk Disclosure</Link> before you invest.
            </p>
          </div>

          <div style={{
            padding: 34, borderRadius: 22, position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
            border: '1px solid rgba(201,168,76,0.15)',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: '#c9a84c', marginBottom: 20, letterSpacing: '0.04em' }}>WHAT YOU CAN EXPECT</div>
            {[
              'Plan details shown before you commit',
              'Deposits in BTC, ETH, USDT, BNB and SOL',
              'A dashboard that tracks every transaction',
              'Human support when you need it',
            ].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fas fa-check" style={{ fontSize: 10, color: '#22c55e' }}></i>
                </div>
                <span style={{ fontSize: 14.5, color: '#e4e4f0' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '24px 24px 88px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 12 }}>What we stand for</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#f0f0fa' }}>Our values</h2>
          </div>
          <div className="about-values">
            {values.map((v) => (
              <div key={v.title} className="about-card" style={{
                padding: 26, borderRadius: '6px 18px 18px 18px',
                background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, marginBottom: 18, background: `${v.color}15`, border: `1px solid ${v.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={v.icon} style={{ color: v.color, fontSize: 18 }}></i>
                </div>
                <h3 style={{ fontSize: 16.5, fontWeight: 700, color: '#f0f0fa', marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.75, color: '#8888a8' }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we operate */}
      <section style={{ padding: '88px 24px', background: '#0c0c13', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 12 }}>Behind the scenes</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#f0f0fa', marginBottom: 12 }}>How we run the platform</h2>
            <p style={{ fontSize: 15.5, color: '#8888a8', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              A few simple practices sit behind every account.
            </p>
          </div>
          <div className="about-steps">
            {steps.map((s) => (
              <div key={s.n} className="about-card" style={{ padding: 26, borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, background: 'linear-gradient(135deg, #c9a84c, #a8722a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0f0fa', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.75, color: '#8888a8' }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team (same section used on the landing page) */}
      <Team />

      {/* CTA */}
      <section style={{ padding: '24px 24px 100px', background: '#0a0a0f' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto', padding: '48px 32px', textAlign: 'center', borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(201,168,76,0.09), rgba(201,168,76,0.02))',
          border: '1px solid rgba(201,168,76,0.18)',
        }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#f0f0fa', marginBottom: 12 }}>
            Ready to take a closer look?
          </h2>
          <p style={{ fontSize: 15, color: '#8888a8', marginBottom: 28, lineHeight: 1.7 }}>
            Create a free account to explore the plans, or get in touch if you have questions first.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ padding: '13px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', color: '#0a0a0f', background: 'linear-gradient(135deg, #c9a84c, #a8722a)' }}>
              Get started
            </Link>
            <Link href="/contact" style={{ padding: '13px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', color: '#e4e4f0', border: '1px solid rgba(255,255,255,0.14)' }}>
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}