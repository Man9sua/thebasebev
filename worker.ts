// The OpenNext bundle is generated before Wrangler bundles this entrypoint.
// @ts-expect-error -- generated module intentionally has no checked-in types.
import openNextWorker from "./.open-next/worker.js";

type WorkerEnvironment = {
  APP_ENV?: "staging" | "production";
  [key: string]: unknown;
};

type WorkerExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
};

const PRODUCTION_HOSTS = new Set(["thebasebev.com", "www.thebasebev.com"]);

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

const worker = {
  async fetch(
    request: Request,
    environment: WorkerEnvironment,
    context: WorkerExecutionContext,
  ) {
    const response = await openNextWorker.fetch(request, environment, context);
    return withDeploymentHeaders(request, response, environment);
  },
};

export default worker;
