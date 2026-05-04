"""
load_db.py — Load scraped CSVs into SQLite with indexes.

Usage:
    python load_db.py

Reads:
    properties.csv
    assessments.csv
    mls_history.csv

Writes:
    properties.sqlite
"""

import csv
import sqlite3
import os

BASE     = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE, "..", "data")

DB_PATH = os.path.join(DATA_DIR, "properties.sqlite")

PROPS_CSV   = os.path.join(DATA_DIR, "properties.csv")
ASSESS_CSV  = os.path.join(DATA_DIR, "assessments.csv")
HIST_CSV    = os.path.join(DATA_DIR, "mls_history.csv")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def csv_rows(path):
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader), reader.fieldnames


def to_int(v):
    try:
        return int(v) if v not in (None, "") else None
    except (ValueError, TypeError):
        return None


def to_float(v):
    try:
        return float(v) if v not in (None, "") else None
    except (ValueError, TypeError):
        return None


def clean(v):
    """Return None for empty strings."""
    if v is None or v == "":
        return None
    return v


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------

SCHEMA = """
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS properties (
    -- identity
    cutsheet_url            TEXT PRIMARY KEY,
    pid                     TEXT,
    class_id                INTEGER,
    listing_id              TEXT,
    listing_class_id        INTEGER,

    -- listing basics
    address                 TEXT,
    list_price              REAL,
    bedrooms                INTEGER,
    bathrooms               REAL,
    building_sqft           REAL,
    lot_size_sqft           REAL,
    property_type           TEXT,
    style                   TEXT,
    building_style          TEXT,
    building_dimensions     TEXT,
    age                     INTEGER,
    bathrooms_fh            TEXT,
    total_living_area       TEXT,
    prov_parcel_size        TEXT,
    rental_income           TEXT,

    -- construction
    roof                    TEXT,
    exterior                TEXT,
    foundation              TEXT,
    basement                TEXT,
    flooring                TEXT,
    heating_cooling         TEXT,
    fireplace               TEXT,
    pool                    TEXT,
    fuel_supply             TEXT,
    drinking_water          TEXT,
    sewer                   TEXT,
    has_garage              TEXT,
    parking                 TEXT,

    -- location features
    waterfront              TEXT,
    water_access_view       TEXT,
    property_features       TEXT,
    land_features           TEXT,
    utilities               TEXT,
    appliances              TEXT,
    inclusions              TEXT,
    exclusions              TEXT,
    rental_equipment        TEXT,

    -- listing meta
    listed_by               TEXT,
    has_pcds                TEXT,
    betterment_charges      TEXT,
    bank_owned              INTEGER,    -- 0/1

    -- civic / zoning
    zoning                  TEXT,
    mls_zoning              TEXT,
    polling_district        TEXT,
    waste_collection        TEXT,
    by_law_area             TEXT,

    -- tax / assessment
    assessment_current      REAL,
    tax_expense             REAL,
    tax_rate                REAL,
    aan                     TEXT,

    -- engagement
    views                   INTEGER,
    unique_users            INTEGER,

    -- history references
    historical_cutsheet_urls TEXT,

    -- meta
    scrape_error            TEXT
);

CREATE TABLE IF NOT EXISTS assessments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    cutsheet_url TEXT NOT NULL,
    pid         TEXT,
    year        INTEGER,
    assessment  REAL,
    taxes       REAL,
    FOREIGN KEY (cutsheet_url) REFERENCES properties(cutsheet_url)
);

CREATE TABLE IF NOT EXISTS mls_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    cutsheet_url TEXT NOT NULL,
    pid         TEXT,
    listing_id  TEXT,
    class_id    INTEGER,
    ldate       TEXT,
    sdate       TEXT,
    expdate     TEXT,
    dom         INTEGER,
    lprice      REAL,
    sprice      REAL,
    stid        TEXT,
    FOREIGN KEY (cutsheet_url) REFERENCES properties(cutsheet_url)
);

CREATE INDEX IF NOT EXISTS idx_props_pid            ON properties(pid);
CREATE INDEX IF NOT EXISTS idx_props_listing_id     ON properties(listing_id);
CREATE INDEX IF NOT EXISTS idx_props_class_id       ON properties(class_id);
CREATE INDEX IF NOT EXISTS idx_props_list_price     ON properties(list_price);
CREATE INDEX IF NOT EXISTS idx_props_bank_owned     ON properties(bank_owned);
CREATE INDEX IF NOT EXISTS idx_props_assessment     ON properties(assessment_current);
CREATE INDEX IF NOT EXISTS idx_assess_cutsheet      ON assessments(cutsheet_url);
CREATE INDEX IF NOT EXISTS idx_assess_pid           ON assessments(pid);
CREATE INDEX IF NOT EXISTS idx_hist_cutsheet        ON mls_history(cutsheet_url);
CREATE INDEX IF NOT EXISTS idx_hist_pid             ON mls_history(pid);
"""


