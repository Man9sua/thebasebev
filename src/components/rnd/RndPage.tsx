import { SiteLink } from "@/components/site/SiteLink";
import styles from "./RndPage.module.css";

/**
 * R&D and product development.
 *
 * A React page in place of the exported Tilda document, which is what `/catalog`
 * and `/contacts` already are. What it replaces was 15,000 pixels tall and said
 * most things twice: three product families appeared once as "16 Product Lines"
 * and again inside "Our Beverage Development Services"; the fourteen-day
 * timeline appeared once as "14 Days to Commercial Reality" and again as "Your
 * Journey From Concept to Commercialization". Between them sat a grid of stock
 * photographs of beaches, palm trees and a hotel pool.
 *
 * The copy here is the page's own, verbatim — it is what the page ranks on —
 * minus the duplication. The order is the argument: what it saves, what it
 * makes, how fast, what it does, who does it, what it is certified to, and how
 * to start.
 *
 * The `h1` is new, and it had to be. The exported page's only `h1` was "Узнай
 * свою дневную норму за 30 секунд" — a Russian calorie-calculator heading left
 * over from a Tilda template, on an English B2B page whose `<title>` is
 * "Beverage R&D and Product Development Dubai". That is the mismatch
 * `audit:seo-parity` has been reporting for `/rnd`, and it will keep reporting
 * it until production carries this wording too.
 *
 * The form is the page's own `Partner with Us` — same id, same
 * `tildaspec-formname` — so leads keep landing exactly where
 * `LEGACY_FORM_NAMES` in `lib/lead-forms.ts` already routes them.
 */

/** What the blends save, and why. The page's own figures. */
const FIGURES = [
  {
    value: "40%",
    label: "Cost reduction",
    body: "Smart blends deliver exact gram-to-cup ratios, eliminating spoilage and overpouring for predictable profit margins.",
  },
  {
    value: "50%",
    label: "Savings on logistics",
    body: "Lightweight, stable powders and cordials require zero refrigeration, slashing storage and shipping expenses.",
  },
  {
    value: "60%",
    label: "Time saved behind the bar",
    body: "Advanced instantization technology means zero whisking and complex recipes, allowing staff to craft beverages in seconds.",
  },
];

const LINES = [
  {
    title: "Smart Dry Blends",
    body: "Engineered for vending machines or to dissolve instantly under an espresso steam wand. Includes Matcha, Chai, Frappe.",
    image: "/images/tild3335-6562-4638-b361-626264373764__905191c477e5451de329.jpg",
    alt: "Beverage base powder measured out with a wooden scoop",
  },
  {
    title: "High-Brix Cordials & Syrups",
    body: "Stable liquid bases available in over 600 premium flavors, including zero-calorie options.",
    image: "/images/tild3239-6265-4237-b866-373233306262__photo-1772986564376-.jpg",
    alt: "Chocolate and fruit syrup swirled together",
  },
  {
    title: "Signature & Seasonal Creations",
    body: "Custom, private-label blends tailored to your brand's DNA and seasonal menus.",
    image: "/images/tild6132-3863-4132-a630-386136393833__photo-1725268093455-.jpg",
    alt: "Four mixed drinks raised in a toast",
  },
];

const STEPS = [
  {
    title: "The Blueprint",
    body: "We reverse-engineer your target market, lock in your COGS (Cost of Goods Sold), and map the Halal HACCP regulatory pathways.",
  },
  {
    title: "The Alchemy",
    body: "Rapid benchtop prototyping in our lab. We craft the perfect sensory experience and send you physical samples to taste and approve.",
  },
  {
    title: "The Compound",
    body: "We shift immediately to our in-house manufacturing lines, producing your bespoke premix with four stages of rigorous quality control.",
  },
  {
    title: "The Takeover",
    body: "Your product is shipped, fully certified, and ready to dominate the HoReCa market across Europe, the Middle East, and Asia.",
  },
];

const SERVICES = [
  {
    title: "Custom Formulation",
    body: "We engineer unique flavor profiles, textures, and stability for your signature drinks, optimizing for taste and cost.",
  },
  {
    title: "Advanced Manufacturing",
    body: "Leverage our state-of-the-art UAE facility for seamless, high-quality production of your beverage compounds.",
  },
  {
    title: "Market Entry Support",
    body: "Navigate the complexities of market launch with our expertise in logistics, regulatory compliance, and supply chain integration.",
  },
  {
    title: "Rapid Prototyping & Production",
    body: "Experience an accelerated 14-day turnaround from concept to commercial reality with our vertically integrated process.",
  },
  {
    title: "Cost Optimization",
    body: "Achieve significant cost reductions through smart blending, reduced spoilage, and efficient logistics.",
  },
];

