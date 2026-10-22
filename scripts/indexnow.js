'use strict';
// Submit every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver).
// Run after deploy: node scripts/indexnow.js
const fs = require('fs');
const path = require('path');
const KEY = 'b7f4c2e9a1d64f0e8c35b9d2a6e71c48';
const SITE = 'https://performalytic.com';

(async () => {
  const xml = fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8');
  const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
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
