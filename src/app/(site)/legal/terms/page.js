import LegalDocument from '@/components/legal/LegalDocument';

export const metadata = {
  title: 'Terms of Service — VAULTEX',
  description: 'Read the VAULTEX Terms of Service.',
};

export default function Page() {
  return <LegalDocument slug="terms" />;
}