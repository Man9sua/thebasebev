Ты работаешь над коммерческим production-проектом **THE BASE**.

Исходный сайт:

**https://thebasebev.com/**

В текущей директории проекта уже находится **полный экспорт сайта из Tilda** со всеми доступными:

- HTML-страницами;
- CSS;
- JavaScript;
- изображениями;
- WebP;
- PNG/JPG;
- SVG;
- иконками;
- favicon;
- шрифтами;
- видео;
- локальными Tilda-assets;
- другими файлами экспорта.

## ГЛАВНАЯ ЗАДАЧА

Полностью перенести текущий сайт THE BASE с Tilda на нормальный кодовый стек и получить **максимально точный функциональный и визуальный клон существующего production-сайта**.

Новый сайт должен выглядеть и вести себя максимально близко к:

**https://thebasebev.com/**

Это НЕ редизайн.

Это НЕ новая версия сайта.

Это первый этап технической миграции:

**Tilda → Next.js + React + TypeScript**

Сначала необходимо добиться максимального visual/functionality/SEO parity с существующим сайтом.

---

# 1. ЦЕЛЕВОЙ СТЕК

Использовать:

- Next.js latest stable;
- App Router;
- React;
- TypeScript;
- современный CSS;
- предпочтительно CSS Modules / global CSS;
- допускается Tailwind только если он действительно упрощает проект и не мешает pixel-perfect переносу;
- deployment target: **Cloudflare Workers**;
- Git-friendly project structure.

Не использовать React Native.

Не делать SPA-only архитектуру.

Основной публичный контент должен нормально рендериться сервером / статически и быть доступен crawler'ам без необходимости ждать сложный client-side JS.

---

# 2. ПЕРЕД РАЗРАБОТКОЙ ПРОВЕДИ АУДИТ ЭКСПОРТА

Сначала полностью исследуй текущую директорию.

Найди:

- все HTML-страницы;
- CSS-файлы;
- JS-файлы;
- Tilda dependencies;
- изображения;
- WebP;
- SVG;
- fonts;
- videos;
- forms;
- iframe;
- custom HTML;
- inline scripts;
- analytics;
- metadata;
- canonical;
- OpenGraph;
- structured data;
- navigation;
- redirects, если они присутствуют;
- ссылки между страницами.

Составь внутреннюю карту:

```text
OLD TILDA FILE / URL
→
NEXT.JS ROUTE / COMPONENT
```

Не начинай слепо переписывать сайт до того, как будет понятна структура экспорта.

---

# 3. СОХРАНИТЬ СУЩЕСТВУЮЩИЕ URL

Это критически важно.

На первом этапе НЕ внедрять новую международную архитектуру:

```text
/global/en/
/ae/en/
/ae/ar/
/sa/en/
/sa/ar/
/kz/ru/
/kz/en/
/uk/en/
```

Она будет реализована позже отдельным этапом.

Сейчас существующие production URL должны сохраняться максимально **1:1**.

Пример:

```text
/                 → /
/catalog          → /catalog
/matcha           → /matcha
/milkshake        → /milkshake
/about-us         → /about-us
/distributors     → /distributors
```

Не менять существующие slug без необходимости.

Не вводить самостоятельно:

```text
/products/matcha
/company/about
/en/products/...
```

Если в Tilda-export обнаружатся legacy URL типа:

```text
/page123456.html
```

не удаляй информацию о них.

Собери их отдельно для будущей redirect-map.

---

# 4. VISUAL PARITY

Главная цель — максимально точный визуальный перенос.

Не "сделать похожим".

Нужно добиться максимально близкого соответствия оригиналу:

- размеры;
- spacing;
- grid;
- typography;
- font weights;
- line-height;
- colors;
- backgrounds;
- borders;
- radius;
- shadows;
- positioning;
- sticky/fixed элементы;
- header;
- footer;
- product cards;
- menus;
- mobile navigation;
- sliders;
- modals;
- forms;
- accordions;
- tabs;
- hover;
- responsive behavior;
- transitions;
- animations.

