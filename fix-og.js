/**
 * fix-og.js — make og:image / twitter:image / JSON-LD image match the post's
 * visible featured hero, so every post has one image (no shared generic jpgs).
 * Usage: node fix-og.js --dry | node fix-og.js
 */
const fs = require('fs');
const path = require('path');
const dry = process.argv.includes('--dry');
const BASE = 'https://performalytic.com';

const dirs = fs.readdirSync('blog').filter(d => fs.existsSync(path.join('blog', d, 'index.html')));
let changed = 0;
for (const d of dirs.sort()) {
  const p = path.join('blog', d, 'index.html');
  let h = fs.readFileSync(p, 'utf8');
  const before = h;

  const imgTag = h.match(/<img src="\/assets\/images\/blog\/([^"]+)"[^>]*class="featured-image"[^>]*/);
  if (!imgTag) { console.log('!! ' + d + ': no featured <img> — skipped'); continue; }
  const img = imgTag[1];
  const imgAlt = (imgTag[0].match(/alt="([^"]*)"/) || [])[1] || '';
  const w = (imgTag[0].match(/width="(\d+)"/) || [])[1] || '1200';
  const hh = (imgTag[0].match(/height="(\d+)"/) || [])[1] || '600';

  const og = (h.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
  if (!og) { console.log('!! ' + d + ': no og:image — skipped'); continue; }
  if (og.endsWith('/' + img)) continue;

  const log = [];
  const set = (label, re, val) => {
    if (re.test(h)) { h = h.replace(re, val); log.push(label); }
  };

  set('og:image', /(<meta property="og:image" content=")[^"]*(" \/>)/,
    '$1' + BASE + '/assets/images/blog/' + img + '$2');
  set('twitter:image', /(<meta name="twitter:image" content=")[^"]*(" \/>)/,
    '$1' + BASE + '/assets/images/blog/' + img + '$2');
  set('og:image:alt', /(<meta property="og:image:alt" content=")[^"]*(" \/>)/,
    '$1' + imgAlt.replace(/\$/g, '$$$$') + '$2');
  set('og:image:width', /(<meta property="og:image:width" content=")[^"]*(" \/>)/, '$1' + w + '$2');
  set('og:image:height', /(<meta property="og:image:height" content=")[^"]*(" \/>)/, '$1' + hh + '$2');
  set('og:image:type', /(<meta property="og:image:type" content=")[^"]*(" \/>)/, '$1image/svg+xml$2');

  // Article JSON-LD image (only inside the Article script block, never the Organization one)
  const artIdx = h.search(/"@type"\s*:\s*"Article"/);
  const scriptEnd = artIdx >= 0 ? h.indexOf('</script>', artIdx) : -1;
  if (artIdx >= 0 && scriptEnd > artIdx) {
    const seg = h.slice(artIdx, scriptEnd);
    const seg2 = seg.replace(/("image"\s*:\s*")[^"]*(")/, '$1/assets/images/blog/' + img + '$2');
    if (seg2 !== seg) { h = h.slice(0, artIdx) + seg2 + h.slice(scriptEnd); log.push('jsonld:image'); }
  }

  if (h === before) continue;
  changed++;
  if (dry) console.log('[dry] ' + d.padEnd(44) + ' og=' + og.split('/').pop() + ' -> ' + img + '  (' + log.join(', ') + ')');
  else fs.writeFileSync(p, h, 'utf8');
}
console.log((dry ? '[dry] ' : '') + 'posts updated: ' + changed + ' / ' + dirs.length);
