/**
 * The profit-margin comparison shown in the product hero.
 *
 * New content, and the only thing on a product page that is not in the Tilda
 * export: it comes from the owner's own design file, not from
 * `build-product-details.mjs`, which is why it lives here and not in
 * `product-details.json` — that file is generated and would overwrite it on the
 * next run.
 *
 * Hand-written on purpose. These are financial claims on a B2B page, so a
 * product gets an entry only when the owner has given its two figures; nothing
 * here is derived, rounded or carried over from another product. A product with
 * no entry simply renders no margin block, which is why the type has no
 * fallback and `ProductHero` checks for `undefined` rather than filling in.
 */

export type ProductMargin = {
  /** What the operator makes the drink with today — "Syrup", "Ice cream". */
  comparedWith: string;
  /** Margin working that way, as it should read on the page, percent sign and all. */
  legacy: string;
  /** Margin working with THE BASE, same formatting. */
  base: string;
};

export const productMargins: Record<string, ProductMargin> = {
  // Both read off the owner's own product-page frames, 2026-08-27.
  "raf-coffee": { comparedWith: "Syrup", legacy: "61.52 %", base: "78.04 %" },
  matcha: { comparedWith: "Syrup", legacy: "76.53 %", base: "88.57 %" },
};
