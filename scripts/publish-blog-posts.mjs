#!/usr/bin/env node
/**
 * Publishes native Blog articles written as Markdown.
 *
 * Every file in `content/blog/*.md` becomes one entry in
 * `src/data/blog-content.json`, the same data the imported Tilda posts live in,
 * so the listing, article page, related posts, sitemap and audits pick it up
 * with no component changes. Re-running is safe: a post is matched on its
 * `uid` and replaced in place.
 *
 * Front matter (all required except `uid` and `coverAlt`):
 *
 *   ---
 *   title: Ube Is the Next Matcha
 *   slug: ube-is-the-next-matcha
 *   excerpt: One or two sentences; also the meta description.
 *   topic: product | economics | operations | supply | compliance
 *   published: 2026-11-13
 *   cover: content/blog/images/ube.jpg
 *   coverAlt: Ube Premium tin
 *   ---
 *
 * Body: `## ` / `### ` headings, paragraphs, `- ` and `1. ` lists,
 * `**bold**`, `*italic*`, `[text](href)` and `![alt](path)` images.
 *
 * Usage: node scripts/publish-blog-posts.mjs [--check]
 *   --check  validate and report, write nothing.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "content", "blog");
const DATA_PATH = path.join(ROOT, "src", "data", "blog-content.json");
const ROUTES_PATH = path.join(ROOT, "src", "data", "public-route-paths.json");
const IMAGE_DIR =path.join(ROOT, "public", "images", "blog");
const ORIGIN = "https://thebasebev.com";
const WORDS_PER_MINUTE = 200;
const CHECK_ONLY = process.argv.includes("--check");

const TOPICS = {
  supply: "Supply & logistics",
  compliance: "Compliance & certification",
  operations: "Café operations",
  economics: "Menu economics",
  product: "Product & formulation",
};

/* ---- front matter ------------------------------------------------------- */

function parseFile(source, file) {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source.replace(/\r\n/g, "\n"));
  if (!match) throw new Error(`${file}: missing front matter`);
  const meta = {};
  for (const line of match[1].split("\n")) {
    const pair = /^([A-Za-z]+):\s*(.*)$/.exec(line);
    if (pair) meta[pair[1]] = pair[2].replace(/^["']|["']$/g, "").trim();
  }
  for (const key of ["title", "slug", "excerpt", "topic", "published", "cover"]) {
    if (!meta[key]) throw new Error(`${file}: front matter needs "${key}"`);
  }
  if (!TOPICS[meta.topic]) throw new Error(`${file}: unknown topic "${meta.topic}"`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.published)) throw new Error(`${file}: published must be YYYY-MM-DD`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug)) throw new Error(`${file}: slug must be kebab-case`);
  if (meta.excerpt.length > 200) throw new Error(`${file}: excerpt is ${meta.excerpt.length} chars, keep it under 200`);
  return { meta, body: match[2].trim() };
}

/** Stable 10-character id in the shape Tilda uses, derived from the slug. */
function uidFor(slug) {
  return `tb${createHash("sha256").update(slug).digest("hex").slice(0, 8)}`;
}

/* ---- markdown → blocks -------------------------------------------------- */

