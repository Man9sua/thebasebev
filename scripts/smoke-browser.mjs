import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const chromePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactRoot = path.resolve(".visual-artifacts");
const firstTouchStorageKey = "thebase:first-touch-attribution:v1";
/** The homepage's first section below the hero — what "the page has arrived". */
const BESTSELLERS = "#bestsellers";
/**
 * Where "Buy" leaves for, read out of the source rather than repeated here: it
 * is per-country now, so a literal would turn every new country into a failing
 * smoke run.
 */
const SHOP_URL = /export const SHOP_URL = "([^"]+)"/
  .exec(fs.readFileSync("src/lib/site-config.ts", "utf8"))?.[1];
if (!SHOP_URL) {
  console.error("Could not read SHOP_URL out of src/lib/site-config.ts");
  process.exit(1);
}
const failures = [];
const pageErrors = [];
const hydrationErrors = [];
const localResponseErrors = [];

fs.mkdirSync(artifactRoot, { recursive: true });

function check(condition, message) {
  if (!condition) failures.push(message);
}

// React reports a hydration mismatch through `console.error`, not as a page
// error, so nothing here used to see it: every product page logged one for
// months while this smoke passed. The cause is always the same shape — the
// exported Tilda runtime rewriting a node React owns before React reaches it —
// and the report names the attributes, so it is worth failing on.
const hydrationMarkers = [
  "hydrated but some attributes",
  "Hydration failed",
  "did not match",
];

function observe(page, label) {
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (hydrationMarkers.some((marker) => text.includes(marker))) {
      hydrationErrors.push(`${label}: ${text.split("\n")[0]}`);
    }
  });
  page.on("pageerror", (error) => pageErrors.push(`${label}: ${error.message}`));
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (
      url.origin === baseUrl &&
      response.status() >= 400 &&
      url.pathname !== "/api/leads"
    ) {
      localResponseErrors.push(`${label}: ${response.status()} ${url.pathname}`);
    }
  });
}

async function checkCountrySelector(page, label) {
  await page.goto(`${baseUrl}/ae/?utm_source=chatgpt.com&utm_campaign=country-selector`, { waitUntil: "domcontentloaded" });
  const trigger = page.locator("header button[aria-label^='Country:']");
  const list = page.getByRole("listbox", { name: "Country", exact: true });
  async function openList() {
    for (let attempt = 0; attempt < 6 && (await trigger.getAttribute("aria-expanded")) !== "true"; attempt += 1) {
      await trigger.click();
      await page.waitForTimeout(200);
    }
    await list.waitFor({ state: "visible" });
  }
  await openList();
  check((await list.getByRole("option").count()) === 17, `${label}: country selector does not list the confirmed markets`);
  await list.press("End");
  const last = list.getByRole("option").last();
  check((await last.getAttribute("data-active")) === "true", `${label}: country selector End key did not reach the last market`);
  const lastBox = await last.boundingBox();
  check(!!lastBox && lastBox.y >= 0 && lastBox.y + lastBox.height <= page.viewportSize().height, `${label}: last country option is clipped`);
  await list.press("Home");
  await list.press("Enter");
  check((await trigger.getAttribute("aria-expanded")) === "false", `${label}: choosing the current country did not close the list`);
  check(await trigger.evaluate((button) => document.activeElement === button), `${label}: country selector did not return keyboard focus`);
  await trigger.click();
  await list.press("ArrowDown");
  await list.press("ArrowDown");
  await Promise.all([
    page.waitForURL((url) => url.pathname === "/ae/find-your-distributor" && url.searchParams.get("market") === "QA", { waitUntil: "domcontentloaded" }),
    list.press("Enter"),
  ]);
  const destination = new URL(page.url());
  check(destination.searchParams.get("utm_source") === "chatgpt.com" && destination.searchParams.get("utm_campaign") === "country-selector", `${label}: country selection lost campaign parameters`);
  await page.locator('button[aria-controls="distributor-details"][aria-pressed="true"]').filter({ hasText: "Qatar" }).waitFor();
  await page.goto(`${baseUrl}/ae/`, { waitUntil: "domcontentloaded" });
  await page.locator(BESTSELLERS).waitFor();
  await openList();
  await list.press("Escape");
  check((await trigger.getAttribute("aria-expanded")) === "false", `${label}: country selector Escape did not close the list`);
}

