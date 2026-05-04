# DataGuard Academy — Full Content Plan
## Module Expansion: From Basics to Expert

---

## THE THROUGH-LINE: Why This Course Exists

Before any module begins, the learner needs to understand the single problem this entire course is solving:

> **A bank holds millions of pieces of data. It does not know what most of it is. That is a legal and security disaster.**

Every module in this course is a piece of the solution to that problem:
- SQL lets you **ask questions** of data at scale
- Python lets you **automate** the asking
- Cloud platforms are **where the data lives**
- Classification systems **label** the data automatically
- Compliance regulations **require** that labelling
- DSPM tools **monitor** that labels stay accurate
- AI/ML makes classification **faster and smarter**
- Mini Projects let you **build and apply** all of it
- The Q&A Bank prepares you to **explain** it in an interview
- The Communication Guide teaches you to **sell** it to stakeholders

This arc should be stated at the top of the Home module and briefly restated at the start of each module.

---

---

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

---

---

# MODULE 2: Python for Automation

## Goal
SQL answers questions about data that already exists in the catalog. Python is used when you need to *process* data, *detect* what type it is, or *automate* tasks that would take a human weeks. By the end of this module, a learner should understand why Python is the second tool in every data analyst's kit — and be able to trace through the PII scanner code line by line.

---

## Part 1 — What is Python and Why Does it Exist?

**Concept: A programming language is a set of instructions**
Python is a language for telling a computer what to do, step by step. Unlike SQL (which asks one question and gets one answer), Python runs a sequence of steps: open this file, read each row, check each value against these patterns, decide what to do with it, save the result.

**Why Python became dominant in data work:**
1. It is readable — it looks like plain English more than any other language
2. It has enormous libraries — pandas for tables, scikit-learn for ML, requests for APIs — someone has already written code for almost any problem
3. It runs everywhere — locally, in the cloud, inside classification tools

**The key difference from SQL:**
SQL is declarative: "give me rows where X." Python is imperative: "for each row, do this, then this, then this." Both are essential. SQL for querying databases. Python for everything else.

---

## Part 2 — The Building Blocks

**Variables — storing values:**
```python
name = "Jane Smith"
age = 38
is_pii = True
```
A variable is a named box. You put something in the box and can refer to it later by name.

**Data types:**
- String: text — `"hello"`, `"jane.smith@email.com"`
- Integer: whole number — `42`, `1000000`
- Float: decimal — `0.95`
- Boolean: True or False
- List: a sequence of things — `["email", "phone", "postcode"]`
- Dictionary: key-value pairs — `{"name": "Jane", "age": 38}`

**Conditionals:**
```python
if confidence_score >= 0.90:
    label = "Accepted"
elif confidence_score >= 0.80:
    label = "Needs Review"
else:
    label = "Rejected"
```

**Loops:**
```python
for column in df.columns:
    print(column)
```
"For every column in this table, print its name." Loops are how automation works — applying the same logic to every row, every file, every table.

**Functions:**
```python
def classify_table(pii_findings):
    # pii_findings is a list e.g. ["email", "credit_card", "nino"]
    # Distinguishing Internal from Public requires business context (is this data
    # externally published?), not PII content alone. Default to Internal for any
    # data found inside bank systems — only data explicitly approved for public
    # release should ever be labelled Public.
    high_sensitivity = {"credit_card", "nino", "passport", "date_of_birth"}
    if any(p in high_sensitivity for p in pii_findings):
        return "Restricted"
    if pii_findings:  # any PII found at all
        return "Confidential"
    return "Internal"  # No PII — Internal is the safe default for internal bank data
```
A function is a named, reusable block of logic. Once defined, you can call it on any data. Note: the above is valid, runnable Python — no pseudocode.

---

## Part 3 — pandas: Python's SQL

pandas is a Python library that lets you work with tabular data in Python the way SQL works in a database. A pandas DataFrame is a table — rows and columns.

```python
import pandas as pd

# Load a CSV file as a table
df = pd.read_csv("customer_data.csv")

# Show the first 5 rows
print(df.head())

# Filter rows (like WHERE)
df[df['account_type'] == 'current']

# Select columns (like SELECT)
df[['full_name', 'email']]

# Count values (like COUNT + GROUP BY)
df['account_type'].value_counts()
```

Why does this matter for classification? Because you will often receive data files from business teams before they are in a database. Python/pandas lets you scan those files for PII before they are ingested.

---

## Part 4 — Regex: The Core of PII Detection

**What is regex?**
Regex (Regular Expression) is a pattern-matching language. It lets you describe the *shape* of something you are looking for. An email address has a shape: `[something]@[something].[something]`. A UK National Insurance number has a shape: two letters, six digits, one letter (e.g. AB123456C).

This is how automated PII detection works. The tool does not *understand* data. It looks for patterns that match known PII shapes.

```python
import re

email_pattern = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}')

# Test it
print(email_pattern.search("jane.smith@example.com"))  # Match found
print(email_pattern.search("not an email"))             # None
```

**Why this is both powerful and limited:**
Powerful — it finds patterns across millions of rows in seconds.
Limited — it cannot understand context. "test@test.com" matches the pattern even if it is clearly not a real person's email. This is why confidence scores exist — and why human review is still needed for low-confidence labels.

---

## Part 5 — API Calls: Talking to Classification Tools

Classification platforms like 1touch.io and Microsoft Purview expose a REST API. That means Python can send them instructions and receive results without a human clicking buttons.

**Concept: What is an API?**
API stands for Application Programming Interface. It is a defined way for two systems to talk to each other. You make an HTTP request (like what a browser does when you open a webpage) and the server sends back data.

The HTTP verbs:
- GET: retrieve something (like SELECT in SQL)
- POST: create or send something (like INSERT)
- PUT/PATCH: update something
- DELETE: remove something

```python
import requests

response = requests.get(
    "https://api.purview.azure.com/labels",
    headers={"Authorization": "Bearer " + token}
)

labels = response.json()
```

**Security note — never hardcode credentials:**
```python
# WRONG — credential in code, will end up in git history
token = "eyJhbGciOiJSUzI1NiIsIn..."

# RIGHT — read from environment variable
import os
token = os.environ.get("PURVIEW_TOKEN")
if not token:
    raise ValueError("PURVIEW_TOKEN environment variable is not set")
```

---

## Part 5b — Environment Setup and Exception Handling

These two topics are not optional extras — they are prerequisites for running any of the code in this course in a real environment.

**Virtual environments — set this up before anything else:**
When you install Python libraries, always use a virtual environment. It isolates this project's dependencies from every other project and from your system Python installation.

```bash
python -m venv venv            # Create a virtual environment called 'venv'
venv\Scripts\activate          # Activate it (Windows)
source venv/bin/activate       # Activate it (Linux/macOS — use this on bank servers)
pip install pandas requests    # Install libraries inside the venv, not globally
```

Without this, conflicting library versions across projects cause failures that are extremely difficult to debug. Every professional Python environment uses virtual environments (or a modern equivalent like `uv` or Poetry).

**try/except — mandatory for any file-processing script:**
Real data is messy. Files have encoding errors. Rows are malformed. Columns expected by the script don't exist. Any script that doesn't handle these failures will crash on the first problem it encounters — which is unacceptable in a bank environment.

```python
try:
    df = pd.read_csv("customer_data.csv", encoding="utf-8")
except FileNotFoundError:
    raise FileNotFoundError("Input file not found — verify the path before rerunning")
except UnicodeDecodeError:
    # Common with legacy bank exports — try latin-1 as fallback
    df = pd.read_csv("customer_data.csv", encoding="latin-1")
except Exception as e:
    print(f"Unexpected error reading file: {e}")
    raise  # re-raise so the caller knows something went wrong
```

