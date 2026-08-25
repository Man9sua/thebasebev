# Cloudflare account isolation migration

## Objective

Reproduce only THE BASE developer infrastructure from personal Cloudflare account `indukok667` into isolated THE BASE account `mansua`. This operation explicitly excludes the production domain and all personal Cloudflare projects.

## Status

```text
SOURCE RETAINED
TARGET VERIFIED
PRODUCTION DOMAIN UNCHANGED
```

## Account identities

| Role | Account | Account ID |
| --- | --- | --- |
| Source rollback/reference only | `indukok667` | `1933de3c9dd1e95bae4ee0b4ad4db08b` |
| Target for all future THE BASE deployment | `mansua` | `678720af4dded7d23aad4a859b6e5f3a` |

Wrangler uses separate named OAuth profiles locally. The workspace is bound to profile `mansua`; credentials remain in Wrangler's user-level credential store and are ignored by Git. Repository configuration also pins the target account ID as a non-secret safety rail.

## Migration scope

Only these resources are approved for replication:

- `the-base-staging` Worker;
- `the-base-production` Worker preview;
- their OpenNext Workers Static Assets uploads;
- `ASSETS` and `APP_ENV` bindings;
- equivalent Worker observability settings.

There are no THE BASE secrets, R2 buckets, D1 databases, KV namespaces, Queues, Durable Objects, Hyperdrive, Vectorize, cron triggers, service bindings, or custom domains to migrate. See `CLOUDFLARE_RESOURCE_INVENTORY.md` and `SOURCE_WORKER_CONFIG.md` for evidence.

## Hard exclusions

- Personal Workers, R2, D1, Durable Objects, and all other resources in `indukok667`.
- `thebasebev.com`, `www`, Cloudflare zones, DNS, nameservers, certificates, routes, custom domains, GoDaddy, Search Console, and Tilda.
- Source deletion or renaming.
- Automatic Member invitations. A teammate may be invited manually only to `mansua`.

## Controlled replication sequence

1. Inventory both accounts read-only.
2. Confirm target name and exact account ID through the target OAuth profile.
3. Pin the target account ID in Wrangler configuration; verify that `routes` and custom domains are absent.
4. Build from the Git repository with OpenNext.
5. Register/use the target account's `workers.dev` subdomain only.
6. Deploy `the-base-staging`, then verify before deploying `the-base-production` preview.
7. Re-query target bindings, secrets, triggers, domains, and versions.
8. Run source-versus-target and full production-readiness audits.
9. Keep both source Workers unchanged as rollback/reference.

## Safety checks before every future deploy

```bash
npx wrangler whoami --json
npm run cf:build
npx wrangler deploy --env staging --dry-run
```

The `whoami` result must contain account `mansua` with ID `678720af4dded7d23aad4a859b6e5f3a`. Stop if it lists or selects the source account. Never deploy THE BASE to `indukok667`.

## Domain boundary

Target Workers are preview infrastructure only. `thebasebev.com` and `www.thebasebev.com` must not appear in Worker routes or custom domains. Any future zone/account transfer is a separate procedure requiring DNS review, certificate issuance, and explicit human approval.

## Team access

Invite teammates manually only to Cloudflare account `mansua` and grant the minimum required account roles. Never invite a THE BASE teammate to personal account `indukok667`.

## Final evidence

| Environment | Target URL | Version | Preview policy |
| --- | --- | --- | --- |
| staging | `https://the-base-staging.mansua.workers.dev` | `c8a18cee-bdab-4236-9104-3a1bdfb78071` | `X-Robots-Tag: noindex, nofollow` |
| production preview | `https://the-base-production.mansua.workers.dev` | `b043e4d6-56c4-45d9-9538-79c9f0e8bc16` | `X-Robots-Tag: noindex, nofollow` |

Both URLs return safe `/api/health` JSON, production-rooted canonicals, and crawler-visible content. API inventory confirms no secrets, schedules, custom domains, or zones were added. Source resources remain intact; their deletion is not authorized.

The repository includes `npm run audit:cloudflare-parity` for repeatable semantic comparison of all 39 rendered routes and five redirects between the retained source staging and isolated target staging.

## Target plan compatibility finding

Initial target versions used the standard OpenNext SSG cache path and intermittently returned HTTP 503. A read-only Worker error tail proved the cause: `Worker exceeded CPU time limit`, `outcome=exceededCpu`, at the target account's 10 ms Workers Free limit. No WAF, DNS, binding, or application exception was involved.

The repository now builds a static fast path from the same Next.js prerendered output. It preserves the HTML, canonical metadata, headers, redirects, branded 404, and application assets while avoiding SSR/cache parsing for document requests. Evidence after deployment:

- 50/50 mixed production-preview requests returned 200 with no error-tail events;
- 30/30 staging and 30/30 production-preview mixed-route stability checks returned 200;
- source versus target semantic parity passed for 39 pages and five redirects;
- the full production-readiness orchestrator passed.

Workers Paid remains a future capacity option for heavier dynamic APIs, authenticated Partner Hub, or server-side integrations, but is not required for the current static public preview.
