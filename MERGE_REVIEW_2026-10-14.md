# Сравнение и merge правок сайта — 14 октября 2026

## 1. Что сравнивали и объединили

| Сторона | Коммиты | Что в них находится |
| --- | --- | --- |
| Наша ветка `possible_change` | `17bf8d5`, `5a521bb`, итоговый `f942ae5` | Ранее согласованные правки интерфейса и общей типографики, последующая правка меню и документация проверенного staging-релиза. Для сравнения использован точный снимок `f942ae5`. |
| Ветка коллеги `origin/feature/review-fixes` | `a4a4b39` | Изменения фотографий и карточек продуктов, текстов, формы образцов, подчёркиваний, footer, меню, карты и Finder. |
| Последний коммит коллеги | `d245a00` | Обновлён crawler audit: он проверяет сохранённый Milkshake `hero-600.webp` вместо удалённого `design-hero-600.webp`. Другого нового интерфейса этот коммит не добавляет. |
| Результат merge | `4361a56` в `migration/review-fixes-20261014` | Родители merge-коммита: `f942ae5` и `d245a00`. Merge выполнен без конфликтов. |

Документ описывает исходники и Git diff `f942ae5...d245a00`. Итоговые результаты проверок, push, PR и staging приведены в разделе 11; описание diff само по себе не считается результатом удалённой проверки.

## 2. Объём изменений

В diff коллеги изменены **159 файлов**. Значительная часть — файлы изображений и переводы строк CSS, а не 159 отдельных изменений интерфейса.

- Удалены **118 файлов фотографий и их размерных вариантов** общим размером **1 457 322 байта**. Это объём удалённых файлов в Git, а не измерение загрузки страницы или размера будущего deploy.
- Заменены ещё **6 изображений** упаковок и плиток Add-ons, Purée и Sauce.
- Удалён компонент `PhotoFlavours.tsx` и его CSS: Cream Latte больше его не использует.
- Добавлен `src/data/sample-flavours.ts` с вариантами для формы образцов.
- Обновлены три browser/crawler audit-скрипта под новый интерфейс и сохранённые изображения.

| Каталог удалённых изображений | Число файлов |
| --- | ---: |
| `public/images/products/milkshake/` | 48 |
| `public/images/products/frappe/` | 28 |
| `public/images/products/cream-latte/` | 18 |
| `public/images/products/puree/` | 14 |
| `public/images/products/sauce/` | 8 |
| `public/images/products/add-ons/` | 2 |
| **Всего** | **118** |

Удалённые файлы включают варианты одного снимка для разных разрешений. Например, 18 файлов Cream Latte представляли 9 вкусов, а не 18 отдельных вкусов.

## 3. Что изменилось в продуктах

