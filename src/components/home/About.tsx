import Link from "next/link";
import { BrandFilm } from "@/components/home/BrandFilm";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./About.module.css";

/**
 * Short company introduction — the editorial close before the footer, not a
 * second About page. It links out to /about-us rather than restating it.
 *
 * The film runs edge to edge and full height, and its lower third dissolves
 * into the section background rather than ending on a line, so the eye moves
 * from the footage into the proof points without a cut. The label and the
 * headline figure sit over the footage; everything below it is on paper.
 *
 * What plays is the brand film, which already shipped in `public/video` and
 * until this section existed was rendered by nothing.
 */

const FACTS = [
  { value: "60", label: "Markets" },
  { value: "Dubai", label: "Own facility" },
  { value: "HALAL", label: "Certified" },
  { value: "HACCP", label: "Audited" },
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
      <div className={styles.stage}>
        <BrandFilm className={styles.film} />

        {/* Paints the footage out into the page. Sits above the film and below
            everything written on it. */}
        <span className={styles.dissolve} aria-hidden="true" />

        <span className={styles.eyebrow}>
          <span className={styles.mark} aria-hidden="true">
            ✱
          </span>
          <span className="tbb-label">About</span>
        </span>

        <p className={styles.headlineFigure}>
          <span className={styles.figureValue}>600+</span>
          <span className="tbb-label">Flavours in the range</span>
        </p>
      </div>

      <div className={styles.inner}>
        <Reveal className={styles.facts}>
          {FACTS.map((fact) => (
            <span key={fact.label} className={styles.fact}>
              <span className={styles.factValue}>{fact.value}</span>
              <span className="tbb-label">{fact.label}</span>
            </span>
          ))}
        </Reveal>

        <div className={styles.body}>
          <Reveal className={styles.headline} delay={60}>
            <h2 id="about-title" className={styles.title}>
              A manufacturer,
              <br />
              not a reseller
            </h2>

            <div className={styles.columns}>
              <p className={styles.para}>
                THE BASE develops and produces dry beverage bases in Dubai. Over
                600 flavours, HALAL certified and HACCP audited, supplied to
                cafés, restaurants, franchises and distributors.
              </p>
              <p className={styles.para}>
                Because the formulation and the plant are ours, a private-label
                run or a custom R&amp;D brief starts as a conversation rather
                than a sourcing exercise.
              </p>
            </div>
          </Reveal>

          <Reveal className={styles.aside} delay={150}>
            <p className={styles.asideName}>THE BASE</p>
            <p className={styles.asideRole}>Beverage production · Dubai, UAE</p>
            <p className={styles.asidePrompt}>
              Ready to put your own name on the pouch?
            </p>
            <Link href="/about-us" className={styles.cta}>
              More about the company
              <Arrow />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
