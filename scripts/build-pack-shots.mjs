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
 * Sources are named here rather than derived, because the file names are Tilda
 * hashes and the only way to know that `1-milkshake_4_7` is the matcha pouch is
 * to have looked at it. `AGENTS.md` and the project notes both say not to
 * rename anything in `public/images` — 90 exported pages point at those names —
 * so this writes new `pack-<slug>.webp` files and leaves the originals alone.
 *
 * Run: node scripts/build-pack-shots.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const IMAGES = path.resolve("public/images");

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

/** The tightest rectangle holding everything that is more than faintly visible. */
async function opaqueBounds(file) {
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

  if (right < 0) throw new Error(`${file} is fully transparent`);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

let written = 0;

for (const [slug, source] of Object.entries(SOURCES)) {
  const from = path.join(IMAGES, source);
  if (!fs.existsSync(from)) throw new Error(`Missing source for ${slug}: ${source}`);

  const bounds = await opaqueBounds(from);
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
  console.log(`pack-${slug}.webp  ${width}x${height}  <- ${source}`);
}

console.log(`Wrote ${written} normalised pack shots to public/images/.`);
