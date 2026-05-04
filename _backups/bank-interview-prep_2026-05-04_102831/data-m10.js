// =====================================================
// Module 10: Communication Guide
// =====================================================
window.MODULES.m10 = () => `
<div class="page-hero">
  <div class="module-badge">Module 10 · Final Module</div>
  <h1>Communication &amp; Stakeholder Guide</h1>
  <p>Technical excellence alone does not get you the job — or the promotion. This module covers how to explain complex data classification and DSPM concepts to any audience, handle difficult stakeholder conversations, and communicate as a credible expert in an interview and on the job.</p>
  <div class="hero-meta">
    <div class="hero-meta-item">&#128172; <span>5 Audience Profiles</span></div>
    <div class="hero-meta-item">&#128204; <span>All 4 Target Roles</span></div>
    <div class="hero-meta-item">&#9200; <span>~1.5 hrs</span></div>
  </div>
</div>

${_callout('info', '&#128161; Why This Module Exists', 'The most common feedback interviewers give about technically strong candidates: "They couldn\'t explain it in plain language." And the most common reason privacy/DSPM programmes fail: "The business units didn\'t understand why it mattered." This module fixes both problems.')}

<!-- SECTION 1: AUDIENCE PROFILES -->
<h2>&#127919; Know Your Audience</h2>
<p>Every stakeholder cares about something different. Adapt the same underlying message to what <em>they</em> care about — not what you find interesting.</p>

<div class="stakeholder-grid">

  <div class="stakeholder-card tech">
    <div class="stakeholder-role">&#128187; CTO / Head of Engineering</div>
    <div class="stakeholder-needs">
      <strong>Cares about:</strong> Scalability, technical debt, system performance, build vs buy decisions, developer experience.<br><br>
      <strong>Speaks in:</strong> Architecture, APIs, latency, throughput, integration complexity.<br><br>
      <strong>Your message:</strong> "Classification integrates via API into your existing pipelines with no change to developer workflows. The agent is lightweight — it reads metadata, not raw data — so there's no performance impact on production systems."<br><br>
      <strong>What to avoid:</strong> Regulatory jargon. Instead of "GDPR Article 25 data protection by design," say "baking security into the pipeline from day one."
    </div>
  </div>

  <div class="stakeholder-card exec">
    <div class="stakeholder-role">&#128737; CISO</div>
    <div class="stakeholder-needs">
      <strong>Cares about:</strong> Risk exposure, regulatory standing, incident response capability, board reporting.<br><br>
      <strong>Speaks in:</strong> Risk ratings, CVEs, control maturity, audit findings, threat vectors.<br><br>
      <strong>Your message:</strong> "Right now, we have X% of our data estate unclassified — meaning we have no way to enforce proportionate controls or detect Restricted data exfiltration. Classification closes this gap and gives us a live risk dashboard instead of a quarterly manual audit."<br><br>
      <strong>What to avoid:</strong> Feature lists. They want risk reduction, not product specs.
    </div>
  </div>

  <div class="stakeholder-card compliance">
    <div class="stakeholder-role">&#9878; Legal / Compliance / DPO</div>
    <div class="stakeholder-needs">
      <strong>Cares about:</strong> Regulatory obligations, audit trails, defensibility, liability exposure.<br><br>
      <strong>Speaks in:</strong> Articles, recitals, legal basis, accountability, evidence.<br><br>
      <strong>Your message:</strong> "Automated classification gives you the evidence you need for an ICO audit — a complete, timestamped record of what data we held, when it was classified, by whom, and what controls were applied. It transforms 'we believe we comply' into 'here is the documented proof.'"<br><br>
      <strong>What to avoid:</strong> Uncertainty. Legal stakeholders need to know what you <em>can</em> prove, not what you estimate.
    </div>
  </div>

  <div class="stakeholder-card biz">
    <div class="stakeholder-role">&#128188; Business Unit Heads</div>
    <div class="stakeholder-needs">
      <strong>Cares about:</strong> Revenue, productivity, team morale, not being blocked by IT.<br><br>
      <strong>Speaks in:</strong> Deadlines, customer impact, competitive advantage, budget.<br><br>
      <strong>Your message:</strong> "The classification system will automatically label your team's data — you don't need to classify anything manually. The DLP controls only apply to the 5% of your data that's actually sensitive; the other 95% works exactly as it does today. And when regulators audit us, we have proof that your data was protected — which protects your team."<br><br>
      <strong>What to avoid:</strong> Telling them what they <em>can't</em> do. Lead with what stays the same.
    </div>
  </div>

  <div class="stakeholder-card exec">
    <div class="stakeholder-role">&#127947; Board / C-Suite (Non-Technical)</div>
    <div class="stakeholder-needs">
      <strong>Cares about:</strong> Strategic risk, reputation, regulatory fines, competitive position, fiduciary duty.<br><br>
      <strong>Speaks in:</strong> Headlines, percentages, financial impact, peer benchmarks.<br><br>
      <strong>Your message:</strong> "Our data classification programme reduces our maximum GDPR fine exposure from €20M to manageable through documented due diligence. It is now a regulatory expectation — not optional. Our peers have implemented it. The cost of the programme is a fraction of a single regulator fine or data breach notification event."<br><br>
      <strong>What to avoid:</strong> Technical details of any kind. They need to understand the risk in pounds and reputation.
    </div>
  </div>

</div>

<!-- SECTION 2: ELEVATOR PITCHES -->
<h2>&#127906; Elevator Pitches by Role</h2>
<p>A 60-second version of your value proposition, tailored to the role you're interviewing for. Memorise one of these — say it out loud until it sounds natural, not rehearsed.</p>

<div class="tabs">
  <div class="tab-headers">
    <button class="tab-btn active" data-tab-group="pitch" data-tab="pitch-dspm">DSPM Engineer</button>
    <button class="tab-btn" data-tab-group="pitch" data-tab="pitch-privacy">Privacy Analyst</button>
    <button class="tab-btn" data-tab-group="pitch" data-tab="pitch-protection">Data Protection Lead</button>
    <button class="tab-btn" data-tab-group="pitch" data-tab="pitch-ai">AI Governance</button>
  </div>

  <div class="tab-panel active" data-tab-group="pitch" data-tab="pitch-dspm">
    <div class="callout callout-info">
      <div class="callout-title">DSPM Engineer — 60-Second Pitch</div>
      <p>"I'm a data security engineer specialising in DSPM — data security posture management. My focus is on making sure a bank always knows where its sensitive data is, what controls are applied to it, and whether those controls are working. I do this through a combination of automated classification pipelines, SQL and Python tooling that integrates with platforms like 1touch.io and Microsoft Purview, and SIEM detection rules in Splunk and Sentinel. What I find most interesting about this role is the intersection of data engineering and security — you need both to solve the problem. A classification system that finds the right data but can't integrate with the enforcement layer is only half the job. I want to build the full pipeline: discovery, classification, monitoring, and response."</p>
    </div>
  </div>

  <div class="tab-panel" data-tab-group="pitch" data-tab="pitch-privacy">
    <div class="callout callout-info">
      <div class="callout-title">Data Privacy Analyst — 60-Second Pitch</div>
      <p>"I'm a data privacy analyst with a focus on the operational side of GDPR and DORA compliance — specifically making sure data classification metadata actually drives real compliance outcomes, not just paper compliance. I work at the intersection of the privacy team, data engineering, and the business: translating regulatory requirements into classification policies, running audit queries to find gaps, and supporting DSAR processes with the underlying data mapping work. I have hands-on SQL and Python experience for classification analysis, and I understand how platforms like 1touch.io and Microsoft Purview generate and manage classification metadata. I'm drawn to banking because the regulatory environment is genuinely complex — DORA and GDPR together create classification requirements you don't find in other industries."</p>
    </div>
  </div>

  <div class="tab-panel" data-tab-group="pitch" data-tab="pitch-protection">
    <div class="callout callout-info">
      <div class="callout-title">Data Protection Lead — 60-Second Pitch</div>
      <p>"I lead data protection programmes with a focus on building classification frameworks that business units and technical teams can actually use — not just frameworks that look good in an audit. My background spans regulatory compliance (GDPR, DORA, BCBS 239), stakeholder engagement across business and technical teams, and the governance side: DPIAs, record of processing activities, third-party data processor management. I understand the technical implementation well enough to have credible conversations with engineering — I know how 1touch.io, Purview, and Varonis work and where their limits are. But my core value is translating between the regulatory obligation and what needs to actually happen on the ground, and making sure both the business and the regulators are satisfied."</p>
    </div>
  </div>

  <div class="tab-panel" data-tab-group="pitch" data-tab="pitch-ai">
    <div class="callout callout-info">
      <div class="callout-title">AI Governance Specialist — 60-Second Pitch</div>
      <p>"I focus on the governance of AI systems in regulated financial environments — specifically ensuring that AI used for data classification, fraud detection, and credit decisions is transparent, auditable, and compliant with the EU AI Act. My background connects data governance, AI ethics, and the practical reality of deploying ML models at scale: understanding precision-recall tradeoffs, managing bias in training data, building model cards and audit trails. The August 2026 AI Act deadline for high-risk AI systems in banking is creating an urgent need for people who can bridge AI model development, regulatory compliance, and data governance — which is exactly where I sit. I'm particularly interested in the emerging challenge of governing GenAI tools like Copilot that are now accessing classified data assets."</p>
    </div>
  </div>
</div>

<!-- SECTION 3: CONVERSATION TEMPLATES -->
<h2>&#128172; Conversation Templates</h2>

<div class="card-grid">

  <div class="card">
    <h3>&#128268; Explaining 1touch.io to a Non-Technical Exec</h3>
    <p><strong>Situation:</strong> The CFO asks "what does 1touch.io actually do?"</p>
    <p><strong>Template:</strong> "Think of 1touch.io as a continuous audit of all the data in our bank — but one that runs automatically, every day, without any humans having to manually check anything. It connects to every database, file store, and cloud service, reads the structure and patterns in our data, and puts a label on each piece: Public, Internal, Confidential, or Restricted. It then builds a map of how that data flows between systems. So if I ask 'where is all our customer IBAN data?' — instead of a six-week manual project, we get an answer in hours. And if someone accesses Restricted data in an unusual way, the system flags it immediately."</p>
  </div>

  <div class="card">
    <h3>&#128680; Opening the DLP Conversation with a Business Unit</h3>
    <p><strong>Situation:</strong> You need a business unit head to accept a new DLP control on their data.</p>
    <p><strong>Template:</strong> "I want to show you something before we talk about the new control. [Show the audit data] These are the tables in your business unit that are classified as Restricted — and right now, [X] people have access to them. Some of those are people who left the team 18 months ago. The DLP control I'm proposing doesn't change how your current team works — but it closes off the access paths that shouldn't exist and gives us a record that protects you personally in the event of an audit. Can I walk you through what exactly would change for your team day-to-day?"</p>
  </div>

  <div class="card">
    <h3>&#9889; Escalating a Classification Gap to the CISO</h3>
    <p><strong>Situation:</strong> You've found 200 unclassified tables containing potential PII.</p>
    <p><strong>Template:</strong> "I want to flag a risk finding that needs your awareness. Running audit queries against our data catalog, I've identified 200 tables that contain columns consistent with customer PII — account numbers, NINumbers, dates of birth — but have no classification label applied. This means they're currently invisible to our DLP policies and our access monitoring. The tables are in [systems X, Y, Z]. I've prepared a remediation plan: I can have 50 highest-priority tables classified within two weeks, and the remaining 150 within six weeks, using [tool/process]. Do I have your sign-off to proceed, and are there any constraints I should know about?"</p>
  </div>

  <div class="card">
    <h3>&#128064; Explaining a DSAR Delay to Legal</h3>
    <p><strong>Situation:</strong> A DSAR is taking longer than expected because the customer's data spans legacy systems with no classification metadata.</p>
    <p><strong>Template:</strong> "The delay on DSAR [reference] is because the customer's data exists in our legacy [system name] — which predates our classification platform and has no metadata entries in our catalog. We're manually reviewing [X] tables to determine which contain this customer's data. Best case we complete by [date], worst case [date + buffer]. To prevent this happening again: I'm recommending we prioritise ingesting [system name] into the classification catalog as part of our Q[X] programme. I'll document this DSAR timeline and the root cause for our Article 30 record. Is there a particular legal risk you need me to address in the meantime?"</p>
  </div>

</div>

<!-- SECTION 4: OBJECTION HANDLING -->
<h2>&#128286; Handling Common Objections</h2>

<table class="data-table">
  <thead>
    <tr>
      <th>Objection</th>
      <th>Who Says It</th>
      <th>Underlying Concern</th>
      <th>Your Response</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>"This DLP is blocking my team's work"</td>
      <td>Business Unit Head</td>
      <td>Productivity impact, team morale</td>
      <td>"Tell me specifically what's being blocked and I'll review the policy. Our goal is to protect genuinely sensitive data — not to restrict legitimate business workflows. In 90% of cases we can tune the policy or create an exception within 24 hours."</td>
    </tr>
    <tr>
      <td>"We already have Purview — why do we need 1touch.io?"</td>
      <td>CTO / Finance</td>
      <td>Budget, duplication of tools</td>
      <td>"Purview excels at Microsoft workloads — Office, Teams, Azure. But our Oracle databases, IBM mainframes, and AWS S3 buckets are outside Purview's effective coverage. 1touch.io classifies the full estate, then the labels sync to Purview. They're complementary, not competing."</td>
    </tr>
    <tr>
      <td>"The classification AI made a mistake — it classified a public marketing document as Confidential"</td>
      <td>Any stakeholder</td>
      <td>Trust in AI accuracy</td>
      <td>"That's useful feedback — the system has an override process: you submit a review request, a human reviewer assesses it within 48 hours, and if it's a genuine misclassification, the label is corrected and the case feeds back into the model training to improve accuracy. The AI gets better over time through exactly these corrections."</td>
    </tr>
    <tr>
      <td>"We've been managing data security without classification for 20 years — why now?"</td>
      <td>Skeptical senior manager</td>
      <td>Change resistance, ROI doubt</td>
      <td>"Two things changed: DORA and the AI Act require documented data asset inventories by 2025-2026 — manual processes can't scale to that requirement. And our data estate has grown 10x — what worked with 200 databases doesn't work with 2,000. The question isn't whether to classify, it's whether we do it proactively or reactively after an audit finding."</td>
    </tr>
    <tr>
      <td>"This is a security team problem, not my problem"</td>
      <td>Business Unit Head</td>
      <td>Ownership avoidance</td>
      <td>"Under GDPR, the data owner is legally accountable for data in their business area — even if the security team implements the controls. If there's a breach of customer data in your tables, the ICO will look at you as the data owner. My job is to make data protection as easy as possible for your team — but we do need your engagement to make it complete."</td>
    </tr>
  </tbody>
</table>

<!-- SECTION 5: PLAIN LANGUAGE TRANSLATIONS -->
<h2>&#128203; The Plain Language Test</h2>
<p>Can you explain these concepts to someone who has never worked in data security? Practice these — interviewers often ask you to "explain it in simple terms."</p>

<div class="card-grid">

  <div class="card">
    <h3>Data Classification</h3>
    <p><strong>Technical version:</strong> Assigning a sensitivity label based on data content, context, and regulatory requirements using AI/ML classification engines with contextual analysis.</p>
    <p><strong>Plain English:</strong> "Putting a sticker on every piece of data we have — like 'Public', 'Confidential', or 'Restricted' — so the systems that hold and move data know automatically how carefully to protect it."</p>
  </div>

  <div class="card">
    <h3>DSPM</h3>
    <p><strong>Technical version:</strong> A security discipline that continuously discovers, classifies, and monitors data assets across hybrid environments to manage data security risk posture.</p>
    <p><strong>Plain English:</strong> "Knowing at all times where all your sensitive data is, who has access to it, and whether those access controls are actually working — automatically, without needing to manually check."</p>
  </div>

  <div class="card">
    <h3>Data Lineage</h3>
    <p><strong>Technical version:</strong> The ability to trace the origin, movement, transformation, and destination of data across the full data supply chain.</p>
    <p><strong>Plain English:</strong> "Being able to trace a number in a board report all the way back to the original database record it came from, through every system and transformation in between — like a chain of custody for data."</p>
  </div>

  <div class="card">
    <h3>Zero-Trust Data Access</h3>
    <p><strong>Technical version:</strong> An access control model where authorization is continuously evaluated based on identity claims, classification labels, and contextual signals rather than network perimeter trust.</p>
    <p><strong>Plain English:</strong> "Instead of 'if you're inside the office network you can access anything,' every single data request is checked: who are you, what are you accessing, and does your job role actually require this data — every time, even for senior employees."</p>
  </div>

  <div class="card">
    <h3>GenAI Data Risk</h3>
    <p><strong>Technical version:</strong> The risk that LLM-based tools accessing classified data assets may inadvertently expose, aggregate, or transmit sensitive information through natural language interfaces.</p>
    <p><strong>Plain English:</strong> "If your employees use ChatGPT or Copilot to summarise customer reports, those AI tools might accidentally leak sensitive information into places it shouldn't go — because the AI doesn't know the data it's working with is confidential."</p>
  </div>

  <div class="card">
    <h3>Precision vs Recall</h3>
    <p><strong>Technical version:</strong> Precision = of items flagged as sensitive, what % actually are. Recall = of all sensitive items, what % were flagged.</p>
    <p><strong>Plain English:</strong> "You can set a security alarm that triggers on everything — that means it never misses a real threat (high recall), but it goes off 500 times a day for nothing (low precision). Or you tune it to only trigger on very serious events — fewer false alarms, but occasional real ones get missed. Banking chooses high recall for the most sensitive data categories."</p>
  </div>

</div>

<!-- SECTION 6: INTERVIEW DAY TIPS -->
<h2>&#127894; Interview Day Preparation</h2>

<div class="card-grid">

  <div class="card">
    <h3>&#128198; The Night Before</h3>
    <ul>
      <li>Re-read the job description and map each requirement to a module in this course</li>
      <li>Review the 5-tier classification taxonomy (Module 4) — know Public/Internal/Confidential/Restricted/Highly Restricted cold</li>
      <li>Review your STAR answers — pick 3-4 of the strongest and practice saying them out loud</li>
      <li>Know at least one specific fact about 1touch.io / Kontxtual&#8482; to mention: "relationship intelligence," "metadata-only architecture," "GenAI visibility"</li>
      <li>Know the current regulatory deadline most relevant to the role: DORA (January 2025), AI Act high-risk (August 2026)</li>
    </ul>
  </div>

  <div class="card">
    <h3>&#127775; In the Room</h3>
    <ul>
      <li><strong>Listen for the real question behind the question</strong> — "Tell me about your SQL experience" often means "Can you write the queries we need for compliance reporting?"</li>
      <li><strong>Bridge from technical to business impact</strong> — never end a technical answer without stating what business problem it solves</li>
      <li><strong>Use numbers</strong> — "classified 3,000 tables," "reduced false positives by 60%," "30-day GDPR deadline" — specifics are memorable</li>
      <li><strong>Say "I don't know, but here's how I'd find out"</strong> — this is stronger than guessing</li>
      <li><strong>Ask one strong question</strong> at the end: "What does success look like in the first 90 days for this role?"</li>
    </ul>
  </div>

  <div class="card">
    <h3>&#128221; Strong Closing Statement</h3>
    <p>If asked "is there anything else you'd like us to know about you?" — use this structure:</p>
    <ul>
      <li>One sentence: your core differentiator (technical + regulatory + communication)</li>
      <li>One sentence: why this bank and this role specifically</li>
      <li>One sentence: what you'd bring in the first 90 days</li>
    </ul>
    <p><em>Example: "What I bring is the combination of hands-on DSPM engineering — Python, SQL, Purview, Splunk — with the regulatory grounding in DORA and GDPR that lets me translate between the technical and compliance teams. I'm particularly interested in [bank name] because [specific reason]. In my first 90 days I'd focus on understanding the current classification coverage gaps and building the audit queries to make those gaps visible — so we can prioritise remediation by risk rather than guesswork."</em></p>
  </div>

</div>

${_callout('success', '&#127881; Course Complete!', 'You\'ve finished all 10 modules of DataGuard Academy. You now have a comprehensive understanding of data classification systems, 1touch.io Kontxtual&#8482;, SQL and Python tooling, compliance frameworks (GDPR, DORA, BCBS 239, AI Act), DSPM and security tools, AI/ML in classification, hands-on project experience, 24 interview Q&amp;As, and stakeholder communication skills. Good luck in your interview.')}

${_nav('m9', 'm10', null)}
`;
