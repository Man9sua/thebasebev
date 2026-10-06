import { Fragment, type CSSProperties } from "react";
import {
  Faq,
  FlavourEnquiryLink,
  Hero,
  Inside,
  Kit,
  Responsive,
  Section,
  Shelf,
  Stats,
  Steps,
  cx,
  productImage,
  productPageStyles as styles,
  type NutritionSet,
} from "../blocks";
import type { ProductPageProps } from "../types";
import local from "./Cordial.module.css";

/**
 * Cordial ("Cordial · страница продукта", desktop 1440 / mobile 390).
 * Matcha's shape plus the mock's extra "Sweet and sour mix" formula band;
 * on the phone that band becomes a card under the flavours.
 */

const SLUG = "cordial";

const nutrition: NutritionSet[] = [
  {
    name: "Classic Mojito",
    caption: "Per serving 15 g",
    mobileCaption: "Classic Mojito · per serving 15 g",
    rows: [
      { label: "Calories", value: "49.5 kcal" },
      { label: "Total fat", value: "0 g", dv: "0%" },
      { label: "Sodium", value: "32.3 mg", dv: "1%" },
      { label: "Total carbohydrates", value: "12.8 g", dv: "4%" },
      { label: "Dietary fibre", value: "<0.5 g", dv: "0%" },
      { label: "Total sugar", value: "12.7 g", dv: "14%" },
      { label: "Added sugar", value: "12.6 g" },
      { label: "Protein", value: "<0.1 g", dv: "0%" },
    ],
    note: "Base powder only. Daily value based on a 2,000-calorie diet.",
  },
];

const flavours = [
  { name: "Classic Mojito", text: "Lime and fresh mint", color: "#B9D88C" },
  { name: "Red Rose Lemon", text: "Rose petals and bright lemon", color: "#E89AA6" },
  { name: "Sweet and Sour Mix", text: "Neutral base for your own purée or syrup", color: "#EBD86A" },
];

const mix = [
  { label: <Responsive desktop="Sweet and sour mix" mobile="Base" />, value: "15 g", base: true },
  { label: "Purée or syrup", value: "20–25 ml" },
  { label: "Sparkling water", value: "150 ml" },
  { label: "Ice", value: "150 g" },
];

const faq = [
  {
    q: "Why switch from house-made syrups?",
    a: "No prep hours and no stove. Every cup has the same sweetness, so the bar team only builds the drink.",
  },
  { q: "Does it need a fridge after opening?", a: "No. Close the pouch and keep it in a dry place below 25 °C." },
  {
    q: "Can I use it in a draft cocktail system?",
    a: "Yes. Dissolve it in water at the same ratio and fill the keg. Check the dilution with your equipment supplier.",
  },
  { q: "How many cups from one pouch?", a: "33 cups of 12 oz from a 500 g pouch." },
  { q: "Can I use still water?", a: "Yes. Still water makes a lemonade-style drink, sparkling water a soda." },
  { q: "Does it work in alcohol-free mocktails?", a: "Yes, it is built for that. Mix with soda, tonic or iced tea." },
  { q: "Is it Halal?", a: "Yes. Produced in the UAE under HACCP and ISO 22000:2018, Halal certified." },
  {
    q: "Are there more flavours?",
    a: "Yes. Ask your distributor for the full cordial range or a flavour made for your menu.",
  },
  {
    q: "Where can I buy it in my country?",
    a: "Through our distributors in 17 markets. Find yours on the Distributors page.",
  },
];

