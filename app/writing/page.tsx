import type { Metadata } from 'next';
import sharp from 'sharp';
import styles from '../page.module.css';
import Dollhouse, { type ShelfBook } from './Dollhouse';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Essays and writing by Cristiana Murgoci, and a selected reading list.',
};

export const revalidate = 86400;

const GOODREADS_USER_ID = '172663153';

// Curated on Goodreads: shelve a book onto "website" to show it here.
const GOODREADS_SHELF = 'website';

type Book = {
  id: string;
  title: string;
  author: string;
  cover: string;
  pages: number | null;
};

function field(block: string, tag: string): string {
  const m = block.match(
    new RegExp(`<${tag}>(?:\\s*<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>\\s*)?</${tag}>`)
  );
  return m ? m[1].trim() : '';
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchShelf(): Promise<Book[]> {
  const books: Book[] = [];
  try {
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(
        `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}?shelf=${GOODREADS_SHELF}&page=${page}`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) break;
      const xml = await res.text();
      const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));
      for (const [, block] of items) {
        const title = decodeEntities(field(block, 'title'));
        if (!title) continue;
        books.push({
          id: field(block, 'book_id'),
          title,
          author: decodeEntities(field(block, 'author_name')).replace(/\s+/g, ' '),
          cover: field(block, 'book_image_url'),
          pages: parseInt(field(block, 'num_pages'), 10) || null,
        });
      }
      if (items.length < 100) break;
    }
  } catch {
    // Goodreads unreachable: render the page without the library
  }
  return books;
}

// Deterministic per-book geometry so the shelf is stable across renders
function hashId(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return h;
}

// Dominant color of the real cover, posterized to keep the 8-bit feel.
// Falls back to null (spine keeps its leather palette class) on any failure.
async function coverColor(url: string): Promise<{ color: string; textColor: string } | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const { data, info } = await sharp(buf)
      .resize(20, 20, { fit: 'inside' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const bins = Array.from({ length: 12 }, () => ({ n: 0, r: 0, g: 0, b: 0 }));
    let ar = 0, ag = 0, ab = 0, an = 0;
    for (let i = 0; i + 2 < data.length; i += info.channels) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      ar += r; ag += g; ab += b; an++;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const l = (max + min) / 510;
      const s = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
      if (s < 0.25 || l < 0.12 || l > 0.88) continue;
      const d = max - min;
      let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
      const bin = bins[Math.floor(h / 30) % 12];
      bin.n++; bin.r += r; bin.g += g; bin.b += b;
    }

    const best = bins.reduce((a, c) => (c.n > a.n ? c : a), bins[0]);
    let r: number, g: number, b: number;
    if (best.n >= 8) {
      r = best.r / best.n; g = best.g / best.n; b = best.b / best.n;
    } else if (an > 0) {
      r = ar / an; g = ag / an; b = ab / an;
    } else {
      return null;
    }

    const post = (v: number) => Math.min(240, Math.round(v / 16) * 16);
    r = post(r); g = post(g); b = post(b);
    let lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    if (lum > 0.82) {
      r = Math.round(r * 0.8); g = Math.round(g * 0.8); b = Math.round(b * 0.8);
      lum *= 0.8;
    }
    const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
    return { color: hex, textColor: lum > 0.55 ? '#1A1816' : '#F7F3EC' };
  } catch {
    return null;
  }
}

export default async function WritingPage() {
  // Ordered by a salted hash of the book id: stable across builds, but says
  // nothing about when anything was read.
  const sorted = (await fetchShelf()).sort(
    (a, b) => hashId('s' + a.id) - hashId('s' + b.id) || a.id.localeCompare(b.id)
  );

  const shelfBooks: ShelfBook[] = await Promise.all(
    sorted.map(async (b) => {
      const h = hashId(b.id);
      const cc = b.cover ? await coverColor(b.cover) : null;
      return {
        id: b.id,
        title: b.title,
        // Short title only: cut at any subtitle separator (colon, spaced dash, paren)
        spine: b.title.split(/[:(]|\s[-–—]\s/)[0].trim(),
        author: b.author,
        height: 132 + (h % 8) * 8,
        // Spine thickness from the real page count, hashed fallback when absent
        width: b.pages
          ? Math.max(26, Math.min(58, Math.round(22 + b.pages / 14)))
          : 34 + ((h >> 3) % 3) * 5,
        pattern: h % 3,
        color: cc?.color,
        textColor: cc?.textColor,
      };
    })
  );

  return (
    <div className={styles.content}>
      <section className={styles.section}>
        <div className={styles.prose} style={{ marginTop: '8px' }}>
          <p style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>
            Essays and writing coming soon. In the meantime, come in, wander around,
            and visit the library to see what I&apos;ve been reading.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>The House</span>
          <div className={styles.sectionRule} />
        </div>
        <Dollhouse books={shelfBooks} />
      </section>

      <footer className={styles.footer}>
        <p>Cristiana Murgoci · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
