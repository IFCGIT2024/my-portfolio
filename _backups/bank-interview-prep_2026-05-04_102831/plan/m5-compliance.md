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
