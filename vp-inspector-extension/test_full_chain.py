"""
Full chain test: fetch everything for a property starting from a cutsheet URL.
  - HTML scrape: beds, baths, sqft, lot size, price, type, zoning, civic data
  - API: property/taxes  → assessment history, tax rate, AAN
  - API: property/history → listing price history, DOM, price changes, sold price

Run: python test_full_chain.py [cutsheet_or_property_url]
     python test_full_chain.py   (uses built-in test URL)
"""

import requests
import re
import json
import sys
from bs4 import BeautifulSoup

BASE = "https://www.viewpoint.ca"
CLIENT_VER = 23235

# Default: a residential property with full civic data
TEST_URL = sys.argv[1] if len(sys.argv) > 1 else \
    "https://www.viewpoint.ca/cutsheet/202604725/1/5673-Bilby-Street-Halifax"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,*/*",
}
API_HEADERS = {**HEADERS, "Accept": "application/json, text/javascript, */*; q=0.01",
               "X-Requested-With": "XMLHttpRequest"}

session = requests.Session()
session.headers.update(HEADERS)

result = {}

def label_val(soup, label_text, skip_template=False):
    """Find a cutsheet-detail-item-label by text and return its sibling value.
    skip_template=True skips un-rendered JS templates like {{...}}.
    Returns first match (or first non-template match if skip_template).
    """
    for el in soup.find_all(class_="cutsheet-detail-item-label"):
        if label_text.lower() in el.get_text(strip=True).lower():
            val_el = el.find_next_sibling(class_="cutsheet-detail-item-value")
            if val_el:
                val = val_el.get_text(" ", strip=True)
                if skip_template and '{{' in val:
                    continue
                return val
    return None

# ── STEP 1: Parse URL ──────────────────────────────────────────────────────────
print(f"\n{'='*65}")
print(f"  STEP 1: Parse URL")
print(f"{'='*65}")
print(f"  URL: {TEST_URL}")

pid = class_id = slug = listing_id = listing_class_id = None

m_cut  = re.search(r'/cutsheet/(\d+)/(\d+)/([^/?#]+)', TEST_URL)
m_prop = re.search(r'/show/property/(\d+)/(\d+)/([^/?#]+)', TEST_URL)

if m_cut:
    listing_id       = m_cut.group(1)
    listing_class_id = m_cut.group(2)
    slug             = m_cut.group(3)
    print(f"  Cutsheet URL -> listing_id={listing_id}  listing_class_id={listing_class_id}")
elif m_prop:
    pid      = m_prop.group(1)
    class_id = m_prop.group(2)
    slug     = m_prop.group(3)
    print(f"  Property URL -> pid={pid}  class_id={class_id}")
else:
    print("ERROR: unrecognised URL format"); sys.exit(1)

# ── STEP 2: Fetch page HTML → nonces + scrape all HTML fields ─────────────────
print(f"\n{'='*65}")
print(f"  STEP 2: Fetch page HTML + scrape")
print(f"{'='*65}")

r = session.get(TEST_URL, timeout=15)
print(f"  HTTP {r.status_code}  ({len(r.text):,} chars)")
html = r.text
soup = BeautifulSoup(html, "html.parser")

# Extract nonces
nb = re.findall(r'NONCES:\s*\[([^\]]+)\]', html)
nonces = re.findall(r'["\']([a-f0-9]{32})["\']', nb[0]) if nb else []
print(f"  Nonces: {len(nonces)} found")
if not nonces:
    print("  ERROR: no nonces — cannot continue"); sys.exit(1)
nonce = nonces[0]

# Extract PID and class_id from page JS if we started from a cutsheet URL
if not pid:
    pid_m = re.search(r'["\']?(?:parcel_)?pid["\']?\s*[:=]\s*["\']?(\d{8})', html)
    pid = pid_m.group(1) if pid_m else None
if not class_id:
    class_id = listing_class_id or "1"

# If we started from a property URL, find listing_id in HTML
if not listing_id:
    m2 = re.search(r'/cutsheet/(\d+)/(\d+)/', html)
    if m2:
        listing_id       = m2.group(1)
        listing_class_id = m2.group(2)

result.update({
    'url': TEST_URL, 'pid': pid, 'class_id': class_id,
    'listing_id': listing_id, 'listing_class_id': listing_class_id,
})
print(f"  pid={pid}  class_id={class_id}  listing_id={listing_id}")

