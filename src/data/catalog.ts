import { getProduct, type Product } from "@/data/products";

export const CATALOG_GROUPS = [
  {
    id: "cold",
    label: "Cold & Refreshing",
    slugs: ["milkshake", "frappe", "iced-tea", "cordial"],
  },
  {
    id: "coffee",
    label: "Coffee & Specialty",
    slugs: ["raf-coffee", "chai-latte", "matcha", "chocolate", "cream-latte"],
  },
  {
    id: "bar",
    label: "Bar & Ingredients",
    slugs: ["topping", "garnish", "jam", "sugar-syrup"],
  },
  {
    id: "business",
    label: "Business & Innovation",
    slugs: ["tea", "sugar-free", "vending"],
  },
] as const;

export type CatalogGroupId = (typeof CATALOG_GROUPS)[number]["id"];

export type CatalogProduct = Product & {
  categoryId: CatalogGroupId;
  categoryLabel: string;
};

export const CATALOG_PRODUCTS: CatalogProduct[] = CATALOG_GROUPS.flatMap((group) =>
  group.slugs.map((slug) => {
    const product = getProduct(slug);
    if (!product) throw new Error(`Missing catalogue product: ${slug}`);
    return { ...product, categoryId: group.id, categoryLabel: group.label };
  }),
);

/**
 * Public product identifiers accepted by the Test Mode checkout endpoint.
 * They are identifiers, not prices or secrets; the server owns the AED amount.
 */
export const CHECKOUT_PRODUCT_IDS = Object.freeze({
  "sugar-free": "194500823312",
  frappe: "207187094752",
  "iced-tea": "293702296702",
  chocolate: "296069682122",
  garnish: "316933484392",
  jam: "324849428612",
  milkshake: "389328196132",
  "raf-coffee": "466013811412",
  cordial: "778280145182",
  "cream-latte": "781170478702",
  "chai-latte": "827401503212",
  "sugar-syrup": "888812727292",
  matcha: "975474893862",
} satisfies Partial<Record<Product["slug"], string>>);

export function getCheckoutProductId(slug: string): string | null {
  return CHECKOUT_PRODUCT_IDS[slug as keyof typeof CHECKOUT_PRODUCT_IDS] ?? null;
}
