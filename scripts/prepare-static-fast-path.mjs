import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const sourceRoot = path.resolve(projectRoot, ".next/server/app");
const assetsRoot = path.resolve(projectRoot, ".open-next/assets");
const targetRoot = path.resolve(assetsRoot, "__static_pages");

if (!fs.existsSync(sourceRoot) || !fs.existsSync(assetsRoot)) {
  throw new Error("Run the Next.js/OpenNext build before preparing the static fast path.");
}
if (!targetRoot.startsWith(`${assetsRoot}${path.sep}`)) {
  throw new Error("Refusing to prepare static pages outside .open-next/assets.");
}

fs.rmSync(targetRoot, { recursive: true, force: true });
fs.mkdirSync(targetRoot, { recursive: true });

const copied = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolute);
      continue;
    }
    // Three kinds of file, all three of them things the browser asks for:
    // `<route>.html` is the document, `<route>.rsc` is the payload the router
    // asks for on an in-page navigation — same URL, `RSC` header — and
    // `<route>.segments/**.segment.rsc` is one slice of the route tree, which
    // is what a hovered link prefetches.
    //
    // Only the documents were copied before, so every navigation and every
    // prefetch on the deployed Worker came back 404: OpenNext answers those
    // requests out of an incremental cache the prerendered payloads are not in.
    // The router's answer to a 404 is a full page load, so the site had a
    // client-side router that never got to do anything.
    if (!entry.isFile() || ![".html", ".rsc"].includes(path.extname(entry.name))) continue;

    const relative = path.relative(sourceRoot, absolute);
    const destination = path.join(targetRoot, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(absolute, destination);
    copied.push(relative.replaceAll(path.sep, "/"));
  }
}

walk(sourceRoot);

for (const metadataFile of ["robots.txt.body", "sitemap.xml.body"]) {
  const source = path.join(sourceRoot, metadataFile);
  if (!fs.existsSync(source)) throw new Error(`Missing generated metadata body: ${metadataFile}`);
  const destinationName = metadataFile.replace(/\.body$/, "");
  fs.copyFileSync(source, path.join(targetRoot, destinationName));
  copied.push(destinationName);
}

for (const required of ["index.html", "index.rsc", "not-found.html", "robots.txt", "sitemap.xml"]) {
  if (!copied.includes(required)) throw new Error(`Static fast path is missing ${required}.`);
}
if (copied.length < 100) {
  throw new Error(`Static fast path unexpectedly contains only ${copied.length} files.`);
}

// Every document should have a payload beside it. A document without one still
// serves; its navigations just go back to being full page loads, silently — so
// say which ones rather than let the count drift.
const documents = copied.filter((file) => file.endsWith(".html"));
const orphans = documents.filter((file) => !copied.includes(file.replace(/\.html$/, ".rsc")));
if (orphans.length) {
  console.log(`No RSC payload for ${orphans.length} document(s): ${orphans.join(", ")}`);
}

const manifest = {
  generatedAt: new Date().toISOString(),
  files: copied.sort(),
};
fs.writeFileSync(path.join(targetRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Static fast path prepared: ${copied.length} prerendered documents copied to .open-next/assets/__static_pages/.`);
