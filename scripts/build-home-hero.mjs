/**
 * Build the homepage hero photograph.
 *
 * One source — the showroom, `assets/home-hero/showroom.jpg`, 5184 x 3888 and
 * 8.5 MB — and two crops, because the desktop hero and the phone's band want
 * different parts of the room.
 *
 * **Desktop.** The design places the photograph at 1530 x 1148 with its top 94
 * above the 1440 x 900 frame, which is a crop rather than a fit: the ceiling
 * goes, the sofas stay at the foot of the left column where the veil covers
 * them, and `WHERE TASTE BEGINS` lands clear on the right. Those numbers are
 * scaled back to the source here — 1440 of 1530 across, 900 of 1148 down, from
 * 94 — so the framing survives the photograph being replaced.
 *
 * **Phone.** The band is 390 x 420, and the design fills it from the same file
 * at `object-position: 72% 18%`. `cover` on an image this much wider than the
 * box crops sideways only, so the crop is the right 70% of the full height —
 * the staircase and the lettering, without the seating.
 *
 * Both are written at 1x and 2x. The source is not committed; see the README
 * beside it.
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE = path.join("assets", "home-hero", "showroom.jpg");
const IMAGES = path.join("public", "images");

/** The design's own placement, in the 1440 x 900 frame it draws. */
const DESKTOP_FRAME = { width: 1440, height: 900 };
const DESKTOP_PLACEMENT = { width: 1530, height: 1148, top: -94 };

/** The phone's band, and where the design holds the photograph inside it. */
const MOBILE_BAND = { width: 390, height: 420 };
const MOBILE_POSITION_X = 0.72;

const OUTPUTS = [
  { name: "home-hero-room", width: 1600, quality: 82 },
  { name: "home-hero-room-2x", width: 2880, quality: 76 },
  { name: "home-hero-room-mobile", width: 780, quality: 82 },
  { name: "home-hero-room-mobile-2x", width: 1170, quality: 76 },
];

function desktopCrop(source) {
  const scale = source.width / DESKTOP_PLACEMENT.width;
  return {
    left: 0,
    top: Math.round(-DESKTOP_PLACEMENT.top * scale),
    width: Math.min(source.width, Math.round(DESKTOP_FRAME.width * scale)),
    height: Math.round(DESKTOP_FRAME.height * scale),
  };
}

function mobileCrop(source) {
  // `cover`: the box is far taller than the source's aspect, so the whole
  // height is used and the width is what gets cut.
  const width = Math.round(source.height * (MOBILE_BAND.width / MOBILE_BAND.height));
  return {
    left: Math.round((source.width - width) * MOBILE_POSITION_X),
    top: 0,
    width,
    height: source.height,
  };
}

if (!fs.existsSync(SOURCE)) {
  console.error(`Missing ${SOURCE} — see assets/home-hero/README.md.`);
  process.exit(1);
}

const source = await sharp(SOURCE).metadata();
const crops = { desktop: desktopCrop(source), mobile: mobileCrop(source) };

for (const output of OUTPUTS) {
  const crop = output.name.includes("mobile") ? crops.mobile : crops.desktop;
  const file = path.join(IMAGES, `${output.name}.webp`);

  await sharp(SOURCE)
    .extract(crop)
    .resize({ width: output.width })
    .webp({ quality: output.quality })
    .toFile(file);

  const built = await sharp(file).metadata();
  const size = fs.statSync(file).size;
  console.log(
    `${output.name}.webp  ${built.width}x${built.height}  ${(size / 1024).toFixed(0)} KB`,
  );
}
