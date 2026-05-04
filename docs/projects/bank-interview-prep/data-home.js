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
