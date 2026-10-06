import type { ComponentType } from "react";
import { AddOnsPage } from "./pages/AddOns";
import { AtHomePage } from "./pages/AtHome";
import { ChaiLattePage } from "./pages/ChaiLatte";
import { ChocolatePage } from "./pages/Chocolate";
import { ColourCollectionPage } from "./pages/ColourCollection";
import { CordialPage } from "./pages/Cordial";
import { CreamLattePage } from "./pages/CreamLatte";
import { ElectrolytePage } from "./pages/Electrolyte";
import { FrappePage } from "./pages/Frappe";
import { GarnishPage } from "./pages/Garnish";
import { IcedTeaPage } from "./pages/IcedTea";
import { JamPage } from "./pages/Jam";
import { MatchaPage } from "./pages/Matcha";
import { MilkshakePage } from "./pages/Milkshake";
import { PureePage } from "./pages/Puree";
import { RafCoffeePage } from "./pages/RafCoffee";
import { SaucePage } from "./pages/Sauce";
import { SugarFreePage } from "./pages/SugarFree";
import { SugarSyrupPage } from "./pages/SugarSyrup";
import { TeaPage } from "./pages/Tea";
import { ToppingPage } from "./pages/Topping";
import { VendingPage } from "./pages/Vending";
import type { ProductPageAssets, ProductPageProps } from "./types";

/**
 * Products that render the redesigned page instead of ProductHero +
 * ProductDetails. A slug missing here keeps the previous design.
 */
export const PRODUCT_PAGES: Record<string, ComponentType<ProductPageProps>> = {
  "add-ons": AddOnsPage,
  "at-home": AtHomePage,
  "chai-latte": ChaiLattePage,
  "chocolate": ChocolatePage,
  "colour-collection": ColourCollectionPage,
  "cordial": CordialPage,
  "cream-latte": CreamLattePage,
  "electrolyte": ElectrolytePage,
  "frappe": FrappePage,
  "garnish": GarnishPage,
  "iced-tea": IcedTeaPage,
  "jam": JamPage,
  "milkshake": MilkshakePage,
  "puree": PureePage,
  "raf-coffee": RafCoffeePage,
  "sauce": SaucePage,
  "sugar-free": SugarFreePage,
  "sugar-syrup": SugarSyrupPage,
  "tea": TeaPage,
  "topping": ToppingPage,
  "vending": VendingPage,
  matcha: MatchaPage,
};

/**
 * Real files behind "Download kit" / "Download specification (PDF)". The
 * mocks draw both links; each stays hidden until its file is added here.
 */
export const PRODUCT_PAGE_ASSETS: Record<string, ProductPageAssets> = {};
