import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCES = path.resolve("assets/product-heroes");
const IMAGES = path.resolve("public/images");
const MANIFEST = path.resolve("src/data/product-heroes.json");

const CUT = 860;
const SAMPLE = { left: 6, head: 60, foot: 60 };
const BUSY = 50;

const PATCHES = [
  { left: 0, top: 60, width: 470, height: 260 },
  { left: 0, top: 300, width: 360, height: 280 },
];

function patchMask({ width, height }) {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="x" x1="0" x2="1"><stop offset="0.6" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
      <linearGradient id="y" y1="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="0.72" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
      <mask id="m"><rect width="${width}" height="${height}" fill="url(#y)"/></mask>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#x)" mask="url(#m)"/>
  </svg>`;
}

const hex = ({ r, g, b }) =>
  `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;

if (!fs.existsSync(SOURCES)) {
  throw new Error(`No banners in ${path.relative(process.cwd(), SOURCES)}.`);
}

const manifest = {};

for (const file of fs.readdirSync(SOURCES).sort()) {
  if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;

  const slug = file.replace(/\.[^.]+$/, "");
  const from = path.join(SOURCES, file);
  const metadata = await sharp(from).metadata();
  if (!metadata.width || !metadata.height) continue;

  const left = Math.round((CUT / 1684) * metadata.width);
  const crop = sharp(from).extract({
    left,
    top: 0,
    width: metadata.width - left,
    height: metadata.height,
  });

  const flat = await crop.png().toBuffer();
  const patched = [];
  for (const patch of PATCHES) {
    const region = await sharp(flat).extract(patch).png().toBuffer();
    const { channels } = await sharp(region).stats();
    const detail = Math.max(...channels.map((channel) => channel.stdev));
    if (detail > BUSY) continue;

    patched.push({
      input: await sharp(flat)
        .extract(patch)
        .blur(55)
        .composite([{ input: Buffer.from(patchMask(patch)), blend: "dest-in" }])
        .png()
        .toBuffer(),
      left: patch.left,
      top: patch.top,
    });
  }

  const buffer = await sharp(flat)
    .composite(patched)
    .webp({ quality: 84, effort: 5 })
    .toBuffer();

  fs.writeFileSync(path.join(IMAGES, `hero-${slug}.webp`), buffer);

  const read = async (top) => {
    const { data } = await sharp(buffer)
      .extract({ left: SAMPLE.left, top, width: 1, height: 1 })
      .raw()
      .toBuffer({ resolveWithObject: true });
    return hex({ r: data[0], g: data[1], b: data[2] });
  };

  manifest[slug] = {
    image: `/images/hero-${slug}.webp`,
    band: await read(SAMPLE.head),
    bandFoot: await read(metadata.height - SAMPLE.foot),
  };

  console.log(
    `hero-${slug}.webp  ${metadata.width - left}x${metadata.height}` +
      `  band ${manifest[slug].band} → ${manifest[slug].bandFoot}`,
  );
}

fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`\nWrote ${Object.keys(manifest).length} product heroes.`);
