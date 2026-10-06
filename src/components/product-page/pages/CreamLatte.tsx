import type { CSSProperties } from "react";
import {
  Faq,
  Hero,
  Info,
  Section,
  Shelf,
  Stats,
  Steps,
  productImage,
  productPageStyles as styles,
} from "../blocks";
import type { ProductPageProps } from "../types";
import { MADE_IN, PackFacts } from "./Milkshake";
import { PhotoFlavours, type PhotoFlavour } from "./PhotoFlavours";

/**
 * Cream Latte — no mock of its own: built on the Matcha reference, section for
 * section, from the facts the current site states (product-details.json,
 * products.ts). No serve photos exist, so "Ready for your menu" is left out;
 * no nutrition label exists, so "Inside the pack" shows only its side cards.
 * The site's dose (15 g) and yield (25 cups from 500 g) disagree, so no
 * per-cup dose is printed until the owner confirms one.
 */

const SLUG = "cream-latte";

/** Each flavour with its serve photo (`flavour-<image>-{320,480}.webp`). */
const flavours = [
  { name: "Birds Dream", image: "birds-dream", garnish: "a dusting of cinnamon" },
  { name: "Blueberry", image: "blueberry", garnish: "blueberries and berry sauce" },
  { name: "Cheesy Cream", image: "cheesy-cream", garnish: "a dusting of cinnamon" },
  { name: "Citrus Sundae", image: "citrus-sundae", garnish: "candied citrus peel" },
  { name: "Tropical Berry", image: "tropical-berry", garnish: "pineapple" },
  { name: "Salty Caramel Sunset", image: "salty-caramel-sunset", garnish: "a caramel drizzle" },
  { name: "Golden Caramel Banana", image: "golden-caramel-banana", garnish: "a dried banana slice" },
  { name: "Vanilla Sky", image: "vanilla-sky", garnish: "white chocolate shavings" },
  { name: "Nutty Pistachio", image: "nutty-pistachio", garnish: "a pistachio drizzle" },
] satisfies PhotoFlavour[];

const faq = [
  {
    q: "Can it replace fresh cream?",
    a: "Yes. It gives a creamy, velvety body without fresh cream, so there is no spoilage or cold chain to manage.",
  },
  {
    q: "Is it fast enough for drive-thru?",
    a: "Yes. It dissolves under the steam wand, so the drink takes fewer steps at the bar.",
  },
  {
    q: "Does it mask the coffee?",
    a: "No. It adds a rich, creamy base and lets the espresso come through.",
  },
  { q: "How many cups from one pouch?", a: "25 cups of 8 oz from a 500 g pouch." },
  { q: "Does it need cold storage?", a: "No. It is a dry mix with an 18-month shelf life." },
  { q: "Does it work with plant milk?", a: "Yes. It works with dairy or plant-based milk." },
  { q: "Where can I buy it in my country?", a: "Through our distributors. Find yours on the Distributors page." },
];

export function CreamLattePage({ product, headline, assets }: ProductPageProps) {
  const hero = productImage(SLUG, "hero", [600, 1000]);

  return (
    <main
      className={styles.page}
      style={
        {
          "--pp-bg": "#F6F4F0",
          "--pp-hero-bg": "#D9B2AE",
          "--pp-hero-lead": "#45282A",
        } as CSSProperties
      }
    >
      <Hero
        productName={product.name}
        title="Cream Latte"
        headline={headline}
        lead={{
          desktop:
            "Cream latte base for cafés and HoReCa. A rich, creamy latte without fresh cream: mix with milk, froth and add espresso.",
          mobile: "A creamy latte without fresh cream. Froth with milk, add espresso.",
        }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img {...hero} sizes="(max-width: 1023px) 240px, 400px" alt="Iced cream latte with whipped cream and dried orange" fetchPriority="high" />
        }
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          items={[
            { value: "1 min", label: "Preparation time" },
            { value: "25 cups", label: "From one 500 g pouch" },
            { value: "8 oz", label: "Per serving" },
            { value: "18 months", label: "Shelf life" },
            { value: "No cream", label: "No fresh cream needed" },
            { value: "Any milk", label: "Dairy or plant-based" },
          ]}
        />
      </Section>

      <Section title="How to prepare" label="How to prepare">
        <Steps
          items={[
            { label: "Milk", value: "200 ml" },
            { label: "Base", value: "Mix in" },
            { label: "Froth", value: "Creamy" },
            { label: "Coffee", value: "20 g" },
            { label: "Cup", value: "8 oz", dark: true },
          ]}
        />
        <p className={`${styles.side} ${styles.desktopOnly}`}>
          Mix the base with 200 ml of milk, froth until creamy and add an espresso from 20 g of coffee. Any milk works,
          including plant milk.
        </p>
        <p className={`${styles.side} ${styles.mobileOnly}`}>Mix with milk, froth until creamy, add espresso.</p>
      </Section>

      <Section title="Nine flavours" label="Flavours">
        <PhotoFlavours slug={SLUG} drink="cream latte" items={flavours} />
      </Section>

      <PackFacts>
        <Info
          title="No fresh cream"
          text="No spoilage, no daily waste and no cold chain to manage."
          mobile={
            <>
              <b style={{ color: "#8A3A3E" }}>No fresh cream:</b> no spoilage, no cold chain.
            </>
          }
          background="#F6E4E2"
          titleColor="#8A3A3E"
          textColor="#3A2A2B"
        />
        <Info
          title="Any milk"
          text="Works with dairy or plant-based milk."
          mobile={
            <>
              <b style={{ color: "#1E5A27" }}>Any milk:</b> dairy or plant-based.
            </>
          }
          background="#E4F1E2"
          titleColor="#1E5A27"
          textColor="#2A3A2C"
        />
        <Shelf
          value="18 months"
          text="Dry mix in a compact 500 g doypack. No cold storage needed."
          mobileText="Dry mix, no cold storage."
          certifications={MADE_IN}
          specHref={assets.specification}
        />
      </PackFacts>

      <Faq productName={product.name} items={faq} />
    </main>
  );
}
