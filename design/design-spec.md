# The House, a design spec

The Writing page of cristianamurgoci.com is a playable pixel dollhouse called
`casa_cristiana.exe`. This document is the design package for it: what the piece
is trying to convey, the rules every object follows, the state of each object,
and the detail backlog. Reference photos live in [references/](references/).

## What it conveys

The house is a self-portrait in miniature. It should feel like arriving at a
Harvard house on a winter evening: snow coming down, lit windows, and inside,
rooms that are warm, bookish, and a little enchanted. The visitor is invited to
wander, not to scroll. The reward for curiosity is the library, which holds the
books I have actually read, bound in their actual colors.

Three feelings, in priority order:

1. **Wonder.** The visitor should smile before they understand. Small
   animations, a patrolling sprite, a window that opens into a library.
2. **Warmth.** Candlelight, leather, wood, snow outside but never inside.
   Nothing neon, nothing sterile, nothing hustling.
3. **Craft.** Everything is drawn by hand in CSS, no image assets in the scene.
   The pixel grid is honest: hard edges, no gradients that pretend to be light,
   motion that steps instead of glides.

## Aesthetic pillars

- **90s cyberdeck bones.** The scene lives inside a fake OS window with a title
  bar (`casa_cristiana.exe`) and spawns a dialog (`library.sys`). Text is Space
  Mono, the same face as the site hero. Motion uses `steps()` timing so things
  hop like sprites. The one anachronism inside the period fiction: a brass
  terminal with an amber cursor, glowing in the sitting room.
