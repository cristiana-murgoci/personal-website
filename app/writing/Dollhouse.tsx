'use client';

import { useCallback, useEffect, useState } from 'react';
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

type RoomId = 'collectors' | 'botanical' | 'kitchen' | 'living' | 'study' | 'library';

// All geometry is in percent of the cutaway image (1149 x 928):
// box = clickable hotspot, chip = label chip center (covers the baked-in text),
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
  collectors: {
    label: "collectors' study",
    line: '❦ curiosities, catalogued and adored',
    box: { l: 3.5, t: 32.4, w: 29.5, h: 21 },
    pos: { x: 17, y: 52.9 },
  },
  botanical: {
    label: 'botanical research',
    line: '§ the ferns are pressed; the globe still spins',
    box: { l: 33, t: 32.4, w: 34, h: 21 },
    pos: { x: 48, y: 52.9 },
  },
  kitchen: {
    label: 'geography & tea',
    line: '¶ tea first, geography after',
    box: { l: 67, t: 32.4, w: 30, h: 21 },
    pos: { x: 81, y: 52.9 },
  },
  living: {
    label: 'living & study',
    line: '❦ the hearth crackles by the chaise',
    box: { l: 3.5, t: 54.4, w: 46.5, h: 21.5 },
    pos: { x: 24, y: 75.4 },
  },
  study: {
    label: 'study',
    line: '❧ press enter to sit by the swan window',
    box: { l: 50, t: 54.4, w: 32, h: 21.5 },
    pos: { x: 63, y: 75.4 },
  },
  library: {
    label: 'library.sys',
    line: '▸ press enter to open library.sys',
    box: { l: 3.5, t: 76.4, w: 93, h: 22 },
    pos: { x: 48, y: 96.9 },
  },
};

const ADJ: Record<RoomId, Partial<Record<'left' | 'right' | 'up' | 'down', RoomId>>> = {
  collectors: { right: 'botanical', down: 'living' },
  botanical: { left: 'collectors', right: 'kitchen', down: 'study' },
  kitchen: { left: 'botanical', down: 'study' },
  living: { right: 'study', up: 'collectors', down: 'library' },
  study: { left: 'living', up: 'kitchen', down: 'library' },
  library: { up: 'living' },
};

const ROOM_IDS = Object.keys(ROOMS) as RoomId[];

const BOOKS_PER_SHELF = 12;

export default function Dollhouse({ books }: { books: ShelfBook[] }) {
  const [room, setRoom] = useState<RoomId>('living');
  const [line, setLine] = useState<string>(ROOMS.living.line);
  const [view, setView] = useState<'inside' | 'outside'>('inside');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [swanOpen, setSwanOpen] = useState(false);

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

  const shelves: ShelfBook[][] = [];
  for (let i = 0; i < books.length; i += BOOKS_PER_SHELF) {
    shelves.push(books.slice(i, i + BOOKS_PER_SHELF));
  }

  return (
    <div className={ws.houseScroll}>
      <div className={`${ws.osWindow} ${ws.houseWindow}`}>
        <div className={ws.osTitleBar}>
          <span>casa.exe</span>
          <span className={ws.osButtons} aria-hidden="true">─ □ ✕</span>
        </div>

        <div className={ws.stage}>
          {view === 'inside' ? (
            <>
              <img
                src="/house/cutaway.png"
                width={1083}
                height={905}
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
            </>
          ) : (
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
          )}
        </div>

        <div className={ws.hud}>
          <p className={ws.statusLine} role="status">
            {view === 'inside' ? line : '☖ home, seen from the yard'}
          </p>
          <p className={ws.hudHint}>
            {view === 'inside'
              ? '← ↑ → ↓ wander · enter interact · or click a room'
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
              <div className={ws.shelfUnit}>
                {shelves.map((shelf, r) => (
                  <div key={r} className={ws.shelfTier}>
                    <div className={ws.shelfRow}>
                      {shelf.map((book, j) => {
                        const i = r * BOOKS_PER_SHELF + j;
                        const pattern = book.pattern === 1 ? ws.stripes : book.pattern === 2 ? ws.dots : '';
                        return (
                          <a
                            key={book.id}
                            href={book.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${ws.spine} ${ws[`c${i % 6}`]} ${pattern}`}
                            style={{
                              height: book.height,
                              width: book.width,
                              ...(book.color
                                ? { backgroundColor: book.color, color: book.textColor }
                                : {}),
                            }}
                            title={`${book.title} · ${book.author}`}
                            aria-label={`${book.title} by ${book.author}`}
                          >
                            <span className={ws.spineTitle}>{book.spine}</span>
                            <span className={ws.spineFoot} aria-hidden="true">
                              {book.author.split(/\s+/).map((w) => w[0]).filter(Boolean).join('').slice(0, 3).toUpperCase()}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                    <div className={ws.plank} />
                  </div>
                ))}
                <p className={ws.caption}>esc to close · titles link to goodreads</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
