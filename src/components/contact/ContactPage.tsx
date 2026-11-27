import { CopyButton } from "@/components/site/CopyButton";
import { SiteLink } from "@/components/site/SiteLink";
import { COMPANY } from "@/lib/site-config";
import styles from "./ContactPage.module.css";

const CHANNELS = [
  {
    label: "General enquiries",
    value: COMPANY.email,
    href: COMPANY.emailHref,
  },
  {
    label: "New wholesale accounts",
    value: "sales@thebasebev.com",
    href: "mailto:sales@thebasebev.com",
  },
  {
    label: "Retail and HoReCa orders",
    value: "retail@thebasebev.com",
    href: "mailto:retail@thebasebev.com",
  },
  {
    label: "Existing orders and logistics",
    value: "supply@thebasebev.com",
    href: "mailto:supply@thebasebev.com",
  },
] as const;

const INTERESTS = [
  "Wholesale",
  "Distribution",
  "R&D",
  "Private label",
  "Existing order",
] as const;

const DEFAULT_INTEREST = "Wholesale";

const FACTS = [
  {
    title: "Showroom in Al Quoz",
    text: "Our showroom is in Al Quoz Industrial Area 2, Dubai. Come in to taste the bases, see the full range of packs and work through a drinks menu with our team. Open Monday to Saturday, 9:00 to 18:00 Dubai time, closed on Sunday.",
  },
  {
    title: "Orders and free samples",
    text: "Write to sales@thebasebev.com with the products, your market and the volume you expect. Free samples are available for cafés, chains and distributors, there is no minimum order, and production lead time starts from 15 days.",
  },
  {
    title: "Certified production",
    text: "Every base is made in our own factory in the UAE under a HACCP food safety system and ISO 22000 certification, and the range is Halal certified. Certificates and product specifications are sent on request for your order and destination market.",
  },
  {
    title: "Where we supply",
    text: "The Base supplies HoReCa, retail and distributors in 26 countries through more than 5,000 points of sale: over 600 flavours across 24 product lines, with menu development, private label and barista masterclasses for groups of 20 or more.",
  },
] as const;

export function ContactPage() {
  return (
    <main className={styles.page} data-surface="dark">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 className={styles.title}>
            Contact
            <br />
            Us
          </h1>
          <p className={styles.lede}>
            Tell us the product, market and volume. Every enquiry goes to a commercial or
            production specialist, not an autoresponder.
          </p>

          <div className={styles.phoneBlock}>
            <div className={styles.phoneRow}>
              <a className={styles.phone} href="tel:+97142800375">
                +971 4 280 0375
              </a>
              <CopyButton className={styles.copyButton} value="+971 4 280 0375" label="Copy phone number" />
            </div>
            <span className={styles.hours}>Monday to Saturday, 09:00–18:00 GST (UTC+4)</span>
          </div>

          <div className={styles.channels}>
            {CHANNELS.map((channel) => (
              <div key={channel.value} className={styles.channel}>
                <a className={styles.channelLink} href={channel.href} aria-label={`${channel.label}: ${channel.value}`}>
                  <span className={styles.channelLabel}>{channel.label}</span>
                  <span className={styles.channelValue}>{channel.value}</span>
                </a>
                <CopyButton className={styles.copyButton} value={channel.value} label={`Copy ${channel.value}`} />
              </div>
            ))}
          </div>
        </div>

        <form
          id="form860957415"
          className={`t-form js-form-proccess ${styles.card}`}
          data-success-url="/thank-you-form"
        >
          <input type="hidden" name="tildaspec-formname" value="Contact Us" />

          <h2 className={styles.cardTitle}>What can we make together?</h2>

          <div className={`t-form__inputsbox ${styles.inputs}`}>
            <fieldset className={styles.chips}>
              <legend>I am interested in</legend>
              <div className={styles.chipRow}>
                {INTERESTS.map((interest) => (
                  <label key={interest} className={styles.chip}>
                    <input
                      type="radio"
                      name="product"
                      value={interest}
                      defaultChecked={interest === DEFAULT_INTEREST}
                    />
                    <span>{interest}</span>
                  </label>
                ))}
              </div>
            </fieldset>

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
                <span>Phone / WhatsApp</span>
                <input name="Phone" type="tel" autoComplete="tel" placeholder="+971" required />
              </label>
            </div>

            <label className={styles.field}>
              <span>Country</span>
              <input name="country" type="text" autoComplete="country-name" required />
            </label>

            <label className={styles.field}>
              <span>Your request</span>
              <textarea
                name="text"
                rows={4}
                required
                placeholder="Product, monthly volume, market and timing."
              />
            </label>

            <label className={styles.consent}>
              <input name="privacy-consent" type="checkbox" required />
              <span>
                I agree to the <SiteLink href="/privacy">Privacy Policy</SiteLink>.
              </span>
            </label>

            <div
              className={`js-errorbox-all t-form__errorbox-wrapper ${styles.error}`}
              style={{ display: "none" }}
            >
              <span className="js-rule-error js-rule-error-all" />
            </div>

            <button type="submit" className={styles.submit}>
              Send enquiry
            </button>
          </div>

          <div
            className={`js-successbox t-form__successbox ${styles.success}`}
            style={{ display: "none" }}
          >
            Thank you. Your enquiry has been sent to the Base team.
          </div>
        </form>
      </div>

      <section className={styles.facts} aria-labelledby="contact-facts-title">
        <h2 id="contact-facts-title" className={styles.factsTitle}>
          Visit the showroom or write to sales
        </h2>
        <div className={styles.factsGrid}>
          {FACTS.map((fact) => (
            <article key={fact.title} className={styles.fact}>
              <h3>{fact.title}</h3>
              <p>{fact.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
