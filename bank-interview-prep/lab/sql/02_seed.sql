-- =====================================================================
-- DataGuard Academy Lab — 02_seed.sql
-- Deterministic synthetic data. setseed() makes runs reproducible so
-- exercise solutions stay valid.
-- =====================================================================
SET search_path TO bank, public;
SELECT setseed(0.42);  -- deterministic randomness

-- ── Employees ───────────────────────────────────────────────────────
INSERT INTO employees (full_name, email, department, role_title) VALUES
  ('Aisha Khan',      'aisha.khan@dga-bank.test',      'DSPM',       'DSPM Engineer'),
  ('Ben Carter',      'ben.carter@dga-bank.test',      'DSPM',       'Senior DSPM Engineer'),
  ('Chloe Nguyen',    'chloe.nguyen@dga-bank.test',    'Privacy',    'Data Privacy Analyst'),
  ('Daniel O''Brien', 'daniel.obrien@dga-bank.test',   'Privacy',    'Senior Privacy Analyst'),
  ('Elena Petrova',   'elena.petrova@dga-bank.test',   'Compliance', 'Compliance Officer'),
  ('Farouk Ahmed',    'farouk.ahmed@dga-bank.test',    'Compliance', 'Data Protection Lead'),
  ('Grace Williams',  'grace.williams@dga-bank.test',  'Engineering','Database Engineer'),
  ('Hiro Tanaka',     'hiro.tanaka@dga-bank.test',     'Engineering','Platform Engineer'),
  ('Isla Rossi',      'isla.rossi@dga-bank.test',      'Retail',     'Branch Manager'),
  ('Jamal Lewis',     'jamal.lewis@dga-bank.test',     'Retail',     'Customer Service Agent');

-- Pad to 60 employees with deterministic synthetic names
INSERT INTO employees (full_name, email, department, role_title)
SELECT
  'Synthetic Staff ' || g,
  'staff' || g || '@dga-bank.test',
  (ARRAY['Retail','Retail','Retail','Compliance','DSPM','Privacy','Engineering'])[1 + (g % 7)],
  (ARRAY['Customer Service Agent','Branch Officer','Junior Analyst','Engineer','Analyst'])[1 + (g % 5)]
FROM generate_series(1, 50) AS g;

