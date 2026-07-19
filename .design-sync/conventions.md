# Casa Cristiana conventions

This kit is one interactive centerpiece plus the site's design language. It is
Cristiana Murgoci's personal site: dark academia meets 90s pixel software,
warm, bookish, understated. No hustle words, no em dashes in copy, lowercase
status lines.

## Setup

No provider or wrapper is needed. `Dollhouse` is self-contained; it requires a
`books` array prop (pass `[]` for an empty library — see `DollhouseProps` for
the book shape). It listens for arrow keys, Enter, and Escape globally, so
mount at most one per page. It draws itself at a fixed ~700px width and
scrolls horizontally inside its own container on narrow screens.

## Styling idiom

Component CSS is hashed CSS modules — never reuse or guess class names. Style
your own layout glue with the site tokens (all defined in the styles closure):

- Surfaces: `var(--bg)` #F7F3EC, `var(--bg-subtle)`, borders `var(--border)`,
  `var(--border-light)`
- Text: `var(--text)` #1C1917, `var(--text-muted)`, `var(--text-faint)`
- Accents: `var(--accent)` (link blue, used sparingly), `var(--accent-warm)`
- Fonts: `var(--font-mono)` (Space Mono — headings, labels, anything UI),
  `var(--font-inter)` (body), `var(--font-cormorant)` (rare, editorial italic)

Label style used across the site: Space Mono, ~11px, uppercase, letterspaced
(`letter-spacing: 0.08em`), `var(--text-faint)`.

For pixel-art surfaces adjacent to the dollhouse, use its palette as literals:
leather #4A2E1B, vellum #EFE8D4, gold leaf #D4AF37, amber #F59E0B, oxblood
#7C2430, hunter #2B3E34. Pixel rules: hard edges, 2px ink borders (#1A1816),
hard-offset box shadows, `steps()` animation timing, no gradients that pretend
to be light.

## Where the truth lives

Read `styles.css` and its import: `_ds_bundle.css` holds the compiled site
globals (tokens, resets, link styles) plus the dollhouse's pixel CSS.
`components/writing/Dollhouse/Dollhouse.d.ts` is the API contract;
`Dollhouse.prompt.md` shows a working composition with sample book data.

## Idiomatic build snippet

```jsx
const { Dollhouse } = window.CasaCristiana;

<div style={{ background: 'var(--bg)', color: 'var(--text)', padding: '48px 24px' }}>
  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--text-faint)' }}>
    The House
  </p>
  <Dollhouse books={[{ id: '1', title: 'Sapiens', spine: 'Sapiens',
    author: 'Yuval Noah Harari', link: 'https://goodreads.com', height: 164,
    width: 48, pattern: 2, color: '#15803D', textColor: '#F7F3EC' }]} />
</div>
```
