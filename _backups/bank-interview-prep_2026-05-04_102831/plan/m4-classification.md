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
