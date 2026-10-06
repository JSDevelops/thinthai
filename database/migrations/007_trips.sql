CREATE TABLE trips(
 id uuid PRIMARY KEY,store_id uuid NOT NULL REFERENCES stores(id),title text NOT NULL,description text NOT NULL,meeting_point text NOT NULL,
 category text NOT NULL CHECK(category IN ('nature','culture','food','craft')),duration_hours integer NOT NULL CHECK(duration_hours BETWEEN 1 AND 168),
 price_satang integer NOT NULL CHECK(price_satang BETWEEN 1 AND 100000000),active boolean NOT NULL DEFAULT false,version integer NOT NULL DEFAULT 1,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX trips_store ON trips(store_id);
CREATE TABLE departures(id uuid PRIMARY KEY,trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,starts_at timestamptz NOT NULL,capacity integer NOT NULL CHECK(capacity BETWEEN 1 AND 1000),used integer NOT NULL DEFAULT 0 CHECK(used>=0),active boolean NOT NULL DEFAULT true,version integer NOT NULL DEFAULT 1,CHECK(used<=capacity),UNIQUE(trip_id,starts_at));
CREATE INDEX departures_future ON departures(starts_at) WHERE active;
CREATE TABLE bookings(id uuid PRIMARY KEY,buyer_id uuid NOT NULL REFERENCES app_users(id),departure_id uuid NOT NULL REFERENCES departures(id),request_key uuid NOT NULL,request_hash text NOT NULL,status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','cancelled','rejected','completed')),seats integer NOT NULL CHECK(seats BETWEEN 1 AND 10),title text NOT NULL,meeting_point text NOT NULL,starts_at timestamptz NOT NULL,unit_price_satang integer NOT NULL CHECK(unit_price_satang>0),contact_name text NOT NULL,phone text NOT NULL,version integer NOT NULL DEFAULT 1,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(buyer_id,request_key));
CREATE INDEX bookings_buyer ON bookings(buyer_id,created_at DESC);
CREATE INDEX bookings_departure ON bookings(departure_id);
CREATE TABLE booking_history(id uuid PRIMARY KEY,booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,actor_id uuid NOT NULL REFERENCES app_users(id),status text NOT NULL,reason text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX booking_history_time ON booking_history(booking_id,created_at);
