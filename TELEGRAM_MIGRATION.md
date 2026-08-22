# Telegram lead notifications — migration status

**Status: PENDING CONFIRMATION. Not reproduced in the Next.js pipeline.**

## Current behaviour

Tilda sends leads to Telegram as a **separate delivery**, independent of the
Odoo webhook. A Tilda form fans out to every receiver listed in its
`formservices[]` hidden inputs; the Cloudflare Worker that feeds Odoo is only
one of them.

The audited "Contact Us" form (`form860957415`, `/contacts`) carries eight
`formservices[]` receivers. The cart forms carry two. Those values are opaque
Tilda service ids — they identify integrations but do not reveal which is
Telegram, email, Odoo, or anything else. Which receiver is the Telegram one can
only be read from the Tilda project settings.

## What the new pipeline does

```text
Next.js form → /api/leads → tilda-odoo Worker → Odoo
```

That is the whole path. There is no Telegram step. A lead submitted on the
Next.js clone reaches Odoo and **does not** reach Telegram.

## Why it was not reproduced

No Telegram credentials or configuration exist anywhere in this repository. The
only matches for "telegram" are inside vendored Tilda libraries
(`public/js/tilda-forms-1.0.min.js` and friends), which support the integration
generically for any Tilda project — they contain no bot token, no chat id, and
nothing specific to THE BASE.

Inventing a bot token, guessing a chat id, or wiring a second delivery on
assumption would create an untested notification path for real B2B leads. That
is not a decision to make silently.

## Decision needed

Someone with access to the Tilda project settings and the Telegram workspace has
to answer:

1. Must Telegram notification survive the migration, or was it a Tilda-era
   convenience that Odoo now replaces?
2. If it must survive — which Telegram destination (bot token + chat id), and
   should the notification carry the full lead or only a "new lead" ping?
3. Should it fan out from `/api/leads` alongside the Odoo call, or be added to
   the existing Worker?

## If the answer is "keep it"

The natural place is a second, non-blocking delivery inside
`src/app/api/leads/route.ts`, after the Odoo forward succeeds:

- credentials as server-side environment variables (`TELEGRAM_BOT_TOKEN`,
  `TELEGRAM_CHAT_ID`), never `NEXT_PUBLIC_`, never committed;
- failure to notify must **not** turn a delivered lead into a user-facing error —
  Odoo delivery stays the source of truth for the response;
- its own timeout, and PII kept out of logs, matching the Odoo path;
- coverage added to `npm run audit:leads` against a mock.

Until that decision is made, production Tilda keeps sending Telegram
notifications exactly as it does today. Nothing about the current behaviour has
been changed or disabled.
