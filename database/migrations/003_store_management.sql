ALTER TABLE stores ADD COLUMN address text NOT NULL DEFAULT '';
ALTER TABLE stores ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE stores ADD COLUMN version integer NOT NULL DEFAULT 1;
ALTER TABLE stores ADD COLUMN delivery_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE stores ADD COLUMN delivery_radius_km numeric(5,2);
ALTER TABLE stores ADD CONSTRAINT delivery_valid CHECK (
 (NOT delivery_enabled AND delivery_radius_km IS NULL) OR
 (delivery_enabled AND category='food' AND active AND latitude IS NOT NULL AND longitude IS NOT NULL AND delivery_radius_km IS NOT NULL AND delivery_radius_km BETWEEN 0.1 AND 30));
CREATE TABLE store_history(id uuid PRIMARY KEY,store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,actor_id uuid NOT NULL REFERENCES app_users(id),event text NOT NULL,before_data jsonb,after_data jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX store_history_store_time ON store_history(store_id,created_at DESC);
