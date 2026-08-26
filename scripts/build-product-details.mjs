/**
 * Lift each product page's own copy out of the export.
 *
 * The exported product pages are Tilda "zero blocks": every line is an
 * absolutely positioned `tn-atom` whose position is applied by script at
 * runtime. On the migrated site that script does not finish, so the whole hero
 * — name, tagline, weight, both paragraphs, the price buttons and the four
 * selling points — is present in the DOM at full height and paints nothing.
 * That is the blank pink rectangle at the top of every product page.
 *
 * The copy itself is good and it is what the pages rank on, so it is lifted out
 * here rather than rewritten, and `ProductHero` renders it as ordinary markup.
 *
 * Run once and read the result: this writes `src/data/product-details.json`,
 * which is committed and reviewed, not generated during a build. The atom order
 * is not identical from page to page — some put the buttons before the name —
 * so everything below matches on content rather than on position, and anything
 * it cannot place is left out of the file rather than guessed at.
 *
 * Run: node scripts/build-product-details.mjs
 */

import fs from "node:fs";
import path from "node:path";

const EXPORT = path.resolve("tilda_export/project12027355/files");
const OUT = path.resolve("src/data/product-details.json");

/** Product slug -> the exported page that describes it. */
const PAGES = {
  milkshake: "page62508381",
  frappe: "page62510271",
  "iced-tea": "page62515411",
  cordial: "page62539863",
  "raf-coffee": "page62448803",
  "chai-latte": "page62497031",
  matcha: "page62544887",
  chocolate: "page62565397",
  "cream-latte": "page62494049",
  jam: "page62574449",
  topping: "page62541199",
  garnish: "page62576005",
  "sugar-syrup": "page62566191",
  tea: "page62581091",
  "sugar-free": "page62578053",
  vending: "page62573319",
};

const SPEC_LABELS = ["Prep Time", "Packaging", "Proportions", "Per Serving"];
/** Display names, read from the registry so they stay written down in one place. */
const NAMES = Object.fromEntries(
  [
    ...fs
      .readFileSync(path.resolve("src/data/products.ts"), "utf8")
      .matchAll(/slug: "([a-z-]+)",[\s\S]{0,160}?name: "([^"]+)"/g),
  ].map((match) => [match[1], match[2]]),
);

/** Chrome and controls that live in the same block but are not product copy. */
const NOISE = /^(\+971|Catalog\b|Pricing$|Place order$|Get A Sample$|Read more$)/i;

