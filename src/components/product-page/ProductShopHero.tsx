"use client";

import { useState, type ReactNode } from "react";
import { useCart } from "@/components/cart/useCart";
import { SampleRequestModal } from "@/components/forms/SampleRequestModal";
import { QuantityInput } from "@/components/shop/QuantityInput";
import { SiteLink } from "@/components/site/SiteLink";
import { useCountryCode } from "@/components/site/useCountryCode";
import { getShopProduct, SHOP_MAX_QUANTITY } from "@/data/shop";
import { getProduct } from "@/data/products";
import { addCartItem } from "@/lib/cart-store";
import { formatShopMoney, getShopPackLabel, getShopUnitAmount } from "@/lib/shop-payment";
import galleries from "@/data/product-shop-gallery.json";
import styles from "./ProductShopHero.module.css";

const GALLERIES = galleries as Readonly<Record<string, readonly string[]>>;
const NO_PHOTOS: readonly string[] = [];

export function ProductShopHero({ slug, title, lead, image, specification }: {
  slug: string;
  title: ReactNode;
  lead: ReactNode;
  image: ReactNode;
  specification?: string;
}) {
  const product = getShopProduct(slug);
  const country = useCountryCode();
  const cart = useCart();
  const [flavor, setFlavor] = useState(product?.flavors[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  if (!product) return null;
  const amount = getShopUnitAmount(slug, undefined, flavor);
  const purchasable = country === "AE" && amount !== null;
  const gallery = GALLERIES[slug] ?? NO_PHOTOS;
  const pack = getShopPackLabel(slug, flavor) ?? product.format;

  function add() {
    if (!cart.ready || !product) return;
    const result = addCartItem(slug, flavor, quantity);
    setMessage(result ? `${product.name} · ${flavor} added to cart` : "Your cart is full. Review it before adding another flavour.");
  }

  return (
    <section className={styles.hero} aria-labelledby="product-title" data-product-shop-hero={slug}>
      <nav className={styles.breadcrumbs} aria-label="Product breadcrumb">
        <SiteLink href="/catalog">Shop</SiteLink><span aria-hidden="true">/</span>
        <span>{product.categoryLabel}</span><span aria-hidden="true">/</span><span>{product.name}</span>
      </nav>
      <div className={styles.gallery}>
        <div className={styles.mainPhoto}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={`${product.name} prepared drink`} />
          ) : image}
        </div>
        {gallery.length > 0 && <div className={styles.thumbnails} role="group" aria-label={`${product.name} photos`}>
          <button type="button" aria-label="Show main product photo" aria-pressed={photo === null} onClick={() => setPhoto(null)}>{image}</button>
          {gallery.map((src, i) => <button key={src} type="button" aria-label={`Show ${product.name} photo ${i + 2}`} aria-pressed={photo === src} onClick={() => setPhoto(src)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" />
          </button>)}
        </div>}
      </div>
      <div className={styles.copy}>
        <h1 className={styles.name} id="product-title">{title}</h1>
        <p className={styles.lead}>{lead}</p>
        {product.flavors.length > 0 && <fieldset className={styles.flavors}>
          <legend>Flavour <span>{flavor}</span></legend>
          <div className={styles.chips}>{product.flavors.map(name => <button type="button" key={name} aria-pressed={flavor === name} onClick={() => { setFlavor(name); setMessage(""); }}>{name}</button>)}</div>
        </fieldset>}
        <div className={styles.pack}><span>Pack</span><strong>{pack}</strong></div>
        <div className={styles.price}>{purchasable ? formatShopMoney(amount) : country === "AE" ? "Price on request" : "Free samples available"}</div>
        {purchasable && <div className={styles.purchase}>
          <div className={styles.quantity} role="group" aria-label={`${product.name} quantity`}>
            <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(quantity - 1)}>−</button>
            <QuantityInput label={`${product.name} quantity`} value={quantity} min={1} onChange={setQuantity} />
            <button type="button" aria-label="Increase quantity" disabled={quantity >= SHOP_MAX_QUANTITY} onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
          <button className={styles.add} type="button" data-cart-add disabled={!cart.ready} onClick={add}>Add to cart</button>
        </div>}
        <p className={styles.status} role="status">{message}</p>
        <div className={styles.secondary}>
          <SampleRequestModal productName={getProduct(slug)?.name} className={styles.outline} label="Request a free sample" />
          <SiteLink href="/contacts" className={styles.outline}>Get wholesale quote</SiteLink>
        </div>
        {specification && <a className={styles.specification} href={specification} download>Download spec sheet (PDF)</a>}
        <ul className={styles.benefits}>
          {country === "AE" ? <><li>Weekday orders delivered the next day</li><li>Free delivery on product orders from AED 500</li></> : <li>Samples shipped from Dubai</li>}
          <li>Free samples can travel with your order</li>
        </ul>
      </div>
    </section>
  );
}
