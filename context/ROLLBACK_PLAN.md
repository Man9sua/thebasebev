# Production rollback plan

This runbook is for a future approved cutover. Nothing here authorizes a current DNS, custom-domain, Tilda, or Search Console change.

## Preconditions

- Keep the Tilda project active and unchanged throughout cutover and observation.
- Export and verify complete GoDaddy DNS, including email and verification records.
- Record the current Tilda website origin/records immediately before cutover; do not rely on an old IP snapshot.
- Save the last known-good Worker version ID and production-preview test report.
- Keep the legacy THE BASE preview Workers in source account `indukok667` unchanged as temporary engineering reference; never modify unrelated personal resources there.
- Establish named decision owner, Cloudflare operator, DNS operator, lead-flow owner, and communications contact.

## Rollback triggers

- sustained site unavailability or 5xx;
- key URLs unexpectedly return 404/redirect loops;
- forms cannot deliver qualified leads;
- analytics or attribution is materially broken;
- email/DNS verification fails after a nameserver change;
- Worker/config deployment cannot be restored promptly;
- search crawlers are blocked or production returns `noindex`.

## Fast application rollback

`HUMAN APPROVAL REQUIRED`

1. Stop further releases and preserve logs/evidence.
2. Restore the last known-good Worker version using Cloudflare version/rollback controls.
3. Purge only affected cached HTML/assets if necessary.
4. Re-run `/api/health`, HTTP, crawler, form, analytics, and key-route checks.

Application rollback must operate in isolated account `mansua`. The retained source preview is evidence/reference, not authorization to deploy future THE BASE releases into the personal account.

## Traffic rollback to Tilda

`HUMAN APPROVAL REQUIRED`

1. Keep Cloudflare authoritative DNS if the zone itself is healthy; this is usually faster than another nameserver propagation event.
2. Disable/detach the Worker custom-domain/route for apex and `www` only after verifying the exact targets.
3. Restore the freshly captured Tilda apex/`www` records in Cloudflare DNS.
4. Do not modify MX, SPF, DKIM, DMARC, mail/service records, or verification records.
5. Confirm Tilda HTTP 200, canonical behavior, redirects, forms, analytics, and mobile navigation.
6. Monitor until DNS/cache convergence is proven.

If the Cloudflare zone/nameserver layer itself is unusable, restoring the prior GoDaddy nameservers is an emergency fallback and may propagate slowly. It requires the verified registrar snapshot and explicit approval; never improvise it from this document.

## Incident verification matrix

| Failure | Immediate evidence | Recovery proof |
| --- | --- | --- |
| Site unavailable | Worker logs, `/api/health`, apex/`www` HTTP | 200 on key routes in multiple networks |
| Forms fail | browser response, receiver logs, payload ID | successful test lead with UTM/referrer |
| SEO 404/noindex | route audit, headers, Search Console URL test | all canonical routes/redirects correct |
| Worker fails | version/deployment logs | known-good version active and smoke passing |
| DNS/email breaks | authoritative lookup, MX/TXT/DKIM checks | send/receive plus exact DNS comparison |

## After rollback

- Keep evidence and timestamps.
- Do not delete the failed Worker or Tilda project.
- Explain the root cause and corrective test before scheduling a new cutover.
- Re-run the full production-readiness audit on production preview.
