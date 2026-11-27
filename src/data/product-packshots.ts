type Packshot = Readonly<{ src: string; srcSet?: string; alt: string }>;

function pouch(slug: string, alt: string): Packshot {
  const base = `/images/packshots/${slug}`;
  return {
    src: `${base}-640.png`,
    srcSet: [120, 320, 640, 1000].map(width => `${base}-${width}.png ${width}w`).join(", "),
    alt,
  };
}

const packshots: Readonly<Record<string, Packshot | undefined>> = {
  "raf-coffee": pouch("raf-coffee", "Raf Coffee pouch"),
  "cream-latte": pouch("cream-latte", "Cream Latte pouch"),
  "chai-latte": pouch("chai-latte", "Chai Latte pouch"),
  milkshake: pouch("milkshake", "Milkshake pouch"),
  frappe: pouch("frappe", "Frappe pouch"),
  "iced-tea": pouch("iced-tea", "Iced Tea pouch"),
  cordial: pouch("cordial", "Cordial pouch"),
  topping: pouch("topping", "Topping pouch"),
  matcha: pouch("matcha", "Matcha pouch"),
  chocolate: pouch("chocolate", "Chocolate pouch"),
  "sugar-syrup": pouch("sugar-syrup", "Sugar Syrup pouch"),
  "sugar-free": pouch("sugar-free", "Mint Sugar Free sachet"),
  tea: pouch("tea", "Green Tea sachet"),
  garnish: pouch("garnish", "Garnish pouch"),
  vending: pouch("vending", "Vending pouch"),
  jam: pouch("jam", "Jam pouch"),
  "at-home": pouch("at-home", "At Home Blue Matcha 150 g pouch"),
  "colour-collection": {
    src: "/images/products/colour-collection/tin-butterfly-pea-560.webp",
    srcSet: [360, 560, 880].map(w => `/images/products/colour-collection/tin-butterfly-pea-${w}.webp ${w}w`).join(", "),
    alt: "Colour Collection Butterfly Pea powder tin",
  },
  electrolyte: { src: "/images/shop/electrolyte.webp", alt: "The Base Electrolyte 5 g stick" },
};

export const getProductPackshot = (slug: string) => packshots[slug];
