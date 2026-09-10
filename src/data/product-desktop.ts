import type { Box } from "./product-glass";

/**
 * The desktop product card, as `forme.fig` draws it.
 *
 * The hero used to be laid out against the pouch's *group* — 446 x 492 on Raf
 * Coffee — and then pulled about by hand until it looked right, which is where
 * `--group-shift`, `--pack-scale`, `--glass-drop` and `--seals-drop` came from.
 * None of them were in the design. What was actually wrong is that the pouch's
 * layer is smaller than its group and its image fill is cropped, so the pack
 * shot came out at two thirds the size and everything measured against it had
 * to be nudged back into place.
 *
 * `pouch` is that layer — the box the file draws the pack shot in — and the
 * stylesheet takes the crop off it to find the standing pouch. The drink beside
 * it is in `product-glass.ts`, the ground shadows are shares of `pouch`, and
 * the seals are the same two coordinates on every card. Nothing is nudged.
 *
 * Coordinates are the file's own: `left` from the frame's left edge, `top` from
 * the top of the page, in the 1200-wide frame.
 *
 * The wash is a radial, not the vertical ramp sampled off the key visual, and
 * `edge` is the product's own colour laid over the left of it — which is what
 * gives that half of the card its depth. Three cards have no wash rectangle at
 * all: Garnish, Sugar Free and Tea are built differently, and they keep the
 * ramp their banner or their frame fill already gives them.
 */

export type DesktopCard = {
  /** The pack shot's own layer, before the crop its image fill carries. */
  pouch: Box;
  /** The radial wash: its inner colour, then its outer. */
  washIn?: string;
  washOut?: string;
  /** Where the file draws that radial, when not the common one. */
  washShape?: string;
  /** The colour laid over the left of the wash, opaque at its foot. */
  edge?: string;
  /** The panel the four features stand on, under the hero. */
  panel?: string;
  /**
   * How strongly the brand mark reads behind the artwork.
   *
   * Only the three collages carry it. The other thirteen stand on a wash, and
   * one weight for the dark ones and another for the pale ones covers them; a
   * collage's ground is a photograph, and the design answers each of those
   * separately. Measured off its own export: the solid part of the word lifts
   * Garnish's beige a little under half the way to white and Tea's black
   * barely a sixth.
   */
  mark?: number;
};

/** Where the file puts the light on all but three of the sixteen. */
export const WASH_SHAPE = "49.2% 33.5% at 76.6% 35.8%";

export const productDesktop: Record<string, DesktopCard> = {
  "raf-coffee": { pouch: { left: 91.34, top: 180.05, width: 329.29, height: 479.41 }, washIn: "#fbf8f0", washOut: "#ddd1b9", edge: "#b9ad95", panel: "#bbaf97" },
  "cream-latte": { pouch: { left: 92.49, top: 128.32, width: 390.07, height: 567.89 }, washIn: "#fbf8f0", washOut: "#ceaaa6", washShape: "47.8% 36.2% at 76.6% 35.8%", edge: "#ceaaa6", panel: "#d1adaa" },
  "chai-latte": { pouch: { left: 92.82, top: 128.32, width: 389.63, height: 567.25 }, washIn: "#fbf8f0", washOut: "#c2a899", washShape: "47.8% 36.2% at 76.6% 35.8%", edge: "#c2a899", panel: "#c2a899" },
  milkshake: { pouch: { left: 115.07, top: 128.31, width: 389.63, height: 567.25 }, washIn: "#ffffff", washOut: "#dfa8b5", washShape: "47.8% 36.2% at 76.6% 35.8%", edge: "#dfa8b5", panel: "#dfa8b5" },
  frappe: { pouch: { left: 100.58, top: 128.32, width: 389.64, height: 567.26 }, washIn: "#ffffff", washOut: "#996539", washShape: "47.8% 36.2% at 76.6% 35.8%", edge: "#996539", panel: "#996539" },
  "iced-tea": { pouch: { left: 102.55, top: 130.45, width: 388.2, height: 565.16 }, washIn: "#ffffff", washOut: "#d6ba61", washShape: "47.8% 36.2% at 76.6% 35.8%", edge: "#d6ba61" },
  cordial: { pouch: { left: 103.64, top: 134.45, width: 385.66, height: 561.47 }, washIn: "#ffffff", washOut: "#8398b2", washShape: "47.8% 36.2% at 76.6% 35.8%", edge: "#8398b2", panel: "#8398b2" },
  topping: { pouch: { left: 105.85, top: 134.45, width: 388.45, height: 565.52 }, washIn: "#ffffff", washOut: "#e9e6d9", washShape: "47.8% 36.2% at 76.6% 35.8%", edge: "#e9e6d9", panel: "#d5d1c1" },
  matcha: { pouch: { left: 106.85, top: 137.38, width: 385.73, height: 561.57 }, washIn: "#ffffff", washOut: "#52a866", edge: "#52a866", panel: "#52a866" },
  chocolate: { pouch: { left: 106.38, top: 136.38, width: 387.42, height: 564.03 }, washIn: "#9f786c", washOut: "#4a322d", washShape: "47.8% 36.2% at 76.6% 35.8%", edge: "#4a322d", panel: "#4a322d" },
  "sugar-syrup": { pouch: { left: 106.63, top: 136.43, width: 387.42, height: 564.03 }, washIn: "#f1d1b4", washOut: "#e6b3a8", washShape: "47.8% 36.2% at 76.6% 35.8%", edge: "#f1d1b4" },
  garnish: { pouch: { left: 106.85, top: 137.38, width: 385.73, height: 561.57 }, panel: "#ceb999", mark: 0.73 },
  vending: { pouch: { left: 106.15, top: 132.35, width: 390.87, height: 569.06 }, washIn: "#c5a880", washOut: "#4e342e", washShape: "51.8% 46.4% at 75.2% 85.6%", edge: "#4e342e" },
  jam: { pouch: { left: 106.85, top: 137.38, width: 385.73, height: 561.57 }, washIn: "#973139", washOut: "#3d060a", washShape: "51.8% 46.4% at 75.2% 85.6%", edge: "#3d060a" },
  "sugar-free": { pouch: { left: 106.85, top: 137.38, width: 385.73, height: 561.57 }, panel: "#acc4b2", mark: 1 },
  tea: { pouch: { left: 106.85, top: 137.38, width: 385.73, height: 561.57 }, mark: 0.16 },
};
