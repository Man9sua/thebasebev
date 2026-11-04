import { chromium } from "@playwright/test";

/** The account link has to leave for Odoo and nowhere else. */
const ODOO_ORIGIN = "https://odoo.";

const baseUrl = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const chromePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const failures = [];
const blockedMutations = [];
let leadAttempts = 0;
let checkoutAttempts = 0;

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function openShop(page, country = "AE") {
  await page.goto(`${baseUrl}/${country.toLowerCase()}/catalog`, { waitUntil: "load" });
  await page.locator("[data-shop-product]").first().waitFor();
  const cookies = page.getByRole("region", { name: "Cookies", exact: true });
  if (await cookies.isVisible()) await cookies.getByRole("button", { name: "Reject", exact: true }).click();
  await page.locator(`header [data-cart-control][aria-label^="${country === "AE" ? "Cart" : "Sample box"}"]`).waitFor();
}

async function openPicker(page, slug) {
  await page.locator(`[data-shop-choose="${slug}"]`).click();
  const picker = page.locator(`[data-shop-picker="${slug}"]`);
  await picker.getByRole("dialog").waitFor();
  return picker;
}

async function closePicker(page, picker) {
  await picker.getByRole("button", { name: "Close flavour picker", exact: true }).click();
  await picker.waitFor({ state: "detached" });
}

async function openBasket(page, kind) {
  await page.locator("header [data-cart-control]").click();
  const basket = page.locator(`[data-shop-drawer="${kind}"]`);
  await basket.getByRole("dialog").waitFor();
  return basket;
}

