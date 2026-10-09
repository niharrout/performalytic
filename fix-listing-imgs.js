/**
 * fix-listing-imgs.js — point every blog listing `img` field (and the
 * Popular Posts thumbs) at that post's own featured hero, so the card
 * thumbnail matches what the reader sees after clicking through.
 */
const fs = require('fs');
const path = require('path');

// slug -> featured hero src, read from each post page
const map = {};
for (const d of fs.readdirSync('blog')) {
  const f = path.join('blog', d, 'index.html');
  if (!fs.existsSync(f)) continue;
  const html = fs.readFileSync(f, 'utf8');
  const m = /<img src="(\/assets\/images\/blog\/[^"]+)"[^>]*class="featured-image"/.exec(html);
  if (m) map[d] = m[1];
}
console.log('posts with a featured hero: ' + Object.keys(map).length);

const listing = 'blog/index.html';
let html = fs.readFileSync(listing, 'utf8');

// 1. card data array: {slug:"x", ..., img:"..."}
let changed = 0;
html = html.replace(/(\{slug:"([^"]+)"[\s\S]*?img:")([^"]+)(")/g, (all, pre, slug, cur, tail) => {
  const want = map[slug];
  if (!want) { console.log('  ! no featured hero for slug ' + slug); return all; }
  if (cur === want) return all;
  changed++;
  return pre + want + tail;
});
console.log('listing img fields updated: ' + changed);

// 2. Popular Posts thumbs: <div class="popular-post"> ... <img src> ... <a href="/blog/slug/">
let popChanged = 0;
html = html.replace(/<div class="popular-post">[\s\S]*?<\/div>\s*<div class="popular-post-info">\s*<h4><a href="\/blog\/([^/]+)\//g,
  (block, slug) => {
    const want = map[slug];
    if (!want) { console.log('  ! popular: no hero for ' + slug); return block; }
    const cur = /<img src="([^"]+)"/.exec(block);
    if (!cur) return block;
    if (cur[1] === want) return block;
    popChanged++;
    return block.replace(cur[1], want);
  });
console.log('popular-post thumbs updated: ' + popChanged);

fs.writeFileSync(listing, html);

// verify
const final = fs.readFileSync(listing, 'utf8');
const imgs = [...final.matchAll(/img:\s*"([^"]+)"/g)].map(x => x[1]);
console.log('img fields: ' + imgs.length + ' | unique: ' + new Set(imgs).size);
let bad = 0;
imgs.forEach(i => { if (!fs.existsSync('.' + i)) { console.log('  MISSING ' + i); bad++; } });
console.log('missing files: ' + bad);

// every listing img must now equal its post's featured hero
let mismatch = 0;
for (const m2 of final.matchAll(/\{slug:"([^"]+)"[\s\S]*?img:"([^"]+)"/g)) {
  if (map[m2[1]] !== m2[2]) { console.log('  MISMATCH ' + m2[1] + ' -> ' + m2[2] + ' (want ' + map[m2[1]] + ')'); mismatch++; }
}
console.log('slug/hero mismatches: ' + mismatch);
