import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig();

config.dangerous = {
  ...config.dangerous,
  disableIncrementalCache: true,
};

export default config;
