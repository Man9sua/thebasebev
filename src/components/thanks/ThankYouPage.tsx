import { SiteLink } from "@/components/site/SiteLink";
import styles from "./ThankYouPage.module.css";

/**
 * `/thank-you-form` — where every lead form on the site lands.
 *
 * It replaces the exported Tilda page, which put a dark card with a fixed
 * height over a stock photograph of an empty meeting room: on a phone the
 * heading, the sentence under it and the button all overlapped inside a box
 * that could not grow, and the photograph was a 1.4 MB illustration of nothing.
 *
 * It stays a small page on purpose. Someone reading it has just finished
 * filling in a form, so it owes them three things and nothing else: that it
 * arrived, what happens next, and somewhere to go.
 *
 * `noindex` is the route's own, from `site-pages.ts`, and stays that way — a
 * confirmation page has no business in search results.
 */

const NEXT_STEPS = [
  {
    step: "01",
    title: "We read the brief",
    body: "Your request goes straight to the team that answers it — sales, R&D or private label.",
  },
  {
    step: "02",
    title: "We reply within one business day",
    body: "By email from info@thebasebev.com, or by WhatsApp if you left a number.",
  },
  {
    step: "03",
    title: "We send the numbers",
    body: "Specifications, lead times and pricing for the volume and market you named.",
  },
];

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m4.5 12.5 5 5 10-11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThankYouPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="thanks-title">
        <span className={styles.badge}>
          <CheckMark />
        </span>

        <span className="tbb-label">Request received</span>

        <h1 id="thanks-title" className={styles.title}>
          Thank you for reaching out.
        </h1>

        <p className={styles.lead}>
          Your request has been submitted. We will come back to you shortly to confirm the
          details.
        </p>

        <div className={styles.actions}>
          <a
            className="tbb-pill tbb-pill-ink"
            href="https://calendly.com/thebasebev/the-base-presentation"
            target="_blank"
            rel="noreferrer noopener"
          >
            Book a Zoom call
          </a>
          <SiteLink href="/catalog" className="tbb-pill tbb-pill-outline">
            Browse the catalogue
          </SiteLink>
        </div>

        <ol className={styles.steps}>
          {NEXT_STEPS.map((item) => (
            <li key={item.step} className={styles.step}>
              <span className={styles.stepNumber}>{item.step}</span>
              <span className={styles.stepTitle}>{item.title}</span>
              <span className={styles.stepBody}>{item.body}</span>
            </li>
          ))}
        </ol>

        <p className={styles.foot}>
          Need it sooner?{" "}
          <a href="mailto:info@thebasebev.com">info@thebasebev.com</a>
          <span aria-hidden="true"> · </span>
          <a href="tel:+971509890429">+971 50 989 0429</a>
        </p>

        <SiteLink href="/" className={styles.home}>
          <span aria-hidden="true">←</span> Return to home
        </SiteLink>
      </section>
    </main>
  );
}
