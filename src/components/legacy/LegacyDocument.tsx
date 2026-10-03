import { LegacyHeadAssets } from "@/components/legacy/LegacyHeadAssets";
import type { SitePage } from "@/lib/site-pages";

type LegacyDocumentProps = {
  page: SitePage;
};

export function LegacyDocument({ page }: LegacyDocumentProps) {
  return (
    <>
      <LegacyHeadAssets html={page.headAssetsHtml} />
      <main
        className="legacy-document"
        data-source-file={page.file}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
      />
    </>
  );
}
