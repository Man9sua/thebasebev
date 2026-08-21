# Contributing to THE BASE

## Local setup

```bash
git clone https://github.com/Man9sua/thebasebev.git
cd thebasebev
npm ci
copy .env.example .env.local
npm run dev
```

On macOS/Linux use `cp` instead of `copy`. Empty integration variables are valid for UI development; `/api/leads` will return an intentional 503 until owned credentials are supplied outside Git.

## Branches and reviews

```text
main
↑ reviewed release PR
develop
↑ feature/fix/migration PR
feature/*, fix/*, migration/*
```

Create a focused branch from current `develop`. Keep commits reviewable and avoid unrelated formatting/refactors. Never force-push `main` or `develop`. A release PR promotes a tested `develop` state to `main`.

Suggested commit prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `test:`.

## GitHub repository settings

The workflow file is version-controlled, but branch protection is a GitHub repository setting and must be confirmed by an administrator. `HUMAN APPROVAL REQUIRED`:

- protect `main` against deletion and force-push;
- require a pull request before merging to `main`;
- require the `verify` CI job to pass;
- require at least one approval when a second reviewer is available;
- dismiss stale approvals after material changes;
- allow emergency bypass only for named repository owners and record its use;
- keep automatic production deployment disabled during migration.

Apply a lighter equivalent to `develop` if direct integration pushes should also be prevented. Do not claim branch protection is active until GitHub's Rules/Branches page confirms it.

## Required local checks

```bash
npm run typecheck
npm run lint
npm run build
npm run check:assets
npm run smoke:http -- http://127.0.0.1:3000
```

For route, metadata, form, cart, or deployment work also run the relevant remote/browser audits documented in `README.md` and `AGENTS.md`. Pull requests run lightweight CI but do not deploy automatically.

## Environment and secrets

- Copy variable names from `.env.example`; never commit values.
- Never put credentials in source, issue text, screenshots, URLs, or test fixtures.
- Use Cloudflare environment secrets only for approved preview/production integration tests.
- Do not enable all analytics IDs found in the export.

## Migration guardrails

- Preserve current URLs and SEO metadata.
- Preserve first-touch UTM attribution, including `utm_source=chatgpt.com`.
- Do not redesign during parity work.
- Do not modify GoDaddy, production DNS, Tilda, Search Console, or attach the custom domain.
- Staging and production-preview must remain noindex; the eventual real production hostname must be indexable.

Read `PROJECT_CONTEXT.md`, `CLOUDFLARE_MIGRATION.md`, and `PRODUCTION_CUTOVER.md` before infrastructure changes.
