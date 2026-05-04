# Exercise 4 — End-to-End Labeling Workflow (~45 min)

> **Role:** Privacy Analyst. **Stakeholder:** DSPM Engineer pushed 200 new auto-proposals overnight. You have to clear the queue before the daily compliance stand-up at 10 a.m.

This exercise walks the full **auto → review → publish → audit** cycle that real banks run continuously.

## Phases

### Phase A — Auto-classification (DSPM Engineer)

```bash
python 02_pii_scanner.py             # generate findings
python 03_classifier_simulator.py    # apply >= 0.85 confidence as labels
```

Confirm in SQL:

```sql
SELECT classified_by, count(*) FROM bank.data_catalog GROUP BY classified_by;
```

### Phase B — Human review (Privacy Analyst)

```bash
python 04_label_review.py
```

Walk through the queue. For each one, ask three questions before pressing a key:

1. **Does the column name match the rule's intent?** (e.g. `mortgage_account_number` looks like an account number but the suggested label might be wrong.)
2. **Are sample values consistent?** (Open Adminer, run `SELECT column FROM table LIMIT 5;`.)
3. **Who is the data owner?** (For now, default to `farouk.ahmed@dga-bank.test`.)

Process at least 5 candidates. Mix `accept`, `override`, and `reject` so you exercise all branches.

### Phase C — Coverage check (DSPM + Privacy together)

```bash
python 05_audit_report.py             # prints to terminal
# or, to save the report to a file:
python 05_audit_report.py -o coverage_report.md
```

Open the file (or scroll the terminal output). The first table is the coverage matrix: every table, % classified.

**Question for your stand-up:** which table has the lowest coverage? (Hint: it should be `transactions` or `dsar_requests` — these were intentionally seeded with no labels.)

### Phase D — Close the loop

Pick the worst-covered table and write the missing rows yourself. Use this template:

```sql
INSERT INTO bank.data_catalog
  (schema_name, table_name, column_name, classification_label, pii_category,
   confidence_score, classified_by, classified_at, last_reviewed_at, data_owner)
VALUES
  ('bank','transactions','txn_id',        'Internal',          'identifier', 1.000,'human',now(),now(),'farouk.ahmed@dga-bank.test'),
  ('bank','transactions','account_id',    'Restricted',        'financial',  1.000,'human',now(),now(),'farouk.ahmed@dga-bank.test'),
  ('bank','transactions','posted_at',     'Internal',          'metadata',   1.000,'human',now(),now(),'farouk.ahmed@dga-bank.test'),
  ('bank','transactions','amount_pence',  'Restricted',        'financial',  1.000,'human',now(),now(),'farouk.ahmed@dga-bank.test'),
  ('bank','transactions','txn_type',      'Internal',          'metadata',   1.000,'human',now(),now(),'farouk.ahmed@dga-bank.test'),
  ('bank','transactions','counterparty',  'Restricted',        'identity',   1.000,'human',now(),now(),'farouk.ahmed@dga-bank.test'),
  ('bank','transactions','reference',     'Highly Restricted', 'spillage',   1.000,'human',now(),now(),'farouk.ahmed@dga-bank.test'),
  ('bank','transactions','channel',       'Internal',          'metadata',   1.000,'human',now(),now(),'farouk.ahmed@dga-bank.test');
```

Why is `reference` **Highly Restricted**? Run this:

```sql
SELECT reference FROM bank.transactions WHERE reference ILIKE 'For %' LIMIT 5;
```

That free-text field contains DOBs and full names — a classic spillage point. Many real banks have GDPR fines tied to free-text fields exactly like this.

### Phase E — Re-run the audit

```bash
python 05_audit_report.py
```

Coverage should now be visibly higher. **Save this Markdown report — that's the artefact you bring to the next compliance review.**

## Reflection

- How long would this whole workflow take at a real bank? (~daily for routine deltas, weekly for new tables, quarterly for full reviews.)
- Who signs off the report before it goes to the regulator? (Data Protection Lead.)
- What auto-trigger would speed this up? (Hook the scanner into the deployment pipeline so any new table fails CI without a catalog entry.)

[Solution / extended walkthrough in SOLUTIONS.md](SOLUTIONS.md#exercise-4)
