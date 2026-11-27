import { brandCaseHtml } from "@/lib/brand";
import { publicPath, publicUrl, SITE_ORIGIN } from "@/lib/site-paths";
import fs from "node:fs";
import { rewriteLegacyStructuredData } from "@/lib/legacy-structured-data";
import path from "node:path";
import { BLOG_POSTS } from "@/data/blog";
import { getProduct } from "@/data/products";
import legacyImageVariants from "@/data/legacy-image-variants.json";
import catalogTilesJson from "@/data/catalog-tiles.json";
import productDetailsJson from "@/data/product-details.json";

export { SITE_ORIGIN } from "@/lib/site-paths";
export const EXPORT_LAST_MODIFIED = new Date("2026-08-20T20:38:39.000Z");

type RouteDefinition = {
  route: string;
  file: string;
  indexable: boolean;
};

const friendlyRoutes: RouteDefinition[] = [
  { route: "/", file: "page62361237.html", indexable: true },
  { route: "/main", file: "page62361237.html", indexable: false },
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
  { route: "/retail", file: "page114837666.html", indexable: false },
  { route: "/knowledge-recipes", file: "page154758576.html", indexable: false },
  { route: "/not-found", file: "page115314536.html", indexable: false },
];


export type ProductSpec = { label: string; value: string; icon?: string };

export type ProductCalculation = {
  title: string;
  columns: string[];
  rows: (string | boolean | null)[][];
};

export type ProductDetail = {
  h1: string | null;
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

const catalogTiles = catalogTilesJson as Record<string, { image: string }>;

const PRODUCT_PAGE_FILES: Record<string, string> = Object.fromEntries(
  friendlyRoutes
    .filter((definition) => productDetails[definition.route.slice(1)])
    .map((definition) => [definition.route.slice(1), definition.file]),
);

const exportRoot = path.join(process.cwd(), "tilda_export", "project12027355");

const routeDefinitions: RouteDefinition[] = [
  ...friendlyRoutes,
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

function removeLegacyFontLinks(source: string) {
  return source.replace(/<link\b[^>]*>/gi, (tag) => {
    const href = tag.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2] ?? "";
    return /^(?:https?:)?\/\/fonts\.(?:googleapis|gstatic)\.com(?:\/|$)/i.test(href) ? "" : tag;
  });
}

const deadLegacyRuntimes = [
  { file: "tilda-cart-1.1.min.js", drives: /t706|t-store__|tn-atom__store/ },
  { file: "tilda-menu-1.0.min.js", drives: /t-menu__|t-menuburger|t228__/ },
  { file: "tilda-menusub-1.0.min.js", drives: /t-menusub/ },
  { file: "tilda-menu-widgeticons-1.0.min.js", drives: /t-menuwidgeticons/ },
  { file: "tilda-widget-positions-1.0.min.js", drives: /t-widget/ },
  { file: "tilda-skiplink-1.0.min.js", drives: /t-skiplink/ },
] as const;

function removeDeadLegacyRuntime(source: string, bodyHtml: string) {
  const dead = deadLegacyRuntimes.filter((runtime) => !runtime.drives.test(bodyHtml));
  if (dead.length === 0) return source;

  return source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (script) =>
    dead.some((runtime) => script.includes(runtime.file)) ? "" : script,
  );
}

