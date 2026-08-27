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
 * `image` is `null` while the artwork has not been supplied. It cannot be cut
 * out of anything already in this repository: the client's key visuals have the
 * glass composited onto the wash and overlapping the pouch, and a translucent
 * glass of green drink on a green ground does not separate cleanly. It has to
 * come out of the design file — export the layer as PNG at 2x on transparency,
 * and it drops straight in here.
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
  matcha: { image: null, left: 301.34, top: 280.11, width: 327.14, height: 534.17 },
};
