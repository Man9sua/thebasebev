import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const captureScreenshots = process.argv.includes("--screenshots");
const chromePath =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactRoot = path.join(os.tmpdir(), "thebase-glossary-ui");
const glossary = JSON.parse(fs.readFileSync("src/data/glossary-content.json", "utf8"));
const entries = glossary.entries;
const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
  { width: 360, height: 800 },
  { width: 320, height: 720 },
];
const failures = [];

if (captureScreenshots) fs.mkdirSync(artifactRoot, { recursive: true });

function check(condition, message) {
  if (!condition) failures.push(message);
}

function normalize(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

async function open(page, route) {
  const response = await page.goto(`${baseUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  check(response?.status() === 200, `${route}: expected HTTP 200, received ${response?.status()}`);
}

async function shellAndOverflow(page, label) {
  check(
    (await page.locator("header[data-header-theme]").count()) === 1,
    `${label}: shared header missing or duplicated`,
  );
  check(
    (await page.locator('footer[data-surface="dark"]').count()) === 1,
    `${label}: shared footer missing or duplicated`,
  );
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(overflow <= 1, `${label}: horizontal overflow is ${overflow}px`);
}

async function auditListing(browser, viewport) {
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

  await open(page, "/resources/glossary");
  await page.locator("[data-glossary-page]").waitFor();
  await page.waitForTimeout(500);
  const acceptCookies = page.getByRole("button", { name: "Accept all", exact: false });
  if ((await acceptCookies.count()) > 0 && (await acceptCookies.first().isVisible())) {
    await acceptCookies.first().click();
  }
  const cards = page.locator("[data-glossary-term]");
  check((await cards.count()) === entries.length, `${label}: expected ${entries.length} cards`);
  check(
    new Set(await cards.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")))).size ===
      entries.length,
    `${label}: card hrefs are not unique`,
  );
  await shellAndOverflow(page, `listing ${label}`);

  if (viewport.width === 1440 || viewport.width === 390) {
    const search = page.getByRole("searchbox", { name: "Search glossary" });
    await search.fill("alienate mainstream");
    check((await cards.count()) === 1, `${label}: full-body search did not isolate one result`);
    check(
      (await cards.first().getAttribute("data-glossary-uid")) === "u0e5dx7os1",
      `${label}: full-body search returned the wrong term`,
    );
    await search.fill("");

    await page.getByRole("button", { name: "HoReCa & business", exact: true }).click();
    check(
      (await cards.count()) === entries.filter((entry) => entry.category === "business").length,
      `${label}: category filter count is wrong`,
    );
    await page.getByRole("button", { name: "All terms", exact: true }).click();

    const alphabet = page.locator('[aria-label="Alphabetical filter"]');
    await alphabet.getByRole("button", { name: "A", exact: true }).click();
    check(
      (await cards.count()) === entries.filter((entry) => entry.title.startsWith("A")).length,
      `${label}: alphabet filter count is wrong`,
    );
    await alphabet.getByRole("button", { name: "All", exact: true }).click();
  }

  if (captureScreenshots && [1440, 390, 320].includes(viewport.width)) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(artifactRoot, `listing-${label}.png`) });
  }

  check(pageErrors.length === 0, `${label}: page errors: ${pageErrors.join(" | ")}`);
  check(failedInternal.length === 0, `${label}: failed internal responses: ${failedInternal.join(" | ")}`);
  await page.close();
}

async function auditArticle(browser, viewport, entry, suffix = "") {
  const label = `${viewport.width}x${viewport.height} ${entry.uid}${suffix}`;
  const page = await browser.newPage({ viewport });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await open(page, entry.path);
  await page.locator("[data-glossary-article]").waitFor();
  check(normalize(await page.locator("h1").textContent()) === entry.title, `${label}: H1 mismatch`);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  check(canonical === entry.seo.canonical, `${label}: canonical mismatch`);
  const renderedBody = normalize(await page.locator("[data-glossary-article-body]").innerText());
  if (entry.contentStatus === "published") {
    check(renderedBody === normalize(entry.bodyText), `${label}: rendered article body mismatch`);
  } else {
    check(
      renderedBody.includes("does not currently include published article copy"),
      `${label}: empty production-source state missing`,
    );
  }
  check(
    (await page.getByRole("link", { name: "Back to Glossary" }).getAttribute("href")) ===
      "/resources/glossary",
    `${label}: back link is invalid`,
  );
  await shellAndOverflow(page, `article ${label}`);
  check(pageErrors.length === 0, `${label}: page errors: ${pageErrors.join(" | ")}`);

  if (captureScreenshots && suffix && [1440, 390, 320].includes(viewport.width)) {
    await page.screenshot({ path: path.join(artifactRoot, `article-${label.replaceAll(" ", "-")}.png`) });
  }
  await page.close();
}

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const longest = entries.reduce((current, entry) =>
  entry.bodyText.length > current.bodyText.length ? entry : current,
);
const representatives = [
  entries[0],
  entries[Math.floor(entries.length / 2)],
  entries.at(-1),
  longest,
].filter((entry, index, all) => all.findIndex((candidate) => candidate.uid === entry.uid) === index);

try {
  for (const viewport of viewports) {
    await auditListing(browser, viewport);
    await auditArticle(browser, viewport, entries[0]);
  }
  for (const viewport of [viewports[0], viewports[5], viewports.at(-1)]) {
    for (const entry of representatives) await auditArticle(browser, viewport, entry, "representative");
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(`Glossary browser smoke failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Glossary browser smoke PASS: ${entries.length} cards, ${viewports.length} viewports`);
if (captureScreenshots) console.log(`Screenshots: ${artifactRoot}`);
