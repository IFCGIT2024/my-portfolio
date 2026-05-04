# Multi-Agent System Design — NS Real Estate Intelligence Platform

---

## OVERVIEW

This document defines the full agent architecture for autonomously running,
iterating, and expanding the real estate intelligence pipeline. Each agent has
a defined scope, a set of tools, clear inputs/outputs, and reports to the
Orchestrator. Agents communicate through shared state files and a task queue.

This is designed to run on the **Anthropic Claude API** (claude-sonnet or
claude-opus) using the **tool use / function calling** pattern. No special
"Agents API" is required — each agent is a Claude API call with a system
prompt, a set of tools, and access to shared state. The Orchestrator chains
them together.

---

## AGENT ARCHITECTURE DIAGRAM

```
                        ┌─────────────────────┐
                        │   ORCHESTRATOR      │
                        │   (Master Agent)    │
                        │   Schedules, tracks,│
                        │   delegates, retries│
                        └──────────┬──────────┘
                                   │
          ┌──────────┬─────────────┼──────────────┬────────────┐
          │          │             │              │            │
    ┌─────▼───┐ ┌────▼────┐ ┌─────▼──┐ ┌────────▼──┐ ┌──────▼──────┐
    │ DATA    │ │ANALYSIS │ │CONTENT │ │ CUSTOMER  │ │   QA /      │
    │COLLECTOR│ │ AGENT   │ │ AGENT  │ │PERSPECTIVE│ │ VALIDATOR   │
    │         │ │         │ │        │ │  AGENTS   │ │   AGENT     │
    └─────────┘ └─────────┘ └────────┘ └───────────┘ └─────────────┘
                                │
                        ┌───────▼────────┐
                        │  STRATEGY      │
                        │  AGENT         │
                        │ (runs weekly)  │
                        └────────────────┘
```

---

## SHARED STATE — THE AGENT MEMORY SYSTEM

All agents read from and write to a shared directory:

```
/agent_state/
  orchestrator_log.jsonl      — every task dispatched + result
  task_queue.json             — pending tasks with priority + assigned agent
  pipeline_status.json        — current phase of each pipeline section
  data_quality_report.json    — latest QA agent output
  score_weights.json          — current deal scoring weights (tunable)
  segment_definitions.json    — current segment criteria
  feedback_log.jsonl          — human feedback, email open rates, conversions
  strategy_notes.jsonl        — strategy agent's weekly findings
  agent_errors.jsonl          — all errors with context for retry/debug
```

This is simple JSON/JSONL — no database needed at first. Agents read the
files they need, write their outputs, and the Orchestrator moves to the next
step. This pattern is called a **blackboard architecture**.

---

## AGENT 0 — THE ORCHESTRATOR

### Role
The master controller. Runs on a schedule (cron or manual trigger). Reads
pipeline_status.json, determines what needs to run, dispatches tasks to
sub-agents in the right order, tracks completion, and handles failures.

### System Prompt (Core)
```
You are the Orchestrator for an automated real estate intelligence system.
Your job is to:
1. Read the current pipeline status
2. Determine which agents need to run and in what order
3. Dispatch tasks with full context
4. Verify outputs meet quality thresholds
5. Retry failed tasks (max 3 attempts) with adjusted instructions
6. Log every decision with timestamp and reasoning
7. Alert the human operator if any stage fails 3 times

Always be explicit about WHY you are making each scheduling decision.
Current date/time and pipeline status will be provided in each call.
```

### Tools Available
- `read_state(file)` — read any /agent_state/ file
- `write_state(file, content)` — write to any /agent_state/ file
- `dispatch_agent(agent_name, task, context)` — kick off a sub-agent
- `check_csv_row_count(filepath)` — verify data volume
- `send_alert(message)` — notify human operator via email/Slack
- `log_decision(reasoning, action)` — write to orchestrator_log.jsonl

