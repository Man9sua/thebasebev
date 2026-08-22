import fs from "node:fs";
import path from "node:path";

/**
 * Lift the JSON-LD out of a legacy Tilda page so a redesigned route can keep
 * emitting it unchanged.
 *
 * The homepage alone carries FAQPage, WebSite, ContactPoint, PostalAddress and
 * seventeen OfferCatalog entries. A redesign that drops them is exactly the
 * regression `AGENTS.md` forbids and `audit:seo-parity` fails on, so the blocks
 * are carried over verbatim rather than re-authored.
 *
 * Read at build time — every route that uses this is statically generated, so
 * nothing touches the filesystem in the Worker at runtime.
 */

const exportRoot = path.join(process.cwd(), "tilda_export", "project12027355");

const LD_JSON =
  /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

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
      JSON.parse(raw);
      blocks.push(raw);
    } catch {
      continue;
    }
  }

  return blocks;
}
