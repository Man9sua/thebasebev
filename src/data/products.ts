/**
 * THE BASE product registry.
 *
 * Routes and copy come from the existing product pages, so every card links to
 * a URL that already ranks. Never rename a `route` — it is live.
 *
 * `backgroundColor` drives the Bestsellers colour field and the catalog cards.
 * Most values were sampled from that product's own pack shot, so the artwork
 * blends into the field with no visible edge. Three are hand-set because the
 * product's largest artwork is a dark banner rather than a coloured pack shot;
 * they are marked and are the ones worth reviewing first.
 *
 * `price` is a snapshot of what /catalog shows. That page still fetches live
 * prices at runtime — these are here so the homepage can show a real number
 * instead of a placeholder, and they are safe to duplicate only because
 * `scripts/smoke-browser.mjs` asserts the same strings against the running
 * catalog. If a price changes, that test fails rather than the two quietly
 * disagreeing.
 */

import { onColor } from "@/lib/contrast";

export type Product = {
  slug: string;
  /** Live URL. Never rename. */
  route: string;
  /** Short display name for cards and the carousel. */
  name: string;
  /**
   * `name` with soft hyphens (U+00AD) marking where it may break when it is set
   * at display size. Only needed for single words long enough to outrun their
   * column — anything with a space in it already has somewhere to break.
   *
   * Set explicitly rather than left to `hyphens: auto`, which needs a
   * hyphenation dictionary the browser may simply not have: Chromium ships them
   * as a downloadable component, and without one the property does nothing at
   * all. A soft hyphen needs no dictionary.
   */
  hyphenatedName?: string;
  /** The product page's H1, reused so wording stays consistent across the site. */
  headline: string;
  description: string;
  image: string | null;
  /**
   * Retail price as shown on /catalog, or null for "Price on request".
   *
   * A snapshot, not a source of truth — the catalog page still fetches live
   * prices at runtime. It is safe to keep here because
   * `scripts/smoke-browser.mjs` asserts these exact strings against the running
   * catalog, so any drift fails a test rather than going unnoticed.
   */
  price: string | null;
  /**
   * The product's colour field. Swap freely — no component hard-codes a
   * product colour anywhere.
   */
  backgroundColor: string;
  /**
   * Accent for small emphasis: the product name in the hero, the active
   * indicator, rules. Optional — falls back to the brand red until the real
   * palette arrives.
   */
  accentColor?: string;
  /**
   * Ink for anything sitting on `backgroundColor`. Optional — when absent it is
   * measured from the background so it always clears WCAG AA. Set it only to
   * override that.
   */
  textColor?: string;
};

/** Used when a product has no accent of its own. */
export const DEFAULT_ACCENT = "#e11b22";

export type ResolvedProductColors = {
  background: string;
  accent: string;
  text: string;
};

/**
 * The one place product colours become what components render.
 *
 * Components call this and never read the raw fields, so filling in
 * `accentColor` / `textColor` later changes the whole site without touching a
 * single component.
 */
export function resolveProductColors(product: Product): ResolvedProductColors {
  return {
    background: product.backgroundColor,
    accent: product.accentColor ?? DEFAULT_ACCENT,
    text: product.textColor ?? onColor(product.backgroundColor),
  };
}

