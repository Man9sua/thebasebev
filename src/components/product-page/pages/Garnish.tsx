import { Faq, productImage } from "../blocks";
import {
  FamilyFlavours,
  FamilyHero,
  FamilyPage,
  FamilySection,
  FamilyStats,
  FamilySteps,
  RndBand,
  familyFaqClass,
} from "../familyB";
import type { ProductPageProps } from "../types";

/**
 * Garnish ("Garnish · страница продукта целиком", desktop 1440 / mobile 390),
 * family B. No "Inside the pack" and no "Ready for your menu" yet: the
 * designer is waiting for nutrition data and drink photos.
 */

const SLUG = "garnish";

const faq = [
  {
    q: "What are the cubes made of?",
    a: "Real fruit, freeze-dried and cut into small even cubes. Colour and taste come from the fruit itself.",
  },
  {
    q: "Will they sink or dissolve in the drink?",
    a: "They sit on foam, cream and ice and keep their shape long enough to serve. In hot liquid they soften and release flavour.",
  },
  {
    q: "How do I store an opened pack?",
    a: "Close it tightly right after use and keep it dry, below 25°C. Moisture is the only thing that softens the cubes.",
  },
  { q: "Which drinks do they work with?", a: "Milkshakes, frappes, matcha, iced tea, lemonades, cocktails and desserts." },
  {
    q: "Can you make a flavour for us?",
    a: "Yes. Our lab in Dubai develops custom fruit mixes and cube sizes for chains and private label.",
  },
];

export function GarnishPage({ product, headline }: ProductPageProps) {
  const cubes = productImage(SLUG, "hero", [320, 491]);

  return (
    <FamilyPage tint="#EFE6DA">
      <FamilyHero
        productName={product.name}
        title="Garnish"
        headline={headline}
        top={40}
        lead={{
          desktop:
            "Freeze-dried fruit cubes that finish a drink in seconds. Real fruit colour and taste, the same size in every cup, no slicing and no waste.",
          mobile: "Freeze-dried fruit cubes that finish a drink in seconds. Real fruit colour and taste, no slicing and no waste.",
        }}
        media={{ kind: "bare", width: 560, height: 560, mobileHeight: 300 }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img {...cubes} sizes="(max-width: 1023px) 300px, 560px" alt="Strawberry Cubes" fetchPriority="high" />
        }
      />

      <FamilySection title="Made for service" label="Made for service">
        <FamilyStats
          valueSize={34}
          mobileValueSize={24}
          items={[
            { value: "0.2 g", label: "Per serving" },
            { value: "100 g", label: "Pack" },
            { value: "500", label: "Serves per pack" },
            { value: "10 sec", label: "To garnish" },
            { value: "18 months", label: "Shelf life" },
            { value: "No", label: "Preservatives" },
          ]}
        />
      </FamilySection>

      <FamilySection title="How to use" label="How to use">
        <FamilySteps
          nameSize={36}
          mobileNameWidth={96}
          items={[
            { name: "Prepare", text: "Finish the drink as usual" },
            { name: "0.2 g", text: "Take a small pinch of cubes" },
            { name: "Sprinkle", text: "On foam, cream or ice" },
            { name: "Serve", text: "Colour holds on the surface" },
          ]}
        />
      </FamilySection>

      <FamilySection title="Eight flavours" label="Flavours">
        <FamilyFlavours
          columns={4}
          ratio="1"
          items={[
            {
              name: "Strawberry Cubes",
              color: "#EFE6DA",
              image: (
                // eslint-disable-next-line @next/next/no-img-element
                <img {...cubes} sizes="(max-width: 1023px) 130px, 220px" alt="Strawberry Cubes" loading="lazy" decoding="async" />
              ),
            },
            { name: "Banana Cubes", color: "#EFD46A" },
            { name: "Dragon Fruit Cubes", color: "#D9418C" },
            { name: "Kiwi Cubes", color: "#7DB648" },
            { name: "Mango Cubes", color: "#F2A33A" },
            { name: "Blueberry Cubes", color: "#4F5AA8" },
            { name: "Cherry Cubes", color: "#9E1B2E" },
            { name: "Raspberry Cubes", color: "#D2395E" },
          ]}
        />
        <RndBand
          title="Your own fruit mix"
          text={{
            desktop: "Custom flavours, blends and cube sizes from our lab in Dubai.",
            mobile: "Custom flavours, blends and cube sizes.",
          }}
        />
      </FamilySection>

      <Faq productName={product.name} items={faq} line={null} distributor={false} className={familyFaqClass} />
    </FamilyPage>
  );
}
