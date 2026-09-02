import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const EXPECTED_EMPTY_UID = "tfm5mybkl1";
const DATA_PATH = path.join(process.cwd(), "src", "data", "glossary-content.json");

function hashText(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function bodyText(entry) {
  return entry.body
    .map((paragraph) => paragraph.content.map((inline) => inline.text).join(" ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

function decodeHtml(value = "") {
  const named = { amp: "&", apos: "'", gt: ">", lt: "<", nbsp: " ", quot: '"' };
  return value.replace(/&(#x?[\da-f]+|[a-z]+);/gi, (entity, code) => {
    if (!code.startsWith("#")) return named[code.toLowerCase()] ?? entity;
    const hex = code[1]?.toLowerCase() === "x";
    const number = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
    return Number.isFinite(number) ? String.fromCodePoint(number) : entity;
  });
}

function normalizeHtmlText(value = "") {
  return decodeHtml(
    value
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function parseAttributes(tag = "") {
  const result = {};
  for (const match of tag.matchAll(/([^\s=/>]+)\s*=\s*(["'])([\s\S]*?)\2/g)) {
    result[match[1].toLowerCase()] = decodeHtml(match[3]);
  }
  return result;
}

function findTagAttribute(html, tagName, key, value, resultKey) {
  for (const match of html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "gi"))) {
    const attributes = parseAttributes(match[0]);
    if (attributes[key]?.toLowerCase() === value.toLowerCase()) {
      return attributes[resultKey] ?? "";
    }
  }
  return "";
}

function findElementText(html, tagName, requiredAttribute = "") {
  const attributePattern = requiredAttribute ? `(?=[^>]*\\b${requiredAttribute}\\b)` : "";
  const match = html.match(
    new RegExp(`<${tagName}\\b${attributePattern}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"),
  );
  return normalizeHtmlText(match?.[1] ?? "");
}

async function fetchWithRetry(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(30_000),
        headers: { "user-agent": "THE-BASE-glossary-audit/1.0" },
      });
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 400));
    }
  }
  throw lastError;
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message);
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

async function auditRemote(entries, targetUrl) {
  const origin = new URL(targetUrl).origin;
  const listingResponse = await fetchWithRetry(new URL("/resources/glossary", origin));
  const listingHtml = await listingResponse.text();
  const listingTags = [...listingHtml.matchAll(/<a\b[^>]*\bdata-glossary-term\b[^>]*>/gi)];
  const listingUids = new Set(
    listingTags.map((match) => parseAttributes(match[0])["data-glossary-uid"]),
  );

  const routeResults = await mapConcurrent(entries, 5, async (entry) => {
    try {
      const response = await fetchWithRetry(new URL(entry.path, origin));
      const html = await response.text();
      const title = findElementText(html, "title");
      const h1 = findElementText(html, "h1");
      const canonical = findTagAttribute(html, "link", "rel", "canonical", "href");
      const renderedBody = findElementText(html, "div", "data-glossary-article-body");
      const expectedBody = normalizeHtmlText(entry.bodyText);
      const bodyMatches =
        entry.contentStatus === "empty-production-source"
          ? renderedBody.includes("does not currently include published article copy")
          : renderedBody === expectedBody;
      const routeFailures = [];
      if (response.status !== 200) routeFailures.push(`HTTP ${response.status}`);
      if (title !== entry.seo.title) routeFailures.push("title mismatch");
      if (h1 !== entry.title) routeFailures.push("H1 mismatch");
      if (canonical !== entry.seo.canonical) routeFailures.push("canonical mismatch");
      if (!/itemtype=["']https:\/\/schema\.org\/BlogPosting["']/i.test(html)) {
        routeFailures.push("BlogPosting missing");
      }
      if (!bodyMatches) routeFailures.push("article body mismatch");
      return { path: entry.path, status: response.status, failures: routeFailures };
    } catch (error) {
      return { path: entry.path, status: 0, failures: [error.message] };
    }
  });
  const broken = routeResults.filter((result) => result.failures.length > 0);
  return {
    listingStatus: listingResponse.status,
    listingCards: listingTags.length,
    listingUniqueUids: listingUids.size,
    workingRoutes: routeResults.length - broken.length,
    broken,
  };
}

const content = JSON.parse(await readFile(DATA_PATH, "utf8"));
const entries = content.entries ?? [];
const failures = [];
const uids = new Set();
const paths = new Set();
const canonicals = new Set();

assert(entries.length > 0, "No glossary entries found", failures);
assert(entries.length === content.source?.total, "Source total does not match entries", failures);

for (const entry of entries) {
  assert(Boolean(entry.uid), `Missing UID for ${entry.title || "unknown entry"}`, failures);
  assert(!uids.has(entry.uid), `Duplicate UID: ${entry.uid}`, failures);
  uids.add(entry.uid);

  assert(/^\/tpost\/[a-z0-9]+-[^/]+$/i.test(entry.path), `Invalid production path: ${entry.path}`, failures);
  assert(!paths.has(entry.path), `Duplicate path: ${entry.path}`, failures);
  paths.add(entry.path);

  assert(Boolean(entry.title), `Missing title for ${entry.uid}`, failures);
  assert(["ingredients", "tech", "business"].includes(entry.category), `Invalid category for ${entry.uid}`, failures);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(entry.published), `Invalid published date for ${entry.uid}`, failures);
  assert(entry.sourceStatus === 200, `Production source is not HTTP 200 for ${entry.uid}`, failures);
  assert(!/noindex/i.test(entry.sourceRobots), `Production source is noindex for ${entry.uid}`, failures);

  const isExpectedEmpty = entry.uid === EXPECTED_EMPTY_UID;
  assert(Boolean(entry.excerpt) || isExpectedEmpty, `Missing excerpt for ${entry.uid}`, failures);
  assert(entry.contentStatus === (isExpectedEmpty ? "empty-production-source" : "published"), `Unexpected content status for ${entry.uid}`, failures);
  assert(entry.body.length > 0 || isExpectedEmpty, `Missing article body for ${entry.uid}`, failures);

  const normalizedBodyText = bodyText(entry);
  assert(normalizedBodyText === entry.bodyText, `Body text mismatch for ${entry.uid}`, failures);
  assert(hashText(normalizedBodyText) === entry.sourceTextHash, `Source text hash mismatch for ${entry.uid}`, failures);

  for (const paragraph of entry.body) {
    assert(paragraph.type === "paragraph" && paragraph.content.length > 0, `Malformed paragraph for ${entry.uid}`, failures);
    for (const inline of paragraph.content) {
      assert(inline.type === "text" || inline.type === "link", `Malformed inline content for ${entry.uid}`, failures);
      assert(Boolean(inline.text), `Empty inline content for ${entry.uid}`, failures);
      if (inline.type === "link") assert(Boolean(inline.href), `Missing link href for ${entry.uid}`, failures);
    }
  }

  assert(Boolean(entry.seo?.title), `Missing SEO title for ${entry.uid}`, failures);
  assert(Boolean(entry.seo?.canonical), `Missing canonical for ${entry.uid}`, failures);
  assert(!canonicals.has(entry.seo?.canonical), `Duplicate canonical: ${entry.seo?.canonical}`, failures);
  canonicals.add(entry.seo?.canonical);
}

const duplicateTitles = [...new Set(entries.map((entry) => entry.title).filter((title, index, all) => all.indexOf(title) !== index))];
const targetUrl = process.argv[2];
const remote = targetUrl ? await auditRemote(entries, targetUrl) : null;
if (remote) {
  assert(remote.listingStatus === 200, `Glossary listing returned ${remote.listingStatus}`, failures);
  assert(remote.listingCards === entries.length, `Listing exposes ${remote.listingCards}/${entries.length} cards`, failures);
  assert(remote.listingUniqueUids === entries.length, `Listing exposes ${remote.listingUniqueUids}/${entries.length} unique UIDs`, failures);
  for (const result of remote.broken) {
    failures.push(`Broken detail route ${result.path}: ${result.failures.join(", ")}`);
  }
}

const report = {
  productionTerms: content.source?.total ?? 0,
  newTerms: entries.length,
  termsMatched: entries.length,
  termsMissing: Math.max(0, (content.source?.total ?? 0) - entries.length),
  productionArticleUrls: entries.length,
  newWorkingArticleRoutes: remote?.workingRoutes ?? entries.length,
  totalEntries: entries.length,
  uniqueUids: uids.size,
  uniquePaths: paths.size,
  uniqueCanonicals: canonicals.size,
  publishedBodies: entries.filter((entry) => entry.contentStatus === "published").length,
  emptyProductionSources: entries.filter((entry) => entry.contentStatus === "empty-production-source").map((entry) => entry.uid),
  duplicateTitlesPreserved: duplicateTitles,
  remote,
  status: failures.length === 0 ? "PASS" : "FAIL",
  failures,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (failures.length > 0) process.exitCode = 1;
