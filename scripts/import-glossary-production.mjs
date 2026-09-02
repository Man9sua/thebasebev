import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PRODUCTION_ORIGIN = "https://thebasebev.com";
const LISTING_URL = `${PRODUCTION_ORIGIN}/resources/glossary`;
const FEED_UID = "439083905811";
const FEED_RECID = "2427859931";
const FEED_URL = "https://feeds.tildaapi.one/api/getfeed/";
const POST_URL = "https://feeds.tildaapi.one/api/getpost/";
const EXPECTED_EMPTY_UID = "tfm5mybkl1";
const REQUEST_HEADERS = { "user-agent": "THE-BASE-glossary-migration/1.0" };
const LOCAL_CANONICAL_PATHS = new Set(["/chai-latte", "/private-labeling"]);

const BUSINESS_TERMS = new Set([
  "Authenticity Premium", "Beverage Cost %", "CapEx", "Category Anchor", "Contract Manufacturing",
  "Crossover Drink", "Cup Cost", "Deskilling", "EXW", "FOB", "CIF", "Franchise Uniformity",
  "Habit Loop", "HS Code", "Incoterms", "Landed Cost", "Lead Time", "Lot Number", "LTO",
  "Menu Engineering", "Mise en Place", "MOQ", "Net Margin per Cup", "ODM", "OEM", "OpEx",
  "Peak Hour", "Portion Control", "Premiumization", "Private Label", "Signature Drink", "SKU",
  "Ticket Time", "Trade Marketing", "Waste Log", "White Label",
]);

const TECH_TERMS = new Set([
  "Agglomeration", "Ambient Shelf Life", "Anti caking Agent", "Astringency", "Brix", "Bulk Density",
  "Caramelization", "Certificate of Analysis", "Ceremonial vs Culinary Matcha", "Cold Chain",
  "Danger Zone", "Dial In", "Dispersibility", "Dose Weight", "Doypack", "Emulsion", "Encapsulation",
  "Frappe", "Freddo", "GMP", "HACCP", "Halal Certification", "Homogenization", "Hygroscopicity",
  "Instantization", "ISO 22000", "Maillard Reaction", "Mouthfeel", "Nitro Cold Brew", "Overrun",
  "Sensory Panel", "Solubility", "Stabilizer", "Steam Wand", "Theaflavins", "Volatile Terpenes",
  "Water Activity",
]);

function categoryFor(title) {
  if (BUSINESS_TERMS.has(title)) return "business";
  if (TECH_TERMS.has(title)) return "tech";
  return "ingredients";
}

async function fetchWithRetry(url, { responseType = "json", attempts = 5 } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: REQUEST_HEADERS,
        redirect: "follow",
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return {
        response,
        data: responseType === "json" ? await response.json() : await response.text(),
      };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }

  throw new Error(`Failed to fetch ${url}: ${lastError?.message ?? "unknown error"}`);
}

