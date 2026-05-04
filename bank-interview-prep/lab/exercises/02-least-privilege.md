# Exercise 2 — Least-Privilege Role (~30 min)

> **Role:** DSPM Engineer + IAM Admin. **Stakeholder:** Head of Retail wants 12 new branch staff to have *some* customer visibility for service queries, but absolutely no access to NINO, passport, sort code, or account number.

## Goal

Create a Postgres role `r_branch_staff` and a login user `branch_demo` that can:

- ✅ See pseudonymized customer rows (by ID, with email and year-of-birth only),
- ✅ See account types and balances aggregated by customer,
- ❌ **Not** read any column flagged `Restricted` or `Highly Restricted` in `data_catalog`,
- ❌ Not write anything, anywhere.

## How to run

The lab already has `r_data_analyst` and `analyst_chloe` as a starting reference (see `sql/04_users_and_roles.sql`). Build on that pattern.

```bash
docker compose exec db psql -U dga -d dataguard
```

## Tasks

1. **Create a view** `v_branch_customer_summary` that joins `customers` and `accounts` but exposes only:
   - `customer_id`
   - `pseudonym` (e.g. `'Customer #42'`)
   - `email`
   - `year_of_birth`
   - `n_accounts`
   - `total_balance_pounds` (rounded to nearest pound, *not* pence)
2. **Create the role** `r_branch_staff` with no login.
3. **Grant** `CONNECT`, `USAGE` on schema, and `SELECT` on the view only.
4. **Create the user** `branch_demo` with a password, in role `r_branch_staff`.
5. **Verify** by switching role and attempting:
   ```sql
   SET ROLE branch_demo;
   SELECT * FROM bank.customers LIMIT 1;            -- expect: ERROR permission denied
   SELECT * FROM bank.v_branch_customer_summary LIMIT 1;  -- expect: success
   RESET ROLE;
   ```

## Defensive design checks

Before declaring done, answer these in a comment block at the top of your script:

- What happens if a future engineer adds a new column called `passport_number_v2` to `customers`? Does your role inadvertently expose it?
- What rotation policy does the password have?
- Is there an audit log of branch staff queries? Where?

## What good looks like

The pattern is **mediated access through views**. Branch staff never query base tables. The view is the contract — change it intentionally, and you change what 200 staff can see.

[Solution in SOLUTIONS.md](SOLUTIONS.md#exercise-2)
