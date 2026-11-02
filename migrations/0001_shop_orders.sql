CREATE TABLE IF NOT EXISTS shop_orders (
  id TEXT PRIMARY KEY,
  checkout_key TEXT NOT NULL UNIQUE,
  snapshot_hash TEXT NOT NULL,
  snapshot TEXT NOT NULL,
  session_id TEXT UNIQUE,
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'paid', 'fulfilled', 'expired')),
  payment_intent TEXT UNIQUE,
  odoo_order_id INTEGER,
  odoo_order_name TEXT,
  last_error TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS shop_orders_state ON shop_orders(state, updated_at);
