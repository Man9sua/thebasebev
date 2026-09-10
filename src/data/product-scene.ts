/**
 * The three product cards that are not a pouch and a drink.
 *
 * Garnish, Sugar Free and Tea are collages in the design — sachets, leaves and
 * a glass thrown across the wash — and neither the pack shot the other thirteen
 * stand on nor the drink beside it appears on them. Those three carry their own
 * list of layers here and the hero draws that.
 *
 * These are the design's own flattened export, taken from the reference product
 * page the owner supplied rather than re-derived from `frme2.fig`. That matters
 * on exactly the parts the file cannot settle: the veil the design lays over
 * Tea's photograph, the ghosted sachets on Sugar Free, the blur on the ones
 * behind. All of it is already in the pictures, so there is nothing left to
 * infer and nothing left to get wrong.
 *
 * `m` is the layer's whole transform in the card's own space, in the order CSS
 * takes it: a, b, c, d and then the two offsets. The box it acts on is one unit
 * square, so a and d carry the layer's size where it is square to the page and
 * the whole matrix carries it where it is not — and almost none of these
 * sachets is square, anything from seventeen degrees to a hundred and
 * thirty-nine. `clip` is a share of the picture rather than of the box: several
 * of Sugar Free's sachets are cut from one sheet, and `back` marks the one
 * layer that is a backdrop rather than a cut-out — Tea's. The design draws the
 * brand mark over that and under everything else, which is why it reads across
 * Tea's photograph and stops at the edge of Garnish's pouch.
 *
 * Coordinates are the card's own: the 1200 frame on the desktop and the 360 one
 * on the phone, both from its top left. The two are different compositions
 * rather than one scaled. The seals are not among them — the page draws those
 * itself, on all sixteen products.
 */

export type SceneLayer = {
  src: string;
  /** a, b, c, d, e, f — the CSS matrix, over a one-unit box, in frame units. */
  m: [number, number, number, number, number, number];
  /** left, top, right, bottom, as shares of the picture. */
  clip?: [number, number, number, number];
  /** A backdrop rather than a cut-out: the brand mark is drawn over it. */
  back?: true;
};

export type ProductScene = { desktop: SceneLayer[]; phone: SceneLayer[] };