### Daily Schedule Logic
```
1. Check if forsale_urls.csv is stale (>24hr) → dispatch DATA_COLLECTOR
2. Check if properties.csv has new rows since last score run → dispatch ANALYSIS
3. Check if last email digest was >7 days ago → dispatch CONTENT
4. Check if feedback_log has new entries → dispatch STRATEGY (weekly)
5. After any data update → dispatch QA_VALIDATOR
6. If QA fails → do NOT dispatch CONTENT → alert human
```

### How Many Agents Does It Need?
The Orchestrator itself is 1 Claude API call per schedule tick. It spawns
the others. Each sub-agent is also 1 Claude API call (or a loop of calls
if it needs multiple tool calls to complete its task). They do not run
simultaneously in one process — the Orchestrator runs each sequentially
or in parallel threads (see Section: Multi-Threading).

---

## AGENT 1 — DATA COLLECTOR

### Role
Manages all data acquisition. Runs the Python scrapers, monitors output
quality, detects new listings vs removed listings, handles errors.

### Scope
- Knows about: crawl_forsale_urls.py, scrape_properties.py, all future scrapers
- Does NOT: analyze data, score properties, write content

### System Prompt
```
You are the Data Collector agent for a real estate intelligence platform.
Your job is to ensure fresh, complete, accurate data is always available.

You have access to Python scripts and CSV files. For each run:
1. Check what data sources need updating (based on staleness thresholds)
2. Run the appropriate scraper scripts
3. Verify output row counts and spot-check sample rows
4. Log any errors or anomalies
5. Report completion status to the Orchestrator

You are conservative — do not mark a collection as complete if row counts
are suspicious or if error rates exceed 5%.
```

### Tools Available
- `run_script(script_name, args)` — execute a Python scraper
- `read_csv_sample(filepath, n_rows)` — read first/last N rows for QA
- `count_rows(filepath)` — check output size
- `diff_csv(old_file, new_file, key_col)` — find new/removed rows
- `write_state(file, content)` — update pipeline_status.json
- `log_error(context, error_msg)` — write to agent_errors.jsonl

### Outputs
- Updated forsale_urls.csv, properties.csv, assessments.csv, mls_history.csv
- pipeline_status.json updated: `{"data_collector": {"last_run": "...", "rows": 7519, "status": "ok"}}`
- new_listings.json — properties added since previous run
- removed_listings.json — properties no longer for sale

### Future Data Sources This Agent Manages
- Rental scraper (Kijiji)
- NS open data downloader (PVSC, permits)
- StatsCan dissemination area CSV fetcher
- Walkscore API caller

---

## AGENT 2 — ANALYSIS AGENT

### Role
Takes raw property data and produces scored, enriched, segmented output.
Computes all derived metrics, runs the deal scoring model, tags segments,
identifies trends, and writes results to the database.

### Scope
- Knows about: properties.csv, assessments.csv, mls_history.csv, score_weights.json
- Produces: properties.sqlite (enriched), deal_scores.json, segment_tags.json
- Does NOT: collect data, write content, talk to customers

### System Prompt
```
You are the Analysis Agent for a real estate intelligence platform.
Your job is to transform raw scraped data into actionable scored insights.

For each run:
1. Load the latest properties, assessments, and mls_history data
2. Compute all derived metrics (see metrics definition in your context)
3. Apply the deal scoring model using current weights from score_weights.json
4. Tag each property with matching buyer segments
5. Identify notable patterns: new bank-owned listings, assessment outliers,
   fast-moving deals, newly relisted properties
6. Write enriched output and a summary of key findings
7. Flag any properties that warrant immediate human attention (score > 85)

Be precise. Show your calculations for any score > 75. Explain any anomalies.
```

### Tools Available
- `run_python(code)` — execute pandas/sqlite analysis code
- `read_csv(filepath)` — load data
- `query_sqlite(db_path, sql)` — query the database
- `read_state(file)` — read score_weights.json, segment_definitions.json
- `write_state(file, content)` — update findings
- `write_sqlite(db_path, table, dataframe)` — persist enriched data

