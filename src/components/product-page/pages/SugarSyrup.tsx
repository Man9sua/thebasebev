import { Faq, productImage, productPageStyles as styles } from "../blocks";
import {
  FamilyFlavours,
  FamilyHero,
  FamilyInside,
  FamilyMenu,
  FamilyPage,
  FamilySection,
  FamilyStats,
  FamilySteps,
  RndBand,
  familyFaqClass,
} from "../familyB";
import type { ProductPageProps } from "../types";

/**
 * Sugar syrup ("Sugar syrup · страница продукта целиком", desktop 1440 / mobile 390),
 * family B. Nutrition is the Blueberry label, the only one in hand.
 */

const SLUG = "sugar-syrup";

const faq = [
  {
    q: "Why powder and not a liquid syrup?",
    a: "No glass bottles to break, no sticky pumps to clean, and a pack takes a fraction of the space. Each sachet is an exact dose, so every drink tastes the same.",
  },
  {
    q: "Does it dissolve in cold drinks?",
    a: "Yes. Stir or shake it into cold milk, iced coffee or lemonade. In hot milk it dissolves while steaming.",
  },
  {
    q: "How sweet is one sachet?",
    a: "About the same as a 30 ml pump of liquid syrup. Use one sachet for a 6 oz cup and adjust for larger sizes.",
  },
  { q: "How do I store it?", a: "In a cool, dry place below 25°C, out of direct sunlight. Sachets stay sealed until use." },
  {
    q: "Can you make a flavour for us?",
    a: "Yes. Our lab in Dubai develops custom flavours and sweetness levels for chains and private label.",
  },
];

export function SugarSyrupPage({ product, headline }: ProductPageProps) {
  const hero = productImage(SLUG, "hero", [600, 900]);
  const serves = [
    { ...hero, alt: "Drink with Sugar Syrup" },
    { ...productImage(SLUG, "serve-2", [640, 900]), alt: "Drink with Sugar Syrup" },
    { ...productImage(SLUG, "serve-3", [640, 900]), alt: "Drink with Sugar Syrup" },
  ];

  return (
    <FamilyPage tint="#F0D9CF">
      <FamilyHero
        productName={product.name}
        title={
          <>
            Sugar
            <br className={styles.desktopOnly} /> syrup
          </>
        }
        headline={headline}
        mobileTitleSize={60}
        lead={{
          desktop:
            "Flavoured syrup in powder, one sachet per drink. The same sweetness as a pump of liquid syrup, without bottles, pumps or sticky counters.",
          mobile: "Flavoured syrup in powder, one sachet per drink. No bottles, pumps or sticky counters.",
        }}
        media={{ kind: "cover", width: 520, height: 640, mobileHeight: 380 }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img {...hero} sizes="(max-width: 1023px) 350px, 520px" alt="Iced rose latte with Sugar Syrup" fetchPriority="high" />
        }
      />

      <FamilySection title="Made for service" label="Made for service">
        <FamilyStats
          valueSize={30}
          mobileValueSize={22}
          items={[
            { value: "5 g", label: "Per serving" },
            { value: "100", label: "Sachets per pack" },
            { value: "17 kcal", label: "Per serving" },
            { value: "30 sec", label: "To prepare" },
            { value: "18 months", label: "Shelf life" },
            { value: "No glass", label: "No breakage, no spills" },
          ]}
        />
      </FamilySection>

      <FamilyMenu title="Ready for your menu" items={serves} />

      <FamilySection title="How to prepare" label="How to prepare">
        <FamilySteps
          nameSize={40}
          mobileNameWidth={80}
          items={[
            { name: "150 ml", text: "Milk, any fat content or plant-based" },
            { name: "5 g", text: "One sachet of Sugar Syrup" },
            { name: "Steam", text: "Froth for a creamy texture" },
            { name: "6 oz", text: "Add to coffee or tea" },
          ]}
        />
      </FamilySection>

      <FamilySection title="Six flavours" label="Flavours">
        <FamilyFlavours
          columns={3}
          ratio="4 / 3"
          nameSize={20}
          items={[
            { name: "Vanilla", color: "#F1E2BE" },
            { name: "Salted Caramel", color: "#C98A4B" },
            { name: "Hazelnut", color: "#8A5A3B" },
            { name: "Raspberry", color: "#D2395E" },
            { name: "Mango", color: "#F2A33A" },
            { name: "Blueberry", color: "#4F5AA8" },
          ]}
        />
        <RndBand
          title="Your own flavour"
          text={{
            desktop: "Custom flavours and sweetness levels from our lab in Dubai.",
            mobile: "Custom flavours and sweetness levels.",
          }}
        />
      </FamilySection>

      <FamilyInside
        caption={{ desktop: "Per serving, 5 g" }}
        rows={[
          { label: "Calories", value: "17 kcal" },
          { label: "Total fat", value: "0 g" },
          { label: "Carbohydrates", value: "4.4 g" },
          { label: "of which sugars", value: "4 g" },
          { label: "Protein", value: "<0.05 g" },
          { label: "Sodium", value: "<0.1 mg" },
        ]}
        notes={[
          {
            head: "Allergens",
            text: "May contain traces of milk. Halal certified. Made in a HACCP and ISO 22000 certified facility in the UAE.",
          },
          {
            head: "Storage",
            text: "Cool, dry and clean place below 25°C, away from direct sunlight. 18 months from production.",
          },
        ]}
        mobileNote={
          <>
            <b>Allergens.</b> May contain traces of milk.
            <br /> <b>Storage.</b> Below 25°C, dry, away from sunlight. 18 months.
          </>
        }
      />

      <Faq productName={product.name} items={faq} line={null} distributor={false} className={familyFaqClass} />
    </FamilyPage>
  );
}