export const productScene: Record<string, ProductScene> = {
  "garnish": {
    desktop: [
      { src: "/images/scene-31580e8f.webp", m: [1429.9583, 0, 0, 1072.4685, -427.2453, -155.1193] },
    ],
    phone: [
      { src: "/images/scene-1b9ddc6b.webp", m: [231.6745, 0, 0, 261.7003, 148.338, 105.0342] },
      { src: "/images/scene-31580e8f.webp", m: [639.0104, 0, 0, 479.3304, -193.9963, -28.5945] },
    ],
  },
  "sugar-free": {
    desktop: [
      { src: "/images/scene-93165365.webp", m: [172.3633, 0, 0, 232.4168, -0.0391, 557.2954] },
      { src: "/images/scene-921891f1.webp", m: [234.7418, -187.7244, 152.5718, 190.785, 254.7265, 192.9379] },
      { src: "/images/scene-2d37663f.webp", m: [255.1076, 79.6719, -64.7528, 207.3371, 22.33, 332.5797] },
      { src: "/images/scene-81418c5d.webp", m: [311.06, -101.0623, 82.1378, 252.8121, 410.8184, 456.9914] },
      { src: "/images/scene-1245c816.webp", m: [-333.9735, 292.0146, 292.0146, 333.9735, 437.3319, 379.0152], clip: [0, 0.5992, 0.3556, 1] },
      { src: "/images/scene-1245c816.webp", m: [443.6334, 0, 0, 443.6334, -102.5965, 329.0711], clip: [0.5898, 0.771, 0.8639, 0.9568] },
      { src: "/images/scene-353c4421.webp", m: [146.1172, 0, 0, 184.7434, 565.1953, 354.2362] },
      { src: "/images/scene-1245c816.webp", m: [443.6335, 0, 0, 443.6335, 111.7366, 93.371], clip: [0.7128, 0, 0.8988, 0.3561] },
      { src: "/images/scene-1245c816.webp", m: [-284.9445, 340.0255, -340.0255, -284.9445, 421.2304, 337.0934], clip: [0, 0.5992, 0.3556, 1] },
      { src: "/images/scene-1245c816.webp", m: [-114.6225, 428.5703, 428.5703, 114.6225, -17.0118, 191.1073], clip: [0, 0.5992, 0.3556, 1] },
      { src: "/images/scene-28879e0f.webp", m: [501.4182, 0, 0, 748.3854, 123.4102, 92.2293] },
    ],
    phone: [
      { src: "/images/scene-2d6e4e56.webp", m: [105.2285, 0, 0, 140.6328, -29.4863, 312.6064] },
      { src: "/images/scene-921891f1.webp", m: [138.3914, -110.6724, 89.9483, 112.4768, 122.5156, 99.6064] },
      { src: "/images/scene-2d37663f.webp", m: [150.398, 46.9703, -38.1749, 122.2351, -14.4922, 181.9317] },
      { src: "/images/scene-81418c5d.webp", m: [183.3846, -59.581, 48.4241, 149.0447, 214.5391, 255.2784] },
      { src: "/images/scene-1245c816.webp", m: [-196.8932, 172.1565, 172.1565, 196.8932, 230.1699, 209.3075], clip: [0, 0.5992, 0.3556, 1] },
      { src: "/images/scene-1245c816.webp", m: [261.5429, 0, 0, 261.5429, -88.1445, 179.8633], clip: [0.5898, 0.771, 0.8639, 0.9568] },
      { src: "/images/scene-5db1a7bd.webp", m: [90.0449, 0, 0, 112.8174, 303.6016, 192.748] },
      { src: "/images/scene-1245c816.webp", m: [261.5429, 0, 0, 261.543, 38.2158, 40.9067], clip: [0.7128, 0, 0.8988, 0.3561] },
      { src: "/images/scene-1245c816.webp", m: [-167.9883, 200.4612, -200.4612, -167.9883, 220.6777, 184.5929], clip: [0, 0.5992, 0.3556, 1] },
      { src: "/images/scene-1245c816.webp", m: [-67.5754, 252.6625, 252.6625, 67.5754, -37.6875, 98.5276], clip: [0, 0.5992, 0.3556, 1] },
      { src: "/images/scene-28879e0f.webp", m: [234.0956, 0, 0, 349.3965, 69.1582, 61.4296] },
    ],
  },
  "tea": {
    desktop: [
      { src: "/images/scene-db21841f.webp", m: [646.8159, 0, 0, 646.8159, 104.784, 123.6699], back: true },
      { src: "/images/scene-80d6d14b.webp", m: [264.9355, 0, 0, 230.943, 64.6777, 132.6611] },
      { src: "/images/scene-61f939c0.webp", m: [435.5508, 0, 0, 388.7799, -156.7051, 183.454] },
      { src: "/images/scene-9d8d4010.webp", m: [390.602, 151.6581, -123.2592, 317.4594, 63.1213, 339.3187] },
    ],
    phone: [
      { src: "/images/scene-e1612073.webp", m: [360, 0, 0, 269, 0, 108], back: true },
      { src: "/images/scene-db21841f.webp", m: [297.4512, 0, 0, 297.4512, 81.4453, 99.7031] },
      { src: "/images/scene-2c954d4d.webp", m: [168.1367, 0, 0, 147.0156, 10.6914, 61.9521] },
      { src: "/images/scene-a97551bf.webp", m: [223.8164, 0, 0, 200.0518, -67.7207, 129.0068] },
      { src: "/images/scene-9d8d4010.webp", m: [201.389, 78.1928, -63.5507, 163.6777, 36.3185, 213.0389] },
    ],
  },
};
