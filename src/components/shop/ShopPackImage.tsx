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
  const className = product.slug === "electrolyte" ? styles.fullPhoto : styles.image;
  return <ProductPackshot slug={product.slug} className={className} alt={alt} sizes={sizes} eager={eager} />;
}