| Страница / элемент | До, в `f942ae5` | После правок коллеги | Источник |
| --- | --- | --- | --- |
| Milkshake: первый экран | Использовалась фотография упаковки `design-hero-{600,672}.webp`. | Используется сохранённая фотография напитка `hero-{600,1000}.webp`. Изображение помещается целиком через `object-fit: contain`; под ним белый фон. Alt теперь описывает напиток, а не 500 g pouch. | `src/components/product-page/pages/BlendPage.tsx`, `BlendPage.module.css` |
| Frappe: первый экран | Использовалась фотография упаковки `design-hero-{600,822}.webp`. | Используется фотография напитка `hero-{600,1000}.webp`, также без обрезки и на белом фоне. | Те же файлы `BlendPage` |
| Milkshake: `Ready for your menu` | Галерея из 8 фотографий приготовленных напитков. | Весь раздел удалён; его изображения и CSS также удалены. | `BlendPage.tsx` |
| Frappe: `Ready for your menu` | Галерея из 5 фотографий. | Весь раздел удалён; его изображения и CSS также удалены. | `BlendPage.tsx` |
| Marketing kit в этих галереях | Компонент мог показать ссылку `Download marketing kit`, если `assets.marketingKit` задан. | Ссылка удалена вместе с компонентом галереи. Это удаление условного места ссылки, а не подтверждение, что файл был доступен на каждой странице. | `BlendPage.tsx`, удалённый `MenuGallery` |
| Cream Latte: 9 вкусов | Каждый вкус показывался с фотографией через `PhotoFlavours`, включая подпись о garnish. | Те же 9 названий показаны обычными карточками `Flavours`, все на одном кремовом фоне `#EFE4D3`; фотографии и garnish-подписи убраны. | `CreamLatte.tsx`; удалённые `PhotoFlavours.tsx`, `PhotoFlavours.module.css` |
| Упаковки / плитки Add-ons, Purée, Sauce | Предыдущие изображения в `pack-*` и `tile-*`. | Заменены изображения в тех же путях на простые изображения-плашки. Названия путей не изменились, поэтому потребители этих файлов получают новые изображения. | `public/images/pack-add-ons.webp`, `pack-puree.webp`, `pack-sauce.webp`, `tile-add-ons.webp`, `tile-puree.webp`, `tile-sauce.webp` |
| Add-ons | Название, дозировка, вкус и применение каждого из 7 компонентов. | Добавлена отдельная строка назначения: hydration/recovery, gut health, immune support, relaxation/sleep, stress support, skin/hair/nails, strength/focus. Расширено desktop-описание. | `AddOns.tsx`, `AddOns.module.css` |
| Colour Collection | Детали Taste / Best in были заполнены только у Matcha; хранение предлагалось уточнить по specification sheet. | Taste / Best in заполнены также у Hojicha, Butterfly Pea, Dragon Fruit и Ube. Появилось конкретное хранение ниже 25°C, в сухом месте без света. Ссылка запроса specification sheet удалена. | `ColourCollection.tsx` |
| Purée | Нейтральные инструкции и предложение запросить спецификации/рецептуры. | Восстановлены утверждения о fruit pulp, natural colour и real fruit texture; дозировки 30 ml и 20–30 ml; хранение в холодильнике после открытия. Ссылка запроса спецификаций/рецептур удалена. | `Puree.tsx` |
| Sauce | Нейтральные инструкции и предложение запросить спецификации/рецептуры. | Восстановлены утверждения о сохранении линии на пене/стекле, отсутствии необходимости холодильника до открытия, хранении после открытия вдали от тепла/света; дозировка 15–20 ml. Ссылка запроса спецификаций/рецептур удалена. | `Sauce.tsx` |
| Add-ons / Purée / Sauce: FAQ | Явно задано `initiallyOpen={false}`. | Этот параметр убран; общий `Faq` по умолчанию открывает первый вопрос. Анимационный механизм FAQ не переписан. | Эти три TSX-файла; `src/components/product-page/blocks.tsx` |
| At Home | Не было строки над H1; карточка `Wholesale enquiries` направляла к дистрибьютору. | На desktop возвращена строка `Catalogue / At home`. Карточка заменена на `Display kit`; FAQ тоже обещает kit с первым заказом. | `AtHome.tsx:73,85–86,176`, `AtHome.module.css` |

Технически merge переносит эти изменения. Соответствие реальным рецептурам, условиям поставки и действующим бизнес-обещаниям из самого diff не следует; отдельный список таких текстов приведён ниже.

## 4. Новая форма образцов

Источник: `src/components/forms/SampleRequestModal.tsx`, `SampleRequestModal.module.css`, `src/data/sample-flavours.ts`.

| Элемент | До | После |
| --- | --- | --- |
| Представление | Центрированное модальное окно `Try Before You Buy — Get Your Free Sample!`. | Панель справа `Request a sample`, шириной не более **560 px**; на телефоне занимает всю ширину. Высота использует `100dvh`. |
| Открытие | Предыдущая компоновка модального окна. | Затемнение страницы и въезд панели справа: 220 ms для фона, 280 ms для панели. При `prefers-reduced-motion` эти анимации отключены. |
| Прокрутка | Прокрутка прежнего окна. | Внутри панели прокручивается блок полей; кнопка отправки и текст условий находятся в отдельном нижнем блоке. |
| Вкусы | Не выбирались. | Для соответствующего продукта показываются chips. Можно выбрать до **3 вкусов**, первый выбран изначально. Четвёртый не добавляется, выбранный можно снять. Если форма открыта без продукта или вариантов нет, блок вкусов не показывается. |
| Тип бизнеса | Отдельного выбора не было. | Café, Restaurant, Hotel, Distributor, Other. |
| Поля | Имя, email и телефон. | Имя, company, Mobile / WhatsApp, email, текстовое название country, city и необязательная заметка. Company и city теперь обязательны; email остаётся обязательным по контракту лидов. |
| Согласие | Обязательный `privacy-consent` checkbox со ссылкой на Privacy Policy. | Checkbox и ссылка внутри формы удалены. Внизу панели оставлен текст `By sending you agree to the Privacy Policy...`; Privacy Policy здесь написана обычным текстом. Ссылка в общем footer сохранена. Остальные формы в этой ветке не переводились на такой способ согласия. |
| Успех | Простое сообщение `Your sample request has been sent`. | Отдельный шаг `Request received`: имя посетителя, выбранные вкусы и кнопка возврата/закрытия. Состояние следует за success-box существующего bridge, а не включается сразу по нажатию Send request. |

