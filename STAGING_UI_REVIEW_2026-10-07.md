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
10. Following the owner's additional message, the hamburger menu's `UAE EN`
    chip is replaced by a working `Find your distributor` button. The header
    retains the restored country selector.

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
counted as full successful matrices. Six successful staging scenarios confirmed
the last Contact/Resources/404 weight corrections and navigation from legacy.

`npm audit` still reports 15 existing vulnerabilities (1 critical, 12 high,
2 moderate); dependencies and the lockfile were not changed by this task.

## First staging verification

Code `17bf8d5` was deployed as version
`a5c23d78-5b00-4831-80ba-e1c8ec4de0cb`. HTTP (49 routes, 257 redirects), crawlers
(9 user agents × 13 pages and 3 assets), route/indexability (188 routes,
172 sitemap URLs) and SEO parity (172 canonicals, zero critical failures) passed.
Six computed-font scenarios confirmed the final Contact/Resources/404 roles,
the sample modal and actual navigation from a retained recipe page to Home.

The first commerce navigation aborted; its targeted rerun passed all 22 product
categories without submitting an order. Initial UI runs recorded a Contacts
failure-message timeout and an early Private Label format selection mismatch.
Three fresh mocked Contacts runs passed; the original timeout was not reproduced.
Smoke scripts now wait for the existing lead bridge readiness signal before
interacting with the forms, and wait for the selected format to reach the brief.
The SEO UI rerun passed 287 checks. These test changes do not alter form delivery.

Comparison with the older `mnsdemo` rollback/reference remains failed because of
existing H1/content/JSON-LD differences; it reported no status/canonical/redirect
mismatch. That reference Worker was not changed.

The menu follow-up was published and passed transport/browser verification.
Browser form checks mock lead delivery; they do not create real
leads or orders. Browser emulation does not prove behavior on physical iPhone
Safari. The retained recipe page exposes Next CSS chunks rather than a separate
`custom.css` link; its navigation test verifies the actual font result, without
claiming to exercise a separately loaded legacy stylesheet.

The code branch is pushed. PR creation through browser automation failed with
a Windows sandbox ACL error; the earlier credential-based API route was also
rejected by automatic approval review. No credential extraction was retried.
Ready PR link: https://github.com/Man9sua/thebasebev/compare/develop...possible_change?expand=1 .

## Final staging publication

Runtime code `5a521bb` was deployed successfully to
https://the-base-staging.mansua.workers.dev as version
`117b00d1-af0d-4937-b7f3-492514db4f99`. Wrangler selected `mansua`, account
`678720af4dded7d23aad4a859b6e5f3a`, before deployment. This release was deployed
only to staging.

The final build passed and retained 186 generated pages and 917 Static Assets
document variants. TypeScript, lint (without warnings), lead contract (47),
Stripe tests (21) and referenced assets (563) were rechecked successfully against
the final code. Required post-deploy HTTP, browser and crawler checks all passed.
Browser smoke specifically confirmed the restored hamburger Finder shortcut,
country selection, UTM retention, honest mocked delivery errors, 13 viewport
sizes, reduced motion, no-JS rendering and clean hydration.

Staging's transport headers remain `noindex, nofollow`; canonicals still point to
`https://thebasebev.com`. Final route/indexability checks passed for 188 routes,
257 redirects and 172 sitemap URLs. Final SEO parity passed for 172 canonical
pages with zero critical failures, 146 declared changes and 175 nonblocking
link/alt observations. Existing dependency vulnerabilities and the
older reference comparison failure described above remain recorded failures.
