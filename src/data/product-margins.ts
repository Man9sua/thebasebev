export type ProductMargin = {
  legacyLabel: string;
  legacy: string;
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
  garnish: { legacyLabel: "with Syrup", legacy: "85.00 %", base: "98.25 %" },
  tea: { legacyLabel: "with Syrup", legacy: "60 %", base: "98.60 %" },

  jam: { legacyLabel: "with Syrup", legacy: "86.87 %", base: "88.40 %" },
};
