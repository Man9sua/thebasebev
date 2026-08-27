import Link from "next/link";
import { COMPANY } from "@/lib/site-config";
import styles from "./ContactPage.module.css";

const channels = [
  { label: "General inquiries", value: COMPANY.email, href: COMPANY.emailHref },
  { label: "New wholesale accounts", value: "sales@thebasebev.com", href: "mailto:sales@thebasebev.com" },
  { label: "Retail & HoReCa orders", value: "retail@thebasebev.com", href: "mailto:retail@thebasebev.com" },
  { label: "Existing orders & logistics", value: "supply@thebasebev.com", href: "mailto:supply@thebasebev.com" },
] as const;

export function ContactPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="contact-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Get in touch · Dubai</p>
            <h1 id="contact-title" className={styles.title}>
              Start with the drink you want to build.
            </h1>
          </div>
          <div className={styles.heroAside}>
            <p>
              THE BASE manufactures dry beverage premixes for HoReCa, retail,
              distributors and private-label partners. Tell us the product, market and
              volume — we will route the brief to the right team.
            </p>
            <a href="#contact-form" className={styles.heroCta}>
              Start a conversation <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className={styles.heroWord} aria-hidden="true">
            CONTACT
          </p>
        </div>
      </section>

      <section className={styles.conversation} data-surface="dark">
        <div className={styles.conversationInner}>
          <aside className={styles.details}>
            <p className={styles.darkEyebrow}>Direct channels</p>
            <h2>Dubai production. Global conversations.</h2>
            <p className={styles.detailsIntro}>
              Monday–Saturday, 09:00–18:00 GST (UTC+4). Every enquiry reaches a
              commercial or production specialist — not a generic autoresponder.
            </p>

            <a className={styles.phone} href="tel:+97142800375">
              +971 4 280 0375
            </a>
            <div className={styles.channels}>
              {channels.map((channel) => (
                <a key={channel.value} href={channel.href} className={styles.channel}>
                  <span>{channel.label}</span>
                  <strong>{channel.value}</strong>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </aside>

          <form
            id="form860957415"
            className={`t-form js-form-proccess ${styles.form}`}
            data-success-url="/thank-you-form"
          >
            <input type="hidden" name="tildaspec-formname" value="Contact Us" />

            <div className={`t-form__inputsbox ${styles.inputs}`}>
              <div className={styles.formHead}>
                <p className={styles.darkEyebrow}>Your brief</p>
                <h2>What can we make together?</h2>
              </div>

              <div className={styles.twoColumns}>
                <label className={styles.field}>
                  <span>Full name</span>
                  <input name="name" type="text" autoComplete="name" required />
                </label>
                <label className={styles.field}>
                  <span>Company</span>
                  <input name="company" type="text" autoComplete="organization" />
                </label>
              </div>

              <div className={styles.twoColumns}>
                <label className={styles.field}>
                  <span>Email</span>
                  <input name="email" type="email" autoComplete="email" required />
                </label>
                <label className={styles.field}>
                  <span>Phone</span>
                  <input name="Phone" type="tel" autoComplete="tel" required />
                </label>
              </div>

              <label className={styles.field}>
                <span>Market / country</span>
                <input name="country" type="text" autoComplete="country-name" required />
              </label>

              <label className={styles.field}>
                <span>Product, volume or partnership request</span>
                <textarea
                  name="text"
                  rows={6}
                  required
                  placeholder="Product category, expected monthly volume, target market and timing."
                />
              </label>

              <label className={styles.consent}>
                <input name="privacy-consent" type="checkbox" required />
                <span>
                  I consent to THE BASE processing this inquiry as described in the{" "}
                  <Link href="/privacy" prefetch={false}>
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              <div
                className={`js-errorbox-all t-form__errorbox-wrapper ${styles.error}`}
                style={{ display: "none" }}
              >
                <span className="js-rule-error js-rule-error-all" />
              </div>

              <button type="submit" className={styles.submit}>
                Send inquiry <span aria-hidden="true">→</span>
              </button>
            </div>

            <div
              className={`js-successbox t-form__successbox ${styles.success}`}
              style={{ display: "none" }}
            >
              Thank you. Your inquiry has been sent to THE BASE team.
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
