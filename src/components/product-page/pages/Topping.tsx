import type { CSSProperties } from "react";
import {
  Faq,
  Flavours,
  Hero,
  Info,
  Inside,
  Kit,
  Responsive,
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
import local from "./Topping.module.css";

/**
 * Toppings ("Topping · страница продукта", desktop 1440 / mobile 390).
 * Matcha's shape; Inside adds the "≈ 72 kcal per serve" card, which the
 * phone moves above the table.
 */

const SLUG = "topping";

const nutrition: NutritionSet[] = [
  {
    name: "Classic Cheese Cream",
    caption: "Per 100 g of dry base",
    mobileCaption: "Classic Cheese Cream · per 100 g dry base",
    rows: [
      { label: "Calories", value: "525 kcal" },
      { label: "Total fat", value: "34.7 g", dv: "49.6%" },
      { label: "Saturated fat", value: "31.6 g", dv: "131.6%" },
      { label: "Sodium", value: "450 mg", dv: "19.6%" },
      { label: "Total carbohydrates", value: "53.2 g", dv: "17.2%" },
      { label: "Dietary fibre", value: "4.9 g", dv: "1.6%" },
      { label: "Total sugar", value: "27.2 g", dv: "30.2%" },
      { label: "Added sugar", value: "14.6 g", dv: "29.2%" },
      { label: "Protein", value: "3 g", dv: "6%", desktopOnly: true },
    ],
    note: "Dry powder, before whipping. 100 g of base makes 450 g of topping.",
  },
];

const faq = [
  {
    q: "Will it clog a dispensing pump?",
    a: "No. Once whipped it holds its shape and pipes cleanly from a bag or a whipped-cream dispenser.",
  },
  {
    q: "Does it hold on hot drinks?",
    a: "Yes. It stays on top of a hot latte or chocolate instead of melting straight in.",
  },
  {
    q: "Can I freeze it for desserts?",
    a: "Yes, whipped topping can be frozen for cold desserts. Thaw in the fridge before serving.",
  },
  { q: "How many serves from one pouch?", a: "About 60 serves of 50 g from a 500 g pouch." },
  { q: "How long does whipped topping keep?", a: "Keep it covered in the fridge and use it within the shift." },
  { q: "Can I use plant milk?", a: "Yes. Oat and almond milk whip well with the base." },
  { q: "Does it contain milk?", a: "Yes, it contains milk protein." },
  { q: "Is it Halal?", a: "Yes. Produced in the UAE under HACCP and ISO 22000:2018, Halal certified." },
  {
    q: "Where can I buy it in my country?",
    a: "Through our distributors in 17 markets. Find yours on the Distributors page.",
  },
];

export function ToppingPage({ product, headline, assets }: ProductPageProps) {
  const hero = productImage(SLUG, "hero", [600, 1000]);
  const serves = [
    { ...hero, alt: "Topping serve" },
    ...Array.from({ length: 5 }, (_, i) => ({
      ...productImage(SLUG, `serve-${i + 2}`, [640, 1000]),
      alt: "Topping serve",
    })),
  ];

  return (
    <main
      className={styles.page}
      style={
        {
          "--pp-bg": "#F6F4F0",
          "--pp-hero-bg": "#E6E1D3",
          "--pp-hero-lead": "#2E2C24",
        } as CSSProperties
      }
    >
      <Hero
        className={local.hero}
        productName={product.name}
        title="Toppings"
        headline={headline}
        lead={{
          desktop:
            "Whipped toppings and cheese foam without fresh cream. Whisk the base with milk and you have 450 g of stable topping in a minute.",
          mobile: "Whipped topping and cheese foam without fresh cream. 450 g of topping in a minute.",
        }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img {...hero} sizes="(max-width: 1023px) 240px, 400px" alt="Whipped topping" fetchPriority="high" />
        }
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          className={local.stats}
          items={[
            { value: "1 min", label: "Preparation time" },
            { value: "60 serves", label: "From one 500 g pouch" },
            { value: "50 g", label: "Per serving" },
            { value: "18 months", label: "Shelf life" },
            { value: "No cream", label: "No fresh cream, no cream chargers" },
            { value: "Holds shape", label: "On hot and iced drinks" },
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
        side="One topping, every drink: lattes, iced coffee, chocolate, matcha and milkshakes."
        label="Ready for your menu"
      >
        <Tiles items={serves} columns={6} />
        <Kit href={assets.marketingKit} text="Menu photos, delivery-app formats, descriptions in English and Arabic." />
      </Section>

      <Section title="How to prepare" label="How to prepare">
        <Steps
          items={[
            { label: "Milk", value: "200 ml" },
            { label: "Base", value: "100 g" },
            { label: "Whisk", value: <span className={local.whisk}>20–30 sec</span> },
            { label: "Yield", value: "450 g", dark: true },
            { label: "Serve", value: "50 g", dark: true },
          ]}
        />
        <p className={cx(styles.side, styles.desktopOnly)}>
          Whisk 100 g of base with 200 ml of cold milk for 20–30 seconds until smooth and creamy. You get 450 g of
          topping, about nine serves of 50 g.
        </p>
      </Section>

      <Section title="Four flavours" label="Flavours">
        <Flavours
          className={local.flavours}
          columns={5}
          items={[
            { name: "Classic Cheese Cream", color: "#F3EBD8", ink: "#0E0E0E" },
            { name: "Coffee Crème", color: "#C9A98A", ink: "#0E0E0E" },
            { name: "Cherry", color: "#C9364A", ink: "#FBEFF1" },
            { name: "Hibiscus", color: "#B8325E", ink: "#FBEFF1" },
          ]}
        />
      </Section>

      <Inside
        className={local.inside}
        sets={nutrition}
        side={
          <>
            <div className={local.kcal}>
              <span className={local.kcalLabel}>
                <Responsive desktop="One 50 g serve of whipped topping" mobile="One 50 g serve, whipped with whole milk" />
              </span>
              <span className={local.kcalValue}>≈ 72 kcal</span>
              <span className={cx(local.kcalText, styles.desktopOnly)}>
                Made with whole milk. About 58 kcal from the base, 14 kcal from the milk.
              </span>
            </div>
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
              className={local.shelf}
              value="18 months"
              text="Store in a cool, dry place below 25 °C, away from direct sunlight."
              mobileText="Below 25 °C, dry place, no direct sun."
              specHref={assets.specification}
            />
          </>
        }
      />

      <Faq productName={product.name} items={faq} />
    </main>
  );
}
