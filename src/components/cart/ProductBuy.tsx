"use client";

import { useState } from "react";
import { FlavorPicker } from "@/components/cart/FlavorPicker";
import { useCart } from "@/components/cart/useCart";

/**
 * The way into the cart from a product's own page.
 *
 * The catalogue's "Buy" now hands the visitor to the Odoo shop, so this is the
 * one control left that fills the native cart the header and `/checkout` are
 * still built on. Same two steps the catalogue used: this opens the flavour
 * picker, and the picker is what writes the line — a cart line naming only the
 * product is an order nobody can fill.
 *
 * `data-cart-add` travels with it. It is what `smoke:browser` and the commerce
 * audit press, and it now lives here rather than on the shelf.
 */
export function ProductBuy({
  slug,
  name,
  price,
  weight,
  flavors,
  className,
}: {
  slug: string;
  name: string;
  price: string | null;
  weight: string | null;
  flavors: readonly string[];
  className?: string;
}) {
  const [picking, setPicking] = useState(false);
  const cart = useCart();

  // Nothing to choose is nothing to sell: the enquiry forms beside this are
  // the whole offer for a product that is quoted rather than listed.
  if (flavors.length === 0) return null;

  return (
    <>
      <button
        type="button"
        className={className}
        data-cart-add
        aria-haspopup="dialog"
        onClick={() => setPicking(true)}
      >
        Add to cart
      </button>

      {picking && (
        <FlavorPicker
          slug={slug}
          name={name}
          price={price}
          weight={weight}
          flavors={flavors}
          lines={cart.items.filter((item) => item.slug === slug)}
          onClose={() => setPicking(false)}
        />
      )}
    </>
  );
}
