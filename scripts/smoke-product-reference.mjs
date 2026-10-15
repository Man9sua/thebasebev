import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const output = path.resolve("output/product-reference-20261015");
const registry = fs.readFileSync("src/components/product-page/registry.ts", "utf8")
  .split("export const PRODUCT_PAGES:")[1]?.split("};")[0] ?? "";
const slugs = [...registry.matchAll(/^\s*(?:"([a-z-]+)"|([a-z-]+)):\s*\w+Page,/gm)]
  .map((match) => match[1] ?? match[2]);
const checks = [];
const failures = [];
const samples = [];
const navigations = [];
const screenshots = [];
const fontRequests = [];
const cardSelector = [
  '[class*="flavourName"]', '[class*="bottleName"]', '[class*="pouchName"]', '[class*="teaName"]',
  '[class*="cardName"] > span[class*="name"]',
  '[class*="colours"] [class*="copy"] > span[class*="name"]',
  '[class*="Electrolyte"] [class*="copy"] > span[class*="name"]',
  'section[aria-label="Flavours"] div[class*="flavour"]:not(:has(*))',
].join(", ");

fs.mkdirSync(output, { recursive: true });

function check(ok, message, detail) {
  checks.push({ message, ok: Boolean(ok), ...(detail === undefined ? {} : { detail }) });
  if (!ok) failures.push(message);
}

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});

async function painted(locator) {
  if (!await locator.count() || !await locator.isVisible()) return false;
  await locator.scrollIntoViewIfNeeded();
  await locator.page().evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return element.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true })
      && rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
  });
}

async function firstPainted(locator) {
  for (const item of await locator.all()) if (await painted(item)) return item;
  return null;
}