function text(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function bodyOf(file) {
  return fs.readFileSync(path.join(EXPORT, `${file}body.html`), "utf8");
}

/**
 * The page's own `h1`, verbatim.
 *
 * It has to be verbatim: `audit:seo-parity` compares it against the live site
 * character for character, and it is not the same string as the registry's
 * `headline` — production says "Easy to Blend" where the registry says "Easy to
 * Prepare", and uses an en dash where the registry uses an em dash.
 */
function headingOf(file) {
  const match = bodyOf(file).match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? text(match[1]) : null;
}

/** The first record after the shared header — the hero block React replaces. */
function heroRecordOf(file) {
  const after = bodyOf(file).slice(bodyOf(file).indexOf("</header>"));
  return after.match(/<div[^>]*id="(rec\d+)"[^>]*class="r t-rec"/)?.[1] ?? null;
}

function atomsOf(file) {
  const source = bodyOf(file);
  const body = source
    .slice(source.indexOf("</header>"))
    // Every block carries its own stylesheet and its own scripts inline, and
    // stripped of their tags a rule set is just a very long line of text — long
    // enough to beat the real body copy at being the longest thing on the page.
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");

  return [...body.matchAll(/<div class=.tn-atom.[^>]*>([\s\S]*?)<\/div>/g)]
    .map((match) => text(match[1]))
    .filter((atom) => atom && !/[{}]|@media|px;/.test(atom));
}

/**
 * "Creamy. Convenient. Thick." over "500g" — one atom, split by a line break.
 * Three or four one-word sentences is the shape every page uses.
 */
function takeTagline(atoms) {
  const index = atoms.findIndex((atom) => /^(?:[\w-]+\.\s*){2,4}\n/.test(atom));
  if (index < 0) return null;

  const [tagline, ...rest] = atoms[index].split("\n");
  atoms.splice(index, 1);
  return { tagline: tagline.trim(), weight: rest.join(" ").trim() || null };
}

/**
 * The body copy opens by naming the product — "Milkshake is a classic treat…"
 * Length alone is not enough to find it: the custom-flavours block carries a
 * longer paragraph, and on eight of the sixteen pages that one won.
 */
function takeDescription(atoms, name) {
  const best = atoms.findIndex(
    (atom) => atom.length > 80 && atom.toLowerCase().startsWith(name.toLowerCase()),
  );
  // Nothing else is accepted. Every product page also carries three shared
  // pitches — custom flavours, distributor enquiry, free sample — and each of
  // them is longer than the product copy, so "the longest paragraph" picked the
  // wrong one on half the pages. Where the copy does not name its own product,
  // the page falls back to the registry's description instead of guessing.
  if (best < 0) return null;

  const [description] = atoms.splice(best, 1);
  return description.split("\n").map((line) => line.trim()).filter(Boolean);
}

/**
 * Selling points are a label ending in a colon and a value beside it — but
 * "beside" is sometimes the atom before and sometimes the one after, because
 * the block was laid out by dragging. So each label takes its nearest unclaimed
 * neighbour, looking back first.
 */
function takeFeatures(atoms) {
  const features = [];
  const claimed = new Set();

  atoms.forEach((atom, index) => {
    if (!/:$/.test(atom) || atom.length > 40) return;
    const before = index - 1;
    const after = index + 1;
    const pick = [before, after].find(
      (candidate) =>
        candidate >= 0 &&
        candidate < atoms.length &&
        !claimed.has(candidate) &&
        !/:$/.test(atoms[candidate]) &&
        !SPEC_LABELS.includes(atoms[candidate]),
    );
    if (pick === undefined) return;

    claimed.add(index);
    claimed.add(pick);
    features.push({ label: atom.replace(/:$/, ""), value: atoms[pick].replace(/\n/g, " ") });
  });

  for (const index of [...claimed].sort((a, b) => b - a)) atoms.splice(index, 1);
  return features;
}

/** The four figures under the tabs, each label followed by its value. */
function takeSpecs(atoms) {
  const specs = [];
  for (const label of SPEC_LABELS) {
    const index = atoms.indexOf(label);
    if (index < 0 || index + 1 >= atoms.length) continue;
    specs.push({ label, value: atoms[index + 1].replace(/\n/g, " ") });
  }
  return specs;
}

const details = {};
const problems = [];

for (const [slug, file] of Object.entries(PAGES)) {
  const atoms = atomsOf(file).filter((atom) => !NOISE.test(atom));
  const specs = takeSpecs(atoms);
  const heading = takeTagline(atoms);
  const description = takeDescription(atoms, NAMES[slug] ?? slug);
  const features = takeFeatures(atoms);

  const h1 = headingOf(file);
  const heroRecord = heroRecordOf(file);

  details[slug] = {
    h1,
    heroRecord,
    tagline: heading?.tagline ?? null,
    weight: heading?.weight ?? null,
    description: description ?? [],
    features,
    specs,
  };

  const missing = [
    !h1 && "h1",
    !heroRecord && "heroRecord",
    !heading?.tagline && "tagline",
    !description?.length && "description",
    features.length < 3 && `features(${features.length})`,
    specs.length < 4 && `specs(${specs.length})`,
  ].filter(Boolean);
  if (missing.length) problems.push(`${slug}: ${missing.join(", ")}`);
}

fs.writeFileSync(OUT, `${JSON.stringify(details, null, 2)}\n`, "utf8");

console.log(`Wrote ${Object.keys(details).length} products to ${path.relative(process.cwd(), OUT)}.`);
if (problems.length) {
  console.log("\nNeeds a look before shipping:");
  for (const problem of problems) console.log(`  ${problem}`);
}
