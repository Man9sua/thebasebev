import type { CSSProperties } from "react";
import { Faq, Hero, Info, Section, Shelf, Stats, Steps, productImage, productPageStyles as styles } from "../blocks";
import type { ProductPageProps } from "../types";
import { MADE_IN, PackFacts } from "./Milkshake";
import { PhotoFlavours, type PhotoFlavour } from "./PhotoFlavours";

/**
 * Frappe — no mock of its own: built on the Matcha reference, section for
 * section, from the facts the current site states (product-details.json,
 * products.ts). No serve photos exist, so "Ready for your menu" is left out;
 * no nutrition label exists, so "Inside the pack" shows only its side cards.
 */

const SLUG = "frappe";

/** The eight flavours with a serve photo each (`flavour-<image>-{320,480}.webp`). */
const flavours = [
  { name: "Salted Caramel", image: "salted-caramel", garnish: "whipped cream and chopped nuts" },
  { name: "Vanilla", image: "vanilla", garnish: "biscuit crumble and candied orange" },
  { name: "Cream Crown", image: "cream-crown", garnish: "whipped cream, caramel and biscuits" },
  { name: "Pistachio", image: "pistachio", garnish: "biscuit crumble and almond flakes" },
  { name: "Green Tea", image: "green-tea", garnish: "a dusting of matcha" },
  { name: "Bon Bon", image: "bon-bon", garnish: "grated chocolate" },
  { name: "Rose Pistachio", image: "rose-pistachio", garnish: "pistachios and rose petals" },
  { name: "Tiramisu", image: "tiramisu", garnish: "a dusting of cocoa" },
] satisfies PhotoFlavour[];

const faq = [
  {
    q: "Will it separate in the heat?",
    a: "No. Stabilisers keep the ice and liquid bound together, even for outdoor service in summer.",
  },
  {
    q: "Can I adjust the sweetness for my market?",
    a: "Yes. The base is balanced, so you can set the final sugar to local taste.",
  },
  { q: "How many cups from one pouch?", a: "14 cups of 16 oz from a 500 g pouch, 35 g per cup." },
  { q: "Does it need ice cream or a freezer?", a: "No. Blend it with milk, espresso and ice in any blender." },
  { q: "Does it need cold storage?", a: "No. It is a dry powder with an 18-month shelf life." },
  { q: "Where can I buy it in my country?", a: "Through our distributors. Find yours on the Distributors page." },
];

export function FrappePage({ product, headline, assets }: ProductPageProps) {
  const hero = productImage(SLUG, "hero", [600, 1000]);

  return (
    <main
      className={styles.page}
      style={
        {
          "--pp-bg": "#F6F4F0",
          "--pp-hero-bg": "#BE9068",
          "--pp-hero-lead": "#33210F",
        } as CSSProperties
      }
    >
      <Hero
        productName={product.name}
        title="Frappe"
        headline={headline}
        lead={{
          desktop:
            "Frappe base for cafés and HoReCa. A smooth, creamy blended drink: blend with milk, espresso and ice, no ice cream or freezer needed.",
          mobile: "Smooth, creamy frappe. Blend with milk, espresso and ice.",
        }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img {...hero} sizes="(max-width: 1023px) 240px, 400px" alt="Iced frappe with whipped cream and biscuit crumbs" fetchPriority="high" />
        }
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          items={[
            { value: "1 min", label: "Preparation time" },
            { value: "14 cups", label: "From one 500 g pouch" },
            { value: "16 oz", label: "Per serving" },
            { value: "18 months", label: "Shelf life" },
            { value: "No freezer", label: "No ice cream, any blender" },
            { value: "Blended", label: "Milk, espresso and ice" },
          ]}
        />
      </Section>

      <Section title="How to prepare" label="How to prepare">
        <Steps
          items={[
            { label: "Milk", value: "200 ml" },
            { label: "Base", value: "35 g" },
            { label: "Coffee", value: "20 g" },
            { label: "Ice", value: "150 g" },
            { label: "Cup", value: "16 oz", dark: true },
          ]}
        />
        <p className={`${styles.side} ${styles.desktopOnly}`}>
          Blend 35 g of base with 200 ml of milk, an espresso from 20 g of coffee and 150 g of ice. Finish with a
          topping.
        </p>
        <p className={`${styles.side} ${styles.mobileOnly}`}>35 g + 200 ml milk, espresso and 150 g ice, blend.</p>
      </Section>

      <Section title="Eight flavours" label="Flavours">
        <PhotoFlavours slug={SLUG} drink="frappe" items={flavours} columns={3} />
      </Section>

      <PackFacts columns={2}>
        <Info
          title="Holds in the heat"
          text="Stabilisers keep the ice and liquid bound together, even outdoors in summer."
          mobile={
            <>
              <b style={{ color: "#7A4A1E" }}>Holds in the heat:</b> no separation.
            </>
          }
          background="#F3E6D8"
          titleColor="#7A4A1E"
          textColor="#3A2F25"
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
