import { createHash } from "node:crypto";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PRODUCTION_ORIGIN = "https://thebasebev.com";
const LISTING_URL = `${PRODUCTION_ORIGIN}/resources/blog`;
const FEED_UID = "699537006591";
const FEED_RECID = "2427848101";
const FEED_URL = "https://feeds.tildaapi.one/api/getfeed/";
const POST_URL = "https://feeds.tildaapi.one/api/getpost/";
const REQUEST_HEADERS = { "user-agent": "THE-BASE-blog-migration/1.0" };

const WORDS_PER_MINUTE = 220;

const TOPICS = [
  {
    id: "supply",
    label: "Supply & logistics",
    match: /freight|logistic|supply|import|customs|shipping|warehouse|origin|stockpile|vendor|procure|incoterm|lead time/i,
  },
  {
    id: "compliance",
    label: "Compliance & certification",
    match: /halal|certif|fda|fsvp|sfda|compliance|regulat|audit|clean label|standard/i,
  },
  {
    id: "operations",
    label: "Café operations",
    match: /barista|throughput|labor|labour|staff|drive.?thru|steam wand|service speed|ticket|handoff|workflow|shift/i,
  },
  {
    id: "economics",
    label: "Menu economics",
    match: /margin|cost|profit|price|pricing|write.?off|capex|revenue|economics|playbook/i,
  },
  {
    id: "product",
    label: "Product & formulation",
    match: /matcha|karak|chai|frappe|milkshake|chocolate|cold foam|iced tea|encapsulat|brix|formulat|soluble|recipe/i,
  },
];

const FALLBACK_TOPIC = { id: "product", label: "Product & formulation" };

