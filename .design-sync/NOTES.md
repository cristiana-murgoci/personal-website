# design-sync notes

- This repo is a personal Next.js site, not a component library: no lockfile, no
  library build (`next build` builds the app). The converter runs in synth-entry
  mode from `app/`, with `componentSrcMap` pinning `Dollhouse` and excluding the
  site-chrome components (out of scope per the user, 2026-07-19).
- Scope (user decision, 2026-07-19): pixel dollhouse only, plus tokens and fonts.
  Site chrome and motion primitives deliberately excluded.
- Fonts come from `next/font/google` at runtime; the repo ships no font files.
  `.design-sync/site.css` (wired via `cssEntry`) imports Space Mono, Inter, and
  Cormorant Garamond from Google and defines the `--font-*` variables the CSS
  expects. Expect `[FONT_REMOTE]` (informational) on validate.
- `Dollhouse` requires a `books: ShelfBook[]` prop; the authored preview feeds it
  sample book data. Its dialog (`library.sys`) opens on interaction only, so the
  static preview shows the closed house; the bookshelf state can't be captured
  statically.
- Another session's dev server may hold port 3000 in this folder;
  `.claude/launch.json` has `autoPort: true` to cope.
- Without `--entry`/`cfg.entry` the converter looks for
  `node_modules/cristiana-murgoci` and crashes; `cfg.entry` points at
  `.design-sync/entry.ts`, a named-export wrapper over the Dollhouse. That file
  also `import`s `app/globals.css` so the site tokens ship inside
  `_ds_bundle.css` — `tokensGlob` alone is a no-op unless `tokensPkg` is set.
- `DollhouseProps` is an inline type the extractor can't see; the real `books`
  contract is hand-written in `cfg.dtsPropsFor.Dollhouse`.
- `cfg.overrides.Dollhouse`: `cardMode single`, viewport 760x960 (the house is
  ~700px wide and ~940px tall with HUD; 860 clipped the hint line).
- Playwright chromium-headless-shell v1228 cached at
  `~/Library/Caches/ms-playwright` (macOS path, not `~/.cache`).

## Known render warns

- `[FONT_REMOTE]` for Space Mono, Inter, Cormorant Garamond — expected; fonts
  are Google-served by design (see the fonts bullet above).

## Re-sync risks

- The preview's sample shelf and the `dtsPropsFor` body both restate the
  `ShelfBook` shape; if `app/writing/Dollhouse.tsx` changes that type, update
  both by hand.
- `conventions.md` names palette hexes (#4A2E1B etc.) as literals; if the
  dollhouse palette in `writing.module.css` shifts, re-validate the header.
- Fonts are fetched from Google at render time — previews and designs need
  network; nothing local will catch a font outage.
- The dollhouse's interactive states (library.sys dialog, room walks) are never
  captured statically; only the closed house is verified.
