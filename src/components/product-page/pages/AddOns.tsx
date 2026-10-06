import type { CSSProperties } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { Faq, Hero, Section, Stats, cx, productPageStyles as styles } from "../blocks";
import type { ProductPageProps } from "../types";
import { RangePhotoPlaceholder, UseCards, heroSize, rangeHeroClass, rangeStyles } from "./Range";
import local from "./AddOns.module.css";

/**
 * Functional add-ons ("Add-ons Product Page Redesign", desktop 1440 / mobile
 * 390). The mock reserves a photo slot until approved pack shots arrive. The custom
 * blend card goes to the R&D page, which carries its own lead form: this
 * route has no exported page and so none of the export's popups.
 */

const addOns = [
  { name: "Electrolyte", color: "#E9A1A8", stick: "5 g", dose: "Sodium 1000 mg, potassium 200 mg, magnesium 60 mg", taste: "Moderate, raspberry salt", best: "Smoothies, iced espresso, cold brew" },
  { name: "Prebiotic fiber", color: "#D9CBA8", stick: "5 g", dose: "4000 mg fiber", taste: "Neutral", best: "Smoothies, blended drinks" },
  { name: "Immunity", color: "#F2C14E", stick: "1 g", dose: "500 mg", taste: "Light sourness", best: "Fruit smoothies, protein shakes" },
  { name: "Glycine", color: "#B9B3D6", stick: "5 g", dose: "3000 mg", taste: "Slightly sweet", best: "Chamomile tea, hot chocolate, coffee-free coolers" },
  { name: "Magnesium", color: "#A9C7D9", stick: "1 g", dose: "300 mg", taste: "Low", best: "Hot chocolate, matcha latte, mocha" },
  { name: "Collagen", color: "#EBC9B8", stick: "5 g", dose: "4000 mg", taste: "Very low", best: "Latte, cappuccino, flat white, matcha latte" },
  { name: "Creatine", color: "#BFD6B4", stick: "5 g", dose: "4000 mg", taste: "Almost none", best: "Protein shakes, espresso shakers, coffee coolers" },
];

const menuMap = [
  { drink: "Espresso and milk", serves: "Latte, cappuccino, flat white", add: "Collagen · Magnesium" },
  { drink: "Chocolate", serves: "Hot and iced chocolate, mocha", add: "Glycine · Magnesium" },
  { drink: "Matcha", serves: "Matcha latte", add: "Collagen · Magnesium" },
  { drink: "Iced coffee", serves: "Iced espresso, cold brew, shakers", add: "Creatine · Electrolyte" },
  { drink: "Blended", serves: "Coffee and coffee-free coolers", add: "Creatine · Fiber · Glycine" },
  { drink: "Smoothies", serves: "Fruit and protein smoothies", add: "Electrolyte · Immunity · Fiber" },
  { drink: "Tea", serves: "Chamomile and herbal", add: "Glycine" },
];

const faq = [
  { q: "Do we need new recipes?", a: "No. Add-ons go into drinks already on your menu. One stick per drink, added at a fixed step." },
  { q: "Does it change the taste?", a: "Most add-ons are neutral or close to it. Electrolyte has a light raspberry salt note, glycine adds light sweetness." },
  {
    q: "Which drinks should not get add-ons?",
    a: "Electrolyte goes only into cold, non-dairy drinks. Glycine is for evening drinks without caffeine. Each add-on comes with a barista manual.",
  },
  { q: "Do you train our team?", a: "Yes. Every launch includes a menu map, barista manual and a short script for the till." },
  { q: "Can we sell it under our brand?", a: "Yes. Sticks are available as private label." },
];

export function AddOnsPage({ product }: ProductPageProps) {
  return (
    <main className={styles.page} style={{ "--pp-bg": "#F6F4F0" } as CSSProperties}>
      <Hero
        className={rangeHeroClass}
        style={heroSize(100, 48)}
        productName={product.name}
        title={
          <>
            Functional
            <br /> add-ons
          </>
        }
        lead={{
          desktop:
            "Seven pre-dosed sticks for drinks already on your menu. One stick per drink, no new recipes.",
          mobile: "Seven pre-dosed sticks for drinks already on your menu. One stick per drink, no new recipes.",
        }}
        image={<RangePhotoPlaceholder />}
      />

      <Section title="Made for service" label="Made for service">
        <Stats
          className={rangeStyles.stats6}
          columns={6}
          items={[
            { value: "7", label: "Functional add-ons" },
            { value: "1 stick", label: "Per drink" },
            { value: "1–5 g", label: "Pre-dosed sticks" },
            { value: "No new recipes", label: "Goes into drinks you already serve" },
            { value: "Upsell", label: "One extra line on every bill" },
            { value: "Your label", label: "Private label available" },
          ]}
        />
      </Section>

      <Section title="Seven add-ons" label="Add-ons">
        <div className={local.cards}>
          {addOns.map((item) => (
            <div key={item.name} className={local.card}>
              <div className={local.cardHead}>
                <span className={local.swatch} style={{ background: item.color }} aria-hidden="true" />
                <span className={cx(local.stick, styles.desktopOnly)}>{item.stick} stick</span>
              </div>
              <div className={local.cardName}>
                {item.name === "Electrolyte" ? (
                  <SiteLink href="/electrolyte" className={local.name}>{item.name}</SiteLink>
                ) : <span className={local.name}>{item.name}</span>}
              </div>
              <div className={cx(local.facts, styles.desktopOnly)}>
                <span>
                  <b>Dose</b> · {item.dose}
                </span>
                <span>
                  <b>Taste</b> · {item.taste}
                </span>
                <span>
                  <b>Best in</b> · {item.best}
                </span>
              </div>
              <span className={cx(local.factsLine, styles.mobileOnly)}>
                {item.stick} · {item.taste} · {item.best}
              </span>
            </div>
          ))}
          <div className={cx(local.own, styles.desktopOnly)}>
            <span className={local.ownTitle}>Your own functional line</span>
            <span className={local.ownText}>We develop a custom blend and pack it under your brand.</span>
            <SiteLink href="/rnd#rnd-form" className={local.ownLink}>
              Talk to R&amp;D →
            </SiteLink>
          </div>
        </div>
      </Section>

      <Section
        title="Menu map"
        side="Which add-on goes into which drink. Every launch comes with this map, a barista manual and a script for the till."
        label="Menu map"
        className={local.mapSection}
      >
        <ul className={local.map}>
          {menuMap.map((row) => (
            <li key={row.drink} className={local.row}>
              <span className={local.drink}>{row.drink}</span>
              <span className={local.serves}>{row.serves}</span>
              <span className={local.add}>{row.add}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="How to add" label="How to add" className={styles.desktopOnly}>
        <UseCards
          items={[
            { label: "Pick", value: "1 stick", text: "Choose the add-on for the drink from the menu map" },
            { label: "Dissolve", value: "In the liquid", text: "Into milk, water or juice before ice or blending" },
            { label: "Stir", value: "Serve", text: "Stir until fully dissolved, then finish as usual" },
          ]}
        />
      </Section>

      <Faq productName={product.name} items={faq} line={null} distributor={false} mobileLimit={99} initiallyOpen={false} />
    </main>
  );
}