async function checkDistributorFinder(page, label, countryName, countryCode) {
  let capturedLead;
  await page.route("**/api/leads", async (route) => {
    capturedLead = route.request().postDataJSON();
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: "lead_backend_unavailable",
        message: "Lead delivery is temporarily unavailable. Please contact us directly.",
        requestId: "finder-smoke-mocked",
      }),
    });
  });
  await page.goto(`${baseUrl}/ae/find-your-distributor?market=AE`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    (storageKey) => sessionStorage.getItem(storageKey) !== null,
    firstTouchStorageKey,
  );
  const countries = page.locator('button[aria-controls="distributor-details"]');
  check((await countries.count()) === 17, `${label}: finder does not list all 17 markets`);
  const details = page.locator("#distributor-details");
  check(
    (await details.locator('a[href="tel:+971509890429"]').count()) === 1,
    `${label}: UAE contact phone missing`,
  );
  await page.goto(`${baseUrl}/ae/find-your-distributor?market=${countryCode}`, { waitUntil: "domcontentloaded" });
  await details.getByRole("heading", { name: "Partner details coming soon", exact: true }).waitFor();
  check(
    (await countries.filter({ hasText: countryName }).getAttribute("aria-pressed")) === "true",
    `${label}: market query did not preselect its country`,
  );
  const search = page.getByRole("searchbox", { name: "Search country" });
  await search.fill(countryName);
  check((await countries.count()) === 1, `${label}: country search did not narrow the list`);
  await countries.first().click();
  await details.getByRole("heading", { name: "Partner details coming soon", exact: true }).waitFor();
  check((await page.getByRole("navigation", { name: "Breadcrumb", exact: true }).count()) === 0, `${label}: finder breadcrumb row is still visible`);
  check((await details.getByText(/Official partner|Distribution in /).count()) === 0, `${label}: finder partner eyebrow is still present`);
  check(
    (await details.locator('a[href^="tel:"], a[href^="mailto:"]').count()) === 0,
    `${label}: pending market exposes unconfirmed contact details`,
  );
  check(
    ((await details.getByRole("link", { name: "WhatsApp UAE team" }).getAttribute("href")) ?? "")
      .startsWith("https://wa.me/971509890429?text="),
    `${label}: pending market does not offer the confirmed UAE contact fallback`,
  );
  await search.fill("No such country");
  check(await page.getByRole("status").isVisible(), `${label}: no-result search has no feedback`);
  await search.fill("");
  check((await countries.count()) === 17, `${label}: clearing country search did not restore the list`);
  const sampleButton = details.getByRole("button", { name: "Request samples", exact: true });
  check(await sampleButton.evaluate((button) => {
    const styles = getComputedStyle(button);
    return styles.backgroundColor === "rgba(0, 0, 0, 0)" && styles.color !== getComputedStyle(button.closest("section")).backgroundColor;
  }), `${label}: Request samples text is unreadable against its background`);
  await sampleButton.click();
  const form = page.locator("#sample-request-modal-form");
  await form.waitFor({ state: "visible" });
  check(
    (await form.locator('input[name="country"]').inputValue()) === countryCode,
    `${label}: sample form lost the selected market`,
  );
  await form.locator('input[name="name"]').fill("Browser Smoke");
  await form.locator('input[name="email"]').fill("smoke@example.com");
  await form.locator('input[name="Phone"]').fill("+971500000000");
  await form.locator('input[name="privacy-consent"]').evaluate((input) => {
    input.checked = true;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  const request = page.waitForRequest((candidate) => new URL(candidate.url()).pathname === "/api/leads");
  await form.evaluate((element) => element.requestSubmit());
  await request;
  await form.locator(".js-rule-error-all").filter({ hasText: /temporarily unavailable/i }).waitFor();
  check(
    capturedLead?.country === countryCode && capturedLead?.formType === "sample",
    `${label}: submitted sample lead lost its market or form type`,
  );
  check(
    await form.locator(".js-successbox").isHidden(),
    `${label}: failed delivery displayed a false success`,
  );
  await page.keyboard.press("Escape");
  check((await page.locator("#sample-request-modal-form").count()) === 0, `${label}: finder sample form did not close`);
  check(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    `${label}: finder has horizontal overflow`,
  );
}

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
});

