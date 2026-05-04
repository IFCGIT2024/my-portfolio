'use strict';

const VP_BASE      = 'https://www.viewpoint.ca';
const CLIENT_VER   = '23235';
const DEFAULT_RATE_MS = 1200;
const FAIL_REFRESH = 3;

function getRateMs() {
  return (typeof window !== 'undefined' && typeof window._bulkRateMs === 'number')
    ? window._bulkRateMs : DEFAULT_RATE_MS;
}

let _nonce         = null;
let _exportRunning = false;
let _exportAbort   = false;

// Get a fresh nonce — first try the open VP tab, then user/get
async function refreshNonce() {
  // Ask background to read window.vp.api.NONCES from the open VP tab
  const tabNonce = await new Promise(resolve => {
    const timer = setTimeout(() => resolve(null), 5000);
    chrome.runtime.sendMessage({ type: 'GET_VP_NONCE' }, resp => {
      clearTimeout(timer);
      if (chrome.runtime.lastError) { resolve(null); return; }
      resolve((resp && resp.nonce) || null);
    });
  });
  if (tabNonce) { _nonce = tabNonce; return; }

  // Fallback: user/get (works when called with credentials from extension)
  const resp = await fetch(
    `${VP_BASE}/api/v2/user/get?CLIENT_VER=${CLIENT_VER}`,
    { credentials: 'include' }
  );
  if (!resp.ok) throw new Error(`user/get HTTP ${resp.status}`);
  const d = await resp.json();
  if (d.nonce) { _nonce = d.nonce; return; }
  throw new Error('Could not obtain nonce — open viewpoint.ca in a tab first');
}

async function getClickData(lat, lng) {
  if (!_nonce) await refreshNonce();
  const makeUrl = () =>
    `${VP_BASE}/api/v2/map/click?lat=${lat}&lng=${lng}&CLIENT_VER=${CLIENT_VER}&nonce=${_nonce}`;

  let resp = await fetch(makeUrl(), { credentials: 'include' });

  // 403 = stale nonce, refresh once and retry
  if (resp.status === 403) {
    await refreshNonce();
    resp = await fetch(makeUrl(), { credentials: 'include' });
  }
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

  const d = await resp.json();
  // Roll nonce forward using the one returned in the response
  if (d.nonce) _nonce = d.nonce;
  return d;
}

function buildGrid(bounds, stepMeters) {
  const latStep = stepMeters / 111320;
  const midLat  = (bounds.swLat + bounds.neLat) / 2;
  const lngStep = stepMeters / (111320 * Math.cos(midLat * Math.PI / 180));
  const pts = [];
  for (let lat = bounds.swLat + latStep / 2; lat <= bounds.neLat; lat += latStep) {
    for (let lng = bounds.swLng + lngStep / 2; lng <= bounds.neLng; lng += lngStep) {
      pts.push({ lat: lat.toFixed(7), lng: lng.toFixed(7) });
    }
  }
  return pts;
}

function estimateGridCount(bounds, stepMeters) {
  return buildGrid(bounds, stepMeters).length;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function flattenProperty(clickData) {
  const prop    = clickData.property  || {};
  const listing = (clickData.listings && clickData.listings[0]) || {};
  const housing = clickData.housing   || {};
  return {
    pid:           prop.pid               || '',
    address:       prop.address           || listing.address || '',
    city:          prop.city              || '',
    lat:           prop.lat               || '',
    lng:           prop.lng               || '',
    class:         prop.class_id          || '',
    building_area: prop.area              || listing.tla || listing.mla || '',
    assessment:    prop.assessment        || '',
    year_built:    prop.year_built        || listing.year_built || '',
    listing_id:    listing.listing_id     || '',
    list_price:    listing.list_price     || '',
    beds:          listing.nbeds          || '',
    full_baths:    listing.nfullbaths     || '',
    half_baths:    listing.nhalfbaths     || '',
    walk_score:    housing.walk_score     || '',
    transit_score: housing.transit_score  || '',
  };
}

function toCSV(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => {
      const v = row[h] === null || row[h] === undefined ? '' : String(row[h]);
      return v.includes(',') || v.includes('"') || v.includes('\n')
        ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(','));
  }
  return lines.join('\r\n');
}

async function runBulkExport(bounds, onProgress) {
  if (_exportRunning) throw new Error('Export already running');
  _exportRunning = true;
  _exportAbort   = false;

  try {
    onProgress(0, 0, 'Getting nonce...');
    // Seed nonce from captured requests if available, otherwise call user/get
    if (typeof window !== 'undefined' && window._vpSeedNonce) {
      _nonce = window._vpSeedNonce;
      window._vpSeedNonce = null;
    } else {
      await refreshNonce();
    }

    const stepM    = (typeof window !== 'undefined' && window._bulkGridStep) || 40;
    const gridPts  = buildGrid(bounds, stepM);
    const captured = (typeof window !== 'undefined' && window._vpCapturedCoords) || [];
    window._vpCapturedCoords = null;

    onProgress(0, gridPts.length,
      `Grid: ${gridPts.length} pts at ${stepM}m` +
      (captured.length ? ` + ${captured.length} from browsing` : '') + '. Sweeping...');

    const seenPids = new Set();
    for (const c of captured) { if (c.pid) seenPids.add(String(c.pid)); }

    const rows = [];
    let failStreak = 0;
    let skipCount  = 0;

    for (let i = 0; i < gridPts.length; i++) {
      if (_exportAbort) break;
      const pt = gridPts[i];

      if (i % 10 === 0) {
        onProgress(i, gridPts.length,
          `${i + 1}/${gridPts.length} — ${rows.length} found, ${skipCount} empty`);
      }

      try {
        await sleep(getRateMs());
        const data = await getClickData(pt.lat, pt.lng);
        const prop = data && data.property;
        if (prop && prop.pid) {
          const pid = String(prop.pid);
          if (!seenPids.has(pid)) {
            seenPids.add(pid);
            rows.push(flattenProperty(data));
            onProgress(i, gridPts.length,
              `Found: ${prop.address || prop.pid} (${rows.length} total)`);
          }
        } else {
          skipCount++;
        }
        failStreak = 0;
      } catch (err) {
        failStreak++;
        onProgress(i, gridPts.length, `Err (${pt.lat},${pt.lng}): ${err.message}`);
        if (failStreak >= FAIL_REFRESH) {
          onProgress(i, gridPts.length, `${failStreak} failures — refreshing nonce, pausing 5s...`);
          try { await refreshNonce(); } catch(e) {}
          await sleep(5000);
          failStreak = 0;
        }
      }
    }

    onProgress(gridPts.length, gridPts.length,
      _exportAbort
        ? `Stopped — ${rows.length} properties saved.`
        : `Done! ${rows.length} properties from ${gridPts.length} grid points.`);
    return rows;

  } finally {
    _exportRunning = false;
  }
}

function abortExport()    { _exportAbort = true; }
function isExportRunning(){ return _exportRunning; }
