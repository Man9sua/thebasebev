import { LeadAttributionBridge } from "@/components/forms/LeadAttributionBridge";
import type { SitePage } from "@/lib/site-pages";

type LegacyDocumentProps = {
  page: SitePage;
};

export function LegacyDocument({ page }: LegacyDocumentProps) {
  return (
    <>
      <div
        className="legacy-head-assets"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: page.headAssetsHtml }}
      />
      <main
        className="legacy-document"
        data-source-file={page.file}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
      />
      <LeadAttributionBridge />
    </>
  );
}
