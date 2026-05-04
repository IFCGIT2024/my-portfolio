// =====================================================
// Module 5: Compliance & Regulation
// =====================================================
window.MODULES.m5 = () => {

const retention_sql = `-- Classification-driven retention: find data past its retention period
SELECT
    dc.table_schema,
    dc.table_name,
    dc.classification_label,
    dc.data_owner,
    dc.retention_policy_days,
    dc.last_scanned_at,
    CURRENT_DATE - dc.last_scanned_at::date AS days_since_scan,
    CASE dc.classification_label
        WHEN 'Public'           THEN 'No limit'
        WHEN 'Internal'         THEN '7 years (general business records)'
        WHEN 'Confidential'     THEN '6 years post-closure (UK limitation period)'
        WHEN 'Restricted'       THEN '5 years (AML / POCA requirements)'
        WHEN 'Highly Restricted' THEN 'Legal hold — check with DPO and Legal'
    END AS retention_rule
FROM data_catalog dc
WHERE dc.retention_policy_days IS NOT NULL
  AND CURRENT_DATE > (dc.labelled_at + dc.retention_policy_days * INTERVAL '1 day')
ORDER BY dc.classification_label, dc.labelled_at ASC;`;

const breach_sql = `-- Article 33: 72-hour breach assessment query
-- Run immediately when a breach is suspected.
-- Output tells you: what was breached, whose data, how sensitive.

SELECT
    dc.table_schema,
    dc.table_name,
    dc.classification_label,
    dc.pii_column_count,
    dc.data_owner,
    -- Estimate affected individuals from access logs
    COUNT(DISTINCT al.user_id)  AS accessing_users,
    COUNT(DISTINCT cdm.customer_id) AS potentially_affected_customers
FROM data_catalog dc
LEFT JOIN access_logs al
    ON al.table_name  = dc.table_name
    AND al.accessed_at >= :breach_window_start  -- bind param: start of breach window
LEFT JOIN customer_data_map cdm ON cdm.table_name = dc.table_name
WHERE dc.table_name IN (
    -- List of tables confirmed or suspected to be in scope
    SELECT DISTINCT table_name FROM breach_scope_assessment
    WHERE incident_id = :incident_id
)
GROUP BY dc.table_schema, dc.table_name, dc.classification_label,
         dc.pii_column_count, dc.data_owner
ORDER BY dc.classification_label DESC;`;

return _renderModule({
  id: 'm5', prev: 'm4', next: 'm6',
  badge: 'Module 5 · Compliance',
  title: 'Compliance & Regulation',
  subtitle: 'Compliance is not box-ticking — it is the reason classification programmes are funded. Connect every technical decision to a regulation. "We classify data because GDPR Article 25 requires data protection by design" is a better answer than "because it is good practice."',
  meta: [
    '&#9200; <span>~3 hrs</span>',
    '&#128204; <span>All Roles</span>',
    '&#9878; <span>5 Regulations</span>',
    '&#127891; <span>3 Projects</span>'
  ],
  tabs: [
    {
      id: 'overview', label: '&#128204; Overview',
      sections: [
        {type:'cards', items:[
          {icon:'&#127466;&#127482;', title:'GDPR / UK GDPR',  body:'Personal data protection. 7 principles, key articles (6, 9, 17, 25, 33, 35), DSARs, DPO, 72-hour breach notification, £17.5M Tier 2 fines.'},
          {icon:'&#128737;',          title:'DORA',             body:'Digital Operational Resilience Act. Applicable January 2025. Five pillars: ICT risk, incident reporting, resilience testing, third-party risk, information sharing.'},
          {icon:'&#127968;',          title:'BCBS 239',         body:'Risk data aggregation. 11 principles across governance, accuracy, completeness, timeliness, and reporting. Board-level accountability for data quality.'},
          {icon:'&#128179;',          title:'PCI DSS',          body:'Payment card data security. 12 requirements. Mandatory for any bank storing, processing, or transmitting cardholder data. Classification identifies and isolates PAN data.'},
          {icon:'&#129302;',          title:'EU AI Act 2026',   body:'High-risk AI systems (credit scoring, fraud detection, AML) require risk management, human oversight, and documented training data — enabled by classification.'},
        ]},
        {type:'callout', variant:'info', title:'&#127979; Why Regulations Fund Classification',
          body:'Without classification, a bank cannot: respond to a DSAR (Article 15) because it doesn\'t know where all personal data is; notify the ICO within 72 hours of a breach (Article 33) because it doesn\'t know what was stolen; fulfill BCBS 239 Principle 3 (accuracy) because it doesn\'t know which risk data is reliable; scope its PCI DSS audit because it doesn\'t know which systems hold PAN data.'},
        {type:'h2', text:'Regulation Quick Reference'},
        {type:'table', headers:['Regulation','Who Enforces (UK)','Max Penalty','Key Trigger for Classification'], rows:[
          ['UK GDPR',   'ICO',          '£17.5M or 4% global turnover',   '72-hr breach notification, DSAR response, Art. 25 by design'],
          ['DORA',      'FCA / PRA',    'Not yet established in UK',       'Pillar 2 incident classification, Pillar 4 third-party data access'],
          ['BCBS 239',  'PRA',          'Supervisory measures (not fines)','Principles 3/4/5: accuracy, completeness, timeliness of risk data'],
          ['PCI DSS',   'Card networks','Card processing suspension',      'Req. 3/7/10: protect, restrict, monitor cardholder data'],
          ['AI Act',    'National AI authority', 'Up to €35M / 7% global turnover', 'High-risk AI must document training and processing data'],
        ]},
      ]
    },
    {
      id: 'concepts', label: '&#128214; Concepts',
      sections: [{type:'accordion', items:[
        {
          title: 'GDPR — Article 6: Lawful Basis for Processing',
          sections: [
            {type:'p', text:'GDPR requires a <strong>documented lawful basis</strong> for any processing of personal data. There are six. For a UK bank, three are primary:'},
            {type:'table', headers:['Basis','Article','When a Bank Uses It'], rows:[
              ['Legal obligation',   '6(1)(c)', 'AML reporting, tax obligations, FCA regulatory filings, fraud prevention. Most frequently used at banks. No consent required.'],
              ['Contract',           '6(1)(b)', 'Processing necessary to deliver a contracted service: operating an account, processing payments, issuing a card.'],
              ['Legitimate interests','6(1)(f)', 'Fraud prevention analytics, security monitoring, marketing to existing customers. Requires a Legitimate Interests Assessment (LIA).'],
              ['Consent',            '6(1)(a)', 'Less common in banking — consent must be freely given, specific, and withdrawable. Not appropriate where legal obligation applies.'],
              ['Vital interests',    '6(1)(d)', 'Rare edge cases only.'],
              ['Public task',        '6(1)(e)', 'Not applicable to commercial banks.'],
            ]},
            {type:'callout', variant:'danger', title:'&#128680; The Foundation Question',
              body:'A bank that cannot identify the lawful basis for any piece of processing commits one of the most serious categories of GDPR violation — Tier 2 fine exposure. Knowing your processing base is a prerequisite, not an optional extra.'},
          ]
        },
        {
          title: 'GDPR — Article 9: Special Category Data',
          sections: [
            {type:'p', text:'Certain categories of personal data attract <strong>additional protection</strong> and a higher legal threshold. Processing requires both a lawful basis under Article 6 AND a specific condition under Article 9(2).'},
            {type:'ul', items:[
              'Health data', 'Biometric data used for unique identification', 'Genetic data',
              'Racial or ethnic origin', 'Political opinions', 'Religious or philosophical beliefs',
              'Sexual orientation', 'Trade union membership',
            ]},
            {type:'callout', variant:'warning', title:'&#9888; Banks Hold More Special Category Data Than They Realise',
              body:'<strong>Health data</strong>: disability adjustments, occupational health records, bereavement account changes.<br><strong>Biometric data</strong>: voice recognition for telephone banking, facial ID for digital onboarding.<br><strong>Inferred characteristics</strong>: financial behaviour patterns that could reveal protected characteristics (regular payments to religious organisations, spending at specialist medical providers). These require appropriate classification and a documented Article 9(2) condition.'},
          ]
        },
        {
          title: 'GDPR — The 7 Principles',
          sections: [
            {type:'p', text:'You should be able to recite all seven. These are tested in interviews and underpin every classification decision.'},
            {type:'table', headers:['#','Principle','What It Means for Classification'], rows:[
              ['1', 'Lawfulness, fairness, transparency',  'Know why you hold data and tell individuals'],
              ['2', 'Purpose limitation',                   'Collect for one purpose, use only for that — classification prevents scope creep'],
              ['3', 'Data minimisation',                    'Collect only what you need — classification surfaces unnecessary data collection'],
              ['4', 'Accuracy',                             'Keep data correct and up to date'],
              ['5', 'Storage limitation',                   'Don\'t keep it longer than necessary — classification enables automated retention enforcement'],
              ['6', 'Integrity and confidentiality',        'Keep it secure — you cannot protect what you don\'t know you have. Classification finds it.'],
              ['7', 'Accountability',                       'You must be able to demonstrate compliance — classification provides the audit trail'],
            ]},
          ]
        },
        {
          title: 'GDPR — Key Articles (25, 33, 34, 35)',
          sections: [
            {type:'callout', variant:'info', title:'&#128737; Article 25 — Data Protection by Design and by Default',
              body:'<strong>By design</strong>: security must be built into systems from the start, not bolted on afterwards. A classification programme embedded in the data ingestion pipeline satisfies this.<br><strong>By default</strong>: by default, only the minimum necessary data should be processed; privacy-protective settings must be the default, not opt-in. Classification enforcing minimum-necessary access through labels satisfies this.'},
            {type:'callout', variant:'danger', title:'&#128680; Article 33 — 72-Hour Breach Notification',
              body:'When a personal data breach occurs, the organisation has <strong>72 hours</strong> from becoming aware of it to notify the ICO. <strong>Hard deadline — no extensions for complexity.</strong><br><br>Without classification, you cannot accurately describe what was breached, whose data it was, or what risk it poses — which are all required elements of an Article 33 notification. Classification is the operational infrastructure that makes legal compliance possible under time pressure.'},
            {type:'callout', variant:'warning', title:'&#9888; Article 34 — Notifying Affected Individuals',
              body:'Where a breach is likely to result in <em>high risk</em> to individuals (financial fraud, identity theft), you must also notify those individuals directly, "without undue delay." This is separate from the ICO notification. Knowing whose data was involved requires a complete data map and accurate classification.'},
            {type:'callout', variant:'info', title:'&#128203; Article 35 — DPIA Required for Classification Programmes',
              body:'Before carrying out processing "likely to result in high risk to individuals," you must conduct a <strong>DPIA (Data Protection Impact Assessment)</strong>. A large-scale classification programme qualifies — you are processing personal data at scale to determine its sensitivity. A DPIA for this programme would cover: what data is scanned, who has access to the tool, what happens to findings, and how false positives are handled. The DPO must be consulted.'},
          ]
        },
        {
          title: 'GDPR — Fines, Regulators, and Article 17 (Erasure)',
          sections: [
            {type:'table', headers:['Tier','Violations','Fine (EU)','Fine (UK — ICO)'], rows:[
              ['Tier 1 (less serious)', 'Consent, breach notification, DPO, privacy by design',          '€10M or 2% global turnover', '£8.7M or 2%'],
              ['Tier 2 (serious)',      'Data subjects\' rights, unlawful processing, international transfers', '€20M or 4% global turnover', '£17.5M or 4%'],
            ]},
            {type:'callout', variant:'info', title:'&#128161; Always Quote £ at a UK Bank Interview',
              body:'UK GDPR fines are in pounds sterling (ICO), not euros. For a major UK bank with global revenues, a Tier 2 fine at 4% of global annual turnover is a nine-figure number. Quote the UK amounts.'},
            {type:'callout', variant:'warning', title:'&#9888; Article 17 (Right to Erasure) — the Banking Caveat',
              body:'The right to erasure does not apply where data must be retained under a legal obligation. At a bank, most customer data is subject to mandatory retention: AML (5 years under POCA), the Limitation Act (6 years), FCA record-keeping rules, HMRC requirements. In practice, a customer\'s erasure request will often be <em>partially</em> fulfilled (marketing preferences deleted) while core financial records are lawfully retained.<br><br><strong>Wrong answer in an interview</strong>: "The customer can request deletion and the bank must comply." That answer fails. Know the legal obligation override.'},
            {type:'p', text:'UK Regulators: the <strong>ICO</strong> enforces UK GDPR (data breaches, DSARs, fines). The <strong>FCA</strong> regulates the financial firm (conduct, market integrity, data governance under SYSC). The <strong>PRA</strong> oversees prudential matters (BCBS 239). In a serious breach, you may notify both the ICO and FCA simultaneously.'},
          ]
        },
        {
          title: 'DORA — Digital Operational Resilience Act',
          sections: [
            {type:'callout', variant:'info', title:'&#128197; Key Dates',
              body:'DORA entered into <strong>force January 2023</strong>. Became <strong>applicable (enforceable) January 2025</strong>. The 2-year gap was a transition window. Applies to financial entities and their critical ICT service providers.'},
            {type:'p', text:'The core question DORA asks: "Can this bank keep operating during a cyberattack or technical failure?"'},
            {type:'table', headers:['Pillar','Title','Link to Classification'], rows:[
              ['1', 'ICT Risk Management',                   'Know what systems exist, what data they hold, and what the risk is if they fail'],
              ['2', 'ICT Incident Classification & Reporting', 'Classify incidents by severity. Cannot classify a "major incident affecting critical systems" without knowing which systems hold what data'],
              ['3', 'Digital Operational Resilience Testing', 'Penetration testing and threat-led red team exercises on critical systems'],
              ['4', 'Third-party Risk Management',           'Know which third parties handle your data and what classification tier it is. Vendor assessment required for Restricted+ data handlers'],
              ['5', 'Information Sharing',                   'Share threat intelligence with other financial entities'],
            ]},
          ]
        },
        {
          title: 'BCBS 239 — Risk Data Aggregation',
          sections: [
            {type:'p', text:'Basel Committee standard 239 (published 2013). Originally for globally systemically important banks (G-SIBs), now expected of most significant UK banks by the PRA. Core question: "Can this bank aggregate risk data accurately and quickly enough to make decisions during a crisis?"'},
            {type:'table', headers:['Group','Principles','Key Requirement'], rows:[
              ['Governance (1–2)',        'Principles 1–2',  'Board and senior management actively oversee data aggregation. Data architecture documented with dictionaries and clear ownership.'],
              ['Aggregation (3–6)',       'Principles 3–6',  'Accuracy (single authoritative source), Completeness (no blind spots), Timeliness (same-day or intraday during stress), Adaptability (handle ad hoc queries during a crisis).'],
              ['Risk Reporting (7–11)',   'Principles 7–11', 'Accurate, comprehensive, clear, distributed at the right frequency to the right people.'],
            ]},
            {type:'callout', variant:'info', title:'&#128161; BCBS 239 is Data Governance in Substance',
              body:'The principles require that risk data be complete, accurate, timely, and aggregatable. You cannot satisfy these requirements without a classification programme that identifies what data exists, where it is, who owns it, and whether it is reliable. BCBS 239 compliance is one of the most compelling business cases for classification investment.'},
          ]
        },
        {
          title: 'PCI DSS — Payment Card Security',
          sections: [
            {type:'p', text:'PCI DSS is not a law — it is a contractual requirement mandated by the card networks (Visa, Mastercard, Amex). Any organisation storing, processing, or transmitting cardholder data must comply. Non-compliance can result in suspension of card processing — effectively ending a retail bank\'s ability to operate.'},
            {type:'p', text:'PCI DSS protects: the Primary Account Number (PAN — the 16-digit card number), cardholder name, expiry date, and service code. CVV codes and PINs have additional, stricter restrictions.'},
            {type:'table', headers:['Requirement','What It Mandates','Classification Link'], rows:[
              ['Req. 3',  'Protect stored cardholder data (encryption)',        'Cannot protect what you don\'t know you have. Classification identifies PAN data.'],
              ['Req. 7',  'Restrict access to cardholder data (need-to-know)', 'Classification label drives access control policy.'],
              ['Req. 10', 'Monitor all access to network resources and cardholder data', 'Classification label identifies which access logs to prioritise.'],
            ]},
            {type:'callout', variant:'success', title:'&#9989; Scope Reduction — the Most Valuable PCI DSS Strategy',
              body:'Minimising the number of systems that touch cardholder data reduces audit scope and compliance cost. Classification enables this: once you know exactly which systems hold PAN data, you can redesign data flows to isolate them. Banks that have classified PAN data accurately routinely reduce their PCI DSS audit scope by 40–60%.'},
          ]
        },
        {
          title: 'EU AI Act 2026',
          sections: [
            {type:'p', text:'The EU AI Act (agreed 2024, fully in force 2026) is the world\'s first comprehensive AI regulation. It uses a risk-tier model — directly analogous to data classification tiers.'},
            {type:'table', headers:['AI Risk Tier','Classification','Examples'], rows:[
              ['Unacceptable risk', 'Banned entirely',                    'Social scoring, real-time biometric mass surveillance'],
              ['High risk',         'Strictly regulated',                  'Credit scoring, insurance risk, hiring decisions, AML, fraud detection'],
              ['Limited risk',      'Transparency obligations',            'Chatbots (must disclose they are AI)'],
              ['Minimal risk',      'No specific obligations',             'Spam filters, AI-powered search'],
            ]},
            {type:'callout', variant:'warning', title:'&#9888; High-Risk AI at Banks: Credit Scoring, Fraud, AML',
              body:'For banks, the High-risk category covers: creditworthiness assessment, insurance risk assessment, fraud detection, and AML. Requirements include: risk management systems, mandatory human oversight, transparency to data subjects, detailed logging, and documented training data.<br><br>Classification provides the documentation: if a credit scoring model processes Confidential customer financial history, the bank must demonstrate that access was appropriate and governed. Classification is the evidence trail.'},
            {type:'callout', variant:'danger', title:'&#128680; GenAI and Unclassified Data (2026 Context)',
              body:'Banks deploying GenAI tools (Copilot, internal LLMs) must classify what data these tools can access. A GenAI tool that can reach unclassified Restricted customer data is both an AI Act violation and a data breach waiting to happen. Classification is now a prerequisite for responsible GenAI deployment.'},
          ]
        },
      ]}]
    },
    {
      id: 'code', label: '&#128187; Code Examples',
      sections: [
        {type:'p', text:'Compliance work generates specific SQL queries. These are the most interview-relevant examples.'},
        {type:'code', lang:'sql', title:'1 — Classification-driven retention: find data past its retention period', caption:'GDPR Principle 5 (storage limitation) requires data is not kept longer than necessary. This surfaces violations.', code: retention_sql},
        {type:'code', lang:'sql', title:'2 — Article 33: 72-hour breach assessment', caption:'Run immediately when a breach is suspected. Identifies what data was affected, whose, and how sensitive.', code: breach_sql},
        {type:'h2', text:'Retention Policy Reference'},
        {type:'table', headers:['Classification Label','Retention Rule','Regulatory Basis'], rows:[
          ['Public',             'No limit',                      'No restriction'],
          ['Internal',           '7 years',                       'General business records / Companies Act'],
          ['Confidential',       '6 years post-account closure',  'UK Limitation Act (contract claims)'],
          ['Restricted',         '5 years',                       'POCA 2002 / AML regulations'],
          ['Highly Restricted',  'Legal hold — consult DPO',      'Varies: litigation, investigation, regulatory order'],
        ]},
      ]
    },
    {
      id: 'projects', label: '&#127891; Projects',
      sections: [
        {type:'h2', text:'Mini Projects'},
        {type:'html', content:`
<div class="project-card">
  <div class="project-header"><div class="project-title">5.1 — Which Regulation Applies?</div><div class="project-time">~20 min</div></div>
  <div class="project-tags"><span class="tag">Scenario Analysis</span><span class="tag">Multi-regulation</span></div>
  <p>For each scenario, identify which regulations apply and the key requirement triggered: (1) A customer requests all personal data the bank holds. (2) A credit scoring AI system is being audited. (3) A cyberattack takes down the bank's payment processing for 4 hours. (4) The bank discovers a file containing 50,000 customer NINOs in an unclassified S3 bucket. (5) A third-party data classification vendor needs access to scan Restricted customer data.</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">5.2 — GDPR Article 15: The Technical Response</div><div class="project-time">~20 min</div></div>
  <div class="project-tags"><span class="tag">DSAR</span><span class="tag">SQL</span><span class="tag">One Calendar Month</span></div>
  <p>A customer requests all their personal data under GDPR Article 15. Map out the complete technical steps: (1) What is the deadline? (2) What SQL queries would you run? (3) Which tables would you search? (4) How does classification make this faster? (5) What happens to data the bank must retain under AML rules if the customer also requests erasure?</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">5.3 — Compliance Mapping Table (Capstone)</div><div class="project-time">~25 min</div></div>
  <div class="project-tags"><span class="tag">5 Regulations</span><span class="tag">5 Tiers</span><span class="tag">Controls Matrix</span></div>
  <p>Build a 5×5 mapping table: for each classification tier (Public, Internal, Confidential, Restricted, Highly Restricted) and each regulation (GDPR, DORA, BCBS 239, PCI DSS, AI Act), describe the key required control and the retention limit. This is the kind of artefact a data governance team produces and maintains.</p>
</div>`}
      ]
    },
    {
      id: 'quiz', label: '&#129300; Quiz',
      sections: [
        {type:'h2', text:'Knowledge Check'},
        {type:'quiz', questions:[
          {q:'A customer submits a GDPR Article 17 erasure request for all their data. The bank has transaction records, AML reports, and their email address from a marketing list. What should happen?',
           options:['Delete everything — it is the customer\'s right','Delete nothing until legal review completes','Delete the marketing email address (lawful basis: consent, no legal obligation to retain). Retain transaction records and AML reports under legal obligation (AML = 5 years, Limitation Act = 6 years). Inform the customer which data was deleted and which was retained and why.','Mark all records as Restricted and defer to the DPO'],
           correct:2, explanation:'The right to erasure does not override legal obligations to retain data. AML rules require 5-year retention. The Limitation Act requires 6 years for contract-related records. Only data with no legal retention requirement (e.g., marketing preferences) must be deleted. Answering "the bank must delete everything" fails this interview question.'},
          {q:'GDPR Article 33 requires breach notification to the ICO within:',
           options:['24 hours','48 hours','72 hours — from the moment the organisation becomes aware of the breach','One calendar month'],
           correct:2, explanation:'72 hours is a hard deadline with no extensions for complexity. If the full scope is unknown at 72 hours, you notify what you do know and supplement as more information becomes available. Without classification, you cannot describe what was breached — making an accurate Article 33 notification impossible.'},
          {q:'DORA became applicable (enforceable) in:',
           options:['January 2023 (when it entered into force)','January 2025 (after the 2-year transition period)','August 2026 (same as the AI Act)','It is not yet in force'],
           correct:1, explanation:'DORA entered into force January 2023 but the 2-year transition window meant firms had until January 2025 to be compliant. The two dates are frequently confused in interviews — entering into force ≠ being applicable.'},
          {q:'Which BCBS 239 principle requires that risk data be aggregatable within defined timeframes, typically same-day for normal conditions?',
           options:['Principle 1 (Governance)','Principle 3 (Accuracy)','Principle 5 (Timeliness)','Principle 9 (Clarity)'],
           correct:2, explanation:'Principle 5 (Timeliness) requires data to be aggregable within defined timeframes — typically same-day for normal conditions, within hours during stress events. During a crisis, regulators ask for risk aggregation data in hours, not days. Without a classification programme identifying where reliable risk data lives, this is impossible.'},
          {q:'Under PCI DSS, what is "scope reduction" and why does classification enable it?',
           options:['Reducing the number of PCI DSS requirements a bank must comply with','Minimising the number of systems that touch cardholder data — classification identifies exactly which systems hold PAN data, allowing flows to be redesigned to isolate them and reduce audit scope','Making the PCI DSS audit faster by summarising documentation','Reducing the classification level of card data from Restricted to Confidential'],
           correct:1, explanation:'Scope reduction is one of the most valuable PCI DSS strategies. By classifying PAN data precisely, a bank can redesign data flows to limit which systems touch it — reducing the number of systems in scope for the PCI DSS audit and significantly reducing compliance cost. Banks with good classification routinely reduce audit scope by 40–60%.'},
        ]}
      ]
    }
  ]
});
};
