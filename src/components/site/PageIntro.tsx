import { Reveal } from "@/components/motion/Reveal";
import type { PageIntro as PageIntroContent } from "@/data/page-intros";
import styles from "./PageIntro.module.css";

export function PageIntro({ intro }: { intro: PageIntroContent }) {
  return (
    <section
      className={`${styles.intro} ${intro.video || intro.tone === "dark" ? styles.dark : ""}`}
      data-hero
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
            preload="metadata"
          />
        </div>
      )}

      <div className={styles.inner}>
        {intro.legacyH1 && <h1 className="tbb-visually-hidden">{intro.legacyH1}</h1>}

        <Reveal delay={60} distance={20}>
          {intro.legacyH1 ? (
            <h2 className={styles.title}>{intro.title}</h2>
          ) : (
            <h1 className={styles.title}>{intro.title}</h1>
          )}
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