try {
  const history = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const historyPage = await history.newPage();
  observe(historyPage, "history");
  await historyPage.goto(`${baseUrl}/ae/catalog`, { waitUntil: "domcontentloaded" });
  await historyPage.goto(`${baseUrl}/ae/matcha`, { waitUntil: "domcontentloaded" });
  await Promise.all([
    historyPage.waitForURL(`${baseUrl}/ae/catalog`, { waitUntil: "domcontentloaded" }),
    historyPage.evaluate(() => window.history.back()),
  ]);
  check(historyPage.url().endsWith("/catalog"), "navigation: browser Back did not restore catalog");
  await Promise.all([
    historyPage.waitForURL(`${baseUrl}/ae/matcha`, { waitUntil: "domcontentloaded" }),
    historyPage.evaluate(() => window.history.forward()),
  ]);
  check(historyPage.url().endsWith("/matcha"), "navigation: browser Forward did not restore product route");
  await history.close();
  console.log("Browser smoke phase passed: history");

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await desktop.newPage();
  observe(page, "desktop");

  // The homepage: a photographic hero, then the bestsellers carousel.
  // Navigation and the product grid moved out of the old hover mega-menu into
  // the full-screen menu panel, so they are asserted there rather than on hover.
  await page.goto(`${baseUrl}/ae/`, { waitUntil: "domcontentloaded" });
  await page.locator(BESTSELLERS).waitFor();
  // Nothing covers the page any more — the loading screen is gone — so this is
  // just a frame for the hero and the scene controller to settle in before the
  // first desktop wheel event.
  await page.waitForTimeout(250);

  // The hero is one photograph anchored to the right edge with the copy held on
  // the left. It replaced a marquee of product tiles, so the rail assertions are
  // gone; what still matters is that it is a picture and not video, that the
  // picture runs the height of the frame and takes the half the copy does not,
  // and that the one above-the-fold CTA still opens the range.
  const hero = page.locator("section[data-hero]");
  check((await hero.locator("video").count()) === 0, "home: hero must not use video");
  const heroImage = hero.locator("img").first();
  check((await heroImage.count()) === 1, "home: hero is missing its photograph");
  const heroImageBox = await heroImage.boundingBox();
  const view = page.viewportSize();
  check(
    !!heroImageBox && heroImageBox.x + heroImageBox.width >= view.width - 1,
    `home: hero photograph must reach the right edge (ends at ${Math.round(
      (heroImageBox?.x ?? 0) + (heroImageBox?.width ?? 0),
    )} of ${view.width})`,
  );
  check(
    !!heroImageBox && heroImageBox.width > view.width * 0.5,
    `home: hero photograph must take at least half the frame (got ${Math.round(heroImageBox?.width ?? 0)} of ${view.width})`,
  );
  check(
    !!heroImageBox && heroImageBox.height > view.height * 0.6,
    `home: hero photograph is too short (${Math.round(heroImageBox?.height ?? 0)}px of ${view.height})`,
  );
  check(
    (await hero.locator("a[href='/ae/catalog']").count()) > 0,
    "home: hero CTA must point at the catalog",
  );
  // The bar carries the vertical mark — the near-square one the design file
  // draws — rather than the landscape lockup the live site still uses. It
  // carries its own two colours, so it no longer takes part in the bar's colour
  // interpolation; what it has to be is present, and at the file's own height.
  const headerMark = await page.evaluate(() => {
    const el = document.querySelector('header a[href="/ae"] svg[data-brand-mark="vertical"]');
    return el ? el.getBoundingClientRect().height : 0;
  });
  check(headerMark > 0, "header: stacked BASE mark missing");
  check(
    headerMark >= 36,
    `header: the mark collapsed (height ${Math.round(headerMark)})`,
  );

  check(
    (await page.locator(`${BESTSELLERS} [aria-roledescription='slide']`).count()) === 5,
    "home: expected five bestseller slides",
  );
  check(
    (await page.locator(`${BESTSELLERS} [aria-current]`).count()) === 5,
    "home: expected five bestseller dots",
  );
  check(
    (await page.locator("h1").count()) === 1,
    "home: expected exactly one h1",
  );
  check(
    /^Premium\s+.+\s+Bases\b/.test(((await page.locator("h1").textContent()) ?? "").trim()),
    "home: h1 must keep the production wording (Premium … Bases)",
  );

  // The homepage uses the browser's natural document scroll. Verify that a
  // desktop wheel actually moves it before bringing the carousel into view.
  const initialScrollY = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 600);
  await page.waitForFunction((start) => window.scrollY > start + 4, initialScrollY);
  await page.locator(BESTSELLERS).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.locator(`${BESTSELLERS} [aria-label='Next product']`).click();
  await page.waitForTimeout(900);
  check(
    (await page
      .locator(
        `${BESTSELLERS} .is-active, ${BESTSELLERS} [aria-hidden='false'][aria-roledescription='slide']`,
      )
      .first()
      .getAttribute("aria-label"))?.startsWith("2 of 5"),
    "home: next arrow did not activate slide two",
  );

  // Guides and tools: a native overflow scroller, so the arrows move it and a
  // vertical wheel over it must still scroll the page. It carries the five
  // pages the design names, with the newest article behind them.
  const rail = page.locator("section[aria-labelledby='reading-title'] [data-native-scroll]");
  await rail.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  check(
    (await rail.locator("[data-card]").count()) === 6,
    "reading: expected six cards on the rail",
  );
  check(
    (await rail.locator("a[href='/ae/wholesale-strategy']").count()) === 1 &&
      (await rail.locator("a[href^='/ae/tpost/']").count()) === 1,
    "reading: the rail lost either its guides or its article",
  );
  check(
    await rail.evaluate((el) => el.scrollWidth > el.clientWidth + 100),
    "reading: rail is not horizontally scrollable",
  );

  const railNext = page.locator(
    "section[aria-labelledby='reading-title'] button[aria-label='Scroll right']",
  );
  check(
    await page
      .locator("section[aria-labelledby='reading-title'] button[aria-label='Scroll left']")
      .isDisabled(),
    "reading: left arrow should start disabled",
  );
  await railNext.click();
  await page.waitForTimeout(1_200);
  check(
    (await rail.evaluate((el) => el.scrollLeft)) > 100,
    "reading: right arrow did not advance the rail",
  );
  check(
    !(await page
      .locator("section[aria-labelledby='reading-title'] button[aria-label='Scroll left']")
      .isDisabled()),
    "reading: left arrow should enable once scrolled",
  );

  // The progress thumb tracks the rail rather than sitting still.
  const thumbShift = await page
    .locator("section[aria-labelledby='reading-title'] [class*='thumb']")
    .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
  check(thumbShift > 5, "reading: progress indicator did not follow the rail");

  // A vertical wheel over the rail must scroll the page, not be swallowed.
  const beforeY = await page.evaluate(() => window.scrollY);
  await rail.hover();
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(700);
  check(
    (await page.evaluate(() => window.scrollY)) > beforeY + 50,
    "reading: rail swallowed vertical scrolling",
  );

  // The brand film, which is the whole reason this page came back. It is
  // ambient — muted, looping, no controls — and it arms on intersection, so the
  // source is only attached once the frame is approached; hence the scroll
  // before the check rather than a look at the initial markup.
  const film = page.locator("section#about video");
  await film.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  check((await film.count()) === 1, "home: the brand film is missing from About");
  check(
    (await film.getAttribute("src")) === "/video/base-film.mp4",
    "home: the brand film never attached its source",
  );
  check(
    (await film.getAttribute("poster")) === "/video/base-film-poster.jpg",
    "home: the brand film has no frame to stand on until it arrives",
  );
  check(
    (await film.evaluate((video) => video.loop && video.muted && !video.controls)) === true,
    "home: the brand film should be an ambient loop, not a player",
  );

  /*
   * The footer closes on the brand mark. The check that it fits stays — it
   * began as the word BASE sized in `vw`, which includes the scrollbar, and its
   * final E ran off the right edge on desktop only.
   *
   * What it is has changed twice. It is now `BrandMarkStacked`, a portrait
   * block with BASE broken across two rows, standing at the head of the brand
   * column rather than closing the page on a band of its own. The share of the
   * viewport it takes is the measure's business; what this asserts is that it
   * is there, that it does not spill past the page, and that it is a watermark
   * rather than a few collapsed pixels.
   */
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(900);
  const closingMark = await page.evaluate(() => {
    const el = document.querySelector('footer svg[data-brand-mark="stacked"]');
    if (!el) return null;
    const box = el.getBoundingClientRect();
    return {
      left: box.left,
      right: box.right,
      height: box.height,
      cw: document.documentElement.clientWidth,
    };
  });
  check(!!closingMark, "footer: stacked brand mark not found");
  check(
    !!closingMark && closingMark.left >= -2 && closingMark.right <= closingMark.cw + 2,
    `footer: brand mark overflows (${Math.round(closingMark?.left ?? 0)}..${Math.round(closingMark?.right ?? 0)} of ${closingMark?.cw})`,
  );
  check(
    !!closingMark && closingMark.height > 90,
    `footer: brand mark collapsed (height ${Math.round(closingMark?.height ?? 0)})`,
  );
  check(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    "home: horizontal overflow on the page",
  );
  // Walking the sections scrolled the page; come back to the top so the header
  // is over the hero and in the state the checks below expect. The bar itself
  // no longer moves — it is fixed once it has turned to paper.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);

  // Country selection must reach existing destinations and retain campaign data.
  check(
    (await page.locator("header button[aria-label^='Region:']").count()) === 0,
    "header: the old region picker is back in the bar",
  );
  check(
    await page.locator("header button[aria-label^='Country:']").isVisible(),
    "header: country selector is missing",
  );
  check(
    (await page.locator('header a[href="/ae/find-your-distributor"]').count()) === 0,
    "header: country selector was not restored in place of the finder button",
  );

  await checkCountrySelector(page, "desktop");
  check(
    (await page.evaluate(() =>
      [...document.querySelectorAll("a[href]")].filter((a) =>
        /^\/(?:sa|kz|ru|uk)(?:[/?#]|$)/.test(a.getAttribute("href") ?? ""),
      ).length,
    )) === 0,
    "home: the page links to a market that has no routes",
  );

  // Everything the old mega-menu linked to now lives in the menu panel.
  await page.locator("header button[aria-label='Open menu']").click();
  await page.waitForTimeout(900);
  const menu = page.locator("#site-menu");
  check(
    await menu.evaluate((el) => getComputedStyle(el).clipPath === "inset(0px)"),
    "header: menu panel did not open",
  );
  check(
    (await menu.locator("a[href^='/']").evaluateAll((links) => new Set(links.map((a) => a.getAttribute("href"))).size)) >= 24,
    "header: menu lost links the mega-menu used to expose",
  );
  check(
    (await menu.locator("a[href='/cabinet']").count()) === 0,
    "header: cabinet link leaked into desktop navigation",
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);

  await page.evaluate(() => window.scrollTo(0, 1200));
  // The bar cross-fades over --tbb-dur (720ms); sample after it settles.
  await page.waitForTimeout(1_100);
  const headerState = await page.locator("header").evaluate((el) => ({
    color: getComputedStyle(el).color,
    panel: getComputedStyle(el, "::after").transform,
  }));
  check(
    // Guidebook p.15: ink is 000000.
    headerState.color === "rgb(0, 0, 0)",
    `header: scrolled state was not applied (${JSON.stringify(headerState)})`,
  );

  await page.goto(`${baseUrl}/ae/catalog`, { waitUntil: "domcontentloaded" });
  await page.locator("[data-catalog-card]").first().waitFor();
  await page.waitForTimeout(1_200);
  check((await page.locator("[data-catalog-card]").count()) === 22, "catalog: expected 22 product cards");
  check((await page.locator("[data-catalog-price]").count()) === 22, "catalog: expected a price or request label on every card");
  for (const slug of ["puree", "sauce", "add-ons", "electrolyte"]) {
    check(
      (await page.locator(`[data-catalog-card][data-product-slug="${slug}"] img`).count()) === 0,
      `catalog: ${slug} shows an unconfirmed product image`,
    );
  }
  const catalogPrices = await page.locator("[data-catalog-card]").evaluateAll((cards) =>
    Object.fromEntries(
      cards.map((card) => [
        card.querySelector("[data-catalog-name]")?.textContent?.trim() ?? "",
        card.querySelector("[data-catalog-price]")?.textContent?.trim() ?? "",
      ]),
    ),
  );
  const expectedCatalogPrices = {
    Milkshake: "45.38 AED",
    Frappe: "49.40 AED",
    "Iced Tea": "42.81 AED",
    Cordial: "50.15 AED",
    "Raf Coffee": "38.74 AED",
    "Chai Latte": "52.05 AED",
    Matcha: "70.42 AED",
    Chocolate: "67.88 AED",
    "Cream Latte": "38.76 AED",
    Jam: "64.94 AED",
    Topping: "Price on request",
    Garnish: "4.91 AED",
    Syrup: "48.82 AED",
    Tea: "Price on request",
    "Sugar Free": "14.22 AED",
    Vending: "Price on request",
    Electrolyte: "Price on request",
  };
  for (const [name, expectedPrice] of Object.entries(expectedCatalogPrices)) {
    check(catalogPrices[name] === expectedPrice, `catalog: ${name} price changed`);
  }
  check((await page.locator("[data-catalog-filters] button").count()) === 5, "catalog: expected All plus four filters");
  check(
    !(await page.locator("#rec2839951603 .js-store-grid-cont-preloader").isVisible()),
    "catalog: hidden Tilda store preloader leaked into the public grid",
  );
  await page.locator('[data-catalog-filters] button[data-f="Cold & Refreshing"]').click();
  check((await page.locator("[data-catalog-card]").count()) === 4, "catalog: cold filter did not leave four cards");

  // The catalogue sends buying off-site; the shelf must point where the source
  // says, which is per-country and no longer Odoo — see `SHOP_URL`.
  check(
    (await page.locator("[data-catalog-card] [data-shop-link]").count()) > 0,
    "catalog: no card offers the shop",
  );
  check(
    (await page.locator("[data-catalog-card] [data-shop-link]").first().getAttribute("href")) ===
      SHOP_URL,
    "catalog: Buy does not point at the shop",
  );
  check(
    (await page.locator("[data-catalog-card] [data-cart-add]").count()) === 0,
    "catalog: the shelf still carries an add-to-cart control",
  );

  await page.goto(`${baseUrl}/ae/matcha`, { waitUntil: "domcontentloaded" });
  await page.locator("h1").first().waitFor();
  await page.waitForTimeout(1_200);
  check(/Matcha/i.test((await page.locator("h1").first().textContent()) ?? ""), "matcha: unexpected H1");
  const productImage = page.locator("main img").first();
  check(await productImage.isVisible(), "matcha: supplied product hero image is not visible");
  check(
    await productImage.evaluate((image) => image.complete && image.naturalWidth > 0),
    "matcha: supplied product hero image failed to load",
  );
  const hiddenProductContent = await page.locator("main .t-animate").evaluateAll((elements) =>
    elements.filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 24 && rect.height > 24 &&
        (style.opacity === "0" || style.visibility === "hidden");
    }).length,
  );
  check(
    hiddenProductContent === 0,
    `matcha: ${hiddenProductContent} meaningful product elements stayed hidden`,
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("h1").first().waitFor();
  check(
    /Matcha/i.test((await page.locator("h1").first().textContent()) ?? ""),
    "matcha: product content failed after a hard refresh",
  );
  // The hero's two calls to action are React modals now rather than the
  // export's popup anchors, so this no longer waits for `a[href="#sample"]`.
  // What has to hold is not that a dialog opens but that the form inside it is
  // one the lead bridge owns: `tildaspec-formname` is how
  // `LeadAttributionBridge` decides to post a submission to `/api/leads`
  // instead of leaving it to a Tilda runtime that is not on this page.
  await page.getByRole("button", { name: "Request a sample" }).first().click();
  await page.locator("#sample-request-modal-form").waitFor({ state: "visible" });
  check(
    (await page
      .locator('#sample-request-modal-form input[name="tildaspec-formname"]')
      .inputValue()) === "Free Sample",
    "matcha: the sample modal carries a form name the lead bridge does not own",
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  check(
    (await page.locator("#sample-request-modal-form").count()) === 0,
    "matcha: the sample modal did not close on Escape",
  );
  check(
    (await page.evaluate(() => document.documentElement.style.overflow)) !== "hidden",
    "matcha: the sample modal left the page scroll locked",
  );

  // Product pages collect enquiries; buying happens off-site, and the bar
  // offers the account on the platform that does it rather than a basket.
  check(
    (await page.locator("[data-cart-add]").count()) === 0,
    "matcha: product page still has an add-to-cart control",
  );
  check(
    (await page.locator('header a[aria-label^="Cart"]').count()) === 0,
    "matcha: the bar still carries a cart",
  );
  check(
    (
      (await page.locator('header a[aria-label="Your account"]').first().getAttribute("href")) ?? ""
    ).startsWith("https://odoo."),
    "matcha: the bar's account link does not lead to Odoo",
  );
  // The product-page redesign drops "Request pricing" (prices and the pricing
  // form are gone from the mocks) for "Find your distributor", a plain link.
  // The sample request above stays the page's lead form.
  check(
    (await page.getByRole("button", { name: "Request pricing" }).count()) === 0,
    "matcha: the redesigned page still offers the removed pricing form",
  );
  check(
    (await page.getByRole("link", { name: "Find your distributor" }).first().getAttribute("href")) ===
      "/ae/find-your-distributor",
    "matcha: Find your distributor does not lead to the finder page",
  );
  // Browser smoke must be safe against a credentialed staging environment.
  // Mock only the same-origin lead boundary so the UX and attribution path are
  // exercised without creating a real CRM lead or contacting any recipient.
  await page.route("**/api/leads", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      headers: { "Cache-Control": "no-store" },
      body: JSON.stringify({
        ok: false,
        error: "lead_backend_unavailable",
        message: "Lead delivery is temporarily unavailable. Please contact us directly.",
        requestId: "browser-smoke-mocked",
      }),
    });
  });

  await page.evaluate((storageKey) => sessionStorage.removeItem(storageKey), firstTouchStorageKey);
  await page.goto(`${baseUrl}/ae/?utm_source=chatgpt.com&utm_campaign=browser-smoke`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator(BESTSELLERS).waitFor();

  /*
   * The homepage carried a distributor form while it was the eight-section
   * redesign, and this is where its failure path was exercised. The page has
   * no form of its own again, so the mocked 503 is proved against /contacts
   * below instead — the landing is still loaded here, because the first touch
   * it records is what the attribution check at the end reads.
   */
  await page.goto(`${baseUrl}/ae/contacts`, {
    waitUntil: "domcontentloaded",
  });
  const contactForm = page.locator("#form860957415");
  await contactForm.waitFor();
  // LeadAttributionBridge adds this readonly field when it arms the native form.
  await contactForm.locator('input[name="company_website"][readonly]').waitFor({ state: "attached" });
  await contactForm.locator('input[name="name"]').fill("Browser Smoke");
  await contactForm.locator('input[name="company"]').fill("THE BASE QA");
  await contactForm.locator('input[name="email"]').fill("smoke@example.com");
  await contactForm.locator('input[name="Phone"]').fill("500000000");
  await contactForm.locator('input[name="country"]').fill("United Arab Emirates");
  await contactForm.locator('textarea[name="text"]').fill("Browser-safe form error UX check.");
  const consent = contactForm.locator('input[name="privacy-consent"]');
  if (await consent.count()) {
    await consent.evaluate((input) => {
      input.checked = true;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
  const contactResponse = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/leads");
  await contactForm.evaluate((form) => form.requestSubmit());
  await contactResponse;
  // Waited for rather than slept through: the message arrives when the lead
  // round-trip fails, and against a deployed Worker that is sometimes longer
  // than a fixed pause. One run in four failed here on a site whose forms had
  // not been touched.
  const contactError = contactForm.locator(".js-rule-error-all");
  await contactError
    .filter({ hasText: /temporarily unavailable/i })
    .waitFor({ state: "attached", timeout: 10_000 })
    .catch(() => {});
  check(
    /temporarily unavailable/i.test((await contactError.textContent()) ?? ""),
    "contacts: unconfigured lead backend did not show an honest error",
  );
  const attribution = await page.evaluate(
    (storageKey) => JSON.parse(sessionStorage.getItem(storageKey) ?? "null"),
    firstTouchStorageKey,
  );
  check(attribution?.utm_source === "chatgpt.com", "contacts: chatgpt.com attribution was not retained");
  check(
    (await page.locator('link[rel="canonical"]').first().getAttribute("href")) ===
      "https://thebasebev.com/ae/contacts",
    "contacts: canonical was changed after hydration",
  );

  await checkDistributorFinder(page, "desktop", "Saudi Arabia", "SA");

  await desktop.close();
  console.log("Browser smoke phase passed: desktop interactions");

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  observe(mobilePage, "mobile");
  await mobilePage.goto(`${baseUrl}/ae/`, { waitUntil: "domcontentloaded" });
  // On a remote Worker the static HTML can arrive before its client chunks.
  // The attribution bridge writes this key from a React effect, giving the
  // smoke test a deterministic hydration signal before it clicks the menu.
  await mobilePage.waitForFunction(
    (storageKey) => sessionStorage.getItem(storageKey) !== null,
    firstTouchStorageKey,
  );
  await checkCountrySelector(mobilePage, "mobile");
  const mobileBurger = mobilePage.locator("header button[aria-label='Open menu']");
  await mobileBurger.waitFor();
  // The button ships in the server HTML, so it is clickable well before React
  // has hydrated and an early click is simply dropped. On localhost hydration
  // wins that race every time; against a deployed Worker it loses it every
  // time, which read as a broken menu rather than as a test clicking too soon.
  // So click until the menu answers, giving each click room to finish its
  // transition before deciding it went nowhere.
  const mobileMenu = mobilePage.locator("#site-menu");
  const menuIsOpen = () =>
    mobileMenu.evaluate((el) => getComputedStyle(el).clipPath === "inset(0px)");
  let mobileMenuOpen = false;
  for (let attempt = 0; attempt < 6 && !mobileMenuOpen; attempt += 1) {
    // Once it opens the button relabels itself to "Close menu" and this locator
    // stops matching — which only happens after the loop has already won.
    await mobileBurger.click({ timeout: 5_000 }).catch(() => {});
    for (let tick = 0; tick < 8 && !mobileMenuOpen; tick += 1) {
      await mobilePage.waitForTimeout(250);
      mobileMenuOpen = await menuIsOpen();
    }
  }
  check(mobileMenuOpen, "mobile: burger menu did not open");
  // Cabinet is no longer public.
  check(
    (await mobilePage.locator("a[href='/cabinet']").count()) === 0,
    "mobile: cabinet link leaked into public navigation",
  );
  check(
    (await mobilePage.locator("#site-menu a[href='/ae/contacts']").count()) >= 1,
    "mobile: contact link missing from the menu",
  );
  check(
    (await mobilePage.locator("#site-menu button[aria-label^='Region:']").count()) === 0,
    "mobile: the old region picker is back in the menu",
  );
  check(
    await mobilePage.locator("header button[aria-label^='Country:']").isVisible(),
    "mobile: country selector is missing",
  );
  check(
    await mobileMenu.getByRole("link", { name: "Find your distributor", exact: true }).isVisible(),
    "mobile: menu lacks the distributor finder button",
  );
  await checkDistributorFinder(mobilePage, "mobile", "Kyrgyzstan", "KG");
  await mobile.close();
  console.log("Browser smoke phase passed: mobile interactions");

  const viewports = [
    { width: 1920, height: 1080 },
    { width: 1536, height: 864 },
    { width: 1440, height: 900 },
    { width: 1366, height: 768 },
    { width: 1280, height: 900 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 430, height: 932 },
    { width: 414, height: 896 },
    { width: 390, height: 844 },
    { width: 375, height: 812 },
    { width: 360, height: 800 },
    { width: 320, height: 720 },
  ];
  const visual = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const visualPage = await visual.newPage();
  for (const { width, height } of viewports) {
    await visualPage.setViewportSize({ width, height });
    await visualPage.goto(`${baseUrl}/ae/`, { waitUntil: "domcontentloaded" });
    await visualPage.locator(BESTSELLERS).waitFor();
    await visualPage.waitForTimeout(3_500);
    check(
      await visualPage.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      ),
      `home: horizontal overflow at ${width}x${height}`,
    );
    await visualPage.screenshot({
      path: path.join(artifactRoot, `home-${width}x${height}.png`),
      fullPage: false,
    });
    const countrySelector = visualPage.locator("header button[aria-label^='Country:']");
    check(
      await countrySelector.isVisible(),
      `header: country selector is missing at ${width}x${height}`,
    );
  }
  await visual.close();
  console.log("Browser smoke phase passed: responsive captures");

  const reduced = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const reducedPage = await reduced.newPage();
  observe(reducedPage, "reduced-motion");
  // These fallbacks are CSS-driven. On a remote origin DOMContentLoaded can
  // precede the last render-blocking stylesheet in Playwright's no-JS context,
  // which observes a transient browser-default `display: block` that a real
  // painted frame never exposes. Assert once the document and its styles are
  // render-ready instead of racing the stylesheet response.
  await reducedPage.goto(`${baseUrl}/ae/`, { waitUntil: "load" });
  check(
    await reducedPage.locator("section[data-hero] h1").isVisible(),
    "reduced-motion: homepage hero content is not immediately visible",
  );
  await reduced.close();
  console.log("Browser smoke phase passed: reduced motion");

  const noScript = await browser.newContext({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false,
  });
  const noScriptPage = await noScript.newPage();
  observe(noScriptPage, "no-script");
  await noScriptPage.goto(`${baseUrl}/ae/`, { waitUntil: "load" });
  check(
    await noScriptPage.locator("section[data-hero] h1").isVisible(),
    "no-script: homepage hero content is not visible",
  );
  await noScript.close();
  console.log("Browser smoke phase passed: no JavaScript");

} finally {
  await browser.close();
}

for (const error of [...new Set(pageErrors)]) failures.push(`pageerror: ${error}`);
for (const error of [...new Set(hydrationErrors)]) failures.push(`hydration: ${error}`);
for (const error of [...new Set(localResponseErrors)]) failures.push(`response: ${error}`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Browser smoke passed: hero, header, distributor finder, menu, bestsellers, reading rail, the brand film, catalog filters/framing, product enquiries, visible product content, clean hydration, real-signal loading, reduced-motion/no-JS fallbacks, form error UX, and UTM attribution.");
  console.log(`Captured thirteen homepage viewports in ${artifactRoot}.`);
}
