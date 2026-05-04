// =====================================================
// Lab Module: Hands-On Postgres Lab
// =====================================================
window.MODULES.lab = () => {
  const grp = 'lab_t';

  // ---- Pre-build all code blocks to avoid nested template-literal conflicts ----

  const cb_step1_clone = _cb('bash',
`# Run this in your terminal (bash, zsh, or WSL on Windows)
git clone https://github.com/IFCGIT2024/my-portfolio.git
cd my-portfolio/bank-interview-prep`);

  const cb_step1_ps = _cb('powershell',
`# Windows PowerShell alternative (if you don't have Git, install from https://git-scm.com)
git clone https://github.com/IFCGIT2024/my-portfolio.git
cd my-portfolio\\bank-interview-prep`);

  const cb_step3_docker = _cb('bash',
`# From inside the bank-interview-prep folder:
cd lab

# Copy the env file (only needed once)
cp .env.example .env

# Start Postgres + Adminer in the background
docker compose up -d

# Wait ~10 seconds then verify the database tables loaded:
docker compose exec db psql -U dga -d dataguard -c "\\dt bank.*"
# You should see: customers, accounts, transactions, employees, access_logs, etc.`);

  const cb_step3_adminer = _cb('text',
`Open your browser and go to: http://localhost:8080

Fill in:
  System:   PostgreSQL
  Server:   db
  Username: dga
  Password: dga
  Database: dataguard

Click Login — you should see all the bank tables on the left.`);

  const cb_step4_python = _cb('bash',
`# From inside bank-interview-prep/lab/python
cd python

# Create an isolated Python environment (do this once)
python -m venv .venv

# Activate it:
source .venv/bin/activate            # macOS / Linux / WSL
# .venv\\Scripts\\Activate.ps1       # Windows PowerShell (uncomment this line)

# Install the required libraries (do this once)
pip install -r requirements.txt

# Test everything works — this just checks the DB connection:
python 01_smoke_test.py
# Expected output: "Connection OK — dataguard database is ready"`);

  const cb_quickstart = _cb('bash',
`# Quick reference — full sequence from a fresh clone:
git clone https://github.com/IFCGIT2024/my-portfolio.git
cd my-portfolio/bank-interview-prep/lab
cp .env.example .env
docker compose up -d
# wait 10s
docker compose exec db psql -U dga -d dataguard -c "\\dt bank.*"
cd python
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python 01_smoke_test.py`);

  const cb_python_setup = _cb('bash',
`# All 5 scripts live in bank-interview-prep/lab/python/
# Run them in order as each exercise requires them:

python 01_smoke_test.py           # Step 4 — verify DB connection
python 02_pii_scanner.py          # Exercise 3 — scan columns, write findings to audit_findings table
python 03_classifier_simulator.py # Exercise 4A — auto-label high-confidence findings
python 04_label_review.py         # Exercise 4B — interactive human review queue
python 05_audit_report.py         # Exercise 4C/E — coverage + anomaly report`);

  const cb_ex1_connect = _cb('bash',
`docker compose exec db psql -U dga -d dataguard
# Or paste your query into Adminer at http://localhost:8080`);

  const cb_ex2_verify = _cb('sql',
`-- Switch to the restricted user and test both cases
SET ROLE branch_demo;
SELECT * FROM bank.customers LIMIT 1;               -- expect: ERROR permission denied
SELECT * FROM bank.v_branch_customer_summary LIMIT 3; -- expect: success
RESET ROLE;`);

  const cb_ex3_run = _cb('bash',
`cd lab/python
source .venv/bin/activate
python 01_smoke_test.py
python 02_pii_scanner.py            # writes to bank.audit_findings
python 03_classifier_simulator.py   # auto-applies high-confidence labels`);

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
`python 05_audit_report.py -o /tmp/audit.md
# Open /tmp/audit.md — first table is the coverage matrix`);

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

${_callout('info', '&#127881; Deterministic Seed', 'All data is generated from a fixed seed — running <code>docker compose down -v &amp;&amp; up -d</code> produces the identical dataset every time. Customer IDs, DSAR targets, row counts, and query answers stay stable across resets.')}
`;

  const setup = `
<h2>&#9889; How to Get the Lab Files</h2>

<p>All lab files — SQL scripts, Python scripts, Docker config — live in this site's GitHub repository. You download them by cloning the repo. <strong>You do not need to copy anything manually.</strong></p>

