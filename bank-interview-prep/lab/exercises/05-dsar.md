# Exercise 5 — Fulfill a DSAR (~30 min)

> **Role:** Privacy Analyst. **Stakeholder:** A customer wrote in 28 days ago invoking GDPR Article 15. You have **2 days** to deliver every piece of personal data the bank holds about them, in a portable format.

## Goal

Given `customer_id = 42`:

1. Identify every table in the bank that contains data about that customer.
2. Extract a complete portable export (JSON).
3. Confirm the DSAR row is closed with `status='fulfilled'`.

## Why this is hard

The customer's data does not live in one table. It's joined across:

- `customers` — direct identifiers
- `accounts` — accounts they own
- `transactions` — every payment they ever made
- `dsar_requests` — the request itself
- `access_logs` — who accessed their data (yes, this is in scope under GDPR Art. 15)

If you miss one table, the bank is non-compliant. The classification register is the **map** that tells you where to look.

## Tasks

### 1. Discover all tables holding customer data

Use the catalog. Any column tagged with `pii_category IN ('identity','contact','financial')` whose table has a foreign key chain back to `customers` is in scope.

```sql
-- Tables that classify some column as customer PII
SELECT DISTINCT schema_name, table_name
FROM bank.data_catalog
WHERE pii_category IN ('identity','contact','financial')
ORDER BY table_name;
```

### 2. Build the export

Write a single SQL block (or a `psql -c` invocation) that produces a JSON document like:

```json
{
  "customer": { "customer_id": 42, "full_name": "...", "email": "...", "dob": "..." },
  "accounts": [...],
  "transactions": [...],
  "dsar_history": [...],
  "access_audit": [ /* who at the bank looked at this customer's data */ ]
}
```

Use `jsonb_agg()` and `to_jsonb()`. Hint:

```sql
SELECT jsonb_build_object(
  'customer',     to_jsonb(c.*),
  'accounts',     (SELECT jsonb_agg(a) FROM bank.accounts a WHERE a.customer_id = c.customer_id),
  ...
)
FROM bank.customers c
WHERE c.customer_id = 42;
```

### 3. Mark the DSAR fulfilled

```sql
UPDATE bank.dsar_requests
SET status='fulfilled',
    fulfilled_at=now(),
    handler_email='chloe.nguyen@dga-bank.test',
    notes='Exported full record set on ' || now()::date
WHERE customer_id = 42 AND status IN ('open','in_progress');
```

### 4. Verify the audit trail

The fact that *you* ran this query also lands in `access_logs` at a real bank. Confirm:

```sql
SELECT * FROM bank.access_logs WHERE accessed_at >= now() - interval '5 minutes';
```

(In our lab, access_logs is seeded historically; in production, the database emits one row per query via `pg_stat_statements` + a trigger.)

## Edge cases

- **What if the customer was deleted?** GDPR Art. 17 (right to erasure) — different exercise. The catalog should track deletion timestamps too.
- **What about backups?** Backups taken before the DSAR is fulfilled remain in scope until expiry of retention.
- **What if the customer asks for transactions over £10,000 only?** You can scope, but you must explain the scope clearly in the response.

## What good looks like

Mature banks **automate the DSAR pipeline**. The Privacy team clicks one button; the system runs queries against every system tagged with that customer's identifier; a portable PDF + JSON bundle is generated; an automated cover letter is appended; everything is delivered through a secure portal. Without classification, none of this is possible — the system has no idea where to look.

## Reflection

- DSAR statutory deadline under GDPR Article 12(3): **one calendar month**, extendable by two further months for complex requests.
- If the bank misses the deadline, the regulator can fine up to **4% of global turnover** under GDPR Article 83.
- Your `data_catalog` IS the bank's "where does data live" map. **The quality of your classification programme is the speed at which you can fulfill DSARs.**

[Solution in SOLUTIONS.md](SOLUTIONS.md#exercise-5)