async function shopBaskets(page) {
  await openShop(page);
  let picker = await openPicker(page, "milkshake");
  check(await picker.locator("[data-shop-flavor]").count() === 9, "Shop: Milkshake offers the nine approved flavours");
  const vanilla = picker.getByRole("group", { name: "Vanilla Milkshake quantity", exact: true });
  await vanilla.getByRole("button", { name: "Add one Vanilla Milkshake", exact: true }).click();
  await vanilla.getByRole("button", { name: "Add one Vanilla Milkshake", exact: true }).click();
  await picker.getByRole("button", { name: "Add one Banana Milkshake", exact: true }).click();
  await closePicker(page, picker);
  picker = await openPicker(page, "matcha");
  await picker.getByRole("button", { name: "Add one Classic Matcha", exact: true }).click();
  await closePicker(page, picker);

  let basket = await openBasket(page, "products");
  check(await basket.locator("[data-shop-cart-line]").count() === 3, "Shop: two Milkshake flavours and Matcha remain separate lines");
  const vanillaLine = basket.locator('[data-shop-cart-line="milkshake::Vanilla"]');
  await vanillaLine.getByRole("button", { name: "Add one Vanilla Milkshake", exact: true }).click();
  check(/−\s*3\s*\+/.test(await vanillaLine.getByRole("group").innerText()), "Shop: basket quantity increases independently");
  await vanillaLine.getByRole("button", { name: "Remove one Vanilla Milkshake", exact: true }).click();
  check(/−\s*2\s*\+/.test(await vanillaLine.getByRole("group").innerText()), "Shop: basket quantity decreases independently");
  await page.reload({ waitUntil: "load" });
  basket = await openBasket(page, "products");
  check(await basket.locator("[data-shop-cart-line]").count() === 3, "Shop: all selected flavour lines survive reload");
  check(/−\s*2\s*\+/.test(await basket.locator('[data-shop-cart-line="milkshake::Vanilla"]').getByRole("group").innerText()), "Shop: quantity survives reload");
  for (const line of ["milkshake::Banana", "matcha::Classic"]) {
    check(await basket.locator(`[data-shop-cart-line="${line}"]`).count() === 1, `Shop: ${line} survives reload`);
  }
  const checkout = basket.getByRole("link", { name: "Checkout", exact: true });
  const destination = new URL(await checkout.getAttribute("href"), baseUrl);
  check(destination.origin === new URL(baseUrl).origin && destination.pathname === "/checkout"
    && destination.searchParams.get("country") === "AE" && destination.searchParams.get("kind") === "products",
  "Shop: paid checkout stays on this site with country and kind");
  const configResponse = page.waitForResponse(response => new URL(response.url()).pathname === "/api/checkout/stripe/config" && response.request().method() === "GET");
  await checkout.click();
  const paymentConfig = (await (await configResponse).json()).payment;
  await page.getByRole("heading", { name: "Checkout", exact: true }).waitFor();
  const summary = page.getByRole("complementary", { name: "Your order", exact: true });
  for (const flavor of ["Vanilla", "Banana", "Classic"]) {
    check(await summary.getByText(flavor, { exact: true }).isVisible(), `Checkout: ${flavor} was retained`);
  }
  const payButton = page.getByRole("button", { name: "Continue to secure payment", exact: true });
  check(await payButton.isVisible(), "Checkout: mapped UAE goods offer secure payment");
  const testNotice = page.getByText("Test checkout. Use a Stripe test card; no real payment is taken.", { exact: true });
  if (paymentConfig.mode === "test") await testNotice.waitFor();
  check(paymentConfig.mode === "test" ? await testNotice.isVisible() : paymentConfig.mode === "live" && await testNotice.count() === 0,
    "Checkout: payment mode matches the server and Test mode is labelled");
  if (new URL(baseUrl).hostname.endsWith(".workers.dev")) {
    if (paymentConfig.ready === true) await payButton.click({ trial: true });
    check(paymentConfig.ready === true && await payButton.isEnabled(), "Deployed checkout: receiver and mode configuration are ready");
  }
  const paidBasket = await page.evaluate(() => localStorage.getItem("thebase:cart:v2"));

  await openShop(page, "SA");
  check(await page.getByRole("heading", { name: "Free samples for businesses in Saudi Arabia", exact: true }).isVisible(), "Shop: foreign market switches to samples");
  picker = await openPicker(page, "milkshake");
  const choices = picker.locator("[data-shop-flavor]");
  for (let index = 0; index < 8; index++) await choices.nth(index).getByRole("button", { name: /^Add one / }).click();
  await choices.first().getByRole("button", { name: /^Add one / }).click();
  await choices.first().getByRole("button", { name: /^Add one / }).click();
  check(await choices.nth(8).getByRole("button", { name: /^Add one / }).isEnabled(), "Samples: choices remain available beyond six flavours");
  await closePicker(page, picker);
  basket = await openBasket(page, "samples");
  check(await basket.locator("[data-shop-cart-line]").count() === 8, "Samples: eight flavours remain in the separate basket");
  await page.reload({ waitUntil: "load" });
  basket = await openBasket(page, "samples");
  const firstSample = basket.locator('[data-shop-cart-line="milkshake::Banana"]');
  check(/−\s*3\s*\+/.test(await firstSample.getByRole("group").innerText()), "Samples: several packs survive reload");
  check(await page.evaluate(() => localStorage.getItem("thebase:cart:v2")) === paidBasket, "Samples: country switch preserves the paid basket");
  const request = basket.getByRole("link", { name: "Request samples", exact: true });
  const sampleDestination = new URL(await request.getAttribute("href"), baseUrl);
  check(sampleDestination.pathname === "/checkout" && sampleDestination.searchParams.get("country") === "SA"
    && sampleDestination.searchParams.get("kind") === "samples", "Samples: checkout retains country and sample kind");
  await request.click();
  await page.getByRole("heading", { name: "Request samples", exact: true }).waitFor();
  const sampleSummary = page.getByRole("complementary", { name: "Sample box", exact: true });
  check(await sampleSummary.getByText("10 samples", { exact: true }).isVisible(), "Samples: all eight flavours and ten packs reach checkout");
  await sampleSummary.getByRole("button", { name: "Increase Milkshake Banana quantity", exact: true }).click();
  check(await sampleSummary.getByText("11 samples", { exact: true }).isVisible(), "Samples: quantities can be edited at checkout");
  await sampleSummary.getByRole("button", { name: "Decrease Milkshake Banana quantity", exact: true }).click();
  check(await page.getByRole("button", { name: "Send request", exact: true }).isVisible(), "Samples: unknown shipping is requested before payment");
  check(await page.getByRole("button", { name: "Pay delivery securely", exact: true }).count() === 0, "Samples: unknown shipping cannot create a Stripe session");
  check(await page.getByRole("radio", { name: /Use my DHL account/ }).isVisible(), "Samples: own DHL account remains available");
  check(checkoutAttempts === 0 && leadAttempts === 0, "Shop: basket inspection made no payment or lead request");

  await openShop(page);
  await page.evaluate(() => {
    localStorage.setItem("thebase:cart:v2", JSON.stringify([{ slug: "milkshake", flavor: "Vanilla", quantity: 17 }]));
    localStorage.setItem("thebase:sample-cart:v1", JSON.stringify([{ slug: "milkshake", flavor: "Vanilla", quantity: 1 }]));
  });
  await page.goto(`${baseUrl}/checkout?country=AE&kind=products`, { waitUntil: "load" });
  const mixedSummary = page.getByRole("complementary", { name: "Your order", exact: true });
  await mixedSummary.locator('[data-checkout-line-kind="samples"]').waitFor();
  check(await mixedSummary.locator('[data-checkout-line-kind="products"]').count() === 1, "Mixed checkout retains the paid pack");
  check(await mixedSummary.locator('[data-checkout-line-kind="samples"]').count() === 1, "Mixed checkout retains the same flavour as a separate free sample");
  check(await mixedSummary.getByText(/^AED\s*531\.30$/, { exact: true }).isVisible(), "Mixed checkout: 476 net goods + 30 delivery + 25.30 VAT = 531.30 AED");
  await mixedSummary.locator('[data-checkout-line-kind="products"]').getByRole("button", { name: "Increase Milkshake Vanilla quantity", exact: true }).click();
  check(await mixedSummary.getByText(/^AED\s*529\.20$/, { exact: true }).isVisible(), "Mixed checkout: 504 net goods qualify for free delivery; total is 529.20 AED");
  check(await mixedSummary.getByText(/Weekend orders are delivered in 1–2 days/).isVisible(), "Checkout displays the approved weekday and weekend delivery times");
  check(checkoutAttempts === 0 && leadAttempts === 0, "Mixed basket editing makes no real request or payment");
}

