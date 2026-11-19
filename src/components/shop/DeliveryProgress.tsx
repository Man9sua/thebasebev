import { formatShopMoney, SHOP_PAYMENT_PRICING } from "@/lib/shop-payment";
import styles from "./DeliveryProgress.module.css";

export function DeliveryProgress({ subtotal }: { subtotal: number }) {
  const threshold = SHOP_PAYMENT_PRICING.uaeDelivery!.freeFromSubtotal;
  const remaining = Math.max(0, threshold - subtotal);
  return <div className={styles.progress}>
    <p>{remaining ? `${formatShopMoney(remaining)} more for free delivery` : "Your order qualifies for free delivery"}</p>
    <div className={styles.track} role="progressbar" aria-label="Product subtotal towards free UAE delivery"
      aria-valuemin={0} aria-valuemax={threshold / 100} aria-valuenow={Math.min(subtotal, threshold) / 100}>
      <span style={{ width: `${Math.min(100, subtotal / threshold * 100)}%` }} />
    </div>
  </div>;
}
