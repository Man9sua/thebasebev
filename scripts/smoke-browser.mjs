import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const chromePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactRoot = path.resolve(".visual-artifacts");
const failures = [];
const pageErrors = [];
const localResponseErrors = [];

fs.mkdirSync(artifactRoot, { recursive: true });

function check(condition, message) {
  if (!condition) failures.push(message);
}

function observe(page, label) {
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
  args: ["--disable-background-networking", "--disable-component-update", "--disable-sync"],
});

try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await desktop.newPage();
  observe(page, "desktop");

  // The homepage is the redesigned surface: a video hero, then the Bestsellers
  // carousel. Navigation, product grid and the region picker moved out of the
  // old hover mega-menu into the full-screen menu panel, so they are asserted
  // there rather than on hover.
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.locator("#bestsellers").waitFor();
  await page.waitForTimeout(900);

  // The hero is a marquee of pre-composed product cards: no video, a rail that
  // is rendered twice so the loop is seamless, and tiles big enough to read.
  const hero = page.locator("section[data-hero]");
  check((await hero.locator("video").count()) === 0, "home: hero must not use video");
  const heroTiles = hero.locator("[data-hero-tile]");
  const heroTileCount = await heroTiles.count();
  check(
    heroTileCount >= 20 && heroTileCount % 2 === 0,
    `home: hero marquee needs both passes of a duplicated rail (got ${heroTileCount})`,
  );
  const heroTileBox = await heroTiles.first().boundingBox();
  const view = page.viewportSize();
  check(
    !!heroTileBox && heroTileBox.height > view.height * 0.18,
    `home: hero marquee tile is too small (${Math.round(heroTileBox?.height ?? 0)}px of ${view.height})`,
  );
  check(
    (await hero.locator("a[href='/cream-latte']").count()) > 0,
    "home: hero CTA must still point at the featured product",
  );
  // The header must carry the original Tilda lockup, not a text substitute.
  check(
    (await page.locator("header a[href='/'] img[src$='base-logo.svg']").count()) === 1,
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
    (await rail.locator("[data-card]").count()) === 7,
    "reading: expected seven cards in the rail",
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
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);

  // Clicking a carousel control scrolls the page, and the bar hides on
  // scroll-down by design, so come back to the top before touching the header.
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
  await page.locator(".catg-card").first().waitFor();
  await page.waitForTimeout(1_200);
  check((await page.locator(".catg-card").count()) === 16, "catalog: expected 16 product cards");
  check((await page.locator(".catg-price").count()) === 16, "catalog: expected a price or request label on every card");
  const catalogPrices = await page.locator(".catg-card").evaluateAll((cards) =>
    Object.fromEntries(
      cards.map((card) => [
        card.querySelector(".catg-name")?.textContent?.trim() ?? "",
        card.querySelector(".catg-price")?.textContent?.trim() ?? "",
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
  check((await page.locator(".catg-flt button").count()) === 5, "catalog: expected All plus four filters");
  await page.locator('.catg-flt button[data-f="Cold & Refreshing"]').click();
  check((await page.locator(".catg-card:not(.is-hidden)").count()) === 4, "catalog: cold filter did not leave four cards");

  await page.locator(".catg-card:not(.is-hidden) .tbc-add").first().click();
  await page.waitForTimeout(200);
  const cartProducts = await page.evaluate(() =>
    Array.isArray(window.tcart?.products) ? window.tcart.products : [],
  );
  check(cartProducts.length === 1, "catalog: add-to-cart did not create one cart item");
  check(cartProducts[0]?.name === "Milkshake", "catalog: unexpected cart product");
  check(Number(cartProducts[0]?.price) === 45.38, "catalog: cart product price changed");
  await page.waitForTimeout(900);
  await page.locator('.tbh-ico[aria-label="Cart"]').first().click();
  await page.waitForTimeout(500);
  const openCartText = await page.evaluate(() => {
    const cart = [...document.querySelectorAll('[class*="t706__cartwin"]')].find((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    });
    return cart?.textContent ?? "";
  });
  check(/Milkshake/.test(openCartText), "catalog: cart dialog did not open with the selected product");
  check(/45\.38/.test(openCartText), "catalog: cart dialog did not preserve the selected price");

  await page.goto(`${baseUrl}/matcha`, { waitUntil: "domcontentloaded" });
  await page.locator("h1").first().waitFor();
  check(/Matcha/i.test((await page.locator("h1").first().textContent()) ?? ""), "matcha: unexpected H1");
  check((await page.locator("img").count()) > 10, "matcha: expected product imagery");
  await page.locator('a[href="#sample"]').first().click();
  await page.waitForTimeout(500);
  check(
    await page.locator("#form1855223381").isVisible(),
    "matcha: Place order did not open the shared Free Sample form",
  );

  await page.evaluate(() => sessionStorage.removeItem("thebase:first-touch-attribution:v1"));
  await page.goto(`${baseUrl}/contacts?utm_source=chatgpt.com&utm_campaign=browser-smoke`, {
    waitUntil: "domcontentloaded",
  });
  const contactForm = page.locator("#form860957415");
  await contactForm.waitFor();
  await contactForm.locator('input[name="name"]').fill("Browser Smoke");
  await contactForm.locator('input[name="email"]').fill("smoke@example.com");
  const consent = contactForm.locator('input[name="bch_privacy_agreement"]');
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
  const attribution = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem("thebase:first-touch-attribution:v1") ?? "null"),
  );
  check(attribution?.utm_source === "chatgpt.com", "contacts: chatgpt.com attribution was not retained");
  check(
    (await page.locator('link[rel="canonical"]').first().getAttribute("href")) ===
      "https://thebasebev.com/contacts",
    "contacts: canonical was changed after hydration",
  );

  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  observe(mobilePage, "mobile");
  await mobilePage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  const mobileBurger = mobilePage.locator("header button[aria-label='Open menu']");
  await mobileBurger.waitFor();
  await mobileBurger.click();
  await mobilePage.waitForTimeout(900);
  check(
    await mobilePage.locator("#site-menu").evaluate((el) => getComputedStyle(el).clipPath === "inset(0px)"),
    "mobile: burger menu did not open",
  );
  // Account and the region picker leave the bar on small screens, so the menu
  // is the only place they exist — if they are missing there, they are gone.
  check(
    (await mobilePage.locator("#site-menu a[href='/cabinet']").count()) === 1,
    "mobile: account link missing from the menu",
  );
  check(
    (await mobilePage.locator("#site-menu button[aria-label^='Region:']").count()) === 1,
    "mobile: region picker missing from the menu",
  );
  await mobile.close();

  const viewportWidths = [1440, 1280, 1024, 768, 430, 390, 375, 360, 320];
  const visual = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const visualPage = await visual.newPage();
  for (const width of viewportWidths) {
    const height = width <= 430 ? 844 : 1000;
    await visualPage.setViewportSize({ width, height });
    await visualPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await visualPage.locator("#bestsellers").waitFor();
    await visualPage.waitForTimeout(3_500);
    await visualPage.screenshot({
      path: path.join(artifactRoot, `home-${width}x${height}.png`),
      fullPage: false,
    });
  }
  await visual.close();
} finally {
  await browser.close();
}

for (const error of [...new Set(pageErrors)]) failures.push(`pageerror: ${error}`);
for (const error of [...new Set(localResponseErrors)]) failures.push(`response: ${error}`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
    console.log("Browser smoke passed: hero, header, region picker, menu, bestsellers, reading rail, catalog filters, cart/checkout dialog, product order popup, form error UX, and UTM attribution.");
  console.log(`Captured nine homepage viewports in ${artifactRoot}.`);
}