const browser = await chromium.launch({ executablePath: chromePath, headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route("**/*", (route) => {
    const request = route.request();
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method())) {
      blockedMutations.push(`${request.method()} ${new URL(request.url()).pathname}`);
      return route.abort();
    }
    return route.fallback();
  });
  await context.route("**/api/leads", (route) => {
    leadAttempts++;
    return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false }) });
  });
  await context.route("**/api/checkout**", (route) => {
    if (route.request().method() === "GET" && new URL(route.request().url()).pathname === "/api/checkout/stripe/config") return route.fallback();
    checkoutAttempts++;
    return route.abort();
  });
  const page = await context.newPage();

  for (const route of ["/catalog", "/matcha", "/electrolyte", "/find-your-distributor", "/catalog/tproduct/975474893862-matcha"]) {
    await page.goto(`${baseUrl}${route.includes("/tproduct/") ? route : `/ae${route}`}`, { waitUntil: "domcontentloaded" });
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
        catalogCards: [...document.querySelectorAll("[data-shop-product]")].map((element) => ({
          name: element.querySelector("h2")?.textContent?.trim() ?? null,
          price: /Price on request/.test(element.textContent ?? "") ? "pending" : /AED\s*[\d,.]+/.test(element.textContent ?? "") ? "approved" : null,
          href: element instanceof HTMLAnchorElement ? element.getAttribute("href") : null,
        })),
        controls,
        productData,
        legacyCartNodes: document.querySelectorAll('[class*="t706__cartwin"]').length,
        accountControl: document.querySelector('header a[aria-label="Your account"]')?.getAttribute("href") ?? null,
        nativeCartControl: Boolean(document.querySelector('header [data-cart-control]')),
      };
    });

    console.log(JSON.stringify({ route, ...audit }, null, 2));

    if (!audit.accountControl) failures.push(`${route}: the bar offers no account link`);
    if (audit.accountControl && !audit.accountControl.startsWith(ODOO_ORIGIN)) {
      failures.push(`${route}: the account link points at ${audit.accountControl}`);
    }
    if (!audit.nativeCartControl) failures.push(`${route}: native header basket is missing`);
    if (audit.legacyCartNodes > 0) failures.push(`${route}: legacy Tilda cart is still mounted`);
    if (route === "/catalog" && audit.catalogCards.length !== 22) {
      failures.push(`/catalog: expected 22 visible catalogue cards, received ${audit.catalogCards.length}`);
    }

    if (route === "/catalog") {
      check(await page.locator("[data-shop-choose]").count() === 22, "/catalog: every range opens a native flavour picker");
      check(audit.catalogCards.filter(card => card.price === "approved").length === 17, "/catalog: 17 ranges display approved prices");
      check(audit.catalogCards.filter(card => card.price === "pending").length === 5, "/catalog: five ranges without matching source prices remain on request");
      check(!/\bVAT\b/i.test(await page.locator("main").innerText()), "/catalog: VAT details are reserved for checkout");
    }

    if (route === "/matcha") {
      if (await page.locator("[data-cart-add]").count()) {
        failures.push("/matcha: product page still has an add-to-cart control");
      }


      // The redesigned product page carries one lead form, the sample; its
      // second action is the distributor finder, a plain link.
      for (const action of [
        { label: "Request a sample", form: "#sample-request-modal-form", formName: "Free Sample" },
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

      const distributorHref = await page.getByRole("link", { name: "Find your distributor" }).first().getAttribute("href");
      if (distributorHref !== "/ae/find-your-distributor") {
        failures.push("/matcha: Find your distributor points at " + distributorHref);
      }
    }
  }

  await shopBaskets(page);
  check(blockedMutations.length === 0, `Unexpected mutations blocked: ${blockedMutations.join(", ")}`);
  check(leadAttempts === 0 && checkoutAttempts === 0, "Commerce audit unexpectedly attempted a lead or payment");

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
