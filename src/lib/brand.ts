/**
 * The brand is written "the Base" in running copy (the owner's rule), never
 * "THE BASE" or "The Base". The legal name "The Base Beverage LLC" is left as
 * registered. Used where copy comes from data the site cannot rewrite at the
 * source without breaking its parity checks: blog and glossary bodies and the
 * retained Tilda pages. Headings that are SEO fields (h1, titles) are not
 * passed through it.
 */
const BRAND = /\b(?:THE BASE|The Base)\b(?! (?:BEVERAGE|Beverage))/g;

export function brandCase(text: string) {
  return text.replace(BRAND, "the Base");
}

/**
 * The same, over HTML: only text between tags, never attributes, scripts,
 * styles, the document title or an h1.
 */
export function brandCaseHtml(html: string) {
  let skip = 0;
  return html.replace(/(<[^>]*>)|([^<]+)/g, (whole, tag: string | undefined, text: string | undefined) => {
    if (tag) {
      if (/^<(script|style|title|h1)\b/i.test(tag)) skip += 1;
      else if (/^<\/(script|style|title|h1)\s*>/i.test(tag)) skip = Math.max(0, skip - 1);
      return whole;
    }
    return skip ? whole : brandCase(text ?? "");
  });
}
