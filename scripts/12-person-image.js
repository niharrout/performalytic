'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, mapJsonLd, read, write } = require('./lib');

let n = 0;
for (const d of fs.readdirSync(path.join(ROOT, 'blog'), { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const f = path.join(ROOT, 'blog', d.name, 'index.html');
  if (!fs.existsSync(f)) continue;
  let html = read(f);
  if (!/"@type":\s*"Person"/.test(html)) continue;
  html = mapJsonLd(html, data => {
    const arr = Array.isArray(data) ? data : [data];
    for (const o of arr) {
      if (o && o['@type'] === 'Person' && o.image && String(o.image).includes('/assets/images/blog/')) {
        delete o.image;
        n++;
      }
    }
    return arr;
  });
  write(f, html);
}
console.log('removed misleading Person images:', n);
