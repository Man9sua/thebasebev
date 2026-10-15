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
    // Static preview HTML can arrive before its deferred client scripts. Wait
    // for those scripts before exercising React controls after a hard navigation.
    const response = await page.goto(`${baseUrl}/ae${route}`, { waitUntil: "load" });
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

  async function checkFont(locator, weight, role) {
    await page.evaluate(async () => { await document.fonts.ready; });
    const font = await locator.evaluate((element) => ({
      family: getComputedStyle(element).fontFamily,
      weight: getComputedStyle(element).fontWeight,
    }));
    check(font.family.includes("Exo 2") && font.weight === String(weight), `${label} ${role}: Exo 2 weight ${weight}`);
    check(await page.evaluate(() => Array.from(document.fonts).some((face) => face.family.replace(/["']/g, "") === "Exo 2" && face.status === "loaded")), `${label} ${role}: self-hosted Exo 2 is loaded`);
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
    // The sample drawer asks for company and city and has no consent box (its
    // footer states the terms); the other forms keep a required checkbox.
    for (const [name, value] of [["company", "SEO Review LLC"], ["city", "Dubai"]]) {
      const field = form.locator(`input[name="${name}"]`);
      if (await field.count()) await field.fill(value);
    }
    const consent = form.locator('input[name="privacy-consent"]');
    if (await consent.count()) {
      check(await consent.getAttribute("required") !== null, `${label}: privacy consent is required`);
      await consent.evaluate((input) => {
        input.checked = true;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }
  }

  async function failedSubmit(form, route, expectedConsent = true) {
    const count = leads.length;
    const response = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/leads");
    await form.evaluate((element) => element.requestSubmit());
    await response;
    await form.locator(".js-rule-error-all").filter({ hasText: /temporarily unavailable/i }).waitFor({ state: "visible" });
    check(leads.length === count + 1, `${label} ${route}: one mocked lead request`);
    check(!(await form.locator(".js-successbox").isVisible()), `${label} ${route}: failed delivery does not show success`);
    const lead = leads.at(-1);
    check(lead?.consent === expectedConsent, `${label} ${route}: consent follows the form contract`);
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
      for (const title of ["Made for service", slug === "milkshake" ? "One cup, one recipe" : "How to prepare", `${count} flavours`, "Inside the pack"]) {
        check(await page.getByRole("heading", { name: title, exact: true }).isVisible(), `${label} ${slug}: ${title} visible`);
      }
      // The photo-removal message concerns the Purée bottle mockup. The latest
      // Milkshake/Frappe HTML still includes these supplied menu photographs.
      const gallery = page.locator('section[aria-label="Ready for your menu"]');
      const shots = gallery.locator("img");
      const expectedShots = slug === "milkshake" ? 8 : 5;
      check(await shots.count() === expectedShots, `${label} ${slug}: all ${expectedShots} supplied menu photographs`);
      await gallery.scrollIntoViewIfNeeded();
      check(await shots.evaluateAll(async (images) => {
        await Promise.all(images.map((image) => image.decode()));
        return images.every((image) => image.naturalWidth > 0 && image.alt.trim());
      }), `${label} ${slug}: menu photographs load and have alternative text`);
      check(await page.getByRole("link", { name: "Request marketing kit", exact: true }).getAttribute("href") === "/ae/contacts", `${label} ${slug}: marketing kit request has a real destination`);
      const hero = page.locator("main section").first().locator("img").first();
      await hero.evaluate((image) => image.decode());
      const heroName = slug === "milkshake" ? "hero-pouch" : "hero-pack-glass";
      check((await hero.getAttribute("src"))?.includes(`/products/${slug}/${heroName}-`), `${label} ${slug}: owner-selected packaging hero`);
      await page.locator("main section").first().screenshot({ path: path.join(artifactRoot, `${label}-${slug}-hero.png`) });
      if (slug === "milkshake") {
        const service = page.locator('section[aria-label="Made for service"]');
        const recipe = page.locator('section[aria-labelledby="milkshake-recipe-title"]');
        const range = page.locator('section[aria-label="Flavours"]');
        check(await service.getByText("Fast at the bar, simple to store, the same result from every barista.", { exact: true }).isVisible(), `${label} milkshake: service introduction visible`);
        check(await service.evaluate((node) => node.nextElementSibling?.getAttribute("aria-labelledby") === "milkshake-recipe-title"), `${label} milkshake: recipe immediately follows service`);
        const ingredients = await recipe.locator("dl > div").allTextContents();
        check(ingredients.map(normalize).join("|") === "the Base Milkshake30 g|Dairy or plant-based milk200 ml|Ice cubes100 ml|Your syrup or toppingTo taste", `${label} milkshake: exact supplied recipe quantities`);
        const recipeLink = recipe.getByRole("link");
        check(await recipeLink.getAttribute("href") === "/ae/knowledge-recipes", `${label} milkshake: recipe link has a real destination`);
        check(await range.getByText("Each one built on the same base, so texture and foam stay the same.", { exact: true }).isVisible(), `${label} milkshake: flavour introduction visible`);
        check(await recipe.locator("ol h3").evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).fontWeight === "900")), `${label} milkshake: recipe step labels match the supplied display style`);
        if (viewport.width < 1024) {
          check(await page.locator("main section").first().locator("dl").evaluate((list) => {
            const rows = [...list.children].map((row) => ({ row: row.getBoundingClientRect(), label: row.firstElementChild.getBoundingClientRect(), value: row.lastElementChild.getBoundingClientRect() }));
            return rows.length === 3 && rows.every(({ label, value }) => Math.abs(label.y - value.y) < 3 && value.x > label.right)
              && rows[1].row.y >= rows[0].row.bottom && rows[2].row.y >= rows[1].row.bottom;
          }), `${label} milkshake: mobile specification label/value rows`);
          check(await recipe.evaluate((node) => {
            const card = node.querySelector("dl").getBoundingClientRect();
            const method = node.querySelector("ol").getBoundingClientRect();
            const link = node.querySelector("a").getBoundingClientRect();
            return method.y >= card.bottom && link.y >= method.bottom;
          }), `${label} milkshake: mobile recipe card, method, link order`);
          check(await service.getByText("Room temp", { exact: true }).evaluate((node) => node.getBoundingClientRect().height <= parseFloat(getComputedStyle(node).fontSize) * 1.2), `${label} milkshake: Room temp stays on one line`);
        } else {
          check(await service.getByRole("heading").evaluate((node) => node.getBoundingClientRect().height <= parseFloat(getComputedStyle(node).fontSize) * 1.2), `${label} milkshake: service heading stays on one line`);
        }
        for (const [name, section] of [["service", service], ["recipe", recipe], ["flavours", range]]) {
          await section.screenshot({ path: path.join(artifactRoot, `${label}-milkshake-${name}.png`) });
        }
      }
      check(await page.locator('main nav[aria-label="Breadcrumb"]').count() === 0, `${label} ${slug}: no overline breadcrumbs`);
      const nutrition = page.locator("section").filter({ has: page.getByRole("heading", { name: "Inside the pack", exact: true }) });
      check(await nutrition.getByRole("tablist").count() === 0, `${label} ${slug}: no unsupported nutrition variants`);
      const table = nutrition.locator("[class*='nutritionFullMobile']");
      check(await table.count() === 1 && await table.isVisible(), `${label} ${slug}: single source nutrition table visible`);
      check(slug === "milkshake" ? !(await table.innerText()).includes(sourceFlavour) : (await table.innerText()).includes(sourceFlavour), `${label} ${slug}: owner-approved nutrition caption`);
      check((await table.innerText()).includes(calories), `${label} ${slug}: source calories retained`);
      const details = page.locator("section[aria-labelledby='product-faq-title'] details");
      check(await details.count() === 9, `${label} ${slug}: all nine FAQ entries retained`);
      check(await details.locator("summary:visible").count() === 9, `${label} ${slug}: all FAQ questions visible`);
      check(await details.evaluateAll((nodes) => nodes.every((node) => !node.open)), `${label} ${slug}: FAQ starts collapsed`);
      if (viewport.width < 1024) {
        check(await details.first().locator("summary > span").evaluate((icon) => {
          const rect = icon.getBoundingClientRect();
          const style = getComputedStyle(icon);
          return rect.width >= 30 && Math.abs(rect.width - rect.height) < 1 && style.borderRadius === "50%" && style.backgroundColor === "rgb(240, 239, 235)";
        }), `${label} ${slug}: FAQ plus has a light circular button`);
      }
      await page.locator("section[aria-labelledby='product-faq-title']").screenshot({ path: path.join(artifactRoot, `${label}-${slug}-questions.png`) });
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

  await caseOf("latest-home-and-footer", async () => {
    await visit("");
    const about = page.locator("#about");
    const copy = await about.innerText();
    check(/22\s+product categories/i.test(copy), `${label} home: category count follows the current catalog`);
    check(!/Twenty categories/i.test(copy), `${label} home: stale category count removed`);
    check(await page.locator("footer").getByRole("list", { name: "Quality certifications" }).count() === 0, `${label} footer: certification marks removed`);
    const markList = about.getByRole("list", { name: "Quality certifications" });
    const marks = markList.locator("img");
    check(await marks.count() === 3, `${label} manufacturer: all three approved certification marks`);
    await marks.first().scrollIntoViewIfNeeded();
    check(await marks.evaluateAll(async (images) => {
      await Promise.all(images.map((image) => image.decode()));
      return images.every((image) => image.naturalWidth > 0 && image.alt.trim() && getComputedStyle(image).objectFit === "contain");
    }), `${label} manufacturer: complete certification marks load`);
    check(await marks.evaluateAll((images) => {
      const names = ["halal", "haccp", "iso-22000"];
      return images.every((image, index) => {
        const url = new URL(image.getAttribute("src"), location.href);
        const source = url.searchParams.get("url") ?? url.pathname;
        return source.endsWith(`/images/certifications/${names[index]}.jpg`);
      });
    }), `${label} manufacturer: original JPEGs in Halal, HACCP, ISO 22000 order`);
    check(await markList.locator("li").evaluateAll((cards) => {
      if (cards.length !== 3) return false;
      const boxes = cards.map((card) => card.getBoundingClientRect());
      return boxes.every((box) => Math.abs(box.y - boxes[0].y) < 2)
        && boxes[0].width < boxes[1].width
        && boxes[0].width < boxes[2].width
        && cards.every((card) => getComputedStyle(card).backgroundColor === "rgb(255, 255, 255)");
    }), `${label} manufacturer: one white-tile row with a narrower Halal mark`);
    if (viewport.width >= 1024) {
      check(await markList.locator("li").first().evaluate((card) => {
        const rect = card.getBoundingClientRect();
        return Math.abs(rect.width - rect.height) < 2;
      }), `${label} manufacturer: Halal tile is square`);
    }
    await page.waitForFunction(() => {
      let node = document.querySelector("#about ul[aria-label='Quality certifications']");
      while (node) {
        if (Number(getComputedStyle(node).opacity) < 1) return false;
        node = node.parentElement;
      }
      return true;
    });
    const positions = await about.evaluate((section) => {
      const box = (selector) => {
        const { x, y, width, height } = section.querySelector(selector).getBoundingClientRect();
        return { x, y, width, height, right: x + width, bottom: y + height };
      };
      return {
        copy: box("[data-manufacturer-copy]"),
        facts: box("[data-manufacturer-facts]"),
        marks: box("ul[aria-label='Quality certifications']"),
        cta: box("a[href='/ae/about-us']"),
      };
    });
    check(positions.marks.y >= positions.facts.bottom, `${label} manufacturer: certification row follows the stats`);
    if (viewport.width < 1024) {
      check(positions.facts.y >= positions.copy.bottom && positions.cta.y >= positions.marks.bottom, `${label} manufacturer: mobile copy, stats, marks, CTA order`);
      check(Math.abs(positions.cta.width - positions.copy.width) < 2, `${label} manufacturer: mobile CTA fills the column`);
      check(positions.cta.y - positions.marks.bottom >= 46, `${label} manufacturer: mobile CTA has the requested separation`);
    } else {
      check(positions.facts.x >= positions.copy.right && Math.abs(positions.marks.x - positions.facts.x) < 2, `${label} manufacturer: desktop marks stay below the right stats column`);
    }
    await markList.screenshot({ path: path.join(artifactRoot, `${label}-manufacturer-certifications.png`) });
    await about.locator(":scope > div").filter({ has: page.locator("#about-title") }).screenshot({ path: path.join(artifactRoot, `${label}-manufacturer-reference.png`) });
    const heroSample = page.locator("main").getByRole("link", { name: "Request samples", exact: true }).first();
    check(await heroSample.getAttribute("href") === "/ae/request-samples", `${label} home: sample CTA opens the sample destination`);
  });

  await caseOf("missing-visuals", async () => {
    for (const [route, names] of [
      ["", ["THE BASE branded shipping carton artwork", "Barista working at a point-of-sale terminal in a café"]],
      ["/rnd", ["Laboratory technician examining a sample through a microscope", "THE BASE branded laboratory room render with tasting workstations"]],
    ]) {
      await visit(route);
      for (const name of names) {
        const visual = page.getByRole("img", { name, exact: true });
        await visual.scrollIntoViewIfNeeded();
        check(await visual.evaluate(async (image) => {
          await image.decode();
          return image.complete && image.naturalWidth > 0;
        }), `${label} ${route || "/"}: requested visual loads — ${name}`);
      }
    }
  });

  await caseOf("sample-flavour-validation", async () => {
    await visit("/milkshake");
    await page.getByRole("button", { name: "Request a sample", exact: true }).first().click();
    const form = page.locator("#sample-request-modal-form");
    await completeIdentity(form);
    const flavours = form.getByRole("group", { name: /Flavours/ }).getByRole("checkbox");
    check(await flavours.count() === 9, `${label} samples: all confirmed Milkshake flavours selectable`);
    await flavours.first().uncheck();
    const requests = leads.length;
    await form.getByRole("button", { name: "Send request", exact: true }).click();
    await form.getByRole("alert").filter({ hasText: "Choose at least one flavour." }).waitFor();
    check(leads.length === requests, `${label} samples: zero flavours cannot send a lead`);
    await form.evaluate((element) => element.requestSubmit());
    check(leads.length === requests, `${label} samples: programmatic submit also respects the minimum`);
    for (let i = 0; i < 3; i++) await flavours.nth(i).check();
    check(await flavours.nth(3).isDisabled(), `${label} samples: a fourth flavour is disabled`);
    await flavours.nth(2).uncheck();
    check(await flavours.nth(3).isEnabled(), `${label} samples: removing a flavour re-enables other choices`);
    await flavours.nth(2).check();
    const lead = await failedSubmit(form, "/milkshake", null);
    check(lead?.formType === "sample" && /Flavours:/.test(lead?.message ?? ""), `${label} samples: selected flavours preserve the sample lead contract`);
    check(await form.getByRole("link", { name: "Privacy Policy", exact: true }).getAttribute("href") === "/ae/privacy", `${label} samples: working Privacy Policy link`);
    await context.route("**/api/leads", async (route) => {
      leads.push(route.request().postDataJSON());
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, requestId: "sample-review-mocked" }) });
    }, { times: 1 });
    const accepted = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/leads");
    await form.getByRole("button", { name: "Send request", exact: true }).click();
    await accepted;
    await form.locator(".js-successbox").waitFor({ state: "visible" });
    check(await form.getByRole("heading", { name: /Request.*received/ }).isVisible(), `${label} samples: confirmed mocked delivery shows the confirmation`);
    check(await form.getByText(/THE BASE team will contact you/).isVisible(), `${label} samples: confirmation does not promise an unverified local team`);
    await page.keyboard.press("Escape");
  });

  for (const slug of ["jam", "sugar-free"]) {
    await caseOf(`${slug}-faq`, async () => {
      await visit(`/${slug}`);
      const details = page.locator("section[aria-labelledby='product-faq-title'] details");
      await checkFont(details.first().locator("summary"), 600, `${slug} FAQ control`);
      if (slug === "jam") await checkFont(page.locator("main").getByText("Strawberry Watermelon", { exact: true }).first(), 700, "Jam flavour name");
      const visible = await details.evaluateAll((nodes) => nodes.map((node) => ({
        question: node.querySelector("summary")?.textContent?.replace(/\+\s*$/, "") ?? "",
        answer: node.querySelector("p")?.textContent ?? "",
      })));
      const faq = (await structuredData(page)).find((entry) => hasType(entry, "FAQPage"));
      check(visible.length > 0 && faq?.mainEntity?.length === visible.length, `${label} ${slug}: all visible questions have FAQ schema`);
      check(visible.every((item, index) => normalize(item.question) === normalize(faq?.mainEntity?.[index]?.name ?? "") && normalize(item.answer) === normalize(faq?.mainEntity?.[index]?.acceptedAnswer?.text ?? "")), `${label} ${slug}: FAQ schema text matches visible answers`);
      await details.nth(1).locator("summary").click();
      check(await details.nth(1).locator("p").isVisible(), `${label} ${slug}: animated FAQ opens`);
      await details.nth(1).locator("summary").click();
      await page.waitForFunction(() => {
        const answer = document.querySelectorAll("section[aria-labelledby='product-faq-title'] details")[1];
        return answer && !answer.open && !answer.style.height && !answer.style.overflow;
      });
      check(await details.nth(1).getAttribute("data-expanded") === "false", `${label} ${slug}: animated FAQ closes`);
    });
  }

  for (const [route, title] of [["/about-us", "Develop"], ["/rnd", "Cost per cup"], ["/distributors", "Regional"]]) {
    await caseOf(`typography-${route.slice(1)}`, async () => {
      await visit(route);
      await checkFont(page.locator("main").getByRole("heading", { name: title, exact: true }).first(), 700, `${route} card heading`);
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
    await page.goto(`${baseUrl}/ae/request-samples`, { waitUntil: "load" });
    const banner = page.getByRole("region", { name: "Cookies", exact: true });
    if (await banner.count()) await banner.getByRole("button", { name: "Reject", exact: true }).click();
    await page.locator("main").getByRole("button", { name: "Request samples", exact: true }).click();
    const panel = page.getByRole("dialog", { name: /Request a sample/ });
    await panel.waitFor();
    // The drawer slides in; until it lands, the pointer is over the scrim.
    await panel.evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished)));
    // The drawer scrolls its fields and keeps the send button in a fixed foot.
    const scroller = panel.locator("form .t-form__inputsbox > div").first();
    const metrics = await scroller.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      overflowY: getComputedStyle(element).overflowY,
      overscroll: getComputedStyle(element).overscrollBehaviorY,
    }));
    check(metrics.scrollHeight > metrics.clientHeight, "short viewport: sample form exceeds available height");
    check(metrics.overflowY === "auto" && metrics.overscroll === "contain", "short viewport: drawer allows contained vertical scrolling");
    await page.mouse.move(195, 200);
    await page.mouse.wheel(0, 900);
    await page.waitForFunction(() => (document.querySelector("#sample-request-modal-form .t-form__inputsbox > div")?.scrollTop ?? 0) > 0);
    check(await scroller.evaluate((element) => element.scrollTop > 0), "short viewport: user wheel scroll moves the drawer");
    const submit = panel.getByRole("button", { name: "Send request", exact: true });
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
