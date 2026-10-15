import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const output = path.resolve("output/product-reference-20261015");
const markets = [
  ["AE", "United Arab Emirates"], ["SA", "Saudi Arabia"], ["QA", "Qatar"],
  ["KW", "Kuwait"], ["OM", "Oman"], ["BH", "Bahrain"], ["EG", "Egypt"],
  ["IQ", "Iraq"], ["JO", "Jordan"], ["PS", "Palestine"], ["LB", "Lebanon"],
  ["TR", "Türkiye"], ["KZ", "Kazakhstan"], ["UZ", "Uzbekistan"],
  ["KG", "Kyrgyzstan"], ["TM", "Turkmenistan"], ["AZ", "Azerbaijan"],
];
const query = "?utm_source=chatgpt.com&utm_campaign=country-reference";
const fragment = "#product-title";
const checks = [];
const failures = [];
const deliveries = [];
const observations = [];
fs.mkdirSync(output, { recursive: true });

function check(ok, message, detail) {
  checks.push({ ok: Boolean(ok), message, ...(detail === undefined ? {} : { detail }) });
  if (!ok) failures.push(message);
}

const browser = await chromium.launch({ headless: true,
  executablePath: process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });

async function run(label, viewport) {
  const context = await browser.newContext({ viewport });
  const sent = [];
  await context.route("**/*", (route) => {
    const request = route.request();
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method())) {
      failures.push(`${label}: unexpected unmocked mutation blocked: ${request.method()} ${new URL(request.url()).pathname}`);
      return route.abort();
    }
    return route.fallback();
  });
  await context.route("**/api/leads", async (route) => {
    const payload = route.request().postDataJSON();
    sent.push(payload);
    deliveries.push({ label, ...payload });
    await route.fulfill({ status: 200, contentType: "application/json", headers: { "Cache-Control": "no-store" },
      body: JSON.stringify({ ok: true, requestId: "country-reference-mocked" }) });
  });
  await context.route("**/api/checkout**", (route) => route.abort());
  await context.addCookies([{ name: "tbb-consent", value: encodeURIComponent(JSON.stringify({ analytics: false, marketing: false })), url: baseUrl }]);
  const page = await context.newPage();
  page.setDefaultTimeout(12_000);
  page.on("pageerror", (error) => failures.push(`${label}: JavaScript ${error.message}`));

  async function country(code) {
    const trigger = page.getByRole("button", { name: new RegExp(`^Country: ${code},`) });
    await trigger.waitFor({ state: "visible" });
    return trigger;
  }

  async function visit(route) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "load" });
    check(response?.status() === 200, `${label} ${route}: HTTP 200`);
    return response;
  }

  async function sample(code, name) {
    await page.locator("main").getByRole("button", { name: /request a sample/i }).first().click();
    const form = page.locator("#sample-request-modal-form");
    await form.waitFor({ state: "visible" });
    check(await form.locator('input[name="country"]').inputValue() === code, `${label} ${code}: sample market code follows URL`);
    const visibleName = await form.locator('input[name="country_name"]').inputValue();
    check(code === "AE" ? /^(?:UAE|United Arab Emirates)$/.test(visibleName) : visibleName === name,
      `${label} ${code}: sample country name follows URL`, visibleName);
    check(await form.getByRole("link", { name: "Privacy Policy", exact: true }).getAttribute("href") === `/${code.toLowerCase()}/privacy`,
      `${label} ${code}: sample privacy link keeps country`);
    await page.keyboard.press("Escape");
    await form.waitFor({ state: "hidden" });
  }

  async function menuTo(slug) {
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    const menu = page.getByRole("dialog", { name: "Site navigation", exact: true });
    const products = menu.getByRole("button", { name: "Products", exact: true });
    if (await products.getAttribute("aria-expanded") === "false") await products.click();
    const link = menu.locator(`a[href$="/${slug}"]`);
    check(await link.getAttribute("href") === `/kw/${slug}`, `${label} KW: actual menu SiteLink targets same country (${slug})`);
    await link.click();
    await page.waitForURL((url) => url.pathname === `/kw/${slug}`);
    await page.waitForLoadState("load");
    await country("KW");
  }

  try {
    await visit(`/ae/milkshake${query}${fragment}`);
    for (const [code, name] of markets) {
      const currentCode = new URL(page.url()).pathname.split("/")[1].toUpperCase();
      await (await country(currentCode)).click();
      const list = page.getByRole("listbox", { name: "Country", exact: true });
      await list.waitFor({ state: "visible" });
      check(await list.getByRole("option").count() === 17, `${label} ${code}: selector exposes all 17 markets`);
      const option = list.getByRole("option").filter({ has: page.getByText(code, { exact: true }) });
      check(await option.count() === 1, `${label} ${code}: unambiguous selectable country`);
      if (code === "AE") await list.screenshot({ path: path.join(output, `${label}-country-selector.png`) });
      await option.click();
      await page.waitForURL((url) => url.pathname === `/${code.toLowerCase()}/milkshake` && url.search === query && url.hash === fragment);
      await page.waitForLoadState("load");
      await country(code);
      const url = new URL(page.url());
      observations.push({ label, code, url: url.toString() });
      check(url.pathname === `/${code.toLowerCase()}/milkshake` && url.search === query && url.hash === fragment,
        `${label} ${code}: selector preserves product route, attribution query and fragment`, url.toString());
      check(await page.locator('link[rel="canonical"]').getAttribute("href") === "https://thebasebev.com/ae/milkshake",
        `${label} ${code}: shared English canonical remains production AE document`);
      await sample(code, name);
      console.log(`${label} country ${code}: checked`);
    }

    await page.goBack({ waitUntil: "load" });
    await country("TM");
    check(new URL(page.url()).pathname === "/tm/milkshake", `${label}: Back restores previous country URL and header`);
    await page.goForward({ waitUntil: "load" });
    await country("AZ");
    check(new URL(page.url()).pathname === "/az/milkshake", `${label}: Forward restores country URL and header`);

    await visit(`/kw/milkshake${query}${fragment}`);
    await country("KW");
    const finder = page.locator("main").getByRole("link", { name: "Find your distributor", exact: true }).first();
    check(await finder.getAttribute("href") === "/kw/find-your-distributor", `${label} KW: product finder keeps country`);
    await finder.click();
    await page.waitForURL((url) => url.pathname === "/kw/find-your-distributor");
    await page.waitForLoadState("load");
    await country("KW");
    await menuTo("garnish");
    await visit("/kw/catalog");
    await country("KW");
    const catalogue = page.locator("main").filter({ has: page.locator("#catalog-title") });
    check(await catalogue.locator("[data-catalog-card]").count() === 22, `${label} KW catalogue: 22 product categories`);
    const links = await catalogue.locator("[data-catalog-name]").evaluateAll((elements) => elements.map((element) => element.getAttribute("href")));
    check(links.length === 22 && links.every((href) => href?.startsWith("/kw/")), `${label} KW catalogue: every product link keeps country`, links);
    const title = await catalogue.locator("h1").evaluate((element) => {
      const style = getComputedStyle(element);
      return { family: style.fontFamily, weight: style.fontWeight, transform: style.textTransform };
    });
    check(title.family.includes("Exo 2") && title.weight === "900" && title.transform === "uppercase", `${label} KW catalogue: global title typography`, title);
    const chocolate = catalogue.locator('[data-catalog-name][href="/kw/chocolate"]');
    await chocolate.scrollIntoViewIfNeeded();
    await page.evaluate(async () => { await document.fonts.ready; await new Promise(requestAnimationFrame); });
    const productFont = await chocolate.evaluate((element) => ({ family: getComputedStyle(element).fontFamily, weight: getComputedStyle(element).fontWeight }));
    check(productFont.family.includes("Exo 2") && productFont.weight === "800", `${label} KW catalogue: painted product name weight 800`, productFont);
    await page.screenshot({ path: path.join(output, `${label}-country-catalogue.png`) });
    await chocolate.click();
    await page.waitForURL((url) => url.pathname === "/kw/chocolate");
    await page.waitForLoadState("load");
    await country("KW");
    check(new URL(page.url()).pathname === "/kw/chocolate", `${label} KW catalogue: actual product link navigation keeps country`);
    await visit("/kw/privacy");
    await country("KW");
    await menuTo("frappe");

    const beforeSample = sent.length;
    await page.locator("main").getByRole("button", { name: /request a sample/i }).first().click();
    const form = page.locator("#sample-request-modal-form");
    await form.locator('input[name="company_website"][readonly]').waitFor({ state: "attached" });
    for (const [name, value] of [["name", "Country QA"], ["company", "Country QA LLC"], ["email", "country-qa@example.com"], ["Phone", "+96550000000"], ["city", "Kuwait City"]]) {
      await form.locator(`input[name="${name}"]`).fill(value);
    }
    await form.getByRole("button", { name: "Send request", exact: true }).click();
    await form.getByRole("heading", { name: /request.*received/i }).waitFor({ state: "visible" });
    check(sent.length === beforeSample + 1, `${label} KW: exactly one mocked sample delivery`);
    const lead = sent.at(-1);
    check(lead?.country === "KW" && /Country: Kuwait/.test(lead?.message ?? ""), `${label} KW: mocked sample payload retains country code and name`, lead);
    check(new URL(page.url()).pathname === "/kw/frappe", `${label} KW: sample confirmation keeps product country URL`);
    await form.getByRole("button", { name: /Back to Frappe/i }).click();
    await form.waitFor({ state: "hidden" });

    await visit("/kz/rnd");
    await country("KZ");
    const brief = page.locator("#form861442702");
    await brief.locator('input[name="company_website"][readonly]').waitFor({ state: "attached" });
    for (const [name, value] of [["name", "Country QA"], ["email", "country-qa@example.com"], ["Phone", "+77010000000"], ["country", "KZ"]]) {
      await brief.locator(`input[name="${name}"]`).fill(value);
    }
    await brief.locator('textarea[name="text"]').fill("Mocked country alias brief for browser verification.");
    await brief.locator('input[name="privacy-consent"]').check();
    const beforeBrief = sent.length;
    await brief.getByRole("button", { name: "Send brief", exact: true }).click();
    await page.waitForURL((url) => url.pathname === "/kz/thank-you-form");
    await page.waitForLoadState("load");
    await country("KZ");
    check(sent.length === beforeBrief + 1, `${label} KZ: exactly one mocked R&D delivery`);
    check(new URL(page.url()).pathname === "/kz/thank-you-form", `${label} KZ: successful brief keeps country in thank-you route`);
    await visit("/kz/thank-you-order");
    await country("KZ");
    check(new URL(page.url()).pathname === "/kz/thank-you-order", `${label} KZ: order confirmation document alias resolves without placing an order`);
    await page.screenshot({ path: path.join(output, `${label}-country-success-route.png`) });
    check(sent.length === 2, `${label}: only two intentionally mocked form deliveries, no order`);
  } catch (error) {
    failures.push(`${label}: ${error.message}`);
    await page.screenshot({ path: path.join(output, `${label}-country-failure.png`) }).catch(() => {});
  } finally {
    await context.close();
  }
}

try {
  await run("desktop", { width: 1440, height: 1000 });
  await run("mobile", { width: 390, height: 844 });
} finally {
  await browser.close();
  fs.writeFileSync(path.join(output, "country-results.json"), JSON.stringify({ baseUrl, at: new Date().toISOString(),
    checks, failures, observations, deliveries }, null, 2) + "\n");
  console.log(JSON.stringify({ checks: checks.length, passed: checks.filter((item) => item.ok).length, failures }, null, 2));
  process.exitCode = failures.length ? 1 : 0;
}
