# GlossaryPage

## Purpose

Replace the domain-bound Tilda feed on `/resources/glossary` with crawler-visible, local React content while preserving the published English glossary, search, category filters, A-Z index and the shared public shell.

## Content source

- Read-only production feed `439083905811`, captured 2026-08-26.
- Render all 101 published entries, including source duplicates, rather than the first 36-item Tilda slice.
- Keep titles and definitions verbatim apart from removing HTML-only line-break markup.

## Structure

- Shared `SiteHeader` and `SiteFooter` remain unchanged.
- Editorial hero with H1 and glossary count.
- Search field, three category filters plus All Terms, and A-Z controls.
- Responsive definition grid with semantic article headings and descriptions.
- Empty state communicates the active filter result.
- Existing legacy cart/forms/cookie runtime stays mounted; the three broken glossary records are removed.

## Visual system

- Light THE BASE paper surface, black ink, thin grey rules, Exo 2 typography and restrained red accent.
- Wide view uses a two-column definition grid; mobile is one column.
- Filter rows scroll horizontally on narrow screens without causing document overflow.
- Inputs and buttons expose hover, active and `:focus-visible` states.

## Behaviour contract

- Search matches title and definition case-insensitively.
- Category and A-Z filters compose with search.
- All letters remain visible, matching production; unavailable letters are disabled.
- Initial server HTML contains every term and definition. JavaScript enhances filtering but never controls whether content exists.
- No iframe, remote Tilda feed call, or domain-error fallback.

