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

type RoomId = 'attic' | 'living' | 'kitchen' | 'bath' | 'library';

const ADJ: Record<RoomId, Partial<Record<'left' | 'right' | 'up' | 'down', RoomId>>> = {
  attic: { down: 'living' },
  living: { right: 'kitchen', up: 'attic', down: 'bath' },
  kitchen: { left: 'living', up: 'attic', down: 'library' },
  bath: { right: 'library', up: 'living' },
  library: { left: 'bath', up: 'kitchen' },
};

const POS: Record<RoomId, { x: number; y: number }> = {
  attic: { x: 372, y: 118 },
  living: { x: 210, y: 296 },
  kitchen: { x: 380, y: 296 },
  bath: { x: 116, y: 474 },
  library: { x: 330, y: 474 },
};

const LINES: Record<RoomId, string> = {
  attic: '✦ snow settles on the dormer glass',
  living: '❦ the hearth crackles; the deck glows amber',
  kitchen: '§ the kettle sings over the stove',
  bath: '❧ the swan window catches the last light',
  library: '▸ press enter to open library.sys',
};

const BOOKS_PER_SHELF = 12;

export default function Dollhouse({ books }: { books: ShelfBook[] }) {
  const [room, setRoom] = useState<RoomId>('living');
  const [line, setLine] = useState<string>(LINES.living);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const goTo = useCallback((r: RoomId) => {
    setRoom(r);
    setLine(LINES[r]);
  }, []);

  const interact = useCallback(() => {
    if (room === 'library') setLibraryOpen(true);
    else setLine(LINES[room]);
  }, [room]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (libraryOpen) {
        if (e.key === 'Escape') setLibraryOpen(false);
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
  }, [room, libraryOpen, goTo, interact]);

  const shelves: ShelfBook[][] = [];
  for (let i = 0; i < books.length; i += BOOKS_PER_SHELF) {
    shelves.push(books.slice(i, i + BOOKS_PER_SHELF));
  }

  const roomButton = (id: RoomId, className: string, label: string, children: React.ReactNode) => (
    <button
      type="button"
      className={`${ws.room} ${className} ${room === id ? ws.roomActive : ''}`}
      aria-label={id === 'library' ? 'Walk to the library and open the bookshelf' : `Walk to the ${label}`}
      onClick={() => {
        if (room === id) interact();
        else goTo(id);
      }}
    >
      {children}
      <span className={ws.roomTag}>{label}</span>
    </button>
  );

  return (
    <div className={ws.houseScroll}>
      <div className={ws.osWindow}>
        <div className={ws.osTitleBar}>
          <span>casa_cristiana.exe</span>
          <span className={ws.osButtons} aria-hidden="true">─ □ ✕</span>
        </div>

        <div className={ws.houseStage}>
          <span className={ws.gable} aria-hidden="true" />
          <span className={ws.tower} aria-hidden="true">
            <i className={ws.vane} />
            <i className={ws.dome} />
            <i className={ws.belfry} />
          </span>
          <div className={ws.roof} aria-hidden="true">
            <i className={ws.dormer} />
            <i className={ws.dormer} />
            <i className={ws.dormer} />
            <i className={ws.dormer} />
          </div>

          <div className={ws.house}>
            {/* Attic */}
            <div className={ws.floorRow} style={{ height: 140 }}>
              {roomButton('attic', ws.roomAttic, 'attic',
                <>
                  <span className={`${ws.fur} ${ws.bunk}`} aria-hidden="true" />
                  <span className={`${ws.fur} ${ws.garland}`} aria-hidden="true">✦ ✦ ✦</span>
                  <span className={`${ws.fur} ${ws.pendant}`} aria-hidden="true" />
                  <span className={`${ws.fur} ${ws.rugAttic}`} aria-hidden="true" />
                  <span className={`${ws.fur} ${ws.blueSofa}`} aria-hidden="true" />
                </>
              )}
            </div>
            <div className={ws.housePlank} aria-hidden="true" />

            {/* Middle floor */}
            <div className={ws.floorRow} style={{ height: 168 }}>
              {roomButton('living', ws.roomLiving, 'living',
                <>
                  <span className={`${ws.fur} ${ws.portrait}`} aria-hidden="true" />
                  <span className={`${ws.fur} ${ws.fireplace}`} aria-hidden="true"><i className={ws.flame}>♥</i></span>
                  <span className={`${ws.fur} ${ws.rugLiving}`} aria-hidden="true" />
                  <span className={`${ws.fur} ${ws.sofa}`} aria-hidden="true" />
                  <span className={`${ws.fur} ${ws.crt}`} aria-hidden="true"><i className={ws.cursor} /></span>
                </>
              )}
              {roomButton('kitchen', ws.roomKitchen, 'kitchen',
                <>
                  <span className={`${ws.fur} ${ws.fridge}`} aria-hidden="true" />
                  <span className={`${ws.fur} ${ws.stove}`} aria-hidden="true" />
                  <span className={`${ws.fur} ${ws.kettle}`} aria-hidden="true"><i className={ws.steam} /></span>
                  <span className={`${ws.fur} ${ws.hood}`} aria-hidden="true" />
                </>
              )}
            </div>
            <div className={ws.housePlank} aria-hidden="true" />

            {/* Ground floor */}
            <div className={ws.floorRow} style={{ height: 168 }}>
              {roomButton('bath', ws.roomBath, 'study',
                <>
                  <span className={`${ws.fur} ${ws.lightPool}`} aria-hidden="true" />
                  <span className={`${ws.fur} ${ws.swanWindow}`} aria-hidden="true" />
                  <span className={`${ws.fur} ${ws.desk}`} aria-hidden="true" />
                </>
              )}
              {roomButton('library', ws.roomLibrary, 'library',
                <>
                  <span className={`${ws.fur} ${ws.vaultArc}`} aria-hidden="true" />
                  <span className={`${ws.fur} ${ws.chandelier}`} aria-hidden="true" />
                  <span className={`${ws.fur} ${ws.miniCase}`} aria-hidden="true">
                    <i /><i /><i /><i /><i /><i /><i />
                  </span>
                  <span className={`${ws.fur} ${ws.curtWindow}`} aria-hidden="true" />
                  <span className={`${ws.fur} ${ws.longTable}`} aria-hidden="true" />
                  <span className={`${ws.fur} ${ws.tableLamp} ${ws.tl1}`} aria-hidden="true" />
                  <span className={`${ws.fur} ${ws.tableLamp} ${ws.tl2}`} aria-hidden="true" />
                </>
              )}
            </div>
            <div className={ws.housePlank} aria-hidden="true" />

            {/* The pixie */}
            <span
              className={ws.pixieGirl}
              style={{ left: POS[room].x, top: POS[room].y }}
              aria-hidden="true"
            />
          </div>

          <div className={ws.snowGround} aria-hidden="true" />
          <div className={ws.bramble} aria-hidden="true" />

          <p className={ws.statusLine} role="status">{line}</p>
          <p className={ws.hudHint}>← ↑ → ↓ wander · enter interact · or click a room</p>
        </div>
      </div>

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