Особое внимание:

### Desktop
1440px / 1280px / 1024px

### Tablet
768px

### Mobile
430px / 390px / 375px / 360px / 320px

Нельзя считать задачу выполненной только потому, что desktop выглядит похоже.

Mobile имеет такой же приоритет.

---

# 5. ИСПОЛЬЗУЙ ОРИГИНАЛЬНЫЕ ASSETS

В директории уже находится полный экспорт Tilda.

Приоритет:

**использовать оригинальные изображения из экспорта.**

Не:

- делать screenshots;
- генерировать изображения через AI;
- заменять product photography похожими изображениями;
- скачивать случайные версии продуктов;
- ухудшать качество.

Найди оригинальные:

- product pouch images;
- beverages;
- logos;
- icons;
- decorative graphics;
- WebP;
- SVG;
- backgrounds.

Если asset уже существует локально — использовать локальный asset.

Организуй их нормально, например:

```text
/public/
  images/
  products/
  drinks/
  icons/
  logos/
  videos/
```

Но не ломай ссылки на этапе миграции.

---

# 6. НЕ ТАЩИ TILDA КАК RUNTIME

Экспорт Tilda используется как:

1. источник контента;
2. источник дизайна;
3. источник assets;
4. reference существующей логики.

НЕ нужно строить новый production как огромную копию:

```text
t396
t-rec
tn-elem
t-container
```

если это можно нормально выразить React-компонентами.

Конечная архитектура должна постепенно превращаться в:

```tsx
<Header />
<Hero />
<ProductRange />
<ValueSection />
<ProductCard />
<LeadForm />
<Footer />
```

Но:

**visual parity важнее преждевременного refactor.**

Если какой-то сложный Tilda-блок невозможно безопасно переписать сразу, допускается сначала сделать изолированный legacy component, добиться точного результата, а затем рефакторить.

Принцип:

```text
Сначала 1:1
↓
Потом clean architecture
```

а не наоборот.

---

# 7. COMPONENT ARCHITECTURE

Выделить повторяющиеся элементы:

```text
components/
  layout/
    Header
    Footer

  navigation/
    DesktopMenu
    MobileMenu
    CountrySelector

  products/
    ProductCard
    ProductHero
    ProductGrid
    ProductNavigation

  forms/
    LeadForm
    SampleForm
    DistributorForm

  ui/
    Button
    Accordion
    Modal
    Tabs
    IconButton
```

Не создавать абстракции только ради абстракций.

Если component используется один раз и не выигрывает от выделения — можно оставить его внутри страницы.

---

# 8. SEO — КРИТИЧЕСКОЕ ТРЕБОВАНИЕ

Компания получает органический Google-трафик уже длительное время.

Также сайт получает реальные B2B leads из AI/Search систем.

Поэтому миграция не должна уничтожить SEO.

Для каждой существующей страницы сохранить, где они присутствуют:

- URL;
- HTTP 200;
- `<title>`;
- meta description;
- H1;
- H2/H3 hierarchy;
- canonical;
- OpenGraph;
- Twitter metadata;
- image alt;
- internal linking;
- meaningful visible content;
- structured data / JSON-LD;
- favicon;
- sitemap inclusion;
- indexability.

Не добавлять:

```html
<meta name="robots" content="noindex">
```

в production build.

Staging может быть закрыт от индексации отдельно, но production должен быть indexable.

---

# 9. ROBOTS.TXT

Сделать понятный production `robots.txt`.

Не блокировать:

- Googlebot;
- Bingbot;
- OAI-SearchBot;
- ChatGPT-User;
- PerplexityBot;
- Claude search-related crawlers;

без явного требования заказчика.

На данном этапе стратегия компании:

**максимальная Search + AI discoverability.**

