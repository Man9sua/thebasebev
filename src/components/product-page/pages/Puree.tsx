import type { CSSProperties } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { Faq, Hero, Section, Stats, productPageStyles as styles } from "../blocks";
import type { ProductPageProps } from "../types";
import { BottleCards, RangePhotoPlaceholder, UseCards, heroSize, rangeHeroClass, rangeStyles } from "./Range";

/**
 * Purées ("Puree Product Page Redesign", desktop 1440 / mobile 390). The mock
 * has no photography yet; the bottles are neutral photo slots until approved pack shots arrive.
 */

const flavours = [
  { name: "Raspberry", text: "Bright and tart. Lemonades, mojitos, smoothies.", code: "950 ml · PR-001-C950", color: "#C2304A" },
  { name: "Peach", text: "Soft and juicy. Iced teas, bellinis, smoothies.", code: "950 ml · PR-002-C950", color: "#F2A65A" },
  { name: "Strawberry", text: "Sweet and ripe. Milkshakes, smoothies, lemonades.", code: "950 ml · PR-003-C950", color: "#D9384A" },
  { name: "Blueberry", text: "Deep and rounded. Smoothies, iced teas, yogurt bowls.", code: "950 ml · PR-004-C950", color: "#4B4A8C" },
  { name: "Passion fruit", text: "Tropical and sharp. Cocktails, iced teas, lemonades.", code: "950 ml · PR-005-C950", color: "#E8B33A" },
  { name: "Mango", text: "Rich and sweet. Smoothies, lassi, frappés.", code: "950 ml · PR-006-C950", color: "#F3A221" },
] as const;

const faq = [
  { q: "Where can I find ingredients and nutrition?", a: "Request the specification sheet for your chosen flavour from our team." },
  { q: "How do I store an opened bottle?", a: "Follow the storage instructions on your bottle. Our team can provide the specification sheet for your chosen flavour." },
  { q: "Can you make a purée under our brand?", a: "Yes. Private label and custom flavours are available through our R&D team." },
  { q: "Where can I buy it?", a: "Through your local the Base distributor. Request a sample and we will connect you." },
];

export function PureePage({ product }: ProductPageProps) {
  return (
    <main className={styles.page} style={{ "--pp-bg": "#F6F4F0" } as CSSProperties}>
      <Hero
        className={rangeHeroClass}
        style={heroSize(120, 56)}
        productName={product.name}
        title="Purées"
        lead={{
          desktop: "Six fruit purées for smoothies, lemonades, iced teas, cocktails and desserts. Ready to pour.",
          mobile: "Six fruit purées for smoothies, lemonades, cocktails and desserts.",
        }}
        image={<RangePhotoPlaceholder />}
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          className={rangeStyles.stats6}
          columns={6}
          items={[
            { value: "950 ml", label: "Bottle" },
            { value: "6", label: "Flavours" },
            { value: "Spec sheet", label: "Ingredients and nutrition on request" },
            { value: "Cold drinks", label: "Smoothies, lemonades, cocktails" },
            { value: "Shake", label: "Shake well before use" },
            { value: "Your label", label: "Private label available" },
          ]}
        />
      </Section>

      <Section title="Six flavours" label="Flavours">
        <BottleCards items={flavours} />
      </Section>

      <Section title="Three ways to use it" label="Three ways to use it">
        <UseCards
          items={[
            { label: "Smoothie", value: "Blend", text: "Blend with ice and milk or yogurt" },
            { label: "Lemonade or iced tea", value: "Pour", text: "Pour into the glass, add ice and top up" },
            { label: "Dessert", value: "Topping", text: "Over ice cream, cheesecake and waffles" },
          ]}
        />
        <SiteLink href="/contacts" className={styles.textLink}>Request recipes and specifications →</SiteLink>
      </Section>

      <Faq productName={product.name} items={faq} line={null} distributor={false} mobileLimit={99} initiallyOpen={false} />
    </main>
  );
}
