ALTER TABLE bookings ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes');
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes');

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES app_users(id),
  target_type text NOT NULL CHECK(target_type IN ('booking', 'order')),
  target_id uuid NOT NULL,
  amount_satang bigint NOT NULL CHECK(amount_satang > 0),
  method text NOT NULL CHECK(method IN ('promptpay', 'card', 'sandbox')),
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'succeeded', 'failed', 'refunded')),
  provider_ref text,
  qr_payload text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes'),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_user_time ON payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payments_target ON payments(target_type, target_id);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id uuid PRIMARY KEY,
  payment_id uuid NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id),
  gross_amount_satang bigint NOT NULL CHECK(gross_amount_satang >= 0),
  platform_fee_satang bigint NOT NULL DEFAULT 0 CHECK(platform_fee_satang >= 0),
  net_merchant_satang bigint NOT NULL CHECK(net_merchant_satang >= 0),
  status text NOT NULL DEFAULT 'pending_payout' CHECK(status IN ('pending_payout', 'settled', 'refunded')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ledger_store_time ON ledger_entries(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_pending_expiry ON bookings(expires_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS orders_placed_expiry ON orders(expires_at) WHERE status = 'placed';
