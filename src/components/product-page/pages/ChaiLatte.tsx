import type { CSSProperties } from "react";
import {
  Faq,
  FlavourEnquiryLink,
  Hero,
  Info,
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
import local from "./ChaiLatte.module.css";

/**
 * Chai latte ("Chai latte · страница продукта целиком", desktop 1440 / mobile 390).
 * Differs from matcha in the menu (title and kit card beside two photos), the
 * three-column flavour cards with copy, no vitamins card and a 56px phone title.
 */

const SLUG = "chai-latte";
const KIT_TEXT = "Menu photos, delivery-app formats, descriptions in English and Arabic.";

/* Only the Karak label is in hand; the Masala tab follows when its label arrives. */
const nutrition: NutritionSet[] = [
  {
    name: "Karak",
    caption: "Per serving 25 g · 20 servings per pack",
    mobileCaption: "Karak · per serving 25 g",
    rows: [
      { label: "Calories", value: "109 kcal" },
      { label: "Total fat", value: "4 g", dv: "6%" },
      { label: "Saturated fat", value: "2.9 g", dv: "14%" },
      { label: "Cholesterol", value: "8 mg", dv: "3%" },
      { label: "Sodium", value: "33.7 mg", dv: "1%" },
      { label: "Total carbohydrates", value: "16.1 g", dv: "5%" },
      { label: "Total sugar", value: "13.1 g" },
      { label: "Added sugar", value: "9 g", dv: "18%" },
      { label: "Protein", value: "2.63 g", dv: "5%", desktopOnly: true },
      { label: "Calcium", value: "81.1 mg", dv: "6.2%", desktopOnly: true },
    ],
    note: "Base powder only. Daily value based on a 2,000-calorie diet.",
  },
];

const flavours = [
  { name: "Karak", text: "Strong black tea, milk and cardamom", color: "#C9A07A" },
  { name: "Masala", text: "Warm spice blend, rich and bold", color: "#A9785A" },
];

const faq = [
  {
    q: "What equipment do I need?",
    a: "A steam wand or a hot water dispenser. The base dissolves straight away, so any barista can serve it at volume.",
  },
  {
    q: "How is it different from a liquid chai concentrate?",
    a: "It needs no fridge, keeps 18 months and you dose it by the gram, so every cup tastes the same.",
  },
  {
    q: "Is the spice taste strong enough for specialty cafés?",
    a: "Karak is built on black tea and cardamom. Taste it against your current chai with a free sample.",
  },
  { q: "How many cups from one pouch?", a: "20 cups of 8 oz from a 500 g pouch." },
  { q: "Can I make it with water only?", a: "Yes. Mix 25 g with 150 ml of hot water and stir. Milk already is in the base." },
  { q: "Can I serve it iced?", a: "Yes. Dissolve in a little hot water, add cold milk and pour over ice." },
  {
    q: "Does it contain milk?",
    a: "Yes, it contains whole milk powder. It is not suitable for guests with a milk allergy.",
  },
  { q: "Is it Halal?", a: "Yes. Produced in the UAE under HACCP and ISO 22000:2018, Halal certified." },
  {
    q: "Where can I buy it in my country?",
    a: "Through our distributors in 17 markets. Find yours on the Distributors page.",
  },
];

export function ChaiLattePage({ product, headline, assets }: ProductPageProps) {
  const hero = productImage(SLUG, "hero", [600, 1000]);
  // The first menu photo is the hero shot.
  const serves = [hero, productImage(SLUG, "serve-2", [640, 1000])];

  return (
    <main
      className={styles.page}
      style={
        {
          "--pp-bg": "#F6F4F0",
          "--pp-hero-bg": "#C9AE9E",
          "--pp-hero-lead": "#2E241E",
        } as CSSProperties
      }
    >
      <Hero
        className={local.hero}
        productName={product.name}
        title="Chai latte"
        headline={headline}
        lead={{
          desktop:
            "Karak and masala chai for cafés. Black tea, milk and spice in one base: steam with milk and serve in 30 seconds.",
          mobile: "Black tea, milk and spice in one base. Steam with milk and serve in 30 seconds.",
        }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img {...hero} sizes="(max-width: 1023px) 240px, 400px" alt="Chai latte" fetchPriority="high" />
        }
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          items={[
            { value: "30 sec", label: "Preparation time" },
            { value: "20 cups", label: "From one 500 g pouch" },
            { value: "8 oz", label: "Per serving" },
            { value: "18 months", label: "Shelf life" },
            { value: "No spices", label: "Black tea, milk and cardamom inside" },
            { value: "Room temp", label: "No fridge before opening" },
          ]}
        />
      </Section>

      <section className={cx(styles.section, local.menu)} aria-label="Ready for your menu">
        <div className={local.menuLead}>
          <h2 className={styles.title}>
            Ready for
            <br /> your menu
          </h2>
          {assets.marketingKit && (
            <div className={cx(local.kitCard, styles.desktopOnly)}>
              <span className={local.kitCardTitle}>Marketing kit</span>
              <span className={local.kitCardText}>{KIT_TEXT}</span>
              <a href={assets.marketingKit} className={cx(styles.button, styles.red, local.kitCardButton)} download>
                Download kit
              </a>
            </div>
          )}
        </div>
        {serves.map((tile, i) => (
          <div key={i} className={local.tile}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              {...tile}
              sizes="(max-width: 1023px) 171px, calc(340 * min(1px, 0.069444vw))"
              alt="Chai latte serve"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
        <Kit href={assets.marketingKit} className={cx(styles.mobileOnly, local.menuKit)} text={KIT_TEXT} />
      </section>

      <Section title="How to prepare" label="How to prepare">
        <Steps
          className={local.steps}
          items={[
            { label: "Milk", value: "150 ml" },
            { label: "Base", value: "25 g" },
            { label: "Steam", value: "65 °C" },
            { label: "Froth", value: "Creamy" },
            { label: "Cup", value: "8 oz", dark: true },
          ]}
        />
        <p className={`${styles.side} ${styles.desktopOnly}`}>
          Steam the base with milk to 65 °C and froth until creamy. Without a steam wand, mix with 150 ml of hot water and
          stir.
        </p>
      </Section>

      <Section title="Two flavours" label="Flavours">
        <div className={local.flavours}>
          {flavours.map((flavour) => (
            <div key={flavour.name} className={local.flavour} style={{ background: flavour.color }}>
              <span className={local.flavourName}>{flavour.name}</span>
              <span className={local.flavourText}>{flavour.text}</span>
            </div>
          ))}
          <div className={cx(local.own, styles.desktopOnly)}>
            <span className={local.ownTitle}>Your own flavour</span>
            <span className={local.ownText}>Our lab develops a chai for your menu.</span>
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
          <>
            <Info
              title="Allergens"
              text="Contains milk."
              mobile={
                <>
                  <b style={{ color: "#A10E13" }}>Allergens:</b> contains milk.
                </>
              }
              background="#FBE7E7"
              titleColor="#A10E13"
              textColor="#3A2A2A"
            />
            <Shelf
              value="18 months"
              text="Store in a cool, dry place below 25 °C, away from direct sunlight."
              mobileText="Below 25 °C, dry place, no direct sun."
              certifications="HACCP · ISO 22000:2018 · Halal · EAC · Made in the UAE"
              specHref={assets.specification}
            />
          </>
        }
      />

      <Faq productName={product.name} items={faq} />
    </main>
  );
}
