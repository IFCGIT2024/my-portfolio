// =====================================================
// Module 3: Cloud & AWS Basics
// =====================================================
window.MODULES.m3 = () => {

const iam_policy = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowReadRestrictedBucket",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::bank-customer-documents-prod",
        "arn:aws:s3:::bank-customer-documents-prod/*"
      ],
      "Condition": {
        "StringEquals": {
          "s3:prefix": ["kyc/", "statements/"]
        }
      }
    },
    {
      "Sid": "DenyDelete",
      "Effect": "Deny",
      "Action": "s3:DeleteObject",
      "Resource": "arn:aws:s3:::bank-customer-documents-prod/*"
    }
  ]
}
// Reading this:
//   Effect:   Allow or Deny
//   Action:   the AWS API calls being controlled
//   Resource: the ARN (Amazon Resource Name) this applies to
//   Condition: additional constraints — here, only the kyc/ and statements/ paths
// The Deny statement overrides any Allow for DeleteObject.`;

const bad_bucket_policy = `// INSECURE — "Principal": "*" means ANYONE on the internet can read this bucket
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::bank-customer-documents-prod/*"
  }]
}

// CORRECTED — restrict to specific IAM role (Principle of Least Privilege)
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "AWS": "arn:aws:iam::123456789012:role/ClassificationScannerRole"
    },
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": [
      "arn:aws:s3:::bank-customer-documents-prod",
      "arn:aws:s3:::bank-customer-documents-prod/*"
    ]
  }]
}
// PoLP (Principle of Least Privilege): grant only the minimum permissions
// required for the specific function — nothing more.`;

const cloudtrail = `// CloudTrail log entry — every API action in AWS produces one of these
{
  "eventTime":       "2025-01-28T14:32:01Z",
  "eventName":       "GetObject",
  "eventSource":     "s3.amazonaws.com",
  "userIdentity": {
    "type":          "IAMUser",
    "userName":      "j.smith",
    "arn":           "arn:aws:iam::123456789012:user/j.smith"
  },
  "requestParameters": {
    "bucketName":    "bank-customer-documents-prod",
    "key":           "kyc/customer_4421_passport.pdf"
  },
  "sourceIPAddress": "10.0.1.52",
  "responseElements": null,
  "errorCode":       null
}
// Reading this: j.smith accessed customer 4421's passport at 14:32 UTC on 28 Jan.
// errorCode: null = succeeded (an error would show AccessDenied etc.)
// sourceIPAddress: 10.0.1.52 is a private IP = came from within the VPC (expected)
// If sourceIPAddress were a public IP: immediate security investigation.`;

const vpc_config = `# Conceptual architecture — Restricted data always in private subnets
#
# VPC: 10.0.0.0/16
#   |
#   |-- Public Subnet 10.0.1.0/24
#   |     [Load Balancer] — internet-facing, NO data storage here
#   |
#   |-- Private Subnet 10.0.2.0/24
#   |     [Classification Scanner EC2 / Lambda]
#   |     Security Group: inbound HTTPS from load balancer only
#   |
#   |-- Private Subnet 10.0.3.0/24
#         [RDS Database] — no internet route
#         Security Group: inbound port 5432 from Scanner SG only
#
# S3 Access:
#   Private subnet → VPC Endpoint for S3 → S3 bucket
#   Traffic NEVER leaves AWS network (no public internet path)
#   S3 bucket has Block Public Access ENABLED (mandatory for Restricted data)
#
# KMS (Customer Managed Keys):
#   Restricted/Highly Restricted S3 buckets: encrypted with CMK
#   Bank owns the key, controls rotation, every use logged in CloudTrail
#   Lower-tier data: AWS-managed keys acceptable`;

