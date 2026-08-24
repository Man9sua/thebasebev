import type { SitePage } from "@/lib/site-pages";
import styles from "./LegacyPageShell.module.css";

/**
 * Frame for a parity page whose Tilda chrome has been removed.
 *
 * `LegacyDocument` renders the export exactly as it was, chrome included, and is
 * still used for the two standalone header/footer aliases. Every other route
 * comes through here instead: the shared `SiteHeader` and `SiteFooter` render
 * around this element, and `site-pages.ts` has already dropped the old header,
 * the old footer nav and the dead duplicate menus from the markup — server-side,
 * so no copy of the old chrome is ever sent, let alone painted and then hidden.
 *
 * What stays is deliberate: the page's JSON-LD, the Tilda cart, the owned lead
 * forms and their popups, and the cookie banner all still live inside the
 * retagged `#t-header` / `#t-footer` containers.
 */
export function LegacyPageShell({ page }: { page: SitePage }) {
  return (
    <>
      <div
        className="legacy-head-assets"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: page.headAssetsHtml }}
      />
      <main
        className={`legacy-document ${styles.shell}`}
        data-source-file={page.file}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
      />
    </>
  );
}
