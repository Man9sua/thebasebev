import fs from "node:fs";

const targetOrigin = (process.argv[2] ?? "https://the-base-staging.mansua.workers.dev").replace(/\/$/, "");
const reportPath = process.argv[3] ?? "ROUTE_INDEXABILITY_AUDIT.md";
const siteSource = fs.readFileSync("src/lib/site-pages.ts", "utf8");
const nextConfig = fs.readFileSync("next.config.ts", "utf8");
const glossaryContent = JSON.parse(fs.readFileSync("src/data/glossary-content.json", "utf8"));
const glossaryRoutes = glossaryContent.entries.map((entry) => entry.path);
const blogContent = JSON.parse(fs.readFileSync("src/data/blog-content.json", "utf8"));
const blogRoutes = blogContent.posts.map((post) => post.path);

function block(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0) throw new Error(`Could not parse block ${start}`);
  return source.slice(startIndex + start.length, endIndex);
}

const friendlyBlock = block(siteSource, "const friendlyRoutes: RouteDefinition[] = [", "export type ProductSpec");
const friendlyRoutes = [...friendlyBlock.matchAll(/\{ route: "([^"]+)", file: "([^"]+)", indexable: (true|false) \}/g)].map(
  (match) => ({ route: match[1], file: match[2], indexable: match[3] === "true" }),
);
const retiredLegacyRedirects = JSON.parse(fs.readFileSync("src/data/legacy-route-redirects.json", "utf8"));
const legacyPageRedirects = retiredLegacyRedirects.filter((entry) => entry.source.startsWith("/page"));
const productAliasRedirects = retiredLegacyRedirects.filter((entry) => entry.source.includes("/tproduct/"));
// Whitespace-tolerant: the Blog's three legacy-slug redirects are too long to
// sit on one line, and a redirect this audit cannot see is a redirect nothing
// checks.
const configuredRedirectRows = [...nextConfig.matchAll(
  /\{\s*source:\s*"([^"]+)",\s*destination:\s*"([^"]+)",\s*statusCode:\s*301,?\s*\}/g,
)].map(
  (match) => ({ route: match[1], destination: match[2] }),
);
const redirectRows = [
  ...retiredLegacyRedirects.map((entry) => ({ route: entry.source, destination: entry.destination })),
  ...configuredRedirectRows,
];
const controlledRoutes = [
  ...friendlyRoutes.map((entry) => ({
    route: entry.route,
    type: entry.indexable ? "public page" : "service/public compatibility page",
    expectedStatus: 200,
    indexable: entry.indexable,
    canonical: true,
    sitemap: entry.indexable,
    reason: entry.indexable
      ? `Canonical production page from ${entry.file}`
      : `Preserved non-indexable route from ${entry.file}`,
  })),
  ...glossaryRoutes.map((route) => ({
    route,
    type: "glossary article",
    expectedStatus: 200,
    indexable: true,
    canonical: true,
    sitemap: true,
    reason: "Published production Glossary article preserved at its canonical path",
  })),
  ...blogRoutes.map((route) => ({
    route,
    type: "blog article",
    expectedStatus: 200,
    indexable: true,
    canonical: true,
    sitemap: true,
    reason: "Published production Blog article preserved at its canonical path",
  })),
  {
    route: "/checkout",
    type: "technical checkout page",
    expectedStatus: 200,
    indexable: false,
    canonical: true,
    sitemap: false,
    reason: "Cart review and Stripe Test handoff; intentionally excluded from search",
  },
  {
    route: "/_not-found",
    type: "technical 404 boundary",
    expectedStatus: 404,
    indexable: false,
    canonical: false,
    sitemap: false,
    reason: "Framework/native error boundary",
  },
  {
    route: "/robots.txt",
    type: "technical SEO endpoint",
    expectedStatus: 200,
    indexable: false,
    canonical: false,
    sitemap: false,
    reason: "Crawler policy endpoint, not a search result page",
  },
  {
    route: "/sitemap.xml",
    type: "technical SEO endpoint",
    expectedStatus: 200,
    indexable: false,
    canonical: false,
    sitemap: false,
    reason: "Sitemap document, not a sitemap member",
  },
  {
    route: "/api/leads",
    type: "dynamic API",
    expectedStatus: 405,
    indexable: false,
    canonical: false,
    sitemap: false,
    reason: "POST-only lead delivery boundary; GET is intentionally rejected",
  },
  {
    route: "/api/checkout/stripe",
    type: "dynamic API",
    expectedStatus: 405,
    indexable: false,
    canonical: false,
    sitemap: false,
    reason: "POST-only Stripe Test checkout boundary; GET is intentionally rejected",
  },
  {
    route: "/api/stripe/webhook",
    type: "dynamic API",
    expectedStatus: 405,
    indexable: false,
    canonical: false,
    sitemap: false,
    reason: "POST-only Stripe Test webhook boundary; GET is intentionally rejected",
  },
  {
    route: "/api/health",
    type: "dynamic API",
    expectedStatus: 200,
    indexable: false,
    canonical: false,
    sitemap: false,
    reason: "No-store deployment health probe",
  },
];

