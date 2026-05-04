-- =====================================================================
-- DataGuard Academy Lab — 04_users_and_roles.sql
-- A starter set of database roles. Real banks layer this on top of
-- enterprise IAM (Active Directory / Azure AD / Okta) — the principles
-- are identical: least privilege, separation of duties, auditability.
-- =====================================================================
SET search_path TO bank, public;

-- ── Group roles (no login) — idempotent ────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='r_data_analyst')    THEN CREATE ROLE r_data_analyst    NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='r_privacy_analyst') THEN CREATE ROLE r_privacy_analyst NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='r_dspm_engineer')   THEN CREATE ROLE r_dspm_engineer   NOLOGIN; END IF;
END $$;

-- Connect privileges (they all need to reach the database)
GRANT CONNECT ON DATABASE dataguard TO r_data_analyst, r_privacy_analyst, r_dspm_engineer;
GRANT USAGE   ON SCHEMA bank        TO r_data_analyst, r_privacy_analyst, r_dspm_engineer;

-- ── Data Analyst: Internal+Public reads only, NO Restricted ─────────
-- Real platforms enforce this with row/column-level security or by
-- exposing only sanitized views. Here we use views for clarity.

CREATE OR REPLACE VIEW v_customers_internal AS
  SELECT
    customer_id,
    -- Direct identifiers stripped
    'Customer #' || customer_id::text AS pseudonym,
    -- Email kept (Internal in our catalog)
    email,
    -- Year-of-birth only (k-anonymity safer than full DOB)
    EXTRACT(YEAR FROM date_of_birth)::int AS year_of_birth,
    onboarded_at
  FROM customers;
COMMENT ON VIEW v_customers_internal IS 'Pseudonymized customer view — safe for analysts without Restricted clearance.';

GRANT SELECT ON v_customers_internal TO r_data_analyst;

-- ── Privacy Analyst: full read, no writes ──────────────────────────
GRANT SELECT ON ALL TABLES IN SCHEMA bank TO r_privacy_analyst;
ALTER DEFAULT PRIVILEGES IN SCHEMA bank GRANT SELECT ON TABLES TO r_privacy_analyst;
-- DSAR fulfillment requires writes to dsar_requests
GRANT UPDATE (status, fulfilled_at, notes) ON dsar_requests TO r_privacy_analyst;

-- ── DSPM Engineer: read everything, write to catalog + findings ─────
GRANT SELECT ON ALL TABLES IN SCHEMA bank TO r_dspm_engineer;
ALTER DEFAULT PRIVILEGES IN SCHEMA bank GRANT SELECT ON TABLES TO r_dspm_engineer;
GRANT INSERT, UPDATE, DELETE ON data_catalog, audit_findings, classification_rules TO r_dspm_engineer;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA bank TO r_dspm_engineer;

-- ── Login users (passwords are LAB ONLY — never reuse) ──────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='analyst_chloe') THEN
    CREATE USER analyst_chloe WITH PASSWORD 'lab_chloe_2026' IN ROLE r_data_analyst;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='privacy_chloe') THEN
    CREATE USER privacy_chloe WITH PASSWORD 'lab_privacy_2026' IN ROLE r_privacy_analyst;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='dspm_aisha') THEN
    CREATE USER dspm_aisha   WITH PASSWORD 'lab_dspm_2026'    IN ROLE r_dspm_engineer;
  END IF;
END $$;

-- ── Verification queries (uncomment to run manually) ────────────────
-- SET ROLE analyst_chloe;
-- SELECT * FROM bank.customers LIMIT 1;        -- should ERROR: permission denied
-- SELECT * FROM bank.v_customers_internal LIMIT 1;  -- should succeed
-- RESET ROLE;
