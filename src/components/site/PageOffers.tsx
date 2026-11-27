import { Reveal } from "@/components/motion/Reveal";
import type { PageOffer } from "@/data/page-intros";
import { resizedImage } from "@/lib/images";
import styles from "./PageOffers.module.css";

export function PageOffers({ offers }: { offers: PageOffer[] }) {
  return (
    <section className={styles.section} aria-label="Services">
      <ul className={styles.grid}>
        {offers.map((offer, index) => (
          <Reveal as="li" key={offer.title} className={styles.offer} delay={index * 80}>
            <div className={styles.media}>
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
