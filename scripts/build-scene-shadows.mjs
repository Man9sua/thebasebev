import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const IMAGES = path.resolve("public/images");

const WIDTH = 236;
const HEIGHT = 118;

const SHADE = [164, 196, 176];

const CENTRE_X = 0.34;
const CENTRE_Y = 0.95;
const REACH_X = 0.59;
const REACH_Y = 0.45;

const pixels = Buffer.alloc(WIDTH * HEIGHT * 4);

for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    const u = (x + 0.5) / WIDTH;
    const v = (y + 0.5) / HEIGHT;

    const outside = ((u - 0.5) / 0.5) ** 2 + ((v - 0.5) / 0.5) ** 2;

    const reach = Math.hypot((u - CENTRE_X) / REACH_X, (v - CENTRE_Y) / REACH_Y);
    const alpha = outside > 1 ? 0 : Math.max(0, 1 - reach);

    const at = (y * WIDTH + x) * 4;
    pixels[at] = SHADE[0];
    pixels[at + 1] = SHADE[1];
    pixels[at + 2] = SHADE[2];
    pixels[at + 3] = Math.round(alpha * 255);
  }
}

const out = path.join(IMAGES, "scene-shade-sugar-free.webp");
await sharp(pixels, { raw: { width: WIDTH, height: HEIGHT, channels: 4 } })
  .blur(1.2)
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(out);

const written = fs.statSync(out);
console.log(`Scene shadows built: ${path.basename(out)} ${WIDTH}x${HEIGHT}, ${written.size} bytes.`);
