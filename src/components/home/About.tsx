import { BrandFilm } from "@/components/home/BrandFilm";
import { Reveal } from "@/components/motion/Reveal";
import { CertificationMarks } from "@/components/quality/CertificationMarks";
import { SiteLink } from "@/components/site/SiteLink";
import { PRODUCTS } from "@/data/products";
import styles from "./About.module.css";

const FACTS = [
  { value: String(PRODUCTS.length), label: "product categories" },
  { value: "26", label: "markets" },
] as const;

export function About() {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-title">
      <div className={styles.stage}>
        <BrandFilm className={styles.film} />
        <span className={styles.dissolve} aria-hidden="true" />
      </div>

      <div className={styles.inner}>
        <Reveal>
          <h2 id="about-title" className={styles.title}>
            A manufacturer,
            <br />
            not a reseller
          </h2>
        </Reveal>

        <div className={styles.body}>
          <Reveal className={styles.copy} delay={60}>
            <p className={styles.para} data-manufacturer-copy>
              {PRODUCTS.length} categories, from bases and purées to sauces, for every drink on your
              menu, from one partner. Our R&amp;D team and plant in Dubai turn your idea
              into a finished product, under our name or yours, with the same taste in
              every outlet.
            </p>
          </Reveal>

          <Reveal className={styles.factsBlock} delay={120}>
            <div className={styles.facts} data-manufacturer-facts>
              {FACTS.map((fact) => (
                <span key={fact.label} className={styles.fact}>
                  <span className={styles.factValue}>{fact.value}</span>
                  <span className={styles.factLabel}>{fact.label}</span>
                </span>
              ))}
            </div>
            <CertificationMarks />
          </Reveal>

          <Reveal className={styles.ctaBlock} delay={180}>
            <SiteLink href="/about-us" className={styles.cta}>
              More about the company
            </SiteLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
