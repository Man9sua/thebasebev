/**
 * The three product cards that are not a pouch and a drink.
 *
 * Garnish, Sugar Free and Tea are collages in the design file — sachets, leaves
 * and a glass thrown across the wash — and neither the pack shot the other
 * thirteen stand on nor the drink beside it appears on them. Those three carry
 * their own list of layers here and the hero draws that.
 *
 * A layer is either a picture or a fill, and both matter. The file lays black
 * gradients over the edges of Tea's photograph and beige ones over Garnish's;
 * without them a photograph sits on the card as a rectangle with four visible
 * sides instead of sinking into it. Fills as wide as the card are left out —
 * those are the file's own ground and its page-level veil, and the section
 * already paints the wash.
 *
 * `m` is the layer's whole transform in the card's own space, composed with
 * every parent's, in the order CSS takes it: a, b, c, d and then the two
 * offsets. Almost none of these sachets is square to the page — anything from
 * seventeen degrees to a hundred and thirty-nine — so a corner and a size would
 * not place a single one of them. `blur` is the file's own blur radius, which
 * CSS reads the same way — except on Sugar Free, whose two blurred sachets are
 * at full strength here and all but gone from the design's own export, so there
 * they are left out.
 *
 * A gradient's stops are projected onto the line CSS paints along, which is not
 * the file's own axis: CSS runs its line through the box's centre and measures
 * from the box's edge, so a stop can land outside 0-100% and still be right.
 * A ramp whose every stop lands outside its own box is a different matter — it
 * is one flat colour there, and the file uses that to lay a black veil across
 * Tea's photograph and a ground-coloured one across Sugar Free's sachets.
 * Painted as the data has them they cover the artwork the design shows through
 * them, so they are left out; what the design does with them is not in the file.
 *
 * The list is in the order the file stores them, which is the order it paints
 * them in — back to front. Boxes are the frame's: the 1200 card on the desktop
 * and the 360 one on the phone, both from the card's top left. The two are
 * different compositions rather than one scaled. Everything the page draws for
 * itself is left out — the seals, the margin card, the buttons, the panel under
 * the four points — and so is anything the file has turned off.
 */

export type SceneLayer = {
  /** A picture, or a fill; never both. */
  src?: string;
  paint?: string;
  width: number;
  height: number;
  /** a, b, c, d, e, f — the CSS matrix, with e and f in frame units. */
  m: [number, number, number, number, number, number];
  cover?: boolean;
  blur?: number;
  opacity?: number;
  round?: boolean;
};

