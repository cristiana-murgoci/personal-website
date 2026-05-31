'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,       // interpolates toward target each frame — reverses instantly on direction change
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Pause Lenis while the shader intro is capturing scroll
    function onIntroComplete() {
      lenis.start();
    }
    lenis.stop();
    window.addEventListener('intro:complete', onIntroComplete, { once: true });

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
