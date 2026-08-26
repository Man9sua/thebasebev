import fs from "node:fs";
import path from "node:path";

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

const standaloneShellFiles = new Set(["page62362389.html", "page62447481.html"]);

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

function setHtmlAttribute(tag: string, name: string, value: string) {
  const attribute = new RegExp(`\\s${name}\\s*=\\s*["'][^"']*["']`, "i");
  if (attribute.test(tag)) return tag.replace(attribute, ` ${name}="${value}"`);
  return tag.replace(/>$/, ` ${name}="${value}">`);
}

/**
 * Promote only the first local images that the exported document considers
 * lazy. Tilda normally copies `data-original` into `src` after first paint;
 * doing that for the small above-the-fold set on the server avoids visible
 * assembly while keeping every later image lazy.
 */
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

function stabilizeCatalogRuntime(source: string, file: string) {
  if (file !== "page114743626.html") return source;

  // The visible catalogue has its own local filters. Keeping Tilda's hidden
  // store filters enabled makes the legacy runtime request getfilters(), whose
  // current response is non-JSON error text; product loading/cart still use the
  // store record and are intentionally left enabled.
  return source.replace(/hideFilters:false/g, "hideFilters:true");
}

function installCatalogFilterShim(source: string, file: string) {
  if (file !== "page114743626.html") return source;

  // `t_store_init` calls the remote filter endpoint even with hideFilters=true.
  // The visible catalogue has its own local filters, so resolve that optional
  // legacy step with an empty result. DOMContentLoaded covers a warm async
  // script; the short poll covers the same script arriving afterwards, before
  // Tilda's own 100 ms t_onFuncLoad retry.
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

function normalizeContentLandmarks(source: string, file: string) {
  if (file !== "page68443503.html") return source;

  // The application already provides the page landmark. This is a visual
  // heading wrapper inside the Privacy article, not a second site header.
  return source
    .replace('<header class="privacy-header">', '<div class="privacy-header">')
    .replace("</header>", "</div>");
}

function prepareBodyHtml(rawBody: string, file: string, removeShell: boolean) {
  let result = removeShell ? stripShellRecords(rawBody) : rawBody;
  result = normalizeContentLandmarks(result, file);
  result = removeInlineScriptContaining(result, '"twitter:card"');
  result = removeInlineScriptContaining(result, "/api/tildafeed");
  result = localizeHeroTailwind(result);
  result = removeLegacyAnalyticsRuntime(result);
  result = stabilizeCatalogRuntime(result, file);
  return promoteCriticalImages(result);
}

function prepareHeadAssetsHtml(source: string, file: string) {
  let result = removeInlineScriptContaining(source, "__tbCanonInit");
  result = removeInlineScriptContaining(result, "/api/tildafeed");
  result = removeLegacyAnalyticsRuntime(result);
  result = preserveCatalogPrices(result, file);
  result = stabilizeCatalogRuntime(result, file);
  return installCatalogFilterShim(result, file);
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
   * False only for the two standalone header/footer aliases, which are the
   * exported chrome itself and would otherwise be framed by a copy of itself.
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
  const sourceHasLegacyShell = hasLegacyShell(rawBody);
  const usesSharedShell = !standaloneShellFiles.has(definition.file);

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
    bodyHtml: prepareBodyHtml(rawBody, definition.file, sourceHasLegacyShell),
    headAssetsHtml: prepareHeadAssetsHtml(assetsMatch?.[1] ?? "", definition.file),
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
