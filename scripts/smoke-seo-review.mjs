import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const origin = new URL(baseUrl).origin;
const preview = new URL(baseUrl).hostname.endsWith(".workers.dev");
const artifactRoot = path.resolve("output/seo-review");
const failures = [];
const checks = [];
const supportRoutes = [
  "/find-your-distributor", "/careers", "/request-samples", "/certificates",
  "/faq", "/cookie-policy", "/electrolyte",
];

fs.mkdirSync(artifactRoot, { recursive: true });

function check(condition, message) {
  checks.push(message);
  if (!condition) failures.push(message);
}

function normalize(text) {
  return text.replace(/\s+/g, " ").trim();
}

function hasType(entry, type) {
  return [entry["@type"]].flat().includes(type);
}

async function structuredData(page) {
  return page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => {
    const flatten = (value) => Array.isArray(value) ? value.flatMap(flatten)
      : value && typeof value === "object" ? [value, ...flatten(value["@graph"])] : [];
    return scripts.flatMap((script) => flatten(JSON.parse(script.textContent || "null")));
  });
}

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});

async function mockLeadDelivery(context, leads) {
  // This boundary is mocked before any page is opened. No lead reaches CRM.
  await context.route("**/api/leads", async (route) => {
    leads.push(route.request().postDataJSON());
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      headers: { "Cache-Control": "no-store" },
      body: JSON.stringify({
        ok: false,
        error: "lead_backend_unavailable",
        message: "Lead delivery is temporarily unavailable. Please contact us directly.",
        requestId: "seo-review-mocked",
      }),
    });
  });
}

