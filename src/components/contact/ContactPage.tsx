import { SiteLink } from "@/components/site/SiteLink";
import { COMPANY } from "@/lib/site-config";
import styles from "./ContactPage.module.css";

/**
 * Contact us, rebuilt to the redesign document.
 *
 * Two screens became one. The page used to open on a hero that carried the
 * heading, a strapline, an outlined watermark reading CONTACT and a "Start a
 * conversation ↓" arrow — a full screen whose only function was to point at the
 * screen below it. Someone who lands here wants the phone number and the form,
 * so the phone number and the form are what the first screen holds.
 *
 * What went, and why it is worth knowing here:
 *
 * - **The watermark, the eyebrow and the arrow.** Decoration standing between
 *   the visitor and the two things the page exists for.
 * - **"dry beverage premixes for HoReCa, retail, distributors and private-label
 *   partners"** — the sentence repeated the four department mailboxes directly
 *   under it. The lede now says the one thing the mailboxes do not: a person
 *   answers.
 * - **"Send inquiry" in paper** became the red submit every other form on the
 *   site now carries.
 *
 * The four department mailboxes are kept — routing an enquiry before it is sent
 * is the right instinct — and each is a card in full rather than a line with a
 * link in it. The form gains the same treatment as a chip group, so a lead that
 * arrives through the form is routed too.
 *
 * Two things the document itself flags and the owner still has to settle: the
 * phone here is +971 4 280 0375 while the footer publishes +971 50 989 0429,
 * and one of them should be the site's main number; and the mobile mock drops
 * Company and Country, which this build keeps, because a form that collects
 * different fields depending on the device sends the sales team two different
 * kinds of lead.
 */

/**
 * The department mailboxes. `short` is the label the card falls back to on a
 * phone, where four cards become a 2 × 2 grid of tiles — the full label and the
 * address do not fit, and the accessible name on the link carries both anyway.
 */
const CHANNELS = [
  {
    label: "General enquiries",
    short: "General",
    value: COMPANY.email,
    href: COMPANY.emailHref,
  },
  {
    label: "New wholesale accounts",
    short: "Wholesale",
    value: "sales@thebasebev.com",
    href: "mailto:sales@thebasebev.com",
  },
  {
    label: "Retail and HoReCa orders",
    short: "Orders",
    value: "retail@thebasebev.com",
    href: "mailto:retail@thebasebev.com",
  },
  {
    label: "Existing orders and logistics",
    short: "Logistics",
    value: "supply@thebasebev.com",
    href: "mailto:supply@thebasebev.com",
  },
] as const;

/**
 * The interest chips, in the order the document draws them. Wholesale leads the
 * row because it is the enquiry this page receives most.
 */
const INTERESTS = [
  "Wholesale",
  "Distribution",
  "R&D",
  "Private label",
  "Existing order",
] as const;

const DEFAULT_INTEREST = "Wholesale";

export function ContactPage() {
  return (
    <main className={styles.page} data-surface="dark">
      <div className={styles.inner}>
        <div className={styles.copy}>
          {/*
            "Contact Us" rather than the document's "Contact us": production's
            h1 is the former, `audit:seo-parity` compares the two character for
            character, and the heading is set in caps either way.
          */}
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
            <a className={styles.phone} href="tel:+97142800375">
              +971 4 280 0375
            </a>
            <span className={styles.hours}>Monday to Saturday, 09:00–18:00 GST (UTC+4)</span>
          </div>

          <div className={styles.channels}>
            {CHANNELS.map((channel) => (
              <a
                key={channel.value}
                className={styles.channel}
                href={channel.href}
                aria-label={`${channel.label}: ${channel.value}`}
              >
                <span className={styles.channelLabel}>{channel.label}</span>
                <span className={styles.channelShort}>{channel.short}</span>
                <span className={styles.channelValue}>{channel.value}</span>
              </a>
            ))}
          </div>
        </div>

        {/*
          Same id and same `tildaspec-formname` as before, so a lead from here
          still reaches the sales team under the name `LEGACY_FORM_NAMES` routes
          it by, and the field names are the ones `lib/lead-forms.ts` maps.
        */}
        <form
          id="form860957415"
          className={`t-form js-form-proccess ${styles.card}`}
          data-success-url="/thank-you-form"
        >
          <input type="hidden" name="tildaspec-formname" value="Contact Us" />

          <h2 className={styles.cardTitle}>What can we make together?</h2>

          <div className={`t-form__inputsbox ${styles.inputs}`}>
            {/*
              The interest rides `product` — the field the lead pipeline already
              carries for "what is this enquiry about", validated in
              `lib/leads.ts` and mapped in `lib/lead-forms.ts`. Same arrangement
              as the Distributors tier chips, so neither call site invents a
              field of its own.
            */}
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
            Thank you. Your enquiry has been sent to THE BASE team.
          </div>
        </form>
      </div>
    </main>
  );
}
