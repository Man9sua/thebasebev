import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const chromePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactRoot = path.resolve(".visual-artifacts");
const firstTouchStorageKey = "thebase:first-touch-attribution:v1";
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

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
});

try {
  const history = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const historyPage = await history.newPage();
  observe(historyPage, "history");
  await historyPage.goto(`${baseUrl}/catalog`, { waitUntil: "domcontentloaded" });
  await historyPage.goto(`${baseUrl}/matcha`, { waitUntil: "domcontentloaded" });
  await Promise.all([
    historyPage.waitForURL(`${baseUrl}/catalog`, { waitUntil: "domcontentloaded" }),
    historyPage.evaluate(() => window.history.back()),
  ]);
  check(historyPage.url().endsWith("/catalog"), "navigation: browser Back did not restore catalog");
  await Promise.all([
    historyPage.waitForURL(`${baseUrl}/matcha`, { waitUntil: "domcontentloaded" }),
    historyPage.evaluate(() => window.history.forward()),
  ]);
  check(historyPage.url().endsWith("/matcha"), "navigation: browser Forward did not restore product route");
  await history.close();
  console.log("Browser smoke phase passed: history");

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await desktop.newPage();
  observe(page, "desktop");

  // The homepage is the redesigned surface: a photographic hero, then the
  // Bestsellers carousel. Navigation, product grid and the region picker moved
  // out of the old hover mega-menu into the full-screen menu panel, so they are
  // asserted there rather than on hover.
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.locator("#bestsellers").waitFor();
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
    (await hero.locator("a[href='/catalog']").count()) > 0,
    "home: hero CTA must point at the catalog",
  );
  // The header carries the original Tilda path geometry inline so the small
  // `the` mark can interpolate with the header surface colour.
  check(
    (await page.locator("header a[href='/'] svg[data-brand-logo][viewBox='0 0 175 80']").count()) === 1,
    "header: original BASE logo asset missing",
  );

  check(
    (await page.locator("#bestsellers [aria-roledescription='slide']").count()) === 5,
    "home: expected five bestseller slides",
  );
  check(
    (await page.locator("#bestsellers [aria-current]").count()) === 5,
    "home: expected five bestseller dots",
  );
  check(
    (await page.locator("h1").count()) === 1,
    "home: expected exactly one h1",
  );
  check(
    /^Premium\s+.+\s+Bases$/.test(((await page.locator("h1").textContent()) ?? "").trim()),
    "home: h1 must keep the production wording (Premium … Bases)",
  );

  // The homepage uses the browser's natural document scroll. Verify that a
  // desktop wheel actually moves it before bringing the carousel into view.
  const initialScrollY = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 600);
  await page.waitForFunction((start) => window.scrollY > start + 4, initialScrollY);
  await page.locator("#bestsellers").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.locator("#bestsellers [aria-label='Next product']").click();
  await page.waitForTimeout(900);
  check(
    (await page.locator("#bestsellers .is-active, #bestsellers [aria-hidden='false'][aria-roledescription='slide']")
      .first()
      .getAttribute("aria-label"))?.startsWith("2 of 5"),
    "home: next arrow did not activate slide two",
  );

  // Horizontal reading rail: a native overflow scroller, so the arrows move it
  // and vertical wheel over it must still scroll the page.
  const rail = page.locator("section[aria-labelledby='reading-title'] [data-native-scroll]");
  await rail.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  check(
    (await rail.locator("[data-card]").count()) === 6,
    "reading: expected six cards after the Blog card removal",
  );
  check(
    (await rail.locator("a[href='/resources/blog']").count()) === 0,
    "reading: removed Blog card returned to the rail",
  );
  check(
    await rail.evaluate((el) => el.scrollWidth > el.clientWidth + 100),
    "reading: rail is not horizontally scrollable",
  );

  const railNext = page.locator("section[aria-labelledby='reading-title'] button[aria-label='Scroll right']");
  check(
    await page.locator("section[aria-labelledby='reading-title'] button[aria-label='Scroll left']").isDisabled(),
    "reading: left arrow should start disabled",
  );
  await railNext.click();
  await page.waitForTimeout(1_200);
  check(
    (await rail.evaluate((el) => el.scrollLeft)) > 100,
    "reading: right arrow did not advance the rail",
  );
  check(
    !(await page.locator("section[aria-labelledby='reading-title'] button[aria-label='Scroll left']").isDisabled()),
    "reading: left arrow should enable once scrolled",
  );

  // The progress thumb tracks the rail rather than sitting still.
  const thumbShift = await page.locator("section[aria-labelledby='reading-title'] [class*='thumb']")
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

  // The footer wordmark must fit. It was sized in `vw`, which includes the
  // scrollbar, so the final E ran off the right edge on desktop only.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(900);
  const wordmark = await page.evaluate(() => {
    const el = [...document.querySelectorAll("footer *")]
      .find((e) => e.textContent.trim() === "BASE" && e.children.length === 0);
    if (!el) return null;
    const range = document.createRange();
    range.selectNodeContents(el);
    const box = range.getBoundingClientRect();
    const cw = document.documentElement.clientWidth;
    return { left: box.left, right: box.right, cw, share: box.width / cw };
  });
  check(!!wordmark, "footer: BASE wordmark not found");
  check(
    !!wordmark && wordmark.left >= -2 && wordmark.right <= wordmark.cw + 2,
    `footer: BASE wordmark overflows (${Math.round(wordmark?.left ?? 0)}..${Math.round(wordmark?.right ?? 0)} of ${wordmark?.cw})`,
  );
  check(
    !!wordmark && wordmark.share > 0.7,
    "footer: BASE wordmark should span most of the width",
  );
  check(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    "home: horizontal overflow on the page",
  );
  // Clicking a carousel control scrolls the page; come back to the top so the
  // header is over the hero and in the state the checks below expect. The bar
  // itself no longer moves — it is fixed once it has turned to paper.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);

  // Region picker — ported from production, still display-only.
  const region = page.locator("header button[aria-label^='Region:']");
  await region.click();
  await page.waitForTimeout(200);
  check(
    (await page.locator("header [role='listbox'][aria-label='Regions'] [role='option']").count()) === 5,
    "header: region panel did not list five regions",
  );
  await page.locator("header [role='listbox'][aria-label='Regions'] [role='option']").nth(2).click();
  await page.waitForTimeout(200);
  check(
    ((await region.textContent()) ?? "").includes("KZ"),
    "header: region selection did not update",
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

  await page.goto(`${baseUrl}/catalog`, { waitUntil: "domcontentloaded" });
  await page.locator("[data-catalog-card]").first().waitFor();
  await page.waitForTimeout(1_200);
  check((await page.locator("[data-catalog-card]").count()) === 16, "catalog: expected 16 product cards");
  check((await page.locator("[data-catalog-price]").count()) === 16, "catalog: expected a price or request label on every card");
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

  await page.locator("[data-catalog-card] [data-cart-add]").first().click();
  await page.waitForTimeout(200);
  const cartProducts = await page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem("thebase:cart:v1") ?? "[]");
    } catch {
      return [];
    }
  });
  check(cartProducts.length === 1, "catalog: add-to-cart did not create one cart item");
  check(cartProducts[0]?.slug === "milkshake", "catalog: unexpected cart product");
  check(cartProducts[0]?.quantity === 1, "catalog: cart quantity changed");
  await page.locator(String.raw`header a[aria-label^="Cart"]`).first().click();
  await page.waitForURL(`${baseUrl}/checkout`);
  const checkoutText = await page.locator("main").textContent();
  check(/Milkshake/i.test(checkoutText ?? ""), "catalog: checkout page lost the selected product");
  check(/45\.38/.test(checkoutText ?? ""), "catalog: checkout page did not preserve the selected price");

  await page.goto(`${baseUrl}/matcha`, { waitUntil: "domcontentloaded" });
  await page.locator("h1").first().waitFor();
  await page.waitForTimeout(1_200);
  check(/Matcha/i.test((await page.locator("h1").first().textContent()) ?? ""), "matcha: unexpected H1");
  check((await page.locator("img").count()) > 10, "matcha: expected product imagery");
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
  await page.locator('a[href="#sample"]').first().click();
  await page.waitForTimeout(500);
  check(
    await page.locator("#form1855223381").isVisible(),
    "matcha: Place order did not open the shared Free Sample form",
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
  await page.goto(`${baseUrl}/?utm_source=chatgpt.com&utm_campaign=browser-smoke`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator("#bestsellers").waitFor();
  await page.goto(`${baseUrl}/contacts`, {
    waitUntil: "domcontentloaded",
  });
  const contactForm = page.locator("#form860957415");
  await contactForm.waitFor();
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
  await contactForm.evaluate((form) => form.requestSubmit());
  await page.waitForTimeout(700);
  check(
    /temporarily unavailable/i.test((await contactForm.locator(".js-rule-error-all").textContent()) ?? ""),
    "contacts: unconfigured lead backend did not show an honest error",
  );
  const attribution = await page.evaluate(
    (storageKey) => JSON.parse(sessionStorage.getItem(storageKey) ?? "null"),
    firstTouchStorageKey,
  );
  check(attribution?.utm_source === "chatgpt.com", "contacts: chatgpt.com attribution was not retained");
  check(
    (await page.locator('link[rel="canonical"]').first().getAttribute("href")) ===
      "https://thebasebev.com/contacts",
    "contacts: canonical was changed after hydration",
  );

  await desktop.close();
  console.log("Browser smoke phase passed: desktop interactions");

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  observe(mobilePage, "mobile");
  await mobilePage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  // On a remote Worker the static HTML can arrive before its client chunks.
  // The attribution bridge writes this key from a React effect, giving the
  // smoke test a deterministic hydration signal before it clicks the menu.
  await mobilePage.waitForFunction(
    (storageKey) => sessionStorage.getItem(storageKey) !== null,
    firstTouchStorageKey,
  );
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
  // Cabinet is no longer public. The region picker still moves from the bar
  // into the menu on small screens.
  check(
    (await mobilePage.locator("a[href='/cabinet']").count()) === 0,
    "mobile: cabinet link leaked into public navigation",
  );
  check(
    (await mobilePage.locator("#site-menu a[href='/contacts']").count()) >= 1,
    "mobile: contact link missing from the menu",
  );
  check(
    (await mobilePage.locator("#site-menu button[aria-label^='Region:']").count()) === 1,
    "mobile: region picker missing from the menu",
  );
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
    await visualPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await visualPage.locator("#bestsellers").waitFor();
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
  await reducedPage.goto(`${baseUrl}/`, { waitUntil: "load" });
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
  await noScriptPage.goto(`${baseUrl}/`, { waitUntil: "load" });
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
  console.log("Browser smoke passed: hero, header, region picker, menu, bestsellers, reading rail, catalog filters/framing, cart, visible product content, clean hydration, real-signal loading, reduced-motion/no-JS fallbacks, form error UX, and UTM attribution.");
  console.log(`Captured thirteen homepage viewports in ${artifactRoot}.`);
}
