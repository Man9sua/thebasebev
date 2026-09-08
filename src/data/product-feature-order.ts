/**
 * The order the design runs the four selling points in, and its own marks.
 *
 * The export lists them the other way round — ending on the packaging line
 * where the design opens on it — and on three products the middle two are not
 * in the same order either, so this is the design's sequence written down
 * rather than a rule applied to ours. The labels are the page's own; the
 * design's wording is only what they were matched on.
 *
 * The marks are the owner's own artwork out of the product-page reference
 * build: a white disc with the mark inside it, 75 square, tinted per product to
 * the panel it stands on — which is why there are four of them per slug rather
 * than four in total. Copied as `benefit-<slug>-<n>.png`, in this order.
 */

export const productFeatureOrder: Record<string, string[]> = {
  "raf-coffee": ["Space-Saving Packaging", "No Refrigeration", "Quick to Prepare", "Long Shelf Life"],
  "cream-latte": ["Space-Saving Packaging", "No Refrigeration", "Quick to Prepare", "Long Shelf Life"],
  "chai-latte": ["Space-Saving Packaging", "No Refrigeration", "Quick to Prepare", "Long Shelf Life"],
  milkshake: ["Space-Saving Packaging", "No Ice Cream or Freezers", "Quick to Prepare", "Long Shelf Life"],
  frappe: ["Space-Saving Packaging", "No Ice Cream or Freezers", "Quick to Prepare", "Long Shelf Life"],
  "iced-tea": ["Space-Saving Packaging", "Hassle-free", "Quick to Prepare", "Long Shelf Life"],
  cordial: ["Space-Saving Packaging", "Hassle-free", "Ready to Drink", "Long Shelf Life"],
  topping: ["Space-Saving Packaging", "Hassle-free", "Quick to Prepare", "Long Shelf Life"],
  matcha: ["Space-Saving Packaging", "Hassle-free", "Quick to Prepare", "Long Shelf Life"],
  chocolate: ["Space-Saving Packaging", "Natural Taste", "Hassle-free", "Long Shelf Life"],
  "sugar-syrup": ["Safe & Convenient", "Space-Efficient", "Precise Portioning", "Long Shelf Life"],
  vending: ["Versatile Options", "Space-Efficient", "Consistent Quality", "Long Shelf Life"],
  jam: ["Convenient", "Space-Efficient", "Quick to Prepare", "Long Shelf Life"],
  garnish: ["Enhances Presentation", "Customizable", "Versatile use", "Long Shelf Life"],
  "sugar-free": ["Precise Dosage", "No added sweetness", "No Risk of Leakage", "Long Shelf Life"],
  tea: ["Consistent-quality", "Natural Taste", "Hassle-free", "Long Shelf Life"],
};
