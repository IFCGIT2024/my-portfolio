// =====================================================
// Module 2: Python for Automation
// =====================================================
window.MODULES.m2 = () => {

const py_basics = `# Variables and data types
name          = "Jane Smith"          # str
age           = 38                    # int
confidence    = 0.94                  # float
is_pii        = True                  # bool
pii_types     = ["email", "nino"]     # list
record        = {"name": "Jane", "age": 38}  # dict

# Conditionals
if confidence >= 0.90:
    label = "Accepted"
elif confidence >= 0.80:
    label = "Needs Review"
else:
    label = "Rejected"

# Loop over a list
for pii_type in pii_types:
    print(f"Found PII type: {pii_type}")

# Function: reusable named block of logic
def classify_table(pii_findings):
    """Assign a classification label based on PII types found.
    pii_findings: list of strings e.g. ['email', 'credit_card', 'nino']
    Note: 'Internal' is the safe default for any data found inside bank systems.
    Only data explicitly approved for public release should ever be labelled 'Public'.
    """
    high_sensitivity = {"credit_card", "nino", "passport", "date_of_birth"}
    if any(p in high_sensitivity for p in pii_findings):
        return "Restricted"
    if pii_findings:          # any PII found = Confidential
        return "Confidential"
    return "Internal"         # no PII — safe default for internal data

# Test it
print(classify_table(["email", "credit_card"]))  # "Restricted"
print(classify_table(["email"]))                  # "Confidential"
print(classify_table([]))                         # "Internal"`;

const py_pandas = `import pandas as pd

# Load a CSV as a table
df = pd.read_csv("customer_data.csv")

# Inspect: shape, columns, first rows
print(df.shape)        # (rows, columns) tuple
print(df.columns)      # column names
print(df.head())       # first 5 rows

# Filter rows — equivalent to SQL WHERE
restricted = df[df['classification_label'] == 'Restricted']

# Select specific columns — equivalent to SQL SELECT col1, col2
df[['table_name', 'confidence_score']]

# Count grouped values — equivalent to SQL COUNT + GROUP BY
df['classification_label'].value_counts()

# Add a calculated column — equivalent to SQL CASE WHEN
df['review_status'] = df['confidence_score'].apply(
    lambda s: 'NEEDS REVIEW' if s < 0.85 else 'ACCEPTED'
)

# Save result
df.to_csv("classified_output.csv", index=False)`;

const py_regex = `import re

# Each pattern describes the SHAPE of a PII type — not its meaning.
PATTERNS = {
    "email":         re.compile(r'[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}'),
    "uk_nino":       re.compile(r'\\b[A-Z]{2}[0-9]{6}[A-D]\\b'),        # AB123456A
    "uk_postcode":   re.compile(r'\\b[A-Z]{1,2}[0-9][0-9A-Z]?\\s[0-9][A-Z]{2}\\b'),
    "sort_code":     re.compile(r'\\b\\d{2}-\\d{2}-\\d{2}\\b'),          # 20-01-34
    "iban":          re.compile(r'\\bGB\\d{2}[A-Z]{4}\\d{14}\\b'),
    "uk_phone":      re.compile(r'\\b(?:0|\\+44)[0-9]{9,10}\\b'),
}

def scan_column(column_name, sample_values):
    """Scan a list of sample values from one column.
    Returns the first matching PII type, or None."""
    for pii_type, pattern in PATTERNS.items():
        for value in sample_values:
            if value and pattern.search(str(value)):
                return pii_type    # return on first match
    return None

# Why regex is both powerful and limited:
# Powerful  — finds patterns across millions of rows in seconds.
# Limited   — cannot understand context. 'test@test.com' matches email
#             even if it is clearly a dummy value. This is why confidence
#             scores exist and why low-confidence labels need human review.`;

const py_api = `import os
import requests

# NEVER hardcode credentials — they end up in git history
# Read from environment variable instead
token = os.environ.get("PURVIEW_TOKEN")
if not token:
    raise ValueError("PURVIEW_TOKEN environment variable is not set")

# GET: retrieve something (equivalent to SQL SELECT)
response = requests.get(
    "https://api.purview.azure.com/labels",
    headers={"Authorization": f"Bearer {token}"}
)
response.raise_for_status()    # raises HTTPError for 4xx/5xx responses
labels = response.json()

# POST: create or update something (equivalent to SQL INSERT/UPDATE)
response = requests.post(
    "https://api.purview.azure.com/assets/classify",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    },
    json={
        "table_name": "customers",
        "label": "Confidential",
        "confidence": 0.95
    }
)
response.raise_for_status()
result = response.json()
# The HTTP verbs: GET=read, POST=create/send, PUT/PATCH=update, DELETE=remove`;

const py_scanner = `import re, json, os
import pandas as pd

# PII detection patterns
PATTERNS = {
    "email":       re.compile(r'[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}'),
    "uk_nino":     re.compile(r'\\b[A-Z]{2}[0-9]{6}[A-D]\\b'),
    "sort_code":   re.compile(r'\\b\\d{2}-\\d{2}-\\d{2}\\b'),
    "iban":        re.compile(r'\\bGB\\d{2}[A-Z]{4}\\d{14}\\b'),
}

def classify_table(pii_findings):
    high = {"credit_card", "nino", "passport", "date_of_birth", "uk_nino"}
    if any(p in high for p in pii_findings):
        return "Restricted"
    if pii_findings:
        return "Confidential"
    return "Internal"

def scan_file(csv_path, sample_rows=100):
    """Scan a CSV file for PII. Returns a dict of findings per column."""
    try:
        df = pd.read_csv(csv_path, encoding="utf-8")
    except FileNotFoundError:
        raise FileNotFoundError(f"File not found: {csv_path}")
    except UnicodeDecodeError:
        df = pd.read_csv(csv_path, encoding="latin-1")   # legacy bank export fallback

    results = {"file": csv_path, "columns": {}, "pii_found": []}

    for col in df.columns:
        # Sample up to 100 non-null values for speed on large files
        sample = df[col].dropna().head(sample_rows).tolist()
        found_type = None
        for pii_type, pattern in PATTERNS.items():
            if any(pattern.search(str(v)) for v in sample):
                found_type = pii_type
                break
        results["columns"][col] = found_type or "none"
        if found_type:
            results["pii_found"].append(found_type)

    results["label"]   = classify_table(results["pii_found"])
    results["summary"] = f"{len(results['pii_found'])} PII type(s) detected"
    return results

# Run the scanner
report = scan_file("customer_data.csv")
print(json.dumps(report, indent=2))

# Output:
# {
#   "file": "customer_data.csv",
#   "columns": {"full_name": "none", "email": "email", "nino": "uk_nino"},
#   "pii_found": ["email", "uk_nino"],
#   "label": "Restricted",
#   "summary": "2 PII type(s) detected"
# }`;

return _renderModule({
  id: 'm2', prev: 'm1', next: 'm3',
  badge: 'Module 2 · Automation',
  title: 'Python for Automation',
  subtitle: 'SQL answers questions about data that already exists. Python is used when you need to process data, detect what type it is, or automate tasks that would take a human weeks. Every classification tool\'s scanner is built on concepts in this module.',
  meta: [
    '&#9200; <span>~2.5 hrs</span>',
    '&#128204; <span>All Roles</span>',
    '&#128013; <span>5 Code Examples</span>',
    '&#127891; <span>5 Projects</span>'
  ],
  tabs: [
    {
      id: 'overview', label: '&#128204; Overview',
      sections: [
        {type:'cards', items:[
          {icon:'&#128013;', title:'Automate PII Detection',      body:'Write Python scripts that scan CSV files, databases, and APIs for PII patterns — the same logic that powers tools like 1touch.io.'},
          {icon:'&#128202;', title:'Process Tabular Data',        body:'Use pandas to load, filter, transform, and export tabular data — the Python equivalent of SQL SELECT, WHERE, and GROUP BY.'},
          {icon:'&#128270;', title:'Regex Pattern Matching',      body:'Use regular expressions to detect the shape of PII: email addresses, UK NINOs, sort codes, IBANs. Fast across millions of rows.'},
          {icon:'&#128279;', title:'Call Classification APIs',    body:'Use Python requests to talk to Purview and 1touch.io APIs — trigger scans, retrieve labels, and automate workflows without clicking.'},
        ]},
        {type:'callout', variant:'info', title:'&#127979; SQL vs Python',
          body:'SQL is <em>declarative</em>: "give me rows where X." Python is <em>imperative</em>: "for each row, do this, then this, then this." SQL queries existing databases. Python processes raw files, calls APIs, and automates workflows — both are essential.'},
        {type:'h2', text:'What Python Adds to Your Toolkit'},
        {type:'table', headers:['Task','SQL','Python'], rows:[
          ['Query existing database tables',  '&#10003; Use SQL',  '&#10005; Possible but not the right tool'],
          ['Scan a CSV file for PII',         '&#10005; Needs ingest first', '&#10003; Use pandas + regex'],
          ['Call a REST API (Purview)',        '&#10005; Not possible', '&#10003; Use requests'],
          ['Build automated report pipelines','&#10005; Limited',  '&#10003; Use Python + pandas'],
          ['Detect PII patterns in free text','&#10005; Limited',  '&#10003; Use regex / NLP'],
        ]},
      ]
    },
    {
      id: 'concepts', label: '&#128214; Concepts',
      sections: [{type:'accordion', items:[
        {
          title: 'Part 1 — What is Python and Why Does it Exist?',
          sections: [
            {type:'p', text:'Python is a language for telling a computer what to do, step by step. Unlike SQL (which asks one question and gets one answer), Python runs a sequence of steps: open this file, read each row, check each value against these patterns, decide what to do, save the result.'},
            {type:'ul', items:[
              '<strong>Readable</strong> — it looks more like plain English than any other language',
              '<strong>Vast library ecosystem</strong> — pandas for tables, scikit-learn for ML, requests for APIs — someone has already written code for almost every problem',
              '<strong>Runs everywhere</strong> — locally, in the cloud, inside classification tools',
            ]},
            {type:'callout', variant:'info', title:'&#128161; The key difference from SQL',
              body:'SQL is <em>declarative</em>: "give me rows where X." Python is <em>imperative</em>: "for each row, do this, then this, then this." You need both. SQL for querying databases. Python for everything else: scanning files, calling APIs, building pipelines.'},
          ]
        },
        {
          title: 'Part 2 — The Building Blocks',
          sections: [
            {type:'p', text:'These are the Python constructs you will use in classification scripts. Every example here is valid, runnable Python — no pseudocode.'},
            {type:'ul', items:[
              '<strong>String</strong>: text — <code>"jane.smith@email.com"</code>',
              '<strong>Integer</strong>: whole number — <code>42</code>',
              '<strong>Float</strong>: decimal — <code>0.95</code>',
              '<strong>Boolean</strong>: <code>True</code> or <code>False</code>',
              '<strong>List</strong>: ordered sequence — <code>["email", "phone", "postcode"]</code>',
              '<strong>Dictionary</strong>: key-value pairs — <code>{"name": "Jane", "age": 38}</code>',
            ]},
            {type:'p', text:'Conditionals, loops, and functions are the three patterns you will use in every script. A function is a named, reusable block of logic. Once defined, you can call it on any data.'},
          ]
        },
        {
          title: 'Part 3 — pandas: Python\'s SQL',
          sections: [
            {type:'p', text:'pandas is a Python library for tabular data. A pandas DataFrame is a table — rows and columns. It lets you work with spreadsheets and CSVs the way SQL works with databases.'},
            {type:'callout', variant:'info', title:'&#128161; Why this matters for classification',
              body:'Business teams frequently send data as CSV exports before it enters a database. Python/pandas lets you scan those files for PII before they are ingested — and flag them before they enter systems with weaker controls.'},
            {type:'table', headers:['SQL Concept','pandas Equivalent'], rows:[
              ['SELECT col1, col2',        '<code>df[["col1", "col2"]]</code>'],
              ['WHERE col = value',        '<code>df[df["col"] == value]</code>'],
              ['COUNT(*) GROUP BY col',    '<code>df["col"].value_counts()</code>'],
              ['CASE WHEN x THEN y',       '<code>df["col"].apply(lambda x: ...)</code>'],
              ['ORDER BY col DESC',        '<code>df.sort_values("col", ascending=False)</code>'],
            ]},
          ]
        },
        {
          title: 'Part 4 — Regex: The Core of PII Detection',
          sections: [
            {type:'p', text:'Regex (Regular Expression) is a pattern-matching language. It lets you describe the <em>shape</em> of something you are looking for. An email address has a shape: <code>[something]@[something].[something]</code>. A UK National Insurance number has a shape: two letters, six digits, one letter (e.g. AB123456C).'},
            {type:'p', text:'This is how automated PII detection works. The tool does not <em>understand</em> data — it looks for patterns that match known PII shapes.'},
            {type:'callout', variant:'warning', title:'&#9888; Why regex is powerful — and limited',
              body:'<strong>Powerful</strong>: finds patterns across millions of rows in seconds.<br><strong>Limited</strong>: cannot understand context. <code>test@test.com</code> matches the email pattern even if it is clearly a dummy value. This is why confidence scores exist — and why low-confidence labels need human review.'},
          ]
        },
        {
          title: 'Part 5 — API Calls and Credential Security',
          sections: [
            {type:'p', text:'Classification platforms like 1touch.io and Microsoft Purview expose a REST API. Python can send them instructions and receive results without a human clicking anything.'},
            {type:'table', headers:['HTTP Verb','Equivalent SQL','Use Case'], rows:[
              ['GET',        'SELECT',        'Retrieve classification labels, scan results'],
              ['POST',       'INSERT',        'Submit data for scanning, create a new label'],
              ['PUT/PATCH',  'UPDATE',        'Update a label or configuration'],
              ['DELETE',     'DELETE',        'Remove a dataset from the catalog'],
            ]},
            {type:'callout', variant:'danger', title:'&#128680; Never hardcode credentials',
              body:'Credentials in source code end up in git history where they cannot be removed. Always read tokens from environment variables (<code>os.environ.get("PURVIEW_TOKEN")</code>). If the variable is missing, raise an error explicitly — silent failures are worse than loud ones.'},
          ]
        },
        {
          title: 'Part 5b — Virtual Environments and try/except',
          sections: [
            {type:'p', text:'These two topics are prerequisites for running any production-grade Python script in a bank environment.'},
            {type:'callout', variant:'info', title:'&#128230; Virtual Environments — always use them',
              body:'A virtual environment isolates this project\'s dependencies from every other project and from your system Python. Without it, conflicting library versions across projects cause failures that are extremely difficult to debug. Every professional Python environment uses venvs or a modern equivalent (<code>uv</code>, Poetry).'},
            {type:'code', lang:'bash', title:'Setting up a virtual environment', code:`python -m venv venv            # Create virtual environment
venv\\Scripts\\activate          # Activate (Windows)
source venv/bin/activate       # Activate (Linux/macOS — bank servers)
pip install pandas requests    # Install inside venv, not globally`},
            {type:'callout', variant:'warning', title:'&#9888; try/except — mandatory for file-processing scripts',
              body:'Real data is messy. Files have encoding errors. Rows are malformed. Expected columns do not exist. Any script without error handling will crash on the first problem — unacceptable in a bank. Always wrap file I/O, API calls, and database connections in try/except. The <code>raise</code> at the end of the generic handler is critical — silently swallowing errors is a common and dangerous mistake.'},
          ]
        },
      ]}]
    },
    {
      id: 'code', label: '&#128187; Code Examples',
      sections: [
        {type:'p', text:'From building blocks to the full PII scanner capstone — each example builds on the previous.'},
        {type:'code', lang:'python', title:'1 — Variables, types, conditionals, loops, and functions', caption:'The complete Python building blocks you will use in every classification script.', code: py_basics},
        {type:'code', lang:'python', title:'2 — pandas: working with tabular data', caption:'Load, filter, transform, and export CSVs — the Python equivalent of SQL.', code: py_pandas},
        {type:'code', lang:'python', title:'3 — Regex: detecting PII patterns', caption:'The core technique inside every automated classification tool.', code: py_regex},
        {type:'code', lang:'python', title:'4 — REST API calls to Purview / 1touch.io', caption:'How Python talks to classification platforms. Credential handling is non-negotiable.', code: py_api},
        {type:'code', lang:'python', title:'5 — The Full PII Scanner (capstone)', caption:'Combines all concepts: file loading, encoding fallback, regex scanning, classification, JSON output.', code: py_scanner},
      ]
    },
    {
      id: 'projects', label: '&#127891; Projects',
      sections: [
        {type:'h2', text:'Mini Projects'},
        {type:'p', text:'Each project is 10–20 minutes. By Project 2.5 every concept in this module will be in use.'},
        {type:'html', content:`
<div class="project-card">
  <div class="project-header"><div class="project-title">2.1 — Read a File and Describe It</div><div class="project-time">~10 min</div></div>
  <div class="project-tags"><span class="tag">pandas</span><span class="tag">df.shape</span><span class="tag">df.columns</span></div>
  <p>Write Python to read a CSV file, print the column names, count the rows, and show the first 5 rows. Then count how many rows have a null value in any column.</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">2.2 — Find Email Addresses</div><div class="project-time">~15 min</div></div>
  <div class="project-tags"><span class="tag">regex</span><span class="tag">loops</span><span class="tag">DataFrame filtering</span></div>
  <p>Given a DataFrame with a <code>notes</code> column containing free text, write a loop that checks each value for email addresses using regex and flags which rows contain them. Return a filtered DataFrame of matches only.</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">2.3 — Build a PII Column Scanner</div><div class="project-time">~15 min</div></div>
  <div class="project-tags"><span class="tag">functions</span><span class="tag">regex patterns</span><span class="tag">conditional logic</span></div>
  <p>Write a function that takes a DataFrame column name and sample values, and returns the PII type detected (email, phone, date_of_birth, or none). Test it on 5 columns with different content types.</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">2.4 — Classification Decision Tree</div><div class="project-time">~15 min</div></div>
  <div class="project-tags"><span class="tag">nested conditionals</span><span class="tag">5-tier model</span></div>
  <p>Given a list of PII findings like <code>["email", "credit_card"]</code>, write a <code>classify_table()</code> function that returns the correct 5-tier classification label. Test it with: just email, NINO + email, no PII at all.</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">2.5 — The Full PII Scanner (Capstone)</div><div class="project-time">~25 min</div></div>
  <div class="project-tags"><span class="tag">End-to-end</span><span class="tag">try/except</span><span class="tag">JSON output</span></div>
  <p>Combine all four projects: (1) read a CSV with encoding fallback, (2) scan every column for PII patterns, (3) assign a classification label using your decision tree, (4) output a JSON report. Add try/except around the file loading step.</p>
</div>`}
      ]
    },
    {
      id: 'quiz', label: '&#129300; Quiz',
      sections: [
        {type:'h2', text:'Knowledge Check'},
        {type:'quiz', questions:[
          {q:'What is the key difference between SQL and Python in classification work?',
           options:['SQL is newer and more powerful','SQL is declarative (asks questions of existing data); Python is imperative (runs step-by-step logic for processing, detecting, and automating)','Python can query databases but SQL cannot process files','They are interchangeable'],
           correct:1, explanation:'SQL asks one question and gets one answer. Python runs sequences of steps. Both are essential: SQL for querying the data catalog, Python for scanning files, calling APIs, and building automation pipelines.'},
          {q:'A regex pattern matches "test@test.com" in a column that should contain only internal tool names. What does this mean?',
           options:['The data is definitely PII and should be Restricted','The pattern fired, but confidence should be low — this requires human review','The column should be labelled Public because the email is fake','Regex has failed — a different tool is needed'],
           correct:1, explanation:'Regex matches the shape of data, not its meaning. It fires on any email-shaped string including dummy values. This is exactly why confidence scores exist and why low-confidence auto-labels require human review.'},
          {q:'Why must API credentials always be read from environment variables, never hardcoded in source code?',
           options:['Environment variables are faster','Hardcoded credentials end up in git history where they cannot be fully removed — anyone with repo access can retrieve them','Python cannot read hardcoded strings','Environment variables are required by GDPR'],
           correct:1, explanation:'Git history is permanent. Even if a secret is removed in a later commit, it remains in the full git history. Reading from environment variables keeps secrets out of code entirely.'},
          {q:'What does a virtual environment do?',
           options:['It runs Python faster','It isolates this project\'s library dependencies from other projects and the system Python installation, preventing version conflicts','It connects Python to a database','It is required by GDPR for data processing scripts'],
           correct:1, explanation:'Without virtual environments, installing a library at one version for one project can break another project expecting a different version. Venvs solve this by giving each project its own isolated package space.'},
          {q:'In the PII scanner, why does the classify_table function return "Internal" (not "Public") as the default when no PII is found?',
           options:['It is an arbitrary convention','All data found inside bank systems should default to Internal — only data explicitly approved for external release should ever be labelled Public','Public would cause an error','Internal is the most secure label'],
           correct:1, explanation:'The label "Public" means the data has been cleared for external distribution. Any data found inside bank systems should default to at least Internal — assuming Public would be a security failure. The classification decision tree\'s safe default is always Internal, not Public.'},
        ]}
      ]
    }
  ]
});
};