<h3>Step 1 &mdash; Install the tools you need (one-time)</h3>
${_table(
  ['Tool', 'What it does', 'Download'],
  [
    ['<strong>Git</strong>', 'Downloads the repo to your machine', '<a href="https://git-scm.com/downloads" target="_blank" rel="noopener">git-scm.com/downloads</a>'],
    ['<strong>Docker Desktop</strong>', 'Runs the Postgres database in a container — no install required, no version conflicts', '<a href="https://www.docker.com/products/docker-desktop/" target="_blank" rel="noopener">docker.com/products/docker-desktop</a>'],
    ['<strong>Python 3.11+</strong>', 'Runs the scanner and review scripts', '<a href="https://www.python.org/downloads/" target="_blank" rel="noopener">python.org/downloads</a>'],
    ['<strong>VS Code</strong> (optional)', 'Edit scripts, run the SQL extension, view the database', '<a href="https://code.visualstudio.com" target="_blank" rel="noopener">code.visualstudio.com</a>']
  ]
)}

${_callout('info', '&#128250; Windows users', 'Open <strong>PowerShell</strong> or <strong>Git Bash</strong> (installed with Git). Either works. Docker Desktop must be running before Step 3.')}

<h3>Step 2 &mdash; Clone the repo (get the files)</h3>
<p>This downloads the entire project — including all SQL scripts, Python scripts, and Docker config — into a folder called <code>my-portfolio</code> on your machine.</p>

${cb_step1_clone}

<p>You now have this folder structure on your machine:</p>
<pre style="background:var(--card);padding:14px 18px;border-radius:8px;font-size:0.82rem;color:#b8cce0;overflow-x:auto">my-portfolio/
└── bank-interview-prep/
    ├── lab/
    │   ├── docker-compose.yml   ← starts the database
    │   ├── .env.example         ← connection settings
    │   ├── sql/
    │   │   ├── 01_schema.sql    ← creates all tables
    │   │   ├── 02_seed.sql      ← inserts 26,000 rows of bank data
    │   │   ├── 03_classification_seed.sql
    │   │   ├── 04_users_and_roles.sql
    │   │   └── 05_views_for_audit.sql
    │   └── python/
    │       ├── requirements.txt       ← list of libraries to install
    │       ├── 01_smoke_test.py       ← test the DB connection
    │       ├── 02_pii_scanner.py      ← scans every column for PII
    │       ├── 03_classifier_simulator.py
    │       ├── 04_label_review.py     ← interactive review queue
    │       └── 05_audit_report.py     ← coverage report
    └── index.html               ← this site</pre>

<h3>Step 3 &mdash; Start the database</h3>
<p>Docker will download Postgres and Adminer automatically, create the schema, and seed all 26,000 rows. <strong>You do not run the SQL scripts manually</strong> — Docker runs them for you on first start.</p>

${cb_step3_docker}

<h3>Step 4 &mdash; Open Adminer (browser-based query tool)</h3>
<p>Adminer is a lightweight SQL client that runs in your browser — no separate app needed. Once Docker is up:</p>

${cb_step3_adminer}

${_callout('success', '&#10003; You are ready', 'If you can see the tables in Adminer, the database is fully set up. You can now run queries directly in Adminer or use <code>psql</code> via the Docker command shown above. Move on to Step 5 only when you need to run the Python exercises (Ex 3 and 4).')}

<h3>Step 5 &mdash; Set up the Python scripts</h3>
<p>Only needed for Exercises 3 and 4. The Python scripts connect to the same Postgres database Docker is running.</p>

${cb_step4_python}

<h3>Quick reference &mdash; full sequence</h3>
${cb_quickstart}

<p>To stop the database: <code>docker compose down</code>. To wipe all data and start completely fresh: <code>docker compose down -v &amp;&amp; docker compose up -d</code></p>

<h2>&#128204; What's in the Database</h2>
${_table(
  ['Table', 'Rows', 'Purpose'],
  [
    ['<code>customers</code>', '500', 'Synthetic UK retail customers &mdash; names, DOBs, NINOs, emails, passports, addresses'],
    ['<code>accounts</code>', '~1,210', 'Current/savings accounts with sort codes, IBANs, balances'],
    ['<code>transactions</code>', '25,000', '12 months of transaction history'],
    ['<code>employees</code>', '60', 'Bank staff across 5 departments'],
    ['<code>access_logs</code>', '~8,400', 'Who accessed which table, when, for how long'],
    ['<code>data_catalog</code>', 'partial', 'Classification register &mdash; ~10% pre-labeled on purpose (run the toolkit to fill it in)'],
    ['<code>classification_rules</code>', '15', 'Regex + context patterns the scanner uses'],
    ['<code>dsar_requests</code>', '12', 'Open and closed Data Subject Access Requests'],
    ['<code>audit_findings</code>', '(empty)', 'The scanner writes PII candidates here when it runs']
  ]
)}
`;

  const ex1 = `
