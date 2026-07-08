/**
 * Simply the Best House-Sitters — server
 *
 * A small Node.js + Express server that:
 *   - Serves the static site under public/.
 *   - Exposes GET  /api/content — the site copy for the SPA to render.
 *   - Exposes POST /api/quote   — accepts a quote-request submission, saves it
 *                                 to data/quotes.json, and stores it for admin.
 *   - Provides simple admin auth (POST /api/admin/login) that returns a signed
 *     bearer token used to read/manage submissions and edit content.
 *
 * Kept in one file on purpose: this is a small marketing site, not a service.
 */

'use strict';

const fs   = require('fs');
const fsp  = fs.promises;
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const multer  = require('multer');

// ---------- Load .env (minimal, no dependency) ----------
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const src = fs.readFileSync(envPath, 'utf8');
    src.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) return;
      if (process.env[m[1]] == null) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
    });
  }
} catch (_) { /* non-fatal */ }

const PORT           = parseInt(process.env.PORT || '3200', 10);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me';
const ADMIN_SECRET   = process.env.ADMIN_SECRET   || crypto.randomBytes(32).toString('hex');
const TOKEN_TTL_MS   = 8 * 60 * 60 * 1000; // 8h

const ROOT_DIR    = __dirname;
const PUBLIC_DIR  = path.join(ROOT_DIR, 'public');
const DATA_DIR    = path.join(ROOT_DIR, 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'siteContent.json');
const QUOTES_FILE  = path.join(DATA_DIR, 'quotes.json');
const IMAGES_DIR   = path.join(PUBLIC_DIR, 'images');
const UPLOADS_DIR  = path.join(IMAGES_DIR, 'uploads');

// ---------- Ensure directories + starter files ----------
[DATA_DIR, PUBLIC_DIR, IMAGES_DIR, UPLOADS_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});
if (!fs.existsSync(QUOTES_FILE)) {
  fs.writeFileSync(QUOTES_FILE, '[]\n', 'utf8');
}

// ---------- Auth: HMAC-signed bearer tokens ----------
function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function signToken(payload) {
  const p = b64url(JSON.stringify(payload));
  const sig = b64url(crypto.createHmac('sha256', ADMIN_SECRET).update(p).digest());
  return `${p}.${sig}`;
}
function verifyToken(token) {
  if (!token || typeof token !== 'string' || token.indexOf('.') < 0) return null;
  const [p, sig] = token.split('.');
  const expected = b64url(crypto.createHmac('sha256', ADMIN_SECRET).update(p).digest());
  if (expected.length !== sig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const payload = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
    return payload;
  } catch (_) {
    return null;
  }
}
function requireAdmin(req, res, next) {
  const auth = req.get('authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  const payload = m ? verifyToken(m[1]) : null;
  if (!payload || payload.role !== 'admin') {
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }
  req.admin = payload;
  next();
}

// Simple in-memory rate limit for login attempts
const LOGIN_ATTEMPTS = new Map(); // ip -> {count, resetAt}
function loginRateLimit(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const entry = LOGIN_ATTEMPTS.get(ip) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + 15 * 60 * 1000; }
  entry.count += 1;
  LOGIN_ATTEMPTS.set(ip, entry);
  if (entry.count > 8) {
    return res.status(429).json({ success: false, error: 'Too many attempts. Try again later.' });
  }
  next();
}

// ---------- App ----------
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '512kb' }));

// Security headers + Content Security Policy
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), microphone=()');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "script-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'"
    ].join('; ')
  );
  next();
});

// ---------- API: auth ----------
app.post('/api/admin/login', loginRateLimit, (req, res) => {
  const pw = (req.body && typeof req.body.password === 'string') ? req.body.password : '';
  if (!pw || pw !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Invalid password' });
  }
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const token = signToken({ role: 'admin', iat: Date.now(), exp: expiresAt });
  res.json({ success: true, token, expiresAt });
});

// ---------- API: site content ----------
app.get('/api/content', async (req, res) => {
  try {
    const raw = await fsp.readFile(CONTENT_FILE, 'utf8');
    res.type('application/json').send(raw);
  } catch (err) {
    console.error('Failed to read content:', err.message);
    res.status(500).json({ success: false, error: 'Failed to read content' });
  }
});

app.post('/api/content', requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }
    const json = JSON.stringify(body, null, 2);
    if (json.length > 4 * 1024 * 1024) {
      return res.status(413).json({ success: false, error: 'Content too large' });
    }
    try {
      const prev = await fsp.readFile(CONTENT_FILE, 'utf8');
      await fsp.writeFile(CONTENT_FILE + '.bak', prev, 'utf8');
    } catch (_) { /* ignore */ }
    await fsp.writeFile(CONTENT_FILE, json, 'utf8');
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to save content:', err.message);
    res.status(500).json({ success: false, error: 'Failed to save content' });
  }
});

