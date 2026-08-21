# DNS migration preparation

No DNS record was changed while creating this plan. Public DNS lookup is not a substitute for a complete GoDaddy zone export.

## Read-only public snapshot

Observed on 2026-08-21 before any cutover work:

| Type | Name | Value | Priority | Notes |
| --- | --- | --- | ---: | --- |
| A | `@` | `194.48.203.33` | — | Current public website origin; reconfirm at cutover |
| CNAME | `www` | `thebasebev.com` | — | Preserve intended `www` behavior |
| MX | `@` | `mx.zoho.com` | 10 | Preserve exactly |
| MX | `@` | `mx2.zoho.com` | 20 | Preserve exactly |
| MX | `@` | `mx3.zoho.com` | 50 | Preserve exactly |
| TXT | `@` | `v=spf1 include:zohomail.com include:_spf.odoo.com ~all` | — | Email authentication; preserve exactly |
| TXT | `@` | `google-site-verification=kOHmwpsL4yYjpZTSycJWyLdjI1roEnB3JLPp55gJ24g` | — | Ownership verification; preserve exactly |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | — | Preserve exact full record after registrar export |
| NS | `@` | `ns55.domaincontrol.com` | — | Current GoDaddy authoritative server |
| NS | `@` | `ns56.domaincontrol.com` | — | Current GoDaddy authoritative server |

No public AAAA or SRV answer was observed. CAA lookup was not confirmed by the available local resolver. DKIM selectors, service-specific validation records, internal subdomains, and records hidden from common queries can only be proven by a registrar export.

## Mandatory registrar snapshot template

Before changing nameservers, export and independently record every entry:

| Type | Name/host | Value/target | TTL | Priority/weight/port | Proxy after import? | Owner/purpose | Verified |
| --- | --- | --- | ---: | --- | --- | --- | --- |
| A | | | | | | website/service | [ ] |
| AAAA | | | | | | website/service | [ ] |
| CNAME | | | | | | alias/verification | [ ] |
| MX | | | | | DNS only | email | [ ] |
| TXT | | | | | DNS only | SPF/verification | [ ] |
| CAA | | | | | DNS only | certificate policy | [ ] |
| SRV | | | | | DNS only | service discovery | [ ] |

Attach screenshots and the raw CSV/zone export to the private migration record. Record the snapshot timestamp and who reviewed it.

## Email and verification invariants

WEBSITE MIGRATION MUST NOT BREAK EMAIL.

- MX records must be preserved exactly, including priority.
- Preserve the complete SPF string; do not create a second SPF record.
- Export every DKIM selector and value from GoDaddy/Zoho/Odoo before nameserver changes.
- Preserve `_dmarc` exactly unless the email owner separately approves a policy change.
- Keep mail/autodiscover/service CNAME and SRV records DNS-only unless their provider explicitly supports proxying.
- Preserve Google, Microsoft, Meta, Odoo, Zoho, and other ownership verification records.
- Send and receive test mail through every active business mailbox immediately before and after cutover.

## Future import checklist

Every action below is `HUMAN APPROVAL REQUIRED`:

1. Freeze unrelated DNS edits and export the complete GoDaddy zone.
2. Add the domain to Cloudflare without changing registrar nameservers.
3. Compare Cloudflare's scan against the registrar export line by line.
4. Manually add every missing A/AAAA/CNAME/MX/TXT/CAA/SRV record.
5. Keep mail, verification, and non-HTTP services DNS-only.
6. Validate SPF syntax, all DKIM selectors, DMARC, MX priority, and CAA policy.
7. Record the Tilda rollback origin and current website records.
8. Only after two-person review, schedule the nameserver change from `PRODUCTION_CUTOVER.md`.

Do not delete GoDaddy records or the Tilda project during or immediately after nameserver cutover.
