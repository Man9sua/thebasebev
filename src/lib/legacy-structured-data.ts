import { publicUrl } from "@/lib/site-paths";
import fs from "node:fs";
import path from "node:path";

const exportRoot = path.join(process.cwd(), "tilda_export", "project12027355");

function publicize(value: unknown): unknown {
  if (typeof value === "string") return publicUrl(value);
  if (Array.isArray(value)) return value.map(publicize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, publicize(item)]));
  }
  return value;
}

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
      blocks.push(JSON.stringify(publicize(JSON.parse(raw))));
    } catch {
      continue;
    }
  }

  return blocks;
}
