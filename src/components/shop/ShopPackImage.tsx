import { ProductPackshot } from "@/components/product/ProductPackshot";
import type { ShopProduct } from "@/data/shop";
import styles from "./ShopPackImage.module.css";

export function ShopPackImage({
  product,
  sizes,
  eager = false,
  alt = "",
}: {
  product: Pick<ShopProduct, "slug">;
  sizes: string;
  eager?: boolean;
  alt?: string;
}) {
  return <ProductPackshot slug={product.slug} className={styles.image} alt={alt} sizes={sizes} eager={eager} />;
}