Wrap all file I/O, API calls, and database connections in try/except. The `raise` at the end of the generic handler is important — silently swallowing errors is a common and dangerous mistake.

---

## Part 6 — Mini Projects

**Project 2.1 — "Read a file and describe it"**
Write Python to read a CSV file, print the column names, and count how many rows it has.
*Learning goal: pandas basics, df.shape, df.columns*

**Project 2.2 — "Find email addresses"**
Given a DataFrame with a `notes` column containing free text, write a loop that checks each value for email addresses using regex and flags which rows contain them.
*Learning goal: loops, regex, DataFrame filtering*

**Project 2.3 — "Build a PII column scanner"**
Write a function that takes a DataFrame column as input and returns the PII type detected (email, phone, date of birth, none). Test it on 5 columns with different content.
*Learning goal: functions, regex patterns, conditional logic*

**Project 2.4 — "Classification decision tree"**
Given a list of PII findings `["email", "credit_card"]` (containing only the PII types that were *found*), write logic that assigns the correct classification label using the 5-tier model. Use the same input format as the `classify_table` function defined earlier in Part 2.
*Learning goal: nested conditionals, classification logic*

**Project 2.5 — "The Full PII Scanner" (Capstone)**
Combine all the above into a script that: (1) reads a CSV, (2) scans every column for PII patterns, (3) assigns a classification label, (4) outputs a JSON report.
*This is the actual code that exists in the module — now it should be completely understandable*

---

---

# MODULE 3: Cloud & AWS Basics

## Goal
A learner should understand what "the cloud" actually means, how AWS fits into a bank's data architecture, and be able to read and interpret any of the AWS service descriptions, policies, and logs in the module.

---

## Part 1 — What is the Cloud (Really)?

**The misconception:** The cloud is not magic. It is literally computers in a building somewhere that Amazon, Microsoft, or Google owns and manages for you.

**What you are buying:** On-demand access to computing power, storage, and managed services, paying only for what you use. Instead of a bank buying 1,000 physical servers, running a data centre, employing people to maintain hardware — they rent capacity from AWS and turn it on and off as needed.

**Why banks moved to cloud:**
1. Scale — data volumes explode in milliseconds (a trading event, a viral promotion). Cloud can scale. A physical server room cannot.
2. Cost — you pay for what you use. No idle hardware.
3. Managed services — AWS runs the database software. You just use it.
4. Global reach — AWS has 30+ Regions globally, each comprising multiple physically separate data centres (called Availability Zones). A UK bank can run in the London Region but have disaster recovery in Ireland.

**The compliance tension:**
Banks also have strict obligations about *where* data lives (data residency), *who* can access it, and *what happens to it*. Cloud flexibility must be matched with equally careful governance. This is where classification becomes critical in cloud environments.

---

## Part 2 — The Core AWS Services for Data Work

**S3 — Simple Storage Service (think: a filing cabinet)**
S3 stores files (called objects) in containers (called buckets). Every bucket has a name and lives in a region. Every object has a key (like a filename and path).

A bank might have:
- `bank-customer-documents-prod` — customer KYC documents
- `bank-transaction-logs-archive` — 7 years of transaction logs
- `bank-analytics-staging` — raw data files before processing

Why S3 for classification? Because many classification tools scan S3 buckets looking for PII in files. A file called `customer_export_2024.csv` in S3 is scanned — AWS Macie or 1touch.io reads it and labels it.

**IAM — Identity and Access Management (think: keys to rooms)**
IAM controls who can do what. Every action in AWS requires permission. A user, a service, or an application gets an IAM role or policy that says:
- "You may read from this S3 bucket"
- "You may NOT delete from it"
- "You may ONLY access buckets with the tag `env:production`"

For classification: IAM is how you ensure that only authorised systems can access Restricted data. The classification tool needs IAM permission to scan buckets. Humans without permission are blocked.

The design principle underlying all IAM work is the **principle of least privilege (PoLP):** every user, service, and process should be granted only the minimum permissions required to perform its specific function — nothing more. PoLP is one of the most cited security principles in technical interviews. Any answer about access control, IAM design, or cloud security should reference it.

**AWS Macie — automated PII detection in S3**
Macie is AWS's built-in PII scanner. It is enabled at the AWS **account level** (not per-bucket), then configured to include or exclude specific buckets. Once active, it automatically samples files within those buckets, identifies PII (names, credit cards, health data, national IDs), and produces findings with severity ratings. It is the cloud-native, lowest-friction version of what enterprise tools like 1touch.io do at much larger scale — useful but limited to S3 and without the cross-system context awareness of enterprise classification platforms.

**CloudTrail — the audit log (think: CCTV)**
CloudTrail records every API action in AWS. Every time someone reads an S3 object, modifies an IAM policy, or creates a new resource — CloudTrail writes a log entry. This is the technical backbone of audit compliance at a bank.

---

## Part 3 — The Concepts That Underpin Everything

**Encryption:**
Two kinds matter:
- At rest: data on disk is scrambled with a key. Even if someone steals the hard drive, they cannot read it.
- In transit: data moving over a network is encrypted (HTTPS/TLS). Even if someone intercepts the packets, they cannot read them.

Classification determines *which* encryption tier applies. Restricted data must be encrypted with dedicated keys. **AWS KMS (Key Management Service)** is AWS's centralised key management system. Within KMS, **CMKs (Customer Managed Keys)** are encryption keys that you create, own, and control — only your account can use them, you control rotation, and every use is logged in CloudTrail. AWS-managed keys (the default) are controlled by AWS on your behalf. Classification determines which applies: Restricted and Highly Restricted data must use CMKs so the bank retains full key control and audit trail; lower tiers may use AWS-managed keys.

**Bucket Policies vs IAM Policies:**
Bucket policies are attached to the bucket (who can access *this* bucket). IAM policies are attached to a user or role (what *this person/service* can access). They stack — you need both to permit access.

**Tags:**
Tags are key-value metadata you attach to AWS resources. A bank might tag every S3 bucket with:
```
classification: Restricted
data-owner: finance-team
retention: 7-years
environment: production
```
Classification tools use these tags to enforce policies.

**VPCs — Virtual Private Clouds (the network layer everything runs inside):**
A bank does not put sensitive data on the public internet. Every AWS resource that handles customer or financial data lives inside a **VPC** — an isolated, private network within AWS that you define and control.

Key concepts within a VPC:
- **Private subnets:** Network segments with no direct path to the internet. Databases always go here.
- **Public subnets:** For resources that need limited internet access (like a load balancer). Never for data storage.
- **Security groups:** Virtual firewalls attached to individual resources. Define which ports and IPs can connect.
- **NACLs (Network Access Control Lists):** Subnet-level rules that apply before traffic reaches a security group.
- **VPC Endpoints:** Allow private S3 access from within the VPC *without* traffic leaving AWS's network at all. Required for compliant S3 access in banking.

For classification: a classification tool scanning S3 buckets in a bank must do so through VPC endpoints, not over the public internet. An S3 bucket with `Block Public Access` disabled is an immediate red flag — it means data is reachable from anywhere.

---

## Part 4 — Mini Projects

**Project 3.1 — "Read an IAM policy"**
Given a JSON IAM policy, identify: what actions are allowed? On which resources? Are there any conditions?
*Learning goal: reading JSON, understanding Allow/Deny, Resource ARNs*

**Project 3.2 — "Spot the mistake in this bucket policy"**
Given a bucket policy with a security flaw (e.g., `"Principal": "*"` — access allowed to anyone), identify the problem and write the corrected version.
*Learning goal: security thinking, IAM principle of least privilege*

