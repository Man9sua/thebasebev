import fs from "node:fs";
import { chromium } from "@playwright/test";

const baseUrl = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const chromePath =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const failures = [];
const artifacts = ".audit-artifacts/native-ui";
fs.mkdirSync(artifacts, { recursive: true });

function check(condition, message) {
  if (!condition) failures.push(message);
}

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(`${baseUrl}/catalog`, { waitUntil: "networkidle" });
  check((await page.locator("[data-catalog-card]").count()) === 16, "catalog did not render 16 cards immediately");
  check((await page.locator("[data-catalog-filters] button").count()) === 5, "catalog filter count changed");
  check((await page.locator(".t706__cartwin-content").count()) === 0, "legacy Tilda cart remained in DOM");
  const teaTransform = await page
    .locator('[data-product-slug="tea"] img')
    .evaluate((image) => getComputedStyle(image).transform);
  check(teaTransform !== "none", "Tea image framing override is missing");
  const teaImage = page.locator('[data-product-slug="tea"] img');
  await teaImage.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => {
      const image = document.querySelector('[data-product-slug="tea"] img');
      return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
    },
    undefined,
    { timeout: 5_000 },
  );
  check(
    await teaImage.evaluate((image) => image.complete && image.naturalWidth > 0),
    "Tea image did not load after entering the viewport",
  );
  await page.screenshot({ path: `${artifacts}/catalog-desktop.png`, fullPage: true });

  await page.locator('[data-catalog-filters] button[data-f="Cold & Refreshing"]').click();
  check((await page.locator("[data-catalog-card]").count()) === 4, "cold filter did not render four products");
  await page.locator('[data-product-slug="milkshake"] [data-cart-add]').click();
  await page.locator('header a[aria-label="Cart, 1 item"]').waitFor();
  await page.locator('header a[aria-label="Cart, 1 item"]').click();
  await page.waitForURL(`${baseUrl}/checkout`);
  check((await page.getByRole("heading", { name: "Complete your order" }).count()) === 1, "checkout page did not open");
  check((await page.getByText("Milkshake", { exact: true }).count()) > 0, "checkout summary lost Milkshake");
  check((await page.getByText("AED 45.38", { exact: true }).count()) > 0, "checkout summary price changed");
  await page.screenshot({ path: `${artifacts}/checkout-desktop.png`, fullPage: true });

  await page.evaluate(() => {
    localStorage.removeItem("thebase:cart:v1");
    localStorage.removeItem("thebase:cart:v2");
  });
  await page.goto(`${baseUrl}/checkout`, { waitUntil: "domcontentloaded" });
  await page.waitForURL(`${baseUrl}/catalog`);

  await page.route("**/api/leads", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
  );
  await page.goto(`${baseUrl}/contacts`, { waitUntil: "networkidle" });
  check((await page.locator(".t706__cartwin-content").count()) === 0, "contacts retained the Tilda cart");
  await page.locator('input[name="name"]').fill("UI QA");
  await page.locator('input[name="company"]').fill("THE BASE Test");
  await page.locator('input[name="email"]').fill("qa@example.com");
  await page.locator('input[name="Phone"]').fill("500000000");
  await page.locator('input[name="country"]').fill("United Arab Emirates");
  await page.locator('textarea[name="text"]').fill("Native contact form interaction check.");
  await page.locator('input[name="privacy-consent"]').check();
  check((await page.locator('input[name="name"]').inputValue()) === "UI QA", "contact inputs are not fillable");
  await page.screenshot({ path: `${artifacts}/contacts-desktop.png`, fullPage: true });

  const transition = await page.locator("header").evaluate((header) => getComputedStyle(header).transition);
  check(/color/.test(transition) && /0\.62s/.test(transition), "header colour transition is not animated");
  await page.locator("footer[data-surface='dark']").scrollIntoViewIfNeeded();
  await page.waitForTimeout(750);
  const darkHeader = await page.locator("header").evaluate((header) => ({
    theme: header.getAttribute("data-header-theme"),
    logoThe: getComputedStyle(header.querySelector("a svg path")).fill,
  }));
  check(darkHeader.theme === "dark", "header did not enter dark surface state");
  check(darkHeader.logoThe === "rgb(255, 255, 255)", "logo `the` did not become white");

  const strayZoomControls = await page.locator(".t-zoomer__ui-wrapper, .t-zoomer__close").evaluateAll((nodes) =>
    nodes.filter((node) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    }).length,
  );
  check(strayZoomControls === 0, "stray Tilda zoom controls are visible");

  await page.getByRole("button", { name: "Send inquiry" }).click();
  await page.waitForURL(`${baseUrl}/thank-you-form`);

  // Reproduce the intermittent failure path: a client-side navigation from a
  // legacy Tilda product document into the native catalogue. Native data hooks
  // deliberately do not overlap the old `.catg-*` observer selectors.
  await page.goto(`${baseUrl}/matcha`, { waitUntil: "networkidle" });
  await page.locator('section[aria-labelledby="product-title"] a[href="/catalog"]').click();
  await page.waitForURL(`${baseUrl}/catalog`);
  await page.waitForTimeout(1_200);
  check(
    (await page.locator("[data-catalog-card]").count()) === 16,
    "catalog broke after client navigation from a legacy product route",
  );
  const legacyMutatedCards = await page.locator("[data-catalog-card]").evaluateAll(
    (cards) =>
      cards.filter((card) =>
        ["in-view", "is-visible", "shown", "is-hidden"].some((name) => card.classList.contains(name)),
      ).length,
  );
  check(legacyMutatedCards === 0, "legacy Tilda observers mutated native catalog cards");

  await context.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${baseUrl}/catalog`, { waitUntil: "networkidle" });
  check((await mobilePage.locator("[data-catalog-card]").count()) === 16, "mobile catalog lost products");
  const mobileOverflow = await mobilePage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(mobileOverflow <= 1, `mobile catalog overflows horizontally by ${mobileOverflow}px`);
  await mobilePage.screenshot({ path: `${artifacts}/catalog-mobile.png`, fullPage: true });

  await mobilePage.goto(`${baseUrl}/contacts`, { waitUntil: "networkidle" });
  await mobilePage.locator('input[name="name"]').fill("Mobile UI QA");
  check(
    (await mobilePage.locator('input[name="name"]').inputValue()) === "Mobile UI QA",
    "mobile contact inputs are not fillable",
  );
  const mobileContactsOverflow = await mobilePage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(mobileContactsOverflow <= 1, `mobile contacts overflows horizontally by ${mobileContactsOverflow}px`);
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.screenshot({ path: `${artifacts}/contacts-mobile.png`, fullPage: true });
  await mobileContext.close();
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Native catalog/cart/checkout/contacts smoke passed at ${baseUrl}.`);
}
