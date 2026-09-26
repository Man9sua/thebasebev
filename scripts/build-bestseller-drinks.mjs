/**
 * Build the drink cut-outs the homepage bestsellers band stands beside its
 * packs.
 *
 * The `glass-<slug>.webp` originals are framed for the product hero, which
 * places each one by hand from a table of measured boxes. On the homepage
 * there is no table: one slot holds whichever drink is live, so the drinks
 * have to be interchangeable, and as shipped they are not. Measured against
 * their own canvases the drink occupies anywhere from 40% to 66% of the width
 * and sits between 8.7% and 18% up from the bottom edge — so a slot that holds
 * the file holds a different drink, at a different size, on a different line,
 * for every product. That is the jump.
 *
 * So: trim each one to what is actually painted and write it out under its own
 * name. A trimmed file's box *is* its drink, which is what lets the band place
 * all five the same way — same baseline, same height, same overlap with the
 * pack — and what each drink's own width then says is how wide that glass is,
 * which is true.
 *
 * The originals are left alone. `src/data/product-glass.ts` measures against
 * their framing, and the product hero would move if they were re-cropped.
 *
 * Run after adding or replacing a bestseller's drink photograph:
 *
 *   node scripts/build-bestseller-drinks.mjs
 */

import path from "node:path";
import sharp from "sharp";

const IMAGES = path.join("public", "images");

/** `BESTSELLER_SLUGS`, which is what the band carries. */
const SLUGS = ["cream-latte", "milkshake", "matcha", "iced-tea", "cordial"];

/**
 * Alpha below this is the fringe of a soft edge rather than the drink. Trimming
 * at zero keeps a pixel or two of near-invisible halo on some of these files,
 * which is enough to put the baselines back out of line.
 */
const ALPHA_FLOOR = 12;

/** The painted box, in pixels, of an image with an alpha channel. */
async function paintedBox(file) {
  const image = sharp(file);
  const { width, height } = await image.metadata();
  const pixels = await image.ensureAlpha().raw().toBuffer();

  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (pixels[(y * width + x) * 4 + 3] <= ALPHA_FLOOR) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  if (right < 0) throw new Error(`${file} has nothing painted on it`);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

for (const slug of SLUGS) {
  const source = path.join(IMAGES, `glass-${slug}.webp`);
  const target = path.join(IMAGES, `drink-${slug}.webp`);
  const box = await paintedBox(source);

  await sharp(source).extract(box).webp({ quality: 86 }).toFile(target);

  console.log(
    `${slug}: ${box.width}x${box.height} at ${box.left},${box.top} -> ${path.basename(target)}`,
  );
}
