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

  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.locator("[data-tbs]").waitFor();
  await page.waitForTimeout(900);

  check((await page.locator(".tbs__slide").count()) === 5, "home: expected five hero slides");
  check((await page.locator("[data-tbs-dots] button").count()) === 5, "home: expected five hero dots");
  await page.locator("[data-tbs-next]").click();
  check(
    (await page.locator(".tbs__slide.is-active").getAttribute("aria-label"))?.startsWith("2 of 5"),
    "home: next arrow did not activate slide two",
  );

  await page.locator(".tbh-drop").hover();
  await page.waitForTimeout(250);
  check(
    await page.locator(".tbh-mega").evaluate((element) => getComputedStyle(element).visibility === "visible"),
    "header: desktop mega-menu did not open on hover",
  );

  await page.locator("[data-tbh-reg-toggle]").click();
  check(await page.locator("[data-tbh-reg]").evaluate((element) => element.classList.contains("is-open")), "header: region panel did not open");
  await page.locator('.tbh-reg__opt[data-short="KZ"]').click();
  check((await page.locator("[data-tbh-short]").textContent()) === "KZ", "header: region selection did not update");

  await page.evaluate(() => window.scrollTo(0, 120));
  await page.waitForTimeout(100);
  check(await page.locator(".tbh-wrap").evaluate((element) => element.classList.contains("is-scrolled")), "header: scrolled state was not applied");

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
  await mobilePage.locator("[data-tbh-burger]").waitFor();
  await mobilePage.locator("[data-tbh-burger]").click();
  check(
    await mobilePage.locator("[data-tbh-mob]").evaluate((element) => element.classList.contains("is-open")),
    "mobile: burger menu did not open",
  );
  await mobile.close();

  const viewportWidths = [1440, 1280, 1024, 768, 430, 390, 375, 360, 320];
  const visual = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const visualPage = await visual.newPage();
  for (const width of viewportWidths) {
    const height = width <= 430 ? 844 : 1000;
    await visualPage.setViewportSize({ width, height });
    await visualPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await visualPage.locator("[data-tbs]").waitFor();
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
    console.log("Browser smoke passed: hero, header, mobile menu, catalog filters, cart/checkout dialog, product order popup, form error UX, and UTM attribution.");
  console.log(`Captured nine homepage viewports in ${artifactRoot}.`);
}
