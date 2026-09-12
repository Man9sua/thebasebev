import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const captureScreenshots = process.argv.includes("--screenshots");
const chromePath =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactRoot = path.join(os.tmpdir(), "thebase-resource-ui");
const viewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];
const failures = [];

if (captureScreenshots) fs.mkdirSync(artifactRoot, { recursive: true });

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function open(page, route) {
  const response = await page.goto(`${baseUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  check(response?.status() === 200, `${route}: expected HTTP 200, got ${response?.status()}`);
  await page.waitForTimeout(650);
}

async function shellAndOverflow(page, route, viewport) {
  check((await page.locator("header").count()) === 1, `${route} ${viewport}: expected one header`);
  check((await page.locator("footer").count()) === 1, `${route} ${viewport}: expected one footer`);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(overflow <= 1, `${route} ${viewport}: horizontal overflow is ${overflow}px`);
}

async function auditViewport(browser, viewport) {
  const label = `${viewport.width}x${viewport.height}`;
  const page = await browser.newPage({ viewport });
  const pageErrors = [];
  const failedInternal = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.origin === baseUrl && response.status() >= 400) {
      failedInternal.push(`${response.status()} ${url.pathname}`);
    }
  });

  await open(page, "/resources/tools");
  check((await page.locator("[data-tools-page]").count()) === 1, `${label}: tools React page missing`);
  check((await page.locator("#rec2429369331, #rec2430603261").count()) === 0, `${label}: legacy tool records remain`);
  check(
    (await page.locator('[data-calculator-result="cost"] strong').textContent())?.trim() === "3.92 AED",
    `${label}: default calculator result changed`,
  );
  await shellAndOverflow(page, "/resources/tools", label);
  if (captureScreenshots && (viewport.width === 390 || viewport.width === 1440)) {
    await page.screenshot({ path: path.join(artifactRoot, `tools-${label}.png`), fullPage: true });
  }

  if (viewport.width === 390 || viewport.width === 1440) {
    await page.getByLabel("Cost per kg (AED)").fill("160");
    check(
      (await page.locator('[data-calculator-result="cost"] strong').textContent())?.trim() === "4.80 AED",
      `${label}: calculator did not recompute after input`,
    );
    await page.getByRole("button", { name: "RU", exact: true }).click();
    check(
      (await page.locator('[data-calculator-result="cost"] strong').textContent())?.trim() === "4.80 ₽",
      `${label}: RU currency switch failed`,
    );
    await page.locator("[data-menu-picker] input[type='checkbox']").first().check();
    await page.locator("[data-menu-generate]").click();
    check((await page.locator("[data-menu-template]").count()) === 1, `${label}: menu was not generated`);
    await page.locator("[data-menu-reset]").click();
    check((await page.locator("[data-menu-template]").count()) === 0, `${label}: menu reset failed`);
  }

  await open(page, "/resources/glossary");
  check((await page.locator("[data-glossary-page]").count()) === 1, `${label}: glossary React page missing`);
  check((await page.locator("[data-glossary-term]").count()) === 101, `${label}: glossary does not expose 101 terms`);
  check(!(await page.locator("body").innerText()).includes("configured for another domain"), `${label}: Tilda domain error remains`);
  check((await page.locator("#rec2427859911, #rec2427859921, #rec2427859931").count()) === 0, `${label}: legacy glossary records remain`);
  await shellAndOverflow(page, "/resources/glossary", label);
  if (captureScreenshots && (viewport.width === 390 || viewport.width === 1440)) {
    await page.screenshot({ path: path.join(artifactRoot, `glossary-${label}.png`), fullPage: true });
  }

  if (viewport.width === 390 || viewport.width === 1440) {
    const glossarySearch = page.getByRole("searchbox", { name: "Search glossary" });
    await glossarySearch.fill("Brix");
    const exactBrixTitles = await page.locator("[data-glossary-term] h2").allTextContents();
    check(
      exactBrixTitles.filter((title) => title.trim() === "Brix").length === 2,
      `${label}: glossary search did not retain both Brix entries`,
    );
    await glossarySearch.fill("");
    await page.getByRole("button", { name: "HoReCa & business" }).click();
    const businessCount = await page.locator("[data-glossary-term]").count();
    check(businessCount > 0 && businessCount < 101, `${label}: category filter did not narrow results`);
  }

  await open(page, "/wholesale-strategy");
  check((await page.locator("#rec2361929781").count()) === 0, `${label}: wholesale attribution record remains`);
  check(!(await page.locator("body").innerText()).includes("Mineragua Sparkling Water"), `${label}: wholesale attribution copy remains`);
  await shellAndOverflow(page, "/wholesale-strategy", label);

  if (viewport.width === 390 || viewport.width === 1440) {
    const homePage = await browser.newPage({ viewport });
    await open(homePage, "/");
    const homePresent = (await homePage.locator("[data-hero]").count()) === 1;
    check(homePresent, `${label}: homepage missing during the blog-link audit`);
    // The reading rail went with the redesign; the assertion stays so a link to
    // the removed Blog index cannot reappear on the homepage by another route.
    check(
      (await homePage.locator('a[href="/resources/blog"]').count()) === 0,
      `${label}: a link to the removed Blog index is back on the homepage`,
    );
    await homePage.close();
  }

  check(pageErrors.length === 0, `${label}: page errors: ${pageErrors.join(" | ")}`);
  check(failedInternal.length === 0, `${label}: failed internal responses: ${failedInternal.join(" | ")}`);
  await page.close();
}

const browser = await chromium.launch({ executablePath: chromePath, headless: true });

try {
  for (const viewport of viewports) await auditViewport(browser, viewport);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`Resource UI smoke failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Resource UI smoke PASS at ${viewports.map(({ width, height }) => `${width}x${height}`).join(", ")}`);
if (captureScreenshots) console.log(`Screenshots: ${artifactRoot}`);
