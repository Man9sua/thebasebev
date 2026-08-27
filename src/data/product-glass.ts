/**
 * The drink standing in front of the pouch in the product hero.
 *
 * A layer of its own in the owner's Figma frame — on Matcha it is an image
 * called `Matcha.png` — rather than part of the pack shot, which is why it is
 * measured and placed separately here instead of being baked into
 * `pack-<slug>.webp`.
 *
 * `left`, `top`, `width` and `height` are that layer's own numbers in the
 * 1240-wide frame, counted from the top of the page exactly like every other
 * measurement in `ProductHero.module.css`.
 *
 * `image` is `null` while the artwork has not been supplied, and the drink
 * simply does not render. It cannot be cut out of anything already in this
 * repository: the client's key visuals have the glass composited onto the wash
 * and overlapping the pouch, and a translucent glass of green drink on a green
 * ground does not separate cleanly. It has to come out of the design file —
 * export the layer as PNG at 2x on transparency, convert it to WebP as
 * `public/images/glass-<slug>.webp`, and name it here.
 *
 * Export the layer whole rather than trimmed to the drink: Figma's box includes
 * the transparent margin around it, and it is that box these numbers describe.
 * Matcha's is 655x1069, which is the 327.14 x 534.17 below at 2x to within a
 * third of a pixel — so the picture drops into the box with nothing to align.
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
  matcha: {
    image: "/images/glass-matcha.webp",
    left: 301.34,
    top: 280.11,
    width: 327.14,
    height: 534.17,
  },
};
