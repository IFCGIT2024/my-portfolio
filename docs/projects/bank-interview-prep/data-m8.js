// =====================================================
// Module 8: Capstone Projects
// =====================================================
window.MODULES.m8 = () => {

const proj_a_step1 = `import pandas as pd

# Step 1 — Load and explore the data
df = pd.read_csv("legacy_customers.csv")

# Three essential commands for any new dataset
print(df.head())          # First 5 rows — what does the data look like?
print(df.info())          # Column names, data types, non-null counts — are there nulls?
print(df.describe())      # Statistics for numeric columns — any suspicious values?

# What you learn from each:
#   head()     → shape of the data, column names, example values
#   info()     → which columns have missing values; data types (object = text, int64 = number)
#   describe() → min/max/mean help spot anomalies (negative ages, future dates, etc.)

print("Columns found:", df.columns.tolist())
print("Row count:", len(df))

# Typical output for a legacy customer file might reveal:
# ['id', 'full_name', 'dob', 'email', 'phone', 'address', 'ni_number',
#  'account_balance', 'credit_score', 'branch_code', 'notes', 'created_at']`;

const proj_a_step2 = `import re

# Step 2 — PII regex patterns

PATTERNS = {
    "email":       r"[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}",
    "uk_phone":    r"\\b(07\\d{9}|\\+44\\s?7\\d{9})\\b",
    "uk_ni":       r"\\b[A-CEGHJ-PR-TW-Z]{2}\\d{6}[A-D]\\b",
    "date_of_birth": r"\\b(0?[1-9]|[12]\\d|3[01])[\\/\\-](0?[1-9]|1[0-2])[\\/\\-](19|20)\\d{2}\\b",
    "credit_card": r"\\b(?:4\\d{3}|5[1-5]\\d{2}|3[47]\\d{2})[\\s\\-]?\\d{4}[\\s\\-]?\\d{4}[\\s\\-]?\\d{3,4}\\b",
}

# Test each pattern with worked examples
examples = {
    "email":       "user@example.com",
    "uk_phone":    "07700900123",
    "uk_ni":       "AB123456C",
    "date_of_birth": "15/03/1985",
    "credit_card": "4111 1111 1111 1111",
}

for name, value in examples.items():
    pattern = PATTERNS[name]
    match = bool(re.search(pattern, value))
    print(f"  {name:<20} | test value: {value:<25} | matched: {match}")`;

const proj_a_step3 = `# Step 3 — Scan every column and calculate match rates

def scan_column(series, patterns):
    """Return a dict of {pattern_name: match_rate} for a pandas Series."""
    results = {}
    non_null = series.dropna().astype(str)
    if len(non_null) == 0:
        return results
    for name, pattern in patterns.items():
        match_count = non_null.apply(lambda v: bool(re.search(pattern, v))).sum()
        match_rate  = match_count / len(non_null)
        if match_rate > 0:
            results[name] = round(match_rate, 3)  # only record if any match
    return results

findings = {}
for col in df.columns:
    col_findings = scan_column(df[col], PATTERNS)
    if col_findings:
        findings[col] = col_findings

print("PII findings by column:")
for col, hits in findings.items():
    print(f"  {col}: {hits}")

# Example output:
#   email:  {'email': 0.998}         — 99.8% of values matched email pattern
#   phone:  {'uk_phone': 0.95}       — 95% match, some international formats
#   ni_number: {'uk_ni': 1.0}        — 100% match`;

const proj_a_step4 = `# Step 4 — Assign classification label

def classify(findings):
    """
    Apply bank classification rules based on PII types found.
    Findings: {column_name: {pattern_name: match_rate}}
    """
    all_pii_types = set()
    for col_findings in findings.values():
        all_pii_types.update(col_findings.keys())

    # Decision tree: most sensitive type determines the label
    if "uk_ni" in all_pii_types or "credit_card" in all_pii_types:
        return "Restricted"   # National Insurance or card data = highest tier
    elif "date_of_birth" in all_pii_types or "uk_phone" in all_pii_types:
        return "Confidential" # Personal identifiers but not special-category
    elif "email" in all_pii_types:
        return "Confidential" # Email alone = Confidential (Art.4 GDPR personal data)
    elif all_pii_types:
        return "Internal"     # Some PII indicators but not clearly personal
    else:
        return "Public"       # No PII found

label = classify(findings)
print(f"Classification result: {label}")`;

const proj_a_step5 = `import json, datetime

# Step 5 — Generate compliance report
report = {
    "file":           "legacy_customers.csv",
    "scan_date":      datetime.date.today().isoformat(),
    "row_count":      len(df),
    "column_count":   len(df.columns),
    "pii_findings":   findings,
    "classification": label,
    "recommendation": (
        "Restrict access to senior analysts and compliance team only. "
        "Apply masking before copying to any non-production environment. "
        "Ensure DPIA is on file before cloud migration proceeds (GDPR Art.35)."
        if label in ("Restricted", "Confidential")
        else "Standard handling applies. Review annually."
    )
}

print(json.dumps(report, indent=2))

# This report is the deliverable for the compliance team filing.
# It documents: what was found, the basis for the label, and what to do next.`;

const proj_b_sql = `-- Project B: Classification Audit (complete SQL, 5 steps)

-- ===================================================
-- Step 1 — COVERAGE CHECK
-- "How much of our data catalogue is classified?"
-- ===================================================
SELECT
    COUNT(*)                                                AS total_tables,
    COUNT(CASE WHEN dc.table_name IS NOT NULL THEN 1 END)  AS catalogued_tables,
    COUNT(CASE WHEN dc.classification_label IS NOT NULL THEN 1 END) AS labelled_tables,
    ROUND(
      100.0 * COUNT(CASE WHEN dc.classification_label IS NOT NULL THEN 1 END)
            / COUNT(*), 1
    )                                                       AS coverage_pct
FROM information_schema.tables t
LEFT JOIN data_catalog dc
  ON dc.schema_name = t.table_schema
 AND dc.table_name  = t.table_name
WHERE t.table_schema NOT IN ('information_schema','pg_catalog');

-- ===================================================
-- Step 2 — GAP ANALYSIS
-- "What tables have suspicious column names but no label?"
-- ===================================================
SELECT
    c.table_schema,
    c.table_name,
    STRING_AGG(c.column_name, ', ')   AS suspicious_columns,
    dc.classification_label            AS current_label
FROM information_schema.columns c
LEFT JOIN data_catalog dc
  ON dc.schema_name = c.table_schema
 AND dc.table_name  = c.table_name
WHERE dc.classification_label IS NULL    -- not yet classified
  AND (
    LOWER(c.column_name) LIKE '%email%'      OR
    LOWER(c.column_name) LIKE '%phone%'      OR
    LOWER(c.column_name) LIKE '%dob%'        OR
    LOWER(c.column_name) LIKE '%national_id%' OR
    LOWER(c.column_name) LIKE '%ni_number%'  OR
    LOWER(c.column_name) LIKE '%passport%'   OR
    LOWER(c.column_name) LIKE '%credit%'
  )
GROUP BY c.table_schema, c.table_name, dc.classification_label
ORDER BY c.table_name;

-- ===================================================
-- Step 3 — ACCESS AUDIT
-- "Who has accessed Restricted data this month?"
-- ===================================================
SELECT
    al.user_id,
    al.table_name,
    dc.classification_label,
    COUNT(*)                    AS access_count,
    MIN(al.accessed_at)         AS first_access,
    MAX(al.accessed_at)         AS last_access
FROM access_logs al
JOIN data_catalog dc
  ON dc.table_name = al.table_name
WHERE dc.classification_label IN ('Restricted', 'Highly Restricted')
  AND al.accessed_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY al.user_id, al.table_name, dc.classification_label
ORDER BY access_count DESC;

-- ===================================================
-- Step 4 — CONFIDENCE REVIEW
-- "What auto-labels need human review?"
-- ===================================================
SELECT
    table_name,
    schema_name,
    classification_label,
    confidence_score,
    classified_date,
    classified_by
FROM data_catalog
WHERE confidence_score < 0.85
  AND classified_by = 'auto'
ORDER BY confidence_score ASC;

-- ===================================================
-- Step 5 — COMPLIANCE SUMMARY (CTE combining all checks)
-- ===================================================
WITH coverage AS (
  SELECT ROUND(
    100.0 * COUNT(CASE WHEN dc.classification_label IS NOT NULL THEN 1 END)
           / COUNT(*), 1
  ) AS pct
  FROM information_schema.tables t
  LEFT JOIN data_catalog dc ON dc.table_name = t.table_name
  WHERE t.table_schema NOT IN ('information_schema','pg_catalog')
),
gaps AS (
  SELECT COUNT(DISTINCT c.table_name) AS gap_count
  FROM information_schema.columns c
  LEFT JOIN data_catalog dc ON dc.table_name = c.table_name
  WHERE dc.classification_label IS NULL
    AND (LOWER(c.column_name) LIKE '%email%' OR LOWER(c.column_name) LIKE '%phone%')
),
low_confidence AS (
  SELECT COUNT(*) AS review_needed
  FROM data_catalog
  WHERE confidence_score < 0.85 AND classified_by = 'auto'
)
SELECT
  'Audit Summary'             AS report_name,
  coverage.pct                AS classification_coverage_pct,
  gaps.gap_count              AS unclassified_sensitive_tables,
  low_confidence.review_needed AS labels_needing_human_review,
  CURRENT_DATE                AS report_date
FROM coverage, gaps, low_confidence;`;

const proj_c_sql = `-- Project C: DSAR Data Flow Mapper
-- Customer ID to map: use a variable for safety (never interpolate directly)
-- In production, this would be parameterised in your application layer.

-- ===================================================
-- Step 2 — Find all tables containing data for this customer
-- ===================================================
SELECT
    cdm.system_name,
    cdm.table_name,
    cdm.schema_name,
    cdm.data_fields,    -- what data fields are stored in this table
    cdm.purpose         -- e.g. "loan origination", "marketing analytics"
FROM customer_data_map cdm
WHERE cdm.customer_id = :target_customer_id   -- parameterised: never string-interpolate
ORDER BY cdm.system_name;

-- ===================================================
-- Step 3 — Add classification context
-- ===================================================
SELECT
    cdm.system_name,
    cdm.table_name,
    cdm.data_fields,
    cdm.purpose,
    dc.classification_label,     -- the sensitivity of this data
    dc.confidence_score
FROM customer_data_map cdm
LEFT JOIN data_catalog dc
  ON dc.table_name  = cdm.table_name
 AND dc.schema_name = cdm.schema_name
WHERE cdm.customer_id = :target_customer_id
ORDER BY
  CASE dc.classification_label
    WHEN 'Highly Restricted' THEN 1
    WHEN 'Restricted'        THEN 2
    WHEN 'Confidential'      THEN 3
    ELSE 4
  END;

-- ===================================================
-- Step 4 — Add third-party disclosures
-- ===================================================
SELECT
    cdm.system_name,
    cdm.table_name,
    dc.classification_label,
    tp.vendor_name,
    tp.transfer_purpose,
    tp.transfer_destination_country,
    tp.legal_basis,
    tp.transfer_date
FROM customer_data_map cdm
LEFT JOIN data_catalog dc ON dc.table_name = cdm.table_name
LEFT JOIN third_party_sharing tp ON tp.source_table = cdm.table_name
WHERE cdm.customer_id = :target_customer_id
  AND tp.vendor_name IS NOT NULL
ORDER BY tp.transfer_date DESC;

-- ===================================================
-- Step 5 — Full DSAR response output
-- (one row per system, with classification and third-party info)
-- ===================================================
SELECT
    cdm.system_name                                   AS "System",
    cdm.data_fields                                   AS "Data Held",
    dc.classification_label                           AS "Sensitivity",
    COALESCE(tp.vendor_name, 'Not shared externally') AS "Third-Party Disclosure",
    COALESCE(tp.transfer_destination_country, 'N/A')  AS "Country",
    ret.retention_period                              AS "Retention Period",
    ret.retention_basis                               AS "Legal Basis for Retention"
FROM customer_data_map cdm
LEFT JOIN data_catalog dc       ON dc.table_name  = cdm.table_name
LEFT JOIN third_party_sharing tp ON tp.source_table = cdm.table_name
LEFT JOIN retention_policies ret ON ret.table_name  = cdm.table_name
WHERE cdm.customer_id = :target_customer_id
ORDER BY cdm.system_name;

-- This output is formatted as a structured list the compliance team
-- can review and send to the customer as their Art.15 DSAR response.`;

return _renderModule({
  id: 'm8', prev: 'm7', next: 'm9',
  badge: 'Module 8 · Capstone',
  title: 'Capstone Projects',
  subtitle: 'Three complete, standalone projects that bring together everything from this course. Each is designed as a ~1 hour working exercise with real deliverables. These are the type of portfolio pieces that differentiate candidates in data governance interviews.',
  meta: [
    '&#9200; <span>~3 hrs total</span>',
    '&#128204; <span>Applied Practice</span>',
    '&#128279; <span>3 Projects</span>',
    '&#127891; <span>Python + SQL</span>'
  ],
  tabs: [
    {
      id: 'overview', label: '&#128204; Overview',
      sections: [
        {type:'cards', items:[
          {icon:'&#128270;', title:'Project A — PII Scanner',          body:'Python. Given a legacy CSV export, detect PII using regex, assign a classification label, and produce a compliance report. Covers: pandas, regex, match rates, classification logic, JSON output.'},
          {icon:'&#128202;', title:'Project B — Classification Audit', body:'SQL. Produce 5 audit queries: coverage check, gap analysis, access audit, confidence review, and a combined summary CTE. Interview gold: this is exactly what data governance analysts do.'},
          {icon:'&#128279;', title:'Project C — DSAR Data Flow Mapper', body:'SQL. Map every system holding data about a customer for a GDPR Article 15 right of access response. Adds classification context and third-party disclosures.'},
        ]},
        {type:'callout', variant:'info', title:'&#128161; Why These Three?',
          body:'Together they cover the full data governance lifecycle: <strong>discover</strong> (PII Scanner), <strong>audit</strong> (Classification Audit), <strong>respond</strong> (DSAR Mapper). If asked in an interview "have you done any data governance work?", these three projects give you specific, detailed answers backed by real code.'},
        {type:'table', headers:['Project','Language','Skill Area','Time','Key Output'], rows:[
          ['A — PII Scanner',          'Python', 'PII detection + classification',      '~1 hr', 'JSON compliance report'],
          ['B — Classification Audit', 'SQL',    'Governance audit + compliance evidence', '~1 hr', '5 SQL queries + CTE summary'],
          ['C — DSAR Mapper',          'SQL',    'DSAR response + data lineage',         '~1 hr', 'Structured customer data map'],
        ]},
      ]
    },
    {
      id: 'concepts', label: '&#128214; Project Guides',
      sections: [{type:'accordion', items:[
        {
          title: 'Project A Guide — PII Scanner (Python)',
          sections: [
            {type:'callout', variant:'info', title:'&#128204; Scenario',
              body:'You have joined a bank\'s data governance team. You have a CSV export of a legacy customer database about to be migrated to the cloud. Before migration: understand what it contains, detect PII, assign a classification label, and write a compliance report.'},
            {type:'ul', items:[
              '<strong>Step 1</strong>: Load with <code>pd.read_csv</code>. Use <code>head()</code>, <code>info()</code>, <code>describe()</code> to understand structure.',
              '<strong>Step 2</strong>: Write regex patterns for email, UK phone, UK NI number, date of birth, credit card number.',
              '<strong>Step 3</strong>: Loop over every column. Calculate a match rate (% of values that match each pattern — not just yes/no).',
              '<strong>Step 4</strong>: Apply classification decision tree: NI number or credit card → Restricted; DOB or phone → Confidential; email alone → Confidential.',
              '<strong>Step 5</strong>: Output a JSON report with filename, scan date, column findings, final label, and recommendation.',
            ]},
            {type:'callout', variant:'success', title:'&#9989; Key Learning',
              body:'Match rate matters more than binary match/no-match. A column where 3% of values match an email pattern is probably not an email column — it might be a notes field where a few users happened to type an email address. A column where 98% of values match is definitely an email column. This nuance (threshold-based classification) is exactly what real classification tools do.'},
          ]
        },
        {
          title: 'Project B Guide — Classification Audit (SQL)',
          sections: [
            {type:'callout', variant:'info', title:'&#128204; Scenario',
              body:'A GDPR audit is coming in 6 weeks. The compliance team needs evidence: all customer data is classified, no unclassified sensitive tables exist, access to Restricted data is monitored, and confidence scores meet the 85% threshold.'},
            {type:'ul', items:[
              '<strong>Step 1 — Coverage</strong>: LEFT JOIN information_schema.tables to data_catalog. Calculate % of tables with a label.',
              '<strong>Step 2 — Gap analysis</strong>: Find tables with PII-looking column names (email, phone, dob, ni_number) but no classification label.',
              '<strong>Step 3 — Access audit</strong>: JOIN access_logs to data_catalog. Who accessed Restricted data this month?',
              '<strong>Step 4 — Confidence review</strong>: Filter data_catalog for auto-labelled entries with confidence_score < 0.85.',
              '<strong>Step 5 — Summary CTE</strong>: Combine all four checks into a single compliance summary row.',
            ]},
            {type:'callout', variant:'warning', title:'&#9888; Why LEFT JOIN in Step 1?',
              body:'Using INNER JOIN would only return tables that exist in both information_schema and data_catalog. You need LEFT JOIN to keep all tables from information_schema — including the ones with no catalog entry at all. Those are the uncatalogued tables you need to find. The coverage gap IS the answer, and INNER JOIN hides it.'},
          ]
        },
        {
          title: 'Project C Guide — DSAR Data Flow Mapper (SQL)',
          sections: [
            {type:'callout', variant:'info', title:'&#128204; Scenario',
              body:'A customer has submitted a GDPR Article 15 right of access request. They want to know: "Where does my data go?" You need to map every system that holds or processes data about them — with classification context and third-party disclosures.'},
            {type:'p', text:'<strong>Data flow concept</strong>: Customer fills in a form → API → database → analytics warehouse → reporting tool. Each hop is a separate system that may hold the customer\'s data.'},
            {type:'ul', items:[
              '<strong>Step 2</strong>: Query <code>customer_data_map</code> to find all systems and tables holding this customer\'s data.',
              '<strong>Step 3</strong>: LEFT JOIN to <code>data_catalog</code> to add classification label to each system entry.',
              '<strong>Step 4</strong>: LEFT JOIN to <code>third_party_sharing</code> to surface any vendor disclosures.',
              '<strong>Step 5</strong>: Final query joins everything including retention policies. Output is the DSAR response document.',
            ]},
            {type:'callout', variant:'danger', title:'&#128680; Parameterisation is Non-Negotiable',
              body:'The customer_id must always be parameterised (<code>:target_customer_id</code>), never string-interpolated. Interpolating user-provided values directly into SQL is a SQL injection vulnerability. In any interview, if asked about the code, mention this proactively — it shows security awareness.'},
          ]
        },
      ]}]
    },
    {
      id: 'code', label: '&#128187; Code',
      sections: [
        {type:'h2', text:'Project A — PII Scanner (Python, all 5 steps)'},
        {type:'code', lang:'python', title:'Step 1 — Load and explore the dataset', caption:'The three essential exploration commands for any new dataset.', code: proj_a_step1},
        {type:'code', lang:'python', title:'Step 2 — PII regex patterns', caption:'Five core patterns: email, UK phone, UK NI number, date of birth, credit card.', code: proj_a_step2},
        {type:'code', lang:'python', title:'Step 3 — Scan columns for PII', caption:'Calculate match rates per column — threshold-based detection, not binary yes/no.', code: proj_a_step3},
        {type:'code', lang:'python', title:'Step 4 — Classify based on findings', caption:'Decision tree: the most sensitive PII type found determines the overall classification label.', code: proj_a_step4},
        {type:'code', lang:'python', title:'Step 5 — Output compliance report (JSON)', caption:'The deliverable for the compliance team: structured, dated, with recommendation.', code: proj_a_step5},
        {type:'h2', text:'Project B — Classification Audit SQL'},
        {type:'code', lang:'sql', title:'All 5 audit queries + CTE summary', caption:'Steps 1–5 in sequence: coverage → gaps → access → confidence → summary CTE.', code: proj_b_sql},
        {type:'h2', text:'Project C — DSAR Data Flow Mapper SQL'},
        {type:'code', lang:'sql', title:'All 5 DSAR mapping queries', caption:'Steps 2–5: find data → add classification → add third parties → full DSAR output.', code: proj_c_sql},
      ]
    },
    {
      id: 'projects', label: '&#127891; Extensions',
      sections: [
        {type:'h2', text:'Extension Challenges'},
        {type:'callout', variant:'info', title:'&#128161; How to Use These',
          body:'If you complete the core projects and want to push further, the extensions below add real complexity. Each one is also a good interview story: "I built X and then extended it by doing Y."'},
        {type:'html', content:`
<div class="project-card">
  <div class="project-header"><div class="project-title">A2 — PII Scanner: Folder Scan</div><div class="project-time">~20 min</div></div>
  <div class="project-tags"><span class="tag">Python</span><span class="tag">Extension</span></div>
  <p>Extend Project A to scan an entire folder of CSV files rather than a single file. Produce a single consolidated report showing: total files scanned, how many contain PII, the label distribution across all files, and which file has the most sensitive data.</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">B2 — Audit: Confidence Drift Over Time</div><div class="project-time">~20 min</div></div>
  <div class="project-tags"><span class="tag">SQL</span><span class="tag">Extension</span></div>
  <p>If your data_catalog has a scan_history table (one row per rescan), write a query that identifies tables whose confidence score has <em>decreased by more than 0.10</em> between the previous scan and the latest scan. These are classification drift candidates requiring human review.</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">C2 — DSAR: Automated Response Letter</div><div class="project-time">~20 min</div></div>
  <div class="project-tags"><span class="tag">Python + SQL</span><span class="tag">Extension</span></div>
  <p>Extend Project C to generate an actual DSAR response letter in plain English. Query the SQL, then format the output in Python as a Word document or HTML email that the compliance team can send directly to the customer. Include: a plain-English summary of each system, what data it holds, and who it was shared with.</p>
</div>`}
      ]
    },
    {
      id: 'quiz', label: '&#129300; Quiz',
      sections: [
        {type:'h2', text:'Knowledge Check'},
        {type:'quiz', questions:[
          {q:'In Project A, why do we calculate a match rate (e.g. 94% of values match the email pattern) rather than just checking if any value matches?',
           options:['Match rate is faster to compute','Binary match/no-match gives too many false positives. A column where 3% of values match email pattern is probably a notes field where users happened to type emails. 94% match rate = almost certainly an email column. Threshold-based detection is how real classification tools work.','Match rate is a GDPR requirement','Binary match is more accurate than rate'],
           correct:1, explanation:'This distinction shows you understand how classification tools work in practice. Real-world data is messy — free text fields can contain email-like strings without being email columns. Match rate filtering (e.g., flag only if >80% of non-null values match) dramatically reduces false positives while maintaining recall for actual PII columns.'},
          {q:'In Project B Step 1, why must you use LEFT JOIN rather than INNER JOIN when measuring classification coverage?',
           options:['LEFT JOIN is faster','INNER JOIN would only return tables present in both information_schema AND data_catalog, hiding the uncatalogued tables entirely. LEFT JOIN keeps all tables from information_schema, showing NULLs for uncatalogued ones. The coverage gap is the answer — INNER JOIN hides it.','INNER JOIN cannot handle NULLs','LEFT JOIN is required by SQL standard for coverage queries'],
           correct:1, explanation:'This is a common SQL interview question for data governance roles. The whole point of the coverage check is to find what is missing. If you use INNER JOIN, tables with no catalog entry don\'t appear — you\'d report 100% coverage even if half your database is uncatalogued. The NULL entries from LEFT JOIN are the evidence of the gap.'},
          {q:'A customer submits a GDPR Article 15 request asking "where does my data go?" What SQL technique does Project C use to trace data to third parties?',
           options:['UNION across all tables','LEFT JOIN to a third_party_sharing table, allowing the query to surface vendor disclosures alongside the classification label of the source table. A NULL in vendor_name means the data was not shared externally.','Subquery with EXISTS','RECURSIVE CTE to traverse data lineage'],
           correct:1, explanation:'The JOIN to a third_party_sharing table maps each source table to any vendor that received data from it. The LEFT JOIN is important — you want to return every system even if it has no third-party disclosures. INNER JOIN would only show systems with external sharing, missing the ones that hold data internally only.'},
          {q:'In Project C, why must the customer_id be passed as a parameterised query (:target_customer_id) rather than embedded directly in the SQL string?',
           options:['Parameterisation is faster','Parameterisation is a formatting convention only','Direct string interpolation is a SQL injection vulnerability. If the customer ID comes from any external input and is embedded directly, a malicious value could modify the query and access or delete data it should not. Parameterisation is a core OWASP Top 10 defence.','Parameterised queries are required by GDPR'],
           correct:2, explanation:'SQL injection is the most common database vulnerability (OWASP Top 10). Even if the customer ID is expected to be a number, parameterisation is non-negotiable. In an interview, proactively mentioning parameterisation when reviewing SQL code signals security awareness — a key trait for anyone handling sensitive customer data.'},
          {q:'What makes the CTE (WITH clause) in Project B Step 5 more useful than running the four queries separately?',
           options:['CTEs are faster than separate queries','CTEs are required for compliance reports','The CTE combines all four audit checks into a single result row — one number each for coverage %, gap count, and labels needing review. A compliance officer can run one query and see the full picture. Multiple separate queries require manual aggregation and can show inconsistent snapshots if data changes between runs.','CTEs prevent SQL injection'],
           correct:2, explanation:'Beyond readability, the CTE approach provides atomicity for reporting: all four sub-queries execute against the same snapshot of data, preventing the situation where the coverage percentage was calculated at 9am and the gap count at 9:01am after a new table was added. For audit evidence, consistency matters.'},
        ]}
      ]
    }
  ]
});
};
