import Link from 'next/link';
import PageHero from '@/components/shared/PageHero';
import ContactForm from '@/components/contact/ContactForm';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: 'Contact Us — VAULTEX',
  description: 'Get in touch with the VAULTEX team. Send us a message and we will reply by email.',
};

const channels = [
  { icon: 'fas fa-envelope',     color: '#c9a84c', title: 'General support', text: 'Questions about your account, deposits, withdrawals or plans.', value: siteConfig.supportEmail, href: `mailto:${siteConfig.supportEmail}` },
  { icon: 'fas fa-scale-balanced', color: '#818cf8', title: 'Compliance & AML', text: 'Report a concern or ask about our compliance policies.', value: siteConfig.complianceEmail, href: `mailto:${siteConfig.complianceEmail}` },
  { icon: 'fas fa-user-shield',  color: '#22c55e', title: 'Privacy requests', text: 'Access, correct or delete the personal data we hold.', value: siteConfig.privacyEmail, href: `mailto:${siteConfig.privacyEmail}` },
];

export default function ContactPage() {
  return (
    <>
      <style>{`
        .contact-grid { display: grid; grid-template-columns: 380px minmax(0, 1fr); gap: 40px; align-items: start; }
        .contact-channel { transition: transform .25s ease, border-color .25s ease; }
        .contact-channel:hover { transform: translateX(4px); border-color: rgba(201,168,76,0.3) !important; }
        @media (max-width: 960px) { .contact-grid { grid-template-columns: minmax(0, 1fr); } }
      `}</style>

      <PageHero
        eyebrow="Contact"
        title="We’d love to hear from you"
        subtitle="Send us a message and our team will reply to the email address you provide."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <section style={{ padding: '72px 24px 110px' }}>
        <div className="contact-grid" style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Left — channels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {channels.map((c) => (
              <a key={c.title} href={c.href} className="contact-channel" style={{
                display: 'flex', gap: 16, padding: 20, borderRadius: 16, textDecoration: 'none',
                background: 'linear-gradient(145deg, rgba(20,20,36,0.95), rgba(12,12,22,0.98))',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `${c.color}15`, border: `1px solid ${c.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={c.icon} style={{ color: c.color, fontSize: 17 }}></i>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#f0f0fa', marginBottom: 3 }}>{c.title}</div>
                  <div style={{ fontSize: 12.5, color: '#8888a8', lineHeight: 1.6, marginBottom: 6 }}>{c.text}</div>
                  <div style={{ fontSize: 13, color: c.color, fontWeight: 600, wordBreak: 'break-all' }}>{c.value}</div>
                </div>
              </a>
            ))}

            <div style={{ padding: 20, borderRadius: 16, background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0fa', marginBottom: 6 }}>Already have an account?</div>
              <p style={{ fontSize: 13, color: '#8888a8', lineHeight: 1.7, marginBottom: 12 }}>
                Open a support ticket from your dashboard so we can see your account details and help faster.
              </p>
              <Link href="/dashboard/support" style={{ fontSize: 13, fontWeight: 700, color: '#c9a84c', textDecoration: 'none' }}>
                Go to support <i className="fas fa-arrow-right" style={{ fontSize: 10, marginLeft: 4 }}></i>
              </Link>
            </div>

            <div style={{ padding: '4px 4px 0', fontSize: 12.5, color: '#5a5a78', lineHeight: 1.7 }}>
              Looking for quick answers? Check the <Link href="/#faq" style={{ color: '#9898b8' }}>FAQ</Link>. We will never ask for your password, two-factor codes or private keys.
            </div>
          </div>

          {/* Right — form */}
          <ContactForm />
        </div>
      </section>
    </>
  );
}