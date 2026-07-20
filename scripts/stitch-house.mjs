// Rebuilds public/house/cutaway.png.
//
// Pipeline:
//  1. Take the cutaway body (ref 10, below the floating top floor) and erase
//     the garbled AI-baked room labels by cloning nearby wall texture.
//  2. Mirror-extend the body into symmetric left/right wings (Georgian houses
//     are symmetric; mirroring keeps every floor's color band and divider
//     aligned at the seam) so the building is wide enough to match the roof's
//     window count.
//  3. Overlay grey-brick quoin columns at the building's outer corners.
//  4. Scale the exterior render's rooftop (ref 12) up so its eaves span the
//     widened building, and float everything on sky so the edges show sky.
//
// Prints the constants Dollhouse.tsx needs. Run: node scripts/stitch-house.mjs
import sharp from 'sharp';

// --- source geometry -------------------------------------------------------
const CUT = 300; // cutaway: top of the second floor (above is the floating room)
const BODY_W = 1083;
const BODY_H = 927 - CUT; // 627
const SRC_W = 1370; // exterior render width
const Y1 = 20; // exterior: top of weathervane
const Y2 = 372; // exterior: bottom of the eave line
const EAVE_ROW = 366; // row inside the widest eave course, to measure extent

// --- composition knobs -----------------------------------------------------
const WING = 360; // width of each mirrored wing
const BRICKW = 22; // dark red-brick side-wall column width
// The exterior's eaves (1278px) overhang its walls (1243px); keep that ratio so
// the roof is wider than the walls rather than flush with them.
const OVERHANG_RATIO = 1278 / 1243;
const SKY = 100; // sky margin beyond each building corner

// --- 1. clean body (erase baked labels) ------------------------------------
const rawBody = await sharp('design/references/10-vision-cutaway.png')
  .extract({ left: 0, top: CUT, width: BODY_W, height: BODY_H })
  .png()
  .toBuffer();

const labelClones = [
  { src: { left: 608, top: 12, width: 130, height: 22 }, dst: { left: 478, top: 12 } },
  { src: { left: 10, top: 155, width: 124, height: 19 }, dst: { left: 10, top: 174 } },
  { src: { left: 12, top: 357, width: 104, height: 20 }, dst: { left: 12, top: 377 } },
  { src: { left: 553, top: 357, width: 48, height: 20 }, dst: { left: 553, top: 377 } },
  { src: { left: 10, top: 585, width: 83, height: 20 }, dst: { left: 10, top: 605 } },
];
const labelPatches = await Promise.all(
  labelClones.map(async (c) => ({
    input: await sharp(rawBody).extract(c.src).png().toBuffer(),
    left: c.dst.left,
    top: c.dst.top,
  }))
);
const creamStrip = await sharp(rawBody).extract({ left: 955, top: 10, width: 64, height: 23 }).png().toBuffer();
const creamTile = await sharp({ create: { width: 206, height: 23, channels: 3, background: '#E8DBC0' } })
  .composite([0, 64, 128, 192].map((x) => ({ input: creamStrip, left: x, top: 0 })))
  .png()
  .toBuffer();
labelPatches.push({ input: creamTile, left: 750, top: 10 });

const body = await sharp(rawBody).composite(labelPatches).png().toBuffer();

// --- 2. mirror wings -------------------------------------------------------
const flipped = await sharp(body).flop().png().toBuffer();
const leftWing = await sharp(flipped)
  .extract({ left: BODY_W - WING, top: 0, width: WING, height: BODY_H })
  .png()
  .toBuffer();
const rightWing = await sharp(flipped)
  .extract({ left: 0, top: 0, width: WING, height: BODY_H })
  .png()
  .toBuffer();

const buildW = WING + BODY_W + WING; // 1803
const bodyWide = await sharp({ create: { width: buildW, height: BODY_H, channels: 3, background: '#3a2a20' } })
  .composite([
    { input: leftWing, left: 0, top: 0 },
    { input: body, left: WING, top: 0 },
    { input: rightWing, left: WING + BODY_W, top: 0 },
  ])
  .png()
  .toBuffer();

// --- 3. dark red-brick side wall (matches the exterior's brick) ------------
// Running-bond brick in the exterior's brick reds, with a thin shadowed edge
// so it reads as the building's side wall (the roof will overhang it).
const brickReds = ['#8F4736', '#7C3B2C', '#984E3B', '#6F3325', '#87422F'];
const brickMortar = '#4A2A22';
const bh = 12; // brick course height
const bw = 11; // brick unit width
let bricks = '';
for (let r = 0, y = 0; y < BODY_H; r++, y += bh) {
  const off = r % 2 ? -Math.floor(bw / 2) : 0; // running-bond half-offset
  for (let x = off; x < BRICKW; x += bw) {
    const fill = brickReds[(r * 2 + Math.floor((x + 44) / bw)) % brickReds.length];
    bricks += `<rect x="${x + 1}" y="${y + 1}" width="${bw - 1}" height="${bh - 1}" fill="${fill}"/>`;
  }
}
const brickSvg =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${BRICKW}" height="${BODY_H}">` +
  `<rect width="${BRICKW}" height="${BODY_H}" fill="${brickMortar}"/>${bricks}</svg>`;
