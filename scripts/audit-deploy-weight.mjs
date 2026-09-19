import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const assetsRoot = path.join(projectRoot, ".open-next", "assets");
const publicRoot = path.join(projectRoot, "public");
const outputRoot = path.join(projectRoot, ".audit-artifacts", "deploy-weight");

function read(relative) {
  return fs.readFileSync(path.join(projectRoot, relative), "utf8");
}

function walk(root) {
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) {
        const stat = fs.statSync(absolute);
        files.push({
          absolute,
          relative: path.relative(root, absolute).replaceAll(path.sep, "/"),
          bytes: stat.size,
        });
      }
    }
  };
  visit(root);
  return files;
}

function csv(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function bytes(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function mib(value) {
  return (value / 1024 / 1024).toFixed(1);
}

function sum(items) {
  return items.reduce((total, item) => total + item.bytes, 0);
}

function routeFromStaticAsset(relative) {
  if (!relative.startsWith("__static_pages/")) return null;
  let file = relative.slice("__static_pages/".length);
  if (file === "manifest.json") return { route: null, role: "static manifest" };
  if (file === "robots.txt" || file === "sitemap.xml") return { route: `/${file}`, role: "metadata" };
  if (file.includes(".segments/")) {
    file = file.slice(0, file.indexOf(".segments/"));
    return { route: `/${file === "index" ? "" : file}`, role: "RSC segment prefetch" };
  }
  if (file.endsWith(".html")) {
    file = file.slice(0, -".html".length);
    return { route: `/${file === "index" ? "" : file}`, role: "HTML document" };
  }
  if (file.endsWith(".rsc")) {
    file = file.slice(0, -".rsc".length);
    return { route: `/${file === "index" ? "" : file}`, role: "RSC navigation payload" };
  }
  return { route: null, role: "static support" };
}

function block(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0) throw new Error(`Could not parse ${start}`);
  return source.slice(startIndex + start.length, endIndex);
}

function groupRows(rows) {
  return [...rows.entries()]
    .map(([category, values]) => ({ category, files: values.length, bytes: sum(values) }))
    .sort((left, right) => right.bytes - left.bytes || right.files - left.files);
}

const sitePages = read("src/lib/site-pages.ts");
const nextConfig = read("next.config.ts");
const friendlyBlock = block(
  sitePages,
  "const friendlyRoutes: RouteDefinition[] = [",
  "const tildaProductPaths",
);
const friendlyRoutes = [
  ...friendlyBlock.matchAll(
    /\{ route: "([^"]+)", file: "([^"]+)", indexable: (true|false) \}/g,
  ),
].map((match) => ({
  route: match[1],
  file: match[2],
  indexable: match[3] === "true",
}));
const productBlock = block(sitePages, "const tildaProductPaths = [", "const exportRoot");
const tildaProductSlugs = [...productBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
const pageFileBlock = block(sitePages, "const allPageFiles = [", "] as const;");
const pageFiles = [...pageFileBlock.matchAll(/"(page\d+\.html)"/g)].map((match) => match[1]);
const glossary = JSON.parse(read("src/data/glossary-content.json")).entries;
const blog = JSON.parse(read("src/data/blog-content.json")).posts;
const redirectRows = [...nextConfig.matchAll(
  /\{\s*source:\s*"([^"]+)",\s*destination:\s*"([^"]+)",\s*statusCode:\s*301,?\s*\}/g,
)].map((match) => ({ source: match[1], destination: match[2], status: 301 }));

const friendlyByRoute = new Map(friendlyRoutes.map((entry) => [entry.route, entry]));
const glossaryRoutes = new Set(glossary.map((entry) => entry.path));
const blogRoutes = new Set(blog.map((entry) => entry.path));
const legacyPageRoutes = new Set(pageFiles.map((file) => `/${file}`));
const productAliasRoutes = new Set(
  tildaProductSlugs.flatMap((slug) => [`/catalog/tproduct/${slug}`, `/tproduct/${slug}`]),
);

function classifyRoute(route) {
  if (route === "/_global-error" || route === "/_not-found") {
    return {
      category: "framework error boundary",
      visibility: "not a user destination",
      action: "Required by Next.js; do not remove.",
    };
  }
  if (route === "/robots.txt" || route === "/sitemap.xml") {
    return {
      category: "SEO metadata endpoint",
      visibility: "not a page",
      action: "Required for crawlability; do not remove.",
    };
  }
  if (glossaryRoutes.has(route)) {
    return {
      category: "published glossary article",
      visibility: "indexable content",
      action: "Required; retain.",
    };
  }
  if (blogRoutes.has(route)) {
    return {
      category: "published blog article",
      visibility: "indexable content",
      action: "Required; retain.",
    };
  }
  const friendly = friendlyByRoute.get(route);
  if (friendly?.indexable) {
    return {
      category: "canonical public page",
      visibility: "indexable content",
      action: "Required; retain.",
    };
  }
  if (friendly) {
    const action =
      route === "/main"
        ? "Candidate: replace with a 301 to / after traffic/URL review."
        : "Functional or legacy-facing route; retain until traffic and owner review.";
    return {
      category: "noindex public/service page",
      visibility: "not a search landing page",
      action,
    };
  }
  if (legacyPageRoutes.has(route)) {
    return {
      category: "legacy Tilda HTML alias",
      visibility: "not linked or indexed",
      action: "Candidate: map to a canonical route/301 only after Search Console and analytics review.",
    };
  }
  if (productAliasRoutes.has(route)) {
    return {
      category: "legacy Tilda product alias",
      visibility: "not linked or indexed",
      action: "Candidate: 301 to the modern product route after legacy traffic review.",
    };
  }
  if (route === "/checkout") {
    return {
      category: "checkout page",
      visibility: "flow-only",
      action: "Required for cart and Stripe flow.",
    };
  }
  if (["/api/leads", "/api/checkout/stripe", "/api/stripe/webhook"].includes(route)) {
    return {
      category: "dynamic API endpoint",
      visibility: "not a page",
      action: "Required application boundary; do not remove without replacing its caller.",
    };
  }
  return {
    category: "unclassified static route",
    visibility: "needs review",
    action: "Investigate before removal.",
  };
}

const routeRows = [
  ...friendlyRoutes.map((entry) => ({
    route: entry.route,
    ...classifyRoute(entry.route),
    source: entry.file,
  })),
  ...glossary.map((entry) => ({
    route: entry.path,
    ...classifyRoute(entry.path),
    source: "src/data/glossary-content.json",
  })),
  ...blog.map((entry) => ({
    route: entry.path,
    ...classifyRoute(entry.path),
    source: "src/data/blog-content.json",
  })),
  ...pageFiles.map((file) => ({
    route: `/${file}`,
    ...classifyRoute(`/${file}`),
    source: "tilda_export compatibility map",
  })),
  ...[...productAliasRoutes].map((route) => ({
    route,
    ...classifyRoute(route),
    source: "tilda product compatibility map",
  })),
  ...[
    "/checkout",
    "/_global-error",
    "/_not-found",
    "/robots.txt",
    "/sitemap.xml",
    "/api/leads",
    "/api/checkout/stripe",
    "/api/stripe/webhook",
  ].map((route) => ({
    route,
    ...classifyRoute(route),
    source: "framework/worker",
  })),
].sort((left, right) => left.route.localeCompare(right.route));

const allAssets = walk(assetsRoot);
const publicAssets = walk(publicRoot);
const publicPaths = new Set(publicAssets.map((asset) => asset.relative));
const staticFiles = allAssets.filter((asset) => asset.relative.startsWith("__static_pages/"));
const referencedPublicPaths = new Set();
const referencePattern = /\/(?:images|video|css|js)\/[^\s"'`<>(){}\\]+/g;
for (const asset of allAssets) {
  if (!/\.(?:html|rsc|css|js)$/i.test(asset.relative)) continue;
  const source = fs.readFileSync(asset.absolute, "utf8");
  for (const match of source.matchAll(referencePattern)) {
    const relative = decodeURIComponent(match[0].slice(1).split(/[?#]/, 1)[0]);
    if (publicPaths.has(relative)) referencedPublicPaths.add(relative);
  }
}

function classifyAsset(asset) {
  const relative = asset.relative;
  if (relative.startsWith("__static_pages/")) {
    const info = routeFromStaticAsset(relative);
    if (!info?.route) {
      return {
        category: "static fast-path manifest",
        visibility: "worker support",
        reference: "generated build metadata",
        action: "Required by static fast path.",
      };
    }
    const route = classifyRoute(info.route);
    return {
      category: `${route.category} — ${info.role}`,
      visibility: route.visibility,
      reference: info.route,
      action: route.action,
    };
  }
  if (relative.startsWith("cdn-cgi/_next_cache/")) {
    return {
      category: "OpenNext incremental cache snapshot",
      visibility: "not a direct site asset",
      reference: "generated cache fallback",
      action:
        "High-value candidate: validate fallback behavior, then exclude from assets if static fast path covers all retained pages.",
    };
  }
  if (relative.startsWith("_next/")) {
    return {
      category: "Next.js framework chunk",
      visibility: "browser runtime",
      reference: "Next.js build output",
      action: "Required by the current app runtime.",
    };
  }
  const topLevel = relative.split("/", 1)[0];
  if (["images", "video", "css", "js"].includes(topLevel)) {
    const referenced = referencedPublicPaths.has(relative);
    return {
      category: referenced ? `public ${topLevel} referenced by build` : `public ${topLevel} not referenced by build`,
      visibility: referenced ? "potentially requested by a retained page" : "not referenced by generated HTML/RSC/JS/CSS",
      reference: referenced ? "static build reference scan" : "no static build reference",
      action: referenced
        ? "Retain unless visual/route audit proves otherwise."
        : "Candidate: verify dynamic/runtime usage, then remove or archive outside public/.",
    };
  }
  return {
    category: "other Worker asset",
    visibility: "needs review",
    reference: "asset directory",
    action: "Investigate before removal.",
  };
}

const assetRows = allAssets
  .map((asset) => ({ ...asset, ...classifyAsset(asset) }))
  .sort((left, right) => right.bytes - left.bytes || left.relative.localeCompare(right.relative));
const assetGroups = new Map();
for (const row of assetRows) {
  const values = assetGroups.get(row.category) ?? [];
  values.push(row);
  assetGroups.set(row.category, values);
}

const staticRouteRows = staticFiles
  .map((asset) => ({ asset, info: routeFromStaticAsset(asset.relative) }))
  .filter((entry) => entry.info?.route)
  .map((entry) => ({
    ...entry.asset,
    ...classifyRoute(entry.info.route),
    role: entry.info.role,
  }));
const staticRouteGroups = new Map();
for (const row of staticRouteRows) {
  const values = staticRouteGroups.get(row.category) ?? [];
  values.push(row);
  staticRouteGroups.set(row.category, values);
}

const unreferencedPublic = assetRows.filter((row) => row.category.startsWith("public ") && row.category.endsWith("not referenced by build"));
const cacheRows = assetRows.filter((row) => row.category === "OpenNext incremental cache snapshot");
const compatibilityRows = staticRouteRows.filter(
  (row) => row.category === "legacy Tilda HTML alias" || row.category === "legacy Tilda product alias",
);

fs.mkdirSync(outputRoot, { recursive: true });
fs.writeFileSync(
  path.join(outputRoot, "assets.csv"),
  [
    "path,bytes,mib,category,visibility,reference,action",
    ...assetRows.map((row) =>
      [
        row.relative,
        row.bytes,
        mib(row.bytes),
        row.category,
        row.visibility,
        row.reference,
        row.action,
      ]
        .map(csv)
        .join(","),
    ),
    "",
  ].join("\n"),
);
fs.writeFileSync(
  path.join(outputRoot, "routes.csv"),
  [
    "route,category,visibility,source,action",
    ...routeRows.map((row) =>
      [row.route, row.category, row.visibility, row.source, row.action].map(csv).join(","),
    ),
    "",
  ].join("\n"),
);
fs.writeFileSync(
  path.join(outputRoot, "redirects.csv"),
  [
    "source,destination,status,category,action",
    ...redirectRows.map((row) =>
      [
        row.source,
        row.destination,
        row.status,
        "permanent redirect",
        "Required compatibility route; retain unless the source is formally retired after traffic review.",
      ]
        .map(csv)
        .join(","),
    ),
    "",
  ].join("\n"),
);
fs.writeFileSync(
  path.join(outputRoot, "unreferenced-public-assets.csv"),
  [
    "path,bytes,mib,category,action",
    ...unreferencedPublic.map((row) =>
      [row.relative, row.bytes, mib(row.bytes), row.category, row.action].map(csv).join(","),
    ),
    "",
  ].join("\n"),
);

const markdown = [
  "# Deploy weight audit",
  "",
  `Generated from \`.open-next/assets\` at ${new Date().toISOString()}. This is a build-output audit, not a removal plan.`,
  "",
  "## What Cloudflare receives",
  "",
  `- Asset objects: **${bytes(allAssets.length)}**`,
  `- Asset payload: **${bytes(sum(allAssets))} bytes (${mib(sum(allAssets))} MiB)**`,
  `- Static fast-path objects: **${bytes(staticFiles.length)}** (${mib(sum(staticFiles))} MiB)`,
  `- OpenNext cache objects: **${bytes(cacheRows.length)}** (${mib(sum(cacheRows))} MiB)`,
  `- Public assets not referenced by generated HTML/RSC/JS/CSS: **${bytes(unreferencedPublic.length)}** (${mib(sum(unreferencedPublic))} MiB)`,
  "",
  "## Asset categories",
  "",
  "| Category | Objects | MiB | Classification |",
  "| --- | ---: | ---: | --- |",
  ...groupRows(assetGroups).map(
    (row) =>
      `| ${row.category} | ${bytes(row.files)} | ${mib(row.bytes)} | See \`assets.csv\`; do not remove an item without its stated validation. |`,
  ),
  "",
  "## Static route payload categories",
  "",
  "| Route category | Objects | MiB | Meaning |",
  "| --- | ---: | ---: | --- |",
  ...groupRows(staticRouteGroups).map(
    (row) =>
      `| ${row.category} | ${bytes(row.files)} | ${mib(row.bytes)} | Every document currently ships an HTML document plus RSC navigation/prefetch payloads. |`,
  ),
  "",
  "## Route inventory",
  "",
  `- Controlled routes represented here: **${bytes(routeRows.length)}**`,
  `- Canonical public pages: **${friendlyRoutes.filter((row) => row.indexable).length}**`,
  `- Published Glossary articles: **${glossary.length}**`,
  `- Published blog articles: **${blog.length}**`,
  `- Legacy \`/page*.html\` aliases: **${pageFiles.length}**`,
  `- Legacy \`/tproduct\` aliases: **${productAliasRoutes.size}**`,
  `- Permanent redirects (not generated pages): **${redirectRows.length}**`,
  "",
  "The request's approximately 112 paths corresponds to the 113 non-article controlled routes: 38 friendly routes, 41 legacy HTML aliases, 26 legacy product aliases and 8 technical/checkout routes. The full controlled set is larger because it also retains 101 Glossary and 30 Blog detail routes.",
  "",
  "## Highest-value optimization candidates",
  "",
  `1. **OpenNext cache snapshot** — ${bytes(cacheRows.length)} objects / ${mib(sum(cacheRows))} MiB. It is not directly user-visible. Validate all static/fallback routes without it before excluding it.`,
  `2. **Legacy compatibility static payloads** — ${bytes(compatibilityRows.length)} objects / ${mib(sum(compatibilityRows))} MiB. These preserve old URLs but are neither indexed nor normal navigation. Migrate each to a 301 only after Search Console, analytics and backlink review.`,
  `3. **Unreferenced public assets** — ${bytes(unreferencedPublic.length)} objects / ${mib(sum(unreferencedPublic))} MiB. They have no generated HTML/RSC/JS/CSS reference in this build; verify dynamic runtime usage and archive/remove only then.`,
  "",
  "## Files",
  "",
  "- `assets.csv` — complete asset-by-asset inventory and classification.",
  "- `routes.csv` — complete controlled route inventory with retention policy.",
  "- `redirects.csv` — complete permanent-redirect inventory (not generated pages).",
  "- `unreferenced-public-assets.csv` — focused manual-review queue.",
  "",
].join("\n");
fs.writeFileSync(path.join(outputRoot, "REPORT.md"), markdown);

console.log(
  JSON.stringify(
    {
      outputRoot: path.relative(projectRoot, outputRoot).replaceAll(path.sep, "/"),
      assets: { files: allAssets.length, bytes: sum(allAssets) },
      staticFastPath: { files: staticFiles.length, bytes: sum(staticFiles) },
      openNextCache: { files: cacheRows.length, bytes: sum(cacheRows) },
      unreferencedPublic: { files: unreferencedPublic.length, bytes: sum(unreferencedPublic) },
      routes: routeRows.length,
    },
    null,
  ),
);
