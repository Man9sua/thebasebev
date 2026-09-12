/**
 * Build the product shots and scene photography for the redesigned homepage.
 *
 * The sources are the images carried inside the design file itself, dropped in
 * as `assets/design-shots/<slug>.png` and `assets/design-scenes/<name>.png`.
 * They are inputs, not assets: nothing there is served, and nothing there is
 * committed — see the README beside them.
 *
 * **Why the shots are rebuilt rather than placed as the file places them.**
 * In the design each of the sixteen glasses carries its own size and offset
 * inside the card: from 238.59x357.50 to 322.11x462.71, at y from -53.10 to
 * +15.63. Two things are mixed together in that spread. One is hand-nudging —
 * the card's wash is 283.83x424.06 at (-7, -6) on all sixteen and its ground
 * gradient 248.58x111.97 on fifteen, so the frame is fixed and only the glass
 * wanders. The other is a stretch: the sources are all 1000x1500, aspect
 * 0.667, but ten of the placements are 0.729 — the glass is 9% wider than it
 * is tall, which is distortion rather than art direction.
 *
 * So this trims every source to its own edges, fits it to one box at its true
 * aspect, and stands all sixteen on one baseline. The card then needs one set
 * of numbers instead of sixteen, the glasses are not stretched, and the row
 * reads as a row — the same reasoning as `build-pack-shots.mjs`.
 *
 * Run: node scripts/build-design-shots.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SHOT_SOURCES = path.resolve("assets/design-shots");
const SCENE_SOURCES = path.resolve("assets/design-scenes");
const IMAGES = path.resolve("public/images");

/**
 * The canvas is the whole card, at twice the 270x413 the design draws it at, so
 * the glass still holds up on a 2x screen. Writing the tile rather than a box
 * inside it means the card's CSS places one full-bleed layer and carries no
 * offsets of its own.
 */
const SHOT_WIDTH = 540;
const SHOT_HEIGHT = 826;

/**
 * Where the glass goes, in the design's own card units, doubled.
 *
 * Measured off the design's own render rather than off its placement boxes.
 * Those boxes each hold a whole 1000x1500 source, margins included, so they say
 * nothing directly about how big the drink comes out; rendering the grid at 1:1
 * and measuring the sixteen drinks gives 217 to 321 tall, median 275, all
 * standing on a base at 306 to 339, median 321. The base is the consistent one,
 * which is the design's intent: the row reads as a row because the drinks stand
 * on a line. The name is printed at y 333, just under it.
 */
const GLASS_HEIGHT = 275 * 2;
const GLASS_BASE = 321 * 2;
/** The widest a glass may run before it is pulled back. The design reaches 185. */
const GLASS_MAX_WIDTH = 205 * 2;
/** Below this the pixel is the photograph's own soft shadow, not the glass. */
const OPAQUE = 8;

/**
 * The shadow the drink casts, as multiples of that drink's own width.
 *
 * Measured off the design's own tile rather than reasoned about. Reading the
 * rows of a rendered card downwards from the base, the shadow contributes
 * **nothing below the base at all**: the whole shape sits above it, behind the
 * glass, and the only part that shows is the wedge that escapes to the right.
 * That is why it reads as a shadow cast on the same plane rather than as a
 * puddle the glass is standing in.
 *
 * So: a flat ellipse, bottom edge tangent to the base, dense end hidden behind
 * the drink and fading out to the right — the design's own left-to-right ramp,
 * which is the one part of it worth keeping literally.
 *
 * The dense end starts at the drink's **centre**, not its left edge. Anchoring
 * it to the left edge is what put a grey lobe beside the narrow-footed glasses:
 * a tapered glass is far wider at the lip than at the base, so an ellipse sized
 * to its full width stuck out past the foot it was supposed to hide behind.
 * From the centre, the dense half is always under the drink.
 */
