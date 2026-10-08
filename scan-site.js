const fs = require('fs');
const path = require('path');

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) {
      if (!['node_modules', '_case-studies', '_partners', 'tests', '.git'].includes(f)) walk(p);
    } else if (f.endsWith('.html')) files.push(p);
  }
})(process.argv[2] || '.');

const bad = { noAuthor: [], orgAuthor: [], multiH1: [], noCanon: [], noLlms: [], noJsonld: [], badJsonld: [] };
const stats = { article: 0, personAuthor: 0, faq: 0, speakable: 0 };

for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  const scripts = [...h.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)];
  if (!scripts.length) bad.noJsonld.push(f);

  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) bad.multiH1.push(f + ' h1=' + h1);
  if (!/rel=["']canonical["']/.test(h)) bad.noCanon.push(f);
  if (!/llms\.txt/.test(h)) bad.noLlms.push(f);

  let hasPerson = false, hasOrgAuthor = false, hasArticle = false;
  const parsed = [];
  for (const m of scripts) {
    try { parsed.push(JSON.parse(m[1])); } catch (e) { bad.badJsonld.push(f + ' :: ' + e.message); }
  }

  const byId = {};
  const indexStack = [...parsed];
  while (indexStack.length) {
    const o = indexStack.pop();
    if (!o || typeof o !== 'object') continue;
    if (Array.isArray(o)) { indexStack.push(...o); continue; }
    if (o['@id']) byId[o['@id']] = o;
    for (const v of Object.values(o)) if (v && typeof v === 'object') indexStack.push(v);
  }

  for (const j of parsed) {
    const stack = Array.isArray(j) ? [...j] : [j];
    while (stack.length) {
      const o = stack.pop();
      if (!o || typeof o !== 'object') continue;
      if (Array.isArray(o)) { stack.push(...o); continue; }
      if (o['@graph']) stack.push(o['@graph']);
      const t = o['@type'];
      const types = (Array.isArray(t) ? t : [t]).filter(Boolean);
      if (types.some(x => ['Article', 'BlogPosting', 'TechArticle'].includes(x))) {
        hasArticle = true;
        const list = Array.isArray(o.author) ? o.author : [o.author];
        for (const x of list) {
          if (!x) continue;
          const ref = x['@id'] && !x['@type'] ? byId[x['@id']] : null;
          const src = ref || x;
          const ty = Array.isArray(src['@type']) ? src['@type'] : [src['@type']];
          if (ty.includes('Person')) hasPerson = true;
          if (ty.includes('Organization')) hasOrgAuthor = true;
        }
      }
      if (types.includes('FAQPage')) stats.faq++;
      if (o.speakable) stats.speakable++;
      for (const v of Object.values(o)) if (v && typeof v === 'object') stack.push(v);
    }
  }
  if (hasArticle) stats.article++;
  if (hasPerson) stats.personAuthor++;
  if (hasOrgAuthor) bad.orgAuthor.push(f);
  if (/blog/.test(f) && !hasPerson) bad.noAuthor.push(f);
}

console.log('total html:', files.length, JSON.stringify(stats));
for (const k of Object.keys(bad)) if (bad[k].length) console.log(k + ':', bad[k].length);
const show = (label, arr) => { if (arr.length) { console.log('--- ' + label + ' ---'); arr.forEach(x => console.log('  ' + x)); } };
show('INVALID JSON-LD', bad.badJsonld);
show('article author = Organization', bad.orgAuthor);
show('blog post without Person author', bad.noAuthor);
show('h1 != 1', bad.multiH1);
show('no canonical', bad.noCanon);
show('no llms.txt link in head', bad.noLlms);
show('no JSON-LD at all', bad.noJsonld);
