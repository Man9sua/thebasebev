import type { CSSProperties, ReactNode } from "react";
import {
  DistributorLink,
  FlavourEnquiryLink,
  Hero,
  SampleButton,
  Section,
  Stats,
  Steps,
  Tiles,
  cx,
  productImage,
  productPageStyles as styles,
  type Question,
} from "../blocks";
import type { ProductPageProps } from "../types";
import s from "./Jam.module.css";

/**
 * Jam ("Jam · страница продукта целиком", desktop 1440 / mobile 390).
 * A newer design generation than matcha: six small service cards, tall
 * prepare cards, colour flavour cards with "New" badges, a simplified
 * "Inside the pack", a plain FAQ and a closing "Try it on your menu" band.
 * Sugar free shares that generation, so its pieces are exported from here.
 */

const SLUG = "jam";

export { s as jamStyles };

/* ---------------- shared pieces of this generation ---------------- */

/** The black "Your own flavour / blend" band under a flavour grid; opens the custom-flavour form. */
export function RndBand({ name, text }: { name: ReactNode; text: ReactNode }) {
  return (
    <div className={s.band}>
      <div className={s.bandCopy}>
        <span className={s.bandName}>{name}</span>
        <span className={s.bandText}>{text}</span>
      </div>
      <FlavourEnquiryLink className={s.bandLink} />
    </div>
  );
}

export type Fact = { label: string; value: string };

/** "Inside the pack" without tabs or %DV: a caption, two-column facts and the side cards. */
export function SimpleInside({
  caption,
  mobileCaption,
  facts,
  side,
}: {
  caption: ReactNode;
  mobileCaption: ReactNode;
  facts: Fact[];
  side: ReactNode;
}) {
  return (
    <section className={cx(styles.section, s.gap40, s.inside)} aria-labelledby="product-inside-title">
      <div className={styles.sectionHead}>
        <h2 id="product-inside-title" className={styles.title}>
          Inside the pack
        </h2>
        <span className={cx(s.caption, styles.desktopOnly)}>{caption}</span>
      </div>
      <span className={cx(s.caption, styles.mobileOnly)}>{mobileCaption}</span>
      <div className={styles.insideGrid}>
        <div className={s.facts}>
          {facts.map((fact) => (
            <div key={fact.label} className={s.fact}>
              <span>{fact.label}</span>
              <span>{fact.value}</span>
            </div>
          ))}
        </div>
        {side}
      </div>
    </section>
  );
}

export function ShelfCard({ value = "18 months", text, mobileText }: { value?: ReactNode; text: ReactNode; mobileText: ReactNode }) {
  return (
    <div className={s.shelf}>
      <span className={s.shelfValue}>{value}</span>
      <span className={s.shelfText}>
        <span className={styles.desktopOnly}>{text}</span>
        <span className={styles.mobileOnly}>{mobileText}</span>
      </span>
    </div>
  );
}

