import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
// @ts-expect-error -- the deployment helper is native ESM JavaScript.
import { sanitizeCloudflareEnvironment, removeCopiedEnvironmentFiles } from "../scripts/sanitize-cloudflare-env.mjs";

function withEnvironmentFile(data: Record<string, string>, run: (file: string) => void) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "the-base-env-"));
  const file = path.join(directory, "next-env.mjs");
  fs.writeFileSync(file, ["production", "development", "test"].map(mode => `export const ${mode} = ${JSON.stringify(data)};\n`).join(""));
  try { run(file); } finally {
    assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir()) + path.sep));
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

test("Cloudflare builds keep public analytics and never embed local Test/Live secrets or upstream URLs", () => {
  withEnvironmentFile({ NEXT_PUBLIC_GA_ID: "G-EXAMPLE", NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_fixture",
    STRIPE_SECRET_KEY: "sk_test_fixture", STRIPE_LIVE_SECRET_KEY: "sk_live_fixture", STRIPE_LIVE_RESTRICTED_KEY: "rk_live_fixture",
    STRIPE_LIVE_WEBHOOK_SECRET: "whsec_fixture", ODOO_API_KEY: "private-odoo-value", LEAD_API_URL: "https://private-upstream.example",
  }, file => {
    const result = sanitizeCloudflareEnvironment(file);
    assert.equal(result.serverValuesRemoved, 18);
    const output = fs.readFileSync(file, "utf8");
    assert.match(output, /G-EXAMPLE/);
    assert.match(output, /pk_test_fixture/);
    assert.doesNotMatch(output, /sk_test_|sk_live_|rk_live_|whsec_|private-odoo|private-upstream/);
  });
});

test("a secret mistakenly assigned a public variable fails the build before rewriting the module", () => {
  const invalid: Record<string, string>[] = [{ NEXT_PUBLIC_STRIPE_KEY: "sk_live_fixture" }, { NEXT_PUBLIC_ODOO_URL: "https://private.example" }];
  for (const values of invalid) {
    withEnvironmentFile(values, file => {
      const before = fs.readFileSync(file, "utf8");
      assert.throws(() => sanitizeCloudflareEnvironment(file), /secret cannot/);
      assert.equal(fs.readFileSync(file, "utf8"), before);
    });
  }
});

test("unexpected OpenNext output fails closed instead of claiming secrets were removed", () => {
  withEnvironmentFile({}, file => {
    fs.writeFileSync(file, "export const unknown = {};\n");
    assert.throws(() => sanitizeCloudflareEnvironment(file), /Unexpected/);
  });
});

test("standalone env copies are removed only inside the generated build, preserving source configuration", () => {
  withEnvironmentFile({}, file => {
    const sourceDirectory = path.dirname(file);
    const output = path.join(sourceDirectory, ".open-next");
    const handler = path.join(output, "server-functions", "default");
    fs.mkdirSync(handler, { recursive: true });
    fs.writeFileSync(path.join(sourceDirectory, ".env"), "source-configuration");
    fs.writeFileSync(path.join(handler, ".env"), "private-copy");
    fs.writeFileSync(path.join(handler, ".env.local"), "private-copy");
    fs.writeFileSync(path.join(handler, "handler.mjs"), "export default {};");
    assert.throws(() => removeCopiedEnvironmentFiles(sourceDirectory), /generated OpenNext/);
    assert.equal(removeCopiedEnvironmentFiles(output), 2);
    assert.equal(fs.readFileSync(path.join(sourceDirectory, ".env"), "utf8"), "source-configuration");
    assert.equal(fs.existsSync(path.join(handler, "handler.mjs")), true);
  });
});
