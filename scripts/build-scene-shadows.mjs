/**
 * Draw the ground shadows a collage needs as artwork, not as a CSS fill.
 *
 * Sugar Free's drink stands on a blurred ellipse in the design file. The export
 * could not carry the blur, so the layer arrived as a flat fill with a linear
 * ramp across it — and a fill has an edge, which read on the card as a mark on
 * the ground beside the glass rather than as the shade the glass stands in.
 *
 * Writing a gradient back into the layer does not work either, and the reason
 * is in `ProductHero.module.css`: every scene layer is a one-pixel box carrying
 * the design's own matrix, so a `background-image` is a gradient resolved
 * against a 1px box and then stretched by two hundred. A picture has no such
 * problem — it is sampled after the transform like every other scene layer —
 * so the shadow is drawn here once and placed there as artwork.
 *
 * The shape is measured off the frame rather than invented. Reading the file's
 * own render where the card's ground shows past the glass, in hundredths of
 * this green, layer coordinates across and down:
 *
 *          180  190  200  210  220  230  240
 *   325      -    -    -    -    6    0    0
 *   330      -    -    -    -   14    0    0
 *   335      -    -    -   37   21    6    0
 *   340      -    -   52   44   29   14    0
 *   345      -   73   67   52    0    0    0
 *   350      0    0    0    0    0    0    0
 *
 * Everything left of those dashes is behind the glass in both compositions and
 * cannot be read. Projected into the layer's own square — the matrix skews it,
 * so this is not the same as the card's axes — those readings put the darkest
 * point at 34% across and 95% down and run out at 59% and 45% of the square,
 * which is what the constants below are.
 *
 * Run: node scripts/build-scene-shadows.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const IMAGES = path.resolve("public/images");

/** Twice the 117.6 x 59 the layer measures, so a 2x phone has pixels to spare. */
const WIDTH = 236;
const HEIGHT = 118;

/** #a4c4b0 — the file's own shadow colour, shared with the desktop card. */
const SHADE = [164, 196, 176];

/** Where the shadow is darkest, and how far it reaches, in the layer's square. */
const CENTRE_X = 0.34;
const CENTRE_Y = 0.95;
const REACH_X = 0.59;
const REACH_Y = 0.45;

const pixels = Buffer.alloc(WIDTH * HEIGHT * 4);

for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    // Sample at the pixel's middle: at this size an edge sample costs a visible
    // half-pixel of reach.
    const u = (x + 0.5) / WIDTH;
    const v = (y + 0.5) / HEIGHT;

    // The design's layer is an ellipse inscribed in its box, and the hard
    // nothing under the wedge in the readings above is that ellipse's own edge.
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
  // The ellipse's own edge is a hard line in the file too, but one drawn at the
  // file's resolution rather than at this one; a pixel of softening is what
  // keeps it from reading as a cut at 2x.
  .blur(1.2)
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(out);

const written = fs.statSync(out);
console.log(`Scene shadows built: ${path.basename(out)} ${WIDTH}x${HEIGHT}, ${written.size} bytes.`);
