"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ProductTileArt } from "@/components/product/ProductTileArt";
import { useOverlay } from "@/components/site/useOverlay";
import { addCartItem, type CartItem } from "@/lib/cart-store";
import styles from "./FlavorPicker.module.css";

const EXIT_MS = 260;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function FlavorPicker({
  slug,
  name,
  price,
  weight,
  flavors,
  lines,
  onClose,
}: {
  slug: string;
  name: string;
  price: string | null;
  weight: string | null;
  flavors: readonly string[];
  lines: readonly CartItem[];
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [leaving, setLeaving] = useState(false);

  const close = useCallback(() => {
    if (prefersReducedMotion()) {
      onClose();
      return;
    }
    setLeaving(true);
    window.setTimeout(onClose, EXIT_MS);
  }, [onClose]);

  useOverlay(!leaving, close, panelRef, headingRef);

  const inCart = useMemo(
    () => new Map(lines.map((line) => [line.flavor, line.quantity])),
    [lines],
  );
  const total = lines.reduce((sum, line) => sum + line.quantity, 0);

  function submit() {
    if (!chosen) return;
    addCartItem(slug, chosen, quantity);
    close();
  }

  return (
    <div
      className={`${styles.root} ${leaving ? styles.leaving : ""}`}
      data-flavor-picker={slug}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`flavor-picker-${slug}`}
    >
      <button
        type="button"
        className={styles.scrim}
        aria-label={`Close the ${name} flavour picker`}
        onClick={close}
      />

      <div className={styles.panel} ref={panelRef} tabIndex={-1}>
        <div className={styles.head}>
          <ProductTileArt
            className={styles.art}
            slug={slug}
            name=""
            sizes="120px"
          />
          <div className={styles.headCopy}>
            <p className={styles.eyebrow}>Choose your flavour</p>
            <h2 className={styles.title} id={`flavor-picker-${slug}`} ref={headingRef} tabIndex={-1}>
              {name}
            </h2>
            <p className={styles.meta}>
              {price ?? "-"}
              {weight ? <span className={styles.metaDot}>·</span> : null}
              {weight ? `${weight} pouch` : null}
            </p>
          </div>
          <button
            type="button"
            className={styles.dismiss}
            aria-label="Close"
            onClick={close}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.count} id={`flavor-count-${slug}`}>
            {flavors.length} flavours
            {total > 0 ? ` · ${total} in cart` : ""}
          </p>

          <div
            className={styles.flavors}
            role="radiogroup"
            aria-labelledby={`flavor-count-${slug}`}
          >
            {flavors.map((flavor, index) => (
              <label
                key={flavor}
                className={`${styles.chip} ${chosen === flavor ? styles.chipOn : ""}`}
                style={{ "--i": index } as React.CSSProperties}
              >
                <input
                  type="radio"
                  name={`flavor-${slug}`}
                  value={flavor}
                  checked={chosen === flavor}
                  onChange={() => setChosen(flavor)}
                />
                <span className={styles.chipName}>{flavor}</span>
                {inCart.has(flavor) && (
                  <span className={styles.chipCount} aria-label={`${inCart.get(flavor)} in cart`}>
                    {inCart.get(flavor)}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.foot}>
          <div className={styles.stepper} role="group" aria-label="Quantity">
            <button
              type="button"
              className={styles.step}
              aria-label="One fewer"
              disabled={quantity <= 1}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              −
            </button>
            <span className={styles.quantity} aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className={styles.step}
              aria-label="One more"
              disabled={quantity >= 10}
              onClick={() => setQuantity((value) => Math.min(10, value + 1))}
            >
              +
            </button>
          </div>

          <button
            type="button"
            className={styles.submit}
            data-flavor-submit
            disabled={!chosen}
            onClick={submit}
          >
            {chosen ? `Add ${chosen}` : "Pick a flavour"}
          </button>
        </div>
      </div>
    </div>
  );
}
