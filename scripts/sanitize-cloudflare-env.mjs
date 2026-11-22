import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MODES = ["production", "development", "test"];

export function removeCopiedEnvironmentFiles(directory = ".open-next") {
  const root = path.resolve(directory);
  if (path.basename(root) !== ".open-next") throw new Error("Expected the generated OpenNext directory");
  let removed = 0;
  function visit(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (!target.startsWith(root + path.sep)) throw new Error("Environment file outside the build directory");
      if (entry.isDirectory()) visit(target);
      else if (entry.isFile() && /^\.env(?:\.|$)/.test(entry.name)) { fs.unlinkSync(target); removed++; }
    }
  }
  visit(root);
  return removed;
}

// OpenNext embeds every local .env mode as a fallback. Only public build values
// belong there; server secrets must come from the selected Worker's bindings.
export function sanitizeCloudflareEnvironment(file = ".open-next/cloudflare/next-env.mjs") {
  const source = fs.readFileSync(file, "utf8");
  const entries = [...source.matchAll(/^export const (production|development|test) = (.+);$/gm)];
  if (entries.length !== MODES.length || !MODES.every(mode => entries.some(entry => entry[1] === mode))) throw new Error("Unexpected OpenNext environment module");
  let removed = 0;
  const content = entries.map(([, mode, data]) => {
    const values = JSON.parse(data);
    const publicValues = {};
    for (const [name, value] of Object.entries(values)) {
      if (!name.startsWith("NEXT_PUBLIC_")) { removed++; continue; }
      if (/SECRET|ODOO|LEAD_API|RESTRICTED_KEY|WEBHOOK|TELEGRAM/.test(name) || /^(?:[sr]k_(?:test|live)_|whsec_)/.test(String(value))) {
        throw new Error("A secret cannot be included in public build configuration");
      }
      publicValues[name] = value;
    }
    return `export const ${mode} = ${JSON.stringify(publicValues)};\n`;
  }).join("");
  fs.writeFileSync(file, content);
  return { modes: entries.length, serverValuesRemoved: removed };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify({ ...sanitizeCloudflareEnvironment(), copiedEnvFilesRemoved: removeCopiedEnvironmentFiles() }));
}
