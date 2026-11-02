import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { createOrderStore, type OrderDatabase } from "../../src/lib/shop-order-store";

export function testOrderStore(database = new DatabaseSync(":memory:")) {
  database.exec(fs.readFileSync("migrations/0001_shop_orders.sql", "utf8"));
  const adapter: OrderDatabase = { prepare: sql => ({ bind: (...values) => ({
    first: async <T>() => (database.prepare(sql).get(...values) as T | undefined) ?? null,
    run: async () => ({ meta: { changes: Number(database.prepare(sql).run(...values).changes) } }),
  }) }) };
  return createOrderStore(adapter);
}
