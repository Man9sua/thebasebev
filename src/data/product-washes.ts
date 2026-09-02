/**
 * The wash a product hero stands on when the product has no key visual.
 *
 * Eleven products came with a finished banner, and `build-product-heroes.mjs`
 * samples its own background at the head and the foot of the crop so the page
 * can continue that exact colour to the left of it. Five never got one —
 * Topping, Sugar Syrup, Vending, Garnish and Sugar Free — and until now they
 * stood on a tint mixed down from the registry colour, which is far paler than
 * anything the design draws and made them read as the unfinished five.
 *
 * They are not unfinished in the design. Every card's hero band carries its own
 * fill in `forme.fig`, and these are those fills, read out of the file: three
 * radial gradients and two flats. So the five now stand on the colour they were
 * drawn on rather than on an approximation of it.
 *
 * The eleven with a banner are deliberately not listed. Their sampled pair and
 * the file's gradient stops are two different readings of one design — the
 * banner is a flattened render measured at two points, the file is the source —
 * and the banner is what the page's own artwork has to sit against, so it wins.
 *
 * `from` is the gradient's inner stop and `to` its outer one; a flat fill gives
 * the same colour for both. The centre is not measured: Figma stores the
 * ellipse as a matrix, and reproducing it exactly buys nothing a plausible
 * centre behind the pouch does not already give.
 */

export type ProductWash = { from: string; to: string };

export const productWashes: Record<string, ProductWash> = {
  topping: { from: "#ffffff", to: "#e9e6d9" },
  "sugar-syrup": { from: "#f1d1b4", to: "#e6b3a8" },
  vending: { from: "#c5a880", to: "#4e342e" },
  garnish: { from: "#eee6d8", to: "#eee6d8" },
  "sugar-free": { from: "#e8f2e9", to: "#e8f2e9" },
};
