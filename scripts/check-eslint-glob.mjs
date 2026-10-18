import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const adapter = require("../tools/eslint-glob/index.cjs");
const pluginRequire = createRequire(require.resolve("@next/eslint-plugin-next/package.json"));
const helperPath = pluginRequire.resolve("./dist/utils/get-root-dirs.js");
const installedHelper = pluginRequire(helperPath);
const helperExports = {};
vm.runInNewContext(fs.readFileSync(helperPath, "utf8"), {
  exports: helperExports,
  require: (name) => name === "fast-glob" ? adapter : pluginRequire(name),
}, { filename: helperPath });

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "the-base-eslint-glob-"));
const normalizedRoot = fixtureRoot.replace(/\\/g, "/");
const sorted = (directories) => [...directories].sort();
let checked = 0;

function checkRootDir(label, rootDir, expected) {
  const context = { cwd: fixtureRoot, settings: { next: { rootDir } } };
  const actual = helperExports.getRootDirs(context);
  assert.deepEqual(sorted(actual), sorted(expected), label);
  assert.deepEqual(sorted(actual), sorted(installedHelper.getRootDirs(context)), `${label}: installed Next helper`);
  checked += 1;
}

try {
  for (const directory of ["apps", "apps/alpha", "apps/alpha/src/app", "apps/beta", "apps/beta/pages"]) {
    fs.mkdirSync(path.join(fixtureRoot, directory), { recursive: true });
  }
  fs.writeFileSync(path.join(fixtureRoot, "apps", "not-a-directory.txt"), "fixture\n");

  checkRootDir("default cwd", undefined, [fixtureRoot]);
  checkRootDir("absolute exact root", normalizedRoot, [normalizedRoot]);
  checkRootDir("Windows separators", fixtureRoot, [normalizedRoot]);
  checkRootDir("absolute glob", `${normalizedRoot}/apps/*`, [`${normalizedRoot}/apps/alpha`, `${normalizedRoot}/apps/beta`]);
  checkRootDir("brace glob", `${normalizedRoot}/apps/{alpha,beta}`, [`${normalizedRoot}/apps/alpha`, `${normalizedRoot}/apps/beta`]);
  checkRootDir("root array", [`${normalizedRoot}/apps/alpha`, `${normalizedRoot}/apps/beta`], [`${normalizedRoot}/apps/alpha`, `${normalizedRoot}/apps/beta`]);
  checkRootDir("root array ignores non-strings", [`${normalizedRoot}/apps/alpha`, null], [`${normalizedRoot}/apps/alpha`]);
  checkRootDir("file excluded", `${normalizedRoot}/apps/not-a-directory.txt`, []);
  checkRootDir("missing root", `${normalizedRoot}/absent`, []);

  const relative = path.relative(process.cwd(), fixtureRoot).replace(/\\/g, "/");
  checkRootDir("relative exact root", relative, [relative]);
  checkRootDir("relative glob", `${relative}/apps/*`, [`${relative}/apps/alpha`, `${relative}/apps/beta`]);
  checkRootDir("explicit directory slash", `${normalizedRoot}/apps/alpha/`, [`${normalizedRoot}/apps/alpha/`]);
  checkRootDir("recursive glob", `${normalizedRoot}/apps/**/app`, [`${normalizedRoot}/apps/alpha/src/app`]);

  assert.throws(() => adapter.globSync(`${normalizedRoot}/apps/*`, { onlyFiles: true }), /directory patterns only/);
  assert.throws(() => helperExports.getRootDirs({ cwd: fixtureRoot, settings: { next: { rootDir: "" } } }), /directory patterns only/);
  assert.throws(() => adapter.globSync(`${normalizedRoot}/apps/*`, { onlyDirectories: true, deep: 1 }), /directory patterns only/);
  const installedPackage = pluginRequire("fast-glob/package.json");
  console.log(`ESLint directory glob compatibility passed: ${checked} actual Next root-directory cases; Node ${process.version}; installed comparison ${installedPackage.name}@${installedPackage.version}.`);
} finally {
  if (path.dirname(fixtureRoot) !== os.tmpdir() || !path.basename(fixtureRoot).startsWith("the-base-eslint-glob-")) {
    throw new Error("Unexpected glob test fixture location.");
  }
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}
