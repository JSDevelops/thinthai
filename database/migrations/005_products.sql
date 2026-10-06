CREATE TABLE products (
 id uuid PRIMARY KEY,store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
 name text NOT NULL,description text NOT NULL DEFAULT '',category text NOT NULL CHECK(category IN ('food','craft')),
 fulfillment text NOT NULL CHECK(fulfillment IN ('instant_food_delivery','parcel_delivery','pickup')),
 price_satang integer NOT NULL CHECK(price_satang BETWEEN 1 AND 100000000),
 stock integer NOT NULL DEFAULT 0 CHECK(stock BETWEEN 0 AND 1000000),
 active boolean NOT NULL DEFAULT false,version integer NOT NULL DEFAULT 1,
 image_data bytea CHECK(octet_length(image_data)<=1048576),
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(fulfillment<>'instant_food_delivery' OR category='food'));
CREATE INDEX products_store_idx ON products(store_id,created_at DESC);
CREATE TABLE product_history(id uuid PRIMARY KEY,product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 actor_id uuid NOT NULL REFERENCES app_users(id),event text NOT NULL,reason text NOT NULL,delta integer,
 request_key uuid,before_data jsonb,after_data jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(product_id,request_key));
CREATE INDEX product_history_time ON product_history(product_id,created_at DESC);
