# LegacyDocument compatibility component

Target: `src/components/legacy/LegacyDocument.tsx`

## Purpose

Render audited Tilda page markup as crawler-visible server HTML during the first parity stage. This is an isolated compatibility boundary, not an iframe and not the long-term component architecture.

## Contract

- Accept the route's audited body HTML and body classes.
- Render the markup during static generation so meaningful content and headings exist without client-side JavaScript.
- Preserve original record IDs, `data-*` attributes, visible copy, asset URLs, accessibility labels, and link targets.
- Add `<base href="/">` at document level so nested routes resolve exported `css/`, `js/`, and `images/` paths correctly.
- Use a `display: contents` wrapper to minimize impact on Tilda direct-child selectors.
- Keep the original `t-body` class and imported page/global styles.
- Preserve full-document navigation for legacy anchor-driven behavior.
- Preserve the audited breakpoints and current clipping behavior; parity-stage CSS must not redesign it.

## Boundary

Tilda scripts retained inside this boundary are temporary and classified in `MIGRATION_NOTES.md`. New business integrations, metadata, robots, sitemap, redirects, and attribution are owned by Next.js.
