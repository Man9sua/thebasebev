/**
 * The colour of the ground shadow under the pouch and the drink.
 *
 * Both designs draw it the same way: an ellipse filled with a gradient that
 * runs from a flat colour to nothing at three quarters, laid under each object
 * so it stands on the wash rather than floating over it. `forme.fig` calls them
 * `Ellipse 27` and `Ellipse 28`, and so does the phone's card in
 * `Untitled.site`.
 *
 * The colour is the product's own — near enough the outer stop of the wash it
 * lies on, which is why a shadow on Matcha is green and on Jam is burgundy
 * rather than grey. Read out of the file per product rather than derived, since
 * the two do not agree everywhere: Chocolate's wash closes on #4a322d and its
 * shadow is #421f1b.
 *
 * Fourteen of the sixteen. Sugar Free and Tea have no such ellipse in the file
 * — their cards are built from sachets rather than a standing pouch — so they
 * get no shadow, which is what the design shows.
 */

export const productShadows: Record<string, string> = {
  "raf-coffee": "#ccc4a7",
  "cream-latte": "#ceaaa7",
  "chai-latte": "#c2a899",
  milkshake: "#dfa8b5",
  frappe: "#996538",
  "iced-tea": "#d6ba61",
  cordial: "#8398b2",
  topping: "#e9e6d9",
  matcha: "#52a866",
  chocolate: "#421f1b",
  "sugar-syrup": "#dca597",
  garnish: "#d8cab6",
  vending: "#4e342e",
  jam: "#3d060b",
};
