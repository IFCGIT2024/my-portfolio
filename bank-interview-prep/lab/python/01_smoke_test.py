"""01_smoke_test.py — confirm the lab is wired up end-to-end.

Run:
    python 01_smoke_test.py
"""
from __future__ import annotations
from rich.console import Console
from rich.table import Table
from _db import connect

console = Console()


def main() -> None:
    console.rule("[bold]DataGuard Lab — Smoke Test")
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT current_database(), current_user, version()")
        db, user, version = cur.fetchone()
        console.print(f"Connected to [bold green]{db}[/] as [bold]{user}[/]")
        console.print(f"Server: [dim]{version.splitlines()[0]}[/]")

        cur.execute("""
            SELECT table_name,
                   (SELECT count(*) FROM bank.customers)    AS customers,
                   (SELECT count(*) FROM bank.accounts)     AS accounts,
                   (SELECT count(*) FROM bank.transactions) AS transactions,
                   (SELECT count(*) FROM bank.access_logs)  AS access_logs,
                   (SELECT count(*) FROM bank.data_catalog) AS catalog_rows
            FROM information_schema.tables
            WHERE table_schema = 'bank'
            LIMIT 1
        """)
        row = cur.fetchone()
        t = Table(title="Row counts", show_header=True, header_style="bold cyan")
        for label in ("customers", "accounts", "transactions", "access_logs", "catalog_rows"):
            t.add_column(label, justify="right")
        t.add_row(*[f"{n:,}" for n in row[1:]])
        console.print(t)

    console.print("[bold green]\u2713 Lab is healthy.[/] Run 02_pii_scanner.py next.")


if __name__ == "__main__":
    main()
