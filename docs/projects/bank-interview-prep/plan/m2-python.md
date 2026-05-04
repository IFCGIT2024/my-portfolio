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
