# Source Worker configuration

Read-only snapshot of the legacy THE BASE preview Workers in Cloudflare account `indukok667` (`1933de3c9dd1e95bae4ee0b4ad4db08b`) on 2026-08-21. This is a rollback/comparison record, not a deployment target.

## Shared configuration

| Setting | Observed value |
| --- | --- |
| Entry source | OpenNext build, deployed through Wrangler |
| Compatibility date | `2026-08-21` |
| Compatibility flags | `nodejs_compat`, `global_fetch_strictly_public` |
| Usage model | standard |
| Placement | no explicit placement mode |
| Limits | no explicit custom limits |
| Static assets binding | `ASSETS` (`assets`) |
| Environment binding | `APP_ENV` (`plain_text`) |
| Observability | enabled |
| Invocation logs | enabled and persisted; sampling rate 1 |
| Traces | disabled |
| Logpush | disabled |
| Secrets | none |
| Cron triggers | none |
| Tail consumers | none |
| Active tails at inventory time | none |
| `workers.dev` | enabled |
| Version preview URLs | enabled |
| Worker custom domains | none |
| Account zones | none |

## Staging

- Worker: `the-base-staging`
- Source URL: `https://the-base-staging.mnsdemo.workers.dev`
- `APP_ENV`: `staging`
- Current deployment: `11eb4dca-828f-44a8-acdd-bb2ef232672d`
- Current version: `db1bb834-fcba-4f6d-87dc-0dddac490605` (version 6, 100% traffic)
- Total retained deployments/versions: 6
- Tags: `cf:service=the-base-staging`, `cf:environment=staging`

## Production preview

- Worker: `the-base-production`
- Source URL: `https://the-base-production.mnsdemo.workers.dev`
- `APP_ENV`: `production`
- Current deployment: `c9aad26e-09d6-4526-97e6-0d9701b145e9`
- Current version: `9b79fc11-4af3-4e15-9625-9f030fc81803` (version 1, 100% traffic)
- Total retained deployments/versions: 1
- Tags observed: `cf:service=the-base-staging`, `cf:environment=production`

The production tag's service value reflects inherited Wrangler environment metadata in the source. Runtime identity is still the distinct `the-base-production` script.

## Binding migration map

| Binding | Source | Target method | Credentials needed |
| --- | --- | --- | --- |
| `ASSETS` | Per-Worker static asset upload | Rebuild `.open-next/assets` and deploy to target Worker | NO |
| `APP_ENV` staging | Plain text `staging` | `wrangler.jsonc` environment variable | NO |
| `APP_ENV` production | Plain text `production` | `wrangler.jsonc` environment variable | NO |

There is no cross-account storage or service binding to preserve. Source Worker versions themselves will not be moved; target versions are reproduced from the Git repository and OpenNext build.