${_callout('info', '&#127919; Scenario', '<strong>Role:</strong> DSPM Engineer. <strong>Stakeholder:</strong> The Compliance Officer is preparing the quarterly DORA evidence pack and needs a list of every column that <em>looks like</em> PII but has no classification label.')}

<h2>Goal</h2>
<p>Write a <strong>single SQL query</strong> against the lab database that returns every column in the <code>bank</code> schema with no row in <code>data_catalog</code>, filtered to those whose name suggests PII.</p>

${_table(
  ['Output Column', 'Description'],
  [
    ['<code>table_name</code>', 'Table in the bank schema'],
    ['<code>column_name</code>', 'The suspect column'],
    ['<code>data_type</code>', 'Postgres data type'],
    ['<code>est_row_count</code>', 'From <code>pg_stat_user_tables</code> &mdash; more rows = more risk']
  ]
)}

<h2>Constraints</h2>
<ul>
  <li>Single <code>SELECT</code> &mdash; no procedural code, no temp tables</li>
  <li>Must use <code>information_schema.columns</code> and <code>information_schema.tables</code></li>
  <li>Must <code>LEFT JOIN bank.data_catalog</code> and filter where the join produces no match</li>
  <li>Filter column names matching: NINO, passport, account, IBAN, email, phone, DOB, address, postcode, name</li>
</ul>

<h2>How to Connect</h2>
${cb_ex1_connect}

<h2>Verify</h2>
<p>Your query should return roughly <strong>10&ndash;15 rows</strong>. These should appear: <code>customers.passport_number</code>, <code>customers.phone</code>, <code>customers.address_line1</code>, <code>accounts.iban</code>, <code>accounts.balance_pence</code>, <code>transactions.reference</code>.</p>

<h2>Bonus</h2>
<p>Extend the query to also flag rows in <code>data_catalog</code> where <code>last_reviewed_at</code> is older than 180 days &mdash; these are <em>stale</em> labels that may no longer reflect reality after schema changes.</p>

${_callout('success', '&#128161; What Good Looks Like', "A real bank's classification register starts at 0% coverage and climbs over months. A query like yours runs weekly to catch regression &mdash; when an engineer adds a new table without a catalog entry, this query catches it within 7 days.")}

<p style="margin-top:24px;color:var(--text-muted)"><em>&#128214; Solutions in <code>lab/exercises/SOLUTIONS.md</code> &rarr; Exercise 1</em></p>
`;

  const ex2 = `
${_callout('info', '&#127919; Scenario', '<strong>Role:</strong> DSPM Engineer + IAM Admin. <strong>Stakeholder:</strong> Head of Retail wants 12 new branch staff to have <em>some</em> customer visibility for service queries &mdash; but absolutely no access to NINOs, passport numbers, sort codes, or account numbers.')}

