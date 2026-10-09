/**
 * scan-csp.js — list every page whose meta CSP blocks inline style attributes
 * (style-src with no 'unsafe-inline' and no style-src-attr override).
 */
const fs = require('fs');
const path = require('path');

const html = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) html.push(p);
  }
};
walk('.');

let bad = 0, noCsp = 0;
const reasons = {};
for (const f of html) {
  const h = fs.readFileSync(f, 'latin1');
  const m = /http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(h);
  if (!m) { noCsp++; continue; }
  const csp = m[1];
  const attr = /style-src-attr\s+([^;]+)/.exec(csp);
  const src = /(?:^|;)\s*style-src\s+([^;]+)/.exec(csp);
  let ok = false, why = '';
  if (attr) { ok = /'unsafe-inline'/.test(attr[1]); why = 'style-src-attr ' + attr[1].trim(); }
  else if (src) {
    ok = /'unsafe-inline'/.test(src[1]) && !/'nonce-/.test(src[1]) && !/'sha256-/.test(src[1]) && !/'sha384-/.test(src[1]) && !/'sha512-/.test(src[1]);
    why = 'style-src ' + src[1].trim();
  }
  if (!ok) {
    bad++;
    reasons[why || 'no style-src'] = (reasons[why || 'no style-src'] || 0) + 1;
    if (bad <= 400) console.log((bad + '').padStart(4) + '  ' + f);
  }
}
console.log('\ntotal html: ' + html.length + ' | no CSP meta: ' + noCsp + ' | BLOCKS style attributes: ' + bad);
console.log('\npolicy breakdown:');
Object.entries(reasons).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + String(v).padStart(4) + '  ' + k));
