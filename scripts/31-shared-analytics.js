/**
 * Replace per-page inline GA4 snippets with the shared consent-aware loader.
 * Idempotent: safe to run more than once.
 *
 * Usage: node scripts/31-shared-analytics.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INCLUDE = '<script src="/assets/js/analytics.js" nonce="P3rf0rm4lyt1c" defer></script>';
const ADD_TO = new Set([
  '404.html',
  'thank-you.html',
  'sitemap.html',
  'book-meeting/index.html',
  'careers/apply/index.html'
]);
const SKIP_DIRS = new Set(['node_modules', '.git', 'assets/docs']);

const MULTI = /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-FV09CSCD2C"[^>]*><\/script>\s*<script[^>]*>[^<]*G-FV09CSCD2C[^<]*<\/script>/;
const INLINE = /<script[^>]*>[^<]*cookie_consent[^<]*G-FV09CSCD2C[^<]*<\/script>/;

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const rel = path.relative(ROOT, path.join(dir, name)).replace(/\\/g, '/');
    if (SKIP_DIRS.has(rel)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

let replaced = 0;
let added = 0;
let already = 0;
let skipped = 0;

for (const file of walk(ROOT, [])) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  let html = fs.readFileSync(file, 'utf8');

  if (html.includes('/assets/js/analytics.js')) {
    already++;
    continue;
  }

  let next = html.replace(MULTI, INCLUDE).replace(INLINE, INCLUDE);

  if (next === html && ADD_TO.has(rel)) {
    next = html.replace('</head>', INCLUDE + '</head>');
    if (next !== html) added++;
  } else if (next !== html) {
    replaced++;
  } else {
    skipped++;
    continue;
  }

  fs.writeFileSync(file, next);
}

console.log(`shared analytics: replaced=${replaced} added=${added} already=${already} skipped=${skipped}`);