### Key Analyses It Runs
1. Compute assessment_ratio, assessment_momentum, sale_to_list_ratio per property
2. Apply deal scoring formula → score column
3. Tag segments → segment_tags column (pipe-separated)
4. Neighbourhood-level aggregates: avg price/sqft, avg DOM, avg score per subdistrict
5. Trend detection: which subdistricts are new this week, which prices dropped
6. Anomaly detection: properties with score > 85, bank_owned new arrivals

---

## AGENT 3 — CONTENT AGENT

### Role
Takes scored, segmented data and produces human-readable content: email
digests, deal briefs, blog post drafts, and social media snippets.

### Scope
- Reads: properties.sqlite (scored), new_listings.json, segment_tags
- Produces: email_digest.html, deal_brief_{pid}.pdf content, blog_post_draft.md
- Does NOT: collect data, compute scores, send emails (Orchestrator does that)

### System Prompt
```
You are the Content Agent for a real estate intelligence platform.
Your audience is investors, agents, and buyers in Nova Scotia.
Your tone: data-driven, direct, no fluff. Think Bloomberg Terminal meets
a smart friend who knows the local market.

For each weekly digest:
1. Pull the top 10 scored deals from this week's analysis
2. Write a 3-sentence deal brief for each: the opportunity, the numbers, the signal
3. Write the email subject line (A/B test: generate 3 options)
4. Write the intro paragraph (150 words max)
5. Generate a blog post title + outline for the most interesting insight this week
6. Generate 3 LinkedIn post drafts (one stat, one story, one question)

Never invent numbers. Only use data from the database. Flag any data gaps.
```

### Tools Available
- `query_sqlite(db_path, sql)` — pull top deals, stats
- `read_state(file)` — read strategy_notes, feedback_log for what resonated
- `generate_deal_brief(property_dict)` — format a single deal brief
- `write_output(filename, content)` — save email HTML, blog draft
- `read_feedback(n_recent)` — what got clicks last time

### Content Templates It Manages
1. **Weekly investor digest** — top 10 deals, 1 market stat, 1 trend
2. **Bank owned alert** — triggered when new bank_owned listings appear
3. **Price drop alert** — triggered when tracked properties drop price
4. **Neighbourhood spotlight** — monthly deep dive on one subdistrict
5. **Deal brief PDF** — 1-page summary for a single property (sellable)
6. **Blog post draft** — insight-driven, SEO-targeted
7. **LinkedIn/Twitter snippets** — 3 per week

---

## AGENT 4 — QA / VALIDATOR AGENT

### Role
Acts as the quality control gate. Runs after every Data Collector cycle.
Blocks the pipeline from proceeding if data quality is below threshold.
Identifies systemic scraping failures, label mismatches, null rate spikes.

### Scope
- Reads: all CSVs, properties.sqlite
- Produces: data_quality_report.json
- Does NOT: fix data, run scrapers, write content

### System Prompt
```
You are the QA Validator for a real estate intelligence pipeline.
You are skeptical. You assume data is broken until proven otherwise.

For each validation run:
1. Check null rates per column — alert if any key field > 20% null
2. Check value distributions — flag outliers (price $0, age > 200, sqft > 50000)
3. Check for duplicate cutsheet_url entries
4. Spot-check 5 random properties: fetch the live page and compare scraped data
5. Check assessment continuity — no property should have a gap > 2 years
6. Check mls_history integrity — listing_id in history should be scrape-able
7. Produce a pass/fail verdict with specific issues listed

If overall quality score < 80%, set pipeline_status blocked=true.
The Orchestrator will not proceed to Content or Delivery if blocked.
```

### Tools Available
- `read_csv(filepath)` — load data for analysis
- `query_sqlite(db_path, sql)` — run quality queries
- `fetch_live_page(url)` — spot-check against live source
- `compare_scraped_vs_live(scraped_dict, live_html)` — validate accuracy
- `write_state(file, content)` — write data_quality_report.json
- `compute_null_rates(dataframe)` — column-level null analysis

