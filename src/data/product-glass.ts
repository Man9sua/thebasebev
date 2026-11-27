export type Box = { left: number; top: number; width: number; height: number };

export const PACK_BOX: Box = { left: 106.85, top: 137.73, width: 529.27, height: 676.55 };

export type ProductGlass = {
  image: string | null;
  left: number;
  top: number;
  width: number;
  height: number;
  pack?: Box;
};

export function packBox(slug: string): Box {
  return productGlass[slug]?.pack ?? PACK_BOX;
}

export const productGlass: Record<string, ProductGlass> = {
  matcha: { image: "/images/glass-matcha.webp", left: 301.34, top: 280.11, width: 327.14, height: 534.17, pack: { left: 106.85, top: 137.73, width: 529.27, height: 676.55 } },
  "raf-coffee": { image: "/images/glass-raf-coffee.webp", left: 242.65, top: 287.31, width: 313.83, height: 479.52, pack: { left: 91.34, top: 180.48, width: 446.13, height: 492.26 } },
  "cream-latte": { image: "/images/glass-cream-latte.webp", left: 274.31, top: 249.61, width: 385.54, height: 589.09, pack: { left: 92.49, top: 128.67, width: 567.36, height: 710.03 } },
  "chai-latte": { image: "/images/glass-chai-latte.webp", left: 326.61, top: 330.06, width: 288.94, height: 471.81, pack: { left: 92.82, top: 128.67, width: 534.63, height: 673.21 } },
  milkshake: { image: "/images/glass-milkshake.webp", left: 341.14, top: 292.01, width: 300.84, height: 491.24, pack: { left: 115.07, top: 128.66, width: 534.63, height: 654.58 } },
  frappe: { image: "/images/glass-frappe.webp", left: 313.84, top: 291.15, width: 304.33, height: 496.93, pack: { left: 100.58, top: 128.67, width: 534.63, height: 659.41 } },
  "iced-tea": { image: "/images/glass-iced-tea.webp", left: 308.54, top: 265.08, width: 320.62, height: 523.52, pack: { left: 102.55, top: 130.8, width: 532.66, height: 657.8 } },
  cordial: { image: "/images/glass-cordial.webp", left: 315.93, top: 260.56, width: 318.52, height: 520.1, pack: { left: 103.64, top: 134.8, width: 530.81, height: 645.86 } },
  topping: { image: "/images/glass-topping.webp", left: 311.98, top: 290.97, width: 310.61, height: 507.19, pack: { left: 105.85, top: 134.8, width: 533, height: 663.35 } },
  chocolate: { image: "/images/glass-chocolate.webp", left: 304.29, top: 292.52, width: 328.57, height: 536.51, pack: { left: 106.38, top: 136.73, width: 531.59, height: 692.31 } },
  "sugar-syrup": { image: "/images/glass-sugar-syrup.webp", left: 296.85, top: 292.58, width: 328.57, height: 536.51, pack: { left: 106.63, top: 136.78, width: 531.59, height: 692.31 } },
  vending: { image: "/images/glass-vending.webp", left: 313.56, top: 282.91, width: 321.55, height: 525.04, pack: { left: 106.15, top: 132.7, width: 536.33, height: 675.25 } },
  jam: { image: "/images/glass-jam.webp", left: 312.82, top: 307.38, width: 319.4, height: 521.5, pack: { left: 106.85, top: 137.73, width: 532.69, height: 691.17 } },

};
