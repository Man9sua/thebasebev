# Analytics audit

Generated: 2026-08-24T12:46:25.253Z

## Export inventory

| Public identifier | Observed role | Export pages | Occurrences | Migration decision |
| --- | --- | ---: | ---: | --- |
| `G-89J9ZDN1B1` | Direct gtag/GA4 candidate | 39/41 | 84 | NEEDS CONFIRMATION |
| `G-VKXMKBRV73` | Legacy analytics.js tracker candidate | 39/41 | 39 | NEEDS CONFIRMATION |
| `GTM-P99PF655` | Custom GTM container candidate | 39/41 | 42 | NEEDS CONFIRMATION |
| `GTM-WPRV8CZ2` | Tilda-managed GTM container candidate | 39/41 | 78 | NEEDS CONFIRMATION |
| `ca-pub-9584440435840838` | Google AdSense publisher ID | 39/41 | 42 | NEEDS CONFIRMATION |
| Meta Pixel | No `fbq`/Facebook runtime found in root page exports | 0/41 | - | Do not invent a Pixel ID |

## Deduplication decision

The export initialized direct gtag, legacy analytics.js, and two GTM containers. Enabling them together can duplicate `page_view` and pollute the existing properties with preview traffic.

The Next compatibility parser removes those legacy runtime blocks. `src/components/analytics/Analytics.tsx` is the single controlled integration boundary:

1. It does nothing on staging or any `workers.dev` hostname.
2. On `thebasebev.com`/`www.thebasebev.com`, a confirmed `NEXT_PUBLIC_GTM_ID` takes precedence.
3. Direct `NEXT_PUBLIC_GA_ID` is used only when GTM is absent.
4. GTM and direct GA are never initialized together by application code.

No new analytics property or ID was created.

## Target verification

- Target: `http://127.0.0.1:3000`
- HTTP status: 200
- Legacy tracker markers in server HTML: none

## Human confirmation required

- Confirm which GTM container is owned and active in current production.
- Confirm whether GA4 page views are emitted inside that container.
- Confirm the authoritative GA4 measurement ID and consent configuration.
- Confirm whether AdSense should remain on the corporate B2B site.
- Compare live DebugView/network events before and after the future cutover.

## Result

- PASS: preview isolation and the controlled deduplication boundary are present.
