"""
score.py — Compute deal_score, confidence_score, score_reason_breakdown,
           and segment_tags for every property in properties.sqlite.

Adds a `scored_properties` table and a `scores` view joining back to properties.

Usage:
    python score.py

Requires:
    properties.sqlite (built by load_db.py)
"""

import sqlite3
import json
import os

BASE    = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE, "properties.sqlite")


# ---------------------------------------------------------------------------
# Schema for scored output
# ---------------------------------------------------------------------------

SCORE_SCHEMA = """
CREATE TABLE IF NOT EXISTS scores (
    cutsheet_url            TEXT PRIMARY KEY,
    deal_score              INTEGER,
    confidence_score        INTEGER,
    score_reason_breakdown  TEXT,   -- JSON array of {factor, points, note}
    segment_tags            TEXT,   -- pipe-separated
    assessment_ratio        REAL,   -- list_price / assessment_current
    price_per_sqft          REAL,
    relist_count            INTEGER,
    dom_total               INTEGER,
    price_drop_total        REAL,
    assessment_momentum     REAL,   -- % change in assessment over last 5 years
    sale_to_list_ratio      REAL,   -- last sale price / last list price
    FOREIGN KEY (cutsheet_url) REFERENCES properties(cutsheet_url)
);

DROP VIEW IF EXISTS scored_view;
CREATE VIEW scored_view AS
    SELECT
        s.*,
        p.address,
        p.list_price,
        p.bedrooms,
        p.bathrooms,
        p.building_sqft,
        p.age,
        p.property_type,
        p.foundation,
        p.drinking_water,
        p.sewer,
        p.bank_owned,
        p.assessment_current,
        p.views,
        p.unique_users,
        p.zoning,
        p.waterfront,
        p.polling_district
    FROM scores s
    JOIN properties p ON p.cutsheet_url = s.cutsheet_url
    ORDER BY s.deal_score DESC;
"""


# ---------------------------------------------------------------------------
# Confidence scoring — based on null rate of fields that matter for scoring
# ---------------------------------------------------------------------------

# Fields that the scoring formula touches — if null, confidence drops
KEY_FIELDS = [
    "list_price",
    "assessment_current",
    "bedrooms",
    "bathrooms",
    "building_sqft",
    "age",
    "foundation",
    "drinking_water",
    "sewer",
    "bank_owned",
    "views",
]

def compute_confidence(prop, relist_count, dom_total, price_drop_total):
    """
    Confidence score 0-100.
    Starts at 100, deducts for each key field that is null.
    Also deducts when derived metrics can't be computed.
    """
    score = 100
    reasons = []

    null_count = sum(1 for f in KEY_FIELDS if prop.get(f) is None)
    deduct = null_count * 7
    if deduct:
        score -= deduct
        reasons.append(f"Missing {null_count} key field(s): -{deduct}")

    if prop.get("assessment_current") is None:
        score -= 10
        reasons.append("No assessment data: -10")

    if relist_count is None:
        score -= 5
        reasons.append("No MLS history to compute relist count: -5")

    if dom_total is None:
        score -= 5
        reasons.append("No DOM data: -5")

    return max(0, score), reasons


# ---------------------------------------------------------------------------
# Derived metrics from MLS history
# ---------------------------------------------------------------------------

def get_history_metrics(conn, cutsheet_url):
    """
    Returns (relist_count, dom_total, first_list_price, last_sale_price,
             last_list_price, price_drop_total, sale_to_list_ratio)
    """
    rows = conn.execute(
        """
        SELECT dom, lprice, sprice, stid, ldate
        FROM mls_history
        WHERE cutsheet_url = ?
        ORDER BY ldate ASC
        """,
        (cutsheet_url,)
    ).fetchall()

    if not rows:
        return None, None, None, None, None, None, None

    relist_count   = len(rows)
    dom_total      = sum(r[0] for r in rows if r[0] is not None)
    first_lprice   = rows[0][1]
    last_lprice    = rows[-1][1]
    last_sprice    = rows[-1][2]

    # Price drop from first list price to current (or last list price)
    price_drop_total = None
    if first_lprice and last_lprice:
        price_drop_total = first_lprice - last_lprice

    sale_to_list = None
    if last_sprice and last_lprice and last_lprice > 0:
        sale_to_list = last_sprice / last_lprice

    return relist_count, dom_total, first_lprice, last_sprice, last_lprice, price_drop_total, sale_to_list


# ---------------------------------------------------------------------------
# Assessment momentum — % change over available years
# ---------------------------------------------------------------------------

