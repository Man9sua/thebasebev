# Lead pipeline

How a THE BASE enquiry reaches Odoo, before and after the Next.js migration.

## Current — production Tilda

```text
Tilda form
→ POST https://tilda-odoo.thebasebev.workers.dev
→ Odoo webhook
```

The Worker is a thin converter: it accepts either JSON or `multipart/form-data`,
flattens it, and forwards it as JSON to the Odoo webhook. It always answers
`200 {"status":"ok"}`, including when the Odoo call fails, so Tilda never shows a
delivery error. That Worker is live production infrastructure and is **not**
modified, redeployed, or deleted by this migration.

## Migration — the Next.js clone

```text
Next.js form
→ POST /api/leads            (same-origin, server-side proxy)
→ POST $LEAD_API_URL         (the existing tilda-odoo Worker)
→ Odoo webhook
```

The browser never talks to the Worker, and the Worker's URL never appears in
HTML, JS, or the repository. `/api/leads` is the only client-facing endpoint.

## Future — direct integration

```text
Next.js form
→ POST /api/leads
→ Odoo
```

Deliberately **not** done yet. The working production contract is preserved
first; replacing the Worker hop is a separate refactor once the migration is
stable. Only the upstream call inside `src/app/api/leads/route.ts` changes.

## Field mapping

Odoo parses Tilda's field vocabulary, so every payload is translated back to it
in `src/lib/lead-forms.ts` — one place, not per form.

| Internal (TypeScript) | Sent upstream | Notes |
| --- | --- | --- |
| `name` | `name` / `Name` | capitalised for `order`, the cart-derived form |
| `email` | `email` / `Email` | same rule |
| `phone` | `Phone` | Tilda assembles this from its phone-mask parts |
| `message` | `text` / `Comments` | `Comments` for `order` |
| `company` | `company` | |
| `country` | `country` | ISO code from the phone-mask selector |
| `formName` | `tildaspec-formname`, `formname` | what Odoo routes on |
| `formType` | `formtype` | new, allowlisted internally |
| `landingPage` | `landing_page` | first touch |
| `submissionPage` | `current_page` | |
| `referrer` | `referrer` | |
| `utm_*` | `utm_*` | unchanged, all five keys |
| `consent` | `consent` | `yes` / `no`, omitted when unknown |
| `order` | `order_json` | JSON string, matching the Tilda order form |

Casing is not cosmetic here: the lowercase set comes from the audited
`form860957415` ("Contact Us") markup, the capitalised set from the cart and
order forms. Sending the wrong one drops values silently in Odoo.

## Form registry

| Form | Type | Tilda id | Route(s) |
| --- | --- | --- | --- |
| Contact Us | `contact` | `form860957415` | `/contacts` |
| Partner with Us | `partner` | `form861442702` | popup, most pages |
| Free Sample | `sample` | `form1855223381`, `form861448872` | popup |
| Custom flavour | `custom-flavour` | `form1855213141`, `form861445930` | popup |
| Custom flavor for your brand | `custom-flavour` | `form1855232921`, `form861451973` | popup |
| Join Our Team | `careers` | `form909008440` | `/about-us` |
| Place order | `order` | `form2480420851` | `/page154766476.html` |

Carts (`form2989879303`, `form900152458`) are **not** lead forms. They carry
`data-formactiontype="2"` and a payment step, and continue through the legacy
Tilda pipeline untouched.

> **Where the markup lives.** Only `form860957415` appears as real `<form>`
> markup in the Tilda export. The Zero Block popups export their artboard and
> copy but declare their form as `data-elem-type='form'` with no fields; those
> are built in the browser by `tilda-zero-forms-1.0.min.js`. They do render and
> submit correctly on the clone — verified in-browser: all four popups mount with
> `name`, `email`, `Phone`, a consent checkbox (named
> `Политика конфиденциальности`), and `form-spec-comments`.
>
> Two consequences. Grepping the export for a form will not find these — read the
> rendered DOM instead. And the honeypot has to be attached from a
> `MutationObserver`, because the forms do not exist at hydration time.
>
> When the redesign replaces these popups with real React forms, they post to
> `/api/leads` with the types above and need no further mapping work.

