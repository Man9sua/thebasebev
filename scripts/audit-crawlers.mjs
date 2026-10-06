import { readNativeRoutes } from "./native-routes.mjs";

const baseUrl = new URL(process.argv[2] ?? "https://the-base-staging.mansua.workers.dev");
baseUrl.pathname = "/";
baseUrl.search = "";
baseUrl.hash = "";

const crawlerAgents = [
  ["Googlebot", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"],
  ["Bingbot", "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)"],
  ["Applebot", "Mozilla/5.0 (compatible; Applebot/0.3; +http://www.apple.com/go/applebot)"],
  ["OAI-SearchBot", "OAI-SearchBot/1.0; +https://openai.com/searchbot"],
  ["ChatGPT-User", "Mozilla/5.0 AppleWebKit/537.36; compatible; ChatGPT-User/1.0; +https://openai.com/bot"],
  ["PerplexityBot", "PerplexityBot/1.0; +https://docs.perplexity.ai/docs/perplexitybot"],
  ["Perplexity-User", "Mozilla/5.0; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user"],
  ["Claude-SearchBot", "Claude-SearchBot/1.0; +https://anthropic.com"],
  ["Claude-User", "Claude-User/1.0; +https://anthropic.com"],
];

const isPreview =
  baseUrl.hostname.endsWith(".workers.dev") ||
  baseUrl.hostname === "localhost" ||
  baseUrl.hostname === "127.0.0.1";
const failures = [];
const rows = [];
const crawlerRoutes = ["/ae", ...readNativeRoutes().map((route) => `/ae${route}`)];

function extract(html, expression) {
  return (html.match(expression)?.[1] ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function request(pathname, userAgent) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    return await fetch(new URL(pathname, baseUrl), {
      redirect: "manual",
      headers: { "User-Agent": userAgent, Accept: "text/html,*/*" },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

for (const [name, userAgent] of crawlerAgents) {
  for (const route of crawlerRoutes) {
    const label = `${name} ${route}`;
    try {
      const response = await request(route, userAgent);
      const html = await response.text();
      const status = response.status;
      const location = response.headers.get("location") ?? "";
      const xRobots = response.headers.get("x-robots-tag") ?? "";
      const canonical = extract(
        html,
        /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i,
      );
      const h1 = extract(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
      if (status === 403 || status === 429 || status >= 500) {
        failures.push(`${label}: blocked or failed with HTTP ${status}`);
      } else if (status !== 200) {
        failures.push(`${label}: expected HTTP 200, received ${status} ${location}`.trim());
      }
      if (html.length < 1_000 || !h1) failures.push(`${label}: crawl-critical HTML is unavailable`);
      if (canonical.replace(/\/$/, "") !== `https://thebasebev.com${route}`) {
        failures.push(`${label}: unexpected canonical ${canonical || "(missing)"}`);
      }
      if (isPreview && (!/noindex/i.test(xRobots) || !/nofollow/i.test(xRobots))) {
        failures.push(`${label}: preview response lacks X-Robots-Tag noindex, nofollow`);
      }
      if (!isPreview && /noindex|nofollow/i.test(xRobots)) {
        failures.push(`${label}: production response has unexpected X-Robots-Tag ${xRobots}`);
      }
      rows.push({ name, route, status, redirect: location || "-", xRobots: xRobots || "-", canonical, h1: Boolean(h1) });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${label}: request failed (${message})`);
      rows.push({ name, route, status: "ERR", redirect: "-", xRobots: "-", canonical: "-", h1: false });
    }
  }
  try {
    const robotsResponse = await request("/robots.txt", userAgent);
    const robots = await robotsResponse.text();
    if (robotsResponse.status !== 200) failures.push(`${name}: robots.txt returned ${robotsResponse.status}`);
    if (/^\s*Disallow:\s*\/\s*$/im.test(robots)) failures.push(`${name}: robots.txt blocks the entire site`);
    if (!/Allow:\s*\//i.test(robots)) failures.push(`${name}: robots.txt does not explicitly allow crawling`);
    if (!/Sitemap:\s*https:\/\/thebasebev\.com\/sitemap\.xml/i.test(robots)) {
      failures.push(`${name}: robots.txt does not advertise the production canonical sitemap`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push(`${name}: robots.txt request failed (${message})`);
  }
}

console.table(rows);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Crawler audit passed for ${crawlerAgents.length} user agents across ${crawlerRoutes.length} pages at ${baseUrl.origin}; preview noindex=${isPreview}.`,
  );
}
