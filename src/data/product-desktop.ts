import type { Box } from "./product-glass";

export type DesktopCard = {
  pouch: Box;
  washIn?: string;
  washOut?: string;
  washShape?: string;
  edge?: string;
  panel?: string;
  mark?: number;
  markClip?: number;
  markFill?: string;
};

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
  garnish: { pouch: { left: 106.85, top: 137.38, width: 385.73, height: 561.57 }, panel: "#ceb999", mark: 0.48 },
  vending: { pouch: { left: 106.15, top: 132.35, width: 390.87, height: 569.06 }, washIn: "#c5a880", washOut: "#4e342e", washShape: "51.8% 46.4% at 75.2% 85.6%", edge: "#4e342e" },
  jam: { pouch: { left: 106.85, top: 137.38, width: 385.73, height: 561.57 }, washIn: "#973139", washOut: "#3d060a", washShape: "51.8% 46.4% at 75.2% 85.6%", edge: "#3d060a" },
  "sugar-free": { pouch: { left: 106.85, top: 137.38, width: 385.73, height: 561.57 }, panel: "#acc4b2", mark: 0.69, markClip: 46.91 },
  tea: { pouch: { left: 106.85, top: 137.38, width: 385.73, height: 561.57 }, mark: 0.18, markFill: "#9b9b9b" },
};
