import Image from "next/image";
import styles from "./ProductTileArt.module.css";

export function ProductTileArt({
  slug,
  name,
  sizes,
  priority = false,
  className,
}: {
  slug: string;
  name: React.ReactNode;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={className ? `${styles.art} ${className}` : styles.art}>
      <Image
        className={styles.shot}
        src={`/images/shot-${slug}.webp`}
        alt=""
        fill
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        priority={priority}
      />
      <span className={styles.label}>{name}</span>
    </div>
  );
}