const GROUND_WIDTH_RATIO = 1.12;
/** Flatness, as the design has it: 88.7 tall on 241 wide. */
const GROUND_FLATNESS = 0.3;
/** Only enough to kill the aliasing on the arc; any more and it is a halo. */
const GROUND_BLUR_RATIO = 0.01;
/** Figma rotates counter-clockwise, so the SVG angle is negated. */
const GROUND_ROTATION = -5.63;
const GROUND_COLOUR = "#ccc4a7";

/**
 * The ramp along the ellipse, in its own width.
 *
 * A plain ramp from the dense end gives an even wash across the visible tail,
 * where the design is distinctly darker at the contact and falls off fast —
 * profiled at the base it reads -8, -11, -12 and then nothing, against an even
 * -13 for a plain ramp. So the ramp holds full strength until the drink's right
 * edge, which is 0.45 along at this width, and is gone by 0.7.
 *
 * The strength and the lift are both tuned against that profile rather than
 * derived: 0.25 puts the peak at the design's -12, and holding the shape 6
 * above the base is what makes it stop where the design's stops instead of
 * leaking under the foot of the glass.
 */
const GROUND_HOLD_STOP = 0.45;
const GROUND_FADE_STOP = 0.7;
const GROUND_OPACITY = 0.25;
const GROUND_LIFT = 6 * 2;

/**
 * Scene photography: width to serve at, and whether it keeps its alpha channel.
 *
 * `signature-card` and `sample-card` are the two offer cards exported from the
 * design already composed, at twice the 700x413 and 395x413 they are drawn at.
 * The sample card is a collage — one pack at 20 degrees, two more at 21 and 41,
 * over a brown gradient — and reproducing that as five positioned, rotated
 * layers in CSS would be five sets of magic numbers standing in for one picture.
 * They keep their alpha because both cards have rounded corners.
 */
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

/**
 * The tightest rectangle holding the drink.
 *
 * Every source here is a cut-out on transparency, so alpha is the only measure
 * needed — unlike the pack shots, which also have to cope with a white sweep.
 */
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

/**
 * The shadow, rendered at card size and blurred so it has no edge.
 *
 * Tied to the glass's own centre, base and width, so it cannot drift from the
 * glass that casts it at any card size, on the homepage or the shelf.
 */
async function ground(glassCentre, glassWidth) {
  const w = glassWidth * GROUND_WIDTH_RATIO;
  const rx = w / 2;
  const ry = (w * GROUND_FLATNESS) / 2;
  // Dense end under the drink's centre; bottom edge tangent to the base.
  const cx = glassCentre + rx;
  const cy = GLASS_BASE - GROUND_LIFT - ry;
  const blur = Math.max(0.3, glassWidth * GROUND_BLUR_RATIO);

  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SHOT_WIDTH}" height="${SHOT_HEIGHT}">
  <defs>
    <linearGradient id="g" x1="0" y1="0.5" x2="1" y2="0.5">
      <stop offset="0" stop-color="${GROUND_COLOUR}" stop-opacity="${GROUND_OPACITY}"/>
      <stop offset="${GROUND_HOLD_STOP}" stop-color="${GROUND_COLOUR}" stop-opacity="${GROUND_OPACITY}"/>
      <stop offset="${GROUND_FADE_STOP}" stop-color="${GROUND_COLOUR}" stop-opacity="0"/>
    </linearGradient>
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
  // One height for all sixteen, pulled back only if that would make a wide
  // glass run past the ground it stands on.
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
    // Ground first: it belongs behind the glass it is cast by.
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
  // A photograph gains nothing from an alpha channel and pays for it in bytes.
  const flattened = alpha ? pipeline : pipeline.flatten({ background: "#ffffff" });

  const info = await flattened
    .webp({ quality: 82, effort: 6, alphaQuality: alpha ? 100 : undefined })
    .toFile(path.join(IMAGES, `home-${name}.webp`));

  scenes += 1;
  console.log(`home-${name}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)}kB`);
}

console.log(`\n${shots} shots, ${scenes} scenes written to public/images.`);
