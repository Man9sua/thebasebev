import type { CSSProperties } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import {
  DistributorLink, Faq, FlavourEnquiryLink, Inside, SampleButton,
  Section, Stats, cx, productImage, productPageStyles as styles,
  type NutritionSet,
} from "../blocks";
import type { ProductPageProps } from "../types";
import local from "./BlendPage.module.css";

type Blend = "milkshake" | "frappe";

const milkshakeFaq = [
  { q: "Can your milkshake base replace a soft serve machine?", a: "For milkshakes, yes. A standard commercial blender and ice give a thick, creamy shake, without the cleaning cycles and maintenance contracts of a soft serve machine." },
  { q: "How do you handle lactose or dairy differences across regions?", a: "The base works with any milk: full-fat, low-fat, lactose-free, oat, almond or coconut. Your local distributor can advise on what works best in your market." },
  { q: "Does the powder clump in a humid kitchen?", a: "Keep the zip closed and store the pouch in a dry place below 25 °C, and use a dry scoop. In the blender the base dissolves fully in 30 seconds." },
  { q: "How many cups does one pack make?", a: "One 500 g doypack makes 17 cups of 12 oz, at 30 g of base per cup." },
  { q: "Can I make it without ice?", a: "Yes. Blend with cold milk for a lighter shake. Ice gives the classic thick texture." },
  { q: "Will it hold up for delivery?", a: "The foam holds and does not separate, so the shake arrives looking the way it left the bar." },
  { q: "Is it Halal certified?", a: "Yes. All the Base products are made in HACCP-audited, Halal-certified production in the UAE." },
  { q: "Where can I find ingredients and allergens?", a: "Each flavour has its own spec sheet with ingredients, allergens, nutrition and storage. Ask your distributor for the sheet for your flavour." },
  { q: "Where can I buy it in my country?", a: "Through your local the Base distributor. Use Find your distributor to see contacts for your country." },
];

const frappeFaq = [
  { q: "Will the frappe separate in the heat?", a: "No. Stabilisers in the base keep ice and liquid bound together, so the texture holds at outdoor events, on food trucks and in summer heat." },
  { q: "Is the base hard on blenders?", a: "No. It dissolves fully in 30 seconds and leaves no residue, so a standard commercial blender handles it every day." },
  { q: "Can we adjust the sweetness for our market?", a: "Yes. Our lab can develop a version with the sweetness your market or franchise needs." },
  { q: "How many cups does one pack make?", a: "One 500 g doypack makes 14 cups of 16 oz, at 35 g of base per cup." },
  { q: "Can I make it without espresso?", a: "Yes. The Coffee flavour already carries a coffee taste. Add espresso for a stronger café frappe." },
  { q: "How do I finish it like a café?", a: "Add 20–25 ml of purée or syrup, coat the inside of the cup with caramel or chocolate topping and top with a topping, cheese foam or cold foam." },
  { q: "Will it hold up for delivery?", a: "The texture holds and does not separate, so the frappe arrives looking the way it left the bar." },
  { q: "Is it Halal certified?", a: "Yes. Made in a HACCP and ISO 22000:2018 certified facility in the UAE, Halal certified." },
  { q: "Where can I buy it in my country?", a: "Through your local the Base distributor. Use Find your distributor to see contacts for your country." },
];

// Only the labels actually supplied in the design are published. Other flavours
// must not inherit these numbers, so there are no placeholder nutrition tabs.
const nutrition: Record<Blend, NutritionSet[]> = {
  milkshake: [{
    name: "Vanilla", caption: "Vanilla · per 30 g serving · 17 per pack",
    mobileCaption: "Vanilla · per 30 g · 17 per pack",
    rows: [
      { label: "Calories", value: "123" },
      { label: "Total fat", value: "3.5 g", dv: "4.5%" },
      { label: "Saturated fat", value: "2.6 g", dv: "11.2%" },
      { label: "Trans fat", value: "0 g" },
      { label: "Cholesterol", value: "<1 mg", dv: "<0.5%" },
      { label: "Sodium", value: "27 mg", dv: "1.1%" },
      { label: "Total carbohydrates", value: "22.4 g", dv: "7.2%" },
      { label: "Dietary fibre", value: "0.7 g", dv: "0%" },
      { label: "Total sugar", value: "19 g", dv: "21.2%" },
      { label: "Added sugar", value: "13 g" },
      { label: "Protein", value: "0.9 g", dv: "<2%" },
      { label: "Calcium", value: "31.4 mg", dv: "2.4%" },
    ],
    note: "Base powder only, without milk. Daily value based on a 2,000-calorie diet.",
  }],
  frappe: [{
    name: "Salted Caramel", caption: "Salted Caramel · per 35 g · 14 per pack",
    mobileCaption: "Salted Caramel · per 35 g · 14 per pack",
    rows: [
      { label: "Calories", value: "143" },
      { label: "Total fat", value: "4.4 g", dv: "6%" },
      { label: "Saturated fat", value: "3.7 g", dv: "15%" },
      { label: "Trans fat", value: "0 g" },
      { label: "Cholesterol", value: "0 mg" },
      { label: "Sodium", value: "162.8 mg", dv: "7%" },
      { label: "Total carbohydrates", value: "25.6 g", dv: "8%" },
      { label: "Dietary fibre", value: "<0.5 g", dv: "1%" },
      { label: "Total sugar", value: "20.5 g", dv: "23%" },
      { label: "Added sugar", value: "18 g" },
      { label: "Protein", value: "<0.5 g", dv: "1%" },
      { label: "Calcium", value: "2.0 mg", dv: "0%" },
    ],
    note: "Base powder only. Daily value based on a 2,000-calorie diet.",
  }],
};

