
'use client';

// Lenis gives us buttery smooth scrolling across the entire site.
// We wrap the whole app in this so every page benefits from it.
// GSAP is also integrated here so scroll-triggered animations
// know the exact scroll position Lenis reports.

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({ children }) {
  useEffect(() => {
    // Create the Lenis instance
    const lenis = new Lenis({
      duration: 1.4,           // scroll animation duration in seconds
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease
      orientation: 'vertical',
      smoothWheel: true,
    });

    // Tell GSAP ScrollTrigger to use Lenis scroll position
    // Without this, ScrollTrigger uses native scroll — they'd be out of sync
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000); // GSAP runs in seconds, Lenis needs milliseconds
    });

    gsap.ticker.lagSmoothing(0); // prevent GSAP from skipping frames

    return () => {
      // Cleanup on unmount
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return <>{children}</>;
}