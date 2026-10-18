import { SiteLink } from "@/components/site/SiteLink";
import styles from "./AboutLocation.module.css";

/**
 * The lab and showroom: Warehouse 50, 26th Street, Al Quoz Industrial Area 2
 * (the address in the Organization JSON-LD). `directionsHref` is the Google
 * Maps share link for the "The Base Beverage LLC" listing; the embed is the
 * key-less `output=embed` view pinned on the coordinates that link resolves
 * to (25.1244211, 55.2445616), so it needs no API key. `hl=en` holds the map
 * in English whatever the visitor's browser language; the `pb=` embed ignored
 * its own language field and followed the browser instead.
 */
const LAB_LOCATION = {
  label: "Lab and showroom",
  city: "Dubai, UAE",
  directionsHref: "https://maps.app.goo.gl/Yyp9hxTtiFChTNt3A",
  visitHref: "/contacts",
  embedSrc:
    "https://www.google.com/maps?q=25.1244211,55.2445616&z=12&hl=en&output=embed",
} as const;

/**
 * About Us, block 3: the lab and showroom on a map.
 *
 * The map is Google's key-less embed in greyscale, so its own chrome — "Open in
 * Maps", the layer thumbnail, the camera control — is part of the design. The
 * "Dubai, UAE" chip is ours and lets clicks through to the map underneath.
 *
 * On desktop the copy is a column beside the map, vertically centred on it; on
 * mobile it stacks heading, text, map, then full-width buttons. One DOM order
 * serves both through grid areas.
 */

function ArrowUpRight() {
  return (
    <svg
      className={styles.arrow}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AboutLocation() {
  return (
    <section className={styles.section} aria-labelledby="about-location-title">
      <div className={styles.grid}>
        <h2 id="about-location-title" className={styles.title}>
          <span className={styles.line}>Where innovation</span>{" "}
          <span className={styles.line}>meets accuracy</span>
        </h2>

        <p className={styles.lead}>
          Our lab works to global safety and quality standards, with attention
          to every detail of the recipe.
        </p>

        <p className={styles.place}>
          <span className={styles.placeLabel}>{LAB_LOCATION.label}</span>
          <span className={styles.placeCity}>{LAB_LOCATION.city}</span>
        </p>

        <div className={styles.map}>
          <iframe
            className={styles.frame}
            src={LAB_LOCATION.embedSrc}
            title={`Map: the Base lab and showroom, ${LAB_LOCATION.city}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <span className={styles.chip} aria-hidden="true">
            <span className={styles.dot} />
            {LAB_LOCATION.city}
          </span>
        </div>

        <div className={styles.actions}>
          <a
            className={`${styles.button} ${styles.primary}`}
            href={LAB_LOCATION.directionsHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get directions
            <ArrowUpRight />
            <span className="tbb-visually-hidden"> (opens Google Maps)</span>
          </a>
          <SiteLink className={`${styles.button} ${styles.secondary}`} href={LAB_LOCATION.visitHref}>
            Book a visit
          </SiteLink>
        </div>
      </div>
    </section>
  );
}
