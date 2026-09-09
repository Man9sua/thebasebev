/**
 * The three product cards that are not a pouch and a drink.
 *
 * Garnish, Sugar Free and Tea are photographic collages in the design file —
 * sachets, leaves and a glass thrown across the wash — and neither the pack
 * shot the other thirteen stand on nor the drink beside it appears on them. So
 * those three carry their own list of layers here and the hero draws that.
 *
 * `m` is the layer's whole transform in the card's own space, composed with
 * every parent's, written in the order CSS takes it: a, b, c, d and then the
 * two offsets. Almost none of these sachets are square to the page — they are
 * thrown at anything from seventeen to a hundred and thirty-nine degrees — so a
 * corner and a size would not place a single one of them. `blur` is the layer
 * blur the file puts on the two that sit furthest back, halved: Figma's radius
 * is twice the standard deviation CSS asks for.
 *
 * The list is in the file's own order, which is the order it paints them in.
 * Boxes are the frame's: the 1200 card on the desktop and the 360 one on the
 * phone, both counted from the card's top left. The two are different
 * compositions rather than one scaled.
 *
 * The artwork is the files' own. A layer the file crops is exported already cut
 * to the window it shows; `cover` marks the ones it scales to fill their box
 * instead. The seals are left out — the page draws those itself, in the same
 * place on all sixteen.
 */

export type SceneLayer = {
  src: string;
  width: number;
  height: number;
  /** a, b, c, d, e, f — the CSS matrix, with e and f in frame units. */
  m: [number, number, number, number, number, number];
  cover?: boolean;
  blur?: number;
};

