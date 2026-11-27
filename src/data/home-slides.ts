export type HomeSlide = Readonly<{
  slug: string;
  product: string;
  tag: string;
  title: string;
  text: string;
  background: string;
  ink: "light" | "dark";
}>;

export const HOME_SLIDES: readonly HomeSlide[] = [
  { slug: "raf-coffee", product: "Raf Coffee", tag: "Bestseller", title: "Raf that tastes like ice cream", text: "Creamy, ice-cream-like taste. Mix, steam, serve.", background: "#8A5A3C", ink: "light" },
  { slug: "matcha", product: "Matcha", tag: "Hit of the season", title: "Matcha everyone posts", text: "Lattes, iced drinks and frappes. Same taste in every cup.", background: "#4E9A5F", ink: "light" },
  { slug: "milkshake", product: "Milkshake", tag: "Kids’ favourite", title: "Thick. Creamy. No ice cream.", text: "Milk, ice, base. Blend for 30 seconds.", background: "#D9668A", ink: "light" },
  { slug: "chocolate", product: "Chocolate", tag: "Winter menu", title: "Hot chocolate season is on", text: "Rich hot chocolate and cold cocoa from one premix.", background: "#5A3A30", ink: "light" },
  { slug: "chai-latte", product: "Chai Latte", tag: "Spiced", title: "Chai that warms up the menu", text: "Bold, warm and comforting. No brewing needed.", background: "#B5652F", ink: "light" },
  { slug: "frappe", product: "Frappe", tag: "Summer menu", title: "Frappe in 30 seconds", text: "Smooth, creamy blended drinks for hot days.", background: "#2F5277", ink: "light" },
  { slug: "iced-tea", product: "Iced Tea", tag: "Summer hit", title: "Iced tea, zero brewing", text: "Crisp, clean flavour. Add water and ice.", background: "#E8A928", ink: "dark" },
  { slug: "cordial", product: "Cordial", tag: "Fruit burst", title: "Lemonades without syrup bottles", text: "A burst of fruit in powder. Easy to store, easy to dose.", background: "#D9472F", ink: "light" },
  {
    slug: "sugar-free",
    product: "Sugar Free",
    tag: "Zero sugar",
    title: "All the taste. No sugar.",
    text: "Portion sticks for coffee, tea and lemonades.",
    background: "#2C8A78",
    ink: "light",
  },
  { slug: "sugar-syrup", product: "Sugar Syrup", tag: "Powder syrup", title: "Syrup without the bottle", text: "Balanced sweetness in powder. No sticky shelves.", background: "#E9D3A6", ink: "dark" },
  { slug: "topping", product: "Toppings", tag: "Barista tool", title: "Foam that holds its shape", text: "Light, creamy finish for coffee and cold drinks.", background: "#6E5C9E", ink: "light" },
  {
    slug: "garnish",
    product: "Garnish",
    tag: "Finishing touch",
    title: "Make every drink photogenic",
    text: "Dried fruit and petals that make the drink worth a photo.",
    background: "#C9384F",
    ink: "light",
  },
  {
    slug: "tea",
    product: "Tea",
    tag: "Portion sachets",
    title: "Tea your guests remember",
    text: "Black and green tea in portion sachets.",
    background: "#3E5C3C",
    ink: "light",
  },
  { slug: "vending", product: "Vending", tag: "Self-serve", title: "Built for coffee machines", text: "Stable premixes for high-volume self-serve.", background: "#2A2A2A", ink: "light" },
  { slug: "jam", product: "Jam", tag: "Desserts & drinks", title: "Fruit jam, just add water", text: "For drinks and desserts. Mix with water, ready to use.", background: "#A8213B", ink: "light" },
];
