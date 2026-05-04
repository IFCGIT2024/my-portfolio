// =====================================================
// Lab Module: Hands-On Postgres Lab
// =====================================================
window.MODULES.lab = () => {
  const grp = 'lab_t';

  // ---- Pre-build all code blocks to avoid nested template-literal conflicts ----

  const cb_docker_start = _cb('bash',
`# Open a VS Code terminal (Terminal → New Terminal).
# It opens automatically in the lab/ folder since that is what you opened in VS Code.
# Run these two commands:

# Windows PowerShell:
copy .env.example .env

# macOS / Linux / Git Bash on Windows:
# cp .env.example .env

docker compose up -d

# Docker downloads Postgres automatically (1-2 min on first run).
# When it returns to the prompt, wait 10 seconds then run:
docker compose exec db psql -U dga -d dataguard -c "\\dt bank.*"

# You should see a list of tables: customers, accounts, transactions, etc.
# That means the database is running and fully loaded with data.`);

  const cb_adminer_login = _cb('text',
`Open your browser and go to:  http://localhost:8080

Fill in exactly:
  System:   PostgreSQL
  Server:   db
  Username: dga
  Password: dga
  Database: dataguard

Click Login.
You should see the table list on the left: customers, accounts, transactions, etc.`);

  const cb_step4_python = _cb('bash',
`# In the VS Code terminal — navigate into the python folder first:
cd python

# Create an isolated Python environment (do this once):
python -m venv .venv

# Activate it:
source .venv/bin/activate          # macOS / Linux
# .venv\\Scripts\\Activate.ps1     # Windows PowerShell (use this line instead on Windows)

# Install the required libraries (do this once):
pip install -r requirements.txt

# Verify the connection to the database:
python 01_smoke_test.py
# Expected: Connected to dataguard as dga`);

  const cb_quickstart = _cb('bash',
`# Run from the lab/ folder (where you opened VS Code):

# Windows PowerShell:
copy .env.example .env
# macOS / Linux / Git Bash:
# cp .env.example .env

docker compose up -d
# wait 10 seconds, then verify:
docker compose exec db psql -U dga -d dataguard -c "\\dt bank.*"
# open http://localhost:8080 in browser to use Adminer

# Python setup (Exercises 3 and 4 only) — run from the python/ sub-folder:
cd python
python -m venv .venv
source .venv/bin/activate    # macOS / Linux / Git Bash
# .venv\\Scripts\\Activate.ps1  # Windows PowerShell
pip install -r requirements.txt
python 01_smoke_test.py`);

  const cb_python_setup = _cb('bash',
`# Scripts run in order as each exercise requires them:
python 01_smoke_test.py           # verify DB connection
python 02_pii_scanner.py          # Ex 3: scan columns, write to bank.audit_findings
python 03_classifier_simulator.py # Ex 4A: auto-label high-confidence findings
python 04_label_review.py         # Ex 4B: interactive human review queue
python 05_audit_report.py         # Ex 4C/E: coverage + anomaly report`);

  const cb_ex1_connect = _cb('text',
`1. Open your browser and go to:  http://localhost:8080
   (If you see "This site can't be reached", Docker is not running — open Docker Desktop first.)

2. You will see an Adminer login form with five fields. Fill them in exactly:
     System:   PostgreSQL          ← select from the dropdown
     Server:   db                  ← type this exactly, not "localhost"
     Username: dga
     Password: dga
     Database: dataguard
   Then click the Login button.

3. After logging in, you will see a dark sidebar on the left listing tables.
   If the sidebar is empty, the database is still loading — wait 30 seconds and refresh.

4. To run a SQL query:
   a. Click "SQL command" in the top navigation bar (second item in the grey menu).
   b. A large text area appears. Paste your query into it.
   c. Click the "Execute" button (bottom-left of the text area), or press Ctrl+Enter.
   d. Results appear in a table below the editor.`);

  const cb_ex2_verify = _cb('sql',
`-- In Adminer SQL command editor, run these to test the role:
SET ROLE branch_demo;
SELECT * FROM bank.customers LIMIT 1;               -- expect: ERROR permission denied
SELECT * FROM bank.v_branch_customer_summary LIMIT 3; -- expect: success
RESET ROLE;`);

  const cb_ex3_run = _cb('bash',
`# In VS Code terminal, from the lab/python/ folder:
# (complete Setup tab Step 5 first if you have not done so)

python 01_smoke_test.py             # confirms DB connection is working
python 02_pii_scanner.py            # scans every column, writes findings to bank.audit_findings
python 03_classifier_simulator.py   # auto-labels high-confidence findings`);

  const sql_ex3_inspect =
`-- What did the scanner find, grouped by severity?
SELECT severity, count(*)
FROM bank.audit_findings
WHERE category = 'pii_candidate'
GROUP BY severity;

-- Top candidates by confidence score
SELECT table_name, column_name,
       evidence->>'rule'       AS rule,
       evidence->>'confidence' AS confidence
FROM bank.audit_findings
WHERE category = 'pii_candidate'
ORDER BY (evidence->>'confidence')::numeric DESC
LIMIT 20;`;
  const cb_ex3_inspect = _cb('sql', sql_ex3_inspect);

  const cb_ex3_tune = _cb('sql',
`UPDATE bank.classification_rules
SET suggested_label = 'Public',
    column_pattern  = '%marketing_email%',
    notes           = 'Public marketing distribution lists only.'
WHERE rule_name = 'Email address';

-- Then re-run the scanner and compare findings`);

  const cb_ex4_phase_a = _cb('bash',
`python 02_pii_scanner.py
python 03_classifier_simulator.py`);

  const cb_ex4_check = _cb('sql',
`-- Confirm labels written
SELECT classified_by, count(*) FROM bank.data_catalog GROUP BY classified_by;`);

  const cb_ex4_review = _cb('bash', `python 04_label_review.py`);

  const cb_ex4_report = _cb('bash',
`python 05_audit_report.py
# The report prints directly to the terminal — first table is the coverage matrix`);

  const cb_ex4_insert = _cb('sql',
`INSERT INTO bank.data_catalog
  (schema_name, table_name, column_name, classification_label, pii_category,
   confidence_score, classified_by, classified_at, last_reviewed_at, data_owner)
VALUES
  ('bank','transactions','txn_id',       'Internal',          'identifier', 1.0,'human',now(),now(),'farouk.ahmed@dga-bank.test'),
  ('bank','transactions','account_id',   'Restricted',        'financial',  1.0,'human',now(),now(),'farouk.ahmed@dga-bank.test'),
  ('bank','transactions','posted_at',    'Internal',          'metadata',   1.0,'human',now(),now(),'farouk.ahmed@dga-bank.test'),
  ('bank','transactions','amount_pence', 'Restricted',        'financial',  1.0,'human',now(),now(),'farouk.ahmed@dga-bank.test'),
  ('bank','transactions','txn_type',     'Internal',          'metadata',   1.0,'human',now(),now(),'farouk.ahmed@dga-bank.test'),
  ('bank','transactions','counterparty', 'Restricted',        'identity',   1.0,'human',now(),now(),'farouk.ahmed@dga-bank.test'),
  ('bank','transactions','reference',    'Highly Restricted', 'spillage',   1.0,'human',now(),now(),'farouk.ahmed@dga-bank.test'),
  ('bank','transactions','channel',      'Internal',          'metadata',   1.0,'human',now(),now(),'farouk.ahmed@dga-bank.test');`);

  const cb_ex4_rerun = _cb('bash', `python 05_audit_report.py`);

  const cb_ex5_discover = _cb('sql',
`-- Tables with customer PII columns
SELECT DISTINCT schema_name, table_name
FROM bank.data_catalog
WHERE pii_category IN ('identity','contact','financial')
ORDER BY table_name;`);

  const cb_ex5_export = _cb('sql',
`SELECT jsonb_build_object(
  'customer',     to_jsonb(c.*),
  'accounts',     (SELECT jsonb_agg(a)
                   FROM bank.accounts a
                   WHERE a.customer_id = c.customer_id),
  'transactions', (SELECT jsonb_agg(t)
                   FROM bank.transactions t
                   WHERE t.account_id IN
                     (SELECT account_id FROM bank.accounts
                      WHERE customer_id = c.customer_id)),
  'dsar_history', (SELECT jsonb_agg(d)
                   FROM bank.dsar_requests d
                   WHERE d.customer_id = c.customer_id),
  'access_audit', (SELECT jsonb_agg(l)
                   FROM bank.access_logs l
                   WHERE l.user_id = c.customer_id::text)
) AS dsar_export
FROM bank.customers c
WHERE c.customer_id = 42;`);

  const cb_ex5_fulfill = _cb('sql',
`UPDATE bank.dsar_requests
SET status        = 'fulfilled',
    fulfilled_at  = now(),
    handler_email = 'chloe.nguyen@dga-bank.test',
    notes         = 'Full record export delivered via secure portal.'
WHERE customer_id = 42 AND status IN ('open','in_progress');`);

  const cb_ex5_audit = _cb('sql',
`-- In production, every query emits a row here via pg_stat_statements + trigger
SELECT * FROM bank.access_logs ORDER BY accessed_at DESC LIMIT 5;`);

  // ---- Scaffolded query blocks for exercises ----

  const cb_ex1_step1 = _cb('sql',
`-- See every column in the bank schema
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'bank'
ORDER BY table_name, ordinal_position;
-- Expected: ~60 rows covering customers, accounts, transactions, etc.`);

  const cb_ex1_step2 = _cb('sql',
`-- Filter for columns whose names suggest PII
-- ILIKE is case-insensitive pattern matching
-- ANY(ARRAY[...]) tests multiple patterns in one clause
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'bank'
  AND column_name ILIKE ANY(ARRAY[
    '%name%', '%email%', '%phone%', '%address%', '%postcode%',
    '%dob%',  '%birth%', '%nino%',  '%passport%', '%iban%',
    '%account%', '%sort%'
  ])
ORDER BY table_name, column_name;
-- Expected: ~15-20 rows -- the columns that look like personal data`);

  const cb_ex1_full = _cb('sql',
`-- The complete query: PII-shaped columns with NO entry in data_catalog
SELECT
  c.table_name,
  c.column_name,
  c.data_type,
  COALESCE(s.n_live_tup, 0) AS est_row_count
FROM information_schema.columns c
JOIN information_schema.tables t
  ON  t.table_schema = c.table_schema
  AND t.table_name   = c.table_name
LEFT JOIN bank.data_catalog dc
  ON  dc.table_name  = c.table_name
  AND dc.column_name = c.column_name
LEFT JOIN pg_stat_user_tables s
  ON s.relname = c.table_name
WHERE c.table_schema = 'bank'
  AND t.table_type   = 'BASE TABLE'
  AND c.column_name  ILIKE ANY(ARRAY[
    '%name%', '%email%', '%phone%', '%address%', '%postcode%',
    '%dob%',  '%birth%', '%nino%',  '%passport%', '%iban%',
    '%account%', '%sort%'
  ])
  AND dc.column_name IS NULL    -- LEFT JOIN found no match = unclassified
ORDER BY est_row_count DESC;    -- highest row count first = highest risk first`);

  const cb_ex1_stale = _cb('sql',
`-- Bonus: labels that exist but have not been reviewed in 180+ days
SELECT
  table_name,
  column_name,
  classification_label,
  last_reviewed_at,
  NOW() - last_reviewed_at  AS age
FROM bank.data_catalog
WHERE last_reviewed_at < NOW() - INTERVAL '180 days'
ORDER BY last_reviewed_at ASC;
-- Stale labels are a real compliance risk: schema changes may have made them wrong.`);

  const cb_ex2_view = _cb('sql',
`-- Step 1: create the view -- the only object branch staff will ever query
-- Deliberately omits: full_name, nino, passport_number, sort_code, address_line1
CREATE OR REPLACE VIEW bank.v_branch_customer_summary AS
SELECT
  c.customer_id,
  'Customer #' || c.customer_id           AS pseudonym,
  c.email,
  EXTRACT(YEAR FROM c.date_of_birth)::int AS year_of_birth,
  COUNT(a.account_id)                     AS n_accounts,
  ROUND(SUM(a.balance_pence) / 100.0, 2) AS total_balance_pounds
FROM bank.customers c
LEFT JOIN bank.accounts a ON a.customer_id = c.customer_id
GROUP BY c.customer_id, c.email, c.date_of_birth;

-- Verify before applying access controls:
SELECT * FROM bank.v_branch_customer_summary LIMIT 5;`);

  const cb_ex2_role = _cb('sql',
`-- Step 2: create the role (NOLOGIN = a permission container, not a login account)
CREATE ROLE r_branch_staff NOLOGIN;

-- Step 3: grant exactly what is needed -- nothing more
GRANT CONNECT ON DATABASE dataguard              TO r_branch_staff;
GRANT USAGE   ON SCHEMA   bank                  TO r_branch_staff;
GRANT SELECT  ON bank.v_branch_customer_summary TO r_branch_staff;
-- We grant SELECT on the VIEW only -- not on any base table

-- Step 4: create a real login user and assign to the role
CREATE USER branch_demo WITH PASSWORD 'BranchDemo2024!';
GRANT r_branch_staff TO branch_demo;`);

  const cb_ex3_count = _cb('sql',
`-- Total findings the scanner produced
SELECT COUNT(*) AS total_findings FROM bank.audit_findings;

-- Break down by table
SELECT table_name, COUNT(*) AS findings
FROM bank.audit_findings
GROUP BY table_name
ORDER BY findings DESC;`);

  const cb_ex3_disagree = _cb('sql',
`-- Where the scanner's evidence conflicts with the existing catalog label
-- These are your highest-priority review items
SELECT
  af.table_name,
  af.column_name,
  dc.classification_label AS catalog_label,
  af.evidence->>'rule'    AS scanner_rule,
  af.severity             AS scanner_severity
FROM bank.audit_findings af
JOIN bank.data_catalog dc
  ON  dc.table_name  = af.table_name
  AND dc.column_name = af.column_name
WHERE af.severity IN ('high','critical')
ORDER BY af.table_name, af.column_name;`);

  const cb_ex5_check_req = _cb('sql',
`-- Read the actual DSAR request record first
SELECT
  request_id,
  customer_id,
  submitted_at,
  NOW() - submitted_at   AS age,
  status,
  handler_email
FROM bank.dsar_requests
WHERE customer_id = 42;
-- Check the 'age' column. Legal deadline = submitted_at + 30 days.`);

  const cb_ex5_verify_data = _cb('sql',
`-- Count how many records the bank holds per table for customer 42
-- Every row here is personal data you must include in the export
SELECT 'customers'    AS source, COUNT(*) AS records
  FROM bank.customers       WHERE customer_id = 42
UNION ALL
SELECT 'accounts',              COUNT(*)
  FROM bank.accounts        WHERE customer_id = 42
UNION ALL
SELECT 'transactions',          COUNT(*)
  FROM bank.transactions
  WHERE account_id IN (SELECT account_id FROM bank.accounts WHERE customer_id = 42)
UNION ALL
SELECT 'dsar_requests',         COUNT(*)
  FROM bank.dsar_requests   WHERE customer_id = 42
UNION ALL
SELECT 'access_logs',           COUNT(*)
  FROM bank.access_logs     WHERE user_id = '42';`);

  // ---- Tab content ----

  const overview = `
<h2>&#127919; What You Will Build</h2>
<p>A complete simulation of the data classification workflow at a mid-sized UK bank. You connect to a real Postgres database, run real Python scripts, and produce the same artefacts a Privacy Analyst or DSPM Engineer produces daily — not a toy demo, but the actual workflow.</p>

${_cards([
  {
    icon: '&#128269;',
    title: 'Exercise 1 — Find Unclassified PII',
    body: '<em>SQL &middot; 25 min</em><br>Write the query your team runs every Monday morning to surface every PII-shaped column with no classification label.'
  },
  {
    icon: '&#128274;',
    title: 'Exercise 2 — Least-Privilege Role',
    body: '<em>SQL &middot; 30 min</em><br>Create a Postgres role giving branch staff limited customer visibility while blocking every Restricted column.'
  },
  {
    icon: '&#128300;',
    title: 'Exercise 3 — Run &amp; Tune the PII Scanner',
    body: '<em>Python &middot; 30 min</em><br>Run the Python scanner, inspect its findings table, and tune a regex rule. Learn why rule changes are dangerous at scale.'
  },
  {
    icon: '&#128203;',
    title: 'Exercise 4 — End-to-End Label Workflow',
    body: '<em>Python + SQL &middot; 45 min</em><br>Walk the full auto &#8594; human-review &#8594; publish &#8594; audit cycle. Accept, override, and reject proposals from the review queue.'
  },
  {
    icon: '&#128195;',
    title: 'Exercise 5 — Fulfill a DSAR',
    body: '<em>SQL &middot; 30 min</em><br>Fulfill a GDPR Article 15 Data Subject Access Request for customer #42. Extract a complete JSON export and close the request within the statutory deadline.'
  }
])}

<h2>&#127963; How This Maps to a Real Bank Stack</h2>
${_table(
  ['Lab Component', 'Production Analogue'],
  [
    ['Postgres <code>dataguard</code> DB', 'Oracle/SQL Server warehouses + Snowflake/Databricks lakes'],
    ['<code>data_catalog</code> table', 'Microsoft Purview, Collibra, 1touch.io Kontxtual&trade; catalog'],
    ['<code>classification_rules</code> (regex + context)', 'Pattern packs in 1touch.io, AWS Macie, Presidio, BigID'],
    ['<code>02_pii_scanner.py</code>', 'Auto-labeling engine in 1touch.io / Purview'],
    ['<code>04_label_review.py</code>', 'Human-in-the-loop console used by Privacy Analysts daily'],
    ['<code>access_logs</code> + <code>05_audit_report.py</code>', 'CloudTrail + Splunk/Sentinel feeding a SOC dashboard'],
    ['<code>dsar_requests</code> table', 'OneTrust / TrustArc privacy operations platforms']
  ]
)}

${_callout('info', '&#127881; Deterministic Seed', 'All data is generated from a fixed seed. To reset to a clean state at any time: run <code>docker compose down -v</code> then <code>docker compose up -d</code> from the lab/ folder. Customer IDs, DSAR targets, row counts, and query answers are identical every time.')}
`;

  const setup = `

<div style="background:var(--navy-mid);border:2px solid var(--accent);border-radius:12px;padding:24px 28px;margin-bottom:32px;display:flex;flex-direction:column;gap:16px">
  <div style="font-size:1.1rem;font-weight:700;color:#fff">&#128230; Step 1 &mdash; Download the lab files</div>
  <p style="margin:0;color:#b8cce0">Everything you need &mdash; SQL scripts, Python scripts, Docker config &mdash; is in a single ZIP file. Click below. No account or sign-up required.</p>
  <a href="https://github.com/IFCGIT2024/my-portfolio/archive/refs/heads/main.zip"
     target="_blank" rel="noopener"
     style="display:inline-flex;align-items:center;gap:10px;background:var(--accent);color:#0a1628;font-weight:700;font-size:1rem;padding:13px 28px;border-radius:8px;text-decoration:none;width:fit-content">
    &#11015; Download Lab Files (ZIP)
  </a>
  <p style="margin:0;font-size:0.82rem;color:var(--text-muted)">After extracting, open the <code>lab/</code> folder in VS Code &mdash; instructions below.</p>
</div>

<h2>What you need to install (one-time)</h2>

${_table(
  ['Tool', 'What it is', 'Why you need it', 'Download'],
  [
    ['<strong>Docker Desktop</strong>', 'A program that runs self-contained software environments called containers', 'Starts the Postgres database for you automatically with one command. You do not need to know anything about databases to use it.', '<a href="https://www.docker.com/products/docker-desktop/" target="_blank" rel="noopener">docker.com &rarr; Docker Desktop</a>'],
    ['<strong>VS Code</strong>', 'A free code editor', 'Where you will open the lab folder, run terminal commands, and write your scripts', '<a href="https://code.visualstudio.com" target="_blank" rel="noopener">code.visualstudio.com</a>'],
    ['<strong>Python 3.11+</strong>', 'A programming language', 'Runs the PII scanner and labeling scripts in Exercises 3 and 4 only', '<a href="https://www.python.org/downloads/" target="_blank" rel="noopener">python.org/downloads</a>']
  ]
)}

<h2>How to install Docker Desktop</h2>
<ol>
  <li>Go to <a href="https://www.docker.com/products/docker-desktop/" target="_blank" rel="noopener">docker.com &rarr; Docker Desktop</a> and click <strong>Download for Windows</strong> (or Mac).</li>
  <li>Run the installer. On Windows, it will ask to enable WSL 2 &mdash; click OK and let it restart if prompted.</li>
  <li>After installation, open Docker Desktop from the Start Menu (Windows) or Applications (Mac).</li>
  <li>Wait for the Docker Desktop window to finish loading. You will see a whale icon appear in your taskbar (Windows) or menu bar (Mac). The icon should be <strong>steady, not animated</strong> &mdash; animated means it is still starting up.</li>
  <li>Leave Docker Desktop open in the background whenever you are using the lab. You do not need to interact with it &mdash; just having it open is enough.</li>
</ol>

${_callout('warning', '&#128250; Windows &mdash; two things before you continue', '<ol style="margin:6px 0 0"><li>When installing Python, tick <strong>"Add Python to PATH"</strong> before clicking Install.</li><li>After installing Docker Desktop, open it and leave it running. You should see the Docker whale icon in your taskbar before moving on.</li></ol>')}

<h2>Step 2 &mdash; Unzip and open in VS Code</h2>
<ul>
  <li><strong>Windows:</strong> Right-click the downloaded ZIP &rarr; <em>Extract All</em> &rarr; pick a location &rarr; Extract</li>
  <li><strong>Mac:</strong> Double-click the ZIP &mdash; it extracts automatically</li>
</ul>
<p>Inside the extracted folder you will find a folder called <code>lab</code>. Open VS Code, go to <strong>File &rarr; Open Folder</strong>, select that <code>lab</code> folder, and click Open. You will see these files in the VS Code left panel:</p>
<pre style="background:var(--card);padding:14px 18px;border-radius:8px;font-size:0.82rem;color:#b8cce0;overflow-x:auto;line-height:1.8">lab/
├── docker-compose.yml     ← tells Docker how to run the database
├── .env.example           ← connection settings template
├── sql/                   ← 5 scripts that build and seed the database
│   ├── 01_schema.sql      ← creates all tables
│   ├── 02_seed.sql        ← inserts 26,000 rows of realistic bank data
│   ├── 03_classification_seed.sql
│   ├── 04_users_and_roles.sql
│   └── 05_views_for_audit.sql
└── python/                ← 5 scripts, one per exercise
    ├── requirements.txt
    ├── 01_smoke_test.py
    ├── 02_pii_scanner.py
    ├── 03_classifier_simulator.py
    ├── 04_label_review.py
    └── 05_audit_report.py</pre>

${_callout('info', '&#128161; You never run the SQL scripts manually', 'Docker reads the <code>sql/</code> folder and runs those 5 scripts automatically when the database starts for the first time. They are there so you can read and understand the schema &mdash; nothing more.')}

<h2>Step 3 &mdash; Start the database</h2>
<p>In VS Code, open a terminal: menu bar &rarr; <strong>Terminal &rarr; New Terminal</strong>. It opens automatically in the <code>lab</code> folder. Make sure Docker Desktop is running (whale icon in your taskbar/menu bar), then run:</p>
${cb_docker_start}

<h2>Step 4 &mdash; Open Adminer (your SQL query tool)</h2>
<p>Adminer is a SQL client that runs in your browser &mdash; no separate app needed. Docker started it alongside the database.</p>
${cb_adminer_login}

${_callout('success', '&#10003; Checkpoint &mdash; ready for Exercises 1 and 2', 'If you can log in to Adminer and see the table list on the left, your database is fully running. You can now do Exercises 1 and 2. Come back to Step 5 only when you reach Exercise 3.')}

<h2>Step 5 &mdash; Set up Python (Exercises 3 and 4 only)</h2>
<p>In the VS Code terminal, the Python scripts connect to the same database Docker is running. Navigate into the <code>python/</code> sub-folder and run:</p>
${cb_step4_python}

${_callout('success', '&#10003; Checkpoint &mdash; Python ready', 'If <code>01_smoke_test.py</code> prints <strong>Connected to dataguard as dga</strong>, everything is wired up. You are ready for Exercises 3 and 4.')}

<h2>Quick reference</h2>
${cb_quickstart}

<p>To stop the database: <code>docker compose down</code><br>
To wipe all data and start completely fresh: <code>docker compose down -v</code> then <code>docker compose up -d</code></p>

<h2>&#128204; What is in the database</h2>
${_table(
  ['Table', 'Rows', 'What it contains'],
  [
    ['<code>customers</code>', '500', 'Synthetic UK retail customers &mdash; names, dates of birth, National Insurance numbers, emails, passport numbers, addresses'],
    ['<code>accounts</code>', '~1,210', 'Current and savings accounts with sort codes, IBANs, and balances'],
    ['<code>transactions</code>', '25,000', '12 months of transaction history'],
    ['<code>employees</code>', '60', 'Bank staff across 5 departments'],
    ['<code>access_logs</code>', '~8,400', 'A record of who accessed which table, when, and for how long'],
    ['<code>data_catalog</code>', '~10% filled', 'The classification register &mdash; intentionally incomplete so you can complete it in the exercises'],
    ['<code>classification_rules</code>', '15', 'The regex and context patterns the PII scanner uses'],
    ['<code>dsar_requests</code>', '12', 'Open and closed Data Subject Access Requests'],
    ['<code>audit_findings</code>', 'empty at start', 'The PII scanner writes its findings here when you run it in Exercise 3']
  ]
)}
`;

  const ex1 = `
${_callout('info', '&#127919; Your Brief', '<strong>You are:</strong> DSPM Engineer, week one at DataGuard Bank. Your manager says: &ldquo;Before Friday&rsquo;s DORA evidence review, I need a list of every column in the database that looks like personal data but has no classification label. Sort it by risk &mdash; most data first.&rdquo; This is the query your team runs every Monday morning.')}

<h2>Why This Query Exists</h2>
<p>A <strong>data catalog</strong> is the bank&rsquo;s official register of what data it holds and how sensitive each piece is. Every column in every table should have an entry in the catalog: what classification tier is this, who owns it, when was it last reviewed?</p>
<p>In practice, catalogs are never 100% complete. Engineers add tables without registering them. Schema changes add columns that slip through. An unclassified column is a <strong>compliance gap</strong> &mdash; no one has decided whether it needs encryption, access controls, or a retention policy. Regulators treat this as a control failure. Your query finds those gaps so they can be closed.</p>

<h2>The Four Tables You Will Use</h2>
${_table(
  ['Table', 'Where it lives', 'What it contains'],
  [
    ['<code>information_schema.columns</code>', 'Built into every Postgres database', 'One row per column in the entire database: table name, column name, data type. This is the ground truth of what columns exist.'],
    ['<code>information_schema.tables</code>', 'Built into every Postgres database', 'One row per table. You will use this to filter out views and keep only real base tables.'],
    ['<code>bank.data_catalog</code>', 'The lab database', 'The classification register. Each row is a column that has been reviewed, labelled, and approved by the privacy team.'],
    ['<code>pg_stat_user_tables</code>', 'Built into every Postgres database', 'Estimated row counts per table. You use this to prioritise: a 25,000-row PII column carries far more regulatory risk than a 5-row lookup table.']
  ]
)}

<h2>How to Open Adminer and Run Queries</h2>
${cb_ex1_connect}

<h2>Step 1 &mdash; Understand the Schema</h2>
<p>Before writing any complex query, always start by seeing what you are working with. Run this and scroll through the results:</p>
${cb_ex1_step1}
<p>You should see around <strong>60 rows</strong> covering tables like <code>customers</code>, <code>accounts</code>, <code>transactions</code>. Notice column names like <code>nino</code>, <code>passport_number</code>, <code>iban</code> &mdash; obviously personal data. And <code>txn_id</code>, <code>channel</code>, <code>balance_pence</code> &mdash; less obvious. You cannot manually review all 60 every week. That is why we filter.</p>

<h2>Step 2 &mdash; Filter for PII-Shaped Column Names</h2>
<p><code>ILIKE ANY(ARRAY[...])</code> is the key SQL construct here. <code>ILIKE</code> is case-insensitive pattern matching (like <code>LIKE</code> but ignoring case). <code>ANY(ARRAY[...])</code> lets you test against many patterns in a single clause rather than chaining multiple <code>OR</code> conditions. This is the standard approach for building a PII name-pattern filter in SQL:</p>
${cb_ex1_step2}
<p>You should see roughly <strong>15&ndash;20 rows</strong> now. You have narrowed from 60 columns to the ones whose names alone signal personal data. These are your candidates for classification.</p>

<h2>Step 3 &mdash; Find the Gaps</h2>
<p>Now add the <code>LEFT JOIN</code> to <code>data_catalog</code>. A <code>LEFT JOIN</code> returns <em>all</em> rows from the left table whether or not a match exists on the right. When there is no matching row on the right, those columns come back as <code>NULL</code>. Filtering for <code>dc.column_name IS NULL</code> isolates exactly the columns that exist in the schema but are <strong>absent from the catalog</strong> &mdash; your classification gaps.</p>
${cb_ex1_full}

<h2>Reading Your Output</h2>
<p>You should see <strong>10&ndash;14 rows</strong>. Here is how to interpret each column:</p>
${_table(
  ['Column', 'What it tells you', 'What to do with it'],
  [
    ['<code>table_name</code>', 'Which table the unclassified column lives in', 'Tables with multiple gaps are highest priority. Note any table appearing more than twice.'],
    ['<code>column_name</code>', 'The specific column with no catalog entry', 'This is the item that needs a classification decision: what tier is it, who owns it, when reviewed.'],
    ['<code>data_type</code>', 'Postgres data type (text, date, integer...)', 'A <code>date</code> column named <code>date_of_birth</code> is certain PII. A <code>text</code> column named <code>reference</code> needs investigation.'],
    ['<code>est_row_count</code>', 'Estimated number of rows in the parent table', 'Higher = more people potentially affected = higher regulatory exposure. Results are already sorted highest first.']
  ]
)}
<p>You should see <code>customers</code> columns near the top (500 rows), then <code>accounts</code> (~1,210). If any <code>transactions</code> column appears (25,000 rows), that is your <strong>Priority 1 finding</strong> &mdash; 25,000 rows of potentially unclassified payment data is a serious regulatory gap. Note it explicitly.</p>

<h2>Analyse Your Results</h2>
<p>Answer these four questions before moving on. Write the answers down &mdash; you will need them for the final report.</p>
<ol>
  <li><strong>How many unclassified PII-candidate columns did you find?</strong> This is your headline gap count.</li>
  <li><strong>Which table has the most gaps?</strong> Is it also the table with the most rows?</li>
  <li><strong>Is <code>transactions.reference</code> in your results?</strong> If yes, note it: a free-text payment reference field often contains names and dates typed by tellers. The column name alone gives no hint &mdash; only the automated scanner in Exercise 3 would catch this.</li>
  <li><strong>Draft one sentence for the Compliance Officer:</strong> &ldquo;I found N unclassified PII columns across X tables; the highest-risk item is Y because...&rdquo;</li>
</ol>

<h2>Bonus &mdash; Stale Labels</h2>
<p>A column with an old label can be as risky as one with no label. If a schema changed 18 months ago and no one re-reviewed the classification, the label may now be wrong. Most UK banks set a maximum review age (typically 12 months). Run this to find labels past that threshold:</p>
${cb_ex1_stale}

${_callout('success', '&#128196; Report Section 1 &mdash; Unclassified PII Register', 'From the Step 3 query output, note: the total row count, the top 5 highest-risk columns by <code>est_row_count</code>, and any transaction columns flagged as Priority 1. This is the first section of your <strong>Data Classification Health Report</strong>. You will compile the full report in the final tab.')}

<p style="margin-top:24px;color:var(--text-muted)"><em>&#128214; Full worked solution in <code>SOLUTIONS.md</code> (included in the lab download) &rarr; Exercise 1</em></p>
`;

  const ex2 = `
${_callout('info', '&#127919; Your Brief', '<strong>You are:</strong> DSPM Engineer + IAM Admin. The Head of Retail has approved 12 new branch staff for customer data access. They need enough visibility to answer service queries (&ldquo;what accounts does this customer have?&rdquo;) but must be completely blocked from National Insurance numbers, passport numbers, sort codes, and raw account balances. Create the role, test it, and document the design.')}

<h2>Why Roles, Not Passwords</h2>
<p>The naive approach is to give everyone the same database login and trust staff to &ldquo;only look at what they need.&rdquo; This fails three ways: it is <strong>unauditable</strong> (you cannot prove who queried what), it is <strong>unenforceable</strong> (trust is not a technical control), and a single compromised password exposes everything to everyone.</p>
<p><strong>Role-based access control (RBAC)</strong> is the correct approach. A role is a named set of permissions. You grant permissions to the role, then assign individual users to it. The database enforces the role automatically &mdash; not a policy document, not a verbal agreement. If the role cannot SELECT from <code>customers.passport_number</code>, no user in that role can access it regardless of how they try.</p>
<p>A further layer: rather than granting access to entire base tables (which exposes all columns), you create a <strong>view</strong> that deliberately exposes only the columns you have reviewed and approved. If an engineer adds a new sensitive column to <code>customers</code> next week, branch staff still cannot see it &mdash; it is not in the view. This is called <strong>mediated access</strong> and is standard at every UK retail bank.</p>

<h2>What You Will Build</h2>
${_table(
  ['Object', 'Type', 'Purpose'],
  [
    ['<code>bank.v_branch_customer_summary</code>', 'View', 'The safe window into customer data. Exposes only approved columns. Branch staff query this view &mdash; never the base table.'],
    ['<code>r_branch_staff</code>', 'Role (no login)', 'A named permission set. You grant permissions to the role; users are then assigned to it.'],
    ['<code>branch_demo</code>', 'Login user', 'A real database user assigned to the role. Used to test both permitted and blocked access paths.']
  ]
)}

<h2>Step 1 &mdash; Create the View</h2>
<p>Look at the design choices before running it:</p>
<ul>
  <li><code>'Customer #' || customer_id</code> creates a pseudonym &mdash; branch staff refer to a customer without ever seeing their real name. This is the GDPR data minimisation principle in practice.</li>
  <li><code>EXTRACT(YEAR FROM date_of_birth)</code> gives age-band information without exposing the exact date of birth. A branch agent can say &ldquo;born in 1985&rdquo; without the exact date being visible.</li>
  <li><code>ROUND(SUM(balance_pence) / 100.0, 2)</code> shows total wealth across all accounts in pounds &mdash; enough for a service query, without revealing individual account balances or IBANs.</li>
</ul>
${cb_ex2_view}
<p>Run the verification query at the bottom. Confirm the output shows: pseudonym, email, year_of_birth, n_accounts, total_balance_pounds &mdash; and nothing else.</p>

<h2>Steps 2&ndash;4 &mdash; Create the Role, Grants, and User</h2>
<p><code>NOLOGIN</code> on the role means it is a permission container only &mdash; it cannot connect to the database directly. This means you can revoke all 12 branch staff members&rsquo; access in one command (<code>REVOKE r_branch_staff FROM all_branch_users</code>) rather than managing 12 individual account grants.</p>
${cb_ex2_role}

<h2>Step 5 &mdash; Test Both Paths</h2>
<p>This step is not optional. You must verify both that permitted access works <em>and</em> that blocked access is actually blocked. Run both queries in Adminer:</p>
${cb_ex2_verify}
<p><strong>Expected results:</strong></p>
<ul>
  <li><code>SELECT * FROM bank.customers LIMIT 1</code> &rarr; <strong>ERROR: permission denied for table customers</strong>. Correct. Branch staff cannot touch the base table.</li>
  <li><code>SELECT * FROM bank.v_branch_customer_summary LIMIT 3</code> &rarr; <strong>3 rows</strong> with only: pseudonym, email, year_of_birth, n_accounts, total_balance_pounds. No names. No NINOs. No IBANs.</li>
</ul>
<p>If the first query succeeds instead of erroring, the role is misconfigured. Re-check your GRANT statements and confirm you only granted SELECT on the view, not on any base table.</p>

<h2>Defensive Design &mdash; Three Questions to Answer</h2>
<p>A real bank&rsquo;s compliance team would ask these during a controls review. Work through each one:</p>
${_table(
  ['Question', 'Why it matters', 'Answer for this lab'],
  [
    ['An engineer adds a new <code>credit_score</code> column to <code>customers</code> next week. Do branch staff see it?', 'Without mediated access, any new column added to a base table is immediately visible to everyone with table-level grants', 'Safe: the view is an explicit allowlist. New base-table columns are invisible to <code>r_branch_staff</code> until you deliberately add them to the view definition.'],
    ['What password policy applies to <code>branch_demo</code>?', 'Weak or static passwords on role-assigned users defeat the entire access control model', 'In production: 90-day forced rotation, MFA required, login audit on every session. In this lab: document it as a known gap to address before production use.'],
    ['Is there an audit log of branch staff queries?', 'Regulators require evidence that controls were enforced AND monitored. Controls without monitoring are not sufficient.', 'Yes: <code>bank.access_logs</code> captures query activity. You will examine this in Exercise 5.']
  ]
)}

${_callout('success', '&#128196; Report Section 2 &mdash; Access Control Evidence', 'Your evidence for this section is the output of the two test queries: the permission-denied error and the successful view query. Record: view name, role name, columns exposed, columns blocked, and your answer to the &ldquo;new column&rdquo; defensive design question. An auditor reviewing your access controls will request exactly this. This is <strong>Section 2 of your Data Classification Health Report</strong>.')}

<p style="margin-top:24px;color:var(--text-muted)"><em>&#128214; Full worked solution in <code>SOLUTIONS.md</code> (included in the lab download) &rarr; Exercise 2</em></p>
`;

  const ex3 = `
${_callout('info', '&#127919; Your Brief', '<strong>You are:</strong> DSPM Engineer. The Privacy Lead tells you: &ldquo;The SQL query in Exercise 1 only catches columns whose <em>names</em> suggest PII. But what about a column called <code>reference</code> that actually contains names and dates of birth typed in by tellers? The automated scanner reads actual data values. Run it, inspect what it found, and tune the email rule &mdash; the privacy team thinks it&rsquo;s over-flagging.&rdquo;')}

<h2>How the Scanner Works</h2>
<p>The scanner in <code>02_pii_scanner.py</code> does something the SQL query in Exercise 1 cannot: it reads actual cell values from every column in the bank schema, tests them against regex patterns stored in <code>bank.classification_rules</code>, and scores confidence based on what fraction of sampled values match. A column called <code>reference</code> (no PII hint in the name) with 400 values that look like <code>DOB:1990-05-12 Name:Smith</code> will be flagged as high-confidence PII. A column named <code>email</code> with only 3 of 100 values containing @ signs will receive low confidence.</p>
<p>Results are written to <code>bank.audit_findings</code> &mdash; one row per column per rule that matched, with a confidence score and the specific evidence. These are <em>candidates</em>, not final labels. Human review (Exercise 4) converts them into official catalog entries.</p>

<h2>Step 1 &mdash; Run the Scanner</h2>
<p>In VS Code, open a terminal. Navigate to the <code>python/</code> folder (<code>cd python</code>) and make sure your virtual environment is active (see Setup tab, Step 5 if you have not done this). Then run:</p>
${cb_ex3_run}
<p>You will see progress output as it works through each table and column. It takes 20&ndash;40 seconds. When it finishes, it prints a summary of how many findings were written.</p>

<h2>Step 2 &mdash; How Many Findings Did It Produce?</h2>
<p>Switch to Adminer (see Setup tab or Exercise 1 if you need a reminder of how to open it) and run:</p>
${cb_ex3_count}
<p>You should see <strong>30&ndash;60 total findings</strong> across 4&ndash;6 tables. <code>customers</code> will have the most (it is the most PII-dense table). Notice that <code>transactions</code> also appears &mdash; the <code>reference</code> free-text field contains names and dates typed in by tellers. The column name gives no hint; only the scanner catches this. <strong>This is the finding Exercise 1 could not surface.</strong></p>

<h2>Step 3 &mdash; Inspect the Findings in Detail</h2>
<p>Now look at severity and confidence:</p>
${cb_ex3_inspect}
<p>How to read the results:</p>
<ul>
  <li><strong>Severity breakdown:</strong> <code>critical</code> and <code>high</code> require immediate action &mdash; these need catalog entries before the next compliance review. <code>medium</code> and <code>low</code> are candidates for review but not urgent.</li>
  <li><strong>Confidence scores:</strong> above 0.85 means the scanner is confident. Below 0.5, treat the finding as a hint that needs human verification &mdash; do not auto-approve these.</li>
  <li><strong>The evidence column:</strong> it shows the specific regex that matched and a sample value. This is how you explain to a stakeholder <em>why</em> the scanner flagged a column, not just that it did.</li>
</ul>

<h2>Step 4 &mdash; Find Where the Scanner and Catalog Disagree</h2>
<p>The most actionable findings are columns that already have a catalog entry but where the scanner&rsquo;s evidence suggests the label might be wrong. A column labelled <code>Internal</code> that the scanner rates as <code>critical</code> PII is a mislabelling risk &mdash; the kind of finding that generates a regulatory observation.</p>
${cb_ex3_disagree}
<p>If this query returns rows, flag them as priority review items. These are cases where automated evidence contradicts a human decision, and a human must re-examine.</p>

<h2>Step 5 &mdash; Tune One Rule (and Understand Why It Is Risky)</h2>
<p>The Privacy Lead says the email rule is over-flagging. Here is the tune, followed by why you should then revert it:</p>
${cb_ex3_tune}
<p>Re-run <code>02_pii_scanner.py</code>. The findings count for email columns should change. Which columns are now classified differently?</p>

${_callout('warning', '&#9888; Stop &mdash; Was That the Right Call?', '<strong>No.</strong> Changing the email rule label from <code>Restricted</code> to <code>Public</code> is wrong regardless of intent. Email addresses are personal data under GDPR Article 4(1) by definition, whether they are a customer inbox or a marketing list. The correct approach: <strong>revert this change</strong>, then create a new, narrower rule targeted only at verified public distribution list columns, with a named data owner approving the exception. At a real bank, every rule change requires: a written justification, a named approver, an impact assessment showing how many existing labels will flip, and a rollback plan. A single rule change at scale can trigger thousands of label reversals and cascade into weeks of human review work.')}

<h2>Reflection Questions</h2>
<ul>
  <li><strong>Why did Exercise 1 miss <code>transactions.reference</code>?</strong> Because the column name &ldquo;reference&rdquo; does not match any PII keyword pattern. Exercise 1 works by column name only. The scanner works by reading actual values. Both techniques are needed: each catches what the other misses.</li>
  <li><strong>If you changed a rule already applied to 3,000 columns, what should happen to those existing labels?</strong> They should be queued for human re-review &mdash; not silently overwritten. Automated label flips are a compliance risk because the original label&rsquo;s justification may still be valid.</li>
  <li><strong>What is the difference between <code>audit_findings</code> and <code>data_catalog</code>?</strong> Findings are unverified candidates from the scanner. The catalog holds authoritative decisions that have been reviewed, approved, and assigned an owner. The scanner feeds the review queue; it does not directly update the catalog. That step happens in Exercise 4.</li>
</ul>

${_callout('success', '&#128196; Report Section 3 &mdash; Scanner Findings Summary', 'From the Step 3 queries: total findings count, breakdown by severity (critical / high / medium / low), and the top 3 highest-confidence columns with their rule names. If <code>transactions.reference</code> appeared as a high-confidence finding, highlight it and explain why it is significant (free-text spillage not detectable by column-name analysis). If any scanner findings conflicted with existing catalog labels, list those as &ldquo;label review required&rdquo; items. This is <strong>Section 3 of your Data Classification Health Report</strong>.')}

<p style="margin-top:24px;color:var(--text-muted)"><em>&#128214; Full worked solution in <code>SOLUTIONS.md</code> (included in the lab download) &rarr; Exercise 3</em></p>
`;

  const ex4 = `
${_callout('info', '&#127919; Your Brief', '<strong>You are:</strong> Privacy Analyst (reviewer) and DSPM Engineer (running the automation). The scanner from Exercise 3 generated classification proposals overnight. Before they become official catalog entries, every proposal must be reviewed by a human. You have until the 10 a.m. compliance stand-up to clear the queue. This exercise walks the <strong>complete label lifecycle</strong>: auto-propose &rarr; human review &rarr; publish &rarr; coverage report &rarr; close the gaps.')}

<h2>Why Human Review Cannot Be Skipped</h2>
<p>Automated classifiers are good at pattern-matching. They are not good at business context. A column called <code>risk_score</code> with values between 0.0 and 1.0 could be a fraud risk score (Restricted), a credit score (Highly Restricted), or a marketing engagement score (Internal). The regex cannot distinguish these. A human with business knowledge can.</p>
<p>The review queue enforces a <strong>four-eyes principle</strong>: the machine proposes, a human decides, the decision is logged with a reason and a timestamp. This audit trail is what regulators examine during assessments &mdash; and it is the example you give when asked how you balance automation with oversight in an interview.</p>

<h2>Phase A &mdash; Run the Automation</h2>
<p>Run the scanner and auto-classifier. The auto-classifier applies labels directly to <code>data_catalog</code> for findings above the confidence threshold (0.95 by default). Everything below goes into a human review queue.</p>
${cb_ex4_phase_a}
<p>Now check what was auto-approved vs what is waiting for you:</p>
${cb_ex4_check}
<p>You should see two rows: <code>classified_by = 'auto'</code> and <code>classified_by = 'human'</code> (from any manual entries in Ex 1). The <code>auto</code> count tells you how many labels were applied without human eyes. In a real bank, this number requires governance sign-off &mdash; the confidence threshold for auto-approval is itself a documented, auditable decision.</p>

<h2>Phase B &mdash; Human Review</h2>
<p>Run the interactive review script:</p>
${cb_ex4_review}
<p>The script shows one candidate at a time: column name, proposed label, the rule that matched, and a confidence score. Press a key to decide:</p>
${_table(
  ['Key', 'Decision', 'When to use it', 'What it does'],
  [
    ['<code>a</code>', 'Accept', 'The proposed label is correct and the evidence is convincing', 'Writes the label to <code>data_catalog</code> with <code>classified_by = &apos;human&apos;</code> and a timestamp'],
    ['<code>o</code>', 'Override', 'The evidence is real PII but the proposed label tier is wrong', 'Prompts you to type the correct label. Your choice and reason are logged.'],
    ['<code>r</code>', 'Reject', 'False positive &mdash; not actually PII', 'Marks the finding rejected. No catalog entry is created. The rejection reason is logged for model improvement.'],
    ['<code>s</code>', 'Skip', 'Unsure &mdash; needs escalation', 'Item stays in the queue for another reviewer. Use sparingly: every skip is a deferred decision.']
  ]
)}
<p><strong>Work through at least 5 candidates using all four options.</strong> Before pressing a key for each one:</p>
<ol>
  <li><strong>Does the column name match the rule?</strong> A column named <code>marketing_consent</code> flagged as <code>Restricted</code> is probably a false positive (it stores a yes/no value, not PII content). Reject it.</li>
  <li><strong>Check actual values.</strong> Open a second Adminer browser tab and run <code>SELECT [column] FROM bank.[table] LIMIT 10</code>. Do the values confirm the label? A <code>reference</code> column showing values like &ldquo;DOB:1990-05-12 Name:Smith&rdquo; is definitely Restricted regardless of column name.</li>
  <li><strong>Check the confidence score.</strong> Above 0.85: lean toward accept unless something looks wrong. Below 0.5: verify values before accepting &mdash; the scanner is not confident.</li>
</ol>

<h2>Phase C &mdash; Coverage Report</h2>
<p>Run the audit report to see the current state of catalog coverage across the entire database:</p>
${cb_ex4_report}
<p>The report prints a <strong>coverage matrix</strong>: for every table in the bank schema, how many columns are classified and what percentage that is. Read it carefully:</p>
<ul>
  <li><strong>Which table has the lowest coverage?</strong> Likely <code>transactions</code> or <code>dsar_requests</code> &mdash; intentionally seeded with no labels so you can close the gap in Phase D.</li>
  <li><strong>What is the overall estate coverage?</strong> The last line gives the total percentage. This is the headline KPI you report to the CISO. Most banks target 95%+ coverage on tables confirmed to contain PII.</li>
  <li><strong>Coverage below 60% on a PII table is a red flag.</strong> In a real bank this triggers a remediation sprint before the next regulatory review.</li>
</ul>

<h2>Phase D &mdash; Close the Gaps Manually</h2>
<p>Pick the worst-covered table from Phase C. Write the missing catalog entries yourself. Here is a complete template for <code>transactions</code> &mdash; the most likely low-coverage table:</p>
${cb_ex4_insert}

${_callout('warning', '&#9888; Why is <code>reference</code> flagged as Highly Restricted?', 'Run <code>SELECT reference FROM bank.transactions WHERE reference ILIKE \'%DOB%\' LIMIT 5</code>. That free-text payment reference field contains dates of birth and full names typed in by tellers at the counter. This is a classic <strong>spillage</strong> pattern: sensitive personal data accumulating in a field never designed to hold it. Multiple UK banks have received ICO regulatory action tied to free-text fields exactly like this one.')}

<h2>Phase E &mdash; Re-run the Report</h2>
${cb_ex4_rerun}
<p>The coverage percentage for <code>transactions</code> should now be significantly higher. This improvement &mdash; before coverage to after coverage &mdash; is the measurable outcome you present at the compliance stand-up and include in your report.</p>

<h2>Reflection</h2>
<ul>
  <li><strong>How long did it take to review 5 candidates in Phase B?</strong> Multiply by the number of columns in a real bank database (often 30,000&ndash;100,000+). This is why automation matters &mdash; but also why human review is irreducible. The queue is not a bottleneck; it is the mechanism that keeps the catalog trustworthy.</li>
  <li><strong>What threshold should govern auto-approval?</strong> Most banks use 0.95+ confidence. The threshold itself must be documented, approved by the Data Protection Lead, and reviewed annually. It is a governance decision, not a technical one.</li>
  <li><strong>What happens to rejected findings?</strong> They should be reviewed quarterly. Patterns of rejection reveal model drift &mdash; the classifier being systematically wrong in a way that needs retraining. Rejection rate by rule is how you measure scanner quality over time.</li>
</ul>

${_callout('success', '&#128196; Report Section 4 &mdash; Classification Coverage Matrix', 'From the Phase C report: the coverage matrix table showing table name, total columns, classified columns, and coverage %. State the overall estate coverage before and after Phase D. Note the lowest-coverage table and what you did to close it. Record your Phase B decisions: how many you accepted, overrode, and rejected. This is <strong>Section 4 of your Data Classification Health Report</strong>.')}

<p style="margin-top:24px;color:var(--text-muted)"><em>&#128214; Full worked solution in <code>SOLUTIONS.md</code> (included in the lab download) &rarr; Exercise 4</em></p>
`;

  const ex5 = `
${_callout('info', '&#127919; Your Brief', '<strong>You are:</strong> Privacy Analyst. A customer submitted a Data Subject Access Request 28 days ago under GDPR Article 15. You have <strong>2 days left</strong> before the statutory deadline. The request asks for every piece of personal data the bank holds about them. The data catalog you have been building across Exercises 1&ndash;4 is what makes this possible in minutes rather than weeks.')}

<h2>What a DSAR Is and Why It Matters</h2>
<p>Under GDPR Article 15, any individual has the right to ask an organisation: <em>&ldquo;What personal data do you hold about me?&rdquo;</em> The organisation must respond within one calendar month with a complete, portable copy. Failure carries fines of up to <strong>4% of global annual turnover</strong> under GDPR Article 83 &mdash; for a major UK bank, that is potentially hundreds of millions of pounds.</p>
<p>The practical problem is that customer data is scattered across many tables. Without a data catalog, finding all of it requires manually checking every table in the database &mdash; a process that can take weeks and is still error-prone. <strong>The catalog is the map.</strong> It tells you exactly which tables and columns contain customer personal data. This is why classification coverage from Exercise 1 directly determines how fast you can respond to a DSAR.</p>

<h2>Step 1 &mdash; Read the DSAR Request Record</h2>
<p>Start by reading the actual record in the database:</p>
${cb_ex5_check_req}
<p>What to look at:</p>
<ul>
  <li><strong><code>age</code>:</strong> Confirm it is approximately 28 days. The legal deadline is <code>submitted_at + 30 days</code>. You have 2 days. This is real in production &mdash; missing this deadline is a regulatory breach.</li>
  <li><strong><code>status</code>:</strong> Should be <code>open</code> or <code>in_progress</code>. You will change this to <code>fulfilled</code> in Step 5.</li>
  <li><strong><code>handler_email</code>:</strong> Whoever is responsible for fulfillment. You will update this field when you complete the request.</li>
</ul>

<h2>Step 2 &mdash; Use the Catalog to Find All In-Scope Tables</h2>
<p>This step demonstrates the direct operational value of the work done in Exercises 1&ndash;4. Use the catalog to find every table containing customer personal data:</p>
${cb_ex5_discover}
<p>The catalog should return: <code>customers</code>, <code>accounts</code>, <code>transactions</code>, and possibly <code>access_logs</code>. These are every table you must include in the export. <strong>Missing even one table makes the response legally non-compliant</strong> &mdash; the bank is liable even if the omission was accidental.</p>
<p>Notice what would happen if the catalog coverage from Exercise 1 had not been improved: tables without catalog entries would not appear here, and you would miss data in your response. This is the direct link between classification quality and DSAR operational capability.</p>

<h2>Step 3 &mdash; Verify the Data Exists Before Exporting</h2>
<p>Before building the full export, confirm that data exists for this customer in each in-scope table. A table returning 0 rows unexpectedly could mean the customer has no data there (fine) or there is a join condition error (a problem). Always verify first:</p>
${cb_ex5_verify_data}
<p><strong>Expected:</strong> <code>customers</code>=1, <code>accounts</code>=2&ndash;3, <code>transactions</code>=several hundred rows, <code>dsar_requests</code>=1+, <code>access_logs</code>=some rows. If any source shows 0 unexpectedly, investigate before proceeding &mdash; do not export a response with missing data.</p>

<h2>Step 4 &mdash; Build the Complete JSON Export</h2>
<p>A single SQL query assembles all of the customer&rsquo;s data from every in-scope table. Two Postgres functions do the work:</p>
<ul>
  <li><code>jsonb_build_object(key, value, ...)</code> &mdash; constructs a JSON object with named keys</li>
  <li><code>jsonb_agg(row)</code> &mdash; collects multiple rows into a JSON array</li>
  <li>The nested sub-selects pull each related table using <code>customer_id</code> as the join key</li>
</ul>
${cb_ex5_export}
<p>The result is one JSON object containing all of the customer&rsquo;s data across every table. In production, this JSON would be signed, encrypted, and delivered via a secure customer portal with a delivery receipt. Copy the output and save it &mdash; this is the artefact you would deliver to the customer.</p>

<h2>Step 5 &mdash; Mark the Request Fulfilled</h2>
<p>Update the DSAR record to record completion. The <code>fulfilled_at</code> timestamp is your legal proof of on-time delivery:</p>
${cb_ex5_fulfill}
<p>This record is retained for a minimum of 3 years in a real bank as compliance evidence. The <code>notes</code> field documents how the data was delivered (secure portal, encrypted email, post). The combination of <code>submitted_at</code> and <code>fulfilled_at</code> proves you met the statutory deadline.</p>

<h2>Step 6 &mdash; Confirm the Audit Trail</h2>
${cb_ex5_audit}
<p>The access log should show your recent queries. In a production environment this log is immutable &mdash; no one, not even a DBA, can delete it. It proves that access occurred, when, and by whom. If the bank were investigated for a DSAR breach, the ICO would request this log as the first piece of evidence.</p>

<h2>Key Facts to Use in Interview</h2>
${_table(
  ['Point', 'Detail'],
  [
    ['GDPR Art. 12(3) deadline', 'One calendar month from receipt. Extendable by two further months for complex or high-volume cases &mdash; but the extension must be communicated within the first month.'],
    ['Fine for non-compliance', 'Up to 4% of global annual turnover (Art. 83(5)), or &euro;20M, whichever is higher'],
    ['What classification enables', 'Without a complete catalog, every DSAR requires 3&ndash;6 weeks of manual table-by-table hunting. With full coverage: a 10-minute automated export. This is the measurable ROI of the classification programme.'],
    ['The business case', 'A bank receiving 500 DSARs per year at 3 weeks manual effort each = 375 person-weeks per year. Full catalog coverage cuts this to under 1 week total.'],
    ['Mature bank approach', 'One-click DSAR pipeline: system auto-discovers all in-scope data from every catalogued source, generates a portable PDF + JSON bundle, delivers via secure portal, and closes the request automatically.']
  ]
)}

${_callout('success', '&#128196; Report Section 5 &mdash; DSAR Completion Evidence', 'From Steps 1&ndash;6: note the request ID, customer ID, submitted date, fulfilled date, and response time in days. List the tables included in the export and the total record count per table (from Step 3). Confirm the response was within the 30-day deadline. This is <strong>Section 5 of your Data Classification Health Report</strong> &mdash; the final piece.')}

<p style="margin-top:24px;color:var(--text-muted)"><em>&#128214; Full worked solution in <code>SOLUTIONS.md</code> (included in the lab download) &rarr; Exercise 5</em></p>
`;

  const report = `
${_callout('success', '&#127881; You Have Completed All Five Exercises', 'You have done exactly what a DSPM Engineer and Privacy Analyst do in their first month at a bank: found classification gaps, built access controls, run automated scanning with human oversight, and fulfilled a GDPR data subject request. The output is a real, demonstrable artefact.')}

<h2>&#128196; Your Data Classification Health Report</h2>
<p>Assemble the five sections you saved at the end of each exercise into a single document. Structure it like this:</p>

<div style="background:var(--card);border-radius:12px;padding:28px 32px;margin:24px 0;border-left:4px solid var(--accent)">
  <div style="font-size:1rem;font-weight:700;color:var(--accent);margin-bottom:6px">DataGuard Bank &mdash; Data Classification Health Report</div>
  <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:24px">Prepared by: [Your Name] &middot; Role: DSPM Engineer / Privacy Analyst &middot; Date: [Today]</div>

  <p style="font-weight:600;color:#fff;margin:0 0 4px">Executive Summary</p>
  <p style="font-size:0.88rem;color:#b8cce0;margin:0 0 24px">3&ndash;4 sentences: how many unclassified PII columns you found, what the scanner detected that SQL alone could not, what the overall coverage percentage is before and after remediation, and that the DSAR was fulfilled on time. This is the paragraph a CISO reads first.</p>

  <p style="font-weight:600;color:#fff;margin:0 0 4px">Section 1 &mdash; Unclassified PII Register <span style="font-weight:400;font-size:0.85rem;color:var(--text-muted)">(Exercise 1)</span></p>
  <p style="font-size:0.88rem;color:#b8cce0;margin:0 0 24px">The Step 3 query output, sorted by row count descending. Total gap count. Top 5 highest-risk columns. Any transaction table columns flagged as Priority 1 with an explanation of why free-text spillage is a regulatory risk.</p>

  <p style="font-weight:600;color:#fff;margin:0 0 4px">Section 2 &mdash; Access Control Evidence <span style="font-weight:400;font-size:0.85rem;color:var(--text-muted)">(Exercise 2)</span></p>
  <p style="font-size:0.88rem;color:#b8cce0;margin:0 0 24px">View name, role name, columns exposed, columns blocked. Output of both test queries (permission-denied error and successful view query). Your answer to the &ldquo;what happens if a new column is added?&rdquo; defensive design question.</p>

  <p style="font-weight:600;color:#fff;margin:0 0 4px">Section 3 &mdash; Automated Scanner Findings <span style="font-weight:400;font-size:0.85rem;color:var(--text-muted)">(Exercise 3)</span></p>
  <p style="font-size:0.88rem;color:#b8cce0;margin:0 0 24px">Total findings count. Severity breakdown (critical / high / medium / low). Top 3 highest-confidence columns with rule names. If <code>transactions.reference</code> appeared, explain it explicitly: free-text spillage that column-name analysis alone would never surface. Any scanner-vs-catalog disagreements listed as &ldquo;label review required.&rdquo;</p>

  <p style="font-weight:600;color:#fff;margin:0 0 4px">Section 4 &mdash; Classification Coverage Matrix <span style="font-weight:400;font-size:0.85rem;color:var(--text-muted)">(Exercise 4)</span></p>
  <p style="font-size:0.88rem;color:#b8cce0;margin:0 0 24px">The coverage matrix from the Phase C report. Overall estate coverage before Phase D and after. Lowest-coverage table and what you did to close it. Human review decisions: accepted / overridden / rejected counts.</p>

  <p style="font-weight:600;color:#fff;margin:0 0 4px">Section 5 &mdash; DSAR Completion Evidence <span style="font-weight:400;font-size:0.85rem;color:var(--text-muted)">(Exercise 5)</span></p>
  <p style="font-size:0.88rem;color:#b8cce0;margin:0">Request ID, customer ID, submitted date, fulfilled date, response time in days. Tables included in the export and total record count per table. Confirmation: fulfilled within the 30-day statutory deadline.</p>
</div>

<h2>Using This Report in an Interview</h2>
${_table(
  ['Question you will be asked', 'How this report answers it'],
  [
    ['&ldquo;Tell me about a time you identified a data governance gap.&rdquo;', 'Section 1: you found N unclassified PII columns, including <code>transactions.reference</code> &mdash; a free-text spillage field that column-name analysis alone would never surface. You quantified risk by row count and produced a prioritised remediation list.'],
    ['&ldquo;How do you balance automation with human oversight in classification?&rdquo;', 'Sections 3 and 4: you ran the automated scanner and auto-classifier, but every proposal below the confidence threshold went through your review queue. You accepted, overrode, and rejected items with documented reasons. You understand the governance risk of rule changes at scale (Exercise 3 reflection).'],
    ['&ldquo;How does data classification support GDPR compliance?&rdquo;', 'Section 5: the DSAR was fulfilled in under 10 minutes because the catalog told you exactly which tables contained the customer&rsquo;s data. Without the catalog it would have been a 3-week manual hunt. You can quote response time, record count, and deadline compliance.'],
    ['&ldquo;What KPIs would you own in this role?&rdquo;', 'Your report contains three: catalog coverage % (Section 4), unclassified gap count (Section 1), and DSAR response time (Section 5). These are the actual KPIs on a CISO&rsquo;s dashboard.']
  ]
)}

${_callout('info', '&#128172; What This Demonstrates', 'Most candidates who apply for DSPM and Privacy Analyst roles have read about classification. Very few have a working lab report showing the complete cycle: gap discovery &rarr; access control &rarr; automated scanning &rarr; human review &rarr; DSAR fulfillment, with measurable output at each step. That is your differentiator.')}
`;

  // ---- Assemble tab structure ----
  const tabs = [
    { id: 'overview', label: '&#128202; Overview',      content: overview },
    { id: 'setup',    label: '&#9881; Setup',           content: setup    },
    { id: 'ex1',      label: 'Ex 1: SQL Audit',         content: ex1      },
    { id: 'ex2',      label: 'Ex 2: Least Privilege',   content: ex2      },
    { id: 'ex3',      label: 'Ex 3: Scanner',           content: ex3      },
    { id: 'ex4',      label: 'Ex 4: Labeling',          content: ex4      },
    { id: 'ex5',      label: 'Ex 5: DSAR',              content: ex5      },
    { id: 'report',   label: '&#128196; Your Report',   content: report   }
  ];

  return `
<div class="page-hero">
  <div class="module-badge">&#128300; Bonus Lab &middot; Self-Hosted Postgres</div>
  <h1>Hands-On Bank Data Lab</h1>
  <p>Spin up a realistic bank database and walk every workflow a Privacy Analyst or DSPM Engineer runs daily &mdash; PII scanning, classification labeling, least-privilege access, and GDPR DSAR fulfillment. Everything runs locally in Docker with no cloud account or real data.</p>
  <div class="hero-meta">
    <div class="hero-meta-item">&#128295; <span>5 Exercises</span></div>
    <div class="hero-meta-item">&#9200; <span>~3 hours total</span></div>
    <div class="hero-meta-item">&#128013; <span>Python + SQL</span></div>
    <div class="hero-meta-item">&#128181; <span>No cloud spend</span></div>
  </div>
</div>

<div class="tabs module-tabs">
  <div class="tab-headers">
    ${tabs.map((t, i) => `<button class="tab-btn${i === 0 ? ' active' : ''}" data-tab-group="${grp}" data-tab="${grp}_${t.id}">${t.label}</button>`).join('\n    ')}
  </div>
  ${tabs.map((t, i) => `<div class="tab-panel${i === 0 ? ' active' : ''}" data-tab-group="${grp}" data-tab="${grp}_${t.id}">${t.content}</div>`).join('\n  ')}
</div>

<div class="section-nav">
  <span></span>
  <button class="btn btn-secondary" data-goto="home">&#8592; Back to Home</button>
</div>`;
};
