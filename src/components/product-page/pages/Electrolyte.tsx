import type { CSSProperties } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { Faq, Hero, Section, cx, productPageStyles as styles } from "../blocks";
import type { ProductPageProps } from "../types";
import { RangePhotoPlaceholder, heroSize, rangeHeroClass } from "./Range";
import local from "./Electrolyte.module.css";

const flavours = [
  { name: "Orange", color: "#F28C28", code: "EPD-001-st5" },
  { name: "Pomegranate", color: "#B3263E", code: "EPD-002-st5" },
  { name: "Lemon mint", color: "#B8D86B", code: "EPD-003-st5" },
  { name: "Lemon", color: "#F2D64B", code: "EPD-004-st5" },
  { name: "Mango", color: "#F5A623", code: "EPD-005-st5" },
] as const;

const formats = [
  { label: "Single serve", name: "5 g stick", text: "For cafés, gyms and retail. One stick per drink." },
  { label: "Bar format", name: "500 g pack", text: "For drink stations and juice bars. Dose with a scoop." },
  { label: "Bar format", name: "1 kg pack", text: "For high-volume outlets and chains." },
  { label: "Wholesale", name: "25 kg bulk", text: "For manufacturers and repackers. MOQ 500 kg." },
] as const;

const faq = [
  { q: "Where can I find ingredients and nutrition?", a: "Request the specification sheet for your chosen flavour from our team." },
  { q: "Can we add it to hot or milk drinks?", a: "No. Electrolytes work in cold, non-dairy drinks: water, juice, lemonades, smoothies and iced coffee." },
  { q: "What is the minimum order?", a: "Sticks, 500 g and 1 kg packs through your distributor. Bulk 25 kg bags from 500 kg per order." },
  { q: "Can you produce it under our brand?", a: "Yes. Private label is available for sticks, packs and bulk, from 500 kg." },
  { q: "Where can I buy it?", a: "Through your local the Base distributor. Request a sample and we will connect you." },
];

export function ElectrolytePage({ product }: ProductPageProps) {
  return (
    <main className={styles.page} style={{ "--pp-bg": "#F6F4F0" } as CSSProperties}>
      <Hero
        className={rangeHeroClass}
        style={heroSize(92, 52)}
        productName={product.name}
        title="Electrolyte"
        lead={{
          desktop: "Electrolyte powder drink in five flavours. In single-serve sticks, bar packs and 25 kg bulk.",
          mobile: "Electrolyte powder drink in five flavours. Sticks, bar packs and 25 kg bulk.",
        }}
        image={<RangePhotoPlaceholder />}
      />
      <Section title="Product specifications" label="Product specifications">
        <p className={local.text}>Ask our team for ingredients, nutrition and preparation instructions for your chosen flavour.</p>
        <SiteLink href="/contacts" className={styles.textLink}>Request a specification sheet →</SiteLink>
      </Section>
      <Section title="Five flavours" label="Flavours">
        <div className={local.flavours}>
          {flavours.map((item) => (
            <div key={item.code} className={local.flavour}>
              <div className={local.photo} style={{ background: item.color }} aria-hidden="true" />
              <div className={local.copy}>
                <span className={local.name}>{item.name}</span>
                <span className={cx(local.code, styles.desktopOnly)}>5 g stick · {item.code}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Four formats" label="Formats">
        <div className={local.formats}>
          {formats.map((item, i) => (
            <div key={item.name} className={cx(local.format, i === 3 && local.bulk)}>
              <span className={cx(local.label, styles.desktopOnly)}>{item.label}</span>
              <span className={local.formatName}>{item.name}</span>
              <span className={local.text}>{item.text}</span>
            </div>
          ))}
        </div>
        <div className={local.privateLabel}>
          <div>
            <span className={local.privateTitle}>Private label from 500 kg</span>
            <span className={cx(local.text, styles.desktopOnly)}>Your brand on sticks, packs or bulk. Your flavour on request.</span>
          </div>
          <SiteLink href="/rnd#rnd-form" className={cx(styles.button, styles.outline)}>Talk to R&amp;D</SiteLink>
        </div>
      </Section>
      <Faq productName={product.name} items={faq} line={null} distributor={false} mobileLimit={99} />
    </main>
  );
}
