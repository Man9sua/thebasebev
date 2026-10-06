import type { CSSProperties } from "react";
import {
  Faq,
  Hero,
  Info,
  Inside,
  Kit,
  Section,
  Shelf,
  Stats,
  Steps,
  Tiles,
  cx,
  productImage,
  productPageStyles as styles,
  type NutritionSet,
} from "../blocks";
import type { ProductPageProps } from "../types";
import { RndBand, jamStyles as j } from "./Jam";
import s from "./Tea.module.css";

/**
 * Tea ("Tea · страница продукта целиком", desktop 1440 / mobile 390).
 * Matcha's shape with a near-black hero and "Three teas" pack cards.
 */

const SLUG = "tea";

/*
 * The mock draws Black / Green tabs, but only the Black label (TE-002) has
 * been read; the Green table follows once its label arrives.
 */
const nutrition: NutritionSet[] = [
  {
    name: "Black",
    caption: "Per 1 g sachet · 20 sachets per pack",
    mobileCaption: "Black · per 1 g sachet",
    rows: [
      { label: "Calories", value: "3 kcal" },
      { label: "Total fat", value: "0 g", dv: "0%" },
      { label: "Sodium", value: "0.3 mg", dv: "<0.1%" },
      { label: "Total carbohydrates", value: "0.6 g", dv: "0.2%" },
      { label: "Total sugar", value: "0 g", dv: "0%" },
      { label: "Protein", value: "0.2 g", dv: "0.4%" },
      { label: "Calcium", value: "0.2 mg", dv: "<0.1%" },
    ],
    note: "Daily value based on a 2,000-calorie diet.",
  },
];

const teas = [
  { name: "Black", image: "black", text: "Classic, strong, clean" },
  { name: "Green", image: "green", text: "Light, fresh, grassy" },
  {
    name: "Jasmine",
    image: "jasmine",
    text: "Green tea with jasmine, floral and soft",
  },
];

const faq = [
  {
    q: "Why instant tea instead of loose leaf?",
    a: "No brewing, steeping or straining. One sachet makes one cup or you scale it to a dispenser, and every cup tastes the same.",
  },
  {
    q: "Can I use it for iced tea and bottled drinks?",
    a: "Yes. It dissolves fully in cold water, so it works for iced tea, jugs and ready-to-drink recipes.",
  },
  {
    q: "Can I serve it hot?",
    a: "Yes. Pour 200 ml of hot water over one sachet and stir.",
  },
  { q: "How many cups from one pack?", a: "20 cups: 20 sachets of 1 g each." },
  {
    q: "Is there sugar inside?",
    a: "No. Only instant tea, 3 kcal per cup. Add sugar, honey or syrup to taste.",
  },
  {
    q: "Can I make tea with milk?",
    a: "Yes. Dissolve the sachet in a little hot water, then top with steamed milk.",
  },
  {
    q: "Does it stay fresh after opening?",
    a: "Each sachet is sealed, so the pack stays fresh until the last cup.",
  },
  {
    q: "Is it Halal?",
    a: "Yes. Produced in the UAE under HACCP and ISO 22000:2018, Halal certified.",
  },
  {
    q: "Where can I buy it in my country?",
    a: "Through our distributors in 17 markets. Find yours on the Distributors page.",
  },
];

export function TeaPage({ product, headline, assets }: ProductPageProps) {
  const hero = productImage(SLUG, "hero", [600, 1000]);
  const serves = [
    { ...hero, alt: "Tea serve" },
    ...[2, 3, 4, 5].map((n) => ({
      ...productImage(SLUG, `serve-${n}`, [400, 800]),
      alt: "Tea serve",
    })),
  ];

  return (
    <main
      className={styles.page}
      style={
        {
          "--pp-bg": "#F6F4F0",
          "--pp-hero-bg": "#121212",
          "--pp-hero-title": "#F6F6F4",
          "--pp-hero-lead": "#C9C6C0",
        } as CSSProperties
      }
    >
      <Hero
        className={cx(s.hero, j.darkActions)}
        productName={product.name}
        title="Tea"
        headline={headline}
        lead={{
          desktop:
            "Instant black, green and jasmine tea in single sachets. One gram, one cup: no brewing, no steeping, the same taste every time.",
          mobile:
            "Instant black, green and jasmine tea. One gram, one cup, no brewing.",
        }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img
            {...hero}
            sizes="(max-width: 1023px) 240px, 400px"
            alt="Instant tea serve"
            fetchPriority="high"
          />
        }
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          className={s.stats}
          items={[
            { value: "30 sec", label: "Preparation time" },
            { value: "1 g", label: "One sachet, one cup" },
            { value: "8 oz", label: "Per serving" },
            { value: "18 months", label: "Shelf life" },
            {
              value: "No brewing",
              label: "No tea bags, no steeping, no leaves",
            },
            { value: "3 kcal", label: "Per cup, no sugar" },
          ]}
        />
      </Section>

      <Section
        className={styles.menu}
        title={
          <>
            Ready for
            <br /> your menu
          </>
        }
        side="One sachet, many serves: fruit teas, jugs for the table, iced tea and hot pots."
        label="Ready for your menu"
      >
        <Tiles items={serves} />
        <Kit
          href={assets.marketingKit}
          text="Menu photos, delivery-app formats, descriptions in English and Arabic."
        />
      </Section>

      <Section title="How to prepare" label="How to prepare">
        <Steps
          className={s.steps}
          items={[
            { label: "Hot water", value: "200 ml" },
            { label: "Sachet", value: "1 g" },
            { label: "Stir", value: "10 sec" },
            {
              label: "Serve",
              value: <span className={s.small}>Hot or iced</span>,
            },
            { label: "Cup", value: "8 oz", dark: true },
          ]}
        />
        <p className={cx(styles.side, styles.desktopOnly)}>
          Pour 200 ml of hot water over one sachet and stir. For iced tea,
          dissolve in a little hot water and pour over ice. Add fruit, herbs or
          syrup for a signature tea.
        </p>
      </Section>

      <Section className={s.gap16} title="Three teas" label="Three teas">
        <div className={s.teaList}>
          <div className={s.teas}>
            {teas.map((tea) => (
              <div key={tea.name} className={s.tea}>
                <div className={s.teaImage}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    {...productImage(SLUG, tea.image, [500, 1000])}
                    width={1000}
                    height={813}
                    sizes="(max-width: 1023px) 150px, 480px"
                    alt={`${tea.name} instant tea pack`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className={s.teaCopy}>
                  <span className={s.teaName}>{tea.name}</span>
                  <span className={s.teaText}>{tea.text}</span>
                </div>
              </div>
            ))}
          </div>
          <RndBand
            name="Your own blend"
            text="Our lab develops a tea for your menu or your label."
          />
        </div>
      </Section>

      <Inside
        sets={nutrition}
        side={
          <>
            <Info
              title="One ingredient"
              text="Instant black tea. No sugar, no sweeteners, no colours."
              mobile={
                <>
                  <b style={{ color: "#2F4A2A" }}>One ingredient:</b> instant
                  black tea.
                </>
              }
              background="#EEF4E9"
              titleColor="#2F4A2A"
              textColor="#2A3A2C"
            />
            <Shelf
              value="18 months"
              text="Store in a cool, dry place below 25 °C, away from direct sunlight."
              mobileText="Below 25 °C, dry place, no direct sun."
              certifications="HACCP · ISO 22000:2018 · Halal · Made in the UAE"
              specHref={assets.specification}
            />
          </>
        }
      />

      <Faq productName={product.name} items={faq} />
    </main>
  );
}
