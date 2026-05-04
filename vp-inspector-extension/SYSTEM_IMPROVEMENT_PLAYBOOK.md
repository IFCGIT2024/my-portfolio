# System Improvement Playbook

This document is the opinionated version of the strategy. The main goal is not to make the system more complex. The main goal is to make it more useful, more reliable, and easier to monetize.

The current risk is obvious: the system can become a very smart machine for producing activity, documents, scores, and agents, but still fail to create revenue or trustworthy outputs. The fix is to design the system around one hard business question:

What new, trustworthy, actionable insight did we produce this week that somebody would pay for?

If a feature, agent, or process does not make that answer stronger, it should stay out of scope.

---

## My View

The system should improve in five ways before it expands in ten directions.

1. It should become more trustworthy.
2. It should become more explainable.
3. It should become more segment-specific.
4. It should become more operationally simple.
5. It should become more directly monetizable.

That means the next version of this platform should not start with a giant autonomous swarm. It should start with a tight operating loop that can repeatedly turn raw listing data into one of these outputs:

- a ranked deal list
- a segment-specific alert
- a one-page property brief
- a useful market signal
- a warm introduction opportunity

That is the real product surface.

---

## What I Would Improve First

### 1. Move From Raw Data To Trusted Derived Data

Raw fields are not the value. Derived judgments are the value.

The system should prioritize generating these repeatable outputs for every listing:

- `assessment_ratio`
- `price_per_sqft`
- `relist_count`
- `dom_total`
- `sale_to_list_ratio_last_sale`
- `price_drop_total`
- `bank_owned_flag`
- `municipal_services_flag`
- `rural_risk_flag`
- `development_potential_flag`
- `buyer_segment_tags`
- `deal_score`
- `confidence_score`

The important addition here is `confidence_score`.

If the system is missing many relevant fields for a property, it should say so directly. A high deal score with low confidence is not a high-quality lead. This prevents the system from overclaiming on noisy or incomplete listings.

### 2. Add Explainability Everywhere

Every score should be decomposed into reasons.

For example:

```text
Deal Score: 78
- Listed below current assessment: +25
- Relisted 3 times: +20
- DOM above 90: +15
- Views above threshold: +10
- Stone foundation and age above 100 years: -10
- Septic/well service risk: -5
Confidence Score: 81
```

This makes the tool far more sellable to investors, agents, and lenders because they can disagree with the model without distrusting the platform.

### 3. Split Insights By Customer Instead Of One Global Feed

One generic "best deals" feed is weaker than several focused feeds.

The system should publish separate outputs for:

- investor leads
- flipper leads
- developer leads
- buyer value leads
- lender risk signals
- bank-owned alerts

Each segment should have its own scoring template, thresholds, and language. A developer does not care about the same signals as an owner-occupier. A lender does not care about the same signals as a flipper.

### 4. Build A Human Override Layer

The platform should not be fully autonomous in decision-making. It should be autonomous in preparation.

The best operating model is:

```text
agents prepare -> agents rank -> agents explain -> human approves -> system delivers
```

This is especially important for:

- outbound messages
- deal introductions
- public-facing pricing claims
- segment recommendations
- new scoring logic

The human should remain the approval layer for anything that can create legal, reputational, or revenue consequences.

### 5. Treat Feedback As A Product Input, Not A Note

Feedback has to be formalized, not just remembered.

The system should capture feedback in structured buckets:

- Was the lead relevant?
- Was the score directionally right?
- What was missing?
- Would the user pay for this?
- Did this result in a meeting, intro, or deal?
- Which explanation elements increased trust?

These should feed directly back into score weights, segment definitions, and future data acquisition.

---

## The Best Version Of The Agent System

The best version is smaller than it first appears.

You do not need a large permanent swarm on day one. You need a small set of core agents that own durable operating functions, then a few optional evaluators that run only when needed.

### Recommended Agent Structure

Start with 5 core agents and 3 optional evaluators.

#### Core agents

1. `orchestrator`
2. `collector`
3. `analyst`
4. `publisher`
5. `auditor`

#### Optional evaluators

6. `customer-simulator`
7. `strategy-researcher`
8. `builder-planner`