Не добавлять anti-AI blocking правила самостоятельно.

---

# 10. SITEMAP

Реализовать нормальный:

```text
/sitemap.xml
```

Он должен содержать все публичные canonical indexable pages.

Не включать:

- технические routes;
- dev pages;
- 404;
- admin;
- staging;
- дубли.

---

# 11. FORMS — ОСОБО ВАЖНО

Существующий THE BASE — B2B sales website.

Основная conversion-механика:

- Partner with Us;
- Get a Sample;
- Contact;
- Distributor;
- Private Label;
- другие lead forms.

Нельзя просто визуально отрисовать формы и оставить их неработающими.

На первом этапе:

1. определить, куда сейчас отправляются формы Tilda;
2. сохранить все поля;
3. сохранить validation;
4. сохранить success/error UX;
5. обязательно сохранять attribution.

Форма должна иметь возможность передавать:

```text
name
email
phone
country
form name
landing page
referrer
UTM source
UTM medium
UTM campaign
UTM content
UTM term
```

Особенно не потерять:

```text
utm_source=chatgpt.com
```

поскольку компания уже получает лиды из ChatGPT.

Если текущий backend формы невозможно перенести без credentials/API:

- реализовать интерфейс формы;
- реализовать подготовленный typed API layer;
- явно оставить TODO только в integration layer;
- не разбрасывать mock logic по UI.

---

# 12. ANALYTICS

Проанализировать экспорт и найти:

- Google Analytics;
- GA4;
- Google Tag Manager;
- Meta Pixel;
- другие analytics IDs.

Не создавать новые properties.

Подготовить новый сайт к использованию **существующих IDs**, чтобы после production migration исторические данные продолжали идти в те же системы.

Не вставлять выдуманные ID.

---

# 13. GOOGLE SEARCH CONSOLE

Search Console не является частью runtime, но новый сайт должен быть полностью совместим с существующим property.

Сохранять:

- domain;
- canonical;
- verification mechanism, если находится в HTML;
- sitemap;
- public URLs.

Если в экспорте присутствует:

```html
google-site-verification
```

не потерять его.

---

# 14. AI SEARCH / CRAWLERS

Не блокировать AI search crawlers в коде.

Не добавлять restrictive:

```text
robots
headers
middleware
WAF assumptions
```

На Cloudflare позже вручную будет настроено:

```text
Search   = ALLOW
Agent    = ALLOW
Training = ALLOW
```

Поэтому приложение не должно конфликтовать с этим.

В частности страницы должны нормально возвращать HTML для crawler requests.

---

# 15. PERFORMANCE

После достижения визуального соответствия оптимизировать:

- unnecessary JS;
- duplicate scripts;
- legacy Tilda scripts;
- image loading;
- responsive images;
- fonts;
- lazy loading;
- hydration;
- layout shift.

Использовать `next/image` там, где это действительно корректно.

Но не испортить:

- качество product images;
- transparent PNG/WebP;
- precise sizing;
- animations.

Главное:

**не оптимизировать ценой изменения дизайна.**

---

# 16. TILDA JS

Проанализируй каждый Tilda/custom script.

Раздели их на:

### A. Не нужен после React migration
Удалить.

### B. Нужен визуальный эффект
Переписать нормально.

### C. Business functionality
Перенести с сохранением поведения.

### D. Analytics / external integration
Сохранить или подготовить integration layer.

Не подключать весь Tilda runtime только потому, что так быстрее.

---

# 17. RESPONSIVE

Не использовать фиксированную desktop-верстку, масштабированную на телефон.

Каждая ключевая секция должна проверяться отдельно.

Особенно:

- header;
- mobile menu;
- country selector;
- hero;
- product categories;
- product page;
- footer;
- forms;
- CTA;
- tables;
- sliders;
- checkout/cart, если они присутствуют.

---

# 18. RTL

