import assert from "node:assert/strict";
import { test } from "node:test";
import { productSchema } from "../src/lib/structured-data";
import { rewriteLegacyStructuredData } from "../src/lib/legacy-structured-data";

test("quotation products do not publish fabricated images, prices or stock", () => {
  const schema = JSON.parse(productSchema({ name: "Electrolyte", description: "Drink mix", path: "/electrolyte", price: null }));
  assert.equal(schema.url, "https://thebasebev.com/ae/electrolyte");
  assert.equal(schema.manufacturer["@id"], "https://thebasebev.com/#organization");
  assert.equal(schema.offers, undefined);
  assert.equal(schema.image, undefined);
  const priced = JSON.parse(productSchema({ name: "Milkshake", description: "Drink mix", path: "/milkshake", image: "/images/pack-milkshake.webp", price: "45.38 AED" }));
  assert.equal(priced.offers.price, "45.38");
  assert.equal(priced.offers.availability, undefined);
});

test("legacy schema resolves company identity and assets without retaining replaced FAQs", () => {
  const source = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@graph": [
      { "@type": "Organization", "@id": "https://thebasebev.com/#organization", logo: "images/logo.svg", url: "https://thebasebev.com/" },
      { "@type": "FAQPage", mainEntity: [] },
      { "@type": "OfferCatalog", numberOfItems: 16, itemListElement: [] },
    ],
  })}</script>`;
  const rewritten = rewriteLegacyStructuredData(source, true);
  const graph = JSON.parse(rewritten.match(/>([\s\S]*)<\/script>/)![1])["@graph"];
  assert.equal(graph[0]["@id"], "https://thebasebev.com/#organization");
  assert.equal(graph[0].logo, "https://thebasebev.com/images/logo.svg");
  assert.equal(graph[0].url, "https://thebasebev.com/ae");
  assert.equal(graph.some((item: Record<string, unknown>) => item["@type"] === "FAQPage"), false);
  assert.ok(graph[1].numberOfItems > 16);
  assert.equal(graph[1].itemListElement.length, graph[1].numberOfItems);
  assert.ok(graph[1].itemListElement.every((item: { url: string }) => item.url.startsWith("https://thebasebev.com/ae/")));
});
