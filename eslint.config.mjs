import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    // Agent worktrees are checkouts of this repo, build output and all;
    // linting them reports the same files twice and their .next besides.
    ".claude/worktrees/**",
    ".next/**",
    ".open-next/**",
    ".wrangler/**",
    ".audit-artifacts/**",
    "node_modules/**",
    "public/**",
    "tilda_export/**",
  ]),
]);
