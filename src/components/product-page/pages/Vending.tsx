import { Faq, productImage } from "../blocks";
import {
  FamilyFlavours,
  FamilyHero,
  FamilyInside,
  FamilyPage,
  FamilySection,
  FamilyStats,
  FamilySteps,
  RndBand,
  familyFaqClass,
} from "../familyB";
import type { ProductPageProps } from "../types";

/**
 * Vending ("Vending · страница продукта целиком", desktop 1440 / mobile 390),
 * family B. Nutrition is the Vending Chocolate label, the only one in hand.
 */

const SLUG = "vending";

const faq = [
  {
    q: "Does it work in automatic machines?",
    a: "Yes. The powder flows freely through hoppers and dosing augers without bridging or clogging, including in continuous high-volume use.",
  },
  { q: "Does it dissolve without lumps?", a: "Yes, in hot water straight from the machine. No stirring needed at a 1:10 ratio." },
  { q: "How many cups per pack?", a: "25 cups of 8 oz from a 500 g pack at 20 g per cup." },
  {
    q: "Will every machine give the same drink?",
    a: "Yes. The recipe sits in the powder, so the taste is the same in every unit, without staff on site.",
  },
  {
    q: "Can you make a flavour for our machines?",
    a: "Yes. Our lab in Dubai develops custom flavours and adapts dosing to your machine model.",
  },
];

export function VendingPage({ product }: ProductPageProps) {
  const machine = productImage(SLUG, "hero", [600, 750]);

  return (
    <FamilyPage tint="#E7DCD3">
      <FamilyHero
        productName={product.name}
        title="Vending"
        lead={{
          desktop:
            "Drink powders for automatic machines. Free-flowing in the hopper, dissolves in hot water, the same cup from every unit without staff on site.",
          mobile: "Drink powders for automatic machines. The same cup from every unit, without staff on site.",
        }}
        media={{ kind: "contain", width: 520, height: 600, mobileHeight: 340, inset: "92%", mobileInset: "90%" }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img {...machine} sizes="(max-width: 1023px) 315px, 480px" alt="Automatic drinks machine" fetchPriority="high" />
        }
      />

      <FamilySection title="Made for machines" label="Made for machines">
        <FamilyStats
          valueSize={28}
          mobileValueSize={22}
          padX={22}
          items={[
            { value: "20 g", label: "Per cup" },
            { value: "1:10", label: "Powder to water" },
            { value: "25", label: "Cups per 500 g" },
            { value: "8 oz", label: "Cup size" },
            { value: "18 months", label: "Shelf life" },
            { value: "Below 25°C", label: "Storage" },
          ]}
        />
      </FamilySection>

      <FamilySection title="How it works" label="How it works">
        <FamilySteps
          nameSize={40}
          mobileNameWidth={90}
          items={[
            { name: "Load", text: "Fill the machine hopper with the powder" },
            { name: "20 g", text: "Machine doses the powder" },
            { name: "200 ml", text: "Hot water, 1 g per 10 ml" },
            { name: "8 oz", text: "Cup ready in seconds" },
          ]}
        />
      </FamilySection>

      <FamilySection title="Five flavours" label="Flavours">
        <FamilyFlavours
          columns={5}
          ratio="4 / 3"
          nameLeading="1.25"
          items={[
            { name: "Chocolate", color: "#5A3527" },
            { name: "Chocolate No Added Sugar", color: "#3E2A22" },
            { name: "Karak", color: "#C08A55" },
            { name: "Matcha", color: "#7DAA5A" },
            { name: "Banana Ice Cream Salted Caramel", color: "#E8C77A" },
          ]}
        />
        <RndBand
          title="Your own flavour"
          text={{
            desktop: "Custom flavours and dosing for your machine model.",
            mobile: "Custom flavours and dosing for your machine.",
          }}
        />
      </FamilySection>

      <FamilyInside
        caption={{ desktop: "Chocolate, per serving 20 g", mobile: "Chocolate, per 20 g" }}
        rows={[
          { label: "Calories", value: "72 kcal" },
          { label: "Total fat", value: "0.4 g" },
          { label: "Carbohydrates", value: "18.4 g" },
          { label: "of which sugars", value: "16.5 g" },
          { label: "Protein", value: "0.7 g" },
          { label: "Sodium", value: "2.5 mg" },
        ]}
        notes={[
          { head: "Certification", text: "Halal certified. Made at our own factory in the UAE." },
          {
            head: "Storage",
            text: "Cool, dry and clean place below 25°C, away from direct sunlight. 18 months from production.",
          },
        ]}
        mobileNote={
          <>
            <b>Storage.</b> Below 25°C, dry, away from sunlight. 18 months.
          </>
        }
      />

      <Faq productName={product.name} items={faq} line={null} distributor={false} className={familyFaqClass} />
    </FamilyPage>
  );
}
