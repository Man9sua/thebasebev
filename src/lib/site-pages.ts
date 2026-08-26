import fs from "node:fs";
import path from "node:path";
import { getProduct } from "@/data/products";
import legacyImageVariants from "@/data/legacy-image-variants.json";
import catalogTilesJson from "@/data/catalog-tiles.json";
import productDetailsJson from "@/data/product-details.json";

export const SITE_ORIGIN = "https://thebasebev.com";
export const EXPORT_LAST_MODIFIED = new Date("2026-08-20T20:38:39.000Z");

type RouteDefinition = {
  route: string;
  file: string;
  indexable: boolean;
};

const friendlyRoutes: RouteDefinition[] = [
  { route: "/", file: "page62361237.html", indexable: true },
  { route: "/main", file: "page62361237.html", indexable: false },
  { route: "/wholesale-strategy", file: "page147468696.html", indexable: true },
  { route: "/contacts", file: "page62585333.html", indexable: true },
  { route: "/about-us", file: "page62588185.html", indexable: true },
  { route: "/resources", file: "page151583806.html", indexable: true },
  { route: "/distributors", file: "page65033993.html", indexable: true },
  { route: "/resources/blog", file: "page151592086.html", indexable: true },
  { route: "/private-labeling", file: "page120311356.html", indexable: true },
  { route: "/sitemap", file: "page155556086.html", indexable: true },
  { route: "/resources/glossary", file: "page151592696.html", indexable: true },
  { route: "/resources/tools", file: "page151679366.html", indexable: true },
  { route: "/rnd", file: "page155598016.html", indexable: true },
  { route: "/raf-coffee", file: "page62448803.html", indexable: true },
  { route: "/cream-latte", file: "page62494049.html", indexable: true },
  { route: "/chai-latte", file: "page62497031.html", indexable: true },
  { route: "/milkshake", file: "page62508381.html", indexable: true },
  { route: "/frappe", file: "page62510271.html", indexable: true },
  { route: "/iced-tea", file: "page62515411.html", indexable: true },
  { route: "/cordial", file: "page62539863.html", indexable: true },
  { route: "/topping", file: "page62541199.html", indexable: true },
  { route: "/matcha", file: "page62544887.html", indexable: true },
  { route: "/chocolate", file: "page62565397.html", indexable: true },
  { route: "/sugar-syrup", file: "page62566191.html", indexable: true },
  { route: "/vending", file: "page62573319.html", indexable: true },
  { route: "/jam", file: "page62574449.html", indexable: true },
  { route: "/garnish", file: "page62576005.html", indexable: true },
  { route: "/sugar-free", file: "page62578053.html", indexable: true },
  { route: "/tea", file: "page62581091.html", indexable: true },
  { route: "/catalog", file: "page114743626.html", indexable: true },
  { route: "/thank-you-order", file: "page77299576.html", indexable: false },
  { route: "/terms", file: "page68443067.html", indexable: false },
  { route: "/privacy", file: "page68443503.html", indexable: false },
  { route: "/thank-you-form", file: "page77849746.html", indexable: false },
  { route: "/cabinet", file: "page154764216.html", indexable: false },
  { route: "/retail", file: "page114837666.html", indexable: false },
  { route: "/knowledge-recipes", file: "page154758576.html", indexable: false },
  { route: "/not-found", file: "page115314536.html", indexable: false },
  { route: "/link", file: "page65943847.html", indexable: false },
];

const tildaProductPaths = [
  "194500823312-sugar-free",
  "207187094752-frappe",
  "293702296702-iced-tea",
  "296069682122-chocolate",
  "316933484392-garnish",
  "324849428612-jam",
  "389328196132-milkshake",
  "466013811412-raf",
  "778280145182-cordial",
  "781170478702-cream-latte",
  "827401503212-chai-latte",
  "888812727292-sugar-syrop",
  "975474893862-matcha",
];

