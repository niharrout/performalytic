'use strict';
// Submit URLs to IndexNow (Bing, Yandex, Seznam, Naver).
// Usage:
//   node scripts/indexnow.js                 -> every URL in sitemap.xml
//   node scripts/indexnow.js <url> [<url>]   -> only the URLs given
// INDEXNOW_KEY overrides the key below (used by CI).
const fs = require('fs');
const path = require('path');
const KEY = process.env.INDEXNOW_KEY || 'b7f4c2e9a1d64f0e8c35b9d2a6e71c48';
const SITE = 'https://performalytic.com';

(async () => {
  let urlList = process.argv.slice(2).filter(a => a.startsWith('http'));
  if (!urlList.length) {
    const xml = fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8');
    urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  }
  urlList = [...new Set(urlList.map(u => u.split('#')[0]))].slice(0, 10000);
  if (!urlList.length) return console.log('IndexNow: nothing to submit');

  const body = {
    host: new URL(SITE).host,
    key: KEY,
    keyLocation: SITE + '/' + KEY + '.txt',
    urlList
  };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body)
  });
  console.log('IndexNow', res.status, res.statusText, '| URLs:', urlList.length);
  if (!res.ok) console.log(await res.text());
})();
