/**
 * Normalise the catalogue pack shots.
 *
 * The exported catalogue pulls sixteen unrelated renders. Some are 604x848
 * plates with the pouch filling two thirds of the frame and a shadow baked in,
 * some are 1170x1703 plates with it running edge to edge, and three were
 * pointing at a background image rather than at the product. Dropped into one
 * grid they came out at three different sizes on three different baselines,
 * which is what made the row look untidy however the cards were styled.
 *
 * The fix is in the artwork, not the layout: every pack is trimmed to its own
 * edges, scaled to fit one box, and placed on one 720x960 canvas standing on
 * one baseline. The thirteen 500 g doypacks then come out identical to within
 * two pixels, and the three products that genuinely are not doypacks — the
 * 50 g garnish pouch and the tea and sugar-free sachets — are held to the same
 * width and the same baseline instead of being stretched to match.
 *
 * Sources are named below rather than derived, because the file names are Tilda
 * hashes and the only way to know that `1-milkshake_4_7` is the matcha pouch is
 * to have looked at it. `AGENTS.md` and the project notes both say not to
 * rename anything in `public/images` — 90 exported pages point at those names —
 * so this writes new `pack-<slug>.webp` files and leaves the originals alone.
 *
 * TO USE BETTER PHOTOGRAPHY: drop it in `assets/pack-sources/` named after the
 * product slug — `milkshake.png`, `raf-coffee.webp`, `chai-latte.jpg` — and run
 * the script. A file there wins over the table below, and anything without one
 * keeps the render it has, so the set can be replaced a few products at a time.
 * Cut-outs on transparency are ideal; a shot on a plain white sweep works too,
 * because the trim falls back to measuring against white when there is no
 * alpha. What matters is that the pouch is upright and uncropped — everything
 * else (scale, position, baseline, canvas, format) happens here.
 *
 * Run: node scripts/build-pack-shots.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const IMAGES = path.resolve("public/images");
/** Hand-supplied photography, one file per slug. Optional, and wins when present. */
const DROP_IN = path.resolve("assets/pack-sources");
const DROP_IN_EXTENSIONS = [".png", ".webp", ".jpg", ".jpeg", ".tif", ".tiff"];

/** Catalogue slug -> the render in `public/images` that shows that product. */
const SOURCES = {
  milkshake: "tild3466-6137-4262-b930-613961623066__1-milkshake_4_2.png",
  frappe: "tild6334-6564-4834-b133-643635616362__1-milkshake_4_3.png",
  "iced-tea": "tild3665-3938-4962-b734-396438653232__1-milkshake_4_4.png",
  cordial: "tild6533-3965-4532-a137-636663366135__1-milkshake_4_5.png",
  "raf-coffee": "tild3736-6639-4631-a330-326664373063__raf-pouch-new.webp",
  "chai-latte": "tild3164-3964-4663-b831-356661363839__1-milkshake_4_1.png",
  matcha: "tild6336-3231-4234-b231-373661623061__1-milkshake_4_7.png",
  chocolate: "tild3030-3162-4365-b735-633136393330__1-milkshake_4_8.png",
  "cream-latte": "tild6139-6232-4335-a638-343330623361__1-milkshake_4.png",
  jam: "tild6238-3437-4831-a230-646165383030__1-milkshake_4_12.png",
  topping: "tild3636-6534-4933-b130-623937313033__1-milkshake_4_6.png",
  garnish: "tild3238-3935-4464-b062-613230363865__1-milkshake_4_13.png",
  "sugar-syrup": "tild3335-6162-4638-a664-656531623064__1-milkshake_4_9.png",
  tea: "tild3039-6337-4966-b137-663964323936__tea_back_2.png",
  "sugar-free": "tild6139-6337-4662-b466-326461623963__sugar_back_1.png",
  vending: "tild3731-3239-4866-a636-303531326561__1-milkshake_4_11.png",
};

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 960;
/** The box every pack is fitted inside, as a share of the canvas. */
const FIT_WIDTH = Math.round(CANVAS_WIDTH * 0.86);
const FIT_HEIGHT = Math.round(CANVAS_HEIGHT * 0.88);
/** Where every pack stands. A shared baseline is what makes the row read as a row. */
const BASELINE = Math.round(CANVAS_HEIGHT * 0.955);
/** Below this the pixel is shadow or nothing, and must not widen the crop. */
const OPAQUE = 8;
/** How far from pure white a pixel must be to count as product, on a white sweep. */
const OFF_WHITE = 12;

/** The photograph supplied for this slug, if there is one. */
function dropIn(slug) {
  for (const extension of DROP_IN_EXTENSIONS) {
    const candidate = path.join(DROP_IN, `${slug}${extension}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * The tightest rectangle holding the product.
 *
 * Measured on alpha where the file has any, and against white where it does
 * not — a pouch photographed on a white sweep has an opaque background, so the
 * alpha pass would return the whole frame and every pack would come out the
 * size of its own canvas rather than the size of the pouch.
 */
async function productBounds(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const measure = (isProduct) => {
    let left = width;
    let top = height;
    let right = -1;
    let bottom = -1;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (!isProduct((y * width + x) * channels)) continue;
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }

    if (right < 0) return null;
    return { left, top, width: right - left + 1, height: bottom - top + 1 };
  };

  const byAlpha = measure((at) => data[at + 3] > OPAQUE);
  // A frame-filling alpha box means the file has no usable transparency.
  const opaqueEverywhere =
    !byAlpha || (byAlpha.width >= width * 0.99 && byAlpha.height >= height * 0.99);

  if (!opaqueEverywhere) return byAlpha;

  const byWhite = measure((at) =>
    data[at + 3] > OPAQUE &&
    (255 - data[at] > OFF_WHITE || 255 - data[at + 1] > OFF_WHITE || 255 - data[at + 2] > OFF_WHITE));

  if (!byWhite) throw new Error(`${file} is blank — nothing to place`);
  return byWhite;
}

let written = 0;
let supplied = 0;

for (const [slug, source] of Object.entries(SOURCES)) {
  const from = dropIn(slug) ?? path.join(IMAGES, source);
  if (!fs.existsSync(from)) throw new Error(`Missing source for ${slug}: ${source}`);
  if (from.startsWith(DROP_IN)) supplied += 1;

  const bounds = await productBounds(from);
  const scale = Math.min(FIT_WIDTH / bounds.width, FIT_HEIGHT / bounds.height);
  const width = Math.max(1, Math.round(bounds.width * scale));
  const height = Math.max(1, Math.round(bounds.height * scale));

  const pack = await sharp(from).extract(bounds).resize(width, height).png().toBuffer();

  await sharp({
    create: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: pack, left: Math.round((CANVAS_WIDTH - width) / 2), top: BASELINE - height },
    ])
    .webp({ quality: 82, effort: 6 })
    .toFile(path.join(IMAGES, `pack-${slug}.webp`));

  written += 1;
  console.log(`pack-${slug}.webp  ${width}x${height}  <- ${path.relative(process.cwd(), from)}`);
}

console.log(
  `Wrote ${written} normalised pack shots to public/images/` +
    (supplied ? `, ${supplied} of them from assets/pack-sources/.` : "."),
);
