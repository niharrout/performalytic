/**
 * fix-selfclose.js
 *
 * Repairs SVG tags where the self-closing slash sits BEFORE an attribute:
 *
 *   <path d="..." marker-end="url(#a)"/ style="stroke:var(--x)">
 *                                            ^
 * The HTML tokenizer enters the self-closing state on '/', then sees whitespace,
 * which is a missing-whitespace-between-attributes parse error. It reconsumes in
 * the before-attribute-name state WITHOUT ever setting the self-closing flag, so
 * when it reaches '>' the element is emitted open. Everything that follows nests
 * inside it and collapses to a 0x0 bounding box, so the diagram stops rendering.
 *
 * This moves the slash to the end of the tag:
 *
 *   <path d="..." marker-end="url(#a)" style="stroke:var(--x)"/>
 *
 * Only <svg>...</svg> spans in .html files are touched, so inline <script>
 * content is never rewritten. Idempotent: correct tags are left untouched.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SKIP = new Set(['node_modules', '.git']);

function walk(d, out) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const TAG = /<[a-zA-Z][a-zA-Z0-9:.-]*(?:[^<>"']|"[^"]*"|'[^']*')*>/g;

function fixTag(tag) {
  const body = tag.slice(1, -1);
  let q = null;
  let cut = -1;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (q) { if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === '/' && /\s/.test(body[i + 1] || '')) { cut = i; break; }
  }
  if (cut < 0) return null;
  const nb = body.slice(0, cut) + body.slice(cut + 1);
  return '<' + nb.replace(/\s+$/, '') + '/>';
}

function fixSvgSpan(span) {
  let n = 0;
  const out = span.replace(TAG, (m) => {
    const r = fixTag(m);
    if (r !== null) { n++; return r; }
    return m;
  });
  return [out, n];
}

const SVG_SPAN = /<svg[\s\S]*?<\/svg>/g;

let scanned = 0, filesFixed = 0, tagsFixed = 0;
for (const f of walk(ROOT, [])) {
  scanned++;
  const src = fs.readFileSync(f, 'utf8');
  let n = 0;
  const out = src.replace(SVG_SPAN, (m) => {
    const [r, k] = fixSvgSpan(m);
    n += k;
    return r;
  });
  if (n) {
    fs.writeFileSync(f, out, 'utf8');
    filesFixed++;
    tagsFixed += n;
    console.log('fixed ' + path.relative(ROOT, f) + '  tags: ' + n);
  }
}
console.log('\nfiles scanned: ' + scanned + ' | files updated: ' + filesFixed + ' | tags repaired: ' + tagsFixed);
