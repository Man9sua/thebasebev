# PublicShell component specification

## Scope

Canonical `SiteHeader` and `SiteFooter` shared by the React homepage and every
public legacy route.

## Header contract

- Exactly one header landmark per public route.
- Logo, Shop/Catalog, company links, search, region, cart and contact actions.
- One responsive drawer; no duplicated page-level header markup.
- No Account, Cabinet, `/cabinet` link or account icon in public UI.
- Overlay cleanup always restores focus and body overflow.

## Footer contract

- Exactly one footer landmark per public route.
- Same columns, social links, divider, copyright, Terms/Privacy and BASE
  wordmark as the homepage.
- Responsive layout is reflowed, not transform-scaled.
- No document overflow or arbitrary clipping of the wordmark.

## Failure fallback

The header links and footer content remain visible and usable without client
JavaScript. Optional overlays do not affect base navigation.
