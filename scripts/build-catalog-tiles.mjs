/**
 * Cut the catalogue tiles out of the brand key visuals.
 *
 * The catalogue is one grid of sixteen tiles, and a grid only reads as a range
 * when every tile is the same shape, the same crop and the same weight. The
 * exported renders were none of those — see `build-pack-shots.mjs` — and the
 * client's own banners are, because they are one template.
 *
 * Same eleven banners the hero uses, and the same cut: `CUT` is where the
 * "the BASE" watermark ends and the product begins, so everything right of it
 * is product and colour and no type. That leaves a 684x1190 column, and the
 * tile is the bottom square of it.
 *
 * Square is not only the reference's shape, it is the one that comes out clean.
 * The banners set a line of copy at around y=380–520 that runs a little past
 * the cut on nine of the eleven — a stray "us", "os," "ct" — and a taller crop
 * caught it in the top-left corner of nine tiles. The bottom 684 starts below
 * that line on every banner, so the fragments are outside the tile rather than
 * blurred out of it.
 *
 * The five products with no banner yet — topping, garnish, sugar syrup, sugar
 * free, vending — get a tile of the same shape built the other way round: their
 * plated pouch standing on a field of their own colour, so the row stays a row.
 * Drop a banner into `assets/product-heroes/<slug>.webp` and re-run, and that
 * product joins the other eleven.
 *
 * Run: node scripts/build-catalog-tiles.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const BANNERS = path.resolve("assets/product-heroes");
const IMAGES = path.resolve("public/images");
const MANIFEST = path.resolve("src/data/catalog-tiles.json");

/** Where the artwork stops and the product starts, on the shared 1684px template. */
const CUT = 1000;
/** Tile shape and the size it is delivered at. */
const RATIO = 1;
const WIDTH = 860;
const HEIGHT = Math.round(WIDTH / RATIO);

/** Product colours, read from the registry so they stay written down once. */
const COLOURS = Object.fromEntries(
  [
    ...fs
      .readFileSync(path.resolve("src/data/products.ts"), "utf8")
      .matchAll(/slug: "([a-z-]+)",[\s\S]{0,900}?backgroundColor: "(#[0-9a-f]{6})"/g),
  ].map((match) => [match[1], match[2]]),
);

function bannerFor(slug) {
  for (const extension of [".webp", ".png", ".jpg", ".jpeg"]) {
    const file = path.join(BANNERS, `${slug}${extension}`);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

/** The bottom square of the banner's text-free column, at delivery size. */
async function fromBanner(file) {
  const { width, height } = await sharp(file).metadata();
  const left = Math.round((CUT / 1684) * width);
  const columnWidth = width - left;
  // What the ratio asks of that column, or the whole banner if the column is
  // the wider of the two — never more than there is.
  const cropHeight = Math.min(height, Math.round(columnWidth / RATIO));

  return sharp(file)
    .extract({ left, top: height - cropHeight, width: columnWidth, height: cropHeight })
    .resize(WIDTH, HEIGHT, { fit: "cover" })
    .webp({ quality: 82 })
    .toBuffer();
}

/**
 * The same shape built out of a pouch and a colour, for the products with no
 * banner. Bottom-weighted like the banners are, so a row of both kinds stands
 * on one line.
 */
async function fromPack(slug) {
  const pack = path.join(IMAGES, `pack-${slug}.webp`);
  if (!fs.existsSync(pack)) return null;

  // Trimmed first: the plated pack shots carry transparent margin, and scaling
  // to a fraction of the tile without removing it makes the pouch smaller than
  // the fraction says — which is what left these five looking like a different
  // set beside the eleven photographed ones.
  const bleed = Math.round(HEIGHT * 0.03);
  let product = await sharp(pack)
    .trim()
    .resize(Math.round(WIDTH * 0.74), HEIGHT + bleed, { fit: "inside" })
    .toBuffer();

  let { width, height } = await sharp(product).metadata();
  // Whatever runs past the bottom edge is cut here rather than composited past
  // it — sharp will not place an image larger than its canvas.
  if (height > HEIGHT) {
    product = await sharp(product).extract({ left: 0, top: 0, width, height: HEIGHT }).toBuffer();
    ({ width, height } = await sharp(product).metadata());
  }

  return sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: COLOURS[slug] ?? "#e5e5e5",
    },
  })
    // Standing on the bottom edge and running a little past it, the way the
    // pouch does in every one of the banners.
    .composite([
      {
        input: product,
        left: Math.round((WIDTH - width) / 2),
        top: HEIGHT - height,
      },
    ])
    .webp({ quality: 82 })
    .toBuffer();
}

const manifest = {};
const built = [];
const missing = [];

for (const slug of Object.keys(COLOURS).sort()) {
  const banner = bannerFor(slug);
  const tile = banner ? await fromBanner(banner) : await fromPack(slug);

  if (!tile) {
    missing.push(slug);
    continue;
  }

  fs.writeFileSync(path.join(IMAGES, `tile-${slug}.webp`), tile);
  manifest[slug] = { image: `/images/tile-${slug}.webp`, source: banner ? "banner" : "pack" };
  built.push(`${slug}${banner ? "" : " (pack)"}`);
}

fs.writeFileSync(
  MANIFEST,
  `${JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2)}\n`,
  "utf8",
);

console.log(`Wrote ${built.length} catalogue tiles at ${WIDTH}x${HEIGHT}: ${built.join(", ")}.`);
if (missing.length) console.log(`No artwork at all for: ${missing.join(", ")}.`);
