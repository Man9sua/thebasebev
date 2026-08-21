# SEO runtime

Targets: `src/lib/site-pages.ts`, Next metadata APIs, `src/app/robots.ts`, and `src/app/sitemap.ts`

## Contract

- Generate static `lang="en"`, title, description, canonical, robots, Open Graph, verification tags, and source JSON-LD from audited export data.
- Keep static canonical URLs without trailing slashes, matching the exported `<head>` and sitemap. The original client-side trailing-slash rewrite is documented as a defect and is not reproduced.
- Include exactly the 29 canonical/indexable sitemap pages from the audited export.
- Keep legal, thank-you, retail, members, and branded not-found pages out of the public sitemap with their audited robots state.
- Serve an indexable `robots.txt` that permits general Search and AI search crawlers and references only the sitemap that exists.
- Preserve the five audited legacy redirect rules.
- Do not depend on post-hydration JavaScript for crawl-critical metadata.
