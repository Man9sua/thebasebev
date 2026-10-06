import type { CSSProperties } from "react";
import {
  Hero,
  Section,
  Stats,
  Steps,
  cx,
  productImage,
  productPageStyles as styles,
  type Question,
} from "../blocks";
import type { ProductPageProps } from "../types";
import { PlainFaq, RndBand, ShelfCard, SimpleInside, TryBand, jamStyles as j, type Fact } from "./Jam";
import s from "./SugarFree.module.css";

/**
 * Sugar free ("Sugar free · страница продукта целиком", desktop 1440 / mobile 390).
 * Same design generation as jam, whose shared pieces it reuses; it has no
 * "Ready for your menu" section (no serve photos yet).
 */

const SLUG = "sugar-free";

const flavours = [
  { name: "Amaretto", image: "amaretto" },
  { name: "Cherry", image: "cherry" },
  { name: "Mango", image: "mango" },
  { name: "Mint", image: "mint" },
  { name: "Black Currant", image: "black-currant" },
  { name: "Coconut", image: "coconut" },
  { name: "Melon", image: "melon" },
  { name: "Peach", image: "peach" },
  { name: "Raspberry", image: "raspberry" },
  { name: "Hazelnut", image: "hazelnut" },
];

/** The hero collage, back to front. */
const collage = [
  { image: "mint", alt: "Mint sugar-free flavour sachet" },
  { image: "cherry", alt: "Cherry sugar-free flavour sachet" },
  { image: "peach", alt: "Peach sugar-free flavour sachet" },
];

const sachet = (name: string) => productImage(SLUG, name, [400, 715]);

const facts: Fact[] = [
  { label: "Calories", value: "1 kcal" },
  { label: "Total fat", value: "0 g" },
  { label: "Sodium", value: "4 mg" },
  { label: "Total carbohydrates", value: "0.6 g" },
  { label: "Dietary fibre", value: "0.4 g" },
  { label: "Total sugar", value: "0 g" },
  { label: "Protein", value: "0 g" },
];

const faq: Question[] = [
  {
    q: "Does it change our recipe dose weights?",
    a: "No. One 1 g sachet goes into a standard 150 ml milk drink. The rest of the recipe stays the same.",
  },
  {
    q: "Is there a bitter aftertaste?",
    a: "No sweeteners are used, so there is no sweetener aftertaste. The sachet adds flavour only. Guests sweeten to taste if they want to.",
  },
  {
    q: "How does this help our menu?",
    a: "Guests who avoid sugar get a flavoured latte, tea or cold drink, and you do not need a second line of sugar-free syrups.",
  },
  {
    q: "What is in one pack?",
    a: "100 single sachets of 1 g. Each sachet is one drink, so there is no measuring and no open bottles.",
  },
  {
    q: "Can we get a flavour that is not on the list?",
    a: "Yes. Our R&D lab develops custom flavours for your menu or your own label.",
  },
];

export function SugarFreePage({ product }: ProductPageProps) {
  return (
    <main
      className={styles.page}
      style={
        {
          "--pp-bg": "#F4F3EF",
          "--pp-hero-lead": "#3A3835",
          "--mini-value": 30,
          "--step-m": "18px",
        } as CSSProperties
      }
    >
      <Hero
        className={cx(j.hero, s.hero)}
        style={{ "--hero-size": 160, "--hero-m": "64px" } as CSSProperties}
        mediaClassName={s.collage}
        productName={product.name}
        title={
          <>
            Sugar
            <br className={styles.desktopOnly} /> free
          </>
        }
        lead={{
          desktop:
            "Ten flavours in single 1 g sachets. Add one to milk, coffee or tea for a flavoured drink with 0 g sugar and 1 kcal per serve.",
        }}
        image={collage.map((item, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.image}
            {...sachet(item.image)}
            sizes="(max-width: 1023px) 190px, 330px"
            alt={item.alt}
            {...(i === 0 ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
          />
        ))}
      />

      <Section className={cx(j.gap40, s.closer)} title="Made for service" label="Made for service">
        <Stats
          columns={6}
          className={j.miniStats}
          items={[
            { value: "1 g", label: "One sachet per drink" },
            { value: "1 kcal", label: "Per serve" },
            { value: "0 g sugar", label: "No sweeteners added" },
            { value: "100", label: "Sachets per pack" },
            { value: "18 months", label: "Shelf life" },
            { value: "Below 25°C", label: "Dry storage, no fridge" },
          ]}
        />
      </Section>

      <Section
        className={cx(j.gap40, s.prep)}
        title="How to prepare"
        side="Also works in espresso drinks, tea and cold drinks."
        label="How to prepare"
      >
        <Steps
          className={j.tallSteps}
          items={[
            { label: "Milk", value: "150 ml" },
            { label: "Sachet", value: "1 g" },
            { label: "Steam", value: "Froth until smooth" },
            { label: "Cup", value: "6 oz", dark: true },
          ]}
        />
        <span className={cx(s.prepNote, styles.mobileOnly)}>Also works in espresso drinks, tea and cold drinks.</span>
      </Section>

      <Section className={j.gap40} title="Ten flavours" label="Flavours">
        <div className={s.flavours}>
          {flavours.map((flavour) => (
            <div key={flavour.name} className={s.flavour}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                {...sachet(flavour.image)}
                sizes="(max-width: 1023px) 160px, 220px"
                alt={`${flavour.name} sugar-free flavour sachet`}
                loading="lazy"
                decoding="async"
              />
              <span className={s.flavourName}>{flavour.name}</span>
            </div>
          ))}
        </div>
        <RndBand name="Your own flavour" text="Our lab develops a sugar-free flavour for your menu or your label." />
      </Section>

      <SimpleInside
        caption="Per 1 g sachet"
        mobileCaption="Per 1 g sachet"
        facts={facts}
        side={
          <div className={j.sideCol}>
            <div className={j.note} style={{ background: "#FBEDEA" }}>
              <span className={j.noteHead} style={{ color: "#7A1F14" }}>
                Allergens
              </span>
              <span className={j.noteText} style={{ color: "#5A2A22" }}>
                May contain traces of milk.
              </span>
            </div>
            <ShelfCard
              text="Store in a cool, dry, clean place below 25°C, away from direct sunlight. Sealed sachets, no fridge needed."
              mobileText="Store below 25°C in a cool, dry place, away from direct sunlight. No fridge needed."
            />
          </div>
        }
      />

      <PlainFaq items={faq} />

      <TryBand
        productName={product.name}
        text="Samples of all ten flavours for cafés and distributors."
        style={{ "--try-bg": "#0E0E0E", "--try-sub": "#C9C6C0" } as CSSProperties}
      />
    </main>
  );
}