export type ProductSpec = { label: string; value: string; icon?: string };

/**
 * The comparative table, rebuilt from the coordinates the zero block drew it
 * at. A cell is a figure, a tick or a cross, or nothing at all.
 */
export type ProductCalculation = {
  title: string;
  columns: string[];
  rows: (string | boolean | null)[][];
};

export type ProductDetail = {
  h1: string | null;
  /**
   * The exported records React now renders itself, by name. Every one of them
   * is cut out of the served markup — see `dropReplacedRecords` — so the page
   * never carries both versions of the same copy.
   */
  records: Record<string, string | null>;
  tagline: string | null;
  weight: string | null;
  description: string[];
  features: { label: string; value: string }[];
  specs: ProductSpec[];
  calculation: ProductCalculation | null;
  flavors: {
    note: string | null;
    cta: { label: string; href: string } | null;
    items: string[];
  } | null;
  usage: { lines: string[]; image: string | null } | null;
  faq: { question: string; answer: string }[];
};

export const productDetails = productDetailsJson as Record<string, ProductDetail>;

/** Catalogue tile per product — see `scripts/build-catalog-tiles.mjs`. */
const catalogTiles = catalogTilesJson as Record<string, { image: string }>;

/** Product slug -> the exported page it is served from. Derived, not repeated. */
const PRODUCT_PAGE_FILES: Record<string, string> = Object.fromEntries(
  friendlyRoutes
    .filter((definition) => productDetails[definition.route.slice(1)])
    .map((definition) => [definition.route.slice(1), definition.file]),
);

const exportRoot = path.join(process.cwd(), "tilda_export", "project12027355");
// Keep the audited legacy aliases explicit. Reading the export directory at
// module evaluation works in Node but fails in the Cloudflare Worker bundle,
// where the build-time source tree is intentionally unavailable.
const allPageFiles = [
  "page114743626.html",
  "page114837666.html",
  "page115314536.html",
  "page120311356.html",
  "page147468696.html",
  "page151583806.html",
  "page151592086.html",
  "page151592696.html",
  "page151679366.html",
  "page154758576.html",
  "page154764216.html",
  "page154766476.html",
  "page155556086.html",
  "page155598016.html",
  "page62361237.html",
  "page62362389.html",
  "page62447481.html",
  "page62448803.html",
  "page62494049.html",
  "page62497031.html",
  "page62508381.html",
  "page62510271.html",
  "page62515411.html",
  "page62539863.html",
  "page62541199.html",
  "page62544887.html",
  "page62565397.html",
  "page62566191.html",
  "page62573319.html",
  "page62574449.html",
  "page62576005.html",
  "page62578053.html",
  "page62581091.html",
  "page62585333.html",
  "page62588185.html",
  "page65033993.html",
  "page65943847.html",
  "page68443067.html",
  "page68443503.html",
  "page77299576.html",
  "page77849746.html",
] as const;

const routeDefinitions: RouteDefinition[] = [
  ...friendlyRoutes,
  ...allPageFiles.map((file) => ({ route: `/${file}`, file, indexable: false })),
  ...tildaProductPaths.flatMap((slug) => [
    { route: `/catalog/tproduct/${slug}`, file: "page114743626.html", indexable: false },
    { route: `/tproduct/${slug}`, file: "page114743626.html", indexable: false },
  ]),
];

const routeByPath = new Map(routeDefinitions.map((definition) => [definition.route, definition]));

function decode(value = "") {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lrm;/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function matchFirst(source: string, expression: RegExp) {
  return decode(source.match(expression)?.[1] ?? "");
}

function meta(source: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expressions = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["']`, "i"),
  ];

  for (const expression of expressions) {
    const match = source.match(expression);
    if (match) return decode(match[1]);
  }

  return "";
}

function toAbsoluteUrl(value: string) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_ORIGIN}/${value.replace(/^\//, "")}`;
}

function extractBody(source: string, file: string) {
  const bodyFile = path.join(exportRoot, "files", file.replace(/\.html$/, "body.html"));
  if (fs.existsSync(bodyFile)) return fs.readFileSync(bodyFile, "utf8");
  return source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";
}

function removeInlineScriptContaining(source: string, marker: string) {
  return source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (script) =>
    script.includes(marker) ? "" : script,
  );
}