На первом этапе не требуется новая `/ae/ar/` и `/sa/ar/` архитектура.

Но не строй CSS так, чтобы будущий RTL был невозможен.

Избегай ненужной жёсткой логики:

```css
left/right
```

там, где можно в дальнейшем использовать logical properties:

```css
margin-inline
padding-inline
inset-inline
```

Однако visual parity текущего сайта имеет приоритет.

---

# 19. CLOUDFLARE COMPATIBILITY

Проект должен быть готов к deployment на:

**Cloudflare Workers**

Следовать актуальной рекомендуемой схеме Next.js для Cloudflare.

Не использовать Vercel-only functionality без необходимости.

Проверить совместимость:

```text
npm run build
```

и Cloudflare/OpenNext deployment.

Создать необходимые config files.

При этом НЕ подключать production domain.

---

# 20. ENVIRONMENT

Создать:

```text
.env.example
```

Не хранить secrets в repository.

Пример:

```text
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_GTM_ID=

LEAD_API_URL=
LEAD_API_KEY=

ODOO_URL=
ODOO_API_KEY=
```

Odoo пока может не использоваться, но архитектура сайта должна позволять подключить его позже.

---

# 21. PARTNER HUB НЕ СМЕШИВАТЬ С ПУБЛИЧНЫМ САЙТОМ

Если в директории находится:

```text
partner-hub-prototype.html
```

не встраивать его автоматически в public THE BASE site.

Это будущая отдельная B2B-функциональность.

Считать её отдельным модулем / будущим приложением.

В перспективе:

```text
thebasebev.com
→ public marketing website

partners.thebasebev.com
→ Partner Hub
```

Но сейчас задача — public website clone.

---

# 22. НЕ ТРОГАТЬ PRODUCTION

Во время выполнения задачи:

НЕ:

- менять GoDaddy;
- менять nameservers;
- менять DNS;
- менять production Tilda;
- подключать thebasebev.com к Cloudflare;
- трогать Search Console;
- публиковать новый сайт на production.

Работаем только:

```text
local
↓
Git
↓
staging
```

---

# 23. STAGING

После успешного build подготовить staging deployment.

Например:

```text
*.workers.dev
```

или отдельный staging hostname.

Production domain пока не подключать.

---

# 24. СРАВНЕНИЕ OLD VS NEW

Перед завершением провести visual/functionality audit.

Для основных страниц сравнить:

```text
CURRENT TILDA
vs
NEW NEXT.JS
```

По:

- desktop;
- tablet;
- mobile;
- layout;
- typography;
- images;
- animations;
- navigation;
- forms;
- SEO metadata;
- links;
- interaction;
- loading states.

Используй live THE BASE как visual reference только если это необходимо для проверки export.

Основным техническим source of truth является локальный полный Tilda export.

---

# 25. НЕ ДЕЛАТЬ РЕДИЗАЙН

Не принимать самостоятельно решения вроде:

- поменять Hero;
- изменить тексты;
- удалить секции;
- переставить блоки;
- изменить CTA;
- заменить изображения;
- сделать новый header;
- "улучшить" footer;
- изменить цвета;
- изменить шрифты.

Если видишь очевидную проблему текущего дизайна:

НЕ исправляй её в clone-stage.

Добавь её отдельно в:

```text
MIGRATION_NOTES.md
```

например:

```text
## Potential improvements after parity

- Header navigation could be simplified.
- Duplicate CTA found.
- Mobile spacing issue on X.
- Legacy Tilda HTML can be removed.
```

Но production clone должен сначала повторять текущий сайт.

---

# 26. СОЗДАЙ ДОКУМЕНТАЦИЮ

Создать:

```text
README.md
MIGRATION_NOTES.md
SEO_PARITY.md
ROUTE_MAP.md
```

### README.md

- stack;
- install;
- dev;
- build;
- deploy staging.

### ROUTE_MAP.md

