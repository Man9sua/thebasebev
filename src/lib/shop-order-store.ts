import { snapshotHash, type OrderStore, type StoredOrder } from "./shop-order";

type Row = {
  id: string; checkout_key: string; snapshot_hash: string; snapshot: string; session_id: string | null;
  state: StoredOrder["state"]; payment_intent: string | null; odoo_order_id: number | null; odoo_order_name: string | null; created_at: number;
};
export type OrderDatabase = { prepare(sql: string): {
  bind(...values: (string | number | null)[]): { first<T>(): Promise<T | null>; run(): Promise<{ meta?: { changes?: number } }> };
} };
const decode = (row: Row): StoredOrder => ({ id: row.id, checkoutKey: row.checkout_key, hash: row.snapshot_hash, snapshot: JSON.parse(row.snapshot),
  sessionId: row.session_id, state: row.state, paymentIntent: row.payment_intent, odooOrderId: row.odoo_order_id, odooOrderName: row.odoo_order_name, createdAt: row.created_at });

export function createOrderStore(database: OrderDatabase): OrderStore {
  const read = async (column: "id" | "checkout_key" | "session_id", value: string) => {
    const row = await database.prepare(`SELECT * FROM shop_orders WHERE ${column} = ?`).bind(value).first<Row>();
    return row ? decode(row) : null;
  };
  const update = async (sql: string, values: (string | number | null)[]) => {
    const result = await database.prepare(sql).bind(...values).run();
    if (result.meta?.changes !== 1) throw new Error("ORDER_STATE_CONFLICT");
  };
  return {
    async reserve(key, snapshot) {
      const hash = await snapshotHash(snapshot);
      const now = Date.now();
      await database.prepare("INSERT INTO shop_orders (id, checkout_key, snapshot_hash, snapshot, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(checkout_key) DO NOTHING")
        .bind(crypto.randomUUID(), key, hash, JSON.stringify(snapshot), now, now).run();
      const order = await read("checkout_key", key);
      if (!order || order.hash !== hash) throw new Error("CHECKOUT_KEY_REUSED");
      return order;
    },
    get: id => read("id", id),
    bySession: id => read("session_id", id),
    attachSession: (id, sessionId) => update("UPDATE shop_orders SET session_id = ?, updated_at = ? WHERE id = ? AND (session_id IS NULL OR session_id = ?)", [sessionId, Date.now(), id, sessionId]),
    paid: (id, paymentIntent) => update("UPDATE shop_orders SET payment_intent = ?, state = CASE WHEN state = 'fulfilled' THEN state ELSE 'paid' END, updated_at = ? WHERE id = ? AND (payment_intent IS NULL OR payment_intent = ?)", [paymentIntent, Date.now(), id, paymentIntent]),
    fulfilled: (id, orderId, orderName) => update("UPDATE shop_orders SET state = 'fulfilled', odoo_order_id = ?, odoo_order_name = ?, last_error = NULL, updated_at = ? WHERE id = ? AND payment_intent IS NOT NULL AND (odoo_order_id IS NULL OR odoo_order_id = ?)", [orderId, orderName, Date.now(), id, orderId]),
    failed: async (id, code) => { await database.prepare("UPDATE shop_orders SET last_error = ?, updated_at = ? WHERE id = ? AND state != 'fulfilled'").bind(code, Date.now(), id).run(); },
  };
}