### Quality Checks
| Check | Threshold | Action if fail |
|---|---|---|
| list_price null rate | < 5% | Warning |
| bedrooms null rate | < 15% (some commercial) | Warning |
| bank_owned null rate | < 2% | Block — critical field |
| assessment_current null rate | < 10% | Warning |
| Duplicate cutsheet_url | 0 | Block |
| Price < $1,000 | 0 | Flag for review |
| Age > 250 | 0 | Flag for review |
| Spot-check accuracy | > 90% match | Block if < 80% |

---

## AGENT 5 — CUSTOMER PERSPECTIVE AGENTS

### Role
A family of agents that simulate the viewpoint of different end-user roles.
Each runs against the current deal list and asks: "Is this actually useful
to someone like me? What am I missing? What would I want that we don't have?"

These are **evaluation agents** — they stress-test the product and surface
gaps. Run monthly or when new features are being designed.

### The Five Perspective Agents

#### 5A — THE INVESTOR
```
System prompt:
You are a real estate investor in Nova Scotia with $500k to deploy.
You are looking at the deal list produced by this system.
Evaluate: Are these actually deals? What's missing from the analysis?
What would make you trust this system enough to pay $199/month?
What questions do you have that the data doesn't answer?
Be critical. Be specific. Suggest 3 concrete improvements.
```

#### 5B — THE BUYER'S AGENT
```
System prompt:
You are a licensed real estate agent in Halifax representing buyers.
Look at the current deal scores and email digest.
Evaluate: Is this useful for your practice? Would you pay $99/month?
What data would make your job easier that isn't here?
What would you need to see to refer this to a client?
What legal/ethical concerns do you have?
```

#### 5C — THE HOUSE FLIPPER
```
System prompt:
You are a house flipper who does 3-4 flips per year in HRM.
Your key inputs: age, condition signals, acquisition price, ARV estimate.
Look at the data available. What's missing to estimate ARV?
What renovation risk signals would you want from property data?
What would a "flipper score" look like to you specifically?
```

#### 5D — THE DEVELOPER
```
System prompt:
You are a small residential developer in NS looking for infill sites.
You need: lot size, zoning, by-law constraints, servicing (water/sewer).
Evaluate the current zoning and lot data. Is it sufficient?
What additional data would you need before calling a listing agent?
What does a "development opportunity score" look like to you?
```

#### 5E — THE SKEPTIC / REGULATOR
```
System prompt:
You are a real estate lawyer reviewing this system for legal risk.
Concerns: unlicensed trading, data accuracy claims, privacy, liability.
Review the system design and identify every legal risk.
Suggest how each risk should be mitigated.
What disclosures are needed on the public-facing tool?
```

### How to Run Them
Each perspective agent receives:
- The current top 10 deal list (JSON)
- The current email digest draft
- The current data schema (what fields exist)
- Their role-specific system prompt

They output a structured critique: strengths, gaps, specific suggestions.
The Orchestrator logs these to strategy_notes.jsonl for the Strategy Agent.

---

## AGENT 6 — STRATEGY AGENT

### Role
The long-range thinker. Runs weekly. Reads all feedback, errors, quality
reports, and perspective agent critiques. Synthesizes into a strategic
recommendation: what to build next, what to stop, what new data source
to add, what new segment to target.

### System Prompt
```
You are the Strategy Agent for a real estate intelligence business.
You have access to: pipeline performance, email engagement, QA reports,
customer perspective critiques, and current revenue.

Your weekly job:
1. Summarize what worked and what didn't this week
2. Identify the single highest-leverage improvement to make
3. Identify one new data source worth pursuing
4. Identify one new customer segment worth targeting
5. Flag any systemic risks that need immediate attention
6. Output: a prioritized action list for the Orchestrator

Think in terms of: data flywheel (more data → better scores → more trust →
more customers → more feedback → better scores). What accelerates the flywheel?
```

