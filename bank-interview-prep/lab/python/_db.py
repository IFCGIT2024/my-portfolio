"""Shared DB connection helper. Reads creds from ../.env (or environment).

Usage:
    from _db import connect
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1")
"""
from __future__ import annotations
import os
import pathlib
import psycopg
from dotenv import load_dotenv

# Load lab/.env if present
_ENV_PATH = pathlib.Path(__file__).resolve().parent.parent / ".env"
if _ENV_PATH.exists():
    load_dotenv(_ENV_PATH)


def connect(role: str = "owner") -> psycopg.Connection:
    """Open a Postgres connection.

    role:
      'owner'           -> superuser-equivalent (default — for setup/scanning)
      'analyst_chloe'   -> read-only on pseudonymized views
      'privacy_chloe'   -> read all + DSAR updates
      'dspm_aisha'      -> read all + write data_catalog/audit_findings
    """
    if role == "owner":
        user = os.environ.get("POSTGRES_USER", "dga")
        pwd = os.environ.get("POSTGRES_PASSWORD", "dga")
    else:
        user = role
        pwd = {
            "analyst_chloe": "lab_chloe_2026",
            "privacy_chloe": "lab_privacy_2026",
            "dspm_aisha":    "lab_dspm_2026",
        }[role]

    return psycopg.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        port=int(os.environ.get("DB_PORT", 55432)),
        dbname=os.environ.get("POSTGRES_DB", "dataguard"),
        user=user,
        password=pwd,
        autocommit=True,
    )
