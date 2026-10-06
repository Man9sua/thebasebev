import type { CSSProperties } from "react";
import { Faq, Hero, Section, Stats, productImage, productPageStyles as styles } from "../blocks";
import type { ProductPageProps } from "../types";
import { BottleCards, UseCards, heroSize, rangeHeroClass, rangeStyles } from "./Range";

/**
 * Purées ("Puree Product Page Redesign", desktop 1440 / mobile 390). The mock
 * has no photography yet; the bottles are illustrations in each flavour's
 * colour until the pack shots arrive.
 */

const SLUG = "puree";

const flavours = [
  { name: "Raspberry", text: "Bright and tart. Lemonades, mojitos, smoothies.", code: "950 ml · PR-001-C950", color: "#C2304A", image: "raspberry" },
  { name: "Peach", text: "Soft and juicy. Iced teas, bellinis, smoothies.", code: "950 ml · PR-002-C950", color: "#F2A65A", image: "peach" },
  { name: "Strawberry", text: "Sweet and ripe. Milkshakes, smoothies, lemonades.", code: "950 ml · PR-003-C950", color: "#D9384A", image: "strawberry" },
  { name: "Blueberry", text: "Deep and rounded. Smoothies, iced teas, yogurt bowls.", code: "950 ml · PR-004-C950", color: "#4B4A8C", image: "blueberry" },
  { name: "Passion fruit", text: "Tropical and sharp. Cocktails, iced teas, lemonades.", code: "950 ml · PR-005-C950", color: "#E8B33A", image: "passion-fruit" },
  { name: "Mango", text: "Rich and sweet. Smoothies, lassi, frappés.", code: "950 ml · PR-006-C950", color: "#F3A221", image: "mango" },
] as const;

const faq = [
  { q: "Is there real fruit inside?", a: "Yes. The purée is made from fruit pulp, so it keeps natural texture and colour in the drink." },
  { q: "How do I store an opened bottle?", a: "Close the cap and keep it in the fridge after opening." },
  { q: "Can you make a purée under our brand?", a: "Yes. Private label and custom flavours are available through our R&D team." },
  { q: "Where can I buy it?", a: "Through your local the Base distributor. Request a sample and we will connect you." },
];

export function PureePage({ product, headline }: ProductPageProps) {
  return (
    <main className={styles.page} style={{ "--pp-bg": "#F6F4F0" } as CSSProperties}>
      <Hero
        className={rangeHeroClass}
        style={heroSize(120, 56)}
        productName={product.name}
        title="Purées"
        headline={headline}
        lead={{
          desktop: "Six fruit purées for smoothies, lemonades, iced teas, cocktails and desserts. Real fruit texture, ready to pour.",
          mobile: "Six fruit purées for smoothies, lemonades, cocktails and desserts.",
        }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img {...productImage(SLUG, "hero", [600, 1000])} sizes="(max-width: 1023px) 340px, 560px" alt="Six fruit purée bottles" fetchPriority="high" />
        }
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          className={rangeStyles.stats6}
          columns={6}
          items={[
            { value: "950 ml", label: "Bottle" },
            { value: "6", label: "Flavours" },
            { value: "Real fruit", label: "Fruit pulp and natural colour" },
            { value: "Cold drinks", label: "Smoothies, lemonades, cocktails" },
            { value: "Shake", label: "Shake well before use" },
            { value: "Your label", label: "Private label available" },
          ]}
        />
      </Section>

      <Section title="Six flavours" label="Flavours">
        <BottleCards slug={SLUG} kind="purée" items={flavours} />
      </Section>

      <Section title="Three ways to use it" label="Three ways to use it">
        <UseCards
          items={[
            { label: "Smoothie", value: "30 ml", text: "Blend with ice and milk or yogurt" },
            { label: "Lemonade or iced tea", value: "20–30 ml", text: "Pour into the glass, add ice and top up" },
            { label: "Dessert", value: "Topping", text: "Over ice cream, cheesecake and waffles" },
          ]}
        />
      </Section>

      <Faq productName={product.name} items={faq} line={null} distributor={false} />
    </main>
  );
}