async function runViewport(label, viewport) {
  const context = await browser.newContext({ viewport });
  const leads = [];
  await mockLeadDelivery(context, leads);
  const page = await context.newPage();
  page.setDefaultTimeout(12_000);
  page.on("pageerror", (error) => failures.push(`${label}: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && /Hydration failed|hydrated but some attributes|did not match/i.test(message.text())) {
      failures.push(`${label}: ${message.text().split("\n")[0]}`);
    }
  });

  async function visit(route) {
    const response = await page.goto(`${baseUrl}/ae${route}`, { waitUntil: "domcontentloaded" });
    await page.locator("main h1").first().waitFor();
    check(response?.status() === 200, `${label} ${route}: HTTP 200`);
    if (preview) {
      const robots = response?.headers()["x-robots-tag"] ?? "";
      check(/noindex/i.test(robots) && /nofollow/i.test(robots), `${label} ${route}: preview transport noindex, nofollow`);
    }
    return response;
  }

  async function caseOf(name, test) {
    try {
      await test();
      console.log(`${label}: ${name} checked`);
    } catch (error) {
      failures.push(`${label} ${name}: ${error.message}`);
      await page.screenshot({ path: path.join(artifactRoot, `${label}-${name}.png`), fullPage: false }).catch(() => {});
    }
  }

  const landingPath = "/careers?utm_source=chatgpt.com&utm_campaign=seo-review";
  await visit(landingPath);
  const banner = page.getByRole("region", { name: "Cookies", exact: true });
  if (await banner.count()) await banner.getByRole("button", { name: "Reject", exact: true }).click();

  async function waitForLeadBridge(form) {
    // The bridge adds this readonly spam field when it arms the form handlers.
    await form.locator('input[name="company_website"][readonly]').waitFor({ state: "attached" });
  }

  async function completeIdentity(form) {
    await waitForLeadBridge(form);
    await form.locator('input[name="name"]').fill("SEO Review");
    await form.locator('input[name="email"]').fill("seo-review@example.com");
    await form.locator('input[name="Phone"]').fill("+971500000000");
    const consent = form.locator('input[name="privacy-consent"]');
    check(await consent.getAttribute("required") !== null, `${label}: privacy consent is required`);
    await consent.evaluate((input) => {
      input.checked = true;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  async function failedSubmit(form, route) {
    const count = leads.length;
    const response = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/leads");
    await form.evaluate((element) => element.requestSubmit());
    await response;
    await form.locator(".js-rule-error-all").filter({ hasText: /temporarily unavailable/i }).waitFor({ state: "visible" });
    check(leads.length === count + 1, `${label} ${route}: one mocked lead request`);
    check(!(await form.locator(".js-successbox").isVisible()), `${label} ${route}: failed delivery does not show success`);
    const lead = leads.at(-1);
    check(lead?.consent === true, `${label} ${route}: consent is included`);
    check(lead?.utm_source === "chatgpt.com" && lead?.utm_campaign === "seo-review", `${label} ${route}: first-touch campaign retained`);
    check(lead?.landingPage === `${baseUrl}/ae${landingPath}`, `${label} ${route}: first-touch landing retained`);
    check(typeof lead?.referrer === "string", `${label} ${route}: referrer field retained`);
    check(new URL(lead?.submissionPage ?? origin).pathname === `/ae${route}`, `${label} ${route}: current submission page retained`);
    return lead;
  }

  await caseOf("careers", async () => {
    const form = page.locator("#form909008440");
    check((await form.getByRole("link", { name: "Email your CV" }).getAttribute("href"))?.startsWith("mailto:"), `${label} careers: CV email flow`);
    check(await form.locator('input[type="file"]').count() === 0, `${label} careers: no unconnected upload control`);
    await form.locator('input[name="area"][value="Production"]').check();
    const messageField = form.getByRole("textbox", { name: "A few words about you" });
    const message = await messageField.isVisible() ? "Production operations and beverage quality experience." : "";
    if (message) await messageField.fill(message);
    await completeIdentity(form);
    check((await form.getByRole("link", { name: "Privacy Policy" }).getAttribute("href")) === "/ae/privacy", `${label} careers: working privacy link`);
    const lead = await failedSubmit(form, "/careers");
    check(lead?.formType === "careers" && lead?.formName === "Join Our Team", `${label} careers: preserved Tilda form contract`);
    check(lead?.message === `Area: Production\n\n${message}`.trim(), `${label} careers: selected area and available message retained`);
  });

  await caseOf("private-label", async () => {
    await visit("/private-labeling");
    const form = page.locator("#form1855232921");
    await waitForLeadBridge(form);
    await page.locator("#private-label-formats").getByRole("link").filter({ has: page.getByRole("heading", { name: "Custom product development" }) }).click();
    await page.waitForFunction(() => document.querySelector('#form1855232921 select[name="product"]')?.value === "Custom product development");
    check(await form.locator('select[name="product"]').inputValue() === "Custom product development", `${label} private label: chosen format fills brief`);
    await completeIdentity(form);
    await form.locator('input[name="company"]').fill("THE BASE QA");
    await form.locator('textarea[name="text"]').fill("Develop a low-sugar cafe beverage in cans.");
    const lead = await failedSubmit(form, "/private-labeling");
    check(lead?.formType === "custom-flavour" && lead?.formName === "Custom flavor for your brand", `${label} private label: preserved Tilda form contract`);
    check(lead?.product === "Custom product development" && lead?.company === "THE BASE QA" && lead?.message === "Develop a low-sugar cafe beverage in cans.", `${label} private label: selected format, company and brief submitted`);
  });

  await caseOf("about", async () => {
    await visit("/about-us");
    const copy = await page.locator("main").innerText();
    check(!/Team of Professional|Habeebudheen|Michael Figueroa|Waqar Ahmed/.test(copy), `${label} about: removed team stays removed`);
    check(await page.locator("main [class*='labAccent'], main [class*='photoFrame']").count() === 0, `${label} about: no decorative laboratory frame`);
    check(await page.locator("#laboratory img").count() === 2, `${label} about: both lab photographs retained`);
    check(await page.locator('#laboratory a[href="/ae/rnd#rnd-form"]').count() === 1, `${label} about: lab CTA opens R&D brief`);
  });

  for (const [slug, count, sourceFlavour, calories] of [["milkshake", 9, "Vanilla", "123"], ["frappe", 3, "Salted Caramel", "143"]]) {
    await caseOf(slug, async () => {
      await visit(`/${slug}`);
      for (const title of ["Made for service", "How to prepare", `${count} flavours`, "Ready for your menu", "Inside the pack"]) {
        check(await page.getByRole("heading", { name: title, exact: true }).isVisible(), `${label} ${slug}: ${title} visible`);
      }
      const menuPhotos = page.locator('section[aria-label="Ready for your menu"] img');
      check(await menuPhotos.count() === (slug === "milkshake" ? 8 : 5), `${label} ${slug}: complete menu photo gallery`);
      for (const photo of await menuPhotos.all()) {
        await photo.scrollIntoViewIfNeeded();
        await photo.evaluate((image) => image.decode());
        check(await photo.evaluate((image) => image.naturalWidth > 0), `${label} ${slug}: menu photo loads`);
      }
      check(await page.locator('main nav[aria-label="Breadcrumb"]').count() === 0, `${label} ${slug}: no overline breadcrumbs`);
      const nutrition = page.locator("section").filter({ has: page.getByRole("heading", { name: "Inside the pack", exact: true }) });
      check(await nutrition.getByRole("tablist").count() === 0, `${label} ${slug}: no unsupported nutrition variants`);
      const table = nutrition.locator("[class*='nutritionFullMobile']");
      check(await table.count() === 1 && await table.isVisible(), `${label} ${slug}: single source nutrition table visible`);
      check((await table.innerText()).includes(sourceFlavour), `${label} ${slug}: nutrition labelled for supplied flavour`);
      check((await table.innerText()).includes(calories), `${label} ${slug}: source calories retained`);
      const details = page.locator("section[aria-labelledby='product-faq-title'] details");
      check(await details.count() === 9, `${label} ${slug}: all nine FAQ entries retained`);
      check(await details.locator("summary:visible").count() === 9, `${label} ${slug}: all FAQ questions visible`);
      check(await details.evaluateAll((nodes) => nodes.every((node) => !node.open)), `${label} ${slug}: FAQ starts collapsed`);
      await details.first().locator("summary").click();
      check(await details.first().locator("p").isVisible(), `${label} ${slug}: FAQ opens`);
      await details.first().locator("summary").click();
      await page.waitForFunction(() => {
        const answer = document.querySelector("section[aria-labelledby='product-faq-title'] details");
        return answer && !answer.open && !answer.style.height && !answer.style.overflow;
      });
      check(await details.first().getAttribute("data-expanded") === "false", `${label} ${slug}: FAQ closes and releases animation styles`);
      const cta = page.getByRole("link", { name: "Develop a flavour", exact: true });
      check(await cta.getAttribute("href") === "/ae/rnd#rnd-form", `${label} ${slug}: R&D CTA reaches real brief`);
      await cta.click();
      await page.locator("#rnd-form #form861442702").waitFor();
      check(page.url().endsWith("/ae/rnd#rnd-form"), `${label} ${slug}: R&D destination and anchor load`);
    });
  }

  await caseOf("support-routes", async () => {
    for (const route of supportRoutes) {
      await visit(route);
      check(await page.locator("main h1").count() === 1, `${label} ${route}: one visible H1`);
      check(await page.locator('link[rel="canonical"]').getAttribute("href") === `https://thebasebev.com/ae${route}`, `${label} ${route}: production canonical`);
      const schema = await structuredData(page);
      check(schema.some((entry) => hasType(entry, "Organization")), `${label} ${route}: Organization schema`);
      check(schema.some((entry) => hasType(entry, "BreadcrumbList")), `${label} ${route}: BreadcrumbList schema`);
    }
  });

  await caseOf("faq-schema", async () => {
    await visit("/faq");
    const visible = await page.locator("main details").evaluateAll((details) => details.map((item) => ({
      question: item.querySelector("summary span")?.textContent ?? "",
      answer: item.querySelector("p")?.textContent ?? "",
    })));
    const faq = (await structuredData(page)).find((entry) => hasType(entry, "FAQPage"));
    check(visible.length > 0 && faq?.mainEntity?.length === visible.length, `${label} FAQ: visible and structured question counts match`);
    check(visible.every((item, index) => normalize(item.question) === normalize(faq?.mainEntity?.[index]?.name ?? "") && normalize(item.answer) === normalize(faq?.mainEntity?.[index]?.acceptedAnswer?.text ?? "")), `${label} FAQ: structured text matches visible content`);
    await page.locator("main details summary").first().click();
    check(await page.locator("main details p").first().isVisible(), `${label} FAQ: interactive answer opens`);
  });

  await caseOf("cookie-settings", async () => {
    await visit("/cookie-policy");
    await page.locator("main").getByRole("button", { name: "Cookie settings", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Cookie settings", exact: true });
    await dialog.waitFor();
    const analytics = dialog.getByRole("checkbox").first();
    await analytics.check();
    check(await analytics.isChecked(), `${label} cookie policy: analytics setting changes`);
    await dialog.getByRole("button", { name: "Save choices", exact: true }).click();
    check(await dialog.count() === 0, `${label} cookie policy: settings save closes dialog`);
    await page.locator("main").getByRole("button", { name: "Cookie settings", exact: true }).click();
    check(await dialog.getByRole("checkbox").first().isChecked(), `${label} cookie policy: saved choice restored`);
    await page.keyboard.press("Escape");
    check(await dialog.count() === 0, `${label} cookie policy: Escape closes dialog`);
  });

  await context.close();
}

async function runShortViewport() {
  const context = await browser.newContext({ viewport: { width: 390, height: 450 }, hasTouch: true });
  const leads = [];
  await mockLeadDelivery(context, leads);
  const page = await context.newPage();
  page.setDefaultTimeout(12_000);
  try {
    await page.goto(`${baseUrl}/ae/request-samples`, { waitUntil: "domcontentloaded" });
    const banner = page.getByRole("region", { name: "Cookies", exact: true });
    if (await banner.count()) await banner.getByRole("button", { name: "Reject", exact: true }).click();
    await page.locator("main").getByRole("button", { name: "Request samples", exact: true }).click();
    const panel = page.getByRole("dialog", { name: /Try Before You Buy/ });
    await panel.waitFor();
    const metrics = await panel.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      overflowY: getComputedStyle(element).overflowY,
      touchAction: getComputedStyle(element).touchAction,
      overscroll: getComputedStyle(element).overscrollBehaviorY,
    }));
    check(metrics.scrollHeight > metrics.clientHeight, "short viewport: sample form exceeds available height");
    check(metrics.overflowY === "auto" && metrics.touchAction === "pan-y" && metrics.overscroll === "contain", "short viewport: modal allows contained vertical scrolling");
    await page.mouse.move(195, 225);
    await page.mouse.wheel(0, 900);
    await page.waitForFunction(() => document.querySelector("#sample-request-modal-form")?.closest('[role="dialog"]')?.scrollTop > 0);
    check(await panel.evaluate((element) => element.scrollTop > 0), "short viewport: user wheel scroll moves the modal");
    const submit = panel.getByRole("button", { name: "Send Me a Sample", exact: true });
    const visible = await submit.evaluate((element) => {
      const button = element.getBoundingClientRect();
      const modal = element.closest('[role="dialog"]').getBoundingClientRect();
      return button.top >= modal.top && button.bottom <= modal.bottom && button.bottom <= window.innerHeight;
    });
    check(visible, "short viewport: scrolling reveals the full submit button");
    await submit.click();
    check(await panel.locator('input[name="name"]').evaluate((element) => element === document.activeElement), "short viewport: revealed submit can be clicked and validates required fields");
    check(leads.length === 0, "short viewport: incomplete form does not send a lead");
    await page.keyboard.press("Escape");
    check(await panel.count() === 0, "short viewport: modal still closes with Escape");
    console.log("short viewport: sample modal scroll and submit checked");
  } catch (error) {
    failures.push(`short viewport: ${error.message}`);
    await page.screenshot({ path: path.join(artifactRoot, "short-modal.png") }).catch(() => {});
  } finally {
    await context.close();
  }
}

try {
  for (const [label, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    try {
      await runViewport(label, viewport);
    } catch (error) {
      failures.push(`${label} setup: ${error.message}`);
    }
  }
  await runShortViewport();
} finally {
  await browser.close();
  const report = { baseUrl, mockedLeadsOnly: true, checks: checks.length, failures };
  fs.writeFileSync(path.join(artifactRoot, "report.json"), JSON.stringify(report, null, 2));
}

if (failures.length) {
  console.error(`SEO review smoke failed (${failures.length}):\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`SEO review smoke passed: ${checks.length} checks, desktop and mobile; all lead requests mocked.`);
}