- **Dark academia materials.** Leather (#4A2E1B), vellum (#EFE8D4), gold leaf
  (#D4AF37), oxblood, hunter green, brass. Interfaces mimic objects: the title
  bar is tooled leather, the shelf planks are mahogany, the close button is a
  parchment chip.
- **The real over the generic.** Rooms are pixel translations of my own photos
  (see references). The library holds my real Goodreads shelf, and each spine
  is colored by its real cover. When a detail can come from something true, it
  should.

## The world

**Exterior** (refs 06, plus the two pixel-art mood images): a red-brick Harvard
house at winter dusk. Banded sky from mauve through salmon to peach, hard stops,
no blending. Slate mansard roof band with a snow ridge and four snow-capped
dormers, two lit amber. Behind the tower, a stepped slate gable triangle with
snow caps on every step. On it, a white cupola with a cornice line and three
red-lit arched openings, a ribbed red stepped dome, and a weathervane carrying
a swallowtail banner, an arrow crossbar, and a gold ball at its base. A
snowbank under the house and a hedge of bare brambles in the foreground. The
snow is still; it sits on the roofline and never falls.

**Structure**: three floors in cutaway, like a dollhouse. Attic; living and
kitchen; study and library. Mahogany planks between floors, brick side walls.

## The rooms

| Room | Reference | Current objects | Planned detail |
|---|---|---|---|
| Attic | refs 08, 09 (mezzanine lounge) | bunk with vellum and burgundy bedding, gold star garland, blue sofa on red oriental rug, cream artichoke pendant with cord, three scalloped tiers, and a lit bulb | consider the spiral staircase from ref 09 |
| Living | refs 01, 02, 07 (paneling, sofas, portrait) | mahogany paneling with chair rail, stone hearth with amber flame, running-bond stone courses, and a wood mantel, burgundy sofa on gold-threaded rug, gold-framed portrait holding a tiny sitter in burgundy, brass terminal with amber cursor | none for now |
| Kitchen | none yet | hunter green tile wall, larder cabinet, dark stove with brass burners, brass hood, brass kettle on the right burner with a steam puff on a stepped loop | needs a reference photo |
| Study | ref 05 (swan stained glass) | teal paneling, arched amber stained-glass window with leaded grid and a pixel swan (beak, head, neck, wing, body, pond ripples), amber light pooling on the floor with pane stripes, writing desk | none for now |
| Library | refs 01, 02, 03 (reading room) | wrought-iron candle chandelier, mahogany bookcase with colored spines, long reading table with two cream lamps, dark window with yellow curtains, an arc near the ceiling hinting at the plaster vault (ref 01) | this room opens `library.sys` on Enter |

Unused references, kept on purpose: ref 04 (crystal chandelier lounge) is a
grander room than this cutaway has; candidate for a future floor or a special
state.

## The books (`library.sys`)

Current state:

- Source of truth is my Goodreads shelf named `website`. Shelving a book there
  adds it to the wall; no code edits. Fetched from the public RSS feed, revalidated daily.
- Order is newest read first, but no dates are shown anywhere. The year
  stickers were removed on purpose; the shelf should feel curated, not tracked.
- Each spine is colored by its real cover: the server fetches the cover
  thumbnail and extracts the dominant hue (histogram over saturated pixels,
  posterized to 16-value steps so it stays 8-bit). Title text flips between ink
  and vellum by spine luminance. If extraction fails, the spine falls back to a
  six-color leather palette that passed the full accessibility validation
  against the vellum surface (#92400E #1D4ED8 #15803D #86198F #9F1239 #B45309).
- Spine width and height vary deterministically per book (hashed id), so the
  shelf never reshuffles.
- Tooltips and screen-reader labels carry title and author only.

Detail backlog, in rough order of intent:

- [x] Spine thickness from real page count (`num_pages` is in the RSS feed)
- [x] Gold tooling: thin gilt rules top and bottom of each spine
- [x] A sliver of cream page block at the top edge of each book
- [x] Hover: tip forward off the shelf instead of popping upward
- [x] Author initials in tiny type at the spine foot

## The scholar

A pixel girl drawn entirely in box-shadow: dark brown hair, burgundy dress,
ink boots. She bobs in place on a two-step loop and hops between rooms with
stepped transitions. Arrow keys move her, clicking a room walks her there,
Enter interacts. She is the visitor's body in the scene; she should stay small,
readable, and a little cute, never detailed to the point of realism.

## Chrome and HUD

- Window title bar: leather with gold lettering, fake `─ □ ✕` controls.
- Status line: one lowercase sentence per room, led by an academic glyph
  (✦ ❦ § ¶ ▸ ❧). These are the game's voice; keep them wry and quiet.
- Hint line: `← ↑ → ↓ wander · enter interact · or click a room`.
- `library.sys` dialog: same chrome, parchment body, dark scrim, Esc closes.

## Motion rules

- All movement uses `steps()`. Nothing eases.
- Idle loops stay under 4px of travel (bob, flicker, twinkle).
- No falling snow. Snow is scenery, not weather.
- `prefers-reduced-motion` stills everything.

## Color tokens

| Role | Value |
|---|---|
| Vellum / paper | #EFE8D4, site bg #F7F3EC |
| Ink | #1A1816, site text #1C1917 |
| Leather | #4A2E1B |
| Mahogany plank | #5C4028 |
| Gold leaf | #D4AF37, brass #A8842C |
| Amber light | #F59E0B, lamp cream #EFE3C8 |
| Oxblood | #7C2430, rug crimson #8C3040 |
| Hunter | #2B3E34, kitchen wall #2B3E34, study teal #23504B |
| Dusk sky bands | #8E7C96 #A9848E #C98D85 #E39481 #EF9C7B #F5A886 |
| Roof slate | #5B6C88, snow #E8EEF3 |
| Brick | #8C3B2E |

## Copy voice

Site-wide rules apply inside the game: no em dashes, commas instead, lowercase
status lines, no hustle words. The game may be playful where the site is
restrained, but it is the same person speaking.

## Reference images

Drop the original photos into `design/references/` with these names. They are
listed here so the spec can point at them precisely.

| File | What it is | What to take from it |
|---|---|---|
| `01-library-vaulted.jpg` | Vaulted reading room, iron candle chandelier, burgundy sofas, long tables | chandelier silhouette, plaster vault, room mood |
| `02-mahogany-cases.jpg` | Floor-to-ceiling mahogany bookcases, framed portrait, red couches | paneling color, portrait placement, sofa shape |
| `03-reading-table.jpg` | Long table with cream lamps, yellow curtains, dark windows | lamp shade shape, curtain gold, window rhythm |
| `04-crystal-lounge.jpg` | Tiered crystal chandelier, arched windows at blue dusk | held in reserve, too grand for the current cutaway |
| `05-swan-window.jpg` | Teal room, arched amber stained glass with swan | the study's window, pane grid, light pooling |
| `06-house-exterior.jpg` | Red brick house, white portico, bare trees | brick tone, shutters, a possible front-door detail |
| `07-music-room.jpg` | Carved crest, paneled doors, grand piano, organ | paneling detail; a future music room candidate |
| `08-mezzanine-lounge.jpg` | Two-story library, artichoke pendant, blue sofa, red rug | attic corner furniture, pendant lamp |
| `09-spiral-stair.jpg` | Red spiral staircase, mezzanine, blue sofa | staircase candidate for connecting floors |

A note on these photos: if this repository is or becomes public, the photos
become public with it. People are visible in some of them. Crop or leave out
anything that should stay private.
