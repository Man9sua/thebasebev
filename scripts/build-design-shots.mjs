import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SHOT_SOURCES = path.resolve("assets/design-shots");
const SCENE_SOURCES = path.resolve("assets/design-scenes");
const IMAGES = path.resolve("public/images");

const SHOT_WIDTH = 540;
const SHOT_HEIGHT = 826;

const GLASS_HEIGHT = 275 * 2;
const GLASS_BASE = 321 * 2;
const GLASS_MAX_WIDTH = 205 * 2;
const OPAQUE = 8;

const GROUND_WIDTH_RATIO = 1.0;
const GROUND_FLATNESS = 0.44;
const GROUND_OFFSET_X = 0.17;
const GROUND_BLUR_RATIO = 0.05;
const GROUND_OPACITY = 0.52;
const GROUND_ROTATION = -5.63;
const GROUND_COLOUR = "#ccc4a7";

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

async function ground(glassCentre, glassWidth) {
  const rx = (glassWidth * GROUND_WIDTH_RATIO) / 2;
  const ry = rx * GROUND_FLATNESS;
  const cx = glassCentre + glassWidth * GROUND_OFFSET_X;
  const cy = GLASS_BASE;
  const blur = Math.max(0.5, glassWidth * GROUND_BLUR_RATIO);

  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SHOT_WIDTH}" height="${SHOT_HEIGHT}">
  <defs>
    <radialGradient id="g" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${GROUND_COLOUR}" stop-opacity="${GROUND_OPACITY}"/>
      <stop offset="0.45" stop-color="${GROUND_COLOUR}" stop-opacity="${GROUND_OPACITY * 0.7}"/>
      <stop offset="1" stop-color="${GROUND_COLOUR}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <g transform="rotate(${GROUND_ROTATION} ${cx} ${cy})">
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#g)"/>
  </g>
</svg>`,
  );

  return sharp(svg).blur(blur).png().toBuffer();
}

let shots = 0;

for (const slug of SLUGS) {
  const from = path.join(SHOT_SOURCES, `${slug}.png`);
  if (!fs.existsSync(from)) throw new Error(`Missing design shot for ${slug}: ${from}`);

  const bounds = await drinkBounds(from);
  const scale = Math.min(
    GLASS_HEIGHT / bounds.height,
    GLASS_MAX_WIDTH / bounds.width,
  );
  const width = Math.max(1, Math.round(bounds.width * scale));
  const height = Math.max(1, Math.round(bounds.height * scale));

  const drink = await sharp(from).extract(bounds).resize(width, height).png().toBuffer();
  const left = Math.round((SHOT_WIDTH - width) / 2);

  await sharp({
    create: {
      width: SHOT_WIDTH,
      height: SHOT_HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: await ground(left + width / 2, width), top: 0, left: 0 },
      { input: drink, left, top: GLASS_BASE - height },
    ])
    .webp({ quality: 84, effort: 6, alphaQuality: 100 })
    .toFile(path.join(IMAGES, `shot-${slug}.webp`));

  shots += 1;
  console.log(`shot-${slug}.webp  glass ${width}x${height} standing at ${GLASS_BASE}`);
}

let scenes = 0;

for (const [name, { width, alpha }] of Object.entries(SCENES)) {
  const from = path.join(SCENE_SOURCES, `${name}.png`);
  if (!fs.existsSync(from)) throw new Error(`Missing design scene: ${from}`);

  const pipeline = sharp(from).resize({ width, withoutEnlargement: true });
  const flattened = alpha ? pipeline : pipeline.flatten({ background: "#ffffff" });

  const info = await flattened
    .webp({ quality: 82, effort: 6, alphaQuality: alpha ? 100 : undefined })
    .toFile(path.join(IMAGES, `home-${name}.webp`));

  scenes += 1;
  console.log(`home-${name}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)}kB`);
}

console.log(`\n${shots} shots, ${scenes} scenes written to public/images.`);
