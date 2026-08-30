import Image from "next/image";
import { SiteLink } from "@/components/site/SiteLink";
import catalogTiles from "@/data/catalog-tiles.json";
import { CATALOG_PRODUCTS } from "@/data/catalog";
import styles from "./DistributorsPage.module.css";

/**
 * Become a distributor.
 *
 * A React page in place of the exported Tilda document, the way `/catalog`,
 * `/contacts` and `/rnd` already are. The hero is kept as it stood — the same
 * words, the same four figures, the same two calls to action — and everything
 * under it is rebuilt.
 *
 * The product strip is the one place the old page really fell down: it drew its
 * own square tiles of a pouch on a flat colour, while `/catalog` two clicks away
 * shows the same sixteen products as photographs. Two treatments of one
 * catalogue, and the weaker one was the page asking someone to stock it. It now
 * reads from `catalog-tiles.json` — the same artwork, the same 4:5 frame, the
 * same name-and-category caption — so the strip is a window onto the catalogue
 * rather than a second version of it.
 *
 * The copy is the page's own throughout. The form is `Partner with Us`, which is
 * what the page's "Apply for distribution" button already opened, so leads keep
 * the name `LEGACY_FORM_NAMES` routes them by.
 */

const tiles = catalogTiles as Record<string, { image: string }>;

/** The three pouches the exported hero stood together, front to back. */
const HERO_PACKS = [
  "/images/w/tild3334-3061-4431-a366-333338646666__hero-raf.webp",
  "/images/w/tild3539-3639-4431-b963-333932383239__hero-matcha.webp",
  "/images/w/tild3065-3261-4639-a232-303433373631__hero-frappe.webp",
];

/** The hero's four figures, unchanged. */
const FIGURES = [
  { value: "600+", label: "Flavours" },
  { value: "16", label: "Product lines" },
  { value: "18", label: "Months shelf life" },
  { value: "UAE", label: "Own production" },
];

const REASONS = [
  {
    title: "No cold chain",
    body: "Dry powder format. No refrigeration in transit or storage — lower logistics cost and no spoilage risk on the shelf.",
  },
  {
    title: "18 months shelf life",
    body: "A long rotation window. Stock without pressure and plan orders around your season, not around expiry dates.",
  },
  {
    title: "One pouch, six ingredients",
    body: "Replaces cream, syrups and toppings. Preparation drops from six steps to one and the taste holds steady.",
  },
  {
    title: "Our own facility",
    body: "Produced in the UAE, never outsourced. Stable supply, traceable batches and full export documentation.",
  },
];

const STEPS = [
  {
    title: "Place your first order",
    body: "Get wholesale pricing and pick the product lines that fit your market.",
  },
  {
    title: "Receive sales materials",
    body: "Brochures, recipe cards and staff training — everything your team needs to sell.",
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
    featured: false,
    items: ["Wholesale pricing", "Digital brochures", "Sample kit", "Email support"],
  },
  {
    eyebrow: "Most chosen",
    name: "Regional",
    featured: true,
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
    featured: false,
    items: [
      "Best wholesale pricing",
      "Priority production slots",
      "Co-branded marketing",
      "Dedicated manager",
    ],
  },
];

/** The six the old page showed, in the order it showed them. */
const STRIP_SLUGS = ["milkshake", "raf-coffee", "iced-tea", "matcha", "cordial", "chocolate"];

const FAQ = [
  {
    q: "What is the minimum first order?",
    a: "It depends on your market and the lines you choose. We agree a realistic starting volume during the first call.",
  },
  {
    q: "Do you offer exclusive territory rights?",
    a: "Yes, on Tier 1 partnership. Exclusivity is tied to agreed annual volume.",
  },
  {
    q: "Which documents come with a shipment?",
    a: "Certificates of analysis, halal and HACCP documentation, and full export paperwork for your country.",
  },
  {
    q: "How long does delivery take?",
    a: "Two to three weeks from confirmed order within the region. Longer routes are quoted individually.",
  },
  {
    q: "Can we get samples before committing?",
    a: "Yes. We send a sample kit so your clients can taste the products before you place a volume order.",
  },
];

