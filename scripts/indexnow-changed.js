'use strict';
// Submit the pages changed in the last push to IndexNow.
// Falls back to the full sitemap when the diff cannot be computed (first push,
// shallow clone, or a docs-only change). Used by the Pages workflow after deploy.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ROOT, SITE } = require('./lib');
const KEY = process.env.INDEXNOW_KEY || 'b7f4c2e9a1d64f0e8c35b9d2a6e71c48';
// Overridable for testing: INDEXNOW_DIFF_RANGE="HEAD~2 HEAD~1"
const RANGE = process.env.INDEXNOW_DIFF_RANGE || 'HEAD~1 HEAD';

function changedFiles() {
  try {
    // No pathspec: Windows shells mangle quoted globs, so filter in JS instead.
    return execSync(`git diff --name-only --diff-filter=AM ${RANGE}`, {
      cwd: ROOT, encoding: 'utf8'
    }).trim().split(/\r?\n/).filter(f => f.endsWith('.html'));
  } catch (e) {
    return [];
  }
}

function toUrl(file) {
  const rel = file.replace(/\\/g, '/');
  if (rel.startsWith('_') || rel.startsWith('__') || rel.startsWith('assets/')) return null;
  if (['404.html', 'maintenance.html', 'thank-you.html'].includes(rel)) return null;
  const u = rel === 'index.html' ? '/' : '/' + rel.replace(/index\.html$/, '');
  return SITE + u;
}

const urls = [...new Set(changedFiles().map(toUrl).filter(Boolean))];
if (!urls.length) {
  console.log('No changed pages detected; submitting sitemap.xml instead.');
  urls.push(SITE + '/sitemap.xml');
}
if (!urls.includes(SITE + '/sitemap.xml')) urls.push(SITE + '/sitemap.xml');

(async () => {
  const body = {
    host: new URL(SITE).host,
    key: KEY,
    keyLocation: SITE + '/' + KEY + '.txt',
    urlList: urls.slice(0, 10000)
  };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body)
  });
  console.log('IndexNow', res.status, res.statusText, '| URLs:', urls.length);
  if (!res.ok) console.log(await res.text());
})();