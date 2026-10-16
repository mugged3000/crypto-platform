import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Shared shell for every public inner page (About, Contact, Legal …).
// The landing page at "/" keeps its own layout because it also renders
// the intro loader; everything in this route group gets the same
// navbar + footer without repeating them in each page.
export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ background: '#0a0a0f', minHeight: '100vh' }}>{children}</main>
      <Footer />
    </>
  );
}