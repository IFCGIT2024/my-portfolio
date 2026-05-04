-- =====================================================================
-- DataGuard Academy Lab -- 03_classification_seed.sql
-- Pre-populate ~15% of the data_catalog. The rest of the schema is
-- intentionally left UNCLASSIFIED so learners can find the gaps.
-- =====================================================================
SET search_path TO bank, public;

-- ── Classification rules used by the Python scanner ─────────────────
-- column_pattern is matched ILIKE against information_schema.columns.column_name
-- value_regex is matched against sampled values
INSERT INTO classification_rules (rule_name, pii_category, suggested_label, column_pattern, value_regex, base_confidence, notes) VALUES
  ('UK NINO',                'identity',  'Restricted',         '%nino%',          '^[A-CEGHJ-PR-TW-Z]{2}\d{6}[A-D]$', 0.95, 'UK National Insurance Number'),
  ('Passport number',        'identity',  'Restricted',         '%passport%',       '^\d{9}$',                          0.92, '9-digit UK passport'),
  ('Email address',          'contact',   'Internal',           '%email%',          '[^@\s]+@[^@\s]+\.[^@\s]+',         0.90, 'RFC 5322 simplified'),
  ('UK phone',               'contact',   'Internal',           '%phone%',          '^\+?44\s?7\d{9}$',                 0.85, 'UK mobile'),
  ('Date of birth',          'identity',  'Restricted',         '%dob%',            NULL,                               0.95, 'Combined with name = direct identifier'),
  ('Date of birth (long)',   'identity',  'Restricted',         '%date_of_birth%',  NULL,                               0.95, 'Combined with name = direct identifier'),
  ('Sort code',              'financial', 'Restricted',         '%sort_code%',      '^\d{2}-\d{2}-\d{2}$',              0.93, 'UK bank sort code'),
  ('Account number',         'financial', 'Restricted',         '%account_number%', '^\d{8}$',                          0.93, 'UK 8-digit account'),
  ('IBAN',                   'financial', 'Restricted',         '%iban%',           '^GB\d{2}[A-Z]{4}\d{14}$',          0.97, 'UK IBAN'),
  ('Postcode',               'contact',   'Internal',           '%postcode%',       '^[A-Z]{1,2}\d[A-Z\d]?\s\d[A-Z]{2}$',0.80,'Indirect identifier alone'),
  ('Customer name',          'identity',  'Restricted',         '%full_name%',      NULL,                               0.85, 'Direct identifier when joined'),
  ('Address line',           'contact',   'Restricted',         '%address%',        NULL,                               0.82, 'Direct identifier'),
  ('Free-text reference',    'spillage',  'Highly Restricted',  '%reference%',      NULL,                               0.40, 'Free text — needs LLM/NER content scan'),
  ('Balance',                'financial', 'Restricted',         '%balance%',        NULL,                               0.78, 'Account balances are financial PII'),
  ('Amount',                 'financial', 'Restricted',         '%amount%',         NULL,                               0.75, 'Transaction amounts are financial PII');

-- ── Pre-classified columns (the catalog is INTENTIONALLY incomplete) ─
-- Roughly 30% coverage. Customers and accounts are partially classified;
-- transactions and dsar_requests are deliberately empty so learners find them.
INSERT INTO data_catalog
  (schema_name, table_name, column_name, data_type, classification_label, pii_category, confidence_score, classified_by, classified_at, last_reviewed_at, data_owner, retention_policy_days, notes)
VALUES
  -- customers (partially classified)
  ('bank','customers','full_name',     'text',        'Restricted',        'identity',  0.95, 'human','2026-01-12','2026-04-01','farouk.ahmed@dga-bank.test', 2555, 'Direct identifier'),
  ('bank','customers','email',         'text',        'Internal',          'contact',   0.90, 'human','2026-01-12','2026-04-01','farouk.ahmed@dga-bank.test', 2555, NULL),
  ('bank','customers','date_of_birth', 'date',        'Restricted',        'identity',  0.95, 'human','2026-01-12','2026-04-01','farouk.ahmed@dga-bank.test', 2555, 'Direct identifier when combined with name'),
  ('bank','customers','nino',          'text',        'Restricted',        'identity',  0.97, 'auto', '2026-02-03','2026-04-01','farouk.ahmed@dga-bank.test', 2555, NULL),
  -- passport_number, phone, address_line1, postcode, onboarded_at — DELIBERATELY MISSING

  -- accounts (only the obvious ones)
  ('bank','accounts','sort_code',      'text',        'Restricted',        'financial', 0.93, 'auto', '2026-02-03','2026-04-01','farouk.ahmed@dga-bank.test', 2555, NULL),
  ('bank','accounts','account_number', 'text',        'Restricted',        'financial', 0.93, 'auto', '2026-02-03','2026-04-01','farouk.ahmed@dga-bank.test', 2555, NULL),
  -- iban, balance_pence — DELIBERATELY MISSING

  -- employees (a known low-confidence row for the Review exercise)
  ('bank','employees','full_name',     'text',        'Internal',          'identity',  0.62, 'auto', '2026-02-15', NULL, 'farouk.ahmed@dga-bank.test', 1825, 'LOW CONFIDENCE — review needed'),
  ('bank','employees','email',         'text',        'Internal',          'contact',   0.91, 'auto', '2026-02-15', NULL, 'farouk.ahmed@dga-bank.test', 1825, NULL),

  -- A deliberately stale label for the Exercise 1 bonus query
  -- last_reviewed_at is > 180 days ago so the stale-label query returns at least one row
  ('bank','customers','phone',         'text',        'Internal',          'contact',   0.85, 'human','2024-08-10','2024-08-10','farouk.ahmed@dga-bank.test', 2555, 'STALE -- not reviewed since 2024');

  -- transactions, dsar_requests, access_logs, audit_findings — ALL MISSING
