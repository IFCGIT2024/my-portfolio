"""02_pii_scanner.py — finds PII candidates by combining metadata + value patterns.

Mirrors what real classifiers (1touch.io, Macie, Presidio) do:
  1. Walk every column in the schema.
  2. Match column NAME against known patterns (cheap, high recall).
  3. Sample VALUES and match against regexes (slower, high precision).
  4. Score the combination.
  5. Write proposed labels into a staging table for human review.

Usage:
    python 02_pii_scanner.py             # writes findings
    python 02_pii_scanner.py --dry-run   # prints findings, writes nothing
"""
from __future__ import annotations
import argparse
import re
import json
from rich.console import Console
from rich.table import Table
from _db import connect

console = Console()
SAMPLE_LIMIT = 25
TARGET_SCHEMA = "bank"


def fetch_rules(cur) -> list[dict]:
    cur.execute("""
        SELECT rule_name, pii_category, suggested_label,
               column_pattern, value_regex, base_confidence
        FROM bank.classification_rules
        WHERE enabled = TRUE
    """)
    return [
        dict(rule_name=r[0], pii_category=r[1], suggested_label=r[2],
             column_pattern=r[3], value_regex=r[4], base_confidence=float(r[5]))
        for r in cur.fetchall()
    ]


def fetch_columns(cur) -> list[tuple[str, str, str, str]]:
    cur.execute("""
        SELECT c.table_schema, c.table_name, c.column_name, c.data_type
        FROM information_schema.columns c
        JOIN information_schema.tables  t
          ON t.table_schema = c.table_schema
         AND t.table_name   = c.table_name
         AND t.table_type   = 'BASE TABLE'
        WHERE c.table_schema = %s
        ORDER BY c.table_name, c.ordinal_position
    """, (TARGET_SCHEMA,))
    return cur.fetchall()


def sample_values(cur, schema: str, table: str, column: str) -> list[str]:
    """Best-effort value sampling. Cast to text so any type works."""
    try:
        cur.execute(
            f'SELECT "{column}"::text FROM "{schema}"."{table}" '
            f'WHERE "{column}" IS NOT NULL ORDER BY random() LIMIT {SAMPLE_LIMIT}'
        )
        return [r[0] for r in cur.fetchall() if r[0] is not None]
    except Exception:
        return []


def column_name_match(column: str, pattern: str | None) -> bool:
    if not pattern:
        return False
    # Use Postgres-style ILIKE: % is wildcard
    rx = "^" + pattern.replace("%", ".*") + "$"
    return re.fullmatch(rx, column, flags=re.IGNORECASE) is not None


def value_match_ratio(values: list[str], regex: str | None) -> float:
    if not regex or not values:
        return 0.0
    rx = re.compile(regex)
    hits = sum(1 for v in values if rx.search(v))
    return hits / len(values)


def score(rule: dict, name_hit: bool, value_ratio: float) -> float:
    """Combine name match + value match into a confidence score in [0,1]."""
    base = rule["base_confidence"]
    if name_hit and value_ratio >= 0.5:
        return min(0.99, base + 0.05)            # both signals → boost
    if name_hit and value_ratio == 0.0:
        return base * 0.85                       # name-only → discount
    if not name_hit and value_ratio >= 0.7:
        return min(0.95, base * 0.9 + value_ratio * 0.1)  # value-only → moderate
    if name_hit:
        return base
    return value_ratio * base


def scan(dry_run: bool) -> None:
    findings: list[dict] = []
    with connect() as conn, conn.cursor() as cur:
        rules = fetch_rules(cur)
        console.print(f"[dim]Loaded {len(rules)} rules.[/]")

        for schema, table, column, dtype in fetch_columns(cur):
            samples = sample_values(cur, schema, table, column)
            for rule in rules:
                name_hit = column_name_match(column, rule["column_pattern"])
                v_ratio = value_match_ratio(samples, rule["value_regex"])
                conf = score(rule, name_hit, v_ratio)
                if conf < 0.55:
                    continue
                findings.append(dict(
                    schema=schema, table=table, column=column, dtype=dtype,
                    rule=rule["rule_name"],
                    label=rule["suggested_label"],
                    pii_category=rule["pii_category"],
                    confidence=round(conf, 3),
                    name_hit=name_hit,
                    value_ratio=round(v_ratio, 2),
                ))

    # ── Display ──
    findings.sort(key=lambda f: f["confidence"], reverse=True)
    t = Table(title="PII candidates", show_lines=False, header_style="bold cyan")
    for col in ("schema", "table", "column", "rule", "label", "conf", "name", "values"):
        t.add_column(col)
    for f in findings[:40]:
        t.add_row(
            f["schema"], f["table"], f["column"], f["rule"], f["label"],
            f"{f['confidence']:.2f}",
            "✓" if f["name_hit"] else "·",
            f"{f['value_ratio']:.0%}",
        )
    console.print(t)
    console.print(f"[bold]{len(findings)}[/] total candidates above threshold.")

    if dry_run:
        console.print("[yellow]Dry run — nothing written.[/]")
        return

    # ── Write candidates as audit_findings (human-reviewable) ──
    with connect() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM bank.audit_findings WHERE category = 'pii_candidate'")
        for f in findings:
            sev = "high" if f["confidence"] >= 0.85 else "medium" if f["confidence"] >= 0.7 else "low"
            cur.execute("""
                INSERT INTO bank.audit_findings
                  (severity, category, schema_name, table_name, column_name, summary, evidence)
                VALUES (%s, 'pii_candidate', %s, %s, %s, %s, %s::jsonb)
            """, (
                sev, f["schema"], f["table"], f["column"],
                f"Rule '{f['rule']}' suggests {f['label']} (confidence {f['confidence']:.2f})",
                json.dumps({
                    "rule": f["rule"], "pii_category": f["pii_category"],
                    "confidence": f["confidence"], "name_hit": f["name_hit"],
                    "value_match_ratio": f["value_ratio"],
                }),
            ))
    console.print(f"[bold green]\u2713 Wrote {len(findings)} findings to bank.audit_findings.[/]")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()
    scan(args.dry_run)


if __name__ == "__main__":
    main()
