# MODULE 1: SQL for Data Analysts

## Goal
A learner who has seen SQL once but never used it professionally should finish this module able to write classification audit queries from scratch — and explain *why* each line exists.

---

## Part 1 — What is a Database and Why Should You Care?

**Concept: What is data?**
In a bank, everything is a record: a customer, a transaction, an account. Data is just structured information. Before computers, this was a filing cabinet. Now it is a database.

**Concept: What is a relational database?**
A relational database organises data into *tables*. A table is exactly what it sounds like — rows and columns, like a spreadsheet. Each row is one thing (one customer, one transaction). Each column is one fact about that thing (name, date, amount).

Example — imagine a table called `customers`:
```
| id  | full_name       | email                    | date_of_birth | account_type |
|-----|-----------------|--------------------------|---------------|--------------|
| 1   | Jane Smith      | jane.smith@email.com     | 1985-04-12    | current      |
| 2   | Ahmed Hassan    | a.hassan@email.com       | 1992-08-30    | savings      |
| 3   | Liu Wei         | liu.w@email.com          | 1978-01-05    | current      |
```

That table lives in a *database*. A bank might have hundreds of tables. `transactions`, `accounts`, `loans`, `staff`, `audit_logs`, etc.

**Why does this matter for classification?**
Because *some of those columns are sensitive and some are not*. `full_name` is personal data. `email` is personal data. `date_of_birth` is sensitive personal data. `account_type` is not really sensitive. Classification is the process of labelling which data is which — and SQL is the primary tool for finding, checking, and auditing those labels.

---

## Part 2 — What is SQL?

**Concept: SQL is a question language**
SQL stands for Structured Query Language. It is a standardised language for *asking questions of a database*. You write SQL to say "give me all the customers who opened accounts this year" or "show me every transaction over £10,000" or "find every table that contains someone's National Insurance number."

**The key insight:** A SELECT statement reads data — it does not modify anything. SQL also includes DML statements (INSERT, UPDATE, DELETE) that do change data, but as a data analyst your work is almost entirely SELECT queries. You write a question. The database gives you an answer.

**Why SQL is so central to data work at a bank:**
- Every compliance report is a SQL query
- Every audit is a SQL query
- Every DSAR (data subject access request — "show me everything you hold about me") is a SQL query
- Every gap analysis ("find data we haven't classified yet") is a SQL query

Banks run on SQL. It is as fundamental to data work as reading is to writing.

---

## Part 3 — The Core Building Blocks

Everything in SQL is built from these ideas. Learn these and you can read any query.

### 3a: SELECT — what do you want?
```sql
SELECT full_name, email
FROM customers;
```
"Give me the full_name and email columns from the customers table."
`SELECT *` means "give me all columns." Use it for exploration. Avoid it in production.

### 3b: WHERE — which rows?
```sql
SELECT full_name, email
FROM customers
WHERE account_type = 'current';
```
"Give me name and email, but only for rows where account_type is 'current'."
WHERE filters rows. You can stack conditions with AND and OR.

### 3c: ORDER BY — in what order?
```sql
SELECT full_name, date_of_birth
FROM customers
ORDER BY date_of_birth DESC;
```
"Give me name and date of birth, youngest customers first (most recently born)."
DESC = descending (biggest first). ASC = ascending (smallest first, the default).

### 3d: COUNT, SUM, AVG — summarise numbers
```sql
SELECT account_type, COUNT(*) AS number_of_customers
FROM customers
GROUP BY account_type;
```
"Tell me how many customers we have *for each account type*."
GROUP BY splits rows into groups. Aggregate functions (COUNT, SUM, AVG, MIN, MAX) then summarise each group.

### 3e: JOIN — combine two tables
This is the most important concept in SQL for classification work.

Why do two tables need to be joined? Because databases are designed to avoid storing the same fact twice. Instead of storing a customer's name on every transaction, you store it once in `customers` and link it by ID.

```sql
SELECT c.full_name, t.amount, t.transaction_date
FROM transactions t
JOIN customers c ON c.id = t.customer_id
WHERE t.amount > 10000;
```
"Show me the name of every customer who made a transaction over £10,000, alongside the amount and date."

LEFT JOIN: a crucial variant. Returns all rows from the left table, even if there is NO matching row in the right table. This is how you find *gaps* — things that should be in a table but aren't.

