'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import s from './YCProof.module.css';

// A small Y Combinator logo, sitting next to the Telos title, that opens the
// acceptance screenshot (public/yc-accepted.png) in a popup. The popup is
// portalled to <body> so it never nests inside the heading.
export default function YCProof() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // lock scroll while open
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const popup = (
    <div
      className={s.scrim}
      role="dialog"
      aria-modal="true"
      aria-label="Y Combinator acceptance"
      onClick={() => setOpen(false)}
    >
      <div className={s.card} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={s.close} onClick={() => setOpen(false)} aria-label="Close">
          ✕
        </button>
        <img
          src="/yc-accepted.png"
          alt="Y Combinator applications page showing Telos accepted into the Summer 2026 batch"
          className={s.image}
        />
        <p className={s.caption}>Y Combinator · Summer 2026 · accepted</p>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className={s.trigger}
        onClick={() => setOpen(true)}
        aria-label="View the Y Combinator acceptance"
        title="View the YC acceptance"
      >
        <span className={s.mark} aria-hidden="true">Y</span>
      </button>
      {mounted && open ? createPortal(popup, document.body) : null}
    </>
  );
}
