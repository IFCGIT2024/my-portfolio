# Nova Scotia Real Estate Intelligence Platform — Master Strategy Document

---

## VISION

Build a self-improving real estate intelligence pipeline that continuously:
1. Collects raw property data
2. Generates scored insights
3. Delivers value to specific buyer segments
4. Earns revenue through subscriptions, referrals, and tools
5. Feeds learnings back into the model to improve targeting

This is not a one-time scrape. It is a living system.

---

## SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│                    DATA COLLECTION LAYER                 │
│  crawl_forsale_urls.py  →  forsale_urls.csv             │
│  scrape_properties.py   →  properties.csv               │
│                             assessments.csv             │
│                             mls_history.csv             │
│  [Future] sold data, rental listings, permit data       │
└────────────────────┬────────────────────────────────────┘
                     │ (runs on schedule: daily/weekly)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   PROCESSING + SCORING LAYER            │
│  load_db.py  →  properties.sqlite                       │
│  score.py    →  deal_score per property                 │
│  segment.py  →  buyer/investor/developer match          │
│  trend.py    →  neighbourhood appreciation curves       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   DELIVERY LAYER                        │
│  Dashboard (internal)  →  filter, sort, score, map      │
│  Email digest          →  weekly top deals per segment  │
│  API endpoint          →  agent/investor JSON feed      │
│  Web tool (public)     →  "Is this house fairly priced?"│
│  PDF report            →  sellable CMA-style output     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   MONETIZATION LAYER                    │
│  Finder's fee (introductions)                           │
│  Subscription (weekly deal digest)                      │
│  White-label (brokerage licensing)                      │
│  Mortgage broker referral                               │
│  Developer lead gen                                     │
└────────────────────┬────────────────────────────────────┘
                     │ feedback: what sold, what converted
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   FEEDBACK + ITERATION LOOP             │
│  Track which scored deals actually sold                 │
│  Track which segments converted to revenue              │
│  Adjust scoring weights                                 │
│  Discover new data sources                              │
│  Expand to new geographic markets                       │
└─────────────────────────────────────────────────────────┘
```

---

## PART 1 — DATA COLLECTION LAYER

### 1.1 Current Sources (Built)
- `crawl_forsale_urls.py` — scrapes all current for-sale listings (~7,500 NS properties)
- `scrape_properties.py` — scrapes full detail per listing:
  - Price, beds, baths, sqft, lot size
  - Age, construction materials, heating, water, sewer
  - Zoning, by-law, civic data
  - 19-year assessment history
  - Full MLS listing history (every time it was listed, list price, sale price, DOM)
  - Bank owned flag
  - Historical cutsheet URLs (past listing snapshots)
  - Listing views + unique users (demand signal)
  - Schools within distance

### 1.2 Next Data Sources to Add

| Source | How to get it | Value |
|---|---|---|
| Sold listings (expired cutsheets) | Crawl historical cutsheet URLs from mls_history | Actual market comps |
| PVSC assessment database | Public NS government data | Cross-validate scraped assessments |
| NS building permits | Open data portal | Development activity signal |
| Rental listings (Kijiji/FB) | Scrape or API | Rental yield calculation |
| NS company registry | Public | Link investor names to properties |
| Census data by dissemination area | StatsCan open data | Demographic overlay |
| NS electoral boundaries | GeoJSON | Neighbourhood delineation |
| Walk score / transit data | Walkscore API (free tier) | Livability scoring |
| Flood zone maps | NS govt GIS | Risk scoring |
| Septic/well permit records | Municipal FOI | Rural property risk |

### 1.3 Collection Schedule (Automation Loop)

```
DAILY:
  - crawl_forsale_urls.py   → detect new listings / removed listings
  - diff against yesterday  → "new today" and "just sold/removed" lists

WEEKLY:
  - scrape_properties.py    → refresh all active listings (price changes, DOM updates)
  - scrape historical cutsheets → build sold comps database

MONTHLY:
  - Pull any new open data sources
  - Recalculate all scores and trends
  - Generate neighbourhood reports
