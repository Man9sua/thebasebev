import Link from "next/link";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./About.module.css";

/**
 * Short company introduction — the editorial close before the footer, not a
 * second About page. It links out to /about-us rather than restating it.
 */

const PLATES = [
  {
    src: "/images/tild6537-6331-4232-b365-653366646439__team-desktop.jpg",
    alt: "THE BASE team at the Dubai facility",
    className: styles.plateA,
    speed: 0.07,
  },
  {
    src: "/images/tild3433-6466-4661-b034-656563323035__photo-1627309366653-.jpg",
    alt: "Finished stock in the warehouse ready for dispatch",
    className: styles.plateB,
    speed: 0.13,
  },
];

export function About() {
  return (
    <section className={styles.section} aria-labelledby="about-title">
      <div className={styles.inner}>
        <Reveal className={styles.copy}>
          <span className="tbb-label">About</span>
          <h2 id="about-title" className={styles.title}>
            A manufacturer, not a reseller
          </h2>
          <p className={styles.body}>
            THE BASE develops and produces dry beverage bases in Dubai. Over 600
            flavours, HALAL certified and HACCP audited, supplied to cafés,
            restaurants, franchises and distributors.
          </p>
          <p className={styles.body}>
            Because the formulation and the plant are ours, a private-label run
            or a custom R&amp;D brief starts as a conversation rather than a
            sourcing exercise.
          </p>

          <div className={styles.stats}>
            <span className={styles.stat}>
              <span className={styles.statValue}>600+</span>
              <span className="tbb-label">Flavours</span>
            </span>
            <span className={styles.stat}>
              <span className={styles.statValue}>60</span>
              <span className="tbb-label">Markets</span>
            </span>
            <span className={styles.stat}>
              <span className={styles.statValue}>Dubai</span>
              <span className="tbb-label">Own facility</span>
            </span>
          </div>

          <Link href="/about-us" className={styles.cta} prefetch={false}>
            More about the company
          </Link>
        </Reveal>

        <Reveal className={styles.plates} delay={120}>
          {PLATES.map((plate) => (
            <span key={plate.src} className={`${styles.plate} ${plate.className}`}>
              <Parallax className={styles.layer} speed={plate.speed}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.media}
                  src={plate.src}
                  alt={plate.alt}
                  loading="lazy"
                  decoding="async"
                />
              </Parallax>
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
