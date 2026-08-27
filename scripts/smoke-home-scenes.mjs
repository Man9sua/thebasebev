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
      responseErrors.push(`${label}: ${response.status()} ${url.pathname}${url.search}`);
    }
  });
}

async function capture(page, viewport, label) {
  await page.screenshot({
    path: path.join(artifactRoot, `${viewport}-${label}.png`),
    fullPage: false,
  });
}

async function waitForHome(page, viewport) {
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.locator("[data-hero]").waitFor();

  const loader = page.locator("[data-loading-screen]");
  const introVisible = await loader.isVisible();
  check(introVisible, `${viewport}: intro loader was not visible on document load`);
  if (introVisible) {
    const values = [];
    const reachedComplete = page
      .waitForFunction(
        () => document.querySelector("[data-loading-screen]")?.getAttribute("aria-valuenow") === "100",
        undefined,
        { timeout: 7_500 },
      )
      .then(() => true, () => false);

    await capture(page, viewport, "intro");
    const deadline = Date.now() + 8_000;
    while ((await loader.count()) && Date.now() < deadline) {
      const rawValue = await page.evaluate(
        () => document.querySelector("[data-loading-screen]")?.getAttribute("aria-valuenow") ?? null,
      );
      const value = rawValue === null ? Number.NaN : Number(rawValue);
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

async function assertHero(page, viewport) {
  const hero = page.locator("[data-hero]");
  const title = hero.locator("h1");
  const image = hero.locator("img[fetchpriority='high']").first();
  check(
    (await title.textContent())?.replace(/\s+/g, " ").trim() === "Premium Cream Latte Bases",
    `${viewport}: production hero H1 changed`,
  );
  check(await title.isVisible(), `${viewport}: hero title is not visible after intro`);
  check((await image.count()) === 1, `${viewport}: critical hero photograph is missing`);

  const imageBox = await image.boundingBox();
  const view = page.viewportSize();
  check(
    !!imageBox && imageBox.height >= view.height * 0.9,
    `${viewport}: hero photograph does not fill the scene height`,
  );
  check(
    !!imageBox && imageBox.x + imageBox.width >= view.width - 1,
    `${viewport}: hero photograph does not reach the right edge`,
  );
  check(
    (await hero.locator("a[href='/catalog']").count()) === 1,
    `${viewport}: hero catalog CTA is missing`,
  );
}

async function assertNaturalScroll(page, viewport, scroll) {
  const before = await page.evaluate(() => window.scrollY);
  await scroll();
  const moved = await page
    .waitForFunction((start) => window.scrollY > start + 4, before, { timeout: 2_000 })
    .then(() => true, () => false);
  check(moved, `${viewport}: homepage wheel/touch did not move the document naturally`);
}

async function assertCarousel(page, viewport, swipe) {
  const carousel = page.locator("#bestsellers");
  await carousel.evaluate((element) => element.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(300);

  const productCount = Number(await carousel.getAttribute("data-product-count"));
  check(productCount === 5, `${viewport}: expected five bestseller products`);
  const initial = await carousel.getAttribute("data-active-product-index");

  if (swipe) {
    await swipe(carousel, "next");
  } else {
    await carousel.getByRole("button", { name: "Next product" }).click();
  }

  const changed = await page
    .waitForFunction(
      (previous) =>
        document.querySelector("#bestsellers")?.getAttribute("data-active-product-index") !== previous,
      initial,
      { timeout: 2_000 },
    )
    .then(() => true, () => false);
  check(changed, `${viewport}: bestseller interaction did not change the active product`);

  if (swipe) {
    await swipe(carousel, "previous");
    const returned = await page
      .waitForFunction(
        (expected) =>
          document.querySelector("#bestsellers")?.getAttribute("data-active-product-index") === expected,
        initial,
        { timeout: 2_000 },
      )
      .then(() => true, () => false);
    check(returned, `${viewport}: reverse bestseller swipe did not restore the product`);
  }
  check(
    (await carousel.locator("[aria-hidden='false'][aria-roledescription='slide']").count()) === 1,
    `${viewport}: carousel must expose exactly one active slide`,
  );
  await page.waitForFunction(() => {
    const image = document.querySelector(
      "#bestsellers [aria-hidden='false'][aria-roledescription='slide'] img",
    );
    return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
  });
  await carousel.evaluate((element) => element.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(320);
  await capture(page, viewport, "bestsellers");
}

async function assertSections(page, viewport) {
  const sections = [
    ["section[aria-labelledby='collage-title']", "manufacturing"],
    ["section[aria-labelledby='reading-title']", "reading"],
    ["section[aria-labelledby='about-title']", "about"],
    ["footer", "footer"],
  ];

  for (const [selector, label] of sections) {
    const section = page.locator(selector).first();
    check((await section.count()) === 1, `${viewport}: ${label} section is missing`);
    if ((await section.count()) !== 1) continue;
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(220);
    check(await section.isVisible(), `${viewport}: ${label} section is not visible`);
    await capture(page, viewport, label);
  }

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(overflow <= 1, `${viewport}: horizontal document overflow ${overflow}px`);
}

async function assertDesktopComposition(page, viewport) {
  const metrics = await page.evaluate(() => {
    const columnCount = (element) => {
      if (!(element instanceof HTMLElement)) return 0;
      return getComputedStyle(element)
        .gridTemplateColumns.trim()
        .split(/\s+/)
        .filter(Boolean).length;
    };
    const width = (element) =>
      element instanceof HTMLElement ? element.getBoundingClientRect().width : 0;

    const bestsellers = document.querySelector("#bestsellers");
    const bestsellersInner = bestsellers?.querySelector(":scope > div");
    const collage = document.querySelector("section[aria-labelledby='collage-title']");
    const collageGrid = collage?.querySelector(":scope > div > div:nth-child(2)");
    const reading = document.querySelector("section[aria-labelledby='reading-title']");
    const readingHead = reading?.querySelector(":scope > div");
    const about = document.querySelector("section[aria-labelledby='about-title']");
    const aboutBody = about?.querySelector(":scope > div:nth-child(2) > div:nth-child(2)");
    const footerTop = document.querySelector("footer > div > div");

    return {
      viewportWidth: document.documentElement.clientWidth,
      bestsellersColumns: columnCount(bestsellersInner),
      bestsellersWidth: width(bestsellersInner),
      collageColumns: columnCount(collageGrid),
      readingDirection:
        readingHead instanceof HTMLElement ? getComputedStyle(readingHead).flexDirection : "",
      aboutColumns: columnCount(aboutBody),
      footerColumns: columnCount(footerTop),
    };
  });

  check(
    metrics.bestsellersColumns === 3,
    `${viewport}: Bestsellers collapsed to ${metrics.bestsellersColumns} desktop column(s)`,
  );
  check(
    metrics.bestsellersWidth >= metrics.viewportWidth * 0.78,
    `${viewport}: Bestsellers desktop body is squeezed to ${Math.round(metrics.bestsellersWidth)}px`,
  );
  check(
    metrics.collageColumns === 12,
    `${viewport}: manufacturing collage is not a 12-column desktop grid`,
  );
  check(
    metrics.readingDirection === "row",
    `${viewport}: Reading header retained the mobile column layout`,
  );
  check(
    metrics.aboutColumns === 2,
    `${viewport}: About body retained the mobile single-column layout`,
  );
  check(
    metrics.footerColumns === 4,
    `${viewport}: footer retained the mobile single-column layout`,
  );
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

async function pointerSwipe(page, carousel, direction) {
  const stage = await carousel.locator("[aria-live='polite']").boundingBox();
  check(!!stage, "desktop: Bestsellers pointer swipe stage missing");
  if (!stage) return;

  const fromX = stage.x + stage.width * (direction === "next" ? 0.78 : 0.22);
  const toX = stage.x + stage.width * (direction === "next" ? 0.22 : 0.78);
  const y = stage.y + stage.height * 0.5;
  await page.mouse.move(fromX, y);
  await page.mouse.down();
  await page.mouse.move(toX, y, { steps: 8 });
  await page.mouse.up();
}

async function assertTrackpadCarousel(page, viewport) {
  const carousel = page.locator("#bestsellers");
  const stage = await carousel.locator("[aria-live='polite']").boundingBox();
  check(!!stage, `${viewport}: Bestsellers trackpad stage missing`);
  if (!stage) return;

  const initial = await carousel.getAttribute("data-active-product-index");
  await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height / 2);
  await page.mouse.wheel(90, 0);
  const advanced = await page
    .waitForFunction(
      (previous) =>
        document.querySelector("#bestsellers")?.getAttribute("data-active-product-index") !== previous,
      initial,
      { timeout: 2_000 },
    )
    .then(() => true, () => false);
  check(advanced, `${viewport}: horizontal trackpad swipe did not advance Bestsellers`);

  await page.waitForTimeout(460);
  await page.mouse.wheel(-90, 0);
  const returned = await page
    .waitForFunction(
      (expected) =>
        document.querySelector("#bestsellers")?.getAttribute("data-active-product-index") === expected,
      initial,
      { timeout: 2_000 },
    )
    .then(() => true, () => false);
  check(returned, `${viewport}: reverse trackpad swipe did not restore Bestsellers`);
}

async function auditDesktop(browser, width, height) {
  const viewport = `${width}x${height}`;
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  observe(page, viewport);
  await waitForHome(page, viewport);
  await assertHero(page, viewport);
  await assertDesktopComposition(page, viewport);
  await capture(page, viewport, "hero");
  await assertNaturalScroll(page, viewport, () => page.mouse.wheel(0, Math.round(height * 0.55)));
  await assertCarousel(page, viewport, (carousel, direction) =>
    pointerSwipe(page, carousel, direction),
  );
  await assertTrackpadCarousel(page, viewport);
  await assertSections(page, viewport);
  await context.close();
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
  await assertHero(page, viewport);
  await capture(page, viewport, "hero");
  await assertNaturalScroll(page, viewport, () =>
    touchDrag(page, { x: 195, y: 700 }, { x: 195, y: 160 }),
  );
  await assertCarousel(page, viewport, async (carousel, direction) => {
    const stage = await carousel.locator("[aria-live='polite']").boundingBox();
    check(!!stage, `${viewport}: Bestsellers swipe stage missing`);
    if (!stage) return;
    await touchDrag(
      page,
      {
        x: stage.x + stage.width * (direction === "next" ? 0.78 : 0.22),
        y: stage.y + stage.height * 0.5,
      },
      {
        x: stage.x + stage.width * (direction === "next" ? 0.22 : 0.78),
        y: stage.y + stage.height * 0.5,
      },
    );
  });
  await assertSections(page, viewport);
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
  console.error("Homepage experience smoke failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Homepage experience smoke passed for ${baseUrl}.`);
console.log(`Screenshots: ${artifactRoot}`);