```

---

## PART 2 — PROCESSING + SCORING LAYER

### 2.1 Derived Metrics to Compute

| Metric | Formula | Signal |
|---|---|---|
| **Assessment ratio** | `list_price / assessment_current` | >1.3 = overpriced, <0.9 = deal |
| **Assessment momentum** | CAGR of assessments 2019→2026 | Neighbourhood growth rate |
| **Sale-to-list ratio** | `sprice / lprice` from mls_history | Average negotiation room |
| **Price drop total** | sum of price changes from mls_history | Seller motivation |
| **Relist count** | len(mls_history entries) - 1 | Desperation signal |
| **DOM trend** | DOM across all past listings | Getting easier or harder |
| **Price/sqft** | `list_price / building_sqft` | Comparability |
| **Assessment/sqft** | `assessment_current / building_sqft` | PVSC per sqft benchmark |
| **Lot value estimate** | `assessment - (building_sqft * avg_build_cost)` | Land value |
| **Views/DOM ratio** | `views / dom` | Demand vs time |
| **Operating cost flag** | oil heat + well + septic = high; gas + municipal = low | Hidden cost signal |
| **Development potential** | mixed/commercial zoning + underbuilt lot | Rezoning upside |

### 2.2 Deal Scoring Model (v1)

Each property gets a score 0–100. Weights are adjustable as feedback comes in.

```python
score = 0

# Distress signals (max 40pts)
if bank_owned:                          score += 30
if relist_count >= 2:                   score += 10
if relist_count >= 3:                   score += 10  # stacks
if dom > 60:                            score += 10
if total_price_drop > 0.05 * list:      score += 10

# Value signals (max 35pts)
if assessment_ratio < 0.95:             score += 25  # listed below assessment
if assessment_momentum > 0.08:          score += 10  # fast appreciation area

# Demand signals (max 15pts)
if views > 200:                         score += 10
if views_per_dom > 5:                   score += 5

# Risk deductions
if age > 80 and foundation == 'Stone':  score -= 10
if water == 'Drilled Well':             score -= 5
if sewer == 'Septic':                   score -= 5
```

### 2.3 Segment Matching

Each property gets tagged with which buyer segments it fits:

| Segment | Criteria |
|---|---|
| **Investor / BRRRR** | 3br+, municipal services, score > 60, price < $600k |
| **Flip candidate** | age 30–80, detached, DOM > 45, price < $500k, HRM preferred |
| **Developer lead** | lot > 5000sqft, COR/C2/mixed zoning, list < $800k |
| **Bank owned deal** | bank_owned = true, any type |
| **Motivated seller** | relist_count >= 2 OR price_drop > 5% OR DOM > 90 |
| **Vacation/cottage** | waterfront OR water_access, outside HRM |
| **Owner-occupied value** | assessment_ratio < 1.0, schools nearby, low DOM |
| **Rural value** | outside HRM, lot > 1ac, low price/sqft |

---

## PART 3 — DELIVERY LAYER

### 3.1 Internal Dashboard (Build First)
- SQLite backend, simple HTML/JS frontend
- Columns: address, price, score, segments, assessment_ratio, DOM, relist_count, bank_owned
- Filters: subdistrict, price range, property type, segment tag, score threshold
- Sort by score descending
- Click row → open original viewpoint cutsheet

### 3.2 Weekly Email Digest
**Product:** "NS Deal Intelligence — Weekly Top 20"

Format per email:
```
Subject: 7 new motivated sellers this week in HRM | NS Deal Intelligence

TOP DEALS THIS WEEK
───────────────────
#1 Score: 87 | 42 Baker Road, Dartmouth | $349,000
   Listed 3x | DOM 112 | Bank Owned | Below Assessment by 12%
   [View Listing] [See History] [Request Introduction]

