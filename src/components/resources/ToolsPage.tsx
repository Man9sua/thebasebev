"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import styles from "./ToolsPage.module.css";

type Language = "en" | "ru";

type CalculatorValues = {
  unitCost: string;
  servings: string;
  milkCost: string;
  extraCost: string;
  packCost: string;
  salePrice: string;
};

const INITIAL_CALCULATOR: CalculatorValues = {
  unitCost: "90",
  servings: "80",
  milkCost: "1.5",
  extraCost: "0.5",
  packCost: "0.8",
  salePrice: "18",
};

const COPY = {
  en: {
    currency: "AED",
    base: "Base cost",
    additions: "Additional ingredients",
    price: "Final price",
    unitCost: "Cost per kg (AED)",
    servings: "Servings per kg",
    milk: "Milk per serving (AED)",
    extra: "Syrups, toppings (AED)",
    pack: "Cup / packaging (AED)",
    salePrice: "Selling price per serving (AED)",
    results: "Results",
    cost: "Cost",
    margin: "Margin",
    marginPercent: "Margin %",
  },
  ru: {
    currency: "₽",
    base: "Себестоимость базы",
    additions: "Дополнительные составляющие",
    price: "Финальная цена",
    unitCost: "Стоимость за 1 кг (руб.)",
    servings: "Порций из 1 кг",
    milk: "Молоко на порцию (руб.)",
    extra: "Сиропы и топпинги (руб.)",
    pack: "Стакан / упаковка (руб.)",
    salePrice: "Цена продажи за порцию (руб.)",
    results: "Результаты",
    cost: "Себестоимость",
    margin: "Маржа",
    marginPercent: "Процент маржи",
  },
} as const;

const DRINKS = [
  { id: "matcha", name: "Matcha Latte", icon: "🍵", description: "Premium matcha with milk, silky texture", price: 280 },
  { id: "chai", name: "Chai Latte", icon: "☕", description: "Indian spiced tea with milk", price: 240 },
  { id: "iced-tea", name: "Iced Tea", icon: "🧊", description: "Freshly brewed iced tea", price: 200 },
  { id: "chocolate", name: "Hot Chocolate", icon: "🍫", description: "Hot chocolate with steamed milk", price: 220 },
  { id: "raf", name: "Raf Latte", icon: "🥛", description: "Creamy coffee with lavender and vanilla", price: 280 },
  { id: "cappuccino", name: "Cappuccino", icon: "☕", description: "Classic cappuccino with three-layer foam", price: 260 },
  { id: "flat-white", name: "Flat White", icon: "☕", description: "Coffee with velvety milk texture", price: 270 },
  { id: "oat-latte", name: "Oat Milk Latte", icon: "🌾", description: "Coffee with oat milk — vegan option", price: 290 },
  { id: "cold-brew", name: "Cold Brew", icon: "🧊☕", description: "12-hour cold brew extraction", price: 250 },
] as const;

const MENU_MONTH_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  month: "long",
  year: "numeric",
});

type DrinkId = (typeof DRINKS)[number]["id"];
type GeneratedDrink = {
  id: DrinkId;
  name: string;
  icon: string;
  description: string;
  price: number;
};

