# GlossaryArticlePage

## Purpose

Render every published production Glossary article from local, statically generated data while preserving its existing `/tpost/...` URL, title, description, canonical and complete body text.

## Audited source contract

- Production list: `https://thebasebev.com/resources/glossary`.
- Feed: `439083905811`.
- Re-audited 2026-09-02: 101 feed entries, 101 unique production URLs, 101 direct HTTP 200 responses, 101 unique canonicals and no production `noindex` entry.
- Production bodies contain paragraphs separated by redactor line breaks. Across the set there are no article images, headings, lists, tables or quotes; ten bodies contain links.
- One published route, `/tpost/tfm5mybkl1-matcha`, has no description or article body in production. It remains a 200 detail route with an explicit source-content-unavailable state.

## Data and routing

- `src/data/glossary-content.json` is the build-time source of truth. Runtime rendering never fetches Tilda or `thebasebev.com`.
- Each entry carries a stable Tilda UID, path, title, category, excerpt, published date, paragraph/inline-link body, normalized body text and audited SEO fields.
- The existing optional catch-all route statically generates every article path. `dynamicParams = false` keeps unknown `/tpost/...` routes at 404.
- Canonicals always use `https://thebasebev.com` and the exact audited production path.

## Page structure

- Existing shared `SiteHeader` and `SiteFooter`, unchanged.
- Breadcrumb and a real `Back to Glossary` link.
- Category/date metadata, one H1, excerpt and the complete production article body.
- A restrained related-terms area links to up to three local entries in the same category; it never replaces or rewrites source content.

## Visual and responsive contract

- Use the current light THE BASE paper/ink design rather than the legacy black Tilda popup.
- Wide metadata may use the main site container, but reading copy is constrained to approximately 48rem.
- At 320px and above, H1, paragraphs and links wrap without document overflow; tap targets are at least 44px where applicable.
- Focus is visible, semantic headings remain ordered and the article remains fully readable with JavaScript disabled.

## SEO and parity contract

- Title, meta description (when production has one), canonical and Open Graph title/description come from the audited production detail page.
- Every indexable article path is included in `/sitemap.xml` using the production origin.
- Staging transport remains `noindex, nofollow`; no page-level `noindex` is hardcoded.
- The Glossary audit fails for duplicate UIDs/paths, missing title/path/excerpt, unexpected empty bodies, source text hash mismatch or a broken target route.
