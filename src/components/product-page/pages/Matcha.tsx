import type { CSSProperties } from "react";
import {
  Faq,
  Flavours,
  Hero,
  Info,
  Inside,
  Kit,
  Section,
  Shelf,
  Stats,
  Steps,
  Tiles,
  productImage,
  productPageStyles as styles,
  type NutritionSet,
} from "../blocks";
import type { ProductPageProps } from "../types";

/**
 * Matcha — the reference build of the product-page redesign
 * ("Matcha · страница продукта целиком", desktop 1440 / mobile 390).
 * Every other product page follows this file's shape.
 */

const SLUG = "matcha";

const nutrition: NutritionSet[] = [
  {
    name: "Mango Coconut",
    caption: "Per serving 20 g",
    mobileCaption: "Mango Coconut · per serving 20 g",
    rows: [
      { label: "Calories", value: "90 kcal" },
      { label: "Total fat", value: "3.7 g", dv: "5%" },
      { label: "Saturated fat", value: "3.0 g", dv: "13%" },
      { label: "Sodium", value: "6 mg", dv: "0.25%" },
      { label: "Total carbohydrates", value: "13.2 g", dv: "4%" },
      { label: "Dietary fibre", value: "0.8 g", dv: "3%" },
      { label: "Total sugar", value: "9.3 g", dv: "10%" },
      { label: "Added sugar", value: "7.2 g", dv: "14.4%" },
      { label: "Protein", value: "0.9 g", dv: "2%", desktopOnly: true },
    ],
    note: "Base powder only. Daily value based on a 2,000-calorie diet.",
  },
];

const faq = [
  { q: "Does it need cold storage?", a: "No. Keep it closed in a dry place below 25 °C. It keeps 18 months." },
  { q: "Will it clump in the steam wand at peak hours?", a: "No. The powder dissolves straight into milk, with no sifting and no lumps." },
  { q: "Do I need a bowl and whisk?", a: "No. A steam wand or a shaker is enough, so any barista can make it." },
  { q: "How many cups from one pouch?", a: "25 cups of 8 oz from a 500 g pouch, 20 g per cup." },
  {
    q: "Will the colour and taste be the same in every outlet?",
    a: "Yes. Each cup gets the same 20 g, so the drink looks and tastes the same across a franchise.",
  },
  { q: "Can I use it in vending machines?", a: "Yes. Ask your distributor for the vending dosage." },
  {
    q: "Does it contain milk?",
    a: "Yes, it contains milk protein. Plant milk works for the drink, but the base itself is not dairy-free.",
  },
  { q: "Is it Halal?", a: "Yes. Produced in the UAE under HACCP and ISO 22000:2018, Halal certified." },
  {
    q: "Where can I buy it in my country?",
    a: "Through our distributors in 17 markets. Find yours on the Distributors page.",
  },
];

export function MatchaPage({ product, assets }: ProductPageProps) {
  const hero = productImage(SLUG, "hero", [600, 1002]);
  const serves = Array.from({ length: 10 }, (_, i) => ({
    ...productImage(SLUG, `serve-${i + 1}`, [640, 1000]),
    alt: "Matcha serve",
  }));

  return (
    <main
      className={styles.page}
      style={
        {
          "--pp-bg": "#F6F4F0",
          "--pp-hero-bg": "#7DBB83",
          "--pp-hero-lead": "#18301B",
        } as CSSProperties
      }
    >
      <Hero
        productName={product.name}
        title="Matcha"
        lead={{
          desktop:
            "Matcha latte for cafés and franchises. Natural matcha with added vitamins: steam with milk and serve in 30 seconds, no whisk needed.",
          mobile: "Natural matcha with added vitamins. Steam with milk and serve in 30 seconds.",
        }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img {...hero} sizes="(max-width: 1023px) 240px, 400px" alt="Matcha latte" fetchPriority="high" />
        }
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          items={[
            { value: "30 sec", label: "Preparation time" },
            { value: "25 cups", label: "From one 500 g pouch" },
            { value: "8 oz", label: "Per serving" },
            { value: "18 months", label: "Shelf life" },
            { value: "No whisk", label: "No bowl, sifter or chasen" },
            { value: "Hot or iced", label: "Steam wand or shaker" },
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
        side="One base, ten serves. Cream, chocolate, caramel and fruit turn the same cup into a signature drink."
        label="Ready for your menu"
      >
        <Tiles items={serves} />
        <Kit href={assets.marketingKit} text="Menu photos, delivery-app formats, descriptions in English and Arabic." />
      </Section>

      <Section title="How to prepare" label="How to prepare">
        <Steps
          items={[
            { label: "Milk", value: "200 ml" },
            { label: "Base", value: "20 g" },
            { label: "Steam", value: "65 °C" },
            { label: "Froth", value: "Creamy" },
            { label: "Cup", value: "8 oz", dark: true },
          ]}
        />
        <p className={`${styles.side} ${styles.desktopOnly}`}>
          Hot: steam 20 g with 200 ml of milk to 65 °C. Iced: shake 20 g with 150 ml of cold milk and pour over 100 g of
          ice. Any milk works, including plant milk.
        </p>
        <p className={`${styles.side} ${styles.mobileOnly}`}>Iced: 20 g + 150 ml cold milk, shake, pour over 100 g ice.</p>
      </Section>

      <Section title="Eleven flavours" label="Flavours">
        <Flavours
          items={[
            { name: "Classic", color: "#8CC08A" },
            { name: "Pure", color: "#A9CF8E" },
            { name: "Mango Coconut", color: "#F2C46A" },
            { name: "Anchan Blueberry", color: "#8FA6E0" },
            { name: "Pink", color: "#F1A9C1" },
            { name: "Raspberry", color: "#E77C93" },
            { name: "Strawberry", color: "#F09A9A" },
            { name: "Purple Yum Ube", color: "#B39AD6" },
            { name: "Hojicha", color: "#B98B66" },
            { name: "Pecan Kumquat", color: "#E3A869" },
            { name: "No Added Sugar", color: "#DDE8D5" },
          ]}
        />
      </Section>

      <Inside
        sets={nutrition}
        side={
          <>
            <Info
              title="With added vitamins"
              text="Vitamins C, D, B6, B12, folate and zinc in every cup."
              mobile={
                <>
                  <b style={{ color: "#1E5A27" }}>Added vitamins:</b> C, D, B6, B12, folate, zinc.
                </>
              }
              background="#E4F1E2"
              titleColor="#1E5A27"
              textColor="#2A3A2C"
            />
            <Info
              title="Allergens"
              text="Contains milk protein."
              mobile={
                <>
                  <b style={{ color: "#A10E13" }}>Allergens:</b> contains milk protein.
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
