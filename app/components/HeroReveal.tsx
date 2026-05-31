'use client';

import { useEffect, useRef } from 'react';

export default function HeroReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function reveal() {
      if (!el) return;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }

    window.addEventListener('intro:complete', reveal, { once: true });
    return () => window.removeEventListener('intro:complete', reveal);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: 'translateY(28px)',
        transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {children}
    </div>
  );
}
