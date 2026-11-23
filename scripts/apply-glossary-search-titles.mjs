/**
 * Search-phrase titles for the Glossary.
 *
 * Production imported each term with its bare name as the <title> ("Premix",
 * "MOQ", "Frappe"). One word says nothing about the question a reader types
 * into Google or an AI assistant, so every term gets a question-shaped title:
 *
 *   What is a Premix? Dry Beverage Base Explained | The Base
 *
 * The rule is a template ("What is {term}? {category phrase} | The Base") with
 * hand-written overrides for the terms people search by their full name or
 * acronym. The H1, description and canonical are not touched.
 *
 * The term's original title is kept as `seo.sourceTitle`, so the script is
 * idempotent and `audit:seo-parity` can tell this deliberate change from drift.
 *
 * Run: node scripts/apply-glossary-search-titles.mjs
 */
import fs from "node:fs";

const DATA_PATH = "src/data/glossary-content.json";
const BRAND = "The Base";
const MAX_LENGTH = 65;

const CATEGORY_PHRASE = {
  ingredients: "Meaning & Café Use",
  tech: "Beverage Science Explained",
  business: "HoReCa Term Explained",
};

/** Full titles (without the brand) for terms searched by name or acronym. */
const OVERRIDES = {
  Premix: "What is a Premix? Dry Beverage Base Explained",
  MOQ: "What is MOQ? Minimum Order Quantity Explained",
  Frappe: "What is a Frappe? Blended Ice Drink Explained",
  Brix: "What is Brix? Sugar Content in Drinks Explained",
  Matcha: "What is Matcha? Green Tea Powder for Cafés",
  OEM: "What is OEM? Beverage Manufacturing Explained",
  ODM: "What is ODM? Original Design Manufacturing",
  "Private Label": "What is Private Label? Beverages Explained",
  "White Label": "What is White Label? Ready Drink Products",
  "Contract Manufacturing": "What is Contract Manufacturing? Drinks Guide",
  HACCP: "What is HACCP? Food Safety System Explained",
  "ISO 22000": "What is ISO 22000? Food Safety Standard",
  "Halal Certification": "What is Halal Certification? Food & Drinks",
  GMP: "What is GMP? Good Manufacturing Practice",
  "Certificate of Analysis": "What is a Certificate of Analysis (COA)?",
  SKU: "What is a SKU? Stock Keeping Unit Explained",
  LTO: "What is an LTO? Limited Time Offer Menus",
  EXW: "What is EXW? Ex Works Shipping Term Explained",
  FOB: "What is FOB? Free on Board Explained",
  CIF: "What is CIF? Cost, Insurance and Freight",
  "HS Code": "What is an HS Code? Customs Codes Explained",
  Incoterms: "What are Incoterms? Shipping Terms Explained",
  CapEx: "What is CapEx? Capital Expenditure Explained",
  OpEx: "What is OpEx? Operating Expenses Explained",
  "Beverage Cost %": "What is Beverage Cost %? Formula Explained",
  "Cup Cost": "What is Cup Cost? Cost per Drink Explained",
  "Net Margin per Cup": "Net Margin per Cup Explained for Cafés",
  "Landed Cost": "What is Landed Cost? Import Costs Explained",
  "Lead Time": "What is Lead Time? Order to Delivery Explained",
  "Lot Number": "What is a Lot Number? Batch Tracking Explained",
  "Ceremonial vs Culinary Matcha": "Ceremonial vs Culinary Matcha: The Difference",
  Doypack: "What is a Doypack? Stand Up Pouch Explained",
  "Stick Pack": "What is a Stick Pack? Single Serve Sachets",
  "Water Activity": "What is Water Activity (aw) in Food?",
  "Raf Coffee": "What is Raf Coffee? Origin & Recipe Explained",
  "Karak Chai": "What is Karak Chai? Gulf Milk Tea Explained",
  "Masala Chai": "What is Masala Chai? Spiced Tea Explained",
  "Chai Latte": "What is a Chai Latte? Spiced Milk Tea Guide",
  "Matcha Latte": "What is a Matcha Latte? Café Guide",
  "Bubble Tea": "What is Bubble Tea? Boba Explained for Cafés",
  "Danger Zone": "What is the Food Danger Zone? 4 to 60 °C",
};

/** Countable terms that read naturally with an article. */
const ARTICLE = new Set([
  "Crossover Drink",
  "Category Anchor",
  "Habit Loop",
  "Signature Drink",
  "Waste Log",
  "Steam Wand",
  "Sensory Panel",
  "Stabilizer",
  "Emulsion",
  "Anti caking Agent",
  "Spanish Latte",
  "Pistachio Latte",
  "Taro Latte",
  "Ube Latte",
  "Dirty Chai",
  "Freddo",
  "Karak Frappe",
  "Lotus Drink",
]);

/** Plural terms take "are". */
const PLURAL = new Set(["Tapioca Pearls", "Tannins", "Theaflavins", "Volatile Terpenes"]);

function question(term) {
  if (PLURAL.has(term)) return `What are ${term}?`;
  if (ARTICLE.has(term)) return `What is ${/^[AEIOU]/.test(term) ? "an" : "a"} ${term}?`;
  return `What is ${term}?`;
}

function searchTitle(term, category) {
  const lead = OVERRIDES[term];
  if (lead) return `${lead} | ${BRAND}`;
  const full = `${question(term)} ${CATEGORY_PHRASE[category]} | ${BRAND}`;
  return full.length <= MAX_LENGTH ? full : `${question(term)} Explained | ${BRAND}`;
}

const raw = fs.readFileSync(DATA_PATH, "utf8");
const content = JSON.parse(raw);
const seen = new Set();

for (const entry of content.entries) {
  entry.seo.sourceTitle ??= entry.seo.title;
  const title = searchTitle(entry.title, entry.category);
  if (seen.has(title)) throw new Error(`Duplicate glossary title: ${title}`);
  if (title.length > 70) throw new Error(`Title too long (${title.length}): ${title}`);
  seen.add(title);
  entry.seo.title = title;
  entry.seo.openGraphTitle = title;
}

fs.writeFileSync(DATA_PATH, `${JSON.stringify(content, null, raw.startsWith('{\n  "') ? 2 : 4)}\n`);
console.log(`Applied search titles to ${content.entries.length} glossary terms.`);
