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
      // The shelf hands buying over to the Odoo shop. What it has to get right
      // is the destination — a "Buy" that stays on this site now goes nowhere.
      const shopLinks = page.locator("[data-shop-link]");
      const shopCount = await shopLinks.count();
      const firstShopHref = shopCount ? await shopLinks.first().getAttribute("href") : null;
      if (shopCount === 0) failures.push("/catalog: no card offers the shop");
      if (firstShopHref !== "https://odoo.thebasebev.com/shop") {
        failures.push(`/catalog: Buy points at ${firstShopHref}`);
      }
      if (await page.locator("[data-cart-add]").count()) {
        failures.push("/catalog: the shelf still carries an add-to-cart control");
      }
    }

    if (route === "/matcha") {
      if (await page.locator("[data-cart-add]").count()) {
        failures.push("/matcha: product page still has an add-to-cart control");
      }

      const cartHref = await page.locator('header a[aria-label^="Cart"]').first().getAttribute("href");
      if (cartHref !== "/catalog") failures.push("/matcha: empty cart does not lead to catalogue");

      for (const action of [
        { label: "Request a sample", form: "#sample-request-modal-form", formName: "Free Sample" },
        { label: "Request pricing", form: "#partner-request-modal-form", formName: "Partner with Us" },
      ]) {
        await page.getByRole("button", { name: action.label }).first().click();
        const form = page.locator(action.form);
        await form.waitFor({ state: "visible" });
        const formName = await form.locator('input[name="tildaspec-formname"]').inputValue();
        const productName = await form.locator('input[name="product"]').inputValue();
        if (formName !== action.formName || productName !== "Matcha") {
          failures.push("/matcha: " + action.label + " lost its lead form identity or product context");
        }
        await page.keyboard.press("Escape");
        await form.waitFor({ state: "detached" });
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
