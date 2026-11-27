import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const IMAGES = path.resolve("public/images");
const HEROES = path.resolve("src/data/product-heroes.json");
const MANIFEST = path.resolve("src/data/catalog-tiles.json");

const WIDTH = 860;
const HEIGHT = Math.round((WIDTH * 5) / 4);

const DENSE = { width: 0.72, height: 0.78 };
const SPARSE_BLEED = 1.06;
const DENSITY = 0.8;
const BASELINE = 0.54;

const heroes = JSON.parse(fs.readFileSync(HEROES, "utf8"));

const washes = Object.fromEntries(
  [
    ...fs
      .readFileSync(path.resolve("src/data/product-washes.ts"), "utf8")
      .matchAll(/"?([a-z-]+)"?: { from: "(#[0-9a-f]{6})", to: "(#[0-9a-f]{6})" }/g),
  ].map((match) => [match[1], { from: match[2], to: match[3] }]),
);

const COLOURS = Object.fromEntries(
  [
    ...fs
      .readFileSync(path.resolve("src/data/products.ts"), "utf8")
      .matchAll(/slug: "([a-z-]+)",[\s\S]{0,900}?backgroundColor: "(#[0-9a-f]{6})"/g),
  ].map((match) => [match[1], match[2]]),
);

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

function lighten(hex, amount) {
  const channel = (index) => {
    const value = parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
    return Math.round(value + (255 - value) * amount);
  };
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

async function density(image) {
  const { data, info } = await sharp(image).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let opaque = 0;
  for (let index = 3; index < data.length; index += 4) if (data[index] > 24) opaque += 1;
  return opaque / (info.width * info.height);
}

async function standing(trimmed) {
  const input = await sharp(trimmed)
    .resize({
      width: Math.round(WIDTH * DENSE.width),
      height: Math.round(HEIGHT * DENSE.height),
      fit: "inside",
    })
    .toBuffer();
  const { width, height } = await sharp(input).metadata();
  return {
    input,
    left: Math.round((WIDTH - width) / 2),
    top: Math.round(HEIGHT * BASELINE - height / 2),
  };
}

async function filling(trimmed) {
  const grown = await sharp(trimmed)
    .resize({
      width: Math.round(WIDTH * SPARSE_BLEED),
      height: Math.round(HEIGHT * SPARSE_BLEED),
      fit: "outside",
    })
    .toBuffer();
  const { width, height } = await sharp(grown).metadata();
  const input = await sharp(grown)
    .extract({
      left: Math.round((width - WIDTH) / 2),
      top: Math.round((height - HEIGHT) / 2),
      width: WIDTH,
      height: HEIGHT,
    })
    .toBuffer();
  return { input, left: 0, top: 0 };
}

async function fromPack(slug) {
  const file = path.join(IMAGES, `pack-${slug}.webp`);
  if (!fs.existsSync(file)) return null;

  const colour = COLOURS[slug] ?? "#e5e5e5";
  const [head, foot] = heroes[slug]
    ? [heroes[slug].band, heroes[slug].bandFoot]
    : washes[slug]
      ? [washes[slug].from, washes[slug].to]
      : [lighten(colour, 0.22), colour];
  const trimmed = await sharp(file).trim().toBuffer();
  const layer =
    (await density(trimmed)) >= DENSITY ? await standing(trimmed) : await filling(trimmed);

  return sharp(field(head, foot))
    .composite([layer])
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
