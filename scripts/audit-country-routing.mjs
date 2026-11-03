import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const baseUrl = new URL(process.argv[2] ?? "https://the-base-staging.mansua.workers.dev");
baseUrl.pathname = "/";
baseUrl.search = "";
baseUrl.hash = "";
const preview = baseUrl.hostname.endsWith(".workers.dev");
const codes = ["AE", "SA", "QA", "KW", "OM", "BH", "EG", "IQ", "JO", "PS", "LB", "TR", "KZ", "UZ", "KG", "TM", "AZ"];
const documents = ["", "/catalog", "/milkshake"];
const output = path.resolve("output/product-reference-20261015/country-routing.json");
const checks = [];
const rows = [];
const failures = [];
const stability = [];
const baselines = new Map();

function check(ok, message, detail) {
  checks.push({ ok: Boolean(ok), message, ...(detail === undefined ? {} : { detail }) });
  if (!ok) failures.push(message);
}

async function request(route) {
  const start = performance.now();
  // GET only. Redirects remain observable; this never posts a lead or order.
  const response = await fetch(new URL(route, baseUrl), {
    method: "GET",
    redirect: "manual",
    headers: { "User-Agent": "THE-BASE-country-routing-audit/1.0", Accept: "text/html,application/json,*/*" },
    signal: AbortSignal.timeout(30_000),
  });
  const headersMs = performance.now() - start;
  const body = Buffer.from(await response.arrayBuffer());
  const text = body.toString("utf8");
  const row = {
    route, status: response.status, location: response.headers.get("location"),
    contentType: response.headers.get("content-type") ?? "",
    robots: response.headers.get("x-robots-tag") ?? "",
    cacheControl: response.headers.get("cache-control") ?? "",
    bytes: body.length, hash: createHash("sha256").update(body).digest("hex"),
    headersMs: Math.round(headersMs), totalMs: Math.round(performance.now() - start),
  };
  rows.push(row);
  return { row, text };
}

function transport(row) {
  check(!row.location, `${row.route}: no redirect Location`, row.location);
  if (preview) check(/noindex/i.test(row.robots) && /nofollow/i.test(row.robots),
    `${row.route}: preview transport noindex, nofollow`, row.robots);
}

function document(result, suffix, baseline) {
  const { row, text } = result;
  const canonical = text.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1] ?? "";
  check(row.status === 200, `${row.route}: document HTTP 200`, row.status);
  check(/text\/html/i.test(row.contentType) && /<h1\b/i.test(text), `${row.route}: crawlable HTML document`);
  check(canonical === `https://thebasebev.com/ae${suffix}`, `${row.route}: canonical stays on shared production AE document`, canonical);
  transport(row);
  if (baseline) check(row.hash === baseline.hash, `${row.route}: body matches shared AE SSG file byte-for-byte`,
    { actual: row.hash, expected: baseline.hash });
}

async function caseOf(label, run) {
  try {
    await run();
  } catch (error) {
    failures.push(`${label}: ${error.message}`);
  }
}

// Read the three AE documents once. Every country alias must serve these exact
// generated files; country selection is a browser concern, not a second build.
for (const suffix of documents) {
  await caseOf(`/ae${suffix}`, async () => {
    const result = await request(`/ae${suffix}`);
    baselines.set(suffix, result.row);
    document(result, suffix);
  });
}

for (const code of codes.filter((value) => value !== "AE")) {
  for (const suffix of documents) {
    const route = `/${code.toLowerCase()}${suffix}`;
    await caseOf(route, async () => {
      const baseline = baselines.get(suffix);
      check(Boolean(baseline), `${route}: AE comparison document was received`);
      document(await request(route), suffix, baseline);
    });
  }
  console.log(`Country routing: ${code}, three documents checked`);
}

// Keep APIs and static files outside country document rewrites. Representative
// pairs cover the dynamic API, image and CSS paths without a reserved-path grid.
for (const [route, type] of [["/api/health", /application\/json/i],
  ["/images/certifications/halal.jpg", /image\/jpeg/i], ["/css/tbs-tailwind.css", /text\/css/i]]) {
  await caseOf(route, async () => {
    const result = await request(route);
    check(result.row.status === 200 && type.test(result.row.contentType), `${route}: unprefixed resource remains available`, result.row.status);
    transport(result.row);
    if (route === "/api/health") {
      const health = JSON.parse(result.text);
      check(health.status === "ok" && /no-store/i.test(result.row.cacheControl), `${route}: safe health response with no-store`);
    }
  });
  for (const code of ["kw", "qa"]) {
    const forbidden = `/${code}${route}`;
    await caseOf(forbidden, async () => {
      const { row } = await request(forbidden);
      check(row.status === 404, `${forbidden}: country prefix cannot alias API/media`, row.status);
      transport(row);
    });
  }
}

// Ten sequential document requests with distinct queries exercise the changed
// Worker fast path after the route matrix. These timings include network and
// body transfer; they are not measurements of Worker CPU time.
for (let index = 0; index < 10; index++) {
  const code = index % 2 ? "kw" : "qa";
  const route = `/${code}/milkshake?utm_source=chatgpt.com&utm_campaign=country-routing-audit&probe=${index}`;
  await caseOf(`stability ${index + 1}`, async () => {
    const result = await request(route);
    document(result, "/milkshake", baselines.get("/milkshake"));
    stability.push(result.row);
  });
}
check(stability.length === 10 && stability.every((row) => row.status === 200), "stability: ten successful responses and no 5xx",
  stability.map(({ status, totalMs }) => ({ status, totalMs })));
const times = stability.map((row) => row.totalMs).sort((a, b) => a - b);
const latency = times.length ? { minMs: times[0], medianMs: times[Math.floor(times.length / 2)],
  p95Ms: times[Math.ceil(times.length * 0.95) - 1], maxMs: times.at(-1) } : null;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({ baseUrl: baseUrl.toString(), at: new Date().toISOString(),
  countries: codes.length, documentRoutes: codes.length * documents.length, checks, failures,
  rows, stability, latency, timingScope: "Network + response body transfer; not Worker CPU time" }, null, 2) + "\n");
console.log(JSON.stringify({ countries: codes.length, documentRoutes: codes.length * documents.length,
  requests: rows.length, checks: checks.length, passed: checks.filter((entry) => entry.ok).length, failures, latency }, null, 2));
process.exitCode = failures.length ? 1 : 0;
