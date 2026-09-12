/**
 * Build the product shots and scene photography for the redesigned homepage.
 *
 * The sources are the images carried inside the design file itself, dropped in
 * as `assets/design-shots/<slug>.png` and `assets/design-scenes/<name>.png`.
 * They are inputs, not assets: nothing there is served, and nothing there is
 * committed — see the README beside them.
 *
 * **Why the shots are rebuilt rather than placed as the file places them.**
 * In the design each of the sixteen glasses carries its own size and offset
 * inside the card: from 238.59x357.50 to 322.11x462.71, at y from -53.10 to
 * +15.63. Two things are mixed together in that spread. One is hand-nudging —
 * the card's wash is 283.83x424.06 at (-7, -6) on all sixteen and its ground
 * gradient 248.58x111.97 on fifteen, so the frame is fixed and only the glass
 * wanders. The other is a stretch: the sources are all 1000x1500, aspect
 * 0.667, but ten of the placements are 0.729 — the glass is 9% wider than it
 * is tall, which is distortion rather than art direction.
 *
 * So this trims every source to its own edges, fits it to one box at its true
 * aspect, and stands all sixteen on one baseline. The card then needs one set
 * of numbers instead of sixteen, the glasses are not stretched, and the row
 * reads as a row — the same reasoning as `build-pack-shots.mjs`.
 *
 * Run: node scripts/build-design-shots.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SHOT_SOURCES = path.resolve("assets/design-shots");
const SCENE_SOURCES = path.resolve("assets/design-scenes");
const IMAGES = path.resolve("public/images");

/**
 * The canvas is the whole card, at twice the 270x413 the design draws it at, so
 * the glass still holds up on a 2x screen. Writing the tile rather than a box
 * inside it means the card's CSS places one full-bleed layer and carries no
 * offsets of its own.
 */
const SHOT_WIDTH = 540;
const SHOT_HEIGHT = 826;

/**
 * Where the glass goes, in the design's own card units, doubled.
 *
 * These are measured from the file rather than picked. Each placement box there
 * holds the whole 1000x1500 source, transparent margins and all, so the box is
 * not the glass: scaling each source's own alpha bounds into its box puts the
 * sixteen visible glasses at 220 to 304 tall, median 250, standing on a base at
 * y 292 to 330, median 310. The name is printed at y 333, so the median base is
 * also what keeps the two from colliding — which is the one thing the spread
 * cannot be allowed to decide.
 */
const GLASS_HEIGHT = 250 * 2;
const GLASS_BASE = 310 * 2;
/** The widest a glass may run, which is the width of the ground under it. */
const GLASS_MAX_WIDTH = 248 * 2;
/** Below this the pixel is the photograph's own soft shadow, not the glass. */
const OPAQUE = 8;

/**
 * Scene photography: width to serve at, and whether it keeps its alpha channel.
 *
 * `signature-card` and `sample-card` are the two offer cards exported from the
 * design already composed, at twice the 700x413 and 395x413 they are drawn at.
 * The sample card is a collage — one pack at 20 degrees, two more at 21 and 41,
 * over a brown gradient — and reproducing that as five positioned, rotated
 * layers in CSS would be five sets of magic numbers standing in for one picture.
 * They keep their alpha because both cards have rounded corners.
 */
const SCENES = {
  "hero-desktop": { width: 2538, alpha: false },
  "hero-mobile": { width: 748, alpha: false },
  "signature-card": { width: 1400, alpha: true },
  "signature-mobile": { width: 1244, alpha: false },
  "sample-card": { width: 791, alpha: true },
  team: { width: 2224, alpha: false },
};

const SLUGS = [
  "milkshake", "frappe", "iced-tea", "cordial",
  "raf-coffee", "chai-latte", "matcha", "chocolate",
  "cream-latte", "jam", "topping", "garnish",
  "sugar-syrup", "tea", "sugar-free", "vending",
];

/**
 * The tightest rectangle holding the drink.
 *
 * Every source here is a cut-out on transparency, so alpha is the only measure
 * needed — unlike the pack shots, which also have to cope with a white sweep.
 */
async function drinkBounds(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * channels + 3] <= OPAQUE) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  if (right < 0) throw new Error(`${file} is blank — nothing to place`);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

let shots = 0;

for (const slug of SLUGS) {
  const from = path.join(SHOT_SOURCES, `${slug}.png`);
  if (!fs.existsSync(from)) throw new Error(`Missing design shot for ${slug}: ${from}`);

  const bounds = await drinkBounds(from);
  // One height for all sixteen, pulled back only if that would make a wide
  // glass run past the ground it stands on.
  const scale = Math.min(
    GLASS_HEIGHT / bounds.height,
    GLASS_MAX_WIDTH / bounds.width,
  );
  const width = Math.max(1, Math.round(bounds.width * scale));
  const height = Math.max(1, Math.round(bounds.height * scale));

  const drink = await sharp(from).extract(bounds).resize(width, height).png().toBuffer();

  await sharp({
    create: {
      width: SHOT_WIDTH,
      height: SHOT_HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: drink,
        left: Math.round((SHOT_WIDTH - width) / 2),
        top: GLASS_BASE - height,
      },
    ])
    .webp({ quality: 84, effort: 6, alphaQuality: 100 })
    .toFile(path.join(IMAGES, `shot-${slug}.webp`));

  shots += 1;
  console.log(`shot-${slug}.webp  glass ${width}x${height} on ${SHOT_WIDTH}x${SHOT_HEIGHT}`);
}

let scenes = 0;

for (const [name, { width, alpha }] of Object.entries(SCENES)) {
  const from = path.join(SCENE_SOURCES, `${name}.png`);
  if (!fs.existsSync(from)) throw new Error(`Missing design scene: ${from}`);

  const pipeline = sharp(from).resize({ width, withoutEnlargement: true });
  // A photograph gains nothing from an alpha channel and pays for it in bytes.
  const flattened = alpha ? pipeline : pipeline.flatten({ background: "#ffffff" });

  const info = await flattened
    .webp({ quality: 82, effort: 6, alphaQuality: alpha ? 100 : undefined })
    .toFile(path.join(IMAGES, `home-${name}.webp`));

  scenes += 1;
  console.log(`home-${name}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)}kB`);
}

console.log(`\n${shots} shots, ${scenes} scenes written to public/images.`);