const flavours: Record<Blend, string[]> = {
  milkshake: ["Banana", "Mango", "Date", "Honey Dew", "Strawberry", "Vanilla", "Yogurt", "Cookies & Cream", "Rainbow Unicorn"],
  frappe: ["Coffee", "Salted Caramel", "Vanilla"],
};

const menuPhotos: Record<Blend, ReturnType<typeof productImage>[]> = {
  milkshake: Array.from({ length: 8 }, (_, i) => productImage("milkshake", `menu-${i + 1}`, [320, 640])),
  frappe: Array.from({ length: 5 }, (_, i) => productImage("frappe", `menu-${i + 1}`, [320, 480])),
};

function BlendHero({ kind, product, assets }: ProductPageProps & { kind: Blend }) {
  const milkshake = kind === "milkshake";
  return (
    <section className={local.hero} aria-labelledby="product-title">
      <div className={local.heroGrid}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...productImage(kind, "design-hero", [600, milkshake ? 672 : 822])} sizes="(max-width: 1023px) 350px, 520px" alt={`the Base ${product.name}, 500 g pouch`} fetchPriority="high" className={local.heroPhoto} />
        <div className={local.heroCopy}>
          <h1 id="product-title" className={local.heroName}>{product.name}</h1>
          <p className={local.lead}>
            {milkshake
              ? "The body and taste of your milkshake in one scoop. Thick and creamy, with a foam that holds and does not separate. Works with any syrup or topping, on dairy or plant-based milk."
              : "The body and taste of a café frappe in one scoop. Smooth and creamy, with a texture that holds in the cup. Add espresso, your syrup or purée and finish with a topping."}
          </p>
          {milkshake && <dl className={local.heroFacts}>
            <div><dt>Format</dt><dd>500 g pouch</dd></div>
            <div><dt>Milk</dt><dd>Dairy or plant-based</dd></div>
            <div><dt>Certified</dt><dd>HACCP and Halal</dd></div>
          </dl>}
          <div className={local.actions}><SampleButton productName={product.name} /><DistributorLink /></div>
          {assets.specification && <a href={assets.specification} className={styles.textLink} download>Download spec sheet (PDF)</a>}
        </div>
      </div>
    </section>
  );
}

function Prepare({ kind }: { kind: Blend }) {
  const milkshake = kind === "milkshake";
  const steps = [
    { label: "Milk", value: "200 ml", note: "Any fat content or plant-based" },
    { label: "the Base", value: milkshake ? "30 g" : "35 g", note: "One scoop" },
    ...(!milkshake ? [{ label: "Espresso", value: "30 ml", note: "One shot" }] : []),
    { label: "Ice", value: milkshake ? "100 g" : "150 g", note: "Cubes" },
    { label: "Blend 30 seconds", value: milkshake ? "12 oz cup" : "16 oz cup", note: milkshake ? "Smooth, thick, foam that holds" : "Smooth and well combined" },
  ];
  return (
    <Section className={local.band} title={milkshake ? <>How to<br />prepare</> : "How to prepare"} label="How to prepare" side={milkshake ? "Three ingredients, one blender, 30 seconds. The same cup from every barista." : undefined}>
      <div className={cx(local.formula, !milkshake && local.frappeFormula)}>
        {steps.map((step, i) => <div key={step.label} className={local.formulaPart}>
          {i > 0 && <span className={local.operator} aria-hidden="true">{i === steps.length - 1 ? "=" : "+"}</span>}
          <div className={cx(local.ingredient, i === steps.length - 1 && local.result)}>
            <span>{step.label}</span><strong>{step.value}</strong><span>{step.note}</span>
          </div>
        </div>)}
      </div>
      {milkshake ? <div className={local.finish}><strong>Finish</strong><p>Top with whipped cream, your syrup or a topping. The base holds the foam, so the decoration stays on top.</p></div>
        : <div className={local.cafeFinish}><strong>Finish like a café</strong>
          <div><b>Flavour</b><p>Purée or syrup to taste, 20–25 ml</p></div>
          <div><b>Walls</b><p>Coat the inside of the cup with caramel or chocolate topping</p></div>
          <div><b>Top</b><p>Topping, cheese foam or cold foam</p></div>
        </div>}
    </Section>
  );
}

