/**
 * Viewpoint.ca API Reference
 * Captured: 2026-04-07
 * CLIENT_VER: 23235
 * Base URL: https://www.viewpoint.ca
 *
 * AUTH NOTES:
 *   - Session is cookie-based (PHPSESSID). No separate API key needed.
 *   - api_login: false  → authenticated via session cookie (good)
 *   - api_login: true   → unauthenticated / API token fallback (limited)
 *   - Nonces rotate: every API response includes a "nonce" field for the NEXT request.
 *   - Nonce bootstrap (no login): GET /api/v2/user/get returns a nonce even unauthenticated.
 *     Use that nonce for the first real request. Each subsequent response gives the next nonce.
 *   - Rate limit: rate_limit_daily_val=218 per day, burst=11
 */

const BASE = "https://www.viewpoint.ca";
const CLIENT_VER = 23235;

// ─── BOOTSTRAP / AUTH ─────────────────────────────────────────────────────────

/**
 * WHERE THE INITIAL NONCE COMES FROM:
 *   The first nonce is embedded in the HTML page source when you load any
 *   property or cutsheet page. It is NOT returned by any API call.
 *   Scrape it from the page HTML before making any nonce-chained API calls.
 *
 *   Location in HTML:
 *     window.vp.api = { CLIENT_VER:'23235', NONCES:["abc...", "def...", "ghi..."] }
 *   Each page includes an ARRAY of 3 pre-generated nonces. Use the first one.
 *   Regex: /NONCES:\s*\[([^\]]+)\]/  then extract 32-char hex strings from the match.
 *
 *   No login required — all endpoints work with any valid page nonce.
 *
 *   The nonce works whether you are logged in or not — unauthenticated
 *   requests still get a valid rotating nonce back from data endpoints.
 *
 * UNAUTHENTICATED vs AUTHENTICATED (from user/get response):
 *
 *   Unauthenticated (no session cookie):
 *     { "user": null, "status": "success", "api_user": false, "api_login": true }
 *     → NO nonce returned.
 *
 *   Authenticated (session cookie present):
 *     { "user": {...}, "status": "success", "api_user": {...}, "api_login": false }
 *     → Also NO nonce returned.
 *
 *   In both cases you must get the nonce from the page HTML first.
 *
 * WHAT WORKS UNAUTHENTICATED (api_login: true):
 *   ✅ listing/insight   — confirmed, returns data + rotates nonce
 *   ✅ listing/schools   — works (same pattern)
 *   ✅ property/taxes    — works, server does NOT gate it; frontend just doesn't call it when logged out
 *   ✅ property/history  — works, same reason
 *
 *   ALL data endpoints are publicly accessible with a valid nonce.
 *   Login is NOT required. The nonce from the page HTML is sufficient.
 *
 * GET /api/v2/user/get?roles=true&CLIENT_VER=23235
 * Use to check if session cookie is valid. Does not provide a nonce.
 */
const CHECK_SESSION = `${BASE}/api/v2/user/get?roles=true&CLIENT_VER=${CLIENT_VER}`;

/**
 * Legacy user data endpoint (no nonce required, no nonce returned).
 * Useful for checking session validity.
 *
 * GET /api/v1/user/getUserData.json?suppress_auth=1
 * Response: { id, data:{rate_limit_daily_val, rate_limit_burst_val, ...}, email, fname, ... }
 */
const GET_USER_DATA_V1 = `${BASE}/api/v1/user/getUserData.json?suppress_auth=1`;

/**
 * Login — establishes session cookie + returns first nonce.
 *
 * POST /api/v2/user/login
 * Body (form-encoded): email=...&password=...&remember=1&CLIENT_VER=23235
 * Response: { user:{id, fname, lname, email, roles, ...}, status, api_user, api_login, nonce }
 *
 * After this, use the response nonce for every subsequent request.
 */
const LOGIN = {
  url: `${BASE}/api/v2/user/login`,
  method: "POST",
  body: (email, password) =>
    `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&remember=1&CLIENT_VER=${CLIENT_VER}`,
};

// ─── PROPERTY ENDPOINTS ───────────────────────────────────────────────────────

