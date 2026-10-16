// Single source of truth for brand details and site-wide link groups.
// Navbar, Footer, dashboard sidebar and every inner page read from here,
// so a change (new email, new page) only has to be made once.

export const siteConfig = {
  name: 'VAULTEX',
  legalName: 'VAULTEX',
  supportEmail: 'support@vaultex.com',
  complianceEmail: 'compliance@vaultex.com',
  privacyEmail: 'privacy@vaultex.com',
  // Fill these in with your real registered details before going live.
  governingLaw: 'the jurisdiction in which VAULTEX is registered',
  lastUpdated: 'October 15, 2026',
};

export const legalLinks = [
  { label: 'Terms of Service', href: '/legal/terms',           icon: 'fas fa-file-contract',           desc: 'The rules for using VAULTEX' },
  { label: 'Privacy Policy',   href: '/legal/privacy',         icon: 'fas fa-user-shield',             desc: 'How we handle your data' },
  { label: 'Risk Disclosure',  href: '/legal/risk-disclosure', icon: 'fas fa-triangle-exclamation',    desc: 'What you could lose' },
  { label: 'AML Policy',       href: '/legal/aml-policy',      icon: 'fas fa-magnifying-glass-dollar', desc: 'Anti-money-laundering controls' },
  { label: 'Compliance',       href: '/legal/compliance',      icon: 'fas fa-scale-balanced',          desc: 'Our compliance framework' },
  { label: 'White Paper',      href: '/api/whitepaper',        icon: 'fas fa-file-lines',              desc: 'Our full technical overview', external: true },
];

export const companyLinks = [
  { label: 'About Us', href: '/about',   icon: 'fas fa-building',  desc: 'Who we are and how we work' },
  { label: 'Contact',  href: '/contact', icon: 'fas fa-envelope',  desc: 'Get in touch with our team' },
];

// Landing-page sections. Using "/#id" (not "#id") means these also work
// from inner pages like /about — the browser navigates home, then scrolls.
export const platformLinks = [
  { label: 'Home',         href: '/#home',         id: 'home',         icon: 'fas fa-house',        desc: 'Back to the start' },
  { label: 'How It Works', href: '/#how-it-works', id: 'how-it-works', icon: 'fas fa-diagram-project', desc: 'From deposit to payout' },
  { label: 'Plans',        href: '/#plans',        id: 'plans',        icon: 'fas fa-chart-line',   desc: 'Compare investment plans' },
  { label: 'Why Us',       href: '/#why-us',       id: 'why-us',       icon: 'fas fa-gem',          desc: 'What sets VAULTEX apart' },
  { label: 'FAQ',          href: '/#faq',          id: 'faq',          icon: 'fas fa-circle-question', desc: 'Quick answers', isFaq: true },
];