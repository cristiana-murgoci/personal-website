'use client';

import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ws from './writing.module.css';

export type ShelfBook = {
  id: string;
  title: string;
  spine: string;
  author: string;
  height: number;
  width: number;
  pattern: number;
  color?: string;
  textColor?: string;
};

type RoomId =
  | 'westTop'
  | 'collectors'
  | 'botanical'
  | 'kitchen'
  | 'eastTop'
  | 'westMid'
  | 'living'
  | 'study'
  | 'eastMid'
  | 'library';

// Scene constants, printed by scripts/stitch-house.mjs after each rebuild.
const W = 2003;
const H = 1124;

// The viewport always shows this many native image pixels across its width, so
// every room keeps the same on-screen size regardless of screen size; the
// camera pans across the wider building instead of shrinking it.
const VIEW_NATIVE_W = 940;

// Vertical framing: the scholar sits this fraction down the viewport, leaving
// headroom above her (and more roof visible on the top floor). 0.5 = centered.
const SPRITE_Y_FRAC = 0.62;

// Room geometry in percent of the full cutaway image (W x H). box = hotspot,
// pos = where the scholar's feet land.
const ROOMS: Record<
  RoomId,
  {
    label: string;
    line: string;
    box: { l: number; t: number; w: number; h: number };
    pos: { x: number; y: number };
  }
