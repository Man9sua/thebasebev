export type CommerceCatalogProduct = Readonly<{
  productKey: string;
  websiteProductId: string;
  websiteSku: string;
  name: string;
  unitAmount: number;
}>;

const products = [
  ["sugar-free", "194500823312", "Sugar Free", 1422],
  ["frappe", "207187094752", "Frappe", 4940],
  ["iced-tea", "293702296702", "Iced Tea", 4281],
  ["chocolate", "296069682122", "Chocolate", 6788],
  ["garnish", "316933484392", "Garnish", 491],
  ["jam", "324849428612", "Jam", 6494],
  ["milkshake", "389328196132", "Milkshake", 4538],
  ["raf-coffee", "466013811412", "Raf Coffee", 3874],
  ["cordial", "778280145182", "Cordial", 5015],
  ["cream-latte", "781170478702", "Cream Latte", 3876],
  ["chai-latte", "827401503212", "Chai Latte", 5205],
  ["sugar-syrup", "888812727292", "Sugar Syrup", 4882],
  ["matcha", "975474893862", "Matcha", 7042],
] as const;

export const COMMERCE_CATALOG = Object.freeze(
  Object.fromEntries(
    products.map(([productKey, websiteProductId, name, unitAmount]) => [
      websiteProductId,
      {
        productKey,
        websiteProductId,
        websiteSku: `web:${websiteProductId}`,
        name,
        unitAmount,
      },
    ]),
  ) as Record<string, CommerceCatalogProduct>,
);

export const COMMERCE_PRODUCTS = Object.freeze(Object.values(COMMERCE_CATALOG));

export function getCommerceProduct(websiteProductId: string) {
  return COMMERCE_CATALOG[websiteProductId] ?? null;
}