<h2>Tasks</h2>
<ol>
  <li><strong>Create a view</strong> <code>bank.v_branch_customer_summary</code> joining <code>customers</code> and <code>accounts</code>, exposing only: <code>customer_id</code>, a <code>pseudonym</code> (e.g. <code>Customer #42</code>), <code>email</code>, <code>year_of_birth</code>, <code>n_accounts</code>, <code>total_balance_pounds</code> (rounded, not pence)</li>
  <li><strong>Create the role</strong> <code>r_branch_staff</code> with no login capability</li>
  <li><strong>Grant</strong> CONNECT on the database, USAGE on the schema, SELECT on the view only &mdash; nothing else</li>
  <li><strong>Create user</strong> <code>branch_demo</code> with a password, assigned to role <code>r_branch_staff</code></li>
  <li><strong>Verify</strong> both the allowed and blocked paths:</li>
</ol>

${cb_ex2_verify}

<h2>Defensive Design Checks</h2>
<p>Before declaring done, answer these in a comment block at the top of your script:</p>
<ul>
  <li>What happens if an engineer adds <code>passport_number_v2</code> to <code>customers</code> next week? Does your role inadvertently expose it?</li>
  <li>What password rotation policy applies to <code>branch_demo</code>?</li>
  <li>Is there an audit log of branch staff queries? Where?</li>
</ul>

${_callout('success', '&#128161; What Good Looks Like', 'The pattern is <strong>mediated access through views</strong>. Branch staff never query base tables. The view is the contract &mdash; change it intentionally, and you change what 200 staff can see. This is standard at every UK retail bank. The view also protects you: future schema additions to <code>customers</code> are not exposed until you explicitly update the view.')}

<p style="margin-top:24px;color:var(--text-muted)"><em>&#128214; Solutions in <code>lab/exercises/SOLUTIONS.md</code> &rarr; Exercise 2</em></p>
`;

  const ex3 = `
${_callout('info', '&#127919; Scenario', '<strong>Role:</strong> DSPM Engineer. <strong>Stakeholder:</strong> Privacy team reports the scanner is flagging too many <code>email</code> columns as <code>Restricted</code> when they should be <code>Internal</code>.')}

<h2>Step 1 &mdash; Run the scanner end-to-end</h2>
${cb_ex3_run}

<h2>Step 2 &mdash; Inspect the findings table</h2>
${cb_ex3_inspect}

<h2>Step 3 &mdash; Tune one rule</h2>
<p>The seed contains a rule called <code>Email address</code> that suggests <code>Internal</code>. Suppose Privacy says a specific marketing distribution list should be <code>Public</code>. Without changing the schema, tune the rule:</p>
${cb_ex3_tune}

<p>Re-run <code>02_pii_scanner.py</code>. What changed in the findings table?</p>

${_callout('warning', '&#9888; Was That the Right Call?', "<strong>No.</strong> Narrowing the column pattern is fine &mdash; but downgrading <em>email</em> to Public is wrong; all emails are still PII under GDPR regardless of intent. The correct approach: <em>revert</em> the label change and instead create a <em>new</em> rule targeted specifically at <code>%marketing_email%</code> columns. Every rule change at a real bank has a one-paragraph justification, a named owner, and a rollback plan.")}

<h2>Reflection Questions</h2>
<ul>
  <li>If you change a rule already applied to 4,000 columns, what should happen to those existing labels? <em>(They should be queued for human re-review &mdash; not silently overwritten.)</em></li>
  <li>The scanner's email regex is simplified. What real-world addresses does it miss? <em>(Addresses with <code>+</code> sub-addressing, internationalised domains, IPv6 literals.)</em></li>
  <li>At scale, a real bank runs 150&ndash;500 rules. A single 1-rule change can trigger thousands of label flips and cascade into hundreds of human review items. What governance gate should exist before a rule is changed?</li>
</ul>

<p style="margin-top:24px;color:var(--text-muted)"><em>&#128214; Solutions in <code>lab/exercises/SOLUTIONS.md</code> &rarr; Exercise 3</em></p>
`;

  const ex4 = `
${_callout('info', '&#127919; Scenario', '<strong>Role:</strong> Privacy Analyst. <strong>Stakeholder:</strong> DSPM Engineer pushed 200 new auto-proposals overnight. You must clear the review queue before the 10 a.m. compliance stand-up.')}

<h2>Phase A &mdash; Auto-classification (DSPM Engineer)</h2>
${cb_ex4_phase_a}
${cb_ex4_check}

<h2>Phase B &mdash; Human review (Privacy Analyst)</h2>
${cb_ex4_review}
<p>Walk through the queue. For each candidate, answer three questions before pressing a key:</p>
<ol>
  <li>Does the column name match the rule's intent? (e.g. <code>mortgage_account_number</code> looks like an account number &mdash; is the suggested label correct?)</li>
  <li>Are sample values consistent? (Open Adminer, run <code>SELECT col FROM table LIMIT 5</code>.)</li>
  <li>Who is the data owner? (Default: <code>farouk.ahmed@dga-bank.test</code>)</li>
</ol>
<p>Process at least 5 candidates. Mix <strong>accept</strong>, <strong>override</strong>, and <strong>reject</strong> so you exercise all code paths.</p>

<h2>Phase C &mdash; Coverage check (DSPM + Privacy together)</h2>
${cb_ex4_report}
<p>The first table in the report is the coverage matrix: every table, percentage classified. <strong>Which table has the lowest coverage?</strong> (Hint: <code>transactions</code> or <code>dsar_requests</code> &mdash; intentionally seeded with no labels.)</p>

<h2>Phase D &mdash; Close the loop</h2>
<p>Pick the worst-covered table and write the missing catalog rows yourself. Template for <code>transactions</code>:</p>
${cb_ex4_insert}

${_callout('warning', '&#9888; Why is <code>reference</code> Highly Restricted?', 'Run: <code>SELECT reference FROM bank.transactions WHERE reference ILIKE \'For %\' LIMIT 5;</code> &mdash; that free-text field contains DOBs and full names typed in by tellers. A classic spillage point. Multiple UK banks have received GDPR fines tied to free-text fields exactly like this.')}

<h2>Phase E &mdash; Re-run the audit</h2>
${cb_ex4_rerun}
<p>Coverage should now be visibly higher. <strong>Save this Markdown report</strong> &mdash; that's the artefact you bring to the next compliance review and the evidence pack for the regulator.</p>

<h2>Reflection</h2>
<ul>
  <li>How long does this workflow take at a real bank? (~Daily for routine deltas; weekly for new tables; quarterly for full reviews.)</li>
  <li>Who signs off the report before it goes to the regulator? (Data Protection Lead.)</li>
  <li>What automation trigger would speed this up? (Hook the scanner into the deployment pipeline so any new table fails CI without a catalog entry.)</li>
</ul>

<p style="margin-top:24px;color:var(--text-muted)"><em>&#128214; Solutions in <code>lab/exercises/SOLUTIONS.md</code> &rarr; Exercise 4</em></p>
`;

  const ex5 = `
${_callout('info', '&#127919; Scenario', '<strong>Role:</strong> Privacy Analyst. <strong>Stakeholder:</strong> A customer wrote in 28 days ago invoking GDPR Article 15. You have <strong>2 days left</strong> to deliver every piece of personal data the bank holds about them &mdash; in portable format.')}

<h2>Goal &mdash; Customer #42</h2>
<p>Identify every table containing data about customer 42, extract a complete JSON export, and close the DSAR request with <code>status = 'fulfilled'</code>.</p>

${_callout('warning', '&#9888; Why This Is Hard', "The customer's data is scattered across 5 tables: <code>customers</code>, <code>accounts</code>, <code>transactions</code>, <code>dsar_requests</code>, and <code>access_logs</code>. Miss one table and the bank is non-compliant. The <code>data_catalog</code> is the map that tells you where to look &mdash; without it, you're hunting manually.")}

<h2>Step 1 &mdash; Discover all in-scope tables</h2>
${cb_ex5_discover}

<h2>Step 2 &mdash; Build the JSON export</h2>
<p>A single query using <code>jsonb_build_object()</code> and <code>jsonb_agg()</code> across all five tables:</p>
${cb_ex5_export}

<h2>Step 3 &mdash; Mark the request fulfilled</h2>
${cb_ex5_fulfill}

<h2>Step 4 &mdash; Confirm the audit trail</h2>
${cb_ex5_audit}

<h2>Key Facts &mdash; Quote These in Interview</h2>
${_table(
  ['Point', 'Detail'],
  [
    ['GDPR Art. 12(3) deadline', 'One calendar month, extendable by two further months for complex requests'],
    ['Fine for missing deadline', 'Up to 4% of global annual turnover under GDPR Art. 83'],
    ['What classification enables', 'Without the catalog, you have no automated map of where data lives &mdash; every DSAR becomes a 3-week manual hunt'],
    ['Mature bank approach', 'One-click DSAR pipeline: system auto-extracts from every tagged source; portable PDF + JSON bundle auto-generated; secure portal delivery']
  ]
)}

${_callout('success', '&#128161; The Core Point', 'Your <code>data_catalog</code> is the bank\'s "where does data live" map. The quality of your classification programme directly determines how fast you can fulfill DSARs. Bad catalog = weeks of manual discovery. Good catalog = 10-minute automated export. This is the argument you make to every sceptical stakeholder.')}

<p style="margin-top:24px;color:var(--text-muted)"><em>&#128214; Solutions in <code>lab/exercises/SOLUTIONS.md</code> &rarr; Exercise 5</em></p>
`;

  // ---- Assemble tab structure ----
  const tabs = [
    { id: 'overview', label: '&#128202; Overview',      content: overview },
    { id: 'setup',    label: '&#9881; Setup',           content: setup    },
    { id: 'ex1',      label: 'Ex 1: SQL Audit',         content: ex1      },
    { id: 'ex2',      label: 'Ex 2: Least Privilege',   content: ex2      },
    { id: 'ex3',      label: 'Ex 3: Scanner',           content: ex3      },
    { id: 'ex4',      label: 'Ex 4: Labeling',          content: ex4      },
    { id: 'ex5',      label: 'Ex 5: DSAR',              content: ex5      }
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
