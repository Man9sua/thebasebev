import fs from "node:fs";

const productionOrigin = "https://thebasebev.com";
const targetOrigin = (process.argv[2] ?? "https://the-base-staging.mansua.workers.dev").replace(/\/$/, "");
const reportPath = process.argv[3] ?? "SEO_PARITY_REPORT.md";
const previewTarget = new URL(targetOrigin).hostname.endsWith(".workers.dev");

function decodeHtml(value = "") {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ndash;|&#8211;/gi, "–")
    .replace(/&mdash;|&#8212;/gi, "—")
    .replace(/\s+/g, " ")
    .trim();
}

function all(html, expression) {
  return [...html.matchAll(expression)].map((match) => decodeHtml(match[1])).filter(Boolean);
}

function first(html, expression) {
  return decodeHtml(html.match(expression)?.[1] ?? "");
}

function meta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtml(match[1]);
  }
  return "";
}

function canonical(html) {
  return (
    first(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i) ||
    first(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)
  );
}

function structuredDataTypes(html) {
  const types = [];
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const value = JSON.parse(match[1]);
      const visit = (node) => {
        if (Array.isArray(node)) return node.forEach(visit);
        if (!node || typeof node !== "object") return;
        const type = node["@type"];
        if (typeof type === "string") types.push(type);
        if (Array.isArray(type)) types.push(...type.filter((item) => typeof item === "string"));
        Object.values(node).forEach(visit);
      };
      visit(value);
    } catch {
      types.push("INVALID_JSON_LD");
    }
  }
  return [...new Set(types)].sort();
}