#2 Score: 74 | ...
```

Segments to send to:
- Investors → top scored properties, any type
- Flippers → age 30-80, detached, HRM
- Agents → motivated sellers in their farm area
- Developers → zoning opportunities
- Lenders → assessment trend data, LTV context

Tools: Mailchimp free tier (500 contacts), or Resend.com API (3,000/month free)

### 3.3 Public Web Tool — "Fair Price Checker"
- User pastes a viewpoint.ca listing URL
- You scrape it live (or look up from DB if already scraped)
- Return:
  - Assessment ratio: "Listed 18% above assessed value"
  - DOM: "Has been listed 2 times, 67 total days on market"
  - Neighbourhood trend: "This area assessed +9.2%/yr since 2019"
  - Score: "Deal Score: 61/100"
  - CTA: "Want full history + comps? Enter email →"

This is your lead magnet. Every person who uses it is a potential subscriber or client.

### 3.4 PDF CMA Report (Sellable)
- Generate for any property: assessment history chart, price history, comparable sales, score breakdown, neighbourhood trend
- Sell to buyers for $25–$50 per report
- Or give free to agents who refer buyers

### 3.5 Agent API Feed
- `GET /api/deals?subdistrict=27&min_score=65&segment=investor`
- Returns JSON of top deals
- Sell access at $99–$299/month per agent
- White-label option: their logo, their farm area only

---

## PART 4 — CUSTOMER SEGMENTS IN DEPTH

### 4.1 The Investor / BRRRR Buyer
**Profile:** Has capital, wants cashflow or equity. Looks at 20–50 deals to buy 1–2/year.
**Pain:** Finding undervalued properties takes hours of manual search.
**Your value:** Pre-scored deal list. They only look at score > 65.
**Monetization:** Finder's fee ($1,000–$3,000 per closed deal) OR subscription ($199/month).
**Pipeline:** Weekly email → they flag interest → you make introduction to listing agent → collect fee.

### 4.2 The House Flipper
**Profile:** Buys distressed, renovates, resells within 6–18 months.
**Pain:** Finding deals where ARV (after repair value) exceeds acquisition + reno.
**Your value:** Age, condition signals (roof/foundation/exterior), price history showing seller desperation.
**Monetization:** Subscription or per-deal fee.
**Key data points:** age, exterior, foundation, basement, relist_count, DOM, price drops.

### 4.3 The Developer
**Profile:** Buys land or underbuilt lots for multi-unit or commercial development.
**Pain:** Identifying zoning opportunities hidden inside residential listings.
**Your value:** Zoning flag, lot size, by-law area, assessment vs land value estimate.
**Monetization:** $500–$2,000 per introduction. Developers have big margins.
**Pipeline:** Flag COR/C2/RA zone properties with large lots listed as residential → pitch as development sites.

### 4.4 The Mortgage Broker / Private Lender
**Profile:** Needs to assess collateral value and trend for loan decisions.
**Pain:** PVSC assessments lag market. Need trend data, not just current value.
**Your value:** 19-year assessment chart + market list price history = better LTV confidence.
**Monetization:** $299–$999/month for API access to assessment trend data.
**Note:** MICs (mortgage investment corporations) would pay well for this.

### 4.5 The Buyer's Agent
**Profile:** Licensed realtor representing buyers. Earns commission on purchased properties.
**Pain:** CMA (comparative market analysis) takes 2–3 hours manually.
**Your value:** Instant CMA data, motivated seller flags for their buyers, farm area alerts.
**Monetization:** Referral fee agent-to-agent (licensed). Or tool subscription $99/month.
**Key insight:** If you are unlicensed, you refer buyer → agent closes → agent pays you a referral fee out of their commission. This is legal in NS if documented.

### 4.6 The Listing Agent
**Profile:** Licensed realtor representing sellers. Needs pricing data.
**Pain:** Sellers always think their house is worth more than it is.
**Your value:** Assessment ratio, historical sale data for comparable addresses, neighbourhood trend.
**Monetization:** Subscription or per-report sales.

### 4.7 The Cash Buyer / BPOE Hunter
**Profile:** Looking specifically for bank-owned or estate sales. Buys below market with cash, fast close.
**Pain:** Bank-owned listings aren't tagged anywhere on MLS.
**Your value:** You have the `bank_owned` flag. This is exclusive data.
**Monetization:** $500–$2,000 finder's fee per introduction. High urgency buyers.

### 4.8 Insurance Underwriter
**Profile:** Home insurer needs to assess risk at underwriting.
**Pain:** Age + construction data not easily accessible.
**Your value:** Foundation type, exterior, roof, age, heating fuel type, water/sewer.
**Monetization:** B2B data licensing deal ($5,000–$50,000/year). Long sales cycle but high value.

---

## PART 5 — MONETIZATION LAYER

### 5.1 Revenue Streams Ranked by Ease

| Stream | Effort | Revenue potential | Timeline |
|---|---|---|---|
| Finder's fee (single introductions) | Low | $500–$3,000/deal | Immediate |
| Subscription — investor digest | Medium | $99–$299/month per sub | 1–3 months |
| Agent referral fees | Low (if licensed agent partner) | 25% of commission | 1–3 months |
| Public web tool (email capture → upsell) | Medium | Lead gen → converts to subscriptions | 2–4 months |
| PDF CMA reports | Low | $25–$75/report | 1–2 months |
| Agent API subscription | High | $99–$499/month | 3–6 months |
| White-label for brokerage | High | $500–$2,000/month | 6–12 months |
| B2B data licensing | Very High | $5,000+/year | 12+ months |

### 5.2 Finder's Fee Pipeline (Immediate Path)

1. Run deal scoring daily
2. Identify top 5–10 properties per week (score > 70)
3. Research the seller: how long listed, any agent comments, bank owned?
4. Find a buyer match from your network or email list
5. Introduce via email with a sourcing brief (1 page: why this deal, the numbers)
6. Sign a simple finder's fee agreement (template from a lawyer) before introduction
7. Buyer closes → you collect

**Legal structure in NS:** You can charge a "research / deal sourcing fee" to the buyer paid before or at introduction — this avoids the real estate trading license requirement. Get legal advice to confirm and document properly.

### 5.3 Subscription Pricing Model

```
TIER 1 — Deal Alert  — $49/month
  Weekly email: top 10 scored deals province-wide
  Segment filter: 1 segment