const legacyAnalyticsMarkers = [
  "G-89J9ZDN1B1",
  "G-VKXMKBRV73",
  "GTM-P99PF655",
  "GTM-WPRV8CZ2",
  "ca-pub-9584440435840838",
  "tilda-stat-1.0.min.js",
  "tildastatcookie",
] as const;

function removeLegacyAnalyticsRuntime(source: string) {
  const withoutScripts = legacyAnalyticsMarkers.reduce(
    (result, marker) => removeInlineScriptContaining(result, marker),
    source,
  );

  return withoutScripts.replace(
    /<noscript\b[^>]*>[\s\S]*?(?:googletagmanager|GTM-)[\s\S]*?<\/noscript>/gi,
    "",
  );
}

function localizeHeroTailwind(source: string) {
  const withLocalStylesheet = source.replace(
    /<script\b[^>]*src=["']https:\/\/cdn\.tailwindcss\.com["'][^>]*>[\s\S]*?<\/script>/gi,
    '<link rel="stylesheet" href="/css/tbs-tailwind.css">',
  );

  return removeInlineScriptContaining(withLocalStylesheet, "tailwind.config");
}

const catalogPriceFallback = {
  milkshake: { price: "45.38", cur: "AED" },
  frappe: { price: "49.40", cur: "AED" },
  "iced tea": { price: "42.81", cur: "AED" },
  cordial: { price: "50.15", cur: "AED" },
  raf: { price: "38.74", cur: "AED" },
  "chai latte": { price: "52.05", cur: "AED" },
  matcha: { price: "70.42", cur: "AED" },
  chocolate: { price: "67.88", cur: "AED" },
  "cream latte": { price: "38.76", cur: "AED" },
  jam: { price: "64.94", cur: "AED" },
  garnish: { price: "4.91", cur: "AED" },
  "sugar syrop": { price: "48.82", cur: "AED" },
  "sugar free": { price: "14.22", cur: "AED" },
};

function preserveCatalogPrices(source: string, file: string) {
  if (file !== "page114743626.html") return source;

  // The exported catalogue has the current product/price table for cart
  // actions, but its visible prices were populated only by a Tilda feed that
  // is not part of the static export. Seed the same lookup locally; if a store
  // feed is connected later, the existing scards.forEach block overrides it.
  return source
    .replace(
      /var store=\{\};\s*var scards=/,
      `var store=${JSON.stringify(catalogPriceFallback)};\nvar scards=`,
    )
    .replace(/if\(!scards\.length\) return;\s*scards\.forEach/, "scards.forEach");
}

/**
 * Re-plate the catalogue grid.
 *
 * Two things happen to every card, and both need the HTML rather than a
 * stylesheet:
 *
 * The picture is repointed. The export names sixteen unrelated renders, at
 * three different scales on three different baselines, and three of them are a
 * background image rather than the product — which is why the row looked ragged
 * whatever the cards were styled like. `scripts/build-catalog-tiles.mjs` cuts
 * one square tile per product out of the client's own key visuals, and the
 * card's own `href` is the slug those are named after, so the swap needs no
 * second table to fall out of date. `catg-img--adj` goes with it: it scaled
 * three cards up by 3% to paper over exactly the mismatch the tiles remove.
 *
 * And the card is told its product colour, as `--tile`, which is what the
 * stylesheet marks the current filter and the rules with. It cannot look the
 * colour up itself, and `products.ts` stays the one place a product colour is
 * written down.
 *
 * Done here rather than by editing the export, because the export is the
 * parity reference and stays as exported.
 */
function replateCatalogCards(source: string, file: string) {
  if (file !== "page114743626.html") return source;

  return source.replace(
    /<a class="catg-card" href="\/([a-z-]+)">(\s*<div class="catg-img-wrap">\s*<img\b)([^>]*?)(\/?>)/g,
    (whole, slug: string, open: string, attributes: string, close: string) => {
      const alt = attributes.match(/\salt="[^"]*"/)?.[0] ?? "";
      const image = catalogTiles[slug]?.image ?? `/images/pack-${slug}.webp`;
      const tile = getProduct(slug)?.backgroundColor;
      const style = tile ? ` style="--tile:${tile}"` : "";
      return `<a class="catg-card" href="/${slug}"${style}>${open}${alt} src="${image}"${close}`;
    },
  );
}

/**
 * Cut one record out of the served markup.
 *
 * Depth-counted from the opening tag rather than matched: a Tilda record is a
 * couple of hundred kilobytes of nested markup and a regex cannot see its end.
 * Unbalanced markup leaves the page exactly as exported rather than cutting it
 * off at the wrong place.
 */
function dropRecord(source: string, recordId: string) {
  const start = source.search(new RegExp(`<div[^>]*id="${recordId}"`));
  if (start < 0) return source;

  const tags = /<div\b|<\/div\s*>/gi;
  tags.lastIndex = start;

  let depth = 0;
  for (let tag = tags.exec(source); tag; tag = tags.exec(source)) {
    depth += tag[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return source.slice(0, start) + source.slice(tags.lastIndex);
  }

  return source;
}

/**
 * Tilda template debris, by exported page.
 *
 * Three of the parity pages were built on stock Tilda themes and were still
 * carrying pieces of the theme rather than pieces of the site. None of it is
 * content anybody wrote for THE BASE, and two of the entries were actively
 * damaging:
 *
 * `/rnd` ended in a full calorie calculator in Russian — "Узнай свою дневную
 * норму за 30 секунд" — and, because the theme set it as a heading, that
 * calculator was the page's only `h1`. An English R&D page for Dubai was
 * telling Google its subject was daily calorie intake, in another language.
 * `PageIntro` gives the page a heading of its own; the wording is in
 * `data/page-intros.ts`.
 *
 * `/wholesale-strategy` opened with the theme's demo hero — "Refreshing Taste
 * Awaits" over a stock photograph of a bottle of Mineragua, someone else's
 * sparkling water — above a second navigation bar whose three tabs point at
 * sections the page does not have, and below that the theme's own credit block,
 * again in Russian, ending "Вы можете удалить этот блок". Removed, the page
 * opens on its real heading, "Wholesale Beverage Distribution in GCC".
 *
 * `/private-labeling` carried its `h1` at the foot of the page, under nothing,
 * followed by two blocks that are empty in the export. Its opening block is
 * dropped too and reappears as `PageIntro`, because the theme set both headings
 * in a serif no other page on this site uses.
 *
 * Everything here is a removal from the served markup only. The export on disk
 * is the parity reference and stays as exported.
 */
const REMOVED_BODY_RECORDS: Record<string, readonly string[]> = {
  // /rnd
  "page155598016.html": [
    "rec2493779621", // Russian calorie calculator, and the page's only h1
    "rec2493750131", // Russian Unsplash credit block
    "rec2493746891", // the theme's own burger menu, a second header
    "rec2496175441", // empty in the export, and a white band between two dark ones
  ],
  // /wholesale-strategy
  "page147468696.html": [
    "rec2361929261", // second nav bar; its three tabs have no sections
    "rec2361929271", // "Refreshing Taste Awaits" over a competitor's bottle
    "rec2361929781", // Russian Unsplash credit block
  ],
  // /private-labeling
  "page120311356.html": [
    "rec2507342601", // serif opening block — PageIntro replaces it
    "rec1937227721", // the h1, orphaned at the foot of the page
    "rec1937217991", // empty in the export
    "rec2360860451", // empty in the export
  ],
};

function dropTemplateDebris(source: string, file: string) {
  return (REMOVED_BODY_RECORDS[file] ?? []).reduce(dropRecord, source);
}

/**
 * Drop every block on a product page that React now renders itself.
 *
 * All of them are Tilda "zero blocks": the hero, the four figures, the
 * comparative table, the flavour list and the usage note are absolutely
 * positioned atoms on a fixed-height artboard, held back behind Tilda's own
 * scroll-animation script — which is why the top of every product page was a
 * blank coloured rectangle. The tab strip above them scrolled sideways and
 * switched nothing, and the FAQ was Tilda's own accordion.
 *
 * They are removed rather than hidden. Left in place they would put every line
 * of the page in the document twice, including a second `h1` and a second copy
 * of each question — and `audit:seo-parity` reads the first `h1` it finds.
 *
 * `scripts/build-product-details.mjs` records which block is which per product.
 */
function dropReplacedRecords(source: string, file: string) {
  const slug = Object.entries(PRODUCT_PAGE_FILES).find(([, value]) => value === file)?.[0];
  const records = slug ? productDetails[slug]?.records : null;
  if (!records) return source;

  return Object.values(records)
    .filter((recordId): recordId is string => Boolean(recordId))
    .reduce(dropRecord, source);
}

/**
 * Point the parity pages at the delivery-sized copies of their images.
 *
 * `scripts/build-legacy-image-variants.mjs` writes a WebP beside every heavy
 * original — 87 MB of plates become 7.7 MB — and leaves the originals in place,
 * because nothing in `public/images` may be renamed. The swap happens here, as
 * the page is served, so the export on disk stays the parity reference.
 *
 * Both the markup and the head assets go through it: more than half the weight
 * of a product page was `background-image: url(...)` in the export's own inline
 * CSS, not `<img>` at all.
 */
function useResizedLegacyImages(source: string) {
  return source.replace(
    /images\/([A-Za-z0-9._-]+\.(?:png|jpe?g|webp))/gi,
    (whole, file: string) => {
      const variant = (legacyImageVariants as Record<string, string>)[file];
      return variant ? `images/${variant}` : whole;
    },
  );
}

/**
 * Defer the parity pages' images.
 *
 * A product page ships 14.7 MB over 97 requests and takes about four seconds to
 * reach `load` — measured on the deployed Worker — because the export asks for
 * every image at full size and asks for all of them at once. Nearly all of it
 * is below the fold: `/milkshake` alone pulls a 1680x1951 plate to show it 596px
 * wide, and another at 1170x1703 to show it at 390.
 *
 * Marking them `lazy` does not make the bytes smaller, but it stops them
 * competing with the ones the visitor is actually looking at, which is the part
 * that reads as "the page will not load". The real fix is to serve these at the
 * size they are displayed; this is the safe half of it, and it changes no URL.
 *
 * The first two images are left eager on purpose — one of them is the page's
 * LCP, and lazy-loading that would trade a slow page for a blank one. Anything
 * that already declares its own `loading` or `fetchpriority` is left alone,
 * because the export meant something by it.
 */
function deferLegacyImages(source: string) {
  let seen = 0;

  return source.replace(/<img\b[^>]*>/gi, (tag) => {
    seen += 1;
    if (seen <= 2) return tag;
    if (/\s(?:loading|fetchpriority)\s*=/i.test(tag)) return tag;
    return tag.replace(/<img\b/i, '<img loading="lazy" decoding="async"');
  });
}

/**
 * Tilda shell records dropped from every parity page.
 *
 * The exported body of 37 of the 39 pages carries the whole Tilda site chrome:
 * `<!--header--> <header id="t-header">…` and the matching footer. The shared
 * React header and footer now render around that document, so the old chrome
 * has to go — but it cannot simply be cut out wholesale, because those two
 * elements also carry things the site still depends on:
 *
 * - all of the page's JSON-LD (`rec2483211811`);
 * - the Tilda cart and its form (`rec2989879303`) — `SiteHeader` calls
 *   `tcart__openCart()`, so the cart *is* this markup;
 * - four of the nine owned lead forms (`rec861442702`, `rec1855213141`,
 *   `rec1855223381`, `rec1855232921`) and their popup triggers;
 * - the cookie-consent banner (`rec913700125`).
 *
 * So the removal is per record, and only of the parts the new shell replaces.
 * Note that four of these were already `display:none` in the export — the
 * client had replaced them with the `.tbh-wrap` header long ago — so they were
 * dead weight that still shipped a duplicate navigation to crawlers.
 */
const REMOVED_SHELL_RECORDS = new Set([
  "rec2676415503", // .tbh-wrap header, ticker and spacer — SiteHeader replaces it
  "rec1842546651", // old Tilda menu, already display:none, duplicate nav links
  "rec913703869", //  hidden strapline, already display:none
  "rec860980632", //  old nav column, already display:none, duplicate nav links
  "rec859870796", //  visible footer nav — SiteFooter replaces it
]);

const SHELL_CONTAINERS = [
  { marker: "<!--header-->", tag: "header" },
  { marker: "<!--footer-->", tag: "footer" },
] as const;

/** How far the marker comment may sit from its element before we distrust it. */
const MARKER_PROXIMITY = 40;

type ShellRecord = { id: string; html: string };

/**
 * Splits a shell container into its top-level Tilda records.
 *
 * Records are siblings, so each one runs from its own opening `<div id="recN">`
 * to the next one — no balanced-tag parsing, which would be unreliable against
 * minified markup where `<div` also appears inside inline scripts.
 */
function splitShellRecords(inner: string): ShellRecord[] {
  const expression = /<div id="(rec\d+)"[^>]*class="[^"]*\bt-rec\b/g;
  const starts: Array<{ id: string; at: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = expression.exec(inner))) {
    starts.push({ id: match[1], at: match.index });
  }

  if (!starts.length) return [{ id: "", html: inner }];

  return [
    { id: "", html: inner.slice(0, starts[0].at) },
    ...starts.map((start, index) => ({
      id: start.id,
      html: inner.slice(start.at, index + 1 < starts.length ? starts[index + 1].at : inner.length),
    })),
  ];
}

