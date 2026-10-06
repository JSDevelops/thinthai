-- Initial schema for later database integration. Apply once via a migration runner.
BEGIN;
CREATE TABLE app_users (id uuid PRIMARY KEY, auth_subject text UNIQUE NOT NULL, display_name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE provinces (id text PRIMARY KEY, name_th text NOT NULL);
CREATE TABLE districts (id text PRIMARY KEY, province_id text NOT NULL REFERENCES provinces(id), name_th text NOT NULL, UNIQUE(id,province_id));
CREATE TABLE subdistricts (id text PRIMARY KEY, district_id text NOT NULL, province_id text NOT NULL, name_th text NOT NULL, FOREIGN KEY(district_id,province_id) REFERENCES districts(id,province_id));
CREATE TABLE stores (id uuid PRIMARY KEY, name text NOT NULL, subdistrict_id text NOT NULL REFERENCES subdistricts(id), latitude numeric(9,6) CHECK(latitude BETWEEN -90 AND 90), longitude numeric(9,6) CHECK(longitude BETWEEN -180 AND 180), created_at timestamptz NOT NULL DEFAULT now(), CHECK((latitude IS NULL)=(longitude IS NULL)));
CREATE INDEX stores_subdistrict_idx ON stores(subdistrict_id);
CREATE TABLE store_memberships (user_id uuid NOT NULL REFERENCES app_users(id), store_id uuid NOT NULL REFERENCES stores(id), PRIMARY KEY(user_id,store_id));
CREATE INDEX memberships_store_idx ON store_memberships(store_id);
CREATE TABLE admin_province_scopes (user_id uuid NOT NULL REFERENCES app_users(id), province_id text NOT NULL REFERENCES provinces(id), PRIMARY KEY(user_id,province_id));
CREATE TABLE system_roles (user_id uuid NOT NULL REFERENCES app_users(id), role text NOT NULL CHECK(role IN ('ADMIN','SUPER_ADMIN')), PRIMARY KEY(user_id,role));
-- USER is the base role; MERCHANT derives from store membership. Role grants are server-managed.
-- Food product fulfillment and PostGIS delivery polygons will be introduced separately.
COMMIT;
