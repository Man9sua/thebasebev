import { spawnSync } from "node:child_process";

const target = process.argv[2] ?? "https://the-base-staging.mnsdemo.workers.dev";
const parsedTarget = new URL(target);
if (!/^https?:$/.test(parsedTarget.protocol) || parsedTarget.username || parsedTarget.password) {
  throw new Error("Target must be an HTTP(S) URL without embedded credentials.");
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const checks = [
  ["typecheck", ["run", "typecheck"]],
  ["lint", ["run", "lint"]],
  ["OpenNext build (includes Next production build)", ["run", "cf:build"]],
  ["assets", ["run", "check:assets"]],
  ["route/indexability", ["run", "audit:routes", "--", target]],
  ["SEO parity", ["run", "audit:seo-parity", "--", target]],
  ["analytics isolation", ["run", "audit:analytics", "--", target]],
  ["HTTP smoke", ["run", "smoke:http", "--", target]],
  ["browser smoke", ["run", "smoke:browser", "--", target]],
  ["commerce audit", ["run", "audit:commerce", "--", target]],
  ["crawler audit", ["run", "audit:crawlers", "--", target]],
  ["npm audit", ["audit", "--audit-level=high"]],
];

for (const [label, args] of checks) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(npmCommand, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(`Production readiness failed at: ${label}`);
    process.exit(result.status ?? 1);
  }
}

console.log(`\nProduction readiness passed for ${target}.`);
