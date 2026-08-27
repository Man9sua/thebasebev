/**
 * Lead pipeline audit.
 *
 * Boots the app against a local mock upstream, so nothing here ever reaches the
 * real tilda-odoo Worker or Odoo. For a genuine end-to-end check against
 * staging use `npm run test:lead-live`, which is opt-in and never runs in CI.
 *
 * Usage: node scripts/audit-leads.mjs
 */

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import fs from "node:fs";
import path from "node:path";

const failures = [];
const passed = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed.push(name);
  } else {
    failures.push(detail ? `${name}: ${detail}` : name);
  }
}

/* ------------------------------------------------------------------ *
 * Mock upstream — stands in for tilda-odoo.thebasebev.workers.dev
 * ------------------------------------------------------------------ */

/** @type {{mode: "ok" | "error" | "hang", received: any[]}} */
const upstream = { mode: "ok", received: [] };

const mockServer = createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    try {
      upstream.received.push(JSON.parse(body));
    } catch {
      upstream.received.push({ __unparsable: body });
    }

    if (upstream.mode === "hang") {
      // Never respond; the route's AbortController must fire.
      return;
    }

    if (upstream.mode === "error") {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
  });
});

mockServer.listen(0, "127.0.0.1");
await once(mockServer, "listening");
const mockPort = mockServer.address().port;
// `localhost` (not 127.0.0.1) is the only non-https host the route accepts.
const mockUrl = `http://localhost:${mockPort}/hook`;

/* ------------------------------------------------------------------ *
 * App under test
 * ------------------------------------------------------------------ */

const appPort = 3100 + (process.pid % 400);
const baseUrl = `http://127.0.0.1:${appPort}`;

// Launch Next directly rather than through `npm run dev`: no shell in between
// means one process to wait on and one process to kill.
const nextBin = path.resolve("node_modules", "next", "dist", "bin", "next");
const app = spawn(process.execPath, [nextBin, "dev", "--port", String(appPort)], {
  env: { ...process.env, LEAD_API_URL: mockUrl, LEAD_API_KEY: "" },
  stdio: ["ignore", "pipe", "pipe"],
  detached: process.platform !== "win32",
});

let appLog = "";
app.stdout.on("data", (d) => {
  appLog += d;
});
app.stderr.on("data", (d) => {
  appLog += d;
});

async function waitForApp(timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
      if (res.ok) return true;
    } catch {
      // still starting
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

let shutDown = false;
function shutdown() {
  if (shutDown) return;
  shutDown = true;

  // `npm run dev` spawns a shell that spawns Next. Killing only the shell
  // leaves the server holding the port and this process's stdio open, so kill
  // the whole tree.
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(app.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      process.kill(-app.pid, "SIGKILL");
    }
  } catch {
    /* already gone */
  }

  try {
    app.kill();
  } catch {
    /* already gone */
  }

  mockServer.closeAllConnections?.();
  mockServer.close();
}

process.on("exit", shutdown);
process.on("SIGINT", () => {
  shutdown();
  process.exit(130);
});