TIER 2 — Investor Pro — $149/month
  Daily alerts for new high-score listings
  All segments
  Direct links + deal brief (1 page PDF)
  Access to web filter dashboard

TIER 3 — Agent/Broker — $299/month
  Everything in Pro
  Farm area filter (their specific subdistricts)
  Downloadable CSV export
  API access (100 calls/day)
  White-label email digest with their branding
```

---

## PART 6 — FEEDBACK + ITERATION LOOPS

### 6.1 The Core Iteration Loop

```
COLLECT → SCORE → DELIVER → MEASURE → ADJUST → COLLECT
```

Every week:
- Which high-scored deals actually went pending/sold? (scrape for status change)
- Which email links got clicked? (UTM tracking)
- Which segments had highest open rates?
- Which scoring factors best predicted "deal sold fast below list"?

Adjust scoring weights monthly based on this.

### 6.2 The Insight Discovery Loop

```
NEW DATA SOURCE → Integrate → Find new pattern →
New segment or metric → New product feature → New revenue stream
```

Example: Add rental listing data → now compute gross yield/cap rate → new segment (cashflow investors) → new email tier.

### 6.3 The Expansion Loop

```
PROVE VALUE in HRM → Expand to Cape Breton / New Brunswick →
Replicate pipeline → New market, same system
```

ViewPoint also covers NB and PEI. The scraper works on any province. Once profitable in NS, expand.

### 6.4 The Content / Audience Loop

```
INSIGHT → Blog post / LinkedIn article → SEO traffic →
Email signups → Subscribers → Revenue
```

Content ideas that write themselves from your data:
- "The 10 most overpriced streets in HRM right now"
- "Which NS subdistricts appreciated fastest 2019–2026?"
- "Bank-owned properties in NS: what's on the market today"
- "Why 47 properties in Halifax have been listed 3+ times"
- "The hidden cost of oil heat: rural NS buyer's guide"

Each article drives email signups. Email list is the business.

### 6.5 The Agent Partnership Loop

```
Agent signs up → Uses tool → Closes a deal faster →
Tells another agent → Referral growth → More data on what agents need →
Build features they ask for → Higher retention
```

Start with 2–3 agent relationships. Ask them what they wish they had. Build it. They become advocates.

### 6.6 The AI/Agent Loop (Future)

Once the database is mature:

```
User query: "Find me a 3br under $500k in HRM with municipal services
             that has been relisted and is below assessment"

