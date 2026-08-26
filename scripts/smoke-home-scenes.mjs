import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const chromePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifactRoot = path.resolve(".visual-artifacts", "home-scenes");
const failures = [];
const pageErrors = [];
const responseErrors = [];

fs.mkdirSync(artifactRoot, { recursive: true });

function check(condition, message) {
  if (!condition) failures.push(message);
}

function observe(page, label) {
  page.on("pageerror", (error) => pageErrors.push(`${label}: ${error.message}`));
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.origin === baseUrl && response.status() >= 400) {
      responseErrors.push(`${label}: ${response.status()} ${url.pathname}`);
    }
  });
}

async function waitForHome(page, viewport) {
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.locator("[data-home-experience]").waitFor();
  const loader = page.locator("[data-loading-screen]");
  if (await loader.count()) {
    const values = [];
    // Run independently of the screenshot/sample loop. The completed value is
    // deliberately held for only one visual beat, and a remote browser can be
    // descheduled between two Node-side polls even though a visitor sees it.
    const reachedComplete = page
      .waitForFunction(
        () => document.querySelector("[data-loading-screen]")?.getAttribute("aria-valuenow") === "100",
        undefined,
        { timeout: 7_500 },
      )
      .then(() => true, () => false);
    await page.screenshot({
      path: path.join(artifactRoot, `${viewport}-intro.png`),
      fullPage: false,
    });
    const deadline = Date.now() + 8_000;
    while ((await loader.count()) && Date.now() < deadline) {
      const value = Number(await loader.getAttribute("aria-valuenow"));
      if (Number.isFinite(value) && values.at(-1) !== value) values.push(value);
      await page.waitForTimeout(80);
    }
    check(!(await loader.count()), `${viewport}: intro loader did not leave the page`);
    check(values.length > 1 && values[0] < 100, `${viewport}: intro did not expose real progress`);
    check(await reachedComplete, `${viewport}: intro never exposed its completed 100% state`);
    check(
      values.every((value, index) => index === 0 || value >= values[index - 1]),
      `${viewport}: intro progress moved backwards`,
    );
  }
  await page.waitForTimeout(250);
}

async function readState(page) {
  return page.locator("[data-home-experience]").evaluate((root) => ({
    scene: Number(root.getAttribute("data-active-scene")),
    sceneName: root.getAttribute("data-active-scene-name"),
    product: root.getAttribute("data-active-product"),
    headerTheme: document.querySelector("header")?.getAttribute("data-header-theme"),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
}

async function waitForScene(page, scene) {
  await page.waitForFunction(
    (expected) =>
      document.querySelector("[data-home-experience]")?.getAttribute("data-active-scene") ===
      String(expected),
    scene,
    { timeout: 3_000 },
  );
}

async function waitForProduct(page, previous) {
  await page.waitForFunction(
    (value) =>
      document.querySelector("[data-home-experience]")?.getAttribute("data-active-product") !==
      value,
    previous,
    { timeout: 2_000 },
  );
}

async function capture(page, viewport, label) {
  await page.screenshot({
    path: path.join(artifactRoot, `${viewport}-${label}.png`),
    fullPage: false,
  });
}

async function wheelUntilScene(page, from, to, viewport) {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const state = await readState(page);
    if (state.scene === to) return;
    check(state.scene === from, `${viewport}: wheel skipped scene ${from} and reached ${state.scene}`);
    if (state.scene !== from) return;
    await page.mouse.wheel(0, Math.round(page.viewportSize().height * 0.36));
    await page.waitForTimeout(320);
  }
  failures.push(`${viewport}: wheel did not advance scene ${from} -> ${to}`);
}

async function auditDesktop(browser, width, height) {
  const viewport = `${width}x${height}`;
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  observe(page, viewport);
  await waitForHome(page, viewport);

  let state = await readState(page);
  check(state.scene === 0 && state.sceneName === "hero", `${viewport}: hero is not initial scene`);
  check(state.headerTheme === "hero", `${viewport}: hero header theme is not transparent`);
  check(state.overflow <= 1, `${viewport}: horizontal document overflow ${state.overflow}px`);
  await capture(page, viewport, "scene-0-hero");

  // Small deltas exercise the accumulator used by a precision trackpad.
  for (let pulse = 0; pulse < 4; pulse += 1) await page.mouse.wheel(0, 12);
  await waitForScene(page, 1);
  await page.waitForTimeout(1_000);
  state = await readState(page);
  check(state.headerTheme === "light", `${viewport}: Bestsellers header theme is not light`);
  await capture(page, viewport, "scene-1-product-0");

  const productCount = Number(await page.locator("#bestsellers").getAttribute("data-product-count"));
  check(productCount >= 2, `${viewport}: Bestsellers does not expose multiple products`);
  const products = [state.product];
  for (let index = 1; index < productCount; index += 1) {
    const previous = products.at(-1);
    await page.mouse.wheel(0, 120);
    await waitForProduct(page, previous);
    await page.waitForTimeout(620);
    const next = await readState(page);
    products.push(next.product);
    check(next.scene === 1, `${viewport}: product wheel left Bestsellers too early`);
    await capture(page, viewport, `scene-1-product-${index}`);
  }
  check(new Set(products).size === productCount, `${viewport}: wheel did not activate each product`);

  await page.mouse.wheel(0, 120);
  await waitForScene(page, 2);
  await page.waitForTimeout(1_000);
  await capture(page, viewport, "scene-2-manufacturing");

  await wheelUntilScene(page, 2, 3, viewport);
  await page.waitForTimeout(900);
  await capture(page, viewport, "scene-3-reading");

  await wheelUntilScene(page, 3, 4, viewport);
  await page.waitForTimeout(900);
  await capture(page, viewport, "scene-4-about");

  await wheelUntilScene(page, 4, 5, viewport);
  await page.waitForTimeout(900);
  state = await readState(page);
  check(state.scene === 5 && state.sceneName === "footer", `${viewport}: footer scene not reached`);
  check(state.headerTheme === "dark", `${viewport}: footer did not switch header to dark`);
  await capture(page, viewport, "scene-5-footer");

  await page.mouse.wheel(0, -120);
  await waitForScene(page, 4);
  await page.waitForTimeout(900);
  state = await readState(page);
  check(state.sceneName === "about", `${viewport}: reverse wheel did not restore About`);
  check(state.overflow <= 1, `${viewport}: horizontal overflow after scene interactions`);
  await context.close();
}

async function touchDrag(page, from, to) {
  const session = await page.context().newCDPSession(page);
  const point = (x, y) => ({ x, y, id: 1, radiusX: 5, radiusY: 5, force: 1 });
  try {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [point(from.x, from.y)],
    });
    for (let step = 1; step <= 6; step += 1) {
      const progress = step / 6;
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          point(
            from.x + (to.x - from.x) * progress,
            from.y + (to.y - from.y) * progress,
          ),
        ],
      });
      await page.waitForTimeout(32);
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  } finally {
    await session.detach();
  }
}

