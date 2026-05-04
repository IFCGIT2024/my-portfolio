"""
export_top_deals.py — Export scored deals to JSON for the dashboard.

Usage:
    python export_top_deals.py

Outputs:
    dashboard/deals.json  — top 500 deals by deal_score
    dashboard/stats.json  — summary stats
"""

import sqlite3
import json
import os

BASE    = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE, "..", "data", "properties.sqlite")
OUT_DIR = os.path.join(BASE, "..", "dashboard")

os.makedirs(OUT_DIR, exist_ok=True)


def safe(v):
    if v is None:
        return None
    if isinstance(v, float) and (v != v):  # NaN check
        return None
    return v


def main():
    print("=== export_top_deals.py ===")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    # --- Top 500 deals ---
    rows = conn.execute("""
        SELECT
            s.cutsheet_url,
            s.deal_score,
            s.confidence_score,
            s.score_reason_breakdown,
            s.segment_tags,
            s.assessment_ratio,
            s.price_per_sqft,
            s.relist_count,
            s.dom_total,
            s.price_drop_total,
            s.assessment_momentum,
            s.sale_to_list_ratio,
            p.address,
            p.list_price,
            p.bedrooms,
            p.bathrooms,
            p.building_sqft,
            p.lot_size_sqft,
            p.age,
            p.property_type,
            p.style,
            p.foundation,
            p.roof,
            p.exterior,
            p.drinking_water,
            p.sewer,
            p.heating_cooling,
            p.fuel_supply,
            p.bank_owned,
            p.assessment_current,
            p.tax_expense,
            p.tax_rate,
            p.aan,
            p.views,
            p.unique_users,
            p.waterfront,
            p.zoning,
            p.polling_district,
            p.listed_by,
            p.historical_cutsheet_urls
        FROM scores s
        JOIN properties p ON p.cutsheet_url = s.cutsheet_url
        ORDER BY s.deal_score DESC, s.confidence_score DESC
        LIMIT 500
    """).fetchall()

    deals = []
    for r in rows:
        d = dict(r)
        # Parse score breakdown from JSON string
        try:
            d["score_reason_breakdown"] = json.loads(d["score_reason_breakdown"] or "[]")
        except Exception:
            d["score_reason_breakdown"] = []
        # Parse segment tags into array
        tags = d.get("segment_tags") or ""
        d["segment_tags"] = tags.split("|") if tags else []
        # Parse historical URLs into array
        hist = d.get("historical_cutsheet_urls") or ""
        d["historical_cutsheet_urls"] = hist.split("|") if hist else []
        deals.append({k: safe(v) for k, v in d.items()})

    # Write deals to data.js (works with file:// — no server needed)
    deals_js = "window.DEALS = " + json.dumps(deals, indent=2) + ";"
    with open(os.path.join(OUT_DIR, "deals.json"), "w", encoding="utf-8") as f:
        json.dump(deals, f, indent=2)
    print(f"  Wrote {len(deals)} deals to dashboard/deals.json")

    # --- Summary stats ---
    total = conn.execute("SELECT COUNT(*) FROM scores").fetchone()[0]
    bank_owned_count = conn.execute(
        "SELECT COUNT(*) FROM scores s JOIN properties p ON p.cutsheet_url = s.cutsheet_url WHERE p.bank_owned = 1"
    ).fetchone()[0]
    below_assessment_count = conn.execute(
        "SELECT COUNT(*) FROM scores WHERE assessment_ratio < 1.0 AND assessment_ratio IS NOT NULL"
    ).fetchone()[0]
    high_score_count = conn.execute(
        "SELECT COUNT(*) FROM scores WHERE deal_score >= 50"
    ).fetchone()[0]
    avg_score = conn.execute(
        "SELECT AVG(deal_score) FROM scores"
    ).fetchone()[0]

    segment_counts = {}
    for tag in ["investor_lead", "flipper_lead", "value_buyer", "developer_lead",
                "below_assessment", "motivated_seller", "waterfront", "bank_owned", "low_confidence"]:
        n = conn.execute(
            "SELECT COUNT(*) FROM scores WHERE segment_tags LIKE ?",
            (f"%{tag}%",)
        ).fetchone()[0]
        segment_counts[tag] = n

    dist = {}
    for label, lo, hi in [
        ("90_100", 90, 100),
        ("70_89",  70, 89),
        ("50_69",  50, 69),
        ("30_49",  30, 49),
        ("0_29",    0, 29),
    ]:
        dist[label] = conn.execute(
            "SELECT COUNT(*) FROM scores WHERE deal_score BETWEEN ? AND ?", (lo, hi)
        ).fetchone()[0]

    stats = {
        "total_properties":     total,
        "bank_owned":           bank_owned_count,
        "below_assessment":     below_assessment_count,
        "high_score_50plus":    high_score_count,
        "avg_deal_score":       round(avg_score, 1) if avg_score else None,
        "score_distribution":   dist,
        "segment_counts":       segment_counts,
    }

    with open(os.path.join(OUT_DIR, "stats.json"), "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)
    print(f"  Wrote stats to dashboard/stats.json")

    # Write combined data.js for direct file:// loading
    data_js = (
        "window.DEALS = " + json.dumps(deals) + ";\n"
        "window.STATS = " + json.dumps(stats) + ";\n"
    )
    with open(os.path.join(OUT_DIR, "data.js"), "w", encoding="utf-8") as f:
        f.write(data_js)
    print(f"  Wrote dashboard/data.js (for file:// use)")

    conn.close()
    print("\nDone. Open dashboard/index.html to view.")


if __name__ == "__main__":
    main()
