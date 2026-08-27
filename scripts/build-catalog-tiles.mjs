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
 * So every tile is now built the same way: the product whole, fitted to the
 * tile's height, standing on a field of its own colour with air either side.
 * Nothing is cropped and nothing is scaled to fill.
 *
 * Where the product comes from still differs, because the artwork does. Eleven
 * products have a key visual, and the tile takes the cut of it the product page
 * uses — `hero-<slug>.webp`, the part with no type on it, see
 * `build-product-heroes.mjs` — so the tile carries the drink as well as the
 * pouch. The field behind it is that banner's own wash, continued: `band` at the
 * head and `bandFoot` at the foot are sampled from the picture, and because the
 * picture is fitted to the same height, its ramp and the field's are the same
 * ramp. There is no edge to see and nothing to feather.
 *
 * The other five — topping, garnish, sugar syrup, sugar free, vending — have no
 * key visual, only a cut-out pouch, so the tile is that pouch at the height the
 * pouches in the other eleven come out at, on a ramp of the product's own
 * colour. It is the same frame with a quieter picture in it. Drop a banner into
 * `assets/product-heroes/<slug>.webp`, re-run this and `build-product-heroes`,
 * and that product joins the other eleven.
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
 * How tall the pouch stands in a tile built from a cut-out, as a fraction of
 * the tile. Measured off the banners rather than chosen: the pouch fills the
 * bottom three quarters of every one of them, so a cut-out set to the same
 * fraction stands at the same height as its neighbours in the row.
 */
const POUCH = 0.84;
/** The banners run their pouch a little past the bottom edge; the cut-outs match. */
const BLEED = 0.02;

/** The wash sampled from each key visual — see `build-product-heroes.mjs`. */
const heroes = JSON.parse(fs.readFileSync(HEROES, "utf8"));

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

/**
 * A tile from the product page's own crop of the key visual.
 *
 * The crop is a touch narrower than the tile, so it covers rather than fits and
 * loses a strip off the top — anchored at the bottom, because the bottom is
 * where the product stands and the top is the empty part of the wash. Every one
 * of the eleven is the same template at the same size, so every tile comes out
 * with the pouch at the same height in the frame.
 */
async function fromHero(slug) {
  const file = path.join(IMAGES, path.basename(heroes[slug].image));
  if (!fs.existsSync(file)) return null;

  return sharp(file)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "bottom" })
    .webp({ quality: 82 })
    .toBuffer();
}

/** The same frame around a cut-out pouch, for the products with no key visual. */
async function fromPack(slug) {
  const file = path.join(IMAGES, `pack-${slug}.webp`);
  if (!fs.existsSync(file)) return null;

  const colour = COLOURS[slug] ?? "#e5e5e5";
  // Trimmed first: the cut-outs carry transparent margin, and scaling to a
  // fraction of the tile without removing it makes the pouch smaller than the
  // fraction says — which is part of what left these five looking like a
  // different set beside the photographed eleven.
  //
  // Height only. Bounding the width as well is the obvious guard against a
  // subject wider than the tile, and it is wrong here: Sugar Free is two
  // sachets lying flat rather than a standing pouch, so the width bound caught
  // it first and shrank it until it sat in the middle of a wide empty margin —
  // a picture with a frame drawn round it, next to ten that had none.
  const scaled = await sharp(file)
    .trim()
    .resize({ height: Math.round(HEIGHT * (POUCH + BLEED)) })
    .toBuffer();
  const { width, height } = await sharp(scaled).metadata();

  // Standing on the bottom edge and running past it, and past the sides too
  // where the subject is wider than the tile, the way the pouch does in every
  // one of the banners. What runs past is cut here rather than composited past
  // the edge, which sharp declines to do.
  const left = Math.round((WIDTH - width) / 2);
  const top = HEIGHT - Math.round(HEIGHT * POUCH);
  const window = {
    left: Math.max(0, -left),
    top: Math.max(0, -top),
    width: Math.min(width - Math.max(0, -left), WIDTH - Math.max(0, left)),
    height: Math.min(height - Math.max(0, -top), HEIGHT - Math.max(0, top)),
  };
  const pouch =
    window.width === width && window.height === height
      ? scaled
      : await sharp(scaled).extract(window).toBuffer();

  return sharp(field(lighten(colour, 0.22), colour))
    .composite([{ input: pouch, left: Math.max(0, left), top: Math.max(0, top) }])
    .webp({ quality: 82 })
    .toBuffer();
}

const manifest = {};
const built = [];
const missing = [];

for (const slug of Object.keys(COLOURS).sort()) {
  const source = heroes[slug] ? "banner" : "pack";
  const tile = heroes[slug] ? await fromHero(slug) : await fromPack(slug);

  if (!tile) {
    missing.push(slug);
    continue;
  }

  fs.writeFileSync(path.join(IMAGES, `tile-${slug}.webp`), tile);
  manifest[slug] = { image: `/images/tile-${slug}.webp`, source };
  built.push(`${slug}${source === "pack" ? " (pack)" : ""}`);
}

fs.writeFileSync(
  MANIFEST,
  `${JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2)}\n`,
  "utf8",
);

console.log(`Wrote ${built.length} catalogue tiles at ${WIDTH}x${HEIGHT}: ${built.join(", ")}.`);
if (missing.length) console.log(`No artwork at all for: ${missing.join(", ")}.`);
