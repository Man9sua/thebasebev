/**
 * The three product cards that are not a pouch and a drink.
 *
 * Garnish, Sugar Free and Tea are photographic collages in both design files —
 * sachets, berries and a cup arranged over the wash — and neither the pack shot
 * the other thirteen stand on nor the drink beside it appears on them. So those
 * three carry their own list of layers here and the hero draws that instead.
 *
 * Boxes are the file's own: `left` from the frame's left edge and `top` from
 * the foot of the header, in the 1200 frame on the desktop and the 360 card on
 * the phone. The two are different compositions rather than one scaled, which
 * is why each carries its own list — Garnish is one photograph across on the
 * desktop and two overlapping on the phone.
 *
 * The artwork is the files' own too. A layer the file crops is exported already
 * cut to the window it shows, so nothing is cropped again at run time;
 * `cover` marks the ones the file scales to fill their box instead. The seals
 * are left out: the page draws those itself, in the same place on all sixteen.
 */

export type SceneLayer = {
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
  cover?: boolean;
};

export const productScene: Record<string, { desktop: SceneLayer[]; phone: SceneLayer[] }> = {
  "garnish": {
    desktop: [
      { src: "/images/scene-a8524cbfc3419x1973.webp", left: 61.59, top: -46.81, width: 450.04, height: 655.19 },
    ],
    phone: [
      { src: "/images/scene-a8524cbfc3419x1973.webp", left: 24.45, top: -42, width: 201.11, height: 292.83 },
      { src: "/images/scene-48330e21.webp", left: 148.36, top: -2.97, width: 231.64, height: 261.7, cover: true },
    ],
  },
  "sugar-free": {
    desktop: [
      { src: "/images/scene-f16e70efc0x0.webp", left: -17.01, top: 87.77, width: 157.76, height: 177.82 },
      { src: "/images/scene-5f33d9e4.webp", left: 254.73, top: 89.6, width: 300.57, height: 244.29, cover: true },
      { src: "/images/scene-0a906e54c0x3180.webp", left: 123.41, top: 226.85, width: 363.37, height: 395.08 },
      { src: "/images/scene-cdd1d94d.webp", left: 22.33, top: 229.24, width: 267.26, height: 217.21, cover: true },
      { src: "/images/scene-f16e70efc0x0.webp", left: 421.23, top: 233.75, width: 157.76, height: 177.82 },
      { src: "/images/scene-f16e70efc5898x432.webp", left: 159.04, top: 244.91, width: 121.59, height: 82.41 },
      { src: "/images/scene-f16e70efc0x0.webp", left: 437.33, top: 275.68, width: 157.76, height: 177.82 },
      { src: "/images/scene-f16e70efc7127x6439.webp", left: 427.93, top: 275.68, width: 82.52, height: 157.99 },
      { src: "/images/scene-f16e70efc5898x432.webp", left: 569.95, top: 278.01, width: 156.39, height: 106 },
      { src: "/images/scene-3c519f85.webp", left: 410.82, top: 353.65, width: 327.07, height: 265.82, cover: true },
      { src: "/images/scene-f16e70efc5898x432.webp", left: 167.92, top: 473.4, width: 209.75, height: 142.16 },
    ],
    phone: [
      { src: "/images/scene-f16e70efc0x0.webp", left: -37.69, top: -9.47, width: 93.01, height: 104.83 },
      { src: "/images/scene-5f33d9e4.webp", left: 122.52, top: -8.39, width: 177.2, height: 144.02, cover: true },
      { src: "/images/scene-0a906e54c0x3180.webp", left: 69.16, top: 64.52, width: 169.65, height: 184.45 },
      { src: "/images/scene-cdd1d94d.webp", left: -14.49, top: 73.93, width: 157.56, height: 128.06, cover: true },
      { src: "/images/scene-f16e70efc0x0.webp", left: 220.68, top: 76.59, width: 93.01, height: 104.83 },
      { src: "/images/scene-f16e70efc5898x432.webp", left: 66.11, top: 83.17, width: 71.68, height: 48.59 },
      { src: "/images/scene-f16e70efc0x0.webp", left: 230.17, top: 101.31, width: 93.01, height: 104.83 },
      { src: "/images/scene-f16e70efc7127x6439.webp", left: 224.63, top: 101.31, width: 48.65, height: 93.14 },
      { src: "/images/scene-f16e70efc5898x432.webp", left: 308.35, top: 102.69, width: 92.2, height: 62.49 },
      { src: "/images/scene-3c519f85.webp", left: 214.54, top: 147.28, width: 192.82, height: 156.71, cover: true },
      { src: "/images/scene-f16e70efc5898x432.webp", left: 71.34, top: 217.88, width: 123.66, height: 83.81 },
    ],
  },
  "tea": {
    desktop: [
      { src: "/images/scene-e84aac77.webp", left: 161, top: 20.33, width: 534.38, height: 646.82, cover: true },
      { src: "/images/scene-720e38e5.webp", left: 102.55, top: 33.98, width: 226.13, height: 183.79, cover: true },
      { src: "/images/scene-1eec80f6.webp", left: -154.14, top: 204.37, width: 356.77, height: 278.68, cover: true },
      { src: "/images/scene-37eb1716.webp", left: 63.12, top: 235.98, width: 419.01, height: 340.55, cover: true },
    ],
    phone: [
      { src: "/images/scene-720e38e5.webp", left: 35.99, top: -41.39, width: 140.5, height: 114.19, cover: true },
      { src: "/images/scene-e84aac77.webp", left: 87.44, top: -8.3, width: 285.47, height: 297.45, cover: true },
      { src: "/images/scene-1eec80f6.webp", left: -65.16, top: 85.4, width: 181.27, height: 141.59, cover: true },
      { src: "/images/scene-37eb1716.webp", left: 36.32, top: 105.04, width: 216.04, height: 175.58, cover: true },
    ],
  },
};
