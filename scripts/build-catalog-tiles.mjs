/**
 * Build the catalogue tiles.
 *
 * The catalogue is one grid of sixteen tiles, and a grid only reads as a range
 * when every tile is the same shape, the same crop and the same weight. It was
 * not: eleven tiles were the bottom square of the client's banner, which cuts
 * the pouch off at the right edge and at the bottom and lands it at a different
 * size in every one, and the other five were a whole pouch standing centred on
 * a flat colour. Two treatments in one grid, and the reason it read as a set of
 * pictures borrowed from different places.
 *
 * So every tile is built the same way: the pouch whole, fitted to the tile's
 * height, standing on a field of its own colour with air either side. Nothing
 * is cropped and nothing is scaled to fill.
 *
 * The pouch, and only the pouch. Eleven of the tiles used to be a cut of the
 * client's key visual, which carries the made drink as well — a glass, a
 * garnish, ice, steam — and next to five plain pouches that read as sixteen
 * pictures rather than sixteen products. The shop sells the pouch; the drink is
 * what the product page is for. So all sixteen are now `pack-<slug>.webp`, the
 * cut-out, and the grid is one thing photographed sixteen times.
 *
 * What still differs is the colour behind it, and it differs the same way the
 * product page's own wash does — same three sources, same order, so a tile and
 * the hero it leads to stand on the same colour:
 *
 *   1. the banner's sampled pair, `band` and `bandFoot` (eleven products);
 *   2. the frame's own fill from `forme.fig`, in `product-washes.ts` (five);
 *   3. the registry colour, lightened at the head — the fallback, unreached.
 *
 * Run: node scripts/build-catalog-tiles.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const IMAGES = path.resolve("public/images");
const HEROES = path.resolve("src/data/product-heroes.json");
const MANIFEST = path.resolve("src/data/catalog-tiles.json");

/**
 * Tile shape and the size it is delivered at.
 *
 * Four by five, and the shape is what makes the rest of this simple. The key
 * visual's product column is 824x1190, near enough 7:10; asked to fill a square
 * it had to be either cropped — which is what cut the pouch off at the right —
 * or centred on a field invented either side of it, and no invented field
 * matches a wash that ramps in two directions. At four by five the picture
 * covers the tile with a little off the top, and the top of a key visual is
 * empty wash. Nothing is painted in and nothing is stretched.
 */
const WIDTH = 860;
const HEIGHT = Math.round((WIDTH * 5) / 4);

/**
 * The box the pouch stands in, as a fraction of the tile.
 *
 * It is fitted inside both bounds rather than set by height alone. The banners
 * ran their pouch off the bottom edge and off the sides, which suited a picture
 * of a drink being made; a shelf wants the product whole, with air around it,
 * the way any catalogue photographs a pack. Both bounds also mean the one
 * product that is not a standing pouch — Sugar Free is two sachets lying flat —
 * fits by its width instead of running out of the frame.
 */
const BOX_WIDTH = 0.72;
const BOX_HEIGHT = 0.78;
/** Where its middle sits: a little below the tile's, so it stands rather than floats. */
const BASELINE = 0.54;

/** The wash sampled from each key visual — see `build-product-heroes.mjs`. */
const heroes = JSON.parse(fs.readFileSync(HEROES, "utf8"));

/**
 * The frame fills for the five products with no banner, read out of
 * `product-washes.ts` rather than copied, so the tile and the hero cannot drift
 * apart. Regex rather than an import because this script is plain JavaScript.
 */
const washes = Object.fromEntries(
  [
    ...fs
      .readFileSync(path.resolve("src/data/product-washes.ts"), "utf8")
      .matchAll(/"?([a-z-]+)"?: { from: "(#[0-9a-f]{6})", to: "(#[0-9a-f]{6})" }/g),
  ].map((match) => [match[1], { from: match[2], to: match[3] }]),
);

/** Product colours, read from the registry so they stay written down once. */
const COLOURS = Object.fromEntries(
  [
    ...fs
      .readFileSync(path.resolve("src/data/products.ts"), "utf8")
      .matchAll(/slug: "([a-z-]+)",[\s\S]{0,900}?backgroundColor: "(#[0-9a-f]{6})"/g),
  ].map((match) => [match[1], match[2]]),
);

/** The field a cut-out stands on: the product's colour, lighter at the head. */
function field(head, foot) {
  return Buffer.from(
    `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${head}"/>
          <stop offset="1" stop-color="${foot}"/>
        </linearGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#wash)"/>
    </svg>`,
  );
}

/** Lighter, for the head of a field mixed out of a single product colour. */
function lighten(hex, amount) {
  const channel = (index) => {
    const value = parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
    return Math.round(value + (255 - value) * amount);
  };
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

/** The frame around a cut-out pouch, which is now every tile. */
async function fromPack(slug) {
  const file = path.join(IMAGES, `pack-${slug}.webp`);
  if (!fs.existsSync(file)) return null;

  const colour = COLOURS[slug] ?? "#e5e5e5";
  const [head, foot] = heroes[slug]
    ? [heroes[slug].band, heroes[slug].bandFoot]
    : washes[slug]
      ? [washes[slug].from, washes[slug].to]
      : [lighten(colour, 0.22), colour];
  // Trimmed first: the cut-outs carry transparent margin, and fitting one to a
  // fraction of the tile without removing it makes the pouch smaller than the
  // fraction says — and by a different amount on every product, which is
  // exactly what a grid of sixteen cannot have.
  const pouch = await sharp(file)
    .trim()
    .resize({
      width: Math.round(WIDTH * BOX_WIDTH),
      height: Math.round(HEIGHT * BOX_HEIGHT),
      fit: "inside",
    })
    .toBuffer();
  const { width, height } = await sharp(pouch).metadata();

  return sharp(field(head, foot))
    .composite([
      {
        input: pouch,
        left: Math.round((WIDTH - width) / 2),
        top: Math.round(HEIGHT * BASELINE - height / 2),
      },
    ])
    .webp({ quality: 82 })
    .toBuffer();
}

const manifest = {};
const built = [];
const missing = [];

for (const slug of Object.keys(COLOURS).sort()) {
  const source = heroes[slug] ? "banner-wash" : washes[slug] ? "frame-wash" : "colour";
  const tile = await fromPack(slug);

  if (!tile) {
    missing.push(slug);
    continue;
  }

  fs.writeFileSync(path.join(IMAGES, `tile-${slug}.webp`), tile);
  manifest[slug] = { image: `/images/tile-${slug}.webp`, source };
  built.push(`${slug} (${source})`);
}

fs.writeFileSync(
  MANIFEST,
  `${JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2)}\n`,
  "utf8",
);

console.log(`Wrote ${built.length} catalogue tiles at ${WIDTH}x${HEIGHT}: ${built.join(", ")}.`);
if (missing.length) console.log(`No artwork at all for: ${missing.join(", ")}.`);
