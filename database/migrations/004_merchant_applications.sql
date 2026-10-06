CREATE TABLE merchant_applications (
 id uuid PRIMARY KEY, applicant_id uuid NOT NULL REFERENCES app_users(id), name text NOT NULL,
 category text NOT NULL CHECK(category IN ('food','craft')), address text NOT NULL, phone text NOT NULL,
 subdistrict_id text NOT NULL REFERENCES subdistricts(id),
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','changes_requested','approved','rejected')),
 version integer NOT NULL DEFAULT 1, reason text NOT NULL DEFAULT '', store_id uuid UNIQUE REFERENCES stores(id),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK((status='approved')=(store_id IS NOT NULL)));
CREATE UNIQUE INDEX one_open_application ON merchant_applications(applicant_id) WHERE status IN ('draft','submitted','changes_requested');
CREATE INDEX applications_area_status ON merchant_applications(subdistrict_id,status);
CREATE TABLE application_history(id uuid PRIMARY KEY,application_id uuid NOT NULL REFERENCES merchant_applications(id) ON DELETE CASCADE,actor_id uuid NOT NULL REFERENCES app_users(id),event text NOT NULL,reason text NOT NULL DEFAULT '',snapshot jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX application_history_time ON application_history(application_id,created_at DESC);
