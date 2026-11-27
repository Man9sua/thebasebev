import { getProductPackshot } from "@/data/product-packshots";

export function ProductPackshot({ slug, sizes, alt, className, eager = false }: {
  slug: string;
  sizes: string;
  alt?: string;
  className?: string;
  eager?: boolean;
}) {
  const pack = getProductPackshot(slug);
  if (!pack) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- local responsive packshots are pre-sized for the static Worker
    <img
      src={pack.src}
      srcSet={pack.srcSet}
      sizes={sizes}
      alt={alt ?? pack.alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      draggable={false}
    />
  );
}
