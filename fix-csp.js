/**
 * fix-csp.js — blog posts ship `style-src 'self' … 'nonce-…'` with no
 * 'unsafe-inline'. A nonce in the list makes 'unsafe-inline' a no-op, so every
 * inline `style="…"` attribute is blocked and SVG diagrams fall back to the
 * initial `fill: black`. Add `style-src-attr 'unsafe-inline'` (CSP3) so style
 * attributes are allowed while <style> elements keep their nonce check.
 * Idempotent.
 */
const fs = require('fs');
const path = require('path');

const FROM = "style-src 'self' https://fonts.googleapis.com 'nonce-P3rf0rm4lyt1c';";
const TO = "style-src 'self' https://fonts.googleapis.com 'nonce-P3rf0rm4lyt1c'; style-src-attr 'unsafe-inline';";
const SKIPPED = "style-src-attr 'unsafe-inline'";

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

let changed = 0, already = 0;
for (const f of html) {
  const h = fs.readFileSync(f, 'utf8');
  if (h.includes(SKIPPED)) { already++; continue; }
  if (!h.includes(FROM)) continue;
  fs.writeFileSync(f, h.split(FROM).join(TO), 'utf8');
  changed++;
  console.log('fixed  ' + f);
}
console.log('\nupdated: ' + changed + '   already fixed: ' + already + '   scanned: ' + html.length);