async function mapConcurrent(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

function decodeHtml(value = "") {
  const namedEntities = {
    amp: "&",
    apos: "'",
    gt: ">",
    hellip: "…",
    laquo: "«",
    lt: "<",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    quot: '"',
    raquo: "»",
  };

  return value.replace(/&(#x?[\da-f]+|[a-z]+);/gi, (entity, code) => {
    if (code.startsWith("#")) {
      const isHex = code[1]?.toLowerCase() === "x";
      const numeric = Number.parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(numeric) ? String.fromCodePoint(numeric) : entity;
    }
    return namedEntities[code.toLowerCase()] ?? entity;
  });
}

function normalizeText(value = "") {
  return decodeHtml(value).replace(/\s+/g, " ").trim();
}

function parseAttributes(tag) {
  const attributes = {};
  for (const match of tag.matchAll(/([^\s=/>]+)\s*=\s*(["'])([\s\S]*?)\2/g)) {
    attributes[match[1].toLowerCase()] = decodeHtml(match[3]);
  }
  return attributes;
}

function findElementContent(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return normalizeText((match?.[1] ?? "").replace(/<[^>]+>/g, " "));
}

function findTagAttribute(html, tagName, key, value, resultAttribute) {
  const expression = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  for (const match of html.matchAll(expression)) {
    const attributes = parseAttributes(match[0]);
    if (attributes[key]?.toLowerCase() === value.toLowerCase()) {
      return normalizeText(attributes[resultAttribute] ?? "");
    }
  }
  return "";
}

function normalizeInternalHref(href) {
  if (!href) return "";
  try {
    const url = new URL(href, PRODUCTION_ORIGIN);
    if (url.origin === PRODUCTION_ORIGIN && LOCAL_CANONICAL_PATHS.has(url.pathname)) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
    return url.href;
  } catch {
    return href;
  }
}

function appendInline(paragraph, inline) {
  if (!inline.text) return;
  const previous = paragraph.at(-1);
  if (inline.type === "text" && previous?.type === "text") {
    previous.text = `${previous.text} ${inline.text}`.replace(/\s+/g, " ").trim();
    return;
  }
  paragraph.push(inline);
}

function parseBody(html = "") {
  const paragraphs = [];
  let paragraph = [];
  let activeHref = "";

  const flush = () => {
    if (paragraph.some((inline) => inline.text)) {
      paragraphs.push({ type: "paragraph", content: paragraph });
    }
    paragraph = [];
  };

  for (const token of html.match(/<br\s*\/?\s*>|<a\b[^>]*>|<\/a\s*>|<[^>]+>|[^<]+/gi) ?? []) {
    if (/^<br\b/i.test(token)) {
      flush();
      continue;
    }
    if (/^<a\b/i.test(token)) {
      activeHref = normalizeInternalHref(parseAttributes(token).href ?? "");
      continue;
    }
    if (/^<\/a/i.test(token)) {
      activeHref = "";
      continue;
    }
    if (token.startsWith("<")) continue;

    const text = normalizeText(token);
    if (!text) continue;
    appendInline(
      paragraph,
      activeHref ? { type: "link", text, href: activeHref } : { type: "text", text },
    );
  }
  flush();

  return paragraphs;
}

function bodyTextFromParagraphs(paragraphs) {
  return paragraphs
    .map((paragraph) => paragraph.content.map((inline) => inline.text).join(" ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

function hashText(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function escapeTable(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function buildInventory(content) {
  const emptyEntries = content.entries.filter((entry) => entry.contentStatus !== "published");
  const linkedBodies = content.entries.filter((entry) =>
    entry.body.some((paragraph) => paragraph.content.some((inline) => inline.type === "link")),
  );

  const rows = content.entries.map((entry) => [
    escapeTable(entry.title),
    `\`${entry.uid}\``,
    escapeTable(entry.category),
    `[production](${entry.sourceUrl})`,
    String(entry.sourceStatus),
    `\`${entry.path}\``,
    entry.contentStatus === "published" ? "YES" : "NO — empty production source",
  ].join(" | "));

  return `# Production Glossary Inventory

Generated by \`node scripts/import-glossary-production.mjs\` from the public, read-only Tilda feed and article pages. The generated application data has no runtime dependency on Tilda.

## Summary

- Listing: ${content.source.listingUrl}
- Feed UID: \`${content.source.feedUid}\`
- Production terms: **${content.entries.length}**
- Unique production paths: **${new Set(content.entries.map((entry) => entry.path)).size}**
- Direct production HTTP 200: **${content.entries.filter((entry) => entry.sourceStatus === 200).length}**
- Bodies with preserved inline links: **${linkedBodies.length}**
- Empty production articles: **${emptyEntries.length}** (${emptyEntries.map((entry) => `${entry.title} / ${entry.uid}`).join(", ") || "none"})
- Duplicate titles are retained as independent UID/path records.

## Audit table

TITLE | UID | CATEGORY | PRODUCTION URL | STATUS | STAGING ROUTE | CONTENT FOUND
--- | --- | --- | --- | ---: | --- | ---
${rows.join("\n")}
`;
}

function feedRequestUrl() {
  const url = new URL(FEED_URL);
  url.searchParams.set("feeduid", FEED_UID);
  url.searchParams.set("recid", FEED_RECID);
  url.searchParams.set("size", "200");
  url.searchParams.set("slice", "1");
  url.searchParams.set("sort[date]", "desc");
  url.searchParams.set("filters[date]", "");
  url.searchParams.set("getparts", "true");
  return url;
}

async function importGlossary() {
  const { data: feed } = await fetchWithRetry(feedRequestUrl());
  if (!Array.isArray(feed.posts) || feed.posts.length !== Number(feed.total)) {
    throw new Error(`Feed completeness mismatch: expected ${feed.total}, received ${feed.posts?.length ?? 0}`);
  }

  const posts = await mapConcurrent(feed.posts, 5, async (summary) => {
    const url = new URL(POST_URL);
    url.searchParams.set("postuid", summary.uid);
    const { data } = await fetchWithRetry(url);
    if (!data.post) throw new Error(`Missing getpost payload for ${summary.uid}`);
    return { ...summary, ...data.post };
  });

  const directPages = await mapConcurrent(posts, 4, async (post) => {
    const { response, data: html } = await fetchWithRetry(post.url, { responseType: "text" });
    return {
      uid: post.uid,
      status: response.status,
      finalUrl: response.url,
      title: findElementContent(html, "title"),
      description: findTagAttribute(html, "meta", "name", "description", "content"),
      canonical: findTagAttribute(html, "link", "rel", "canonical", "href"),
      robots: findTagAttribute(html, "meta", "name", "robots", "content"),
      openGraphTitle: findTagAttribute(html, "meta", "property", "og:title", "content"),
      openGraphDescription: findTagAttribute(html, "meta", "property", "og:description", "content"),
    };
  });

  const pagesByUid = new Map(directPages.map((page) => [page.uid, page]));
  const entries = posts.map((post) => {
    const page = pagesByUid.get(post.uid);
    const sourceUrl = new URL(post.url, PRODUCTION_ORIGIN).href;
    const pathName = new URL(sourceUrl).pathname;
    const body = parseBody(post.text ?? "");
    const bodyText = bodyTextFromParagraphs(body);
    const excerpt = normalizeText((post.descr ?? "").replace(/<[^>]+>/g, " "));
    const contentStatus = bodyText ? "published" : "empty-production-source";

    if (contentStatus === "empty-production-source" && post.uid !== EXPECTED_EMPTY_UID) {
      throw new Error(`Unexpected empty production body: ${post.uid} ${post.title}`);
    }

    return {
      uid: post.uid,
      path: pathName,
      sourceUrl,
      title: normalizeText(post.title),
      category: categoryFor(normalizeText(post.title)),
      published: String(post.date || post.published || "").slice(0, 10),
      excerpt,
      body,
      bodyText,
      contentStatus,
      sourceStatus: page?.status ?? 0,
      sourceRobots: page?.robots ?? "",
      sourceTextHash: hashText(bodyText),
      seo: {
        title: page?.title ?? normalizeText(post.title),
        description: page?.description ?? "",
        canonical: page?.canonical || sourceUrl,
        openGraphTitle: page?.openGraphTitle ?? "",
        openGraphDescription: normalizeText((page?.openGraphDescription ?? "").replace(/<[^>]+>/g, " ")),
      },
    };
  });

  const uniqueUids = new Set(entries.map((entry) => entry.uid));
  const uniquePaths = new Set(entries.map((entry) => entry.path));
  if (uniqueUids.size !== entries.length || uniquePaths.size !== entries.length) {
    throw new Error(`Glossary identity collision: ${uniqueUids.size} UIDs, ${uniquePaths.size} paths, ${entries.length} entries`);
  }

  const content = {
    source: {
      listingUrl: LISTING_URL,
      feedUid: FEED_UID,
      feedRecordId: FEED_RECID,
      total: entries.length,
    },
    entries,
  };

  const root = process.cwd();
  const dataPath = path.join(root, "src", "data", "glossary-content.json");
  const inventoryPath = path.join(root, "docs", "research", "glossary", "PRODUCTION_GLOSSARY_INVENTORY.md");
  await mkdir(path.dirname(dataPath), { recursive: true });
  await mkdir(path.dirname(inventoryPath), { recursive: true });
  await writeFile(dataPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  await writeFile(inventoryPath, buildInventory(content), "utf8");

  process.stdout.write(`${JSON.stringify({
    imported: entries.length,
    uniqueUids: uniqueUids.size,
    uniquePaths: uniquePaths.size,
    directHttp200: entries.filter((entry) => entry.sourceStatus === 200).length,
    emptyProductionSources: entries.filter((entry) => entry.contentStatus === "empty-production-source").map((entry) => entry.uid),
    dataPath: path.relative(root, dataPath),
    inventoryPath: path.relative(root, inventoryPath),
  }, null, 2)}\n`);
}

await importGlossary();
