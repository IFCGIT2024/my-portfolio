# Canadian funding database

A searchable research directory for Canadian housing, retrofit, and climate funding.

**[Open the directory](https://ifcgit2024.github.io/my-portfolio/canadian-funding-database/funding-portal.html)**

## Public site

The portal is a static app. It loads the adjacent `programs.json` file and filters it in the browser. It works on GitHub Pages without Python, Flask, a localhost service, or API credentials.

- 140 actual program records, with search, filters, sorting, and source links.
- Recorded status, exact listed location, sector, funding type, and organization eligibility filters.
- Amount filters apply to the **recorded maximum award**. Zero-valued source maximums mean unspecified amounts or non-cash support. Unknown maximums are excluded when an amount filter is active; blank limits are unbounded.
- Expandable eligibility, timing, duration, and verification notes for each record.
- Responsive filters and a downloadable JSON copy.

## Data provenance and limitations

`funding_database.db` is the existing source database. It contains 141 rows: 140 program records and one `TEMPLATE-001` placeholder. The public export excludes that placeholder and preserves every field of each program record. The SQLite source is unchanged by the exporter.

The records were marked verified on **15–16 June 2026**. These are saved research notes, not a live feed or a fresh verification of funding availability. Some records explicitly note broken provider links. The portal displays those notes, recorded deadlines, and provider URLs; it does not assert that all opportunities remain open or that every link is currently valid.

The interface normalizes stray non-letter characters in status labels for filtering (including the malformed closed-status marker); original values remain in the JSON and SQLite data. Where a URL field has trailing space-separated notes, only its leading HTTP(S) URL is used as the link. Locations are offered exactly as recorded, avoiding ambiguous province or national matching.

## Updating the public data

After editing the source database:

```sh
python3 canadian-funding-database/export_data.py
```

Run this from the repository root. The exporter uses only Python’s standard library, reads SQLite in read-only mode, sorts records by ID, computes the recorded verification period, and writes a deterministic `programs.json`. Commit both the database changes and the JSON export. **Python is an authoring tool, not a visitor requirement.**

For local preview, serve the repository with any static HTTP server and open `/canadian-funding-database/funding-portal.html`. Do not use a `file://` URL for testing JSON fetches.

## Optional developer API

`server.py` and `requirements.txt` are retained for existing scripts that use the Flask/SQLite API. The public portal no longer depends on it. To run the optional API from this directory:

```sh
pip install -r requirements.txt
python3 server.py
```

The original endpoints remain at `/api/programs`, `/api/programs/<id>`, and `/api/stats` on port 8000. The API reads the original database, so its totals can include the template row. Use the static export for the public directory.
