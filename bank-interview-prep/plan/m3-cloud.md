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