/** True when this page carries the shared Tilda chrome we know how to replace. */
export function hasLegacyShell(bodyHtml: string) {
  return SHELL_CONTAINERS.every(({ marker, tag }) => {
    const commentAt = bodyHtml.indexOf(marker);
    if (commentAt < 0) return false;
    const openAt = bodyHtml.indexOf(`<${tag} id="t-${tag}"`, commentAt);
    return openAt >= 0 && openAt - commentAt <= MARKER_PROXIMITY;
  });
}

function stripShellRecords(bodyHtml: string) {
  let result = bodyHtml;

  for (const { marker, tag } of SHELL_CONTAINERS) {
    const commentAt = result.indexOf(marker);
    if (commentAt < 0) continue;

    const openAt = result.indexOf(`<${tag} id="t-${tag}"`, commentAt);
    if (openAt < 0 || openAt - commentAt > MARKER_PROXIMITY) continue;

    const openEnd = result.indexOf(">", openAt);
    const closeAt = result.indexOf(`</${tag}>`, openEnd);
    if (openEnd < 0 || closeAt < 0) continue;

    const kept = splitShellRecords(result.slice(openEnd + 1, closeAt))
      .filter((record) => !REMOVED_SHELL_RECORDS.has(record.id))
      .map((record) => record.html)
      .join("");

    // Retagged to a plain div. The page already has one <header> and one
    // <footer> landmark from the shared shell, and a second of each would be
    // announced twice; the id and classes stay untouched so the legacy cart
    // script, which looks its container up by id, still finds it.
    const openTag = result.slice(openAt, openEnd + 1).replace(`<${tag}`, "<div");

    result =
      result.slice(0, commentAt) +
      openTag +
      kept +
      "</div>" +
      result.slice(closeAt + `</${tag}>`.length);
  }

  return result;
}

