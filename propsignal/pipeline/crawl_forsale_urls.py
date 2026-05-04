"""
ViewPoint For-Sale URL Crawler
Crawls: /forsale -> /forsale/subdistrict/* -> /forsale/street/* -> /cutsheet/*
Saves all current for-sale cutsheet URLs to forsale_urls.csv
Supports resume — skips streets already processed.

Run: python crawl_forsale_urls.py
"""

import requests
from bs4 import BeautifulSoup
import csv
import time
import os

BASE    = "https://www.viewpoint.ca"
OUTPUT  = "forsale_urls.csv"
DELAY   = 1.0   # seconds between street-level page requests
DELAY_SD = 2.0  # extra pause between subdistricts

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
}

def get_soup(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        return BeautifulSoup(r.text, "html.parser")
    except Exception as e:
        print(f"  ERROR fetching {url}: {e}")
        return None

def crawl():
    print("=== ViewPoint For-Sale URL Crawler ===")

    # Load already-processed streets for resume support
    done_streets = set()
    existing_rows = 0
    if os.path.exists(OUTPUT):
        with open(OUTPUT, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                done_streets.add(row.get("street_url", ""))
                existing_rows += 1
        print(f"Resuming: {existing_rows} cutsheet URLs already saved")

    write_header = existing_rows == 0
    out = open(OUTPUT, "a", newline="", encoding="utf-8")
    writer = csv.writer(out)
    if write_header:
        writer.writerow(["subdistrict_id", "subdistrict_url", "street_url", "cutsheet_url"])

    # Step 1: Get all subdistrict URLs from /forsale
    print("\nFetching subdistricts from /forsale ...")
    soup = get_soup(BASE + "/forsale")
    if not soup:
        print("ERROR: couldn't fetch /forsale"); return

    sd_links = sorted(set(
        a["href"] for a in soup.find_all("a", href=True)
        if "/forsale/subdistrict/" in a["href"]
    ))
    print(f"  Found {len(sd_links)} subdistricts")

    total = 0

    for i, sd_url in enumerate(sd_links):
        if not sd_url.startswith("http"):
            sd_url = BASE + sd_url
        sd_id = sd_url.rstrip("/").split("/")[-1]
        print(f"\n[{i+1}/{len(sd_links)}] Subdistrict {sd_id}: {sd_url}")
        time.sleep(DELAY_SD)

        # Step 2: Get streets in this subdistrict
        soup = get_soup(sd_url)
        if not soup:
            continue

        street_links = sorted(set(
            a["href"] for a in soup.find_all("a", href=True)
            if "/forsale/street/" in a["href"]
        ))
        print(f"  {len(street_links)} streets")

        for st_url in street_links:
            if not st_url.startswith("http"):
                st_url = BASE + st_url

            if st_url in done_streets:
                print(f"    SKIP (done): {st_url.split('/')[-1]}")
                continue

            time.sleep(DELAY)

            # Step 3: Get cutsheet links from the street page
            st_soup = get_soup(st_url)
            if not st_soup:
                continue

            cutsheet_hrefs = [
                a["href"] for a in st_soup.find_all("a", href=True)
                if "/cutsheet/" in a["href"]
            ]

            for href in cutsheet_hrefs:
                if not href.startswith("http"):
                    href = BASE + href
                writer.writerow([sd_id, sd_url, st_url, href])
                total += 1

            out.flush()
            done_streets.add(st_url)
            print(f"    {st_url.split('/')[-1]}: {len(cutsheet_hrefs)} listing(s)  [total={total}]")

    out.close()
    print(f"\nDone. {total} cutsheet URLs saved to {OUTPUT}")

if __name__ == "__main__":
    crawl()