# ── Scrape meta description: beds/baths/sqft/price/type ───────────────────────
desc = ""
desc_tag = soup.find("meta", attrs={"name": "description"})
if desc_tag:
    desc = desc_tag.get("content", "")
kw_tag = soup.find("meta", attrs={"name": "keywords"})
kw = kw_tag.get("content", "") if kw_tag else ""

# Beds / baths / sqft from keywords and description metas
beds_m  = re.search(r'(\d+)\s*bedrooms?', kw + " " + desc, re.I)
baths_m = re.search(r'(\d+)\s*bathrooms?', kw + " " + desc, re.I)
sqft_m  = re.search(r'([\d,]+)\s*sqft', desc, re.I)

# Property type: match specific MLS types embedded in keywords
# Keywords look like: "nova scotia homes for sale,nova scotia condos,mls,Single Family,Detached,2 Level,..."
# The actual type always follows "mls," in the keyword list
type_m = re.search(r'(?:^|,\s*)mls,\s*([^,]+)', kw, re.I)
if not type_m:
    type_m = re.search(r'(Single Family|Multi Family|Vacant Land|Mobile Home|Duplex|Triplex)', kw, re.I)
# Also grab style from detail section (e.g. "Detached, 2 Level")
style_label = label_val(soup, "Style")
type_label  = label_val(soup, "Type")

result['bedrooms']      = beds_m.group(1)  if beds_m  else None
result['bathrooms']     = baths_m.group(1) if baths_m else None
result['building_sqft'] = sqft_m.group(1).replace(",","") if sqft_m else None
result['property_type'] = type_m.group(1).strip() if type_m else (type_label or style_label)
result['style']         = style_label

# Price: first $NNN,NNN-looking price in the page head area
price_m = re.search(r'\$([\d,]{5,})', html[:8000])
result['list_price'] = price_m.group(1).replace(",","") if price_m else None

# Address
h1 = soup.find("h1")
result['address'] = h1.get_text(strip=True) if h1 else slug.replace("-", " ")

# Lot size — lives in .cutsheet-panel-entry > span > div:nth(2)
# Structure: <span class="lot-size"></span><span><div>Lot Size</div><div>2,500 <abbr>sqft</abbr></div></span>
result['lot_size_sqft'] = None
lot_entry = soup.find(class_="lot-size")
if lot_entry:
    parent_span = lot_entry.find_next_sibling("span")
    if parent_span:
        divs = parent_span.find_all("div")
        if len(divs) >= 2:
            lot_num = re.search(r'([\d,]+)', divs[1].get_text())
            result['lot_size_sqft'] = lot_num.group(1).replace(",","") if lot_num else None

# ── Scrape civic data from cutsheet-detail-item sections ──────────────────────
# Two "Zoning" labels exist: MLS Zoning ({{template}}, un-rendered) and civic Zoning (ER-3 etc.)
# skip_template=True skips the un-rendered JS one and gives the real civic value
result['zoning']          = label_val(soup, "Zoning", skip_template=True)
result['mls_zoning']      = label_val(soup, "MLS Zoning") or label_val(soup, "MLS")
result['polling_district']= label_val(soup, "Polling District")
result['waste_collection']= label_val(soup, "Waste Collection")
result['by_law_area']     = label_val(soup, "By-Law Area") or label_val(soup, "Bylaw Area")

# ── Scrape all property detail fields ─────────────────────────────────────────
result['style']               = label_val(soup, "Style")
result['building_style']      = label_val(soup, "Building Style")
result['building_dimensions'] = label_val(soup, "Building Dimensions")
result['age']                 = label_val(soup, "Age")          # e.g. "111"
result['bathrooms_fh']        = label_val(soup, "Bathrooms")    # "1 / 0" (full/half)
result['total_living_area']   = label_val(soup, "Total Living Area")
result['prov_parcel_size']    = label_val(soup, "Prov. Parcel Size")
result['rental_income']       = label_val(soup, "Rental Income")
result['roof']                = label_val(soup, "Roof")
result['exterior']            = label_val(soup, "Exterior")
result['foundation']          = label_val(soup, "Foundation")
result['basement']            = label_val(soup, "Basement")
result['flooring']            = label_val(soup, "Flooring")
result['heating_cooling']     = label_val(soup, "Heating")
result['fireplace']           = label_val(soup, "Fireplace")
result['pool']                = label_val(soup, "Pool")
result['fuel_supply']         = label_val(soup, "Fuel Supply")
result['drinking_water']      = label_val(soup, "Drinking Water")
result['sewer']               = label_val(soup, "Sewer")
result['has_garage']          = label_val(soup, "Has Garage")
result['parking']             = label_val(soup, "Parking")
result['waterfront']          = label_val(soup, "Waterfront")
result['water_access_view']   = label_val(soup, "Water Access")
result['property_features']   = label_val(soup, "Property Features")
result['land_features']       = label_val(soup, "Land Features")
result['utilities']           = label_val(soup, "Utilities")
result['appliances']          = label_val(soup, "Appliances")
result['inclusions']          = label_val(soup, "Inclusions")
result['exclusions']          = label_val(soup, "Exclusions")
result['rental_equipment']    = label_val(soup, "Rental Equipment")
result['listed_by']           = label_val(soup, "Listed By")
result['has_pcds']            = label_val(soup, "Has PCDS") or label_val(soup, "PCDS")
result['betterment_charges']  = label_val(soup, "Betterment")
result['bank_owned']          = label_val(soup, "Bank Owned")

