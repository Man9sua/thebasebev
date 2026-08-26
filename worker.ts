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

  if (pathname.startsWith("/api/")) return null;

  /**
   * The router's own request for a page.
   *
   * Next asks for an RSC payload on every in-page navigation and prefetch — the
   * same URL as the document, with an `RSC` header — and OpenNext cannot answer
   * those here: it looks them up in an incremental cache the prerendered
   * payloads are not in, so all of them came back 404 and the router fell back
   * to a full page load every time. `prepare-static-fast-path.mjs` now copies
   * the payloads beside the documents, so they are served the same way.
   *
   * A hovered link asks for a slice of the route tree instead, naming it in
   * `Next-Router-Segment-Prefetch`; the build writes those beside the page as
   * `<route>.segments/<slice>.segment.rsc`, so the header is the file name. It
   * is used as a path, so it is checked like one.
   */
  if (request.headers.has("RSC")) {
    const segment = request.headers.get("Next-Router-Segment-Prefetch");
    if (segment && (!segment.startsWith("/") || segment.includes(".."))) return null;

    const base = staticPageAssetPath(pathname).replace(/\.html$/, "");
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
