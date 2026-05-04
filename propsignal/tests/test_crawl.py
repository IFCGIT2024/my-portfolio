import requests
from bs4 import BeautifulSoup

BASE = 'https://www.viewpoint.ca'
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

r = requests.get(BASE + '/show', headers=HEADERS, timeout=15)
soup = BeautifulSoup(r.text, 'html.parser')
links = set()
for a in soup.find_all('a', href=True):
    href = a['href']
    if '/show/subdistrict/' in href:
        links.add(href)
print(f'Subdistricts found: {len(links)}')
for l in sorted(links)[:5]:
    print(' ', l)
