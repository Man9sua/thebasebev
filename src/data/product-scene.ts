/**
 * The three product cards that are not a pouch and a drink.
 *
 * Garnish, Sugar Free and Tea are collages in the design file — sachets, leaves
 * and a glass thrown across the wash — and neither the pack shot the other
 * thirteen stand on nor the drink beside it appears on them. Those three carry
 * their own list of layers here and the hero draws that.
 *
 * A layer is either a picture or a fill, and both matter. Half of what these
 * three cards are is fills: the ramps the design lays across each collage, from
 * the card's own ground colour to nothing, which are what gives Sugar Free its
 * pale sachets, Garnish its soft pouch and Tea its dark close. Without them a
 * photograph sits on the card as a rectangle with four visible sides instead of
 * sinking into it.
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
 * A linear's matrix takes the shape to the gradient, so its two ends are found
 * by taking that matrix back. Read the other way it puts the axis thousands of
 * pixels off the shape, and every one of the file's veils comes out as a flat
 * colour. Taken back, they are what the design shows: a ramp from the ground
 * colour to nothing, laid across a collage, which is the transparency these
 * three cards are drawn with — the pale sachets on Sugar Free, the soft pouch
 * on Garnish, the dark closing on Tea. Stops are then projected onto the line
 * CSS paints along, which is not the file's own axis: CSS runs its line through
 * the box's centre and measures from the box's edge, so a stop can land outside
 * 0-100% and still be right.
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
  /** left, top, width, height — the rectangle the design masks this through. */
  mask?: [number, number, number, number];
  opacity?: number;
  round?: boolean;
};