# ---------------------------------------------------------------------------
# Load properties
# ---------------------------------------------------------------------------

def load_properties(conn):
    rows, _ = csv_rows(PROPS_CSV)
    print(f"  Loading {len(rows)} property rows ...")

    conn.execute("DELETE FROM properties")

    sql = """
        INSERT OR REPLACE INTO properties VALUES (
            :cutsheet_url, :pid, :class_id, :listing_id, :listing_class_id,
            :address, :list_price, :bedrooms, :bathrooms, :building_sqft, :lot_size_sqft,
            :property_type, :style, :building_style, :building_dimensions, :age,
            :bathrooms_fh, :total_living_area, :prov_parcel_size, :rental_income,
            :roof, :exterior, :foundation, :basement, :flooring,
            :heating_cooling, :fireplace, :pool, :fuel_supply, :drinking_water,
            :sewer, :has_garage, :parking,
            :waterfront, :water_access_view, :property_features, :land_features,
            :utilities, :appliances, :inclusions, :exclusions, :rental_equipment,
            :listed_by, :has_pcds, :betterment_charges, :bank_owned,
            :zoning, :mls_zoning, :polling_district, :waste_collection, :by_law_area,
            :assessment_current, :tax_expense, :tax_rate, :aan,
            :views, :unique_users,
            :historical_cutsheet_urls, :scrape_error
        )
    """

    batch = []
    for r in rows:
        batch.append({
            "cutsheet_url":             clean(r.get("cutsheet_url")),
            "pid":                      clean(r.get("pid")),
            "class_id":                 to_int(r.get("class_id")),
            "listing_id":               clean(r.get("listing_id")),
            "listing_class_id":         to_int(r.get("listing_class_id")),
            "address":                  clean(r.get("address")),
            "list_price":               to_float(r.get("list_price")),
            "bedrooms":                 to_int(r.get("bedrooms")),
            "bathrooms":                to_float(r.get("bathrooms")),
            "building_sqft":            to_float(r.get("building_sqft")),
            "lot_size_sqft":            to_float(r.get("lot_size_sqft")),
            "property_type":            clean(r.get("property_type")),
            "style":                    clean(r.get("style")),
            "building_style":           clean(r.get("building_style")),
            "building_dimensions":      clean(r.get("building_dimensions")),
            "age":                      to_int(r.get("age")),
            "bathrooms_fh":             clean(r.get("bathrooms_fh")),
            "total_living_area":        clean(r.get("total_living_area")),
            "prov_parcel_size":         clean(r.get("prov_parcel_size")),
            "rental_income":            clean(r.get("rental_income")),
            "roof":                     clean(r.get("roof")),
            "exterior":                 clean(r.get("exterior")),
            "foundation":               clean(r.get("foundation")),
            "basement":                 clean(r.get("basement")),
            "flooring":                 clean(r.get("flooring")),
            "heating_cooling":          clean(r.get("heating_cooling")),
            "fireplace":                clean(r.get("fireplace")),
            "pool":                     clean(r.get("pool")),
            "fuel_supply":              clean(r.get("fuel_supply")),
            "drinking_water":           clean(r.get("drinking_water")),
            "sewer":                    clean(r.get("sewer")),
            "has_garage":               clean(r.get("has_garage")),
            "parking":                  clean(r.get("parking")),
            "waterfront":               clean(r.get("waterfront")),
            "water_access_view":        clean(r.get("water_access_view")),
            "property_features":        clean(r.get("property_features")),
            "land_features":            clean(r.get("land_features")),
            "utilities":                clean(r.get("utilities")),
            "appliances":               clean(r.get("appliances")),
            "inclusions":               clean(r.get("inclusions")),
            "exclusions":               clean(r.get("exclusions")),
            "rental_equipment":         clean(r.get("rental_equipment")),
            "listed_by":                clean(r.get("listed_by")),
            "has_pcds":                 clean(r.get("has_pcds")),
            "betterment_charges":       clean(r.get("betterment_charges")),
            "bank_owned":               to_int(r.get("bank_owned")),
            "zoning":                   clean(r.get("zoning")),
            "mls_zoning":               clean(r.get("mls_zoning")),
            "polling_district":         clean(r.get("polling_district")),
            "waste_collection":         clean(r.get("waste_collection")),
            "by_law_area":              clean(r.get("by_law_area")),
            "assessment_current":       to_float(r.get("assessment_current")),
            "tax_expense":              to_float(r.get("tax_expense")),
            "tax_rate":                 to_float(r.get("tax_rate")),
            "aan":                      clean(r.get("aan")),
            "views":                    to_int(r.get("views")),
            "unique_users":             to_int(r.get("unique_users")),
            "historical_cutsheet_urls": clean(r.get("historical_cutsheet_urls")),
            "scrape_error":             clean(r.get("scrape_error")),
        })

    conn.executemany(sql, batch)
    conn.commit()
    print(f"  -> {len(batch)} properties loaded.")


