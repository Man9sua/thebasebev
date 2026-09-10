import type { Box } from "./product-glass";

/**
 * The phone's product card, as `Untitled.site` draws it.
 *
 * The site file carries a mobile card per product — a 360-wide column under a
 * 108-tall header — and it is not the desktop frame narrowed. The wash behind
 * the pouch is a radial rather than the key visual's vertical ramp, the copy
 * stands on a panel of its own with two rounded top corners instead of on the
 * wash, and the drink sits in a box measured against the phone's pouch rather
 * than against the desktop's group. So the phone carries its own numbers here
 * and `ProductHero.module.css` reads them below its media query; nothing in
 * this file reaches the desktop.
 *
 * Coordinates are the card's own: `left` counted from its left edge, `top` from
 * the foot of the header, in the 360-wide frame the file draws. The stylesheet
 * turns them into shares of the pouch, so the composition holds its proportions
 * on any phone rather than only on a 360.
 *
 * Two cards are not built from a pouch and a drink at all — Garnish and Sugar
 * Free are collages, and they carry no wash rectangle. Both fall back to the
 * flat fill their own desktop frame uses, in `product-washes.ts`.
 *
 * The brand mark is no longer among them: the owner supplied the design's own
 * export of the whole lockup, so the phone paints that artwork rather than a
 * colour and an opacity per product.
 *
 * Read out of the file rather than derived, because the file does not follow a
 * rule: Milkshake's panel is its wash mixed 62% into white, Matcha's is not,
 * and Jam is drawn on Vending's beige wash under a pink panel — which is what
 * the design shows, so it is what this reproduces.
 */

/**
 * Where the file puts the light in that wash, as the ellipse its own gradient
 * matrix describes: a little right of centre and a little above it, behind the
 * pouch and the drink, with the band's edges left on the outer colour.
 *
 * The matrix is read as it stands — it takes the gradient's unit circle to the
 * shape — rather than inverted. Inverting it puts the same light left of centre
 * and half again as wide, which floods most of the band with the near-white
 * inner colour; the file's own rendering has no such glow.
 */
export const WASH_SHAPE = "42.6% 41.5% at 64.1% 41.7%";

export type MobileCard = {
  /** The radial wash behind the pouch: its inner colour, then its outer. */
  washIn?: string;
  washOut?: string;
  /** Where the file draws that radial, when not the common one. */
  washShape?: string;
  /** The panel the copy stands on, below the wash. */
  panel: string;
  /** The drink's layer, in the card's coordinates. */
  glass?: Box;
  /** Only where the phone's ground shadow is not the colour the desktop uses. */
  shade?: string;
};

export const productMobile: Record<string, MobileCard> = {
  "raf-coffee": { washIn: "#fbf8f0", washOut: "#ddd1b9", panel: "#ddd1b9", glass: { left: 157.28, top: 72.46, width: 138.57, height: 211.72 } },
  "cream-latte": { washIn: "#fff9f9", washOut: "#ceaaa7", panel: "#f4e3e1", glass: { left: 153.85, top: 60.53, width: 149.64, height: 228.65 } },
  "chai-latte": { washIn: "#fcf2ec", washOut: "#c2a899", panel: "#f4ebe6", glass: { left: 171.55, top: 94.42, width: 112.28, height: 183.33 } },
  milkshake: { washIn: "#fffdfd", washOut: "#dfa8b5", panel: "#f3dee3", glass: { left: 171.13, top: 77.06, width: 116.9, height: 190.88 } },
  frappe: { washIn: "#f8f1ea", washOut: "#996538", panel: "#d2b398", glass: { left: 166.15, top: 76.72, width: 118.25, height: 193.09 } },
  "iced-tea": { washIn: "#fff4cf", washOut: "#ead693", panel: "#f9e7ac", glass: { left: 163.62, top: 65.96, width: 125.04, height: 204.18 } },
  cordial: { washIn: "#ffffff", washOut: "#8398b2", panel: "#d0ddef", glass: { left: 166.62, top: 62.96, width: 125.04, height: 204.18 } },
  topping: { washIn: "#f7f5eb", washOut: "#f7f5eb", washShape: "39.0% 44.9% at 64.1% 41.7%", panel: "#ece9dd", glass: { left: 162.49, top: 75.23, width: 120.24, height: 177.45 } },
  matcha: { washIn: "#9edbac", washOut: "#52a866", panel: "#aae2b7", glass: { left: 159.62, top: 69.47, width: 128.4, height: 209.67 } },
  chocolate: { washIn: "#9f786c", washOut: "#342b28", washShape: "29.0% 34.1% at 62.7% 50.8%", panel: "#8c706a", glass: { left: 160.62, top: 74.47, width: 128.4, height: 209.67 } },
  "sugar-syrup": { washIn: "#fde1c7", washOut: "rgba(246, 165, 161, 0.2)", panel: "#f9d9d1", glass: { left: 157.62, top: 74.47, width: 128.4, height: 209.67 } },
  garnish: { panel: "#dfceb4" },
  vending: { washIn: "#c5a880", washOut: "rgba(197, 168, 128, 0.2)", panel: "#c9b7a2", glass: { left: 163.62, top: 71.77, width: 124.55, height: 203.37 }, shade: "#8c735e" },
  jam: { washIn: "#c5a880", washOut: "rgba(197, 168, 128, 0.2)", panel: "#fccace", glass: { left: 163.62, top: 80.77, width: 124.55, height: 203.37 } },
  "sugar-free": { panel: "#e0e9e2" },
  // No wash of its own, so it falls back to the black its own frame carries.
  // The site file draws a mauve radial here, and it is the phone card's ground
  // rather than the collage's: between the phone frame's cap and the desktop
  // breakpoint the card stands in the middle of the window, and that mauve was
  // showing either side of a photograph that fades to black.
  tea: { panel: "#5e5a57" },
};
