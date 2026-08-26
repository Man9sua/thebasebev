import { Reveal } from "@/components/motion/Reveal";
import type { PageIntro as PageIntroContent } from "@/data/page-intros";
import styles from "./PageIntro.module.css";

/**
 * The top of a parity page that lost its own.
 *
 * Two pages open with a React head now, because what the export opened them
 * with was template debris: `/rnd` began with nothing of its own and carried
 * its `h1` a page and a half down, inside a Russian calorie calculator that
 * came with the Tilda theme, and `/private-labeling` set its heading in a serif
 * no other page on the site uses and then put it at the bottom under an empty
 * block.
 *
 * So this is a page head and nothing more — label, heading, statement, lead —
 * on the site's own type and spacing. Where the page had a film of its own it
 * runs behind, muted and looping, which is how it was used before.
 */
export function PageIntro({ intro }: { intro: PageIntroContent }) {
  return (
    <section
      className={`${styles.intro} ${intro.video || intro.tone === "dark" ? styles.dark : ""}`}
    >
      {intro.video && (
        <div className={styles.media} aria-hidden="true">
          <video
            className={styles.film}
            src={intro.video}
            autoPlay
            muted
            loop
            playsInline
            // Four megabytes. The poster frame is worth the round trip; the
            // rest of the file can arrive while the heading is already read.
            preload="metadata"
          />
        </div>
      )}

      <div className={styles.inner}>
        <Reveal as="p" className={`tbb-label ${styles.eyebrow}`} distance={12}>
          {intro.eyebrow}
        </Reveal>

        <Reveal delay={60} distance={20}>
          <h1 className={styles.title}>{intro.title}</h1>
        </Reveal>

        {intro.tagline && (
          <Reveal as="p" className={styles.tagline} delay={120} distance={16}>
            {intro.tagline}
          </Reveal>
        )}

        <Reveal as="p" className={styles.lead} delay={170} distance={16}>
          {intro.lead}
        </Reveal>
      </div>
    </section>
  );
}
