// =====================================================
// Module: Home Dashboard
// =====================================================
window.MODULES.home = () => `
<div class="page-hero">
  <div class="module-badge">DataGuard Academy · 2026 Edition</div>
  <h1>Bank Data Classification<br>Interview Prep Platform</h1>
  <p>A complete 2-week course designed to prepare you for roles in Data Security Posture Management, Data Privacy, and AI Governance at a bank using automated one-touch data classification frameworks like <strong>1touch.io Kontxtual™</strong>.</p>
  <div class="hero-meta">
    <div class="hero-meta-item">&#128218; <span>10 Modules</span></div>
    <div class="hero-meta-item">&#9200; <span>~14 hours</span> total study time</div>
    <div class="hero-meta-item">&#128295; <span>3 Mini Projects</span></div>
    <div class="hero-meta-item">&#128188; <span>24+ Interview Questions</span></div>
  </div>
</div>

<h2>Your 2-Week Study Plan</h2>
<table class="week-plan">
  <thead><tr><th>Day</th><th>Focus</th><th>Modules</th><th>Goal</th></tr></thead>
  <tbody>
    <tr><td>Day 1</td><td>Foundations — SQL</td><td>Module 1</td><td>Write queries for classification audits</td></tr>
    <tr><td>Day 2</td><td>Foundations — Python</td><td>Module 2</td><td>Automate PII scanning with scripts</td></tr>
    <tr><td>Day 3</td><td>Cloud Infrastructure</td><td>Module 3</td><td>Understand AWS Macie, S3 tagging, Azure Purview</td></tr>
    <tr><td>Day 4–5</td><td>Classification Systems</td><td>Module 4</td><td>Master 1touch.io, vendor landscape, bank integration</td></tr>
    <tr><td>Day 6</td><td>Compliance Deep Dive</td><td>Module 5</td><td>Know DORA, GDPR, BCBS 239 cold</td></tr>
    <tr><td>Day 7</td><td>DSPM &amp; Security Tools</td><td>Module 6</td><td>Understand Purview, Unity Catalog, DLP, SIEM</td></tr>
    <tr><td>Day 8</td><td>AI/ML in Classification</td><td>Module 7</td><td>Explain NLP classification &amp; GenAI risks</td></tr>
    <tr><td>Day 9–10</td><td>Hands-On Projects</td><td>Module 8</td><td>Build 3 mini projects — PII scanner, audit queries, flow mapper</td></tr>
    <tr><td>Day 11–12</td><td>Interview Q&amp;A</td><td>Module 9</td><td>Practice all 24 questions with STAR answers</td></tr>
    <tr><td>Day 13</td><td>Communication Guide</td><td>Module 10</td><td>Master stakeholder translation &amp; elevator pitches</td></tr>
    <tr><td>Day 14</td><td>Full Review</td><td>All</td><td>Revisit weak areas, review notes, mock interview</td></tr>
  </tbody>
</table>

<h2>The 4 Roles This Course Prepares You For</h2>
<div class="stakeholder-grid">
  <div class="stakeholder-card tech">
    <div class="stakeholder-role">&#128736; DSPM Engineer</div>
    <div class="stakeholder-dept">Technical Implementation</div>
    <div class="stakeholder-needs">Implements platforms like 1touch.io or Purview. Writes SQL/Python to verify accuracy. Manages cloud scanning policies. Key skills: SQL, Python, AWS, Purview, Unity Catalog.</div>
  </div>
  <div class="stakeholder-card compliance">
    <div class="stakeholder-role">&#128203; Data Privacy Analyst</div>
    <div class="stakeholder-dept">Quality &amp; Accuracy</div>
    <div class="stakeholder-needs">Validates classification outputs. Handles DSARs. Runs PIAs. Maps data to GDPR/DORA requirements. Key skills: SQL, compliance frameworks, data ethics.</div>
  </div>
  <div class="stakeholder-card exec">
    <div class="stakeholder-role">&#128737; Data Protection Lead</div>
    <div class="stakeholder-dept">Strategy &amp; Exec Sponsorship</div>
    <div class="stakeholder-needs">Owns the classification programme. Reports to CISO/DPO. Manages vendor relationships. Key skills: GRC, DORA/GDPR, stakeholder management.</div>
  </div>
  <div class="stakeholder-card biz">
    <div class="stakeholder-role">&#129302; AI Governance Specialist</div>
    <div class="stakeholder-dept">Automated Agent Auditing</div>
    <div class="stakeholder-needs">Audits AI classification models for bias. Ensures AI Act compliance. Monitors GenAI tool access to sensitive data. Key skills: ML evaluation, AI ethics, policy.</div>
  </div>
</div>

<h2>Inside the bank: how this team actually operates</h2>
<p class="lead">Before diving into modules, internalise the operating model. Every interview question, every tool, every regulation lands inside the loop below — knowing the loop turns your answers from textbook to credible.</p>

<h3>The classification team in the org chart</h3>
<p>At a tier-1 bank, the people whose job is "knowing what data the bank has and protecting it" sit inside the <strong>Chief Information Security Office (CISO)</strong> and the <strong>Data Protection Office (DPO)</strong>. They are typically organised as four interlocking functions:</p>
<table class="data-table">
  <thead><tr><th>Function</th><th>Reports to</th><th>Headcount (mid-cap UK bank)</th><th>Primary deliverable</th></tr></thead>
  <tbody>
    <tr><td><strong>SOC</strong> (Security Operations Centre)</td><td>CISO</td><td>15&ndash;40 (24&times;7 rota)</td><td>Detect, triage, respond to security events; feed evidence to regulators</td></tr>
    <tr><td><strong>DSPM Engineering</strong> (Data Security Posture Management)</td><td>CISO &rarr; Head of Data Security</td><td>4&ndash;12</td><td>Operate the classifier (1touch.io / Purview), maintain the catalog, integrate scanners with the SIEM</td></tr>
    <tr><td><strong>Data Privacy</strong></td><td>DPO</td><td>3&ndash;8</td><td>Fulfil DSARs, run PIAs/DPIAs, sign off classification decisions, liaise with the ICO</td></tr>
    <tr><td><strong>AI Governance</strong></td><td>CISO + Chief Data Officer (joint)</td><td>2&ndash;6 (growing rapidly post-AI-Act)</td><td>Inventory AI/agent use, audit models touching sensitive data, certify under EU AI Act</td></tr>
  </tbody>
</table>
<div class="callout callout-info"><div class="callout-title">&#127970; Where SOC fits in classification</div><div>The SOC is not the team labelling data &mdash; that is DSPM. But the SOC <em>consumes</em> labels every minute of every day: a Splunk/Sentinel rule that fires on "10,000 rows from a Restricted table read by a Retail user in 60 seconds" only works if those tables are correctly tagged. Bad classification &rarr; blind SOC. Good classification &rarr; the SOC catches an insider exfil attempt in minutes instead of months.</div></div>

<h3>The end-to-end classification process (one week in the life)</h3>
<p>This is what an actual week looks like. The classifier itself is not magic &mdash; it is one component in a continuous loop.</p>
<div class="card-grid">
  <div class="card">
    <div class="card-icon">&#128269;</div>
    <div class="card-title">1. Discover</div>
    <div class="card-body">Connectors crawl every database, S3 bucket, SharePoint site, and warehouse the bank knows about. They write inventory rows to the data catalog. <em>Output:</em> a list of every table and column the bank technically holds. <em>Cadence:</em> nightly delta scans, weekly full scans.</div>
  </div>
  <div class="card">
    <div class="card-icon">&#128203;</div>
    <div class="card-title">2. Classify (auto)</div>
    <div class="card-body">The 1touch.io / Purview engine applies its rule packs (regex, NER, ML models) to every column and a value sample. Each match emits a label proposal with a confidence score. <em>Output:</em> tens of thousands of proposed labels.</div>
  </div>
  <div class="card">
    <div class="card-icon">&#128100;</div>
    <div class="card-title">3. Review (human-in-the-loop)</div>
    <div class="card-body">Privacy Analysts work the queue: anything below ~0.85 confidence is reviewed manually. Decisions are recorded with reviewer ID and timestamp &mdash; this trail is regulator-grade evidence. <em>Cadence:</em> daily; SLA varies (often 5 business days for new tables).</div>
  </div>
  <div class="card">
    <div class="card-icon">&#128274;</div>
    <div class="card-title">4. Enforce</div>
    <div class="card-body">Labels propagate to the controls layer: encryption tier (KMS CMK), bucket policy, IAM roles, DLP rules, masking views. A column flipping from <em>Internal</em> to <em>Restricted</em> can revoke read access for hundreds of users automatically.</div>
  </div>
  <div class="card">
    <div class="card-icon">&#128202;</div>
    <div class="card-title">5. Monitor</div>
    <div class="card-body">SIEM (Splunk / Sentinel) watches access patterns against labels. Anomaly rules fire alerts to the SOC: "unusual volume on a Restricted table", "off-hours read", "first-time accessor". <em>Output:</em> tickets, sometimes automated revoke actions.</div>
  </div>
  <div class="card">
    <div class="card-icon">&#128221;</div>
    <div class="card-title">6. Audit &amp; report</div>
    <div class="card-body">Compliance teams produce a monthly coverage + access pack for the CISO and the regulator (DORA Pillar 2 evidence). Findings feed back into rule tuning &mdash; closing the loop. <em>Cadence:</em> monthly internal, quarterly to FCA/PRA/ICO.</div>
  </div>
</div>

<h3>Programme timeline (when does each phase happen?)</h3>
<table class="data-table">
  <thead><tr><th>Horizon</th><th>What the team is doing</th><th>What "good" looks like</th></tr></thead>
  <tbody>
    <tr><td><strong>Day 0</strong> (kick-off)</td><td>Vendor selected (e.g. 1touch.io). Connectors deployed against pilot scope (1&ndash;2 systems).</td><td>Inventory of pilot scope &mdash; ~5,000 columns catalogued.</td></tr>
    <tr><td><strong>Week 1&ndash;2</strong></td><td>Rule packs tuned for the bank's vocabulary (e.g. internal abbreviations like "SOL_REF" for sort code). First auto-classification run.</td><td>≥70% of pilot columns auto-classified with confidence ≥ 0.85.</td></tr>
    <tr><td><strong>Month 1&ndash;3</strong></td><td>Privacy Analysts clear the review backlog. DSPM team integrates classifier with SIEM and IAM. First "label-aware" SOC alerts go live.</td><td>Pilot scope at &gt;95% coverage. Mean time to fulfil a DSAR drops from weeks to days.</td></tr>
    <tr><td><strong>Quarter 2</strong></td><td>Rollout to remaining systems &mdash; warehouses, lakes, SaaS apps. Embed catalog checks in CI: a new table without a catalog entry fails build.</td><td>Bank-wide coverage &gt;80%. New-system onboarding has classification baked in by default.</td></tr>
    <tr><td><strong>Quarter 3&ndash;4</strong></td><td>AI Governance team starts using catalog labels to gate GenAI tools (block prompts that would touch Restricted data). DORA evidence packs go to PRA on schedule.</td><td>First annual DORA submission cleanly evidenced. Zero critical regulator findings on data handling.</td></tr>
    <tr><td><strong>Year 2+</strong></td><td>Continuous tuning. Drift detection &mdash; columns whose content shifts (e.g. a free-text field starts containing PII it didn't before). M&amp;A integration playbook used when the bank acquires another business.</td><td>Classification is "table stakes" &mdash; nobody discusses whether to do it; it just runs. Mean DSAR fulfilment &lt; 5 working days.</td></tr>
  </tbody>
</table>

<h3>Where the value comes from</h3>
<p>The CFO and the regulator see classification through different lenses. Both add up to a multi-million-pound annual figure. Knowing the numbers is what separates a senior candidate from a junior one in interview.</p>
<table class="data-table">
  <thead><tr><th>Value lever</th><th>Mechanism</th><th>Order of magnitude</th></tr></thead>
  <tbody>
    <tr><td><strong>Regulatory fines avoided</strong></td><td>GDPR Art. 83: up to 4% of global turnover. DORA penalties (PRA): up to 1% of average daily turnover per day. Correctly classifying data is the precondition for evidencing compliant handling.</td><td>For a £20bn-revenue UK bank, ceiling exposure is ~£800m. Realistic year-on-year avoidance: £5m&ndash;£40m.</td></tr>
    <tr><td><strong>Faster DSARs / DPRs</strong></td><td>Statutory 1-month deadline. Without a catalog, fulfilling one request is a 2&ndash;3 week scavenger hunt across 30+ systems. With a catalog, it is automated.</td><td>~£500&ndash;£2,000 saved per request. Tier-1 banks process 5,000&ndash;50,000 requests/year.</td></tr>
    <tr><td><strong>Faster M&amp;A integration</strong></td><td>Classification of acquired data is a regulatory precondition for migrating customers onto the parent's systems. Mature programmes shave 6&ndash;12 months off integration timelines.</td><td>Hundreds of millions in earlier revenue realisation per acquisition.</td></tr>
    <tr><td><strong>Reduced breach impact</strong></td><td>If a breach occurs, classification limits scope: regulators care whether 5 million records were Restricted PII or Public marketing data. The fine ratio is roughly 100&times; different.</td><td>Tens to hundreds of millions per averted incident.</td></tr>
    <tr><td><strong>AI risk surface reduced</strong></td><td>Without labels, GenAI tools (Copilot, Claude, internal LLMs) can ingest Restricted data into prompts and outputs. With labels, prompts touching Restricted are blocked or redacted at the gateway.</td><td>Increasingly the #1 board-level concern in 2026 &mdash; AI Act fines are up to 7% of turnover.</td></tr>
    <tr><td><strong>Lower cloud spend</strong></td><td>Restricted data must live in encrypted, residency-locked tiers. Public/Internal data does not. Misclassification leads to over-provisioning the expensive tier.</td><td>15&ndash;30% saving on storage line items at scale.</td></tr>
  </tbody>
</table>

<h3>How each role's KPIs feed the value chain</h3>
<p>This is the question senior interviewers love: "How is your work measured?" The honest answer ties metrics to the levers above &mdash; not to vanity numbers like "rules tuned this quarter".</p>
<table class="data-table">
  <thead><tr><th>Role</th><th>KPI it owns</th><th>Value lever it drives</th><th>What underperformance looks like</th></tr></thead>
  <tbody>
    <tr><td><strong>SOC Analyst (L1/L2)</strong></td><td>Mean time to detect (MTTD), mean time to respond (MTTR) on data-related alerts; false-positive rate.</td><td>Reduced breach impact; regulator confidence.</td><td>Insider exfil discovered weeks late &mdash; turns a £100k incident into a £40m fine.</td></tr>
    <tr><td><strong>DSPM Engineer</strong></td><td>Catalog coverage (% of columns labelled); auto-label precision &amp; recall; time-to-onboard a new system.</td><td>Faster DSARs; AI risk reduction; cloud cost optimisation.</td><td>Coverage stuck at 60% &rarr; 40% of bank data invisible to controls &rarr; SOC alerts have huge blind spots.</td></tr>
    <tr><td><strong>Privacy Analyst</strong></td><td>DSAR turnaround time; review queue SLA; PIA throughput.</td><td>Regulatory fines avoided; customer trust (NPS impact).</td><td>Single missed DSAR deadline = automatic ICO finding, even if everything else is perfect.</td></tr>
    <tr><td><strong>Data Protection Lead</strong></td><td>Audit findings closed on time; regulator-letter response time; programme budget vs benefit.</td><td>Programme survival; exec buy-in for next-year budget.</td><td>An "Inadequate" rating from PRA threat &rarr; existential.</td></tr>
    <tr><td><strong>AI Governance Specialist</strong></td><td>Inventory of AI/agent use cases; % of high-risk uses with completed assessments; gateway block rate on sensitive prompts.</td><td>AI Act compliance; reduced GenAI leakage risk.</td><td>An LLM trained on Restricted data without consent = a 7%-of-turnover ceiling fine.</td></tr>
  </tbody>
</table>
<div class="callout callout-success"><div class="callout-title">&#127919; The interview-grade summary</div><div>A bank classifies data because it has to (regulation), and because the classification map unlocks every other data control: encryption, access, monitoring, AI governance, M&amp;A, and DSAR. The team is small (often 10&ndash;30 people) but every metric on the CISO dashboard depends on whether they are doing it well. When asked "what does success look like in this role?", tie your answer to one of the value levers above and one KPI you would own.</div></div>
<div class="callout callout-info"><div class="callout-title">&#129518; Self-host the lab</div><div>A complete <strong>runnable lab</strong> ships with this course at <code>bank-interview-prep/lab/</code>. Postgres, Adminer, Python scanners, role/permission exercises, the full label-review CLI, and 5 hands-on exercises with worked solutions. Runs on WSL/macOS/Linux via Docker &mdash; no cloud account, no PII risk. Read <a href="https://github.com/IFCGIT2024/my-portfolio/tree/main/bank-interview-prep/lab" target="_blank" rel="noopener">lab/README.md</a> to start.</div></div>

<h2>Course Modules</h2>
<div class="home-modules">
  <div class="home-module-card" data-goto="m1">
    <div class="hm-top"><div class="hm-icon">&#128452;</div><div><div class="hm-num">Module 1 · Foundation</div><div class="hm-title">SQL for Data Analysts</div></div></div>
    <div class="hm-desc">Master the queries used daily in classification work — auditing labels, finding unclassified data, writing compliance reports. SQL is ~40% of a data analyst's time at a bank.</div>
    <div class="hm-footer"><span class="hm-time">&#9200; ~1.5 hrs</span><div class="hm-bar"><div class="hm-bar-fill"></div></div></div>
  </div>
  <div class="home-module-card" data-goto="m2">
    <div class="hm-top"><div class="hm-icon">&#128013;</div><div><div class="hm-num">Module 2 · Foundation</div><div class="hm-title">Python for Automation</div></div></div>
    <div class="hm-desc">Build scripts to detect PII, call classification APIs, clean data before labelling, and automate compliance reports. Essential for DSPM Engineer and Privacy Analyst roles.</div>
    <div class="hm-footer"><span class="hm-time">&#9200; ~1.5 hrs</span><div class="hm-bar"><div class="hm-bar-fill"></div></div></div>
  </div>
  <div class="home-module-card" data-goto="m3">
    <div class="hm-top"><div class="hm-icon">&#9729;</div><div><div class="hm-num">Module 3 · Foundation</div><div class="hm-title">Cloud &amp; AWS Basics</div></div></div>
    <div class="hm-desc">AWS S3 bucket policies, Macie PII scanning, IAM roles, CloudTrail audit logs, and Azure Purview integration. Understand how cloud platforms fit a bank's hybrid architecture.</div>
    <div class="hm-footer"><span class="hm-time">&#9200; ~1 hr</span><div class="hm-bar"><div class="hm-bar-fill"></div></div></div>
  </div>
  <div class="home-module-card" data-goto="m4">
    <div class="hm-top"><div class="hm-icon">&#128274;</div><div><div class="hm-num">Module 4 · Core Domain</div><div class="hm-title">Data Classification Systems</div></div></div>
    <div class="hm-desc">The key module. Deep dive into 1touch.io Kontxtual™, how one-touch automated classification works, full vendor comparison (Purview, Varonis, BigID, Securiti), and bank stakeholder map.</div>
    <div class="hm-footer"><span class="hm-time">&#9200; ~2 hrs</span><div class="hm-bar"><div class="hm-bar-fill"></div></div></div>
  </div>
  <div class="home-module-card" data-goto="m5">
    <div class="hm-top"><div class="hm-icon">&#9878;</div><div><div class="hm-num">Module 5 · Banking Domain</div><div class="hm-title">Compliance &amp; Regulation</div></div></div>
    <div class="hm-desc">DORA, GDPR, BCBS 239, CCPA, AI Act 2026 — understand what each requires, how classification enables compliance, and how to talk about it in an interview.</div>
    <div class="hm-footer"><span class="hm-time">&#9200; ~1.5 hrs</span><div class="hm-bar"><div class="hm-bar-fill"></div></div></div>
  </div>
  <div class="home-module-card" data-goto="m6">
    <div class="hm-top"><div class="hm-icon">&#128737;</div><div><div class="hm-num">Module 6 · Tools</div><div class="hm-title">DSPM &amp; Security Stack</div></div></div>
    <div class="hm-desc">Microsoft Purview, Databricks Unity Catalog, DLP policies, Splunk, Sentinel — how these tools connect into a complete data security posture management architecture.</div>
    <div class="hm-footer"><span class="hm-time">&#9200; ~1 hr</span><div class="hm-bar"><div class="hm-bar-fill"></div></div></div>
  </div>
  <div class="home-module-card" data-goto="m7">
    <div class="hm-top"><div class="hm-icon">&#129302;</div><div><div class="hm-num">Module 7 · Advanced</div><div class="hm-title">AI/ML in Classification</div></div></div>
    <div class="hm-desc">How NLP, ML models, and LLMs power modern classification. GenAI visibility in 2026. Agent-based classification. AI ethics, bias auditing, precision/recall tradeoffs in banking.</div>
    <div class="hm-footer"><span class="hm-time">&#9200; ~1 hr</span><div class="hm-bar"><div class="hm-bar-fill"></div></div></div>
  </div>
  <div class="home-module-card" data-goto="m8">
    <div class="hm-top"><div class="hm-icon">&#128295;</div><div><div class="hm-num">Module 8 · Practice</div><div class="hm-title">Mini Projects</div></div></div>
    <div class="hm-desc">3 one-hour hands-on projects: build a PII detector in Python, write a classification audit in SQL, and create a data flow mapper. Grounded in real-world bank scenarios.</div>
    <div class="hm-footer"><span class="hm-time">&#9200; ~3 hrs</span><div class="hm-bar"><div class="hm-bar-fill"></div></div></div>
  </div>
  <div class="home-module-card" data-goto="m9">
    <div class="hm-top"><div class="hm-icon">&#128188;</div><div><div class="hm-num">Module 9 · Interview</div><div class="hm-title">Interview Q&amp;A Bank</div></div></div>
    <div class="hm-desc">24 interview questions with model STAR answers across all seniority levels — Technical SQL, Python, Classification Systems, Compliance, DSPM, AI/ML, and Behavioral questions.</div>
    <div class="hm-footer"><span class="hm-time">&#9200; ~2 hrs</span><div class="hm-bar"><div class="hm-bar-fill"></div></div></div>
  </div>
  <div class="home-module-card" data-goto="m10">
    <div class="hm-top"><div class="hm-icon">&#128483;</div><div><div class="hm-num">Module 10 · Soft Skills</div><div class="hm-title">Communication Guide</div></div></div>
    <div class="hm-desc">How to translate complex data security concepts for non-technical stakeholders. Stakeholder conversation templates, objection handling, and elevator pitches for your role.</div>
    <div class="hm-footer"><span class="hm-time">&#9200; ~1 hr</span><div class="hm-bar"><div class="hm-bar-fill"></div></div></div>
  </div>
</div>

${_callout('info', '&#128161; How to Use This Platform', 'Work through modules in order — each one builds on the previous. Use the <strong>Mark Complete</strong> button after each module to track progress. Return to Module 9 (Interview Q&A) repeatedly in the final days before your interview.')}
`;
