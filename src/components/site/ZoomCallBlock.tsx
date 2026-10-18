import Image from "next/image";
import styles from "./ZoomCallBlock.module.css";

/** The presentation booking page every "Book a Zoom call" button opens. */
export const ZOOM_BOOKING_URL = "https://calendly.com/thebasebev/the-base-presentation";

/**
 * "Product overview & partnership call" — the native replacement for the
 * exported `rec2503542591` block that closes the retained Tilda pages. Same
 * copy, same booking link and the same meeting-room photograph, set to the
 * house type and spacing instead of the export's card.
 */
export function ZoomCallBlock({ headingLevel = "h2" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <section className={styles.section} aria-labelledby="zoom-call-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <Heading id="zoom-call-title" className={styles.title}>
            Product overview &amp; partnership call
          </Heading>
          <p className={styles.lead}>
            Join a short Zoom call to explore our products, understand key benefits, and discuss
            partnership opportunities worldwide. We&rsquo;ll walk you through everything and
            answer your questions in real time.
          </p>
          <div className={styles.actions}>
            <a
              className={styles.button}
              href={ZOOM_BOOKING_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              Book a Zoom call
            </a>
          </div>
        </div>
        <div className={styles.media}>
          <Image
            src="/images/w/tild3665-6262-4465-b138-356434326663__rectangle_1087.webp"
            alt="The Base Beverage meeting room in Dubai where partnership and product overview calls are held"
            width={1400}
            height={911}
            sizes="(max-width: 899px) 100vw, 45vw"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
