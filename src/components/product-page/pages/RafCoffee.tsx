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
import local from "./RafCoffee.module.css";

/**
 * Raf coffee ("Raf coffee · страница продукта целиком", desktop 1440 / mobile 390).
 * Closest to the matcha baseline: taller flavour cards, no vitamins card, a
 * 56px phone title.
 */

const SLUG = "raf-coffee";

/* The larger rendition is capped at the source width (serve-2 is 975 wide, serve-3 982). */
const SERVE_MAX: Record<number, number> = { 2: 975, 3: 982 };

/* Only the Raspberry Coconut label is in hand; Vanilla and Salted Caramel tabs follow when theirs arrive. */
const nutrition: NutritionSet[] = [
  {
    name: "Raspberry Coconut",
    caption: "Per serving 20 g · 25 servings per pack",
    mobileCaption: "Raspberry Coconut · per serving 20 g",
    rows: [
      { label: "Calories", value: "89 kcal" },
      { label: "Total fat", value: "3.1 g", dv: "5%" },
      { label: "Saturated fat", value: "0.4 g", dv: "1%" },
      { label: "Sodium", value: "4 mg", dv: "0.2%" },
      { label: "Total carbohydrates", value: "14.9 g", dv: "5%" },
      { label: "Total sugar", value: "12 g", dv: "12%" },
      { label: "Added sugar", value: "10 g" },
      { label: "Protein", value: "<1 g", dv: "0.2%" },
    ],
    note: "Base powder only. Daily value based on a 2,000-calorie diet.",
  },
];

const faq = [
  {
    q: "Do I need fresh cream?",
    a: "No. The base replaces cream. Add milk, steam it and you get the thick, velvety raf texture without perishable cream in stock.",
  },
  {
    q: "Will it slow down the morning rush?",
    a: "No. One shot, one scoop, one steam: about a minute per cup, the same as a latte.",
  },
  {
    q: "Does the foam hold for delivery?",
    a: "Yes, the foam stays stable on the way to the guest. Use a lid with a small vent.",
  },
  { q: "How many cups from one pouch?", a: "25 cups of 8 oz from a 500 g pouch." },
  { q: "Can I use plant or lactose-free milk?", a: "Yes. Oat, almond and lactose-free milk all steam well with the base." },
  { q: "Capsule or soluble espresso?", a: "Both work. 20 ml of espresso from any source." },
  { q: "Does it contain milk?", a: "Yes, it contains milk protein." },
  { q: "Is it Halal?", a: "Yes. Produced in the UAE under HACCP and ISO 22000:2018, Halal certified." },
  {
    q: "Where can I buy it in my country?",
    a: "Through our distributors in 17 markets. Find yours on the Distributors page.",
  },
];

export function RafCoffeePage({ product, headline, assets }: ProductPageProps) {
  const hero = productImage(SLUG, "hero", [600, 1000]);
  // The first menu photo is the hero shot.
  const serves = [
    { ...hero, alt: "Raf coffee serve" },
    ...Array.from({ length: 9 }, (_, i) => ({
      ...productImage(SLUG, `serve-${i + 2}`, [640, SERVE_MAX[i + 2] ?? 1000]),
      alt: "Raf coffee serve",
    })),
  ];

  return (
    <main
      className={styles.page}
      style={
        {
          "--pp-bg": "#F6F4F0",
          "--pp-hero-bg": "#D6C6A8",
          "--pp-hero-lead": "#2E261A",
        } as CSSProperties
      }
    >
      <Hero
        className={local.hero}
        productName={product.name}
        title="Raf coffee"
        headline={headline}
        lead={{
          desktop:
            "The velvety, ice-cream-like raf without fresh cream. Steam the base with milk and an espresso shot, ready in a minute.",
          mobile: "Velvety raf without fresh cream. Steam with milk and espresso, ready in a minute.",
        }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img {...hero} sizes="(max-width: 1023px) 240px, 400px" alt="Raf coffee" fetchPriority="high" />
        }
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          items={[
            { value: "1 min", label: "Preparation time" },
            { value: "25 cups", label: "From one 500 g pouch" },
            { value: "8 oz", label: "Per serving" },
            { value: "18 months", label: "Shelf life" },
            { value: "No cream", label: "Replaces fresh cream" },
            { value: "Any milk", label: "Dairy, plant or lactose-free" },
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
        side="One base, ten serves. Cream, cookies, nuts and caramel turn the same cup into a signature drink."
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
            { label: "Espresso", value: "20 ml" },
            { label: "Steam", value: "Creamy" },
            { label: "Cup", value: "8 oz", dark: true },
          ]}
        />
        <p className={`${styles.side} ${styles.desktopOnly}`}>
          Mix the base with milk and espresso, steam to 65 °C until creamy. Finish with chocolate, berries or spice.
        </p>
      </Section>

      <Section title="Seven flavours" label="Flavours">
        <Flavours
          className={local.flavours}
          items={[
            { name: "Vanilla", color: "#F1E3C2" },
            { name: "Salted Caramel", color: "#D9A86A" },
            { name: "Banana Ice Cream", color: "#F2DA7A" },
            { name: "Pineapple Caramel", color: "#E9B95A" },
            { name: "Ptichye Moloko", color: "#EDE4D6" },
            { name: "Raspberry Coconut", color: "#EBA2B2" },
            { name: "Spanish Peach", color: "#F2B48A" },
          ]}
        />
      </Section>

      <Inside
        sets={nutrition}
        side={
          <>
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
