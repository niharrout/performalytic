'use strict';
const { SITE, read, write, walkHtml, mapJsonLd } = require('./lib');

let n = 0;
for (const file of walkHtml()) {
  let html = read(file);
  const before = html;
  html = mapJsonLd(html, data => {
    const walk = o => {
      if (!o || typeof o !== 'object') return;
      if (Array.isArray(o)) { o.forEach(walk); return; }
      for (const k of ['logo', 'image', 'thumbnailUrl']) {
        if (typeof o[k] === 'string' && o[k].startsWith('/')) { o[k] = SITE + o[k]; n++; }
      }
      for (const v of Object.values(o)) walk(v);
    };
    walk(data);
    return data;
  });
  if (html !== before) write(file, html);
}
console.log('absolutized schema image URLs:', n);