function inline(text) {
  const parts = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    if (m.index > last) parts.push({ type: "text", text: text.slice(last, m.index) });
    if (m[1]) parts.push({ type: "link", text: m[1], href: m[2] });
    else if (m[3]) parts.push({ type: "text", text: m[3], strong: true });
    else parts.push({ type: "text", text: m[4], em: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", text: text.slice(last) });
  return parts;
}

async function blocksFrom(markdown, slug, file) {
  const blocks = [];
  let index = 0;
  for (const chunk of markdown.split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) continue;
    const heading = /^(#{2,4})\s+(.+)$/.exec(lines[0]);
    const image = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(lines[0]);
    if (heading && lines.length === 1) {
      blocks.push({ type: "heading", level: heading[1].length, content: inline(heading[2]) });
    } else if (image) {
      blocks.push({ type: "image", src: await storeImage(image[2], `${slug}-${++index}`, file), alt: image[1] });
    } else if (lines.every((line) => /^[-*]\s+/.test(line))) {
      blocks.push({ type: "list", ordered: false, items: lines.map((line) => inline(line.replace(/^[-*]\s+/, ""))) });
    } else if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      blocks.push({ type: "list", ordered: true, items: lines.map((line) => inline(line.replace(/^\d+\.\s+/, ""))) });
    } else if (heading) {
      throw new Error(`${file}: put a blank line after the heading "${heading[2]}"`);
    } else {
      blocks.push({ type: "paragraph", content: inline(lines.join(" ")) });
    }
  }
  return blocks;
}

function blockText(block) {
  if (block.type === "list") return block.items.map((item) => item.map((part) => part.text).join("")).join("\n");
  if (block.type === "image" || block.type === "video") return "";
  return block.content.map((part) => part.text).join("");
}

/* ---- images ------------------------------------------------------------- */

async function storeImage(source, name, file) {
  if (source.startsWith("/images/")) {
    if (!existsSync(path.join(ROOT, "public", source))) throw new Error(`${file}: ${source} not found in public/`);
    return source;
  }
  const input = path.resolve(path.dirname(path.join(SOURCE_DIR, file)), source);
  if (!existsSync(input)) throw new Error(`${file}: image ${source} not found`);
  const fileName = `${name}.webp`;
  if (!CHECK_ONLY) {
    await mkdir(IMAGE_DIR, { recursive: true });
    const encoded = await sharp(input).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    await writeFile(path.join(IMAGE_DIR, fileName), encoded);
  }
  return `/images/blog/${fileName}`;
}

/* ---- run ---------------------------------------------------------------- */

const data = JSON.parse(await readFile(DATA_PATH, "utf8"));
const files = (await readdir(SOURCE_DIR).catch(() => [])).filter((name) => name.endsWith(".md")).sort();
const report = [];

for (const file of files) {
  const { meta, body } = parseFile(await readFile(path.join(SOURCE_DIR, file), "utf8"), file);
  const uid = meta.uid || uidFor(meta.slug);
  const postPath = `/tpost/${uid}-${meta.slug}`;
  const canonical = `${ORIGIN}${postPath}`;
  const blocks = await blocksFrom(body, meta.slug, file);
  const bodyText = blocks.map(blockText).filter(Boolean).join("\n\n").replace(/[ \t]+/g, " ").trim();
  const cover = { src: await storeImage(meta.cover, meta.slug, file), alt: meta.coverAlt || meta.title };
  const words = bodyText.split(/\s+/).filter(Boolean).length;

  const post = {
    uid,
    path: postPath,
    sourceUrl: canonical,
    title: meta.title,
    excerpt: meta.excerpt,
    published: meta.published,
    topic: { id: meta.topic, label: TOPICS[meta.topic] },
    cover,
    body: blocks,
    bodyText,
    readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    sourceStatus: 200,
    sourceRobots: "index, follow",
    sourceTextHash: createHash("sha256").update(bodyText).digest("hex"),
    seo: {
      title: meta.title,
      description: meta.excerpt,
      canonical,
      openGraphTitle: meta.title,
      openGraphDescription: meta.excerpt,
      openGraphImage: `${ORIGIN}${cover.src}`,
    },
  };

  const existing = data.posts.findIndex((entry) => entry.uid === uid);
  if (existing >= 0) data.posts[existing] = post;
  else data.posts.push(post);
  report.push(`${existing >= 0 ? "updated" : "added  "} ${postPath} (${words} words)`);
}

// Newest first, as the feed has always published; ties keep their order.
data.posts = data.posts
  .map((post, order) => ({ post, order }))
  .sort((a, b) => b.post.published.localeCompare(a.post.published) || a.order - b.order)
  .map(({ post }) => post);

const paths = new Set(data.posts.map((post) => post.path));
if (paths.size !== data.posts.length) throw new Error("Two posts share a path");

// The Worker and next.config only route paths listed in this manifest; a post
// missing from it renders on /ae/ but 404s on its bare /tpost/ URL.
const routes = JSON.parse(await readFile(ROUTES_PATH, "utf8"));
for (const postPath of paths) {
  if (routes.includes(postPath)) continue;
  const at = routes.findIndex((route) => route > postPath);
  routes.splice(at < 0 ? routes.length : at, 0, postPath);
}

if (!CHECK_ONLY) {
  await writeFile(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await writeFile(ROUTES_PATH, `${JSON.stringify(routes, null, 4)}\n`, "utf8");
}
console.log(report.join("\n") || "No posts in content/blog.");
console.log(`${data.posts.length} posts in the Blog${CHECK_ONLY ? " (check only, nothing written)" : ""}.`);
