import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { tryToParsePath } from "next/dist/lib/try-to-parse-path";
import nextConfig from "../next.config";
import * as countryPaths from "../src/lib/country-paths";
import { publicPath } from "../src/lib/site-paths";
import retiredRedirects from "../src/data/legacy-route-redirects.json";
import publicRoutes from "../src/data/public-route-paths.json";

const expectedCodes = ["AE", "SA", "QA", "KW", "OM", "BH", "EG", "IQ", "JO", "PS", "LB", "TR", "KZ", "UZ", "KG", "TM", "AZ"];
const blockedPaths = ["/api/leads", "/api/health", "/_next/static/app.js", "/__static_pages/ae.html", "/images/logo.webp", "/css/custom.css", "/js/app.js", "/video/film.mp4", "/files/spec.pdf", "/fonts/exo.woff2", "/robots.txt", "/sitemap.xml", "/rss.xml", "/favicon.ico"];

test("the country allowlist is exactly the 17 approved markets", () => {
  assert.deepEqual(countryPaths.COUNTRY_CODES, expectedCodes);
  assert.equal(countryPaths.COUNTRY_ALIAS_PREFIXES.length, 16);
  assert.equal(countryPaths.countryCodeFromPath("/unknown/path"), "AE");
});

for (const code of expectedCodes) {
  test(`${code}: selecting a country preserves the complete route, query and fragment`, () => {
    const prefix = `/${code.toLowerCase()}`;
    assert.equal(countryPaths.switchCountryPath("/qa/milkshake?utm_source=chatgpt.com&utm_content=a%2Bb#questions", code), `${prefix}/milkshake?utm_source=chatgpt.com&utm_content=a%2Bb#questions`);
    assert.equal(countryPaths.countryPath("/ae/rnd#rnd-form", code), `${prefix}/rnd#rnd-form`);
    assert.equal(countryPaths.countryPath("/", code), prefix);
    assert.equal(countryPaths.countryCodeFromPath(`${prefix}/catalog`), code);
    assert.equal(countryPaths.toDefaultCountryPath(`${prefix}/milkshake`), "/ae/milkshake");
    assert.equal(countryPaths.toDefaultCountryPath(prefix), "/ae");
  });
}

test("ordinary links retain deliberate cross-country destinations", () => {
  assert.equal(countryPaths.countryPath("/kw/find-your-distributor?market=KW#contact", "QA"), "/kw/find-your-distributor?market=KW#contact");
  assert.equal(countryPaths.countryPath("/resources/blog", "QA"), "/qa/resources/blog");
  assert.equal(countryPaths.countryPath("/ae/catalog", "unsupported"), "/ae/catalog");
});

test("the standalone checkout keeps its technical URL for every country", () => {
  for (const code of expectedCodes) {
    assert.equal(countryPaths.countryPath("/checkout?source=catalog#payment", code), "/checkout?source=catalog#payment");
    assert.equal(countryPaths.switchCountryPath("/checkout", code), "/checkout");
    assert.equal(countryPaths.toDefaultCountryPath(`/${code.toLowerCase()}/checkout`), `/${code.toLowerCase()}/checkout`);
  }
});

test("external URLs, assets and public APIs are not country-prefixed or aliased", () => {
  for (const href of ["https://example.com/ae/about", "//example.com/image.webp", "mailto:info@thebasebev.com", "tel:+971509890429", "#questions", ...blockedPaths]) {
    assert.equal(countryPaths.countryPath(href, "QA"), href);
    assert.equal(countryPaths.switchCountryPath(href, "QA"), href);
  }
  for (const route of blockedPaths) {
    assert.equal(countryPaths.toDefaultCountryPath(`/qa${route}`), `/qa${route}`);
  }
  assert.equal(countryPaths.toDefaultCountryPath("/qa/%61pi/leads"), "/qa/%61pi/leads");
  assert.equal(countryPaths.toDefaultCountryPath("/qa/%5cimages/logo.webp"), "/qa/%5cimages/logo.webp");
  assert.equal(countryPaths.toDefaultCountryPath("/xx/milkshake"), "/xx/milkshake");
});

test("Next beforeFiles rewrites compile and match country documents, never literal API/media paths", async () => {
  const routes = await nextConfig.rewrites!();
  assert.ok(!Array.isArray(routes));
  const rewrites = routes.beforeFiles ?? [];
  assert.equal(rewrites.length, 32);
  const patterns = rewrites.map(({ source, destination }) => {
    const parsed = tryToParsePath(source);
    assert.equal(parsed.error, undefined, source);
    assert.ok(parsed.regexStr, source);
    assert.ok(destination.startsWith("/ae"));
    return new RegExp(parsed.regexStr);
  });
  for (const code of expectedCodes.filter(code => code !== "AE")) {
    const prefix = `/${code.toLowerCase()}`;
    assert.ok(patterns.some(pattern => pattern.test(prefix)));
    assert.ok(patterns.some(pattern => pattern.test(`${prefix}/resources/blog`)));
    assert.ok(!patterns.some(pattern => pattern.test(`${prefix}/checkout`)));
    for (const blocked of blockedPaths) assert.ok(!patterns.some(pattern => pattern.test(`${prefix}${blocked}`)), `${prefix}${blocked}`);
  }
  assert.ok(!patterns.some(pattern => pattern.test("/xx/about-us")));
  assert.ok(!patterns.some(pattern => pattern.test("/ae/about-us")));
});