→ AI agent queries SQLite
→ Returns ranked list with deal briefs
→ User says "send introduction to #1 and #3"
→ AI drafts the email, you approve and send
```

This is a lightweight version of what Zillow/Redfin spend millions building. You can prototype it with the SQLite + a simple LLM query layer.

---

## PART 7 — BUILD PLAN (SEQUENTIAL)

### Phase 0 — NOW (in progress)
- [x] crawl_forsale_urls.py — collecting all for-sale listings
- [x] scrape_properties.py — scraping full detail + API data
- [ ] Wait for scrape to complete (~7,500 properties)

### Phase 1 — THIS WEEK
- [ ] `load_db.py` — load CSVs into SQLite
- [ ] `score.py` — compute deal scores + derived metrics
- [ ] `segment.py` — tag each property with buyer segments
- [ ] Basic HTML dashboard — filter/sort table, open listing link

### Phase 2 — NEXT 2 WEEKS
- [ ] `daily_diff.py` — detect new/removed/price-changed listings day over day
- [ ] Email list setup (Mailchimp or Resend)
- [ ] First manual digest email to 5–10 test recipients (friends, investors you know)
- [ ] Get feedback: what's useful, what's noise

### Phase 3 — MONTH 1
- [ ] Public "Fair Price Checker" web tool (uses existing scraper + DB lookup)
- [ ] Email capture + drip sequence (3 emails: intro, deal example, pitch subscription)
- [ ] First paying subscriber or finder's fee introduction
- [ ] PDF report generator (matplotlib charts + reportlab)

### Phase 4 — MONTH 2–3
- [ ] Historical sold comps (scrape mls_history cutsheets)
- [ ] Rental yield layer (add rental listing scraper)
- [ ] Refine scoring weights based on what actually sold
- [ ] Agent outreach — offer free trial of agent dashboard
- [ ] Second email tier launch

### Phase 5 — MONTH 3–6
- [ ] API endpoint (Flask, deployed on Railway or Render free tier)
- [ ] Agent subscription billing (Stripe)
- [ ] Expand to Cape Breton or New Brunswick
- [ ] First brokerage white-label conversation

---

## PART 8 — KEY RISKS AND MITIGATIONS

| Risk | Mitigation |
|---|---|
| ViewPoint blocks scraper | Add delays, rotate user agents, cache aggressively |
| ViewPoint changes HTML structure | Modular scraper — easy to update label_val patterns |
| Legal: finder's fee without license | Charge "research fee" to buyer pre-introduction; get legal template |
| Low email open rates | Segment tightly, send only high-signal content, test subject lines |
| Data quality (nulls) | Score only fields that exist; show data completeness % per listing |
| Scrape data goes stale | Daily re-crawl of active listings |
| Competition from Zillow/Redfin | They don't operate in NS. ViewPoint is the local incumbent. You have home field. |

---

## PART 9 — THE NORTH STAR METRIC

**Weekly number of introductions made that result in a signed deal or subscription.**

Everything else (scraping, scoring, emails, tools) is infrastructure to drive this number up.

Start with: **1 closed introduction or 1 paying subscriber in 30 days.**

---

## NEXT IMMEDIATE ACTIONS

1. Let `scrape_properties.py` finish (~7,500 properties)
2. Build `load_db.py` to load into SQLite
3. Build `score.py` to compute deal scores
4. Build minimal HTML dashboard to browse scored deals
5. Find 3 test users (investor, agent, or buyer in your network)
6. Send them the top 10 scored deals manually — get their reaction
7. Decide which segment to monetize first based on that feedback
