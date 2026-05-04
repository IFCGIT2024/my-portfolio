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
