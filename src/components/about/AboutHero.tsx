import styles from "./AboutHero.module.css";

/**
 * About Us, block 1: first screen and advantages.
 *
 * Carries the page `h1`. The showroom photo is the wall with the logo, cropped
 * to the top on desktop and slightly left of centre on mobile, as designed.
 * A plain <img> with a hand-made srcset: `next/image` is unoptimized on this
 * site, so it would ship a single full-size file.
 */

const FEATURES = [
  {
    title: "Own lab and factory",
    text: "Recipes, testing and production under one roof.",
  },
  {
    title: "Your volumes, your timing",
    text: "Order size and delivery schedule agreed with each client.",
  },
  {
    title: "Launch in 14 days",
    text: "From approved sample to first production run.",
  },
  {
    title: "HACCP and Halal",
    text: "Certified production for every product line.",
  },
] as const;

export function AboutHero() {
  return (
    <section className={styles.hero} aria-labelledby="about-title">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <h1 id="about-title" className={styles.title}>
            Ingredients{" "}
            <br />
            for HoReCa
          </h1>
          <p className={styles.lead}>
            Beverage bases, purées, chocolate and caramel sauces for cafés,
            restaurants and hotels. Developed in our own lab in Dubai and made
            at our own factory in UAE.
          </p>
        </div>

        <div className={styles.media}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.photo}
            src="/images/about/showroom-1312.webp"
            srcSet="/images/about/showroom-750.webp 750w, /images/about/showroom-1312.webp 1312w, /images/about/showroom-1920.webp 1920w, /images/about/showroom-2624.webp 2624w"
            sizes="(max-width: 1023px) calc(100vw - 24px), min(1312px, calc(100vw - 8.888vw))"
            width={1312}
            height={984}
            alt="The Base showroom in Dubai"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        <ul className={styles.features}>
          {FEATURES.map((feature) => (
            <li key={feature.title} className={styles.feature}>
              <span className={styles.featureTitle}>{feature.title}</span>
              <span className={styles.featureText}>{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
