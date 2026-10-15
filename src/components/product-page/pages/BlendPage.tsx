import type { CSSProperties } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import {
  DistributorLink, Faq, FlavourEnquiryLink, Inside, Kit, MarketingKitAction, SampleButton,
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
    name: "Vanilla", caption: "per 30 g serving · 17 per pack",
    mobileCaption: "per 30 g · 17 per pack",
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

const heroMedia = {
  milkshake: { ...productImage("milkshake", "hero-pouch", [400, 672]), width: 672, height: 780, alt: "Milkshake 500 g doypack" },
  frappe: { ...productImage("frappe", "hero-pack-glass", [600, 822]), width: 822, height: 963, alt: "Frappe doypack with prepared drink" },
};

function BlendHero({ kind, product, assets }: ProductPageProps & { kind: Blend }) {
  const milkshake = kind === "milkshake";
  return (
    <section className={local.hero} aria-labelledby="product-title">
      <div className={local.heroGrid}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...heroMedia[kind]} alt={heroMedia[kind].alt} sizes="(max-width: 1023px) calc(100vw - 40px), (max-width: 1440px) 36.12vw, 520px" fetchPriority="high" className={local.heroPhoto} />
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

const milkshakeRecipe = [
  { ingredient: "the Base Milkshake", amount: "30 g" },
  { ingredient: "Dairy or plant-based milk", amount: "200 ml" },
  { ingredient: "Ice cubes", amount: "100 ml" },
  { ingredient: "Your syrup or topping", amount: "To taste" },
];

const milkshakeMethod = [
  { label: "Add", text: "Base, milk and ice into the blender jug." },
  { label: "Blend", text: "30 seconds until thick and smooth." },
  { label: "Finish", text: "Top with syrup, cream or a topping and serve." },
];

const frappeMethod = [
  { label: "Milk", value: "200 ml", note: "Any fat content or plant-based" },
  { label: "the Base", value: "35 g", note: "One scoop" },
  { label: "Espresso", value: "30 ml", note: "One shot" },
  { label: "Ice", value: "150 g", note: "Cubes" },
  { label: "Blend 30 seconds", value: "16 oz cup", note: "Smooth and well combined" },
];

function MilkshakeRecipe() {
  return (
    <section className={cx(styles.section, local.band, local.recipe)} aria-labelledby="milkshake-recipe-title">
      <div className={local.recipeIntro}>
        <h2 id="milkshake-recipe-title" className={styles.title}>One cup,<br className={styles.desktopOnly} /> one recipe</h2>
        <p>The same milkshake from every barista, in every outlet.</p>
      </div>
      <div className={local.recipeCard}>
        <div className={local.recipeIngredients}>
          <p className={local.recipeYield}>For one 12 oz cup</p>
          <dl>{milkshakeRecipe.map(({ ingredient, amount }) => <div key={ingredient}>
            <dt>{ingredient}</dt><dd>{amount}</dd>
          </div>)}</dl>
        </div>
        <SiteLink href="/knowledge-recipes" className={local.recipeLink}>
          <span className={styles.desktopOnly}>More recipes in Recipe base →</span>
          <span className={styles.mobileOnly}>More recipes →</span>
        </SiteLink>
      </div>
      <ol className={local.recipeMethod}>{milkshakeMethod.map(({ label, text }) => <li key={label}>
        <h3>{label}</h3><p>{text}</p>
      </li>)}</ol>
    </section>
  );
}

function PrepareFrappe() {
  return (
    <Section className={local.band} title="How to prepare" label="How to prepare">
      <div className={cx(local.formula, local.frappeFormula)}>
        {frappeMethod.map((step, i) => <div key={step.label} className={local.formulaPart}>
          {i > 0 && <span className={local.operator} aria-hidden="true">{i === frappeMethod.length - 1 ? "=" : "+"}</span>}
          <div className={cx(local.ingredient, i === frappeMethod.length - 1 && local.result)}>
            <span>{step.label}</span><strong>{step.value}</strong><span>{step.note}</span>
          </div>
        </div>)}
      </div>
      <div className={local.cafeFinish}><strong>Finish like a café</strong>
        <div><b>Flavour</b><p>Purée or syrup to taste, 20–25 ml</p></div>
        <div><b>Walls</b><p>Coat the inside of the cup with caramel or chocolate topping</p></div>
        <div><b>Top</b><p>Topping, cheese foam or cold foam</p></div>
      </div>
    </Section>
  );
}

function FlavourRange({ kind }: { kind: Blend }) {
  const milkshake = kind === "milkshake";
  return (
    <Section className={cx(local.band, local.flavourBand, milkshake && local.milkshakeFlavours)} title={`${flavours[kind].length} flavours`} label="Flavours">
      {milkshake && <p className={local.flavourIntro}>Each one built on the same base, so texture and foam stay the same.</p>}
      <div className={cx(local.flavourLayout, !milkshake && local.frappeFlavours)}>
        <div className={local.flavours}>{flavours[kind].map(name => <div className={local.flavour} key={name}>{name}</div>)}</div>
        <div className={local.own}><div><strong>Your own flavour</strong>{milkshake && <p>Our lab develops a flavour for your menu or your brand.</p>}</div><FlavourEnquiryLink className={cx(styles.button, styles.red)}>Develop a flavour</FlavourEnquiryLink></div>
      </div>
    </Section>
  );
}

function MenuGallery({ kind, assets }: { kind: Blend; assets: ProductPageProps["assets"] }) {
  const milkshake = kind === "milkshake";
  return (
    <Section className={cx(local.band, local.menu)} title={<>Ready for<br />your menu</>} label="Ready for your menu" side={milkshake ? "Eight serves from our lab, all made with the same base. Use the photos in your menu and delivery apps." : undefined}>
      <div className={cx(local.gallery, milkshake && local.galleryMilkshake)}>
        {menuPhotos[kind].map((photo) => (
          <div key={photo.src} className={local.menuPhoto}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img {...photo} sizes={`(max-width: 1023px) 46vw, calc((min(100vw, 1920px) - 192px) / ${milkshake ? 4 : 5})`} alt={`${milkshake ? "Milkshake" : "Frappe"} made with the Base`} loading="lazy" decoding="async" />
          </div>
        ))}
      </div>
      {milkshake ? (
        <Kit className={local.menuKit} href={assets.marketingKit} text={<>Drink photos on white, for menus.<br />Square and vertical formats for Talabat, Deliveroo and Instagram.<br />Short descriptions in English and Arabic.</>} />
      ) : <MarketingKitAction href={assets.marketingKit} className={local.menuAction} />}
    </Section>
  );
}

export function BlendPage(props: ProductPageProps & { kind: Blend }) {
  const { kind, product, assets } = props;
  const milkshake = kind === "milkshake";
  return (
    <main className={cx(styles.page, local.page, !milkshake && local.frappe)} style={{ "--pp-bg": "#F6F6F4", "--blend-tint": milkshake ? "#F3E4E7" : "#EBDCCB" } as CSSProperties}>
      <BlendHero {...props} />
      <Section className={cx(local.band, milkshake && local.service)} title="Made for service" label="Made for service">
        {milkshake && <p className={local.serviceIntro}>Fast at the bar, simple to store, the same result from every barista.</p>}
        <Stats className={local.stats} items={[
          { value: "30 sec", label: "Preparation time" },
          { value: milkshake ? "17 cups" : "14 cups", label: "From one 500 g doypack" },
          { value: milkshake ? "12 oz" : "16 oz", label: "Per serving" },
          { value: "18 months", label: "Shelf life" },
          { value: "Any blender", label: "No extra equipment" },
          { value: "Room temp", label: "Compact, easy to store" },
        ]} />
      </Section>
      {milkshake ? <><MilkshakeRecipe /><MenuGallery kind={kind} assets={assets} /></> : <PrepareFrappe />}
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
