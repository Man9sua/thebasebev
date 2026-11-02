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
  getShopProduct,
  shopKindForCountry,
  type ShopProduct,
} from "@/data/shop";
import {
  addCartItem,
  addSampleCartItem,
  cartLineKey,
  removeCartItem,
  removeSampleCartItem,
  setCartItemQuantity,
  setSampleCartItemQuantity,
  type CartItem,
} from "@/lib/cart-store";
import { formatShopMoney, getShopUnitAmount, getShopPriceRange, getShopQuote, getShopPackLabel, UAE_DELIVERY_TIMING } from "@/lib/shop-payment";
import { combineShopBaskets, shopBasketKey, type ShopBasketItem } from "@/lib/shop-basket";
import { ShopPackImage } from "./ShopPackImage";
import styles from "./ShopPage.module.css";

type ShopKind = ReturnType<typeof shopKindForCountry>;

function itemCount(items: readonly CartItem[]) {
  return items.reduce((count, item) => count + item.quantity, 0);
}

function subtotal(items: readonly CartItem[]) {
  let total = 0;
  for (const item of items) {
    const amount = getShopUnitAmount(item.slug, undefined, item.flavor);
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
  const range = getShopPriceRange(product.slug);
  return range === null ? "Price on request" : `${range.min === range.max ? "" : "From "}${formatShopMoney(range.min)}`;
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

function changeQuantity(kind: ShopKind, slug: string, flavor: string, quantity: number, previous: number) {
  if (previous === 0 && quantity > 0) (kind === "samples" ? addSampleCartItem : addCartItem)(slug, flavor, quantity);
  else (kind === "samples" ? setSampleCartItemQuantity : setCartItemQuantity)(slug, flavor, quantity);
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

function FlavourPicker({ product, kind, items, allowSamples, totalLines, onKindChange, onClose }: { product: ShopProduct; kind: ShopKind; items: readonly CartItem[]; allowSamples: boolean; totalLines: number; onKindChange: (kind: ShopKind) => void; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const dismiss = useRef<HTMLButtonElement>(null);
  const id = useId();
  useOverlay(true, onClose, panel, dismiss);
  const lines = items.filter((item) => item.slug === product.slug);
  const quantities = new Map(lines.map((line) => [line.flavor, line.quantity]));
  const count = itemCount(lines);
  const samples = kind === "samples";
  const boxCount = itemCount(items);
  const full = totalLines >= SHOP_MAX_LINES;

  return (
    <div className={styles.overlay} data-shop-picker={product.slug}>
      <button className={styles.scrim} type="button" tabIndex={-1} aria-label={`Close ${product.name} flavours`} onClick={onClose} />
      <div className={styles.picker} ref={panel} role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1}>
        <div className={styles.pickerArt} style={{ backgroundColor: product.backgroundColor }}><ShopPackImage product={product} sizes="260px" eager /></div>
        <div className={styles.pickerContent}>
          <div className={styles.pickerHead}>
            <div className={styles.pickerCopy}>
              <h2 className={styles.pickerTitle} id={id}>{product.name} flavours</h2>
              <span className={styles.pickerMeta}>{samples ? "Choose a quantity for each flavour" : `${product.format}, ${unitLabel(product, kind)}`}</span>
            </div>
            <button className={styles.dismiss} ref={dismiss} type="button" aria-label="Close flavour picker" onClick={onClose}><CloseIcon /></button>
          </div>
          {allowSamples && <div className={styles.kindSwitch} role="group" aria-label="Pack type">
            <button type="button" aria-pressed={!samples} onClick={() => onKindChange("products")}>Full packs</button>
            <button type="button" aria-pressed={samples} onClick={() => onKindChange("samples")}>Free samples</button>
          </div>}
          <ul className={styles.flavourList} aria-label={`${product.name} flavours`}>
            {product.flavors.map((flavor) => {
              const quantity = quantities.get(flavor) ?? 0;
              const unit = getShopUnitAmount(product.slug, undefined, flavor);
              return (
                <li className={styles.flavourRow} key={flavor} data-shop-flavor={flavor}>
                  <span className={styles.flavourName}>{flavor}{!samples && <small className={styles.flavourPrice}>{unit === null ? "Price on request" : formatShopMoney(unit)}</small>}</span>
                  <Quantity name={`${flavor} ${product.name}`} quantity={quantity} canAdd={!full || quantity > 0} onChange={(next) => changeQuantity(kind, product.slug, flavor, next, quantity)} />
                </li>
              );
            })}
          </ul>
          <div className={styles.pickerFoot}>
            {full && <p className={styles.limitNote} role="status">This checkout supports {SHOP_MAX_LINES} different flavours. Remove a flavour to add another.</p>}
            <button className={styles.control} type="button" onClick={onClose}>{count > 0 ? samples ? `Done: ${boxCount} in sample box` : `Done: ${count} in cart` : "Close"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ kind, country, countryName, items, onClose }: { kind: ShopKind; country: string; countryName: string; items: readonly ShopBasketItem[]; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const dismiss = useRef<HTMLButtonElement>(null);
  const id = useId();
  useOverlay(true, onClose, panel, dismiss);
  const samples = kind === "samples";
  const quote = getShopQuote({ kind, country, shippingMethod: "standard", items });
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
            const unit = getShopUnitAmount(item.slug, undefined, item.flavor);
            const sample = item.kind === "samples";
            return (
              <li className={styles.cartLine} key={shopBasketKey(item)} data-shop-cart-line={cartLineKey(item.slug, item.flavor)} data-shop-line-kind={item.kind}>
                <div className={styles.lineArt} style={{ backgroundColor: product.backgroundColor }}><ShopPackImage product={product} sizes="64px" /></div>
                <div className={styles.lineCopy}>
                  <span className={styles.lineName}>{product.name}</span>
                  <span className={styles.lineFlavour}>{item.flavor} · {sample ? "Free sample" : getShopPackLabel(item.slug, item.flavor) ?? product.format}</span>
                  <Quantity name={`${item.flavor} ${product.name}${sample ? " sample" : ""}`} quantity={item.quantity} onChange={(next) => changeQuantity(item.kind, item.slug, item.flavor, next, item.quantity)} />
                  <button className={styles.remove} type="button" aria-label={`Remove ${item.flavor} ${product.name}${sample ? " sample" : ""}`} onClick={() => (sample ? removeSampleCartItem : removeCartItem)(item.slug, item.flavor)}>Remove</button>
                </div>
                <span className={styles.linePrice}>{sample ? "Free" : unit === null ? "Price on request" : formatShopMoney(unit * item.quantity)}</span>
              </li>
            );
          })}
          {items.length === 0 && <li className={styles.empty} role="status">{samples ? "Your sample box is empty. Choose flavours and quantities to get started." : "Your cart is empty. Choose a product and its flavours to get started."}</li>}
        </ul>
        {total > 0 && (
          <div className={styles.drawerFoot}>
            <dl className={styles.summary}>
              <div><dt>{samples ? "Samples" : "Subtotal"}</dt><dd>{samples ? "Free" : quote.subtotal === null ? "Price on request" : formatShopMoney(quote.subtotal)}</dd></div>
              <div><dt>Delivery to {countryName}</dt><dd>{quote.shipping === null ? "To be confirmed" : quote.shipping === 0 ? "Free" : formatShopMoney(quote.shipping)}</dd></div>
              <div className={styles.total}><dt>Total</dt><dd>At checkout</dd></div>
            </dl>
            <SiteLink className={styles.control} href={checkoutHref}>{samples ? "Request samples" : "Checkout"}</SiteLink>
            <p className={styles.limitNote}>{country === "AE" ? UAE_DELIVERY_TIMING : "Sample delivery is confirmed before payment."}</p>
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
  const [pickerKind, setPickerKind] = useState<ShopKind>("products");
  const currentCart = country !== "AE" || pickerKind === "samples" ? sampleCart : cart;
  const basket = useMemo(() => combineShopBaskets(country, cart.items, sampleCart.items), [country, cart.items, sampleCart.items]);
  const basketKind = basket.length ? basket.some(item => item.kind === "products") ? "products" : "samples" : kind;
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
    for (const item of basket) byProduct.set(item.slug, (byProduct.get(item.slug) ?? 0) + item.quantity);
    return byProduct;
  }, [basket]);
  const total = itemCount(basket);
  const amount = subtotal(country === "AE" ? cart.items : []);
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
        {country === "AE" && <p className={styles.noticeText}>{UAE_DELIVERY_TIMING} Free delivery on product orders from AED 500. Free samples can travel with your order.</p>}
        {samples && (
          <section className={styles.sampleNotice} aria-labelledby="shop-samples-title">
            <div className={styles.noticeCopy}>
              <h2 className={styles.noticeTitle} id="shop-samples-title">Free samples for businesses in {countryName}</h2>
              <p className={styles.noticeText}>Choose your flavours and quantities. We send them by DHL Express. You pay only for delivery.</p>
            </div>
            <SiteLink className={`${styles.control} ${styles.outline}`} href="/distributors">Find your distributor</SiteLink>
          </section>
        )}
        <section aria-label="Shop products">
          <p className="tbb-visually-hidden" role="status">{search ? `${products.length} product ranges found` : ""}</p>
          {products.length > 0 ? <div className={styles.grid}>{products.map((product, index) => <ProductCard product={product} key={product.slug} kind={kind} count={quantities.get(product.slug) ?? 0} eager={index < 4} onChoose={() => { setPickerKind(kind); setPicking(product); }} />)}</div> : <p className={styles.empty}>Nothing matches “{query.trim()}”. Try a product or flavour name, or <SiteLink href="/contacts">ask our team</SiteLink>.</p>}
        </section>
        <section className={styles.quote} aria-labelledby="shop-wholesale-title">
          <div className={styles.noticeCopy}><h2 className={styles.quoteTitle} id="shop-wholesale-title">Buying wholesale?</h2><p className={styles.noticeText}>Distributor prices and private label from Dubai. We reply within one business day.</p></div>
          <SiteLink className={styles.control} href="/contacts">Get a quote</SiteLink>
        </section>
      </div>
      {total > 0 && !drawerOpen && !picking && <button className={styles.cartBar} type="button" data-shop-cart-open aria-haspopup="dialog" onClick={openDrawer}><span>{basketKind === "samples" ? `${total} ${total === 1 ? "sample" : "samples"}` : `${total} in cart, ${amount === null ? "prices pending" : formatShopMoney(amount)}`}</span><span className={styles.cartBarAction}>{basketKind === "samples" ? "Sample box" : "View cart"}</span></button>}
      {picking && <FlavourPicker product={picking} kind={country === "AE" ? pickerKind : "samples"} items={currentCart.items} totalLines={basket.length} allowSamples={country === "AE"} onKindChange={setPickerKind} onClose={closePicker} />}
      {drawerOpen && <CartDrawer kind={basketKind} country={country} countryName={countryName} items={basket} onClose={closeDrawer} />}
    </main>
  );
}