**Project 3.3 — "Interpret a CloudTrail log"**
Given a CloudTrail JSON event, answer: who accessed what? At what time? From which IP? Was the access successful?
*Learning goal: reading JSON logs, audit investigation*

**Project 3.4 — "Design a secure data architecture"**
A new project needs to store customer documents, transaction summaries, and internal analytics data. Design the S3 bucket structure, name the buckets, describe what IAM roles would be needed, and assign classification labels.
*Learning goal: synthesis — applying all cloud concepts to a real scenario*

---

---

# MODULE 4: Data Classification Systems

## Goal
Classification is the core domain of this interview. A learner should be able to explain from first principles *why* automated classification exists, *how* it works, and *where* 1touch.io fits in the landscape.

---

## Part 1 — Why Classification Exists

**The fundamental problem at a bank:**
A large bank holds 50–500 petabytes of data. New data is created every second — every login, every transaction, every email, every uploaded document creates new records. Most of this data has never been categorised.

Without classification:
- You cannot enforce "only these people can see Restricted data" because you do not know which data is Restricted
- You cannot comply with GDPR's requirement to protect personal data because you do not know where all personal data lives
- You cannot respond to a data breach notification in time because you do not know what was stolen

**Shadow data and dark data — the hidden problem:**
Two terms you will encounter in interviews and must be able to define:
- **Shadow data:** Data that exists outside of officially governed systems. An analyst exports a customer table to a personal S3 bucket to build a dashboard. That copy is shadow data — same sensitivity, zero governance.
- **Dark data:** Data the organisation collects and stores but has never analysed, used, or even catalogued. Old backup files, archived logs, legacy database exports. It exists but nobody is managing it.

DSPM tools exist specifically because shadow and dark data are the most dangerous parts of a bank's data estate. You cannot protect what you do not know you have.

**The manual classification problem:**
A bank tried to classify data manually. They hired a team. It took 3 years to classify 10% of their data. The other 90% changed in the meantime. Manual classification does not work at scale.

**The automated classification solution:**
Instead of humans reading every piece of data, an AI system:
1. Scans all data sources (databases, S3, SharePoint, email archives)
2. Reads the structure and content of data
3. Matches patterns against known PII, financial, and health data signatures
4. Assigns a label with a confidence score
5. Flags low-confidence items for human review

This is what 1touch.io Kontxtual™ does.

---

## Part 2 — The Classification Tiers

Classification tier models vary by institution — some banks use 3 tiers, some 4, some 5 or 6. The 5-tier model below is a widely used framework and the right one to articulate in interviews if not given a specific bank's own scheme. Always ask during an interview process which model the organisation uses:

| Tier | Label | Description | Examples |
|------|-------|-------------|----------|
| 1 | Public | Anyone can see it. No protection needed. | Press releases, published interest rates |
| 2 | Internal | Staff only. Not sensitive but not public. | Internal process docs, org charts |
| 3 | Confidential | Contains personal data. GDPR applies. | Customer names, emails, transaction history |
| 4 | Restricted | Highly sensitive. Tightly controlled access. | Passport scans, NI numbers, credit card data |
| 5 | Highly Restricted | The most sensitive category. Very limited access. | Credit decisions, internal investigation files |

Each tier has different policies attached:
- Who can access it
- How it must be encrypted
- How long it can be kept (retention)
- What happens when an incident occurs

**The key concept:** Classification is the bridge between the data and its policies. Label first, then the policies enforce themselves automatically.

**Data owner — the accountability layer:**
Every classified dataset must have a named **data owner** — a person (usually a senior business or technical lead) who is accountable for that data's accuracy, appropriate use, and classification label. Without data ownership, classification becomes an IT exercise with no business accountability.

Data owners are responsible for:
- Approving or disputing labels applied to their datasets
- Reviewing low-confidence classifications that require human judgment
- Authorising access requests for data above Internal tier
- Ensuring retention schedules are applied correctly

In an interview, if asked how a classification programme is governed, the data owner model is the answer.

---

## Part 3 — How Automated Classification Works

The process has five stages:

**Stage 1: Discovery (find the data)**
The classification agent connects to data sources — databases, cloud storage, file shares. It creates an inventory. "This bank has 847 tables, 23 S3 buckets, and 4.2TB of documents on SharePoint."

**Stage 2: Scanning (read the data)**
For each data source, the agent reads a sample (not the whole thing — that would be slow and dangerous). For **structured data** (databases, tables), it reads column names, data types, and a statistical sample of values. For **unstructured data** (PDFs, Word documents, emails, scanned images), it extracts text and applies NLP/NER models to identify PII.

Unstructured data is a major challenge: a PDF customer letter contains the same sensitive data as a database row but has no schema to help. Classification accuracy on unstructured data is typically lower than on structured data — this is why confidence thresholds are higher for document classification.

The agent does NOT copy or store the data — it reads, samples, and writes metadata only.

**Stage 3: Inference (decide what it is)**
Using ML models and rule patterns, it determines: "This column contains UK National Insurance numbers (pattern match: 97% of sampled values match the NI regex). Classification: Restricted."

**Stage 4: Labelling and publishing**
The label and confidence score are written to the data catalog. Dashboards update. Policies can now be enforced.

**Stage 5: Re-scanning and drift detection**
This stage is critical and frequently overlooked in simple explanations. Data changes after it is labelled. A table classified as Internal last year may now contain PII added by a new application feature. A new column `customer_nino` added by a developer creates an undetected Restricted field in an otherwise Internal table.

**Classification drift** is the divergence between a label assigned at one point in time and the true sensitivity of the data as it exists today. Enterprise classification tools address this by:
- Scheduling periodic re-scans (weekly, monthly depending on data change velocity)
- Monitoring schema changes (new columns trigger immediate re-scan)
- Tracking confidence score degradation over time as a signal that data has changed

A bank that classified all its data three years ago and has not re-scanned since has a dangerous false sense of security.

---

## Part 4 — 1touch.io Kontxtual™: The One-Touch Concept

**The core innovation:**
Traditional classification tools require a multi-step process: scan, review, approve, apply — each step requiring human action. 1touch.io introduced "one-touch" — the idea that classification is triggered by a **single action** rather than a manual multi-step workflow. For high-confidence labels, the system classifies and applies the label automatically. Low-confidence results still route to a human review queue. The point is not that humans are removed — it is that the default path requires no manual intervention, dramatically reducing the time from discovery to governed data.

"Kontxtual" refers to context-aware classification. Rather than just looking at a column's values in isolation, it looks at the *context*:
- What table is this column in?
- What are the other columns in the same table?
- What is the database schema suggesting about this data's purpose?
- What application writes to this table?

A column called `ref` containing 9-digit numbers looks meaningless in isolation. In a table called `loan_applications` alongside `applicant_name` and `income`, it is clearly a loan reference number — which has regulatory implications.

**Terminology clarification — sensitivity label vs classification label:**
These terms are often used interchangeably but have distinct meanings in Microsoft's ecosystem (which is common at banks):
- **Classification label:** The label stored in the data catalog against a data asset (table, column, file). Used by discovery and governance tools. Describes the data's sensitivity.
- **Sensitivity label:** A technical object in Microsoft Purview Information Protection that travels *with a file*. When you label a Word document as "Confidential," the sensitivity label is embedded in the file's metadata and persists wherever the file goes — even if sent by email.

A classification label governs the database. A sensitivity label governs the document. Both reflect the same underlying tier model but operate in different technical layers. Use the correct term in context.

---

## Part 5 — The Vendor Landscape

