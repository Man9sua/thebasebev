/**
 * Serve the parity pages' images at the size they are displayed.
 *
 * The Tilda export asks for every image at full plate size and asks for all of
 * them at once. Measured on the deployed Worker, `/milkshake` was 14.7 MB over
 * 97 requests and took about four seconds to reach `load` — a 1680x1951 plate
 * to fill 596 px, a 1170x1703 plate to fill 390, and six ~1.1 MB pack shots
 * pulled in by CSS for products that are not even on the page. That is the
 * "page takes forever or never loads" the client reported.
 *
 * So this writes a delivery-sized WebP beside every heavy original and leaves
 * the original where it is — `AGENTS.md` and the project notes both say nothing
 * in `public/images` may be renamed, because 90 exported pages point at those
 * names. `site-pages.ts` rewrites the references as it serves each page, so the
 * export on disk stays byte-for-byte the parity reference.
 *
 * Only rasters, only files big enough to be worth a second copy, and never
 * upscaled: an image already narrower than the cap is re-encoded, not enlarged.
 * SVG is skipped — it is already the small one.
 *
 * Run: node scripts/build-legacy-image-variants.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const IMAGES = path.resolve("public/images");
const VARIANTS = path.join(IMAGES, "w");
const MANIFEST = path.resolve("src/data/legacy-image-variants.json");

/** Below this the original is already small enough that a second copy is waste. */
const MIN_BYTES = 120 * 1024;
/** Widest anything is displayed on a parity page, with room for a 2x screen. */
const MAX_WIDTH = 1400;
const QUALITY = 78;

fs.mkdirSync(VARIANTS, { recursive: true });

const sources = fs
  .readdirSync(IMAGES)
  .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
  .filter((file) => fs.statSync(path.join(IMAGES, file)).size >= MIN_BYTES)
  .sort();

const manifest = {};
let originalBytes = 0;
let variantBytes = 0;

for (const file of sources) {
  const from = path.join(IMAGES, file);
  const metadata = await sharp(from).metadata();
  if (!metadata.width) continue;

  const name = `${file.replace(/\.[^.]+$/, "")}.webp`;
  const to = path.join(VARIANTS, name);

  await sharp(from)
    .resize({ width: Math.min(metadata.width, MAX_WIDTH), withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 5 })
    .toFile(to);

  const before = fs.statSync(from).size;
  const after = fs.statSync(to).size;

  // A variant that is not actually smaller is a second download for nothing.
  if (after >= before) {
    fs.unlinkSync(to);
    continue;
  }

  manifest[file] = `w/${name}`;
  originalBytes += before;
  variantBytes += after;
}

fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);
console.log(
  `Wrote ${Object.keys(manifest).length} variants to public/images/w/: ` +
    `${mb(originalBytes)} MB of originals become ${mb(variantBytes)} MB.`,
);
