// =====================================================
// Module 4: Data Classification Systems
// =====================================================
window.MODULES.m4 = () => {

const schema_ex = `-- Table schema: what label does this table get?
-- The table-level label is the HIGHEST label of any column within it.

CREATE TABLE loan_applications (
    application_id  SERIAL PRIMARY KEY,   -- Internal (system ID)
    applicant_name  VARCHAR(100),         -- Confidential (PII: full name)
    date_of_birth   DATE,                 -- Restricted (PII: dob)
    nino            VARCHAR(9),           -- Restricted (PII: NI number)
    annual_income   NUMERIC(12,2),        -- Restricted (financial)
    credit_score    INTEGER,              -- Highly Restricted (credit decision)
    application_ref VARCHAR(12),          -- Internal (reference number only)
    status          VARCHAR(20)           -- Internal (workflow state)
);

-- Table classification: HIGHLY RESTRICTED
-- Reason: credit_score is a credit decision — the highest tier present.
-- Even one Highly Restricted column elevates the whole table.
-- The table would be scanned by 1touch.io or Purview,
-- which detects the nino pattern and credit_score field context.`;

const confidence_check = `-- SQL: find all columns needing reclassification (potential drift)
-- Run this query after a schema change audit
SELECT
    dc.table_schema,
    dc.table_name,
    dc.classification_label,
    dc.confidence_score,
    dc.last_scanned_at,
    CASE
        WHEN dc.last_scanned_at < CURRENT_DATE - INTERVAL '90 days' THEN 'STALE — RESCAN NEEDED'
        WHEN dc.confidence_score < 0.80                              THEN 'LOW CONFIDENCE — REVIEW'
        ELSE 'OK'
    END AS status
FROM data_catalog dc
WHERE dc.classification_label IN ('Restricted', 'Highly Restricted')
ORDER BY dc.last_scanned_at ASC;`;

const drift_example = `-- Detecting classification drift from schema changes
-- This finds columns added to tables after the last classification scan

SELECT
    c.table_schema,
    c.table_name,
    c.column_name,
    c.data_type,
    dc.last_scanned_at,
    'NEW COLUMN — NOT YET CLASSIFIED' AS risk_flag
FROM information_schema.columns c
JOIN data_catalog dc
    ON  dc.table_schema = c.table_schema
    AND dc.table_name   = c.table_name
WHERE dc.last_scanned_at < (
    -- Use column creation date if your DB records it (e.g. pg_attribute.attnum or DDL logs)
    SELECT MAX(change_time)
    FROM schema_change_log scl
    WHERE scl.table_schema = c.table_schema
      AND scl.table_name   = c.table_name
)
ORDER BY dc.last_scanned_at ASC;

-- Key insight: a developer adding a column 'customer_nino' to an 'Internal'
-- table creates an undetected Restricted field. Without re-scan triggers,
-- this drift is invisible until the next periodic scan.`;

return _renderModule({
  id: 'm4', prev: 'm3', next: 'm5',
  badge: 'Module 4 · Core Domain',
  title: 'Data Classification Systems',
  subtitle: 'Classification is the core domain of this interview role. A large bank holds 50–500 petabytes of data. Without classification, you cannot enforce access controls, comply with GDPR, or respond to a breach — because you do not know where anything is.',
  meta: [
    '&#9200; <span>~2.5 hrs</span>',
    '&#128204; <span>Core Domain</span>',
    '&#127919; <span>5 Stages</span>',
    '&#127891; <span>3 Projects</span>'
  ],
  tabs: [
    {
      id: 'overview', label: '&#128204; Overview',
      sections: [
        {type:'cards', items:[
          {icon:'&#128268;', title:'Why Automation Exists',    body:'Manual classification of a bank\'s data estate takes years and falls behind the moment it is finished. AI-driven scanning classifies millions of assets and flags low-confidence items for human review.'},
          {icon:'&#127937;', title:'5-Tier Label Model',       body:'Public → Internal → Confidential → Restricted → Highly Restricted. The tier determines who can access the data, how it is encrypted, and how long it is kept.'},
          {icon:'&#9881;',   title:'5-Stage Pipeline',        body:'Discovery → Scanning → Inference → Labelling → Re-scanning. The last stage is the most overlooked: data changes, and labels must keep up.'},
          {icon:'&#128099;', title:'1touch.io Kontxtual™',    body:'Context-aware one-touch classification: high-confidence labels applied automatically, low-confidence routed to human review. Dramatically reduces time from discovery to governed data.'},
        ]},
        {type:'callout', variant:'danger', title:'&#128680; Shadow Data and Dark Data',
          body:'<strong>Shadow data</strong>: copies that exist outside governed systems (an analyst\'s personal S3 bucket with exported customer data). <strong>Dark data</strong>: collected and stored but never catalogued or analysed. Both are invisible to classification tools until actively scanned — and both represent unmanaged risk.'},
        {type:'h2', text:'The 5-Tier Classification Model'},
        {type:'table', headers:['Tier','Label','Description','Examples'], rows:[
          ['1', 'Public',            'Anyone can see it. No protection needed.',               'Press releases, published interest rates'],
          ['2', 'Internal',          'Staff only. Not sensitive but not for public release.',  'Internal process docs, org charts'],
          ['3', 'Confidential',      'Contains personal data. GDPR applies.',                  'Customer names, emails, transaction history'],
          ['4', 'Restricted',        'Highly sensitive. Tightly controlled access.',            'Passport scans, NI numbers, credit card data'],
          ['5', 'Highly Restricted', 'Most sensitive. Very limited access, strict audit trail.','Credit decisions, internal investigation files'],
        ]},
      ]
    },
    {
      id: 'concepts', label: '&#128214; Concepts',
      sections: [{type:'accordion', items:[
        {
          title: 'Part 1 — Why Automated Classification Exists',
          sections: [
            {type:'p', text:'A large bank holds 50–500 petabytes of data. New data is created every second — every login, every transaction, every email, every document upload. Most of it has never been categorised.'},
            {type:'ul', items:[
              'Without classification, you cannot enforce "only these people can see Restricted data" — because you do not know which data is Restricted',
              'Without classification, you cannot comply with GDPR\'s requirement to protect personal data — because you do not know where all personal data lives',
              'Without classification, you cannot respond to a data breach notification in time — because you do not know what was stolen',
            ]},
            {type:'callout', variant:'warning', title:'&#9888; The Manual Classification Problem',
              body:'A bank tried to classify data manually. They hired a team. It took 3 years to classify 10% of their data. The other 90% changed in the meantime. <strong>Manual classification does not work at scale.</strong>'},
            {type:'callout', variant:'danger', title:'&#128680; Shadow Data and Dark Data',
              body:'<strong>Shadow data</strong>: data that exists outside officially governed systems. An analyst exports a customer table to a personal S3 bucket to build a dashboard — same sensitivity, zero governance.<br><br><strong>Dark data</strong>: data the organisation collects and stores but has never analysed, used, or even catalogued. Old backup files, archived logs, legacy exports. DSPM tools exist specifically because shadow and dark data are the most dangerous parts of a bank\'s data estate.'},
          ]
        },
        {
          title: 'Part 2 — The 5-Tier Model and Data Ownership',
          sections: [
            {type:'p', text:'Classification tier models vary by institution. The 5-tier model is a widely used framework. In an interview, articulate this model if not given the bank\'s own scheme — and always ask which model the organisation uses.'},
            {type:'callout', variant:'info', title:'&#128161; The Key Concept: Classification as a Policy Bridge',
              body:'Classification is the bridge between data and policy. Label first, then policies enforce themselves automatically. Without a label, you cannot know which encryption tier to apply, which access controls are needed, or what the retention period is.'},
            {type:'p', text:'Every classified dataset must have a named <strong>data owner</strong> — a person accountable for that data\'s accuracy, use, and classification label. Without data ownership, classification becomes an IT exercise with no business accountability.'},
            {type:'ul', items:[
              'Approve or dispute labels applied to their datasets',
              'Review low-confidence classifications that require human judgment',
              'Authorise access requests for data above Internal tier',
              'Ensure retention schedules are applied correctly',
            ]},
            {type:'callout', variant:'success', title:'&#9989; Interview Answer: How is a classification programme governed?',
              body:'The answer is the data owner model. Every dataset has a named, accountable owner. Classification results route through data owners for review and approval. Governance without accountability is not governance.'},
          ]
        },
        {
          title: 'Part 3 — The 5-Stage Classification Pipeline',
          sections: [
            {type:'p', text:'Every enterprise classification tool follows the same five stages. Know this pipeline in detail — it comes up constantly in interviews.'},
            {type:'table', headers:['Stage','Name','What Happens'], rows:[
              ['1', 'Discovery',           'Agent connects to data sources. Creates inventory: "847 tables, 23 S3 buckets, 4.2TB of SharePoint documents."'],
              ['2', 'Scanning',            'Reads column names, data types, and a statistical sample. For unstructured data: extracts text, applies NLP/NER.'],
              ['3', 'Inference',           'ML models and pattern rules determine what the data is: "97% of sampled values match UK NI regex → Restricted."'],
              ['4', 'Labelling',           'Label + confidence score written to data catalog. Dashboards update. Policies can now be enforced.'],
              ['5', 'Re-scanning & Drift', 'Data changes after labelling. Periodic re-scans and schema change triggers detect classification drift.'],
            ]},
            {type:'callout', variant:'info', title:'&#128161; Structured vs Unstructured Data',
              body:'<strong>Structured data</strong> (databases, tables): has a schema — column names help enormously. <strong>Unstructured data</strong> (PDFs, emails, Word docs): no schema, requires NLP/NER text extraction. Classification accuracy on unstructured data is typically lower — this is why confidence thresholds are higher for document classification.'},
            {type:'p', text:'A critical detail: the classification agent does <em>not copy or store</em> the data. It reads, samples, and writes metadata only. This is essential for privacy compliance — the scanner itself must not become a data risk.'},
          ]
        },
        {
          title: 'Part 3b — Classification Drift',
          sections: [
            {type:'p', text:'<strong>Classification drift</strong> is the divergence between a label assigned at one point in time and the true sensitivity of the data as it exists today.'},
            {type:'callout', variant:'danger', title:'&#128680; The Classic Drift Scenario',
              body:'A table is classified as Internal. A developer adds a column <code>customer_nino</code> three months later. The table now contains Restricted PII but its label still reads Internal. Without re-scan triggers, this drift is invisible — and every policy that says "only these people can see Restricted data" is silently failing.'},
            {type:'ul', items:[
              '<strong>Periodic re-scans</strong>: scheduled weekly or monthly depending on data change velocity',
              '<strong>Schema change monitoring</strong>: new columns trigger immediate re-scan',
              '<strong>Confidence score tracking</strong>: degradation over time signals data has changed',
            ]},
            {type:'callout', variant:'warning', title:'&#9888; False Sense of Security',
              body:'A bank that classified all its data three years ago and has not re-scanned since has a dangerous false sense of security. Classification is not a one-time project — it is a continuous process.'},
          ]
        },
        {
          title: 'Part 4 — 1touch.io Kontxtual™ and Context-Aware Classification',
          sections: [
            {type:'p', text:'Traditional classification tools require a multi-step process: scan, review, approve, apply — each step requiring human action. <strong>1touch.io\'s one-touch concept</strong>: classification is triggered by a single action rather than a manual workflow. High-confidence labels are applied automatically. Low-confidence results route to a human review queue.'},
            {type:'callout', variant:'info', title:'&#128161; What "Kontxtual" Means',
              body:'Rather than looking at a column\'s values in isolation, Kontxtual looks at context: What table is this column in? What are the adjacent columns? What application writes to this table? A column called <code>ref</code> containing 9-digit numbers looks meaningless in isolation — in a table called <code>loan_applications</code> alongside <code>applicant_name</code> and <code>income</code>, it is clearly a loan reference number with regulatory implications.'},
            {type:'callout', variant:'warning', title:'&#9888; Terminology: Sensitivity Label vs Classification Label',
              body:'<strong>Classification label</strong>: stored in the data catalog against a data asset (table, column, file). Governs the database.<br><strong>Sensitivity label</strong>: a Microsoft Purview object that travels <em>with a file</em> — embedded in metadata, persists wherever the file goes (email, USB, cloud). Governs the document.<br>Both reflect the same tier model but operate in different technical layers. Use the correct term in context.'},
          ]
        },
        {
          title: 'Part 5 — The Vendor Landscape',
          sections: [
            {type:'p', text:'You will be expected to know these tools and articulate at least one strength and one limitation of each.'},
            {type:'table', headers:['Tool','Strength','Best For','Limitation'], rows:[
              ['1touch.io Kontxtual', 'Automated one-touch, context-aware', 'Banks wanting minimal manual review', 'Less mature on legacy on-prem; primarily cloud-native'],
              ['Microsoft Purview',   'Deep Microsoft/Azure ecosystem integration', 'Banks heavily on Azure/M365', 'Weaker outside Microsoft ecosystem; limited non-Azure sources'],
              ['Varonis',             'Strong on file shares, email, Active Directory', 'Banks with significant on-prem infrastructure', 'Slower at petabyte cloud scale'],
              ['BigID',               'Privacy-focused, GDPR/CCPA specialist', 'Banks with complex privacy programmes', 'Higher implementation complexity and cost'],
              ['Securiti.ai',         'AI-driven, consent management', 'Banks needing broad data intelligence', 'Smaller enterprise customer base; less proven at tier-1 bank scale'],
            ]},
          ]
        },
      ]}]
    },
    {
      id: 'code', label: '&#128187; Code Examples',
      sections: [
        {type:'p', text:'Classification work is expressed in SQL and schema design. These examples show how classification decisions map to real data structures.'},
        {type:'code', lang:'sql', title:'1 — Table-level classification: the highest label wins', caption:'Even one Highly Restricted column elevates the entire table. This schema shows how to reason about it.', code: schema_ex},
        {type:'code', lang:'sql', title:'2 — Find stale or low-confidence Restricted labels', caption:'Identifies classification labels that are stale (>90 days) or low-confidence — the two main signals of potential drift.', code: confidence_check},
        {type:'code', lang:'sql', title:'3 — Detecting classification drift from schema changes', caption:'Finds columns added to tables after the last classification scan — the primary mechanism of undetected drift.', code: drift_example},
      ]
    },
    {
      id: 'projects', label: '&#127891; Projects',
      sections: [
        {type:'h2', text:'Mini Projects'},
        {type:'html', content:`
<div class="project-card">
  <div class="project-header"><div class="project-title">4.1 — Classify These Columns</div><div class="project-time">~15 min</div></div>
  <div class="project-tags"><span class="tag">5-Tier Model</span><span class="tag">Judgment</span></div>
  <p>Assign a classification label to each of these columns and justify your choice: (1) <code>full_name</code> in <code>customers</code>, (2) <code>password_hash</code> in <code>auth</code>, (3) <code>credit_score</code> in <code>loan_applications</code>, (4) <code>branch_name</code> in <code>branches</code>, (5) <code>annual_income</code> in <code>mortgage_applications</code>, (6) <code>nino</code> in <code>tax_records</code>, (7) <code>email</code> in <code>marketing_list</code>, (8) <code>product_code</code> in <code>products</code>.</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">4.2 — What Would You Classify This Table As?</div><div class="project-time">~15 min</div></div>
  <div class="project-tags"><span class="tag">Table-level vs Column-level</span><span class="tag">Highest Label Wins</span></div>
  <p>Using the <code>loan_applications</code> schema in the Code Examples tab, determine: (1) the label for each individual column, (2) the table-level label, (3) which column drives the table's label, (4) what access controls should apply.</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">4.3 — Design the Classification Pipeline (Capstone)</div><div class="project-time">~25 min</div></div>
  <div class="project-tags"><span class="tag">5 Stages</span><span class="tag">Prioritisation</span><span class="tag">Interview Prep</span></div>
  <p>A bank is starting a classification programme from scratch. Describe the 5 stages. Answer these three questions: (1) Which data sources would you prioritise scanning first and why? (2) What would you do with low-confidence results? (3) How would you handle classification drift? Then explain what shadow data and dark data are and why they are the hardest part.</p>
</div>`}
      ]
    },
    {
      id: 'quiz', label: '&#129300; Quiz',
      sections: [
        {type:'h2', text:'Knowledge Check'},
        {type:'quiz', questions:[
          {q:'A table contains these column labels: Internal, Internal, Confidential, Restricted. What is the table-level classification?',
           options:['Internal — the most common label wins','Confidential — the average','Restricted — the highest label of any column determines the table label','It depends on which columns have more rows'],
           correct:2, explanation:'The table-level label is always the highest tier present in any column. One Restricted column makes the entire table Restricted. Even one Highly Restricted column would elevate the whole table to Highly Restricted.'},
          {q:'What is classification drift?',
           options:['When classification tools run slowly due to data volume','The divergence between a label assigned at one point in time and the true sensitivity of the data today (e.g. a new PII column added to a previously Internal table)','When different tools assign different labels to the same data','A type of data corruption'],
           correct:1, explanation:'Classification drift is what happens when data changes after labelling. A developer adds a customer_nino column to an Internal table three months after the last scan — the table is now Restricted but still labelled Internal. Periodic re-scans and schema change triggers are the technical countermeasures.'},
          {q:'An analyst exports a customer database table to their personal S3 bucket to build a dashboard. What type of data risk does this create?',
           options:['Dark data', 'Shadow data — a copy of sensitive data exists outside governed systems with zero classification or access control','A DSAR violation','Confidential data — but it is still under governance'],
           correct:1, explanation:'Shadow data is data that exists outside officially governed systems. The exported copy has the same sensitivity as the original but none of the governance — no classification label, no access control, no audit trail, no retention policy. This is one of the most common data risk findings in classification audits.'},
          {q:'What does "context-aware" mean in the context of 1touch.io Kontxtual™?',
           options:['The tool is aware of the current date and time','It classifies based on the column\'s values in the context of the whole table, adjacent columns, and the application that writes to it — not just the column values in isolation','It is context-sensitive to the user\'s department','The tool uses contextual advertising to train its models'],
           correct:1, explanation:'A column "ref" with 9-digit numbers is ambiguous in isolation. In a table called loan_applications alongside applicant_name and income, it is clearly a loan reference number with regulatory implications. Context transforms classification accuracy.'},
          {q:'What is the difference between a classification label and a sensitivity label?',
           options:['They are identical — just different terminology','Classification label: stored in the data catalog against a data asset. Sensitivity label: travels with a file (embedded metadata) wherever it goes.','Sensitivity labels are for people; classification labels are for systems','Classification labels are more sensitive than sensitivity labels'],
           correct:1, explanation:'Classification labels govern databases — stored in the catalog against tables and columns. Sensitivity labels (Microsoft Purview) are technical objects embedded in file metadata that persist when a document is emailed, downloaded, or copied. Both reflect the same tier model but operate in different technical layers.'},
        ]}
      ]
    }
  ]
});
};