function topicFor(title, excerpt) {
  const haystack = `${title} ${excerpt}`;
  const hit = TOPICS.find((topic) => topic.match.test(haystack));
  return hit ? { id: hit.id, label: hit.label } : FALLBACK_TOPIC;
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
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      if (responseType === "buffer") {
        return { response, data: Buffer.from(await response.arrayBuffer()) };
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

const NAMED_ENTITIES = {
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
  rsquo: "’",
  lsquo: "‘",
  ldquo: "“",
  rdquo: "”",
  deg: "°",
};

function decodeHtml(value = "") {
  return value.replace(/&(#x?[\da-f]+|[a-z]+);/gi, (entity, code) => {
    if (code.startsWith("#")) {
      const isHex = code[1]?.toLowerCase() === "x";
      const numeric = Number.parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(numeric) ? String.fromCodePoint(numeric) : entity;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
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
  for (const match of html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "gi"))) {
    const attributes = parseAttributes(match[0]);
    if (attributes[key]?.toLowerCase() === value.toLowerCase()) {
      return normalizeText(attributes[resultAttribute] ?? "");
    }
  }
  return "";
}

function hashText(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

const VOID_TAGS = new Set(["img", "br", "hr", "input", "source", "meta", "link"]);

function parseFragment(html) {
  const root = { tag: "#root", attrs: {}, children: [] };
  const stack = [root];

  for (const token of html.match(/<\/?[a-z][^>]*>|[^<]+/gi) ?? []) {
    const parent = stack.at(-1);

    if (!token.startsWith("<")) {
      const text = decodeHtml(token);
      if (text.trim()) parent.children.push({ tag: "#text", text });
      continue;
    }

    if (token.startsWith("</")) {
      const name = token.slice(2).replace(/[\s>]/g, "").toLowerCase();
      const index = stack.findLastIndex((node) => node.tag === name);
      if (index > 0) stack.length = index;
      continue;
    }

    const name = token.slice(1).match(/^[a-z0-9]+/i)?.[0].toLowerCase() ?? "";
    const node = { tag: name, attrs: parseAttributes(token), children: [] };
    parent.children.push(node);
    if (!VOID_TAGS.has(name) && !token.endsWith("/>")) stack.push(node);
  }

  return root;
}

const KNOWN_TAGS = new Set([
  "#root", "#text", "div", "p", "span", "h2", "h3", "h4", "strong", "b", "em", "i",
  "a", "ul", "ol", "li", "figure", "img", "iframe", "br",
]);

function assertKnownTags(node, uid) {
  if (!KNOWN_TAGS.has(node.tag)) {
    throw new Error(`Unknown tag <${node.tag}> in post ${uid} — extend the body model`);
  }
  for (const child of node.children ?? []) assertKnownTags(child, uid);
}

function collectInline(node, marks = {}, out = []) {
  for (const child of node.children ?? []) {
    if (child.tag === "#text") {
      const text = child.text.replace(/\s+/g, " ");
      if (!text.trim()) {
        if (out.length && !/\s$/.test(out.at(-1).text)) out.at(-1).text += " ";
        continue;
      }
      const previous = out.at(-1);
      const sameRun =
        previous &&
        previous.type === "text" &&
        Boolean(previous.strong) === Boolean(marks.strong) &&
        Boolean(previous.em) === Boolean(marks.em);
      if (sameRun) previous.text += text;
      else out.push({ type: "text", text, ...marks });
      continue;
    }

    if (child.tag === "a") {
      const href = normalizeInternalHref(child.attrs.href ?? "");
      const nested = collectInline(child, marks, []);
      const text = nested.map((part) => part.text).join("").trim();
      if (text && href) out.push({ type: "link", text, href, ...marks });
      else if (text) out.push({ type: "text", text, ...marks });
      continue;
    }

    if (child.tag === "strong" || child.tag === "b") {
      collectInline(child, { ...marks, strong: true }, out);
      continue;
    }

    if (child.tag === "em" || child.tag === "i") {
      collectInline(child, { ...marks, em: true }, out);
      continue;
    }

    if (child.tag === "br") {
      if (out.length && !/\s$/.test(out.at(-1).text)) out.at(-1).text += " ";
      continue;
    }

    collectInline(child, marks, out);
  }

  return out;
}

function tidyInline(content) {
  const parts = content
    .map((part) => ({ ...part, text: part.text.replace(/\s+/g, " ") }))
    .filter((part) => part.text.trim().length > 0 || part.type === "link");

  if (parts.length) {
    parts[0].text = parts[0].text.replace(/^\s+/, "");
    parts.at(-1).text = parts.at(-1).text.replace(/\s+$/, "");
  }

  return parts.filter((part) => part.text.length > 0);
}

function normalizeInternalHref(href) {
  if (!href) return "";
  try {
    const url = new URL(href, PRODUCTION_ORIGIN);
    if (url.origin === PRODUCTION_ORIGIN) return `${url.pathname}${url.search}${url.hash}`;
    return url.href;
  } catch {
    return href;
  }
}

function localImageName(src) {
  const match = /tildacdn\.com\/([^/]+)\/([^/?#]+)/i.exec(src);
  if (!match) return null;
  return `${match[1]}__${match[2].replace(/\.[a-z0-9]+$/i, "")}.webp`;
}

const IMAGE_WIDTH = 1440;
const IMAGE_QUALITY = 74;

async function encodeImage(buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: IMAGE_WIDTH, withoutEnlargement: true })
    .webp({ quality: IMAGE_QUALITY })
    .toBuffer();
}

function toBlocks(node, uid, images) {
  const blocks = [];

  const pushInline = (type, source, extra = {}) => {
    const content = tidyInline(collectInline(source));
    if (content.length) blocks.push({ type, ...extra, content });
  };

  const walk = (parent) => {
    for (const child of parent.children ?? []) {
      switch (child.tag) {
        case "h2":
        case "h3":
        case "h4":
          pushInline("heading", child, { level: Number(child.tag.slice(1)) });
          break;

        case "ul":
        case "ol": {
          const items = child.children
            .filter((item) => item.tag === "li")
            .map((item) => tidyInline(collectInline(item)))
            .filter((item) => item.length > 0);
          if (items.length) blocks.push({ type: "list", ordered: child.tag === "ol", items });
          break;
        }

        case "img": {
          const src = child.attrs.src ?? "";
          const name = localImageName(src);
          if (!name) break;
          images.set(name, src);
          blocks.push({
            type: "image",
            src: `/images/blog/${name}`,
            alt: normalizeText(child.attrs.alt ?? ""),
          });
          break;
        }

        case "iframe": {
          const src = child.attrs.src ?? "";
          const id = /youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/i.exec(src)?.[1];
          if (!id) throw new Error(`Unsupported embed in post ${uid}: ${src}`);
          blocks.push({ type: "video", provider: "youtube", id });
          break;
        }

        case "figure":
          walk(child);
          break;

        case "div":
        case "p":
        case "span": {
          const holdsBlocks = child.children.some((grandchild) =>
            ["ul", "ol", "figure", "img", "iframe", "h2", "h3", "h4", "div"].includes(grandchild.tag),
          );
          if (holdsBlocks) walk(child);
          else pushInline("paragraph", child);
          break;
        }

        default:
          pushInline("paragraph", child);
      }
    }
  };

  walk(node);
  return blocks;
}

function blockText(block) {
  if (block.type === "list") {
    return block.items.map((item) => item.map((part) => part.text).join("")).join("\n");
  }
  if (block.type === "image" || block.type === "video") return "";
  return block.content.map((part) => part.text).join("");
}

function bodyTextFrom(blocks) {
  return blocks.map(blockText).filter(Boolean).join("\n\n").replace(/[ \t]+/g, " ").trim();
}

function readingMinutes(text) {
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE));
}

function escapeTable(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function buildInventory(content) {
  const rows = content.posts.map((post) =>
    [
      escapeTable(post.title),
      `\`${post.uid}\``,
      escapeTable(post.topic.label),
      post.published,
      `[production](${post.sourceUrl})`,
      String(post.sourceStatus),
      `\`${post.path}\``,
      String(post.body.length),
      String(post.body.filter((block) => block.type === "image").length),
    ].join(" | "),
  );

  return `# Production Blog Inventory

Generated by \`node scripts/import-blog-production.mjs\` from the public, read-only Tilda feed and article pages. The generated application data and its imagery have no runtime dependency on Tilda.

## Summary

- Listing: ${content.source.listingUrl}
- Feed UID: \`${content.source.feedUid}\`
- Production posts: **${content.posts.length}**
- Unique production paths: **${new Set(content.posts.map((post) => post.path)).size}**
- Direct production HTTP 200: **${content.posts.filter((post) => post.sourceStatus === 200).length}**
- Body blocks: **${content.posts.reduce((total, post) => total + post.body.length, 0)}**
- Localised images: **${content.source.imageCount}** in \`public/images/blog/\`

## Audit table

TITLE | UID | TOPIC | PUBLISHED | PRODUCTION URL | STATUS | STAGING ROUTE | BLOCKS | IMAGES
--- | --- | --- | --- | --- | ---: | --- | ---: | ---:
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

async function importBlog() {
  const { data: feed } = await fetchWithRetry(feedRequestUrl());
  if (!Array.isArray(feed.posts) || feed.posts.length !== Number(feed.total)) {
    throw new Error(
      `Feed completeness mismatch: expected ${feed.total}, received ${feed.posts?.length ?? 0}`,
    );
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
      title: findElementContent(html, "title"),
      description: findTagAttribute(html, "meta", "name", "description", "content"),
      canonical: findTagAttribute(html, "link", "rel", "canonical", "href"),
      robots: findTagAttribute(html, "meta", "name", "robots", "content"),
      openGraphTitle: findTagAttribute(html, "meta", "property", "og:title", "content"),
      openGraphDescription: findTagAttribute(html, "meta", "property", "og:description", "content"),
      openGraphImage: findTagAttribute(html, "meta", "property", "og:image", "content"),
    };
  });

  const pagesByUid = new Map(directPages.map((page) => [page.uid, page]));
  const images = new Map();

  const entries = posts.map((post) => {
    const page = pagesByUid.get(post.uid);
    const sourceUrl = new URL(post.url, PRODUCTION_ORIGIN).href;
    const tree = parseFragment(post.text ?? "");
    assertKnownTags(tree, post.uid);

    const body = toBlocks(tree, post.uid, images);
    const bodyText = bodyTextFrom(body);
    if (!bodyText) throw new Error(`Empty production body: ${post.uid} ${post.title}`);

    const title = normalizeText(post.title);
    const excerpt = normalizeText((post.descr ?? "").replace(/<[^>]+>/g, " "));

    const coverName = localImageName(post.image ?? "");
    if (coverName) images.set(coverName, post.image);

    return {
      uid: post.uid,
      path: new URL(sourceUrl).pathname,
      sourceUrl,
      title,
      excerpt,
      published: String(post.date || post.published || "").slice(0, 10),
      topic: topicFor(title, excerpt),
      cover: coverName
        ? { src: `/images/blog/${coverName}`, alt: normalizeText(post.imagealt ?? "") || title }
        : null,
      body,
      bodyText,
      readingMinutes: readingMinutes(bodyText),
      sourceStatus: page?.status ?? 0,
      sourceRobots: page?.robots ?? "",
      sourceTextHash: hashText(bodyText),
      seo: {
        title: page?.title ?? title,
        description: page?.description ?? excerpt,
        canonical: page?.canonical || sourceUrl,
        openGraphTitle: page?.openGraphTitle ?? "",
        openGraphDescription: page?.openGraphDescription ?? "",
        openGraphImage: page?.openGraphImage ?? "",
      },
    };
  });

  const uniqueUids = new Set(entries.map((entry) => entry.uid));
  const uniquePaths = new Set(entries.map((entry) => entry.path));
  if (uniqueUids.size !== entries.length || uniquePaths.size !== entries.length) {
    throw new Error(
      `Blog identity collision: ${uniqueUids.size} UIDs, ${uniquePaths.size} paths, ${entries.length} posts`,
    );
  }

  const root = process.cwd();
  const imageDir = path.join(root, "public", "images", "blog");
  await mkdir(imageDir, { recursive: true });
  const present = new Set(await readdir(imageDir).catch(() => []));

  const downloaded = await mapConcurrent([...images], 5, async ([name, src]) => {
    if (present.has(name)) return { name, skipped: true };
    const { data } = await fetchWithRetry(src, { responseType: "buffer" });
    const encoded = await encodeImage(data);
    await writeFile(path.join(imageDir, name), encoded);
    return { name, bytes: encoded.byteLength };
  });

  const content = {
    source: {
      listingUrl: LISTING_URL,
      feedUid: FEED_UID,
      feedRecordId: FEED_RECID,
      total: entries.length,
      imageCount: images.size,
    },
    posts: entries,
  };

  const dataPath = path.join(root, "src", "data", "blog-content.json");
  const inventoryPath = path.join(root, "context", "research", "blog", "PRODUCTION_BLOG_INVENTORY.md");
  await mkdir(path.dirname(dataPath), { recursive: true });
  await mkdir(path.dirname(inventoryPath), { recursive: true });
  await writeFile(dataPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  await writeFile(inventoryPath, buildInventory(content), "utf8");

  process.stdout.write(
    `${JSON.stringify(
      {
        imported: entries.length,
        uniqueUids: uniqueUids.size,
        uniquePaths: uniquePaths.size,
        directHttp200: entries.filter((entry) => entry.sourceStatus === 200).length,
        blocks: entries.reduce((total, entry) => total + entry.body.length, 0),
        images: images.size,
        imagesFetched: downloaded.filter((image) => !image.skipped).length,
        dataPath: path.relative(root, dataPath),
        inventoryPath: path.relative(root, inventoryPath),
      },
      null,
      2,
    )}\n`,
  );
}

await importBlog();
