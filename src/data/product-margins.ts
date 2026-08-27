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
 *
 * Read off the frames themselves, so the digits are the design's. The one thing
 * normalised is the space before the per-cent sign, which the frames are not
 * consistent about — `50.50%` on Chai Latte against `61.52 %` on Raf Coffee.
 */

export type ProductMargin = {
  /**
   * The caption over the first figure, whole — not a product name to prefix
   * with "with". Most frames read "with Syrup"; Milkshake's reads "Actual
   * recipe", because there is no syrup in a milkshake to compare against.
   */
  legacyLabel: string;
  /** Margin the way the drink is made today, as it should read on the page. */
  legacy: string;
  /** Margin working with THE BASE, same formatting. */
  base: string;
};

export const productMargins: Record<string, ProductMargin> = {
  "raf-coffee": { legacyLabel: "with Syrup", legacy: "61.52 %", base: "78.04 %" },
  matcha: { legacyLabel: "with Syrup", legacy: "76.53 %", base: "88.57 %" },
  "cream-latte": { legacyLabel: "with Syrup", legacy: "65.04 %", base: "77.87 %" },
  "chai-latte": { legacyLabel: "with Syrup", legacy: "50.50 %", base: "74 %" },
  milkshake: { legacyLabel: "Actual recipe", legacy: "72.32 %", base: "84.16 %" },
  frappe: { legacyLabel: "with Syrup", legacy: "57.93 %", base: "70.47 %" },
  "iced-tea": { legacyLabel: "with Syrup", legacy: "82.85 %", base: "89.05 %" },
  cordial: { legacyLabel: "with Syrup", legacy: "84.24 %", base: "86.4 %" },
  topping: { legacyLabel: "with Syrup", legacy: "35.43 %", base: "72.14 %" },
  chocolate: { legacyLabel: "with Syrup", legacy: "75.40 %", base: "76.80 %" },
  "sugar-syrup": { legacyLabel: "with Syrup", legacy: "68.70 %", base: "85.30 %" },
  vending: { legacyLabel: "with Syrup", legacy: "56.10 %", base: "78.80 %" },
  "sugar-free": { legacyLabel: "with Syrup", legacy: "21 %", base: "78.6 %" },

  // Jam, Garnish and Tea have no frame yet, so they carry no figures.
};