print(f"  address:       {result['address']}")
print(f"  list price:    ${result['list_price']}")
print(f"  beds/baths:    {result['bedrooms']} bed / {result['bathrooms']} bath")
print(f"  building sqft: {result['building_sqft']}")
print(f"  lot size sqft: {result['lot_size_sqft']}")
print(f"  property type: {result['property_type']}")
print(f"  zoning:        {result['zoning']}")
print(f"  polling dist:  {result['polling_district']}")
print(f"  waste collect: {result['waste_collection']}")

# ── STEP 3: property/taxes ────────────────────────────────────────────────────
print(f"\n{'='*65}")
print(f"  STEP 3: property/taxes  (nonce={nonce[:8]}...)")
print(f"{'='*65}")

r = session.get(
    f"{BASE}/api/v2/property/taxes?pid={pid}&class_id={class_id}&CLIENT_VER={CLIENT_VER}&nonce={nonce}",
    headers=API_HEADERS, timeout=15
)
data = r.json()
print(f"  status: {data.get('status')}")

if data.get('status') == 'success':
    taxes = data['taxes']
    nonce = data['nonce']  # rotate

    assessments = taxes.get('assessments', {})
    current_year = str(taxes.get('current_year', ''))
    current_assessment = assessments.get(current_year, {}).get('assessment')
    info = taxes.get('info', {})

    result['tax_expense']       = info.get('tax_expense')
    result['tax_rate']          = info.get('rate')
    result['aan']               = info.get('aan')
    result['assessment_current']= current_assessment
    result['assessments_all']   = assessments

    print(f"  current assessment ({current_year}): ${current_assessment}")
    print(f"  tax expense: ${result['tax_expense']}")
    print(f"  tax rate: {result['tax_rate']}%")
    print(f"  AAN: {result['aan']}")
    print(f"  assessment years: {sorted(assessments.keys())}")
    print(f"  next nonce: {nonce[:8]}...")
else:
    print(f"  FAILED: {data.get('errors')}")

# ── STEP 4: property/history (only if listing_id known) ──────────────────────
print(f"\n{'='*65}")
print(f"  STEP 4: property/history")
print(f"{'='*65}")

if listing_id and listing_class_id:
    r = session.get(
        f"{BASE}/api/v2/property/history?type=listing&pid={pid}&class_id={class_id}"
        f"&listing_id={listing_id}&listing_class_id={listing_class_id}"
        f"&CLIENT_VER={CLIENT_VER}&nonce={nonce}",
        headers=API_HEADERS, timeout=15
    )
    data = r.json()
    print(f"  status: {data.get('status')}")

    if data.get('status') == 'success':
        nonce = data['nonce']
        history = data['history']
        mls = history.get('mls_history', [])
        result['mls_history'] = mls

        # Build historical cutsheet URLs from past listing entries (excluding current)
        hist_cutsheet_urls = []
        for entry in mls:
            hist_lid   = entry.get('listing_id')
            hist_cid   = entry.get('class_id')
            hist_slug  = entry.get('seo_address', '')
            if hist_lid and hist_cid and hist_slug and hist_lid != listing_id:
                hist_cutsheet_urls.append(
                    f"{BASE}/cutsheet/{hist_lid}/{hist_cid}/{hist_slug}"
                )
        result['historical_cutsheet_urls'] = hist_cutsheet_urls

        for entry in mls:
            print(f"  listing {entry['listing_id']}: "
                  f"list=${entry.get('lprice')}  sale=${entry.get('sprice')}  "
                  f"dom={entry.get('dom')}  listed={entry.get('ldate','')[:10]}  "
                  f"sold={str(entry.get('sdate',''))[:10] or 'N/A'}")
            # changes array tracks field edits; small integers are status IDs not prices
            for chg in entry.get('changes', []):
                try:
                    if int(chg['oldvalue']) > 1000 or int(chg['newvalue']) > 1000:
                        print(f"    price drop: ${chg['oldvalue']} -> ${chg['newvalue']}  ({chg['lastmoddate_fmt']})")
                except (ValueError, TypeError):
                    pass
        for u in hist_cutsheet_urls:
            print(f"  hist cutsheet: {u}")
        print(f"  next nonce: {nonce[:8]}...")
    else:
        print(f"  FAILED: {data.get('errors')}")
