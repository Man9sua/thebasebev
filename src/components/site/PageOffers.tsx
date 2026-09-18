import { Reveal } from "@/components/motion/Reveal";
import type { PageOffer } from "@/data/page-intros";
import { resizedImage } from "@/lib/images";
import styles from "./PageOffers.module.css";

/**
 * A row of what a page sells.
 *
 * The block this replaces was four rounded grey panels, each holding a rounded
 * photograph with a gap between the two, and the titles ran anywhere from one
 * line to three — so the price sat at a different height on every card and the
 * row read as four separate things rather than one range.
 *
 * Same composition as the catalogue, for the same reason: the photograph is the
 * card, the type stands on the page, and the rows line up because the title is
 * the only part allowed to stretch. Everything below it — the entry price, the
 * description — starts on one line across all four.
 */
export function PageOffers({ offers }: { offers: PageOffer[] }) {
  return (
    <section className={styles.section} aria-label="Services">
      <ul className={styles.grid}>
        {offers.map((offer, index) => (
          <Reveal as="li" key={offer.title} className={styles.offer} delay={index * 80}>
            <div className={styles.media}>
              {/* The delivery-sized copy where the build made one — these are
                  the export's own plates, and one of the four is 122 KB. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.image}
                src={resizedImage(offer.image) ?? offer.image}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
            <h2 className={styles.title}>{offer.title}</h2>
            <p className={styles.from}>{offer.from}</p>
            <p className={styles.body}>{offer.description}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
