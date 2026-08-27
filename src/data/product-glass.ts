/**
 * The drink standing in front of the pouch in the product hero.
 *
 * A layer of its own in the owner's Figma frame — every one of them is an image
 * the design calls `Milkshake I 1`, whatever the product — rather than part of
 * the pack shot, which is why it is measured and placed separately here instead
 * of being baked into `pack-<slug>.webp`.
 *
 * `left`, `top`, `width` and `height` are that layer's own numbers in the
 * 1240-wide frame, counted from the top of the page exactly like every other
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

export type ProductGlass = {
  /** `/images/glass-<slug>.webp`, or null until the artwork exists. */
  image: string | null;
  left: number;
  top: number;
  width: number;
  height: number;
};

export const productGlass: Record<string, ProductGlass> = {
  matcha: { image: "/images/glass-matcha.webp", left: 301.34, top: 280.11, width: 327.14, height: 534.17 },
  "raf-coffee": { image: "/images/glass-raf-coffee.webp", left: 242.65, top: 287.31, width: 313.83, height: 479.52 },
  "cream-latte": { image: "/images/glass-cream-latte.webp", left: 274.31, top: 249.61, width: 385.54, height: 589.09 },
  "chai-latte": { image: "/images/glass-chai-latte.webp", left: 326.61, top: 330.06, width: 288.94, height: 471.81 },
  milkshake: { image: "/images/glass-milkshake.webp", left: 341.14, top: 292.01, width: 300.84, height: 491.24 },
  frappe: { image: "/images/glass-frappe.webp", left: 313.84, top: 291.15, width: 304.33, height: 496.93 },
  "iced-tea": { image: "/images/glass-iced-tea.webp", left: 308.54, top: 265.08, width: 320.62, height: 523.52 },
  cordial: { image: "/images/glass-cordial.webp", left: 315.93, top: 260.56, width: 318.52, height: 520.1 },
  topping: { image: "/images/glass-topping.webp", left: 311.98, top: 290.97, width: 310.61, height: 507.19 },
  chocolate: { image: "/images/glass-chocolate.webp", left: 304.29, top: 292.52, width: 328.57, height: 536.51 },
  "sugar-syrup": { image: "/images/glass-sugar-syrup.webp", left: 296.85, top: 292.58, width: 328.57, height: 536.51 },
  vending: { image: "/images/glass-vending.webp", left: 313.56, top: 282.91, width: 321.55, height: 525.04 },

  // Still to come. Sugar Free's artwork has arrived but its frame measures the
  // whole mask group — the glass together with the sachets flying around it —
  // and the picture supplied is the glass on its own, so the two do not
  // describe the same box. Jam, Garnish and Tea have neither yet.
};