async function font(locator, weight, label, { uppercase = false, tracking = false } = {}) {
  if (!locator || !await painted(locator)) {
    check(false, `${label}: painted text exists`);
    return;
  }
  const value = await locator.evaluate((element) => {
    const css = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return { text: element.textContent.replace(/\s+/g, " ").trim(), family: css.fontFamily,
      weight: css.fontWeight, size: css.fontSize, transform: css.textTransform, tracking: css.letterSpacing,
      x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  samples.push({ label, ...value });
  const weights = [weight].flat().map(String);
  check(value.family.includes("Exo 2") && weights.includes(value.weight), `${label}: Exo 2 / ${weights.join(" or ")}`, value);
  if (uppercase) check(value.transform === "uppercase" || value.text === value.text.toUpperCase(), `${label}: uppercase`, value);
  if (tracking) check(Math.abs(Number.parseFloat(value.tracking) / Number.parseFloat(value.size) - 0.1) < 0.005,
    `${label}: 0.1em tracking`, value);
}

async function screenshot(locator, name) {
  await locator.scrollIntoViewIfNeeded();
  // A section can use content-visibility:auto. Paint it before taking its box.
  await locator.page().evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const file = path.join(output, `${name}.png`);
  await locator.screenshot({ path: file, animations: "disabled", style: "header { visibility: hidden !important; }" });
  screenshots.push(file);
}

async function typography(page, slug, label) {
  const main = page.locator("main").filter({ has: page.locator("h1") }).first();
  await main.locator("h1").first().waitFor({ state: "visible" });
  await font(main.locator("h1").first(), 900, `${label} ${slug} heading`, { uppercase: true });
  await font(await firstPainted(main.locator("h2")), 900, `${label} ${slug} section`, { uppercase: true });
  await font(await firstPainted(main.locator("p")), [400, 500], `${label} ${slug} body`);
  const actions = main.locator('button, a[class*="button"], a[class*="Button"]')
    .filter({ hasText: /request.*sample|find your distributor|buy online|stock it/i });
  await font(await firstPainted(actions), 600, `${label} ${slug} CTA`, { uppercase: true, tracking: true });
  await font(await firstPainted(main.locator("summary")), 800, `${label} ${slug} FAQ`);
  const statistic = await firstPainted(main.locator('[class*="statValue"]'));
  if (statistic) await font(statistic, 900, `${label} ${slug} statistic`);
  for (const subhead of await main.locator("h3").all()) {
    if (await painted(subhead)) await font(subhead, 800, `${label} ${slug} subheading`);
  }
  const cards = main.locator(cardSelector);
  let paintedCards = 0;
  for (const card of await cards.all()) {
    if (!await painted(card)) continue;
    await font(card, 800, `${label} ${slug} card ${++paintedCards}`);
  }
  check(paintedCards > 0, `${label} ${slug}: actual flavour/product card titles checked`);
  check(await page.evaluate(() => Array.from(document.fonts).some((face) =>
    face.family.replace(/["']/g, "") === "Exo 2" && face.status === "loaded")), `${label} ${slug}: Exo 2 font face loaded`);
  const geometry = await main.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, viewport: innerWidth };
  });
  // Measure the native product frame, not translated menus or scrolling galleries.
  check(geometry.left >= -2 && geometry.right <= geometry.viewport + 2, `${label} ${slug}: native frame fits viewport`, geometry);
  return main;
}

async function captions(main, label) {
  const heads = main.locator('[class*="nutritionHead"]');
  let visible = 0;
  for (const head of await heads.all()) {
    if (!await painted(head)) continue;
    const caption = await firstPainted(head.locator("span").filter({ hasNotText: "% Daily value" }));
    if (caption) {
      const text = (await caption.innerText()).trim();
      check(/^per\b/i.test(text) && /\d/.test(text), `${label}: nutrition caption describes serving only`, text);
      visible++;
    }
  }
  if (await heads.count()) check(visible > 0, `${label}: nutrition caption was painted`);
  for (const selector of ['[class*="caption"]', 'section[aria-label="Inside the pack"] [class*="panelHead"]']) {
    const candidate = await firstPainted(main.locator(selector));
    if (!candidate) continue;
    const text = (await candidate.innerText()).trim();
    check(/^per\b/i.test(text) && /\d/.test(text), `${label}: simplified nutrition caption describes serving only`, text);
  }
}

async function critical(page, main, slug, label) {
  const section = (name) => main.getByRole("region", { name, exact: true });
  if (slug === "frappe") {
    const finish = main.locator('[class*="cafeFinish"]');
    await font(finish.locator("strong"), 800, `${label} Frappe finish heading`);
    for (const title of await finish.locator("b").all()) await font(title, 800, `${label} Frappe finish subhead`);
    check(await finish.getByText("Flavour", { exact: true }).count() === 1
      && await finish.getByText("Walls", { exact: true }).count() === 1
      && await finish.getByText("Top", { exact: true }).count() === 1, `${label} Frappe: three café finish instructions`);
    await screenshot(section("How to prepare"), `${label}-frappe-finish`);
  }
  if (slug === "cordial" || slug === "raf-coffee") {
    await screenshot(section("Flavours"), `${label}-${slug}-flavours`);
  }
  if (slug === "chocolate") {
    check((await main.locator("h1").innerText()).replace(/\s+/g, " ").trim().toLowerCase() === "hot chocolate", `${label} Chocolate: requested hero heading`);
    await screenshot(main.locator("section").first(), `${label}-chocolate-hero`);
  }
  if (slug === "topping") {
    const inside = main.locator("section").filter({ has: page.getByRole("heading", { name: "Inside the pack", exact: true }) });
    await inside.scrollIntoViewIfNeeded();
    check(await inside.getByRole("tablist").count() === 0, `${label} Topping: no unsupported flavour selector`);
    check(await inside.getByText("525 kcal", { exact: true }).isVisible(), `${label} Topping: supplied dry base calories 525 kcal`);
    check(await inside.getByText("≈ 72 kcal", { exact: true }).isVisible(), `${label} Topping: prepared 50 g serving 72 kcal`);
    if (label === "desktop") check((await inside.innerText()).includes("100 g of base makes 450 g of topping"), `${label} Topping: supplied preparation yield 450 g`);
    await screenshot(inside, `${label}-topping-inside`);
  }
  if (slug === "jam") {
    const flavours = section("Flavours");
    check(await flavours.locator('[class*="flavourName"]').count() === 6, `${label} Jam: all six requested flavours`);
    check(await flavours.getByText("New", { exact: true }).count() === 5, `${label} Jam: five NEW badges`);
    await screenshot(flavours, `${label}-jam-six-flavours`);
    await page.evaluate(() => scrollTo(0, 0));
    await main.getByRole("button", { name: /request a sample/i }).first().click();
    const form = page.locator("#sample-request-modal-form");
    await form.waitFor({ state: "visible" });
    const choices = form.getByRole("group", { name: /Flavours/ }).getByRole("checkbox");
    check(await choices.count() === 6, `${label} Jam: all six sample choices`);
    check(await choices.filter({ visible: true }).count() === 6, `${label} Jam: sample choices rendered`);
    await page.keyboard.press("Escape");
    await form.waitFor({ state: "hidden" });
  }
  if (slug === "garnish") {
    check(!await page.getByText(/Each type of visual aid has pros and cons/).count(), `${label} Garnish: unrelated theme paragraph removed`);
    check(await page.locator("footer").isVisible(), `${label} Garnish: legitimate footer retained`);
    await screenshot(main.locator("section").filter({ has: page.getByRole("heading", { name: "Questions", exact: true }) }), `${label}-garnish-end`);
  }
  if (slug === "colour-collection") {
    const faq = main.locator("section").filter({ has: page.getByRole("heading", { name: "Questions", exact: true }) });
    check(await faq.locator("summary").count() === 5, `${label} Colour Collection: all five FAQ entries`);
    await screenshot(faq, `${label}-colour-faq`);
  }
  if (slug === "puree") {
    await screenshot(section("Made for service"), `${label}-puree-service`);
    await screenshot(section("Three ways to use it"), `${label}-puree-use`);
  }
  if (slug === "electrolyte") {
    check(await main.getByRole("link", { name: /request.*(?:ingredients|specification)/i }).count() === 0,
      `${label} ${slug}: owner-removed specification request link absent`);
  }
  if (slug === "add-ons" || slug === "electrolyte") {
    await screenshot(section(slug === "add-ons" ? "Add-ons" : "Flavours"), `${label}-${slug}-cards`);
  }
  if (slug === "electrolyte") {
    const sticks = section("In every stick");
    for (const value of ["1000 mg", "200 mg", "60 mg", "0 g", "5", "Cold"]) {
      const stat = sticks.getByText(value, { exact: true });
      await font(stat, 900, `${label} Electrolyte statistic ${value}`);
    }
    const prepare = section("How to prepare");
    check((await prepare.innerText()).includes("300–500 ml"), `${label} Electrolyte: requested dilution range`);
    check(await prepare.getByText("5 g", { exact: true }).count() === 1, `${label} Electrolyte: single stick dose`);
    await screenshot(sticks, `${label}-electrolyte-stick-stats`);
    await screenshot(prepare, `${label}-electrolyte-prepare`);
  }
}

async function privacyCookies(page, context, label) {
  await page.goto(`${baseUrl}/ae/privacy`, { waitUntil: "load" });
  const banner = page.getByRole("region", { name: "Cookies", exact: true });
  await page.waitForFunction(() => {
    const element = document.querySelector('[aria-label="Cookies"]');
    return element && Number(getComputedStyle(element).opacity) >= 0.99;
  });
  await font(banner.locator('[class*="title"]'), 800, `${label} Privacy cookie title`);
  await font(banner.locator("p"), 400, `${label} Privacy cookie body`);
  for (const name of ["Accept all", "Reject"]) {
    const button = banner.getByRole("button", { name, exact: true });
    await font(button, 600, `${label} Privacy cookie ${name}`, { uppercase: true, tracking: true });
    const css = await button.evaluate((element) => {
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, color: style.color, border: style.borderColor,
        borderWidth: Number.parseFloat(style.borderWidth), radius: Number.parseFloat(style.borderRadius),
        margin: style.marginLeft, width: element.getBoundingClientRect().width };
    });
    check(css.radius >= 999 && css.margin === "0px", `${label} Privacy cookie ${name}: pill without legacy left margin`, css);
    check(name === "Accept all" ? css.background === "rgb(14, 14, 14)"
      : css.background === "rgba(0, 0, 0, 0)" && css.border === "rgb(14, 14, 14)" && css.borderWidth >= 1,
    `${label} Privacy cookie ${name}: requested modern colour/outline`, css);
  }
  await screenshot(banner, `${label}-privacy-cookie-banner`);
  await banner.getByRole("button", { name: "Settings", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Cookie settings", exact: true });
  await dialog.waitFor({ state: "visible" });
  const toggles = dialog.getByRole("checkbox");
  await toggles.nth(0).check();
  await toggles.nth(1).uncheck();
  await dialog.getByRole("button", { name: "Save choices", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  const stored = (await context.cookies()).find((cookie) => cookie.name === "tbb-consent");
  const value = stored ? JSON.parse(decodeURIComponent(stored.value)) : null;
  check(value?.analytics === true && value?.marketing === false, `${label} Privacy: saved independent consent choices`);
  await page.getByRole("button", { name: "Cookie settings", exact: true }).click();
  await dialog.waitFor({ state: "visible" });
  check(await toggles.nth(0).isChecked() && !await toggles.nth(1).isChecked(), `${label} Privacy: reopened settings preserve toggles`);
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  await page.reload({ waitUntil: "load" });
  await banner.waitFor({ state: "hidden" });
  check(await banner.count() === 0, `${label} Privacy: saved consent suppresses banner after reload`);
}

async function run(label, viewport) {
  const context = await browser.newContext({ viewport });
  let interceptedLeads = 0;
  await context.route("**/*", (route) => {
    const request = route.request();
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method())) {
      failures.push(`${label}: unexpected unmocked mutation blocked: ${request.method()} ${new URL(request.url()).pathname}`);
      return route.abort();
    }
    return route.fallback();
  });
  await context.route("**/api/leads", (route) => {
    interceptedLeads++;
    return route.fulfill({ status: 503, contentType: "application/json",
      body: JSON.stringify({ ok: false, error: "product_reference_mocked" }) });
  });
  // This audit never enters checkout. Block an accidental order mutation too.
  await context.route("**/api/checkout**", (route) => route.abort());
  await context.route(/^https:\/\/[^/]*(?:googletagmanager\.com|google-analytics\.com|doubleclick\.net|facebook\.net)\//,
    (route) => route.fulfill({ status: 204, body: "" }));
  const page = await context.newPage();
  page.setDefaultTimeout(12_000);
  // Network load uses Playwright's usual budget; DOM/control assertions stay at 12 s.
  page.setDefaultNavigationTimeout(30_000);
  page.on("pageerror", (error) => failures.push(`${label}: JavaScript ${error.message}`));
  const externalFonts = new Set();
  const loadedLocalFonts = new Set();
  context.on("request", (request) => {
    if (request.resourceType() === "font" || /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//.test(request.url())) {
      const external = new URL(request.url()).origin !== new URL(baseUrl).origin;
      fontRequests.push({ label, url: request.url(), type: request.resourceType(), external });
      if (external) externalFonts.add(request.url());
    }
  });
  context.on("response", (response) => {
    if (response.request().resourceType() === "font" && response.status() === 200
      && new URL(response.url()).origin === new URL(baseUrl).origin) loadedLocalFonts.add(response.url());
  });
  async function visit(slug) {
    const response = await page.goto(`${baseUrl}/ae/${slug}`, { waitUntil: "load" });
    await page.locator("main h1").first().waitFor();
    check(response?.status() === 200, `${label} ${slug}: HTTP 200`);
    const banner = page.getByRole("region", { name: "Cookies", exact: true });
    if (await banner.isVisible()) await banner.getByRole("button", { name: "Reject", exact: true }).click();
  }
  try {
    await privacyCookies(page, context, label);
  } catch (error) {
    failures.push(`${label} Privacy cookies: ${error.message}`);
    // Continue product inspection even if cookie appearance has regressed.
    await context.addCookies([{ name: "tbb-consent", value: encodeURIComponent(JSON.stringify({ analytics: false, marketing: false })), url: baseUrl }]);
  }
  for (const slug of slugs) {
    try {
      await visit(slug);
      const main = await typography(page, slug, label);
      await captions(main, `${label} ${slug}`);
      await critical(page, main, slug, label);
      console.log(`${label} /${slug}: checked`);
    } catch (error) {
      failures.push(`${label} /${slug}: ${error.message}`);
      console.error(`${label} /${slug}: ${error.message}`);
      await page.screenshot({ path: path.join(output, `${label}-${slug}-failure.png`) }).catch(() => {});
    }
  }
  // Use real SiteLinks after retained Tilda pages; record whether the document
  // is retained instead of pretending a plain anchor is a client transition.
  if (label === "desktop") for (const [legacy, target] of [["terms", "frappe"], ["privacy", "jam"], ["retail", "puree"]]) {
    try {
      await visit(legacy);
      const marker = await page.evaluate(() => { window.__productReferenceNavigation = crypto.randomUUID(); return window.__productReferenceNavigation; });
      await page.getByRole("button", { name: "Open menu", exact: true }).click();
      const menu = page.getByRole("dialog", { name: "Site navigation", exact: true });
      await menu.locator(`a[href="/ae/${target}"]`).click();
      await page.waitForURL(`**/ae/${target}`);
      await page.waitForLoadState("load");
      const retained = await page.evaluate((value) => window.__productReferenceNavigation === value, marker);
      navigations.push({ from: legacy, to: target, mode: retained ? "client" : "document" });
      await typography(page, target, `${label} after ${legacy} SiteLink`);
    } catch (error) {
      failures.push(`${label} ${legacy} SiteLink → ${target}: ${error.message}`);
    }
  }
  check(externalFonts.size === 0, `${label}: no external font or Google-font stylesheet requests`, [...externalFonts]);
  check(loadedLocalFonts.size > 0, `${label}: self-hosted font files delivered successfully`, [...loadedLocalFonts]);
  check(interceptedLeads === 0, `${label}: no lead submission was attempted (mock boundary active)`);
  await context.close();
}

try {
  check(slugs.length === 22 && new Set(slugs).size === 22, "registry: exactly 22 distinct product routes", slugs);
  await run("desktop", { width: 1440, height: 1000 });
  await run("mobile", { width: 390, height: 844 });
} finally {
  await browser.close();
  const result = { baseUrl, at: new Date().toISOString(), routes: slugs, checks: checks.length,
    passed: checks.filter((entry) => entry.ok).length, failures, samples, navigations, screenshots, fontRequests, results: checks };
  fs.writeFileSync(path.join(output, "results.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify({ checks: result.checks, passed: result.passed, failures, navigations, screenshots: screenshots.length }, null, 2));
  process.exitCode = failures.length ? 1 : 0;
}
