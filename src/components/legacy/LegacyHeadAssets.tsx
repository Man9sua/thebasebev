type LegacyHeadAssetsProps = { html: string };

const linkTag = /<link\b[^>]*>/gi;
const relAttribute = /\brel=["']([^"']+)["']/i;
const hrefAttribute = /\bhref=["']([^"']+)["']/i;

export function LegacyHeadAssets({ html }: LegacyHeadAssetsProps) {
  const stylesheets: string[] = [];
  const runtimeHtml = html.replace(linkTag, (tag) => {
    const href = tag.match(hrefAttribute)?.[1];
    if (!href || !/\bstylesheet\b/i.test(tag.match(relAttribute)?.[1] ?? "")) return tag;
    stylesheets.push(/^\/?css\//.test(href) ? `/${href.replace(/^\//, "")}` : href);
    return "";
  });

  return (
    <>
      {[...new Set(stylesheets)].map((href) => (
        <link key={href} rel="stylesheet" href={href} precedence="default" />
      ))}
      <div
        className="legacy-head-assets"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: runtimeHtml }}
      />
    </>
  );
}
