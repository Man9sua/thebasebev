import type { CSSProperties, ReactNode } from "react";
import { PartnerRequestModal } from "@/components/forms/PartnerRequestModal";
import { SampleRequestModal } from "@/components/forms/SampleRequestModal";
import { Reveal } from "@/components/motion/Reveal";
import type { Product } from "@/data/products";
import { productGlass } from "@/data/product-glass";
import productHeroes from "@/data/product-heroes.json";
import { productDesktop, WASH_SHAPE } from "@/data/product-desktop";
import { productMargins } from "@/data/product-margins";
import { productMobile, WASH_SHAPE as PHONE_WASH_SHAPE } from "@/data/product-mobile";
import { productScene } from "@/data/product-scene";
import { productShadows } from "@/data/product-shadows";
import { productWashes } from "@/data/product-washes";
import { isDark, luminance } from "@/lib/contrast";
import { productDetails } from "@/lib/site-pages";
import styles from "./ProductHero.module.css";

const heroes = productHeroes as Record<string, { image: string; band: string; bandFoot: string }>;

const SEALS = {
  halal: { src: "/images/seal-halal.webp", alt: "Halal certified" },
  haccp: { src: "/images/seal-haccp.webp", alt: "HACCP certified — food safety" },
} as const;

function Seal({ box, mark }: { box: "small" | "wide"; mark: keyof typeof SEALS }) {
  const seal = SEALS[mark];
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      className={`${styles.seal} ${box === "wide" ? styles.sealWide : styles.sealSmall}`}
      src={seal.src}
      alt={seal.alt}
      loading="eager"
      decoding="sync"
    />
  );
}

const MARKS = {
  pack: (
    <path
      d="M4 8.5 12 4.5l8 4v7L12 19.5 4 15.5v-7Zm0 0 8 4m0 0 8-4m-8 4v7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  chill: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 3.5v17M4.6 7.75l14.8 8.5M19.4 7.75l-14.8 8.5" />
      <path d="M3.5 3.5l17 17" />
    </g>
  ),
  quick: (
    <path
      d="M13.2 3.5 5.5 13.6h5.1l-.8 6.9 7.7-10.1h-5.1l.8-6.9Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  shelf: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7v5.4l3.6 2.2" />
    </g>
  ),
  quality: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M12 3.4 19 6.3v5.2c0 4-2.9 7.5-7 9.1-4.1-1.6-7-5.1-7-9.1V6.3l7-2.9Z" />
      <path d="m8.9 11.9 2.2 2.3 4-4.4" strokeLinecap="round" />
    </g>
  ),
} as const;

function featureMark(label: string): ReactNode {
  const text = label.toLowerCase();
  if (/pack|space|leak|portion|dosage/.test(text)) return MARKS.pack;
  if (/refriger|freez|ice cream|cold|chill/.test(text)) return MARKS.chill;
  if (/quick|fast|easy|hassle|ready|convenien|prepare/.test(text)) return MARKS.quick;
  if (/shelf|month|storage|store/.test(text)) return MARKS.shelf;
  return MARKS.quality;
}

