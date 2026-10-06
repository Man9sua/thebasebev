import type { CSSProperties, ReactNode } from "react";
import {
  Faq,
  Hero,
  Info,
  Section,
  Shelf,
  Stats,
  Steps,
  cx,
  productImage,
  productPageStyles as styles,
} from "../blocks";
import type { ProductPageProps } from "../types";
import local from "./Milkshake.module.css";
import { PhotoFlavours, type PhotoFlavour } from "./PhotoFlavours";

/**
 * Milkshake — no mock of its own: built on the Matcha reference, section for
 * section, from the facts the current site states (product-details.json,
 * products.ts). No serve photos exist, so "Ready for your menu" is left out;
 * no nutrition label exists, so "Inside the pack" shows only its side cards.
 */

const SLUG = "milkshake";

/** The fifteen flavours with a serve photo each (`flavour-<image>-{320,480}.webp`). */
const flavours = [
  { name: "CinnaApple", image: "cinna-apple", garnish: "apple slices and cinnamon" },
  { name: "KiwiMelon", image: "kiwi-melon", garnish: "a kiwi slice and mint" },
  { name: "PiñaCoco", image: "pina-coco", garnish: "pineapple and coconut flakes" },
  { name: "Peach Rose", image: "peach-rose", garnish: "peach slices and rose petals" },
  { name: "Creamberry", image: "creamberry", garnish: "fresh strawberries" },
  { name: "Dates", image: "dates", garnish: "whipped cream and date pieces" },
  { name: "Mango Lassi", image: "mango-lassi", garnish: "whipped cream and pistachio" },
  { name: "Rainbow Unicorn", image: "rainbow-unicorn", garnish: "whipped cream and sprinkles" },
  { name: "Avocado", image: "avocado", garnish: "avocado slices and whipped cream" },
  { name: "Yogurt", image: "yogurt", garnish: "granola, berries and honey" },
  { name: "Banana", image: "banana", garnish: "banana slices and caramel" },
  { name: "Honeydew", image: "honeydew", garnish: "a melon ball and mint" },
  { name: "Mango", image: "mango", garnish: "a mango macaron" },
  { name: "Strawberry", image: "strawberry", garnish: "strawberry sauce and whipped cream" },
  { name: "Vanilla", image: "vanilla", garnish: "caramel and whipped cream" },
] satisfies PhotoFlavour[];

/** Production's certification wording, from the site-wide quality answer. */
export const MADE_IN = "Made in the UAE under HACCP-focused processes and Halal-aligned standards.";

/**
 * "Inside the pack" without a nutrition table: the matcha side cards on one
 * row (stacked on the phone). Shared by the Milkshake, Frappe and Cream Latte pages.
 */
export function PackFacts({ children, columns = 3 }: { children: ReactNode; columns?: number }) {
  return (
    <section className={cx(styles.section, styles.inside)} aria-labelledby="product-pack-title">
      <h2 id="product-pack-title" className={styles.title}>
        Inside the pack
      </h2>
      <div className={local.facts} style={{ "--cols": columns } as CSSProperties}>
        {children}
      </div>
    </section>
  );
}

const faq = [
  {
    q: "Can it replace a soft-serve machine?",
    a: "Yes. It gives a thick, creamy shake from a standard blender and ice, with no ice cream machine to clean or maintain.",
  },
  {
    q: "Does it work with plant milk?",
    a: "Yes. It blends with dairy or plant-based milk, so one base covers both menus.",
  },
  { q: "How many cups from one pouch?", a: "17 cups of 12 oz from a 500 g pouch, 30 g per cup." },
  { q: "Does it need a freezer?", a: "No. It is a dry powder with an 18-month shelf life. No ice cream, no freezer." },
  {
    q: "Will it clump in a humid kitchen?",
    a: "No. The blend contains anti-caking agents, so the powder stays free-flowing and portions stay precise.",
  },
  { q: "Where can I buy it in my country?", a: "Through our distributors. Find yours on the Distributors page." },
];

export function MilkshakePage({ product, headline, assets }: ProductPageProps) {
  const hero = productImage(SLUG, "hero", [600, 1000]);

  return (
    <main
      className={styles.page}
      style={
        {
          "--pp-bg": "#F6F4F0",
          "--pp-hero-bg": "#DFA9B5",
          "--pp-hero-lead": "#4A1E2A",
        } as CSSProperties
      }
    >
      <Hero
        className={local.longTitle}
        productName={product.name}
        title="Milkshake"
        headline={headline}
        lead={{
          desktop:
            "Milkshake base for cafés and HoReCa. A thick, creamy shake without ice cream or syrup: blend with milk and ice, no freezer needed.",
          mobile: "Thick, creamy shakes without ice cream. Blend with milk and ice.",
        }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img {...hero} sizes="(max-width: 1023px) 240px, 400px" alt="Pink milkshake with whipped cream and raspberry" fetchPriority="high" />
        }
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          items={[
            { value: "1 min", label: "Preparation time" },
            { value: "17 cups", label: "From one 500 g pouch" },
            { value: "12 oz", label: "Per serving" },
            { value: "18 months", label: "Shelf life" },
            { value: "No freezer", label: "No ice cream, any blender" },
            { value: "Any milk", label: "Dairy or plant-based" },
          ]}
        />
      </Section>

      <Section title="How to prepare" label="How to prepare">
        <Steps
          items={[
            { label: "Milk", value: "200 ml" },
            { label: "Base", value: "30 g" },
            { label: "Ice", value: "Cubes" },
            { label: "Blend", value: "Smooth" },
            { label: "Cup", value: "12 oz", dark: true },
          ]}
        />
        <p className={`${styles.side} ${styles.desktopOnly}`}>
          Mix 30 g of base with 200 ml of milk, add ice cubes and blend until smooth. Any milk works, including plant
          milk.
        </p>
        <p className={`${styles.side} ${styles.mobileOnly}`}>30 g + 200 ml milk and ice, blend until smooth.</p>
      </Section>

      <Section title="Fifteen flavours" label="Flavours">
        <PhotoFlavours slug={SLUG} drink="milkshake" items={flavours} columns={4} />
      </Section>

      <PackFacts columns={2}>
        <Info
          title="Any milk"
          text="Blends with dairy or plant-based milk, so one base covers both menus."
          mobile={
            <>
              <b style={{ color: "#8A2E45" }}>Any milk:</b> dairy or plant-based.
            </>
          }
          background="#F7E3E8"
          titleColor="#8A2E45"
          textColor="#3A2A2E"
        />
        <Shelf
          value="18 months"
          text="Dry powder in a compact 500 g doypack. No refrigeration needed."
          mobileText="Dry powder, no refrigeration."
          certifications={MADE_IN}
          specHref={assets.specification}
        />
      </PackFacts>

      <Faq productName={product.name} items={faq} />
    </main>
  );
}
