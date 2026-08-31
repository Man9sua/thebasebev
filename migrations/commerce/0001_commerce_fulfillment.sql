PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS commerce_orders (
  id TEXT PRIMARY KEY,
  internal_reference TEXT NOT NULL UNIQUE,
  cart_version INTEGER NOT NULL DEFAULT 1,
  checkout_policy_json TEXT NOT NULL DEFAULT '{}',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_event_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL,
  currency TEXT NOT NULL CHECK (currency = 'aed'),
  amount_subtotal INTEGER NOT NULL CHECK (amount_subtotal >= 0),
  amount_discount INTEGER NOT NULL DEFAULT 0 CHECK (amount_discount >= 0),
  amount_shipping INTEGER NOT NULL DEFAULT 0 CHECK (amount_shipping >= 0),
  amount_tax INTEGER NOT NULL DEFAULT 0 CHECK (amount_tax >= 0),
  amount_total INTEGER NOT NULL CHECK (amount_total >= 0),
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  billing_address_json TEXT,
  shipping_address_json TEXT,
  odoo_partner_id INTEGER,
  odoo_shipping_partner_id INTEGER,
  odoo_sale_order_id INTEGER,
  odoo_sale_order_name TEXT,
  odoo_invoice_id INTEGER,
  fulfillment_status TEXT NOT NULL DEFAULT 'pending',
  fulfillment_lock_at TEXT,
  notification_status TEXT NOT NULL DEFAULT 'not_configured',
  notification_error TEXT,
  created_at TEXT NOT NULL,
  paid_at TEXT,
  fulfilled_at TEXT,
  updated_at TEXT NOT NULL,
  last_error TEXT
);

CREATE TABLE IF NOT EXISTS commerce_order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  product_key TEXT NOT NULL,
  website_product_id TEXT NOT NULL,
  website_sku TEXT NOT NULL,
  product_name_snapshot TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_amount INTEGER NOT NULL CHECK (unit_amount >= 0),
  subtotal_amount INTEGER NOT NULL CHECK (subtotal_amount >= 0),
  discount_amount INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  tax_amount INTEGER NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  odoo_product_id INTEGER,
  odoo_default_code TEXT,
  FOREIGN KEY (order_id) REFERENCES commerce_orders(id) ON DELETE CASCADE,
  UNIQUE (order_id, product_key)
);

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  stripe_event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  stripe_session_id TEXT,
  processing_status TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  last_error TEXT,
  created_at TEXT NOT NULL,
  processed_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commerce_orders_fulfillment
  ON commerce_orders(fulfillment_status, updated_at);
CREATE INDEX IF NOT EXISTS idx_commerce_orders_email
  ON commerce_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_commerce_order_items_order
  ON commerce_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_session
  ON stripe_webhook_events(stripe_session_id, processing_status);
