#!/usr/bin/env python3
"""Export the existing SQLite records for the public, server-free directory."""
import json
import re
import sqlite3
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent


def export():
    with sqlite3.connect(f"file:{HERE / 'funding_database.db'}?mode=ro", uri=True) as connection:
        connection.row_factory = sqlite3.Row
        rows = [dict(row) for row in connection.execute('SELECT * FROM programs ORDER BY id')]
    programs = [row for row in rows if not str(row['id']).upper().startswith('TEMPLATE-')]
    dates = []
    for row in programs:
        match = re.match(r'[A-Za-z]+ \d{1,2}, \d{4}', row.get('last_verified') or '')
        if match:
            dates.append(datetime.strptime(match[0], '%B %d, %Y').date().isoformat())
    payload = {
        'schema_version': 1,
        'record_count': len(programs),
        'verification_period': {'start': min(dates), 'end': max(dates)} if dates else None,
        'programs': programs,
    }
    target = HERE / 'programs.json'
    target.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Exported {len(programs)} programs; excluded {len(rows) - len(programs)} template row(s).')


if __name__ == '__main__':
    export()
