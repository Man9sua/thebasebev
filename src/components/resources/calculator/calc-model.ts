/**
 * Drink cost calculator: presets, English copy and the owner's formulas.
 *
 * Lifted from the owner's design (`template.html`, the `text/x-dc` script).
 * Only EN is wired; the design's RU/AR strings are not shipped yet.
 * The brand is written "the Base" in every string, as the owner asked.
 */

export type Unit = "g" | "ml" | "pc";

export type Row = {
  id: string;
  name: string;
  price: string;
  pack: string;
  unit: Unit;
  use: string;
};

type PresetRow = [name: string, price: number, pack: number, unit: Unit, use: number];

export const PRESETS = {
  "Iced Raf": [
    ["the Base Raf base", 90, 1000, "g", 30],
    ["Milk", 7, 1000, "ml", 180],
    ["Espresso beans", 120, 1000, "g", 18],
    ["Cup and lid", 40, 50, "pc", 1],
  ],
  "Matcha latte": [
    ["the Base Matcha", 160, 1000, "g", 20],
    ["Milk", 7, 1000, "ml", 220],
    ["Cup and lid", 40, 50, "pc", 1],
  ],
  "Frappé": [
    ["the Base Frappé base", 85, 1000, "g", 40],
    ["Milk", 7, 1000, "ml", 150],
    ["Espresso beans", 120, 1000, "g", 18],
    ["Whipped cream", 30, 1000, "g", 15],
    ["Cup, lid and straw", 50, 50, "pc", 1],
  ],
  "Hot chocolate": [
    ["the Base Hot chocolate", 80, 1000, "g", 30],
    ["Milk", 7, 1000, "ml", 220],
    ["Cup and lid", 40, 50, "pc", 1],
  ],
} satisfies Record<string, PresetRow[]>;

export type PresetName = keyof typeof PRESETS;
export const PRESET_NAMES = Object.keys(PRESETS) as PresetName[];
export const DEFAULT_PRESET: PresetName = "Iced Raf";

export function presetRows(name: PresetName): Row[] {
  return (PRESETS[name] as PresetRow[]).map((row, index) => ({
    id: `${name}-${index}`,
    name: row[0],
    price: String(row[1]),
    pack: String(row[2]),
    unit: row[3],
    use: String(row[4]),
  }));
}

export const ADD_BUTTONS: { label: string; unit: Unit }[] = [
  { label: "Ingredient", unit: "g" },
  { label: "Liquid", unit: "ml" },
  { label: "Packaging", unit: "pc" },
];

export const TARGETS = [20, 25, 30] as const;

export const T = {
  title: "Drink cost calculator",
  lead: "Enter what you pay and how much goes in the cup. You get the cost per drink, your cost percentage and the price to charge.",
  start: "Start from a drink",
  ing: "Ingredient",
  packPrice: "Pack price, AED",
  packSize: "Pack size",
  inCup: "In one cup",
  cost: "Cost",
  waste: "Waste",
  wasteNote: "Milk left in the pitcher, spills, tastings. Most cafés lose 5 to 10%.",
  delivery: "Delivery app",
  commission: "Delivery app commission",
  delNote: "Talabat, Deliveroo and others take a commission from each order.",
  costCup: "Cost per drink",
  withWaste: "incl. {w}% waste",
  menuPrice: "Menu price, AED with 5% VAT",
  pct: "Cost %",
  ok: "Healthy",
  mid: "On the edge",
  bad: "Too high, raise the price",
  profit: "Profit per drink",
  afterVat: "after VAT",
  afterDel: "after VAT and commission",
  target: "Target cost",
  suggested: "Suggested menu price",
  use: "Use this price",
  perDay: "Drinks sold a day",
  monthly: "Profit a month",
  dl: "Download PDF",
  cmpTitle: "the Base or from scratch",
  cmpLead: "The same drink made with our base, and with syrups, sauces and powders mixed at the bar.",
  withBase: "With the Base",
  withBaseNote: "One scoop. Same taste every cup.",
  altName: "Syrup and sauce",
  altNote: "Enter your current cost and time for this drink.",
  secs: "Seconds per drink",
  diff: "Difference",
  moneyMonth: "Money a month",
  timeMonth: "Barista time a month",
  hours: "h",
  foot: "Most cafés keep drink cost at 20 to 30% of the price without VAT. Prices for the Base products come from your distributor.",
  drink: "Your drink",
  remove: "Remove",
} as const;

/** Accepts "7,5" as well as "7.5"; anything unreadable counts as 0. */
export function num(value: string | number): number {
  const parsed = Number.parseFloat(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export const aed = (value: number) => `${value.toFixed(2)} AED`;

export function lineCost(row: Row): number {
  return num(row.pack) ? (num(row.price) / num(row.pack)) * num(row.use) : 0;
}

export type CalcInput = {
  rows: Row[];
  waste: string;
  price: string;
  target: number;
  perDay: string;
  delivery: boolean;
  commission: string;
  ourSec: string;
  altCost: string;
  altSec: string;
};

/** The design's `renderVals` arithmetic, unchanged. */
export function calculate(s: CalcInput) {
  const raw = s.rows.reduce((sum, row) => sum + lineCost(row), 0);
  const cost = raw * (1 + num(s.waste) / 100);
  const exVat = num(s.price) / 1.05;
  const cm = s.delivery ? num(s.commission) / 100 : 0;
  const pct = exVat ? (cost / exVat) * 100 : 0;
  const profit = exVat * (1 - cm) - cost;
  const suggested = Math.ceil((cost / (s.target / 100) / (1 - cm)) * 1.05 * 2) / 2;
  const verdict: "ok" | "mid" | "bad" = pct <= 30 ? "ok" : pct <= 35 ? "mid" : "bad";
  const days = num(s.perDay) * 30;
  const saveMoney = (num(s.altCost) - cost) * days;
  const saveHours = ((num(s.altSec) - num(s.ourSec)) * days) / 3600;
  return {
    cost,
    pct,
    profit,
    suggested: Number.isFinite(suggested) ? suggested : 0,
    verdict,
    monthly: profit * days,
    saveMoney,
    saveHours,
  };
}

export const wholeAed = (value: number) => `${(Math.round(value) || 0).toLocaleString("en-US")} AED`;
export const signed = (value: number, text: string) => `${value >= 0 ? "+" : ""}${text}`;

let addedRows = 0;
/** A stable key for a row the user adds; called from event handlers only. */
export function newRowId(): string {
  addedRows += 1;
  return `added-${addedRows}`;
}
