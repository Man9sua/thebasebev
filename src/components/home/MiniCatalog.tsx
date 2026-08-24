import Link from "next/link";
import { CATALOG_SLUGS, getProducts } from "@/data/products";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./MiniCatalog.module.css";

/**
 * Four products, presented as editorial rather than as a webshop grid: no card
 * borders, no rating rows, no add-to-cart. The image carries the card and the
 * type sits beneath it.
 *
 * Every card links to that product's existing page, so this adds internal links
 * to pages that already rank instead of routing into a new surface.
 */

const PRODUCTS = getProducts(CATALOG_SLUGS);

export function MiniCatalog() {
  return (
    <section className={styles.section} aria-labelledby="catalog-title">
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <div>
            <span className="tbb-label">Selected range</span>
            <h2 id="catalog-title" className={styles.title}>
              Four to start with
            </h2>
          </div>
          <Link href="/catalog" className={styles.all}>
            All 16 products
          </Link>
        </Reveal>

        <div className={styles.grid}>
          {PRODUCTS.map((product, index) => (
            <Reveal key={product.slug} delay={index * 110} distance={24}>
              <Link
                href={product.route}
                className={styles.card}
                style={{ ["--card-bg" as string]: product.backgroundColor }}
              >
                <span className={styles.frame}>
                  {product.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={styles.shot}
                      src={product.image}
                      alt={`${product.name} base by THE BASE`}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <span className={styles.action}>View product</span>
                </span>

                <span className={styles.meta}>
                  <span className={styles.name}>{product.name}</span>
                  {product.price ? (
                    <span className={styles.price}>{product.price}</span>
                  ) : (
                    <span className={styles.enquire}>On request</span>
                  )}
                </span>
                <span className={styles.note}>{product.description}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