export type SitePage = RouteDefinition & {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  openGraph: {
    url: string;
    title: string;
    description: string;
    type: string;
    image: string;
  };
  bodyHtml: string;
  headAssetsHtml: string;
  /**
   * Whether the shared React header/footer should render around this document.
   * False for the two standalone header/footer aliases, which are the exported
   * chrome itself and would otherwise be framed by a copy of themselves.
   */
  usesSharedShell: boolean;
};

const pageCache = new Map<string, SitePage>();

export function normalizeSitePath(parts?: string[]) {
  return parts?.length ? `/${parts.map(decodeURIComponent).join("/")}` : "/";
}

export function getSitePage(route: string): SitePage | undefined {
  const definition = routeByPath.get(route);
  if (!definition) return undefined;

  const cached = pageCache.get(route);
  if (cached) return cached;

  const source = fs.readFileSync(path.join(exportRoot, definition.file), "utf8");
  const assetsMatch = source.match(/<!-- Assets -->([\s\S]*?)<\/head>/i);
  const rawBody = extractBody(source, definition.file);
  const usesSharedShell = hasLegacyShell(rawBody);

  /**
   * What the export is put through on its way out, in order. Written as a list
   * rather than as nested calls: there are seven passes over the body now, and
   * read inside-out they stopped being followable.
   */
  const applyAll = (input: string, passes: ((value: string) => string)[]) =>
    passes.reduce((value, pass) => pass(value), input);

  const bodyHtml = applyAll(usesSharedShell ? stripShellRecords(rawBody) : rawBody, [
    (value) => removeInlineScriptContaining(value, '"twitter:card"'),
    (value) => removeInlineScriptContaining(value, "/api/tildafeed"),
    localizeHeroTailwind,
    removeLegacyAnalyticsRuntime,
    (value) => dropReplacedRecords(value, definition.file),
    (value) => dropTemplateDebris(value, definition.file),
    deferLegacyImages,
    useResizedLegacyImages,
    (value) => replateCatalogCards(value, definition.file),
  ]);

  const headAssetsHtml = applyAll(assetsMatch?.[1] ?? "", [
    (value) => removeInlineScriptContaining(value, "__tbCanonInit"),
    (value) => removeInlineScriptContaining(value, "/api/tildafeed"),
    removeLegacyAnalyticsRuntime,
    useResizedLegacyImages,
    (value) => preserveCatalogPrices(value, definition.file),
  ]);

  const result: SitePage = {
    ...definition,
    title: matchFirst(source, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: meta(source, "description"),
    canonical:
      matchFirst(source, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i) ||
      `${SITE_ORIGIN}${definition.route === "/" ? "" : definition.route}`,
    robots: meta(source, "robots"),
    openGraph: {
      url: meta(source, "og:url"),
      title: meta(source, "og:title"),
      description: meta(source, "og:description"),
      type: meta(source, "og:type") || "website",
      image: toAbsoluteUrl(meta(source, "og:image")),
    },
    usesSharedShell,
    bodyHtml,
    headAssetsHtml,
  };

  pageCache.set(route, result);
  return result;
}

export const sitemapRoutes = friendlyRoutes.filter((definition) => definition.indexable);

export function getStaticSiteParams() {
  return [...new Set(routeDefinitions.map((definition) => definition.route))].map((route) => ({
    path: route === "/" ? [] : route.slice(1).split("/"),
  }));
}