export const productScene: Record<string, { desktop: SceneLayer[]; phone: SceneLayer[] }> = {
  "garnish": {
    desktop: [
      { paint: "linear-gradient(0deg, #eee6d8 67.038%, rgba(238, 230, 216, 0) 77.814%)", m: [1351.6785, 0, 0, 822.9069, -201.665, -28.4141], back: true },
      { paint: "linear-gradient(0deg, #eee6d8 67.038%, rgba(238, 230, 216, 0) 77.8139%)", m: [471.6326, 0, 0, 532.7571, 249.5811, 104.4805], back: true },
      { paint: "linear-gradient(0.0001deg, #eee6d8 67.038%, rgba(238, 230, 216, 0) 77.8139%)", m: [766.877, 0, 0, 244.5977, -49.8948, 545.8867], back: true },
      { paint: "linear-gradient(0deg, #eee6d8 67.038%, rgba(238, 230, 216, 0) 77.8139%)", m: [0, -693.7725, 680.3472, 0, 536.6072, 795.0469], back: true },
      { paint: "linear-gradient(52.3862deg, #d8cab6 35.0029%, rgba(216, 202, 182, 0) 61.8003%)", m: [534.8181, -63.2239, 12.6073, 106.6468, 123.3432, 618.4176], round: true },
      { src: "/images/scene-a8524cbfc3419x1973.webp", m: [450.0353, 0, 0, 655.1899, 61.5906, 56.8594] },
      { paint: "#ffffff", m: [54.7782, 0, 0, 34.3454, 93.8748, 622.0838], round: true },
    ],
    phone: [
      { paint: "linear-gradient(1.8238deg, #ebe1d1 10.511%, #dfceb4 67.3903%)", m: [462.4223, 0, 0, 404.2272, -73.2715, 4.8769], back: true, mask: [-360, 107.4843, 1080, 316.6827] },
      { src: "/images/scene-48330e21f1130.webp", m: [231.6396, 0, 0, 261.7003, 148.3555, 105.0342], back: true, mask: [-360, 107.4843, 1080, 316.6827] },
      { paint: "linear-gradient(0.0001deg, #eee6d8 67.0382%, rgba(238, 230, 216, 0) 77.814%)", m: [371.0146, 0, 0, 62.5881, -8.042, 346.2606], back: true, mask: [-360, 107.4843, 1080, 316.6827] },
      { paint: "linear-gradient(52.3821deg, #d8cab6 35.0014%, rgba(216, 202, 182, 0) 61.8006%)", m: [238.9966, -28.2531, 5.6347, 47.6647, 52.0469, 316.9838], round: true },
      { src: "/images/scene-a8524cbfc3419x1973.webp", m: [201.1089, 0, 0, 292.8314, 24.4512, 66] },
      { paint: "#ffffff", m: [33.2112, 0, 0, 20.8263, 287.7959, 176.9262], round: true },
    ],
  },
  "sugar-free": {
    desktop: [
      { paint: "#e8f2e9", m: [1200.1602, 0, 0, 685.1641, 0, 105] },
      { src: "/images/scene-f16e70efc5898x432b400.webp", m: [-22.1914, 208.5744, -141.3663, -15.0408, 167.9235, 577.0702], mask: [46.9141, 118.3516, 610.6379, 626.2354] },
      { src: "/images/scene-5f33d9e4f813.webp", m: [234.7475, -187.7379, 152.5828, 190.7896, 254.7271, 193.2681], mask: [46.9141, 118.3516, 610.6379, 626.2354] },
      { src: "/images/scene-cdd1d94df813.webp", m: [255.099, 79.67, -64.7513, 207.3301, 22.3305, 332.9095], mask: [46.9141, 118.3516, 610.6379, 626.2354] },
      { src: "/images/scene-3c519f85f813.webp", m: [311.0721, -101.0633, 82.1385, 252.8219, 410.8188, 457.3213], mask: [46.9141, 118.3516, 610.6379, 626.2354] },
      { src: "/images/scene-f16e70efc0x0.webp", m: [-118.7615, 103.8374, 117.0408, 133.8625, 437.3321, 379.345], mask: [46.9141, 118.3516, 610.6379, 626.2354] },
      { src: "/images/scene-f16e70efc5898x432.webp", m: [121.5925, 0, 0, 82.4123, 159.0449, 348.5779], mask: [46.9141, 118.3516, 610.6379, 626.2354] },
      { paint: "#a4c4b0", m: [239.6411, -30.5591, 12.2042, 95.7039, 263.8083, 627.4891], mask: [46.9141, 118.3516, 610.6379, 626.2354], round: true },
      { src: "/images/scene-f16e70efc5898x432b400.webp", m: [32.9987, 152.8733, 103.6135, -22.3657, 569.95, 381.684], mask: [46.9141, 118.3516, 610.6379, 626.2354] },
      { src: "/images/scene-f16e70efc7127x6439.webp", m: [82.5183, 0, 0, 157.9891, 427.935, 379.345], mask: [46.9141, 118.3516, 610.6379, 626.2354] },
      { src: "/images/scene-f16e70efc0x0.webp", m: [-101.3291, 120.9228, -136.2986, -114.2135, 421.2313, 337.4233], mask: [46.9141, 118.3516, 610.6379, 626.2354] },
      { src: "/images/scene-f16e70efc0x0.webp", m: [-40.7651, 152.3959, 171.7736, 45.9486, -17.0104, 191.4377], mask: [46.9141, 118.3516, 610.6379, 626.2354] },
      { src: "/images/scene-0a906e54c0x3180.webp", m: [363.3712, 0, 0, 395.0787, 123.4108, 330.5174], mask: [46.9141, 118.3516, 610.6379, 626.2354] },
      { paint: "#ffffff", m: [54.7782, 0, 0, 34.3454, 138.3372, 634.8514], mask: [46.9141, 118.3516, 610.6379, 626.2354], round: true },
      { paint: "linear-gradient(-90.8561deg, rgba(232, 242, 233, 0) 97.4054%)", m: [773.5, 0, 0, 685.1641, 496.7651, 118.3516], mask: [46.9141, 118.3516, 610.6379, 626.2354] },
      { paint: "linear-gradient(-88.7188deg, #e8f2e9 24.6575%, rgba(232, 242, 233, 0) 96.153%)", m: [-186.6956, 0, 0, -645.6128, 226.9141, 824.9297], mask: [46.9141, 118.3516, 610.6379, 626.2354] },
      { paint: "linear-gradient(-88.876deg, #e8f2e9 24.3001%, rgba(232, 242, 233, 0) 96.9894%)", m: [212.8031, 0, 0, 645.6128, 457.9619, 179.3203], mask: [46.9141, 118.3516, 610.6379, 626.2354] },
      { paint: "#ffffff", m: [54.7782, 0, 0, 34.3454, 93.8748, 622.0819], round: true },
    ],
    phone: [
      { src: "/images/scene-f16e70efc5898x432b801.webp", m: [-13.0829, 122.9645, -83.3422, -8.8673, 71.3408, 325.8765], back: true, mask: [-360, 108, 1080, 316.6348] },
      { src: "/images/scene-5f33d9e4f813.webp", m: [138.3948, -110.6804, 89.9548, 112.4795, 122.5156, 99.6065], mask: [-360, 108, 1080, 316.6348] },
      { src: "/images/scene-cdd1d94df813.webp", m: [150.3929, 46.9692, -38.174, 122.231, -14.4932, 181.9322], mask: [-360, 108, 1080, 316.6348] },
      { src: "/images/scene-3c519f85f813.webp", m: [183.3918, -59.5816, 48.4246, 149.0505, 214.5391, 255.2784], mask: [-360, 108, 1080, 316.6348] },
      { src: "/images/scene-f16e70efc0x0.webp", m: [-70.0155, 61.2171, 69.0011, 78.9183, 230.1699, 209.3077], mask: [-360, 108, 1080, 316.6348] },
      { src: "/images/scene-f16e70efc5898x432.webp", m: [71.6846, 0, 0, 48.5859, 66.1064, 191.1695], mask: [-360, 108, 1080, 316.6348] },
      { paint: "linear-gradient(52.3862deg, #a4c4b0 29.8103%, rgba(164, 196, 176, 0) 68.9122%)", m: [111.8805, -14.267, 5.6977, 44.6811, 134.7051, 311.1715], mask: [-360, 108, 1080, 316.6348], round: true },
      { src: "/images/scene-f16e70efc5898x432b800.webp", m: [19.4543, 90.1261, 61.0851, -13.1856, 308.3545, 210.6866], mask: [-360, 108, 1080, 316.6348] },
      { src: "/images/scene-f16e70efc7127x6439.webp", m: [48.6484, 0, 0, 93.1421, 224.6299, 209.3077], mask: [-360, 108, 1080, 316.6348] },
      { src: "/images/scene-f16e70efc0x0.webp", m: [-59.7383, 71.2897, -80.3545, -67.3342, 220.6777, 184.5928], mask: [-360, 108, 1080, 316.6348] },
      { src: "/images/scene-f16e70efc0x0.webp", m: [-24.033, 89.8446, 101.2687, 27.0888, -37.6865, 98.5279], mask: [-360, 108, 1080, 316.6348] },
      { src: "/images/scene-0a906e54c0x3180.webp", m: [169.6461, 0, 0, 184.4492, 69.1582, 172.525], mask: [-360, 108, 1080, 316.6348] },
      { paint: "#ffffff", m: [33.2112, 0, 0, 20.8231, 288.3193, 176.562], mask: [-360, 108, 1080, 316.6348], round: true },
      { paint: "#ffffff", m: [33.2112, 0, 0, 20.8231, 287.7959, 176.9604], round: true },
    ],
  },
  "tea": {
    desktop: [
      { paint: "#000000", m: [1250.2365, 0, 0, 802.3901, -50.3828, 0.3594] },
      { paint: "#000000", m: [861.4952, 0, 0, 785.7686, -263.1204, 8.6719] },
      { src: "/images/scene-e84aac77f1210.webp", m: [534.3839, 0, 0, 646.816, 161, 124] },
      { paint: "linear-gradient(-87.4331deg, #000000 36.9523%, rgba(0, 0, 0, 0) 95.8639%)", m: [352.9043, 0, 0, 645.6128, 355.1992, 166.2891] },
      { src: "/images/scene-720e38e5f813b400.webp", m: [222.3992, 40.8617, -33.2101, 180.7535, 102.5508, 137.6484] },
      { src: "/images/scene-1eec80f6f781b200.webp", m: [335.3611, -121.6933, 95.0563, 261.9552, -154.1423, 308.0391] },
      { src: "/images/scene-37eb1716f813.webp", m: [390.6021, 151.6401, -123.2445, 317.4594, 63.1201, 339.6484] },
      { paint: "#ffffff", m: [54.7782, 0, 0, 34.3454, 93.8748, 622.0819], round: true },
      { paint: "linear-gradient(-88.2904deg, #000000 25.786%, rgba(0, 0, 0, 0) 93.5121%)", m: [-139.8934, 0, 0, -645.6128, 133.7, 811.8984] },
    ],
    phone: [
      { paint: "radial-gradient(42.6289% 41.5251% at 64.1419% 41.7228%, #3f3239 24.6049%, #17070a 100%)", m: [368.8984, 0, 0, 395.6914, -2.3105, 105.0859], back: true },
      { paint: "#000000", m: [462.4223, 0, 0, 404.166, -73.2715, 4.9375], back: true },
      { src: "/images/scene-e84aac77f1042.webp", m: [285.4668, 0, 0, 297.4512, 87.4375, 99.7031], back: true },
      { src: "/images/scene-720e38e5f813b800.webp", m: [138.1803, 25.3881, -20.634, 112.3052, 35.9863, 66.6094] },
      { src: "/images/scene-1eec80f6f781b400.webp", m: [170.3906, -61.83, 48.2963, 133.0944, -65.1582, 193.3984] },
      { src: "/images/scene-37eb1716f813.webp", m: [201.389, 78.1835, -63.5432, 163.6777, 36.3184, 213.0391] },
      { paint: "#ffffff", m: [33.2112, 0, 0, 20.8231, 287.7959, 176.9604], round: true },
    ],
  },
};
