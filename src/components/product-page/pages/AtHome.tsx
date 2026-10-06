import type { CSSProperties } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { SHOP_URL } from "@/lib/site-config";
import { Breadcrumbs, DistributorLink, Faq, cx, productImage, productPageStyles as styles } from "../blocks";
import type { ProductPageProps } from "../types";
import { AtHomeChips } from "./AtHomeChips";
import local from "./AtHome.module.css";

/**
 * At home ("At Home Retail Page", desktop 1440 / mobile 390): the café
 * recipes in 150 g retail pouches. Not a single product but a shelf, so it
 * has its own hero — two ways to buy instead of a sample — and the pouches
 * laid out by range. "Buy online" is the same shop the catalogue sells
 * through.
 */

const SLUG = "at-home";

type Pouch = { name: string; text: string; code: string; image?: string };

const shelves: readonly { id: string; title: string; note: string; pouches: readonly Pouch[] }[] = [
  {
    id: "matcha",
    title: "Matcha",
    note: "15 g + 150 ml hot milk · 10 cups",
    pouches: [
      { name: "Matcha Mango Coconut", text: "Tropical and creamy", code: "150 g · MT-015-F150", image: "matcha-mango-coconut" },
      { name: "Matcha Blue", text: "Butterfly pea and lemongrass", code: "150 g · MT-016-F150", image: "matcha-blue" },
      { name: "Matcha Pink", text: "Dragon fruit and beetroot", code: "150 g · MT-017-F150", image: "matcha-pink" },
      { name: "Matcha Raspberry", text: "Bright raspberry", code: "150 g · MT-008-F150", image: "matcha-raspberry" },
      { name: "Matcha Strawberry", text: "Ripe strawberry", code: "150 g · MT-023-F150", image: "matcha-strawberry" },
    ],
  },
  {
    id: "chocolate",
    title: "Chocolate",
    note: "25 g + 150 ml hot milk · 6 cups",
    pouches: [
      { name: "Chocolate Strawberry", text: "Choco berry", code: "150 g · CC-011-F150", image: "chocolate-strawberry" },
      { name: "Chocolate Orange", text: "Citrus and cocoa", code: "150 g · CC-012-F150", image: "chocolate-orange" },
      // No pack shot yet: the plate stands empty in the shelf's colour.
      { name: "Chocolate Mocha", text: "Cocoa and coffee", code: "150 g · CC-010-F150" },
    ],
  },
  {
    id: "iced-tea",
    title: "Iced Tea",
    note: "15 g + 100 ml water + ice · 10 glasses",
    pouches: [
      { name: "Iced Tea Lemon", text: "Zesty, real lemon extract", code: "150 g · IT-021-F150", image: "iced-tea-lemon" },
      { name: "Iced Tea Peach", text: "Smooth and fruity", code: "150 g · IT-022-F150", image: "iced-tea-peach" },
    ],
  },
  {
    id: "chai-shake-cola",
    title: "Chai, shake and cola",
    note: "One of each",
    pouches: [
      { name: "Chai Latte Karak", text: "Cardamom and black tea · 25 g + 150 ml hot water", code: "150 g · CL-006-F150", image: "chai-latte-karak" },
      { name: "Milkshake Cookies & Cream", text: "Real cookie crumbs · 30 g + milk + ice, blend", code: "150 g · MS-023-F150", image: "milkshake-cookies-cream" },
      { name: "Cordial Dates Cola", text: "Dates powder, no sweetener · 15 g + sparkling water", code: "150 g · CR-024-F150", image: "cordial-dates-cola" },
    ],
  },
];

const heroPouches = ["matcha-blue", "chocolate-strawberry", "iced-tea-peach", "milkshake-cookies-cream"];

const faq = [
  {
    q: "How do I make it at home?",
    a: "Each pouch has the recipe on the back and a QR code with video instructions. Most drinks need only milk or water.",
  },
  { q: "Can my café sell these?", a: "Yes. Order through your local the Base distributor; the display kit comes with the first order." },
  { q: "Where can I buy online?", a: "In the the Base online shop." },
];

const pouchName = (image: string) =>
  shelves.flatMap((shelf) => shelf.pouches).find((pouch) => pouch.image === image)?.name ?? "";