export function DistributorsPage() {
  const strip = STRIP_SLUGS.map((slug) => CATALOG_PRODUCTS.find((p) => p.slug === slug)).filter(
    (product) => product !== undefined,
  );

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="dist-title">
        {/*
          Three pouches rather than one photograph: these are the same cut-outs
          the exported hero composed, each on its own transparency, so the group
          can be laid out here instead of arriving pre-flattened at one size.
        */}
        <span className={styles.heroArt} aria-hidden="true">
          {HERO_PACKS.map((pack, index) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={pack}
              className={styles.heroPack}
              style={{ ["--slot" as string]: index }}
              src={pack}
              alt=""
              fetchPriority={index === 0 ? "high" : "auto"}
            />
          ))}
        </span>
        <span className={styles.heroVeil} aria-hidden="true" />

        <div className={styles.heroInner}>
          <span className={`tbb-label ${styles.eyebrow}`}>Wholesale partnership</span>
          <h1 id="dist-title" className={styles.heroTitle}>
            Become a distributor of The Base
          </h1>
          <p className={styles.heroLede}>
            Dry beverage premixes produced in our own UAE facility. One pouch replaces cream, syrups
            and toppings — no refrigeration, 18 months shelf life, consistent taste across every
            outlet.
          </p>

          <div className={styles.heroActions}>
            <a href="#distributor-form" className={styles.primary}>
              Apply for distribution <span aria-hidden="true">↓</span>
            </a>
            <SiteLink href="/catalog" className={styles.secondary}>
              View catalogue
            </SiteLink>
          </div>

          <dl className={styles.heroFigures}>
            {FIGURES.map((figure) => (
              <div key={figure.label} className={styles.heroFigure}>
                <dt className={styles.heroFigureValue}>{figure.value}</dt>
                <dd className={`tbb-label ${styles.heroFigureLabel}`}>{figure.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={styles.reasons} aria-labelledby="dist-reasons">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <span className={`tbb-label ${styles.eyebrow}`}>Why partners choose us</span>
            <h2 id="dist-reasons" className={styles.sectionTitle}>
              Built for distribution, not just for taste
            </h2>
          </div>

          <ol className={styles.reasonList}>
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
          <div className={styles.sectionHead}>
            <h2 id="dist-steps" className={styles.sectionTitle}>
              Become a distributor in four steps
            </h2>
          </div>

          <ol className={styles.stepList}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <a href="#distributor-form" className={styles.stepsCta}>
            Start selling now <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section className={styles.tiers} aria-labelledby="dist-tiers">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <span className={`tbb-label ${styles.eyebrow}`}>Partnership</span>
            <h2 id="dist-tiers" className={styles.sectionTitle}>
              Terms that grow with your volume
            </h2>
            <p className={styles.sectionLede}>
              Start where you are — move up when you are ready. Every tier includes wholesale
              pricing and full documentation.
            </p>
          </div>

          <div className={styles.tierGrid}>
            {TIERS.map((tier) => (
              <article
                key={tier.name}
                className={`${styles.tier} ${tier.featured ? styles.tierFeatured : ""}`}
              >
                <span className={`tbb-label ${styles.tierEyebrow}`}>{tier.eyebrow}</span>
                <h3 className={styles.tierName}>{tier.name}</h3>
                <ul className={styles.tierItems}>
                  {tier.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* The same artwork and the same frame the catalogue uses — see the note
          at the top of this file for why that matters here. */}
      <section className={styles.range} aria-labelledby="dist-range">
        <div className={styles.inner}>
          <div className={styles.rangeHead}>
            <div className={styles.sectionHead}>
              <span className={`tbb-label ${styles.eyebrow}`}>Product range</span>
              <h2 id="dist-range" className={styles.sectionTitle}>
                Sixteen lines, 600+ flavours
              </h2>
            </div>
            <SiteLink href="/catalog" className={styles.rangeLink}>
              See all products <span aria-hidden="true">→</span>
            </SiteLink>
          </div>

          <div className={styles.rangeGrid}>
            {strip.map((product) => (
              <article key={product.slug} className={styles.card}>
                <SiteLink className={styles.cardMedia} href={product.route}>
                  <Image
                    className={styles.cardImage}
                    src={tiles[product.slug]?.image ?? `/images/pack-${product.slug}.webp`}
                    alt={`${product.name} beverage base by THE BASE`}
                    fill
                    sizes="(max-width: 639px) 46vw, (max-width: 1023px) 31vw, 16vw"
                    loading="lazy"
                  />
                </SiteLink>
                <p className={`tbb-label ${styles.cardCategory}`}>{product.categoryLabel}</p>
                <SiteLink className={styles.cardName} href={product.route}>
                  {product.name}
                </SiteLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="dist-faq">
        <div className={styles.faqInner}>
          <div className={styles.faqCopy}>
            <h2 id="dist-faq" className={styles.sectionTitle}>
              Frequently asked questions
            </h2>
            <p className={styles.sectionLede}>
              Supply terms, minimums, certification and delivery. If your question is not here,
              write to us and we will answer directly.
            </p>
            <SiteLink href="/contacts" className={styles.faqLink}>
              Write to us <span aria-hidden="true">→</span>
            </SiteLink>
          </div>

          <div className={styles.faqList}>
            {FAQ.map((item) => (
              <details key={item.q} className={styles.faqItem}>
                <summary className={styles.faqQuestion}>{item.q}</summary>
                <p className={styles.faqAnswer}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.form} id="distributor-form" aria-labelledby="dist-form-title">
        <div className={styles.formInner}>
          <div className={styles.formCopy}>
            <span className={`tbb-label ${styles.eyebrow}`}>Apply for distribution</span>
            <h2 id="dist-form-title" className={styles.sectionTitle}>
              Tell us your market
            </h2>
            <p className={styles.sectionLede}>
              Territory, the lines you want to carry and the volume you expect. We come back with
              wholesale pricing, documentation and a sample kit.
            </p>
            <a
              className={styles.callLink}
              href="https://calendly.com/thebasebev/the-base-presentation"
              target="_blank"
              rel="noreferrer"
            >
              Or book a short call <span aria-hidden="true">→</span>
            </a>
          </div>

          {/*
            The form the page's "Apply for distribution" button already opened:
            same id, same `tildaspec-formname`, so a lead from here reaches the
            sales team under the name it always has.
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
                  <span>Phone</span>
                  <input name="Phone" type="tel" autoComplete="tel" required />
                </label>
              </div>

              <label className={styles.field}>
                <span>Territory / country</span>
                <input name="country" type="text" autoComplete="country-name" required />
              </label>

              <label className={styles.field}>
                <span>Lines and expected volume</span>
                <textarea
                  name="text"
                  rows={5}
                  required
                  placeholder="Which product lines, the channels you supply and the volume you expect per month."
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
                Apply for distribution <span aria-hidden="true">→</span>
              </button>
            </div>

            <div
              className={`js-successbox t-form__successbox ${styles.success}`}
              style={{ display: "none" }}
            >
              Thank you. Your application has been sent to THE BASE partnership team.
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