> = {
  westTop: {
    label: 'the west chamber',
    line: '✦ dust and hush in the west chamber',
    box: { l: 5, t: 44.2, w: 18, h: 18.2 },
    pos: { x: 14.5, y: 61.8 },
  },
  collectors: {
    label: "collectors' study",
    line: '❦ curiosities, catalogued and adored',
    box: { l: 23, t: 44.2, w: 15.9, h: 18.2 },
    pos: { x: 32.1, y: 61.8 },
  },
  botanical: {
    label: 'botanical research',
    line: '§ the ferns are pressed; the globe still spins',
    box: { l: 40.8, t: 44.2, w: 18.4, h: 18.2 },
    pos: { x: 48.9, y: 61.8 },
  },
  kitchen: {
    label: 'geography & tea',
    line: '¶ tea first, geography after',
    box: { l: 59.2, t: 44.2, w: 16.2, h: 18.2 },
    pos: { x: 66.8, y: 61.8 },
  },
  eastTop: {
    label: 'the map annex',
    line: '✦ more maps than anyone could read',
    box: { l: 75.4, t: 44.2, w: 19.6, h: 18.2 },
    pos: { x: 86, y: 61.8 },
  },
  westMid: {
    label: 'the morning room',
    line: '❦ the morning room, quiet and gold',
    box: { l: 5, t: 62.5, w: 18, h: 16.3 },
    pos: { x: 14.5, y: 78.1 },
  },
  living: {
    label: 'living & study',
    line: '❦ the hearth crackles by the chaise',
    box: { l: 23, t: 62.5, w: 27, h: 16.3 },
    pos: { x: 36, y: 78.1 },
  },
  study: {
    label: 'study',
    line: '❧ press enter to sit by the swan window',
    box: { l: 50, t: 62.5, w: 20, h: 16.3 },
    pos: { x: 57, y: 78.1 },
  },
  eastMid: {
    label: 'the reading room',
    line: '❧ a good chair and better light',
    box: { l: 70, t: 62.5, w: 25, h: 16.3 },
    pos: { x: 86, y: 78.1 },
  },
  library: {
    label: 'library.sys',
    line: '▸ press enter to open library.sys',
    box: { l: 5, t: 78.7, w: 90, h: 21.3 },
    pos: { x: 50, y: 98.9 },
  },
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const ADJ: Record<RoomId, Partial<Record<'left' | 'right' | 'up' | 'down', RoomId>>> = {
  westTop: { right: 'collectors', down: 'westMid' },
  collectors: { left: 'westTop', right: 'botanical', down: 'living' },
  botanical: { left: 'collectors', right: 'kitchen', down: 'study' },
  kitchen: { left: 'botanical', right: 'eastTop', down: 'eastMid' },
  eastTop: { left: 'kitchen', down: 'eastMid' },
  westMid: { up: 'westTop', right: 'living', down: 'library' },
  living: { left: 'westMid', right: 'study', up: 'collectors', down: 'library' },
  study: { left: 'living', right: 'eastMid', up: 'botanical', down: 'library' },
  eastMid: { left: 'study', up: 'eastTop', down: 'library' },
  library: { up: 'living' },
};

const ROOM_IDS = Object.keys(ROOMS) as RoomId[];

// ── Bookshelf layout ──────────────────────────────────────────────
// Books are packed to fill each shelf edge-to-edge (no ragged right gap);
// the exact split depends on the measured shelf width, so it happens at render.
// Gap and padding are set inline on each row (scaled with the shelf zoom).
const GAP = 7; // row gap at full size
const ROW_PAD = 16; // row horizontal padding at full size
const DEFAULT_ROW_W = 808; // width assumed before the shelf is measured
// A row this wide holds ~7 average spines at full size; narrower shelves
// zoom out proportionally so a phone row holds around 7 books instead of
// 4–5 oversized ones, while titles stay readable.
const FULL_SIZE_ROW_W = 360;

// ── Iconic books wear their cover art, not a title ────────────────
// A recognisable book shows a tiny copy of its original pixel-art cover
// (a PNG in public/house/spines) instead of a title. The spine is painted
// the art's own background colour so the little image sits on it seamlessly.
// Keyed by the normalised title; new art is added here one book at a time.
type SpineArt = {
  img: string;
  label: string;
  bg: string; // spine colour, sampled from the art's own background
  anchor?: 'bottom'; // sit the art at the foot of the spine instead of centred
};

const SPINE_ART: Record<string, SpineArt> = {
  '1984': { img: '/house/spines/1984.png', label: 'a watching eye', bg: '#D50200' },
  'animal farm': { img: '/house/spines/animal_farm.png', label: "a pig's face", bg: '#FAB1C2' },
  'thinking fast and slow': { img: '/house/spines/thinking_fast_and_slow.png', label: 'a pencil', bg: '#F9F9F9' },
  'lord of the flies': { img: '/house/spines/lord_of_the_flies.png', label: 'a crowned fly', bg: '#1E3F22' },
  'i am malala': { img: '/house/spines/malala.png', label: 'a portrait of Malala', bg: '#55B0BA', anchor: 'bottom' },
  'the metamorphosis': { img: '/house/spines/metamorphosis.png', label: 'a beetle', bg: '#658426' },
  'nexus': { img: '/house/spines/nexus.png', label: 'a pigeon', bg: '#F7F3E6' },
  'unmasking ai': { img: '/house/spines/unmasking_ai.png', label: 'a face beside a white mask', bg: '#050505', anchor: 'bottom' },
  'the privileged poor': { img: '/house/spines/privileged_poor.png', label: 'a heraldic crest', bg: '#1A3E62' },
};

const normTitle = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Dark or light ink for legible text on a given hex background.
function readableOn(hex: string): string {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.55 ? '#1A1816' : '#F7F3EC';
}

function artFor(b: ShelfBook) {
  return SPINE_ART[normTitle(b.spine)] ?? SPINE_ART[normTitle(b.title)];
}

// Books with cover art get an even spine to sit the little image on; long
// non-art titles wrap onto a second vertical line and need two columns.
function spineWidth(b: ShelfBook) {
  if (artFor(b)) return Math.max(b.width, 40);
  // Very long titles need three vertical columns; keep the spine wide enough
  // that the last column can't be clipped.
  if (b.spine.length > 24) return Math.max(b.width, 42);
  return b.spine.length > 12 ? Math.max(b.width, 34) : b.width;
}

// The cover art is shown tiny and centred, scaled down smoothly (not
// pixelated) so none of the original detail is lost.
function PixelGlyph({ art }: { art: SpineArt }) {
  const cls = art.anchor === 'bottom' ? `${ws.spineGlyph} ${ws.spineGlyphBottom}` : ws.spineGlyph;
  return <img className={cls} src={art.img} alt={art.label} />;
}

const authorInitials = (author: string) =>
  author.split(/\s+/).map((w) => w[0]).filter(Boolean).join('').slice(0, 3).toUpperCase();

// The face of a spine: its cover glyph, or its title + author initials. Shared
// by the shelf and by the falling clone so the two look identical.
function SpineFace({ book }: { book: ShelfBook }) {
  const art = artFor(book);
  if (art) return <PixelGlyph art={art} />;
  return (
    <>
      <span className={ws.spineTitle}>{book.spine}</span>
      <span className={ws.spineFoot} aria-hidden="true">
        {authorInitials(book.author)}
      </span>
    </>
  );
}

// Balance the books across shelves so every row is nearly full, then let
// justify-content flush both ends. rowsNeeded fixes the shelf count from a
// hard greedy pass; the second pass spreads books evenly toward that count.
function packShelves(
  books: ShelfBook[],
  usable: number,
  width: (b: ShelfBook) => number,
  gap: number
): ShelfBook[][] {
  if (books.length === 0) return [];
  const rowsNeeded = (() => {
    let rows = 1;
    let w = 0;
    for (const b of books) {
      const add = (w > 0 ? gap : 0) + width(b);
      if (w > 0 && w + add > usable) {
        rows++;
        w = width(b);
      } else {
        w += add;
      }
    }
    return rows;
  })();
  if (rowsNeeded <= 1) return [books];

  const totalW = books.reduce((s, b) => s + width(b), 0);
  // Target row width counts the gaps too, so the last row isn't left starved.
  const totalContent = totalW + Math.max(0, books.length - rowsNeeded) * gap;
  const target = Math.min(usable, totalContent / rowsNeeded);
  const shelves: ShelfBook[][] = [];
  let cur: ShelfBook[] = [];
  let w = 0;
  books.forEach((b) => {
    const add = (cur.length ? gap : 0) + width(b);
    const overflow = cur.length > 0 && w + add > usable;
    // Break for balance once this row has met its share; the final row (once
    // rowsNeeded-1 are placed) simply collects the rest, never overflowing.
    const balanced = cur.length > 0 && w >= target && shelves.length < rowsNeeded - 1;
    if (overflow || balanced) {
      shelves.push(cur);
      cur = [b];
      w = width(b);
    } else {
      cur.push(b);
      w += add;
    }
  });
  if (cur.length) shelves.push(cur);
  return shelves;
}

// The lifted-book reveal plays in beats: the clicked book is tugged forward off
// the shelf and tumbles out of frame, a held empty pause, then the tentacle
// rises carrying it back cover-first; `shelving` lowers it away again.
type Phase = 'fall' | 'pause' | 'present' | 'shelving';

// Where the clicked spine sits inside the library window, so the falling clone
// can start life exactly on top of it (no jarring twin). dropY is how far it
// must travel to clear the bottom edge.
type FallRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  dropY: number;
  // The spine's on-screen transform at the click (its hover tilt, if any), so
  // the clone starts exactly where the spine was — angle and size continuous.
  startTransform: string;
};