### Tools Available
- `read_state(all_state_files)` — full context read
- `read_csv_sample(feedback_log)` — what got engagement
- `query_sqlite(aggregate_stats)` — system-level metrics
- `web_search(query)` — research new data sources, competitors
- `write_state(strategy_notes.jsonl)` — output recommendations

---

## PART 2 — HOW MULTI-AGENT CLAUDE WORKS IN PRACTICE

### The Reality (No Magic API Needed)

There is no special "multi-agent Claude API." What you build is:

```python
import anthropic

client = anthropic.Anthropic(api_key="...")

def run_agent(agent_name, system_prompt, user_message, tools):
    """
    One agent = one (or more) API call(s) with tool use.
    The agent loops until it calls a "task_complete" tool.
    """
    messages = [{"role": "user", "content": user_message}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=4096,
            system=system_prompt,
            tools=tools,
            messages=messages
        )

        # If Claude wants to use a tool
        if response.stop_reason == "tool_use":
            tool_results = execute_tools(response.content)
            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})
            # Loop — Claude sees the tool result and continues

        # If Claude is done
        elif response.stop_reason == "end_turn":
            return extract_final_output(response)
```

### Multi-Threading (Parallel Agents)

For agents that don't depend on each other's output, run in parallel:

```python
import threading

def run_parallel_agents(tasks):
    """
    Run independent agents at the same time.
    E.g.: QA Validator and Content Agent can both read the DB simultaneously.
    But Analysis Agent must finish before Content Agent starts.
    """
    threads = []
    results = {}

    for agent_name, task in tasks.items():
        t = threading.Thread(
            target=lambda n=agent_name, tk=task: results.update(
                {n: run_agent(n, tk['system'], tk['message'], tk['tools'])}
            )
        )
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    return results

# Example: run QA and perspective agents in parallel after analysis
parallel_results = run_parallel_agents({
    "qa_validator":    qa_task,
    "perspective_investor": investor_task,
    "perspective_agent":    agent_task,
})
```

### The Orchestrator Loop (Pseudocode)

```python
def orchestrator_loop():
    status = read_state("pipeline_status.json")

    # Sequential dependencies
    if needs_data_refresh(status):
        result = run_agent("data_collector", ...)
        write_state("pipeline_status.json", result)

    if needs_analysis(status):
        result = run_agent("analysis_agent", ...)
        write_state("pipeline_status.json", result)

    # Parallel — QA and perspectives can run together
    parallel_results = run_parallel_agents({
        "qa_validator": ...,
        "perspective_investor": ...,
        "perspective_agent": ...,
    })

    if parallel_results["qa_validator"]["status"] == "pass":
        result = run_agent("content_agent", ...)

    if is_weekly(status):
        result = run_agent("strategy_agent", ...)

    log_decision(status, parallel_results)
```

### API Cost Estimates

Each agent call with tool use, on claude-sonnet:
- ~2,000–8,000 input tokens + ~1,000–3,000 output tokens
- Cost: ~$0.02–$0.08 per agent run

Daily orchestrator cycle (all agents): ~$0.30–$0.80/day
Monthly: ~$10–$25/month in API costs

This is negligible vs any subscription revenue.

---

## PART 3 — SETUP, TESTING, AND VALIDATION

### Phase 1 — Setup (Week 1)

```
1. Create /agent_state/ directory
2. Create initial pipeline_status.json (all sections: "not_started")
3. Create score_weights.json with v1 weights
4. Create segment_definitions.json
5. Implement run_agent() wrapper function
6. Implement each tool function (read_csv, query_sqlite, etc.)
7. Implement Orchestrator with hardcoded schedule (no cron yet)
```

### Phase 2 — Agent Testing (Week 1–2)

Test each agent in isolation before wiring them together:

```python
# Test Data Collector alone
result = run_agent(
    "data_collector",
    SYSTEM_PROMPTS["data_collector"],
    "Verify forsale_urls.csv is up to date. It was last updated 2 hours ago.",
    DATA_COLLECTOR_TOOLS
)
assert result["status"] == "ok"
assert result["row_count"] > 7000

# Test Analysis Agent alone with known data
result = run_agent(
    "analysis_agent",
    SYSTEM_PROMPTS["analysis_agent"],
    f"Score the following 3 properties: {test_properties_json}",
    ANALYSIS_TOOLS
)
# Manually verify the scores make sense
```

### Phase 3 — Integration Testing (Week 2)

Run the full pipeline on a small subset:
1. 100 properties only
2. Verify each agent passes its output correctly to the next
3. Verify the Orchestrator correctly blocks Content if QA fails
4. Manually review the email digest produced

### Phase 4 — Validation Metrics

| What to measure | How | Pass threshold |
|---|---|---|
| Data Collector accuracy | Spot-check 10 properties vs live site | >90% field match |
| Analysis score distribution | Check score histogram | Scores span 0–100, not clustered |
| QA false positive rate | Inject a known-bad row, check QA catches it | 100% catch rate |
| Content quality | Human review of 3 digests | "Would you pay for this?" |
| Orchestrator recovery | Kill a mid-run agent, restart | Resumes from last checkpoint |
| Perspective agent usefulness | Are critiques actionable? | >2 concrete improvements per run |

### Phase 5 — Monitoring in Production

```
/agent_state/
  orchestrator_log.jsonl  →  track every run, every decision
  agent_errors.jsonl      →  every error, what caused it, was it retried

Alert triggers (send to email/Slack):
  - Any agent fails 3 times in a row
  - QA blocks the pipeline
  - Row count drops >20% from previous run (site structure may have changed)
  - Cost spike (>$2 in one hour = runaway loop)
```

---

## PART 4 — AGENT COUNT AND SCOPE SUMMARY

| Agent | Runs | Parallel? | Approx API calls/run | Critical? |
|---|---|---|---|---|
| Orchestrator | Daily | No (coordinator) | 2–5 | YES |
| Data Collector | Daily | No (sequential scripts) | 3–8 | YES |
| Analysis Agent | After every data update | No (needs fresh data) | 5–15 | YES |
| QA Validator | After every data update | YES (with perspectives) | 3–6 | YES |
| Content Agent | Weekly | No (needs QA pass first) | 5–10 | Medium |
| Perspective: Investor | Monthly | YES (with other perspectives) | 2–4 | Low |
| Perspective: Agent | Monthly | YES | 2–4 | Low |
| Perspective: Flipper | Monthly | YES | 2–4 | Low |
| Perspective: Developer | Monthly | YES | 2–4 | Low |
| Perspective: Skeptic | Monthly | YES | 2–4 | Low |
| Strategy Agent | Weekly | No (needs all inputs) | 8–20 | Medium |

**Total agents: 11**
**Daily active: 4** (Orchestrator, Data Collector, Analysis, QA)
**Weekly active: 6** (+ Content, Strategy)
**Monthly active: all 11**

---

## PART 5 — THE NORTH STAR FOR THE AGENT SYSTEM

The agents are not the product. The insights are the product.

The agents exist to answer one question every week:
**"What are the 10 best real estate opportunities in Nova Scotia right now,
and who should know about them?"**

Everything else — data quality, scoring, content, testing — is infrastructure
to make that answer more accurate, more trusted, and more valuable over time.

---

## IMMEDIATE NEXT STEPS TO BUILD THIS

1. `mkdir agent_state` — create state directory
2. Write `agent_runner.py` — the `run_agent()` wrapper with tool execution
3. Write `tools.py` — implement all tool functions (read_csv, query_sqlite, etc.)
4. Write `orchestrator.py` — the scheduling logic
5. Test Data Collector agent alone (it just runs existing scripts)
6. Test Analysis Agent with 100 rows of real data
7. Test QA Validator — inject a known bad row and verify it catches it
8. Wire them together under the Orchestrator
9. Run one full weekly cycle manually, review every output
10. Schedule with Windows Task Scheduler or a simple `while True: sleep(86400)` loop