return _renderModule({
  id: 'm3', prev: 'm2', next: 'm4',
  badge: 'Module 3 · Cloud',
  title: 'Cloud & AWS Basics',
  subtitle: 'The cloud is not magic — it is computers in a building that AWS owns and manages for you. Understanding how a bank uses AWS is essential for knowing where data lives, who can access it, and how classification governance maps onto cloud infrastructure.',
  meta: [
    '&#9200; <span>~2 hrs</span>',
    '&#128204; <span>All Roles</span>',
    '&#9729; <span>4 Core Services</span>',
    '&#127891; <span>4 Projects</span>'
  ],
  tabs: [
    {
      id: 'overview', label: '&#128204; Overview',
      sections: [
        {type:'cards', items:[
          {icon:'&#128193;', title:'S3 — Storage',              body:'Files (objects) stored in buckets. Banks use S3 for customer documents, transaction logs, and analytics staging. Classification tools scan S3 looking for PII.'},
          {icon:'&#128273;', title:'IAM — Access Control',      body:'Every AWS action requires permission. IAM policies define who can do what. The principle of least privilege (PoLP) governs every IAM design decision.'},
          {icon:'&#128065;', title:'Macie — PII Detection',     body:'AWS\'s built-in PII scanner for S3. Enabled at account level, samples files, identifies PII types, produces severity-rated findings.'},
          {icon:'&#128247;', title:'CloudTrail — Audit Log',    body:'Records every API action in AWS: who accessed what, when, from where. The technical backbone of compliance audit trails at a bank.'},
        ]},
        {type:'callout', variant:'info', title:'&#127979; Why Cloud Governance is Critical for Banks',
          body:'Cloud flexibility (spin up a database in minutes, share data instantly, scale globally) creates compliance risk if unmanaged. Classification determines encryption tiers, access controls, data residency requirements, and audit obligations. Without it, cloud becomes a liability, not an asset.'},
        {type:'h2', text:'Key AWS Services Map'},
        {type:'table', headers:['Service','What It Does','Classification Relevance'], rows:[
          ['S3',          'Object storage',                  'Where files live — scan for PII, enforce bucket policies by label'],
          ['IAM',         'Identity and access management',  'Control who accesses Restricted data — implement PoLP'],
          ['Macie',       'Automated PII detection in S3',   'Native scanner — supplements enterprise tools like 1touch.io'],
          ['CloudTrail',  'AWS API audit log',               'Who accessed what, when — DORA Pillar 2 evidence'],
          ['KMS',         'Key management for encryption',   'CMKs required for Restricted/Highly Restricted data'],
          ['VPC',         'Private network layer',           'Restricted data must live in private subnets with no public route'],
        ]},
      ]
    },
    {
      id: 'concepts', label: '&#128214; Concepts',
      sections: [{type:'accordion', items:[
        {
          title: 'Part 1 — What is the Cloud (Really)?',
          sections: [
            {type:'p', text:'The cloud is literally computers in a building that Amazon, Microsoft, or Google owns and manages for you. You buy on-demand access to computing power, storage, and managed services, paying only for what you use.'},
            {type:'ul', items:[
              '<strong>Scale</strong> — data volumes can explode in milliseconds (a trading event, a viral promotion). Cloud scales instantly. A physical server room cannot.',
              '<strong>Cost</strong> — pay for what you use. No idle hardware.',
              '<strong>Managed services</strong> — AWS runs the database software. You just use it.',
              '<strong>Global reach</strong> — AWS has 30+ Regions globally, each with multiple physically separate Availability Zones. A UK bank runs in London Region with DR in Ireland.',
            ]},
            {type:'callout', variant:'warning', title:'&#9888; The Compliance Tension',
              body:'Banks have strict obligations about <em>where</em> data lives (data residency), <em>who</em> can access it, and <em>what happens to it</em>. Cloud flexibility must be matched with equally careful governance. This is where classification becomes critical.'},
          ]
        },
        {
          title: 'Part 2 — S3 and IAM',
          sections: [
            {type:'p', text:'<strong>S3 (Simple Storage Service)</strong> stores files (called objects) in containers (called buckets). Every bucket has a name and lives in a region. A bank might have: <code>bank-customer-documents-prod</code>, <code>bank-transaction-logs-archive</code>, <code>bank-analytics-staging</code>.'},
            {type:'p', text:'Classification tools scan S3 buckets looking for PII in files. A file called <code>customer_export_2024.csv</code> in S3 is scanned — AWS Macie or 1touch.io reads it and labels it.'},
            {type:'p', text:'<strong>IAM (Identity and Access Management)</strong> controls who can do what. Every action in AWS requires permission. A user, service, or application gets an IAM role or policy.'},
            {type:'callout', variant:'danger', title:'&#128737; Principle of Least Privilege (PoLP)',
              body:'<strong>Every user, service, and process should be granted only the minimum permissions required to perform its specific function — nothing more.</strong> PoLP is one of the most cited security principles in technical interviews. Any answer about access control, IAM design, or cloud security should reference it.'},
            {type:'table', headers:['Policy Type','Attached To','Controls'], rows:[
              ['IAM Policy',     'User or Role',   'What this identity can access across all resources'],
              ['Bucket Policy',  'S3 Bucket',      'Who can access this specific bucket'],
            ]},
            {type:'p', text:'Both stack — you need both to allow access. Either can deny (and a Deny always overrides an Allow).'},
          ]
        },
        {
          title: 'Part 2b — Macie and CloudTrail',
          sections: [
            {type:'p', text:'<strong>AWS Macie</strong> is AWS\'s built-in PII scanner for S3. Enabled at the account level (not per-bucket), it samples files within configured buckets, identifies PII (names, credit cards, health data, national IDs), and produces findings with severity ratings.'},
            {type:'callout', variant:'info', title:'&#128161; Macie vs 1touch.io',
              body:'Macie is the cloud-native, lowest-friction option — useful but limited to S3 and without cross-system context awareness. Enterprise tools like 1touch.io scan databases, file shares, cloud storage, and SaaS simultaneously, with a unified classification policy across all systems.'},
            {type:'p', text:'<strong>CloudTrail</strong> records every API action in AWS. Every time someone reads an S3 object, modifies an IAM policy, or creates a resource — CloudTrail writes a log entry. This is the technical backbone of audit compliance at a bank.'},
          ]
        },
        {
          title: 'Part 3 — Encryption: At Rest and In Transit',
          sections: [
            {type:'table', headers:['Type','What it Protects','How'], rows:[
              ['At rest',     'Data on disk',                'Encrypted with a key — unreadable without it, even if the physical disk is stolen'],
              ['In transit',  'Data moving over a network',  'HTTPS/TLS — even if packets are intercepted, they cannot be read'],
            ]},
            {type:'p', text:'Classification determines <em>which</em> encryption tier applies. Restricted data must be encrypted with dedicated keys.'},
            {type:'callout', variant:'info', title:'&#128273; AWS KMS and Customer Managed Keys (CMKs)',
              body:'<strong>KMS (Key Management Service)</strong> is AWS\'s centralised key management. <strong>CMKs (Customer Managed Keys)</strong> are encryption keys you create, own, and control — only your account can use them, you control rotation, and every use is logged in CloudTrail. AWS-managed keys are controlled by AWS on your behalf. Classification determines which applies: <strong>Restricted and Highly Restricted data must use CMKs</strong> so the bank retains full key control and audit trail.'},
          ]
        },
        {
          title: 'Part 3b — VPCs, Subnets, and Network Security',
          sections: [
            {type:'p', text:'A bank does not put sensitive data on the public internet. Every AWS resource that handles customer or financial data lives inside a <strong>VPC (Virtual Private Cloud)</strong> — an isolated, private network within AWS that you define and control.'},
            {type:'table', headers:['Component','What It Does','Rule for Sensitive Data'], rows:[
              ['Private subnet',  'Network segment with no direct internet path',        'Databases and data processing always go here'],
              ['Public subnet',   'For resources needing limited internet access',       'Load balancers only — never data storage'],
              ['Security group',  'Virtual firewall attached to individual resources',   'Allow only required ports from specific sources'],
              ['NACL',            'Subnet-level rules — apply before security groups',   'Defence-in-depth: second layer of control'],
              ['VPC Endpoint',    'Private path to S3 — traffic never leaves AWS',       'Required for compliant S3 access from private subnets'],
            ]},
            {type:'callout', variant:'danger', title:'&#128680; Red Flag: S3 Block Public Access Disabled',
              body:'An S3 bucket with Block Public Access disabled means data is reachable from anywhere on the internet. For any bucket containing customer or financial data, this is an immediate critical finding requiring remediation.'},
          ]
        },
      ]}]
    },
    {
      id: 'code', label: '&#128187; Code Examples',
      sections: [
        {type:'p', text:'AWS configuration is JSON — policies, tags, and logs are all JSON documents. Reading and writing these is a core skill.'},
        {type:'code', lang:'json', title:'1 — IAM policy: how to read it', caption:'Every AWS action is controlled by a policy. This grants read-only access to specific S3 paths and denies delete.', code: iam_policy},
        {type:'code', lang:'json', title:'2 — Bucket policy: spot the flaw and fix it', caption:'Principal: "*" is the most common catastrophic misconfiguration. The fix implements PoLP.', code: bad_bucket_policy},
        {type:'code', lang:'json', title:'3 — CloudTrail log: who accessed what?', caption:'Every API call in AWS produces a structured log entry. Reading these is an essential audit skill.', code: cloudtrail},
        {type:'code', lang:'bash', title:'4 — VPC architecture for Restricted data', caption:'Conceptual layout: private subnets, VPC endpoints, KMS CMKs, and the no-public-access rule.', code: vpc_config},
      ]
    },
    {
      id: 'projects', label: '&#127891; Projects',
      sections: [
        {type:'h2', text:'Mini Projects'},
        {type:'html', content:`
<div class="project-card">
  <div class="project-header"><div class="project-title">3.1 — Read an IAM Policy</div><div class="project-time">~15 min</div></div>
  <div class="project-tags"><span class="tag">IAM</span><span class="tag">JSON</span><span class="tag">Allow/Deny</span></div>
  <p>Given the IAM policy in the Code Examples tab, answer: (1) What actions are allowed? (2) On which resources? (3) What condition restricts access? (4) What does the Deny statement override?</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">3.2 — Spot the Flaw in the Bucket Policy</div><div class="project-time">~15 min</div></div>
  <div class="project-tags"><span class="tag">Security</span><span class="tag">PoLP</span><span class="tag">Bucket Policy</span></div>
  <p>The insecure bucket policy in the Code Examples tab has a critical flaw. Identify it, explain why it is dangerous, and write a corrected version that implements the Principle of Least Privilege.</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">3.3 — Interpret a CloudTrail Log</div><div class="project-time">~15 min</div></div>
  <div class="project-tags"><span class="tag">CloudTrail</span><span class="tag">Audit</span><span class="tag">JSON</span></div>
  <p>Using the CloudTrail log in the Code Examples tab, answer: (1) Who accessed what? (2) When? (3) Was the access successful? (4) Was the source IP internal or external? (5) Is this access expected or suspicious?</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">3.4 — Design a Secure Data Architecture (Capstone)</div><div class="project-time">~25 min</div></div>
  <div class="project-tags"><span class="tag">Architecture</span><span class="tag">S3</span><span class="tag">IAM</span><span class="tag">KMS</span></div>
  <p>A new project needs to store: (1) customer KYC documents, (2) transaction summaries for analytics, (3) internal team reports. Design the S3 bucket structure, name the buckets, specify which IAM roles are needed, assign classification labels to each bucket, and specify which encryption type (AWS-managed vs CMK) applies to each.</p>
</div>`}
      ]
    },
    {
      id: 'quiz', label: '&#129300; Quiz',
      sections: [
        {type:'h2', text:'Knowledge Check'},
        {type:'quiz', questions:[
          {q:'What does the Principle of Least Privilege (PoLP) mean?',
           options:['Users should have the fewest possible logins','Every user, service, and process is granted only the minimum permissions required for its specific function — nothing more','Databases should store as little data as possible','Cloud services should be limited to one per application'],
           correct:1, explanation:'PoLP is a foundational security principle. In AWS, it means IAM policies should grant only the exact actions on the exact resources the identity needs. Overly permissive policies are one of the most common cloud security findings.'},
          {q:'An S3 bucket containing customer documents has "Block Public Access" disabled. What does this mean?',
           options:['Public users can see bucket statistics but not files','The bucket is reachable from anywhere on the internet — this is a critical security finding','This is the AWS default and is expected','Block Public Access only applies to IAM users, not the bucket policy'],
           correct:1, explanation:'"Block Public Access" disabled means the bucket could potentially be made public. For any bucket containing customer or financial data, this configuration should be treated as a critical finding requiring immediate review and remediation.'},
          {q:'What is the difference between AWS-managed KMS keys and Customer Managed Keys (CMKs)?',
           options:['CMKs are faster','AWS-managed keys are controlled by AWS; CMKs are created, owned, and controlled by you — with full audit trail and rotation control','CMKs are cheaper','AWS-managed keys offer stronger encryption'],
           correct:1, explanation:'CMKs give the bank full control: you set rotation policy, control which services can use the key, and every use is logged in CloudTrail. Restricted and Highly Restricted data must use CMKs — the bank cannot rely on a third party\'s key management for its most sensitive data.'},
          {q:'Why does S3 access from a private subnet require a VPC Endpoint?',
           options:['Private subnets cannot access S3 without one','VPC Endpoints provide a private path to S3 so traffic never leaves AWS\'s network — without one, S3 traffic routes over the public internet','It is an AWS billing requirement','VPC Endpoints provide faster S3 access'],
           correct:1, explanation:'Without a VPC Endpoint, S3 traffic from a private subnet routes through the public internet — which is unacceptable for banking data. VPC Endpoints provide a private, direct path within AWS\'s own network, satisfying both security and data residency requirements.'},
          {q:'What does "data residency" mean in the context of a UK bank using AWS?',
           options:['Where customer data physically lives — UK banks must ensure sensitive customer data stays in approved regions (e.g. EU/UK) to meet GDPR obligations','How long data is retained','The speed at which data can be accessed','Whether data is encrypted at rest'],
           correct:0, explanation:'Data residency determines the physical location of data — relevant because GDPR and UK GDPR restrict transfers of personal data outside approved jurisdictions. A UK bank must configure AWS Regions, replication policies, and backup locations to ensure sensitive data does not leave approved territories.'},
        ]}
      ]
    }
  ]
});
};