const LAB = [
  {
    title: "Beverage Science Expertise",
    body: "Mastering flavor masking, stability, and texture to create unique and high-quality beverages.",
  },
  {
    title: "State-of-the-Art UAE Facility",
    body: "Our high-tech laboratory and manufacturing plant in Dubai ensures seamless production and quality control.",
  },
  {
    title: "Creating Liquid Assets",
    body: "Transforming bold concepts into market-ready commercial compounds that drive business success.",
  },
  {
    title: "Market Leadership",
    body: "Partnering with clients to establish dominance in the HoReCa beverage market through innovation and efficiency.",
  },
];

const COMPLIANCE = [
  {
    title: "HACCP Certification",
    body: "Our adherence to the Hazard Analysis and Critical Control Points system guarantees that potential food safety hazards are systematically identified and controlled.",
  },
  {
    title: "Halal Certification",
    body: "We proudly maintain Halal certification, ensuring our products meet the strict dietary and ethical requirements of Halal consumers.",
  },
  {
    title: "Rigorous Quality Control",
    body: "Our manufacturing process includes four distinct stages of rigorous quality control.",
  },
  {
    title: "International Standards Compliance",
    body: "We are committed to ensuring all our products comply with international quality and safety standards.",
  },
];

const OFFER = [
  { title: "Sample Box", body: "Receive a complimentary sample box of potential product bases." },
  { title: "R&D Audit", body: "Get an audit of your current R&D or product line." },
  { title: "Low Commitment", body: "A perfect entry point for potential clients." },
];

