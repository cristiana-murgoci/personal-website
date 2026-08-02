'use client';

import { useEffect, useState } from 'react';

const sections = [
  { id: 'about',      label: 'About'      },
  { id: 'awards',     label: 'Awards'     },
  { id: 'activities', label: 'Activities' },
  { id: 'coursework', label: 'Coursework' },
  { id: 'skills',     label: 'Skills'     },
  { id: 'contact',    label: 'Contact'    },
];

export default function SideNav() {
  const [active, setActive]   = useState('');
  const [visible, setVisible] = useState(true);

  // Track active section via scroll position
  useEffect(() => {
    function onScroll() {
      if (window.scrollY < 80) { setActive(''); return; }
      let current = '';
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= window.innerHeight * 0.5) current = id;
      }
      setActive(current);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <nav
      style={{
        position: 'fixed',
        right: '40px',
        bottom: '48px',
        zIndex: 40,
        /* display comes from the .sidenav class so the mobile media query can hide it */
        flexDirection: 'column',
        gap: '2px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
      className="sidenav"
    >
      {sections.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: isActive ? 'rgba(3, 105, 161, 0.1)' : 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '3px 7px',
              borderRadius: '3px',
              color: isActive ? 'var(--accent)' : 'var(--text-faint)',
              transition: 'color 0.3s ease, background 0.3s ease',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono), Space Mono, monospace',
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