### Как сохраняются данные заявки

- Публичная отправка остаётся через **`/api/leads`**, посредством существующего `LeadAttributionBridge`.
- Скрытый `tildaspec-formname` остаётся **`Free Sample`**.
- Скрытый **`country`** сохраняет код рынка, переданный в форму; он не заменён редактируемым названием страны.
- Скрытый **`product`** сохраняет название продукта.
- В скрытое **`text`** собираются выбранные вкусы, тип бизнеса, текстовое название страны из `country_name`, city и заметка. Название страны поэтому сохраняется в сообщении CRM даже без нового upstream-поля.
- `name`, `email`, `Phone` и `company` сохраняют используемые bridge имена; upstream-контракт не переписан в компоненте.
- `src/lib/lead-forms.ts`, `LeadAttributionBridge.tsx` и серверные lead API не изменены коллегой. UTM, landing/current page, referrer и первая `utm_source=chatgpt.com` продолжают обрабатываться существующим механизмом.
- Изменение success-интерфейса не является доказательством реальной отправки в CRM. Для browser smoke endpoint мокается; итоговая проверка текущего merge фиксируется отдельно.

Новый текст подтверждения обещает WhatsApp-контакт в течение одного рабочего дня и называет команду страны посетителя. Это содержание интерфейса, а не установленный этим merge SLA или подтверждение наличия команды во всех странах.

## 5. Общие изменения интерфейса

| Область | Точное изменение | Источник |
| --- | --- | --- |
| Подчёркивания ссылок | Глобальное правило раньше убирало подчёркивание при hover. Теперь оно действует также на обычное состояние, `focus` и `focus-visible`. Удалены локальные подчёркивания в cookie policy, consent-текстах Contact/Distributors/R&D, пустом состоянии каталога, Blog/Glossary и Thank You. Focus-outline этим правилом не удаляется. | `src/app/globals.css:45–51`; соответствующие CSS modules |
| Home: переключатели карусели | Под активным названием продукта больше нет отдельной линии `dotLine`. Активный вариант остаётся непрозрачным, у неактивных снижена непрозрачность. `aria-current` сохраняется. | `home/Bestsellers.tsx`, `Bestsellers.module.css:403–437` |
| Footer | Тёплые общие оттенки заменены локальными нейтральными: основной текст/ссылки/соцсети `#c8c8c8`, statement `#b4b4b4`, заголовки колонок `#8f8f8f`, copyright/legal `#8a8a8a`. Содержание и ссылки footer не переписаны. | `site/SiteFooter.module.css:9–19,60–62,106–108,147–160,175–178` |
| Hamburger menu | Product links и country control используют `#c8c8c8`; Products label и legal link — `#8a8a8a`. Структура и обработчики меню не изменены. | `site/SiteMenu.module.css:97,134,203,221` |
| Логотип header | Для ссылки логотипа добавлены запрет touch-callout, выделения, drag, прозрачный tap highlight и `touch-action: manipulation`. SVG не перехватывает pointer events. Это ограничение относится к логотипу, не отключает ссылки и кнопки всего header. | `site/SiteHeader.module.css:73–84` |
| About: карта | Вместо длинного `maps/embed?pb=...` используется `maps?q=25.1244211,55.2445616&z=12&hl=en&output=embed`. Координаты и ссылка Directions прежние. URL запрашивает английский интерфейс; в рамках этого отчёта отображение Google iframe в разных браузерах заново не проверялось. | `about/AboutLocation.tsx:14–19,71` |
| Finder: отступ | У вступительного текста вместо margin, перекрывавшегося `.tbb p { margin: 0 }`, задан `padding-top: 1.5rem` — 24 px при стандартном размере корневого шрифта. | `distributor-finder/DistributorFinderPage.module.css:29–31` |
| Finder: текст | `We are building our partner network across 17 markets` заменён утверждением `The Base is supplied through one official partner in each of 17 markets`. | `DistributorFinderPage.tsx:40` |