| Tool | Strength | Best For | Limitation |
|------|----------|----------|------------|
| 1touch.io Kontxtual | Automated one-touch, context-aware | Banks wanting minimal manual review | Less mature on legacy on-prem databases; primarily cloud-native |
| Microsoft Purview | Deep Microsoft ecosystem integration | Banks heavily on Azure/M365 | Weaker outside the Microsoft ecosystem; limited support for non-Azure sources |
| Varonis | Strong on file shares, email, and AD | Banks with significant on-prem infrastructure | Slower scan performance at petabyte cloud scale |
| BigID | Privacy-focused, GDPR/CCPA specialist | Banks with complex privacy programmes | Higher implementation complexity and cost |
| Securiti.ai | AI-driven, consent management | Banks needing broad data intelligence | Smaller enterprise customer base; less proven at tier-1 bank scale |

**In an interview:** You will be expected to know these names and be able to articulate at least one strength and one limitation of each.

---

## Part 6 — Mini Projects

**Project 4.1 — "Classify these columns"**
Given 10 column descriptions (name, value samples, table context), assign a classification label to each. Justify your choice.
*Learning goal: applying the 5-tier model using judgment*

**Project 4.2 — "What would you classify this table as?"**
Given a full table schema with column names and sample values, determine the table-level classification label (usually the highest label of any column within it) and explain the reasoning.
*Learning goal: table-level vs column-level classification*

**Project 4.3 — "Design the classification pipeline"**
A bank is starting a classification programme from scratch. Describe the 5 stages. What data sources would you prioritise scanning first and why? What would you do with low-confidence results?
*Learning goal: synthesis and interview preparation*

---

---

# MODULE 5: Compliance & Regulation

## Goal
Compliance is not a box-ticking exercise — it is the reason classification programmes are funded. A learner should be able to explain what each regulation requires, why it requires it, and how classification is the technical mechanism that enables compliance.

---

## Part 1 — Why Regulations Exist at Banks

Banks are not regulated because regulators are bureaucratic. Banks are regulated because they failed spectacularly — 2008 is the canonical example — and the people who paid the price were ordinary citizens, not bankers.

Regulations exist to make banks:
1. Know what data they hold and protect it (GDPR, BCBS 239)
2. Remain operational even during crises (DORA)
3. Be accountable for how AI makes decisions (AI Act)

When you talk about classification in an interview, you should always connect it to a regulation. "We classify data because GDPR Article 25 requires data protection by design" sounds much better than "we classify data because it is good practice."

---

## Part 2 — GDPR Deep Dive

**What is it?**
The General Data Protection Regulation. EU law (UK kept it post-Brexit as UK GDPR). Came into force May 2018.

**What it protects:** Personal data — any information relating to an identified or identifiable natural person.

**Article 6 — Lawful basis for processing (the foundation question):**
GDPR requires a documented lawful basis for *any* processing of personal data. There are six bases. For a UK bank, three are primary:
- **Legal obligation** (Article 6(1)(c)): The most frequently used at banks. AML reporting, tax obligations, regulatory filings, and fraud prevention under FCA rules — the bank is legally required to process this data. No consent is needed or appropriate.
- **Contract** (Article 6(1)(b)): Processing necessary to deliver a service the customer has contracted for — operating their account, processing their payments, issuing their card.
- **Legitimate interests** (Article 6(1)(f)): Fraud prevention analytics, network security monitoring, direct marketing to existing customers. Requires a **Legitimate Interests Assessment (LIA)** — the bank's interest must not be overridden by the individual's rights and freedoms.

The other three bases (consent, vital interests, public task) exist but are less relevant to core banking operations. A bank that cannot identify the lawful basis for any piece of processing commits the most serious category of GDPR violation — Tier 2 fine exposure. Know all six if asked to list them.

**Article 9 — Special category data (a stricter regime):**
Certain categories of personal data attract additional protection and a separate, higher legal threshold. Processing special category data requires *both* a lawful basis under Article 6 *and* a specific condition under Article 9(2). The categories are: health data, biometric data used for unique identification, genetic data, racial or ethnic origin, political opinions, religious or philosophical beliefs, sexual orientation, and trade union membership.

Banks hold more special category data than is often recognised:
- **Health data**: disability adjustments, occupational health records, bereavement-related account changes
- **Biometric data**: voice recognition for telephone banking, facial ID for digital onboarding
- **Inferred characteristics**: financial behaviour patterns that could reveal protected characteristics (e.g., regular payments to religious organisations, spending at specialist medical providers)

Classification of special category data must be reflected in the label — a Restricted or Highly Restricted label is appropriate — and the data handling policy must document the Article 9(2) condition relied upon. In an interview about GDPR and classification, being able to identify special category data as a distinct, higher-risk category is a strong signal.

