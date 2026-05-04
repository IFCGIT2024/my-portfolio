-- =====================================================================
-- DataGuard Academy Lab — 01_schema.sql
-- A simplified but realistic schema for a UK retail bank.
-- All names of columns deliberately mirror what a real classifier would scan.
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS bank;
SET search_path TO bank, public;

-- ── Customers (the highest-value PII the bank holds) ─────────────────
CREATE TABLE customers (
    customer_id      BIGSERIAL PRIMARY KEY,
    full_name        TEXT        NOT NULL,
    email            TEXT        NOT NULL,
    phone            TEXT,
    date_of_birth    DATE        NOT NULL,
    nino             TEXT,            -- UK National Insurance Number — Restricted
    passport_number  TEXT,            -- Restricted
    address_line1    TEXT,
    postcode         TEXT,
    onboarded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Accounts ─────────────────────────────────────────────────────────
CREATE TABLE accounts (
    account_id      BIGSERIAL PRIMARY KEY,
    customer_id     BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    account_type    TEXT   NOT NULL CHECK (account_type IN ('current','savings','isa','loan','mortgage')),
    sort_code       TEXT   NOT NULL,   -- 6 digits — Restricted
    account_number  TEXT   NOT NULL,   -- 8 digits — Restricted
    iban            TEXT,              -- Restricted
    balance_pence   BIGINT NOT NULL DEFAULT 0,
    opened_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at       TIMESTAMPTZ
);

-- ── Transactions ─────────────────────────────────────────────────────
CREATE TABLE transactions (
    txn_id          BIGSERIAL PRIMARY KEY,
    account_id      BIGINT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
    posted_at       TIMESTAMPTZ NOT NULL,
    amount_pence    BIGINT NOT NULL,
    txn_type        TEXT   NOT NULL CHECK (txn_type IN ('debit','credit','fee','interest')),
    counterparty    TEXT,
    reference       TEXT,              -- free-text: a common spillage point for PII
    channel         TEXT   NOT NULL CHECK (channel IN ('atm','online','mobile','branch','direct_debit'))
);

CREATE INDEX idx_txn_account_posted ON transactions(account_id, posted_at);

-- ── Employees (bank staff) ───────────────────────────────────────────
CREATE TABLE employees (
    employee_id     BIGSERIAL PRIMARY KEY,
    full_name       TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    department      TEXT NOT NULL CHECK (department IN ('Retail','Compliance','DSPM','Privacy','Engineering')),
    role_title      TEXT NOT NULL,
    started_at      DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- ── Access logs (the audit trail) ────────────────────────────────────
CREATE TABLE access_logs (
    log_id          BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    table_accessed  TEXT NOT NULL,            -- "bank.customers" etc.
    operation       TEXT NOT NULL CHECK (operation IN ('SELECT','INSERT','UPDATE','DELETE')),
    rows_returned   INTEGER NOT NULL DEFAULT 0,
    accessed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    source_ip       INET,
    session_id      UUID
);

CREATE INDEX idx_access_emp_time ON access_logs(employee_id, accessed_at);
CREATE INDEX idx_access_table_time ON access_logs(table_accessed, accessed_at);

-- ── Data catalog (the classification register) ───────────────────────
-- One row per (schema, table, column). Intentionally only ~15% populated
-- so learners can find the gaps.
CREATE TABLE data_catalog (
    catalog_id            BIGSERIAL PRIMARY KEY,
    schema_name           TEXT NOT NULL,
    table_name            TEXT NOT NULL,
    column_name           TEXT NOT NULL,
    data_type             TEXT,
    classification_label  TEXT CHECK (classification_label IN ('Public','Internal','Restricted','Highly Restricted')),
    pii_category          TEXT,                  -- e.g. 'identity','contact','financial','health'
    confidence_score      NUMERIC(4,3),          -- 0.000–1.000
    classified_by         TEXT CHECK (classified_by IN ('auto','human','imported')),
    classified_at         TIMESTAMPTZ,
    last_reviewed_at      TIMESTAMPTZ,
    data_owner            TEXT,                  -- email of the accountable employee
    retention_policy_days INTEGER,
    notes                 TEXT,
    UNIQUE (schema_name, table_name, column_name)
);

CREATE INDEX idx_catalog_label ON data_catalog(classification_label);
CREATE INDEX idx_catalog_confidence ON data_catalog(confidence_score);

-- ── Classification rules (what the scanner uses) ────────────────────
CREATE TABLE classification_rules (
    rule_id               BIGSERIAL PRIMARY KEY,
    rule_name             TEXT NOT NULL UNIQUE,
    pii_category          TEXT NOT NULL,
    suggested_label       TEXT NOT NULL,
    column_pattern        TEXT,                  -- ILIKE pattern matched against column_name
    value_regex           TEXT,                  -- Python regex matched against sample values
    base_confidence       NUMERIC(4,3) NOT NULL,
    enabled               BOOLEAN NOT NULL DEFAULT TRUE,
    notes                 TEXT
);

-- ── DSAR (GDPR Article 15) requests ─────────────────────────────────
CREATE TABLE dsar_requests (
    request_id      BIGSERIAL PRIMARY KEY,
    customer_id     BIGINT REFERENCES customers(customer_id) ON DELETE SET NULL,
    received_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    deadline_at     TIMESTAMPTZ NOT NULL,        -- received_at + 30 days
    status          TEXT NOT NULL CHECK (status IN ('open','in_progress','fulfilled','rejected')),
    fulfilled_at    TIMESTAMPTZ,
    handler_email   TEXT,
    notes           TEXT
);

-- ── Audit findings (the scanner writes here) ────────────────────────
CREATE TABLE audit_findings (
    finding_id      BIGSERIAL PRIMARY KEY,
    detected_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    severity        TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
    category        TEXT NOT NULL,               -- e.g. 'unclassified_pii','low_confidence','access_anomaly'
    schema_name     TEXT,
    table_name      TEXT,
    column_name     TEXT,
    employee_id     BIGINT REFERENCES employees(employee_id),
    summary         TEXT NOT NULL,
    evidence        JSONB
);

CREATE INDEX idx_findings_severity ON audit_findings(severity, detected_at);
