import type { CSSProperties } from "react";
import {
  Faq,
  FlavourEnquiryLink,
  Hero,
  Inside,
  Kit,
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
import local from "./IcedTea.module.css";

/**
 * Iced tea ("Iced tea · страница продукта целиком", desktop 1440 / mobile 390).
 * Differs from matcha in the menu grid (the kit is its 10th cell), the
 * five-column flavour cards with copy, and an Inside column with the shelf
 * card only.
 */

const SLUG = "iced-tea";
const KIT_TEXT = "Menu photos, delivery-app formats, descriptions in English and Arabic.";

/* Only the Peach label is in hand; Lemon, Mango and Green tabs follow when theirs arrive. */
const nutrition: NutritionSet[] = [
  {
    name: "Peach",
    caption: "Per serving 20 g · 25 servings per pack",
    mobileCaption: "Peach · per serving 20 g",
    rows: [
      { label: "Calories", value: "70.9 kcal" },
      { label: "Total fat", value: "0 g", dv: "0%" },
      { label: "Sodium", value: "33.4 mg", dv: "1.4%" },
      { label: "Total carbohydrates", value: "18.2 g", dv: "5.9%" },
      { label: "Dietary fibre", value: "<0.5 g", dv: "0%" },
      { label: "Total sugar", value: "17.7 g", dv: "19.7%" },
      { label: "Added sugar", value: "15 g" },
      { label: "Protein", value: "<0.2 g", dv: "0%", desktopOnly: true },
      { label: "Calcium", value: "<0.1 mg", dv: "0%", desktopOnly: true },
    ],
    note: "Base powder only. Daily value based on a 2,000-calorie diet.",
  },
];

const flavours = [
  { name: "Lemon", text: "Classic black tea with lemon", color: "#F2D64B" },
  { name: "Peach", text: "Soft, ripe and fragrant", color: "#F2A65A" },
  { name: "Mango", text: "Tropical and bright", color: "#F5B731" },
  { name: "Green", text: "Light green tea, clean finish", color: "#A9C46C" },
];

const faq = [
  {
    q: "Will it replace batch brewing?",
    a: "Yes. You make each cup to order, so there is no brewed tea left at the end of the day.",
  },
  { q: "Does it go cloudy over ice?", a: "No. It dissolves fully in cold water and stays clear in the cup." },
  {
    q: "Are the flavours natural?",
    a: "Peach uses nature-identical flavour, lemon comes from natural lemon extract. Full list in the specification.",
  },
  { q: "How many cups from one pouch?", a: "25 cups of 12 oz from a 500 g pouch." },
  { q: "Can I make it hot?", a: "Yes. Use 150 ml of hot water and skip the ice." },
  { q: "Can I use sparkling water?", a: "Yes. Dissolve the base in a little still water first, then top with soda." },
  { q: "Is it Halal?", a: "Yes. Produced in the UAE under HACCP and ISO 22000:2018, Halal certified." },
  { q: "Is there a no-sugar version?", a: "Yes, ask your distributor about the No Added Sugar base." },
  {
    q: "Where can I buy it in my country?",
    a: "Through our distributors in 17 markets. Find yours on the Distributors page.",
  },
];

export function IcedTeaPage({ product, headline, assets }: ProductPageProps) {
  const hero = productImage(SLUG, "hero", [600, 1000]);
  // The first menu photo is the hero shot.
  const serves = [hero, ...Array.from({ length: 8 }, (_, i) => productImage(SLUG, `serve-${i + 2}`, [640, 1000]))];

  return (
    <main
      className={styles.page}
      style={
        {
          "--pp-bg": "#F6F4F0",
          "--pp-hero-bg": "#D8BB62",
          "--pp-hero-lead": "#2E2A1E",
        } as CSSProperties
      }
    >
      <Hero
        productName={product.name}
        title="Iced tea"
        headline={headline}
        lead={{
          desktop:
            "Iced tea base for cafés. No brewing and no batch waste: add water and ice, and the cup is ready in 30 seconds.",
          mobile: "No brewing and no batch waste: add water and ice, ready in 30 seconds.",
        }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img {...hero} sizes="(max-width: 1023px) 240px, 400px" alt="Iced tea" fetchPriority="high" />
        }
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          items={[
            { value: "30 sec", label: "Preparation time" },
            { value: "25 cups", label: "From one 500 g pouch" },
            { value: "12 oz", label: "Per serving" },
            { value: "18 months", label: "Shelf life" },
            { value: "No brewing", label: "No tea leaves, no batch waste" },
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
        side="One base, nine serves. Rims, citrus, spice and herbs turn the same cup into a signature drink."
        label="Ready for your menu"
      >
        {/* The baseline photo grid, with the kit as its 10th cell on desktop. */}
        <div className={styles.tiles} style={{ "--cols": 5 } as CSSProperties}>
          {serves.map((tile, i) => (
            <div key={i} className={styles.tile}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                {...tile}
                sizes="(max-width: 1023px) 150px, calc((min(100vw, 1440px) - 192px) / 5)"
                alt="Iced tea serve"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
          {assets.marketingKit && (
            <div className={cx(local.kitCell, styles.desktopOnly)}>
              <span className={local.kitCellTitle}>Marketing kit</span>
              <span className={local.kitCellText}>{KIT_TEXT}</span>
              <a href={assets.marketingKit} className={cx(styles.button, styles.red, local.kitCellButton)} download>
                Download kit
              </a>
            </div>
          )}
        </div>
        <Kit href={assets.marketingKit} className={styles.mobileOnly} text={KIT_TEXT} />
      </Section>

      <Section title="How to prepare" label="How to prepare">
        <Steps
          className={local.steps}
          items={[
            { label: "Water", value: "150 ml" },
            { label: "Base", value: "20 g" },
            { label: "Stir", value: "10 sec" },
            { label: "Ice", value: "150 g" },
            { label: "Cup", value: "12 oz", dark: true },
          ]}
        />
        <p className={`${styles.side} ${styles.desktopOnly}`}>
          Dissolve the base in water, stir for 10 seconds, pour over ice. For a hot cup use hot water and skip the ice.
        </p>
      </Section>

      <Section title="Four flavours" label="Flavours">
        <div className={local.flavours}>
          {flavours.map((flavour) => (
            <div key={flavour.name} className={local.flavour} style={{ background: flavour.color }}>
              <span className={local.flavourName}>{flavour.name}</span>
              <span className={local.flavourText}>{flavour.text}</span>
            </div>
          ))}
          <div className={cx(local.own, styles.desktopOnly)}>
            <span className={local.ownTitle}>Your own flavour</span>
            <span className={local.ownText}>Our lab develops a flavour for your menu.</span>
            <FlavourEnquiryLink />
          </div>
        </div>
        <FlavourEnquiryLink className={cx(styles.textLink, styles.mobileOnly)}>
          Your own flavour: talk to R&amp;D →
        </FlavourEnquiryLink>
      </Section>

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

      <Faq productName={product.name} items={faq} />
    </main>
  );
}