```text
OLD URL
NEW URL
STATUS
NOTES
```

### SEO_PARITY.md

для каждой важной страницы:

```text
URL
title
description
canonical
H1
indexable
structured data
status
```

### MIGRATION_NOTES.md

- Tilda dependencies;
- removed legacy code;
- pending integrations;
- forms;
- analytics;
- issues found in original;
- things intentionally preserved.

---

# 27. ПОРЯДОК РАБОТЫ

Работай последовательно.

## PHASE 1 — INVENTORY

Исследовать export.

Не менять код, пока не понятна структура.

---

## PHASE 2 — NEXT.JS FOUNDATION

Создать Next.js + TS project.

Настроить:

- structure;
- CSS;
- fonts;
- assets;
- metadata;
- Cloudflare compatibility.

---

## PHASE 3 — SHARED LAYOUT

Перенести:

- Header;
- Footer;
- global navigation;
- shared UI.

---

## PHASE 4 — HOME

Сделать homepage максимально 1:1.

Проверить desktop + mobile.

---

## PHASE 5 — MAIN PAGES

Перенести:

- Catalog;
- Product pages;
- About;
- Distributors;
- Private Label;
- Contacts;
- другие существующие public pages.

---

## PHASE 6 — FORMS

Перенести B2B forms и attribution.

---

## PHASE 7 — SEO

Проверить:

- metadata;
- canonical;
- sitemap;
- robots;
- JSON-LD;
- URLs;
- legacy URLs.

---

## PHASE 8 — PERFORMANCE

Удалить ненужные Tilda dependencies.

Оптимизировать assets/runtime.

---

## PHASE 9 — STAGING

Build + Cloudflare staging.

---

## PHASE 10 — PARITY REPORT

В конце предоставить:

```text
DONE
PARTIAL
BLOCKED
NEEDS CREDENTIALS
```

для всех важных частей.

---

# 28. DEFINITION OF DONE

Задача считается выполненной только если:

### Visual

- сайт визуально практически идентичен текущему THE BASE;
- desktop работает;
- mobile работает;
- key animations сохранены.

### Functional

- navigation работает;
- internal links работают;
- forms не потеряны;
- interactive elements работают.

### Technical

- Next.js;
- TypeScript;
- production build проходит;
- нет критических console errors;
- нет зависимости от Tilda runtime там, где она больше не нужна;
- готовность к Cloudflare Workers.

### SEO

- старые основные URL сохранены;
- metadata сохранена;
- canonical сохранены;
- sitemap работает;
- robots работает;
- crawler-accessible HTML;
- нет случайного noindex;
- legacy URLs зафиксированы для redirects.

### Safety

- production Tilda не изменён;
- GoDaddy не изменён;
- DNS не изменён;
- Search Console не изменён;
- thebasebev.com пока не переключён.

---

# 29. ПРАВИЛО ПРИ НЕОПРЕДЕЛЁННОСТИ

Если есть выбор между:

**A. улучшить существующий сайт**

и

**B. сохранить поведение существующего сайта**

на этом этапе выбирай **B**.

Если export и live production отличаются:

1. зафиксируй различие;
2. используй актуальный production как visual reference;
3. не удаляй asset/content без проверки.

---

# 30. НАЧНИ СЕЙЧАС

Первым действием:

1. проиндексируй текущую директорию;
2. найди все HTML/CSS/JS/assets;
3. определи количество public pages;
4. построй route map;
5. найди shared header/footer;
6. найди forms;
7. найди SEO metadata;
8. найди Tilda-specific dependencies;
9. только затем создавай/реорганизовывай Next.js application.

Не спрашивай меня о каждом мелком решении.

Самостоятельно выполняй migration, используя текущий export как source of truth.

Не останавливайся после создания skeleton.

Нужен **рабочий максимально точный кодовый клон THE BASE**, готовый к локальному запуску и staging deployment на Cloudflare.