function FlavourRange({ kind }: { kind: Blend }) {
  const milkshake = kind === "milkshake";
  return (
    <Section className={cx(local.band, local.flavourBand)} title={`${flavours[kind].length} flavours`} label="Flavours" side={milkshake ? "Each one built on the same base, so texture and foam stay the same across the range." : undefined}>
      <div className={cx(local.flavourLayout, !milkshake && local.frappeFlavours)}>
        <div className={local.flavours}>{flavours[kind].map(name => <div className={local.flavour} key={name}>{name}</div>)}</div>
        <div className={local.own}><div><strong>Your own flavour</strong>{milkshake && <p>Our lab develops a flavour for your menu or your brand, on the same base.</p>}</div><FlavourEnquiryLink className={cx(styles.button, styles.red)}>Develop a flavour</FlavourEnquiryLink></div>
      </div>
    </Section>
  );
}

function MenuGallery({ kind, assets }: { kind: Blend; assets: ProductPageProps["assets"] }) {
  const milkshake = kind === "milkshake";
  return (
    <Section className={cx(local.band, local.menu)} title={<>Ready for<br />your menu</>} label="Ready for your menu" side={milkshake ? "Eight serves from our lab, all made with the same base." : undefined}>
      <div className={cx(local.gallery, milkshake && local.galleryMilkshake)}>
        {menuPhotos[kind].map(photo => <div key={photo.src} className={local.menuPhoto}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img {...photo} sizes="(max-width: 1023px) 45vw, 240px" alt={`${milkshake ? "Milkshake" : "Frappe"} made with the Base`} loading="lazy" decoding="async" />
          </div>)}
      </div>
      {assets.marketingKit && <a className={cx(styles.button, styles.red)} href={assets.marketingKit} download>Download marketing kit</a>}
    </Section>
  );
}

export function BlendPage(props: ProductPageProps & { kind: Blend }) {
  const { kind, product, assets } = props;
  const milkshake = kind === "milkshake";
  return (
    <main className={cx(styles.page, local.page, !milkshake && local.frappe)} style={{ "--pp-bg": "#F6F6F4", "--blend-tint": milkshake ? "#F3E4E7" : "#EBDCCB" } as CSSProperties}>
      <BlendHero {...props} />
      <Section className={local.band} title="Made for service" label="Made for service" side={milkshake ? "Fast at the bar, simple to store, the same result from every barista." : undefined}>
        <Stats className={local.stats} items={[
          { value: "30 sec", label: "Preparation time" },
          { value: milkshake ? "17 cups" : "14 cups", label: "From one 500 g doypack" },
          { value: milkshake ? "12 oz" : "16 oz", label: "Per serving" },
          { value: "18 months", label: "Shelf life" },
          { value: "Any blender", label: "No extra equipment" },
          { value: "Room temp", label: "Compact, easy to store" },
        ]} />
      </Section>
      {milkshake && <MenuGallery kind={kind} assets={assets} />}
      <Prepare kind={kind} />
      <FlavourRange kind={kind} />
      {!milkshake && <MenuGallery kind={kind} assets={assets} />}
      <Inside className={cx(local.band, local.pack)} sets={nutrition[kind]} tableTitle="Nutrition facts" fullMobile side={<>
        {!milkshake && <div className={local.allergens}><strong>Allergens</strong><p>Contains milk protein (sodium caseinate).</p></div>}
        <div className={local.storage}>
          <strong>Storage</strong>
          {milkshake ? <>
            <div><b>18 months</b><p>Unopened, from production date</p></div>
            <div><b>3 months</b><p>After opening, zip resealed</p></div>
            <div><b>Below 25 °C</b><p>Cool, dry place, away from sunlight</p></div>
          </> : <>
            <p>18 months unopened. Cool, dry and clean place below 25 °C, away from direct sunlight.</p>
            <p>HACCP and ISO 22000:2018 certified facility · Halal</p>
          </>}
          <SiteLink href="/find-your-distributor" className={styles.textLink}>Request your flavour’s spec sheet →</SiteLink>
        </div>
      </>} />
      <Faq className={local.faq} productName={product.name} items={milkshake ? milkshakeFaq : frappeFaq} line={`What baristas and buyers ask most about ${product.name}.`} mobileLimit={99} initiallyOpen={false} mobileDistributor />
    </main>
  );
}