**The 7 principles (you should be able to recite these):**
1. Lawfulness, fairness, transparency
2. Purpose limitation (collect for one purpose, use only for that)
3. Data minimisation (collect only what you need)
4. Accuracy
5. Storage limitation (don't keep it longer than necessary)
6. Integrity and confidentiality (keep it secure)
7. Accountability

**The link to classification:**
- Principle 6 (security) requires you to protect personal data. You cannot protect it if you don't know where it is. Classification finds it.
- Principle 5 (storage limitation) requires retention policies. Classification enables automatic deletion rules by label.
- Article 25 (data protection **by design and by default**) has two distinct obligations: (1) **by design** — security must be built into systems from the start, not bolted on afterwards; (2) **by default** — by default, only the minimum necessary data should be processed, and privacy-protective settings must be the default, not opt-in. Automated classification supports both: it is embedded in the data ingestion pipeline (by design) and enforces minimum-necessary access through labels (by default).

**The fines — two tiers:**
GDPR has two fine levels. Confusing them in an interview signals shallow knowledge:
- **Tier 1 (less serious violations):** Up to €10M or 2% of global annual turnover — whichever is higher. Applies to obligations around consent, data breach notification, data protection officers, and privacy by design.
- **Tier 2 (more serious violations):** Up to €20M or 4% of global annual turnover — whichever is higher. Applies to violations of data subjects' rights, unlawful processing, and transfers to third countries.

**UK GDPR — what applies at a UK bank:**
Post-Brexit, the UK retained its own version of GDPR ("UK GDPR") enforced by the **ICO (Information Commissioner's Office)**. Fine thresholds mirror the EU tiers but in pounds sterling: up to £8.7M or 2% (Tier 1), and up to £17.5M or 4% (Tier 2) of global annual turnover. For a major UK bank with global revenues, a Tier 2 fine is a nine-figure number. Always quote £ amounts in a UK bank interview, not €.

**Data Subject Rights (you will be asked about these):**
- Article 15: Right of access — "show me everything you hold about me"
- Article 17: Right to erasure ("right to be forgotten") — **important caveat for banking:** this right does not apply where data must be retained under a legal obligation. At a bank, most customer data is subject to mandatory retention under AML (5 years), the Limitation Act (6 years), FCA record-keeping rules, or HMRC requirements. In practice, a customer's erasure request will often be partially fulfilled (marketing preferences) while core financial records are lawfully retained. A candidate who answers "the customer can always request deletion and the bank must comply" has failed this question.
- Article 20: Right to data portability

Each of these requires you to *know where a person's data is*. Classification makes these rights technically fulfillable.

**Article 33 — 72-hour breach notification (the most interview-tested GDPR fact):**
When a personal data breach occurs, the organisation has **72 hours** from becoming aware of it to notify the ICO. This is a hard deadline with no extensions for complexity. If the breach is unlikely to result in risk to individuals' rights, notification is not required — but you must document the reasoning. This rule means a bank must know:
- What data was breached (classification tells you this)
- Who it belongs to (the customer data map)
- What risk it poses (sensitivity label drives risk assessment)

Without classification, you cannot complete an Article 33 notification accurately within 72 hours. Classification is not bureaucracy — it is the operational infrastructure that makes legal compliance possible under time pressure.

**Article 34 — notifying affected individuals:**
Where a breach is likely to result in **high risk** to individuals (e.g., financial fraud, identity theft), you must also notify those individuals directly, "without undue delay." This is separate from the ICO notification. Knowing whose data was involved — which requires a complete data map and accurate classification — is a prerequisite.

**Data retention schedules — classification drives deletion:**
GDPR Principle 5 (storage limitation) requires that personal data is not kept longer than necessary. In practice this means every classification label must have an associated **retention period**. Example:

| Classification Label | Retention Policy |
|---|---|
| Public | No limit |
| Internal | 7 years (general business records) |
| Confidential (customer data) | 6 years post-account closure (UK limitation period) |
| Restricted (financial crime) | 5 years (POCA / AML requirements) |
| Highly Restricted | Varies — legal hold overrides all |

When a retention period expires, data should be deleted or anonymised automatically. Classification is what makes automated retention enforcement possible — the label triggers the rule.

**Article 35 — DPIA (Data Protection Impact Assessment):**
Before carrying out any processing that is "likely to result in a high risk" to individuals, you must conduct a **DPIA**. A DPIA is a structured assessment that identifies privacy risks and mitigation measures. It is not optional — regulators will ask to see it.

When is a DPIA required? Any large-scale classification programme qualifies, because you are processing personal data at scale to identify its sensitivity. A DPIA for a classification programme would cover: what data is being scanned, who has access to the scanning tool, what happens to the findings, and how false positives are handled.

Being able to describe the DPIA process — and explain that a classification programme requires one — is a strong signal to a privacy-focused interviewer.

**DPO — Data Protection Officer:**
Banks that process personal data at large scale are required to appoint a **DPO (Data Protection Officer)**. The DPO is the internal expert on data protection law. They:
- Advise the bank on GDPR obligations
- Monitor internal compliance
- Act as the point of contact with the ICO
- Must be consulted on all DPIAs

As a data analyst on a classification programme, you will work directly with the DPO. They will review classification outputs, approve the programme's data handling practices, and sign off on DSARs. Know who the DPO is and what they do.

**UK Regulators — who enforces what at a UK bank:**
- **ICO (Information Commissioner's Office):** Enforces UK GDPR and the Data Protection Act 2018. Investigates data breaches. Levies fines. The body you notify under Article 33.
- **FCA (Financial Conduct Authority):** Regulates the financial firm itself. Has its own data governance expectations under SYSC (Systems and Controls sourcebook). The FCA can also take action against firms with poor data practices that create conduct or market integrity risks.
- **PRA (Prudential Regulation Authority):** For banks with deposit-taking licences. Enforces BCBS 239 expectations in the UK.

In a data breach scenario at a UK bank, you may need to notify both the ICO (personal data breach) and the FCA (if the breach affects market integrity or customer assets) — sometimes within overlapping time windows.

---

## Part 3 — DORA Deep Dive

**What is it?**
Digital Operational Resilience Act. EU regulation that entered into **force January 2023** and became **applicable (i.e., enforceable) January 2025**. This 2-year gap was a transition window — firms were expected to be compliant by January 2025, not January 2023. Applies to financial entities and their critical ICT service providers.

**The core question DORA asks:** "Can this bank keep operating during a cyberattack or technical failure?"

**The five pillars of DORA:**
1. ICT Risk Management
2. ICT Incident Classification and Reporting
3. Digital Operational Resilience Testing
4. Third-party Risk Management
5. Information Sharing

**The link to classification:**
Pillar 2 requires *classifying* ICT incidents by severity and type. You cannot report a "major incident affecting critical systems" without knowing which systems are critical — and which data they hold. Classification of data feeds into classification of system criticality.

Pillar 4 requires knowing which third parties have access to your data. Classification enables you to say "our data classification vendor handles Restricted data; therefore they are a critical third-party provider."

---

## Part 4 — BCBS 239 Deep Dive

**What is it?**
Basel Committee on Banking Supervision standard 239. Published 2013. Originally targeted at globally systemically important banks (G-SIBs), but the UK PRA and other national regulators have since extended BCBS 239 expectations to other systemically important institutions (O-SIIs) and many large domestic banks. In practice, if you work at a significant UK bank — whether or not it is on the G-SIB list — the BCBS 239 principles apply to your data governance work.

**The core question:** "Can this bank aggregate risk data accurately and quickly enough to make decisions during a crisis?"

**The key requirements — 11 principles in three groups:**

**Overarching Governance (Principles 1–2):**
- **Principle 1 — Governance:** The board and senior management must actively oversee data aggregation capabilities. Risk data quality is a board-level accountability, not just an IT matter.
- **Principle 2 — Data architecture and IT infrastructure:** Banks must maintain a sound data architecture with documented data dictionaries, clear ownership, and a technology infrastructure that supports aggregation at pace.

**Risk Data Aggregation Capabilities (Principles 3–6):**
- **Principle 3 — Accuracy and integrity:** Risk data must be accurate and reliable. Single authoritative source for each data item.
- **Principle 4 — Completeness:** All material risk exposures must be captured. No blind spots.
- **Principle 5 — Timeliness:** Data must be aggregable within defined timeframes — typically same-day for normal conditions, within hours during stress.
- **Principle 6 — Adaptability:** Systems must handle ad hoc queries, not just pre-built reports. During a crisis, regulators ask new questions.

**Risk Reporting Practices (Principles 7–11):**
- **Principle 7 — Accuracy:** Reports must accurately reflect the underlying aggregated data.
- **Principle 8 — Comprehensiveness:** Reports must cover all material risk areas across all business lines and geographies.
- **Principle 9 — Clarity and usefulness:** Reports must be understandable to senior management, with appropriate context.
- **Principle 10 — Frequency:** Reporting frequency must reflect the risk being monitored — daily for market risk, weekly for credit concentrations, etc.
- **Principle 11 — Distribution:** Reports must reach the right people at the right time.

**The link to classification:**
BCBS 239 is a data governance regulation in substance. The principles require that risk data be complete, accurate, timely, and aggregatable. You cannot satisfy these requirements without a classification programme that identifies what data exists, where it is, who owns it, and whether it is reliable.

---

## Part 5 — PCI DSS Deep Dive

**What is it?**
Payment Card Industry Data Security Standard. Not a law but a contractual requirement mandated by the card networks (Visa, Mastercard, Amex). Any organisation that stores, processes, or transmits cardholder data must comply. At a UK retail bank this is not optional — it applies to every card payment operation.

**What it protects:** Cardholder data — specifically the Primary Account Number (PAN, i.e., the 16-digit card number), cardholder name, expiry date, and service code. CVV codes and PINs have additional, stricter restrictions.

**The 12 requirements (summarised):**
1. Install and maintain a firewall
2. Don't use vendor-supplied default passwords
3. Protect stored cardholder data (encryption mandatory)
4. Encrypt transmission of cardholder data
5. Use antivirus software
6. Develop and maintain secure systems
7. Restrict access to cardholder data (need to know only)
8. Assign a unique ID to each person with computer access
9. Restrict physical access to cardholder data
10. Track and monitor all access to network resources and cardholder data
11. Regularly test security systems
12. Maintain an information security policy

**The link to classification:**
Requirement 3 (protect stored cardholder data) and Requirement 10 (monitor access) are impossible without knowing where cardholder data is. Classification specifically identifying PAN data and tagging it as Restricted or Highly Restricted is the mechanism by which Requirements 3 and 10 are technically fulfilled. A bank's PCI DSS compliance report will include evidence that cardholder data is classified and that access is monitored — both outputs of the classification programme.

**Scope reduction:** One of the most important PCI DSS strategies is reducing scope — minimising the number of systems that touch cardholder data. Classification enables this: once you know exactly which systems hold PAN data, you can redesign flows to isolate them, reducing audit scope and compliance cost.

---

## Part 6 — AI Act 2026 Deep Dive

**What is it?**
The EU AI Act. Agreed 2024, fully in force 2026. The world's first comprehensive AI regulation.

**The risk tiers for AI systems:**
1. Unacceptable risk: banned entirely (social scoring, real-time biometric surveillance)
2. High risk: strictly regulated (credit scoring, insurance risk, hiring decisions, critical infrastructure)
3. Limited risk: transparency obligations (chatbots must declare they are AI)
4. Minimal risk: no specific obligations

**For banks, the relevant category is High Risk.**
AI systems used for creditworthiness assessment, insurance risk, fraud detection, and AML (anti-money laundering) are all High Risk. This means:
- Risk management systems required
- Human oversight required
- Transparency to subjects
- Detailed logging and documentation

**The link to classification:**
High-risk AI systems must document what data they were trained on and what data they process. Classification provides that documentation. If a credit scoring model processes Confidential data (customer financial history), the bank must demonstrate that access was appropriate and governed. Classification is the evidence.

**GenAI in banking (2026 context):**
Banks are deploying GenAI tools (Copilot, internal LLMs) rapidly. The AI Act requires them to classify what data these tools can access. A GenAI tool that can access unclassified Restricted customer data is both an AI Act violation and a data breach waiting to happen.

---

## Part 7 — Mini Projects

**Project 5.1 — "Which regulation applies?"**
Given 5 scenarios (a DSAR, a credit scoring system, a trading system, a data breach, a cloud migration), identify which regulations apply to each and the key requirements triggered.

**Project 5.2 — "GDPR Article 15 — the technical response"**
A customer requests all their personal data. Map out the technical steps required to fulfill this — from receiving the request to sending the response. What SQL queries would you run? What classification labels matter?

**Project 5.3 — "Compliance mapping"**
Given the classification framework (5 tiers) and the regulations above, create a mapping table: for each classification tier, list the regulations that apply, the required controls, and the retention limit.

---

---

# MODULE 6: DSPM & Security Tools

## Goal
DSPM (Data Security Posture Management) is the umbrella concept — the continuous monitoring of whether your data is as secure as you believe. By the end of this module, a learner should understand how Microsoft Purview, Unity Catalog, DLP, and SIEM tools fit together into a complete security architecture — not just as individual products but as a connected system.

---

## Part 1 — What is Security Posture?

**The concept:**
"Posture" in security means the current state of your defences relative to where they should be. A good security posture means the controls you have in place actually match the risks you face. A poor posture means there are gaps.

**DSPM specifically:**
Traditional security tools ask "is anyone attacking us right now?" DSPM asks "is our data configured correctly right now?" — even with no active attack. Examples of posture problems:
- A Restricted data table that has been accidentally set to world-readable
- A backup file containing PII that was exported to a Public S3 bucket
- A new database created last week that has not yet been scanned

DSPM discovers these misconfigurations before an attacker does.

---

## Part 2 — Microsoft Purview

**What it is:**
Microsoft's unified data governance platform. It covers classification, sensitivity labelling, data loss prevention, compliance management, and risk analysis — all in one platform, deeply integrated with Azure, M365 (Outlook, Teams, SharePoint), and third-party sources.

**The key services within Purview:**
- Information Protection: sensitivity labels that travel with files
- Data Catalog: registers and classifies data assets
- Data Loss Prevention (DLP): policy engine that blocks unauthorised data movement
- Compliance Manager: maps your controls to regulations automatically
- eDiscovery: finds data for legal proceedings

**How it works with Office 365:**
When a user saves a file in Word or Outlook, Purview can automatically label it based on content. A document containing what looks like a customer's National Insurance number gets labelled "Confidential" and the DLP policy triggers: the user cannot email it to an external address.

---

## Part 3 — Databricks Unity Catalog

**What it is:**
The governance layer for Databricks (the dominant big data and ML platform). Banks increasingly run their analytics, ML models, and data pipelines on Databricks. Unity Catalog provides a single metadata layer across all Databricks workspaces.

**Why it matters for classification:**
- Every dataset processed in Databricks gets a catalog entry
- Column-level classification labels can be applied (e.g., PII columns can be automatically masked)
- Access controls are enforced at the data layer, not just the application layer
- Full lineage tracking: "this ML model was trained on data from table X which contains Restricted data"

**The key concept — data lineage:**
Lineage tracks where data came from, what transformations were applied, and where it went. This is critical for both compliance (prove this report's data is accurate and authorised) and incident response (what data was affected by this pipeline failure?).

---

## Part 4 — DLP: Data Loss Prevention

**The concept:**
DLP is a set of policies that monitor data in motion and block it if it violates rules. "If a user tries to copy text from a document labelled Restricted and paste it into an email to an external recipient — block it and alert the security team."

DLP policies are the enforcement mechanism that makes classification labels *do something*. Without DLP, a Restricted label is just a coloured sticker. With DLP, it becomes an automatic control.

**The three states of data DLP monitors:**
1. Data at rest (stored somewhere — DLP scans it)
2. Data in motion (being sent somewhere — DLP intercepts it)
3. Data in use (being processed — DLP monitors activity)

**Common DLP rules at a bank:**
- Block emails containing credit card patterns to external domains
- Alert when more than 1,000 customer records are downloaded in one session
- Block copy-paste of Restricted documents into non-managed applications
- Require justification when Restricted data is shared with a third party

---

## Part 5 — Access Control: RBAC, ABAC, and How Labels Drive Permissions

**RBAC — Role-Based Access Control:**
Users are assigned roles (e.g., `data-analyst`, `compliance-reviewer`, `admin`). Each role has a fixed set of permissions. Simple and auditable, but inflexible: you either have the analyst role or you don't.

**ABAC — Attribute-Based Access Control:**
Access decisions are made dynamically based on *attributes* of the user, the data, and the environment. Example: grant access if `user.clearance_level >= data.classification_tier AND user.department == data.data_owner AND time_of_day == business_hours`.

**Why ABAC is the right model for classification-driven access:**
In a large bank with thousands of datasets and hundreds of roles, RBAC becomes unmanageable — you would need a role for every combination of permissions. ABAC allows the classification label itself to be an attribute that drives access: if a table is labelled Restricted, only users with a `clearance: restricted` attribute on their identity profile can access it. When the label changes, the policy updates automatically — no manual role reassignment required.

Modern DSPM platforms implement ABAC natively. When you describe how classification labels enforce access control in an interview, the word to use is ABAC.

---

## Part 6 — Data Masking and Tokenisation

**Data masking:**
Replacing sensitive values with realistic but fictional values. Used in non-production environments (development, testing, analytics) where real customer data is not needed. A masked dataset looks real but contains no actual PII.

```
Original: Jane Smith, DOB 1985-04-12, NINO AB123456C
Masked:   Sarah Jones, DOB 1981-09-28, NINO XY987654Z
```

Classification drives masking: any dataset labelled Confidential or above that is copied to a non-production environment must be masked first. This is a technical control that DSPM tools can enforce automatically.

**Tokenisation:**
Replacing a sensitive value with a non-sensitive placeholder (token) that maps back to the original in a secure vault. Unlike masking, tokenisation is *reversible* — the original value can be retrieved by authorised systems.

Banks use tokenisation for card numbers (PAN tokenisation is a core PCI DSS technique): the card number is replaced with a token, and only the payment processor's vault knows the real number. The token is useless to an attacker even if stolen.

**Classification and masking together:**
The classification label determines *whether* masking is required. A Restricted-labelled table copied to a dev environment triggers automatic masking before the copy completes. Without the label, the control cannot be automated.

---

## Part 7 — Zero Trust Architecture

**The concept:**
Traditional security assumed: once inside the corporate network, you can be trusted. Zero Trust rejects this entirely. The Zero Trust principle is: **"never trust, always verify."** Every access request — regardless of where it comes from (inside or outside the network) — must be authenticated, authorised, and logged.

**Why Zero Trust matters for classification:**
In a Zero Trust model, classification labels are the foundation of authorisation decisions. Every access request triggers a check: what is the classification of the resource being accessed? What is the clearance level of the requesting identity? Are all conditions met?

The three pillars of Zero Trust relevant to data work:
1. **Verify identity:** Strong authentication (MFA) for every access, every time
2. **Least privilege access:** Grant only the minimum permissions needed for the task
3. **Assume breach:** Act as if perimeter controls have already failed; data-level controls (classification + DLP) are the last line of defence

DSPM is the operational implementation of Zero Trust at the data layer. Classification is what makes the "always verify" step meaningful — you can only check whether access to a resource is appropriate if you know what the resource is.

---

## Part 8 — SIEM: Splunk and Microsoft Sentinel

**What is a SIEM?**
Security Information and Event Management. A SIEM collects logs from every system in the bank — firewalls, databases, applications, cloud platforms, identity systems — and analyses them together to detect threats.

Individual logs are noisy and useless in isolation. A SIEM finds the signal: "User X logged in from an unusual country at 3am, then accessed 50 Restricted data tables, then attempted to export a large file." No single event is alarming. The pattern is.

**Splunk:**
The dominant SIEM platform. Banks feed it billions of events per day. You write Splunk queries (SPL — Splunk Processing Language) to hunt for threats or build dashboards.

**Microsoft Sentinel:**
Microsoft's cloud-native SIEM, built on Azure. Tight integration with **Microsoft Entra ID** (formerly Azure Active Directory, rebranded 2023 — use the new name in 2026 interviews) for identity context, Purview for data classification context, and Defender for endpoint security posture.

**The link to classification:**
SIEM alerts can include classification context. "Unusual access to Restricted customer data" is a much more actionable alert than "unusual access to table `cust_data_017`." Classification makes SIEM alerts meaningful.

---

## Part 9 — How They All Connect (The Architecture)

```
Data Sources → [1touch.io / Purview Scan] → Data Catalog (labels applied)
                                                    ↓
                                        DLP Policies (labels trigger rules)
                                                    ↓
                 User tries to access/move data → DLP checks label
                                                    ↓
                                    Allowed? → Proceeds
                                    Blocked? → Alert sent to SIEM
                                                    ↓
                                      SIEM correlates with other events
                                                    ↓
                              Security team investigates / responds
```

A learner should be able to draw this architecture from memory in an interview.

---

## Part 10 — Mini Projects

**Project 6.1 — "Read a Purview label policy"**
Given a sensitivity label policy JSON, identify: what label does it create, what protection does it apply, and what conditions trigger automatic labelling?

**Project 6.2 — "Write a DLP rule"**
In plain English, write 3 DLP rules for a bank. For each rule: what data does it protect, what action does it block, what is the user notification message, and what is the security team alert?

**Project 6.3 — "Interpret a SIEM alert"**
Given a mock SIEM alert (user, timestamp, source IP, action, data classification, count), analyse it: is this a true positive or false positive? What additional information would you request? What is the escalation path?

---

---

# MODULE 7: AI/ML in Classification

## Goal
AI/ML is both the *mechanism* behind automated classification and an increasingly important *risk area* that must itself be governed. By the end of this module, a learner should be able to explain how ML classifiers work at a conceptual level, understand their limitations in banking, and speak intelligently about GenAI governance risks.

---

## Part 1 — What is Machine Learning (Without the Jargon)?

**The core idea:**
Machine learning is pattern recognition from examples. Instead of writing rules ("if column name contains 'email', label as PII"), you show the system thousands of examples of PII and non-PII, and it learns to distinguish them automatically.

**Why rules alone fail for classification:**
- A column called `ref` might contain customer references (Confidential) or internal transaction references (Internal). The name gives you no clue — the context does.
- PII can be in unexpected places — free text comments, log files, PDF metadata
- New data types emerge faster than anyone can write rules

ML fills these gaps. It generalises from examples to new, unseen cases.

---

## Part 2 — The Key Concepts

**Training vs inference:**
- **Training:** showing the model labelled examples and letting it learn patterns. Modern ML pipelines do not train once — they use **MLOps (Machine Learning Operations)**, a practice where models are retrained continuously as new labelled data accumulates. This handles data drift (real-world patterns shift over time) and improves accuracy as the model sees more examples. Training is computationally expensive and happens in scheduled jobs, not during scanning.
- **Inference:** using the trained model to classify new, unseen data. Happens in real time, continuously, as data is scanned. Computationally lightweight compared to training.

**NLP — Natural Language Processing:**
The ML subfield that handles text. Within NLP, several specific techniques are used in classification work:

**NER — Named Entity Recognition** is the key technique for PII detection. NER models identify and classify named entities in text: people, organisations, locations, dates, financial amounts, national identifiers. When a classification tool reads the sentence "Please send £5,000 to Jane Smith at account 12345678" and identifies `£5,000` as a financial amount, `Jane Smith` as a person name, and `12345678` as an account number — that is NER. Use this term in interviews. Saying "the tool uses NLP" is vague; saying "the tool uses NER models to extract person names and financial identifiers" is precise.

**Semantic understanding:** Models also learn that "DOB", "date of birth", and "birth_date" all refer to the same concept — not through rules, but through training on vast labelled datasets. This synonym/ontology resolution is what allows context-aware classification to generalise beyond exact column name matching.

NLP/NER powers:
- Entity extraction from free-text fields, emails, and documents
- Topic classification (is this a credit application or an HR file?)
- Synonym resolution ("NI number" = "National Insurance number" = "NINO")
- Confidence scoring based on linguistic context, not just pattern matching

**Precision vs Recall — the key trade-off:**
- Precision: of everything I labelled as PII, what percentage actually IS PII? (Avoid false positives)
- Recall: of all actual PII, what percentage did I find? (Avoid false negatives — missed PII)

In banking, high recall is usually prioritised. A false positive (labelling non-PII as PII) costs effort in review. A false negative (missing real PII) costs a regulatory fine.

**F1 score — the single summary metric:**
When you need one number to evaluate a classifier, use the F1 score. It is the harmonic mean of precision and recall:

$$F1 = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

The harmonic mean punishes extreme imbalances: a model with 100% precision but 10% recall gets an F1 of ~0.18, not 55%. This is why F1 is preferred over a simple average for classification evaluation. In any technical question about "how do you measure a classification model", F1 should be your first answer.

**Confidence scores:**
ML models do not say "this is PII." They say "I am 94% confident this is PII." The confidence score determines whether human review is needed. Banks typically set thresholds like:
- >90%: auto-accept label
- 70–90%: queue for human review
- <70%: investigate and manually classify

---

## Part 3 — Bias in Classification Models

**Why bias matters in banking:**
If a classification model is trained predominantly on data from one region, one language, or one data format — it will be less accurate on data that looks different. A model trained on English PII patterns may miss Arabic names or Korean phone number formats.

**The regulatory angle:**
The EU AI Act explicitly requires high-risk AI systems (which include data classification systems used in financial services) to address bias in training data. Banks must document:
- What data was used to train classification models
- What groups are represented
- What accuracy differences exist across groups

**What to do about it:**
- Diverse training data (multiple languages, regions, data formats)
- Regular accuracy audits by segment
- Human review for edge cases

---

## Part 4 — GenAI in Banking (2026 Context)

**The risk:**
GenAI tools (Copilot, Claude, GPT-4, internal LLMs) are being deployed rapidly. They are incredibly useful. They are also a new and poorly-governed data access channel.

When an employee pastes a customer record into an *unsanctioned* consumer GenAI tool (free-tier ChatGPT, personal Copilot, etc.), that data:
- May be sent to a third-party API outside the bank's control
- May be retained in the provider's systems and potentially used for model improvement
- Cannot be reliably deleted once submitted

**Important distinction:** Enterprise API contracts (Azure OpenAI Service, AWS Bedrock, Google Vertex AI, Microsoft 365 Copilot Enterprise) explicitly prohibit the provider from using customer data for training or model improvement — this is contractually guaranteed and auditable. The risk described above applies specifically to *unsanctioned* consumer-tier tools used outside approved corporate channels. Banks should enforce this distinction through DLP policies that block data submission to non-approved AI endpoints.

Banks have not uniformly caught up with this risk. The regulatory framework for governing GenAI data access is still being developed, and banks are at different stages of maturity. Classification is one of the key tools:
- Label all data. High-sensitivity data cannot be pasted into unsanctioned AI tools.
- Enforce via DLP: Restricted label → block copy to non-approved AI endpoints.

**The opportunity:**
GenAI also helps *with* classification:
- LLMs can understand context better than regex patterns
- GenAI can classify free text, images (with multimodal models), and complex documents
- Copilot for Purview can explain classification decisions in plain English

**RAG — Retrieval Augmented Generation (must-know for 2026 interviews):**
RAG is the dominant architecture for enterprise GenAI deployments in banking. Instead of the LLM relying only on its training data, it first *retrieves* relevant documents from a knowledge base, then *generates* a response using those documents as context. Examples: an internal policy assistant that retrieves compliance documents, or a customer service agent that retrieves account history.

Why this is a classification problem: a RAG system's knowledge base is a curated set of documents or data chunks. Classification determines which documents are permitted in that knowledge base — and therefore what the AI can access, cite, and reason about.

The governance question every bank should be asking before deploying a RAG system: *"Has every document in this retrieval index been classified, and is the label consistent with the access level of the users who will query the system?"* A RAG system that can retrieve Restricted customer data in response to a query from a user who is not authorised to see that data is a data governance failure and an AI Act compliance issue.

In an interview about GenAI governance at a bank, connecting RAG architecture to classification is one of the most impressive answers you can give.

---

## Part 5 — Mini Projects

**Project 7.1 — "Precision vs Recall Trade-off"**
Given a classification system that scanned 1,000 columns. It labelled 120 as PII. Of those 120, 95 were actually PII. The dataset actually contained 150 PII columns. Calculate precision and recall. If you lower the confidence threshold from 0.85 to 0.70, you capture 20 more PII columns but add 30 false positives. Is this a good trade-off for a bank? Justify your answer.

**Project 7.2 — "Spot the bias"**
A classification model was trained on UK bank data. It is now being deployed in the bank's German and Spanish subsidiaries. List 5 specific ways the model might perform differently. What would you check first?

**Project 7.3 — "GenAI governance policy"**
Write a short (one-page equivalent) internal policy for a bank governing the use of GenAI tools. Address: what data classifications may be used with external AI tools, what is banned, what monitoring is required.

---

---

# MODULE 8: Mini Projects (Full Expanded Versions)

## Goal
The three projects should each be a complete, standalone learning experience. A learner should be able to work through each one in ~1 hour and come out with something tangible.

---

## Project A: The PII Scanner (Python)

**The scenario:**
You have just joined a bank's data governance team. You have been given a CSV export of a legacy customer database that is about to be migrated to the cloud. Before migration, you need to:
1. Understand what the file contains
2. Detect any PII
3. Assign a classification label
4. Write a report that the compliance team can file

**Step-by-step structure (within the module):**

Step 1 — Load and explore the data
- What is `pd.read_csv`?
- What does `df.head()`, `df.info()`, `df.describe()` tell you?
- What are column names, data types, null counts?

Step 2 — Build PII patterns
- What is regex? (mini recap with 3 worked examples)
- Write patterns for: email, UK phone, UK NI number, date of birth, credit card

Step 3 — Scan columns
- Write a loop that tests each column
- Calculate a match rate (not just "does it match" but "what % of values match")
- Build a findings dictionary

Step 4 — Classify
- Decision tree: what label does each combination of PII types produce?

Step 5 — Report
- Output a JSON report
- Include: filename, scan date, column findings, final label, recommendation

---

## Project B: The Classification Audit (SQL)

**The scenario:**
A GDPR audit is coming in 6 weeks. The compliance team has asked you to prepare evidence that:
1. All customer data tables are classified
2. No unclassified data exists with sensitive column names
3. Access to Restricted data is monitored
4. Confidence scores are above 85% for accepted labels

**Step-by-step structure:**

Step 1 — Coverage check
"How much of our data is classified?"
- Query: total tables vs catalogued tables vs labelled tables
- Output: coverage percentage

Step 2 — Gap analysis
"What tables have suspicious column names but no label?"
- Query: LEFT JOIN information_schema → data_catalog, filtered by PII column name patterns

Step 3 — Access audit
"Who has accessed Restricted data this month?"
- Query: JOIN access_logs + data_catalog, WHERE label IN ('Restricted', 'Highly Restricted')

Step 4 — Confidence review
"What labels need human review?"
- Query: WHERE confidence_score < 0.85 AND classified_by = 'auto'

Step 5 — Summary report
"Produce a single compliance summary"
- CTE that combines all four checks into one readable result set

---

## Project C: The Data Flow Mapper

**The scenario:**
A customer has exercised their GDPR Article 15 right of access. They want to know: "Where does my data go?" You need to map every system that holds or processes data about a specific customer.

**Step-by-step structure:**

Step 1 — Conceptual: what is a data flow?
- Source → processing → destination
- Example: customer fills in a form → API → database → analytics warehouse → reporting tool

Step 2 — The customer_data_map table
- What it contains, how it was populated
- Query: find all tables containing data for customer_id X

Step 3 — Add classification context
- JOIN to data_catalog: for each table, what is its classification label?
- This tells you the sensitivity of each data point

Step 4 — Add third-party disclosure
- Does any of this data flow to a third party?
- Query third_party_sharing table: which vendor received data from this table?

Step 5 — Write the DSAR response
- Format the output as a structured list the compliance team can send to the customer
- Include: system name, what data it holds, classification, third-party disclosures, retention period

---

---

# STRUCTURE NOTES FOR IMPLEMENTATION

## How to include this content without breaking the existing framework

**Option A — Expand each data-mX.js file in place**
Each module JS file gets much more HTML content added. Simple. Existing navigation all works. Risk: files become very large (50–100KB each).

**Option B — Add sub-sections with collapsible accordion sections**
Within each module, add collapsible `<details>` sections or new accordion components for "Part 1 — Basics", "Part 2 — Core Concepts", etc. The current code content becomes a "Part 5 — Code Deep Dive" section. Clean UX.

**Option C — Add sub-navigation within each module**
Each module gets its own internal tab system: [Concepts] [How It Works] [Code Examples] [Mini Projects] [Quick Reference]. The user can jump to the part they need.

**Recommended approach:** Option B (accordion sections) + Option C (tabs for the four main areas) combined. This keeps each module manageable without losing depth.

## Content priority order for implementation

1. Module 1 (SQL) — highest interview relevance
2. Module 4 (Classification) — core domain
3. Module 5 (Compliance) — most asked about in interviews
4. Module 2 (Python)
5. Module 7 (AI/ML)
6. Module 3 (Cloud)
7. Module 6 (DSPM Tools)
8. Module 8 (Projects — full expanded versions)

---
