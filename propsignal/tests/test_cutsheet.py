import requests, re
from bs4 import BeautifulSoup

BASE = 'https://www.viewpoint.ca'
CLIENT_VER = 23235
URL = 'https://www.viewpoint.ca/cutsheet/202604725/1/5673-Bilby-Street-Halifax'

s = requests.Session()
s.headers.update({'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})

r = s.get(URL, timeout=15)
html = r.text
print(f'HTTP {r.status_code}  {len(html):,} chars')

# Nonces
nb = re.findall(r'NONCES:\s*\[([^\]]+)\]', html)
nonces = re.findall(r'["\']([a-f0-9]{32})["\']', nb[0]) if nb else []
print(f'Nonces: {nonces}')
nonce = nonces[0] if nonces else None

# Find the listing_id / pid embedded in the page JS
listing_ids = re.findall(r'["\']?listing_id["\']?\s*[:=]\s*["\']?(\d+)', html)
pids        = re.findall(r'["\']?(?:parcel_)?pid["\']?\s*[:=]\s*["\']?(\d{8})', html)
class_ids   = re.findall(r'["\']?class_id["\']?\s*[:=]\s*["\']?(\d+)', html)
print(f'listing_ids in JS: {list(set(listing_ids))[:5]}')
print(f'PIDs in JS:        {list(set(pids))[:5]}')
print(f'class_ids in JS:   {list(set(class_ids))[:5]}')

# Dump all window.vp.* assignments
print('\n--- window.vp.* blocks ---')
for m in re.finditer(r'window\.vp\.(\w+)\s*=\s*', html):
    name = m.group(1)
    start = m.end()
    snippet = html[start:start+300].replace('\n', ' ')
    print(f'  .{name} = {snippet[:200]}')

# Search for civic keywords
print('\n--- civic data keywords ---')
soup = BeautifulSoup(html, 'html.parser')
keywords = ['zoning', 'ER-3', 'by-law', 'bylaw', 'polling', 'waste', 'REgroup',
            'civic', 'bedroom', 'bathroom', 'sqft', 'sq ft', 'lot size',
            'property type', 'style', 'year built', 'age']
for kw in keywords:
    idx = html.lower().find(kw.lower())
    if idx >= 0:
        ctx = html[max(0, idx-80):idx+120].replace('\n', ' ')
        print(f'  "{kw}" @ {idx}: {repr(ctx)}')

# Look for any API endpoint URLs embedded in JS
print('\n--- API endpoints in JS ---')
api_urls = re.findall(r'api/v\d/[\w/]+', html)
print(f'  {list(set(api_urls))}')

# Any JSON blobs that look like property data
print('\n--- JSON-like blobs with property data ---')
for m in re.finditer(r'\{[^{}]*"(?:bedrooms|bathrooms|building_area|lot_size|zoning|property_type)"[^{}]*\}', html):
    print(f'  {m.group()[:300]}')

# Now try the taxes API on this property
print('\n--- Try property/taxes API ---')
# Need pid - try to get it from JS
pid = pids[0] if pids else None
class_id = '1'
if pid and nonce:
    r2 = s.get(f'{BASE}/api/v2/property/taxes?pid={pid}&class_id={class_id}&CLIENT_VER={CLIENT_VER}&nonce={nonce}')
    d = r2.json()
    print(f'  taxes status: {d.get("status")}')
    if d.get('status') == 'success':
        nonce = d['nonce']
        info = d['taxes'].get('info', {})
        print(f'  AAN: {info.get("aan")}  rate: {info.get("rate")}  tax: {info.get("tax_expense")}')
        print(f'  full info keys: {list(info.keys())}')
        print(f'  full taxes keys: {list(d["taxes"].keys())}')

# Try listing/property endpoint (undocumented but common pattern)
print('\n--- Try listing/property or property/property API ---')
listing_id = listing_ids[0] if listing_ids else '202604725'
for endpoint in [
    f'{BASE}/api/v2/listing/property?listing_id={listing_id}&class_id=1&CLIENT_VER={CLIENT_VER}&nonce={nonce}',
    f'{BASE}/api/v2/property/data?pid={pid}&class_id=1&CLIENT_VER={CLIENT_VER}&nonce={nonce}',
    f'{BASE}/api/v2/listing/data?listing_id={listing_id}&class_id=1&CLIENT_VER={CLIENT_VER}&nonce={nonce}',
    f'{BASE}/api/v2/cutsheet/data?listing_id={listing_id}&class_id=1&CLIENT_VER={CLIENT_VER}&nonce={nonce}',
]:
    try:
        r3 = s.get(endpoint, timeout=10)
        d = r3.json()
        status = d.get('status')
        nonce2 = d.get('nonce')
        if nonce2: nonce = nonce2
        print(f'  {endpoint.split("/api")[1][:60]} → {status}')
        if status == 'success':
            print(f'    keys: {list(d.keys())}')
            print(f'    DATA: {str(d)[:400]}')
        else:
            print(f'    errors: {d.get("errors")}')
    except Exception as e:
        print(f'  ERROR: {e}')