## 6. Какие прежние решения сохранены

Эти части не переписаны входящими коммитами:

| Прежнее решение | Состояние после merge / подтверждение |
| --- | --- |
| Единая типографика по Home | Сохранены Exo 2 и shared roles: display 900, малые заголовки 700, body 400, CTA/control 600. `src/app/layout.tsx`, `src/styles/design-tokens.css`, `legacy-typography.css`, `TYPOGRAPHY_CONTRACT.md` и Typography rules в `AGENTS.md` не менялись. Новая sample-панель использует эти токены. |
| Footer: `Made in UAE` | `SiteFooter.tsx` не изменён; строка не возвращена к `Made in Dubai`. |
| WhatsApp SVG в footer | Разметка `SiteFooter.tsx` не изменена. Меняются только оттенки её CSS. |
| Удалённые номер и WhatsApp из hamburger menu | `SiteMenu.tsx` не изменён; эти элементы не возвращены. |
| Открытие/закрытие hamburger и Products | `SiteMenu.tsx` и механизм управления меню не переписаны. |
| Белый интерфейс header на Distributors / R&D | `SiteHeader.tsx` не изменён; правка CSS логотипа не меняет выбор состояния header по странице. |
| Одинаковая позиция заголовков benefit-карточек Distributors и R&D | Их layout CSS не переписан; изменены только подчёркивания consent-ссылок. |
| Home: удалённые `Bestsellers` и строка `600+ flavours · HALAL certified · HACCP food safety` | Они не возвращены; единственное изменение `Bestsellers.tsx` — удаление декоративной `dotLine`. |
| Home: опущенное фоновое `BASE`, описание и расположение CTA/цены | CSS этих элементов не менялся. |
| About: удалённые team и белая рамка | `AboutPage.tsx` и `AboutPage.module.css` не изменены. В About изменён только URL карты в `AboutLocation.tsx`. |
| About / Private Labeling / Resources / Sitemap: предыдущая переработка | Структура страниц не заменена новым шаблоном. У статей Resources убраны подчёркивания; остальное прежнее. |
| Удалённые надписи над заголовками и breadcrumbs на остальных страницах | Входящие изменения их не восстанавливают, **кроме desktop At Home**, отмеченного отдельно. |

Проверены 18 существующих изменённых CSS-файлов через PostCSS: синтаксических ошибок не обнаружено. В BlogArticle, GlossaryArticle и ThankYou большой diff в основном вызван сменой переводов строк. Их значимое изменение — удаление подчёркиваний, не новая типографика.

## 7. Тексты без нового подтверждения

Следующие формулировки действительно присутствуют во входящих исходниках. Их нельзя описывать в отчёте как заново проверенные факты о компании или продуктах.

| Текст / обещание | Почему отмечено | Источник |
| --- | --- | --- |
| Один официальный партнёр в каждом из 17 рынков | `src/data/distributor-markets.ts:14` говорит, что подтверждены только контакты UAE. Для остальных стран Finder по-прежнему показывает `Partner details coming soon`, `Details pending` и обращение к UAE team. Это отсутствие опубликованных подтверждений, не доказательство отсутствия партнёров. | `DistributorFinderPage.tsx:40,90,95–96,119` |
| Display kit, shelf stand и price cards с первым заказом | Возвращено конкретное условие поставки вместо нейтрального `Wholesale enquiries`. Нового подтверждения этого условия в diff нет. | `AtHome.tsx:73,176` |
| Функциональные эффекты Add-ons | Возвращены заявленные назначения, включая gut health, immune support, relaxation/sleep, stress support, skin/hair/nails, strength/focus. Это продуктовый текст, а не новая проверка состава или эффективности. | `AddOns.tsx`, массив `addOns` и desktop lead |
| Purée: fruit pulp, natural colour, хранение и дозировки | Вместо запросов specification sheet указаны конкретные свойства, холодильник после открытия и 30 / 20–30 ml. Подтверждение текущими спецификациями в этом merge не добавлено. | `Puree.tsx`, `faq`, `lead`, `Stats`, `UseCards` |
| Sauce: хранение, line on foam/glass, 15–20 ml | Возвращены конкретные свойства и инструкции вместо уточнения по specification sheet. Новые документы со спецификациями не добавлены. | `Sauce.tsx`, `faq`, `Stats`, `UseCards` |
| Colour Collection: taste / best in / ниже 25°C | Детализированы вкус, применение и условия хранения. Это перенос текста, не проверка актуальной этикетки. | `ColourCollection.tsx`, `colours`, `faq`, `Info` |
| Ответ на образец через WhatsApp за один рабочий день / команда страны | Новая success-панель содержит такое обещание. API не добавляет SLA и не создаёт локальных команд. | `SampleRequestModal.tsx`, success step |

