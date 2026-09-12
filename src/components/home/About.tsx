import styles from "./About.module.css";

/**
 * Who THE BASE is: the team, and the company in one sentence.
 *
 * Two notes on what the design file asks for and this does not do:
 *
 *   - It draws four carousel dots under the sentence with the second one live,
 *     and supplies one photograph. Dots that cannot be moved are a control that
 *     lies about what it does, so they are left out until there are slides.
 *   - This section used to carry the brand film. The design replaces it with
 *     the team photograph, so the film is no longer on the homepage — the video
 *     is still in `public/video` and `BrandFilm` is in the history if it should
 *     come back as one of those slides.
 */
export function About() {
  return (
    <section className={styles.section} aria-labelledby="who-we-are">
      <div className={styles.inner}>
        <div className={styles.head}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.rule} src="/images/icons/section-rule.svg" alt="" />
          <h2 className={styles.title} id="who-we-are">
            WHO WE ARE?
          </h2>
        </div>

        <figure className={styles.frame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.photo}
            src="/images/home-team.webp"
            alt="THE BASE production and laboratory team at the Dubai facility"
            loading="lazy"
          />
          <figcaption className={styles.foot}>
            <p className={styles.copy}>
              At THE BASE, we manufacture premix powders that simplify drink
              preparation across HoReCa. We create products that reduce business
              operating cost. No need for extra ingredients.
            </p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