This is enough to operate the system without building too much coordination overhead.

---

## Agent Scope Design Principles

Agent scope should be defined by responsibility, not topic area alone.

Use these rules:

1. One agent should own one outcome.
2. Each agent should have a clear input contract.
3. Each agent should have a clear output contract.
4. No agent should both grade and approve its own work.
5. Expensive reasoning agents should run only when the cheap deterministic path fails.
6. Agents should prefer structured outputs over long prose.
7. Agents should write artifacts that other agents can consume without reinterpretation.

Bad scope example:

```text
"Market intelligence agent" that scrapes, analyzes, scores, writes emails, and proposes pricing.
```

Good scope example:

```text
"Analyst agent" that reads normalized property data, computes derived metrics, scores properties, and writes enriched outputs.
```

---

## Recommended Core Agents

### 1. Orchestrator

Purpose:
Route work, enforce dependencies, trigger schedules, maintain run state.

Primary output:
- task queue state
- run logs
- failure escalation

Draft instruction set:

```text
You are the Orchestrator.

Your job is to decide what should run next, based on the state of the system.

Rules:
1. Never run analysis until collection succeeds.
2. Never run publishing until audit succeeds.
3. Retry failed steps up to 3 times.
4. If a failure repeats, escalate to the human operator with context.
5. Keep all run logs concise and structured.
6. Prefer deterministic scripts over LLM reasoning when possible.
7. Write next-step recommendations after every run.

Your outputs must always include:
- current run id
- current stage
- outcome status
- next action
- blocking issues
```

### 2. Collector

Purpose:
Run scrapers, refresh datasets, diff new vs removed listings, detect refresh failures.

Primary output:
- fresh CSVs
- change reports
- raw scrape status

Draft instruction set:

```text
You are the Collector.

Your job is to ensure listing data is fresh and complete.

Rules:
1. Run the lightest refresh first.
2. Verify row counts against the last successful run.
3. Flag suspicious drops, spikes, or missing columns.
4. Produce change artifacts: new, removed, updated, price-changed.
5. Do not claim success if row count or error rate is abnormal.
6. Save diagnostics that can be reviewed later.

Your outputs must always include:
- source files updated
- row counts
- diff summary
- error summary
- recommendation to continue or halt
```

### 3. Analyst

Purpose:
Turn raw data into metrics, scores, segments, and summaries.

Primary output:
- enriched database or CSV
- deal scores
- segment tags
- explanation fields

Draft instruction set:

```text
You are the Analyst.

Your job is to convert raw property records into scored opportunities.

Rules:
1. Compute all derived metrics using reproducible formulas.
2. Keep raw fields separate from derived fields.
3. Produce a score explanation for every listing.
4. Produce a confidence score for every listing.
5. Tag listings by segment fit using explicit rules.
6. Flag exceptional opportunities and exceptional uncertainties.
7. Do not fabricate missing values.

Your outputs must always include:
- deal_score
- confidence_score
- score_reason_breakdown
- segment_tags
- anomaly_flags
```

### 4. Publisher

Purpose:
Turn insights into deliverables for specific audiences.

Primary output:
- investor digest
- developer watchlist
- lender risk summary
- single-property brief

Draft instruction set:

```text
You are the Publisher.

Your job is to transform verified analysis into useful audience-specific outputs.

Rules:
1. Never publish unverified numbers.
2. Always use audience-specific language.
3. Highlight why this matters now.
4. Keep every recommendation tied to actual fields or derived metrics.
5. Include uncertainty when the confidence score is low.
6. Always propose the next useful action for the reader.

Your outputs must always include:
- audience segment
- top insight
- supporting facts
- confidence qualifier
- call to action
```

### 5. Auditor

Purpose:
Quality gate. Detect scraper drift, scoring weirdness, null spikes, duplication, broken outputs.

Primary output:
- pass/fail gate
- audit report
- anomalies for human review

Draft instruction set:

