# Автодеплой thebasebev.com через GitHub Actions

## Как это устроено

1. `main` — боевая ветка. Каждый push в `main` запускает CI (`.github/workflows/ci.yml`). Если все проверки зелёные, `.github/workflows/deploy.yml` выполняет `npm run deploy:production` и выкатывает воркер `the-base-production`, который обслуживает https://thebasebev.com.
2. `develop` — тестовая ветка. Push в `develop` проходит тот же CI и выкатывает только `the-base-staging` (https://the-base-staging.mansua.workers.dev, всегда noindex).
3. После деплоя workflow прогоняет `smoke:http` и `audit:crawlers` по адресу, на который выкатил.
4. Деплой меняет только код воркера. Маршрут thebasebev.com в панели Cloudflare, DNS, GoDaddy и Tilda не трогаются: в `wrangler.jsonc` нет routes и custom domains.
5. Секреты воркера (Stripe, Odoo и другие), заданные через `wrangler secret put`, при деплое сохраняются.
6. Ручной workflow `deploy-cloudflare.yml` удалён, чтобы на прод был один путь. Повторить деплой можно кнопкой Run workflow у Deploy, но только для `main` или `develop`.
7. Статьи блога (ветки `content/blog-*`) идут PR в `main` и после merge выходят на сайт сами.

## Что сделать один раз (Man9sua)

Делать по порядку: если сначала влить PR в `main`, первый деплой упадёт без секретов.

### 1. API токен Cloudflare

1. Cloudflare, аккаунт `mansua` (ID `678720af4dded7d23aad4a859b6e5f3a`), My Profile → API Tokens → Create Token.
2. Шаблон Edit Cloudflare Workers.
3. Добавить право Account → D1 → Edit: у воркеров есть привязка D1 `SHOP_ORDERS`.
4. Account Resources: только `mansua`. Zone Resources: только `thebasebev.com`.
5. Скопировать токен. Он показывается один раз.

### 2. Окружения и секреты в GitHub

1. Repo → Settings → Environments → New environment `production`.
   1. Deployment branches and tags: Selected branches, только `main`.
   2. По желанию Required reviewers: Man9sua и/или thebasebev-creator. Тогда каждый деплой на прод ждёт кнопки Approve в Actions.
2. New environment `staging`, Deployment branches: только `develop`.
3. Repo → Settings → Secrets and variables → Actions → New repository secret:
   1. `CLOUDFLARE_API_TOKEN`: токен из шага 1.
   2. `CLOUDFLARE_ACCOUNT_ID`: `678720af4dded7d23aad4a859b6e5f3a`.
   Если раньше был задан variable `CLOUDFLARE_ACCOUNT_ID`, он больше не нужен: workflow берёт значение из secrets. Workflow откажется деплоить, если ID не совпадает с аккаунтом `mansua`.

### 3. Защита веток

Settings → Branches (или Rules) → правило для `main` и такое же для `develop`:

1. Require a pull request before merging.
2. Require status checks to pass: `verify`. Это джоб из CI, его имя появится после первого прогона PR.
3. Запретить force push и удаление.

### 4. Привести ветки к продакшену

1. Влить PR в `main`: `migration/production-main-20261122` → `main`. Это fast-forward, сейчас `main` отстаёт с августа. Сразу после merge стартует первый автодеплой.
2. Влить такой же PR в `develop`: `develop` тоже станет равен продакшену, и staging начнёт деплоиться из него.
3. Закрыть PR #25 (его содержимое уже в #27) и #19, #20 (ветка `feature/stripe-live-20261104` теперь в `main`). Старые PR в `develop` (#2, #3, #13 … #18, #21 … #24) пересобрать от нового `develop` или закрыть.
4. Ветку `feature/stripe-live-20261104` больше не использовать для деплоя.

### 5. Проверить первый деплой

1. Actions → Deploy → последний запуск: `verify` зелёный, `deploy` зелёный, шаг Verify the deployment зелёный.
2. Cloudflare → Workers & Pages → `the-base-production` → Settings → Domains & Routes: маршрут `thebasebev.com` на месте.
3. Открыть https://thebasebev.com/ae/tpost/tbc1dc2c25-gulf-winter-menu-hot-drinks-that-sell. Должно быть 200, а не 404.

## Откат

1. Быстро: Cloudflare → `the-base-production` → Deployments → предыдущая версия → Rollback. Или `npx wrangler rollback --env production`.
2. Через Git: revert коммита в `main` через PR, автодеплой выкатит предыдущее состояние.