/**
 * Property taxes + full assessment history by year.
 * Returns year-by-year assessed values going back to ~2008, tax rate, tax expense, AAN.
 *
 * GET /api/v2/property/taxes?pid={pid}&class_id={class_id}&CLIENT_VER=23235&nonce={nonce}
 * Params:
 *   pid       — 8-digit property ID (e.g. "00151324")
 *   class_id  — 1 = residential, 2 = ? (from URL structure /show/property/{pid}/{class_id}/...)
 * Response: {
 *   taxes: {
 *     is_park,
 *     assessments: { "2008": {assessment, cap}, ..., "2026": {assessment, cap} },
 *     current_year,
 *     hrm_rate_year,
 *     info: { tax_expense, exempt, aan, rate, comm_rate, records:[{aan,leg_code,taxstatus,pubvalue,rate,comm_rate}] },
 *     cap_available,
 *     has_pvsc
 *   },
 *   status, nonce, api_user, api_login
 * }
 *
 * Example: /api/v2/property/taxes?pid=00151324&class_id=1&CLIENT_VER=23235&nonce=abc123
 */
const PROPERTY_TAXES = (pid, class_id, nonce) =>
  `${BASE}/api/v2/property/taxes?pid=${pid}&class_id=${class_id}&CLIENT_VER=${CLIENT_VER}&nonce=${nonce}`;

/**
 * Property / listing price history + price change events.
 *
 * GET /api/v2/property/history?type=listing&pid={pid}&class_id={class_id}&listing_id={listing_id}&listing_class_id={listing_class_id}&CLIENT_VER=23235&nonce={nonce}
 * Params:
 *   type             — "listing"
 *   pid              — 8-digit PID
 *   class_id         — property class (1 = residential)
 *   listing_id       — MLS listing ID (e.g. "202602657")
 *   listing_class_id — listing class (2 = residential listing)
 * Response: {
 *   history: {
 *     mls_history: [{
 *       listing_id, class_id,
 *       changes: [{ id, column_id, field, oldvalue, newvalue, lastmoddate_fmt, lastmoddate_utc }],
 *       dom,           ← days on market
 *       ldate,         ← list date
 *       sdate,         ← sale date (null if unsold)
 *       expdate, entrydate,
 *       stid,          ← status ID (5 = active?)
 *       lprice_fmt, lprice,
 *       sprice,        ← sale price (null if unsold)
 *       seo_address
 *     }]
 *   },
 *   status, nonce, api_user, api_login
 * }
 */
const PROPERTY_HISTORY = (pid, class_id, listing_id, listing_class_id, nonce) =>
  `${BASE}/api/v2/property/history?type=listing&pid=${pid}&class_id=${class_id}&listing_id=${listing_id}&listing_class_id=${listing_class_id}&CLIENT_VER=${CLIENT_VER}&nonce=${nonce}`;

// ─── LISTING ENDPOINTS ────────────────────────────────────────────────────────

/**
 * Listing view/user insight stats.
 *
 * GET /api/v2/listing/insight?class_id={class_id}&listing_id={listing_id}&CLIENT_VER=23235&nonce={nonce}
 * Response: { insight: { views, users }, status, nonce, api_user, api_login }
 */
const LISTING_INSIGHT = (class_id, listing_id, nonce) =>
  `${BASE}/api/v2/listing/insight?class_id=${class_id}&listing_id=${listing_id}&CLIENT_VER=${CLIENT_VER}&nonce=${nonce}`;

/**
 * Nearby schools for a listing.
 *
 * GET /api/v2/listing/schools?class_id={class_id}&listing_id={listing_id}&CLIENT_VER=23235&nonce={nonce}
 * Response: {
 *   schools: {
 *     Elementary: [{ NAME, GRADES, PROGRAM, DISTANCE, SUMMARYPAGE }],
 *     "Junior High": [...],
 *     "Senior High": [...]
 *   },
 *   status, nonce, api_user, api_login
 * }
 */
const LISTING_SCHOOLS = (class_id, listing_id, nonce) =>
  `${BASE}/api/v2/listing/schools?class_id=${class_id}&listing_id=${listing_id}&CLIENT_VER=${CLIENT_VER}&nonce=${nonce}`;

// ─── USER / QUOTA ENDPOINTS ───────────────────────────────────────────────────

