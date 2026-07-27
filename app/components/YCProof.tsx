'use client';

import { useEffect, useState } from 'react';
import s from './YCProof.module.css';

// A small chip under the Telos entry that opens the (redacted) YC acceptance
// screenshot in a popup. The image is public/yc-accepted.png, produced by
// scripts/redact-yc.mjs so co-founders' names never reach the page.
export default function YCProof() {
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <button type="button" className={s.trigger} onClick={() => setOpen(true)}>
        <span className={s.mark} aria-hidden="true">Y</span>
        view the YC acceptance
      </button>

      {open && (
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
      )}
    </>
  );
}
