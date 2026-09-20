# GlossaryPage

## Purpose

Replace the domain-bound Tilda feed on `/resources/glossary` with crawler-visible, local React content while preserving the published English glossary, search, category filters, A-Z index, links to every published article and the shared public shell.

## Content source

- Read-only production feed `439083905811`, re-audited 2026-09-02.
- Render all 101 published entries, including source duplicates, rather than the first 36-item Tilda slice.
- Preserve all 101 production `/tpost/...` paths. The duplicate `Brix` titles are separate articles and must not share a route key.
- Keep titles and definitions verbatim apart from removing HTML-only line-break markup.
- `Matcha` (`tfm5mybkl1`) is empty in production. Keep it visible and routable, label the detail state as an unavailable source article, and do not invent copy.

## Structure

- Shared `SiteHeader` and `SiteFooter` remain unchanged.
- Editorial hero with H1 and glossary count.
- Search field, three category filters plus All Terms, and A-Z controls.
- Responsive two-column card grid with semantic links, headings and descriptions.
- The whole card is a real `Link`, with the production article path as its `href`.
- Empty state communicates the active filter result.
- No Glossary Tilda runtime is mounted. The native page and its locally imported content continue working without the production feed.

## Visual system

- Light THE BASE paper surface, black ink, thin grey rules, Exo 2 typography and restrained red accent.
- Wide view uses a two-column definition grid; mobile is one column.
- Filter rows scroll horizontally on narrow screens without causing document overflow.
- Inputs and buttons expose hover, active and `:focus-visible` states.

## Behaviour contract

- Search matches title, excerpt, category and full local article text case-insensitively.
- Category and A-Z filters compose with search.
- All letters remain visible, matching production; unavailable letters are disabled.
- Initial server HTML contains every term and definition. JavaScript enhances filtering but never controls whether content exists.
- No iframe, remote Tilda feed call, or domain-error fallback.
- Hover, focus and arrow motion enhance clickability; the link remains obvious and usable without hover on touch screens.
- Every filtered card retains its unique production URL.

