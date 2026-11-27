import { LegacyHeadAssets } from "@/components/legacy/LegacyHeadAssets";
import { LegacyCatalogTilt } from "@/components/legacy/LegacyCatalogTilt";
import type { SitePage } from "@/lib/site-pages";
import { PRODUCTS } from "@/data/products";
import styles from "./LegacyPageShell.module.css";

const PRODUCT_ROUTES = new Set(PRODUCTS.map((product) => product.route));

export function LegacyPageShell({
  page,
  runtimeOnly = false,
  opensPage = true,
}: {
  page: SitePage;
  runtimeOnly?: boolean;
  opensPage?: boolean;
}) {
  const pageKind = PRODUCT_ROUTES.has(page.route)
    ? "product"
    : page.route === "/catalog"
      ? "catalog"
      : "content";

  return (
    <>
      <LegacyHeadAssets html={page.headAssetsHtml} />
      {runtimeOnly ? (
        <div
          className={`legacy-document ${styles.shell} ${styles.runtimeOnly}`}
          data-source-file={page.file}
          data-page-kind="runtime"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
      ) : (
        <main
          className={`legacy-document ${styles.shell} ${
            opensPage ? styles.opensPage : ""
          } ${pageKind === "product" ? styles.product : ""}`}
          data-source-file={page.file}
          data-page-kind={pageKind}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
      )}

      {!runtimeOnly && <LegacyCatalogTilt />}
    </>
  );
}
