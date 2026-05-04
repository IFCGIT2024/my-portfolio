# Exercise 3 — Run, Read, Tune the PII Scanner (~30 min)

> **Role:** DSPM Engineer. **Stakeholder:** Privacy team complains the scanner is flagging too many `email` columns as `Restricted` when they should be `Internal`.

## Goal

1. Run the scanner end-to-end.
2. Inspect the findings table.
3. Tune one rule to reduce a false positive.
4. Re-run and confirm the change.

## How to run

```bash
cd lab/python
source .venv/bin/activate     # or .venv\Scripts\Activate.ps1 on Windows PS

python 01_smoke_test.py
python 02_pii_scanner.py            # writes findings
python 03_classifier_simulator.py   # auto-applies high-confidence ones
```

## Inspect

Open Adminer (or psql) and run:

```sql
SELECT severity, count(*) FROM bank.audit_findings WHERE category='pii_candidate' GROUP BY severity;
SELECT * FROM bank.audit_findings WHERE category='pii_candidate' ORDER BY (evidence->>'confidence')::numeric DESC LIMIT 20;
```

## Tune

The seed contains a rule called `Email address` that suggests `Internal`. Suppose Privacy reports a different team's `internal_email` is now public-facing marketing copy and should be `Public`. **Without changing the schema**, modify the rule:

```sql
UPDATE bank.classification_rules
SET suggested_label = 'Public',
    column_pattern  = '%marketing_email%',
    notes           = 'Public marketing distribution lists only.'
WHERE rule_name = 'Email address';
```

Then re-run `02_pii_scanner.py`. What changed in the findings table? Was your change the right call? (The instructor's answer: **no — narrowing the column pattern is fine, but downgrading email to Public is wrong; emails are still PII under GDPR.** Revert and instead create a *new* rule for `marketing_email` with label `Public`.)

## What good looks like

Tuning a classifier is **rule writing, not parameter knob-twisting**. Every rule change has a one-paragraph justification, an owner, and a rollback plan. A real bank's classifier runs ~150–500 rules; a 1-rule change can produce thousands of label flips and trigger a cascade of human reviews.

## Reflection questions

- If you change a rule that's already auto-applied to 4,000 columns, what should happen to those existing labels? (Answer: they should be queued for human re-review, not silently overwritten.)
- The `value_regex` for emails is simplified. What real-world email addresses does it miss? (Answer: addresses with `+` aliases, internationalised domains, IPv6 literals.)

[Solution / discussion in SOLUTIONS.md](SOLUTIONS.md#exercise-3)
