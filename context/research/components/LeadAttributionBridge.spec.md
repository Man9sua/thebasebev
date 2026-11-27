# Lead attribution bridge

Targets: `src/components/forms/LeadAttributionBridge.tsx`, `src/lib/leads.ts`, `src/app/api/leads/route.ts`

## Payload

The typed payload supports:

- name, email, phone, country, and message;
- form name and consent state;
- landing page and submission page;
- referrer;
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `utm_term`;
- optional order/cart context;
- client timestamp.

## Behavior

- Capture first-touch landing, referrer, and UTM values for the browser session, including `utm_source=chatgpt.com`.
- Map audited legacy form fields at the integration boundary instead of spreading mock logic across form markup.
- Post same-origin to `/api/leads`.
- The API validates the payload and forwards it to `LEAD_API_URL` with server-only `LEAD_API_KEY` when configured.
- If no lead backend is configured, return an explicit 503 response and never show a fake success state.
- Keep Odoo as a future adapter behind the same typed layer.

## Integration blocker

Public Tilda receiver hashes do not reveal the real recipient configuration. Credentials or an owned lead endpoint are required before staging submissions can be considered delivered.