## Claiming the submit

`LeadAttributionBridge` intercepts submissions at **window capture**, on both
`click` and `submit`.

Listening for `submit` alone is not enough: Tilda's `tilda-forms-1.0.min.js`
calls `preventDefault()` on the submit button's click, so on a page where that
script has finished binding no `submit` event is ever dispatched — the form
silently does nothing. Claiming the click in the capture phase runs ahead of
Tilda's element and document handlers. The `submit` listener stays for keyboard
submits and for forms the Tilda script does not drive.

Ownership is decided by `isOwnedTildaLeadForm` against the audited allowlist.
Cart forms are deliberately excluded and keep their legacy payment flow.

## Attribution

First touch is captured on the first page of a session and kept in
`sessionStorage` under `thebase:first-touch-attribution:v1`. A visitor who lands
on `/matcha?utm_source=chatgpt.com`, browses, and submits from `/contacts` still
delivers `utm_source=chatgpt.com` plus the original `landing_page`.

`utm_source=chatgpt.com` is a live B2B referral source. Losing it is a business
regression, and `npm run audit:leads` asserts it end to end.

## Error handling

Unlike the old Worker, `/api/leads` never reports a success it did not achieve.

| Condition | Status | `error` |
| --- | --- | --- |
| Non-POST | 405 | `method_not_allowed` |
| Body over 64 KB | 413 | `payload_too_large` |
| Bad JSON, failed validation, form type not allowlisted | 400 | `invalid_payload` |
| Rate limited | 429 | `rate_limited` (+ `Retry-After`) |
| `LEAD_API_URL` missing or unusable | 503 | `lead_backend_unavailable` |
| Upstream answered non-2xx | 502 | `lead_delivery_failed` |
| Upstream timed out (10 s) | 504 | `lead_delivery_timeout` |
| Delivered | 200 | — `{"ok":true}` |
| Honeypot tripped | 202 | — `{"ok":true}`, not forwarded |

Responses carry a `requestId` and a generic user-facing `message`. Upstream
status codes, the Worker URL, and Odoo are never exposed to the client.

## Rate limiting

`src/lib/rate-limit.ts` is a best-effort in-process limiter: 5 posts per minute
per client IP. On Cloudflare each isolate keeps its own counters, so this
absorbs stuck retry loops rather than guaranteeing a global limit.

The real rule still needs configuring in Cloudflare:

```text
Security → WAF → Rate limiting rules
expression:      (http.request.uri.path eq "/api/leads" and http.request.method eq "POST")
characteristics: ip.src
rate:            5 requests / 60 seconds
action:          managed challenge
```

## Logging

One structured line per submission: timestamp, request id, form type, route,
outcome, upstream status, duration. Names, emails, phone numbers, message
bodies, the upstream URL, and secrets are never logged.

## Configuration

`LEAD_API_URL` is server-side only — a `NEXT_PUBLIC_` prefix would publish the
pipeline to every visitor. Set it as a Cloudflare environment variable/secret
per environment; never commit the value.

`LEAD_API_KEY` is optional. The current Worker accepts unauthenticated posts, so
it stays empty until an authenticated upstream replaces it.

## Tests

```bash
npm run audit:leads
```

Boots the app against a local mock upstream and checks validation, the API
contract, attribution, legacy field mapping, upstream failure handling, spam
protection, and that no upstream URL leaks into HTML or the repository. It never
contacts the real Worker or Odoo.

```bash
LEAD_LIVE_TEST=1 LEAD_LIVE_TEST_EMAIL=<team mailbox> \
  npm run test:lead-live -- https://the-base-staging.mnsdemo.workers.dev
```

Sends exactly one real lead through the full pipeline. Opt-in, refuses to run in
CI, and refuses to target the production domain. A human then confirms the record
in Odoo.

## Telegram

Tilda delivers leads to Telegram separately from the Odoo webhook. The Next.js
pipeline does not reproduce that. See `TELEGRAM_MIGRATION.md`.
