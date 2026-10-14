# Изменения по SEO-чату — possible_change

Основа: предоставленный экспорт переписки и связанные с сообщениями макеты. Применено последнее уточнение: английские страницы UAE и Find your distributor вместо выбора страны/языка. Отдельные локализованные сайты для 17 стран не создавались. Эта ветка предназначена только для staging.

## Навигация и дистрибьюторы

- В desktop header вместо UAE/EN добавлена ссылка Find your distributor.
- Из мобильного header и hamburger menu убран выбор страны/языка; в меню добавлена ссылка на поиск дистрибьютора.
- Создан `/ae/find-your-distributor`: 17 рынков из последнего макета, три группы, поиск, выбор рынка, поддержка прямых ссылок `?market=CODE`.
- У UAE указаны действующие телефон, email, WhatsApp и ссылка Shop. Для остальных рынков показано отсутствие подтверждённого местного контакта и связь с командой UAE.
- Samples сохраняет выбранный рынок в заявке. Значение страны по умолчанию исправлено с KZ на AE в sample/partner формах.
- У формы Samples исправлена прокрутка на экранах малой высоты: кнопка отправки остаётся доступной при уменьшенном viewport.
- Ссылки Find your distributor в продуктах ведут на новую страницу, а Apply — на существующую форму Distributors.
- Talk to R&D / Develop a flavour ведут на `/ae/rnd#rnd-form`, вместо неподходящего legacy popup.
- Обновлены счётчики ассортимента: фактически 22 категории.

## About us

- После блока Laboratory обновлены лаборатория, логистика и производство по присланным изображениям: две фотографии лаборатории, три пункта контроля, грузовик и три пункта доставки, сетка упаковок и фирменная коробка.
- Использованы реальные изображения проекта. Для упаковочного блока сохранена доступная фотография коробки; отдельного исходника фотографии ленты из макета нет.
- Careers вынесен в переиспользуемый блок и отдельную страницу: выбор направления, имя, email, телефон, сообщение, согласие с privacy policy.
- Заявка Careers отправляется через `/api/leads`. По выбору владельца CV отправляется по email; загрузчик файлов и новое хранилище резюме не добавлялись.
- Существующие пять FAQ и заключительный контактный блок сохранены.
- Карта и Directions используют уже правильное место из ссылки SEO.

## Private labeling

- Вместо старой страницы созданы hero Your brand / Our craft, показатели и четыре формата сотрудничества из макета.
- Выбранный формат переносится в настоящую форму Request a quote.
- Сохранён контракт Custom flavor for your brand, `/api/leads`, first-touch attribution и честная обработка ошибки доставки.
- Не добавлены вымышленные цены, фотографии или скачивания.

## Resources

- Пересобран хаб Resources: featured article, две карточки, темы, даты, переходы в Articles / Glossary / Tools / Recipe base.
- Ссылки ведут на уже импортированные статьи; URL, полный текст и SEO metadata статей сохранены.
- Добавлен настоящий Chef Barista Guide PDF из предоставленного материала: шесть страниц, около 4 МБ после оптимизации, текст сохранён; кнопка Download ведёт на `/files/barista-guide.pdf`.
- Сохранены 101 glossary статья и 30 blog статей.

## Продукты и каталог

