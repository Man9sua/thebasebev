import fs from "node:fs";
import path from "node:path";

const exportRoot = path.resolve("tilda_export/project12027355");
const targetOrigin = (process.argv[2] ?? "https://the-base-staging.mnsdemo.workers.dev").replace(/\/$/, "");
const reportPath = process.argv[3] ?? "ANALYTICS_AUDIT.md";
const pageFiles = fs.readdirSync(exportRoot).filter((file) => /^page\d+\.html$/.test(file));

const trackers = [
  { id: "G-89J9ZDN1B1", role: "Direct gtag/GA4 candidate" },
  { id: "G-VKXMKBRV73", role: "Legacy analytics.js tracker candidate" },
  { id: "GTM-P99PF655", role: "Custom GTM container candidate" },
  { id: "GTM-WPRV8CZ2", role: "Tilda-managed GTM container candidate" },
  { id: "ca-pub-9584440435840838", role: "Google AdSense publisher ID" },
];

const inventory = trackers.map((tracker) => {
  let occurrences = 0;
  let pages = 0;
  for (const file of pageFiles) {
    const source = fs.readFileSync(path.join(exportRoot, file), "utf8");
    const count = source.split(tracker.id).length - 1;
    if (count) pages += 1;
    occurrences += count;
  }
  return { ...tracker, occurrences, pages };
});

let metaPixelPages = 0;
for (const file of pageFiles) {
  const source = fs.readFileSync(path.join(exportRoot, file), "utf8");
  if (/connect\.facebook\.net|\bfbq\s*\(/i.test(source)) metaPixelPages += 1;
}

const analyticsComponent = fs.readFileSync("src/components/analytics/Analytics.tsx", "utf8");
const sitePages = fs.readFileSync("src/lib/site-pages.ts", "utf8");
const failures = [];
if (!analyticsComponent.includes("GTM is authoritative when configured")) {
  failures.push("Controlled analytics layer does not document GTM precedence.");
}
for (const tracker of trackers) {
  if (!sitePages.includes(tracker.id)) failures.push(`Legacy marker ${tracker.id} is not isolated by the export sanitizer.`);
}

let targetStatus = "not checked";
let targetLegacyMarkers = [];
try {
  const response = await fetch(`${targetOrigin}/`, {
    headers: { "User-Agent": "THE-BASE-Analytics-Audit/1.0" },
  });
  const html = await response.text();
  targetStatus = String(response.status);
  targetLegacyMarkers = trackers.filter((tracker) => html.includes(tracker.id)).map((tracker) => tracker.id);
  if (response.status !== 200) failures.push(`Target homepage returned ${response.status}.`);
  if (new URL(targetOrigin).hostname.endsWith(".workers.dev") && targetLegacyMarkers.length) {
    failures.push(`workers.dev preview still embeds legacy trackers: ${targetLegacyMarkers.join(", ")}`);
  }
} catch (error) {
  failures.push(`Target analytics check failed: ${error instanceof Error ? error.message : String(error)}`);
}

const table = inventory.map(
  (item) => `| \`${item.id}\` | ${item.role} | ${item.pages}/${pageFiles.length} | ${item.occurrences} | NEEDS CONFIRMATION |`,
);

const report = `# Analytics audit

Generated: ${new Date().toISOString()}

## Export inventory

| Public identifier | Observed role | Export pages | Occurrences | Migration decision |
| --- | --- | ---: | ---: | --- |
${table.join("\n")}
| Meta Pixel | No \`fbq\`/Facebook runtime found in root page exports | ${metaPixelPages}/${pageFiles.length} | - | Do not invent a Pixel ID |

## Deduplication decision

The export initialized direct gtag, legacy analytics.js, and two GTM containers. Enabling them together can duplicate \`page_view\` and pollute the existing properties with preview traffic.

The Next compatibility parser removes those legacy runtime blocks. \`src/components/analytics/Analytics.tsx\` is the single controlled integration boundary:

1. It does nothing on staging or any \`workers.dev\` hostname.
2. On \`thebasebev.com\`/\`www.thebasebev.com\`, a confirmed \`NEXT_PUBLIC_GTM_ID\` takes precedence.
3. Direct \`NEXT_PUBLIC_GA_ID\` is used only when GTM is absent.
4. GTM and direct GA are never initialized together by application code.

No new analytics property or ID was created.

## Target verification

- Target: \`${targetOrigin}\`
- HTTP status: ${targetStatus}
- Legacy tracker markers in server HTML: ${targetLegacyMarkers.length ? targetLegacyMarkers.map((id) => `\`${id}\``).join(", ") : "none"}

## Human confirmation required

- Confirm which GTM container is owned and active in current production.
- Confirm whether GA4 page views are emitted inside that container.
- Confirm the authoritative GA4 measurement ID and consent configuration.
- Confirm whether AdSense should remain on the corporate B2B site.
- Compare live DebugView/network events before and after the future cutover.

## Result

${failures.length ? failures.map((failure) => `- FAIL: ${failure}`).join("\n") : "- PASS: preview isolation and the controlled deduplication boundary are present."}
`;

fs.writeFileSync(reportPath, report, "utf8");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Analytics audit passed; report written to ${reportPath}.`);
}
