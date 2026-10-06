import type { CSSProperties } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { Faq, Hero, Section, Stats, productPageStyles as styles } from "../blocks";
import type { ProductPageProps } from "../types";
import { BottleCards, RangePhotoPlaceholder, UseCards, heroSize, rangeHeroClass, rangeStyles } from "./Range";

/**
 * Sauces ("Sauces Product Page Redesign", desktop 1440 / mobile 390). Like the
 * purées, the mock reserves neutral photo slots until approved pack shots arrive.
 */

const flavours = [
  { name: "Caramel", text: "Buttery, rounded caramel. Lattes, frappes, milkshakes and desserts.", code: "1.89 L · SA-001-C950", color: "#C98A3E" },
  { name: "Chocolate", text: "Deep cocoa with a clean finish. Mochas, hot chocolate, ice cream.", code: "1.89 L · SA-002-C950", color: "#4A2A20" },
  { name: "White chocolate", text: "Creamy and mild. White mochas, matcha drinks, cold foam.", code: "1.89 L · SA-003-C950", color: "#EADBC4" },
] as const;

const faq = [
  { q: "Can I use it in cold drinks?", a: "Yes. The sauce mixes into cold milk and blends evenly in frappes and milkshakes." },
  { q: "How do I store it?", a: "Follow the storage instructions on your bottle. Our team can provide the specification sheet for your chosen flavour." },
  { q: "Can you make a sauce under our brand?", a: "Yes. Private label and custom flavours are available through our R&D team." },
  { q: "Where can I buy it?", a: "Through your local the Base distributor. Request a sample and we will connect you." },
];

export function SaucePage({ product }: ProductPageProps) {
  return (
    <main className={styles.page} style={{ "--pp-bg": "#F6F4F0" } as CSSProperties}>
      <Hero
        className={rangeHeroClass}
        style={heroSize(120, 56)}
        productName={product.name}
        title="Sauces"
        lead={{
          desktop:
            "Caramel, chocolate and white chocolate sauces for coffee, cold drinks and desserts. One bottle flavours the cup and finishes the glass.",
          mobile: "Caramel, chocolate and white chocolate sauces for coffee, cold drinks and desserts.",
        }}
        image={<RangePhotoPlaceholder />}
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          className={rangeStyles.stats6}
          columns={6}
          items={[
            { value: "1.89 L", label: "Squeeze bottle" },
            { value: "3", label: "Flavours" },
            { value: "Hot and cold", label: "Dissolves in both" },
            { value: "Drizzle", label: "Coffee, cold drinks and desserts" },
            { value: "Spec sheet", label: "Storage instructions on request" },
            { value: "Your label", label: "Private label available" },
          ]}
        />
      </Section>

      <Section title="Three flavours" label="Flavours">
        <BottleCards items={flavours} single />
      </Section>

      <Section title="Three ways to use it" label="Three ways to use it">
        <UseCards
          items={[
            { label: "Flavour", value: "Pump", text: "Pump into the cup before espresso or milk" },
            { label: "Garnish", value: "Drizzle", text: "Line the glass or finish on top of foam" },
            { label: "Dessert", value: "Topping", text: "Over ice cream, waffles and cakes" },
          ]}
        />
        <SiteLink href="/contacts" className={styles.textLink}>Request recipes and specifications →</SiteLink>
      </Section>

      <Faq productName={product.name} items={faq} line={null} distributor={false} mobileLimit={99} initiallyOpen={false} />
    </main>
  );
}