- Milkshake и Frappe пересобраны по их собственным HTML-макетам: hero, показатели, приготовление, вкусы, Ready for your menu, Inside the pack, хранение и FAQ.
- Добавлены настоящие hero изображения Milkshake/Frappe и пять готовых напитков Frappe из вложенных файлов макета.
- У Milkshake отсутствующие фотографии восьми готовых напитков оставлены пустыми слотами, согласно последнему уточнению SEO о фотографиях.
- Nutrition опубликован только для вариантов, для которых в материале есть конкретные значения: Milkshake Vanilla и Frappe Salted Caramel. Другие вкусы не наследуют эти значения.
- Общие hero больше не показывают дополнительный OEM/ODM/старый SEO подзаголовок. Page title и description сохранены.
- Убраны из интерфейса созданные ранее неподтверждённые изображения упаковок Purée, Sauce, Add-ons и Electrolyte; сами файлы не удалялись. В каталоге не используются generated illustration tiles; Colour Collection и At Home используют доступные настоящие фотографии.
- Добавлена страница Electrolyte: пять вкусов, четыре формата, запрос образца, контакты дистрибьютора и R&D. Ассортимент каталога и sitemap дополнен этой категорией.
- Из Electrolyte удалены неподтверждённые минералы 1000/200/60 mg, «no added sugar» и дозировка воды 300–500 ml: исходный макет сам требует их проверить. Вместо этих утверждений предложен запрос спецификации выбранного вкуса у команды.
- У новых ranges убраны и другие прямо отмеченные автором макетов предположения: Purée — fruit pulp, хранение и дозировки; Sauce — room-temp storage, «holds its line» и дозировка; Add-ons — неподтверждённые обещания пользы; Colour Collection — спорные Taste/Best in четырёх порошков и точная температура хранения; At Home — обещание display kit в первом заказе. Структура, ассортимент, форматы, подтверждённые рецепты и действующие CTA сохранены; подробности состава и хранения запрашиваются у команды.
- В каталоге сохранены рабочие фильтры, поиск, сортировка и реальный Shop; убран дополнительный SEO подзаголовок, для отсутствующих фотографий оставлены нейтральные слоты.
- Отдельный утверждённый макет нового каталога в связанной переписке отсутствует: присланный screenshot показывает отклонённый текущий интерфейс. Полная визуальная перестройка каталога по отсутствующему макету не заявляется.
- Спецификации PDF и marketing kits не предоставлены: неподключённые Download кнопки не публикуются.

## Новые страницы и sitemap

- Созданы `/ae/careers`, `/ae/request-samples`, `/ae/certificates`, `/ae/faq`, `/ae/cookie-policy`, `/ae/find-your-distributor`, `/ae/electrolyte`.
- Certificates предлагает запросить действующие документы; вымышленные сертификаты и номера не добавлялись.
- Request samples открывает действующую форму. Cookie policy описывает текущие consent/attribution механизмы и открывает настоящие настройки cookies.
- HTML sitemap пересобран по структуре Company / Work with us / Quality / Resources / Products / Markets / Legal. В нём 22 продукта и 17 ссылок на рынки в Finder, без несуществующих локализаций.
- XML sitemap содержит 172 канонических страницы, английские self-reference и x-default alternates. Даты существенных изменений обновлены; даты статей сохранены.
- Сохраняются старые маршруты и redirects. Для новых unprefixed адресов добавлены переходы на `/ae/...`.
- Исправлены отсутствовавшие перенаправления `/puree`, `/sauce`, `/colour-collection`, `/add-ons`, `/at-home`: вместо 404 они ведут на действующие `/ae/...` страницы.

## SEO и обработка данных

- Сохранены существующие title, description, canonical и indexability. H1 Private labeling и Resources приведены к присланным макетам; эти конкретные изменения явно описаны и проверяются SEO audit.
- Twitter title/description/image теперь соответствуют конкретной странице вместо одинакового текста для всего сайта.
- Новым страницам и статьям добавлен настоящий Organization/WebSite graph; ссылки на компанию используют единый идентификатор.
- Относительные image/logo URL в legacy JSON-LD исправлены на абсолютные production URL.
- OfferCatalog отражает фактические категории и URL; Product не заявляет неподтверждённый InStock и не ссылается на вымышленные изображения.
- Старые FAQ JSON-LD у заменённых product страниц удалены: schema формируется из реально отображаемых вопросов.
- Сохранены BreadcrumbList, Article, Product, FAQPage, first-touch UTM, landing/current page и referrer. Браузерные проверки форм используют mock и не создают настоящих заявок.
- Расширены route/HTTP/crawler/commerce/browser audits на новые страницы и Finder; добавлены тесты корректности structured data и отдельный SEO UI smoke.
- Cookie settings сохраняет ранний запрос до готовности компонента; открытие, повторное открытие и отписка проверяются отдельными тестами. Выбор согласия, cookies и аналитика не менялись.
- `whatsappchat/` добавлен в `.gitignore`; исходная переписка и её папка не входят в коммит.
- У PDF и остальных static assets на `workers.dev` добавлен транспортный `noindex, nofollow` через hostname rule `_headers`; правило не совпадает с production hostname. Документация: https://developers.cloudflare.com/workers/static-assets/headers/ .

