"""05_audit_report.py — produces a Markdown coverage + access-anomaly report.

This is the kind of monthly artefact a Compliance Officer gives to a CISO.

Run:
    python 05_audit_report.py             # prints to stdout
    python 05_audit_report.py -o report.md
"""
from __future__ import annotations
import argparse
import datetime as dt
from io import StringIO
from rich.console import Console
from _db import connect

console = Console()


def render() -> str:
    out = StringIO()
    p = lambda *a: print(*a, file=out)
    p(f"# Classification & Access Audit — {dt.date.today().isoformat()}\n")

    with connect() as conn, conn.cursor() as cur:
        # Coverage
        cur.execute("""
          SELECT table_name, total_columns, ok_columns, unclassified, needs_review, stale, coverage_pct
          FROM bank.v_coverage_by_table
          ORDER BY coverage_pct ASC
        """)
        rows = cur.fetchall()
        p("## 1. Classification coverage by table\n")
        p("| Table | Cols | OK | Unclassified | Review | Stale | Coverage |")
        p("|---|---:|---:|---:|---:|---:|---:|")
        for r in rows:
            p(f"| `bank.{r[0]}` | {r[1]} | {r[2]} | {r[3]} | {r[4]} | {r[5]} | **{r[6]}%** |")
        total = sum(r[1] for r in rows); ok = sum(r[2] for r in rows)
        p(f"\n**Overall coverage:** {ok}/{total} columns = **{round(ok/total*100,1)}%**\n")

        # Access anomalies
        p("## 2. Access anomalies (last 30 days)\n")
        cur.execute("""
          SELECT full_name, department, table_accessed, access_count, total_rows
          FROM bank.v_restricted_access_30d
          ORDER BY access_count DESC LIMIT 10
        """)
        anomalies = cur.fetchall()
        if not anomalies:
            p("_No access on Restricted tables recorded in the last 30 days._\n")
        else:
            p("| Employee | Dept | Table | Accesses | Rows |")
            p("|---|---|---|---:|---:|")
            for n, d, t, c, r in anomalies:
                p(f"| {n} | {d} | `{t}` | {c} | {r:,} |")
            p("")

        # DSAR backlog
        p("## 3. DSAR backlog\n")
        cur.execute("""
          SELECT status, COUNT(*) AS n, MIN(deadline_at)::date AS earliest_deadline
          FROM bank.dsar_requests GROUP BY status ORDER BY status
        """)
        for status, n, earliest in cur.fetchall():
            p(f"- **{status}**: {n} requests (earliest deadline: {earliest})")

        # Open critical findings
        p("\n## 4. Open critical findings\n")
        cur.execute("""
          SELECT detected_at::date, summary
          FROM bank.audit_findings
          WHERE severity = 'critical'
          ORDER BY detected_at DESC LIMIT 10
        """)
        crits = cur.fetchall()
        if not crits:
            p("_No critical findings._")
        else:
            for d, s in crits:
                p(f"- `{d}` — {s}")

    return out.getvalue()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("-o", "--output")
    args = ap.parse_args()
    md = render()
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(md)
        console.print(f"[green]Wrote {args.output}[/]")
    else:
        print(md)


if __name__ == "__main__":
    main()