def get_assessment_momentum(conn, cutsheet_url):
    """
    Returns % change in assessment between oldest and newest year available.
    Annualized if more than 1 year span.
    """
    rows = conn.execute(
        """
        SELECT year, assessment
        FROM assessments
        WHERE cutsheet_url = ? AND assessment IS NOT NULL
        ORDER BY year ASC
        """,
        (cutsheet_url,)
    ).fetchall()

    if len(rows) < 2:
        return None

    oldest_year, oldest_val = rows[0]
    newest_year, newest_val = rows[-1]

    if oldest_val == 0 or oldest_val is None:
        return None

    years_span = newest_year - oldest_year
    if years_span <= 0:
        return None

    total_pct = (newest_val - oldest_val) / oldest_val
    annualized = (1 + total_pct) ** (1 / years_span) - 1
    return annualized


# ---------------------------------------------------------------------------
# Deal scoring v1 — from STRATEGY.md
# ---------------------------------------------------------------------------

def score_property(prop, conn):
    """
    Returns a dict with deal_score, confidence_score, breakdown, segment_tags,
    and all derived metrics.
    """
    url          = prop["cutsheet_url"]
    list_price   = prop.get("list_price")
    assessment   = prop.get("assessment_current")
    bank_owned   = prop.get("bank_owned")
    foundation   = prop.get("foundation") or ""
    water        = prop.get("drinking_water") or ""
    sewer_val    = prop.get("sewer") or ""
    age          = prop.get("age")
    views        = prop.get("views")
    sqft         = prop.get("building_sqft")
    waterfront   = prop.get("waterfront") or ""
    zoning       = prop.get("zoning") or ""

    # Derived metrics
    (relist_count, dom_total, first_lprice, last_sprice,
     last_lprice, price_drop_total, sale_to_list) = get_history_metrics(conn, url)

    assessment_momentum = get_assessment_momentum(conn, url)

    assessment_ratio = None
    if list_price and assessment and assessment > 0:
        assessment_ratio = list_price / assessment

    price_per_sqft = None
    if list_price and sqft and sqft > 0:
        price_per_sqft = list_price / sqft

    views_per_dom = None
    if views and dom_total and dom_total > 0:
        views_per_dom = views / dom_total

    # -----------------------------------------------------------------------
    # Score accumulation
    # -----------------------------------------------------------------------
    deal_score = 0
    breakdown  = []

    def add(points, factor, note=""):
        nonlocal deal_score
        deal_score += points
        breakdown.append({"factor": factor, "points": points, "note": note})

    # Bank-owned
    if bank_owned == 1:
        add(30, "bank_owned", "Bank-owned property — motivated seller")

    # Relist count
    if relist_count is not None:
        if relist_count >= 3:
            add(20, "relist_3+", f"Relisted {relist_count} times — strong seller desperation signal")
        elif relist_count >= 2:
            add(10, "relist_2+", f"Relisted {relist_count} times — moderate desperation signal")

    # Days on market
    if dom_total is not None:
        if dom_total > 90:
            add(15, "dom_90+", f"DOM {dom_total} — stale listing")
        elif dom_total > 60:
            add(10, "dom_60+", f"DOM {dom_total} — above average days on market")

    # Price drop
    if price_drop_total is not None and first_lprice and first_lprice > 0:
        drop_pct = price_drop_total / first_lprice
        if drop_pct > 0.10:
            add(15, "price_drop_10%+", f"Price dropped {drop_pct:.1%} from original list")
        elif drop_pct > 0.05:
            add(10, "price_drop_5%+", f"Price dropped {drop_pct:.1%} from original list")

    # Below assessment
    if assessment_ratio is not None:
        if assessment_ratio < 0.85:
            add(30, "below_assessment_15%+", f"Listed {assessment_ratio:.2f}x assessment — well below assessed value")
        elif assessment_ratio < 0.95:
            add(20, "below_assessment_5%+", f"Listed {assessment_ratio:.2f}x assessment — below assessed value")

    # Assessment momentum (rising market)
    if assessment_momentum is not None and assessment_momentum > 0.08:
        add(10, "rising_assessment", f"Assessment rising {assessment_momentum:.1%}/yr — neighbourhood appreciating")

    # High views signal competition
    if views is not None:
        if views > 500:
            add(15, "views_500+", f"{views} views — high demand signal")
        elif views > 200:
            add(10, "views_200+", f"{views} views — notable demand")

    if views_per_dom is not None and views_per_dom > 5:
        add(5, "views_per_dom", f"{views_per_dom:.1f} views/day — strong traffic rate")

    # Waterfront bonus
    if waterfront and waterfront.lower() not in ("no", "none", ""):
        add(10, "waterfront", f"Waterfront: {waterfront}")

    # Risk deductions
    if age is not None and age > 80 and "stone" in foundation.lower():
        add(-15, "stone_foundation_old", f"Age {age} yrs, stone foundation — high maintenance risk")

    if "drilled well" in water.lower() or "dug well" in water.lower():
        add(-5, "private_water", f"Water: {water} — private supply risk")

    if "septic" in sewer_val.lower():
        add(-5, "septic", f"Sewer: {sewer_val} — septic maintenance risk")

    # Cap at 100
    deal_score = max(0, min(100, deal_score))

    # Confidence
    confidence_score, conf_reasons = compute_confidence(prop, relist_count, dom_total, price_drop_total)

    # -----------------------------------------------------------------------
    # Segment tags
    # -----------------------------------------------------------------------
    tags = []

    if bank_owned == 1:
        tags.append("bank_owned")

    if deal_score >= 50:
        tags.append("investor_lead")

    if relist_count is not None and relist_count >= 2 and dom_total is not None and dom_total > 60:
        tags.append("flipper_lead")

    if list_price and list_price < 200000:
        tags.append("value_buyer")

    if waterfront and waterfront.lower() not in ("no", "none", ""):
        tags.append("waterfront")

    if zoning and any(x in zoning.lower() for x in ("commercial", "mixed", "c-1", "c-2", "c1", "c2")):
        tags.append("developer_lead")

    if assessment_ratio is not None and assessment_ratio < 0.90:
        tags.append("below_assessment")

    if dom_total is not None and dom_total > 90 and deal_score >= 40:
        tags.append("motivated_seller")

    if confidence_score < 50:
        tags.append("low_confidence")

    return {
        "cutsheet_url":           url,
        "deal_score":             deal_score,
        "confidence_score":       confidence_score,
        "score_reason_breakdown": json.dumps(breakdown),
        "segment_tags":           "|".join(tags) if tags else None,
        "assessment_ratio":       assessment_ratio,
        "price_per_sqft":         price_per_sqft,
        "relist_count":           relist_count,
        "dom_total":              dom_total,
        "price_drop_total":       price_drop_total,
        "assessment_momentum":    assessment_momentum,
        "sale_to_list_ratio":     sale_to_list,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=== score.py ===")
    print(f"  Database: {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCORE_SCHEMA)

    props = conn.execute("SELECT * FROM properties").fetchall()
    total = len(props)
    print(f"  Scoring {total} properties ...")

    conn.execute("DELETE FROM scores")

    sql = """
        INSERT OR REPLACE INTO scores
            (cutsheet_url, deal_score, confidence_score, score_reason_breakdown,
             segment_tags, assessment_ratio, price_per_sqft, relist_count,
             dom_total, price_drop_total, assessment_momentum, sale_to_list_ratio)
        VALUES
            (:cutsheet_url, :deal_score, :confidence_score, :score_reason_breakdown,
             :segment_tags, :assessment_ratio, :price_per_sqft, :relist_count,
             :dom_total, :price_drop_total, :assessment_momentum, :sale_to_list_ratio)
    """

    batch = []
    for i, prop in enumerate(props, 1):
        result = score_property(dict(prop), conn)
        batch.append(result)
        if i % 500 == 0 or i == total:
            print(f"  [{i}/{total}] scored ...")
            conn.executemany(sql, batch)
            conn.commit()
            batch = []

    if batch:
        conn.executemany(sql, batch)
        conn.commit()

    # Summary stats
    print("\n--- Score Distribution ---")
    for label, lo, hi in [
        ("90-100 (exceptional)", 90, 100),
        ("70-89  (strong lead)", 70, 89),
        ("50-69  (solid lead)",  50, 69),
        ("30-49  (watch list)",  30, 49),
        ("0-29   (low signal)",   0, 29),
    ]:
        n = conn.execute(
            "SELECT COUNT(*) FROM scores WHERE deal_score BETWEEN ? AND ?", (lo, hi)
        ).fetchone()[0]
        print(f"  {label}: {n}")

    print("\n--- Top 10 Deals ---")
    rows = conn.execute(
        """
        SELECT s.deal_score, s.confidence_score, p.address, p.list_price,
               s.assessment_ratio, s.relist_count, s.dom_total, s.segment_tags
        FROM scores s JOIN properties p ON p.cutsheet_url = s.cutsheet_url
        ORDER BY s.deal_score DESC LIMIT 10
        """
    ).fetchall()
    for r in rows:
        ratio_str = f"ratio={r[4]:.2f}" if r[4] else "no-assessment"
        print(
            f"  [{r[0]}/conf:{r[1]}] {r[2]}  ${r[3]:,.0f}  "
            f"{ratio_str}  relists={r[5]}  DOM={r[6]}  [{r[7]}]"
        )

    conn.close()
    print("\nDone. Run export_top_deals.py to generate dashboard data.")


if __name__ == "__main__":
    main()
