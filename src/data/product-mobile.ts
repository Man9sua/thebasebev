import type { Box } from "./product-glass";

export const WASH_SHAPE = "42.6% 41.5% at 64.1% 41.7%";

export type MobileCard = {
  washIn?: string;
  washOut?: string;
  washShape?: string;
  panel: string;
  glass?: Box;
  shade?: string;
  mark?: number;
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
  garnish: { washIn: "#ede6d8", washOut: "#dfceb4", washShape: "200% 105% at 50% 100%", panel: "#dfceb4", mark: 0.21 },
  vending: { washIn: "#c5a880", washOut: "rgba(197, 168, 128, 0.2)", panel: "#c9b7a2", glass: { left: 163.62, top: 71.77, width: 124.55, height: 203.37 }, shade: "#8c735e" },
  jam: { washIn: "#c5a880", washOut: "rgba(197, 168, 128, 0.2)", panel: "#fccace", glass: { left: 163.62, top: 80.77, width: 124.55, height: 203.37 } },
  "sugar-free": { panel: "#e0e9e2", mark: 0.7 },
  tea: { panel: "#5e5a57", mark: 0.45 },
};
