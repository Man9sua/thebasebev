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
    if (entry.isDirectory()) walk(absolute);
    if (!entry.isFile() || path.extname(entry.name) !== ".html") continue;

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

for (const required of ["index.html", "not-found.html", "robots.txt", "sitemap.xml"]) {
  if (!copied.includes(required)) throw new Error(`Static fast path is missing ${required}.`);
}
if (copied.length < 100) {
  throw new Error(`Static fast path unexpectedly contains only ${copied.length} files.`);
}

const manifest = {
  generatedAt: new Date().toISOString(),
  files: copied.sort(),
};
fs.writeFileSync(path.join(targetRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Static fast path prepared: ${copied.length} prerendered documents copied to .open-next/assets/__static_pages/.`);
