# Low-Cost Agent Infrastructure Guide

This document lays out the cheapest realistic ways to run the system, from near-zero-cost local automation to a small hosted setup that can support paying users.

The key principle is simple:

Use expensive LLM reasoning only where it creates leverage. Everything else should be scripts, schedules, SQLite, and files.

---

## Cheapest Sensible Architecture

The cheapest sensible architecture is:

- local Python scripts
- SQLite
- JSON state files
- Windows Task Scheduler
- one orchestrator script
- one reasonably priced LLM model for reasoning tasks

That stack is enough to do all of the following:

- scrape listings
- normalize data
- compute scores
- generate reports
- run lightweight agents
- draft emails
- manage a task queue

It also avoids paying for infrastructure you do not need yet.

---

## Cost Philosophy

Spend money in this order:

1. storage and reliability only when needed
2. reasoning tokens only where logic is ambiguous
3. delivery infrastructure only when there are real users
4. production hosting only when a local system becomes operationally painful

Do not spend money on:

- Kubernetes
- vector databases before you need semantic retrieval
- queue systems before file-based tasks become a real bottleneck
- managed workflow tools before you actually have workflow complexity
- premium models for scraping, file moves, or deterministic transforms

---

## Option Matrix

## Option 1: Ultra-Lean Local Stack

Best for:
- proving the concept
- one operator
- low monthly cost

Stack:
- Python
- SQLite
- JSON / CSV / JSONL files
- Windows Task Scheduler
- Anthropic Claude Sonnet or GPT-class model only for reasoning steps
- Resend or plain SMTP later for emails

Monthly cost estimate:
- hosting: $0
- database: $0
- scheduler: $0
- storage: $0
- LLM usage: roughly $10 to $50 depending on volume
- email: $0 to low single digits initially

Strengths:
- cheapest possible
- easiest to understand and debug
- fastest to build
- perfect for internal use and early testing

Weaknesses:
- not ideal for multiple users at once
- weaker durability if the machine is off
- manual operations risk is higher

Recommendation:
This is the correct starting point.

---

## Option 2: Lean Hosted Single-Service Stack

Best for:
- light production use
- one internal operator plus a few external users
- reliable scheduled jobs

Stack:
- FastAPI
- SQLite or Postgres
- Railway / Render / Fly.io / small VPS
- cron or platform scheduler
- file storage for artifacts
- same LLM provider setup

Monthly cost estimate:
- hosting: $5 to $25
- database: $0 to $15
- storage: negligible
- LLM usage: $20 to $100 depending on frequency and model
- email: $0 to $20 depending on list size

Strengths:
- reliable uptime
- easier to expose an API or dashboard
- simple deployment story
- still very cheap

Weaknesses:
- slightly more ops overhead
- you now have to think about deployment and secrets

Recommendation:
Move here only after the local system proves useful.

---

## Option 3: Managed Workflow + Hosted App Stack

Best for:
- more complex automation
- more external users
- multi-step branching workflows

Stack:
- hosted API app
- Postgres
- background worker
- queue
- workflow engine like Temporal, Prefect, or lightweight alternatives
- LLM provider abstraction

Monthly cost estimate:
- hosting and DB: $30 to $150+
- LLM: $50 to $300+
- email and observability: extra

Strengths:
- better failure handling
- easier scaling
- cleaner long-running jobs

Weaknesses:
- too much too early for a proof of concept
- more engineering time
- higher fixed cost before revenue

Recommendation:
Do not start here unless external demand already exists.

---

## LLM Infrastructure Options

## Option A: Single premium reasoning model

Examples:
- Claude Sonnet
- GPT mid-tier reasoning model

Use for:
- orchestration
- research
- content drafting
- evaluator agents
- strategy analysis

Do not use for:
- scraping
- CSV transforms
- database loading
- row counting
- basic math that Python can do directly

Why it is cheap enough:
- most runs are short
- most work is deterministic and should not hit the model
- a single model avoids routing complexity

Best starting choice:
- one strong mid-priced model

---

## Option B: Two-tier model routing

Examples:
- cheap model for summarization and formatting
- better model for strategy and ambiguous judgment

Use pattern:
- cheap model handles formatting, summaries, boilerplate, first-pass classification
- stronger model handles scoring logic review, market interpretation, product strategy, customer simulation

Strengths:
- lower blended cost
- good if token volume rises

Weaknesses:
- more routing logic
- more failure modes
- more prompt management

Recommendation:
Good second step, not first step.

---

## Option C: Mostly local or open-weight models

Examples:
- local Llama-class models
- Ollama-based setup
- quantized open models

Use for:
- classification
- summarization
- first-pass extraction
- offline experiments

Avoid using for:
- legal/strategy reasoning
- customer-facing messaging without review
- complex orchestration decisions early on

Strengths:
- near-zero marginal cost after setup
- privacy control

Weaknesses:
- higher setup effort
- lower reliability for high-judgment work
- harder tool-use workflows

Recommendation:
Useful later for cheap batch tasks, but not the best first operating core.

---

## Cheapest Agent Execution Pattern

The cheapest execution pattern is not "many agents talking all the time."

It is this:

