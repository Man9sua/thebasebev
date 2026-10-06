import { PublicLink as Link } from "@/components/site/PublicLink";
import { CATALOG_GROUPS, CATALOG_PRODUCTS } from "@/data/catalog";
import { MARKETS, SHOP_URL } from "@/lib/site-config";
import styles from "./SitemapPage.module.css";

/**
 * Every page of the site, by what it is for.
 *
 * Products and markets are read from the catalogue and the market list, so
 * this page cannot fall behind either. An entry without an `href` is a page
 * the site plan calls for that does not exist yet: it is drawn with the red
 * dot, as plain text, so the index never links to a 404.
 */

type SitemapLink = {
  label: string;
  href?: string;
  /** Leaves this site (the shop), so a plain anchor rather than a route. */
  external?: boolean;
};

type SitemapSection = {
  title: string;
  links: readonly SitemapLink[];
};

const SECTIONS: readonly SitemapSection[] = [
  {
    title: "Company",
    links: [
      { href: "/", label: "Home" },
      { href: "/about-us", label: "About Us" },
      { href: "/contacts", label: "Contacts" },
      { label: "Careers" },
    ],
  },
  {
    title: "Work with us",
    links: [
      { href: "/distributors", label: "Distributors" },
      { href: "/private-labeling", label: "Private Labeling" },
      { href: "/rnd", label: "R&D" },
      { href: "/wholesale-strategy", label: "Wholesale Strategy" },
      { label: "Request samples" },
      { href: SHOP_URL, label: "Shop", external: true },
    ],
  },
  {
    title: "Quality",
    links: [{ label: "Certificates" }, { label: "FAQ" }],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources", label: "Resources Hub" },
      { href: "/resources/blog", label: "Blog" },
      { href: "/resources/glossary", label: "Glossary" },
      { href: "/resources/tools", label: "HoReCa Cost Calculator & Tools" },
      { href: "/knowledge-recipes", label: "Recipe Base" },
    ],
  },
];

const LEGAL_SECTION: SitemapSection = {
  title: "Legal",
  links: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms & Conditions" },
    { label: "Cookie Policy" },
  ],
};

/** The live market links home; the rest are drawn as planned. */
const MARKET_LINKS: readonly SitemapLink[] = MARKETS.map((market) => ({
  label: `${market.name} · ${market.language}`,
  href: market.live ? "/" : undefined,
}));

const PRODUCT_SECTIONS: readonly SitemapSection[] = CATALOG_GROUPS.map((group) => ({
  title: group.label,
  links: CATALOG_PRODUCTS.filter((product) => product.categoryId === group.id).map((product) => ({
    href: product.route,
    label: product.name,
  })),
}));

function SitemapLinkList({ links }: { links: readonly SitemapLink[] }) {
  return (
    <ul className={styles.linkList}>
      {links.map((link) => (
        <li key={link.label}>
          {!link.href ? (
            <span className={`${styles.link} ${styles.planned}`}>
              <span>{link.label}</span>
              <span className={styles.dot} aria-hidden="true" />
              <span className="tbb-visually-hidden"> (coming soon)</span>
            </span>
          ) : link.external ? (
            <a className={styles.link} href={link.href} target="_blank" rel="noopener">
              <span>{link.label}</span>
              <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <Link className={styles.link} href={link.href} prefetch={false}>
              <span>{link.label}</span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

function SectionHeading({ number, title, count }: { number: number; title: string; count?: number }) {
  return (
    <div className={styles.sectionHeading}>
      <span className={styles.sectionNumber} aria-hidden="true">
        {String(number).padStart(2, "0")}
      </span>
      <h2>
        {title}
        {count !== undefined && <span className={styles.count}> {count}</span>}
      </h2>
    </div>
  );
}

export function SitemapPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>Index & Navigation</p>
          <h1 className={styles.title}>Sitemap</h1>
          <p className={styles.lede}>
            Browse all main pages, resources and product categories.
          </p>
        </header>

        <nav className={styles.sitemap} aria-label="Website sitemap">
          <div className={styles.primaryGrid}>
            {SECTIONS.slice(0, 3).map((section, index) => (
              <section className={styles.card} key={section.title}>
                <SectionHeading number={index + 1} title={section.title} />
                <SitemapLinkList links={section.links} />
              </section>
            ))}
          </div>

          <section className={`${styles.card} ${styles.products}`}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionNumber} aria-hidden="true">
                04
              </span>
              <h2>
                Products <span className={styles.count}>{CATALOG_PRODUCTS.length}</span>
              </h2>
              <Link className={styles.catalogLink} href="/catalog" prefetch={false}>
                All Products
              </Link>
            </div>

            <div className={styles.productGrid}>
              {PRODUCT_SECTIONS.map((section) => (
                <section className={styles.productGroup} key={section.title}>
                  <h3>{section.title}</h3>
                  <SitemapLinkList links={section.links} />
                </section>
              ))}
            </div>
          </section>

          <div className={styles.pairGrid}>
            <section className={styles.card}>
              <SectionHeading number={5} title={SECTIONS[3].title} />
              <SitemapLinkList links={SECTIONS[3].links} />
            </section>
            <section className={styles.card}>
              <SectionHeading number={6} title="Markets" count={MARKETS.length} />
              <SitemapLinkList links={MARKET_LINKS} />
            </section>
          </div>

          <section className={`${styles.card} ${styles.legal}`}>
            <SectionHeading number={7} title={LEGAL_SECTION.title} />
            <SitemapLinkList links={LEGAL_SECTION.links} />
          </section>

          <p className={styles.legend}>
            <span className={styles.dot} aria-hidden="true" /> Coming soon
          </p>
        </nav>
      </div>
    </main>
  );
}
