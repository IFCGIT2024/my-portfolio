// =====================================================
// Module 6: DSPM & Security Tools
// =====================================================
window.MODULES.m6 = () => {

const dlp_rules = `// DLP Rule Examples — what classification labels enforce
// These are policy definitions, not code — but this is how they look in JSON form.

const dlp_policies = [
  {
    rule_name: "Block-Restricted-External-Email",
    trigger: "email contains attachment OR text",
    condition: "classification_label IN ('Restricted', 'Highly Restricted')",
    destination: "recipient_domain NOT IN bank_approved_domains",
    action: "BLOCK",
    notification: "This file is classified Restricted. External sharing requires DPO approval.",
    alert: "SIEM: Attempted exfiltration of Restricted data by {user} to {external_domain}"
  },
  {
    rule_name: "Alert-BulkDownload-CustomerData",
    trigger: "database query OR file download",
    condition: "row_count > 1000 AND classification_label = 'Confidential'",
    destination: "ANY",
    action: "ALERT",
    notification: "Download of 1000+ customer records logged for compliance review.",
    alert: "SIEM: Bulk download of {row_count} Confidential records by {user} at {timestamp}"
  },
  {
    rule_name: "Block-Restricted-Copy-Paste",
    trigger: "clipboard paste",
    condition: "source_document_label IN ('Restricted', 'Highly Restricted')",
    destination: "target_app NOT IN managed_applications",
    action: "BLOCK",
    notification: "Copying Restricted content to unmanaged apps is not permitted.",
    alert: null  // low-noise: block silently, log only
  }
];`;

const siem_query = `// Splunk SPL: detect anomalous access to Restricted data
// Look for users accessing more Restricted tables than their 30-day average
index=access_logs classification_label="Restricted" OR classification_label="Highly Restricted"
| eval hour=strftime(_time, "%H")
| stats count AS today_count BY user_id
| join user_id [
    search index=access_logs classification_label="Restricted"
        earliest=-30d latest=-1d
    | stats count AS avg_30d BY user_id
    | eval avg_per_day = avg_30d / 30
  ]
| where today_count > avg_per_day * 3   // 3x normal = anomalous
| table user_id, today_count, avg_per_day
| sort -today_count

// Sentinel KQL equivalent:
// AccessLogs
// | where ClassificationLabel in ("Restricted", "Highly Restricted")
// | summarize TodayCount = count() by UserId
// | join kind=leftouter (
//     AccessLogs | where TimeGenerated >= ago(30d)
//     | summarize AvgCount = count()/30 by UserId
//   ) on UserId
// | where TodayCount > AvgCount * 3`;

const abac_example = `-- ABAC (Attribute-Based Access Control) policy logic
-- The classification label itself is the access control attribute.
-- This is pseudocode — real implementations use Snowflake Row Access Policies,
-- AWS Lake Formation, or Purview data policies.

CREATE ROW ACCESS POLICY restricted_access_policy AS (
    -- Dynamic: any table with this policy applied checks the label at query time
    table_classification_label VARCHAR,
    requesting_user_clearance  VARCHAR
) RETURNS BOOLEAN ->
    CASE
        -- Anyone can access Public or Internal
        WHEN table_classification_label IN ('Public', 'Internal')    THEN TRUE
        -- Confidential requires analyst-level clearance
        WHEN table_classification_label = 'Confidential'
             AND requesting_user_clearance IN ('analyst','senior-analyst','compliance','dpo','admin')
             THEN TRUE
        -- Restricted requires senior-analyst or above
        WHEN table_classification_label = 'Restricted'
             AND requesting_user_clearance IN ('senior-analyst','compliance','dpo','admin')
             THEN TRUE
        -- Highly Restricted: DPO and admin only
        WHEN table_classification_label = 'Highly Restricted'
             AND requesting_user_clearance IN ('dpo','admin')
             THEN TRUE
        ELSE FALSE  -- deny all other combinations
    END;

-- When a label changes from Confidential to Restricted,
-- access is automatically revoked for analysts — no manual role reassignment.`;

return _renderModule({
  id: 'm6', prev: 'm5', next: 'm7',
  badge: 'Module 6 · DSPM',
  title: 'DSPM & Security Tools',
  subtitle: 'Data Security Posture Management: the continuous monitoring of whether your data is as secure as you believe — even with no active attack. This module connects Purview, Unity Catalog, DLP, RBAC/ABAC, masking, Zero Trust, and SIEM into one coherent architecture.',
  meta: [
    '&#9200; <span>~2.5 hrs</span>',
    '&#128204; <span>Security Focus</span>',
    '&#128279; <span>7 Concepts</span>',
    '&#127891; <span>3 Projects</span>'
  ],
  tabs: [
    {
      id: 'overview', label: '&#128204; Overview',
      sections: [
        {type:'cards', items:[
          {icon:'&#128065;', title:'DSPM Posture',             body:'Not "is anyone attacking?" but "is our data correctly configured right now?" Discovers misconfigurations before attackers do.'},
          {icon:'&#127973;', title:'Microsoft Purview',        body:'Unified governance platform: sensitivity labels, data catalog, DLP, compliance manager, eDiscovery. Deep Azure/M365 integration.'},
          {icon:'&#128280;', title:'DLP — the Enforcement Layer', body:'Policies that monitor data in motion and block policy violations. Without DLP, a Restricted label is just a sticker. With it, it becomes an automatic control.'},
          {icon:'&#128737;', title:'Zero Trust Architecture',  body:'"Never trust, always verify." Classification labels are the foundation of Zero Trust authorisation decisions at the data layer.'},
        ]},
        {type:'callout', variant:'info', title:'&#127979; The Through-Line: How Everything Connects',
          body:'Data sources are scanned → labels applied to catalog → DLP policies read those labels → user tries to move data → DLP checks label → blocked actions alert the SIEM → SIEM correlates with other events → security team investigates. Classification is what makes every other tool in this chain meaningful.'},
        {type:'h2', text:'The Full Architecture'},
        {type:'html', content:`<div class="pipeline">
  <div class="pipeline-step"><div class="pipeline-step-num">1</div><div class="pipeline-step-name">Data Sources</div><div class="pipeline-step-desc">Databases, S3, SharePoint, M365</div></div>
  <div class="pipeline-arrow">→</div>
  <div class="pipeline-step"><div class="pipeline-step-num">2</div><div class="pipeline-step-name">Scan & Label</div><div class="pipeline-step-desc">1touch.io / Purview applies labels to catalog</div></div>
  <div class="pipeline-arrow">→</div>
  <div class="pipeline-step"><div class="pipeline-step-num">3</div><div class="pipeline-step-name">DLP Enforcement</div><div class="pipeline-step-desc">Labels trigger access and movement policies</div></div>
  <div class="pipeline-arrow">→</div>
  <div class="pipeline-step"><div class="pipeline-step-num">4</div><div class="pipeline-step-name">SIEM Correlation</div><div class="pipeline-step-desc">Blocked actions + access anomalies alert Splunk/Sentinel</div></div>
  <div class="pipeline-arrow">→</div>
  <div class="pipeline-step"><div class="pipeline-step-num">5</div><div class="pipeline-step-name">Investigate</div><div class="pipeline-step-desc">Security team acts on enriched, classified alerts</div></div>
</div>`},
      ]
    },
    {
      id: 'concepts', label: '&#128214; Concepts',
      sections: [{type:'accordion', items:[
        {
          title: 'Part 1 — What is Security Posture?',
          sections: [
            {type:'p', text:'"Posture" in security means the current state of your defences relative to where they should be. A good security posture means the controls in place actually match the risks you face.'},
            {type:'p', text:'<strong>DSPM specifically</strong> asks: "Is our data configured correctly right now?" — even with no active attack.'},
            {type:'ul', items:[
              'A Restricted data table that has been accidentally set to world-readable',
              'A backup file containing PII exported to a Public S3 bucket',
              'A new database created last week that has not yet been scanned',
              'A developer who has had access to production Restricted data for 6 months after switching teams',
            ]},
            {type:'callout', variant:'info', title:'&#128161; DSPM vs Traditional Security',
              body:'Traditional tools ask: "Is anyone attacking us right now?" DSPM asks: "Is our data exposed right now?" Both are needed. DSPM discovers misconfigurations before an attacker does — preventing the incident rather than just detecting it.'},
          ]
        },
        {
          title: 'Part 2 — Microsoft Purview',
          sections: [
            {type:'p', text:'Microsoft\'s unified data governance platform. Covers classification, sensitivity labelling, DLP, compliance management, and risk analysis — deeply integrated with Azure, Microsoft 365 (Outlook, Teams, SharePoint), and third-party sources.'},
            {type:'table', headers:['Purview Service','What It Does'], rows:[
              ['Information Protection',  'Sensitivity labels that travel with files — persists when the file is emailed, downloaded, or copied'],
              ['Data Catalog',            'Registers and classifies data assets from hundreds of connected sources'],
              ['Data Loss Prevention',    'Policy engine that blocks unauthorised data movement based on classification labels'],
              ['Compliance Manager',      'Maps your controls to regulations automatically — shows compliance score per regulation'],
              ['eDiscovery',              'Finds data for legal proceedings — essential for DSARs and litigation hold'],
            ]},
            {type:'callout', variant:'info', title:'&#128161; Purview in Action: Office 365',
              body:'When a user saves a Word document, Purview scans it. If it contains what looks like a National Insurance number, it labels the file "Confidential." The DLP policy then activates: the user cannot email the file to an external address. The label, the scan, and the block all happen automatically — this is classification-driven governance in practice.'},
          ]
        },
        {
          title: 'Part 3 — Databricks Unity Catalog and Data Lineage',
          sections: [
            {type:'p', text:'Unity Catalog is the governance layer for Databricks — the dominant big data and ML platform. Banks run analytics, ML models, and data pipelines on Databricks. Unity Catalog provides a single metadata layer across all Databricks workspaces.'},
            {type:'table', headers:['Unity Catalog Feature','Why It Matters for Classification'], rows:[
              ['Column-level classification',  'PII columns automatically masked when accessed by non-privileged users'],
              ['Access controls at data layer', 'Enforced at the storage level — not just the application level'],
              ['Data lineage tracking',         'Full provenance: "this ML model was trained on data from table X which contains Restricted data"'],
              ['Cross-workspace governance',    'Unified policy across all data processing environments'],
            ]},
            {type:'callout', variant:'warning', title:'&#9888; Data Lineage — Critical for Compliance',
              body:'Lineage tracks where data came from, what transformations were applied, and where it went. Essential for: (1) BCBS 239 accuracy — prove this risk report\'s data is authorised and reliable; (2) AI Act compliance — document what data a model was trained on; (3) incident response — identify what data was affected by a pipeline failure or breach.'},
          ]
        },
        {
          title: 'Part 4 — DLP: The Enforcement Layer',
          sections: [
            {type:'p', text:'DLP (Data Loss Prevention) is a set of policies that monitor data movement and block violations. Without DLP, a Restricted label is just a coloured sticker. With DLP, it becomes an automatic technical control.'},
            {type:'table', headers:['State of Data','DLP Monitors','Example Rule'], rows:[
              ['At rest',    'Data stored somewhere',            'Scan S3 buckets for Restricted data without Block Public Access enabled'],
              ['In motion',  'Data being sent somewhere',        'Block emails with Restricted attachments to external domains'],
              ['In use',     'Data being processed or accessed', 'Alert when 1,000+ customer records are downloaded in one session'],
            ]},
            {type:'p', text:'DLP rules typically specify: what data is protected (by classification label or content pattern), what action is blocked, what the user sees, and what security team alert is raised.'},
          ]
        },
        {
          title: 'Part 5 — RBAC vs ABAC',
          sections: [
            {type:'p', text:'Access control is how classification labels are enforced. Two models:'},
            {type:'table', headers:['Model','How It Works','Best For','Limitation'], rows:[
              ['RBAC (Role-Based)',       'Users assigned to roles; each role has fixed permissions',                              'Simple systems with few roles', 'Becomes unmanageable at scale — thousands of role combinations needed'],
              ['ABAC (Attribute-Based)', 'Access decided dynamically by matching attributes: user clearance, data label, context', 'Classification-driven access at scale', 'More complex to implement initially'],
            ]},
            {type:'callout', variant:'success', title:'&#9989; ABAC is the Right Model for Classification',
              body:'With ABAC, the classification label itself is an access control attribute. If a table is labelled Restricted, only users with <code>clearance: restricted</code> can access it. When the label changes, the policy updates automatically — no manual role reassignment. This is the model to describe in interviews when asked how classification labels enforce access control.'},
          ]
        },
        {
          title: 'Part 6 — Data Masking and Tokenisation',
          sections: [
            {type:'table', headers:['Technique','What It Does','Reversible?','Use Case'], rows:[
              ['Masking',       'Replaces sensitive values with realistic but fictional values',          'No',  'Non-production environments (dev, test, analytics)'],
              ['Tokenisation',  'Replaces sensitive value with a random token; original in a secure vault', 'Yes (by authorised systems)', 'PAN tokenisation (PCI DSS), persistent pseudonymisation'],
              ['Anonymisation', 'Removes or transforms data so individuals cannot be re-identified',      'No',  'Research, analytics where individual re-identification is not needed'],
            ]},
            {type:'callout', variant:'info', title:'&#128161; Classification Drives Masking Decisions',
              body:'The classification label determines <em>whether</em> masking is required. A Restricted-labelled table copied to a dev environment triggers automatic masking before the copy completes. Without the label, the control cannot be automated — a developer might unknowingly work with real customer data.'},
            {type:'p', text:'Banks use tokenisation for card numbers (PAN tokenisation — core PCI DSS technique): the card number is replaced with a token, and only the payment processor\'s vault knows the real number. The token is useless to an attacker even if stolen.'},
          ]
        },
        {
          title: 'Part 7 — Zero Trust Architecture',
          sections: [
            {type:'callout', variant:'danger', title:'&#128737; The Zero Trust Principle',
              body:'"Never trust, always verify." Every access request — regardless of whether it comes from inside or outside the network — must be authenticated, authorised, and logged. Inside the perimeter is not the same as trustworthy.'},
            {type:'table', headers:['Pillar','Requirement','Classification Link'], rows:[
              ['Verify identity',         'Strong authentication (MFA) for every access, every time',                                        'Every data access request must be verified — not assumed from network location'],
              ['Least privilege access',  'Grant only minimum permissions needed for the specific task',                                      'Classification label drives the minimum-necessary access decision'],
              ['Assume breach',           'Act as if perimeter controls have already failed; data-level controls are the last line of defence','Classification + DLP = the last line of defence at the data layer'],
            ]},
            {type:'p', text:'DSPM is the operational implementation of Zero Trust at the data layer. Classification is what makes "always verify" meaningful — you can only check whether access to a resource is appropriate if you know what the resource is.'},
          ]
        },
        {
          title: 'Part 8 — SIEM: Splunk and Microsoft Sentinel',
          sections: [
            {type:'p', text:'A SIEM (Security Information and Event Management) collects logs from every system — firewalls, databases, cloud platforms, identity systems — and analyses them together to detect threats. Individual logs are noisy; a SIEM finds the signal.'},
            {type:'callout', variant:'info', title:'&#128161; The Signal SIEM Finds',
              body:'"User X logged in from an unusual country at 3am, then accessed 50 Restricted data tables, then attempted to export a large file." No single event is alarming. The pattern is. This is what SIEM does.'},
            {type:'table', headers:['Tool','Type','Key Strength'], rows:[
              ['Splunk',              'SIEM — market leader', 'SPL query language for threat hunting. Handles billions of events/day. Excellent for on-prem + hybrid banks.'],
              ['Microsoft Sentinel',  'Cloud-native SIEM (Azure)', 'Tight integration with Microsoft Entra ID (formerly Azure AD), Purview, and Defender. Best for Microsoft-first banks.'],
            ]},
            {type:'callout', variant:'warning', title:'&#9888; Terminology Note: Microsoft Entra ID',
              body:'Azure Active Directory was rebranded to <strong>Microsoft Entra ID</strong> in 2023. Use the new name in interviews — referring to "Azure AD" in 2025+ suggests you haven\'t kept up with the Microsoft ecosystem.'},
            {type:'p', text:'Classification enriches SIEM alerts: "Unusual access to Restricted customer data by j.smith outside business hours" is actionable. "Unusual access to table cust_data_017" is not. The label is what transforms a log entry into a meaningful alert.'},
          ]
        },
      ]}]
    },
    {
      id: 'code', label: '&#128187; Code Examples',
      sections: [
        {type:'p', text:'Three key artefacts: DLP rule design, SIEM query patterns, and ABAC policy logic.'},
        {type:'code', lang:'javascript', title:'1 — DLP rule design: three bank scenarios', caption:'DLP policies are often defined in JSON-like structures. Understanding the logic is more important than the exact syntax.', code: dlp_rules},
        {type:'code', lang:'sql', title:'2 — SIEM queries: detect anomalous Restricted data access', caption:'Splunk SPL and Microsoft Sentinel KQL for detecting access anomalies enriched with classification context.', code: siem_query},
        {type:'code', lang:'sql', title:'3 — ABAC policy: classification-driven access control', caption:'How classification labels become the foundation of dynamic access control — no manual role reassignment when labels change.', code: abac_example},
      ]
    },
    {
      id: 'projects', label: '&#127891; Projects',
      sections: [
        {type:'h2', text:'Mini Projects'},
        {type:'html', content:`
<div class="project-card">
  <div class="project-header"><div class="project-title">6.1 — Write Three DLP Rules</div><div class="project-time">~15 min</div></div>
  <div class="project-tags"><span class="tag">DLP</span><span class="tag">Classification Labels</span><span class="tag">Policy Design</span></div>
  <p>Write three DLP rules in plain English for a UK retail bank. For each: (1) What data does it protect (specify label tier)? (2) What action does it block or alert on? (3) What does the user see? (4) What alert goes to the security team? Use the three "states of data" framework (at rest, in motion, in use) to cover one per state.</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">6.2 — Interpret a SIEM Alert</div><div class="project-time">~15 min</div></div>
  <div class="project-tags"><span class="tag">SIEM</span><span class="tag">Alert Analysis</span><span class="tag">Incident Response</span></div>
  <p>Analyse this alert: <em>"User: j.smith | Time: 02:34 UTC Saturday | Source IP: 185.x.x.x (Eastern Europe) | Action: SELECT * | Tables: customers, loan_applications, credit_scores | Classification: Highly Restricted | Row count: 245,000"</em>. Answer: (1) True or false positive? (2) What additional information would you request? (3) What is the immediate action? (4) Which regulations require this to be documented?</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">6.3 — Draw the DSPM Architecture (Capstone)</div><div class="project-time">~20 min</div></div>
  <div class="project-tags"><span class="tag">Architecture</span><span class="tag">End-to-End</span><span class="tag">Interview Prep</span></div>
  <p>From memory, draw (or write out as a flow) the complete DSPM architecture — from data sources through to security team investigation. Label each component, state what classification information flows through each step, and explain what breaks if the classification labels are wrong at step 2.</p>
</div>`}
      ]
    },
    {
      id: 'quiz', label: '&#129300; Quiz',
      sections: [
        {type:'h2', text:'Knowledge Check'},
        {type:'quiz', questions:[
          {q:'What does DSPM stand for and what question does it answer?',
           options:['Data Security Policy Management — "what are our security policies?"','Data Security Posture Management — "is our data configured correctly right now, even with no active attack?"','Data Scanning and Pattern Matching — "what PII exists in our databases?"','Digital Security and Privacy Monitoring — "are we compliant with regulations?"'],
           correct:1, explanation:'DSPM asks whether data is correctly configured at this moment — finding misconfigurations (a Restricted table set to world-readable, PII in a public bucket) before an attacker exploits them. It is proactive, not reactive.'},
          {q:'A Restricted-labelled document is attached to an email addressed to an external domain. What should happen in a well-configured DLP environment?',
           options:['The email is sent with a warning label added','The email is blocked and the user sees a notification explaining why; the SIEM receives an alert','The email is quarantined for 48 hours pending review','Nothing — DLP only monitors internal emails'],
           correct:1, explanation:'DLP policies enforce classification labels on data in motion. A Restricted label should trigger an immediate block for external transmission, a user-facing notification, and a security team alert. Without this enforcement, the label is cosmetic only.'},
          {q:'Why is ABAC better than RBAC for classification-driven access control at scale?',
           options:['ABAC is faster','With ABAC, the classification label itself is an access attribute — when a label changes, access updates automatically with no manual role reassignment. RBAC requires a new role for every permission combination.','ABAC requires fewer IT resources to manage','RBAC cannot be used with classification systems'],
           correct:1, explanation:'At a large bank with hundreds of roles and thousands of datasets, RBAC produces an unmanageable combinatorial explosion of role definitions. ABAC uses the classification label as a dynamic attribute — change the label from Confidential to Restricted and access is automatically adjusted. This is why DSPM platforms implement ABAC natively.'},
          {q:'What is the difference between data masking and tokenisation?',
           options:['They are identical — different names for the same process','Masking replaces values with fictional data (irreversible — used in non-production environments). Tokenisation replaces values with a token that maps to the original in a secure vault (reversible by authorised systems — used for operational data like PAN).','Masking is more secure than tokenisation','Tokenisation is used for testing; masking is used for production'],
           correct:1, explanation:'Masking (irreversible) is for dev/test environments where you need realistic-looking but fake data. Tokenisation (reversible) is for operational use — the bank\'s payment system stores tokens, not real card numbers. Only the vault can reverse a token back to the PAN, and that vault is heavily controlled.'},
          {q:'What is "Microsoft Entra ID" and why does the name matter in an interview?',
           options:['A new Microsoft product launched in 2025','The rebranded name for Azure Active Directory (rebranded 2023). Using the old name "Azure AD" signals you haven\'t kept current with the Microsoft ecosystem.','Microsoft\'s new AI security product','An alternative name for Microsoft Purview'],
           correct:1, explanation:'Azure Active Directory was rebranded to Microsoft Entra ID in 2023. In a 2025 interview at a Microsoft-heavy bank, referring to "Azure AD" rather than "Entra ID" is a minor but noticeable signal. Tight integration between Entra ID (identity) and Sentinel (SIEM) is a key selling point of the Microsoft security stack.'},
        ]}
      ]
    }
  ]
});
};
