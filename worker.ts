// @ts-expect-error -- generated module intentionally has no checked-in types.
import openNextWorker from "./.open-next/worker.js";
import legacyRouteRedirects from "./src/data/legacy-route-redirects.json";
import publicRoutePaths from "./src/data/public-route-paths.json";
import { publicPath } from "./src/lib/site-paths";
import { retiredRouteRedirect, toDefaultCountryPath } from "./src/lib/country-paths";

type WorkerEnvironment = {
  APP_ENV?: "staging" | "production";
  ASSETS?: {
    fetch(request: Request): Promise<Response>;
  };
  [key: string]: unknown;
};

type WorkerExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
};

const PRODUCTION_HOSTS = new Set(["thebasebev.com", "www.thebasebev.com"]);

const RETIRED_LEGACY_REDIRECTS = legacyRouteRedirects as ReadonlyArray<{
  source: string;
  destination: string;
}>;

const PERMANENT_REDIRECTS = new Map<string, string>([
  ...publicRoutePaths.map((route) => [route, publicPath(route)] as const),
  ...RETIRED_LEGACY_REDIRECTS.map(({ source, destination }) => [source, publicPath(destination)] as const),
  ["/page65953477.html", publicPath("/")],
  ["/page65953593.html", publicPath("/")],
  ["/raf-cofeee", publicPath("/raf-coffee")],
  ["/raf-cofee", publicPath("/raf-coffee")],
  ["/functional-wellness", publicPath("/catalog")],
  ["/cabinet", publicPath("/")],
  [
    "/tpost/vb9gvbp5m1-the-unmanned-cafe-is-already-here-its-we",
    publicPath("/tpost/vb9gvbp5m1-unmanned-cafs-have-one-weak-link-ingredi"),
  ],
  [
    "/tpost/gflfp1fx41-why-matcha-belongs-on-your-menu-the-numb",
    publicPath("/tpost/gflfp1fx41-the-numbers-behind-matchas-green-rush"),
  ],
  [
    "/tpost/eljzud0n91-karak-and-masala-are-different-builds-on",
    publicPath("/tpost/eljzud0n91-one-sku-two-builds-30-seconds"),
  ],
  ["/tpost/je9sca5h71-brix", publicPath("/tpost/j6bavd35i1-brix")],
  ["/ae/tpost/je9sca5h71-brix", publicPath("/tpost/j6bavd35i1-brix")],
]);

function normalizePathname(pathname: string) {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "") || "/";
}

function staticPageAssetPath(pathname: string) {
  if (pathname === "/") return "/__static_pages/index.html";
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return `/__static_pages${pathname}`;
  }
  return `/__static_pages${pathname}.html`;
}

function requestForAsset(request: Request, pathname: string) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, {
    method: request.method,
    headers: request.headers,
  });
}

function withDeploymentHeaders(
  request: Request,
  response: Response,
  environment: WorkerEnvironment,
) {
  const headers = new Headers(response.headers);
  const hostname = new URL(request.url).hostname.toLowerCase();
  const isApprovedProductionHost =
    environment.APP_ENV === "production" && PRODUCTION_HOSTS.has(hostname);

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("X-Frame-Options", "SAMEORIGIN");

  if (!isApprovedProductionHost) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
  } else {
    headers.delete("X-Robots-Tag");
  }

  if (new URL(request.url).pathname.startsWith("/api/")) {
    headers.set("Cache-Control", "no-store");
  } else if (!isApprovedProductionHost) {
    headers.set("Cache-Control", "no-store");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function staticFastPath(
  request: Request,
  environment: WorkerEnvironment,
): Promise<Response | null> {
  if (!environment.ASSETS || !["GET", "HEAD"].includes(request.method)) return null;

  const url = new URL(request.url);
  const pathname = normalizePathname(url.pathname);

  if (pathname === "/api/health" && request.method === "GET") {
    return Response.json(
      { status: "ok" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const redirect = PERMANENT_REDIRECTS.get(pathname) ?? retiredRouteRedirect(pathname);
  if (redirect) {
    return new Response(null, {
      status: 301,
      headers: { Location: new URL(redirect, request.url).toString() },
    });
  }

  const directAsset = await environment.ASSETS.fetch(request);
  if (directAsset.status !== 404) return directAsset;

  if (pathname.startsWith("/api/")) return null;

  const documentPathname = toDefaultCountryPath(pathname);

  if (request.headers.has("RSC")) {
    const segment = request.headers.get("Next-Router-Segment-Prefetch");
    if (segment && (!segment.startsWith("/") || segment.includes(".."))) return null;

    const base = staticPageAssetPath(documentPathname).replace(/\.html$/, "");
    const payload = await environment.ASSETS.fetch(
      requestForAsset(request, segment ? `${base}.segments${segment}.segment.rsc` : `${base}.rsc`),
    );
    if (payload.status === 404) return null;

    const headers = new Headers(payload.headers);
    headers.set("Content-Type", "text/x-component; charset=utf-8");
    headers.set(
      "Vary",
      "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch",
    );
    return new Response(payload.body, { status: 200, headers });
  }

  const pageAsset = await environment.ASSETS.fetch(
    requestForAsset(request, staticPageAssetPath(documentPathname)),
  );
  if (pageAsset.status !== 404) {
    const status = pathname === "/_not-found" ? 404 : pageAsset.status;
    return new Response(pageAsset.body, {
      status,
      headers: pageAsset.headers,
    });
  }

  const notFoundAsset = await environment.ASSETS.fetch(
    requestForAsset(request, "/__static_pages/_not-found.html"),
  );
  return new Response(notFoundAsset.body, {
    status: 404,
    headers: notFoundAsset.headers,
  });
}

const worker = {
  async fetch(
    request: Request,
    environment: WorkerEnvironment,
    context: WorkerExecutionContext,
  ) {
    const response =
      (await staticFastPath(request, environment)) ??
      (await openNextWorker.fetch(request, environment, context));
    return withDeploymentHeaders(request, response, environment);
  },
};

export default worker;