```text
You are the Auditor.

Your job is to block low-trust outputs from moving downstream.

Rules:
1. Check row count stability.
2. Check null rates for critical fields.
3. Check duplicates and malformed URLs.
4. Spot-check live records against scraped values.
5. Check score distributions for collapse or drift.
6. Fail the run if critical trust thresholds are violated.
7. Explain failures concretely and minimally.

Your outputs must always include:
- pass_or_fail
- critical_failures
- warnings
- trust_score
- recommended remediation
```

---

## Optional Evaluator Agents

These should not run every day. They are advisory.

### Customer-Simulator

Purpose:
Review outputs as an investor, lender, agent, flipper, or developer.

Best use:
- when refining segment-specific outputs
- before pricing a product tier
- before launching a new report

Draft instruction set:

```text
You are simulating a target customer.

Read the provided output exactly as that customer would.
Be critical and practical.

Always answer:
1. What is useful here?
2. What is missing?
3. What would make this worth paying for?
4. What would make me distrust this?
5. What exact improvement should be made next?
```

### Strategy-Researcher

Purpose:
Find new data sources, new monetization ideas, new segment opportunities, and competitive gaps.

Best use:
- weekly or monthly
- only after core pipeline is stable

Draft instruction set:

```text
You are the Strategy Researcher.

Your job is to identify the next highest-leverage way to increase value.

Always answer:
1. Which new data source is worth integrating next?
2. Which customer segment is under-served?
3. Which product surface has the best monetization potential?
4. Which current effort is low ROI and should be deprioritized?
5. What one experiment should run next week?
```

### Builder-Planner

Purpose:
Convert strategic ideas into implementation plans with dependencies, test points, and rollout stages.

Best use:
- before starting a new feature or product surface

Draft instruction set:

```text
You are the Builder Planner.

Your job is to turn ideas into buildable plans.

Always produce:
- scope boundaries
- assumptions
- dependencies
- implementation steps
- test plan
- rollout plan
- rollback plan
```

---

## Best Setup For These Agents

The best setup is boring.

Avoid fancy infrastructure until the platform proves it can produce recurring value.

### Recommended setup order

#### Phase 1: Single-machine local system

- Python scripts for scraping and analysis
- SQLite for structured data
- JSON files for agent state
- Windows Task Scheduler or cron-equivalent for scheduling
- One orchestrator process
- Claude or other LLM API only where reasoning actually matters

This is enough to build and validate the system.

#### Phase 2: Lightweight service layer

- small FastAPI service for orchestrator endpoints
- SQLite or Postgres if concurrent writes become annoying
- object storage only if artifacts become large
- background task runner only if schedule complexity increases

#### Phase 3: Revenue-ready service

- hosted API
- auth
- billing
- email automation
- dashboard
- monitored jobs

Do not start here.

---

## Operating Loops

### Value loop

```text
collect -> score -> explain -> segment -> deliver -> feedback -> improve
```

### Trust loop

```text
collect -> audit -> compare -> repair -> publish
```

### Expansion loop

```text
new data source -> new metric -> new segment -> new product -> new revenue
```

### Build loop

```text
hypothesis -> pilot -> validate -> simplify -> scale
```

### Agent loop

```text
task intake -> scoped execution -> structured output -> audit -> handoff
```

---

## What I Would Not Do Yet

1. I would not build a huge persistent multi-agent mesh on day one.
2. I would not use expensive models for deterministic tasks.
3. I would not let content agents publish directly without audit.
4. I would not build a fancy dashboard before the scoring logic is trusted.
5. I would not chase too many customer segments at once.
6. I would not expand geographies before one market is producing usable outputs.

---

## The Best Practical Path From Here

1. Finish the data pipeline and make it stable.
2. Build `load_db.py` and create a clean SQLite model.
3. Build `score.py` with explanation and confidence outputs.
4. Build the Auditor checks before broad distribution.
5. Create one segment-ready output first: investor deal brief.
6. Test it with real humans.
7. Capture feedback in a structured file.
8. Only then add more agents, more segments, and more automation.

---

## Success Criteria

The system is improving if these become true:

- outputs are more trusted over time
- explanations become shorter and clearer
- false positives go down
- segment relevance goes up
- more insights are reusable across products
- one weekly output is strong enough that a real user wants it again
- one segment begins converting into conversations, introductions, or money

That is the operating standard the agent system should serve.