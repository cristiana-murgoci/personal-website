// Derives the night versions of the house from the day images:
//   public/house/cutaway.png   -> cutaway-night.png
//   public/house/exterior.png  -> exterior-night.png
// Night sky (navy gradient + stars), darkened roof/exterior, interior rooms
// kept lit, and a scatter of windows glowing amber. Run: node scripts/night-house.mjs
import sharp from 'sharp';

// cutaway geometry (must match scripts/stitch-house.mjs output)
const SKY = 100;
const BUILD_W = 1803;
const BRICKW = 22;
const ROOF = 497;

const NAVY_TOP = [10, 14, 34];
const NAVY_HORIZON = [30, 39, 70];

const hash = (x, y) => (((x * 73856093) ^ (y * 19349663)) >>> 0) % 100000;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);

function isSky(r, g, b) {
  return b >= 185 && b - r > 15 && g >= 155;
}

// Night sky colour for a pixel, with a faint dither and occasional star.
function nightSky(x, y, skyBottom) {
  const t = clamp01(y / skyBottom);
  const h = hash(x, y);
  if (t < 0.62 && h % 100000 < 340) {
    // star: mostly cool white, a few warm
    return h % 7 === 0 ? [245, 240, 208] : [224, 230, 245];
  }
  const j = (h % 7) - 3; // -3..3 dither
  return [
    Math.round(lerp(NAVY_TOP[0], NAVY_HORIZON[0], t) + j),
    Math.round(lerp(NAVY_TOP[1], NAVY_HORIZON[1], t) + j),
    Math.round(lerp(NAVY_TOP[2], NAVY_HORIZON[2], t) + j),
  ];
}

function darken(r, g, b, f) {
  // multiply down and cool-shift a touch toward night blue
  return [Math.round(r * f), Math.round(g * f), Math.round(b * f * 1.08 + 6)];
}

// --- cutaway: region-aware so the interior rooms stay lit -------------------
{
  const src = 'public/house/cutaway.png';
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: ch } = info;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * ch;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const inInterior = x >= SKY && x < SKY + BUILD_W && y >= ROOF;
      if (!inInterior) {
        if (isSky(r, g, b)) {
          const [nr, ng, nb] = nightSky(x, y, ROOF);
          data[i] = nr; data[i + 1] = ng; data[i + 2] = nb;
        } else {
          const [nr, ng, nb] = darken(r, g, b, 0.5); // roof / trim at night
          data[i] = nr; data[i + 1] = ng; data[i + 2] = nb;
        }
      } else {
        const inBrick = x < SKY + BRICKW || x >= SKY + BUILD_W - BRICKW;
        if (inBrick) {
          const [nr, ng, nb] = darken(r, g, b, 0.6); // exterior side wall
          data[i] = nr; data[i + 1] = ng; data[i + 2] = nb;
        }
        // else: interior room — leave lit
      }
    }
  }
  await sharp(data, { raw: { width: W, height: H, channels: ch } })
    .png({ palette: true, colors: 240, compressionLevel: 9 })
    .toFile('public/house/cutaway-night.png');
  console.log(`cutaway-night.png: ${W} x ${H}`);
}

// --- exterior: night sky + darkened facade + amber-lit windows -------------
{
  const src = 'public/house/exterior.png';
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: ch } = info;
  const skyBottom = Math.round(H * 0.5);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * ch;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (isSky(r, g, b)) {
        const [nr, ng, nb] = nightSky(x, y, skyBottom);
        data[i] = nr; data[i + 1] = ng; data[i + 2] = nb;
        continue;
      }
      // window glass reads dark and slightly blue; light a scattered subset
      const isGlass = r + g + b < 230 && b >= r - 8;
      if (isGlass) {
        const cell = hash(Math.floor(x / 44), Math.floor(y / 60));
        if (cell % 100 < 42) {
          const v = (hash(x, y) % 22) - 11;
          data[i] = 244 + Math.min(0, v);
          data[i + 1] = 196 + v;
          data[i + 2] = 120 + v;
          continue;
        }
      }
      const [nr, ng, nb] = darken(r, g, b, 0.46);
      data[i] = nr; data[i + 1] = ng; data[i + 2] = nb;
    }
  }
  await sharp(data, { raw: { width: W, height: H, channels: ch } })
    .png({ palette: true, colors: 240, compressionLevel: 9 })
    .toFile('public/house/exterior-night.png');
  console.log(`exterior-night.png: ${W} x ${H}`);
}