1. deterministic script runs first
2. if output passes thresholds, no LLM is called
3. if interpretation or communication is needed, call one agent
4. if review is needed, call one critic agent
5. save outputs for reuse

That reduces token spend dramatically.

### Example

Bad pattern:

```text
collector agent reads CSV -> analyst agent re-reads CSV -> summarizer agent re-reads CSV -> strategist agent re-reads CSV
```

Cheap pattern:

```text
Python loads CSV once -> computes metrics -> writes compact summary JSON -> only then LLM reads summary JSON
```

This is a major cost reducer.

---

## Cheapest State Management Options

## Option 1: Files only

Use:
- `pipeline_status.json`
- `task_queue.json`
- `feedback_log.jsonl`
- `run_history.jsonl`

Cost:
- effectively free

Best for:
- single-machine operation
- easy inspection

Recommendation:
Use this first.

## Option 2: SQLite

Use:
- tasks
- runs
- artifacts metadata
- enriched property tables

Cost:
- free

Best for:
- richer querying
- concurrent reads
- better history and debugging

Recommendation:
Use SQLite for data tables, files for light state, or move all of it to SQLite if you want one source of truth.

## Option 3: Postgres

Use when:
- multiple services write concurrently
- remote hosting is permanent
- auth and external users are involved

Cost:
- low but non-zero

Recommendation:
Only after the app becomes multi-user or hosted full-time.

---

## Cheapest Scheduling Options

### Windows Task Scheduler

Cost:
- free

Best for:
- local machine jobs
- daily/weekly routines

Recommendation:
Use immediately.

### Cron on a small VPS

Cost:
- VPS cost only

Best for:
- always-on hosted jobs

Recommendation:
Good next step if local uptime is inconvenient.

### Managed workflow schedulers

Cost:
- higher

Recommendation:
Delay until workflow complexity actually hurts.

---

## Cheapest Email / Delivery Options

### Manual send + generated content

Cost:
- free

Best for:
- first validation with a few investors or agents

Recommendation:
Best first move. Do not automate distribution before you know what people care about.

### Resend

Cost:
- low

Best for:
- transactional and light newsletter delivery

Recommendation:
Excellent early choice.

### Mailchimp / ConvertKit / Beehiiv

Cost:
- free tiers then paid growth

Best for:
- marketing automation
- subscriber management

Recommendation:
Adopt only when email list growth becomes real.

---

## Cheap Agent Hosting Patterns

## Pattern 1: No agent server, just Python wrappers

Architecture:
- local scripts call the LLM API directly
- outputs saved to files or SQLite
- orchestrator is a Python script

Why this is cheap:
- no additional runtime layer
- no extra deployment surface

Best for:
- current stage

## Pattern 2: One small API service for orchestration

Architecture:
- FastAPI app exposes endpoints like `/run-daily`, `/run-weekly`, `/generate-digest`
- local or hosted scheduler hits those endpoints

Why this is cheap:
- one service, one deployment
- easier to trigger remotely

Best for:
- next stage after local proof

## Pattern 3: Full multi-worker service mesh

Architecture:
- orchestrator service
- worker service
- queue
- DB
- scheduler

Why this is not cheap:
- too many moving pieces

Recommendation:
Avoid until recurring revenue clearly justifies it.

---

## How To Keep Token Costs Low

1. Summarize before you send to the model.
2. Use structured JSON inputs, not entire CSV files.
3. Cache agent outputs by run id.
4. Reuse previous research artifacts.
5. Only run evaluator agents on sampled outputs.
6. Only run strategy agents weekly, not on every scrape.
7. Only run customer simulation before launches or pricing changes.
8. Use deterministic filters to shortlist properties before LLM review.
9. Keep prompts short, strict, and role-specific.
10. Make agents return structured objects instead of long essays.

---

## Cheapest Recommended Stack By Phase

### Phase 0: Now

- local machine
- Python
- SQLite
- JSON state files
- Task Scheduler
- one strong mid-priced LLM
- manual email sending

Likely monthly cost:
- $10 to $40

### Phase 1: Stable internal tool

- local or tiny hosted FastAPI app
- SQLite or small Postgres
- Resend
- same agent architecture

Likely monthly cost:
- $20 to $80

### Phase 2: Early paid product

- hosted API app
- small DB
- scheduler
- auth
- Stripe
- email provider
- possibly two-tier model routing

Likely monthly cost:
- $50 to $200 depending on usage

---

## Recommended Cheap Build Path

If the goal is to get to value fast and cheaply, this is the sequence I would use:

1. run everything locally first
2. keep agent state in files or SQLite
3. use one LLM model only where reasoning matters
4. do not automate distribution until human-tested insights exist
5. build one high-trust segment output first
6. charge manually before building polished infrastructure
7. only host when uptime or sharing becomes a real bottleneck

---

## Final Recommendation

The cheapest serious version of this system is not a cloud-native agent platform.

It is a disciplined local intelligence engine:

- Python does the data work
- SQLite stores the truth
- files store the workflow state
- one orchestrator coordinates the steps
- one reasonably priced LLM handles interpretation and communication
- the human approves anything important

That setup is cheap, understandable, fast to build, and strong enough to prove whether this business has real signal before you spend more.