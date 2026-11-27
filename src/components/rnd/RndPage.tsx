import Image from "next/image";
import { PageAnchor } from "@/components/site/PageAnchor";
import { SiteLink } from "@/components/site/SiteLink";
import styles from "./RndPage.module.css";

const HERO_TERMS = [
  { title: "Paid development", body: "Fee credited to your first order" },
  { title: "You own the formula", body: "Full rights after sign-off" },
  { title: "Made in our plant", body: "From lab batch to production" },
];

const VALUE = [
  {
    title: "Cost per cup",
    body: "Calculated for your serve size and menu price during development, not after launch.",
  },
  {
    title: "One-step prep",
    body: "Scoop, add milk or water, serve. No whisking, no separate syrups, the same drink from any barista.",
  },
  {
    title: "No cold chain",
    body: "Room-temperature storage and 18 months shelf life. Lower storage and shipping costs, no spoilage.",
    dark: true,
  },
];

const BASES = [
  {
    title: "Powder bases",
    body: "For vending or the steam wand, dissolving in seconds. Matcha, chai, frappe, milkshake.",
    image: "/images/tild3335-6562-4638-b361-626264373764__905191c477e5451de329.jpg",
    alt: "Beverage base powder measured out with a wooden scoop",
  },
  {
    title: "Sauces, syrups and purées",
    body: "Chocolate and caramel sauces, cordials and fruit purées, including sugar-free versions.",
    image: "/images/tild3239-6265-4237-b866-373233306262__photo-1772986564376-.jpg",
    alt: "Chocolate and fruit syrup swirled together",
  },
  {
    title: "Signature and seasonal",
    body: "A drink only your brand serves, or a limited run for the season, under your label.",
    image: "/images/tild6132-3863-4132-a630-386136393833__photo-1725268093455-.jpg",
    alt: "Four mixed drinks raised in a toast",
  },
];

const PROCESS = [
  {
    title: "Brief",
    body: "We study your market, set the target cost per cup and map Halal and HACCP requirements.",
  },
  {
    title: "Samples",
    body: "Our lab builds prototypes and sends physical samples until you approve the taste.",
  },
  {
    title: "Production",
    body: "The approved formula moves to our lines in Dubai, with quality control at four stages.",
  },
  {
    title: "Launch",
    body: "Your product ships certified and documented, with logistics support for your market.",
  },
];

const LAB_FACTS = [
  { value: "Halal", body: "Certified across the full range" },
  { value: "HACCP", body: "Audited food safety system" },
  { value: "4 stages", body: "Of quality control in production" },
  { value: "Export", body: "Documents for 26 markets" },
];

const BRIEF_STEPS = [
  { title: "Brief call", body: "30 minutes with a technologist, free of charge." },
  { title: "Proposal", body: "Scope, development fee and timeline in writing." },
  { title: "Lab work", body: "Starts after sign-off. The fee is credited to your first order." },
];

const PROJECT_TYPES = ["Custom formula", "Private label", "Reformulation"];