if (friendlyRoutes.length !== 37 || legacyPageRedirects.length !== 41 || productAliasRedirects.length !== 26) {
  throw new Error(
    `Unexpected route source counts: friendly=${friendlyRoutes.length}, legacyPages=${legacyPageRedirects.length}, productAliases=${productAliasRedirects.length}.`,
  );
}
const expectedControlledRoutes = 45 + glossaryRoutes.length + blogRoutes.length;
if (controlledRoutes.length !== expectedControlledRoutes) {
  throw new Error(
    `Expected ${expectedControlledRoutes} controlled routes, received ${controlledRoutes.length}.`,
  );
}
if (redirectRows.length !== 77) throw new Error(`Expected 77 redirects, received ${redirectRows.length}.`);

/*
 * `worker.ts` restates the redirect table because its static fast path answers
 * document requests itself and never reaches the Next router — a redirect
 * declared only in `next.config.ts` works under `next start` and 404s on
 * Cloudflare. The duplication is allowed; drifting apart is not.
 */
const workerSource = fs.readFileSync("worker.ts", "utf8");
if (!nextConfig.includes("legacy-route-redirects.json") || !workerSource.includes("legacy-route-redirects.json")) {
  throw new Error("The retired-route redirect manifest must be imported by both Next.js and the static Worker path.");
}
const workerRedirectBlock = block(workerSource, "const PERMANENT_REDIRECTS = new Map<string, string>([", "]);" );
const workerRedirects = new Map(
  [...workerRedirectBlock.matchAll(/\[\s*"([^"]+)",\s*"([^"]+)",?\s*\]/g)].map((match) => [
    match[1],
    match[2],
  ]),
);
const redirectDrift = [
  ...configuredRedirectRows
    .filter((row) => workerRedirects.get(row.route) !== row.destination)
    .map((row) => `next.config.ts has ${row.route} -> ${row.destination}, worker.ts does not`),
  ...[...workerRedirects]
    .filter(([route]) => !configuredRedirectRows.some((row) => row.route === route))
    .map(([route]) => `worker.ts has ${route}, next.config.ts does not`),
];

if (redirectDrift.length) {
  throw new Error(`Redirect tables disagree:\n- ${redirectDrift.join("\n- ")}`);
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithPropagationRetry(url, options, expectedStatus) {
  const maximumAttempts = expectedStatus === 200 ? 8 : 3;
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    const response = await fetch(url, options);
    const retryable = response.status === 404 || response.status === 429 || response.status >= 500;
    if (!retryable || attempt === maximumAttempts) return response;
    await response.arrayBuffer();
    await delay(Math.min(attempt * 2_000, 10_000));
  }
  throw new Error(`Unreachable retry state for ${url}`);
}

const sitemapResponse = await fetchWithPropagationRetry(
  `${targetOrigin}/sitemap.xml`,
  { headers: { "User-Agent": "THE-BASE-Route-Indexability-Audit/1.0" } },
  200,
);
const sitemapXml = await sitemapResponse.text();
const sitemapPaths = new Set(
  [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => new URL(match[1]).pathname.replace(/\/$/, "") || "/"),
);
const expectedSitemapRoutes = 29 + glossaryRoutes.length + blogRoutes.length;
if (sitemapResponse.status !== 200 || sitemapPaths.size !== expectedSitemapRoutes) {
  throw new Error(
    `Expected HTTP 200 with ${expectedSitemapRoutes} target sitemap URLs; received HTTP ${sitemapResponse.status} with ${sitemapPaths.size}.`,
  );
}