/** The FAQ of this generation: the heading alone on the left, every question on the phone, no buttons. */
export function PlainFaq({ items }: { items: Question[] }) {
  return (
    <section className={s.faq} aria-labelledby="product-faq-title">
      <h2 id="product-faq-title" className={styles.title}>
        Questions
      </h2>
      <div className={s.faqList}>
        {items.map((item, i) => (
          <details key={i} className={s.faqItem} open={i === 0}>
            <summary className={s.faqQ}>
              {item.q}
              <span className={s.plus} aria-hidden="true">
                +
              </span>
            </summary>
            <p className={s.faqA}>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** The closing band: sample + distributor on desktop, the sample button alone on the phone. */
export function TryBand({ productName, text, style }: { productName: string; text: ReactNode; style?: CSSProperties }) {
  return (
    <section className={s.try} style={style} aria-labelledby="product-try-title">
      <div className={s.tryCard}>
        <div className={s.tryCopy}>
          <h2 id="product-try-title" className={cx(styles.title, s.tryHead)}>
            Try it on your menu
          </h2>
          <span className={cx(s.trySub, styles.desktopOnly)}>{text}</span>
        </div>
        <div className={cx(s.tryActions, s.darkActions)}>
          <SampleButton productName={productName} />
          <DistributorLink className={styles.desktopOnly} />
        </div>
      </div>
    </section>
  );
}

/* ---------------- jam ---------------- */

const flavours = [
  { name: "Strawberry Watermelon", color: "#E8B4B0" },
  { name: "Lemon Ginger Honey", color: "#F1DE9A", isNew: true },
  { name: "Pomegranate Rose", color: "#E7A6B0", isNew: true },
  { name: "Mango Passion Fruit", color: "#F6C98A", isNew: true },
  { name: "Sea Buckthorn Orange", color: "#F3B680", isNew: true },
  { name: "Apple Cinnamon Cardamom", color: "#D9DCA2", isNew: true },
];

const facts: Fact[] = [
  { label: "Calories", value: "49.5 kcal" },
  { label: "Total fat", value: "0 g" },
  { label: "Sodium", value: "32.3 mg" },
  { label: "Total carbohydrates", value: "12.8 g" },
  { label: "Total sugar", value: "12.7 g" },
  { label: "Protein", value: "<0.1 g" },
];

const faq: Question[] = [
  {
    q: "How is it different from a liquid fruit tea concentrate?",
    a: "It is a dry base. The pack stays sealed on the shelf, there are no open bottles and nothing to keep cold. Add hot water and it dissolves in about 15 seconds.",
  },
  {
    q: "Can we add our own fruit and herbs?",
    a: "Yes. The base gives the flavour and body. Add fresh fruit, purée, mint, rosemary or thyme to make the tea your own signature.",
  },
  { q: "Does it work iced?", a: "Yes. Dissolve 15 g in a little hot water, then top up with cold water and ice." },
  { q: "How many cups are in one pack?", a: "A 500 g pack makes 33 cups of 200 ml." },
  { q: "Can you develop a flavour only for us?", a: "Yes. Our R&D lab develops flavours for your menu or your own label." },
];

export function JamPage({ product }: ProductPageProps) {
  const hero = productImage(SLUG, "hero", [600, 800]);
  const serves = [
    { ...hero, alt: "Fruit tea made with the Jam base" },
    ...[2, 3, 4].map((n) => ({ ...productImage(SLUG, `serve-${n}`, [400, 800]), alt: "Fruit tea made with the Jam base" })),
  ];

  return (
    <main
      className={styles.page}
      style={
        {
          "--pp-bg": "#F4F3EF",
          "--pp-hero-bg": "#3A0A0E",
          "--pp-hero-title": "#F6F6F4",
          "--pp-hero-lead": "#E6CFCF",
        } as CSSProperties
      }
    >
      <Hero
        className={cx(s.hero, s.darkActions)}
        mediaClassName={s.fill}
        productName={product.name}
        title="Jam"
        lead={{
          desktop:
            "A dry fruit tea base with real fruit juice and black tea. Add hot water and serve, then finish with fresh fruit or herbs for your own signature tea.",
        }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img {...hero} sizes="(max-width: 1023px) 366px, 560px" alt="Fruit tea made with the Jam base" fetchPriority="high" />
        }
      />

      <Section className={s.gap40} title="Made for service" label="Made for service">
        <Stats
          columns={6}
          className={s.miniStats}
          items={[
            { value: "15 g", label: "Per 200 ml cup" },
            { value: "15 sec", label: "Dissolves in hot water" },
            { value: "33", label: "Cups per 500 g pack" },
            { value: "Real fruit", label: "Fruit juice powder and tea" },
            { value: "18 months", label: "Shelf life" },
            { value: "Below 25°C", label: "Dry storage, no fridge" },
          ]}
        />
      </Section>

      <Section
        className={cx(styles.menu, s.gap40)}
        title="Ready for your menu"
        side="One base, your garnish. Fresh fruit, purée and herbs turn it into a signature tea."
        label="Ready for your menu"
      >
        <Tiles items={serves} columns={4} />
      </Section>

      <Section className={s.gap40} title="How to prepare" label="How to prepare">
        <Steps
          className={s.tallSteps}
          items={[
            { label: "Hot water", value: "200 ml" },
            { label: "Jam base", value: "15 g" },
            { label: "Stir", value: "15 sec" },
            { label: "Cup", value: "8 oz", dark: true },
          ]}
        />
      </Section>

      <Section className={s.gap40} title="Six flavours" label="Flavours">
        <div className={s.flavours}>
          {flavours.map((flavour) => (
            <div key={flavour.name} className={s.flavour} style={{ background: flavour.color }}>
              {flavour.isNew ? <span className={s.badge}>New</span> : <span />}
              <span className={s.flavourName}>{flavour.name}</span>
            </div>
          ))}
        </div>
        <RndBand name="Your own flavour" text="Our lab develops a fruit tea for your menu or your label." />
      </Section>

      <SimpleInside
        caption="Per 15 g serve · Strawberry Watermelon"
        mobileCaption="Per 15 g serve"
        facts={facts}
        side={
          <ShelfCard
            text="Store in a cool, dry, clean place below 25°C, away from direct sunlight. 500 g resealable pack, no fridge needed."
            mobileText="Store below 25°C in a cool, dry place. No fridge needed."
          />
        }
      />

      <PlainFaq items={faq} />

      <TryBand productName={product.name} text="Samples for cafés, hotels and distributors." />
    </main>
  );
}
