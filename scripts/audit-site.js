/**
 * Static-site audit: internal links, page metadata, sitemap, llms.txt.
 *
 * Runs entirely on local files, so it is safe in CI and needs no network.
 * Exit code 1 when errors are found.
 *
 * Usage: node scripts/audit-site.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://performalytic.com';
const SKIP_DIRS = new Set(['node_modules', '.git', 'assets/docs', 'reports']);
const ASSET_EXT = /\.(css|js|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf|eot|mp4|webm|pdf|zip)$/i;

const errors = [];
const warnings = [];

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(ROOT, full).replace(/\\/g, '/');
    if (SKIP_DIRS.has(rel)) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else out.push(rel);
  }
  return out;
}

const allFiles = walk(ROOT, []);
const fileSet = new Set(allFiles);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));

function exists(target) {
  const clean = target.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!clean) return fileSet.has('index.html');
  if (fileSet.has(clean)) return true;
  if (fileSet.has(clean + '/index.html')) return true;
  if (fileSet.has(clean + '.html')) return true;
  return false;
}

function resolveHref(href, fromFile) {
  let value = href.trim();
  if (!value || value.startsWith('#') || value.startsWith('//')) return null;
  if (/^(mailto:|tel:|javascript:|data:)/i.test(value)) return null;
  if (/^https?:\/\//i.test(value)) {
    if (!value.startsWith(SITE)) return null;
    value = value.slice(SITE.length) || '/';
  }
  value = value.split('#')[0].split('?')[0];
  if (!value) return null;
  try {
    value = decodeURIComponent(value);
  } catch (e) {}

  if (value.startsWith('/')) return value;

  // Relative link: resolve against the source file's directory.
  const dir = path.posix.dirname(fromFile);
  const resolved = path.posix.normalize(path.posix.join(dir, value));
  return '/' + resolved.replace(/^\/+/, '');
}

// ---------------------------------------------------------------------------
// 1. Internal links
// ---------------------------------------------------------------------------
let checkedLinks = 0;
for (const file of htmlFiles) {
  const rawHtml = fs.readFileSync(path.join(ROOT, file), 'utf8');
  // Ignore script bodies: they contain template strings that look like hrefs.
  const html = rawHtml.replace(/<script[\s\S]*?<\/script>/gi, '');
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const raw = match[1];
    const target = resolveHref(raw, file);
    if (!target) continue;
    if (ASSET_EXT.test(target)) continue;
    if (target.startsWith('/.well-known/') || /\.(txt|xml)$/i.test(target)) {
      checkedLinks++;
      if (!exists(target)) errors.push(`broken link: ${file} -> ${raw}`);
      continue;
    }
    checkedLinks++;
    if (!exists(target)) errors.push(`broken link: ${file} -> ${raw}`);
  }
}

// ---------------------------------------------------------------------------
// 2. Page metadata + JSON-LD validity
// ---------------------------------------------------------------------------
const titles = new Map();
for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const robots = (html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i) || [])[1] || '';
  if (/noindex/i.test(robots)) continue;

  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch (e) {
      errors.push(`invalid JSON-LD: ${file} (${e.message})`);
    }
  }

  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
  const desc = (html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1];
  const canonical = (html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i) || [])[1];
  const h1s = (html.match(/<h1\b/gi) || []).length;

  if (!title) errors.push(`missing <title>: ${file}`);
  else {
    const t = title.trim();
    if (t.length < 10 || t.length > 70) warnings.push(`title length ${t.length}: ${file}`);
    if (titles.has(t)) warnings.push(`duplicate title: ${file} and ${titles.get(t)}`);
    else titles.set(t, file);
  }
  if (!desc) errors.push(`missing meta description: ${file}`);
  if (!canonical) errors.push(`missing canonical: ${file}`);
  if (h1s !== 1) errors.push(`expected 1 <h1>, found ${h1s}: ${file}`);
  if (!html.includes('/assets/js/analytics.js')) errors.push(`missing analytics loader: ${file}`);
}

// ---------------------------------------------------------------------------
// 3. Sitemap
// ---------------------------------------------------------------------------
const sitemapPath = path.join(ROOT, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  errors.push('missing sitemap.xml');
} else {
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (!locs.length) errors.push('sitemap.xml has no <loc> entries');
  for (const loc of locs) {
    if (!loc.startsWith(SITE)) {
      warnings.push(`sitemap URL outside ${SITE}: ${loc}`);
      continue;
    }
    const target = loc.slice(SITE.length) || '/';
    if (!exists(target)) errors.push(`sitemap URL has no file: ${loc}`);
  }
  const sitemapTargets = new Set(locs.map((l) => l.replace(/\/$/, '')));
  for (const file of htmlFiles) {
    if (file.startsWith('_') || file === '404.html' || file === 'maintenance.html' || file === 'thank-you.html') continue;
    const url = SITE + '/' + file.replace(/index\.html$/, '');
    if (!sitemapTargets.has(url.replace(/\/$/, ''))) warnings.push(`indexable page not in sitemap: ${file}`);
  }
}

// ---------------------------------------------------------------------------
// 4. llms.txt links
// ---------------------------------------------------------------------------
const llmsPath = path.join(ROOT, 'llms.txt');
if (!fs.existsSync(llmsPath)) {
  errors.push('missing llms.txt');
} else {
  const text = fs.readFileSync(llmsPath, 'utf8');
  const urls = [...text.matchAll(/https:\/\/performalytic\.com[^\s)\]"'>]*/g)].map((m) => m[0]);
  for (const url of new Set(urls)) {
    const target = url.slice(SITE.length) || '/';
    if (target.startsWith('/.well-known/') || /\.(txt|xml)$/i.test(target)) {
      if (!exists(target)) errors.push(`llms.txt dead link: ${url}`);
      continue;
    }
    if (!exists(target)) errors.push(`llms.txt dead link: ${url}`);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(`pages=${htmlFiles.length} files=${allFiles.length} links_checked=${checkedLinks}`);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.slice(0, 40).forEach((w) => console.log('  - ' + w));
  if (warnings.length > 40) console.log(`  ... and ${warnings.length - 40} more`);
}
if (errors.length) {
  console.log(`\nErrors (${errors.length}):`);
  errors.slice(0, 60).forEach((e) => console.log('  - ' + e));
  if (errors.length > 60) console.log(`  ... and ${errors.length - 60} more`);
  process.exit(1);
}
console.log('\nOK: no broken internal links or missing page metadata.');