```sql
SELECT t.table_schema, t.table_name
FROM information_schema.tables t
LEFT JOIN data_catalog dc ON dc.table_schema = t.table_schema
                          AND dc.table_name  = t.table_name
WHERE dc.table_name IS NULL;
-- "Give me all database tables that have NO entry in the data_catalog — i.e., unclassified tables"
-- Joining on both schema AND name is essential: tables in different schemas can share the same name
```

### 3f: HAVING — filter after grouping
WHERE filters individual rows before grouping. HAVING filters the *result of a GROUP BY* — it operates on groups, not rows. You cannot use WHERE on an aggregated value.

```sql
SELECT al.user_id, COUNT(*) AS access_count
FROM access_logs al
JOIN data_catalog dc ON dc.table_name = al.table_name
WHERE dc.classification_label = 'Restricted'
GROUP BY al.user_id
HAVING COUNT(*) > 50;
-- "Find users who accessed Restricted data MORE THAN 50 times — potential anomaly"
```

### 3g: CTEs (Common Table Expressions) — readable multi-step queries
A CTE names a sub-query so you can refer to it by name. This is how all complex compliance reports are written — each logical step gets its own named block, making the query readable rather than a nested mess of sub-selects.

```sql
WITH restricted_access AS (
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
```

CTEs do not improve performance — they improve readability. You will use them in every multi-step audit query. They appear in the Module 8 capstone project, so understand the `WITH ... AS (...)` syntax before you get there.

---

## Part 4 — The Data Catalog: SQL for Classification Work

**Concept: What is a data catalog?**
A data catalog is a special database table (or set of tables) that records *metadata* about your other tables. Instead of storing customer data, it stores facts *about* your data. "This table is called `customers`. It was last scanned on [date]. It contains PII. Its classification label is Confidential."

When a tool like 1touch.io or Microsoft Purview scans your bank's data, it writes its findings into a data catalog. Your job as a data analyst is to *query that catalog*.

**Worked example — the catalog schema:**
```
data_catalog:
| table_schema | table_name  | classification_label | confidence_score | pii_column_count | data_owner | last_scanned_at |

access_logs:
| user_id | table_name | accessed_at | query_type |

sensitivity_labels:
| label_id | label_name        | description                              | policy_id |
|          | Public            | No restrictions                          |           |
|          | Internal          | Staff only, not customer-facing          |           |
|          | Confidential      | Contains personal data                   |           |
|          | Restricted        | Highly sensitive, tightly controlled     |           |
|          | Highly Restricted | Most sensitive — very limited access     |           |
```

Now the earlier queries make sense. Every query in the code examples is a question asked *of the catalog*, not of the raw data itself.

---

## Part 5 — Mini Projects (10–15 minutes each)

**Project 1.1 — "What tables do we have?"**
Given the schema above. Write a query to list every table in the data_catalog and its classification label. Order by label alphabetically.
*Learning goal: SELECT, FROM, ORDER BY*

**Project 1.2 — "Find the gaps"**
Write a query to find every table in `information_schema.tables` that is NOT in `data_catalog`. These are your unclassified tables.
*Learning goal: LEFT JOIN, IS NULL pattern*

**Project 1.3 — "Who has been touching sensitive data?"**
Write a query to find all users who accessed a table labelled 'Restricted' in the last 7 days. Show their user ID and how many times they accessed it.
*Learning goal: JOIN, WHERE with dates, COUNT + GROUP BY*

**Project 1.4 — "Low confidence labels — needs review"**
Write a query that finds all tables where the classification was done automatically but with a confidence score below 0.85. Flag them as "REVIEW REQUIRED".
*Learning goal: CASE WHEN statements, filtering on numeric thresholds*

**Project 1.5 — "The GDPR Request" (Capstone)**
A customer calls and says "I want all data you hold about me." Under GDPR you have one calendar month to respond (extendable to three months for complex requests). Write a query to find every table that contains data for customer_id = 4421.
*Learning goal: Joins to a customer_data_map, parameterised queries (:customer_id), security note about SQL injection*

---

## Part 6 — Why This Matters in an Interview

At this point a learner should be able to answer:
- "Walk me through how you would audit a bank's classification coverage using SQL"
- "How would you find data that has never been classified?"
- "What is a parameterised query and why does it matter in banking systems?"
- "A customer requests all their data under GDPR Article 15. How would you support that technically?"