### Возвращённый breadcrumb At Home

`AtHome.tsx:85–86` вновь показывает `Catalogue / At home` **только на desktop**, над H1. Это входящее изменение, которое расходится с прежним решением убрать breadcrumbs/верхние надписи. В рамках составления отчёта приложение не редактировалось; возврат отмечен для явного review. Добавленный `.crumbs` CSS также повторён внутри responsive-блока.

## 8. Что merge не меняет

Сравнение защищённых путей `f942ae5...d245a00` не обнаружило изменений в:

- серверных API `src/app/api/`;
- `src/lib/lead-forms.ts` и `src/components/forms/LeadAttributionBridge.tsx`;
- `src/lib/site-pages.ts`, `src/lib/structured-data.ts`, `src/lib/legacy-structured-data.ts`, `src/app/[[...path]]/page.tsx` и `src/app/layout.tsx`;
- основном каталоге `src/data/products.ts` и списке рынков `src/data/distributor-markets.ts`;
- shared typography tokens, legacy bridge, `TYPOGRAPHY_CONTRACT.md`, `AGENTS.md`;
- `worker.ts`, `wrangler.jsonc` и `wrangler.staging-leads.jsonc`.

Следовательно, коллега не менял маршруты, route metadata/canonical generation, цены основного каталога, серверный lead-контракт, UTM-механизм и Cloudflare routing. Новые product FAQ и описания в компонентах всё же являются изменением текста страниц; отсутствие diff серверной metadata не означает отсутствие любых SEO-значимых изменений содержания.

Production DNS, GoDaddy, Tilda и production Worker этим merge не изменялись. Staging и каждый `workers.dev` должны сохранить transport `noindex, nofollow`, а canonical — `https://thebasebev.com`; результат проверки нового deploy фиксируется ниже, не выводится только из отсутствия diff конфигурации.

## 9. Исправление при интеграции

После merge внесена одна предметная коррекция в `src/data/sample-flavours.ts`: в начало вариантов **Garnish** добавлен **`Strawberry Cubes`**.

У коллеги список формы содержал 7 вариантов. Видимая Garnish-страница содержит 8. После коррекции список формы соответствует всем 8 вариантам и начинает со Strawberry Cubes. Это исправление данных формы, а не добавление нового продукта, изменение серверных цен или маршрутов.

## 10. Изменения проверочных скриптов

| Скрипт | Что изменилось |
| --- | --- |
| `scripts/audit-crawlers.mjs` | Ссылка проверяемого Milkshake image изменена на сохранённый `hero-600.webp`; именно это добавляет `d245a00`. |
| `scripts/smoke-browser.mjs` | Sample-форма теперь заполняется company и city вместо удалённого checkbox. |
| `scripts/smoke-seo-review.mjs` | Заполнение учитывает company/city; checkbox проверяется у форм, где он существует. Для Milkshake/Frappe проверяются отсутствие галереи и сохранённый hero image; short viewport проверяет внутреннюю прокрутку drawer и видимую кнопку Send request. |

Это обновление ожидаемого интерфейса тестов. Сам diff теста не считается успешным запуском и не подтверждает доставку реального лида в CRM.

## 11. Итоговые проверки, GitHub и публикация

Merge `4361a56` выполнен без конфликтов. Отдельный коммит `9aeda81` исправляет список вкусов Garnish. Ниже отдельно указаны результаты локальных и удалённых проверок.

