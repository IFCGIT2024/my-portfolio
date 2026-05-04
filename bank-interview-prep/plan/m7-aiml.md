# MODULE 7: AI/ML in Classification

## Goal
AI/ML is both the *mechanism* behind automated classification and an increasingly important *risk area* that must itself be governed. By the end of this module, a learner should be able to explain how ML classifiers work at a conceptual level, understand their limitations in banking, and speak intelligently about GenAI governance risks.

---

## Part 1 — What is Machine Learning (Without the Jargon)?

**The core idea:**
Machine learning is pattern recognition from examples. Instead of writing rules ("if column name contains 'email', label as PII"), you show the system thousands of examples of PII and non-PII, and it learns to distinguish them automatically.

**Why rules alone fail for classification:**
- A column called `ref` might contain customer references (Confidential) or internal transaction references (Internal). The name gives you no clue — the context does.
- PII can be in unexpected places — free text comments, log files, PDF metadata
- New data types emerge faster than anyone can write rules

ML fills these gaps. It generalises from examples to new, unseen cases.

---

## Part 2 — The Key Concepts

**Training vs inference:**
- **Training:** showing the model labelled examples and letting it learn patterns. Modern ML pipelines do not train once — they use **MLOps (Machine Learning Operations)**, a practice where models are retrained continuously as new labelled data accumulates. This handles data drift (real-world patterns shift over time) and improves accuracy as the model sees more examples. Training is computationally expensive and happens in scheduled jobs, not during scanning.
- **Inference:** using the trained model to classify new, unseen data. Happens in real time, continuously, as data is scanned. Computationally lightweight compared to training.

**NLP — Natural Language Processing:**
The ML subfield that handles text. Within NLP, several specific techniques are used in classification work:

**NER — Named Entity Recognition** is the key technique for PII detection. NER models identify and classify named entities in text: people, organisations, locations, dates, financial amounts, national identifiers. When a classification tool reads the sentence "Please send £5,000 to Jane Smith at account 12345678" and identifies `£5,000` as a financial amount, `Jane Smith` as a person name, and `12345678` as an account number — that is NER. Use this term in interviews. Saying "the tool uses NLP" is vague; saying "the tool uses NER models to extract person names and financial identifiers" is precise.

**Semantic understanding:** Models also learn that "DOB", "date of birth", and "birth_date" all refer to the same concept — not through rules, but through training on vast labelled datasets. This synonym/ontology resolution is what allows context-aware classification to generalise beyond exact column name matching.

NLP/NER powers:
- Entity extraction from free-text fields, emails, and documents
- Topic classification (is this a credit application or an HR file?)
- Synonym resolution ("NI number" = "National Insurance number" = "NINO")
- Confidence scoring based on linguistic context, not just pattern matching

**Precision vs Recall — the key trade-off:**
- Precision: of everything I labelled as PII, what percentage actually IS PII? (Avoid false positives)
- Recall: of all actual PII, what percentage did I find? (Avoid false negatives — missed PII)

In banking, high recall is usually prioritised. A false positive (labelling non-PII as PII) costs effort in review. A false negative (missing real PII) costs a regulatory fine.

**F1 score — the single summary metric:**
When you need one number to evaluate a classifier, use the F1 score. It is the harmonic mean of precision and recall:

$$F1 = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

The harmonic mean punishes extreme imbalances: a model with 100% precision but 10% recall gets an F1 of ~0.18, not 55%. This is why F1 is preferred over a simple average for classification evaluation. In any technical question about "how do you measure a classification model", F1 should be your first answer.

**Confidence scores:**
ML models do not say "this is PII." They say "I am 94% confident this is PII." The confidence score determines whether human review is needed. Banks typically set thresholds like:
- >90%: auto-accept label
- 70–90%: queue for human review
- <70%: investigate and manually classify

---

## Part 3 — Bias in Classification Models