function channels(colour: string | undefined): number[] | null {
  if (!colour || !/^#[0-9a-f]{6}$/i.test(colour)) return null;
  return [1, 3, 5].map((at) => Number.parseInt(colour.slice(at, at + 2), 16));
}

function apart(one: string | undefined, two: string | undefined): boolean {
  const a = channels(one);
  const b = channels(two);
  if (!a || !b) return true;
  return Math.max(...a.map((value, at) => Math.abs(value - b[at]))) > 12;
}

function darken(colour: string | undefined, keep = 0.82): string | undefined {
  const rgb = channels(colour);
  if (!rgb) return undefined;
  return `#${rgb.map((value) => Math.round(value * keep).toString(16).padStart(2, "0")).join("")}`;
}

export function ProductHero({ product }: { product: Product }) {
  const detail = productDetails[product.slug];
  const banner = heroes[product.slug];
  const margin = productMargins[product.slug];
  const glass = productGlass[product.slug];
  const card = productDesktop[product.slug];
  const scene = productScene[product.slug];
  const sceneWide = scene?.desktop.length ? scene.desktop : undefined;
  const sceneNarrow = scene?.phone.length ? scene.phone : undefined;
  const wash = productWashes[product.slug];
  const paragraphs = detail?.description.length ? detail.description : [product.description];
  const features = (detail?.features ?? []).slice(0, 4).reverse();

  const washFrom = card?.washIn ?? wash?.from ?? banner?.band;
  const washTo = card?.washOut ?? wash?.to ?? banner?.bandFoot;
  const onDark = isDark(washTo ?? "#ffffff");
  const plain = !card?.washIn && !onDark;
  const paleWash = luminance(washTo ?? "#ffffff") > 0.72;
  const shade = darken(washTo) ?? product.backgroundColor;
  const tile = card?.panel ?? shade;
  const strip = apart(card?.panel, washTo) ? (card?.panel ?? shade) : shade;
  const stripDark = isDark(strip);

  const title = product.hyphenatedName ?? product.name;
  const headline = detail?.h1 ?? product.headline;
  const showHeadline = headline !== product.name;

  const phone = productMobile[product.slug];
  const phoneWash = phone?.washIn
    ? { from: phone.washIn, to: phone.washOut ?? phone.washIn }
    : wash;
  const phoneDark = phone ? isDark(phone.panel) : false;

  const vars: CSSProperties & Record<string, string | number> = {
    "--tile": product.backgroundColor,
    "--tile-panel": tile,
    "--strip": strip,
    "--panel-ink": stripDark ? "var(--tbb-white)" : "var(--tbb-ink)",
    "--panel-ink-soft": stripDark ? "rgba(255, 255, 255, 0.76)" : "var(--tbb-ink-soft)",
    "--d-pack-left": card?.pouch.left ?? 106.85,
    "--d-pack-top": card?.pouch.top ?? 137.38,
    "--d-pack-width": card?.pouch.width ?? 385.73,
    "--d-pack-height": card?.pouch.height ?? 561.57,
    "--wash-shape": card?.washShape ?? WASH_SHAPE,
  };
  if (productShadows[product.slug]) vars["--shade"] = productShadows[product.slug];
  if (card?.mark !== undefined) vars["--mark-desk"] = card.mark;
  if (card?.markClip) vars["--mark-clip"] = card.markClip;
  if (card?.markFill) vars["--mark-fill"] = card.markFill;
  if (washFrom) vars["--wash-from"] = washFrom;
  if (washTo) vars["--wash-to"] = washTo;
  if (card?.edge) vars["--edge"] = card.edge;
  if (banner) {
    vars["--band"] = banner.band;
    vars["--band-foot"] = banner.bandFoot;
  }
  if (phone) {
    vars["--m-panel"] = phone.panel;
    if (phone.mark !== undefined) vars["--mark-phone"] = phone.mark;
    vars["--m-wash-shape"] = phone.washShape ?? PHONE_WASH_SHAPE;
    if (phoneWash) {
      vars["--m-wash-from"] = phoneWash.from;
      vars["--m-wash-to"] = phoneWash.to;
    }
    if (phone.shade) vars["--m-shade"] = phone.shade;
    if (phone.glass) {
      vars["--m-glass-left"] = phone.glass.left;
      vars["--m-glass-top"] = phone.glass.top + 108;
      vars["--m-glass-width"] = phone.glass.width;
      vars["--m-glass-height"] = phone.glass.height;
    }
  }

  return (
    <section
      className={[
        styles.hero,
        product.slug === "tea" ? styles.tea : "",
        product.slug === "sugar-free" ? styles.sugarFree : "",
        product.slug === "garnish" ? styles.garnish : "",
        onDark ? styles.onDark : "",
        plain ? styles.plain : "",
        paleWash ? styles.paleWash : "",
        phoneDark ? styles.panelDark : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={vars}
      data-hero
      aria-labelledby="product-title"
    >
      <span className={styles.mark} aria-hidden="true">
        <span className={styles.markThe} />
        <span className={styles.markWord} />
      </span>

      {(
        [
          ["desktop", sceneWide],
          ["phone", sceneNarrow],
        ] as const
      ).map(([mode, layers]) =>
        layers?.map((layer, index) => {
          const style = {
            ["--a" as string]: layer.m[0],
            ["--b" as string]: layer.m[1],
            ["--c" as string]: layer.m[2],
            ["--d" as string]: layer.m[3],
            ["--e" as string]: layer.m[4],
            ["--f" as string]: layer.m[5],
            ...(layer.z !== undefined ? { ["--scene-z" as string]: layer.z } : {}),
            ...(layer.opacity ? { opacity: layer.opacity } : {}),
            ...(layer.round ? { borderRadius: "50%" } : {}),
          } as CSSProperties;
          const className = `${styles.sceneLayer} ${
            mode === "phone" ? styles.scenePhone : styles.sceneWide
          }${layer.back ? ` ${styles.sceneBack}` : ""}`;
          const key = `${mode}-${index}`;
          const clip = layer.mask && {
            ["--mx" as string]: layer.mask[0],
            ["--my" as string]: layer.mask[1],
            ["--mw" as string]: layer.mask[2],
            ["--mh" as string]: layer.mask[3],
            ...(layer.z !== undefined ? { ["--scene-z" as string]: layer.z } : {}),
          } as CSSProperties;
          const drawn = layer.src ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={key}
              className={className}
              src={layer.src}
              alt=""
              loading="eager"
              decoding="sync"
              style={style}
            />
          ) : (
            <span
              key={key}
              className={className}
              aria-hidden="true"
              style={{ ...style, background: layer.paint }}
            />
          );
          return clip ? (
            <span
              key={key}
              className={`${styles.sceneClip} ${
                mode === "phone" ? styles.scenePhone : styles.sceneWide
              }${layer.back ? ` ${styles.sceneBack}` : ""}`}
              aria-hidden="true"
              style={clip}
            >
              {drawn}
            </span>
          ) : (
            drawn
          );
        }),
      )}

      <div
        className={[
          styles.stage,
          sceneWide && !sceneNarrow ? styles.stageNarrowOnly : "",
          sceneNarrow && !sceneWide ? styles.stageWideOnly : "",
        ]
          .filter(Boolean)
          .join(" ")}
        hidden={Boolean(sceneWide && sceneNarrow)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.pack}
          src={`/images/pack-${product.slug}.webp`}
          alt={`${product.name} base by the Base, ${detail?.weight ?? "500g"} pouch`}
          fetchPriority="high"
          decoding="sync"
        />

        {glass?.image && (
          <div
            className={styles.glass}
            style={{
              ["--glass-left" as string]: glass.left,
              ["--glass-top" as string]: glass.top,
              ["--glass-width" as string]: glass.width,
              ["--glass-height" as string]: glass.height,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={glass.image} alt="" loading="eager" decoding="sync" />
          </div>
        )}
      </div>

      <div className={styles.seals}>
        <Seal box="small" mark="haccp" />
        <Seal box="wide" mark="halal" />
      </div>

      <div className={styles.frame}>
        <div className={styles.copy}>
          <Reveal delay={60} distance={20}>
            <h1 id="product-title" className={styles.title}>
              {title}
            </h1>
          </Reveal>

          {showHeadline && (
            <Reveal as="h2" className={styles.headline} delay={90} distance={16}>
              {headline}
            </Reveal>
          )}

          {detail?.tagline && (
            <Reveal as="p" className={styles.tagline} delay={120} distance={16}>
              {detail.tagline}
            </Reveal>
          )}

          <Reveal className={styles.body} delay={170} distance={16}>
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
          </Reveal>

          {margin && (
            <Reveal className={styles.margin} delay={210} distance={16}>
              <h2 className={styles.marginTitle}>Approximately Profit Margin</h2>
              <div className={styles.marginCard}>
                <div className={styles.marginSide}>
                  <p className={styles.marginLabel}>{margin.legacyLabel}</p>
                  <p className={styles.marginValue}>{margin.legacy}</p>
                </div>
                <span className={styles.marginVs} aria-hidden="true">
                  vs
                </span>
                <div className={styles.marginSide}>
                  <p className={styles.marginLabel}>with the Base</p>
                  <p className={styles.marginValue}>{margin.base}</p>
                </div>
              </div>
            </Reveal>
          )}

          <Reveal className={styles.actions} delay={250} distance={16}>
            <SampleRequestModal className={styles.primary} productName={product.name} />
            <PartnerRequestModal className={styles.secondary} productName={product.name} />
          </Reveal>
        </div>

        {features.length > 0 && (
          <Reveal className={styles.features} delay={300} distance={16}>
            {features.map((feature) => (
              <div key={feature.label} className={styles.feature}>
                <span className={styles.featureMark} aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="presentation">
                    {featureMark(feature.label)}
                  </svg>
                </span>
                <p className={styles.featureLabel}>{feature.label}:</p>
                <p className={styles.featureValue}>{feature.value}</p>
              </div>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}
