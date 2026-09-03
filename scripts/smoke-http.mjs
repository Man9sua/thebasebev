import fs from "node:fs";

const baseUrl = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const targetUrl = new URL(baseUrl);
const workerTarget = targetUrl.hostname.endsWith(".workers.dev");
const productionTarget = ["thebasebev.com", "www.thebasebev.com"].includes(
  targetUrl.hostname.toLowerCase(),
);
const glossaryContent = JSON.parse(fs.readFileSync("src/data/glossary-content.json", "utf8"));
const expectedSitemapUrls = 29 + glossaryContent.entries.length;

const publicRoutes = [
  "/",
  "/main",
  "/wholesale-strategy",
  "/contacts",
  "/about-us",
  "/resources",
  "/distributors",
  "/resources/blog",
  "/private-labeling",
  "/sitemap",
  "/resources/glossary",
  "/resources/tools",
  "/rnd",
  "/raf-coffee",
  "/cream-latte",
  "/chai-latte",
  "/milkshake",
  "/frappe",
  "/iced-tea",
  "/cordial",
  "/topping",
  "/matcha",
  "/chocolate",
  "/sugar-syrup",
  "/vending",
  "/jam",
  "/garnish",
  "/sugar-free",
  "/tea",
  "/catalog",
  "/thank-you-order",
  "/terms",
  "/privacy",
  "/thank-you-form",
  "/retail",
  "/knowledge-recipes",
  "/not-found",
  "/link",
];

const redirects = new Map([
  ["/page65953477.html", "/"],
  ["/page65953593.html", "/"],
  ["/raf-cofeee", "/raf-coffee"],
  ["/raf-cofee", "/raf-coffee"],
  ["/functional-wellness", "/catalog"],
  ["/cabinet", "/"],
]);

const failures = [];

for (const route of publicRoutes) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
  const html = await response.text();
  if (response.status !== 200) failures.push(`${route}: expected 200, received ${response.status}`);
  if (!/<html[^>]+lang=["']en["']/i.test(html)) failures.push(`${route}: missing static lang=en`);
  if (!/<title[^>]*>[^<]+<\/title>/i.test(html)) failures.push(`${route}: missing title`);
  if (!["/knowledge-recipes", "/link"].includes(route) && !/<h1\b/i.test(html)) {
    failures.push(`${route}: missing crawler-visible H1`);
  }
  if (route === "/" && (workerTarget || productionTarget)) {
    const expectedHeaders = new Map([
      ["x-content-type-options", "nosniff"],
      ["referrer-policy", "strict-origin-when-cross-origin"],
      ["permissions-policy", "camera=(), microphone=(), geolocation=()"],
      ["x-frame-options", "SAMEORIGIN"],
    ]);
    for (const [name, expected] of expectedHeaders) {
      if (response.headers.get(name) !== expected) {
        failures.push(`/: expected ${name}: ${expected}`);
      }
    }
    const xRobots = response.headers.get("x-robots-tag") ?? "";
    if (workerTarget && !/noindex/i.test(xRobots)) {
      failures.push("/: workers.dev preview is missing X-Robots-Tag noindex");
    }
    if (productionTarget && /noindex/i.test(xRobots)) {
      failures.push("/: production hostname unexpectedly returns X-Robots-Tag noindex");
    }
  }
}

for (const [route, destination] of redirects) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
  const location = response.headers.get("location");
  const actualPath = location ? new URL(location, baseUrl).pathname : "";
  if (response.status !== 301 || actualPath !== destination) {
    failures.push(`${route}: expected 301 to ${destination}, received ${response.status} to ${location}`);
  }
}

const robots = await fetch(`${baseUrl}/robots.txt`);
const robotsText = await robots.text();
if (robots.status !== 200 || !robotsText.includes("Allow: /") || !robotsText.includes("/sitemap.xml")) {
  failures.push("/robots.txt: invalid response");
}

const sitemap = await fetch(`${baseUrl}/sitemap.xml`);
const sitemapText = await sitemap.text();
const sitemapUrls = sitemapText.match(/<loc>/g)?.length ?? 0;
if (sitemap.status !== 200 || sitemapUrls !== expectedSitemapUrls) {
  failures.push(`/sitemap.xml: expected ${expectedSitemapUrls} URLs, received ${sitemapUrls}`);
}

const missing = await fetch(`${baseUrl}/this-route-must-not-exist`, { redirect: "manual" });
const missingHtml = await missing.text();
if (missing.status !== 404 || !/Error 404|Page not found/i.test(missingHtml)) {
  failures.push(`/this-route-must-not-exist: branded 404 check failed (${missing.status})`);
}

const health = await fetch(`${baseUrl}/api/health`);
const healthBody = await health.json().catch(() => null);
if (
  health.status !== 200 ||
  healthBody?.status !== "ok" ||
  !/no-store/i.test(health.headers.get("cache-control") ?? "")
) {
  failures.push(`/api/health: expected safe 200 no-store response`);
}

const lead = await fetch(`${baseUrl}/api/leads`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  // Intentionally invalid: smoke/readiness must never create a CRM record,
  // even when the target has a real LEAD_API_URL configured.
  body: JSON.stringify({}),
});
if (lead.status !== 400) failures.push(`/api/leads: expected safe validation 400, received ${lead.status}`);
if ((workerTarget || productionTarget) && !/no-store/i.test(lead.headers.get("cache-control") ?? "")) {
  failures.push("/api/leads: expected no-store response on Worker target");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`HTTP smoke passed: ${publicRoutes.length} routes, ${redirects.size} redirects, SEO endpoints, branded 404, deployment headers, health, and non-delivering lead API validation.`);
}