/**
 * Check quota/access for gated cutsheet sections.
 * Free accounts get 4 views/month per section.
 *
 * GET /api/v2/user/quota_check?quota[]=client-cutsheet-dashboard&...&CLIENT_VER=23235&nonce={nonce}
 * Known quota keys:
 *   client-cutsheet-dashboard         (4/month free)
 *   client-cutsheet-historical        (4/month free)
 *   client-cutsheet-public-record-sales  (gated, 0 remaining on free)
 *   client-cutsheet-land-registry        (gated, 0 remaining on free)
 * Response: {
 *   access: {
 *     "client-cutsheet-dashboard": { allowed, frequency, period, remaining, total, used }
 *   },
 *   status, nonce, api_user, api_login
 * }
 */
const QUOTA_CHECK = (quotaKeys, nonce) => {
  const params = quotaKeys.map((k) => `quota%5B%5D=${k}`).join("&");
  return `${BASE}/api/v2/user/quota_check?${params}&CLIENT_VER=${CLIENT_VER}&nonce=${nonce}`;
};

/**
 * Track that a section was viewed (fire-and-forget, increments quota usage).
 * Sends nonce in body, response nonce is same as sent nonce (does not rotate here).
 *
 * POST /api/v2/user/add_viewed_section
 * Body (form-encoded): viewed_id={viewed_id}&section_id={section_id}&CLIENT_VER=23235&nonce={nonce}
 * Known section_ids seen: 4, 6, 7, 10, 12, 14, 18
 * Response: { viewed_section_id, status, nonce (same), api_user, api_login }
 */
const ADD_VIEWED_SECTION = {
  url: `${BASE}/api/v2/user/add_viewed_section`,
  method: "POST",
  body: (viewed_id, section_id, nonce) =>
    `viewed_id=${viewed_id}&section_id=${section_id}&CLIENT_VER=${CLIENT_VER}&nonce=${nonce}`,
};

/**
 * Drip/popup check (marketing). Returns null data unless a campaign is active.
 *
 * GET /api/v2/drip/popup?CLIENT_VER=23235
 * Response: { data: null, status, api_user, api_login }
 */
const DRIP_POPUP = `${BASE}/api/v2/drip/popup?CLIENT_VER=${CLIENT_VER}`;

// ─── NONCE FLOW SUMMARY ───────────────────────────────────────────────────────
/*
  INITIAL NONCE:
    Comes from the HTML page source — NOT from any API call.
    When a cutsheet or property page loads, the nonce is embedded in the HTML
    (likely a JS variable or data attribute). Scrape it from the page first.

  NONCE CHAIN:
    1. Load property/cutsheet page HTML → extract nonce from source
    2. For every API call:
         - Pass current nonce in query string (&nonce=...) or POST body
         - Read "nonce" from JSON response → use as nonce for the NEXT request
    3. Keep requests sequential — parallel requests will break nonce chain.

  WHO RETURNS A NEW NONCE (rotates):
    ✅ property/taxes
    ✅ property/history
    ✅ listing/insight
    ✅ listing/schools
    ✅ user/quota_check

  WHO ECHOES THE SAME NONCE (does not rotate):
    ↩️  user/add_viewed_section (POST) — safe to fire and ignore

  WHO RETURNS NO NONCE:
    ❌ user/get         (GET)  — even when authenticated
    ❌ drip/popup       (GET)
    ❌ user/getUserData (GET, v1)
*/

// ─── PROPERTY URL STRUCTURE ───────────────────────────────────────────────────
/*
  /show                                               → list of 163 subdistricts
  /show/subdistrict/{n}                               → list of streets
  /show/street/{n}/{id}/{slug}                        → list of properties
  /show/property/{pid}/{class_id}/{slug}              → property detail page (public, thin)
  /cutsheet/{listing_id}/{class_id}/{slug}            → full listing cutsheet (richer)

  PID extraction from URL: /show/property/00151324/1/2456-Agricola-Street-Halifax
    pid      = "00151324"
    class_id = "1"

  listing_id from cutsheet URL: /cutsheet/202602657/2/2456-Agricola-Street-Halifax
    listing_id       = "202602657"
    listing_class_id = "2"
*/