export function CordialPage({ product, headline, assets }: ProductPageProps) {
  const hero = productImage(SLUG, "hero", [600, 1000]);
  const serves = [
    hero,
    ...Array.from({ length: 11 }, (_, i) => productImage(SLUG, `serve-${i + 2}`, [640, 1000])),
  ];

  return (
    <main
      className={styles.page}
      style={
        {
          "--pp-bg": "#F6F4F0",
          "--pp-hero-bg": "#93A6C0",
          "--pp-hero-lead": "#1E2633",
        } as CSSProperties
      }
    >
      <Hero
        productName={product.name}
        title="Cordial"
        headline={headline}
        lead={{
          desktop:
            "Mojitos, lemonades and mocktails without fresh fruit or house syrups. Add sparkling water and ice, ready in 30 seconds.",
          mobile: "Mojitos and lemonades without fresh fruit or syrups. Ready in 30 seconds.",
        }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img {...hero} sizes="(max-width: 1023px) 240px, 400px" alt="Cordial mojito" fetchPriority="high" />
        }
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          items={[
            { value: "30 sec", label: "Preparation time" },
            { value: "33 cups", label: "From one 500 g pouch" },
            { value: "12 oz", label: "Per serving" },
            { value: "18 months", label: "Shelf life" },
            { value: "No prep", label: "No juicing, no muddling, no syrup cooking" },
            { value: "Room temp", label: "No fridge before opening" },
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
        side="One base, twelve serves. Fruit, herbs and spice turn the same cup into a signature drink."
        label="Ready for your menu"
      >
        <div className={local.grid}>
          <div className={cx(styles.tiles, local.tilesInner)}>
            {serves.map((tile, i) => (
              <div key={i} className={styles.tile}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.src}
                  srcSet={tile.srcSet}
                  sizes="(max-width: 1023px) 150px, calc((min(100vw, 1440px) - 192px) / 5)"
                  alt="Cordial serve"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
          <Kit
            className={local.kitCell}
            href={assets.marketingKit}
            text="Menu photos, delivery-app formats, descriptions in English and Arabic."
          />
        </div>
      </Section>

      <Section title="How to prepare" label="How to prepare">
        <Steps
          items={[
            { label: "Sparkling water", value: "150 ml" },
            { label: "Base", value: "15 g" },
            { label: "Stir", value: "10 sec" },
            { label: "Ice", value: "150 g" },
            { label: "Cup", value: "12 oz", dark: true },
          ]}
        />
        <p className={cx(styles.side, styles.desktopOnly)}>
          Mix the base with sparkling water, stir for 10 seconds and pour over ice.
        </p>
      </Section>

      <Section className={local.flavoursSection} title="Flavours" label="Flavours">
        <div className={local.flavours}>
          {flavours.map((item) => (
            <div key={item.name} className={local.flavour} style={{ background: item.color }}>
              <span className={local.flavourName}>{item.name}</span>
              <span className={local.flavourText}>{item.text}</span>
            </div>
          ))}
          <div className={cx(local.own, styles.desktopOnly)}>
            <span className={local.ownTitle}>Your own flavour</span>
            <span className={local.ownText}>Our lab develops a cordial for your menu.</span>
            <FlavourEnquiryLink />
          </div>
        </div>
      </Section>

      <section className={local.mix} aria-labelledby="cordial-mix-title">
        <div className={local.mixBand}>
          <div className={local.mixHead}>
            <h2 id="cordial-mix-title" className={cx(styles.title, local.mixTitle)}>
              Sweet and sour mix
            </h2>
            <p className={local.mixText}>
              <Responsive
                desktop="A neutral cordial base. Add any purée or syrup you already use, and it becomes your own lemonade or mojito."
                mobile="A neutral base. Add any purée or syrup and it becomes your own lemonade or mojito."
              />
            </p>
          </div>
          <div className={local.formula}>
            {mix.map((part, i) => (
              <Fragment key={part.value}>
                {i > 0 && (
                  <span className={cx(local.plus, styles.desktopOnly)} aria-hidden="true">
                    +
                  </span>
                )}
                <div className={cx(local.part, part.base && local.partBase)}>
                  <span className={local.partLabel}>{part.label}</span>
                  <span className={local.partValue}>{part.value}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
        <FlavourEnquiryLink className={cx(styles.textLink, styles.mobileOnly)}>
          Your own flavour: talk to R&amp;D →
        </FlavourEnquiryLink>
      </section>

      <Inside
        sets={nutrition}
        side={
          <Shelf
            value="18 months"
            text="Store in a cool, dry place below 25 °C, away from direct sunlight."
            mobileText="Below 25 °C, dry place, no direct sun."
            certifications="HACCP · ISO 22000:2018 · Halal · Made in the UAE"
            specHref={assets.specification}
          />
        }
      />

      <Faq productName={product.name} items={faq} line="Ready to try it at your bar?" />
    </main>
  );
}
