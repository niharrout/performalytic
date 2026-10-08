const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const slug = process.argv[2] || 'database-ci-cd-pipeline';
const file = 'blog/' + slug + '/index.html';
const canonicalUrl = 'https://performalytic.com/blog/' + slug + '/';
const html = fs.readFileSync(file, 'utf8');
const $ = cheerio.load(html);
let fail = 0;
const ok = (m) => console.log('  OK   ' + m);
const bad = (m) => { console.log('  FAIL ' + m); fail++; };

console.log('== JSON-LD ==');
const blocks = [];
$('script[type="application/ld+json"]').each((i, el) => {
  const raw = $(el).html();
  try { blocks.push(JSON.parse(raw)); ok('block ' + i + ' parses'); }
  catch (e) { bad('block ' + i + ' invalid: ' + e.message); }
});
const flat = blocks.flat();
const types = flat.map(b => b['@type']);
ok('types: ' + types.join(', '));
const art = flat.find(b => b['@type'] === 'Article');
const bc = flat.find(b => b['@type'] === 'BreadcrumbList');
const faq = flat.find(b => b['@type'] === 'FAQPage');
if (!art) bad('no Article'); else {
  if (art.mainEntityOfPage !== canonicalUrl) bad('Article mainEntityOfPage wrong: ' + art.mainEntityOfPage);
  else ok('Article url ok');
  if (!art.author || !art.author['@id']) bad('Article author missing'); else ok('Article author ' + art.author['@id']);
}
if (!bc) bad('no BreadcrumbList'); else ok('breadcrumb: ' + bc.itemListElement.map(x => x.name).join(' > '));
if (!faq) {
  if ($('#faq').length) bad('visible FAQ section but no FAQPage JSON-LD');
  else ok('no FAQ section (JSON-LD omitted) — skipped');
} else ok('FAQ questions: ' + faq.mainEntity.length);

console.log('== visible FAQ vs JSON-LD ==');
const visFaq = [];
$('#faq').nextAll('h3').each((i, el) => visFaq.push($(el).text().trim()));
if (faq) {
  const j = faq.mainEntity.map(q => q.name);
  if (visFaq.length !== j.length) bad('FAQ count mismatch: visible ' + visFaq.length + ' vs jsonld ' + j.length);
  else ok('FAQ count matches (' + j.length + ')');
  j.forEach((q, i) => { if (visFaq[i] !== q) bad('FAQ #' + (i+1) + ' mismatch:\n         visible: ' + visFaq[i] + '\n         jsonld : ' + q); });
}

console.log('== TOC anchors ==');
const hrefs = [];
$('.post-toc a').each((i, el) => hrefs.push($(el).attr('href')));
if (!hrefs.length) bad('no TOC found');
hrefs.forEach(h => {
  const id = h.slice(1);
  if ($('#' + id).length) ok('anchor ' + h);
  else bad('anchor ' + h + ' has no target');
});
console.log('  h2 count: ' + $('h2[id]').length + ', toc entries: ' + hrefs.length);

console.log('== hero description ==');
const hero = $('.hero-description').text().trim();
const wc = hero.split(/\s+/).length;
console.log('  words: ' + wc);
if (!hero) bad('no hero-description');
else if (wc < 50 || wc > 80) bad('hero outside 50-80 words'); else ok('hero 50-80 words');
console.log('  first 90 chars: ' + hero.slice(0, 90));

console.log('== meta ==');
const title = $('title').text();
console.log('  title (' + title.length + '): ' + title);
const desc = $('meta[name="description"]').attr('content');
console.log('  desc (' + desc.length + '): ' + desc);
const canon = $('link[rel="canonical"]').attr('href');
if (canon !== canonicalUrl) bad('canonical wrong: ' + canon); else ok('canonical ok');
$('link[rel="alternate"][hreflang]').each((i, el) => {
  const href = $(el).attr('href');
  if (href !== canonicalUrl) bad('hreflang[' + $(el).attr('hreflang') + '] wrong: ' + href);
});
if ($('meta[property="og:url"]').attr('content') !== canonicalUrl) bad('og:url wrong');
else ok('hreflang + og:url ok');
if (desc.length > 165) bad('meta description too long'); else ok('meta description length ok');

console.log('== leftover template refs ==');
const headlineCtx = [
  $('title').text(),
  $('h1').text(),
  $('.hero-description').text(),
  $('meta[property="og:title"]').attr('content') || '',
  (bc ? bc.itemListElement.map(x => x.name).join(' ') : ''),
  $('.related-title').text()
].join(' ');
if (slug !== 'data-reconciliation-guide' && /reconciliation/i.test(headlineCtx)) bad('reconciliation leaked into headline context: ' + headlineCtx);
else ok('no foreign topic leaked into title/h1/hero/breadcrumb');
if (/data-reconciliation-guide|hero-data-reconciliation/.test(html) && slug !== 'data-reconciliation-guide') bad('template slug/image leftover');
else ok('no template slug or image leftover');

console.log('== internal links ==');
const seen = new Set();
$('a[href^="/"]').each((i, el) => {
  const href = $(el).attr('href');
  if (seen.has(href)) return;
  seen.add(href);
  let p = href.replace(/^\/+/, '');
  if (p === '' ) return;
  if (p.endsWith('/')) p += 'index.html';
  if (!fs.existsSync(p)) bad('broken internal link: ' + href);
});
ok('checked ' + seen.size + ' unique internal links');

console.log('== images ==');
$('img').each((i, el) => {
  const src = $(el).attr('src');
  if (!src || src.startsWith('http')) return;
  const p = src.replace(/^\/+/, '');
  if (!fs.existsSync(p)) bad('missing image: ' + src); else ok('image ' + src);
  if (!$(el).attr('alt')) bad('img missing alt: ' + src);
});
if (!$('.featured-image').attr('width')) bad('featured image missing width/height');

console.log('== h1 ==');
const h1 = $('h1').text().trim();
console.log('  ' + h1);
if ($('h1').length !== 1) bad('expected exactly one h1, got ' + $('h1').length);

console.log(fail ? '\n>>> ' + fail + ' FAILURES' : '\n>>> ALL CHECKS PASSED');
process.exit(fail ? 1 : 0);
