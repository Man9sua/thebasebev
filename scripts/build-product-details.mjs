import fs from "node:fs";
import path from "node:path";

const EXPORT = path.resolve("tilda_export/project12027355/files");
const OUT = path.resolve("src/data/product-details.json");

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
const NAMES = Object.fromEntries(
  [
    ...fs
      .readFileSync(path.resolve("src/data/products.ts"), "utf8")
      .matchAll(/slug: "([a-z-]+)",[\s\S]{0,160}?name: "([^"]+)"/g),
  ].map((match) => [match[1], match[2]]),
);

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

function headingOf(file) {
  const match = bodyOf(file).match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? text(match[1]) : null;
}

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

function onArtboard(elements) {
  return elements.filter((element) => element.top !== null && element.top >= 0);
}

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

function nearestColumn(lefts, left) {
  let best = 0;
  for (let index = 1; index < lefts.length; index += 1) {
    if (Math.abs(lefts[index] - left) < Math.abs(lefts[best] - left)) best = index;
  }
  return best;
}

function isTick(file) {
  const svg = fs.readFileSync(path.resolve("public/images", path.basename(file)), "utf8");
  return /#52A866/i.test(svg);
}

function atomsOf(file) {
  const source = bodyOf(file);
  const body = source
    .slice(source.indexOf("</header>"))
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");

  return [...body.matchAll(/<div class=.tn-atom.[^>]*>([\s\S]*?)<\/div>/g)]
    .map((match) => text(match[1]))
    .filter((atom) => atom && !/[{}]|@media|px;/.test(atom));
}

function takeTagline(atoms) {
  const index = atoms.findIndex((atom) => /^(?:[\w-]+\.\s*){2,4}\n/.test(atom));
  if (index < 0) return null;

  const [tagline, ...rest] = atoms[index].split("\n");
  atoms.splice(index, 1);
  return { tagline: tagline.trim(), weight: rest.join(" ").trim() || null };
}

function takeDescription(atoms, name) {
  const best = atoms.findIndex(
    (atom) => atom.length > 80 && atom.toLowerCase().startsWith(name.toLowerCase()),
  );
  if (best < 0) return null;

  const [description] = atoms.splice(best, 1);
  return description.split("\n").map((line) => line.trim()).filter(Boolean);
}

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

function takeSpecs(atoms) {
  const specs = [];
  for (const label of SPEC_LABELS) {
    const index = atoms.indexOf(label);
    if (index < 0 || index + 1 >= atoms.length) continue;
    specs.push({ label, value: atoms[index + 1].replace(/\n/g, " ") });
  }
  return specs;
}

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

const RUN_TOGETHER = { StrawberryWatermelon: ["Strawberry", "Watermelon"] };

function takeFlavors(record) {
  if (!record) return null;

  const elements = onArtboard(elementsOf(record.html));
  const button = elements.find((element) => element.type === "button");
  const texts = elements.filter((element) => element.type === "text");
  const headings = texts.filter((element) => /^(?:Custom )?Flavors$/i.test(element.text));

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
