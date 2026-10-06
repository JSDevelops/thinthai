ALTER TABLE products ADD COLUMN reserved integer NOT NULL DEFAULT 0 CHECK(reserved>=0);
ALTER TABLE products ADD CONSTRAINT stock_capacity CHECK(stock+reserved<=1000000);
CREATE TABLE orders(id uuid PRIMARY KEY,buyer_id uuid NOT NULL REFERENCES app_users(id),store_id uuid NOT NULL REFERENCES stores(id),request_key uuid NOT NULL,request_hash text NOT NULL,
 status text NOT NULL DEFAULT 'placed' CHECK(status IN ('placed','accepted','completed','cancelled','rejected')),
 fulfillment text NOT NULL CHECK(fulfillment IN ('instant_food_delivery','parcel_delivery','pickup')),subtotal_satang bigint NOT NULL CHECK(subtotal_satang>0),
 recipient text NOT NULL,phone text NOT NULL,address text NOT NULL,latitude numeric(9,6),longitude numeric(9,6),version integer NOT NULL DEFAULT 1,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(buyer_id,request_key));
CREATE INDEX orders_buyer_time ON orders(buyer_id,created_at DESC);
CREATE INDEX orders_store_time ON orders(store_id,created_at DESC);
CREATE TABLE order_items(order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,product_id uuid NOT NULL REFERENCES products(id),name text NOT NULL,unit_price_satang integer NOT NULL CHECK(unit_price_satang>0),quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 99),PRIMARY KEY(order_id,product_id));
CREATE TABLE order_history(id uuid PRIMARY KEY,order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,actor_id uuid NOT NULL REFERENCES app_users(id),status text NOT NULL,reason text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX order_history_time ON order_history(order_id,created_at DESC);