-- ── Customers ───────────────────────────────────────────────────────
WITH first_names AS (
  SELECT unnest(ARRAY['Olivia','Liam','Emma','Noah','Ava','Oliver','Sophia','Elijah','Isabella','Lucas',
                      'Mia','Mason','Charlotte','Logan','Amelia','Ethan','Harper','James','Evelyn','Aiden',
                      'Aanya','Rohan','Priya','Arjun','Kai','Nia','Yusuf','Zara','Idris','Leila']) AS fn
), last_names AS (
  SELECT unnest(ARRAY['Smith','Jones','Williams','Brown','Taylor','Davies','Wilson','Evans','Thomas','Roberts',
                      'Khan','Patel','Singh','Kumar','Ahmed','Hussain','Begum','Ali','Iqbal','Sharma',
                      'Murphy','O''Connor','Walsh','Kelly','Byrne','Ryan','Doyle','McCarthy']) AS ln
), name_grid AS (
  SELECT fn, ln, ROW_NUMBER() OVER () AS rn
  FROM first_names CROSS JOIN last_names
)
INSERT INTO customers (full_name, email, phone, date_of_birth, nino, passport_number, address_line1, postcode, onboarded_at)
SELECT
  fn || ' ' || ln,
  lower(fn || '.' || replace(ln,'''','')) || g || '@example.test',
  '+44 7' || lpad((random()*999999999)::bigint::text, 9, '0'),
  DATE '1955-01-01' + (random() * 22000)::int,
  -- UK NINO format: 2 letters + 6 digits + 1 letter (synthetic, never collides with real ranges)
  chr(65 + (random()*5)::int) || chr(65 + (random()*5)::int)
    || lpad((random()*999999)::int::text, 6, '0')
    || chr(65 + (random()*4)::int),
  -- Synthetic 9-digit passport
  lpad((random()*899999999 + 100000000)::bigint::text, 9, '0'),
  ((random()*200)::int)::text || ' ' || (ARRAY['High St','Station Rd','Main St','Park Lane','Mill Rd'])[1 + (random()*4)::int],
  (ARRAY['SW1A','EC1A','M1','B1','LS1','EH1','BS1','NE1','CF10','BT1'])[1 + (random()*9)::int]
    || ' ' || (random()*9)::int || chr(65 + (random()*25)::int) || chr(65 + (random()*25)::int),
  now() - (random() * interval '5 years')
FROM name_grid CROSS JOIN generate_series(1,2) AS g
LIMIT 500;

-- ── Accounts (~2.4 per customer) ────────────────────────────────────
INSERT INTO accounts (customer_id, account_type, sort_code, account_number, iban, balance_pence, opened_at)
SELECT
  c.customer_id,
  (ARRAY['current','savings','isa','loan','mortgage'])[1 + (random()*4)::int],
  lpad((random()*99)::int::text,2,'0') || '-' ||
    lpad((random()*99)::int::text,2,'0') || '-' ||
    lpad((random()*99)::int::text,2,'0'),
  lpad((random()*99999999)::bigint::text, 8, '0'),
  'GB' || lpad((random()*99)::int::text,2,'0') || 'DGAB' ||
    lpad((random()*999999)::int::text,6,'0') ||
    lpad((random()*99999999)::bigint::text,8,'0'),
  ((random() * 5000000)::bigint - 100000),
  c.onboarded_at + (random() * interval '30 days')
FROM customers c
CROSS JOIN generate_series(1, 3) g
WHERE random() < 0.8;

-- ── Transactions (~25k) ─────────────────────────────────────────────
INSERT INTO transactions (account_id, posted_at, amount_pence, txn_type, counterparty, reference, channel)
SELECT
  a.account_id,
  now() - (random() * interval '365 days'),
  ((random() * 200000)::bigint - 50000),
  (ARRAY['debit','credit','fee','interest'])[1 + (random()*3)::int],
  (ARRAY['Tesco','Sainsbury''s','Amazon','Salary - DGA Corp','TFL','British Gas','Council Tax','Netflix'])[1 + (random()*7)::int],
  -- Reference field — sometimes contains accidental PII (a real-world spillage pattern)
  CASE WHEN random() < 0.05
       THEN 'For ' || c.full_name || ' DOB ' || c.date_of_birth
       ELSE 'Ref ' || lpad((random()*999999)::int::text,6,'0')
  END,
  (ARRAY['atm','online','mobile','branch','direct_debit'])[1 + (random()*4)::int]
FROM accounts a
JOIN customers c ON c.customer_id = a.customer_id
CROSS JOIN generate_series(1, 25) g
WHERE random() < 0.85
LIMIT 25000;

-- ── Access logs ─────────────────────────────────────────────────────
INSERT INTO access_logs (employee_id, table_accessed, operation, rows_returned, accessed_at, source_ip, session_id)
SELECT
  e.employee_id,
  (ARRAY['bank.customers','bank.accounts','bank.transactions','bank.dsar_requests','bank.employees'])[1 + (random()*4)::int],
  (ARRAY['SELECT','SELECT','SELECT','SELECT','UPDATE','INSERT'])[1 + (random()*5)::int],
  (random() * 5000)::int,
  now() - (random() * interval '90 days'),
  ('10.0.' || (random()*255)::int || '.' || (random()*255)::int)::inet,
  gen_random_uuid()
FROM employees e CROSS JOIN generate_series(1, 150) g
WHERE random() < 0.9;

-- Inject a deliberate access anomaly: one Retail employee hammers customers table
INSERT INTO access_logs (employee_id, table_accessed, operation, rows_returned, accessed_at, source_ip)
SELECT
  (SELECT employee_id FROM employees WHERE email='jamal.lewis@dga-bank.test'),
  'bank.customers', 'SELECT', (random()*4000)::int + 1000,
  now() - (random() * interval '7 days'),
  '10.0.99.99'::inet
FROM generate_series(1, 250);

-- ── DSAR requests (some open, some fulfilled) ──────────────────────
-- ── DSAR requests ───────────────────────────────────────────────────
-- Customer 42 ALWAYS has an open DSAR (Exercise 5 references this id).
INSERT INTO dsar_requests (customer_id, received_at, deadline_at, status, fulfilled_at, handler_email, notes)
VALUES
  (42, now() - interval '28 days', now() + interval '2 days', 'open',        NULL,                       'chloe.nguyen@dga-bank.test', 'GDPR Art. 15 access request — Exercise 5 target'),
  (17, now() - interval '40 days', now() - interval '10 days','fulfilled',  now() - interval '15 days',  'chloe.nguyen@dga-bank.test', 'Closed: full export delivered'),
  (88, now() - interval '20 days', now() + interval '10 days','in_progress',NULL,                       'daniel.obrien@dga-bank.test',NULL),
  (256, now() - interval '55 days',now() - interval '25 days','fulfilled',  now() - interval '30 days', 'chloe.nguyen@dga-bank.test', NULL),
  (333, now() - interval '12 days',now() + interval '18 days','open',        NULL,                       'chloe.nguyen@dga-bank.test', NULL),
  (401, now() - interval '50 days',now() - interval '20 days','fulfilled',  now() - interval '22 days', 'daniel.obrien@dga-bank.test',NULL),
  (12,  now() - interval '8 days', now() + interval '22 days','in_progress',NULL,                       'chloe.nguyen@dga-bank.test', NULL),
  (199, now() - interval '60 days',now() - interval '30 days','rejected',   NULL,                       'farouk.ahmed@dga-bank.test', 'Identity could not be verified'),
  (62,  now() - interval '35 days',now() - interval '5 days', 'fulfilled',  now() - interval '7 days',  'chloe.nguyen@dga-bank.test', NULL),
  (148, now() - interval '15 days',now() + interval '15 days','open',        NULL,                       'daniel.obrien@dga-bank.test',NULL),
  (220, now() - interval '45 days',now() - interval '15 days','fulfilled',  now() - interval '18 days', 'chloe.nguyen@dga-bank.test', NULL),
  (305, now() - interval '5 days', now() + interval '25 days','open',        NULL,                       'chloe.nguyen@dga-bank.test', NULL);

-- Make sure pg_stat_user_tables.n_live_tup and pg_class.reltuples are populated
-- so Exercise 1's est_row_count column returns sensible numbers immediately.
ANALYZE bank.customers;
ANALYZE bank.accounts;
ANALYZE bank.transactions;
ANALYZE bank.access_logs;
ANALYZE bank.employees;
ANALYZE bank.dsar_requests;