function localizeHeroTailwind(source: string) {
  const withLocalStylesheet = source.replace(
    /<script\b[^>]*src=["']https:\/\/cdn\.tailwindcss\.com["'][^>]*>[\s\S]*?<\/script>/gi,
    '<link rel="stylesheet" href="/css/tbs-tailwind.css">',
  );

  return removeInlineScriptContaining(withLocalStylesheet, "tailwind.config");
}

function setHtmlAttribute(tag: string, name: string, value: string) {
  const attribute = new RegExp(`\\s${name}\\s*=\\s*["'][^"']*["']`, "i");
  if (attribute.test(tag)) return tag.replace(attribute, ` ${name}="${value}"`);
  return tag.replace(/>$/, ` ${name}="${value}">`);
}

function promoteCriticalImages(source: string, limit = 4) {
  let promoted = 0;

  return source.replace(/<img\b[^>]*>/gi, (tag) => {
    if (promoted >= limit) return tag;
    const original = tag.match(/\bdata-original\s*=\s*["']([^"']+)["']/i)?.[1] ?? "";
    if (!/^\/?images\//i.test(original)) return tag;

    promoted += 1;
    const src = `/${original.replace(/^\//, "")}`;
    let result = setHtmlAttribute(tag, "src", src);
    result = setHtmlAttribute(result, "loading", "eager");
    result = setHtmlAttribute(result, "decoding", "async");
    if (promoted <= 2) result = setHtmlAttribute(result, "fetchpriority", "high");
    return result;
  });
}

const legacyImageRoot = '(document.querySelector(".legacy-document") || document)';

function scopeLegacyImagePasses(source: string) {
  return source
    .replace(/document\.querySelectorAll\("img"\)/g, `${legacyImageRoot}.querySelectorAll("img")`)
    .replace(
      /document\.querySelectorAll\('a img\[alt=""\]'\)/g,
      `${legacyImageRoot}.querySelectorAll('a img[alt=""]')`,
    );
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

  return source
    .replace(
      /var store=\{\};\s*var scards=/,
      `var store=${JSON.stringify(catalogPriceFallback)};\nvar scards=`,
    )
    .replace(/if\(!scards\.length\) return;\s*scards\.forEach/, "scards.forEach");
}

function stabilizeCatalogRuntime(source: string, file: string) {
  if (file !== "page114743626.html") return source;

  return source.replace(/hideFilters:false/g, "hideFilters:true");
}

function installCatalogFilterShim(source: string, file: string) {
  if (file !== "page114743626.html") return source;

  return `${source}<script>(function(){
function disable(){
if(typeof window.t_store_init!=="function")return false;
window.t_store_loadFilters=function(options,done){if(typeof done==="function")done();};
return true;
}
document.addEventListener("DOMContentLoaded",disable,{once:true});
var tries=0,timer=setInterval(function(){if(disable()||++tries>200)clearInterval(timer);},10);
})();</script>`;
}

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

const REMOVED_BODY_RECORDS: Record<string, readonly string[]> = {
  "page155598016.html": [
    "rec2493779621",
    "rec2493750131",
    "rec2493746891",
    "rec2496175441",
  ],
  "page120311356.html": [
    "rec2507342601",
    "rec1937225061",
    "rec1937227721",
    "rec1937217991",
    "rec2360860451",
  ],
  "page62576005.html": ["rec2489072221"],
};

function dropTemplateDebris(source: string, file: string) {
  return (REMOVED_BODY_RECORDS[file] ?? []).reduce(dropRecord, source);
}

function relinkBlogPosts(source: string) {
  return source.replace(/\/tpost\/([a-z0-9]+)-[a-z0-9-]+/gi, (match, uid: string) => {
    const post = BLOG_POSTS.find((candidate) => candidate.uid === uid);
    return post ? post.path : match;
  });
}

function dropReplacedRecords(source: string, file: string) {
  const slug = Object.entries(PRODUCT_PAGE_FILES).find(([, value]) => value === file)?.[0];
  const records = slug ? productDetails[slug]?.records : null;
  if (!records) return source;

  const sharedRecords = ["rec2503542591"];

  return [...Object.values(records), ...sharedRecords]
    .filter((recordId): recordId is string => Boolean(recordId))
    .reduce(dropRecord, source);
}

function useResizedLegacyImages(source: string) {
  return source.replace(
    /images\/([A-Za-z0-9._-]+\.(?:png|jpe?g|webp))/gi,
    (whole, file: string) => {
      const variant = (legacyImageVariants as Record<string, string>)[file];
      return variant ? `images/${variant}` : whole;
    },
  );
}

function deferLegacyImages(source: string) {
  let seen = 0;

  return source.replace(/<img\b[^>]*>/gi, (tag) => {
    seen += 1;
    if (seen <= 2) return tag;
    if (/\s(?:loading|fetchpriority)\s*=/i.test(tag)) return tag;
    return tag.replace(/<img\b/i, '<img loading="lazy" decoding="async"');
  });
}

const REMOVED_SHELL_RECORDS = new Set([
  "rec2676415503",
  "rec1842546651",
  "rec913703869",
  "rec860980632",
  "rec859870796",
  "rec2989879303",
  "rec913700125",
]);

const SHELL_CONTAINERS = [
  { marker: "<!--header-->", tag: "header" },
  { marker: "<!--footer-->", tag: "footer" },
] as const;

const MARKER_PROXIMITY = 40;

type ShellRecord = { id: string; html: string };

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

function stripLegacyRecordsHtml(source: string, recordIds: ReadonlySet<string>) {
  if (!recordIds.size) return source;

  return splitShellRecords(source)
    .map((record) => {
      if (!recordIds.has(record.id)) return record.html;

      const footerAt = record.html.indexOf('<div id="t-footer"');
      return footerAt >= 0 ? record.html.slice(footerAt) : "";
    })
    .join("");
}

function normalizeContentLandmarks(source: string, file: string) {
  if (file !== "page68443503.html") return source;

  return source
    .replace('<header class="privacy-header">', '<div class="privacy-header">')
    .replace("</header>", "</div>");
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
  native?: boolean;
  usesSharedShell: boolean;
};

export function withoutLegacyRecords(page: SitePage, recordIds: readonly string[]): SitePage {
  return {
    ...page,
    bodyHtml: stripLegacyRecordsHtml(page.bodyHtml, new Set(recordIds)),
  };
}

function localizePageLinks(source: string) {
  return source.replace(/(<a\b[^>]*\bhref=)(["'])(\/[^"']*)\2/gi, (_, start, quote, href) =>
    `${start}${quote}${publicPath(href)}${quote}`,
  );
}
const pageCache = new Map<string, SitePage>();

export function normalizeSitePath(parts?: string[]) {
  const routeParts = parts?.[0] === "ae" ? parts.slice(1) : parts;
  return routeParts?.length ? `/${routeParts.map(decodeURIComponent).join("/")}` : "/";
}

type NativeRoute = { route: string; title: string; description: string };

const NATIVE_ROUTES: NativeRoute[] = [
  { route: "/electrolyte", title: "Electrolyte Drink Mix for HoReCa & Retail | The Base", description: "Electrolyte drink mixes for hydration menus, hospitality and retail. Explore the range and request specifications or samples from THE BASE in UAE." },
  { route: "/find-your-distributor", title: "Find Your Distributor | The Base", description: "Find THE BASE beverage supply contacts across 17 markets. Contact our UAE team, request samples or enquire about distribution in your country." },
  { route: "/careers", title: "Careers at THE BASE | UAE Beverage Manufacturing", description: "Join THE BASE in UAE. Tell us about your experience in production, quality, logistics, sales, marketing or beverage development." },
  { route: "/request-samples", title: "Request Beverage Samples | The Base UAE", description: "Request THE BASE beverage samples for your café, bar or hospitality business. Share your menu requirements with our UAE team." },
  { route: "/certificates", title: "Quality & Certificates | The Base", description: "Learn about THE BASE quality standards, HACCP and Halal documentation. Request product-specific certificates and specifications from our team." },
  { route: "/faq", title: "Frequently Asked Questions | The Base", description: "Answers about THE BASE beverage production, private label, custom R&D, samples, storage and distribution." },
  { route: "/cookie-policy", title: "Cookie Policy | The Base", description: "How THE BASE uses necessary storage, analytics and marketing consent. Manage your cookie preferences at any time." },
  {
    route: "/puree",
    title: "Fruit Purées for Cafés, Bars & HoReCa | The Base",
    description:
      "Six fruit purées for smoothies, lemonades, iced teas, cocktails and desserts. Real fruit texture, ready to pour. Private label available.",
  },
  {
    route: "/sauce",
    title: "Caramel & Chocolate Sauces for Coffee and Desserts | The Base",
    description:
      "Caramel, chocolate and white chocolate sauces in 1.89 L squeeze bottles for coffee, cold drinks and desserts. Private label available.",
  },
  {
    route: "/colour-collection",
    title: "Colour Collection: Natural Colour Powders for Drinks | The Base",
    description:
      "Five natural colour powders for beverage menus: matcha, hojicha, butterfly pea, dragon fruit and ube. One ingredient in every tin, nothing added.",
  },
  {
    route: "/add-ons",
    title: "Functional Add-ons for Café Drinks | The Base",
    description:
      "Seven pre-dosed functional sticks for drinks already on your menu: hydration, focus, recovery and calm. One stick per drink, no new recipes.",
  },
  {
    route: "/at-home",
    title: "Café Drinks at Home: 150 g Retail Pouches | The Base",
    description:
      "The same café recipes in 150 g pouches: matcha, chocolate, iced tea, chai, milkshake and cola. Buy online or stock them by your till.",
  },
];

const nativeByPath = new Map(NATIVE_ROUTES.map((definition) => [definition.route, definition]));

function nativePage({ route, title, description }: NativeRoute): SitePage {
  const canonical = publicUrl(`${SITE_ORIGIN}${route}`);
  const image = getProduct(route.slice(1))?.image ?? "/images/tild3435-6364-4232-a539-303363373037__frame_1413375666_1.jpg";
  return {
    route,
    file: "",
    indexable: true,
    title,
    description,
    canonical,
    robots: "",
    openGraph: { url: canonical, title, description, type: "website", image: `${SITE_ORIGIN}${image}` },
    bodyHtml: "",
    headAssetsHtml: "",
    native: true,
    usesSharedShell: true,
  };
}

export function getSitePage(route: string): SitePage | undefined {
  const native = nativeByPath.get(route);
  if (native) return nativePage(native);

  const definition = routeByPath.get(route);
  if (!definition) return undefined;

  const cached = pageCache.get(route);
  if (cached) return cached;

  const source = fs.readFileSync(path.join(exportRoot, definition.file), "utf8");
  const assetsMatch = source.match(/<!-- Assets -->([\s\S]*?)<\/head>/i);
  const rawBody = extractBody(source, definition.file);
  const usesSharedShell = true;

  const applyAll = (input: string, passes: ((value: string) => string)[]) =>
    passes.reduce((value, pass) => pass(value), input);

  const bodyHtml = applyAll(usesSharedShell ? stripShellRecords(rawBody) : rawBody, [
    (value) => removeInlineScriptContaining(value, '"twitter:card"'),
    (value) => removeInlineScriptContaining(value, "/api/tildafeed"),
    localizeHeroTailwind,
    removeLegacyAnalyticsRuntime,
    (value) => dropReplacedRecords(value, definition.file),
    (value) => dropTemplateDebris(value, definition.file),
    relinkBlogPosts,
    (value) => normalizeContentLandmarks(value, definition.file),
    (value) => stabilizeCatalogRuntime(value, definition.file),
    deferLegacyImages,
    useResizedLegacyImages,
    (value) => replateCatalogCards(value, definition.file),
    promoteCriticalImages,
    scopeLegacyImagePasses,
    localizePageLinks,
    (value) => rewriteLegacyStructuredData(value, Boolean(getProduct(route.slice(1)))),
    brandCaseHtml,
  ]);

  const headAssetsHtml = applyAll(assetsMatch?.[1] ?? "", [
    (value) => removeInlineScriptContaining(value, "__tbCanonInit"),
    (value) => removeInlineScriptContaining(value, "/api/tildafeed"),
    removeLegacyAnalyticsRuntime,
    removeLegacyFontLinks,
    useResizedLegacyImages,
    (value) => preserveCatalogPrices(value, definition.file),
    (value) => stabilizeCatalogRuntime(value, definition.file),
    (value) => installCatalogFilterShim(value, definition.file),
    (value) => removeDeadLegacyRuntime(value, bodyHtml),
  ]);

  const result: SitePage = {
    ...definition,
    title: matchFirst(source, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: meta(source, "description"),
    canonical: publicUrl(
      matchFirst(source, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i) ||
        `${SITE_ORIGIN}${definition.route === "/" ? "" : definition.route}`,
    ),
    robots: meta(source, "robots"),
    openGraph: {
      url: publicUrl(meta(source, "og:url")),
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

export const nativeSitemapRoutes = NATIVE_ROUTES.map((definition) => definition.route);

export function getStaticSiteParams() {
  return [...new Set([...routeDefinitions, ...NATIVE_ROUTES].map((definition) => definition.route))].map((route) => ({
    path: route === "/" ? ["ae"] : ["ae", ...route.slice(1).split("/")],
  }));
}
