'use client';

import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import PageLoader from '../components/layout/PageLoader';
import HeroSection from '../components/sections/HeroSection';
import HowItWorks from '../components/sections/HowItWorks';
import CryptoExplainer from '../components/sections/CryptoExplainer';
import InvestmentPlans from '../components/sections/InvestmentPlans';
import WhyUs from '../components/sections/WhyUs';
import Team from '../components/sections/Team';
import Footer from '../components/layout/Footer';

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <PageLoader onComplete={() => setLoaded(true)} />}
      <main style={{ background: '#0a0a0f' }}>
        <Navbar />
        <HeroSection />
        <HowItWorks />
        <CryptoExplainer />
        <InvestmentPlans />
        <WhyUs />
        <Team />
      </main>
      <Footer />
    </>
  );
}