// ---------- API: quote requests ----------
/**
 * A quote submission is stored append-only to data/quotes.json as:
 *   { id, receivedAt, status: 'new'|'read'|'archived', payload: {...} }
 * The client-facing form only sends payload fields; everything else is set here.
 */
function sanitize(v, max = 2000) {
  if (typeof v !== 'string') return '';
  return v.replace(/[\r\n]+/g, '\n').slice(0, max).trim();
}

app.post('/api/quote', async (req, res) => {
  try {
    const b = req.body || {};
    const email = sanitize(b.email, 200);
    // Very light validation. Real MX/email checking belongs at delivery time.
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'A valid email is required.' });
    }
    // Honeypot: bots often fill hidden fields. If it's non-empty, silently accept and drop.
    if (typeof b.website === 'string' && b.website.trim() !== '') {
      return res.json({ success: true });
    }
    const payload = {
      name:              sanitize(b.name, 200),
      email,
      phone:             sanitize(b.phone, 60),
      startDate:         sanitize(b.startDate, 40),
      endDate:           sanitize(b.endDate, 40),
      petCount:          sanitize(b.petCount, 60),
      petTypes:          sanitize(b.petTypes, 300),
      address:           sanitize(b.address, 400),
      travelPurpose:     sanitize(b.travelPurpose, 100),
      addons:            Array.isArray(b.addons) ? b.addons.map((a) => sanitize(a, 60)).slice(0, 30) : [],
      contactPreference: sanitize(b.contactPreference, 60),
      notes:             sanitize(b.notes, 2000),
    };
    const entry = {
      id: 'q-' + Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex'),
      receivedAt: new Date().toISOString(),
      status: 'new',
      payload,
    };
    let list = [];
    try {
      const raw = await fsp.readFile(QUOTES_FILE, 'utf8');
      list = JSON.parse(raw);
      if (!Array.isArray(list)) list = [];
    } catch (_) {
      list = [];
    }
    list.unshift(entry);
    // Cap growth defensively.
    if (list.length > 5000) list = list.slice(0, 5000);
    await fsp.writeFile(QUOTES_FILE, JSON.stringify(list, null, 2), 'utf8');
    res.json({ success: true, id: entry.id });
  } catch (err) {
    console.error('Failed to save quote:', err.message);
    res.status(500).json({ success: false, error: 'Something went wrong saving your request.' });
  }
});

// Admin: list submissions
app.get('/api/quotes', requireAdmin, async (req, res) => {
  try {
    const raw = await fsp.readFile(QUOTES_FILE, 'utf8');
    const list = JSON.parse(raw);
    res.json({ success: true, quotes: Array.isArray(list) ? list : [] });
  } catch (err) {
    res.json({ success: true, quotes: [] });
  }
});

// Admin: change status or delete
app.patch('/api/quotes/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!['new', 'read', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const raw = await fsp.readFile(QUOTES_FILE, 'utf8');
    const list = JSON.parse(raw);
    const idx = list.findIndex((q) => q.id === id);
    if (idx < 0) return res.status(404).json({ success: false, error: 'Not found' });
    list[idx].status = status;
    await fsp.writeFile(QUOTES_FILE, JSON.stringify(list, null, 2), 'utf8');
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to patch quote:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update' });
  }
});

app.delete('/api/quotes/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const raw = await fsp.readFile(QUOTES_FILE, 'utf8');
    const list = JSON.parse(raw);
    const filtered = list.filter((q) => q.id !== id);
    await fsp.writeFile(QUOTES_FILE, JSON.stringify(filtered, null, 2), 'utf8');
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete quote:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete' });
  }
});

// ---------- API: image upload (used only by admin) ----------
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname || '') || '').toLowerCase();
    if (!ALLOWED_EXT.has(ext)) return cb(new Error('Unsupported image type.'));
    const safeBase = path.basename(file.originalname || 'image', ext)
      .toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'image';
    const stamp = Date.now().toString(36);
    const rand  = crypto.randomBytes(4).toString('hex');
    cb(null, `${safeBase}-${stamp}-${rand}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!/^image\/(jpeg|png|gif|webp|avif)$/i.test(file.mimetype)) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});
app.post('/api/upload', requireAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, error: err.message });
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    res.json({ success: true, path: `/images/uploads/${req.file.filename}`, filename: req.file.filename });
  });
});

// ---------- Static files ----------
app.use(express.static(PUBLIC_DIR, {
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    if (/\.(png|jpe?g|gif|webp|avif|svg|ico)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 7d
    } else if (/\.(js|css)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1h
    }
  },
}));

// SPA fallback: everything that isn't an /api or a static file returns index.html.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Simply the Best House-Sitters running on http://localhost:${PORT}`);
  console.log(`Admin available at         http://localhost:${PORT}/admin`);
});
