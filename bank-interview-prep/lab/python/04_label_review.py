"""04_label_review.py — interactive CLI for the human-in-the-loop step.

This is the workflow a Privacy Analyst follows daily:
  - The auto-labeler proposes labels with confidence scores.
  - Anything below ~0.85 is queued for a human.
  - Reviewer ACCEPTS, OVERRIDES, or REJECTS each candidate.
  - Decisions are written back to data_catalog with classified_by='human'.

Usage:
    python 04_label_review.py
"""
from __future__ import annotations
from rich.console import Console
from rich.prompt import Prompt
from rich.table import Table
from _db import connect

console = Console()
LABELS = ["Public", "Internal", "Restricted", "Highly Restricted"]


def review_loop() -> None:
    with connect() as conn, conn.cursor() as cur:
        # Find candidates: auto-classified or proposed but below 0.85, plus untouched audit_findings
        cur.execute("""
            WITH proposals AS (
              SELECT af.schema_name, af.table_name, af.column_name,
                     (af.evidence->>'confidence')::numeric AS conf,
                     af.summary, af.evidence->>'rule' AS rule
              FROM bank.audit_findings af
              WHERE af.category='pii_candidate'
                AND (af.evidence->>'confidence')::numeric BETWEEN 0.55 AND 0.84
            )
            SELECT p.*, dc.classification_label
            FROM proposals p
            LEFT JOIN bank.data_catalog dc
              ON dc.schema_name=p.schema_name AND dc.table_name=p.table_name AND dc.column_name=p.column_name
            ORDER BY p.conf DESC
        """)
        queue = cur.fetchall()

        if not queue:
            console.print("[green]Nothing to review — queue is empty.[/]")
            return

        console.rule(f"[bold]Review queue: {len(queue)} candidates")
        for i, (schema, table, col, conf, summary, rule, current) in enumerate(queue, 1):
            t = Table(title=f"[{i}/{len(queue)}] {schema}.{table}.{col}", show_header=False)
            t.add_row("Rule",       rule)
            t.add_row("Confidence", f"{conf:.2f}")
            t.add_row("Suggestion", summary)
            t.add_row("Current",    current or "(unclassified)")
            console.print(t)

            choice = Prompt.ask(
                "[bold]Action[/] (a=accept, o=override, r=reject, s=skip, q=quit)",
                choices=["a", "o", "r", "s", "q"],
                default="s",
            )
            if choice == "q":
                break
            if choice == "s":
                continue
            if choice == "r":
                cur.execute("""
                  DELETE FROM bank.audit_findings
                  WHERE schema_name=%s AND table_name=%s AND column_name=%s AND category='pii_candidate'
                """, (schema, table, col))
                console.print("[yellow]Rejected — finding deleted.[/]")
                continue

            if choice == "o":
                label = Prompt.ask("Override label", choices=LABELS, default="Restricted")
            else:  # accept
                label = "Restricted" if "Restricted" in summary else "Internal" if "Internal" in summary else "Public"

            cur.execute("""
              INSERT INTO bank.data_catalog
                (schema_name, table_name, column_name,
                 classification_label, confidence_score,
                 classified_by, classified_at, last_reviewed_at,
                 notes)
              VALUES (%s,%s,%s,%s,%s,'human', now(), now(), %s)
              ON CONFLICT (schema_name, table_name, column_name)
              DO UPDATE SET classification_label = EXCLUDED.classification_label,
                            classified_by        = 'human',
                            confidence_score     = 1.000,
                            last_reviewed_at     = now(),
                            notes                = EXCLUDED.notes
            """, (schema, table, col, label, 1.000,
                  f"Human reviewed: {choice} (was rule '{rule}', conf {conf:.2f})"))
            console.print(f"[green]\u2713 {schema}.{table}.{col} -> {label}[/]")

    console.print("[bold]Review session ended.[/]")


if __name__ == "__main__":
    review_loop()
