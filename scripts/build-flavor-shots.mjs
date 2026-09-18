/**
 * Build the flavour shots for the product pages.
 *
 * The flavour lists are names and nothing else — that is all the design file
 * and all the Tilda export ever carried, on every one of the sixteen products.
 * The photographs are coming separately, so this reads whatever is dropped in
 * and the page shows what exists: a product with shots gets a grid of them, a
 * product without keeps the field of names it has today, and a product with
 * some of each shows the shots first and the rest as names. Nothing has to be
 * finished before any of it is useful.
 *
 * Drop files in as `assets/product-flavors/<slug>/<Flavour Name>.<ext>`, where
 * the file name is the flavour exactly as `product-details.json` lists it —
 * case and spacing included, since that is what the page prints. Anything that
 * does not match a listed flavour is reported rather than silently built, which
 * is the whole reason the name is the key: a typo shows up here instead of as a
 * picture that never appears.
 *
 * Whatever arrives comes out the same shape. A cut-out on transparency is
 * trimmed and set on a wash of the product's own colour, the way the catalogue
 * tiles are built; a photograph with its own background is cropped to the
 * square. So the page can treat every shot alike and the grid stays a grid
 * whichever way the shots were taken.
 *
 * Run: node scripts/build-flavor-shots.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCES = path.resolve("assets/product-flavors");
const IMAGES = path.resolve("public/images");
const DETAILS = path.resolve("src/data/product-details.json");
const HEROES = path.resolve("src/data/product-heroes.json");
const WASHES = path.resolve("src/data/product-washes.ts");
const PRODUCTS = path.resolve("src/data/products.ts");
const MANIFEST = path.resolve("src/data/flavor-shots.json");

/** Square, and delivered at twice the largest size the grid asks for. */
const SIZE = 560;
/** How much of the square a trimmed cut-out fills. */
const SUBJECT = 0.82;

const details = JSON.parse(fs.readFileSync(DETAILS, "utf8"));
const heroes = JSON.parse(fs.readFileSync(HEROES, "utf8"));

const colours = Object.fromEntries(
  [
    ...fs
      .readFileSync(PRODUCTS, "utf8")
      .matchAll(/slug: "([a-z-]+)",[\s\S]{0,900}?backgroundColor: "(#[0-9a-f]{6})"/g),
  ].map((match) => [match[1], match[2]]),
);

const washes = Object.fromEntries(
  [
    ...fs
      .readFileSync(WASHES, "utf8")
      .matchAll(/"?([a-z-]+)"?: \{ from: "(#[0-9a-f]{6})", to: "(#[0-9a-f]{6})" \}/g),
  ].map((match) => [match[1], { from: match[2], to: match[3] }]),
);

/** The two tones a product's wash runs between — the page's own order. */
function wash(slug) {
  if (heroes[slug]) return [heroes[slug].band, heroes[slug].bandFoot];
  if (washes[slug]) return [washes[slug].from, washes[slug].to];
  const colour = colours[slug] ?? "#e5e5e5";
  return [lighten(colour, 0.22), colour];
}

function lighten(hex, amount) {
  const channel = (index) => {
    const value = parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
    return Math.round(value + (255 - value) * amount);
  };
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

function field([head, foot]) {
  return Buffer.from(
    `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${head}"/>
          <stop offset="1" stop-color="${foot}"/>
        </linearGradient>
      </defs>
      <rect width="${SIZE}" height="${SIZE}" fill="url(#wash)"/>
    </svg>`,
  );
}

/** `"Purple Yum Ube"` → `"purple-yum-ube"`, for the file that ships. */
function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Whether enough of the source is transparent for it to be a cut-out. */
async function isCutOut(file) {
  const { hasAlpha } = await sharp(file).metadata();
  if (!hasAlpha) return false;
  const { data, info } = await sharp(file)
    .resize(64, 64, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let clear = 0;
  for (let index = 3; index < data.length; index += 4) if (data[index] < 24) clear += 1;
  return clear / (info.width * info.height) > 0.08;
}

async function build(slug, file) {
  if (await isCutOut(file)) {
    const subject = await sharp(file)
      .trim()
      .resize({
        width: Math.round(SIZE * SUBJECT),
        height: Math.round(SIZE * SUBJECT),
        fit: "inside",
      })
      .toBuffer();
    const { width, height } = await sharp(subject).metadata();
    return sharp(field(wash(slug)))
      .composite([
        {
          input: subject,
          left: Math.round((SIZE - width) / 2),
          top: Math.round((SIZE - height) / 2),
        },
      ])
      .webp({ quality: 84 })
      .toBuffer();
  }

  return sharp(file)
    .resize(SIZE, SIZE, { fit: "cover", position: "attention" })
    .webp({ quality: 84 })
    .toBuffer();
}

const manifest = {};
const built = [];
const unmatched = [];

if (!fs.existsSync(SOURCES)) {
  fs.mkdirSync(SOURCES, { recursive: true });
}

for (const slug of fs.readdirSync(SOURCES)) {
  const folder = path.join(SOURCES, slug);
  if (!fs.statSync(folder).isDirectory()) continue;

  const listed = details[slug]?.flavors?.items ?? [];
  if (!listed.length) {
    unmatched.push(`${slug}/ — no product by that slug lists any flavour`);
    continue;
  }
  // Matched on the trimmed, case-folded name so a file called `classic.png`
  // still finds `Classic`; the manifest keeps the listed spelling, because that
  // is what the page prints and what it looks the shot up by.
  const byName = new Map(listed.map((flavour) => [flavour.trim().toLowerCase(), flavour]));

  for (const entry of fs.readdirSync(folder)) {
    if (!/\.(png|jpe?g|webp|avif|tiff?)$/i.test(entry)) continue;
    const name = byName.get(path.parse(entry).name.trim().toLowerCase());
    if (!name) {
      unmatched.push(`${slug}/${entry} — no flavour of that name on /${slug}`);
      continue;
    }

    const out = `flavor-${slug}-${slugify(name)}.webp`;
    fs.writeFileSync(path.join(IMAGES, out), await build(slug, path.join(folder, entry)));
    manifest[slug] ??= {};
    manifest[slug][name] = `/images/${out}`;
    built.push(`${slug}/${name}`);
  }
}

for (const slug of Object.keys(manifest)) {
  manifest[slug] = Object.fromEntries(Object.entries(manifest[slug]).sort());
}

fs.writeFileSync(
  MANIFEST,
  `${JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2)}\n`,
  "utf8",
);

if (built.length) {
  const covered = Object.entries(manifest)
    .map(([slug, shots]) => `${slug} ${Object.keys(shots).length}/${details[slug].flavors.items.length}`)
    .join(", ");
  console.log(`Wrote ${built.length} flavour shots at ${SIZE}x${SIZE}: ${covered}.`);
} else {
  console.log(`No flavour artwork yet. Drop files into ${path.relative(process.cwd(), SOURCES)}/<slug>/.`);
}

if (unmatched.length) {
  console.log(`\nNot built:\n- ${unmatched.join("\n- ")}`);
  process.exitCode = 1;
}
