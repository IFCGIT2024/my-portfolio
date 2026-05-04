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

### Step 1 — Load and explore the data
- What is `pd.read_csv`?
- What does `df.head()`, `df.info()`, `df.describe()` tell you?
- What are column names, data types, null counts?

### Step 2 — Build PII patterns
- What is regex? (mini recap with 3 worked examples)
- Write patterns for: email, UK phone, UK NI number, date of birth, credit card

### Step 3 — Scan columns
- Write a loop that tests each column
- Calculate a match rate (not just "does it match" but "what % of values match")
- Build a findings dictionary

### Step 4 — Classify
- Decision tree: what label does each combination of PII types produce?

### Step 5 — Report
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

### Step 1 — Coverage check
"How much of our data is classified?"
- Query: total tables vs catalogued tables vs labelled tables
- Output: coverage percentage

### Step 2 — Gap analysis
"What tables have suspicious column names but no label?"
- Query: LEFT JOIN information_schema → data_catalog, filtered by PII column name patterns

### Step 3 — Access audit
"Who has accessed Restricted data this month?"
- Query: JOIN access_logs + data_catalog, WHERE label IN ('Restricted', 'Highly Restricted')

### Step 4 — Confidence review
"What labels need human review?"
- Query: WHERE confidence_score < 0.85 AND classified_by = 'auto'

### Step 5 — Summary report
"Produce a single compliance summary"
- CTE that combines all four checks into one readable result set

---

## Project C: The Data Flow Mapper

**The scenario:**
A customer has exercised their GDPR Article 15 right of access. They want to know: "Where does my data go?" You need to map every system that holds or processes data about a specific customer.

**Step-by-step structure:**

### Step 1 — Conceptual: what is a data flow?
- Source → processing → destination
- Example: customer fills in a form → API → database → analytics warehouse → reporting tool

### Step 2 — The customer_data_map table
- What it contains, how it was populated
- Query: find all tables containing data for customer_id X

### Step 3 — Add classification context
- JOIN to data_catalog: for each table, what is its classification label?
- This tells you the sensitivity of each data point

### Step 4 — Add third-party disclosure
- Does any of this data flow to a third party?
- Query third_party_sharing table: which vendor received data from this table?

### Step 5 — Write the DSAR response
- Format the output as a structured list the compliance team can send to the customer
- Include: system name, what data it holds, classification, third-party disclosures, retention period
