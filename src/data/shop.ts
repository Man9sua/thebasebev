import { CATALOG_PRODUCTS, type CatalogProduct } from "./catalog";
import { SAMPLE_FLAVOURS } from "./sample-flavours";
import catalogTiles from "./catalog-tiles.json";

export const SHOP_SAMPLE_LIMIT = 6;
export const SHOP_MAX_QUANTITY = 10;
export const SHOP_MAX_LINES = 20;
export type ShopKind = "products" | "samples";
export type ShopProduct = CatalogProduct & { flavors: readonly string[]; format: string };

const featured = ["milkshake", "iced-tea", "cordial", "matcha", "raf-coffee", "chocolate"];
const featuredRank = new Map(featured.map((slug, index) => [slug, index]));
const tiles = catalogTiles as Record<string, { image: string; source: string }>;
const formats: Readonly<Record<string, string>> = {
  tea: "1 g sachets", "sugar-free": "1 g sachets", puree: "950 ml bottle", sauce: "1.89 L bottle",
  "colour-collection": "100 g tin", "add-ons": "1–5 g sticks", electrolyte: "Sticks, packs and bulk", "at-home": "150 g pouch", garnish: "50 g pouch",
};
const names: Readonly<Record<string, string>> = { jam: "Jam", garnish: "Garnish", topping: "Topping", "sugar-syrup": "Syrup" };

/** The supplied packshots lead the full existing range; approved prices live in shop-payment. */
export const SHOP_PRODUCTS: readonly ShopProduct[] = [...CATALOG_PRODUCTS]
  .sort((left, right) => (featuredRank.get(left.slug) ?? featured.length) - (featuredRank.get(right.slug) ?? featured.length))
  .map((product) => ({
    ...product,
    name: names[product.slug] ?? product.name,
    image: product.slug === "at-home" ? "/images/shop/at-home.jpg" : featuredRank.has(product.slug) ? `/images/shop/${product.slug}.webp`
      : tiles[product.slug]?.source === "illustration" ? product.image : tiles[product.slug]?.image ?? product.image,
    flavors: SAMPLE_FLAVOURS[product.slug] ?? [],
    format: formats[product.slug] ?? "500 g pouch",
  }));

const productsBySlug = new Map(SHOP_PRODUCTS.map((product) => [product.slug, product]));
export function getShopProduct(slug: string): ShopProduct | undefined { return productsBySlug.get(slug); }
export function shopKindForCountry(country: string): ShopKind { return country.toUpperCase() === "AE" ? "products" : "samples"; }