**Why bias matters in banking:**
If a classification model is trained predominantly on data from one region, one language, or one data format — it will be less accurate on data that looks different. A model trained on English PII patterns may miss Arabic names or Korean phone number formats.

**The regulatory angle:**
The EU AI Act explicitly requires high-risk AI systems (which include data classification systems used in financial services) to address bias in training data. Banks must document:
- What data was used to train classification models
- What groups are represented
- What accuracy differences exist across groups

**What to do about it:**
- Diverse training data (multiple languages, regions, data formats)
- Regular accuracy audits by segment
- Human review for edge cases

---

## Part 4 — GenAI in Banking (2026 Context)

**The risk:**
GenAI tools (Copilot, Claude, GPT-4, internal LLMs) are being deployed rapidly. They are incredibly useful. They are also a new and poorly-governed data access channel.

When an employee pastes a customer record into an *unsanctioned* consumer GenAI tool (free-tier ChatGPT, personal Copilot, etc.), that data:
- May be sent to a third-party API outside the bank's control
- May be retained in the provider's systems and potentially used for model improvement
- Cannot be reliably deleted once submitted

**Important distinction:** Enterprise API contracts (Azure OpenAI Service, AWS Bedrock, Google Vertex AI, Microsoft 365 Copilot Enterprise) explicitly prohibit the provider from using customer data for training or model improvement — this is contractually guaranteed and auditable. The risk described above applies specifically to *unsanctioned* consumer-tier tools used outside approved corporate channels. Banks should enforce this distinction through DLP policies that block data submission to non-approved AI endpoints.

Banks have not uniformly caught up with this risk. The regulatory framework for governing GenAI data access is still being developed, and banks are at different stages of maturity. Classification is one of the key tools:
- Label all data. High-sensitivity data cannot be pasted into unsanctioned AI tools.
- Enforce via DLP: Restricted label → block copy to non-approved AI endpoints.

**The opportunity:**
GenAI also helps *with* classification:
- LLMs can understand context better than regex patterns
- GenAI can classify free text, images (with multimodal models), and complex documents
- Copilot for Purview can explain classification decisions in plain English

**RAG — Retrieval Augmented Generation (must-know for 2026 interviews):**
RAG is the dominant architecture for enterprise GenAI deployments in banking. Instead of the LLM relying only on its training data, it first *retrieves* relevant documents from a knowledge base, then *generates* a response using those documents as context. Examples: an internal policy assistant that retrieves compliance documents, or a customer service agent that retrieves account history.

Why this is a classification problem: a RAG system's knowledge base is a curated set of documents or data chunks. Classification determines which documents are permitted in that knowledge base — and therefore what the AI can access, cite, and reason about.

The governance question every bank should be asking before deploying a RAG system: *"Has every document in this retrieval index been classified, and is the label consistent with the access level of the users who will query the system?"* A RAG system that can retrieve Restricted customer data in response to a query from a user who is not authorised to see that data is a data governance failure and an AI Act compliance issue.

In an interview about GenAI governance at a bank, connecting RAG architecture to classification is one of the most impressive answers you can give.

---

## Part 5 — Mini Projects

**Project 7.1 — "Precision vs Recall Trade-off"**
Given a classification system that scanned 1,000 columns. It labelled 120 as PII. Of those 120, 95 were actually PII. The dataset actually contained 150 PII columns. Calculate precision and recall. If you lower the confidence threshold from 0.85 to 0.70, you capture 20 more PII columns but add 30 false positives. Is this a good trade-off for a bank? Justify your answer.

**Project 7.2 — "Spot the bias"**
A classification model was trained on UK bank data. It is now being deployed in the bank's German and Spanish subsidiaries. List 5 specific ways the model might perform differently. What would you check first?

**Project 7.3 — "GenAI governance policy"**
Write a short (one-page equivalent) internal policy for a bank governing the use of GenAI tools. Address: what data classifications may be used with external AI tools, what is banned, what monitoring is required.
