import { PRODUCTS } from "@/data/products";

/**
 * The flavours the sample form offers, per product: the same names, in the
 * same order, as the product's own page lists them. A product missing here
 * cannot be asked for as a sample.
 */
export const SAMPLE_FLAVOURS: Readonly<Record<string, readonly string[]>> = {
  milkshake: ["Banana", "Mango", "Date", "Honey Dew", "Strawberry", "Vanilla", "Yogurt", "Cookies & Cream", "Rainbow Unicorn"],
  frappe: ["Coffee", "Salted Caramel", "Vanilla"],
  matcha: ["Classic", "Pure", "Mango Coconut", "Anchan Blueberry", "Pink", "Raspberry", "Strawberry", "Purple Yum Ube", "Hojicha", "Pecan Kumquat", "No Added Sugar"],
  "chai-latte": ["Karak", "Masala"],
  chocolate: ["Hot Chocolate", "Hot Chocolate Pudding", "Hot Chocolate No Sugar"],
  cordial: ["Classic Mojito", "Red Rose Lemon", "Sweet and Sour Mix"],
  "iced-tea": ["Lemon", "Peach", "Mango", "Green"],
  "raf-coffee": ["Vanilla", "Salted Caramel", "Banana Ice Cream", "Pineapple Caramel", "Ptichye Moloko", "Raspberry Coconut", "Spanish Peach"],
  "cream-latte": ["Birds Dream", "Blueberry", "Cheesy Cream", "Citrus Sundae", "Tropical Berry", "Salty Caramel Sunset", "Golden Caramel Banana", "Vanilla Sky", "Nutty Pistachio"],
  tea: ["Black", "Green", "Jasmine"],
  topping: ["Classic Cheese Cream", "Coffee Crème", "Cherry", "Hibiscus"],
  jam: ["Strawberry Watermelon", "Lemon Ginger Honey", "Pomegranate Rose", "Mango Passion Fruit", "Sea Buckthorn Orange", "Apple Cinnamon Cardamom"],
  "sugar-free": ["Amaretto", "Cherry", "Mango", "Mint", "Black Currant", "Coconut", "Melon", "Peach", "Raspberry", "Hazelnut"],
  "sugar-syrup": ["Vanilla", "Salted Caramel", "Hazelnut", "Raspberry", "Mango", "Blueberry"],
  garnish: ["Strawberry Cubes", "Banana Cubes", "Dragon Fruit Cubes", "Kiwi Cubes", "Mango Cubes", "Blueberry Cubes", "Cherry Cubes", "Raspberry Cubes"],
  vending: ["Chocolate", "Chocolate No Added Sugar", "Karak", "Matcha", "Banana Ice Cream Salted Caramel"],
  puree: ["Raspberry", "Peach", "Strawberry", "Blueberry", "Passion fruit", "Mango"],
  sauce: ["Caramel", "Chocolate", "White chocolate"],
  "add-ons": ["Electrolyte", "Prebiotic fiber", "Immunity", "Glycine", "Magnesium", "Collagen", "Creatine"],
  "colour-collection": ["Matcha", "Hojicha", "Butterfly Pea", "Dragon Fruit", "Ube"],
  electrolyte: ["Orange", "Pomegranate", "Lemon mint", "Lemon", "Mango"],
  "at-home": [
    "Matcha Mango Coconut", "Matcha Blue", "Matcha Pink", "Matcha Raspberry", "Matcha Strawberry",
    "Chocolate Strawberry", "Chocolate Orange", "Chocolate Mocha",
    "Iced Tea Lemon", "Iced Tea Peach",
    "Chai Latte Karak", "Milkshake Cookies & Cream", "Cordial Dates Cola",
  ],
};

export type SampleProduct = Readonly<{ slug: string; name: string; flavours: readonly string[] }>;

/** Every product a sample can be asked for, in catalogue order. */
export const SAMPLE_PRODUCTS: readonly SampleProduct[] = PRODUCTS.flatMap((product) => {
  const flavours = SAMPLE_FLAVOURS[product.slug];
  return flavours ? [{ slug: product.slug, name: product.name, flavours }] : [];
});

/** The product a form was opened from, by its display name. */
export function sampleProductFor(productName: string | undefined): SampleProduct | undefined {
  return productName ? SAMPLE_PRODUCTS.find((product) => product.name === productName) : undefined;
}
