# Exercise 1 — Find Unclassified PII (~25 min)

> **Role:** DSPM Engineer. **Stakeholder:** Compliance Officer is preparing the quarterly DORA evidence pack and needs a list of every column the bank holds that *looks like* PII but has no classification label.

## Goal

Write a SQL query against the lab database that returns:

- Every column in the `bank` schema with no row in `data_catalog`,
- Filtered to those whose name suggests PII (NINO, passport, account, IBAN, email, phone, DOB, address, postcode, name).

Order results so the most populated tables come first (more rows = more risk).

## Constraints

- **Single SELECT.** No procedural code, no temporary tables.
- Must use `information_schema.columns` and `information_schema.tables`.
- Must `LEFT JOIN` `bank.data_catalog` and filter where the join misses.
- Output columns: `table_name`, `column_name`, `data_type`, `est_row_count`.

## How to run

```bash
docker compose exec db psql -U dga -d dataguard
```

Then paste your query. (Or paste it into Adminer at <http://localhost:8080>.)

## What good looks like

A real bank's classification register starts at 0% coverage and climbs over months. A query like yours is run weekly to spot regression — when an engineer adds a new table without a corresponding catalog entry, this query catches it within 7 days.

## Verify

When complete, your query should return roughly **10–14 rows** (depends on which tables you flag). Examples that *should* appear: `transactions.reference`, `customers.passport_number`, `accounts.iban`, `accounts.balance_pence`. (Note: `customers.phone` is *pre-classified* in the seed and should not appear; if it does, add a join condition to filter it out.)

## Bonus

Extend the query to also flag columns whose `last_reviewed_at` is older than 180 days — these are *stale* labels that may no longer reflect reality.

[Solution in SOLUTIONS.md](SOLUTIONS.md#exercise-1)
