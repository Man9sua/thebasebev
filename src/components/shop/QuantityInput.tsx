"use client";

import { useState } from "react";
import { SHOP_MAX_QUANTITY } from "@/lib/shop-limits";
import styles from "./QuantityInput.module.css";

export function QuantityInput({ label, value, onChange, min = 0, disabled = false }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: 0 | 1;
  disabled?: boolean;
}) {
  // An empty field or a leading zero must not remove a cart row mid-edit.
  const [draft, setDraft] = useState<string | null>(null);
  const displayed = draft ?? String(value);

  function update(next: number) {
    setDraft(null);
    const bounded = Math.max(min, Math.min(next, SHOP_MAX_QUANTITY));
    if (bounded !== value) onChange(bounded);
  }

  return (
    <input
      className={styles.input}
      type="text"
      inputMode="numeric"
      enterKeyHint="done"
      role="spinbutton"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={SHOP_MAX_QUANTITY}
      aria-valuenow={displayed === "" ? value : Math.max(min, Number(displayed))}
      autoComplete="off"
      disabled={disabled}
      style={{ width: `${Math.max(3, displayed.length)}ch` }}
      value={displayed}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => {
        const next = event.currentTarget.value;
        if (!/^\d*$/.test(next)) return;
        if (next === "" || Number(next) === 0) setDraft(next === "" ? "" : "0");
        else update(Number(next));
      }}
      onBlur={() => {
        if (draft === "0") update(0);
        else setDraft(null);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
          update(Number(displayed) + (event.key === "ArrowUp" ? 1 : -1));
        }
      }}
    />
  );
}
