import { chromium } from "@playwright/test";

const baseUrl = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const chromePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const failures = [];

const browser = await chromium.launch({ executablePath: chromePath, headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  for (const route of ["/catalog", "/matcha", "/catalog/tproduct/975474893862-matcha"]) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3_500);

    const audit = await page.evaluate(() => {
      const visible = (element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      };
      const label = (element) =>
        (element.textContent ?? element.getAttribute("aria-label") ?? element.getAttribute("title") ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 160);
      const commercePattern = /cart|checkout|basket|order|buy|shop|purchase|add to/i;
      const controls = [...document.querySelectorAll("a, button, input[type=submit], [role=button]")]
        .filter(visible)
        .map((element) => ({
          tag: element.tagName.toLowerCase(),
          label: label(element),
          href: element instanceof HTMLAnchorElement ? element.getAttribute("href") : null,
          className: typeof element.className === "string" ? element.className.slice(0, 180) : "",
        }))
        .filter((control) =>
          commercePattern.test(`${control.label} ${control.href ?? ""} ${control.className}`),
        );
      const productData = [...document.querySelectorAll("[data-product-lid], [data-product-gen-uid], [data-product-price], [data-product-name]")]
        .slice(0, 20)
        .map((element) => ({
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === "string" ? element.className.slice(0, 180) : "",
          productLid: element.getAttribute("data-product-lid"),
          productUid: element.getAttribute("data-product-gen-uid"),
          productName: element.getAttribute("data-product-name"),
          productPrice: element.getAttribute("data-product-price"),
        }));
      return {
        title: document.title,
        bodyClasses: document.body.className,
        catalogCards: [...document.querySelectorAll("[data-catalog-card]")].map((element) => ({
          name: element.querySelector("[data-catalog-name]")?.textContent?.trim() ?? null,
          price: element.querySelector("[data-catalog-price]")?.textContent?.trim() ?? null,
          href: element instanceof HTMLAnchorElement ? element.getAttribute("href") : null,
        })),
        controls,
        productData,
        legacyCartNodes: document.querySelectorAll('[class*="t706__cartwin"]').length,
        nativeCartControl: Boolean(document.querySelector('header a[aria-label^="Cart"]')),
      };
    });

    console.log(JSON.stringify({ route, ...audit }, null, 2));

    if (!audit.nativeCartControl) failures.push(`${route}: native cart control is unavailable`);
    if (audit.legacyCartNodes > 0) failures.push(`${route}: legacy Tilda cart is still mounted`);
    if (route === "/catalog" && audit.catalogCards.length !== 16) {
      failures.push(`/catalog: expected 16 visible catalogue cards, received ${audit.catalogCards.length}`);
    }

    if (route === "/catalog") {
      const addButton = page.locator("[data-cart-add]").first();
      await addButton.click();
      await page.waitForTimeout(150);
      const afterAdd = await page.evaluate(() => ({
        url: location.pathname,
        buttonText: document.querySelector("[data-cart-add]")?.textContent?.trim() ?? null,
        products: (() => {
          try {
            return JSON.parse(localStorage.getItem("thebase:cart:v1") ?? "[]");
          } catch {
            return [];
          }
        })(),
      }));

      const cartButton = page.locator('header a[aria-label^="Cart"]').first();
      if (await cartButton.count()) {
        await cartButton.click();
        await page.waitForURL(`${baseUrl}/checkout`);
      }
      const checkoutPage = await page.evaluate(() => {
        const main = document.querySelector("main");
        return {
          visible: Boolean(main),
          text: main?.textContent?.replace(/\s+/g, " ").trim().slice(0, 600) ?? "",
          path: location.pathname,
        };
      });
      console.log(JSON.stringify({ route, afterAdd, checkoutPage }, null, 2));
      if (afterAdd.url !== "/catalog") failures.push(`/catalog: add-to-cart navigated to ${afterAdd.url}`);
      if (afterAdd.products.length !== 1) failures.push(`/catalog: expected one cart item`);
      if (afterAdd.products[0]?.slug !== "milkshake" || afterAdd.products[0]?.quantity !== 1) {
        failures.push(`/catalog: Milkshake cart identity/quantity changed`);
      }
      if (
        checkoutPage.path !== "/checkout" ||
        !checkoutPage.visible ||
        !/Milkshake/.test(checkoutPage.text) ||
        !/45\.38/.test(checkoutPage.text)
      ) {
        failures.push(`/catalog: populated checkout page did not open`);
      }
    }
  }

  await context.close();
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Commerce audit passed at ${baseUrl}; no order was submitted.`);
}
