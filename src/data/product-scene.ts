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
 * offsets. The box it acts on is one unit square, so the matrix carries the
 * size as well as the turn — and almost none of these sachets is square to the
 * page, anything from seventeen degrees to a hundred and thirty-nine, so a
 * corner and a size would not place a single one of them. `back` marks the one
 * layer that is a ground rather than a cut-out — Tea's photograph, which the
 * design draws the brand mark over and everything else under.
 *
 * `blur` is the file's own radius over the scale its matrix carries, because
 * a filter is taken in the box's own space and magnified with it. Sugar Free's
 * two blurred sachets are not here at all: they are at full strength in the
 * file and all but gone from the design's own export.
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
  /** a, b, c, d, e, f — the CSS matrix, over a one-unit box, in frame units. */
  m: [number, number, number, number, number, number];
  /** A ground rather than a cut-out: the brand mark is drawn over it. */
  back?: true;
  blur?: number;
  opacity?: number;
  round?: boolean;
};

export const productScene: Record<string, { desktop: SceneLayer[]; phone: SceneLayer[] }> = {
  "garnish": {
    desktop: [
      { paint: "linear-gradient(180deg, #eee6d8 -11433.3387%, rgba(238, 230, 216, 0) 3176.6543%)", m: [471.6326, 0, 0, 532.7571, 249.5811, 104.4805] },
      { paint: "linear-gradient(179.9999deg, #eee6d8 -11433.2765%, rgba(238, 230, 216, 0) 3176.6365%)", m: [766.877, 0, 0, 244.5977, -49.8948, 545.8867] },
      { paint: "linear-gradient(180deg, #eee6d8 -11433.3387%, rgba(238, 230, 216, 0) 3176.6543%)", m: [0, -693.7725, 680.3472, 0, 536.6072, 795.0469] },
      { paint: "linear-gradient(98.7347deg, #d8cab6 -78.5322%, rgba(216, 202, 182, 0) 102.1798%)", m: [534.8181, -63.2239, 12.6073, 106.6468, 123.3432, 618.4176], round: true },
      { src: "/images/scene-a8524cbfc3419x1973.webp", m: [450.0353, 0, 0, 655.1899, 61.5906, 56.8594] },
      { paint: "#ffffff", m: [54.7782, 0, 0, 34.3454, 93.8748, 622.0838], round: true },
    ],
    phone: [
      { src: "/images/scene-48330e21f1130.webp", m: [231.6396, 0, 0, 261.7003, 148.3555, 105.0342] },
      { paint: "linear-gradient(98.736deg, #d8cab6 -78.532%, rgba(216, 202, 182, 0) 102.1797%)", m: [238.9966, -28.2531, 5.6347, 47.6647, 52.0469, 316.9838], round: true },
      { src: "/images/scene-a8524cbfc3419x1973.webp", m: [201.1089, 0, 0, 292.8314, 24.4512, 66] },
      { paint: "#ffffff", m: [33.2112, 0, 0, 20.8263, 287.7959, 176.9262], round: true },
    ],
  },
  "sugar-free": {
    desktop: [
      { src: "/images/scene-5f33d9e4f813.webp", m: [234.7475, -187.7379, 152.5828, 190.7896, 254.7271, 193.2681] },
      { src: "/images/scene-cdd1d94df813.webp", m: [255.099, 79.67, -64.7513, 207.3301, 22.3305, 332.9095] },
      { src: "/images/scene-3c519f85f813.webp", m: [311.0721, -101.0633, 82.1385, 252.8219, 410.8188, 457.3213] },
      { src: "/images/scene-f16e70efc0x0.webp", m: [-118.7615, 103.8374, 117.0408, 133.8625, 437.3321, 379.345] },
      { src: "/images/scene-f16e70efc5898x432.webp", m: [121.5925, 0, 0, 82.4123, 159.0449, 348.5779] },
      { paint: "#a4c4b0", m: [239.6411, -30.5591, 12.2042, 95.7039, 263.8083, 627.4891], round: true },
      { src: "/images/scene-f16e70efc7127x6439.webp", m: [82.5183, 0, 0, 157.9891, 427.935, 379.345] },
      { src: "/images/scene-f16e70efc0x0.webp", m: [-101.3291, 120.9228, -136.2986, -114.2135, 421.2313, 337.4233] },
      { src: "/images/scene-f16e70efc0x0.webp", m: [-40.7651, 152.3959, 171.7736, 45.9486, -17.0104, 191.4377] },
      { src: "/images/scene-0a906e54c0x3180.webp", m: [363.3712, 0, 0, 395.0787, 123.4108, 330.5174] },
      { paint: "#ffffff", m: [54.7782, 0, 0, 34.3454, 138.3372, 634.8514], round: true },
      { paint: "#ffffff", m: [54.7782, 0, 0, 34.3454, 93.8748, 622.0819], round: true },
    ],
    phone: [
      { src: "/images/scene-5f33d9e4f813.webp", m: [138.3948, -110.6804, 89.9548, 112.4795, 122.5156, 99.6065] },
      { src: "/images/scene-cdd1d94df813.webp", m: [150.3929, 46.9692, -38.174, 122.231, -14.4932, 181.9322] },
      { src: "/images/scene-3c519f85f813.webp", m: [183.3918, -59.5816, 48.4246, 149.0505, 214.5391, 255.2784] },
      { src: "/images/scene-f16e70efc0x0.webp", m: [-70.0155, 61.2171, 69.0011, 78.9183, 230.1699, 209.3077] },
      { src: "/images/scene-f16e70efc5898x432.webp", m: [71.6846, 0, 0, 48.5859, 66.1064, 191.1695] },
      { paint: "linear-gradient(107.1034deg, #a4c4b0 -31.8053%, rgba(164, 196, 176, 0) 75.4373%)", m: [111.8805, -14.267, 5.6977, 44.6811, 134.7051, 311.1715], round: true },
      { src: "/images/scene-f16e70efc7127x6439.webp", m: [48.6484, 0, 0, 93.1421, 224.6299, 209.3077] },
      { src: "/images/scene-f16e70efc0x0.webp", m: [-59.7383, 71.2897, -80.3545, -67.3342, 220.6777, 184.5928] },
      { src: "/images/scene-f16e70efc0x0.webp", m: [-24.033, 89.8446, 101.2687, 27.0888, -37.6865, 98.5279] },
      { src: "/images/scene-0a906e54c0x3180.webp", m: [169.6461, 0, 0, 184.4492, 69.1582, 172.525] },
      { paint: "#ffffff", m: [33.2112, 0, 0, 20.8231, 288.3193, 176.562], round: true },
      { paint: "#ffffff", m: [33.2112, 0, 0, 20.8231, 287.7959, 176.9604], round: true },
    ],
  },
  "tea": {
    desktop: [
      { paint: "#000000", m: [861.4952, 0, 0, 785.7686, -263.1204, 8.6719], back: true },
      { src: "/images/scene-e84aac77f1210.webp", m: [534.3839, 0, 0, 646.816, 161, 124], back: true },
      { src: "/images/scene-720e38e5f813.webp", m: [222.3992, 40.8617, -33.2101, 180.7535, 102.5508, 137.6484], blur: 0.0195 },
      { src: "/images/scene-1eec80f6f781.webp", m: [335.3611, -121.6933, 95.0563, 261.9552, -154.1423, 308.0391], blur: 0.0063 },
      { src: "/images/scene-37eb1716f813.webp", m: [390.6021, 151.6401, -123.2445, 317.4594, 63.1201, 339.6484] },
      { paint: "#ffffff", m: [54.7782, 0, 0, 34.3454, 93.8748, 622.0819], round: true },
    ],
    phone: [
      { src: "/images/scene-e84aac77f1042.webp", m: [285.4668, 0, 0, 297.4512, 87.4375, 99.7031], back: true },
      { src: "/images/scene-720e38e5f813.webp", m: [138.1803, 25.3881, -20.634, 112.3052, 35.9863, 66.6094], blur: 0.0314 },
      { src: "/images/scene-1eec80f6f781.webp", m: [170.3906, -61.83, 48.2963, 133.0944, -65.1582, 193.3984], blur: 0.0124 },
      { src: "/images/scene-37eb1716f813.webp", m: [201.389, 78.1835, -63.5432, 163.6777, 36.3184, 213.0391] },
      { paint: "#ffffff", m: [33.2112, 0, 0, 20.8231, 287.7959, 176.9604], round: true },
      { src: "/images/scene-3c519f85f813.webp", m: [183.3918, -59.5816, 48.4246, 149.0505, -217.4609, 255.2784] },
    ],
  },
};
