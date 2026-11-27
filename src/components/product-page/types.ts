import type { Product } from "@/data/products";

export type ProductPageAssets = {
  marketingKit?: string;
  specification?: string;
};

export type ProductPageProps = {
  product: Product;
  headline?: string;
  assets: ProductPageAssets;
};
