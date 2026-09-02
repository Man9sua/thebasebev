import { chromium } from "@playwright/test";
const OUT = process.argv[2], URL = process.argv[3] ?? "http://localhost:3000";
const b = await chromium.launch();
for (const [tag, vp] of [["desktop", { width: 1440, height: 1000 }], ["phone", { width: 390, height: 844 }]]) {
  const p = await b.newPage({ viewport: vp });
  await p.goto(`${URL}/catalog`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.querySelectorAll(".t-cookiesnotice,[class*='cookiesnotice']").forEach((e) => e.remove()));
  await p.evaluate(() => new Promise((r) => setTimeout(r, 500)));
  console.log(tag, "height", await p.evaluate(() => document.body.scrollHeight), "h1", await p.evaluate(() => document.querySelector("h1")?.textContent));
  await p.screenshot({ path: `${OUT}/cat-${tag}.png`, fullPage: tag === "phone" });
  await p.close();
}
await b.close();