export function RndPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="rnd-title" data-hero>
        <Image
          className={styles.heroMedia}
          src="/images/tild3065-6636-4439-a430-386130353062__photo-1630959305790-.jpg"
          alt="Laboratory technician examining a sample through a microscope"
          width={1680}
          height={1092}
          sizes="(max-width: 1023px) 100vw, 75vw"
          preload
        />
        <div className={styles.heroInner}>
          <h1 id="rnd-title" className={styles.heroTitle}>
            Your recipe.
            <br />
            Our lab.
          </h1>
          <p className={styles.heroLede}>
            Custom beverage development for chains, brands and private label. Our Dubai lab takes
            your brief to a production-ready formula, and the recipe is yours.
          </p>

          <div className={styles.heroActions}>
            <PageAnchor route="/rnd" target="rnd-form" className={styles.primary}>
              Start a brief
            </PageAnchor>
            <PageAnchor route="/rnd" target="rnd-process" className={styles.ghost}>
              How it works
            </PageAnchor>
          </div>

          <dl className={styles.heroTerms}>
            {HERO_TERMS.map((term) => (
              <div key={term.title} className={styles.heroTerm}>
                <dt className={styles.heroTermTitle}>{term.title}</dt>
                <dd className={styles.heroTermBody}>{term.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={styles.value} aria-labelledby="rnd-value">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <h2 id="rnd-value" className={styles.sectionTitle}>
              Engineered for taste,
              <br />
              costed for the till
            </h2>
            <p className={styles.sectionLede}>
              Every formula leaves the lab with its cost per cup, prep steps and storage terms
              signed off, so you know the margin before launch.
            </p>
          </div>

          <ol className={styles.valueGrid}>
            {VALUE.map((item, index) => (
              <li
                key={item.title}
                className={`${styles.valueCard} ${item.dark ? styles.valueCardDark : ""}`}
              >
                <span className={styles.valueNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.valueTitle}>{item.title}</h3>
                <p className={styles.valueBody}>{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.bases} aria-labelledby="rnd-bases">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <h2 id="rnd-bases" className={styles.sectionTitle}>
              Three bases
              <br />
              to build from
            </h2>
            <p className={styles.sectionLede}>
              Every custom product starts from one of our proven platforms, so development takes
              weeks, not months.
            </p>
          </div>

          <div className={styles.baseGrid}>
            {BASES.map((base) => (
              <article key={base.title} className={styles.base}>
                <span className={styles.baseMedia}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={base.image} alt={base.alt} loading="lazy" decoding="async" />
                </span>
                <h3 className={styles.baseTitle}>{base.title}</h3>
                <p className={styles.baseBody}>{base.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.process} id="rnd-process" aria-labelledby="rnd-process-title">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <h2 id="rnd-process-title" className={styles.sectionTitle}>
              From brief
              <br />
              to first shipment
            </h2>
            <p className={styles.sectionLede}>
              One team runs the whole project: lab, production and export. Approved samples in 14
              days.
            </p>
          </div>

          <ol className={styles.processGrid}>
            {PROCESS.map((step, index) => (
              <li key={step.title} className={styles.processStep}>
                <span className={styles.processNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.processTitle}>{step.title}</h3>
                <p className={styles.processBody}>{step.body}</p>
              </li>
            ))}
          </ol>

          <div className={styles.paidBanner}>
            <div className={styles.paidCopy}>
              <span className={styles.paidTitle}>Development is a paid service</span>
              <span className={styles.paidBody}>
                The fee is credited to your first production order. The formula is yours after
                sign-off.
              </span>
            </div>
            <PageAnchor route="/rnd" target="rnd-form" className={styles.primary}>
              Start a brief
            </PageAnchor>
          </div>
        </div>
      </section>

      <section className={styles.lab} aria-labelledby="rnd-lab">
        <div className={styles.labInner}>
          <span className={styles.labMedia}>
            <Image
              src="/images/tild6261-3964-4535-b037-643166626332__rectangle_1134_1.jpg"
              alt="the Base branded laboratory room render with tasting workstations"
              fill
              sizes="(max-width: 63.9375rem) 92vw, 35rem"
            />
          </span>

          <div className={styles.labCopy}>
            <h2 id="rnd-lab" className={styles.sectionTitle}>
              Our lab
              <br />
              in Dubai
            </h2>
            <p className={styles.sectionLede}>
              Technologists, a pilot line and production under one roof. Every formula is tested
              for taste, texture and stability before it reaches you.
            </p>

            <dl className={styles.labFacts}>
              {LAB_FACTS.map((fact) => (
                <div key={fact.value} className={styles.labFact}>
                  <dt className={styles.labFactValue}>{fact.value}</dt>
                  <dd className={styles.labFactBody}>{fact.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className={styles.form} id="rnd-form" aria-labelledby="rnd-form-title">
        <div className={styles.formInner}>
          <div className={styles.formCopy}>
            <h2 id="rnd-form-title" className={styles.sectionTitle}>
              Start
              <br />
              a brief
            </h2>
            <p className={styles.sectionLede}>
              Tell us what you want to develop. What happens next:
            </p>

            <ol className={styles.briefSteps}>
              {BRIEF_STEPS.map((step, index) => (
                <li key={step.title} className={styles.briefStep}>
                  <span className={styles.briefNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.briefTitle}>{step.title}</span>
                  <span className={styles.briefBody}>{step.body}</span>
                </li>
              ))}
            </ol>

            <SiteLink href="/request-samples" className={styles.briefAside}>
              Only need samples of our existing range? Request a sample box{" "}
              <span aria-hidden="true">→</span>
            </SiteLink>
          </div>

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
                  <input name="Phone" type="tel" autoComplete="tel" placeholder="+971" required />
                </label>
              </div>

              <label className={styles.field}>
                <span>Market / country</span>
                <input name="country" type="text" autoComplete="country-name" required />
              </label>

              <fieldset className={styles.chips}>
                <legend>Project type</legend>
                <div className={styles.chipRow}>
                  {PROJECT_TYPES.map((type, index) => (
                    <label key={type} className={styles.chip}>
                      <input
                        type="radio"
                        name="product"
                        value={type}
                        defaultChecked={index === 0}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className={styles.field}>
                <span>What should we develop?</span>
                <textarea
                  name="text"
                  rows={4}
                  required
                  placeholder="Product, target market, expected monthly volume and timing."
                />
              </label>

              <label className={styles.consent}>
                <input name="privacy-consent" type="checkbox" required />
                <span>
                  I consent to the Base processing this inquiry as described in the{" "}
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
                Send brief
              </button>
            </div>

            <div
              className={`js-successbox t-form__successbox ${styles.success}`}
              style={{ display: "none" }}
            >
              Thank you. Your brief has been sent to the Base R&amp;D team.
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
