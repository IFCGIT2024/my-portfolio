"""
Test: Can we get a nonce from an API call without scraping a page first?
Tries several strategies and prints what each one returns.
"""

import requests
import json
import re

BASE = "https://www.viewpoint.ca"
CLIENT_VER = 23235

# A known property for testing
TEST_PID = "00151324"
TEST_CLASS_ID = "1"
TEST_LISTING_ID = "202602657"
TEST_LISTING_CLASS_ID = "2"

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Referer": "https://www.viewpoint.ca/",
    "X-Requested-With": "XMLHttpRequest",
})

def pp(label, data):
    print(f"\n{'='*60}")
    print(f"  {label}")
    print(f"{'='*60}")
    print(json.dumps(data, indent=2))

print("\n--- STRATEGY 1: user/get with no nonce ---")
r = session.get(f"{BASE}/api/v2/user/get?roles=true&CLIENT_VER={CLIENT_VER}")
data = r.json()
pp("GET /api/v2/user/get (no nonce)", data)
nonce_from_userget = data.get("nonce")
print(f"  >> nonce in response: {nonce_from_userget}")

print("\n--- STRATEGY 2: drip/popup with no nonce ---")
r = session.get(f"{BASE}/api/v2/drip/popup?CLIENT_VER={CLIENT_VER}")
data = r.json()
pp("GET /api/v2/drip/popup (no nonce)", data)
print(f"  >> nonce in response: {data.get('nonce')}")

print("\n--- STRATEGY 3: listing/insight with no nonce ---")
r = session.get(f"{BASE}/api/v2/listing/insight?class_id={TEST_LISTING_CLASS_ID}&listing_id={TEST_LISTING_ID}&CLIENT_VER={CLIENT_VER}")
data = r.json()
pp("GET /api/v2/listing/insight (no nonce)", data)
nonce = data.get("nonce")
print(f"  >> nonce in response: {nonce}")

if nonce:
    print(f"\n--- STRATEGY 3b: property/taxes with nonce from insight ---")
    r = session.get(f"{BASE}/api/v2/property/taxes?pid={TEST_PID}&class_id={TEST_CLASS_ID}&CLIENT_VER={CLIENT_VER}&nonce={nonce}")
    data = r.json()
    pp("GET /api/v2/property/taxes (nonce from insight)", data)
    print(f"  >> nonce in response: {data.get('nonce')}")

print("\n--- STRATEGY 4: property/taxes with no nonce ---")
r = session.get(f"{BASE}/api/v2/property/taxes?pid={TEST_PID}&class_id={TEST_CLASS_ID}&CLIENT_VER={CLIENT_VER}")
data = r.json()
pp("GET /api/v2/property/taxes (no nonce)", data)
nonce = data.get("nonce")
print(f"  >> nonce in response: {nonce}")

print("\n--- STRATEGY 5: scrape nonce from property page HTML ---")
r = session.get(f"{BASE}/show/property/{TEST_PID}/{TEST_CLASS_ID}/test", headers={"Accept": "text/html"})
print(f"  HTTP status: {r.status_code}")
# Look for nonce patterns in HTML
# The nonces live in: window.vp.api = { CLIENT_VER:'23235', NONCES:["abc...", "def...", ...] }
nonces_block = re.findall(r'NONCES:\s*\[([^\]]+)\]', r.text)
if nonces_block:
    extracted = re.findall(r'["\']([a-f0-9]{32})["\']', nonces_block[0])
    print(f"  Found NONCES array with {len(extracted)} nonces: {extracted[:3]}...")
    first_nonce = extracted[0] if extracted else None
    print(f"  >> First nonce to use: {first_nonce}")

    if first_nonce:
        print(f"\n--- STRATEGY 5b: property/taxes with nonce from page HTML ---")
        r2 = session.get(f"{BASE}/api/v2/property/taxes?pid={TEST_PID}&class_id={TEST_CLASS_ID}&CLIENT_VER={CLIENT_VER}&nonce={first_nonce}")
        data = r2.json()
        pp("GET /api/v2/property/taxes (nonce from HTML)", data)
        print(f"  >> status: {data.get('status')}")
        print(f"  >> next nonce: {data.get('nonce')}")
else:
    idx = r.text.lower().find('nonce')
    if idx >= 0:
        snippet = r.text[max(0,idx-50):idx+150]
        print(f"  Raw context: {repr(snippet)}")
    else:
        print("  'nonce' not found in HTML")