async function touchUntilScene(page, from, to, viewport) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const state = await readState(page);
    if (state.scene === to) return;
    check(state.scene === from, `${viewport}: touch scroll skipped scene ${from} and reached ${state.scene}`);
    if (state.scene !== from) return;
    await touchDrag(page, { x: 195, y: 700 }, { x: 195, y: 120 });
    await page.waitForTimeout(400);
  }
  failures.push(`${viewport}: touch scroll did not advance scene ${from} -> ${to}`);
}

async function auditMobile(browser) {
  const viewport = "390x844";
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  observe(page, viewport);
  await waitForHome(page, viewport);

  let state = await readState(page);
  check(state.scene === 0, `${viewport}: hero is not initial scene`);
  check(state.overflow <= 1, `${viewport}: horizontal document overflow ${state.overflow}px`);
  await capture(page, viewport, "scene-0-hero");

  await touchUntilScene(page, 0, 1, viewport);
  await page.waitForTimeout(500);
  await capture(page, viewport, "scene-1-product-0");

  const stage = await page.locator("#bestsellers [aria-live='polite']").boundingBox();
  check(!!stage, `${viewport}: Bestsellers swipe stage missing`);
  if (stage) {
    const previous = (await readState(page)).product;
    await touchDrag(
      page,
      { x: stage.x + stage.width * 0.78, y: stage.y + stage.height * 0.5 },
      { x: stage.x + stage.width * 0.22, y: stage.y + stage.height * 0.5 },
    );
    await waitForProduct(page, previous);
    await page.waitForTimeout(620);
    state = await readState(page);
    check(state.scene === 1, `${viewport}: product swipe changed the scene`);
    await capture(page, viewport, "scene-1-product-1");
  }

  const sceneNames = ["manufacturing", "reading", "about", "footer"];
  for (let index = 0; index < sceneNames.length; index += 1) {
    const scene = index + 2;
    await touchUntilScene(page, scene - 1, scene, viewport);
    await page.waitForTimeout(450);
    await capture(page, viewport, `scene-${scene}-${sceneNames[index]}`);
  }

  state = await readState(page);
  check(state.headerTheme === "dark", `${viewport}: footer did not switch header to dark`);
  check(state.overflow <= 1, `${viewport}: horizontal overflow after swipe/scroll sequence`);
  await context.close();
}

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
try {
  await auditMobile(browser);
  await auditDesktop(browser, 1440, 900);
  await auditDesktop(browser, 1920, 1080);
} finally {
  await browser.close();
}

failures.push(...pageErrors, ...responseErrors);
if (failures.length) {
  console.error("Homepage scene smoke failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Homepage scene smoke passed for ${baseUrl}.`);
console.log(`Screenshots: ${artifactRoot}`);
