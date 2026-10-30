"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useCart, useSampleCart } from "@/components/cart/useCart";
import { SiteLink } from "@/components/site/SiteLink";
import { useCountryCode } from "@/components/site/useCountryCode";
import { useOverlay } from "@/components/site/useOverlay";
import { MARKETS } from "@/lib/site-config";
import {
  SHOP_PRODUCTS,
  SHOP_MAX_QUANTITY,
  SHOP_MAX_LINES,
  SHOP_SAMPLE_LIMIT,
  getShopProduct,
  shopKindForCountry,
  type ShopProduct,
} from "@/data/shop";
import {
  addCartItem,
  addSampleCartItem,
  cartLineKey,
  removeSampleCartItem,
  setCartItemQuantity,
  type CartItem,
} from "@/lib/cart-store";
import { formatShopMoney, getShopUnitAmount } from "@/lib/shop-payment";
import { ShopPackImage } from "./ShopPackImage";
import styles from "./ShopPage.module.css";

type ShopKind = ReturnType<typeof shopKindForCountry>;

function itemCount(items: readonly CartItem[]) {
  return items.reduce((count, item) => count + item.quantity, 0);
}

function subtotal(items: readonly CartItem[]) {
  let total = 0;
  for (const item of items) {
    const amount = getShopUnitAmount(item.slug);
    if (amount === null) return null;
    total += amount * item.quantity;
  }
  return total;
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const SEARCH_PRODUCTS = SHOP_PRODUCTS.map((product) => ({
  product,
  text: normalize(`${product.name} ${product.flavors.join(" ")}`),
}));

function unitLabel(product: ShopProduct, kind: ShopKind) {
  if (kind === "samples") return "Free sample";
  const amount = getShopUnitAmount(product.slug);
  return amount === null ? "Price pending" : formatShopMoney(amount);
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>;
}

function Quantity({ name, quantity, canAdd = true, onChange }: { name: string; quantity: number; canAdd?: boolean; onChange: (quantity: number) => void }) {
  return (
    <div className={styles.stepper} role="group" aria-label={`${name} quantity`}>
      <button className={styles.step} type="button" disabled={quantity === 0} aria-label={`Remove one ${name}`} onClick={() => onChange(quantity - 1)}>−</button>
      <span className={styles.quantity} aria-live="polite">{quantity}</span>
      <button className={styles.step} type="button" disabled={quantity >= SHOP_MAX_QUANTITY || !canAdd} aria-label={`Add one ${name}`} onClick={() => onChange(quantity + 1)}>+</button>
    </div>
  );
}

function changeProductQuantity(slug: string, flavor: string, quantity: number, previous: number) {
  if (previous === 0 && quantity > 0) addCartItem(slug, flavor, quantity);
  else setCartItemQuantity(slug, flavor, quantity);
}

function ProductCard({ product, kind, count, onChoose, eager }: { product: ShopProduct; kind: ShopKind; count: number; onChoose: () => void; eager: boolean }) {
  return (
    <article className={styles.card} data-shop-product={product.slug}>
      <SiteLink className={styles.tile} style={{ backgroundColor: product.backgroundColor }} href={product.route} aria-label={`View more about ${product.name}`} tabIndex={-1}>
        <ShopPackImage product={product} sizes="(max-width: 719px) calc(100vw - 32px), (max-width: 1100px) 28vw, 280px" eager={eager} />
        <span className={styles.viewMore}>View more</span>
      </SiteLink>
      <div className={styles.info}>
        <div className={styles.productCopy}>
          <h2 className={styles.name}><SiteLink href={product.route}>{product.name}</SiteLink></h2>
          <span className={styles.format}>{product.format}, {product.flavors.length} flavours</span>
        </div>
        <span className={styles.price}>{unitLabel(product, kind)}</span>
      </div>
      <button className={`${styles.control} ${count > 0 ? styles.inCart : ""}`} type="button" aria-haspopup="dialog" data-shop-choose={product.slug} onClick={onChoose}>
        {count > 0 ? `${count} in ${kind === "samples" ? "sample box" : "cart"}, edit` : kind === "samples" ? "Add to sample box" : "Choose flavours"}
      </button>
    </article>
  );
}

function FlavourPicker({ product, kind, items, onClose }: { product: ShopProduct; kind: ShopKind; items: readonly CartItem[]; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const dismiss = useRef<HTMLButtonElement>(null);
  const id = useId();
  useOverlay(true, onClose, panel, dismiss);
  const lines = items.filter((item) => item.slug === product.slug);
  const quantities = new Map(lines.map((line) => [line.flavor, line.quantity]));
  const count = itemCount(lines);
  const samples = kind === "samples";
  const boxCount = items.length;
  const full = items.length >= (samples ? SHOP_SAMPLE_LIMIT : SHOP_MAX_LINES);

  return (
    <div className={styles.overlay} data-shop-picker={product.slug}>
      <button className={styles.scrim} type="button" tabIndex={-1} aria-label={`Close ${product.name} flavours`} onClick={onClose} />
      <div className={styles.picker} ref={panel} role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1}>
        <div className={styles.pickerArt} style={{ backgroundColor: product.backgroundColor }}><ShopPackImage product={product} sizes="260px" eager /></div>
        <div className={styles.pickerContent}>
          <div className={styles.pickerHead}>
            <div className={styles.pickerCopy}>
              <h2 className={styles.pickerTitle} id={id}>{product.name} flavours</h2>
              <span className={styles.pickerMeta}>{samples ? "One sample pouch per flavour" : `${product.format}, ${unitLabel(product, kind)}`}</span>
            </div>
            <button className={styles.dismiss} ref={dismiss} type="button" aria-label="Close flavour picker" onClick={onClose}><CloseIcon /></button>
          </div>
          <ul className={styles.flavourList} aria-label={`${product.name} flavours`}>
            {product.flavors.map((flavor) => {
              const quantity = quantities.get(flavor) ?? 0;
              return (
                <li className={styles.flavourRow} key={flavor} data-shop-flavor={flavor}>
                  <span className={styles.flavourName}>{flavor}</span>
                  {samples ? (
                    <button className={`${styles.control} ${styles.sampleToggle}`} type="button" aria-label={`${quantity ? "Remove" : "Add"} ${flavor} ${product.name} sample`} aria-pressed={quantity > 0} disabled={full && quantity === 0} onClick={() => quantity ? removeSampleCartItem(product.slug, flavor) : addSampleCartItem(product.slug, flavor)}>{quantity > 0 ? "Added" : "Add"}</button>
                  ) : <Quantity name={`${flavor} ${product.name}`} quantity={quantity} canAdd={!full || quantity > 0} onChange={(next) => changeProductQuantity(product.slug, flavor, next, quantity)} />}
                </li>
              );
            })}
          </ul>
          <div className={styles.pickerFoot}>
            {full && <p className={styles.limitNote} role="status">{samples ? `Sample box is full: ${SHOP_SAMPLE_LIMIT} flavours` : `Cart limit reached: ${SHOP_MAX_LINES} flavours. Remove a flavour to add another.`}</p>}
            <button className={styles.control} type="button" onClick={onClose}>{count > 0 ? samples ? `Done: ${boxCount} of ${SHOP_SAMPLE_LIMIT} in box` : `Done: ${count} in cart` : "Close"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ kind, country, countryName, items, onClose }: { kind: ShopKind; country: string; countryName: string; items: readonly CartItem[]; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const dismiss = useRef<HTMLButtonElement>(null);
  const id = useId();
  useOverlay(true, onClose, panel, dismiss);
  const samples = kind === "samples";
  const amount = subtotal(items);
  const total = itemCount(items);
  const checkoutHref = `/checkout?country=${encodeURIComponent(country)}&kind=${kind}`;

  return (
    <div className={styles.overlay} data-shop-drawer={kind}>
      <button className={styles.scrim} type="button" tabIndex={-1} aria-label={`Close ${samples ? "sample box" : "cart"}`} onClick={onClose} />
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby={id} ref={panel} tabIndex={-1}>
        <div className={styles.drawerHead}>
          <h2 className={styles.drawerTitle} id={id}>{samples ? "Sample box" : "Cart"}</h2>
          <button className={styles.dismiss} ref={dismiss} type="button" aria-label={`Close ${samples ? "sample box" : "cart"}`} onClick={onClose}><CloseIcon /></button>
        </div>
        <ul className={styles.drawerBody}>
          {items.map((item) => {
            const product = getShopProduct(item.slug);
            if (!product) return null;
            const unit = getShopUnitAmount(item.slug);
            return (
              <li className={styles.cartLine} key={cartLineKey(item.slug, item.flavor)} data-shop-cart-line={cartLineKey(item.slug, item.flavor)}>
                <div className={styles.lineArt} style={{ backgroundColor: product.backgroundColor }}><ShopPackImage product={product} sizes="64px" /></div>
                <div className={styles.lineCopy}>
                  <span className={styles.lineName}>{product.name}</span>
                  <span className={styles.lineFlavour}>{item.flavor}</span>
                  {samples ? <button className={styles.remove} type="button" aria-label={`Remove ${item.flavor} ${product.name} sample`} onClick={() => removeSampleCartItem(item.slug, item.flavor)}>Remove</button> : <Quantity name={`${item.flavor} ${product.name}`} quantity={item.quantity} onChange={(next) => setCartItemQuantity(item.slug, item.flavor, next)} />}
                </div>
                <span className={styles.linePrice}>{samples ? "Free" : unit === null ? "Price pending" : formatShopMoney(unit * item.quantity)}</span>
              </li>
            );
          })}
          {items.length === 0 && <li className={styles.empty} role="status">{samples ? `Your sample box is empty. Add up to ${SHOP_SAMPLE_LIMIT} flavours.` : "Your cart is empty. Choose a product and its flavours to get started."}</li>}
        </ul>
        {total > 0 && (
          <div className={styles.drawerFoot}>
            <dl className={styles.summary}>
              {samples ? <><div><dt>Samples</dt><dd>Free</dd></div><div><dt>DHL Express to {countryName}</dt><dd>Delivery price pending</dd></div></> : <><div><dt>Subtotal</dt><dd>{amount === null ? "Price pending" : formatShopMoney(amount)}</dd></div><div><dt>VAT and delivery</dt><dd>Confirmed at checkout</dd></div><div className={styles.total}><dt>Total</dt><dd>{amount === null ? "Price pending" : "At checkout"}</dd></div></>}
            </dl>
            <SiteLink className={styles.control} href={checkoutHref}>{samples ? "Request samples" : "Checkout"}</SiteLink>
            <p className={styles.limitNote}>{samples ? "Sample delivery is confirmed before payment." : "Prices and delivery are confirmed before payment."}</p>
          </div>
        )}
      </aside>
    </div>
  );
}

export function ShopPage() {
  const country = useCountryCode();
  const countryName = MARKETS.find((market) => market.code === country)?.name ?? country;
  const kind = shopKindForCountry(country);
  const cart = useCart();
  const sampleCart = useSampleCart();
  const currentCart = kind === "samples" ? sampleCart : cart;
  const [query, setQuery] = useState("");
  const [picking, setPicking] = useState<ShopProduct | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closePicker = useCallback(() => setPicking(null), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openDrawer = useCallback(() => { setPicking(null); setDrawerOpen(true); }, []);

  useEffect(() => {
    window.addEventListener("thebase:open-cart", openDrawer);
    return () => window.removeEventListener("thebase:open-cart", openDrawer);
  }, [openDrawer]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const frame = window.requestAnimationFrame(() => {
      setQuery(params.get("search") ?? "");
      if (params.get("cart") === "open") setDrawerOpen(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const search = normalize(query.trim());
  const products = useMemo(() => SEARCH_PRODUCTS.filter((entry) => !search || entry.text.includes(search)).map(({ product }) => product), [search]);
  const quantities = useMemo(() => {
    const byProduct = new Map<string, number>();
    for (const item of currentCart.items) byProduct.set(item.slug, (byProduct.get(item.slug) ?? 0) + item.quantity);
    return byProduct;
  }, [currentCart.items]);
  const total = itemCount(currentCart.items);
  const amount = subtotal(currentCart.items);
  const samples = kind === "samples";

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <section className={styles.intro} aria-labelledby="shop-title">
          <div className={styles.introCopy}>
            <h1 className={styles.title} id="shop-title">Shop</h1>
            <p className={styles.lede}>{samples ? "Free samples for cafés, restaurants and hotels abroad. We ship from Dubai." : "Order online for your café, restaurant or hotel. Delivery across the UAE."}</p>
          </div>
          <label className={styles.search}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <span className="tbb-visually-hidden">Search products or flavours</span>
            <input type="search" data-shop-search placeholder="Search products or flavours" value={query} autoComplete="off" onChange={(event) => setQuery(event.currentTarget.value)} />
          </label>
        </section>
        {samples && (
          <section className={styles.sampleNotice} aria-labelledby="shop-samples-title">
            <div className={styles.noticeCopy}>
              <h2 className={styles.noticeTitle} id="shop-samples-title">Free samples for businesses in {countryName}</h2>
              <p className={styles.noticeText}>Online orders ship within the UAE. Pick up to {SHOP_SAMPLE_LIMIT} flavours, we send them by DHL Express. You pay only for delivery.</p>
            </div>
            <SiteLink className={`${styles.control} ${styles.outline}`} href="/distributors">Find your distributor</SiteLink>
          </section>
        )}
        <section aria-label="Shop products">
          <p className="tbb-visually-hidden" role="status">{search ? `${products.length} product ranges found` : ""}</p>
          {products.length > 0 ? <div className={styles.grid}>{products.map((product, index) => <ProductCard product={product} key={product.slug} kind={kind} count={quantities.get(product.slug) ?? 0} eager={index < 4} onChoose={() => setPicking(product)} />)}</div> : <p className={styles.empty}>Nothing matches “{query.trim()}”. Try a product or flavour name, or <SiteLink href="/contacts">ask our team</SiteLink>.</p>}
        </section>
        <section className={styles.quote} aria-labelledby="shop-wholesale-title">
          <div className={styles.noticeCopy}><h2 className={styles.quoteTitle} id="shop-wholesale-title">Buying wholesale?</h2><p className={styles.noticeText}>Distributor prices and private label from Dubai. We reply within one business day.</p></div>
          <SiteLink className={styles.control} href="/contacts">Get a quote</SiteLink>
        </section>
      </div>
      {total > 0 && !drawerOpen && !picking && <button className={styles.cartBar} type="button" data-shop-cart-open aria-haspopup="dialog" onClick={openDrawer}><span>{samples ? `${total} of ${SHOP_SAMPLE_LIMIT} samples` : `${total} in cart, ${amount === null ? "prices pending" : formatShopMoney(amount)}`}</span><span className={styles.cartBarAction}>{samples ? "Sample box" : "View cart"}</span></button>}
      {picking && <FlavourPicker product={picking} kind={kind} items={currentCart.items} onClose={closePicker} />}
      {drawerOpen && <CartDrawer kind={kind} country={country} countryName={countryName} items={currentCart.items} onClose={closeDrawer} />}
    </main>
  );
}
