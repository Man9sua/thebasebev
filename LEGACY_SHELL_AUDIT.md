# Legacy Tilda shell — record-level audit

Evidence for what the shared public-page shell actually contains, and what the
unified header/footer work is allowed to delete. Measured against
`tilda_export/project12027355/files/*body.html`, which is the build-time input.

## Scope

37 of the 39 exported body files carry the full site chrome:
`<!--header--> <header id="t-header">…</header>` and the matching footer,
together about **293 KB per page** — on `/contacts` that is 91% of the document,
against 28 KB of actual page content.

The two exceptions are `page62362389body.html` and `page62447481body.html`.
Those files *are* the exported header and footer records, reachable only through
their `/page*.html` aliases. They keep rendering exactly as exported and are
excluded from the shared shell flow (`SitePage.usesSharedShell === false`).

## Why the shell could not simply be cut out

Deleting the two elements wholesale — the obvious reading of "remove the old
header and footer" — would also delete, from every public page:

- **all JSON-LD** (`rec2483211811`): WebSite, FAQPage, OfferCatalog,
  ContactPoint, Place, PostalAddress, ImageObject;
- **the Tilda cart** (`rec2989879303`, form name `Cart`). `SiteHeader` calls
  `tcart__openCart()` — this markup *is* the cart on every parity route;
- **four of the nine owned lead forms** (`rec861442702`, `rec1855213141`,
  `rec1855223381`, `rec1855232921`), whose record ids match
  `OWNED_TILDA_FORM_IDS` in `LeadAttributionBridge`, plus their popup triggers;
- **the cookie-consent banner** (`rec913700125`).

So removal is per record.

## Classification

`A` removable · `B` rewrite in React · `C` business function, keep isolated ·
`D` external integration

### Header container

| Record | Size | Role | Class | Status |
| --- | ---: | --- | --- | --- |
| `rec2676415503` | 22 KB | `.tbh-wrap` header, ticker, spacer | B | **removed** — `SiteHeader` |
| `rec1842546651` | 46 KB | old Tilda menu, already `display:none` | A | **removed** |
| `rec913703869` | 3 KB | hidden strapline, already `display:none` | A | **removed** |
| `rec860980632` | 11 KB | old nav column, already `display:none` | A | **removed** |
| `rec2483211811` | 18 KB | JSON-LD + nav links | C | kept |
| `rec2546044801` | 6 KB | T123, no visible text | — | kept, **not yet classified** |
| `rec2503778061` | 9 KB | T123, no visible text | — | kept, **not yet classified** |
| `rec2613656603` | 10 KB | T123, no visible text | — | kept, **not yet classified** |
| `rec2989879303` | 11 KB | cart form | C | kept |

The four `A`/`B` records above were already hidden by the client's own inline
CSS (`html body #rec1842546651, #rec913703869, #rec860980632, #tbm {display:none}`).
They were never visible — but they still shipped a second copy of the site
navigation to crawlers on every page. Removing them removes those duplicate
internal links.

### Footer container

| Record | Size | Role | Class | Status |
| --- | ---: | --- | --- | --- |
| `rec913700125` | 7 KB | cookie-consent banner | C | kept |
| `rec2503542591` | 6 KB | partnership CTA (content) | B | kept — page content, not chrome |
| `rec859870796` | 15 KB | visible footer navigation | B | **removed** — `SiteFooter` |
| `rec861442702` | 31 KB | "Partner with Us" lead form | C | kept |
| `rec1855213141` | 31 KB | "Need custom flavour?" lead form | C | kept |
| `rec1855223381` | 32 KB | "Free Sample" lead form | C | kept |
| `rec1855232921` | 32 KB | "Custom flavor for your brand" lead form | C | kept |
| `rec861565905`, `rec861566567`, `rec861566836`, `rec861567104` | 1 KB each | popup triggers for the four forms | C | kept |

### Runtime dependencies outside the shell

| Dependency | Class | Status |
| --- | --- | --- |
| `/api/tildafeed` catalogue feed | D | already stripped in `site-pages.ts`; visible prices seeded from `catalogPriceFallback` |
| Tilda analytics (`tilda-stat`, GTM/GA/AdSense ids) | D | already stripped by `removeLegacyAnalyticsRuntime` |
| `cdn.tailwindcss.com` | D | already replaced with the local `/css/tbs-tailwind.css` build |
| Tilda cart runtime (`tcart`) | C | kept — no owned replacement exists yet |
| Tilda form script | C | kept, but owned forms are intercepted first by `LeadAttributionBridge` |

## What this change does

`site-pages.ts` drops the five records above at build time and retags
`<header id="t-header">` / `<footer id="t-footer">` to `<div>`, so the page has
exactly one `<header>` and one `<footer>` landmark — the shared ones — while
every id and class the legacy cart script looks up stays intact.

Nothing is hidden after paint: the removed markup is absent from the
server-rendered HTML.

## Not done yet

- The three unclassified `T123` header records still ship on every page.
- Per-page visual work: the retained Tilda content still uses its own colours,
  grid and controls rather than the design tokens.
- No shared `ProductPage` template yet; product routes are still parity
  documents inside the new shell.
