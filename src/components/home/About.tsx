import { BrandFilm } from "@/components/home/BrandFilm";
import { Reveal } from "@/components/motion/Reveal";
import { SiteLink } from "@/components/site/SiteLink";
import styles from "./About.module.css";

/**
 * The brand film, and the block under it — the redesign's 12a / 12b.
 *
 * The film runs edge to edge and its lower third dissolves into the page, so
 * the eye moves from the footage into the copy without a cut. What follows is
 * one heading at display width, one paragraph, one button, and the four facts
 * in a 2 × 2 grid.
 *
 * What the document takes out, and why:
 *
 * - **The second telling of the same four facts.** "60 markets · Dubai · HALAL
 *   · HACCP" ran as a strip under the film and "600+" over it; the grid below
 *   said it again. This block is now the one place on the homepage those
 *   figures appear — the site review's note is that they were made four times.
 * - **The two columns of body copy.** Dubai and the kind of customer are
 *   already in the first screen, so the second paragraph repeated it.
 * - **"Ready to put your own name on the pouch?"** — a call to action with no
 *   button under it, beside a link that was not the answer to it. The button is
 *   the answer, and it is the only one here now.
 * - **The signature block** (THE BASE / Beverage production · Dubai, UAE) and
 *   the rule above it.
 *
 * The figures are the document's: twenty categories and twenty-six markets.
 * Both are the owner's to confirm — the page said sixty markets until now, and
 * the catalogue carries sixteen product pages.
 */

const FACTS = [
  { value: "20", label: "product categories" },
  { value: "26", label: "markets" },
  { value: "Halal", label: "certified" },
  { value: "HACCP", label: "audited" },
] as const;

export function About() {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-title">
      <div className={styles.stage}>
        <BrandFilm className={styles.film} />

        {/* Paints the footage out into the page. Sits above the film and below
            everything written on it. */}
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
            <p className={styles.para}>
              Twenty categories, from bases and purées to sauces, for every drink on your
              menu, from one partner. Our R&amp;D team and plant in Dubai turn your idea
              into a finished product, under our name or yours, with the same taste in
              every outlet.
            </p>
            <SiteLink href="/about-us" className={styles.cta}>
              More about the company
            </SiteLink>
          </Reveal>

          <Reveal className={styles.facts} delay={120}>
            {FACTS.map((fact) => (
              <span key={fact.label} className={styles.fact}>
                <span className={styles.factValue}>{fact.value}</span>
                <span className={styles.factLabel}>{fact.label}</span>
              </span>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
