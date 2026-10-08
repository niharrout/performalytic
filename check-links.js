const https = require('https');
const fs = require('fs');

const seed = process.argv.slice(2);
const links = new Set();
for (const f of seed) {
  if (!fs.existsSync(f)) continue;
  const h = fs.readFileSync(f, 'utf8');
  for (const m of h.matchAll(/href="(\/[^"]*)"/g)) {
    const l = m[1].split('#')[0];
    if (l && !/\.(css|js|svg|png|jpg|jpeg|webp|ico|xml|txt)$/.test(l)) links.add(l);
  }
}
const list = [...links].sort();
let done = 0;
const bad = [];
console.log('checking', list.length, 'internal links from', seed.length, 'files');
function finish() {
  console.log('broken:', bad.length, '/', list.length);
  bad.sort().forEach(x => console.log('  ' + x));
}
for (const l of list) {
  https.get('https://performalytic.com' + l, r => {
    if (r.statusCode >= 400) bad.push(r.statusCode + ' ' + l);
    r.resume();
    if (++done === list.length) finish();
  }).on('error', () => {
    bad.push('ERR ' + l);
    if (++done === list.length) finish();
  });
}