| Шаг | Результат текущего merge |
| --- | --- |
| Refactor / проверка итогового diff | Исходники перечитаны; входящие изменения рассмотрены по продуктам, форме и общим стилям. Единственная добавленная коррекция — Strawberry Cubes, без изменения API или render-логики. |
| Typecheck, lint, lead audit, Stripe tests | Все exit 0 после коррекции: typecheck; lint без предупреждений; lead audit 47; Stripe 21/21. |
| Build / Cloudflare build / asset audit | Все exit 0 после коррекции: Next build 186 страниц; OpenNext build с 917 Static Assets document variants; check:assets 563 ссылки. |
| HTTP / browser / routes / SEO / crawlers / commerce | На staging `e3a68dec`: все exit 0. HTTP — 49 routes, 257 redirects; browser — 13 viewport sizes; дополнительный UI smoke — 261 проверка; routes — 188 routes, 172 sitemap URLs; SEO — 172 canonical pages, 0 critical failures; crawlers — 9 user agents × 13 страниц и 3 assets; commerce — 22 карточки. |
| Cloudflare parity / npm audit | Оба exit 1. Сравнение с прежним `mnsdemo` показывает существующие расхождения H1, количества JSON-LD и legacy Resources на 37 маршрутах. Ошибок status/canonical/redirect в выводе нет. Npm audit: 14 уязвимостей, подробности ниже. |
| GitHub push и PR в `develop` | `migration/review-fixes-20261014`, код `9aeda81` отправлен в origin. Создан [PR #14](https://github.com/Man9sua/thebasebev/pull/14) в `develop`. |
| Cloudflare staging | Deploy exit 0, https://the-base-staging.mansua.workers.dev, код `9aeda81`, Worker version `e3a68dec-99ba-4066-bfb4-f169490c00f5`. `X-Robots-Tag: noindex, nofollow`; canonical остаётся на `https://thebasebev.com`. |
| Production | Этот релиз опубликован только в staging. |

### Дополнение главного агента: финальные результаты

`npm audit` завершился с exit 1: **14 уязвимостей** (2 moderate, 11 high, 1 critical). `package.json` и `package-lock.json` входящие коммиты и коррекция Garnish не меняли. Красный CI исходного [PR #13](https://github.com/Man9sua/thebasebev/pull/13) также завершился на `npm audit --audit-level=high`: [job](https://github.com/Man9sua/thebasebev/actions/runs/38254926476/job/114830420136?pr=13). Поэтому локальные успешные проверки не обозначаются как зелёный полный CI.

Перед deploy Wrangler подтвердил профиль `mansua` и account ID `678720af4dded7d23aad4a859b6e5f3a`. `npm run deploy:staging` прошёл с exit 0; Static Assets document fast path сохранён. Обязательные post-deploy HTTP/browser/crawler проверки прошли именно на новой версии.

Отдельная browser-проверка Garnish показала **8 вариантов**, `Strawberry Cubes` первым и выбранным по умолчанию. Интерфейс и короткий drawer 390×450 проверены browser smoke; физический iPhone Safari не использовался. Отправки форм в browser проверках мокались, реальные лиды и заказы не создавались; это не проверка реальной доставки в Odoo.

Финальный SEO report содержит 146 объявленных изменений и 176 неблокирующих link/alt observations. `ROUTE_INDEXABILITY_AUDIT.md` и `SEO_PARITY_REPORT.md` перегенерированы для этой staging-версии.

После чтения входящего кода остались небольшие замечания, которые не исправлялись в этом merge: у заметки sample-формы нет `maxLength` (длинная заметка вместе с метаданными блокируется общим validator сообщением); в неиспользуемом текущими 22 продуктами PartnerRequestModal сохранились ссылки на удалённые CSS classes; прежний focus-trap имеет ограничения с hidden/honeypot inputs. Успешные smoke проверки не объявляются проверкой каждого такого случая.

Папки `addphotos/`, `whatsappchat/`, артефакты браузера и пользовательские изменения `tbb_future_plans/fixes.md` исключены из commit. SHA-256 пользовательского файла до и после merge совпадает. Последний коммит коллеги на origin повторно подтверждён как `d245a00`.
