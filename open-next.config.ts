import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Every public document is already emitted under `__static_pages` and served
 * by `worker.ts`; the remaining app endpoints are dynamic POST/health APIs
 * with explicit `no-store` behavior.  There is no ISR or revalidation source
 * in this deployment, so the OpenNext read-only static incremental cache only
 * duplicates the prerendered build into `cdn-cgi/_next_cache`.
 */
const config = defineCloudflareConfig();

config.dangerous = {
  ...config.dangerous,
  disableIncrementalCache: true,
};

export default config;
