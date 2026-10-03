import Image from "next/image";
import styles from "./ProductTileArt.module.css";

/**
 * The made drink, on the homepage design file's paper.
 *
 * Four layers in one frame: a warm radial paper, the ground the drink stands
 * on, the drink itself, and its name over the lower left. The catalogue shelf
 * used to share it; the redesign puts the pouch on the shelf instead — see the
 * note in `CatalogPage.tsx` — so the flavour picker is its one caller, where it
 * shows what the thing being ordered becomes.
 */
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
