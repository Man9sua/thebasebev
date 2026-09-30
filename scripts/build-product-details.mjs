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

/**
 * The page's own records, in order, each sliced from its id to the next one.
 *
 * Records are siblings, so no balanced-tag parsing is needed — and none would
 * be reliable here anyway, against minified markup where `<div` also occurs
 * inside inline scripts.
 */
function recordsOf(file) {
  const source = bodyOf(file);
  const after = source.slice(source.indexOf("</header>"));
  const starts = [...after.matchAll(/<div id="(rec\d+)"[^>]*data-record-type="(\d+)"/g)];

  return starts.map((start, index) => ({
    id: start[1],
    type: start[2],
    html: after.slice(start.index, starts[index + 1]?.index ?? after.length),
  }));
}

/**
 * The positioned elements of a zero block, with the coordinates it was drawn at.
 *
 * Those coordinates are the only record of what the block was meant to look
 * like: nothing in the markup says which atom is a column header and which is a
 * cell, only that one sits above the other. Everything below rebuilds structure
 * out of `top` and `left`.
 */
function elementsOf(html) {
  const clean = html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");

  const expression =
    /<div class='t396__elem[^']*' data-elem-id='\d+'([\s\S]*?)>([\s\S]*?)(?=<div class='t396__elem|$)/g;

  return [...clean.matchAll(expression)].map((match) => {
    const [, attributes, inner] = match;
    const field = (name) => {
      const hit = attributes.match(new RegExp(`data-field-${name}-value="(-?\\d+)"`));
      return hit ? Number(hit[1]) : null;
    };

    return {
      type: attributes.match(/data-elem-type='([^']+)'/)?.[1] ?? "",
      top: field("top"),
      left: field("left"),
      text: text(inner),
      image: inner.match(/data-original='([^']+)'/)?.[1] ?? null,
      href: inner.match(/<a class='tn-atom'[^>]*href="([^"]+)"/)?.[1] ?? null,
    };
  });
}

/**
 * The elements that are actually on the artboard.
 *
 * `.t396__artboard` clips its overflow, so anything dragged above the top edge
 * has never been on the published page. Several products keep a superseded
 * flavour list up there, and taking it would put copy on the migrated page that
 * production does not show.
 */
function onArtboard(elements) {
  return elements.filter((element) => element.top !== null && element.top >= 0);
}

/** Groups elements into the rows they were drawn on, each ordered left to right. */
function rowsOf(elements, gap = 24) {
  const rows = [];

  for (const element of [...elements].sort((a, b) => a.top - b.top || a.left - b.left)) {
    const open = rows.at(-1);
    if (open && element.top - open.top <= gap) open.items.push(element);
    else rows.push({ top: element.top, items: [element] });
  }

  for (const row of rows) row.items.sort((a, b) => a.left - b.left);
  return rows;
}

/** Index of the column this element was drawn under. */
function nearestColumn(lefts, left) {
  let best = 0;
  for (let index = 1; index < lefts.length; index += 1) {
    if (Math.abs(lefts[index] - left) < Math.abs(lefts[best] - left)) best = index;
  }
  return best;
}

/**
 * A tick or a cross, read from the icon itself.
 *
 * The table marks each ingredient with one of four near-identical 20px SVGs —
 * two greens and two reds, duplicated because the block was edited over time.
 * Matching on the fill rather than on the file name means a fifth copy would
 * still be read correctly.
 */
