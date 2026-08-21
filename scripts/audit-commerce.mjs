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
        catalogCards: [...document.querySelectorAll(".catg-card")].map((element) => ({
          name: element.querySelector(".catg-name")?.textContent?.trim() ?? null,
          price: element.querySelector(".catg-price")?.textContent?.trim() ?? null,
          href: element instanceof HTMLAnchorElement ? element.getAttribute("href") : null,
        })),
        controls,
        productData,
        tildaCartNodes: document.querySelectorAll('[class*="t706"], [class*="carticon"], .t-store__card__btn').length,
        tildaCartGlobals: {
          tcart: typeof window.tcart !== "undefined",
          tcartProducts: Array.isArray(window.tcart?.products) ? window.tcart.products.length : null,
          tcartOpen: typeof window.tcart__openCart === "function",
        },
      };
    });

    console.log(JSON.stringify({ route, ...audit }, null, 2));

    if (!audit.tildaCartGlobals.tcart || !audit.tildaCartGlobals.tcartOpen) {
      failures.push(`${route}: Tilda compatibility cart runtime is unavailable`);
    }
    if (route === "/catalog" && audit.catalogCards.length !== 16) {
      failures.push(`/catalog: expected 16 visible catalogue cards, received ${audit.catalogCards.length}`);
    }

    if (route === "/catalog") {
      const addButton = page.locator(".tbc-add").first();
      await addButton.click();
      await page.waitForTimeout(150);
      const afterAdd = await page.evaluate(() => ({
        url: location.pathname,
        buttonText: document.querySelector(".tbc-add")?.textContent?.trim() ?? null,
        products: Array.isArray(window.tcart?.products)
          ? window.tcart.products.map((product) => ({
              id: product.id,
              name: product.name,
              price: product.price,
              quantity: product.quantity,
            }))
          : [],
      }));

      const cartButton = page.locator('.tbh-ico[aria-label="Cart"]').first();
      if (await cartButton.count()) {
        await page.waitForTimeout(900);
        await cartButton.click();
        await page.waitForTimeout(500);
      }
      const cartDialog = await page.evaluate(() => {
        const nodes = [...document.querySelectorAll('[class*="t706__cartwin"]')];
        const visibleNodes = nodes.filter((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        });
        return {
          visible: visibleNodes.length > 0,
          text: visibleNodes.map((element) => element.textContent?.replace(/\s+/g, " ").trim()).join(" ").slice(0, 600),
          formIds: visibleNodes.flatMap((element) =>
            [...element.querySelectorAll("form")].map((form) => form.id || null),
          ),
        };
      });
      console.log(JSON.stringify({ route, afterAdd, cartDialog }, null, 2));
      if (afterAdd.url !== "/catalog") failures.push(`/catalog: add-to-cart navigated to ${afterAdd.url}`);
      if (afterAdd.products.length !== 1) failures.push(`/catalog: expected one cart item`);
      if (afterAdd.products[0]?.name !== "Milkshake" || Number(afterAdd.products[0]?.price) !== 45.38) {
        failures.push(`/catalog: Milkshake cart identity/price changed`);
      }
      if (!cartDialog.visible || !/Milkshake/.test(cartDialog.text) || !/45\.38/.test(cartDialog.text)) {
        failures.push(`/catalog: populated checkout dialog did not open`);
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
