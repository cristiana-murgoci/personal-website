'use client';

import { useEffect, useRef } from 'react';

export default function SplitText({
  text,
  className,
  delay = 200,
  stagger = 32,
}: {
  text: string;
  className?: string;
  delay?: number;   // ms after intro:complete before starting
  stagger?: number; // ms between each character
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function animate() {
      const chars = el?.querySelectorAll<HTMLElement>('.char');
      chars?.forEach((char, i) => {
        setTimeout(() => {
          char.style.opacity = '1';
          char.style.transform = 'translateY(0)';
        }, delay + i * stagger);
      });
    }

    window.addEventListener('intro:complete', animate, { once: true });
    return () => window.removeEventListener('intro:complete', animate);
  }, [delay, stagger]);

  return (
    <span ref={ref} className={className} aria-label={text} style={{ display: 'block' }}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}
        >
          <span
            className="char"
            aria-hidden="true"
            style={{
              display: 'inline-block',
              opacity: 0,
              transform: 'translateY(110%)',
              transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1)`,
            }}
          >
            {char === ' ' ? ' ' : char}
          </span>
        </span>
      ))}
    </span>
  );
}
