"""
ViewPoint Property Scraper
Reads forsale_urls.csv (cutsheet URLs) and scrapes every property:
  - HTML: beds, baths, sqft, price, type, zoning, civic, all detail fields
  - API: taxes (19yr assessment history), history (sale prices/DOM), insight (views)

Output: properties.csv    (one row per listing)
        assessments.csv   (one row per year per property)
        mls_history.csv   (one row per past MLS listing per property)

Supports resume -- skips cutsheet URLs already in properties.csv.
Safe against commercial/missing data -- every field defaults to None.

Run: python scrape_properties.py
     python scrape_properties.py forsale_urls.csv   (custom input)
"""

import requests
import re
import csv
import time
import os
import sys
from bs4 import BeautifulSoup

# -- Config -------------------------------------------------------------------
BASE       = "https://www.viewpoint.ca"
CLIENT_VER = 23235
INPUT_CSV  = sys.argv[1] if len(sys.argv) > 1 else "forsale_urls.csv"
OUT_PROPS  = "properties.csv"
OUT_ASSESS = "assessments.csv"
OUT_HIST   = "mls_history.csv"
DELAY      = 1.5   # seconds between properties

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,*/*",
}
API_HEADERS = {
    **HEADERS,
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "X-Requested-With": "XMLHttpRequest",
}

# -- CSV column schemas -------------------------------------------------------
PROP_COLS = [
    "cutsheet_url", "pid", "class_id", "listing_id", "listing_class_id",
    "address", "list_price", "bedrooms", "bathrooms", "building_sqft",
    "lot_size_sqft", "property_type", "style", "building_style",
    "building_dimensions", "age", "bathrooms_fh", "total_living_area",
    "prov_parcel_size", "rental_income",
    "roof", "exterior", "foundation", "basement", "flooring",
    "heating_cooling", "fireplace", "pool", "fuel_supply",
    "drinking_water", "sewer", "has_garage", "parking",
    "waterfront", "water_access_view", "property_features", "land_features",
    "utilities", "appliances", "inclusions", "exclusions", "rental_equipment",
    "listed_by", "has_pcds", "betterment_charges", "bank_owned",
    "zoning", "mls_zoning", "polling_district", "waste_collection", "by_law_area",
    "assessment_current", "tax_expense", "tax_rate", "aan",
    "views", "unique_users",
    "historical_cutsheet_urls",
    "scrape_error",
]

ASSESS_COLS = ["cutsheet_url", "pid", "year", "assessment", "taxes"]
HIST_COLS   = [
    "cutsheet_url", "pid", "listing_id", "class_id",
    "ldate", "sdate", "expdate", "dom", "lprice", "sprice", "stid",
]

# -- Helpers ------------------------------------------------------------------
def label_val(soup, label_text, skip_template=False):
    for el in soup.find_all(class_="cutsheet-detail-item-label"):
        if label_text.lower() in el.get_text(strip=True).lower():
            val_el = el.find_next_sibling(class_="cutsheet-detail-item-value")
            if val_el:
                val = val_el.get_text(" ", strip=True)
                if skip_template and "{{" in val:
                    continue
                return val
    return None

def safe_api(session, url, nonce_fallback=None):
    try:
        r = session.get(url, headers=API_HEADERS, timeout=15)
        data = r.json()
        if data.get("status") == "success":
            return data, data.get("nonce", nonce_fallback)
        return {}, nonce_fallback
    except Exception:
        return {}, nonce_fallback

# -- Scrape one cutsheet URL --------------------------------------------------
def scrape(cutsheet_url, session):
    result      = {col: None for col in PROP_COLS}
    result["cutsheet_url"] = cutsheet_url
    assessments = []
    mls_rows    = []

    try:
        m = re.search(r"/cutsheet/(\d+)/(\d+)/([^/?#]+)", cutsheet_url)
        if not m:
            result["scrape_error"] = "bad_url"
            return result, [], []
        listing_id       = m.group(1)
        listing_class_id = m.group(2)
        slug             = m.group(3)

        r = session.get(cutsheet_url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            result["scrape_error"] = f"http_{r.status_code}"
            return result, [], []
        html = r.text
        soup = BeautifulSoup(html, "html.parser")

        nb     = re.findall(r"NONCES:\s*\[([^\]]+)\]", html)
        nonces = re.findall(r'["\']([a-f0-9]{32})["\']', nb[0]) if nb else []
        if not nonces:
            result["scrape_error"] = "no_nonce"
            return result, [], []
        nonce = nonces[0]

        pid_m    = re.search(r'["\']?(?:parcel_)?pid["\']?\s*[:=]\s*["\']?(\d{8})', html)
        pid      = pid_m.group(1) if pid_m else None
        class_id = listing_class_id

        result["listing_id"]       = listing_id
        result["listing_class_id"] = listing_class_id
        result["pid"]              = pid
        result["class_id"]         = class_id

        # Meta fields
        desc_tag = soup.find("meta", attrs={"name": "description"})
        kw_tag   = soup.find("meta", attrs={"name": "keywords"})
        desc = desc_tag.get("content", "") if desc_tag else ""
        kw   = kw_tag.get("content", "")  if kw_tag  else ""

        beds_m  = re.search(r"(\d+)\s*bedrooms?",  kw + " " + desc, re.I)
        baths_m = re.search(r"(\d+)\s*bathrooms?", kw + " " + desc, re.I)
        sqft_m  = re.search(r"([\d,]+)\s*sqft", desc, re.I)
        type_m  = re.search(r"(?:^|,\s*)mls,\s*([^,]+)", kw, re.I)
        if not type_m:
            type_m = re.search(r"(Single Family|Multi Family|Vacant Land|Mobile Home|Duplex|Triplex)", kw, re.I)
        price_m = re.search(r"\$([\d,]{5,})", html[:8000])

        result["bedrooms"]      = beds_m.group(1)  if beds_m  else None
        result["bathrooms"]     = baths_m.group(1) if baths_m else None
        result["building_sqft"] = sqft_m.group(1).replace(",", "") if sqft_m else None
        result["list_price"]    = price_m.group(1).replace(",", "") if price_m else None

        type_label  = label_val(soup, "Type")
        style_label = label_val(soup, "Style")
        result["property_type"] = type_m.group(1).strip() if type_m else (type_label or style_label)

        h1 = soup.find("h1")
        result["address"] = h1.get_text(strip=True) if h1 else slug.replace("-", " ")

        lot_entry = soup.find(class_="lot-size")
        if lot_entry:
            parent_span = lot_entry.find_next_sibling("span")
            if parent_span:
                divs = parent_span.find_all("div")
                if len(divs) >= 2:
                    lot_m = re.search(r"([\d,]+)", divs[1].get_text())
                    result["lot_size_sqft"] = lot_m.group(1).replace(",", "") if lot_m else None

        # Civic
        result["zoning"]           = label_val(soup, "Zoning", skip_template=True)
        result["mls_zoning"]       = label_val(soup, "MLS Zoning") or label_val(soup, "MLS")
        result["polling_district"] = label_val(soup, "Polling District")
        result["waste_collection"] = label_val(soup, "Waste Collection")
        result["by_law_area"]      = label_val(soup, "By-Law Area") or label_val(soup, "Bylaw Area")

        # Construction / detail fields
        result["style"]               = label_val(soup, "Style")
        result["building_style"]      = label_val(soup, "Building Style")
        result["building_dimensions"] = label_val(soup, "Building Dimensions")
        result["age"]                 = label_val(soup, "Age")
        result["bathrooms_fh"]        = label_val(soup, "Bathrooms")
        result["total_living_area"]   = label_val(soup, "Total Living Area")
        result["prov_parcel_size"]    = label_val(soup, "Prov. Parcel Size")
        result["rental_income"]       = label_val(soup, "Rental Income")
        result["roof"]                = label_val(soup, "Roof")
        result["exterior"]            = label_val(soup, "Exterior")
        result["foundation"]          = label_val(soup, "Foundation")
        result["basement"]            = label_val(soup, "Basement")
        result["flooring"]            = label_val(soup, "Flooring")
        result["heating_cooling"]     = label_val(soup, "Heating")
        result["fireplace"]           = label_val(soup, "Fireplace")
        result["pool"]                = label_val(soup, "Pool")
        result["fuel_supply"]         = label_val(soup, "Fuel Supply")
        result["drinking_water"]      = label_val(soup, "Drinking Water")
        result["sewer"]               = label_val(soup, "Sewer")
        result["has_garage"]          = label_val(soup, "Has Garage")
        result["parking"]             = label_val(soup, "Parking")
        result["waterfront"]          = label_val(soup, "Waterfront")
        result["water_access_view"]   = label_val(soup, "Water Access")
        result["property_features"]   = label_val(soup, "Property Features")
        result["land_features"]       = label_val(soup, "Land Features")
        result["utilities"]           = label_val(soup, "Utilities")
        result["appliances"]          = label_val(soup, "Appliances")
        result["inclusions"]          = label_val(soup, "Inclusions")
        result["exclusions"]          = label_val(soup, "Exclusions")
        result["rental_equipment"]    = label_val(soup, "Rental Equipment")
        result["listed_by"]           = label_val(soup, "Listed By")
        result["has_pcds"]            = label_val(soup, "Has PCDS") or label_val(soup, "PCDS")
        result["betterment_charges"]  = label_val(soup, "Betterment")
        result["bank_owned"]          = label_val(soup, "Bank Owned")

        # API: property/taxes
        if pid:
            data, nonce = safe_api(
                session,
                f"{BASE}/api/v2/property/taxes?pid={pid}&class_id={class_id}"
                f"&CLIENT_VER={CLIENT_VER}&nonce={nonce}",
                nonce
            )
            if data:
                taxes        = data.get("taxes", {})
                info         = taxes.get("info", {})
                current_year = str(taxes.get("current_year", ""))
                all_assess   = taxes.get("assessments", {})
                result["assessment_current"] = all_assess.get(current_year, {}).get("assessment")
                result["tax_expense"]        = info.get("tax_expense")
                result["tax_rate"]           = info.get("rate")
                result["aan"]                = info.get("aan")
                for yr, vals in all_assess.items():
                    assessments.append({
                        "cutsheet_url": cutsheet_url,
                        "pid":          pid,
                        "year":         yr,
                        "assessment":   vals.get("assessment"),
                        "taxes":        vals.get("taxes"),
                    })

        # API: property/history
        data, nonce = safe_api(
            session,
            f"{BASE}/api/v2/property/history?type=listing&pid={pid}&class_id={class_id}"
            f"&listing_id={listing_id}&listing_class_id={listing_class_id}"
            f"&CLIENT_VER={CLIENT_VER}&nonce={nonce}",
            nonce
        )
        if data:
            mls       = data.get("history", {}).get("mls_history", [])
            hist_urls = []
            for entry in mls:
                h_lid  = entry.get("listing_id")
                h_cid  = entry.get("class_id")
                h_slug = entry.get("seo_address", "")
                if h_lid and h_cid and h_slug and h_lid != listing_id:
                    hist_urls.append(f"{BASE}/cutsheet/{h_lid}/{h_cid}/{h_slug}")
                mls_rows.append({
                    "cutsheet_url": cutsheet_url,
                    "pid":          pid,
                    "listing_id":   h_lid,
                    "class_id":     h_cid,
                    "ldate":        str(entry.get("ldate", ""))[:10],
                    "sdate":        str(entry.get("sdate", ""))[:10] if entry.get("sdate") else None,
                    "expdate":      str(entry.get("expdate", ""))[:10] if entry.get("expdate") else None,
                    "dom":          entry.get("dom"),
                    "lprice":       entry.get("lprice"),
                    "sprice":       entry.get("sprice"),
                    "stid":         entry.get("stid"),
                })
            result["historical_cutsheet_urls"] = "|".join(hist_urls)

        # API: listing/insight
        data, nonce = safe_api(
            session,
            f"{BASE}/api/v2/listing/insight?class_id={listing_class_id}&listing_id={listing_id}"
            f"&CLIENT_VER={CLIENT_VER}&nonce={nonce}",
            nonce
        )
        if data:
            insight = data.get("insight", {})
            result["views"]        = insight.get("views")
            result["unique_users"] = insight.get("users")

    except Exception as e:
        result["scrape_error"] = str(e)[:200]

    return result, assessments, mls_rows

# -- Entry point --------------------------------------------------------------
def main():
    print("=== ViewPoint Property Scraper ===")
    print(f"  Input:  {INPUT_CSV}")
    print(f"  Output: {OUT_PROPS}, {OUT_ASSESS}, {OUT_HIST}")

    done = set()
    if os.path.exists(OUT_PROPS):
        with open(OUT_PROPS, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                done.add(row.get("cutsheet_url", ""))
        print(f"  Resuming: {len(done)} properties already scraped")

    if not os.path.exists(INPUT_CSV):
        print(f"ERROR: {INPUT_CSV} not found. Run crawl_forsale_urls.py first.")
        return

    with open(INPUT_CSV, newline="", encoding="utf-8") as f:
        all_rows = list(csv.DictReader(f))

    cutsheet_urls = []
    seen = set()
    for row in all_rows:
        url = row.get("cutsheet_url") or row.get("property_url", "")
        if url and url not in done and url not in seen:
            cutsheet_urls.append(url)
            seen.add(url)

    print(f"  {len(cutsheet_urls)} properties to scrape (after dedup + skip done)")

    write_props  = not os.path.exists(OUT_PROPS)  or os.path.getsize(OUT_PROPS) == 0
    write_assess = not os.path.exists(OUT_ASSESS) or os.path.getsize(OUT_ASSESS) == 0
    write_hist   = not os.path.exists(OUT_HIST)   or os.path.getsize(OUT_HIST) == 0

    f_props  = open(OUT_PROPS,  "a", newline="", encoding="utf-8")
    f_assess = open(OUT_ASSESS, "a", newline="", encoding="utf-8")
    f_hist   = open(OUT_HIST,   "a", newline="", encoding="utf-8")

    w_props  = csv.DictWriter(f_props,  fieldnames=PROP_COLS,   extrasaction="ignore")
    w_assess = csv.DictWriter(f_assess, fieldnames=ASSESS_COLS, extrasaction="ignore")
    w_hist   = csv.DictWriter(f_hist,   fieldnames=HIST_COLS,   extrasaction="ignore")

    if write_props:  w_props.writeheader()
    if write_assess: w_assess.writeheader()
    if write_hist:   w_hist.writeheader()

    session = requests.Session()
    session.headers.update(HEADERS)

    ok = err = 0
    for i, url in enumerate(cutsheet_urls, 1):
        print(f"[{i}/{len(cutsheet_urls)}] {url.split('/')[-1]}", end=" ... ", flush=True)
        result, assessments, mls_rows = scrape(url, session)

        w_props.writerow(result)
        for a in assessments:
            w_assess.writerow(a)
        for h in mls_rows:
            w_hist.writerow(h)

        if result.get("scrape_error"):
            print(f"ERROR: {result['scrape_error']}")
            err += 1
        else:
            print(f"OK  {result.get('address', '?')}  ${result.get('list_price', '?')}")
            ok += 1

        if i % 10 == 0:
            f_props.flush(); f_assess.flush(); f_hist.flush()

        time.sleep(DELAY)

    f_props.close(); f_assess.close(); f_hist.close()
    print(f"\nDone. {ok} OK, {err} errors.")

if __name__ == "__main__":
    main()