## Уже выполнено до этой ветки

Проверено и сохранено: глобальное отсутствие hover underline, удалённый Team блок и белая декоративная рамка About, WhatsApp SVG владельца в footer, Made in UAE, удалённые Bestsellers/proof подписи в главной карусели, белые controls поверх тёмных hero Distributors/R&D, выравнивание заголовков benefit карточек, анимация Products в hamburger menu.

## Что требует дополнительных материалов или внешнего доступа

- Подтверждённые контакты дистрибьюторов вне UAE, переводы, фотографии отсутствующих SKU/готовых напитков, отдельный макет каталога, marketing kits, spec sheets и nutrition остальных SKU.
- Отправка sitemap в Google Search Console/Bing, управление Google Business Profile и изменение данных в кабинетах не выполняются через staging. Verification tags уже присутствуют в проекте.
- Аудиосообщения не имеют текстовой расшифровки и не интерпретировались предположительно; реализованы подтверждённые текстовые требования и связанные макеты.

## Фактическая публикация и проверки

- Код опубликован в GitHub: ветка `possible_change`, коммиты `e6c88a2` и `02510c5`.
- Развёрнут только `the-base-staging` в аккаунте `mansua` / `678720af4dded7d23aad4a859b6e5f3a`; профиль и account ID проверены Wrangler перед каждым deploy.
- Проверенная версия staging: `195fe9ea-e669-41e2-b354-e3f400161453`, код `02510c5`, адрес https://the-base-staging.mansua.workers.dev .
- Production, DNS, GoDaddy и Tilda этой задачей не публиковались и не изменялись.

| Проверка | Фактический результат |
| --- | --- |
| TypeScript / ESLint | PASS |
| Lead contract audit | PASS, 47 проверок |
| Stripe / structured data / consent settings | PASS, 21 / 2 / 4 теста |
| Next.js / OpenNext / Static Assets fast path | PASS, 186 generated pages, 917 документов fast path |
| Local assets | PASS, 563 используемых файла |
| Staging HTTP | PASS, 49 маршрутов и 257 redirects |
| Staging commerce | PASS, 22 категории; заказ не отправлялся |
| Staging browser smoke | PASS, desktop/mobile и 13 размеров viewport |
| Staging SEO UI smoke | PASS, 249 проверок; cookies settings на desktop/mobile и scroll/submit при 390×450 |
| Staging route indexability | PASS, 188 controlled routes, 257 redirects, 172 sitemap URLs |
| Staging SEO parity | PASS, 172 canonical routes, 0 critical failures; 146 объявленных изменений страницы/schema и 175 необязательных наблюдений link/alt перечислены в `SEO_PARITY_REPORT.md` |
| Staging crawlers | PASS, 9 user agents × 13 страниц и 3 static assets; transport `noindex, nofollow`, production canonicals |
| Guide PDF | PASS, HTTP 200, правильный MIME, 6 страниц, 4 054 383 bytes, опубликованный SHA256 совпадает с файлом; PDF/CSS/image получают preview `X-Robots-Tag` |
| npm audit | FAIL: 15 существующих уязвимостей — 1 critical, 12 high, 2 moderate; зависимости и lockfile этой веткой не изменены |
| Cloudflare rollback/reference parity | FAIL: старый `mnsdemo` reference отличается заголовками, содержимым Resources и числом JSON-LD блоков от согласованной новой версии; reference не изменялся |

Заявки в браузерных проверках замокированы; реальные заявки и заказы не создавались. Нативный Safari на физическом iPhone и доставку реальной заявки в CRM эта проверка не подтверждает.

`whatsappchat/` исключён из Git; browser artifacts, `output/` и посторонние локальные правки не включены в push. PR в `develop` автоматически создать не удалось: автоматическая проверка разрешений отклонила способ получения авторизации GitHub. Ветка опубликована; готовый переход для PR: https://github.com/Man9sua/thebasebev/compare/develop...possible_change?expand=1 .
