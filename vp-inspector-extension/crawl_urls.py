"""
ViewPoint URL Crawler
Crawls: /show -> /show/subdistrict/* -> /show/street/* -> /show/property/*
Saves all property URLs to property_urls.csv
Run: python crawl_urls.py
"""

import requests
from bs4 import BeautifulSoup
import csv
import time
import os

BASE = "https://www.viewpoint.ca"
OUTPUT = "property_urls.csv"
DELAY = 1.5        # seconds between page requests
DELAY_SUBDISTRICT = 3  # extra pause between subdistricts

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

def get_links(url, path_contains):
    """Fetch a page and return all unique hrefs containing path_contains."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        links = set()
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if path_contains in href:
                if href.startswith("/"):
                    href = BASE + href
                links.add(href)
        return list(links)
    except Exception as e:
        print(f"  ERROR fetching {url}: {e}")
        return []

def get_text(url):
    """Fetch page text for extracting property data later."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        return r.text
    except:
        return ""

def crawl():
    print("=== ViewPoint URL Crawler ===")

    # Load already-done property URLs to allow resume
    done_streets = set()
    existing_rows = 0
    if os.path.exists(OUTPUT):
        with open(OUTPUT, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                done_streets.add(row.get("street_url", ""))
                existing_rows += 1
        print(f"Resuming: {existing_rows} property URLs already saved")

    write_header = not os.path.exists(OUTPUT) or existing_rows == 0
    out = open(OUTPUT, "a", newline="", encoding="utf-8")
    writer = csv.writer(out)
    if write_header:
        writer.writerow(["subdistrict_url", "subdistrict_name", "street_url", "street_name", "property_url"])

    # Step 1: Get all subdistrict URLs from /show
    print("\nFetching subdistricts from /show ...")
    subdistrict_urls = get_links(BASE + "/show", "/show/subdistrict/")
    print(f"  Found {len(subdistrict_urls)} subdistricts")

    total_properties = 0

    for i, sd_url in enumerate(subdistrict_urls):
        sd_name = sd_url.split("/show/subdistrict/")[-1]
        print(f"\n[{i+1}/{len(subdistrict_urls)}] Subdistrict {sd_name}: {sd_url}")
        time.sleep(DELAY_SUBDISTRICT)

        # Step 2: Get all street URLs from this subdistrict
        street_urls = get_links(sd_url, "/show/street/")
        print(f"  Found {len(street_urls)} streets")

        for j, st_url in enumerate(street_urls):
            if st_url in done_streets:
                print(f"    Skipping (already done): {st_url}")
                continue

            st_name = st_url.split("/show/street/")[-1].split("/")[-1].replace("-", " ")
            print(f"  [{j+1}/{len(street_urls)}] Street: {st_name}")
            time.sleep(DELAY)

            # Step 3: Get all property URLs from this street
            prop_urls = get_links(st_url, "/show/property/")
            # Also grab cutsheet links (listed for sale)
            prop_urls += get_links(st_url, "/cutsheet/")
            prop_urls = list(set(prop_urls))

            print(f"    Found {len(prop_urls)} properties")

            for prop_url in prop_urls:
                writer.writerow([sd_url, sd_name, st_url, st_name, prop_url])
                total_properties += 1

            out.flush()

    out.close()
    print(f"\nDone! {total_properties} property URLs saved to {OUTPUT}")

if __name__ == "__main__":
    crawl()
