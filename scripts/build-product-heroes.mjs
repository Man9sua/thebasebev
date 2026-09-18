/**
 * Cut the product hero visuals out of the brand key visuals.
 *
 * The client supplied eleven finished banners, one per product: the name set
 * large and low-contrast, a line of copy, the "the BASE" watermark, and on the
 * right the pouch with the drink made from it, all on a wash of the product's
 * colour.
 *
 * The left two thirds cannot be used as they are — the page has to carry its
 * own `h1` and its own copy, and printing them over the banner's would be two
 * of everything. So this keeps the right third, which is the part that has no
 * text in it, and samples the banner's own background colour at the cut so the
 * page can continue that exact wash to the left of it. The crop then has no
 * visible left edge: it dissolves into the band the copy sits on.
 *
 * 1000px is where the watermark ends and the glass begins on every banner —
 * they are all one template at 1684x1190.
 *
 * Sources live in `assets/product-heroes/` as `<slug>.webp`; five products have
 * no banner yet and simply keep the pack shot the hero used before.
 *
 * Run: node scripts/build-product-heroes.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCES = path.resolve("assets/product-heroes");
const IMAGES = path.resolve("public/images");
const MANIFEST = path.resolve("src/data/product-heroes.json");

/**
 * Where the artwork stops and the product starts, on the shared 1684px
 * template. 860 rather than the 1000 this started at: at 1000 the cut passed
 * straight through the glass standing in front of the pouch, which was fine
 * while the picture filled a narrow right-hand column and the glass could look
 * like it was leaving the page. The hero now stands the picture in a column of
 * its own, where a glass sliced down the middle simply reads as a mistake, so
 * the cut moves left until the whole group is inside it. What it picks up in
 * exchange is more of the banner's own type, which the patches below erase.
 */
const CUT = 860;
/**
 * Where the wash is read, a little in from the cut so the sample is background
 * and not the fade at the very edge. Twice, not once: every banner's wash is a
 * vertical ramp, and on Jam it travels from #661a1f at the top to #8c3e44 at
 * the foot. One sample would match the picture at one height and show a seam at
 * every other, so the page continues the ramp rather than a colour.
 */
const SAMPLE = { left: 6, head: 60, foot: 60 };
/**
 * Where the banner text can reach past the cut, measured on the template. Two
 * regions, not one: the product name is set large and runs furthest right, and
 * the line of copy under it runs less far but sits lower — a single rectangle
 * covering both would reach into the pouch.
 */
/**
 * Above this much variation the region holds product, not just a stray letter.
 * The threshold is loose because the thing it has to tell apart from type is a
 * photograph, not a gradient: Tea's sachets read 55 here, while the busiest
 * wash-with-a-word-on-it — Jam's, which is a strong dark-red ramp — reads 46.
 */
const BUSY = 50;

const PATCHES = [
  { left: 0, top: 60, width: 470, height: 260 },
  { left: 0, top: 300, width: 360, height: 280 },
];

/** Opaque through the middle, gone at every edge, so the patch has no outline. */
function patchMask({ width, height }) {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="x" x1="0" x2="1"><stop offset="0.6" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
      <linearGradient id="y" y1="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="0.72" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
      <mask id="m"><rect width="${width}" height="${height}" fill="url(#y)"/></mask>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#x)" mask="url(#m)"/>
  </svg>`;
}

const hex = ({ r, g, b }) =>
  `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;

if (!fs.existsSync(SOURCES)) {
  throw new Error(`No banners in ${path.relative(process.cwd(), SOURCES)}.`);
}

const manifest = {};

for (const file of fs.readdirSync(SOURCES).sort()) {
  if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;

  const slug = file.replace(/\.[^.]+$/, "");
  const from = path.join(SOURCES, file);
  const metadata = await sharp(from).metadata();
  if (!metadata.width || !metadata.height) continue;

  const left = Math.round((CUT / 1684) * metadata.width);
  const crop = sharp(from).extract({
    left,
    top: 0,
    width: metadata.width - left,
    height: metadata.height,
  });

  // The product name is set long enough on some banners that its last letters
  // reach past the cut — "LATTE" on Cream Latte, a stray "E" on three others.
  // They sit on nothing but the background wash, so the corner they land in is
  // blurred flat and faded back in at its edges: the gradient survives, the
  // letters do not, and there is no rectangle to see.
  const flat = await crop.png().toBuffer();
  const patched = [];
  for (const patch of PATCHES) {
    // Only where the corner really is empty wash. On Tea the sachets reach past
    // the cut into this corner, and blurring it there smudges the product
    // rather than a stray letter — a busy region is left alone.
    // Materialised before measuring: `stats()` reads the input image, so
    // measuring a chained `extract()` silently returns the whole crop's figures.
    const region = await sharp(flat).extract(patch).png().toBuffer();
    const { channels } = await sharp(region).stats();
    const detail = Math.max(...channels.map((channel) => channel.stdev));
    if (detail > BUSY) continue;

    patched.push({
      input: await sharp(flat)
        .extract(patch)
        .blur(55)
        .composite([{ input: Buffer.from(patchMask(patch)), blend: "dest-in" }])
        .png()
        .toBuffer(),
      left: patch.left,
      top: patch.top,
    });
  }

  const buffer = await sharp(flat)
    .composite(patched)
    .webp({ quality: 84, effort: 5 })
    .toBuffer();

  fs.writeFileSync(path.join(IMAGES, `hero-${slug}.webp`), buffer);

  const read = async (top) => {
    const { data } = await sharp(buffer)
      .extract({ left: SAMPLE.left, top, width: 1, height: 1 })
      .raw()
      .toBuffer({ resolveWithObject: true });
    return hex({ r: data[0], g: data[1], b: data[2] });
  };

  manifest[slug] = {
    image: `/images/hero-${slug}.webp`,
    band: await read(SAMPLE.head),
    bandFoot: await read(metadata.height - SAMPLE.foot),
  };

  console.log(
    `hero-${slug}.webp  ${metadata.width - left}x${metadata.height}` +
      `  band ${manifest[slug].band} → ${manifest[slug].bandFoot}`,
  );
}

fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`\nWrote ${Object.keys(manifest).length} product heroes.`);
