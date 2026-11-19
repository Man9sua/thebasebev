/**
 * The homepage product slider, slide by slide, to the design ("The Base
 * Homepage Slider"). Each slide is one product page: its colour, its copy and
 * the pictures on the right, placed in percent of the picture area so they
 * scale with the slider.
 */

export type SlideImage = Readonly<{
  src: string;
  alt: string;
  left: string;
  bottom: string;
  height: string;
  rotate: string;
}>;

export type HomeSlide = Readonly<{
  /** The product page the slide opens, without the country prefix. */
  slug: string;
  /** The product, for the button and the slide's name. */
  product: string;
  tag: string;
  title: string;
  text: string;
  background: string;
  /** Text colour: white on the darker slides, near-black on the light ones. */
  ink: "light" | "dark";
  images: readonly SlideImage[];
}>;

const DIR = "/images/home-slider/";

/** The usual pair: the pouch tilted on the left, the drink beside it. */
function packAndCup(file: string, product: string): SlideImage[] {
  return [
    { src: `${DIR}${file}-pack.webp`, alt: `${product} pouch`, left: "4%", bottom: "4%", height: "86%", rotate: "-4deg" },
    { src: `${DIR}${file}-cup.webp`, alt: `${product} drink`, left: "46%", bottom: "0%", height: "72%", rotate: "0deg" },
  ];
}

export const HOME_SLIDES: readonly HomeSlide[] = [
  { slug: "raf-coffee", product: "Raf Coffee", tag: "Bestseller", title: "Raf that tastes like ice cream", text: "Creamy, ice-cream-like taste. Mix, steam, serve.", background: "#8A5A3C", ink: "light", images: packAndCup("raf", "Raf Coffee") },
  { slug: "matcha", product: "Matcha", tag: "Hit of the season", title: "Matcha everyone posts", text: "Lattes, iced drinks and frappes. Same taste in every cup.", background: "#4E9A5F", ink: "light", images: packAndCup("matcha", "Matcha") },
  { slug: "milkshake", product: "Milkshake", tag: "Kids’ favourite", title: "Thick. Creamy. No ice cream.", text: "Milk, ice, base. Blend for 30 seconds.", background: "#D9668A", ink: "light", images: packAndCup("milkshake", "Milkshake") },
  { slug: "chocolate", product: "Chocolate", tag: "Winter menu", title: "Hot chocolate season is on", text: "Rich hot chocolate and cold cocoa from one premix.", background: "#5A3A30", ink: "light", images: packAndCup("chocolate", "Chocolate") },
  { slug: "chai-latte", product: "Chai Latte", tag: "Spiced", title: "Chai that warms up the menu", text: "Bold, warm and comforting. No brewing needed.", background: "#B5652F", ink: "light", images: packAndCup("chai", "Chai Latte") },
  { slug: "frappe", product: "Frappe", tag: "Summer menu", title: "Frappe in 30 seconds", text: "Smooth, creamy blended drinks for hot days.", background: "#2F5277", ink: "light", images: packAndCup("frappe", "Frappe") },
  { slug: "iced-tea", product: "Iced Tea", tag: "Summer hit", title: "Iced tea, zero brewing", text: "Crisp, clean flavour. Add water and ice.", background: "#E8A928", ink: "dark", images: packAndCup("iced-tea", "Iced Tea") },
  { slug: "cordial", product: "Cordial", tag: "Fruit burst", title: "Lemonades without syrup bottles", text: "A burst of fruit in powder. Easy to store, easy to dose.", background: "#D9472F", ink: "light", images: packAndCup("cordial", "Cordial") },
  {
    slug: "sugar-free",
    product: "Sugar Free",
    tag: "Zero sugar",
    title: "All the taste. No sugar.",
    text: "Portion sticks for coffee, tea and lemonades.",
    background: "#2C8A78",
    ink: "light",
    images: [
      { src: `${DIR}sugar-free-leaves.webp`, alt: "", left: "0%", bottom: "14%", height: "80%", rotate: "0deg" },
      { src: `${DIR}sugar-free-peach.webp`, alt: "Sugar Free Peach", left: "28%", bottom: "48%", height: "38%", rotate: "8deg" },
      { src: `${DIR}sugar-free-mint.webp`, alt: "Sugar Free Mint", left: "0%", bottom: "36%", height: "38%", rotate: "-10deg" },
      { src: `${DIR}sugar-free-pear.webp`, alt: "Sugar Free Pear", left: "12%", bottom: "2%", height: "40%", rotate: "3deg" },
      { src: `${DIR}sugar-free-cup.webp`, alt: "Sugar Free drink", left: "56%", bottom: "0%", height: "70%", rotate: "0deg" },
    ],
  },
  { slug: "sugar-syrup", product: "Sugar Syrup", tag: "Powder syrup", title: "Syrup without the bottle", text: "Balanced sweetness in powder. No sticky shelves.", background: "#E9D3A6", ink: "dark", images: packAndCup("sugar-syrup", "Sugar Syrup") },
  { slug: "topping", product: "Toppings", tag: "Barista tool", title: "Foam that holds its shape", text: "Light, creamy finish for coffee and cold drinks.", background: "#6E5C9E", ink: "light", images: packAndCup("topping", "Topping") },
  {
    slug: "garnish",
    product: "Garnish",
    tag: "Finishing touch",
    title: "Make every drink photogenic",
    text: "Dried fruit and petals that make the drink worth a photo.",
    background: "#C9384F",
    ink: "light",
    images: [{ src: `${DIR}garnish-pack.webp`, alt: "Garnish pouch", left: "16%", bottom: "4%", height: "84%", rotate: "-3deg" }],
  },
  {
    slug: "tea",
    product: "Tea",
    tag: "Portion sachets",
    title: "Tea your guests remember",
    text: "Black and green tea in portion sachets.",
    background: "#3E5C3C",
    ink: "light",
    images: [{ src: `${DIR}tea-green.webp`, alt: "the Base tea sachet", left: "4%", bottom: "10%", height: "78%", rotate: "-6deg" }],
  },
  { slug: "vending", product: "Vending", tag: "Self-serve", title: "Built for coffee machines", text: "Stable premixes for high-volume self-serve.", background: "#2A2A2A", ink: "light", images: packAndCup("vending", "Vending") },
  { slug: "jam", product: "Jam", tag: "Desserts & drinks", title: "Fruit jam, just add water", text: "For drinks and desserts. Mix with water, ready to use.", background: "#A8213B", ink: "light", images: packAndCup("jam", "Jam") },
];
