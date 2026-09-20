import glossaryContent from "./glossary-content.json";

export type GlossaryCategory = "ingredients" | "tech" | "business";

export type GlossaryInline =
  | { type: "text"; text: string }
  | { type: "link"; text: string; href: string };

export type GlossaryParagraph = {
  type: "paragraph";
  content: GlossaryInline[];
};

export type GlossaryContentStatus = "published" | "empty-production-source";

export type GlossaryEntry = {
  uid: string;
  path: string;
  sourceUrl: string;
  title: string;
  category: GlossaryCategory;
  published: string;
  excerpt: string;
  body: GlossaryParagraph[];
  bodyText: string;
  contentStatus: GlossaryContentStatus;
  sourceStatus: number;
  sourceRobots: string;
  sourceTextHash: string;
  seo: {
    title: string;
    description: string;
    canonical: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
};

const entries = glossaryContent.entries as GlossaryEntry[];

export const GLOSSARY_ENTRIES: readonly GlossaryEntry[] = entries;

const CATEGORY_LABELS: Record<GlossaryCategory, string> = {
  ingredients: "Ingredients & bases",
  tech: "Beverage tech",
  business: "HoReCa & business",
};

const ENTRY_BY_PATH = new Map(entries.map((entry) => [entry.path, entry]));
const PRODUCTION_ORIGIN = "https://thebasebev.com";

function normalizePath(value: string) {
  try {
    const url = new URL(value, "https://thebasebev.com");
    const normalized = url.pathname.replace(/\/+$/, "");
    return normalized || "/";
  } catch {
    const normalized = value.split(/[?#]/, 1)[0].replace(/\/+$/, "");
    return normalized || "/";
  }
}

export function categoryLabel(category: GlossaryCategory) {
  return CATEGORY_LABELS[category];
}

export function findGlossaryEntryByPath(value: string) {
  return ENTRY_BY_PATH.get(normalizePath(value));
}

/**
 * Keep migrated Glossary and existing application routes local. A small number
 * of source articles link to Blog posts that have not been migrated yet; those
 * links must continue to reach the live source instead of becoming staging
 * 404s.
 */
export function resolveGlossaryHref(href: string) {
  if (!href.startsWith("/tpost/") || ENTRY_BY_PATH.has(normalizePath(href))) return href;
  return `${PRODUCTION_ORIGIN}${href}`;
}

export function getRelatedGlossaryEntries(entry: GlossaryEntry, limit = 3) {
  if (limit <= 0) return [];
  return entries
    .filter((candidate) => candidate.uid !== entry.uid && candidate.category === entry.category)
    .slice(0, limit);
}