# ---------------------------------------------------------------------------
# Load assessments
# ---------------------------------------------------------------------------

def load_assessments(conn):
    rows, _ = csv_rows(ASSESS_CSV)
    print(f"  Loading {len(rows)} assessment rows ...")

    conn.execute("DELETE FROM assessments")

    sql = """
        INSERT INTO assessments (cutsheet_url, pid, year, assessment, taxes)
        VALUES (:cutsheet_url, :pid, :year, :assessment, :taxes)
    """

    batch = []
    for r in rows:
        batch.append({
            "cutsheet_url": clean(r.get("cutsheet_url")),
            "pid":          clean(r.get("pid")),
            "year":         to_int(r.get("year")),
            "assessment":   to_float(r.get("assessment")),
            "taxes":        to_float(r.get("taxes")),
        })

    conn.executemany(sql, batch)
    conn.commit()
    print(f"  -> {len(batch)} assessment rows loaded.")


# ---------------------------------------------------------------------------
# Load MLS history
# ---------------------------------------------------------------------------

def load_mls_history(conn):
    rows, _ = csv_rows(HIST_CSV)
    print(f"  Loading {len(rows)} MLS history rows ...")

    conn.execute("DELETE FROM mls_history")

    sql = """
        INSERT INTO mls_history
            (cutsheet_url, pid, listing_id, class_id, ldate, sdate, expdate,
             dom, lprice, sprice, stid)
        VALUES
            (:cutsheet_url, :pid, :listing_id, :class_id, :ldate, :sdate, :expdate,
             :dom, :lprice, :sprice, :stid)
    """

    batch = []
    for r in rows:
        batch.append({
            "cutsheet_url": clean(r.get("cutsheet_url")),
            "pid":          clean(r.get("pid")),
            "listing_id":   clean(r.get("listing_id")),
            "class_id":     to_int(r.get("class_id")),
            "ldate":        clean(r.get("ldate")),
            "sdate":        clean(r.get("sdate")),
            "expdate":      clean(r.get("expdate")),
            "dom":          to_int(r.get("dom")),
            "lprice":       to_float(r.get("lprice")),
            "sprice":       to_float(r.get("sprice")),
            "stid":         clean(r.get("stid")),
        })

    conn.executemany(sql, batch)
    conn.commit()
    print(f"  -> {len(batch)} MLS history rows loaded.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=== load_db.py ===")
    print(f"  Database: {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    conn.executescript(SCHEMA)

    load_properties(conn)
    load_assessments(conn)
    load_mls_history(conn)

    # Quick summary
    print("\n--- Summary ---")
    for table in ("properties", "assessments", "mls_history"):
        n = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        print(f"  {table}: {n} rows")

    conn.close()
    print("\nDone. SQLite database ready at properties.sqlite")


if __name__ == "__main__":
    main()