type WorkerEnvironment = { APP_ENV: "staging"; ASSETS: { fetch(request: Request): Promise<Response> } };
type TestWorker = { fetch(request: Request, environment: WorkerEnvironment, context: object): Promise<Response> };

/** Load the real wrapper with a fail-fast OpenNext stub: a document must stay on Static Assets. */
function workerForTest(): TestWorker {
  const source = fs.readFileSync(new URL("../worker.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const moduleBox = { exports: {} as { default: TestWorker } };
  vm.runInNewContext(compiled, {
    module: moduleBox, exports: moduleBox.exports, Request, Response, Headers, URL,
    require(id: string) {
      if (id === "./.open-next/worker.js") return { fetch() { throw new Error("Country document bypassed the Static Assets fast path"); } };
      if (id === "./src/lib/country-paths") return countryPaths;
      if (id === "./src/lib/site-paths") return { publicPath };
      if (id === "./src/data/legacy-route-redirects.json") return retiredRedirects;
      if (id === "./src/data/public-route-paths.json") return publicRoutes;
      throw new Error(`Unexpected Worker dependency: ${id}`);
    },
  }, { timeout: 1000 });
  return moduleBox.exports.default;
}

test("all country documents reuse one existing HTML asset and retain preview headers", async () => {
  const worker = workerForTest();
  for (const code of expectedCodes) {
    const assetRequests: string[] = [];
    const environment: WorkerEnvironment = {
      APP_ENV: "staging",
      ASSETS: { async fetch(request) {
        const url = new URL(request.url);
        assetRequests.push(`${url.pathname}${url.search}`);
        return url.pathname === "/__static_pages/ae/milkshake.html"
          ? new Response('<link rel="canonical" href="https://thebasebev.com/ae/milkshake"><h1>Milkshake</h1>')
          : new Response("Missing", { status: 404 });
      } },
    };
    const response = await worker.fetch(new Request(`https://preview.workers.dev/${code.toLowerCase()}/milkshake?utm_source=chatgpt.com`), environment, {});
    assert.equal(response.status, 200, code);
    assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow", code);
    assert.equal(response.headers.get("Location"), null, code);
    assert.match(await response.text(), /https:\/\/thebasebev.com\/ae\/milkshake/);
    assert.deepEqual(assetRequests, [`/${code.toLowerCase()}/milkshake?utm_source=chatgpt.com`, "/__static_pages/ae/milkshake.html?utm_source=chatgpt.com"]);
  }
});

test("country RSC and segment payloads reuse existing static files without OpenNext", async () => {
  const worker = workerForTest();
  for (const segment of [null, "/_tree"]) {
    const assetRequests: string[] = [];
    const expected = segment ? "/__static_pages/ae/milkshake.segments/_tree.segment.rsc" : "/__static_pages/ae/milkshake.rsc";
    const environment: WorkerEnvironment = {
      APP_ENV: "staging",
      ASSETS: { async fetch(request) {
        const pathname = new URL(request.url).pathname;
        assetRequests.push(pathname);
        return pathname === expected ? new Response("existing-flight-payload") : new Response("Missing", { status: 404 });
      } },
    };
    const headers = new Headers({ RSC: "1" });
    if (segment) headers.set("Next-Router-Segment-Prefetch", segment);
    const response = await worker.fetch(new Request("https://preview.workers.dev/qa/milkshake", { headers }), environment, {});
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Content-Type"), "text/x-component; charset=utf-8");
    assert.equal(await response.text(), "existing-flight-payload");
    assert.deepEqual(assetRequests, ["/qa/milkshake", expected]);
  }
});

test("unknown countries and prefixed asset/API requests keep the existing 404 behavior", async () => {
  const worker = workerForTest();
  for (const pathname of ["/xx/milkshake", "/qa/images/logo.webp", "/qa/api/leads"]) {
    const requested: string[] = [];
    const response = await worker.fetch(new Request(`https://preview.workers.dev${pathname}`), {
      APP_ENV: "staging",
      ASSETS: { async fetch(request) {
        const asset = new URL(request.url).pathname;
        requested.push(asset);
        return asset === "/__static_pages/_not-found.html" ? new Response("Not found") : new Response("Missing", { status: 404 });
      } },
    }, {});
    assert.equal(response.status, 404);
    assert.ok(!requested.some(path => path.startsWith("/__static_pages/ae/")));
  }
});
