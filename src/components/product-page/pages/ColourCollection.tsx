import type { CSSProperties } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { Faq, Hero, Section, Stats, cx, productImage, productPageStyles as styles } from "../blocks";
import type { ProductPageProps } from "../types";
import { Band, NoteCards, heroSize, rangeHeroClass, rangeStyles } from "./Range";
import local from "./ColourCollection.module.css";

/**
 * Colour collection ("Colour Collection Page Redesign", desktop 1440 / mobile
 * 390): five single-ingredient powders in tins, photographed.
 */

const SLUG = "colour-collection";

type Colour = { name: string; tin: string; text: string; taste?: string; best?: string };

const colours: readonly Colour[] = [
  { name: "Matcha", tin: "matcha", text: "Stone-ground Japanese green tea.", taste: "Grassy, umami, gentle bitterness.", best: "Lattes, iced matcha, lemonade." },
  { name: "Hojicha", tin: "hojicha", text: "Roasted Japanese green tea." },
  { name: "Butterfly Pea", tin: "butterfly-pea", text: "Blue flower extract. Turns violet with citrus." },
  { name: "Dragon Fruit", tin: "dragon-fruit", text: "Natural pitaya extract." },
  { name: "Ube", tin: "ube", text: "Purple yam from the Philippines." },
];

const steps = [
  { n: "1", value: "2 g", text: "One measure of powder" },
  { n: "2", value: "30 ml", text: "Water, hot or cold" },
  { n: "3", value: "Whisk", text: "Until smooth, no lumps" },
  { n: "4", value: "200 ml", text: "Milk or lemonade, over ice or hot" },
];

const recipes = [
  { name: "Iced Matcha Latte", dot: "#1EDC8C", text: "2 g matcha, 30 ml water at 80 °C. Whisk, pour over ice and 200 ml milk." },
  { name: "Hojicha Latte", dot: "#C0703F", text: "2 g hojicha, 30 ml hot water. Whisk, top with 200 ml steamed milk." },
  { name: "Blue Hour Lemonade", dot: "#4C6BFF", text: "2 g butterfly pea, 60 ml cold water. Pour over ice and lemonade." },
  { name: "Pink Dragon Latte", dot: "#FF2DB4", text: "2 g dragon fruit, 30 ml water. Pour over ice and 200 ml milk." },
  { name: "Ube Cloud Latte", dot: "#9B4DFF", text: "2 g ube, 30 ml hot water. Top with 200 ml milk, hot or iced." },
];

const faq = [
  { q: "What is in the tin?", a: "One ingredient: the plant or fruit powder itself. No sugar, colours or flavourings added." },
  { q: "Does the colour hold in milk and over ice?", a: "Yes. The colour holds in milk, water and over ice. Butterfly Pea turns violet when citrus is added." },
  { q: "How many drinks does one tin make?", a: "50 drinks at 2 g per serving from a 100 g tin." },
  { q: "How do I store an opened tin?", a: "Follow the storage instructions on your tin. Our team can provide the specification sheet for your chosen powder." },
  {
    q: "Can you build a colour menu with us?",
    a: "Yes. Our lab in Dubai develops signature drinks with the collection for your menu and trains your baristas.",
  },
];

export function ColourCollectionPage({ product }: ProductPageProps) {
  return (
    <main className={styles.page} style={{ "--pp-bg": "#ECE8E2", "--pp-chip": "#ECE8E2", "--stat": 34 } as CSSProperties}>
      <Hero
        className={cx(rangeHeroClass, local.hero)}
        style={heroSize(96, 52)}
        productName={product.name}
        title={
          <>
            Colour
            <br /> collection
          </>
        }
        lead={{
          desktop: "Five natural powders for beverage menus. One ingredient in every tin, nothing added. Colour, naturally.",
          mobile: "Five natural powders for beverage menus. One ingredient, nothing added.",
        }}
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img
            {...productImage(SLUG, "tin-butterfly-pea", [360, 560, 880])}
            sizes="(max-width: 1023px) 180px, 320px"
            alt="Butterfly Pea powder tin"
            fetchPriority="high"
          />
        }
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          className={rangeStyles.stats6}
          columns={6}
          items={[
            { value: "100%", label: "Natural" },
            { value: "0 g", label: "Added sugar" },
            { value: "2 g", label: "Per serving" },
            { value: "50", label: "Servings per tin" },
            { value: "100 g", label: "Tin" },
            { value: "5", label: "Colours" },
          ]}
        />
      </Section>

      <Section title="Five colours" label="Five colours">
        <div className={local.colours}>
          {colours.map((colour) => (
            <div key={colour.name} className={local.colour}>
              <div className={local.plate}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  {...productImage(SLUG, `tin-${colour.tin}`, [360, 560])}
                  sizes="(max-width: 1023px) 45vw, 220px"
                  alt={`${colour.name} powder tin`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className={local.copy}>
                <span className={local.name}>{colour.name}</span>
                <span>{colour.text}</span>
                {colour.taste && <span>
                  <b>Taste.</b> {colour.taste}
                </span>}
                {colour.best && <span>
                  <b>Best in.</b> {colour.best}
                </span>}
              </div>
            </div>
          ))}
        </div>
        <Band
          title="Your own colour menu"
          text="Signature drinks with the collection, developed by our lab in Dubai."
          action={
            <SiteLink href="/rnd#rnd-form" className={cx(styles.button, styles.red)}>
              Talk to R&amp;D
            </SiteLink>
          }
        />
      </Section>

      <Section title="How to prepare" label="How to prepare">
        <div className={local.steps}>
          {steps.map((step, i) => (
            <div key={step.n} className={cx(local.step, i === 0 && local.stepDark)}>
              <span className={cx(local.stepN, styles.desktopOnly)}>{step.n}</span>
              <span className={local.stepValue}>{step.value}</span>
              <span className={local.stepText}>{step.text}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="A menu in five colours" label="A menu in five colours">
        <div className={local.recipes}>
          {recipes.map((recipe) => (
            <div key={recipe.name} className={local.recipe}>
              <span className={local.dot} style={{ background: recipe.dot }} aria-hidden="true" />
              <span className={local.recipeName}>{recipe.name}</span>
              <span className={local.recipeText}>{recipe.text}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Inside the tin" label="Inside the tin">
        <NoteCards
          items={[
            { title: "One ingredient", text: "The plant or fruit powder itself. No sugar, colours or flavourings added." },
            { title: "Certification", text: "Made at our own factory in the UAE. HACCP and ISO 22000." },
            { title: "Storage", text: "Request the specification sheet for your chosen powder from our team." },
          ]}
        />
        <SiteLink href="/contacts" className={styles.textLink}>Request a specification sheet →</SiteLink>
      </Section>

      <Faq productName={product.name} items={faq} line={null} distributor={false} />
    </main>
  );
}
