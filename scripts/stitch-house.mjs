// Rebuilds public/house/cutaway.png: grafts the exterior render's rooftop
// (design/references/12) onto the cutaway body (design/references/10),
// removing the illustration's floating top floor, then erases the garbled
// AI-baked room labels by cloning nearby wall texture over them.
// Run: node scripts/stitch-house.mjs
import sharp from 'sharp';

const Y1 = 20; // exterior: top of weathervane
const Y2 = 372; // exterior: bottom of the eave line
const CUT = 300; // cutaway: top of the second floor (everything above is discarded)

const band = await sharp('design/references/12-vision-exterior.png')
  .extract({ left: 0, top: Y1, width: 1370, height: Y2 - Y1 })
  .resize({ width: 1083 })
  .png()
  .toBuffer();
const R = (await sharp(band).metadata()).height;

const bottom = await sharp('design/references/10-vision-cutaway.png')
  .extract({ left: 0, top: CUT, width: 1083, height: 927 - CUT })
  .png()
  .toBuffer();

const base = await sharp({
  create: { width: 1083, height: R + 927 - CUT, channels: 3, background: { r: 132, g: 199, b: 242 } },
})
  .composite([
    { input: band, top: 0, left: 0 },
    { input: bottom, top: R, left: 0 },
  ])
  .png()
  .toBuffer();

// Baked-label patches (coords in the stitched image).
// clone: copy a same-size region from src onto dst.
const clones = [
  // botanical research: plain green paneling from the right, same band
  { src: { left: 608, top: 290, width: 130, height: 22 }, dst: { left: 478, top: 290 } },
  // collectors' study, living & study, study, library.sys: extend the
  // pixels from directly above downward (vertical structures continue)
  { src: { left: 10, top: 433, width: 124, height: 19 }, dst: { left: 10, top: 452 } },
  { src: { left: 12, top: 635, width: 104, height: 20 }, dst: { left: 12, top: 655 } },
  { src: { left: 553, top: 635, width: 48, height: 20 }, dst: { left: 553, top: 655 } },
  { src: { left: 10, top: 863, width: 83, height: 20 }, dst: { left: 10, top: 883 } },
];

const patches = await Promise.all(
  clones.map(async (c) => ({
    input: await sharp(base).extract(c.src).png().toBuffer(),
    left: c.dst.left,
    top: c.dst.top,
  }))
);

// geography label: tile a strip of clean cream wall across its rectangle
const creamStrip = await sharp(base)
  .extract({ left: 955, top: 288, width: 64, height: 23 })
  .png()
  .toBuffer();
const creamTile = await sharp({ create: { width: 206, height: 23, channels: 3, background: '#E8DBC0' } })
  .composite([0, 64, 128, 192].map((x) => ({ input: creamStrip, left: x, top: 0 })))
  .png()
  .toBuffer();
patches.push({ input: creamTile, left: 750, top: 288 });

await sharp(base)
  .composite(patches)
  .png({ palette: true, colors: 224, compressionLevel: 9 })
  .toFile('public/house/cutaway.png');

console.log(`public/house/cutaway.png rebuilt: 1083 x ${R + 927 - CUT}, labels erased`);