function numberValue(value: string) {
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculatorResult(values: CalculatorValues) {
  const servings = numberValue(values.servings);
  const baseCost = servings > 0 ? numberValue(values.unitCost) / servings : 0;
  const cost =
    baseCost +
    numberValue(values.milkCost) +
    numberValue(values.extraCost) +
    numberValue(values.packCost);
  const salePrice = numberValue(values.salePrice);
  const margin = salePrice - cost;
  const marginPercent = salePrice > 0 ? (margin / salePrice) * 100 : 0;

  return {
    baseCost,
    cost: Number.isFinite(cost) ? cost : 0,
    margin: Number.isFinite(margin) ? margin : 0,
    marginPercent: Number.isFinite(marginPercent) ? marginPercent : 0,
    salePrice,
  };
}

export function ToolsPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [values, setValues] = useState(INITIAL_CALCULATOR);
  const [selected, setSelected] = useState<Set<DrinkId>>(() => new Set());
  const [prices, setPrices] = useState<Record<DrinkId, string>>(() =>
    Object.fromEntries(DRINKS.map((drink) => [drink.id, String(drink.price)])) as Record<DrinkId, string>,
  );
  const [generated, setGenerated] = useState<GeneratedDrink[] | null>(null);

  const labels = COPY[language];
  const result = useMemo(() => calculatorResult(values), [values]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("tbCalcUpdated", {
        detail: { ...result, lang: language },
      }),
    );
  }, [language, result]);

  const updateCalculator = (field: keyof CalculatorValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const toggleDrink = (id: DrinkId) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const generateMenu = () => {
    const drinks = DRINKS.filter((drink) => selected.has(drink.id)).map((drink) => ({
      ...drink,
      price: Math.max(0, numberValue(prices[drink.id])),
    }));

    if (!drinks.length) {
      window.alert("⚠️ Please select at least one drink");
      return;
    }

    setGenerated(drinks);
    window.dispatchEvent(new CustomEvent("tbMenuGenerated", { detail: { drinks, count: drinks.length } }));
  };

  const resetMenu = () => {
    setSelected(new Set());
    setGenerated(null);
    window.dispatchEvent(new CustomEvent("tbMenuReset"));
  };

  const month = MENU_MONTH_FORMATTER.format(new Date());

  return (
    <main className={styles.page} data-tools-page>
      <section className={styles.hero} aria-labelledby="tools-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={`tbb-label ${styles.eyebrow}`}>B2B menu planning</span>
            <h1 id="tools-title" className={styles.heroTitle}>
              Tools for profitable beverage menus
            </h1>
            <p className={styles.heroText}>
              Calculate cost and margin, then turn selected drinks into a clean seasonal menu.
            </p>
          </div>
          <div className={styles.heroIndex} aria-label="Available tools">
            <a href="#cost-calculator" className={styles.heroIndexItem}>
              <span>01</span>
              <strong>Cost calculator</strong>
              <small>Portion cost and margin</small>
            </a>
            <a href="#menu-builder" className={styles.heroIndexItem}>
              <span>02</span>
              <strong>Seasonal menu</strong>
              <small>Select, price and print</small>
            </a>
          </div>
        </div>
      </section>

      <section
        id="cost-calculator"
        className={`${styles.section} ${styles.calculator}`}
        aria-labelledby="calculator-title"
      >
        <div className={styles.sectionHead}>
          <div>
            <span className="tbb-label">Tool 01</span>
            <h2 id="calculator-title" className={styles.sectionTitle}>
              Cost &amp; margin calculator
            </h2>
          </div>
          <div className={styles.language} aria-label="Calculator language">
            {(["ru", "en"] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={language === option ? styles.languageActive : styles.languageButton}
                onClick={() => setLanguage(option)}
                aria-pressed={language === option}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.calculatorGrid} lang={language}>
          <div className={styles.formPanel}>
            <CalculatorGroup title={labels.base} number="01">
              <NumberField label={labels.unitCost} value={values.unitCost} step="0.01" onChange={(value) => updateCalculator("unitCost", value)} />
              <NumberField label={labels.servings} value={values.servings} step="1" min="1" onChange={(value) => updateCalculator("servings", value)} />
            </CalculatorGroup>
            <CalculatorGroup title={labels.additions} number="02">
              <NumberField label={labels.milk} value={values.milkCost} step="0.01" onChange={(value) => updateCalculator("milkCost", value)} />
              <NumberField label={labels.extra} value={values.extraCost} step="0.01" onChange={(value) => updateCalculator("extraCost", value)} />
              <NumberField label={labels.pack} value={values.packCost} step="0.01" onChange={(value) => updateCalculator("packCost", value)} />
            </CalculatorGroup>
            <CalculatorGroup title={labels.price} number="03">
              <NumberField label={labels.salePrice} value={values.salePrice} step="1" onChange={(value) => updateCalculator("salePrice", value)} />
            </CalculatorGroup>
          </div>

          <aside className={styles.results} aria-live="polite" aria-label={labels.results}>
            <span className={`tbb-label ${styles.resultsLabel}`}>{labels.results}</span>
            <Result id="cost" label={labels.cost} value={`${result.cost.toFixed(2)} ${labels.currency}`} />
            <Result id="margin" label={labels.margin} value={`${result.margin.toFixed(2)} ${labels.currency}`} />
            <Result id="margin-percent" label={labels.marginPercent} value={`${result.marginPercent.toFixed(1)}%`} featured />
            <p className={styles.formula}>
              Base per serving: {result.baseCost.toFixed(2)} {labels.currency}
            </p>
          </aside>
        </div>
      </section>

      <section id="menu-builder" className={`${styles.section} ${styles.builder}`} aria-labelledby="builder-title">
        <div className={styles.sectionHead}>
          <div>
            <span className="tbb-label">Tool 02</span>
            <h2 id="builder-title" className={styles.sectionTitle}>
              Seasonal Menu Builder
            </h2>
          </div>
          <p className={styles.sectionDescription}>
            Select drinks, set retail prices and generate a printable menu.
          </p>
        </div>

        <div className={styles.drinkGrid} data-menu-picker>
          {DRINKS.map((drink, index) => {
            const checked = selected.has(drink.id);
            return (
              <article key={drink.id} className={`${styles.drinkCard} ${checked ? styles.drinkCardActive : ""}`}>
                <label className={styles.drinkSelect}>
                  <input type="checkbox" checked={checked} onChange={() => toggleDrink(drink.id)} />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </label>
                <span className={styles.drinkIcon} aria-hidden="true">{drink.icon}</span>
                <h3>{drink.name}</h3>
                <p>{drink.description}</p>
                <label className={styles.priceField}>
                  <span>Retail price, ₽</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={prices[drink.id]}
                    onChange={(event) =>
                      setPrices((current) => ({ ...current, [drink.id]: event.target.value }))
                    }
                  />
                </label>
              </article>
            );
          })}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.primaryAction} onClick={generateMenu} data-menu-generate>
            Generate menu
          </button>
          {generated && (
            <button type="button" className={styles.secondaryAction} onClick={() => window.print()} data-menu-print>
              Print
            </button>
          )}
          <button type="button" className={styles.secondaryAction} onClick={resetMenu} data-menu-reset>
            Reset
          </button>
        </div>

        {generated && (
          <div className={styles.menuPreview} data-menu-template>
            <div className={styles.menuBrand}>
              <strong>THE BASE</strong>
              <span>Premium Beverage Solutions</span>
            </div>
            <h3>Seasonal Menu</h3>
            <p className={styles.menuPeriod}>{month.charAt(0).toUpperCase() + month.slice(1)}</p>
            <div className={styles.menuItems}>
              {generated.map((drink) => (
                <article key={drink.id} className={styles.menuItem}>
                  <span aria-hidden="true">{drink.icon}</span>
                  <div>
                    <h4>{drink.name}</h4>
                    <p>{drink.description}</p>
                  </div>
                  <strong>{drink.price.toFixed(0)} ₽</strong>
                </article>
              ))}
            </div>
            <small>© The Base · Created with the interactive menu builder</small>
          </div>
        )}
      </section>
    </main>
  );
}

function CalculatorGroup({ title, number, children }: { title: string; number: string; children: ReactNode }) {
  return (
    <fieldset className={styles.fieldset}>
      <legend>
        <span>{number}</span>
        {title}
      </legend>
      <div className={styles.fields}>{children}</div>
    </fieldset>
  );
}

function NumberField({ label, value, onChange, step, min = "0" }: { label: string; value: string; onChange: (value: string) => void; step: string; min?: string }) {
  return (
    <label className={styles.numberField}>
      <span>{label}</span>
      <input type="number" value={value} min={min} step={step} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Result({ id, label, value, featured = false }: { id: string; label: string; value: string; featured?: boolean }) {
  return (
    <div className={`${styles.result} ${featured ? styles.resultFeatured : ""}`} data-calculator-result={id}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
