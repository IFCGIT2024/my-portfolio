// =====================================================
// Module 1: SQL for Data Analysts
// =====================================================
window.MODULES.m1 = () => {

const sql_gaps = `-- Find tables with PII-sounding columns but NO classification label
-- Must join on BOTH schema AND name — tables in different schemas can share names
SELECT
    t.table_schema,
    t.table_name,
    STRING_AGG(c.column_name, ', ')  AS suspect_columns,
    COUNT(c.column_name)             AS suspect_col_count
FROM information_schema.tables t
JOIN information_schema.columns c
    ON  c.table_schema = t.table_schema
    AND c.table_name   = t.table_name
LEFT JOIN data_catalog dc
    ON  dc.table_schema = t.table_schema
    AND dc.table_name   = t.table_name
WHERE dc.classification_label IS NULL
  AND (
        c.column_name ILIKE '%nino%'          OR
        c.column_name ILIKE '%passport%'      OR
        c.column_name ILIKE '%account_num%'   OR
        c.column_name ILIKE '%credit_card%'   OR
        c.column_name ILIKE '%dob%'           OR
        c.column_name ILIKE '%date_of_birth%' OR
        c.column_name ILIKE '%sort_code%'     OR
        c.column_name ILIKE '%iban%'
      )
GROUP BY t.table_schema, t.table_name
ORDER BY suspect_col_count DESC;`;

const sql_audit = `-- Who accessed Restricted data in the last 30 days?
SELECT
    al.user_id,
    u.full_name,
    u.department,
    al.table_name,
    dc.classification_label,
    COUNT(*)             AS access_count,
    MIN(al.accessed_at)  AS first_access,
    MAX(al.accessed_at)  AS last_access
FROM access_logs al
JOIN users        u  ON u.id          = al.user_id
JOIN data_catalog dc ON dc.table_name = al.table_name
WHERE dc.classification_label IN ('Restricted', 'Highly Restricted')
  AND al.accessed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY al.user_id, u.full_name, u.department, al.table_name, dc.classification_label
ORDER BY access_count DESC;`;

const sql_confidence = `-- Flag low-confidence auto-labels for human review
SELECT
    table_schema,
    table_name,
    classification_label,
    confidence_score,
    classified_by,
    last_scanned_at,
    CASE
        WHEN confidence_score < 0.80 THEN 'NEEDS REVIEW'
        WHEN confidence_score < 0.90 THEN 'LOW CONFIDENCE'
        ELSE                              'ACCEPTED'
    END AS review_status
FROM data_catalog
WHERE classified_by = 'auto'
ORDER BY confidence_score ASC
LIMIT 100;`;

const sql_dsar = `-- DSAR: all tables containing data for a specific customer (GDPR Art. 15)
-- One calendar month deadline. ALWAYS use a bind parameter — never concatenate.
SELECT
    dc.table_schema,
    dc.table_name,
    dc.classification_label,
    dc.data_owner,
    dc.retention_policy_days
FROM data_catalog dc
JOIN customer_data_map cdm ON cdm.table_name = dc.table_name
WHERE cdm.customer_id = :customer_id   -- bind parameter prevents SQL injection
  AND dc.pii_column_count > 0
ORDER BY dc.classification_label;`;

const sql_cte = `-- Full compliance report: coverage + low-confidence + access anomalies
WITH coverage AS (
    SELECT
        COUNT(DISTINCT t.table_name)  AS total_tables,
        COUNT(DISTINCT dc.table_name) AS classified_tables
    FROM information_schema.tables t
    LEFT JOIN data_catalog dc ON dc.table_name = t.table_name
    WHERE t.table_schema NOT IN ('information_schema', 'pg_catalog')
),
low_confidence AS (
    SELECT COUNT(*) AS needs_review
    FROM data_catalog
    WHERE confidence_score < 0.85 AND classified_by = 'auto'
),
anomalous_users AS (
    -- HAVING filters the GROUP BY result; WHERE cannot filter aggregates
    SELECT al.user_id, COUNT(*) AS access_count
    FROM access_logs al
    JOIN data_catalog dc ON dc.table_name = al.table_name
    WHERE dc.classification_label = 'Restricted'
    GROUP BY al.user_id
    HAVING COUNT(*) > 50
)
SELECT
    c.total_tables,
    c.classified_tables,
    ROUND(c.classified_tables::numeric / NULLIF(c.total_tables,0) * 100, 1) AS coverage_pct,
    l.needs_review,
    (SELECT COUNT(*) FROM anomalous_users) AS high_access_users
FROM coverage c, low_confidence l;`;

const sql_sandbox = `-- =========================================================
-- SANDBOX SETUP — run this block first, then try the projects
-- Works in any PostgreSQL client (free options below).
--
-- Free online options:
--   https://www.db-fiddle.com       (choose PostgreSQL 15)
--   https://supabase.com            (free hosted Postgres)
--   Local: install DBeaver + PostgreSQL (both free)
-- =========================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY,
    full_name  TEXT NOT NULL,
    department TEXT NOT NULL
);
INSERT INTO users VALUES
(1, 'Sarah Chen',    'Data Governance'),
(2, 'James Okafor',  'Risk Analytics'),
(3, 'Priya Mehta',   'Compliance'),
(4, 'Tom Williams',  'IT Security'),
(5, 'Anna Kowalski', 'Retail Banking'),
(6, 'Dev Patel',     'Engineering'),
(7, 'Lisa Thornton', 'Finance');

-- 2. DATA CATALOG (the table classification tools write to)
CREATE TABLE IF NOT EXISTS data_catalog (
    table_schema          TEXT,
    table_name            TEXT,
    classification_label  TEXT,
    confidence_score      NUMERIC(4,3),
    classified_by         TEXT,
    pii_column_count      INTEGER,
    data_owner            TEXT,
    last_scanned_at       DATE,
    retention_policy_days INTEGER,
    labelled_at           DATE,
    PRIMARY KEY (table_schema, table_name)
);
INSERT INTO data_catalog VALUES
('retail',     'customers',         'Confidential',      0.970, 'auto',   4, 'sarah.chen',   CURRENT_DATE - 5,  2190, CURRENT_DATE - 5),
('retail',     'loan_applications', 'Highly Restricted', 0.940, 'auto',   6, 'james.okafor', CURRENT_DATE - 12, 1825, CURRENT_DATE - 12),
('retail',     'transactions',      'Confidential',      0.910, 'auto',   2, 'priya.mehta',  CURRENT_DATE - 3,  2555, CURRENT_DATE - 3),
('retail',     'accounts',          'Confidential',      0.880, 'auto',   3, 'sarah.chen',   CURRENT_DATE - 8,  2190, CURRENT_DATE - 8),
('retail',     'branch_staff',      'Internal',          0.950, 'auto',   1, 'lisa.thornton',CURRENT_DATE - 20, 2555, CURRENT_DATE - 20),
('analytics',  'customer_segments', 'Confidential',      0.720, 'auto',   3, 'james.okafor', CURRENT_DATE - 45, 1095, CURRENT_DATE - 45),
('analytics',  'risk_scores',       'Restricted',        0.830, 'auto',   2, 'james.okafor', CURRENT_DATE - 10, 1825, CURRENT_DATE - 10),
('analytics',  'model_outputs',     'Restricted',        0.680, 'auto',   2, 'dev.patel',    CURRENT_DATE - 60, 1825, CURRENT_DATE - 60),
('compliance', 'aml_flags',         'Highly Restricted', 0.960, 'manual', 5, 'priya.mehta',  CURRENT_DATE - 2,  1825, CURRENT_DATE - 2),
('compliance', 'sar_reports',       'Highly Restricted', 0.990, 'manual', 7, 'priya.mehta',  CURRENT_DATE - 1,  1825, CURRENT_DATE - 1),
('shared',     'interest_rates',    'Public',            0.990, 'auto',   0, 'lisa.thornton',CURRENT_DATE - 30, NULL,  CURRENT_DATE - 30),
('shared',     'product_catalogue', 'Public',            0.980, 'auto',   0, 'lisa.thornton',CURRENT_DATE - 30, NULL,  CURRENT_DATE - 30),
('hr',         'employee_records',  'Restricted',        0.920, 'auto',   5, 'anna.kowalski',CURRENT_DATE - 15, 2555, CURRENT_DATE - 15),
('hr',         'payroll',           'Restricted',        0.890, 'auto',   4, 'anna.kowalski',CURRENT_DATE - 15, 2555, CURRENT_DATE - 15);

-- 3. ACCESS_LOGS
CREATE TABLE IF NOT EXISTS access_logs (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id),
    table_name  TEXT,
    accessed_at TIMESTAMP,
    query_type  TEXT
);
INSERT INTO access_logs (user_id, table_name, accessed_at, query_type) VALUES
(2, 'loan_applications', NOW() - INTERVAL '1 day',   'SELECT'),
(2, 'loan_applications', NOW() - INTERVAL '2 days',  'SELECT'),
(2, 'risk_scores',       NOW() - INTERVAL '1 day',   'SELECT'),
(3, 'aml_flags',         NOW() - INTERVAL '3 hours', 'SELECT'),
(3, 'sar_reports',       NOW() - INTERVAL '1 hour',  'SELECT'),
(6, 'loan_applications', NOW() - INTERVAL '3 days',  'SELECT'),
(6, 'loan_applications', NOW() - INTERVAL '3 days',  'SELECT'),
(6, 'loan_applications', NOW() - INTERVAL '4 days',  'SELECT'),
(6, 'aml_flags',         NOW() - INTERVAL '2 days',  'SELECT'),
(1, 'customers',         NOW() - INTERVAL '1 hour',  'SELECT'),
(1, 'customers',         NOW() - INTERVAL '2 hours', 'SELECT'),
(5, 'transactions',      NOW() - INTERVAL '6 hours', 'SELECT'),
(7, 'interest_rates',    NOW() - INTERVAL '1 day',   'SELECT'),
(4, 'aml_flags',         NOW() - INTERVAL '5 days',  'SELECT'),
(4, 'employee_records',  NOW() - INTERVAL '5 days',  'SELECT');

-- 4. CUSTOMER_DATA_MAP (links customer IDs to every table holding their data)
CREATE TABLE IF NOT EXISTS customer_data_map (
    customer_id INTEGER,
    table_name  TEXT,
    column_name TEXT,
    data_type   TEXT
);
INSERT INTO customer_data_map VALUES
(4421, 'customers',         'full_name',     'TEXT'),
(4421, 'customers',         'email',         'TEXT'),
(4421, 'customers',         'date_of_birth', 'DATE'),
(4421, 'transactions',      'customer_id',   'INTEGER'),
(4421, 'accounts',          'customer_id',   'INTEGER'),
(4421, 'loan_applications', 'applicant_id',  'INTEGER'),
(4421, 'customer_segments', 'customer_id',   'INTEGER');

-- Once these tables exist, every query in the Code Examples and Projects tabs will run.`;

return _renderModule({
  id: 'm1', prev: null, next: 'm2',
  badge: 'Module 1 · Foundation',
  title: 'SQL for Data Analysts',
  subtitle: 'SQL is the backbone of data classification work — it is how you verify labels are accurate, find coverage gaps, audit access, and generate compliance reports. Every compliance report, every audit, every DSAR is a SQL query.',
  meta: [
    '&#9200; <span>~2 hrs</span>',
    '&#128204; <span>All Roles</span>',
    '&#128295; <span>5 Code Examples</span>',
    '&#127891; <span>5 Projects</span>'
  ],
  tabs: [
    {
      id: 'overview', label: '&#128204; Overview',
      sections: [
        {type:'cards', items:[
          {icon:'&#128269;', title:'Query the Data Catalog',   body:'Pull classification labels, confidence scores, and metadata from the catalog that tools like 1touch.io and Purview populate.'},
          {icon:'&#128680;', title:'Find Classification Gaps', body:'Identify tables with PII-sounding column names that have no label — the most common and dangerous compliance gap.'},
          {icon:'&#128202;', title:'Audit Access Logs',        body:'Surface who accessed Restricted data, when, and how often — essential for DORA compliance and incident response.'},
          {icon:'&#128101;', title:'Support DSARs',            body:'Map all tables containing a specific customer\'s PII to fulfill GDPR Article 15 requests within one calendar month.'},
        ]},
        {type:'callout', variant:'info', title:'&#127979; Banking Context',
          body:'At a bank using 1touch.io or Microsoft Purview, these tools classify data automatically and write results to a <strong>data catalog</strong> — a queryable metadata store. Your SQL queries read from this catalog to verify, audit, and report on classification quality.'},
        {type:'h2', text:'The Data Catalog Schema'},
        {type:'p', text:'Most classification platforms expose a queryable data catalog. These are the key tables you will work with:'},
        {type:'table', headers:['Table','What It Contains','Key Columns'], rows:[
          ['<code>data_catalog</code>',          'Every scanned data asset with its label and metadata',  'table_schema, table_name, classification_label, confidence_score, pii_column_count, data_owner'],
          ['<code>access_logs</code>',           'Every time a user or system touched a data asset',      'user_id, table_name, accessed_at, query_type, rows_returned'],
          ['<code>sensitivity_labels</code>',    'Reference: classification tiers and definitions',       'label_id, label_name, description, retention_days'],
          ['<code>classification_history</code>','Full change log — every label applied or overridden',   'table_name, old_label, new_label, changed_by, changed_at, reason'],
          ['<code>customer_data_map</code>',     'Maps customer IDs to tables holding their data',        'customer_id, table_name, column_name, data_type'],
        ]},
      ]
    },
    {
      id: 'concepts', label: '&#128214; Concepts',
      sections: [{type:'accordion', items:[
        {
          title: 'Part 1 — What is a Database?',
          sections: [
            {type:'p', text:'In a bank, everything is a record: a customer, a transaction, an account. A <strong>relational database</strong> organises this data into <em>tables</em> — rows and columns, exactly like a spreadsheet. Each row is one thing. Each column is one fact about that thing.'},
            {type:'p', text:'A bank might have hundreds of tables: <code>customers</code>, <code>transactions</code>, <code>loans</code>, <code>staff</code>, <code>audit_logs</code>. Classification labels which columns are sensitive — SQL verifies those labels are correct.'},
            {type:'callout', variant:'info', title:'&#128161; The Core Insight',
              body:'Some columns are sensitive, some are not. <code>full_name</code> and <code>date_of_birth</code> are personal data. <code>account_type</code> is not. Classification finds and labels the difference — SQL verifies it is correct.'},
          ]
        },
        {
          title: 'Part 2 — What is SQL?',
          sections: [
            {type:'p', text:'SQL stands for Structured Query Language. It is a standardised language for asking questions of a database. A SELECT statement <em>reads</em> data — it does not modify anything. Banks run on SQL.'},
            {type:'ul', items:[
              'Every compliance report is a SQL query',
              'Every DSAR ("show me everything you hold about me") is a SQL query',
              'Every gap analysis ("find data we have not classified yet") is a SQL query',
              'Every access audit is a SQL query',
            ]},
          ]
        },
        {
          title: 'Part 3 — The Core Building Blocks',
          sections: [
            {type:'p', text:'Learn these six patterns and you can write any classification audit query.'},
            {type:'code', lang:'sql', title:'SELECT / WHERE / ORDER BY', code:`SELECT full_name, date_of_birth
FROM customers
WHERE account_type = 'current'
ORDER BY date_of_birth DESC;
-- DESC = youngest customers first (most recently born)
-- ASC = oldest first (the default)`},
            {type:'code', lang:'sql', title:'COUNT + GROUP BY', code:`SELECT account_type, COUNT(*) AS number_of_customers
FROM customers
GROUP BY account_type;
-- GROUP BY splits rows into groups; COUNT summarises each group`},
            {type:'code', lang:'sql', title:'JOIN — combine two tables', code:`SELECT c.full_name, t.amount, t.transaction_date
FROM transactions t
JOIN customers c ON c.id = t.customer_id
WHERE t.amount > 10000;
-- JOIN links tables by a shared ID column
-- Only returns rows with a match in BOTH tables`},
            {type:'callout', variant:'warning', title:'&#9888; LEFT JOIN — the critical variant for gap analysis',
              body:'LEFT JOIN returns <em>all rows</em> from the left table, even if there is NO matching row in the right table. Rows with no match show NULL for the right-side columns. Filter WHERE right.column IS NULL and you have found the gaps. <strong>Always join on both table_schema AND table_name</strong> — tables in different database schemas can share the same name.'},
            {type:'code', lang:'sql', title:'LEFT JOIN — finding unclassified tables', code:`SELECT t.table_schema, t.table_name
FROM information_schema.tables t
LEFT JOIN data_catalog dc
    ON  dc.table_schema = t.table_schema
    AND dc.table_name   = t.table_name   -- join on BOTH columns
WHERE dc.table_name IS NULL;
-- "All database tables with NO catalog entry = never classified"`},
            {type:'code', lang:'sql', title:'HAVING — filter after grouping', code:`SELECT al.user_id, COUNT(*) AS access_count
FROM access_logs al
JOIN data_catalog dc ON dc.table_name = al.table_name
WHERE dc.classification_label = 'Restricted'
GROUP BY al.user_id
HAVING COUNT(*) > 50;
-- WHERE filters rows BEFORE grouping.
-- HAVING filters the GROUP BY result AFTER aggregation.
-- You cannot write WHERE COUNT(*) > 50 — that requires HAVING.`},
            {type:'code', lang:'sql', title:'CTEs — readable multi-step queries', code:`WITH restricted_access AS (
    SELECT al.user_id, al.table_name, COUNT(*) AS access_count
    FROM access_logs al
    JOIN data_catalog dc ON dc.table_name = al.table_name
    WHERE dc.classification_label IN ('Restricted', 'Highly Restricted')
    GROUP BY al.user_id, al.table_name
),
high_frequency AS (
    SELECT * FROM restricted_access WHERE access_count > 20
)
SELECT u.full_name, u.department, h.table_name, h.access_count
FROM high_frequency h
JOIN users u ON u.id = h.user_id
ORDER BY h.access_count DESC;
-- A CTE (WITH clause) names a sub-query so you can reference it by name.
-- Every complex compliance report is built this way.`},
          ]
        },
        {
          title: 'Part 4 — The Data Catalog and Confidence Scores',
          sections: [
            {type:'p', text:'A <strong>data catalog</strong> records <em>metadata</em> about your other tables. Instead of storing customer data, it stores facts about data: "This table was last scanned on [date]. It contains PII. Its classification label is Confidential. Confidence: 0.94."'},
            {type:'p', text:'When a tool like 1touch.io or Microsoft Purview scans your bank\'s data, it writes findings into the data catalog. Your job as a data analyst is to <em>query that catalog</em>.'},
            {type:'table', headers:['Column','Type','Meaning'], rows:[
              ['classification_label','TEXT',      'Public / Internal / Confidential / Restricted / Highly Restricted'],
              ['confidence_score',    'FLOAT 0–1', 'Model certainty. Below 0.85 = flag for human review'],
              ['classified_by',       'TEXT',      '"auto" (AI) or "manual" (human override)'],
              ['pii_column_count',    'INT',       'How many columns in this table contain PII patterns'],
              ['data_owner',          'TEXT',      'Named person accountable for this dataset'],
            ]},
            {type:'callout', variant:'warning', title:'&#128161; What confidence scores mean',
              body:'A score of 0.72 means the AI is only 72% confident the label is correct. Most banks set a threshold (0.80–0.90) below which labels require manual review — incorrect auto-labels cause wrong policy enforcement.'},
          ]
        },
        {
          title: 'Part 5 — GDPR, DSARs, and SQL Security',
          sections: [
            {type:'callout', variant:'danger', title:'&#128680; DSAR Deadline — One Calendar Month',
              body:'Under GDPR Article 15, a Data Subject Access Request must be fulfilled within <strong>one calendar month</strong> of receipt (extendable to three months for complex requests, with written notice to the individual within the first month). Without a classification system and customer data map, this deadline is nearly impossible to meet across hundreds of systems.'},
            {type:'p', text:'The DSAR SQL query uses a <code>customer_data_map</code> table linking customer IDs to every table in the estate containing their data. The critical security requirement: <strong>always use a bind parameter</strong>.'},
            {type:'callout', variant:'success', title:'&#9989; Parameterized Queries — Non-Negotiable in Banking',
              body:'<code>WHERE customer_id = :customer_id</code> is safe. String concatenation (<code>"WHERE customer_id = " + userInput</code>) creates SQL injection vulnerabilities — OWASP Top 10 #3. In banking DSAR systems that receive external inputs, this is a critical security requirement that must be enforced.'},
          ]
        },
      ]}]
    },
    {
      id: 'code', label: '&#128187; Code Examples',
      sections: [
        {type:'p', text:'These five queries cover the core of SQL-based classification audit work. Study each one until you can explain every line.'},
        {type:'code', lang:'sql', title:'1 — Find classification gaps (unclassified PII-likely tables)', caption:'Most common audit finding. LEFT JOIN + IS NULL surfaces every table the tool never scanned.', code: sql_gaps},
        {type:'code', lang:'sql', title:'2 — Access audit: who touched Restricted data?', caption:'Run this for incident response, insider threat analysis, and DORA Pillar 2 evidence.', code: sql_audit},
        {type:'code', lang:'sql', title:'3 — Confidence quality check', caption:'Surface low-confidence auto-labels before they drive incorrect policy enforcement.', code: sql_confidence},
        {type:'code', lang:'sql', title:'4 — DSAR support (GDPR Article 15)', caption:'Find all tables containing data for a specific customer. Bind parameter is non-negotiable.', code: sql_dsar},
        {type:'code', lang:'sql', title:'5 — Full compliance report using CTEs', caption:'Combines coverage percentage, low-confidence count, and anomalous access in one readable query.', code: sql_cte},
      ]
    },
    {
      id: 'projects', label: '&#127891; Projects',
      sections: [
        {type:'h2', text:'Step 0 — Set Up Your Sandbox'},
        {type:'callout', variant:'info', title:'&#128421; Run This First',
          body:'The project queries reference real tables — <code>data_catalog</code>, <code>access_logs</code>, <code>users</code>, and <code>customer_data_map</code>. Copy the setup SQL below and run it in a free PostgreSQL environment first. Recommended free options:<br><br>• <strong>db-fiddle.com</strong> — pick "PostgreSQL 15", paste setup SQL in the left panel, queries on the right<br>• <strong>Supabase.com</strong> — free hosted Postgres with a built-in SQL editor<br>• <strong>DBeaver + PostgreSQL</strong> — free desktop SQL client + local database'},
        {type:'code', lang:'sql', title:'Sandbox setup — CREATE TABLE + INSERT sample data', caption:'Run this once. All project queries and code examples will then work against this realistic bank data.', code: sql_sandbox},
        {type:'h2', text:'Mini Projects'},
        {type:'p', text:'Work through these in order. Each is 10–20 minutes and builds on the previous.'},
        {type:'html', content:`
<div class="project-card">
  <div class="project-header"><div class="project-title">1.1 — What Tables Do We Have?</div><div class="project-time">~10 min</div></div>
  <div class="project-tags"><span class="tag">SELECT</span><span class="tag">ORDER BY</span></div>
  <p>Write a query listing every table in data_catalog with its classification label. Order by label alphabetically. Then extend it to count how many tables exist at each label tier.</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">1.2 — Find the Gaps</div><div class="project-time">~15 min</div></div>
  <div class="project-tags"><span class="tag">LEFT JOIN</span><span class="tag">IS NULL</span></div>
  <p>Find every table in <code>information_schema.tables</code> that has NO entry in <code>data_catalog</code>. Remember: join on both <code>table_schema</code> AND <code>table_name</code>. Extend it to add PII column name filtering.</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">1.3 — Who Touched Sensitive Data?</div><div class="project-time">~15 min</div></div>
  <div class="project-tags"><span class="tag">JOIN</span><span class="tag">WHERE + dates</span><span class="tag">COUNT + GROUP BY</span></div>
  <p>Find all users who accessed a Restricted table in the last 7 days. Show user ID, name, department, and access count. Add HAVING to filter for users with more than 10 accesses.</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">1.4 — Low Confidence Labels</div><div class="project-time">~15 min</div></div>
  <div class="project-tags"><span class="tag">CASE WHEN</span><span class="tag">Numeric thresholds</span></div>
  <p>Find all auto-classified tables with confidence_score below 0.85. Use CASE WHEN to output "NEEDS REVIEW", "LOW CONFIDENCE", or "ACCEPTED" based on the score. Order by score ascending.</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">1.5 — The GDPR Request (Capstone)</div><div class="project-time">~20 min</div></div>
  <div class="project-tags"><span class="tag">DSAR</span><span class="tag">Parameterized Query</span><span class="tag">Security</span></div>
  <p>A customer has exercised their GDPR Article 15 right. You have one calendar month. Write a query finding every table containing data for customer_id = 4421. Use a bind parameter. Explain in one sentence why string concatenation would be dangerous here.</p>
</div>`}
      ]
    },
    {
      id: 'quiz', label: '&#129300; Quiz',
      sections: [
        {type:'h2', text:'Knowledge Check'},
        {type:'quiz', questions:[
          {q:'When finding unclassified tables using LEFT JOIN between information_schema.tables and data_catalog, why must you join on BOTH table_schema AND table_name?',
           options:['For better query performance','Tables in different schemas can have identical names — joining on name alone causes incorrect matches','It is a SQL syntax requirement for LEFT JOINs','The data_catalog does not store table_schema values'],
           correct:1, explanation:'A bank may have a "customers" table in both the "retail" and "corporate" schemas. Joining only on table_name would merge these as if they were one table, producing completely wrong gap analysis results.'},
          {q:'What is the difference between WHERE and HAVING?',
           options:['They are identical — just different keywords','WHERE filters rows before grouping; HAVING filters the result of GROUP BY after aggregation','WHERE is faster than HAVING','HAVING only works with COUNT'],
           correct:1, explanation:'WHERE operates on individual rows before any grouping. HAVING operates on the aggregated group result — so you can write HAVING COUNT(*) > 50, but you cannot write WHERE COUNT(*) > 50.'},
          {q:'A DSAR arrives. Why must you use a bind parameter (:customer_id) rather than string concatenation?',
           options:['Bind parameters are faster','String concatenation creates a SQL injection vulnerability — input could modify the query logic','Bind parameters are required by GDPR','String concatenation does not work in SQL'],
           correct:1, explanation:'SQL injection (OWASP Top 10 #3) allows an attacker to modify query logic by injecting SQL syntax into input fields. In DSAR systems receiving external inputs, parameterized queries are a non-negotiable security requirement.'},
          {q:'GDPR Article 15 — how long does a bank have to respond to a DSAR?',
           options:['14 days','30 business days','One calendar month (extendable to three for complex requests)','72 hours'],
           correct:2, explanation:'The DSAR response deadline is one calendar month from receipt. It can be extended by a further two months for complex or numerous requests — but the individual must be notified of the extension within the first month.'},
          {q:'A confidence score of 0.71 on an auto-classification label means:',
           options:['The table is 71% full of sensitive data','71 columns were scanned','The AI is only 71% confident — flag for human review','The data was last scanned 71 days ago'],
           correct:2, explanation:'Confidence scores reflect model certainty, not data volume. Most banks set a review threshold at 0.80–0.90. A score of 0.71 should enter a review queue where a human confirms or overrides the label before it drives policy enforcement.'},
        ]}
      ]
    }
  ]
});
};
