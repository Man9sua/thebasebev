import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const IMAGES = path.resolve("public/images");
const VARIANTS = path.join(IMAGES, "w");
const MANIFEST = path.resolve("src/data/legacy-image-variants.json");

const MIN_BYTES = 120 * 1024;
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
