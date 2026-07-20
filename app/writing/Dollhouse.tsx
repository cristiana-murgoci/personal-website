'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ws from './writing.module.css';

export type ShelfBook = {
  id: string;
  title: string;
  spine: string;
  author: string;
  link: string;
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
const GAP = 7; // must match .shelfRow gap in the stylesheet
const ROW_PAD = 16; // must match .shelfRow horizontal padding
const DEFAULT_ROW_W = 808; // width assumed before the shelf is measured

// ── Iconic classics wear a glyph, not a title ─────────────────────
// A recognisable book gets a single pixel-art symbol instead of its title, so
// the spine reads as a hint rather than a label. Each glyph carries its own
// palette; any char missing from the palette (including '.' and ' ') is left
// transparent, so the spine's own colour shows through. A classic may also
// override its spine colour. New art is added here one classic at a time.
type SpineArt = {
  grid: string[];
  palette: Record<string, string>;
  label: string;
  bg?: string;
  fg?: string;
  width?: number; // spine thickness so the glyph has room to read
};

// 1984 — a red spine with a single watching eye. W = sclera, G = iris,
// D = pupil; the two 'R' glints stay transparent so the red spine shows
// through the pupil, just like the reference art.
const EYE_1984 = [
  '.......WWWWW.......',
  '.....WWWWWWWWW.....',
  '....WWWWWWWWWWW....',
  '...WWWWGGGGWWWWW...',
  '..WWWWGGGGGGWWWWW..',
  '..WWWGGDDDGGGWWWWW.',
  '.WWWWGDDDRDGGWWWWW.',
  '.WWWWGDDRDDGGWWWWW.',
  '.WWWWGDDDDDGGWWWWW.',
  '..WWWGDDDDDGGWWWWW.',
  '..WWWWGDDDGGWWWWW..',
  '...WWWWGGGGWWWWW...',
  '....WWWWWWWWWWW....',
  '.....WWWWWWWWW.....',
  '.......WWWWW.......',
];

// Animal Farm — a pink spine with a pig's face. O = outline, i = inner ear,
// B = eyes, S/o/N = snout, fill and nostrils; the face itself is the spine's
// own pink showing through.
const PIG_ANIMAL_FARM = [
  '.OO............OO.',
  '.OiO..........OiO.',
  '.OiiO........OiiO.',
  '.OiiiO......OiiiO.',
  '.OOOOOOOOOOOOOOOO.',
  '.O..............O.',
  '.O..............O.',
  '.O...BB....BB...O.',
  '.O...BB....BB...O.',
  '.O..............O.',
  '.O..............O.',
  '.O....oooooo....O.',
  '.O....oSNSNo....O.',
  '.O....oSNSNo....O.',
  '.O....oooooo....O.',
  '.O..............O.',
  '.OOOOOOOOOOOOOOOO.',
];

// Thinking, Fast and Slow — a pencil down a paper-white spine. K = graphite
// and ferrule, w = wood, Y/y = body, g = ferrule bands, R = eraser.
const PENCIL_TFS = [
  '....KK....',
  '...wKKw...',
  '...wKKw...',
  '..wwKKww..',
  '..wwwwww..',
  '..YYYYYy..',
  '..YYYYYy..',
  '..YYYYYy..',
  '..YYYYYy..',
  '..YYYYYy..',
  '..YYYYYy..',
  '..YYYYYy..',
  '..YYYYYy..',
  '..YYYYYy..',
  '..KgKgKg..',
  '..gKgKgK..',
  '..KgKgKg..',
  '..gKgKgK..',
  '..KgKgKg..',
  '..gKgKgK..',
  '..KgKgKg..',
  '..RRRRRR..',
  '..RRRRRR..',
  '...RRRR...',
];

// Lord of the Flies — a crowned fly on a forest-green spine. C/c = crown,
// G = neck, K = body, W = wings; the green shows through everywhere else.
const FLY_LOTF = [
  '......CC.CC.CC......',
  '......CCcCCcCC......',
  '......CCCCCCCC......',
  '......cCCCCCCc......',
  '........GGGG........',
  '........GGGG........',
  '........KKKK........',
  '........KKKK........',
  '.....WWKKKKKKWW.....',
  '....WWWKKKKKKWWW....',
  '..WWWWWKKKKKKWWWWW..',
  '.WWWWWWKKKKKKWWWWWW.',
  '.WWWW...KKKK...WWWW.',
  '..WWW...KKKK...WWW..',
  '...WW...KKKK...WW...',
  '.........KK.........',
  '.........KK.........',
];

// I Am Malala — a portrait on a turquoise spine. P/p = hijab, Y = trim,
// S = face, H = hair.
const MALALA = [
  '......PPPPPP......',
  '.....PPPPPPPP.....',
  '....PPPPPPPPPP....',
  '...PPPPPPPPPPPP...',
  '...PPYHHHHHHYPP...',
  '...PPYHSSSSHYPP...',
  '..PPYSSSSSSSSYPP..',
  '..PPYSSSSSSSSYPP..',
  '..PPYSSSSSSSSYPP..',
  '..PPYSSSSSSSSYPP..',
  '...PPYSSSSSSYPP...',
  '..PPPPPPPPPPPPPP..',
  '.PPPPYPPPPPPYPPPP.',
  'PPPPYPPPPPPPPYPPPP',
  'PPPYPPPPPPPPPPYPPP',
  'PPPPPPPPPPPPPPPPPP',
  'PPPPPPPPPPPPPPPPPP',
  'PPPPPPPPPPPPPPPPPP',
];

// The Metamorphosis — a black beetle on an olive spine. K is the whole insect;
// the green shows through around the legs and antennae.
const BEETLE = [
  '.....K.......K.....',
  '.....K.......K.....',
  '......K.....K......',
  '......K.....K......',
  '.......KKKKK.......',
  '.......KKKKK.......',
  '.KK...KKKKKKK...KK.',
  '..KKKKKKKKKKKKKKK..',
  '.....KKKKKKKKK.....',
  '.....KKKKKKKKK.....',
  '....KKKKKKKKKKK....',
  '.KKKKKKKKKKKKKKKKK.',
  'KK..KKKKKKKKKKK..KK',
  '.....KKKKKKKKK.....',
  '.....KKKKKKKKK.....',
  '.....KKKKKKKKK.....',
  '...KKKKKKKKKKKKK...',
  '.KK...KKKKKKK...KK.',
  '.......KKKKK.......',
  '........KKK........',
];

// Nexus — a pigeon on a cream spine, facing right. B/b = body and tail,
// E = eye, k = beak, X/W = wing bars, C = belly, R = feet.
const PIGEON_NEXUS = [
  '.................BBB..',
  '................BBBBB.',
  '................BBBEB.',
  '...............BBBBBB.',
  '...............BBBBBBk',
  '..............BBBBBB..',
  '............BBBBBBBB..',
  '........BBBBBBBBBBBB..',
  '......BBBBBBBBBBBBBB..',
  '.....BBBBBBBBBBBBBBB..',
  '.bbbbBBXWXWXWBBBBBBB..',
  'bbbbbBBWXWXWXBBBBBB...',
  '.bbbbBBXWXWXWBBBBB....',
  '......BBBBBBBBBB......',
  '........CCCCCCCC......',
  '.........CCCCCC.......',
  '..........RRRR........',
  '...........RR.........',
  '...........RR.........',
];

// Unmasking AI — a split portrait on a black spine: brown face (S/d) on the
// left, a pale mask (W/g) held over the right, tan eye (E), black eye holes (K),
// red garment and nails (R). The black shows through everywhere else.
const UNMASKING_AI = [
  '...dddddd...WWWWW...',
  '..dddddddd.WWWWWWW..',
  '.ddSSSSSSSWWWWWWWWW.',
  '.SSSSSSSSSWWWWWWWWW.',
  '.SSddddddSWWWWWggWW.',
  '.SWWWWWWWSWWWWWWWWW.',
  '.SWKKEKKSSWWWKKKKWW.',
  '.SSKKKKSSSWWWKKKKWW.',
  '.SSWWWWSSSWWWWWWWWW.',
  '.SSSSSSSSSWWWWWWWWW.',
  '.SSSSSSSddgWWWWWWWW.',
  '.SSSSSSSSdgWWWWWWWW.',
  '.SSSSSSSSSWWWWWWWSR.',
  '.SSSSddddSWWWWWWSSR.',
  '.SSSddddddWWWWWSSSR.',
  '.SSSSSSSSSWWWWSSSSR.',
  '.SSSSSSSSSWWWSSSSSS.',
  '.RRRSSSSSSWWSSSSSSS.',
  '.RRRRRR.....SSSSSSS.',
  '.RRRRRRR............',
  '.RRRRRR.............',
  '.RRRR...............',
];

// The Privileged Poor — a red crest on a navy spine. R is the shield; the
// navy shows through the cut-outs (top slot, side slots, centre cross) and
// around the stepped point.
const CREST = [
  '.............',
  '.............',
  '..RRRRRRRRR..',
  '..RRR...RRR..',
  '..RRRRRRRRR..',
  '..R..RRR..R..',
  '..R..RRR..R..',
  '..RRRRRRRRR..',
  '..RRRR.RRRR..',
  '..RRR...RRR..',
  '..RRRR.RRRR..',
  '...RRRRRRR...',
  '....RRRRR....',
  '.....RRR.....',
  '......R......',
];

const SPINE_ART: Record<string, SpineArt> = {
  '1984': {
    grid: EYE_1984,
    palette: { W: '#F2EEE4', G: '#4C4A48', D: '#1B1F27' },
    label: 'a watching eye',
    bg: '#C4291D',
    fg: '#F2EEE4',
    width: 48,
  },
  'animal farm': {
    grid: PIG_ANIMAL_FARM,
    palette: {
      O: '#C486A0',
      i: '#E3B49A',
      B: '#211C1C',
      S: '#F2D6B8',
      o: '#E3B891',
      N: '#2E2622',
    },
    label: "a pig's face",
    bg: '#E9B4C1',
    fg: '#5A2E3A',
    width: 46,
  },
  'thinking fast and slow': {
    grid: PENCIL_TFS,
    palette: {
      K: '#202020',
      w: '#F0D3A6',
      Y: '#F2A31C',
      y: '#DB8B10',
      g: '#C0C0C0',
      R: '#E13A2C',
    },
    label: 'a pencil',
    bg: '#ECE6D7',
    fg: '#1C1917',
    width: 46,
  },
  'lord of the flies': {
    grid: FLY_LOTF,
    palette: {
      C: '#A3B183',
      c: '#7F8F63',
      G: '#6C6C6C',
      K: '#15140F',
      W: '#D8D6CE',
    },
    label: 'a crowned fly',
    bg: '#303D28',
    fg: '#D8D6CE',
    width: 48,
  },
  'i am malala': {
    grid: MALALA,
    palette: {
      P: '#DD1F76',
      p: '#A81A5F',
      Y: '#F6C61C',
      S: '#E6B78C',
      H: '#3E2618',
    },
    label: 'a portrait of Malala',
    bg: '#40AEBE',
    fg: '#F2EEE4',
    width: 48,
  },
  'the metamorphosis': {
    grid: BEETLE,
    palette: { K: '#17140F' },
    label: 'a beetle',
    bg: '#6E7C3E',
    fg: '#17140F',
    width: 48,
  },
  'nexus': {
    grid: PIGEON_NEXUS,
    palette: {
      B: '#7C6A6A',
      b: '#5E4F4F',
      E: '#1A1614',
      k: '#D9D3C5',
      X: '#201C1A',
      W: '#E8E3D6',
      C: '#E4DCC8',
      R: '#D9603C',
    },
    label: 'a pigeon',
    bg: '#F2EEE3',
    fg: '#5E4F4F',
    width: 50,
  },
  'unmasking ai': {
    grid: UNMASKING_AI,
    palette: {
      S: '#6B4230',
      d: '#43291D',
      W: '#CBD3D5',
      g: '#9BA7AB',
      K: '#0C0C0C',
      E: '#C9A878',
      R: '#D8271E',
    },
    label: 'a face beside a white mask',
    bg: '#0E0E0E',
    fg: '#CBD3D5',
    width: 50,
  },
  'the privileged poor': {
    grid: CREST,
    palette: { R: '#BC4636' },
    label: 'a heraldic crest',
    bg: '#2E3C54',
    fg: '#BC4636',
    width: 46,
  },
};

const normTitle = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function artFor(b: ShelfBook) {
  return SPINE_ART[normTitle(b.spine)] ?? SPINE_ART[normTitle(b.title)];
}

// Classics need room for their glyph; non-classic long titles wrap onto a
// second vertical line and need room for two columns of text.
function spineWidth(b: ShelfBook) {
  const art = artFor(b);
  if (art) return Math.max(b.width, art.width ?? 34);
  return b.spine.length > 12 ? Math.max(b.width, 34) : b.width;
}

function PixelGlyph({ art }: { art: SpineArt }) {
  const h = art.grid.length;
  const w = art.grid[0]?.length ?? 0;
  // Render at a whole-number pixel scale so every cell lands on exact pixels.
  // A fractional scale (from sizing to a % of the spine) lets crispEdges snap
  // adjacent cells onto the same pixel, which drops thin one-cell details.
  // Keep the glyph small; thinner grids get a bigger scale so they still read.
  const scale = w <= 14 ? 3 : 2;
  const cells: { x: number; y: number; fill: string }[] = [];
  art.grid.forEach((row, y) =>
    row.split('').forEach((c, x) => {
      const fill = art.palette[c];
      if (fill) cells.push({ x, y, fill });
    })
  );
  return (
    <svg
      className={ws.spineGlyph}
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={art.label}
      shapeRendering="crispEdges"
    >
      {cells.map(({ x, y, fill }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />
      ))}
    </svg>
  );
}

// Balance the books across shelves so every row is nearly full, then let
// justify-content flush both ends. rowsNeeded fixes the shelf count from a
// hard greedy pass; the second pass spreads books evenly toward that count.
function packShelves(books: ShelfBook[], usable: number): ShelfBook[][] {
  if (books.length === 0) return [];
  const rowsNeeded = (() => {
    let rows = 1;
    let w = 0;
    for (const b of books) {
      const add = (w > 0 ? GAP : 0) + spineWidth(b);
      if (w > 0 && w + add > usable) {
        rows++;
        w = spineWidth(b);
      } else {
        w += add;
      }
    }
    return rows;
  })();
  if (rowsNeeded <= 1) return [books];

  const totalW = books.reduce((s, b) => s + spineWidth(b), 0);
  // Target row width counts the gaps too, so the last row isn't left starved.
  const totalContent = totalW + Math.max(0, books.length - rowsNeeded) * GAP;
  const target = Math.min(usable, totalContent / rowsNeeded);
  const shelves: ShelfBook[][] = [];
  let cur: ShelfBook[] = [];
  let w = 0;
  books.forEach((b) => {
    const add = (cur.length ? GAP : 0) + spineWidth(b);
    const overflow = cur.length > 0 && w + add > usable;
    // Break for balance once this row has met its share; the final row (once
    // rowsNeeded-1 are placed) simply collects the rest, never overflowing.
    const balanced = cur.length > 0 && w >= target && shelves.length < rowsNeeded - 1;
    if (overflow || balanced) {
      shelves.push(cur);
      cur = [b];
      w = spineWidth(b);
    } else {
      cur.push(b);
      w += add;
    }
  });
  if (cur.length) shelves.push(cur);
  return shelves;
}

export default function Dollhouse({ books }: { books: ShelfBook[] }) {
  const [room, setRoom] = useState<RoomId>('living');
  const [line, setLine] = useState<string>(ROOMS.living.line);
  const [view, setView] = useState<'inside' | 'outside'>('inside');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [swanOpen, setSwanOpen] = useState(false);

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
          setLibraryOpen(false);
          setSwanOpen(false);
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
  }, [room, view, libraryOpen, swanOpen, goTo, interact]);

  const shelves = packShelves(books, Math.max(160, shelfW - 2 * ROW_PAD));
  // Stable palette index for the fallback leather colours (order-preserving).
  const colorIndex = new Map(books.map((b, i) => [b.id, i] as const));

  return (
    <div className={ws.houseScroll}>
      <div className={`${ws.osWindow} ${ws.houseWindow}`}>
        <div className={ws.osTitleBar}>
          <span>dollhouse.exe</span>
          <span className={ws.osButtons} aria-hidden="true">─ □ ✕</span>
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
                className={ws.houseImg}
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
                className={ws.houseImg}
              />
            </button>
          </div>
        )}

        <div className={ws.hud}>
          <p className={ws.statusLine} role="status">
            {view === 'inside' ? line : '☖ home, seen from the yard'}
          </p>
          <p className={ws.hudHint}>
            {view === 'inside'
              ? '← ↑ → ↓ wander · the view follows you · enter interact'
              : 'enter or click to come back inside'}
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
          <div className={`${ws.osWindow} ${ws.libraryWindow}`}>
            <div className={ws.osTitleBar}>
              <span>library.sys — {books.length} volumes, newest first</span>
              <button type="button" className={ws.osClose} onClick={() => setLibraryOpen(false)} aria-label="Close library">
                ✕
              </button>
            </div>
            <div className={ws.libraryBody}>
              <div className={ws.shelfUnit} ref={shelfRef}>
                {shelves.map((shelf, r) => (
                  <div key={r} className={ws.shelfTier}>
                    <div className={ws.shelfRow}>
                      {shelf.map((book) => {
                        const i = colorIndex.get(book.id) ?? 0;
                        const pattern = book.pattern === 1 ? ws.stripes : book.pattern === 2 ? ws.dots : '';
                        const art = artFor(book);
                        const bg = art?.bg ?? book.color;
                        const fg = art?.fg ?? book.textColor;
                        return (
                          <a
                            key={book.id}
                            href={book.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${ws.spine} ${ws[`c${i % 6}`]} ${art ? '' : pattern}`}
                            style={{
                              height: book.height,
                              width: spineWidth(book),
                              ...(bg ? { backgroundColor: bg, color: fg } : {}),
                            }}
                            title={`${book.title} · ${book.author}`}
                            aria-label={`${book.title} by ${book.author}`}
                          >
                            {art ? (
                              <PixelGlyph art={art} />
                            ) : (
                              <>
                                <span className={ws.spineTitle}>{book.spine}</span>
                                <span className={ws.spineFoot} aria-hidden="true">
                                  {book.author.split(/\s+/).map((w) => w[0]).filter(Boolean).join('').slice(0, 3).toUpperCase()}
                                </span>
                              </>
                            )}
                          </a>
                        );
                      })}
                    </div>
                    <div className={ws.plank} />
                  </div>
                ))}
              </div>
              <p className={ws.caption}>esc to close · titles link to goodreads</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
