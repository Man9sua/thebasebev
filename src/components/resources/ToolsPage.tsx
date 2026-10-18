"use client";

import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  ADD_BUTTONS,
  DEFAULT_PRESET,
  PRESET_NAMES,
  T,
  TARGETS,
  aed,
  calculate,
  lineCost,
  newRowId,
  num,
  presetRows,
  signed,
  wholeAed,
  type PresetName,
  type Row,
} from "./calculator/calc-model";
import { pageMarket } from "@/lib/market-preference";
import { PrintSummary, PRINT_CSS } from "./calculator/PrintSummary";
import styles from "./ToolsPage.module.css";

const subscribeNoop = () => () => {};

/** "Download PDF": the print dialog, and an analytics event with the market. */
function printSummary() {
  ((window as { dataLayer?: unknown[] }).dataLayer ??= []).push({ event: "calculator_pdf", ...pageMarket(window.location.pathname) });
  window.print();
}

export function ToolsPage() {
  const [preset, setPreset] = useState<PresetName | null>(DEFAULT_PRESET);
  const [rows, setRows] = useState<Row[]>(() => presetRows(DEFAULT_PRESET));
  const [price, setPrice] = useState("22");
  const [target, setTarget] = useState<number>(25);
  const [perDay, setPerDay] = useState("40");
  const [waste, setWaste] = useState("5");
  const [delivery, setDelivery] = useState(false);
  const [commission, setCommission] = useState("30");
  const [ourSec, setOurSec] = useState("45");
  const [altCost, setAltCost] = useState("7.5");
  const [altSec, setAltSec] = useState("90");
  const [printedOn, setPrintedOn] = useState("");
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const uid = useId();

  const result = useMemo(
    () =>
      calculate({ rows, waste, price, target, perDay, delivery, commission, ourSec, altCost, altSec }),
    [rows, waste, price, target, perDay, delivery, commission, ourSec, altCost, altSec],
  );

  useEffect(() => {
    const stamp = () =>
      setPrintedOn(
        new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      );
    window.addEventListener("beforeprint", stamp);
    return () => window.removeEventListener("beforeprint", stamp);
  }, []);

  const updateRow = (id: string, field: "name" | "price" | "pack" | "use", value: string) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    setPreset(null);
  };

  const pickPreset = (name: PresetName) => {
    setPreset(name);
    setRows(presetRows(name));
  };

  const addRow = (label: string, unit: Row["unit"]) => {
    setRows((current) => [
      ...current,
      { id: newRowId(), name: label, price: "0", pack: unit === "pc" ? "1" : "1000", unit, use: "0" },
    ]);
  };

  const removeRow = (id: string) => setRows((current) => current.filter((row) => row.id !== id));

  const costCup = aed(result.cost);
  const wasteLine = T.withWaste.replace("{w}", String(num(waste)));
  const verdict = T[result.verdict];
  const profitNote = delivery ? T.afterDel : T.afterVat;
  const monthly = wholeAed(result.monthly);
  const saveMoney = signed(result.saveMoney, wholeAed(result.saveMoney));
  const saveTime = signed(result.saveHours, `${result.saveHours.toFixed(1)} ${T.hours}`);

  return (
    <main className={styles.page} data-tools-page>
      <div className={styles.inner}>
        <div className={styles.intro}>
          <h1 className={styles.title}>{T.title}</h1>
          <p className={styles.lead}>{T.lead}</p>
        </div>

        <div className={styles.start}>
          <span className={styles.startLabel} id={`${uid}-start`}>
            {T.start}
          </span>
          <div className={styles.chips} role="group" aria-labelledby={`${uid}-start`}>
            {PRESET_NAMES.map((name) => (
              <button
                key={name}
                type="button"
                className={styles.preset}
                aria-pressed={preset === name}
                onClick={() => pickPreset(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.workspace}>
          <div className={styles.left}>
            <div className={styles.table}>
              <div className={styles.tableHead} aria-hidden="true">
                <span>{T.ing}</span>
                <span>{T.packPrice}</span>
                <span>{T.packSize}</span>
                <span>{T.inCup}</span>
                <span className={styles.right}>{T.cost}</span>
                <span />
              </div>
              {rows.map((row, index) => {
                const label = row.name.trim() || `${T.ing} ${index + 1}`;
                return (
                  <div key={row.id} className={styles.row} role="group" aria-label={label} data-calculator-row>
                    <input
                      className={styles.name}
                      value={row.name}
                      aria-label={`${T.ing} ${index + 1} name`}
                      autoComplete="off"
                      onChange={(event) => updateRow(row.id, "name", event.target.value)}
                    />
                    <NumberCell
                      className={styles.cellPrice}
                      label={T.packPrice}
                      a11yLabel={`${label}: ${T.packPrice}`}
                      value={row.price}
                      onChange={(value) => updateRow(row.id, "price", value)}
                    />
                    <NumberCell
                      className={styles.cellPack}
                      label={`${T.packSize}, ${row.unit}`}
                      a11yLabel={`${label}: ${T.packSize}, ${row.unit}`}
                      unit={row.unit}
                      value={row.pack}
                      onChange={(value) => updateRow(row.id, "pack", value)}
                    />
                    <NumberCell
                      className={styles.cellUse}
                      label={`${T.inCup}, ${row.unit}`}
                      a11yLabel={`${label}: ${T.inCup}, ${row.unit}`}
                      unit={row.unit}
                      value={row.use}
                      onChange={(value) => updateRow(row.id, "use", value)}
                    />
                    <div className={styles.tail}>
                      <span className={styles.lineCost} aria-label={`${label}: ${T.cost} ${lineCost(row).toFixed(2)} AED`}>
                        {lineCost(row).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        className={styles.remove}
                        aria-label={`${T.remove} ${label}`}
                        onClick={() => removeRow(row.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className={styles.addRow}>
                {ADD_BUTTONS.map((button) => (
                  <button
                    key={button.label}
                    type="button"
                    className={styles.add}
                    onClick={() => addRow(button.label, button.unit)}
                  >
                    + {button.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.options}>
              <div className={styles.option}>
                <div className={styles.optionTop}>
                  <label className={styles.optionTitle} htmlFor={`${uid}-waste`}>
                    {T.waste}
                  </label>
                  <PercentBox id={`${uid}-waste`} value={waste} onChange={setWaste} />
                </div>
                <span className={styles.note}>{T.wasteNote}</span>
              </div>
              <div className={`${styles.option} ${delivery ? styles.optionOn : ""}`}>
                <div className={styles.optionTop}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={delivery}
                    className={styles.toggle}
                    onClick={() => setDelivery((current) => !current)}
                  >
                    <span className={styles.track} aria-hidden="true">
                      <span className={styles.knob} />
                    </span>
                    {T.delivery}
                  </button>
                  <PercentBox
                    id={`${uid}-commission`}
                    value={commission}
                    onChange={setCommission}
                    ariaLabel={`${T.commission}, %`}
                  />
                </div>
                <span className={styles.note}>{T.delNote}</span>
              </div>
            </div>
          </div>

          <section className={styles.panel} aria-label="Results">
            <div className={styles.stack6} data-calculator-result="cost">
              <span className={styles.panelLabel}>{T.costCup}</span>
              <strong className={styles.big}>{costCup}</strong>
              <span className={styles.small}>{wasteLine}</span>
            </div>
            <div className={styles.stack10}>
              <label className={styles.panelLabel} htmlFor={`${uid}-price`}>
                {T.menuPrice}
              </label>
              <input
                id={`${uid}-price`}
                className={styles.priceInput}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </div>
            <div className={styles.pair}>
              <div className={styles.stack6} data-calculator-result="cost-percent">
                <span className={styles.small}>{T.pct}</span>
                <strong className={`${styles.mid} ${result.verdict === "ok" ? "" : styles.alert}`}>
                  {result.pct.toFixed(1)}%
                </strong>
                <span className={`${styles.verdict} ${result.verdict === "ok" ? "" : styles.alert}`}>{verdict}</span>
              </div>
              <div className={styles.stack6} data-calculator-result="profit">
                <span className={styles.small}>{T.profit}</span>
                <strong className={styles.mid}>{aed(result.profit)}</strong>
                <span className={styles.small}>{profitNote}</span>
              </div>
            </div>
            <div className={styles.block}>
              <div className={styles.spread}>
                <span className={styles.panelLabel} id={`${uid}-target`}>
                  {T.target}
                </span>
                <div className={styles.targets} role="group" aria-labelledby={`${uid}-target`}>
                  {TARGETS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={styles.target}
                      aria-pressed={target === value}
                      onClick={() => setTarget(value)}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.line} data-calculator-result="suggested">
                <span className={styles.lineLabel}>{T.suggested}</span>
                <strong className={styles.lineValue}>{aed(result.suggested)}</strong>
              </div>
              <button type="button" className={styles.usePrice} onClick={() => setPrice(String(result.suggested))}>
                {T.use}
              </button>
            </div>
            <div className={styles.block}>
              <div className={styles.spreadCenter}>
                <label className={styles.panelLabel} htmlFor={`${uid}-perday`}>
                  {T.perDay}
                </label>
                <input
                  id={`${uid}-perday`}
                  className={styles.perDay}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={perDay}
                  onChange={(event) => setPerDay(event.target.value)}
                />
              </div>
              <div className={styles.line} data-calculator-result="monthly">
                <span className={styles.lineLabel}>{T.monthly}</span>
                <strong className={styles.lineValue}>{monthly}</strong>
              </div>
            </div>
            <button type="button" className={styles.download} onClick={printSummary} data-calculator-print>
              {T.dl}
            </button>
          </section>
        </div>

        <section className={styles.compare} aria-labelledby={`${uid}-cmp`}>
          <div className={styles.compareHead}>
            <h2 id={`${uid}-cmp`} className={styles.h2}>
              {T.cmpTitle}
            </h2>
            <p className={styles.compareLead}>{T.cmpLead}</p>
          </div>
          <div className={styles.compareGrid}>
            <div className={`${styles.cmpBox} ${styles.cmpDark}`}>
              <span className={styles.cmpTitle}>{T.withBase}</span>
              <div className={styles.cmpPair}>
                <div className={styles.stack6}>
                  <span className={styles.cmpLabel}>{T.costCup}</span>
                  <strong className={styles.cmpValue}>{costCup}</strong>
                </div>
                <CmpInput label={T.secs} value={ourSec} onChange={setOurSec} numeric dark />
              </div>
              <span className={styles.cmpNote}>{T.withBaseNote}</span>
            </div>
            <div className={`${styles.cmpBox} ${styles.cmpOutline}`}>
              <span className={styles.cmpTitle}>{T.altName}</span>
              <div className={styles.cmpPair}>
                <CmpInput label={`${T.costCup}, AED`} value={altCost} onChange={setAltCost} />
                <CmpInput label={T.secs} value={altSec} onChange={setAltSec} numeric />
              </div>
              <span className={styles.cmpNote}>{T.altNote}</span>
            </div>
            <div className={`${styles.cmpBox} ${styles.cmpGrey}`}>
              <span className={styles.cmpTitle}>{T.diff}</span>
              <div className={styles.stack6} data-calculator-result="save-money">
                <span className={styles.cmpLabel}>{T.moneyMonth}</span>
                <strong className={`${styles.mid} ${result.saveMoney >= 0 ? "" : styles.alert}`}>{saveMoney}</strong>
              </div>
              <div className={styles.stack6} data-calculator-result="save-time">
                <span className={styles.cmpLabel}>{T.timeMonth}</span>
                <strong className={styles.mid}>{saveTime}</strong>
              </div>
            </div>
          </div>
        </section>

        <p className={styles.foot}>{T.foot}</p>
      </div>

      {isClient &&
        createPortal(
          <>
            <style>{PRINT_CSS}</style>
            <PrintSummary
              drinkName={preset ?? T.drink}
              date={printedOn}
              rows={rows}
              wasteLine={wasteLine}
              costCup={costCup}
              price={aed(num(price))}
              pct={`${result.pct.toFixed(1)}%`}
              verdict={verdict}
              profit={aed(result.profit)}
              profitNote={profitNote}
              suggested={aed(result.suggested)}
              target={`${target}%`}
              perDay={String(num(perDay))}
              monthly={monthly}
              delivery={delivery ? `${num(commission)}%` : null}
            />
          </>,
          document.body,
        )}
    </main>
  );
}

function NumberCell({
  className,
  label,
  a11yLabel,
  unit,
  value,
  onChange,
}: {
  className: string;
  label: string;
  a11yLabel: string;
  unit?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`${styles.cell} ${className}`}>
      <span className={styles.cellLabel}>{label}</span>
      <span className={styles.box}>
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-label={a11yLabel}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {unit && (
          <span className={styles.unit} aria-hidden="true">
            {unit}
          </span>
        )}
      </span>
    </label>
  );
}

function PercentBox({
  id,
  value,
  onChange,
  ariaLabel,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}) {
  return (
    <span className={styles.percent}>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className={styles.unit} aria-hidden="true">
        %
      </span>
    </span>
  );
}

function CmpInput({
  label,
  value,
  onChange,
  numeric = false,
  dark = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  numeric?: boolean;
  dark?: boolean;
}) {
  return (
    <label className={styles.cmpField}>
      <span className={styles.cmpLabel}>{label}</span>
      <input
        className={dark ? styles.cmpInputDark : styles.cmpInput}
        type="text"
        inputMode={numeric ? "numeric" : "decimal"}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