if (!(await waitForApp())) {
  console.error(`Lead audit could not start the app on ${baseUrl}\n${appLog}`);
  shutdown();
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

let ipCounter = 0;
/** Each case gets its own client IP so the rate limiter stays out of the way. */
function nextIp() {
  ipCounter += 1;
  return `203.0.113.${ipCounter % 250}`;
}

function validLead(overrides = {}) {
  return {
    name: "TEST NEXT MIGRATION",
    email: "audit@thebasebev.com",
    phone: "+971500000000",
    message: "AUTOMATED AUDIT — DO NOT CONTACT",
    formType: "contact",
    formName: "Contact Us",
    consent: true,
    landingPage: `${baseUrl}/matcha?utm_source=chatgpt.com&utm_medium=referral`,
    submissionPage: `${baseUrl}/contacts`,
    referrer: "https://chatgpt.com/",
    utm_source: "chatgpt.com",
    utm_medium: "referral",
    utm_campaign: "migration-test",
    utm_content: null,
    utm_term: null,
    clientTimestamp: new Date().toISOString(),
    ...overrides,
  };
}

async function postLead(body, { ip = nextIp(), raw = false } = {}) {
  return fetch(`${baseUrl}/api/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "cf-connecting-ip": ip,
    },
    body: raw ? body : JSON.stringify(body),
  });
}

/* ------------------------------------------------------------------ *
 * Validation
 * ------------------------------------------------------------------ */

check(
  "validation: empty body rejected",
  (await postLead("", { raw: true })).status === 400,
);

check(
  "validation: malformed JSON rejected",
  (await postLead("{not json", { raw: true })).status === 400,
);

check(
  "validation: invalid email rejected",
  (await postLead(validLead({ email: "not-an-email" }))).status === 400,
);

check(
  "validation: missing name rejected",
  (await postLead(validLead({ name: "" }))).status === 400,
);

check(
  "validation: unknown form type rejected",
  (await postLead(validLead({ formType: "admin-backdoor" }))).status === 400,
);

check(
  "validation: non-http landing page rejected",
  (await postLead(validLead({ landingPage: "javascript:alert(1)" }))).status === 400,
);

check(
  "validation: oversized payload rejected",
  [400, 413].includes(
    (await postLead(validLead({ message: "x".repeat(80_000) }))).status,
  ),
);

check(
  "validation: oversized UTM rejected",
  (await postLead(validLead({ utm_source: "x".repeat(1_000) }))).status === 400,
);

/* ------------------------------------------------------------------ *
 * API contract
 * ------------------------------------------------------------------ */

const getRes = await fetch(`${baseUrl}/api/leads`);
check("api: GET rejected", getRes.status === 405, `received ${getRes.status}`);
check(
  "api: GET advertises Allow: POST",
  (getRes.headers.get("allow") ?? "").toUpperCase().includes("POST"),
);

upstream.mode = "ok";
upstream.received.length = 0;
const okRes = await postLead(validLead());
const okBody = await okRes.json();
check("api: valid lead accepted", okRes.status === 200, `received ${okRes.status}`);
check("api: success contract is {ok:true}", okBody.ok === true);
check("api: success carries a request id", typeof okBody.requestId === "string");
check(
  "api: response is no-store",
  /no-store/i.test(okRes.headers.get("cache-control") ?? ""),
);

/* ------------------------------------------------------------------ *
 * Attribution — the delivered payload must keep every UTM field
 * ------------------------------------------------------------------ */

const delivered = upstream.received.at(-1) ?? {};

check(
  "attribution: upstream received exactly one delivery",
  upstream.received.length === 1,
  `received ${upstream.received.length}`,
);
check(
  "attribution: utm_source=chatgpt.com preserved",
  delivered.utm_source === "chatgpt.com",
  JSON.stringify(delivered.utm_source),
);
check("attribution: utm_medium preserved", delivered.utm_medium === "referral");
check(
  "attribution: utm_campaign preserved",
  delivered.utm_campaign === "migration-test",
);
check("attribution: landing_page preserved", typeof delivered.landing_page === "string");
check("attribution: current_page preserved", typeof delivered.current_page === "string");
check(
  "attribution: request id preserved upstream",
  delivered.request_id === okBody.requestId,
);
check(
  "attribution: server timestamp preserved upstream",
  typeof delivered.server_timestamp === "string" &&
    !Number.isNaN(Date.parse(delivered.server_timestamp)),
);
check(
  "attribution: referrer preserved",
  delivered.referrer === "https://chatgpt.com/",
);

/* ------------------------------------------------------------------ *
 * Legacy field mapping — Odoo parses Tilda's vocabulary, not ours
 * ------------------------------------------------------------------ */

check("mapping: name sent as legacy `name`", delivered.name === "TEST NEXT MIGRATION");
check("mapping: email sent as legacy `email`", delivered.email === "audit@thebasebev.com");
check("mapping: phone sent as legacy `Phone`", delivered.Phone === "+971500000000");
check("mapping: message sent as legacy `text`", typeof delivered.text === "string");
check(
  "mapping: structured attribution survives in the description channel",
  delivered.text.includes("--- THE BASE ATTRIBUTION ---") &&
    delivered.text.includes(`request_id: ${okBody.requestId}`) &&
    delivered.text.includes("utm_source: chatgpt.com"),
);
check(
  "mapping: tildaspec-formname sent",
  delivered["tildaspec-formname"] === "Contact Us",
);
check(
  "mapping: camelCase internals not leaked upstream",
  delivered.formName === undefined &&
    delivered.landingPage === undefined &&
    delivered.submissionPage === undefined,
);

upstream.received.length = 0;
await postLead(
  validLead({ formType: "order", formName: "Place order", message: "audit order" }),
);
const orderDelivered = upstream.received.at(-1) ?? {};
check(
  "mapping: order form uses capitalised cart vocabulary",
  orderDelivered.Name === "TEST NEXT MIGRATION" &&
    orderDelivered.Comments.startsWith("audit order\n\n--- THE BASE ATTRIBUTION ---"),
  JSON.stringify(Object.keys(orderDelivered)),
);

/* ------------------------------------------------------------------ *
 * Upstream failure handling — never a false success
 * ------------------------------------------------------------------ */

upstream.mode = "error";
const errRes = await postLead(validLead());
const errBody = await errRes.json();
check("upstream: non-2xx surfaces as 502", errRes.status === 502, `received ${errRes.status}`);
check("upstream: failure contract is {ok:false}", errBody.ok === false);
check(
  "upstream: failure error code is lead_delivery_failed",
  errBody.error === "lead_delivery_failed",
  JSON.stringify(errBody.error),
);
check(
  "upstream: internal details not leaked to the client",
  !JSON.stringify(errBody).toLowerCase().includes("odoo") &&
    !JSON.stringify(errBody).includes(String(mockPort)),
);

upstream.mode = "hang";
const timeoutRes = await postLead(validLead());
check(
  "upstream: timeout surfaces as 504",
  timeoutRes.status === 504,
  `received ${timeoutRes.status}`,
);
upstream.mode = "ok";

/* ------------------------------------------------------------------ *
 * Spam protection
 * ------------------------------------------------------------------ */

upstream.received.length = 0;
const honeypotRes = await postLead(
  validLead({ company_website: "https://spam.example" }),
);
check(
  "spam: honeypot submission accepted without forwarding",
  honeypotRes.ok && upstream.received.length === 0,
  `status ${honeypotRes.status}, forwarded ${upstream.received.length}`,
);

const burstIp = "198.51.100.7";
const burst = [];
for (let i = 0; i < 8; i += 1) {
  burst.push((await postLead(validLead(), { ip: burstIp })).status);
}
check(
  "spam: repeated submissions from one IP hit 429",
  burst.includes(429),
  burst.join(","),
);
check(
  "spam: rate limited response carries Retry-After",
  (await postLead(validLead(), { ip: burstIp })).headers.get("retry-after") !== null,
);

/* ------------------------------------------------------------------ *
 * Security — the upstream URL must never reach the browser or Git
 * ------------------------------------------------------------------ */

const pagesToScan = ["/", "/contacts", "/about-us"];
let leakedInHtml = false;
for (const route of pagesToScan) {
  const html = await (await fetch(`${baseUrl}${route}`)).text();
  if (html.includes(mockUrl) || html.includes(`localhost:${mockPort}`)) {
    leakedInHtml = true;
  }
  if (/tilda-odoo[a-z0-9.-]*workers\.dev/i.test(html)) {
    leakedInHtml = true;
  }
}
check("security: upstream URL absent from server-rendered HTML", !leakedInHtml);

check(
  "security: no NEXT_PUBLIC_ lead variable defined",
  !Object.keys(process.env).some((k) => /^NEXT_PUBLIC_LEAD/i.test(k)),
);

const trackedLeak = [];
for (const file of [".env.example", "src", "scripts", "worker.ts", "wrangler.jsonc"]) {
  const target = path.resolve(file);
  if (!fs.existsSync(target)) continue;
  const walk = (p) => {
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      fs.readdirSync(p).forEach((child) => walk(path.join(p, child)));
      return;
    }
    const text = fs.readFileSync(p, "utf8");
    // The audit script itself carries the detection pattern, not a real URL.
    if (p.endsWith("audit-leads.mjs")) return;
    if (/tilda-odoo[a-z0-9.-]*\.workers\.dev/i.test(text)) {
      trackedLeak.push(path.relative(process.cwd(), p));
    }
    if (/odoo\.thebasebev\.com\/web\/hook\//i.test(text)) {
      trackedLeak.push(path.relative(process.cwd(), p));
    }
  };
  walk(target);
}
check(
  "security: no upstream or Odoo webhook URL committed to the repository",
  trackedLeak.length === 0,
  trackedLeak.join(", "),
);

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */

shutdown();

if (failures.length) {
  console.error(`Lead audit FAILED — ${failures.length} of ${passed.length + failures.length} checks\n`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exitCode = 1;
} else {
  console.log(`Lead audit passed: ${passed.length} checks (validation, API contract, attribution, legacy mapping, upstream failures, spam protection, secret exposure).`);
}
