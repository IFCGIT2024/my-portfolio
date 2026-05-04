"""03_classifier_simulator.py — applies the highest-confidence findings as
proposed labels in data_catalog. This is a *simulation* of what the auto-label
phase of 1touch.io / Purview does: mass-apply with confidence scoring, leave
borderline cases for the human reviewer.

Run AFTER 02_pii_scanner.py.

Usage:
    python 03_classifier_simulator.py            # apply
    python 03_classifier_simulator.py --threshold 0.90
"""
from __future__ import annotations
import argparse
from rich.console import Console
from rich.table import Table
from _db import connect

console = Console()


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--threshold", type=float, default=0.85,
                   help="Auto-apply labels with confidence >= threshold (default 0.85).")
    args = p.parse_args()

    inserted = updated = 0
    with connect() as conn, conn.cursor() as cur:
        # Pull pending findings
        cur.execute("""
            SELECT schema_name, table_name, column_name,
                   (evidence->>'confidence')::numeric AS conf,
                   summary,
                   evidence->>'pii_category' AS pii_category,
                   evidence->>'rule' AS rule
            FROM bank.audit_findings
            WHERE category = 'pii_candidate'
              AND (evidence->>'confidence')::numeric >= %s
            ORDER BY conf DESC
        """, (args.threshold,))
        rows = cur.fetchall()

        for schema, table, col, conf, summary, pii_cat, rule in rows:
            label = "Restricted" if "Restricted" in summary else "Internal" if "Internal" in summary else None
            if label is None:
                continue

            cur.execute("""
                SELECT classification_label, classified_by, confidence_score
                FROM bank.data_catalog
                WHERE schema_name=%s AND table_name=%s AND column_name=%s
            """, (schema, table, col))
            existing = cur.fetchone()

            if existing is None:
                cur.execute("""
                    INSERT INTO bank.data_catalog
                      (schema_name, table_name, column_name,
                       classification_label, pii_category, confidence_score,
                       classified_by, classified_at, notes)
                    VALUES (%s,%s,%s,%s,%s,%s,'auto', now(), %s)
                """, (schema, table, col, label, pii_cat, float(conf),
                      f"Auto-applied by rule '{rule}'."))
                inserted += 1
            else:
                # Only overwrite if our confidence is higher AND prior was 'auto'
                prior_label, prior_by, prior_conf = existing
                if prior_by == "auto" and float(conf) > float(prior_conf):
                    cur.execute("""
                        UPDATE bank.data_catalog
                        SET classification_label=%s, pii_category=%s,
                            confidence_score=%s, classified_at=now(),
                            notes=%s
                        WHERE schema_name=%s AND table_name=%s AND column_name=%s
                    """, (label, pii_cat, float(conf),
                          f"Updated by rule '{rule}'.", schema, table, col))
                    updated += 1

    console.rule("[bold]Auto-classification complete")
    t = Table()
    t.add_column("Action"); t.add_column("Count", justify="right")
    t.add_row("New rows inserted", str(inserted))
    t.add_row("Existing rows refined", str(updated))
    console.print(t)
    console.print("Run [bold]04_label_review.py[/] to handle low-confidence rows manually.")


if __name__ == "__main__":
    main()
