# NativeContacts specification

## Overview

- Target: `src/components/contact/ContactPage.tsx`
- Route: `/contacts`.
- Interaction model: static editorial page plus an owned lead form submitted by `LeadAttributionBridge`.

## Structure

1. Shared header.
2. Large light editorial hero with the preserved `Contact Us` H1 and oversized display typography.
3. Contact channels and business hours.
4. Dark conversation section containing the native form.
5. Shared footer.

## Form contract

- Preserve `form860957415` and `Contact Us` so the existing `/api/leads` mapping remains authoritative.
- Fields: name, email, phone, country, company, message and required privacy consent.
- Inputs are ordinary semantic controls with no legacy overlay or absolute-positioned artboard.
- Success and error UI use the bridge's existing `.js-successbox` / `.js-errorbox-all` hooks.
- First-touch attribution, including `utm_source=chatgpt.com`, remains handled centrally.

## Visual contract

- Use THE BASE paper, black, red accent, Exo 2 and the same gutter/heading scale as the homepage.
- Form controls have visible labels, 1 px quiet borders, strong focus state and stable dimensions.
- The dark form section declares `data-surface="dark"` so the shared header transitions with it.

## Responsive behavior

- Desktop: wide two-column editorial hero, then two-column dark contact/form section.
- Tablet/mobile: single column; all inputs remain reachable, fillable and visible without horizontal scrolling.
