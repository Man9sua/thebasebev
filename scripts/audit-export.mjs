import fs from "node:fs";
import path from "node:path";

const base = path.resolve(process.argv[2] ?? "tilda_export/project12027355");

function decode(value = "") {
  return String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function first(source, expression) {
  return decode(source.match(expression)?.[1]);
}

function meta(source, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match) return decode(match[1]);
  }

  return "";
}

const htaccess = fs.readFileSync(path.join(base, "htaccess"), "utf8");
const aliases = {};

for (const match of htaccess.matchAll(/^RewriteRule \^([^$]+)\$ (page\d+\.html) \[NC\]$/gm)) {
  if (!match[1].includes("/$")) {
    aliases[match[2]] ??= `/${match[1].replaceAll("\\/", "/")}`;
  }
}

aliases["page62361237.html"] = "/";

const pages = fs
  .readdirSync(base)
  .filter((file) => /^page\d+\.html$/.test(file))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

for (const file of pages) {
  const source = fs.readFileSync(path.join(base, file), "utf8");
  const headings = {};

  for (const level of [1, 2, 3]) {
    headings[`h${level}`] = [
      ...source.matchAll(new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, "gi")),
    ]
      .map((match) => decode(match[1]))
      .filter(Boolean);
  }

  const forms = [...source.matchAll(/<form\b([\s\S]*?)<\/form>/gi)].map((match, index) => ({
    index: index + 1,
    id: first(match[1], /\bid=["']([^"']+)/i),
    name: first(match[1], /\bname=["']([^"']+)/i),
    action: first(match[1], /\baction=["']([^"']*)/i),
    formName: first(
      match[0],
      /name=["']form-spec-comments["'][^>]*value=["']([^"']*)/i,
    ),
    inputs: [...match[0].matchAll(/<(?:input|select|textarea)\b[^>]*\bname=["']([^"']+)/gi)].map(
      (input) => input[1],
    ),
  }));

  const report = {
    file,
    route: aliases[file] ?? "",
    pageId: first(source, /data-tilda-page-id=["'](\d+)/i),
    alias: first(source, /data-tilda-page-alias=["']([^"']+)/i),
    title: first(source, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: meta(source, "description"),
    canonical:
      first(source, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i) ||
      first(source, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i),
    robots: meta(source, "robots"),
    ogUrl: meta(source, "og:url"),
    ogTitle: meta(source, "og:title"),
    ogDescription: meta(source, "og:description"),
    ogImage: meta(source, "og:image"),
    h1: headings.h1,
    h2Count: headings.h2.length,
    h3Count: headings.h3.length,
    ldJson: (source.match(/type=["']application\/ld\+json["']/gi) ?? []).length,
    forms,
    iframes: [...source.matchAll(/<iframe\b[^>]*\bsrc=["']([^"']+)/gi)].map((match) => match[1]),
    localCss: [...source.matchAll(/<link\b[^>]*\bhref=["'](css\/[^"'?]+)/gi)].map((match) => match[1]),
    localJs: [...source.matchAll(/<script\b[^>]*\bsrc=["'](js\/[^"'?]+)/gi)].map((match) => match[1]),
    externalJs: [...source.matchAll(/<script\b[^>]*\bsrc=["'](https?:\/\/[^"']+)/gi)].map(
      (match) => match[1],
    ),
    inlineScripts: (source.match(/<script(?:\s|>)/gi) ?? []).length,
    header: source.includes('id="t-header"'),
    footer: source.includes('id="t-footer"'),
  };

  console.log(JSON.stringify(report));
}
