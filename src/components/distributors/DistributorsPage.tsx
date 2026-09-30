import Image from "next/image";
import { PageAnchor } from "@/components/site/PageAnchor";
import { SiteLink } from "@/components/site/SiteLink";
import catalogTiles from "@/data/catalog-tiles.json";
import { CATALOG_PRODUCTS } from "@/data/catalog";
import styles from "./DistributorsPage.module.css";

/**
 * Become a distributor, rebuilt to the redesign document.
 *
 * The page is now React top to bottom. The exported Tilda hero it used to open
 * with — `rec3169672103`, a hand-written `<section class="dsth">` carrying its
 * own stylesheet — is gone: the redesign draws that screen itself, so keeping
 * the record would have meant two heroes arguing about the top of the page.
 * The pack shots it used are the ones this hero uses, so nothing of the
 * picture is lost; only the markup around it.
 *
 * What the document changed, block by block, and why it is worth knowing here:
 *
 * - **The hero** loses the "WHOLESALE PARTNERSHIP" eyebrow and the run-on
 *   "600+ flavours · 16 product lines · …" strip. The three facts it kept are
 *   set as figures instead, and "16 product lines" is dropped because it
 *   contradicts the twenty categories the same page sells.
 * - **Built for distribution** is one block where the source had two. The four
 *   reasons the old page carried and the two from the Figma file's "Why
 *   Distributors Choose THE BASE" are the same argument told twice; they are
 *   six cards now, and the second block is gone.
 * - **The tiers** carry an entry line each — MOQ, volume plan, sales
 *   department — so the ladder says what it costs to stand on each rung.
 * - **The range** presents rather than sells: no price, no cart, each card a
 *   link into the catalogue.
 * - **The form** gains the tier chips. They ride the lead pipeline's `product`
 *   field, which is what the pipeline has for "what is this enquiry about" —
 *   see the note above the group.
 *
 * Several figures in here are the document's and are marked in the report as
 * needing the owner's confirmation: the 40% margin, the 500 kg MOQ, the one
 * business day reply and the twenty categories.
 */

const tiles = catalogTiles as Record<string, { image: string }>;

const REASONS = [
  {
    title: "Up to 40% margin",
    body: "Distributor pricing on a range cafés reorder every week.",
  },
  {
    title: "No cold chain",
    body: "Ships and stores at room temperature. Lower logistics cost and no spoilage on the shelf.",
  },
  {
    title: "18 months shelf life",
    body: "Plan orders around your season, not around expiry dates.",
  },
  {
    title: "Sales and marketing support",
    body: "Digital materials, product training for your team and help with your first clients.",
  },
  {
    title: "Certified",
    body: "HACCP audited and Halal approved, with full export documentation.",
  },
  {
    title: "Easy to use",
    body: "Just add milk and espresso. Any barista gets it right on day one.",
  },
];

const STEPS = [
  {
    title: "Place your first order",
    body: "Get wholesale pricing and pick the product lines that fit your market.",
  },
  {
    title: "Receive sales materials",
    body: "Brochures, recipe cards and staff training: everything your team needs to sell.",
  },
  {
    title: "Start selling",
    body: "Supply cafés, restaurants, hotels and vending operators in your territory.",
  },
  {
    title: "Grow your business",
    body: "Move up the partnership tiers as volume grows and unlock better terms.",
  },
];

const TIERS = [
  {
    eyebrow: "Entry level",
    name: "Starter",
    entryLabel: "Minimum order",
    entryValue: "MOQ 500 kg",
    featured: false,
    cta: "Apply",
    items: ["Wholesale pricing", "Digital brochures", "Sample kit", "Email support"],
  },
  {
    eyebrow: "Most chosen",
    name: "Regional",
    entryLabel: "Minimum order",
    entryValue: "On volume plan",
    featured: true,
    cta: "Apply",
    items: [
      "Volume-based pricing",
      "Full sales toolkit",
      "Staff training included",
      "Flexible order schedule",
    ],
  },
  {
    eyebrow: "Exclusive territory",
    name: "Strategic",
    entryLabel: "Requirement",
    entryValue: "Your own sales department",
    featured: false,
    cta: "Apply for exclusivity",
    items: [
      "Exclusive rights in your region",
      "Best wholesale pricing",
      "Priority production slots",
      "Co-branded marketing",
      "Dedicated manager",
    ],
  },
];

