/**
 * The drink standing in front of the pouch in the product hero.
 *
 * A layer of its own in the owner's Figma frame — every one of them is an image
 * the design calls `Milkshake I 1`, whatever the product — rather than part of
 * the pack shot, which is why it is measured and placed separately here instead
 * of being baked into `pack-<slug>.webp`.
 *
 * `left`, `top`, `width` and `height` are that layer's own numbers in the
 * 1200-wide frame, counted from the top of the page exactly like every other
 * measurement in `ProductHero.module.css`.
 *
 * `image` is `null` while the artwork has not been supplied, and the drink
 * simply does not render. It cannot be cut out of anything already in this
 * repository: the client's key visuals have the glass composited onto the wash
 * and overlapping the pouch, and a translucent glass of drink does not separate
 * cleanly from a ground of its own colour. It has to come out of the design
 * file — export the layer as PNG at 2x on transparency, convert it to WebP as
 * `public/images/glass-<slug>.webp`, and name it here.
 *
 * Export the layer whole rather than trimmed to the drink: Figma's box includes
 * the transparent margin around it, and it is that box these numbers describe.
 * Every file below came in at twice its measured box to within a pixel, so each
 * dropped into place with nothing to align — and, since the exports all carry
 * the same layer name, that is also what identified which drink was which.
 */

/**
 * The pouch's own group in that same frame, which is what the numbers below are
 * measured against — the drink's box is only meaningful beside it.
 *
 * Exported because two surfaces stand the drink on the pouch and both have to
 * read the relationship the same way: the product hero and the homepage
 * carousel. Written once here rather than copied into each stylesheet, where
 * the two copies would drift the first time either is re-measured.
 */
export type Box = { left: number; top: number; width: number; height: number };

/**
 * Matcha's group, and the box any product without one of its own stands in.
 *
 * The design does not draw one pouch box thirteen times: each product's group
 * carries its own, and they are not close enough to share — Cream Latte's is
 * 567.36 x 710.03 against Matcha's 529.27 x 676.55, and Raf Coffee's is smaller
 * again at 446.13 x 492.26. Every one of them is in `pack` below.
 */
export const PACK_BOX: Box = { left: 106.85, top: 137.73, width: 529.27, height: 676.55 };

export type ProductGlass = {
  /** `/images/glass-<slug>.webp`, or null until the artwork exists. */
  image: string | null;
  left: number;
  top: number;
  width: number;
  height: number;
  /** The pouch's own group in the same frame. `PACK_BOX` where unmeasured. */
  pack?: Box;
};

/** The group this product's pouch is drawn in, or Matcha's as the fallback. */
export function packBox(slug: string): Box {
  return productGlass[slug]?.pack ?? PACK_BOX;
}

export const productGlass: Record<string, ProductGlass> = {
  matcha: { image: "/images/glass-matcha.webp", left: 301.34, top: 280.11, width: 327.14, height: 534.17, pack: { left: 106.85, top: 137.73, width: 529.27, height: 676.55 } },
  "raf-coffee": { image: "/images/glass-raf-coffee.webp", left: 242.65, top: 287.31, width: 313.83, height: 479.52, pack: { left: 91.34, top: 180.48, width: 446.13, height: 492.26 } },
  "cream-latte": { image: "/images/glass-cream-latte.webp", left: 274.31, top: 249.61, width: 385.54, height: 589.09, pack: { left: 92.49, top: 128.67, width: 567.36, height: 710.03 } },
  "chai-latte": { image: "/images/glass-chai-latte.webp", left: 326.61, top: 330.06, width: 288.94, height: 471.81, pack: { left: 92.82, top: 128.67, width: 534.63, height: 673.21 } },
  milkshake: { image: "/images/glass-milkshake.webp", left: 341.14, top: 292.01, width: 300.84, height: 491.24, pack: { left: 115.07, top: 128.66, width: 534.63, height: 654.58 } },
  frappe: { image: "/images/glass-frappe.webp", left: 313.84, top: 291.15, width: 304.33, height: 496.93, pack: { left: 100.58, top: 128.67, width: 534.63, height: 659.41 } },
  "iced-tea": { image: "/images/glass-iced-tea.webp", left: 308.54, top: 265.08, width: 320.62, height: 523.52, pack: { left: 102.55, top: 130.8, width: 532.66, height: 657.8 } },
  cordial: { image: "/images/glass-cordial.webp", left: 315.93, top: 260.56, width: 318.52, height: 520.1, pack: { left: 103.64, top: 134.8, width: 530.81, height: 645.86 } },
  topping: { image: "/images/glass-topping.webp", left: 311.98, top: 290.97, width: 310.61, height: 507.19, pack: { left: 105.85, top: 134.8, width: 533, height: 663.35 } },
  chocolate: { image: "/images/glass-chocolate.webp", left: 304.29, top: 292.52, width: 328.57, height: 536.51, pack: { left: 106.38, top: 136.73, width: 531.59, height: 692.31 } },
  "sugar-syrup": { image: "/images/glass-sugar-syrup.webp", left: 296.85, top: 292.58, width: 328.57, height: 536.51, pack: { left: 106.63, top: 136.78, width: 531.59, height: 692.31 } },
  vending: { image: "/images/glass-vending.webp", left: 313.56, top: 282.91, width: 321.55, height: 525.04, pack: { left: 106.15, top: 132.7, width: 536.33, height: 675.25 } },
  jam: { image: "/images/glass-jam.webp", left: 312.82, top: 307.38, width: 319.4, height: 521.5, pack: { left: 106.85, top: 137.73, width: 532.69, height: 691.17 } },

  /*
   * Sugar Free, Garnish and Tea are not waiting on a measurement: their frames
   * have no drink layer at all. Sugar Free is built from sachets and fruit
   * cut-outs, Garnish from the pouch alone, and Tea from a cup photograph with
   * loose leaves around it — three compositions rather than the pouch-and-glass
   * the other thirteen share. There is nothing here for them to carry.
   *
   * Jam above is the one card the file draws shifted, its whole group starting
   * at -164.77, 55.35 where every other starts near 106, 137. Both boxes are
   * translated by that one delta, so the drink keeps its place on the pouch and
   * the pouch stands where the other twelve stand.
   */
};
