import Image from "next/image";
import styles from "./ProductTileArt.module.css";

/**
 * The product card's artwork, shared by the homepage grid and the catalogue
 * shelf so the two cannot drift apart.
 *
 * It draws the card and nothing else: paper, ground, drink, name. Everything
 * that makes a catalogue card a catalogue card — the price, the weight, the
 * add-to-cart — belongs to the caller, which is why this takes a name to print
 * rather than a product.
 *
 * `name` is rendered inside the frame because that is where the design puts it.
 * Pass a node, not a string, when it has to be a link: the catalogue's name is
 * the card's route and carries the hooks the commerce audit reaches for.
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
      <span className={styles.ground} aria-hidden />
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
