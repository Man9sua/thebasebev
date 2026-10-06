import type { Product } from "@/data/products";

/** Downloads a page may offer. Unset until the file actually exists. */
export type ProductPageAssets = {
  marketingKit?: string;
  specification?: string;
};

export type ProductPageProps = {
  product: Product;
  /** Production's ranking sentence, shown as a small h2 under the name (omitted when it is the name). */
  headline?: string;
  assets: ProductPageAssets;
};
