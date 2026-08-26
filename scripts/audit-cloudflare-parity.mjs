import { createHash } from "node:crypto";

const sourceOrigin = (process.argv[2] ?? "https://the-base-staging.mnsdemo.workers.dev").replace(/\/$/, "");
const targetOrigin = (process.argv[3] ?? "https://the-base-staging.mansua.workers.dev").replace(/\/$/, "");

for (const [label, value] of [["source", sourceOrigin], ["target", targetOrigin]]) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error(`${label} must be an HTTPS URL without embedded credentials.`);
  }
}

const routes = [
  "/", "/main", "/wholesale-strategy", "/contacts", "/about-us", "/resources",
  "/distributors", "/resources/blog", "/private-labeling", "/sitemap",
  "/resources/glossary", "/resources/tools", "/rnd", "/raf-coffee", "/cream-latte",
  "/chai-latte", "/milkshake", "/frappe", "/iced-tea", "/cordial", "/topping",
  "/matcha", "/chocolate", "/sugar-syrup", "/vending", "/jam", "/garnish",
  "/sugar-free", "/tea", "/catalog", "/thank-you-order", "/terms", "/privacy",
  "/thank-you-form", "/retail", "/knowledge-recipes", "/not-found", "/link",
];

const redirects = new Map([
  ["/page65953477.html", "/"],
  ["/page65953593.html", "/"],
  ["/raf-cofeee", "/raf-coffee"],
  ["/raf-cofee", "/raf-coffee"],
  ["/functional-wellness", "/catalog"],
]);

const targetOnlyRedirects = new Map([["/cabinet", "/"]]);

function attribute(html, tag, attributeName, attributeValue, resultAttribute) {
  const tags = html.match(new RegExp(`<${tag}\\b[^>]*>`, "gi")) ?? [];
  for (const candidate of tags) {
    const key = candidate.match(new RegExp(`${attributeName}=["']([^"']*)`, "i"))?.[1] ?? "";
    if (key.toLowerCase() !== attributeValue.toLowerCase()) continue;
    return candidate.match(new RegExp(`${resultAttribute}=["']([^"']*)`, "i"))?.[1] ?? "";
  }
  return "";
}

function textContent(fragment) {
  return fragment
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inspectHtml(html) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "";
  const visible = textContent(html);
  const internalLinks = (html.match(/href=["'](?:https:\/\/thebasebev\.com)?\//gi) ?? []).length;
  const images = html.match(/<img\b[^>]*>/gi) ?? [];
  const missingAlt = images.filter((tag) => !/\balt=["'][^"']*["']/i.test(tag)).length;
  return {
    title: textContent(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""),
    description: attribute(html, "meta", "name", "description", "content"),
    canonical: attribute(html, "link", "rel", "canonical", "href"),
    robots: attribute(html, "meta", "name", "robots", "content"),
    h1: textContent(h1),
    jsonLd: (html.match(/<script\b[^>]*type=["']application\/ld\+json["']/gi) ?? []).length,
    internalLinks,
    images: images.length,
    missingAlt,
    cabinetLinks: (html.match(/href=["']\/cabinet(?:["'#?])/gi) ?? []).length,
    visibleTextHash: createHash("sha256").update(visible).digest("hex"),
  };
}

async function inspect(origin, route) {
  const response = await fetch(`${origin}${route}`, {
    redirect: "manual",
    headers: { "User-Agent": "THE-BASE-Cloudflare-Account-Parity/1.0" },
  });
  const html = await response.text();
  return {
    status: response.status,
    xRobots: response.headers.get("x-robots-tag") ?? "",
    ...inspectHtml(html),
  };
}

const failures = [];
let cursor = 0;
async function worker() {
  while (cursor < routes.length) {
    const index = cursor++;
    const route = routes[index];
    const [source, target] = await Promise.all([inspect(sourceOrigin, route), inspect(targetOrigin, route)]);
    const cabinetWasRemoved = source.cabinetLinks > 0 && target.cabinetLinks === 0;
    const intentionalShellFields = new Set(
      cabinetWasRemoved ? ["cabinetLinks", "internalLinks", "visibleTextHash"] : [],
    );
    const differences = Object.keys(source).filter(
      (key) => source[key] !== target[key] && !intentionalShellFields.has(key),
    );
    if (differences.length) {
      failures.push(`${route}: ${differences.map((key) => `${key} (${JSON.stringify(source[key])} -> ${JSON.stringify(target[key])})`).join(", ")}`);
    }
  }
}
await Promise.all(Array.from({ length: 6 }, () => worker()));

for (const [route, expected] of targetOnlyRedirects) {
  const response = await fetch(`${targetOrigin}${route}`, { redirect: "manual" });
  const location = response.headers.get("location");
  const destination = location ? new URL(location, targetOrigin).pathname : "";
  if (response.status !== 301 || destination !== expected) {
    failures.push(
      `${route}: target-only redirect expected 301 ${expected}, received ${response.status} ${destination || "<none>"}`,
    );
  }
}

for (const [route, expected] of redirects) {
  const signatures = await Promise.all(
    [sourceOrigin, targetOrigin].map(async (origin) => {
      const response = await fetch(`${origin}${route}`, { redirect: "manual" });
      const location = response.headers.get("location");
      return {
        status: response.status,
        destination: location ? new URL(location, origin).pathname : "",
      };
    }),
  );
  if (signatures.some((item) => item.status !== 301 || item.destination !== expected) || JSON.stringify(signatures[0]) !== JSON.stringify(signatures[1])) {
    failures.push(`${route}: redirect parity failed (${JSON.stringify(signatures)})`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Cloudflare account parity passed: ${routes.length} rendered routes and ${redirects.size} redirects are semantically identical.`);
  console.log(`Source retained: ${sourceOrigin}`);
  console.log(`Target verified: ${targetOrigin}`);
}
