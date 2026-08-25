import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./About.module.css";

/**
 * Short company introduction — the editorial close before the footer, not a
 * second About page. It links out to /about-us rather than restating it.
 *
 * No photography here on purpose. The two plates that used to sit on the right
 * were stock-looking crops that fought the pack shots above them; the section
 * carries more weight as type alone, with the three numbers doing the work the
 * images were meant to.
 */

const FACTS = [
  { value: "600+", label: "Flavours" },
  { value: "60", label: "Markets" },
  { value: "Dubai", label: "Own facility" },
] as const;

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function About() {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-title">
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <span className={styles.eyebrow}>
            <span className={styles.mark} aria-hidden="true">
              ✱
            </span>
            <span className="tbb-label">About</span>
          </span>

          <h2 id="about-title" className={styles.title}>
            A manufacturer,
            <br />
            not a reseller
          </h2>
        </Reveal>

        <Reveal className={styles.body} delay={90}>
          <p className={styles.para}>
            THE BASE develops and produces dry beverage bases in Dubai. Over 600
            flavours, HALAL certified and HACCP audited, supplied to cafés,
            restaurants, franchises and distributors.
          </p>
          <p className={styles.para}>
            Because the formulation and the plant are ours, a private-label run
            or a custom R&amp;D brief starts as a conversation rather than a
            sourcing exercise.
          </p>
        </Reveal>

        <Reveal className={styles.facts} delay={150}>
          {FACTS.map((fact) => (
            <span key={fact.label} className={styles.fact}>
              <span className={styles.factValue}>{fact.value}</span>
              <span className="tbb-label">{fact.label}</span>
            </span>
          ))}
        </Reveal>

        <Reveal className={styles.action} delay={210}>
          <Link href="/about-us" className={styles.cta}>
            More about the company
            <Arrow />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