function normalizeInternalLinks(html, responseOrigin) {
  const links = new Set();
  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    const href = decodeHtml(match[1]);
    if (!href || /^(?:#|mailto:|tel:|javascript:)/i.test(href)) continue;
    try {
      const url = new URL(href, responseOrigin);
      if (!["thebasebev.com", "www.thebasebev.com", new URL(targetOrigin).hostname].includes(url.hostname)) continue;
      const pathname = url.pathname !== "/" ? url.pathname.replace(/\/$/, "") : "/";
      links.add(`${pathname}${url.search}`);
    } catch {
      // Invalid source links are reported by the set difference below only
      // when one side can normalize them.
    }
  }
  return [...links].sort();
}

function imageAltStats(html) {
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const missing = images.filter((tag) => !/\balt=["'][^"']*["']/i.test(tag)).length;
  const empty = images.filter((tag) => /\balt=["']\s*["']/i.test(tag)).length;
  return { total: images.length, missing, empty };
}

function normalizeRobots(value) {
  const tokens = value
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean);
  if (!tokens.length) return "follow,index";
  const normalized = new Set(tokens);
  if (!normalized.has("noindex")) normalized.add("index");
  if (!normalized.has("nofollow")) normalized.add("follow");
  return [...normalized].sort().join(",");
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithRetry(url, options = {}) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(url, options);
    const retryable = response.status === 404 || response.status === 429 || response.status >= 500;
    if (!retryable || attempt === 5) return response;
    await response.arrayBuffer();
    await delay(attempt * 1_000);
  }
  throw new Error(`Unreachable retry state for ${url}`);
}

async function fetchSnapshot(origin, route) {
  const response = await fetchWithRetry(`${origin}${route === "/" ? "/" : route}`, {
    redirect: "manual",
    headers: {
      "User-Agent": "THE-BASE-SEO-Parity-Audit/1.0",
      Accept: "text/html,*/*",
    },
  });
  const html = await response.text();
  return {
    status: response.status,
    xRobots: response.headers.get("x-robots-tag") ?? "",
    title: first(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: meta(html, "description"),
    h1: first(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i),
    h2: all(html, /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi),
    canonical: canonical(html),
    robots: meta(html, "robots"),
    jsonLdTypes: structuredDataTypes(html),
    openGraph: {
      title: meta(html, "og:title"),
      description: meta(html, "og:description"),
      url: meta(html, "og:url"),
      type: meta(html, "og:type"),
      image: meta(html, "og:image"),
    },
    links: normalizeInternalLinks(html, origin),
    alt: imageAltStats(html),
  };
}

const sitemapResponse = await fetchWithRetry(`${targetOrigin}/sitemap.xml`, {
  headers: { "User-Agent": "THE-BASE-SEO-Parity-Audit/1.0" },
});
const sitemapXml = await sitemapResponse.text();
const routes = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => {
  const url = new URL(decodeHtml(match[1]));
  return url.pathname !== "/" ? url.pathname.replace(/\/$/, "") : "/";
});

if (sitemapResponse.status !== 200 || routes.length !== 29 || new Set(routes).size !== 29) {
  throw new Error(`Expected 29 unique target sitemap URLs, received ${routes.length}.`);
}

const results = new Array(routes.length);
let cursor = 0;
async function worker() {
  while (cursor < routes.length) {
    const index = cursor++;
    const route = routes[index];
    const production = await fetchSnapshot(productionOrigin, route);
    await delay(500);
    const target = await fetchSnapshot(targetOrigin, route);
    results[index] = { route, production, target };
    await delay(500);
  }
}
await Promise.all(Array.from({ length: 1 }, () => worker()));

const criticalFailures = [];
const warnings = [];
const declared = [];
const rows = [];

for (const { route, production, target } of results) {
  const issues = [];
  if (production.status !== 200) issues.push(`production status ${production.status}`);
  if (target.status !== 200) issues.push(`target status ${target.status}`);
  for (const field of ["title", "description", "canonical"]) {
    if (production[field] !== target[field]) issues.push(`${field} mismatch`);
  }

  /*
   * The product pages deliberately lead with the product's name and carry
   * production's own h1 as the h2 under it — the owner's call, taken knowing
   * this file is what guards it. So a differing h1 is allowed only while
   * production's wording is still on the page as a heading. Drop the phrase
   * altogether and this is a critical failure again.
   */
  if (production.h1 !== target.h1) {
    if (production.h1 && target.h2.includes(production.h1)) {
      declared.push(`${route}: h1 is now "${target.h1}"; production wording kept as h2`);
    } else {
      issues.push("h1 mismatch");
    }
  }
  if (normalizeRobots(production.robots) !== normalizeRobots(target.robots)) {
    issues.push("robots/indexability mismatch");
  }
  if (JSON.stringify(production.jsonLdTypes) !== JSON.stringify(target.jsonLdTypes)) {
    issues.push("JSON-LD type mismatch");
  }
  for (const field of ["title", "url", "type"]) {
    if (production.openGraph[field] !== target.openGraph[field]) issues.push(`og:${field} mismatch`);
  }
  if (
    production.openGraph.description &&
    production.openGraph.description !== target.openGraph.description
  ) {
    issues.push("og:description mismatch");
  }
  if (production.openGraph.image && !target.openGraph.image) {
    issues.push("og:image missing");
  }
  if (target.openGraph.image && !/^https:\/\/thebasebev\.com(?:\/|$)/i.test(target.openGraph.image)) {
    issues.push("target og:image is not production-oriented");
  }
  if (!/^https:\/\/thebasebev\.com(?:\/|$)/i.test(target.canonical)) {
    issues.push("target canonical is not production-oriented");
  }
  if (/workers\.dev/i.test(target.canonical)) issues.push("workers.dev leaked into canonical");
  if (/noindex/i.test(target.robots)) issues.push("public page has meta noindex");
  if (previewTarget && !/noindex/i.test(target.xRobots)) {
    issues.push("preview transport lacks X-Robots-Tag noindex");
  }

  const productionLinks = new Set(production.links);
  const targetLinks = new Set(target.links);
  const missingLinks = production.links.filter((link) => !targetLinks.has(link));
  const addedLinks = target.links.filter((link) => !productionLinks.has(link));
  if (missingLinks.length || addedLinks.length) {
    warnings.push(`${route}: internal links differ (-${missingLinks.length}/+${addedLinks.length})`);
  }
  if (JSON.stringify(production.alt) !== JSON.stringify(target.alt)) {
    warnings.push(`${route}: image alt stats differ (${JSON.stringify(production.alt)} vs ${JSON.stringify(target.alt)})`);
  }

  if (issues.length) criticalFailures.push(`${route}: ${issues.join(", ")}`);
  rows.push(
    `| \`${route}\` | ${production.status} | ${target.status} | ${issues.length ? "FAIL" : "PASS"} | ${production.links.length}/${target.links.length} | ${target.alt.total}/${target.alt.missing}/${target.alt.empty} | ${issues.join("; ") || "Critical fields match"} |`,
  );
}

const report = `# SEO parity report

Generated: ${new Date().toISOString()}

- Production: \`${productionOrigin}\`
- Target: \`${targetOrigin}\`
- Canonical public routes: ${routes.length}
- Critical failures: ${criticalFailures.length}
- Declared h1 demotions (production wording kept as h2): ${declared.length}
- Non-blocking link/alt observations: ${warnings.length}
- Preview transport noindex expected: ${previewTarget ? "yes" : "no"}

The target is allowed to return \`X-Robots-Tag: noindex, nofollow\` on a \`workers.dev\` preview. Page-level metadata and canonical URLs must still match production and remain oriented to \`https://thebasebev.com\`.

| Route | Production | Target | Critical parity | Internal links P/T | Target images/missing/empty alt | Notes |
| --- | ---: | ---: | --- | ---: | ---: | --- |
${rows.join("\n")}

## Critical failures

${criticalFailures.length ? criticalFailures.map((item) => `- ${item}`).join("\n") : "- None."}

## Declared h1 demotions

These pages lead with the product's name and carry production's wording as the
h2 under it. The parity check still fails if that wording leaves the page.

${declared.length ? declared.map((item) => `- ${item}`).join("\n") : "- None."}

## Non-blocking observations

${warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- None."}
`;

fs.writeFileSync(reportPath, report, "utf8");

if (criticalFailures.length) {
  console.error(criticalFailures.join("\n"));
  console.error(`SEO parity audit failed; report written to ${reportPath}.`);
  process.exitCode = 1;
} else {
  console.log(`SEO parity audit passed for ${routes.length} canonical routes; report written to ${reportPath}.`);
  if (declared.length) console.log(`${declared.length} declared h1 demotions; production wording still present as h2.`);
  if (warnings.length) console.log(`${warnings.length} non-blocking link/alt observations are documented.`);
}