function meta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    html.match(new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']*)`, "i"))?.[1] ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${escaped}["']`, "i"))?.[1] ??
    ""
  );
}

function getCanonical(html) {
  return (
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] ??
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1] ??
    ""
  );
}

async function inspect(entry) {
  const response = await fetchWithPropagationRetry(
    `${targetOrigin}${entry.route}`,
    {
      redirect: "manual",
      headers: { "User-Agent": "THE-BASE-Route-Indexability-Audit/1.0" },
    },
    entry.expectedStatus,
  );
  const body = await response.text();
  const robots = meta(body, "robots");
  const canonicalValue = getCanonical(body);
  const actualSitemap = sitemapPaths.has(entry.route);
  const issues = [];
  if (response.status !== entry.expectedStatus) issues.push(`expected ${entry.expectedStatus}, got ${response.status}`);
  if (entry.canonical && !/^https:\/\/thebasebev\.com(?:\/|$)/i.test(canonicalValue)) {
    issues.push("missing/non-production canonical");
  }
  if (!entry.canonical && canonicalValue) issues.push("unexpected canonical");
  if (entry.indexable && /noindex/i.test(robots)) issues.push("unexpected meta noindex");
  if (!entry.indexable && entry.canonical && !/noindex/i.test(robots)) issues.push("missing meta noindex");
  if (actualSitemap !== entry.sitemap) issues.push(`sitemap expected=${entry.sitemap} actual=${actualSitemap}`);
  return { ...entry, actualStatus: response.status, robots: robots || "-", canonicalValue: canonicalValue || "-", actualSitemap, issues };
}

const audited = new Array(controlledRoutes.length);
let cursor = 0;
async function worker() {
  while (cursor < controlledRoutes.length) {
    const index = cursor++;
    audited[index] = await inspect(controlledRoutes[index]);
    await delay(250);
  }
}
await Promise.all(Array.from({ length: 1 }, () => worker()));

const redirectAudits = [];
for (const redirect of redirectRows) {
  const response = await fetch(`${targetOrigin}${redirect.route}`, { redirect: "manual" });
  const location = response.headers.get("location");
  const destination = location ? new URL(location, targetOrigin).pathname : "";
  redirectAudits.push({ ...redirect, status: response.status, actualDestination: destination });
}

const failures = audited.filter((entry) => entry.issues.length);
for (const entry of redirectAudits) {
  if (entry.status !== 301 || entry.actualDestination !== entry.destination) {
    failures.push({ route: entry.route, issues: [`redirect expected 301 ${entry.destination}, got ${entry.status} ${entry.actualDestination}`] });
  }
}

const rows = audited.map(
  (entry) =>
    `| \`${entry.route}\` | ${entry.type} | ${entry.actualStatus} | ${entry.indexable ? "YES" : "NO"} | ${entry.canonicalValue === "-" ? "NO" : "YES"} | ${entry.actualSitemap ? "YES" : "NO"} | ${entry.reason}${entry.issues.length ? `; **FAIL: ${entry.issues.join("; ")}**` : ""} |`,
);
const redirectTable = redirectAudits.map(
  (entry) => `| \`${entry.route}\` | ${entry.status} | \`${entry.actualDestination || "-"}\` | \`${entry.destination}\` | ${entry.status === 301 && entry.actualDestination === entry.destination ? "PASS" : "FAIL"} |`,
);

const report = `# Route indexability audit

Generated: ${new Date().toISOString()}

Target: \`${targetOrigin}\`

## Accounting

- Friendly routes: ${friendlyRoutes.length} (${friendlyRoutes.filter((route) => route.indexable).length} canonical/indexable + ${friendlyRoutes.filter((route) => !route.indexable).length} excluded).
- Retired \`pageNNNN.html\` aliases served as permanent redirects: ${legacyPageRedirects.length}.
- Retired Tilda product aliases served as permanent redirects: ${productAliasRedirects.length}.
- Technical/metadata/API routes: 8.
- **Controlled route total: ${controlledRoutes.length}.**
- Permanent redirects (not generated pages): ${redirectRows.length}.
- Sitemap members: ${sitemapPaths.size}.

The ${controlledRoutes.length} controlled routes are the pages and endpoints that remain in the application. The ${redirectRows.length} historic aliases preserve existing inbound links without generating static HTML/RSC payloads; they must not enter the sitemap.

## Generated and technical routes

| Route | Type | Status | Indexable? | Canonical? | Sitemap? | Reason |
| --- | --- | ---: | --- | --- | --- | --- |
${rows.join("\n")}

## Redirects

| Route | Status | Actual destination | Expected destination | Result |
| --- | ---: | --- | --- | --- |
${redirectTable.join("\n")}

## Result

${failures.length ? failures.map((entry) => `- FAIL \`${entry.route}\`: ${entry.issues.join("; ")}`).join("\n") : "- PASS: all controlled routes and redirects match the declared indexability contract."}
`;

fs.writeFileSync(reportPath, report, "utf8");

if (failures.length) {
  console.error(failures.map((entry) => `${entry.route}: ${entry.issues.join("; ")}`).join("\n"));
  console.error(`Route indexability audit failed; report written to ${reportPath}.`);
  process.exitCode = 1;
} else {
  console.log(`Route indexability audit passed: ${controlledRoutes.length} routes, ${redirectRows.length} redirects, ${sitemapPaths.size} sitemap URLs.`);
  console.log(`Report written to ${reportPath}.`);
}
