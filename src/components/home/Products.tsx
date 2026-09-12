import { getProduct } from "@/data/products";
import { ProductTileArt } from "@/components/product/ProductTileArt";
import { SiteLink } from "@/components/site/SiteLink";
import styles from "./Products.module.css";

/**
 * The whole range as sixteen cards.
 *
 * The order and the names are the design's grid, read row by row, not the
 * catalogue's four ranges — the homepage shows the range flat and the shop is
 * where it is sorted. Four of the names differ from the registry's: the design
 * prints "Raf" for Raf Coffee and spells Sugar Syrup out where the shelf
 * shortens it to "Syrup".
 *
 * The design gives the two buttons no destination. "Request a sample" goes to
 * the contact form, which is where every sample ask on this site lands, and
 * "Request pricing" goes to the distributor page, which is the one that answers
 * a wholesale price. Both are existing routes — neither is a new page.
 */
const GRID: readonly { slug: string; label: string }[] = [
  { slug: "milkshake", label: "Milkshake" },
  { slug: "matcha", label: "Matcha" },
  { slug: "iced-tea", label: "Iced Tea" },
  { slug: "jam", label: "Jam" },
  { slug: "chai-latte", label: "Chai Latte" },
  { slug: "sugar-syrup", label: "Sugar Syrup" },
  { slug: "raf-coffee", label: "Raf" },
  { slug: "cordial", label: "Cordial" },
  { slug: "frappe", label: "Frappe" },
  { slug: "vending", label: "Vending" },
  { slug: "chocolate", label: "Chocolate" },
  { slug: "cream-latte", label: "Cream Latte" },
  { slug: "topping", label: "Topping" },
  { slug: "garnish", label: "Garnish" },
  { slug: "tea", label: "Tea" },
  { slug: "sugar-free", label: "Sugar Free" },
];

/** The design's grid is four wide, so the first row is what loads eagerly. */
const EAGER_ROW = 4;

export function Products() {
  return (
    <section className={styles.section} aria-labelledby="our-product">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.headRow}>
            {/*
             * The design's heading is singular over a grid of sixteen. Made
             * plural at the owner's instruction, the same correction as the
             * assurances' "14 day". The id stays as it is: it anchors the
             * section for the browser smoke and is not read by anyone.
             */}
            <h2 className={styles.title} id="our-product">
              OUR PRODUCTS
            </h2>

            {/* Held together so the pair stays a pair once the heading takes
                the whole line to itself. */}
            <div className={styles.actions}>
              <SiteLink href="/contacts" className="tbb-pill tbb-pill-ink">
                Request a sample
              </SiteLink>
              <SiteLink href="/distributors" className="tbb-pill tbb-pill-outline">
                Request pricing
              </SiteLink>
            </div>
          </div>
        </div>

        <ul className={styles.grid}>
          {GRID.map(({ slug, label }, index) => {
            const product = getProduct(slug);
            if (!product) throw new Error(`Missing homepage product: ${slug}`);

            return (
              <li key={slug}>
                <SiteLink className={styles.cardLink} href={product.route}>
                  <ProductTileArt
                    slug={slug}
                    name={label}
                    sizes="(max-width: 639px) 46vw, (max-width: 1023px) 31vw, 279px"
                    priority={index < EAGER_ROW}
                  />
                </SiteLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
