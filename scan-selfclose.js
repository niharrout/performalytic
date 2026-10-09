/**
 * scan-selfclose.js
 *
 * Companion to fix-selfclose.js. Reports three SVG markup defects inside
 * .html files, scoped to <svg>...</svg> spans only:
 *
 *   1. slash-before-attribute  <path d="..."/ style="...">   (tag never closes)
 *   2. missing space           <rect rx="10"style="...">     (works, but invalid)
 *   3. unbalanced nesting       tags that do not close in the right order, which
 *                               is the observable effect of (1): every following
 *                               node ends up inside the wrong parent and collapses
 *                               to a 0x0 bounding box.
 *
 * All three are found with a quote-aware walk of each tag body, so attribute
 * values containing quotes, slashes or brackets are not misread.
 *
 * Exit code 1 when anything is found.
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

function checkBody(body) {
  const issues = [];
  let q = null;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (q) {
      if (c === q) {
        q = null;
        const n = body[i + 1];
        if (n && /[a-zA-Z_:]/.test(n)) issues.push('nospace');
      }
      continue;
    }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === '/' && /\s/.test(body[i + 1] || '')) issues.push('slash');
  }
  return issues;
}

const SVG_SPAN = /<svg[\s\S]*?<\/svg>/g;
const ANY_TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9:.-]*)((?:[^<>"']|"[^"]*"|'[^']*')*)>/g;

function isSelfClosing(body) {
  let q = null;
  let lastNonWs = '';
  for (const c of body) {
    if (q) { if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; lastNonWs = c; continue; }
    if (!/\s/.test(c)) lastNonWs = c;
  }
  return lastNonWs === '/';
}

function checkSpan(span) {
  const issues = { slash: 0, nospace: 0, balance: 0, detail: [] };
  const stack = [];
  ANY_TAG.lastIndex = 0;
  let m;
  while ((m = ANY_TAG.exec(span))) {
    const [full, closing, name, body] = m;
    if (closing) {
      if (stack.length && stack[stack.length - 1] === name) stack.pop();
      else { issues.balance++; issues.detail.push('unexpected </' + name + '>'); }
      continue;
    }
    const errs = checkBody(body);
    if (errs.includes('slash')) { issues.slash++; issues.detail.push('slash <' + name + ' ' + body.slice(0, 70) + '>'); }
    if (errs.includes('nospace')) { issues.nospace++; issues.detail.push('nospace <' + name + ' ' + body.slice(0, 70) + '>'); }
    if (!isSelfClosing(body)) stack.push(name);
  }
  if (stack.length) { issues.balance++; issues.detail.push('unclosed: ' + stack.join(' > ')); }
  return issues;
}

let scanned = 0, slash = 0, nospace = 0, balance = 0;
const byFile = {};

for (const f of walk(ROOT, [])) {
  scanned++;
  const src = fs.readFileSync(f, 'utf8');
  const rel = path.relative(ROOT, f);
  for (const span of src.match(SVG_SPAN) || []) {
    const r = checkSpan(span);
    if (!r.slash && !r.nospace && !r.balance) continue;
    if (!byFile[rel]) byFile[rel] = [];
    slash += r.slash; nospace += r.nospace; balance += r.balance;
    r.detail.forEach(d => byFile[rel].push(d));
  }
}

console.log('files scanned: ' + scanned +
  ' | slash-before-attribute: ' + slash +
  ' | missing-space: ' + nospace +
  ' | unbalanced: ' + balance);
for (const [f, list] of Object.entries(byFile)) {
  console.log(f);
  list.forEach(l => console.log('   ', l));
}
process.exit(slash + nospace + balance ? 1 : 0);