export const PRODUCTS: Product[] = [
  {
    slug: "milkshake",
    route: "/milkshake",
    name: "Milkshake",
    hyphenatedName: "Milk\u00ADshake",
    headline: "Milkshake Base Powder — Thick, Creamy & Easy to Blend",
    description:
      "Milkshake base powder for cafés and HoReCa: thick, creamy texture from a single scoop, no dairy prep and no waste.",
    image: "/images/tild6133-3232-4764-b264-653138376630__group_903_1.png",
    price: "45.38 AED",
    backgroundColor: "#dfa9b5",
  },
  {
    slug: "matcha",
    route: "/matcha",
    name: "Matcha",
    headline: "Matcha Beverage Base — Perfect for Cafés, Franchises & OEM",
    description:
      "Matcha beverage base with a clean, balanced profile that holds its colour hot or iced, built for repeatable service.",
    image: "/images/tild3865-3461-4539-a437-323236316538__group_907_2.png",
    price: "70.42 AED",
    backgroundColor: "#53a967",
  },
  {
    slug: "chocolate",
    route: "/chocolate",
    name: "Chocolate",
    headline: "Chocolate Beverage Base for Cafés, Bars & OEM Use",
    description:
      "Rich chocolate base that dissolves cleanly in hot or cold milk, for cafés, bars and private-label production.",
    image: "/images/tild6263-6261-4637-a161-336164333433__group_909_1.png",
    price: "67.88 AED",
    backgroundColor: "#43201c",
  },
  {
    slug: "iced-tea",
    route: "/iced-tea",
    name: "Iced Tea",
    headline: "Iced Tea Base for Refreshing, Crisp, Ready-to-Mix Beverages",
    description:
      "Crisp iced tea base that mixes instantly and stays bright over ice — consistent from the first cup to the last.",
    image: "/images/tild3363-6566-4933-b332-643866313131__group_905_1.png",
    price: "42.81 AED",
    backgroundColor: "#d7bd64",
  },
  {
    slug: "frappe",
    route: "/frappe",
    name: "Frappe",
    headline: "Frappe Base for Smooth, Creamy Blended Beverages",
    description:
      "Frappe base engineered for blended service: smooth body, stable foam and the same result on every shift.",
    image: "/images/tild3462-3862-4961-a462-633462333961__group_904_1.png",
    price: "49.40 AED",
    backgroundColor: "#9b693d",
  },
  {
    slug: "chai-latte",
    route: "/chai-latte",
    name: "Chai Latte",
    headline: "Chai Latte Base — Authentic, Spiced, and Easy to Prepare",
    description:
      "Authentic spiced chai latte base — full aromatic profile without brewing, steeping or waste.",
    image: "/images/tild3862-3533-4437-b961-623838626563__group_902_1.png",
    price: "52.05 AED",
    backgroundColor: "#c2a899",
  },
  {
    slug: "cordial",
    route: "/cordial",
    name: "Cordial",
    headline: "Cordial Drink Powders — Add Bold Fruit & Spice Flavors",
    description:
      "Cordial powders for bold fruit and spice builds across mocktails, sodas and signature menu drinks.",
    image: "/images/tild3266-3831-4662-b132-393566336463__group_906_1.png",
    price: "50.15 AED",
    backgroundColor: "#8499b3",
  },
  {
    slug: "sugar-syrup",
    route: "/sugar-syrup",
    name: "Sugar Syrup",
    headline: "Sugar Syrup for Cafés, Bars & Beverage Brands",
    description:
      "Consistent sugar syrup for cafés and bars — stable sweetness with no crystallisation behind the counter.",
    image: "/images/tild3762-6437-4936-b831-353461653538__group_911_1.png",
    price: "48.82 AED",
    backgroundColor: "#f1d1b4",
  },
  {
    slug: "jam",
    route: "/jam",
    name: "Jam & Fillings",
    headline: "Premium Jam and Fruit Fillings for Cafés, Bakeries & Beverages",
    description:
      "Jams and fruit fillings with real fruit character, bake-stable and ready for beverage, pastry and dessert work.",
    image: "/images/tild6132-6537-4635-a437-613138386635__group_916_1.png",
    price: "64.94 AED",
    backgroundColor: "#42080d",
  },
  {
    slug: "raf-coffee",
    route: "/raf-coffee",
    name: "Raf Coffee",
    headline: "Raf Coffee",
    description:
      "Raf coffee base — the signature creamy, lightly sweet profile, ready in one step.",
    image: "/images/tild3465-3139-4036-b037-343164383039__group_798.png",
    price: "38.74 AED",
    backgroundColor: "#c8a887" /* hand-set — verify */,
  },
  {
    slug: "cream-latte",
    route: "/cream-latte",
    name: "Cream Latte",
    headline: "Cream Latte Base — Rich, Smooth, and Easy to Prepare",
    description:
      "Cream latte base with a rounded dairy body that holds through steaming and over ice.",
    image: "/images/tild6532-6131-4765-a162-316663316136__mask_group_96.png",
    price: "38.76 AED",
    backgroundColor: "#ceaaa7",
  },
  {
    slug: "tea",
    route: "/tea",
    name: "Tea",
    headline: "Tea-Based Drink Powders for Cafés, Bars & OEM Projects",
    description:
      "Tea-based drink powders for cafés, bars and OEM projects, from classic black to green and herbal profiles.",
    image: "/images/tild3836-3861-4566-b132-313163316566__group_946.png",
    price: null,
    backgroundColor: "#b7c9a6" /* hand-set — verify */,
  },
  {
    slug: "topping",
    route: "/topping",
    name: "Toppings",
    headline: "Professional Toppings for Drinks and Desserts",
    description:
      "Professional toppings that finish drinks and desserts with consistent texture and clean release.",
    image: "/images/tild3764-3966-4862-a438-323039663536__group_929_1.png",
    price: null,
    backgroundColor: "#eeebe1",
  },
  {
    slug: "garnish",
    route: "/garnish",
    name: "Garnishes",
    headline: "Professional Garnishes for Beverages and Desserts",
    description:
      "Garnishes built for service speed — consistent size, colour and shelf life across every cover.",
    image: "/images/tild6564-3935-4536-b739-306432633831__group_890_1.png",
    price: "4.91 AED",
    backgroundColor: "#ebe2d2",
  },
  {
    slug: "sugar-free",
    route: "/sugar-free",
    name: "Sugar Free",
    headline: "Sugar-Free Beverage Bases for Cafés, Restaurants & Distributors",
    description:
      "Sugar-free beverage bases that keep full flavour, for menus that need a no-sugar option without compromise.",
    image: "/images/tild6437-6630-4363-b464-343536313462__group_947.png",
    price: "14.22 AED",
    backgroundColor: "#e8f1e9",
  },
  {
    slug: "vending",
    route: "/vending",
    name: "Vending",
    headline: "Vending Machine Drink Powders for Automatic Dispensing",
    description:
      "Free-flowing powders formulated for automatic dispensing — no bridging, no clogging, consistent dose.",
    image: "/images/tild6439-3835-4139-b932-323831386638__group_912_1.png",
    price: null,
    backgroundColor: "#583d35",
  },
];

/**
 * Featured in the Bestsellers carousel, in order.
 *
 * Same five products, in the same order, as the hero slider running on
 * production today — the redesign changes how they are presented, not which
 * products the homepage promotes.
 */
export const BESTSELLER_SLUGS = [
  "cream-latte",
  "milkshake",
  "matcha",
  "iced-tea",
  "cordial",
] as const;

/** The homepage mini-catalog shows at most four. */
export const CATALOG_SLUGS = [
  "chai-latte",
  "cordial",
  "sugar-syrup",
  "jam",
] as const;

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

export function getProducts(slugs: readonly string[]): Product[] {
  return slugs
    .map(getProduct)
    .filter((product): product is Product => Boolean(product));
}