export function AtHomePage({ product, headline }: ProductPageProps) {
  return (
    <main className={styles.page} style={{ "--pp-bg": "#F6F4F0" } as CSSProperties}>
      <section className={local.hero} aria-labelledby="product-title">
        <div className={local.heroCopy}>
          <Breadcrumbs current="At home" />
          <h1 id="product-title" className={cx(styles.heroTitle, local.heroTitle)}>
            Crafted for cafés,
            <br /> now at home
          </h1>
          {headline && <h2 className={styles.heroHeadline}>{headline}</h2>}
          <p className={styles.heroLead}>
            <span className={styles.desktopOnly}>
              The same café recipes in 150 g pouches. Guests pick one up with their coffee and make the drink at home in
              a minute.
            </span>
            <span className={styles.mobileOnly}>The same café recipes in 150 g pouches, to make at home in a minute.</span>
          </p>
          <div className={styles.heroActions}>
            {/* Out of the app: the shop is another platform, as on the catalogue. */}
            <a className={cx(styles.button, styles.red)} href={SHOP_URL} data-shop-link>
              Buy online ↗
            </a>
            <DistributorLink>Stock it in your café</DistributorLink>
          </div>
        </div>
        <div className={local.heroGrid}>
          {heroPouches.map((image, i) => (
            <div key={image} className={cx(local.plate, i > 1 && styles.desktopOnly)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                {...productImage(SLUG, image, [400, 600])}
                sizes="(max-width: 1023px) 45vw, 300px"
                alt={`${pouchName(image)} 150 g pouch`}
                fetchPriority={i < 2 ? "high" : undefined}
              />
            </div>
          ))}
        </div>
      </section>

      <AtHomeChips
        route={product.route}
        shelves={shelves.map((shelf) => ({ id: shelf.id, label: `${shelf.title} · ${shelf.pouches.length}` }))}
      />

      {shelves.map((shelf) => (
        <section key={shelf.id} id={shelf.id} className={local.shelf} aria-labelledby={`${shelf.id}-title`}>
          <div className={local.shelfHead}>
            <h2 id={`${shelf.id}-title`} className={cx(styles.title, local.shelfTitle)}>
              {shelf.title}
            </h2>
            <span className={local.shelfNote}>{shelf.note}</span>
          </div>
          <div className={local.pouches}>
            {shelf.pouches.map((pouch) => (
              <div key={pouch.name} className={local.pouch}>
                <div className={cx(local.plate, !pouch.image && local.plateEmpty)}>
                  {pouch.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      {...productImage(SLUG, pouch.image, [400, 600])}
                      sizes="(max-width: 1023px) 45vw, 240px"
                      alt={`${pouch.name} 150 g pouch`}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
                <div className={local.pouchCopy}>
                  <span className={local.pouchName}>{pouch.name}</span>
                  <span className={local.pouchText}>{pouch.text}</span>
                  <span className={cx(local.pouchCode, styles.desktopOnly)}>{pouch.code}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className={local.till} aria-labelledby="at-home-till">
        <div className={local.tillInner}>
          <div className={local.tillCopy}>
            <h2 id="at-home-till" className={cx(styles.title, local.tillTitle)}>
              A shelf by
              <br /> the till
            </h2>
            <SiteLink href="/distributors" className={cx(styles.button, styles.red, local.tillButton, styles.desktopOnly)}>
              Stock it in your café
            </SiteLink>
          </div>
          <div className={local.tillCards}>
            {[
              { title: "For guests", text: "Take the café drink home. One pouch makes 5–10 drinks." },
              { title: "For your café", text: "A shelf next to the till. No extra staff, extra revenue per guest." },
              { title: "Display kit", text: "Shelf stand and price cards come with the first order." },
            ].map((card) => (
              <div key={card.title} className={local.tillCard}>
                <span className={local.tillCardTitle}>{card.title}</span>
                <span className={local.tillCardText}>{card.text}</span>
              </div>
            ))}
          </div>
          <SiteLink href="/distributors" className={cx(styles.button, styles.red, local.tillButton, styles.mobileOnly)}>
            Stock it in your café
          </SiteLink>
        </div>
      </section>

      <Faq productName={product.name} items={faq} line={null} sample={false} distributor={false} />
    </main>
  );
}
