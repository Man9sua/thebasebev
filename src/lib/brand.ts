const BRAND = /\b(?:THE BASE|The Base)\b(?! (?:BEVERAGE|Beverage))/g;

export function brandCase(text: string) {
  return text.replace(BRAND, "the Base");
}

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
