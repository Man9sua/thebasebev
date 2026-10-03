"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ProductTileArt } from "@/components/product/ProductTileArt";
import { useOverlay } from "@/components/site/useOverlay";
import { addCartItem, type CartItem } from "@/lib/cart-store";
import styles from "./FlavorPicker.module.css";

/**
 * The step between "Add to cart" and the cart.
 *
 * Every product is sold in flavours, so a cart line naming only the product is
 * an order nobody can fill. This asks for the one thing the shelf cannot: which
 * flavour, and how many. Nothing is preselected — a default here would put a
 * flavour in the cart that the buyer never chose, which is the whole fault it
 * exists to fix — so the button stays inert until a chip is pressed.
 *
 * Behaviour it does not own: Escape, the scroll lock, the focus trap and
 * returning focus to the card's button are `useOverlay`, the same hook the menu
 * and the search panel use.
 */
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
  /** This product's lines already in the cart, so a chip can say so. */
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
    // Let the panel play out before it leaves the tree. The timer is the only
    // thing that has to agree with the stylesheet; everything else is CSS.
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
      /* The menu and the search panel are dialogs too and both stay mounted,
         so this carries a hook of its own for the smoke and the audit rather
         than leaving them to guess which dialog is which. */
      data-flavor-picker={slug}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`flavor-picker-${slug}`}
    >
      {/* The backdrop is the dismiss target as well as the dimmer, which is why
          it is a button rather than a div with a click handler. */}
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
              {price ?? "Price on request"}
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

          {/*
            A radiogroup rather than a listbox: one of a small set, all of them
            visible, and the arrow keys are the browser's own once the chips are
            radios. Painted as chips; the input itself is the accessible control.
          */}
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
