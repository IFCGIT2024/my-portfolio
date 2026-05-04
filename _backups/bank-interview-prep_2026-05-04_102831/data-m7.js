// =====================================================
// Module 7: AI/ML in Classification
// =====================================================
window.MODULES.m7 = () => {

const ner_example = `import spacy
# spaCy is a leading NLP library. Many classification tools use similar techniques internally.
# Load a pre-trained NER model (or a bank's fine-tuned custom model)
nlp = spacy.load("en_core_web_trf")  # transformer-based = most accurate

text = "Please send £5,000 to Jane Smith at sort code 20-01-34 account 12345678"

doc = nlp(text)

for ent in doc.ents:
    print(f"  Entity: {ent.text:<30} Type: {ent.label_}")

# Output (example — depends on model):
#   Entity: £5,000                         Type: MONEY
#   Entity: Jane Smith                     Type: PERSON
#   Entity: 20-01-34                       Type: (custom: SORT_CODE)
#   Entity: 12345678                       Type: (custom: ACCOUNT_NUMBER)

# Why "NER" matters in interviews:
# Saying "the tool uses NLP" is vague.
# Saying "the tool uses NER models to extract person names and financial identifiers"
# is precise and shows domain understanding.`;

const metrics = `# Precision, Recall, and F1 — evaluating a classification model
# Context: the scanner labelled 120 columns as PII.
# Of those 120, only 95 were actually PII.
# The dataset actually contained 150 PII columns.

true_positives  = 95   # correctly labelled as PII
false_positives = 25   # labelled as PII but weren't
false_negatives = 55   # actual PII the model MISSED (150 - 95)

precision = true_positives / (true_positives + false_positives)
# precision = 95 / 120 = 0.792 (79.2%)
# "Of every column I labelled PII, 79% actually was"

recall = true_positives / (true_positives + false_negatives)
# recall = 95 / 150 = 0.633 (63.3%)
# "I found 63% of all actual PII columns"

# F1 = harmonic mean of precision and recall
f1 = 2 * (precision * recall) / (precision + recall)
# f1 = 2 * (0.792 * 0.633) / (0.792 + 0.633) = 0.704 (70.4%)

print(f"Precision: {precision:.1%}")  # 79.2%
print(f"Recall:    {recall:.1%}")     # 63.3%
print(f"F1 Score:  {f1:.1%}")         # 70.4%

# BANKING PRIORITY: high recall > high precision
# A false positive (labelling non-PII as PII) = extra human review work
# A false negative (MISSING real PII) = regulatory fine + data breach risk
# When forced to choose: accept more false positives to minimise false negatives.`;

const rag_governance = `# RAG (Retrieval-Augmented Generation) — Governance Checklist
# A RAG system retrieves documents from a knowledge base, then the LLM
# generates a response using those documents as context.

# The classification governance question BEFORE deploying RAG:
#
# 1. Has every document in the retrieval index been classified?
#    □ Run classification scan on entire knowledge base
#    □ Assign a label to every chunk/document
#
# 2. Is the label consistent with the access level of users who will query?
#    □ If users are general analysts: knowledge base must contain <= Confidential
#    □ If users are compliance officers: may include Restricted
#    □ Highly Restricted: NEVER in a shared RAG knowledge base
#
# 3. Is there a query-time access check?
#    □ Before returning a retrieved document, check: user.clearance >= doc.label
#    □ RAG systems without this check can expose Restricted data to unauthorised users
#
# 4. Are audit logs capturing what was retrieved and by whom?
#    □ Article 35 DPIA likely required
#    □ AI Act Article 12 (logging for high-risk AI) likely triggered
#
# Common failure mode: a RAG system is seeded with "all company documents"
# including Restricted HR files, legal opinions, and credit decisions.
# Any user can then query the AI and receive Restricted content in the response.
# This is both a data governance failure AND an AI Act compliance issue.`;

return _renderModule({
  id: 'm7', prev: 'm6', next: 'm8',
  badge: 'Module 7 · AI/ML',
  title: 'AI/ML in Classification',
  subtitle: 'AI/ML is both the mechanism behind automated classification and an increasingly important risk area that must itself be governed. Precision vs recall, NER, confidence scores, bias, and RAG governance are all interview-tested topics in 2026.',
  meta: [
    '&#9200; <span>~2 hrs</span>',
    '&#128204; <span>Technical</span>',
    '&#129302; <span>NER + GenAI</span>',
    '&#127891; <span>3 Projects</span>'
  ],
  tabs: [
    {
      id: 'overview', label: '&#128204; Overview',
      sections: [
        {type:'cards', items:[
          {icon:'&#129302;', title:'How ML Classification Works', body:'Pattern recognition from labelled examples. ML generalises from training data to classify new, unseen data — handling the context and ambiguity that rules alone cannot.'},
          {icon:'&#128270;', title:'NER: PII Detection Engine',   body:'Named Entity Recognition identifies person names, financial identifiers, and national IDs in text. "The tool uses NER" is a precise, impressive answer in interviews.'},
          {icon:'&#128200;', title:'Precision, Recall, F1',       body:'In banking: high recall is prioritised (missing PII costs regulatory fines). F1 is the single metric that balances both. Know the formulas.'},
          {icon:'&#129309;', title:'GenAI and RAG Governance',    body:'GenAI deployed without classification = uncontrolled data access channel. RAG systems need classification governance at document-retrieval level.'},
        ]},
        {type:'callout', variant:'warning', title:'&#9888; Two Roles of AI/ML in This Work',
          body:'<strong>As mechanism</strong>: ML models power the classification scanner — NER extracts entities, confidence scores flag uncertainty, MLOps keeps models current.<br><strong>As risk</strong>: GenAI tools deployed inside banks are a new data access channel that must itself be governed using the same classification principles.'},
        {type:'h2', text:'ML Concepts Quick Reference'},
        {type:'table', headers:['Concept','What It Means','Why It Matters at a Bank'], rows:[
          ['Training',       'Showing a model labelled examples to learn patterns',      'Done in scheduled MLOps jobs, not during scanning — computationally expensive'],
          ['Inference',      'Using the trained model to classify new data',             'Happens in real time during every scan — lightweight'],
          ['NER',            'Named Entity Recognition — identifies entities in text',    '"Uses NER" is the precise term for PII extraction from free text'],
          ['Confidence score','Model certainty 0–1',                                     'Drives human review queues: <0.85 = review needed at most banks'],
          ['Precision',      'Of all items I labelled PII, what % actually was?',        'Low precision = too many false alarms'],
          ['Recall',         'Of all actual PII, what % did I find?',                    'Low recall = missed PII — the dangerous failure mode at a bank'],
          ['F1',             'Harmonic mean of precision and recall',                    'The single metric for evaluating a classifier — know the formula'],
          ['MLOps',          'Continuous retraining as new labelled data accumulates',   'Handles data drift — patterns shift, model must keep up'],
        ]},
      ]
    },
    {
      id: 'concepts', label: '&#128214; Concepts',
      sections: [{type:'accordion', items:[
        {
          title: 'Part 1 — What is Machine Learning (Without the Jargon)?',
          sections: [
            {type:'p', text:'Machine learning is <strong>pattern recognition from examples</strong>. Instead of writing rules ("if column name contains \'email\', label as PII"), you show the system thousands of examples of PII and non-PII, and it learns to distinguish them automatically.'},
            {type:'ul', items:[
              'A column called <code>ref</code> might contain customer references (Confidential) or internal transaction references (Internal). The name gives no clue — context does.',
              'PII can be in unexpected places: free text comments, log files, PDF metadata, email bodies',
              'New data types and formats emerge faster than anyone can write rules',
              'ML generalises from training examples to new, unseen cases — rules cannot',
            ]},
            {type:'callout', variant:'info', title:'&#128161; Training vs Inference',
              body:'<strong>Training</strong>: showing the model labelled examples. Computationally expensive. Done in scheduled MLOps jobs. Uses <em>MLOps (Machine Learning Operations)</em> — continuous retraining as new data accumulates to handle drift.<br><strong>Inference</strong>: using the trained model to classify new, unseen data. Real-time. Lightweight.'},
          ]
        },
        {
          title: 'Part 2 — NLP and NER: The PII Detection Engine',
          sections: [
            {type:'p', text:'<strong>NLP (Natural Language Processing)</strong> is the ML subfield that handles text. Within NLP, <strong>NER (Named Entity Recognition)</strong> is the specific technique used for PII detection.'},
            {type:'p', text:'NER models identify and classify named entities in text: people, organisations, locations, dates, financial amounts, national identifiers. When a classification tool reads "Please send £5,000 to Jane Smith at account 12345678" and identifies each element — that is NER.'},
            {type:'callout', variant:'success', title:'&#9989; Interview Precision: NER vs NLP',
              body:'Saying "the tool uses NLP" is vague. Saying "the tool uses NER models to extract person names, financial identifiers, and national IDs from unstructured text" is precise and signals deep understanding. NER is the term to use.'},
            {type:'p', text:'NLP/NER also handles <strong>synonym/ontology resolution</strong>: "DOB", "date of birth", and "birth_date" all refer to the same concept. Models learn this through training on vast labelled datasets — not through hard-coded rules.'},
            {type:'ul', items:[
              '<strong>Entity extraction</strong> from free text, emails, and documents',
              '<strong>Topic classification</strong>: is this a credit application or an HR file?',
              '<strong>Synonym resolution</strong>: "NI number" = "National Insurance number" = "NINO"',
              '<strong>Context-aware confidence scoring</strong> based on linguistic context, not just pattern matching',
            ]},
          ]
        },
        {
          title: 'Part 3 — Precision, Recall, and the F1 Score',
          sections: [
            {type:'table', headers:['Metric','Definition','Failure Mode'], rows:[
              ['Precision', 'Of everything I labelled PII, what % actually is PII?',   'Low precision = many false positives (non-PII labelled as PII) — extra review work'],
              ['Recall',    'Of all actual PII in the dataset, what % did I find?',     'Low recall = false negatives (missed PII) — regulatory risk, data breach exposure'],
              ['F1',        'Harmonic mean of precision and recall: 2×(P×R)/(P+R)',     'Below ~0.75 at a bank = model needs retraining or threshold adjustment'],
            ]},
            {type:'callout', variant:'danger', title:'&#128680; Banking Priority: High Recall',
              body:'In banking, <strong>high recall is prioritised over high precision</strong>. A false positive (labelling non-PII as PII) costs human review time. A false negative (missing real PII) can cost a regulatory fine, a data breach, and a failed DSAR. When calibrating thresholds, accept more false positives to minimise missed PII.'},
            {type:'p', text:'The <strong>F1 score</strong> is the harmonic mean of precision and recall. It penalises extreme imbalances: a model with 100% precision but 10% recall gets an F1 of ~0.18, not 55%. This is why F1 is preferred over a simple average. Know this formula for technical interviews.'},
          ]
        },
        {
          title: 'Part 3b — Confidence Scores and Human Review',
          sections: [
            {type:'p', text:'ML models do not say "this is PII." They say "I am 94% confident this is PII." The confidence score determines whether human review is triggered.'},
            {type:'table', headers:['Score Range','Typical Action'], rows:[
              ['> 90%',   'Auto-accept the label — high confidence, no human needed'],
              ['70–90%',  'Queue for human review — model is uncertain, human verifies'],
              ['< 70%',   'Investigate and manually classify — model is not confident enough to rely on'],
            ]},
            {type:'callout', variant:'warning', title:'&#9888; Why This Matters for Drift Detection',
              body:'A table that was classified at 0.94 confidence may drop to 0.71 on re-scan 6 months later. Confidence score degradation is a signal that the data has changed. Tracking confidence scores over time is part of drift detection — a falling score means re-scan and human review are needed.'},
          ]
        },
        {
          title: 'Part 4 — Bias in Classification Models',
          sections: [
            {type:'p', text:'If a classification model is trained predominantly on data from one region, language, or format — it will be less accurate on data that looks different.'},
            {type:'ul', items:[
              'A model trained on English PII patterns may miss Arabic names or Korean phone number formats',
              'A model trained on structured database data may miss PII in PDFs or email bodies',
              'A model trained on UK formats may miss German IBAN structures or US SSN patterns',
            ]},
            {type:'callout', variant:'warning', title:'&#9888; The EU AI Act Regulatory Angle',
              body:'The EU AI Act explicitly requires high-risk AI systems (including data classification systems used in financial services) to address bias in training data. Banks must document: what data was used to train classification models, what groups are represented, and what accuracy differences exist across data types. This documentation requirement is where classification meets AI governance.'},
          ]
        },
        {
          title: 'Part 5 — GenAI Governance and RAG Architecture',
          sections: [
            {type:'callout', variant:'danger', title:'&#128680; The Unsanctioned GenAI Risk',
              body:'When an employee pastes a customer record into an unsanctioned consumer GenAI tool (personal ChatGPT, free-tier Copilot): data may be sent to a third-party API outside the bank\'s control; may be retained by the provider; cannot be reliably deleted once submitted.<br><br><strong>Enterprise API contracts</strong> (Azure OpenAI Service, AWS Bedrock, Microsoft 365 Copilot Enterprise) explicitly prohibit providers from using data for training — contractually guaranteed and auditable. The risk applies to consumer-tier tools used outside approved corporate channels. Banks enforce this via DLP: Restricted label → block copy to non-approved AI endpoints.'},
            {type:'callout', variant:'info', title:'&#128161; RAG Architecture and Classification Governance',
              body:'<strong>RAG (Retrieval-Augmented Generation)</strong> is the dominant enterprise GenAI architecture. Instead of the LLM relying only on training data, it first <em>retrieves</em> relevant documents from a knowledge base, then generates a response using those documents as context.<br><br>This is a classification problem: the knowledge base is a set of documents with classification labels. A RAG system that can retrieve Restricted customer data in response to a query from an unauthorised user is a data governance failure AND an AI Act compliance issue.<br><br>The question to ask before every RAG deployment: <em>"Has every document in this retrieval index been classified, and is the label consistent with the access level of the users who will query the system?"</em>'},
          ]
        },
      ]}]
    },
    {
      id: 'code', label: '&#128187; Code Examples',
      sections: [
        {type:'p', text:'The three most interview-relevant technical examples in AI/ML classification work.'},
        {type:'code', lang:'python', title:'1 — NER with spaCy: extracting PII from unstructured text', caption:'This is the technique classification tools use internally. NER is the precise term to use in interviews.', code: ner_example},
        {type:'code', lang:'python', title:'2 — Precision, Recall, and F1: calculating the metrics', caption:'Calculate these from first principles. Know the banking priority: high recall over high precision.', code: metrics},
        {type:'code', lang:'python', title:'3 — RAG governance checklist', caption:'The classification questions every bank must answer before deploying a RAG-based AI system.', code: rag_governance},
      ]
    },
    {
      id: 'projects', label: '&#127891; Projects',
      sections: [
        {type:'h2', text:'Mini Projects'},
        {type:'html', content:`
<div class="project-card">
  <div class="project-header"><div class="project-title">7.1 — Precision vs Recall Trade-off</div><div class="project-time">~15 min</div></div>
  <div class="project-tags"><span class="tag">Metrics</span><span class="tag">Threshold Analysis</span></div>
  <p>The scanner labelled 120 columns as PII. Of those 120, 95 were actually PII. The dataset actually contained 150 PII columns. (1) Calculate precision, recall, and F1. (2) If you lower the confidence threshold from 0.85 to 0.70, you capture 20 more PII columns but add 30 false positives. Is this a good trade-off for a bank? (3) What would you recommend to the compliance team?</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">7.2 — Spot the Bias</div><div class="project-time">~15 min</div></div>
  <div class="project-tags"><span class="tag">Model Bias</span><span class="tag">AI Act</span><span class="tag">Cross-border</span></div>
  <p>A classification model was trained entirely on UK bank data. It is now being deployed in the bank's German and Spanish subsidiaries. List 5 specific ways the model might perform differently. What would you check first? What documentation does the AI Act require before this deployment?</p>
</div>
<div class="project-card">
  <div class="project-header"><div class="project-title">7.3 — GenAI Governance Policy (Capstone)</div><div class="project-time">~25 min</div></div>
  <div class="project-tags"><span class="tag">GenAI</span><span class="tag">RAG</span><span class="tag">Policy Design</span></div>
  <p>Write a short internal policy governing GenAI use at a UK retail bank. Address: (1) Which classification tiers may be used with external AI tools? Which are banned? (2) What is the difference between approved enterprise AI (Azure OpenAI, M365 Copilot Enterprise) and unsanctioned consumer tools? (3) Before deploying an internal RAG system, what classification questions must be answered? (4) What DLP rules enforce this policy technically?</p>
</div>`}
      ]
    },
    {
      id: 'quiz', label: '&#129300; Quiz',
      sections: [
        {type:'h2', text:'Knowledge Check'},
        {type:'quiz', questions:[
          {q:'A classification model scanned 200 columns. It labelled 80 as PII. Of those 80, 60 were actually PII. The dataset contained 100 actual PII columns. What are the precision and recall?',
           options:['Precision: 75%, Recall: 60%','Precision: 60%, Recall: 75%','Precision: 80%, Recall: 60%','Precision: 60%, Recall: 80%'],
           correct:0, explanation:'Precision = 60/80 = 75% (of everything I labelled PII, 75% was). Recall = 60/100 = 60% (I found 60% of all actual PII). In banking, the low recall (40% of PII was missed) is the more serious problem — those 40 missed columns could be a regulatory breach.'},
          {q:'What is NER and why is it the precise term to use in interviews when discussing PII detection?',
           options:['Network Encryption Routing — how classification labels travel between systems','Named Entity Recognition — the NLP technique that identifies and classifies named entities (people, financial amounts, national IDs) in text. More specific than just "NLP."','Non-Exclusive Rights — the legal basis for processing','Neural Entity Resolution — how the AI resolves synonyms'],
           correct:1, explanation:'NER (Named Entity Recognition) is the specific ML technique that extracts person names, financial identifiers, national IDs, and other entities from unstructured text. Saying "the tool uses NER" is precise and impressive; "it uses AI" or "it uses NLP" is vague and forgettable.'},
          {q:'Why is the F1 score preferred over a simple average of precision and recall?',
           options:['F1 is easier to calculate','The harmonic mean punishes extreme imbalances — a model with 100% precision but 10% recall gets F1=0.18, not 55%. This reflects the real danger of a model that is precise but misses most PII.','F1 is required by GDPR','F1 is always between 0 and 1, whereas averages can exceed 1'],
           correct:1, explanation:'The harmonic mean penalises extreme imbalances. A spam filter that marks everything as spam has 100% recall but 50% precision — a simple average would be 75%, which sounds acceptable. The F1 score would be ~67%, which more accurately reflects the model\'s poor overall performance. For PII detection, this distinction matters when calibrating human review thresholds.'},
          {q:'An employee pastes customer data into a free consumer-tier ChatGPT account to help draft a report. What is the data governance risk?',
           options:['None — ChatGPT does not store data','The data may be sent outside the bank\'s control, potentially retained by the provider, and cannot be reliably deleted. Consumer tier ≠ enterprise API contract.','This is a PCI DSS violation only','The risk only applies if the data was Highly Restricted'],
           correct:1, explanation:'Consumer-tier tools do not have the contractual protections of enterprise API agreements (Azure OpenAI, AWS Bedrock, M365 Copilot Enterprise explicitly prohibit using customer data for training). Once data is submitted to a consumer tool, the bank loses control. This is governed by DLP: classification label → block copy to non-approved AI endpoints.'},
          {q:'A bank wants to deploy an internal RAG system where employees can query a knowledge base of internal documents. What is the critical classification question to answer first?',
           options:['Which LLM model to use','What is the response time requirement','Has every document in the retrieval index been classified, and is every document\'s label consistent with the access level of all users who will query the system?','Does the system need a DPIA?'],
           correct:2, explanation:'A RAG system without classification governance at the document level will return Restricted content to unauthorised users in response to queries. The LLM generates responses from retrieved documents — if the retrieval index contains classified material accessible to users who are not authorised to see it, every query is a potential data governance failure. Classification of every document in the knowledge base is a prerequisite.'},
        ]}
      ]
    }
  ]
});
};
