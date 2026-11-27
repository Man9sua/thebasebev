"use client";

import { useState } from "react";
import { FlavorPicker } from "@/components/cart/FlavorPicker";
import { useCart } from "@/components/cart/useCart";

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
