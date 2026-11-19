/* eslint-disable @typescript-eslint/no-require-imports -- Next ESLint loads this synchronous adapter through CommonJS. */
const fs = require("node:fs");
const path = require("node:path");
const tinyglobby = require("tinyglobby");
const SUPPORTED_OPTIONS = new Set(["onlyDirectories", "cwd"]);

// This intentionally implements only the directory lookup used by Next ESLint.
// tinyglobby's directory expansion and trailing slashes differ from fast-glob.
function globSync(pattern, options = {}) {
  if (typeof pattern !== "string" || !pattern.length || options.onlyDirectories !== true ||
    Object.keys(options).some((option) => !SUPPORTED_OPTIONS.has(option))) {
    throw new TypeError("The ESLint glob adapter supports directory patterns only.");
  }

  const normalized = pattern.replace(/\\/g, "/");
  if (!tinyglobby.isDynamicPattern(normalized)) {
    try {
      return fs.statSync(path.resolve(options.cwd ?? process.cwd(), normalized)).isDirectory()
        ? [normalized]
        : [];
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "ENOTDIR") return [];
      throw error;
    }
  }

  let base = path.posix.dirname(normalized);
  while (tinyglobby.isDynamicPattern(base)) {
    base = path.posix.dirname(base);
  }
  const separator = base.endsWith("/") ? "" : "/";
  const prefix = base === "." ? "" : `${base}${separator}`;
  const patternWithinBase = normalized.slice(prefix.length);

  return tinyglobby.globSync(patternWithinBase, {
    onlyDirectories: true,
    cwd: path.resolve(options.cwd ?? process.cwd(), base),
    expandDirectories: false,
    absolute: false,
  }).map((directory) => `${prefix}${directory.replace(/\/$/, "")}`);
}

module.exports = { globSync };
