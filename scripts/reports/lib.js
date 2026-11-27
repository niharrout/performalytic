'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORTS = path.join(ROOT, 'reports');

function loadConfig() {
  return JSON.parse(fs.readFileSync(path.join(REPORTS, 'config.json'), 'utf8'));
}

function parseArgs(argv) {
  const out = { period: 'weekly', offline: false, withAi: false, strict: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--period') out.period = argv[++i];
    else if (a === '--offline') out.offline = true;
    else if (a === '--with-ai') out.withAi = true;
    else if (a === '--strict') out.strict = true;
  }
  if (!['daily', 'weekly', 'monthly'].includes(out.period)) {
    throw new Error(`Invalid --period "${out.period}". Use daily, weekly, or monthly.`);
  }
  return out;
}

function startOfUtcDay(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addDays(d, n) {
  const copy = new Date(d.getTime());
  copy.setUTCDate(copy.getUTCDate() + n);
  return copy;
}

function iso(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * GSC has a 2-3 day lag, so every window ends two days ago.
 */
function dateRanges(period, now = new Date()) {
  const end = addDays(startOfUtcDay(now), -2);
  const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : 28;
  const start = addDays(end, -(days - 1));
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -(days - 1));
  return {
    days,
    current: { startDate: iso(start), endDate: iso(end) },
    previous: { startDate: iso(prevStart), endDate: iso(prevEnd) }
  };
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

function csvEscape(value) {
  const s = value === undefined || value === null ? '' : String(value);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function writeCsv(file, header, rows) {
  ensureDir(path.dirname(file));
  const lines = [header.map(csvEscape).join(',')];
  for (const row of rows) lines.push(header.map((h) => csvEscape(row[h])).join(','));
  fs.writeFileSync(file, lines.join('\n') + '\n');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function request(method, url, options = {}) {
  const { headers = {}, body = null, timeout = 30000 } = options;
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        method,
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        headers
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      }
    );
    req.setTimeout(timeout, () => req.destroy(new Error(`Request timed out: ${url}`)));
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function requestJson(method, url, options = {}, attempt = 0) {
  const res = await request(method, url, options);
  const retryable = res.status === 429 || res.status >= 500;
  if (retryable && attempt < 2) {
    await sleep(1000 * Math.pow(2, attempt));
    return requestJson(method, url, options, attempt + 1);
  }
  let json = null;
  try {
    json = res.body ? JSON.parse(res.body) : null;
  } catch (e) {
    throw new Error(`Invalid JSON from ${url} (HTTP ${res.status}): ${res.body.slice(0, 300)}`);
  }
  if (res.status >= 400) {
    const message = json && (json.error?.message || json.message || json.Message);
    throw new Error(`HTTP ${res.status} from ${url}: ${message || res.body.slice(0, 300)}`);
  }
  return json;
}

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

let cachedToken = null;

async function getGoogleAccessToken(scopes) {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  const cacheKey = scopes.join(' ');
  if (cachedToken && cachedToken.key === cacheKey && cachedToken.expires > Date.now() + 60000) {
    return cachedToken.value;
  }

  const sa = JSON.parse(raw);
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: scopes.join(' '),
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    })
  );
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  const signature = signer
    .sign(sa.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const assertion = `${header}.${claim}.${signature}`;

  const body =
    'grant_type=' +
    encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') +
    '&assertion=' +
    encodeURIComponent(assertion);

  const json = await requestJson('POST', 'https://oauth2.googleapis.com/token', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body)
    },
    body
  });
  if (!json.access_token) throw new Error('Google token exchange returned no access_token');
  cachedToken = {
    key: cacheKey,
    value: json.access_token,
    expires: Date.now() + (json.expires_in || 3600) * 1000
  };
  return cachedToken.value;
}

function sum(rows, key) {
  return rows.reduce((n, r) => n + (Number(r[key]) || 0), 0);
}

function weightedPosition(rows) {
  const impressions = sum(rows, 'impressions');
  if (!impressions) return 0;
  return rows.reduce((n, r) => n + (Number(r.position) || 0) * (Number(r.impressions) || 0), 0) / impressions;
}

function pct(n, d) {
  return d ? n / d : 0;
}

function round(n, digits = 1) {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}

function deltaPct(current, previous) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function escapeHtml(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
}

function isOurDomain(url) {
  const host = hostOf(url);
  return host === 'performalytic.com' || host === '4dalert.com';
}

function fmt(n) {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

function fmtPct(n, digits = 1) {
  return `${round(n, digits)}%`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    if (row.some((v) => v !== '')) rows.push(row);
  }
  return rows;
}

module.exports = {
  ROOT,
  REPORTS,
  loadConfig,
  parseArgs,
  dateRanges,
  ensureDir,
  writeJson,
  writeCsv,
  csvEscape,
  request,
  requestJson,
  getGoogleAccessToken,
  sum,
  weightedPosition,
  pct,
  round,
  deltaPct,
  escapeHtml,
  hostOf,
  isOurDomain,
  fmt,
  fmtPct,
  parseCsv,
  sleep,
  iso,
  addDays
};
