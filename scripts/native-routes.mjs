import fs from "node:fs";

/** Read native page paths from the same registry Next uses to generate them. */
export function readNativeRoutes(source = fs.readFileSync("src/lib/site-pages.ts", "utf8")) {
  const block = source.match(/const NATIVE_ROUTES: NativeRoute\[\] = \[([\s\S]*?)\n\];/)?.[1];
  if (!block) throw new Error("Could not read native page routes from site-pages.ts.");
  const routes = [...block.matchAll(/\broute:\s*"([^"]+)"/g)].map((match) => match[1]);
  if (!routes.length || new Set(routes).size !== routes.length) {
    throw new Error("Native page routes are empty or contain duplicate paths.");
  }
  return routes;
}
