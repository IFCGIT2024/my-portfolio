# Lab Solutions

Open this **only after** attempting each exercise. Each solution shows one valid answer; in real work there are usually 2–3 acceptable approaches.

---

## Exercise 1

```sql
SELECT
    c.table_name,
    c.column_name,
    c.data_type,
    s.n_live_tup AS est_row_count
FROM information_schema.columns c
JOIN information_schema.tables t
       ON t.table_schema = c.table_schema
      AND t.table_name   = c.table_name
      AND t.table_type   = 'BASE TABLE'                      -- exclude views
LEFT JOIN bank.data_catalog dc
       ON dc.schema_name = c.table_schema
      AND dc.table_name  = c.table_name
      AND dc.column_name = c.column_name
LEFT JOIN pg_stat_user_tables s
       ON s.schemaname = c.table_schema
      AND s.relname    = c.table_name
WHERE c.table_schema = 'bank'
  AND dc.catalog_id IS NULL                                  -- the LEFT JOIN miss
  AND (
        c.column_name ILIKE '%nino%'           OR
        c.column_name ILIKE '%passport%'       OR
        c.column_name ILIKE '%account%'        OR
        c.column_name ILIKE '%iban%'           OR
        c.column_name ILIKE '%email%'          OR
        c.column_name ILIKE '%phone%'          OR
        c.column_name ILIKE '%dob%'            OR
        c.column_name ILIKE '%date_of_birth%'  OR
        c.column_name ILIKE '%address%'        OR
        c.column_name ILIKE '%postcode%'       OR
        c.column_name ILIKE '%name%'           OR
        c.column_name ILIKE '%balance%'
      )
ORDER BY est_row_count DESC NULLS LAST, c.table_name, c.column_name;
```

**Bonus (stale labels):** add `OR (dc.last_reviewed_at IS NOT NULL AND dc.last_reviewed_at < now() - interval '180 days')` and remove the `dc.catalog_id IS NULL` guard.

---

## Exercise 2

```sql
-- 1. The mediating view
CREATE OR REPLACE VIEW bank.v_branch_customer_summary AS
SELECT
    c.customer_id,
    'Customer #' || c.customer_id::text                      AS pseudonym,
    c.email,
    EXTRACT(YEAR FROM c.date_of_birth)::int                  AS year_of_birth,
    COUNT(a.account_id)                                      AS n_accounts,
    ROUND(COALESCE(SUM(a.balance_pence),0) / 100.0)::bigint  AS total_balance_pounds
FROM bank.customers c
LEFT JOIN bank.accounts a USING (customer_id)
GROUP BY c.customer_id, c.email, c.date_of_birth;

-- 2-4. The role and user
CREATE ROLE r_branch_staff NOLOGIN;
GRANT CONNECT ON DATABASE dataguard          TO r_branch_staff;
GRANT USAGE   ON SCHEMA bank                 TO r_branch_staff;
GRANT SELECT  ON bank.v_branch_customer_summary TO r_branch_staff;

CREATE USER branch_demo WITH PASSWORD 'lab_branch_2026' IN ROLE r_branch_staff;

-- 5. Verify
SET ROLE branch_demo;
SELECT * FROM bank.customers LIMIT 1;                  -- ERROR: permission denied for table customers
SELECT * FROM bank.v_branch_customer_summary LIMIT 1;  -- one row
RESET ROLE;
```

**Defensive checks:** a new column added to `customers` is *not* automatically exposed because the view is pinned to the listed columns. Password rotation should be enforced via Postgres `valid until` (`ALTER USER ... VALID UNTIL '2026-08-01'`). Audit logging via `pgaudit` extension or a SELECT-trigger is the standard production answer.

---

## Exercise 3

The first edit (`column_pattern = '%marketing_email%'` + `suggested_label = 'Public'`) is **wrong**. Personal email addresses remain PII under GDPR even when published, because the regulation classifies them by the data subject's relationship to the data, not by the publisher's intent.

The correct answer is to leave the existing rule alone and **add a new, more specific rule**:

```sql
INSERT INTO bank.classification_rules
  (rule_name, pii_category, suggested_label, column_pattern, base_confidence, notes)
VALUES
  ('Marketing distribution list', 'contact', 'Public', '%marketing_email%', 0.85,
   'Bulk marketing lists with explicit opt-in are Public per Marketing Ops policy v3.');
```

Postgres has no native rule priority field in this lab, so a real implementation would add a `priority INTEGER` column and pick the highest-priority match per column. Worth proposing in your interview answer.

---

## Exercise 4

There is no single right answer — what matters is that you exercised every branch (accept, override, reject) and that the final coverage report shows `transactions` moving from 0% to ~100% classified.

Key takeaways most candidates miss in interviews:

- **Reference / free-text fields are spillage.** They contain copies of identifiers from the structured fields. Real bank classifiers run NER (Named Entity Recognition) over them — Microsoft Presidio, AWS Comprehend, or in-house spaCy pipelines.
- **Auto-applied labels at confidence ≥ 0.95 still need human review at intervals.** The standard cadence is annual for stable tables, quarterly for high-churn tables, and on-change for anything triggered by a CI hook.
- **The audit report is the artefact.** The classifier is just the means.

---

## Exercise 5

```sql
SELECT jsonb_pretty(
  jsonb_build_object(
    'customer',      to_jsonb(c.*) - 'nino' - 'passport_number',  -- redact at export time? policy choice
    'accounts',      (SELECT jsonb_agg(to_jsonb(a)) FROM bank.accounts     a WHERE a.customer_id = c.customer_id),
    'transactions',  (SELECT jsonb_agg(to_jsonb(t))
                      FROM bank.transactions t
                      JOIN bank.accounts     a ON a.account_id = t.account_id
                      WHERE a.customer_id = c.customer_id),
    'dsar_history',  (SELECT jsonb_agg(to_jsonb(d)) FROM bank.dsar_requests d WHERE d.customer_id = c.customer_id),
    'access_audit',  (SELECT jsonb_agg(jsonb_build_object(
                                'employee', e.full_name,
                                'department', e.department,
                                'table', al.table_accessed,
                                'when', al.accessed_at))
                      FROM bank.access_logs al
                      JOIN bank.employees   e ON e.employee_id = al.employee_id
                      WHERE al.table_accessed IN ('bank.customers','bank.accounts','bank.transactions'))
  )
) AS dsar_export
FROM bank.customers c
WHERE c.customer_id = 42;
```

```sql
UPDATE bank.dsar_requests
SET status='fulfilled', fulfilled_at=now(), handler_email='chloe.nguyen@dga-bank.test',
    notes='Full export delivered via secure portal on ' || now()::date
WHERE customer_id = 42 AND status <> 'fulfilled';
```

In production this is **NEVER** a single SQL statement — the data is fragmented across 30+ systems (CRM, card processor, KYC vendor, mortgage origination, fraud screening, etc.). The catalog is the only thing that makes the export possible at scale. That is *why* this entire course exists.
