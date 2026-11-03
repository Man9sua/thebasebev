import Image from "next/image";
import { AtHomePackImage } from "@/components/product/AtHomePackImage";
import type { ShopProduct } from "@/data/shop";

export function ShopPackImage({
  product,
  sizes,
  eager = false,
  alt = "",
}: {
  product: Pick<ShopProduct, "slug" | "image">;
  sizes: string;
  eager?: boolean;
  alt?: string;
}) {
  if (product.slug === "at-home") return <AtHomePackImage src={product.image ?? undefined} alt={alt} />;
  return product.image ? <Image src={product.image} alt={alt} fill sizes={sizes} loading={eager ? "eager" : "lazy"} /> : null;
}