const brickL = await sharp(Buffer.from(brickSvg)).png().toBuffer();
const brickR = await sharp(brickL).flop().png().toBuffer();

// --- 4. scale roof to span the building, float on sky ----------------------
const row = await sharp('design/references/12-vision-exterior.png')
  .extract({ left: 0, top: EAVE_ROW, width: SRC_W, height: 1 })
  .raw()
  .toBuffer({ resolveWithObject: true });
const px = (x) => {
  const i = x * row.info.channels;
  return { r: row.data[i], g: row.data[i + 1], b: row.data[i + 2] };
};
const isSky = ({ r, b }) => (b > 230 && r > 235) || (b > 200 && b - r > 60);
let x0 = 0;
while (x0 < SRC_W && isSky(px(x0))) x0++;
let x1 = SRC_W - 1;
while (x1 > 0 && isSky(px(x1))) x1--;
const extent = x1 - x0 + 1;
// Vertical scale matches the walls (keeps roofH/H stable so room coords hold);
// horizontal is stretched by the overhang ratio so the eaves are wider than the
// walls and the roof overhangs them.
const roofScaleV = buildW / extent;
const roofScaleH = roofScaleV * OVERHANG_RATIO;

const scaledBandW = Math.round(SRC_W * roofScaleH);
const roofH = Math.round((Y2 - Y1) * roofScaleV);
const bandBuf = await sharp('design/references/12-vision-exterior.png')
  .extract({ left: 0, top: Y1, width: SRC_W, height: Y2 - Y1 })
  .resize({ width: scaledBandW, height: roofH, fit: 'fill' })
  .png()
  .toBuffer();
// centre the wider roof over the walls so it overhangs equally on both sides
const eaveSpanWide = Math.round(extent * roofScaleH);
const overhang = Math.round((eaveSpanWide - buildW) / 2);
const eaveLeftScaled = Math.round(x0 * roofScaleH);
const bandX = SKY - overhang - eaveLeftScaled;

// Patch the stray sky pixels the mirror leaves at the top of each wing seam
// (x = WING and x = WING+BODY_W in bodyWide coords) by cloning wall from below.
const seamPatches = [];
for (const seamX of [WING, WING + BODY_W]) {
  const patch = await sharp(bodyWide)
    .extract({ left: seamX - 10, top: 14, width: 20, height: 12 })
    .png()
    .toBuffer();
  seamPatches.push({ input: patch, left: seamX - 10, top: 0 });
}
const bodyClean = await sharp(bodyWide).composite(seamPatches).png().toBuffer();

const imgW = SKY + buildW + SKY;
const imgH = roofH + BODY_H;

// Cohesive sky: instead of a flat fill (which seams against the render's own
// dithered sky), extend the roof band's sky outward to every canvas edge by
// replicating its edge pixels. The center bottom streaks the roof line down,
// but the building is composited over it; only the side sky strips remain.
const base = await sharp(bandBuf)
  .extend({
    top: 0,
    left: bandX,
    right: imgW - bandX - scaledBandW,
    bottom: imgH - roofH,
    extendWith: 'copy',
  })
  .png()
  .toBuffer();

// Below the eave, the roof overhang leaves a gap beside each wall that the
// bottom-extend streaks with roof grey; fill it with sky from just outside it.
const gapH = imgH - roofH;
const skyColL = await sharp(base)
  .extract({ left: SKY - overhang - 4, top: roofH, width: 1, height: gapH })
  .resize({ width: overhang + 2, height: gapH, fit: 'fill' })
  .png()
  .toBuffer();
const skyColR = await sharp(base)
  .extract({ left: SKY + buildW + overhang + 3, top: roofH, width: 1, height: gapH })
  .resize({ width: overhang + 2, height: gapH, fit: 'fill' })
  .png()
  .toBuffer();

await sharp(base)
  .composite([
    { input: skyColL, left: SKY - overhang - 1, top: roofH },
    { input: skyColR, left: SKY + buildW - 1, top: roofH },
    { input: bodyClean, left: SKY, top: roofH },
    { input: brickL, left: SKY, top: roofH },
    { input: brickR, left: SKY + buildW - BRICKW, top: roofH },
  ])
  .png({ palette: true, colors: 240, compressionLevel: 9 })
  .toFile('public/house/cutaway.png');

console.log(`roof extent ${extent}px, overhang ${overhang}px/side, roofScaleV ${roofScaleV.toFixed(3)}`);
console.log(`public/house/cutaway.png: ${imgW} x ${imgH}`);
console.log(
  `Dollhouse constants -> W:${imgW} H:${imgH} ROOF:${roofH} ` +
    `SKY:${SKY} BUILD_L:${SKY} BUILD_W:${buildW} WING:${WING} BODY_W:${BODY_W}`
);