export default function Dollhouse({ books }: { books: ShelfBook[] }) {
  const [room, setRoom] = useState<RoomId>('living');
  const [line, setLine] = useState<string>(ROOMS.living.line);
  const [view, setView] = useState<'inside' | 'outside'>('inside');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [swanOpen, setSwanOpen] = useState(false);
  // A book lifted off the shelf by the tentacle, shown cover-forward so the
  // full title and author read (the spines are truncated and the links are off).
  const [presented, setPresented] = useState<ShelfBook | null>(null);
  const [phase, setPhase] = useState<Phase>('fall'); // which beat is playing
  const [fallRect, setFallRect] = useState<FallRect | null>(null); // clicked spine's box
  const [pulled, setPulled] = useState(false); // book tugged forward off the shelf
  const [dropped, setDropped] = useState(false); // book tumbles down and out
  const [lifted, setLifted] = useState(false); // drives the rise/lower transition
  const libWinRef = useRef<HTMLDivElement>(null);

  // Measure the shelf so books can be packed to fill each row exactly.
  const shelfRef = useRef<HTMLDivElement>(null);
  const [shelfW, setShelfW] = useState(DEFAULT_ROW_W);
  useLayoutEffect(() => {
    if (!libraryOpen) return;
    const el = shelfRef.current;
    if (!el) return;
    const measure = () => setShelfW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [libraryOpen]);

  // Beat 1 — the clicked book is tugged forward off the shelf, hangs a moment,
  // then tumbles down and out. (Reduced motion skips straight to the reveal.)
  useEffect(() => {
    if (!presented || phase !== 'fall') return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setPhase('present');
      return;
    }
    const raf = requestAnimationFrame(() => setPulled(true)); // pull forward
    const kick = setTimeout(() => setPulled(true), 60); // fallback if rAF is throttled
    const tumble = setTimeout(() => setDropped(true), 1750); // slow pull + a beat, then let go
    const done = setTimeout(() => setPhase('pause'), 2500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(kick);
      clearTimeout(tumble);
      clearTimeout(done);
    };
  }, [presented, phase]);

  // Beat 2 — a long, dramatic empty beat before the tentacle turns up.
  useEffect(() => {
    if (!presented || phase !== 'pause') return;
    const t = setTimeout(() => setPhase('present'), 2200);
    return () => clearTimeout(t);
  }, [presented, phase]);

  // Beat 3 — the tentacle rises, carrying the book cover-forward. Mount below,
  // then flip up on the next frame so the transition actually plays.
  useEffect(() => {
    if (!presented || phase !== 'present') return;
    const raf = requestAnimationFrame(() => setLifted(true));
    const kick = setTimeout(() => setLifted(true), 60); // fallback if rAF is throttled
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(kick);
    };
  }, [presented, phase]);

  // Reshelve — lower the tentacle, then clear once the transition finishes.
  useEffect(() => {
    if (phase !== 'shelving') return;
    setLifted(false);
    const t = setTimeout(() => {
      setPresented(null);
      setFallRect(null);
      setPulled(false);
      setDropped(false);
      setPhase('fall');
    }, 1150);
    return () => clearTimeout(t);
  }, [phase]);

  // Click/tap the darkened stage: hurry the intro along, or reshelve once up.
  const advanceStage = useCallback(() => {
    setPhase((p) => (p === 'present' ? 'shelving' : p === 'fall' || p === 'pause' ? 'present' : p));
  }, []);

  // Measure the viewport so the camera can keep the scholar in frame.
  const vpRef = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState({ w: 900, h: 560 });
  useLayoutEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    const measure = () => setVp({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [view]);

  const worldW = (vp.w * W) / VIEW_NATIVE_W;
  const worldH = (worldW * H) / W;
  const sx = (ROOMS[room].pos.x / 100) * worldW;
  const sy = (ROOMS[room].pos.y / 100) * worldH;
  const camX = clamp(sx - vp.w / 2, 0, Math.max(0, worldW - vp.w));
  // Seat the scholar a little below center so there is headroom above her; on
  // the top floor this reveals more of the roof without forcing the whole thing.
  const camY = clamp(sy - vp.h * SPRITE_Y_FRAC, 0, Math.max(0, worldH - vp.h));

  const goTo = useCallback((r: RoomId) => {
    setRoom(r);
    setLine(ROOMS[r].line);
  }, []);

  const interact = useCallback(() => {
    if (room === 'library') setLibraryOpen(true);
    else if (room === 'study') setSwanOpen(true);
    else setLine(ROOMS[room].line);
  }, [room]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (libraryOpen || swanOpen) {
        if (e.key === 'Escape') {
          // Esc reshelves a lifted book first, then closes the window
          if (presented && phase === 'present') {
            setPhase('shelving');
          } else if (presented && phase !== 'shelving') {
            // still mid-intro: cancel it outright
            setPresented(null);
            setFallRect(null);
            setPulled(false);
            setDropped(false);
            setPhase('fall');
          } else if (!presented) {
            setLibraryOpen(false);
            setSwanOpen(false);
          }
        }
        return;
      }
      if (view === 'outside') {
        if (e.key === 'Enter' || e.key === 'Escape') setView('inside');
        return;
      }
      const dir =
        e.key === 'ArrowLeft' ? 'left'
        : e.key === 'ArrowRight' ? 'right'
        : e.key === 'ArrowUp' ? 'up'
        : e.key === 'ArrowDown' ? 'down'
        : null;
      if (dir) {
        const next = ADJ[room][dir];
        if (next) {
          e.preventDefault();
          goTo(next);
        }
      } else if (e.key === 'Enter') {
        interact();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [room, view, libraryOpen, swanOpen, presented, phase, goTo, interact]);

  // Shelf zoom: 1 on a full-width window, shrinking on narrow screens so a
  // row keeps holding ~7 books. The floor matches the spine type's 7px floor
  // (0.7 × 10px): geometry must never shrink past the type, or multi-column
  // vertical titles grow wider than their spines and bleed onto neighbours.
  const spineScale = Math.min(1, Math.max(0.7, (shelfW - 2 * ROW_PAD) / FULL_SIZE_ROW_W));
  const rowPad = Math.round(ROW_PAD * spineScale);
  const rowGap = Math.max(3, Math.round(GAP * spineScale));
  const scaledSpineW = (b: ShelfBook) => Math.max(16, Math.round(spineWidth(b) * spineScale));
  const shelves = packShelves(books, Math.max(120, shelfW - 2 * rowPad), scaledSpineW, rowGap);
  // Stable palette index for the fallback leather colours (order-preserving).
  const colorIndex = new Map(books.map((b, i) => [b.id, i] as const));

  // Presented cover: books with a glyph get the art's colour (so the enlarged
  // icon blends) and legible ink; the rest use their own cover colour.
  const presentedArt = presented ? artFor(presented) : null;
  const presentedBg = presentedArt ? presentedArt.bg : presented?.color ?? '#B8B8B8';
  const presentedFg = presentedArt ? readableOn(presentedArt.bg) : presented?.textColor ?? '#1A1816';

  // The falling clone wears the same leather/pattern/colour as the shelf spine.
  const presentedIdx = presented ? colorIndex.get(presented.id) ?? 0 : 0;
  const presentedPattern =
    presented?.pattern === 1 ? ws.stripes : presented?.pattern === 2 ? ws.dots : '';
  const spineBg = presentedArt?.bg ?? presented?.color;
  const spineFg = presented?.textColor;

  return (
    <div className={ws.houseScroll}>
      <div className={`${ws.osWindow} ${ws.houseWindow}`}>
        <div className={ws.osTitleBar}>
          <span>dollhouse.exe</span>
          <span className={ws.osButtons} aria-hidden="true">
            <i className={`${ws.osChip} ${ws.osMin}`} />
            <i className={`${ws.osChip} ${ws.osMax}`} />
            <i className={`${ws.osChip} ${ws.osClz}`}>✕</i>
          </span>
        </div>

        {view === 'inside' ? (
          <div className={ws.viewport} ref={vpRef}>
            <div
              className={ws.world}
              style={{ width: worldW, height: worldH, transform: `translate(${-camX}px, ${-camY}px)` }}
            >
              <img
                src="/house/cutaway.png"
                width={W}
                height={H}
                alt="Pixel art cutaway of a library house"
                className={`${ws.houseImg} ${ws.dayScene}`}
              />
              <img
                src="/house/cutaway-night.png"
                width={W}
                height={H}
                alt="Pixel art cutaway of the library house at night, rooms lit"
                className={`${ws.houseImg} ${ws.nightScene}`}
              />
              {ROOM_IDS.map((id) => {
                const r = ROOMS[id];
                return (
                  <button
                    key={id}
                    type="button"
                    className={ws.hotspot}
                    style={{
                      left: `${r.box.l}%`,
                      top: `${r.box.t}%`,
                      width: `${r.box.w}%`,
                      height: `${r.box.h}%`,
                    }}
                    aria-label={
                      id === 'library'
                        ? 'Walk to the library and open the bookshelf'
                        : id === 'study'
                          ? 'Walk to the study and visit the swan window'
                          : `Walk to ${r.label}`
                    }
                    onClick={() => {
                      if (room === id) interact();
                      else goTo(id);
                    }}
                  />
                );
              })}
              <span
                className={ws.spriteAnchor}
                style={{ left: `${ROOMS[room].pos.x}%`, top: `${ROOMS[room].pos.y}%` }}
                aria-hidden="true"
              >
                <i className={ws.pixieGirl} />
              </span>
            </div>
          </div>
        ) : (
          <div className={ws.stage}>
            <button
              type="button"
              className={ws.outsideView}
              onClick={() => setView('inside')}
              aria-label="Go back inside the house"
            >
              <img
                src="/house/exterior.png"
                width={1370}
                height={768}
                alt="Pixel art of a red brick Georgian house with a cupola"
                className={`${ws.houseImg} ${ws.dayScene}`}
              />
              <img
                src="/house/exterior-night.png"
                width={1370}
                height={768}
                alt="Pixel art of the red brick house at night with lit windows"
                className={`${ws.houseImg} ${ws.nightScene}`}
              />
            </button>
          </div>
        )}

        <div className={ws.hud}>
          <p className={ws.statusLine} role="status">
            {view === 'inside' ? line : '☖ home, seen from the yard'}
          </p>
          <p className={ws.hudHint}>
            {view === 'inside' ? (
              <>
                <span className={ws.hintKeys}>← ↑ → ↓ wander · the view follows you · enter interact</span>
                <span className={ws.hintTouch}>tap a room to wander · tap it again to interact</span>
              </>
            ) : (
              <>
                <span className={ws.hintKeys}>enter or click to come back inside</span>
                <span className={ws.hintTouch}>tap the house to come back inside</span>
              </>
            )}
          </p>
          <button
            type="button"
            className={ws.viewBtn}
            onClick={() => setView(view === 'inside' ? 'outside' : 'inside')}
          >
            {view === 'inside' ? '▸ step outside' : '▸ come back inside'}
          </button>
        </div>
      </div>

      {swanOpen && (
        <div className={ws.overlay} role="dialog" aria-modal="true" aria-label="The swan window">
          <div className={`${ws.osWindow} ${ws.swanWindowBox}`}>
            <div className={ws.osTitleBar}>
              <span>swan_window.sys — the study</span>
              <button type="button" className={ws.osClose} onClick={() => setSwanOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className={ws.swanBody}>
              <img
                src="/house/swan.png"
                width={896}
                height={1195}
                alt="Pixel art of an arched stained-glass window with a swan"
                className={ws.houseImg}
              />
            </div>
          </div>
        </div>
      )}

      {libraryOpen && (
        <div className={ws.overlay} role="dialog" aria-modal="true" aria-label="Library">
          <div
            className={`${ws.osWindow} ${ws.libraryWindow}`}
            ref={libWinRef}
            style={{ '--spine-scale': spineScale } as CSSProperties}
          >
            <div className={ws.osTitleBar}>
              <span>library.sys</span>
              <button type="button" className={ws.osClose} onClick={() => setLibraryOpen(false)} aria-label="Close library">
                ✕
              </button>
            </div>
            <div className={ws.libraryBody}>
              <div className={ws.shelfUnit} ref={shelfRef}>
                {shelves.map((shelf, r) => (
                  <div key={r} className={ws.shelfTier}>
                    <div
                      className={ws.shelfRow}
                      style={{ gap: rowGap, padding: `${rowPad}px ${rowPad}px 0` }}
                    >
                      {shelf.map((book) => {
                        const i = colorIndex.get(book.id) ?? 0;
                        const pattern = book.pattern === 1 ? ws.stripes : book.pattern === 2 ? ws.dots : '';
                        const art = artFor(book);
                        const bg = art?.bg ?? book.color;
                        const fg = book.textColor;
                        return (
                          <button
                            key={book.id}
                            type="button"
                            className={`${ws.spine} ${ws[`c${i % 6}`]} ${art ? '' : pattern}`}
                            style={{
                              height: Math.round(book.height * spineScale),
                              width: scaledSpineW(book),
                              // Hidden (but still holding its slot) while it's the book on the tentacle
                              visibility: presented?.id === book.id ? 'hidden' : undefined,
                              ...(bg ? { backgroundColor: bg, color: fg } : {}),
                            }}
                            title={`${book.title} · ${book.author}`}
                            aria-label={`${book.title} by ${book.author}`}
                            onClick={(e) => {
                              const lib = libWinRef.current;
                              const el = e.currentTarget;
                              if (lib) {
                                // Snapshot the spine's live transform (its hover tilt), then
                                // clear it so we measure the true, un-rotated box.
                                const startTransform = getComputedStyle(el).transform;
                                const prev = el.style.transform;
                                el.style.transform = 'none';
                                const lw = lib.getBoundingClientRect();
                                const sr = el.getBoundingClientRect();
                                el.style.transform = prev;
                                const top = sr.top - lw.top - lib.clientTop;
                                setFallRect({
                                  left: sr.left - lw.left - lib.clientLeft,
                                  top,
                                  width: sr.width,
                                  height: sr.height,
                                  // Always far enough to clear the bottom edge, never negative
                                  dropY: Math.max(sr.height + 80, lib.clientHeight - top + sr.height + 60),
                                  startTransform,
                                });
                              }
                              setPresented(book);
                              setPulled(false);
                              setDropped(false);
                              setLifted(false);
                              setPhase('fall');
                            }}
                          >
                            <SpineFace book={book} />
                          </button>
                        );
                      })}
                    </div>
                    <div className={ws.plank} />
                  </div>
                ))}
              </div>
              <p className={ws.caption}>esc to close</p>
            </div>
            {presented && (
              <div
                className={ws.bookStage}
                role="dialog"
                aria-modal="true"
                aria-label={`${presented.title} by ${presented.author}`}
                onClick={advanceStage}
              >
                {phase === 'fall' && fallRect && (
                  <div
                    className={`${ws.fallClone} ${ws[`c${presentedIdx % 6}`]} ${presentedArt ? '' : presentedPattern} ${pulled ? ws.fallPull : ''} ${dropped ? ws.fallDrop : ''}`}
                    style={
                      {
                        left: fallRect.left,
                        top: fallRect.top,
                        width: fallRect.width,
                        height: fallRect.height,
                        '--dropY': `${fallRect.dropY}px`,
                        // Begin at the spine's exact tilt; once pulling, drop this so the
                        // .fallPull class transform takes over and animates from here.
                        ...(pulled ? {} : { transform: fallRect.startTransform }),
                        ...(spineBg ? { backgroundColor: spineBg, color: spineFg } : {}),
                      } as CSSProperties
                    }
                    aria-hidden="true"
                  >
                    <SpineFace book={presented} />
                  </div>
                )}
                {(phase === 'present' || phase === 'shelving') && (
                  <div className={`${ws.carry} ${lifted ? ws.carryUp : ''} ${phase === 'shelving' ? ws.carryShelving : ''}`}>
                    <div className={ws.carryBob}>
                      <img className={ws.carryTentacle} src="/house/tentacle.png" alt="" aria-hidden="true" />
                      <div
                        className={ws.carryCover}
                        style={{ backgroundColor: presentedBg, color: presentedFg }}
                      >
                        <span className={ws.carryTitle}>{presented.title}</span>
                        {presentedArt && (
                          <img className={ws.carryCoverIcon} src={presentedArt.img} alt="" aria-hidden="true" />
                        )}
                        <span className={ws.carryAuthor}>{presented.author}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
