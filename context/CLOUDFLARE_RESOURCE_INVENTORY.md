# Cloudflare resource inventory

Read-only inventory captured on 2026-08-21 before target replication. Cloudflare account IDs are resource identifiers, not authentication secrets. No token or secret value is recorded here.

## Account boundary

| Role | Account label | Account ID | Inventory result |
| --- | --- | --- | --- |
| Source / temporary rollback | `indukok667` | `1933de3c9dd1e95bae4ee0b4ad4db08b` | Contains THE BASE legacy previews and unrelated personal projects |
| Target / THE BASE only | `mansua` | `678720af4dded7d23aad4a859b6e5f3a` | Empty before replication; no Workers, zones, custom domains, R2, KV, D1, Queues, Hyperdrive, Vectorize, Workflows, or Durable Objects detected |

Future THE BASE deployment must use `mansua`. The personal source account is not a valid deployment target.

## Confirmed THE BASE resources

| Resource | Type | Source account | Used by THE BASE? | Migrate? | Target name | Dependencies | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `the-base-staging` | Worker | `indukok667` | YES | YES | `the-base-staging` | `ASSETS`, `APP_ENV=staging` | TARGET VERIFIED |
| `the-base-production` | Worker preview | `indukok667` | YES | YES | `the-base-production` | `ASSETS`, `APP_ENV=production` | TARGET VERIFIED |
| Worker Static Assets | Workers Static Assets | `indukok667` | YES | YES, redeploy from repository | Per-Worker upload | `.open-next/assets`; source code and local public assets | TARGET VERIFIED |
| `APP_ENV` | Plain-text Worker variable | `indukok667` | YES | YES, from Wrangler config | Same binding | staging/production environment | CONFIGURED IN REPOSITORY |
| `ASSETS` | Workers Static Assets binding | `indukok667` | YES | YES, from Wrangler config | Same binding | OpenNext build output | CONFIGURED IN REPOSITORY |

No THE BASE R2, KV, D1, Queue, Durable Object, Hyperdrive, Vectorize, AI, Analytics Engine, or service binding appears in either Worker settings or repository configuration. There are no Worker secrets to migrate.

## Source Worker operational inventory

| Capability | `the-base-staging` | `the-base-production` |
| --- | --- | --- |
| Compatibility date | `2026-08-21` | `2026-08-21` |
| Compatibility flags | `nodejs_compat`, `global_fetch_strictly_public` | same |
| Usage model | standard | standard |
| Observability | enabled; logs enabled; traces disabled | same |
| Secrets | none | none |
| Cron schedules | none | none |
| Tail consumers / active tails | none | none |
| `workers.dev` | enabled; previews enabled | enabled; previews enabled |
| Custom domains | none account-wide | none account-wide |
| Current version | `db1bb834-fcba-4f6d-87dc-0dddac490605` | `9b79fc11-4af3-4e15-9625-9f030fc81803` |
| Version/deployment history | six retained versions/deployments | one retained version/deployment |

The source account-level `workers.dev` subdomain is `mnsdemo`. The source account has no Cloudflare zone, so no zone route or custom domain can be a runtime dependency of these Workers.

## DO_NOT_TOUCH

These resources are confirmed personal or unrelated to THE BASE. They must not be copied, renamed, modified, rebound, or deleted.

| Resource | Type | Evidence / owner context | Action |
| --- | --- | --- | --- |
| `hellokz` | Worker | Personal HelloKz project | DO NOT TOUCH |
| `qrmblack-demo` | Worker | Personal QR menu project | DO NOT TOUCH |
| `qrmwarm-demo` | Worker | Personal QR menu project | DO NOT TOUCH |
| `watchjojopobratski` | Worker | Personal Watch JoJo project | DO NOT TOUCH |
| `jjba-media` | R2 bucket | Watch JoJo media | DO NOT TOUCH |
| `qrmblack-menu-media` | R2 bucket | QR menu media | DO NOT TOUCH |
| `qrmblack-menu-media-preview` | R2 bucket | QR menu preview media | DO NOT TOUCH |
| `qrmwarm-menu-media` | R2 bucket | QR menu media | DO NOT TOUCH |
| `qrmwarm-menu-media-preview` | R2 bucket | QR menu preview media | DO NOT TOUCH |
| `qrmwarm-demo-db` | D1 database | QR menu database | DO NOT TOUCH |
| `qrmblack-demo-db` | D1 database | QR menu database | DO NOT TOUCH |
| `watchjojopobratski_WatchPartyRoom` | Durable Object namespace | Bound to Watch JoJo Worker/class | DO NOT TOUCH |

## Account-level services

| Service | Source result | Target result before replication | Decision |
| --- | --- | --- | --- |
| Pages projects | none | no project returned; REST endpoint reports uninitialized/invalid request | DO NOT MIGRATE |
| KV namespaces | none | none | NOT USED |
| Queues | none | none | NOT USED |
| Hyperdrive | none | none | NOT USED |
| Vectorize | none | none | NOT USED |
| Workflows | none | none | NOT USED |
| Worker custom domains | none | none | MUST REMAIN NONE |
| Cloudflare zones | none | none | DOMAIN MIGRATION OUT OF SCOPE |
| Access applications | API returned 403 | API returned 403 | NEEDS HUMAN REVIEW; no Worker/repository dependency found; DO NOT MIGRATE |
| Pipelines | API returned 403 | not required by any binding | NEEDS HUMAN REVIEW; DO NOT MIGRATE |
| Dispatch namespaces / Containers | unavailable or not entitled | not required by any binding | DO NOT MIGRATE |

An unavailable account-wide listing is not evidence of THE BASE ownership. Per the isolation rule, anything not confirmed by Worker settings, repository bindings, documentation, or actual runtime use is excluded from migration.

## Target pre-deployment gate

- Target account name and exact ID confirmed through a separate named Wrangler OAuth profile.
- Target account is empty and Worker names are available.
- Target `workers.dev` subdomain is `mansua`; no production custom domain is attached.
- `wrangler.jsonc` now pins the non-secret target account ID.
- No `routes` or `custom_domains` exist in configuration.
- No source resource will be removed after replication.

## Target post-deployment evidence

| Environment | URL | Version | Deployment | Bindings | Result |
| --- | --- | --- | --- | --- | --- |
| staging | `https://the-base-staging.mansua.workers.dev` | `c8a18cee-bdab-4236-9104-3a1bdfb78071` | `ab1c4e66-2318-42d3-98e8-93513c9bccb2` | `ASSETS`, `APP_ENV=staging` | VERIFIED |
| production preview | `https://the-base-production.mansua.workers.dev` | `b043e4d6-56c4-45d9-9538-79c9f0e8bc16` | `e66beeab-be8b-4716-b2f1-c9b236472879` | `ASSETS`, `APP_ENV=production` | VERIFIED |

Both target Workers match the source compatibility date, flags, usage model, and observability posture. Both have zero secrets, zero cron schedules, `workers.dev` enabled, and no custom domains. The target account still has zero Cloudflare zones.
