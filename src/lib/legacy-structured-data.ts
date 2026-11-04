import { publicPath, publicUrl, SITE_ORIGIN } from "@/lib/site-paths";
import fs from "node:fs";
import path from "node:path";
import { PRODUCTS } from "@/data/products";

const exportRoot = path.join(process.cwd(), "tilda_export", "project12027355");

function publicize(value: unknown): unknown {
  if (typeof value === "string") {
    if (/^\/?images\//.test(value)) return `${SITE_ORIGIN}/${value.replace(/^\//, "")}`;
    // Identity fragments describe the company/site, not a regional page.
    if (value.startsWith(`${SITE_ORIGIN}/#`)) return value;
    return publicUrl(value);
  }
  if (Array.isArray(value)) return value.map(publicize);
  if (value && typeof value === "object") {
    if ("@type" in value && value["@type"] === "OfferCatalog") {
      return {
        ...value,
        numberOfItems: PRODUCTS.length,
        itemListElement: PRODUCTS.map((product, index) => ({
          "@type": "ListItem", position: index + 1, name: product.name,
          url: `${SITE_ORIGIN}${publicPath(product.route)}`,
        })),
      };
    }
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, publicize(item)]));
  }
  return value;
}

const LD_JSON =
  /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

export function rewriteLegacyStructuredData(source: string, omitFaq: boolean) {
  return source.replace(LD_JSON, (tag, raw: string) => {
    try {
      const block = JSON.parse(raw);
      if (omitFaq && block["@type"] === "FAQPage") return "";
      if (omitFaq && Array.isArray(block["@graph"])) {
        block["@graph"] = block["@graph"].filter((item: Record<string, unknown>) => item["@type"] !== "FAQPage");
      }
      const normalized = JSON.stringify(publicize(block)).replace(/</g, "\\u003c");
      return `<script type="application/ld+json">${normalized}</script>`;
    } catch {
      return tag;
    }
  });
}

export function getLegacyStructuredData(file: string): string[] {
  const bodyFile = path.join(
    exportRoot,
    "files",
    file.replace(/\.html$/, "body.html"),
  );

  const source = fs.existsSync(bodyFile)
    ? fs.readFileSync(bodyFile, "utf8")
    : fs.readFileSync(path.join(exportRoot, file), "utf8");

  const blocks: string[] = [];
  for (const match of source.matchAll(LD_JSON)) {
    const raw = match[1].trim();
    if (!raw) continue;

    // Only pass through what actually parses — a malformed block is worse for
    // crawlers than none, and it would fail silently in production.
    try {
      blocks.push(JSON.stringify(publicize(JSON.parse(raw))).replace(/</g, "\\u003c"));
    } catch {
      continue;
    }
  }

  return blocks;
}

let organizationGraph: string | undefined;

export function getOrganizationStructuredData() {
  if (organizationGraph) return organizationGraph;
  const blocks = getLegacyStructuredData("page62588185.html").map((block) => JSON.parse(block));
  const graph = blocks.flatMap((block) => block["@graph"] ?? [block]).filter((item) => {
    const types = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];
    return types.includes("Organization") || types.includes("WebSite");
  });
  organizationGraph = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return organizationGraph;
}