function isTick(file) {
  const svg = fs.readFileSync(path.resolve("public/images", path.basename(file)), "utf8");
  return /#52A866/i.test(svg);
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

/**
 * Which record is which.
 *
 * Recognised by what each one contains rather than by position: the six blocks
 * below the hero are in the same order on all sixteen pages, but their record
 * ids are per page and two products have an extra block in the middle.
 */
function sectionsOf(file) {
  const records = recordsOf(file);
  const zero = (pattern) =>
    records.find((record) => record.type === "396" && pattern.test(record.html));

  return {
    hero: records.find((record) => record.type === "396"),
    tabs: records.find((record) => record.type === "1281"),
    specs: zero(/>Prep Time</),
    calculation: zero(/Comparative Calculation/),
    flavors: zero(/Custom Flavors/),
    // Named last so the two headings above, which also contain the word, do not
    // claim it: this is the block whose own first line is exactly "Usage".
    usage: records.find(
      (record) =>
        record.type === "396" &&
        onArtboard(elementsOf(record.html))
          .filter((element) => element.type === "text")
          .sort((a, b) => a.top - b.top)[0]?.text === "Usage",
    ),
    faqTitle: zero(/Frequently Asked Questions/),
    faq: records.find((record) => record.type === "668"),
  };
}

/**
 * The comparative table.
 *
 * There is no table in the markup — there are two dozen absolutely positioned
 * atoms and four SVGs. Tops cluster into rows, and every cell takes the column
 * whose header it was drawn under, so the table comes back out whatever the
 * page calls its columns: half the products compare against "Actual Recipe" and
 * half against "<product> with Syrup".
 */
function takeCalculation(record) {
  if (!record) return null;

  const rows = rowsOf(onArtboard(elementsOf(record.html)).filter((item) => item.type !== "shape"));
  const title = rows.shift()?.items[0]?.text;
  const header = rows.shift();
  if (!title || !header || header.items.length < 3) return null;

  const lefts = header.items.map((item) => item.left);

  return {
    title,
    columns: header.items.map((item) => item.text),
    rows: rows.map((row) => {
      const cells = header.items.map(() => null);
      for (const item of row.items) {
        cells[nearestColumn(lefts, item.left)] = item.image ? isTick(item.image) : item.text;
      }
      return cells;
    }),
  };
}

/**
 * One atom the export has lost the line break inside.
 *
 * Jam's flavour column reads `StrawberryWatermelon` in the source — the two
 * names ran together when the block was last edited, and nothing in the markup
 * says where one ends. Nobody has ever seen it, because that block has never
 * painted. It is named here rather than split by rule, because a rule that cuts
 * on a capital would also cut `HoneyDew` and `Purple Yum UBE` in half.
 */
const RUN_TOGETHER = { StrawberryWatermelon: ["Strawberry", "Watermelon"] };

/** The flavour columns, the custom-flavour pitch beside them, and its button. */
function takeFlavors(record) {
  if (!record) return null;

  const elements = onArtboard(elementsOf(record.html));
  const button = elements.find((element) => element.type === "button");
  const texts = elements.filter((element) => element.type === "text");
  const headings = texts.filter((element) => /^(?:Custom )?Flavors$/i.test(element.text));

  // The pitch is found by where it sits, not by how long it is: it is the line
  // under the "Custom Flavors" heading, in that panel's own column. Length does
  // not separate it from a flavour list — six of the products have a column
  // longer than the sentence.
  const panel = texts.find((element) => /^Custom Flavors$/i.test(element.text));
  const note = panel
    ? texts
        .filter((element) => element !== panel && element.top > panel.top)
        .sort((a, b) => Math.abs(a.left - panel.left) - Math.abs(b.left - panel.left))[0]
    : texts.find((element) => !element.text.includes("\n") && element.text.length > 40);

  const items = texts
    .filter((element) => element !== note && !headings.includes(element))
    .sort((a, b) => a.left - b.left || a.top - b.top)
    .flatMap((element) => element.text.split("\n"))
    .map((flavour) => flavour.trim())
    .filter(Boolean)
    .flatMap((flavour) => RUN_TOGETHER[flavour] ?? [flavour]);

  if (!items.length) return null;

  return {
    note: note?.text ?? null,
    cta: button ? { label: button.text, href: button.href ?? "#flavor" } : null,
    items: [...new Set(items)],
  };
}

/** "Simply mix with milk…", and the diagram drawn under it. */
function takeUsage(record) {
  if (!record) return null;

  const elements = onArtboard(elementsOf(record.html)).sort((a, b) => a.top - b.top);
  const lines = elements
    .filter((element) => element.type === "text")
    .flatMap((element) => element.text.split("\n"))
    .map((line) => line.trim())
    .filter((line) => line && line !== "Usage");

  if (!lines.length) return null;

  const image = elements.find((element) => element.image)?.image ?? null;
  return { lines, image: image ? `/${image.replace(/^\/+/, "")}` : null };
}

/**
 * The three questions each product answers.
 *
 * This one block is not a zero block — it is a working Tilda accordion — so it
 * is read straight out of the markup. It is replaced anyway, because the
 * accordion is the last piece of Tilda chrome on the page.
 */
function takeFaq(record) {
  if (!record) return [];

  const questions = [...record.html.matchAll(/<span class="t668__title[^"]*"[^>]*>([\s\S]*?)<\/span>/g)];
  const answers = [...record.html.matchAll(/<div class="t668__textwrapper[^"]*"[^>]*>([\s\S]*?)<\/div>/g)];

  return questions
    .map((question, index) => ({
      question: text(question[1]).replace(/\n/g, " ").trim(),
      answer: text(answers[index]?.[1] ?? "").replace(/\n/g, " ").trim(),
    }))
    .filter((entry) => entry.question && entry.answer);
}

/** The pictogram drawn above each figure, paired to it by the column it is in. */
function specIconsOf(record, specs) {
  if (!record) return specs;

  const elements = onArtboard(elementsOf(record.html));
  const labels = elements.filter((element) => SPEC_LABELS.includes(element.text));
  const icons = elements.filter((element) => element.image);
  if (labels.length !== specs.length || !icons.length) return specs;

  const lefts = icons.map((icon) => icon.left);

  return specs.map((spec) => {
    const label = labels.find((element) => element.text === spec.label);
    if (!label) return spec;
    const icon = icons[nearestColumn(lefts, label.left)];
    return { ...spec, icon: `/${icon.image.replace(/^\/+/, "")}` };
  });
}

const details = {};
const problems = [];

for (const [slug, file] of Object.entries(PAGES)) {
  const atoms = atomsOf(file).filter((atom) => !NOISE.test(atom));
  const heading = takeTagline(atoms);
  const description = takeDescription(atoms, NAMES[slug] ?? slug);
  const features = takeFeatures(atoms);

  const sections = sectionsOf(file);
  const specs = specIconsOf(sections.specs, takeSpecs(atoms));
  const calculation = takeCalculation(sections.calculation);
  const flavors = takeFlavors(sections.flavors);
  const usage = takeUsage(sections.usage);
  const faq = takeFaq(sections.faq);
  const h1 = headingOf(file);

  details[slug] = {
    h1,
    // Every record React now renders itself, so `site-pages.ts` has one list to
    // cut out of the export rather than a rule per block.
    records: Object.fromEntries(
      Object.entries(sections).map(([name, record]) => [name, record?.id ?? null]),
    ),
    tagline: heading?.tagline ?? null,
    weight: heading?.weight ?? null,
    description: description ?? [],
    features,
    specs,
    calculation,
    flavors,
    usage,
    faq,
  };

  const missing = [
    !h1 && "h1",
    !sections.hero && "hero record",
    !heading?.tagline && "tagline",
    !description?.length && "description",
    features.length < 3 && `features(${features.length})`,
    specs.length < 4 && `specs(${specs.length})`,
    !calculation && "calculation",
    calculation && calculation.rows.length < 2 && `calculation rows(${calculation.rows.length})`,
    !flavors && "flavors",
    flavors && !/\.$/.test(flavors.note ?? "") && `flavors note("${flavors.note}")`,
    !usage && "usage",
    faq.length < 3 && `faq(${faq.length})`,
  ].filter(Boolean);
  if (missing.length) problems.push(`${slug}: ${missing.join(", ")}`);
}

fs.writeFileSync(OUT, `${JSON.stringify(details, null, 2)}\n`, "utf8");

console.log(`Wrote ${Object.keys(details).length} products to ${path.relative(process.cwd(), OUT)}.`);
if (problems.length) {
  console.log("\nNeeds a look before shipping:");
  for (const problem of problems) console.log(`  ${problem}`);
}
