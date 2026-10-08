/**
 * fix-old-diagrams.js — make the three hand-written diagrams theme-safe.
 *
 *  - fill="var(...)" / stroke="var(...)" presentation attributes -> style=""
 *  - light-theme-only hex text colours -> semantic --pa-at-* / --pa-t-* vars
 *  - white text sitting on a neutral surface -> --pa-t-strong
 *  - neutral strokes -> --pa-t-muted
 *
 * Only touches content between <!-- diagram section --> and </svg>, and is
 * idempotent (re-running produces no change).
 */
const fs = require('fs');

const POSTS = ['automated-data-reconciliation', 'data-reconciliation-guide', 'database-ci-cd-pipeline'];

const TEXT_FILL_MAP = {
  '#d1fae5': 'var(--pa-at-green)',
  '#a7f3d0': 'var(--pa-at-green-2)',
  '#dbeafe': 'var(--pa-at-blue)',
  '#fecaca': 'var(--pa-at-red)',
  '#94a3b8': 'var(--pa-t-muted)',
  '#10b981': 'var(--pa-at-green)',
  '#ef4444': 'var(--pa-at-red)',
  '#60a5fa': 'var(--pa-at-blue)'
};
const STROKE_MAP = {
  '#94a3b8': 'var(--pa-t-muted)',
  '#60a5fa': 'var(--pa-at-blue)',
  '#10b981': 'var(--pa-at-green)',
  '#ef4444': 'var(--pa-at-red)'
};

function setStyle(tag, prop, value) {
  const m = tag.match(/\sstyle="([^"]*)"/);
  if (m) {
    const decls = m[1].split(';').map(s => s.trim()).filter(Boolean)
      .filter(d => d.split(':')[0].trim() !== prop);
    decls.push(prop + ':' + value);
    return tag.replace(/\sstyle="[^"]*"/, ' style="' + decls.join(';') + '"');
  }
  return tag.replace(/>$/, ' style="' + prop + ':' + value + '">');
}

function fixBlock(block) {
  // walk tags in document order so we know which rect each text sits on
  const re = /<(rect|text|path|circle|polygon|tspan)\b[^>]*>/g;
  let m, lastRectFill = '', out = '', cursor = 0;
  while ((m = re.exec(block))) {
    out += block.slice(cursor, m.index);
    cursor = m.index + m[0].length;
    let tag = m[0];
    const kind = m[1];

    if (kind === 'rect' || kind === 'circle') {
      const f = (tag.match(/\sfill="([^"]*)"/) || [])[1];
      if (f) lastRectFill = f;
    }

    // presentation attributes that use var() are unreliable -> move to style
    const pv = (tag.match(/\sfill="(var\([^"]*\))"/) || [])[1];
    if (pv) { tag = tag.replace(/\sfill="var\([^"]*\)"/, ''); tag = setStyle(tag, 'fill', pv); }
    const ps = (tag.match(/\sstroke="(var\([^"]*\))"/) || [])[1];
    if (ps) { tag = tag.replace(/\sstroke="var\([^"]*\)"/, ''); tag = setStyle(tag, 'stroke', ps); }

    if (kind === 'text') {
      const f = (tag.match(/\sfill="([^"]*)"/) || [])[1];
      if (f && TEXT_FILL_MAP[f]) tag = tag.replace('fill="' + f + '"', 'fill="' + TEXT_FILL_MAP[f] + '"');
      const f2 = (tag.match(/\sfill="([^"]*)"/) || [])[1];
      if (f2 === '#fff' && /var\(--pa-surface-2\)/.test(lastRectFill)) {
        tag = tag.replace('fill="#fff"', 'fill="var(--pa-t-strong)"');
      }
    }
    if (kind === 'path' || kind === 'polygon') {
      const s = (tag.match(/\sstroke="([^"]*)"/) || [])[1];
      if (s && STROKE_MAP[s]) tag = tag.replace('stroke="' + s + '"', 'stroke="' + STROKE_MAP[s] + '"');
      const s2 = (tag.match(/\sstroke="([^"]*)"/) || [])[1];
      if (s2 && s2.indexOf('var(') === 0) { tag = tag.replace(/\sstroke="var\([^"]*\)"/, ''); tag = setStyle(tag, 'stroke', s2); }
    }
    out += tag;
  }
  out += block.slice(cursor);
  return out;
}

let changed = 0;
for (const slug of POSTS) {
  const p = 'blog/' + slug + '/index.html';
  const html = fs.readFileSync(p, 'utf8');
  const s = html.indexOf('<div class="diagram-section">');
  const svgEnd = s < 0 ? -1 : html.indexOf('</svg>', s);
  if (s < 0 || svgEnd < 0) { console.log('no diagram-section in ' + slug); continue; }
  const e = svgEnd + 6;
  const before = html.slice(s, e);
  const after = fixBlock(before);
  if (after === before) { console.log('unchanged ' + slug); continue; }
  fs.writeFileSync(p, html.slice(0, s) + after + html.slice(e), 'utf8');
  console.log('fixed ' + slug);
  changed++;
}
console.log(changed + ' updated');