else:
    print("  SKIPPED — property is not for sale (no listing_id found in HTML)")
    result['mls_history'] = []

# ── STEP 5: listing/insight ───────────────────────────────────────────────────
print(f"\n{'='*65}")
print(f"  STEP 5: listing/insight")
print(f"{'='*65}")

if listing_id and listing_class_id:
    r = session.get(
        f"{BASE}/api/v2/listing/insight?class_id={listing_class_id}&listing_id={listing_id}"
        f"&CLIENT_VER={CLIENT_VER}&nonce={nonce}",
        headers=API_HEADERS, timeout=15
    )
    data = r.json()
    print(f"  status: {data.get('status')}")

    if data.get('status') == 'success':
        nonce = data['nonce']
        insight = data['insight']
        result['views'] = insight.get('views')
        result['unique_users'] = insight.get('users')
        print(f"  views: {result['views']}  unique users: {result['unique_users']}")
        print(f"  next nonce: {nonce[:8]}...")
    else:
        print(f"  FAILED: {data.get('errors')}")
else:
    print("  SKIPPED — no listing_id")

# ── STEP 6: listing/schools ───────────────────────────────────────────────────
print(f"\n{'='*65}")
print(f"  STEP 6: listing/schools")
print(f"{'='*65}")

if listing_id and listing_class_id:
    r = session.get(
        f"{BASE}/api/v2/listing/schools?class_id={listing_class_id}&listing_id={listing_id}"
        f"&CLIENT_VER={CLIENT_VER}&nonce={nonce}",
        headers=API_HEADERS, timeout=15
    )
    data = r.json()
    print(f"  status: {data.get('status')}")

    if data.get('status') == 'success':
        nonce = data['nonce']
        schools = data['schools']
        result['schools'] = schools
        for level, entries in schools.items():
            for s in entries:
                print(f"  [{level}] {s['NAME']} ({s['PROGRAM']}) — {s['DISTANCE']}")
        print(f"  next nonce: {nonce[:8]}...")
    else:
        print(f"  FAILED: {data.get('errors')}")
else:
    print("  SKIPPED — no listing_id")

# ── FINAL: Full picture ───────────────────────────────────────────────────────
print(f"\n{'='*65}")
print(f"  FULL PICTURE")
print(f"{'='*65}")
exclude = ('assessments_all', 'mls_history', 'schools', 'historical_cutsheet_urls')
print(json.dumps({k: v for k, v in result.items() if k not in exclude}, indent=2))

print(f"\n  Assessment history:")
for yr, vals in sorted(result.get('assessments_all', {}).items()):
    print(f"    {yr}: ${vals['assessment']}")

print(f"\n  Listing price history:")
for entry in result.get('mls_history', []):
    print(f"    list=${entry.get('lprice')}  sale=${entry.get('sprice')}  dom={entry.get('dom')}  listed={str(entry.get('ldate',''))[:10]}  sold={str(entry.get('sdate',''))[:10] or 'N/A'}")
    for chg in entry.get('changes', []):
        try:
            if int(chg['oldvalue']) > 1000 or int(chg['newvalue']) > 1000:
                print(f"      price drop: ${chg['oldvalue']} -> ${chg['newvalue']}  ({chg['lastmoddate_fmt']})")
        except (ValueError, TypeError):
            pass

print(f"\n  Historical cutsheet URLs:")
for u in result.get('historical_cutsheet_urls', []):
    print(f"    {u}")

print(f"\n  Done.")