/** The six the document shows, in the order it shows them. */
const STRIP_SLUGS = ["milkshake", "raf-coffee", "iced-tea", "matcha", "cordial", "chocolate"];

/**
 * The tier chips on the form, in the ladder's own order. Regional is the one
 * that starts selected — it is the tier the block above marks "most chosen",
 * so it is also the safest default for someone who has not decided.
 */
const FORM_TIERS = ["Starter", "Regional", "Strategic"];
const DEFAULT_TIER = "Regional";

const FAQ = [
  {
    q: "What is the minimum first order?",
    a: "MOQ is 500 kg, and you can mix it across product lines.",
  },
  {
    q: "Do you offer exclusive territory rights?",
    a: "Yes, on the Strategic tier. It requires your own sales department and gives you exclusive rights in your region.",
  },
  {
    q: "Which documents come with a shipment?",
    a: "Halal and HACCP certificates, certificate of origin, invoice and packing list for every shipment.",
  },
  {
    q: "How long does delivery take?",
    a: "It depends on your market. We confirm production and delivery time together with your wholesale quote.",
  },
  {
    q: "Can we get samples before committing?",
    a: "Yes. Every approved application receives a sample kit before the first order.",
  },
];

export function DistributorsPage() {
  const strip = STRIP_SLUGS.map((slug) => CATALOG_PRODUCTS.find((p) => p.slug === slug)).filter(
    (product) => product !== undefined,
  );

  return (
    <main className={styles.page}>
      {/*
        The truck, full bleed, with the copy on the dark half of the frame —
        the document's second first-screen rather than its first. The three
        figures the other version carried are in the sentence instead, which is
        what that version does with them.
      */}
      <section className={styles.hero} aria-labelledby="dist-title">
        {/*
          A plain `img` rather than `next/image`.

          `images.unoptimized` is on, so `next/image` would serve one file at
          every size anyway — and with `fill` it writes `inset` and `height`
          inline, which beat the stylesheet and made the phone's band
          impossible to size. Two widths in a `srcset` do the job it would
          have done: 1280 for phones, 2400 for desktops, 67 and 128 KB.
        */}
        <span className={styles.heroFrame} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.heroPhoto}
            src="/images/distributors-hero-truck.webp"
            srcSet="/images/distributors-hero-truck.webp 1280w, /images/distributors-hero-truck-2x.webp 2400w"
            sizes="100vw"
            alt=""
            width={2400}
            height={1696}
            fetchPriority="high"
            decoding="async"
          />
        </span>
        <span className={styles.heroVeil} aria-hidden="true" />

        <div className={styles.heroInner}>
          <h1 id="dist-title" className={styles.heroTitle}>
            Become a distributor
          </h1>

          <div className={styles.heroFoot}>
            <p className={styles.heroLede}>
              Twenty categories from our own plant in the UAE, 18 months shelf life, no
              refrigeration. Built to move across 26 markets.
            </p>
            <div className={styles.heroActions}>
              <PageAnchor
                route="/distributors"
                target="distributor-form"
                className={styles.primary}
              >
                Apply for distribution
              </PageAnchor>
              <SiteLink href="/catalog" className={styles.ghost}>
                View catalogue
              </SiteLink>
            </div>
          </div>
        </div>
      </section>

      {/* Heading and calls to action on the left, the six reasons on the right.
          The left column is sticky on desktop, so the offer stays on screen for
          the length of the scroll through the cards. */}
      <section className={styles.reasons} aria-labelledby="dist-reasons">
        <div className={styles.reasonsInner}>
          <div className={styles.reasonsAside}>
            <h2 id="dist-reasons" className={styles.sectionTitle}>
              Built for
              <br />
              distribution
            </h2>
            <div className={styles.reasonsActions}>
              <PageAnchor
                route="/distributors"
                target="distributor-form"
                className={styles.primary}
              >
                Apply for distribution
              </PageAnchor>
              <a
                className={styles.outline}
                href="https://calendly.com/thebasebev/the-base-presentation"
                target="_blank"
                rel="noreferrer noopener"
              >
                Book a call
              </a>
            </div>
          </div>

          <ol className={styles.reasonGrid}>
            {REASONS.map((reason, index) => (
              <li key={reason.title} className={styles.reason}>
                <span className={styles.reasonNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.reasonTitle}>{reason.title}</h3>
                <p className={styles.reasonBody}>{reason.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.steps} aria-labelledby="dist-steps">
        <div className={styles.inner}>
          <h2 id="dist-steps" className={styles.sectionTitle}>
            Four steps
            <br />
            to your first sale
          </h2>

          <ol className={styles.stepGrid}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.tiers} aria-labelledby="dist-tiers">
        <div className={styles.inner}>
          <div className={styles.tiersHead}>
            <h2 id="dist-tiers" className={styles.sectionTitle}>
              Terms that grow
              <br />
              with your volume
            </h2>
            <p className={styles.sectionLede}>
              Start where you are and move up when you are ready. Every tier includes wholesale
              pricing and full documentation.
            </p>
          </div>

          <div className={styles.tierGrid}>
            {TIERS.map((tier) => (
              <article
                key={tier.name}
                className={`${styles.tier} ${tier.featured ? styles.tierFeatured : ""}`}
              >
                <div className={styles.tierHead}>
                  <span className={styles.tierEyebrow}>{tier.eyebrow}</span>
                  <h3 className={styles.tierName}>{tier.name}</h3>
                </div>

                <div className={styles.tierEntry}>
                  <span className={styles.tierEntryLabel}>{tier.entryLabel}</span>
                  <span className={styles.tierEntryValue}>{tier.entryValue}</span>
                </div>

                <ul className={styles.tierItems}>
                  {tier.items.map((item) => (
                    <li key={item}>
                      <span aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>

                <PageAnchor
                  route="/distributors"
                  target="distributor-form"
                  className={tier.featured ? styles.tierCtaFeatured : styles.tierCta}
                >
                  {tier.cta}
                </PageAnchor>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* A window onto the catalogue rather than a second version of it: the
          same artwork and the same 4:5 frame `/catalog` uses, no price, no
          cart, every card a link into the product page. */}
      <section className={styles.range} aria-labelledby="dist-range">
        <div className={styles.inner}>
          <div className={styles.rangeHead}>
            <h2 id="dist-range" className={styles.sectionTitle}>
              The range
              <br />
              you will carry
            </h2>
            <SiteLink href="/catalog" className={styles.rangeLink}>
              See all 20 categories <span aria-hidden="true">→</span>
            </SiteLink>
          </div>

          <div className={styles.rangeGrid}>
            {strip.map((product) => (
              <SiteLink key={product.slug} className={styles.rangeCard} href={product.route}>
                <span className={styles.rangeMedia}>
                  <Image
                    src={tiles[product.slug]?.image ?? `/images/pack-${product.slug}.webp`}
                    alt={`${product.name} beverage base by THE BASE`}
                    fill
                    sizes="(max-width: 47.9375rem) 46vw, (max-width: 63.9375rem) 31vw, 25vw"
                    loading="lazy"
                  />
                </span>
                <span className={styles.rangeCategory}>{product.categoryLabel}</span>
                <span className={styles.rangeName}>{product.name}</span>
              </SiteLink>
            ))}
          </div>

          <SiteLink href="/catalog" className={styles.rangeButton}>
            See all 20 categories
          </SiteLink>
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="dist-faq">
        <div className={styles.faqInner}>
          <div className={styles.faqCopy}>
            <h2 id="dist-faq" className={styles.sectionTitle}>
              Questions
            </h2>
            <p className={styles.sectionLede}>
              Supply terms, minimums, certification and delivery. If your question is not here,
              write to us and we will answer directly.
            </p>
            <a className={styles.faqLink} href="mailto:info@thebasebev.com">
              Write to us <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className={styles.faqList}>
            {FAQ.map((item, index) => (
              <details key={item.q} className={styles.faqItem} open={index === 0}>
                <summary className={styles.faqQuestion}>
                  {item.q}
                  <span className={styles.faqMark} aria-hidden="true" />
                </summary>
                <p className={styles.faqAnswer}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.form} id="distributor-form" aria-labelledby="dist-form-title">
        <div className={styles.formInner}>
          <div className={styles.formCopy}>
            <h2 id="dist-form-title" className={styles.sectionTitle}>
              Tell us
              <br />
              your market
            </h2>
            <p className={styles.sectionLede}>
              Territory, the lines you want to carry and the volume you expect. We come back within
              one business day with wholesale terms, documentation and a sample kit.
            </p>

            <div className={styles.formDirect}>
              <span className={styles.formDirectLabel}>Prefer to talk?</span>
              <a className={styles.formPhone} href="tel:+971509890429">
                +971 50 989 0429
              </a>
              <a
                className={styles.formCall}
                href="https://calendly.com/thebasebev/the-base-presentation"
                target="_blank"
                rel="noreferrer noopener"
              >
                Book a short call <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/*
            The form the page's "Apply for distribution" button has always
            opened: same id and same `tildaspec-formname`, so a lead from here
            reaches the sales team under the name `LEGACY_FORM_NAMES` routes it
            by, and the field names are the ones `lib/lead-forms.ts` maps.
          */}
          <form
            id="form861442702"
            className={`t-form js-form-proccess ${styles.formCard}`}
            data-success-url="/thank-you-form"
          >
            <input type="hidden" name="tildaspec-formname" value="Partner with Us" />

            <div className={`t-form__inputsbox ${styles.inputs}`}>
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
                  <input
                    name="Phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+971"
                    required
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span>Country / territory</span>
                <input name="country" type="text" autoComplete="country-name" required />
              </label>

              {/*
                The tier rides `product`. That is the field the lead pipeline
                already carries for "what is this enquiry about" — validated in
                `lib/leads.ts`, mapped in `lib/lead-forms.ts`, read by
                `LeadAttributionBridge` — so the chips reach Odoo without a new
                field and without a call site inventing one.
              */}
              <fieldset className={styles.chips}>
                <legend>Tier you are interested in</legend>
                <div className={styles.chipRow}>
                  {FORM_TIERS.map((tier) => (
                    <label key={tier} className={styles.chip}>
                      <input
                        type="radio"
                        name="product"
                        value={tier}
                        defaultChecked={tier === DEFAULT_TIER}
                      />
                      <span>{tier}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className={styles.field}>
                <span>Lines and expected volume</span>
                <textarea
                  name="text"
                  rows={4}
                  required
                  placeholder="Which products, the channels you supply and the volume per month."
                />
              </label>

              <label className={styles.consent}>
                <input name="privacy-consent" type="checkbox" required />
                <span>
                  I consent to THE BASE processing this inquiry as described in the{" "}
                  <SiteLink href="/privacy">Privacy Policy</SiteLink>.
                </span>
              </label>

              <div
                className={`js-errorbox-all t-form__errorbox-wrapper ${styles.error}`}
                style={{ display: "none" }}
              >
                <span className="js-rule-error js-rule-error-all" />
              </div>

              <button type="submit" className={styles.submit}>
                Apply for distribution
              </button>
            </div>

            <div
              className={`js-successbox t-form__successbox ${styles.success}`}
              style={{ display: "none" }}
            >
              Thank you. We will reply within one business day.
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
