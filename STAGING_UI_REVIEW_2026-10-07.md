# UI follow-up — 7 October 2026

Branch: `possible_change`. Deployment target: THE BASE staging in `mansua`.

## Implemented changes

1. Contacts keeps the department and full email address visible on mobile. The
   addresses remain functional `mailto:` links rather than shortened tiles.
2. The header's Find your distributor shortcut was replaced by the country
   selector. It lists the 17 supplied markets, supports keyboard navigation and
   retains campaign parameters. UAE remains the current English site; other
   markets open their existing distributor panel rather than invented localized
   pages. This follows the owner's latest instruction, superseding the earlier
   request to remove the selector.
3. Link/button/summary tap highlights are transparent, including the logo and
   product questions. Native product FAQs now animate both opening and closing,
   reverse safely during repeated clicks and respect reduced motion. Answers and
   their FAQ schema remain available in the server-rendered document.
4. Typography uses the homepage's self-hosted Exo 2 family across native and
   retained pages, forms and controls. Shared roles define display headings 900,
   smaller headings 700, body 400 and CTA/control labels 600. Responsive sizes and
   brand artwork remain component-specific. `TYPOGRAPHY_CONTRACT.md` and
   `AGENTS.md` record the rule for future edits.
5. The footer copyright/location separator dot was removed.
6. The sitemap labels are exactly `Bisuness lines` and `Bar ingredients`, as
   requested. Market badges display `/ae/`, `/qa/` and the other country paths;
   their links still lead to the existing market finder destinations.
7. All supplied photos were reviewed. Eight matching Milkshake menu drinks were
   extracted from source images 092/093/094/095/096/088/090/091, in that order.
   Only 16 optimized WebP files at 320/640 px were added to public assets (about
   259 KiB total). Existing Frappe photos and the matching partner meeting-room
   photograph were retained. Purée/Sauce bottles, Add-ons/Electrolyte packs and
   At Home Chocolate Mocha were not present in the source folder; their honest
   placeholders remain.
8. Finder's Request samples button has an explicit transparent resting
   background and light text/border on the dark card, with a contrasting hover
   state. Its existing sample form remains connected to `/api/leads`.
9. Decorative overlines and visible breadcrumb rows above page/section headings
   were removed. Article metadata and return links follow the heading instead.
   Functional field labels, product information and counters remain; SEO
   BreadcrumbList schema and production canonicals are preserved.

## Source handling

`addphotos/` and `whatsappchat/` are ignored and excluded from Git. Only the
required public image derivatives are staged. Existing unrelated local edits
and browser artifacts are excluded.

## Verification and publication

Local TypeScript, ESLint, lead contract (47), Stripe tests (21), structured-data
tests (2), consent tests (4), Next.js build and OpenNext build passed. The build
generated 186 pages and retained all 917 Static Assets document variants. All
563 statically referenced assets exist; the eight new Milkshake gallery images
also decoded successfully in browser checks.

Local browser smoke passed desktop/mobile and 13 viewport sizes. SEO UI smoke
passed 259 checks, including full galleries and FAQ closing/style cleanup.
Focused navigation/contact/contrast checks passed 16 checks, including full
email addresses at 320/390 px and Request samples resting contrast of 17.84:1.
Timed FAQ verification confirmed opening, closing, rapid reversal, keyboard
activation and reduced motion; tap highlights on the logo/summary are transparent.

Font QA confirmed the self-hosted family and native/modal role samples. Two
larger QA capture scripts aborted because of their selectors; they are not
counted as full successful matrices. The final staging check must also confirm
the last Contact/Resources/404 weight corrections and navigation from legacy.

`npm audit` still reports 15 existing vulnerabilities (1 critical, 12 high,
2 moderate); dependencies and the lockfile were not changed by this task.

Publication and remote audit results are recorded after deployment. Browser
form checks mock lead delivery; they do not create real leads or orders. Browser
emulation does not prove behavior on a physical iPhone's Safari.