export function RndPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="rnd-title">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.heroPhoto}
          src="/images/tild3065-6636-4439-a430-386130353062__photo-1630959305790-.jpg"
          alt="Technician at a microscope in THE BASE laboratory"
          fetchPriority="high"
        />
        <span className={styles.heroVeil} aria-hidden="true" />

        <div className={styles.heroInner}>
          <span className={`tbb-label ${styles.eyebrow}`}>R&D and product development</span>
          <h1 id="rnd-title" className={styles.heroTitle}>
            Beverage R&amp;D and product development in Dubai
          </h1>
          <p className={styles.heroLede}>
            Most R&amp;D labs hand you a recipe, wish you luck, and walk away. We hand you the
            market.
          </p>
          <div className={styles.heroActions}>
            <a href="#rnd-form" className={styles.primary}>
              Start a brief <span aria-hidden="true">↓</span>
            </a>
            <SiteLink href="/catalog" className={styles.secondary}>
              See the catalogue
            </SiteLink>
          </div>
        </div>
      </section>

      {/* The three figures open the page because they are the argument: the
          formulation work is bought for what it saves, not for its chemistry. */}
      <section className={styles.figures} aria-labelledby="rnd-figures">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <h2 id="rnd-figures" className={styles.sectionTitle}>
              Engineered for taste, costed for the till
            </h2>
            <p className={styles.sectionLede}>
              Our bespoke formulations aren&apos;t just delicious — they are mathematically designed
              to optimize your business operations.
            </p>
          </div>

          <dl className={styles.figureRow}>
            {FIGURES.map((figure) => (
              <div key={figure.label} className={styles.figure}>
                <dt className={styles.figureValue}>{figure.value}</dt>
                <dd className={styles.figureBody}>
                  <span className={`tbb-label ${styles.figureLabel}`}>{figure.label}</span>
                  {figure.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={styles.lines} aria-labelledby="rnd-lines">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <span className={`tbb-label ${styles.eyebrow}`}>16 product lines</span>
            <h2 id="rnd-lines" className={styles.sectionTitle}>
              Three families to build from
            </h2>
            <p className={styles.sectionLede}>
              We have the architecture to build solutions for various needs, from global franchises
              to distributors.
            </p>
          </div>

          <div className={styles.lineGrid}>
            {LINES.map((line) => (
              <article key={line.title} className={styles.line}>
                <span className={styles.lineMedia}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={line.image} alt={line.alt} loading="lazy" decoding="async" />
                </span>
                <h3 className={styles.lineTitle}>{line.title}</h3>
                <p className={styles.lineBody}>{line.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* One timeline, not two: the exported page told this story twice, once
          here and once as "Your Journey From Concept to Commercialization". */}
      <section className={styles.timeline} aria-labelledby="rnd-timeline">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <span className={`tbb-label ${styles.eyebrow}`}>Concept to commercialization</span>
            <h2 id="rnd-timeline" className={styles.sectionTitle}>
              14 days to commercial reality
            </h2>
            <p className={styles.sectionLede}>
              In the beverage industry, where competition is fierce and consumer expectations are
              high, speed is leverage that can significantly impact market share and revenue.
            </p>
          </div>

          <ol className={styles.steps}>
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

      <section className={styles.services} aria-labelledby="rnd-services">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <h2 id="rnd-services" className={styles.sectionTitle}>
              Our beverage development services
            </h2>
            <p className={styles.sectionLede}>
              Discover how we transform concepts into market-leading beverages with our
              comprehensive R&amp;D and manufacturing services.
            </p>
          </div>

          <ul className={styles.serviceList}>
            {SERVICES.map((service) => (
              <li key={service.title} className={styles.service}>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.serviceBody}>{service.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.lab} aria-labelledby="rnd-lab">
        <div className={styles.labInner}>
          <span className={styles.labMedia}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/tild6565-3533-4465-b561-303337656436__photo-1530037335614-.jpg"
              alt="Beverage bottling line in production"
              loading="lazy"
              decoding="async"
            />
          </span>

          <div className={styles.labCopy}>
            <h2 id="rnd-lab" className={styles.sectionTitle}>
              The Base R&amp;D Lab
            </h2>
            <p className={styles.sectionLede}>
              We go beyond simply chasing fleeting trends in the beverage industry, as we strive to
              invent entirely new and innovative beverage experiences that delight and inspire our
              customers.
            </p>

            <dl className={styles.labList}>
              {LAB.map((item) => (
                <div key={item.title} className={styles.labItem}>
                  <dt className={styles.labTitle}>{item.title}</dt>
                  <dd className={styles.labBody}>{item.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className={styles.compliance} aria-labelledby="rnd-compliance">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <h2 id="rnd-compliance" className={styles.sectionTitle}>
              Quality and compliance
            </h2>
            <p className={styles.sectionLede}>
              We are dedicated to upholding the highest standards of quality assurance and
              certification.
            </p>
          </div>

          <ul className={styles.complianceList}>
            {COMPLIANCE.map((item) => (
              <li key={item.title} className={styles.complianceItem}>
                <h3 className={styles.complianceTitle}>{item.title}</h3>
                <p className={styles.complianceBody}>{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.form} id="rnd-form" aria-labelledby="rnd-form-title">
        <div className={styles.formInner}>
          <div className={styles.formCopy}>
            <span className={`tbb-label ${styles.eyebrow}`}>How it works</span>
            <h2 id="rnd-form-title" className={styles.sectionTitle}>
              Connect with The Base R&amp;D Lab
            </h2>
            <p className={styles.sectionLede}>
              Feel free to request a complimentary sample box along with a detailed research and
              development audit.
            </p>

            <ol className={styles.offer}>
              {OFFER.map((item) => (
                <li key={item.title} className={styles.offerItem}>
                  <span className={styles.offerTitle}>{item.title}</span>
                  <span className={styles.offerBody}>{item.body}</span>
                </li>
              ))}
            </ol>
          </div>

          {/*
            The page's own form, kept whole: same id and same
            `tildaspec-formname`, so a lead from here reaches the sales team
            under the name it always has — see `LEGACY_FORM_NAMES`.
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
                <span>Market / country</span>
                <input name="country" type="text" autoComplete="country-name" required />
              </label>

              <label className={styles.field}>
                <span>What would you like us to develop?</span>
                <textarea
                  name="text"
                  rows={5}
                  required
                  placeholder="Product category, target market, expected monthly volume and timing."
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
                Request a sample box <span aria-hidden="true">→</span>
              </button>
            </div>

            <div
              className={`js-successbox t-form__successbox ${styles.success}`}
              style={{ display: "none" }}
            >
              Thank you. Your brief has been sent to THE BASE R&amp;D team.
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
