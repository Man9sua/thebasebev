// The OpenNext bundle is generated before Wrangler bundles this entrypoint.
// @ts-expect-error -- generated module intentionally has no checked-in types.
import openNextWorker from "./.open-next/worker.js";

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
const PERMANENT_REDIRECTS = new Map([
  ["/page65953477.html", "/"],
  ["/page65953593.html", "/"],
  ["/raf-cofeee", "/raf-coffee"],
  ["/raf-cofee", "/raf-coffee"],
  ["/functional-wellness", "/catalog"],
  ["/cabinet", "/"],
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

  // Every staging or workers.dev response must remain a non-indexable preview.
  // Only the explicitly approved production environment on the real hostname
  // can omit this transport-level directive after a human-controlled cutover.
  if (!isApprovedProductionHost) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
  } else {
    headers.delete("X-Robots-Tag");
  }

  if (new URL(request.url).pathname.startsWith("/api/")) {
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

  const redirect = PERMANENT_REDIRECTS.get(pathname);
  if (redirect) {
    return new Response(null, {
      status: 301,
      headers: { Location: new URL(redirect, request.url).toString() },
    });
  }

  // Let Workers Static Assets serve hashed chunks and exported media directly.
  const directAsset = await environment.ASSETS.fetch(request);
  if (directAsset.status !== 404) return directAsset;

  if (pathname.startsWith("/api/") || request.headers.has("RSC")) return null;

  const pageAsset = await environment.ASSETS.fetch(
    requestForAsset(request, staticPageAssetPath(pathname)),
  );
  if (pageAsset.status !== 404) {
    const status = pathname === "/_not-found" ? 404 : pageAsset.status;
    return new Response(pageAsset.body, {
      status,
      headers: pageAsset.headers,
    });
  }

  const notFoundAsset = await environment.ASSETS.fetch(
    requestForAsset(request, "/__static_pages/not-found.html"),
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
