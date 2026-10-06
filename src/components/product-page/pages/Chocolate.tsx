import type { CSSProperties } from "react";
import {
  Faq,
  FlavourEnquiryLink,
  Hero,
  Info,
  Inside,
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
import local from "./Chocolate.module.css";

/**
 * Hot chocolate ("Hot Chocolate · страница продукта", desktop 1440 / mobile 390).
 * Matcha's shape; the menu (title + kit beside three tiles) and the
 * three-chocolates cards are local because their layout differs.
 */

const SLUG = "chocolate";

const nutrition: NutritionSet[] = [
  {
    name: "Hot Chocolate",
    caption: "Per serving 35 g · 14 servings per pack",
    mobileCaption: "Hot Chocolate · per serving 35 g",
    rows: [
      { label: "Calories", value: "129 kcal" },
      { label: "Total fat", value: "1.2 g", dv: "1.7%" },
      { label: "Saturated fat", value: "0.75 g", dv: "3.1%" },
      { label: "Sodium", value: "5 mg", dv: "0.2%" },
      { label: "Total carbohydrates", value: "30.1 g", dv: "9.7%" },
      { label: "Dietary fibre", value: "1.9 g", dv: "0.7%" },
      { label: "Total sugar", value: "25 g", dv: "27.7%" },
      { label: "Protein", value: "1.5 g", dv: "3%" },
      { label: "Calcium", value: "9 mg", dv: "0.7%", desktopOnly: true },
    ],
    note: "Base powder only. Daily value based on a 2,000-calorie diet.",
  },
];

const chocolates = [
  { name: "Hot Chocolate", text: "Classic rich cocoa, smooth and sweet", color: "#8A5A44" },
  { name: "Hot Chocolate Pudding", text: "Thick, spoonable, dessert-style", color: "#5E3A2C" },
  { name: "Hot Chocolate No Sugar", text: "The same cocoa taste, no added sugar", color: "#B89282" },
];

const faq = [
  {
    q: "Can I use it in vending machines?",
    a: "Yes. The powder flows freely and does not clump in hoppers. Ask your distributor for the vending dosage.",
  },
  { q: "Will the cocoa separate in the cup?", a: "No. It dissolves fully when steamed with milk and stays smooth to the last sip." },
  {
    q: "Do I need milk for a rich taste?",
    a: "Milk gives the creamiest cup. With hot water it is lighter, closer to a classic cocoa.",
  },
  { q: "How many cups from one pouch?", a: "14 cups of 8 oz from a 500 g pouch, 35 g per cup." },
  { q: "Can I serve it iced?", a: "Yes. Shake 35 g with cold milk and pour over ice." },
  { q: "Is there a sugar-free version?", a: "Yes, Hot Chocolate No Sugar." },
  { q: "Does it work with plant milk?", a: "Yes. Oat and almond milk both steam well with it." },
  { q: "Is it Halal?", a: "Yes. Produced in the UAE under HACCP and ISO 22000:2018, Halal certified." },
  {
    q: "Where can I buy it in my country?",
    a: "Through our distributors in 17 markets. Find yours on the Distributors page.",
  },
];

export function ChocolatePage({ product, headline, assets }: ProductPageProps) {
  const hero = productImage(SLUG, "hero", [600, 1000]);
  const serves = [
    { ...hero, alt: "Hot chocolate serve" },
    { ...productImage(SLUG, "serve-2", [640, 997]), alt: "Hot chocolate serve" },
    { ...productImage(SLUG, "serve-3", [640, 982]), alt: "Hot chocolate serve" },
  ];

  return (
    <main
      className={styles.page}
      style={
        {
          "--pp-bg": "#F6F4F0",
          "--pp-hero-bg": "#4E3630",
          "--pp-hero-title": "#F6F1EC",
          "--pp-hero-lead": "#E6D8CF",
        } as CSSProperties
      }
    >
      <Hero
        className={local.hero}
        productName={product.name}
        title="Hot chocolate"
        headline={headline}
        lead={{
          desktop:
            "Rich, creamy hot chocolate for cafés, hotels and vending. Steam with milk and serve in 40 seconds, hot or iced.",
          mobile: "Rich, creamy and ready in 40 seconds, hot or iced.",
        }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img {...hero} sizes="(max-width: 1023px) 240px, 400px" alt="Hot chocolate" fetchPriority="high" />
        }
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          className={local.stats}
          items={[
            { value: "40 sec", label: "Preparation time" },
            { value: "14 cups", label: "From one 500 g pouch" },
            { value: "8 oz", label: "Per serving" },
            { value: "18 months", label: "Shelf life" },
            { value: "Natural taste", label: "No sweeteners, no artificial colours" },
            { value: "Hot or iced", label: "Steam wand or shaker" },
          ]}
        />
      </Section>

      <section className={local.menu} aria-label="Ready for your menu">
        <div className={local.menuHead}>
          <h2 className={cx(styles.title, local.menuTitle)}>
            Ready for
            <br /> your menu
          </h2>
          {assets.marketingKit && (
            <div className={local.kit}>
              <span className={local.kitTitle}>Marketing kit</span>
              <span className={local.kitText}>Menu photos, delivery-app formats, descriptions in English and Arabic.</span>
              <a href={assets.marketingKit} className={cx(styles.button, styles.red, local.kitButton)} download>
                <span className={styles.desktopOnly}>Download kit</span>
                <span className={styles.mobileOnly}>Download marketing kit</span>
              </a>
            </div>
          )}
        </div>
        <div className={local.tiles}>
          {serves.map((tile, i) => (
            <div key={i} className={local.tile}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tile.src}
                srcSet={tile.srcSet}
                sizes="(max-width: 1023px) 110px, 260px"
                alt={tile.alt}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </section>

      <Section title="How to prepare" label="How to prepare">
        <Steps
          items={[
            { label: "Milk", value: "200 ml" },
            { label: "Base", value: "35 g" },
            { label: "Steam", value: "65 °C" },
            { label: "Froth", value: "Creamy" },
            { label: "Cup", value: "8 oz", dark: true },
          ]}
        />
        <p className={cx(styles.side, styles.desktopOnly)}>
          Mix the base with milk, steam to 65 °C and froth. Any milk works, including plant milk.
        </p>
      </Section>

      <Section className={local.flavoursSection} title="Three chocolates" label="Flavours">
        <div className={local.flavours}>
          {chocolates.map((item) => (
            <div key={item.name} className={local.flavour} style={{ background: item.color }}>
              <span className={local.flavourName}>{item.name}</span>
              <span className={local.flavourText}>{item.text}</span>
            </div>
          ))}
          <div className={cx(local.own, styles.desktopOnly)}>
            <span className={local.ownTitle}>Your own flavour</span>
            <span className={local.ownText}>Orange, mint, salted caramel: our lab develops it for your menu.</span>
            <FlavourEnquiryLink />
          </div>
        </div>
        <FlavourEnquiryLink className={cx(styles.textLink, styles.mobileOnly, local.ownLink)}>
          Your own flavour: talk to R&amp;D →
        </FlavourEnquiryLink>
      </Section>

      <Inside
        sets={nutrition}
        side={
          <>
            <Info
              title="No milk powder inside"
              text="Make it with plant milk for dairy-free guests."
              mobile={
                <>
                  <b style={{ color: "#5E3A2C" }}>No milk powder inside:</b> use plant milk for dairy-free guests.
                </>
              }
              background="#F1E7E1"
              titleColor="#5E3A2C"
              textColor="#3A2E2A"
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