export const productScene: Record<string, { desktop: SceneLayer[]; phone: SceneLayer[] }> = {
  "garnish": {
    desktop: [
      { src: "/images/scene-cdd1d94d.webp", width: 267.2593, height: 217.2133, m: [0.9545, 0.2981, -0.2981, 0.9545, 1432.3305, 332.9095], cover: true },
      { src: "/images/scene-f16e70efc0x0.webp", width: 157.7597, height: 177.8195, m: [-0.2584, 0.966, 0.966, 0.2584, 1392.9896, 191.4377] },
      { src: "/images/scene-a8524cbfc3419x1973.webp", width: 450.0353, height: 655.1899, m: [1, 0, 0, 1, 61.5906, 56.8594] },
    ],
    phone: [
      { src: "/images/scene-48330e21.webp", width: 231.6396, height: 261.7003, m: [1, 0, 0, 1, 148.3555, 105.0342], cover: true },
      { src: "/images/scene-a8524cbfc3419x1973.webp", width: 201.1089, height: 292.8314, m: [1, 0, 0, 1, 24.4512, 66] },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 123.657, height: 83.8115, m: [-0.1058, 0.9944, -0.9944, -0.1058, 527.3408, 325.8765], blur: 2 },
      { src: "/images/scene-5f33d9e4.webp", width: 177.202, height: 144.0199, m: [0.781, -0.6246, 0.6246, 0.781, 578.5156, 99.6065], cover: true },
      { src: "/images/scene-cdd1d94d.webp", width: 157.562, height: 128.0576, m: [0.9545, 0.2981, -0.2981, 0.9545, 441.5068, 181.9322], cover: true },
      { src: "/images/scene-3c519f85.webp", width: 192.8207, height: 156.7138, m: [0.9511, -0.309, 0.309, 0.9511, 670.5391, 255.2784], cover: true },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 71.6846, height: 48.5859, m: [1, 0, 0, 1, 522.1064, 191.1695] },
      { src: "/images/scene-f16e70efc0x0.webp", width: 93.0068, height: 104.833, m: [-0.6423, 0.7665, -0.7665, -0.6423, 676.6777, 184.5928] },
      { src: "/images/scene-f16e70efc0x0.webp", width: 93.0068, height: 104.833, m: [-0.2584, 0.966, 0.966, 0.2584, 418.3135, 98.5279] },
      { src: "/images/scene-0a906e54c0x3180.webp", width: 169.6461, height: 184.4492, m: [1, 0, 0, 1, 525.1582, 172.525] },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 171.4538, height: 116.2069, m: [-0.3386, 0.9409, -0.9409, -0.3386, 561.4424, 567.6196], blur: 2 },
    ],
  },
  "sugar-free": {
    desktop: [
      { src: "/images/scene-f16e70efc5898x432.webp", width: 209.749, height: 142.1624, m: [-0.1058, 0.9944, -0.9944, -0.1058, 167.9235, 577.0702], blur: 2 },
      { src: "/images/scene-5f33d9e4.webp", width: 300.573, height: 244.2888, m: [0.781, -0.6246, 0.6246, 0.781, 254.7271, 193.2681], cover: true },
      { src: "/images/scene-cdd1d94d.webp", width: 267.2593, height: 217.2133, m: [0.9545, 0.2981, -0.2981, 0.9545, 22.3305, 332.9095], cover: true },
      { src: "/images/scene-3c519f85.webp", width: 327.0656, height: 265.8205, m: [0.9511, -0.309, 0.309, 0.9511, 410.8188, 457.3213], cover: true },
      { src: "/images/scene-f16e70efc0x0.webp", width: 157.7597, height: 177.8195, m: [-0.7528, 0.6582, 0.6582, 0.7528, 437.3321, 379.345] },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 121.5925, height: 82.4123, m: [1, 0, 0, 1, 159.0449, 348.5779] },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 156.3921, height: 105.9985, m: [0.211, 0.9775, 0.9775, -0.211, 569.95, 381.684], blur: 2 },
      { src: "/images/scene-f16e70efc7127x6439.webp", width: 82.5183, height: 157.9891, m: [1, 0, 0, 1, 427.935, 379.345] },
      { src: "/images/scene-f16e70efc0x0.webp", width: 157.7597, height: 177.8195, m: [-0.6423, 0.7665, -0.7665, -0.6423, 421.2313, 337.4233] },
      { src: "/images/scene-f16e70efc0x0.webp", width: 157.7597, height: 177.8195, m: [-0.2584, 0.966, 0.966, 0.2584, -17.0104, 191.4377] },
      { src: "/images/scene-0a906e54c0x3180.webp", width: 363.3712, height: 395.0787, m: [1, 0, 0, 1, 123.4108, 330.5174] },
    ],
    phone: [
      { src: "/images/scene-48330e21.webp", width: 231.6396, height: 261.7003, m: [1, 0, 0, 1, -307.6445, 105.0342], cover: true },
      { src: "/images/scene-e84aac77.webp", width: 285.4668, height: 297.4512, m: [1, 0, 0, 1, 519.4375, 99.7031], cover: true },
      { src: "/images/scene-720e38e5.webp", width: 140.4985, height: 114.1893, m: [0.9835, 0.1807, -0.1807, 0.9835, 467.9863, 66.6094], cover: true, blur: 2 },
      { src: "/images/scene-1eec80f6.webp", width: 181.2666, height: 141.5898, m: [0.94, -0.3411, 0.3411, 0.94, 366.8418, 193.3984], cover: true, blur: 1 },
      { src: "/images/scene-37eb1716.webp", width: 216.0363, height: 175.5822, m: [0.9322, 0.3619, -0.3619, 0.9322, 468.3184, 213.0391], cover: true },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 123.657, height: 83.8115, m: [-0.1058, 0.9944, -0.9944, -0.1058, 71.3408, 325.8765], blur: 2 },
      { src: "/images/scene-5f33d9e4.webp", width: 177.202, height: 144.0199, m: [0.781, -0.6246, 0.6246, 0.781, 122.5156, 99.6065], cover: true },
      { src: "/images/scene-cdd1d94d.webp", width: 157.562, height: 128.0576, m: [0.9545, 0.2981, -0.2981, 0.9545, -14.4932, 181.9322], cover: true },
      { src: "/images/scene-3c519f85.webp", width: 192.8207, height: 156.7138, m: [0.9511, -0.309, 0.309, 0.9511, 214.5391, 255.2784], cover: true },
      { src: "/images/scene-f16e70efc0x0.webp", width: 93.0068, height: 104.833, m: [-0.7528, 0.6582, 0.6582, 0.7528, 230.1699, 209.3077] },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 71.6846, height: 48.5859, m: [1, 0, 0, 1, 66.1064, 191.1695] },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 92.2006, height: 62.4911, m: [0.211, 0.9775, 0.9775, -0.211, 308.3545, 210.6866], blur: 2 },
      { src: "/images/scene-f16e70efc7127x6439.webp", width: 48.6484, height: 93.1421, m: [1, 0, 0, 1, 224.6299, 209.3077] },
      { src: "/images/scene-f16e70efc0x0.webp", width: 93.0068, height: 104.833, m: [-0.6423, 0.7665, -0.7665, -0.6423, 220.6777, 184.5928] },
      { src: "/images/scene-f16e70efc0x0.webp", width: 93.0068, height: 104.833, m: [-0.2584, 0.966, 0.966, 0.2584, -37.6865, 98.5279] },
      { src: "/images/scene-0a906e54c0x3180.webp", width: 169.6461, height: 184.4492, m: [1, 0, 0, 1, 69.1582, 172.525] },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 171.4538, height: 116.2069, m: [-0.3386, 0.9409, -0.9409, -0.3386, 105.4424, 567.6196], blur: 2 },
    ],
  },
  "tea": {
    desktop: [
      { src: "/images/scene-e84aac77.webp", width: 534.3839, height: 646.816, m: [1, 0, 0, 1, 161, 124], cover: true },
      { src: "/images/scene-720e38e5.webp", width: 226.1303, height: 183.786, m: [0.9835, 0.1807, -0.1807, 0.9835, 102.5508, 137.6484], cover: true, blur: 2 },
      { src: "/images/scene-1eec80f6.webp", width: 356.7671, height: 278.6757, m: [0.94, -0.3411, 0.3411, 0.94, -154.1423, 308.0391], cover: true, blur: 1 },
      { src: "/images/scene-37eb1716.webp", width: 419.011, height: 340.5486, m: [0.9322, 0.3619, -0.3619, 0.9322, 63.1201, 339.6484], cover: true },
    ],
    phone: [
      { src: "/images/scene-e84aac77.webp", width: 285.4668, height: 297.4512, m: [1, 0, 0, 1, 87.4375, 99.7031], cover: true },
      { src: "/images/scene-720e38e5.webp", width: 140.4985, height: 114.1893, m: [0.9835, 0.1807, -0.1807, 0.9835, 35.9863, 66.6094], cover: true, blur: 2 },
      { src: "/images/scene-1eec80f6.webp", width: 181.2666, height: 141.5898, m: [0.94, -0.3411, 0.3411, 0.94, -65.1582, 193.3984], cover: true, blur: 1 },
      { src: "/images/scene-37eb1716.webp", width: 216.0363, height: 175.5822, m: [0.9322, 0.3619, -0.3619, 0.9322, 36.3184, 213.0391], cover: true },
      { src: "/images/scene-5f33d9e4.webp", width: 177.202, height: 144.0199, m: [0.781, -0.6246, 0.6246, 0.781, -309.4844, 99.6065], cover: true },
      { src: "/images/scene-3c519f85.webp", width: 192.8207, height: 156.7138, m: [0.9511, -0.309, 0.309, 0.9511, -217.4609, 255.2784], cover: true },
      { src: "/images/scene-f16e70efc0x0.webp", width: 93.0068, height: 104.833, m: [-0.7528, 0.6582, 0.6582, 0.7528, -201.8301, 209.3077] },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 92.2006, height: 62.4911, m: [0.211, 0.9775, 0.9775, -0.211, -123.6455, 210.6866], blur: 2 },
      { src: "/images/scene-f16e70efc7127x6439.webp", width: 48.6484, height: 93.1421, m: [1, 0, 0, 1, -207.3701, 209.3077] },
      { src: "/images/scene-f16e70efc0x0.webp", width: 93.0068, height: 104.833, m: [-0.6423, 0.7665, -0.7665, -0.6423, -211.3223, 184.5928] },
    ],
  },
};