export const productScene: Record<string, { desktop: SceneLayer[]; phone: SceneLayer[] }> = {
  "garnish": {
    desktop: [
      { src: "/images/scene-f16e70efc5898x432.webp", width: 209.749, height: 142.1624, m: [-0.1058, 0.9944, -0.9944, -0.1058, 1577.9235, 577.0702], blur: 4 },
      { src: "/images/scene-cdd1d94d.webp", width: 267.2593, height: 217.2133, m: [0.9545, 0.2981, -0.2981, 0.9545, 1432.3305, 332.9095], cover: true },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 121.5925, height: 82.4123, m: [1, 0, 0, 1, 1569.0449, 348.5779] },
      { src: "/images/scene-f16e70efc0x0.webp", width: 157.7597, height: 177.8195, m: [-0.2584, 0.966, 0.966, 0.2584, 1392.9896, 191.4377] },
      { src: "/images/scene-0a906e54c0x3180.webp", width: 363.3712, height: 395.0787, m: [1, 0, 0, 1, 1533.4108, 330.5174] },
      { paint: "linear-gradient(180deg, #eee6d8 -11433.3387%, rgba(238, 230, 216, 0) 3176.6543%)", width: 471.6326, height: 532.7571, m: [1, 0, 0, 1, 249.5811, 104.4805] },
      { paint: "linear-gradient(179.9999deg, #eee6d8 -11433.2765%, rgba(238, 230, 216, 0) 3176.6365%)", width: 766.877, height: 244.5977, m: [1, 0, 0, 1, -49.8948, 545.8867] },
      { paint: "linear-gradient(180deg, #eee6d8 -11433.3387%, rgba(238, 230, 216, 0) 3176.6543%)", width: 693.7725, height: 680.3472, m: [0, -1, 1, 0, 536.6072, 795.0469] },
      { paint: "linear-gradient(98.7347deg, #d8cab6 -78.5322%, rgba(216, 202, 182, 0) 102.1798%)", width: 538.534, height: 107.3878, m: [0.9931, -0.1174, 0.1174, 0.9931, 123.3432, 618.4176], round: true },
      { src: "/images/scene-a8524cbfc3419x1973.webp", width: 450.0353, height: 655.1899, m: [1, 0, 0, 1, 61.5906, 56.8594] },
      { paint: "#ffffff", width: 54.7782, height: 34.3454, m: [1, 0, 0, 1, 93.8748, 622.0838], round: true },
    ],
    phone: [
      { paint: "linear-gradient(99.1009deg, #3d060b -79.2008%, rgba(61, 6, 11, 0) 101.4067%)", width: 181.1755, height: 37.6679, m: [0.9931, -0.1174, 0.1174, 0.9931, -398.9434, 311.5098], round: true },
      { src: "/images/scene-5e54ba7cc3419x1973.webp", width: 151.4025, height: 220.4213, m: [1, 0, 0, 1, -419.7188, 122.5879] },
      { paint: "linear-gradient(107.1034deg, #3d060b -31.8053%, rgba(61, 6, 11, 0) 75.4373%)", width: 88.3732, height: 35.293, m: [0.992, -0.1265, 0.1265, 0.992, -304.1023, 329.0505], round: true },
      { src: "/images/scene-61da802e.webp", width: 124.5488, height: 203.3715, m: [1, 0, 0, 1, -339.3789, 188.7681], cover: true },
      { paint: "#ffffff", width: 33.2112, height: 20.8231, m: [1, 0, 0, 1, -215.2041, 176.9633], round: true },
      { src: "/images/scene-48330e21.webp", width: 231.6396, height: 261.7003, m: [1, 0, 0, 1, 148.3555, 105.0342], cover: true },
      { paint: "linear-gradient(98.736deg, #d8cab6 -78.532%, rgba(216, 202, 182, 0) 102.1797%)", width: 240.6571, height: 47.9959, m: [0.9931, -0.1174, 0.1174, 0.9931, 52.0469, 316.9838], round: true },
      { src: "/images/scene-a8524cbfc3419x1973.webp", width: 201.1089, height: 292.8314, m: [1, 0, 0, 1, 24.4512, 66] },
      { paint: "#ffffff", width: 33.2112, height: 20.8263, m: [1, 0, 0, 1, 287.7959, 176.9262], round: true },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 123.657, height: 83.8115, m: [-0.1058, 0.9944, -0.9944, -0.1058, 527.3408, 325.8765], blur: 4 },
      { src: "/images/scene-5f33d9e4.webp", width: 177.202, height: 144.0199, m: [0.781, -0.6246, 0.6246, 0.781, 578.5156, 99.6065], cover: true },
      { src: "/images/scene-cdd1d94d.webp", width: 157.562, height: 128.0576, m: [0.9545, 0.2981, -0.2981, 0.9545, 441.5068, 181.9322], cover: true },
      { src: "/images/scene-3c519f85.webp", width: 192.8207, height: 156.7138, m: [0.9511, -0.309, 0.309, 0.9511, 670.5391, 255.2784], cover: true },
      { src: "/images/scene-f16e70efc0x0.webp", width: 93.0068, height: 104.833, m: [-0.7528, 0.6582, 0.6582, 0.7528, 686.1699, 209.3077] },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 71.6846, height: 48.5859, m: [1, 0, 0, 1, 522.1064, 191.1695] },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 92.2006, height: 62.4911, m: [0.211, 0.9775, 0.9775, -0.211, 764.3545, 210.6866], blur: 4 },
      { src: "/images/scene-f16e70efc7127x6439.webp", width: 48.6484, height: 93.1421, m: [1, 0, 0, 1, 680.6299, 209.3077] },
      { src: "/images/scene-f16e70efc0x0.webp", width: 93.0068, height: 104.833, m: [-0.6423, 0.7665, -0.7665, -0.6423, 676.6777, 184.5928] },
      { src: "/images/scene-f16e70efc0x0.webp", width: 93.0068, height: 104.833, m: [-0.2584, 0.966, 0.966, 0.2584, 418.3135, 98.5279] },
      { src: "/images/scene-0a906e54c0x3180.webp", width: 169.6461, height: 184.4492, m: [1, 0, 0, 1, 525.1582, 172.525] },
    ],
  },
  "sugar-free": {
    desktop: [
      { src: "/images/scene-5f33d9e4.webp", width: 300.573, height: 244.2888, m: [0.781, -0.6246, 0.6246, 0.781, 254.7271, 193.2681], cover: true },
      { src: "/images/scene-cdd1d94d.webp", width: 267.2593, height: 217.2133, m: [0.9545, 0.2981, -0.2981, 0.9545, 22.3305, 332.9095], cover: true },
      { src: "/images/scene-3c519f85.webp", width: 327.0656, height: 265.8205, m: [0.9511, -0.309, 0.309, 0.9511, 410.8188, 457.3213], cover: true },
      { src: "/images/scene-f16e70efc0x0.webp", width: 157.7597, height: 177.8195, m: [-0.7528, 0.6582, 0.6582, 0.7528, 437.3321, 379.345] },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 121.5925, height: 82.4123, m: [1, 0, 0, 1, 159.0449, 348.5779] },
      { paint: "#a4c4b0", width: 241.5737, height: 96.4757, m: [0.992, -0.1265, 0.1265, 0.992, 263.8083, 627.4891], round: true },
      { src: "/images/scene-f16e70efc7127x6439.webp", width: 82.5183, height: 157.9891, m: [1, 0, 0, 1, 427.935, 379.345] },
      { src: "/images/scene-f16e70efc0x0.webp", width: 157.7597, height: 177.8195, m: [-0.6423, 0.7665, -0.7665, -0.6423, 421.2313, 337.4233] },
      { src: "/images/scene-f16e70efc0x0.webp", width: 157.7597, height: 177.8195, m: [-0.2584, 0.966, 0.966, 0.2584, -17.0104, 191.4377] },
      { src: "/images/scene-0a906e54c0x3180.webp", width: 363.3712, height: 395.0787, m: [1, 0, 0, 1, 123.4108, 330.5174] },
      { paint: "#ffffff", width: 54.7782, height: 34.3454, m: [1, 0, 0, 1, 138.3372, 634.8514], round: true },
      { paint: "#ffffff", width: 54.7782, height: 34.3454, m: [1, 0, 0, 1, 93.8748, 622.0819], round: true },
    ],
    phone: [
      { src: "/images/scene-48330e21.webp", width: 231.6396, height: 261.7003, m: [1, 0, 0, 1, -307.6445, 105.0342], cover: true },
      { paint: "linear-gradient(98.736deg, #d8cab6 -78.532%, rgba(216, 202, 182, 0) 102.1797%)", width: 240.6571, height: 47.9959, m: [0.9931, -0.1174, 0.1174, 0.9931, -403.9531, 316.9838], round: true },
      { paint: "#ffffff", width: 33.2112, height: 20.8263, m: [1, 0, 0, 1, -168.2041, 176.9262], round: true },
      { src: "/images/scene-e84aac77.webp", width: 285.4668, height: 297.4512, m: [1, 0, 0, 1, 519.4375, 99.7031], cover: true },
      { src: "/images/scene-37eb1716.webp", width: 216.0363, height: 175.5822, m: [0.9322, 0.3619, -0.3619, 0.9322, 468.3184, 213.0391], cover: true },
      { src: "/images/scene-5f33d9e4.webp", width: 177.202, height: 144.0199, m: [0.781, -0.6246, 0.6246, 0.781, 122.5156, 99.6065], cover: true },
      { src: "/images/scene-cdd1d94d.webp", width: 157.562, height: 128.0576, m: [0.9545, 0.2981, -0.2981, 0.9545, -14.4932, 181.9322], cover: true },
      { src: "/images/scene-3c519f85.webp", width: 192.8207, height: 156.7138, m: [0.9511, -0.309, 0.309, 0.9511, 214.5391, 255.2784], cover: true },
      { src: "/images/scene-f16e70efc0x0.webp", width: 93.0068, height: 104.833, m: [-0.7528, 0.6582, 0.6582, 0.7528, 230.1699, 209.3077] },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 71.6846, height: 48.5859, m: [1, 0, 0, 1, 66.1064, 191.1695] },
      { paint: "linear-gradient(107.1034deg, #a4c4b0 -31.8053%, rgba(164, 196, 176, 0) 75.4373%)", width: 112.7828, height: 45.0414, m: [0.992, -0.1265, 0.1265, 0.992, 134.7051, 311.1715], round: true },
      { src: "/images/scene-f16e70efc7127x6439.webp", width: 48.6484, height: 93.1421, m: [1, 0, 0, 1, 224.6299, 209.3077] },
      { src: "/images/scene-f16e70efc0x0.webp", width: 93.0068, height: 104.833, m: [-0.6423, 0.7665, -0.7665, -0.6423, 220.6777, 184.5928] },
      { src: "/images/scene-f16e70efc0x0.webp", width: 93.0068, height: 104.833, m: [-0.2584, 0.966, 0.966, 0.2584, -37.6865, 98.5279] },
      { src: "/images/scene-0a906e54c0x3180.webp", width: 169.6461, height: 184.4492, m: [1, 0, 0, 1, 69.1582, 172.525] },
      { paint: "#ffffff", width: 33.2112, height: 20.8231, m: [1, 0, 0, 1, 288.3193, 176.562], round: true },
      { paint: "#ffffff", width: 33.2112, height: 20.8231, m: [1, 0, 0, 1, 287.7959, 176.9604], round: true },
    ],
  },
  "tea": {
    desktop: [
      { paint: "#000000", width: 861.4952, height: 785.7686, m: [1, 0, 0, 1, -263.1204, 8.6719] },
      { src: "/images/scene-e84aac77.webp", width: 534.3839, height: 646.816, m: [1, 0, 0, 1, 161, 124], cover: true },
      { src: "/images/scene-720e38e5.webp", width: 226.1303, height: 183.786, m: [0.9835, 0.1807, -0.1807, 0.9835, 102.5508, 137.6484], cover: true, blur: 4 },
      { src: "/images/scene-1eec80f6.webp", width: 356.7671, height: 278.6757, m: [0.94, -0.3411, 0.3411, 0.94, -154.1423, 308.0391], cover: true, blur: 2 },
      { src: "/images/scene-37eb1716.webp", width: 419.011, height: 340.5486, m: [0.9322, 0.3619, -0.3619, 0.9322, 63.1201, 339.6484], cover: true },
      { paint: "#ffffff", width: 54.7782, height: 34.3454, m: [1, 0, 0, 1, 93.8748, 622.0819], round: true },
    ],
    phone: [
      { src: "/images/scene-e84aac77.webp", width: 285.4668, height: 297.4512, m: [1, 0, 0, 1, 87.4375, 99.7031], cover: true },
      { src: "/images/scene-720e38e5.webp", width: 140.4985, height: 114.1893, m: [0.9835, 0.1807, -0.1807, 0.9835, 35.9863, 66.6094], cover: true, blur: 4 },
      { src: "/images/scene-1eec80f6.webp", width: 181.2666, height: 141.5898, m: [0.94, -0.3411, 0.3411, 0.94, -65.1582, 193.3984], cover: true, blur: 2 },
      { src: "/images/scene-37eb1716.webp", width: 216.0363, height: 175.5822, m: [0.9322, 0.3619, -0.3619, 0.9322, 36.3184, 213.0391], cover: true },
      { paint: "#ffffff", width: 33.2112, height: 20.8231, m: [1, 0, 0, 1, 287.7959, 176.9604], round: true },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 123.657, height: 83.8115, m: [-0.1058, 0.9944, -0.9944, -0.1058, -360.6592, 325.8765], blur: 4 },
      { src: "/images/scene-5f33d9e4.webp", width: 177.202, height: 144.0199, m: [0.781, -0.6246, 0.6246, 0.781, -309.4844, 99.6065], cover: true },
      { src: "/images/scene-3c519f85.webp", width: 192.8207, height: 156.7138, m: [0.9511, -0.309, 0.309, 0.9511, -217.4609, 255.2784], cover: true },
      { src: "/images/scene-f16e70efc0x0.webp", width: 93.0068, height: 104.833, m: [-0.7528, 0.6582, 0.6582, 0.7528, -201.8301, 209.3077] },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 71.6846, height: 48.5859, m: [1, 0, 0, 1, -365.8936, 191.1695] },
      { paint: "linear-gradient(107.1034deg, #a4c4b0 -31.8053%, rgba(164, 196, 176, 0) 75.4373%)", width: 112.7828, height: 45.0414, m: [0.992, -0.1265, 0.1265, 0.992, -297.2949, 311.1715], round: true },
      { src: "/images/scene-f16e70efc5898x432.webp", width: 92.2006, height: 62.4911, m: [0.211, 0.9775, 0.9775, -0.211, -123.6455, 210.6866], blur: 4 },
      { src: "/images/scene-f16e70efc7127x6439.webp", width: 48.6484, height: 93.1421, m: [1, 0, 0, 1, -207.3701, 209.3077] },
      { src: "/images/scene-f16e70efc0x0.webp", width: 93.0068, height: 104.833, m: [-0.6423, 0.7665, -0.7665, -0.6423, -211.3223, 184.5928] },
      { src: "/images/scene-0a906e54c0x3180.webp", width: 169.6461, height: 184.4492, m: [1, 0, 0, 1, -362.8418, 172.525] },
      { paint: "#ffffff", width: 33.2112, height: 20.8231, m: [1, 0, 0, 1, -143.6807, 176.562], round: true },
      { paint: "#ffffff", width: 33.2112, height: 20.8231, m: [1, 0, 0, 1, -144.2041, 176.9604], round: true },
    ],
  },
};
