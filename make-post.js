/**
 * make-post.js - generate a blog post from a spec, using an existing post as the
 * structural template (head, nav, styles, footer, scripts are copied verbatim).
 *
 *   node make-post.js <path/to/spec.js>
 *
 * The TOC is derived from the <h2 id="..."> headings in spec.content, so the
 * table of contents can never drift out of sync with the anchors it links to.
 */
const fs = require('fs');
const path = require('path');

const TEMPLATE = 'blog/database-ci-cd-pipeline/index.html';
const EOL = '\r\n';

function die(msg) { console.error('FAIL: ' + msg); process.exit(1); }

function replaceOnce(h, find, repl, label) {
  const i = h.indexOf(find);
  if (i === -1) die('marker not found for ' + label + ': ' + JSON.stringify(find.slice(0, 90)));
  if (h.indexOf(find, i + 1) !== -1) die('marker not unique for ' + label);
  return h.slice(0, i) + repl + h.slice(i + find.length);
}

function replaceRe(h, re, repl, label) {
  const m = h.match(re);
  if (!m) die('regex not found for ' + label);
  if (h.replace(re, '').length !== h.length - m[0].length) { /* single match is fine */ }
  const count = (h.match(new RegExp(re.source, 'g' + (re.flags.includes('i') ? 'i' : ''))) || []).length;
  if (count !== 1) die('regex matched ' + count + ' times for ' + label);
  return h.replace(re, repl);
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// Escape bare ampersands for HTML without touching existing entities.
function escAmp(s) {
  return s.replace(/&(?![a-zA-Z][a-zA-Z0-9]*;|#\d+;)/g, '&amp;');
}

// The visible FAQ is generated from spec.faq so it can never diverge from the
// FAQPage JSON-LD. Content must contain the {{FAQ}} token after its h2.
function buildVisibleFaq(spec) {
  return spec.faq.map(f =>
    '      <h3>' + escAmp(f.q) + '</h3>\r\n      <p>' + escAmp(f.a) + '</p>').join('\r\n\r\n      ');
}

function buildToc(content) {
  const items = [];
  const re = /<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g;
  let m;
  while ((m = re.exec(content))) items.push({ href: m[1], label: stripTags(m[2]) });
  if (!items.length) die('content has no <h2 id="..."> headings');
  return items;
}

function buildJsonLd(srcHtml, spec) {
  const m = srcHtml.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) die('template JSON-LD not found');
  const data = JSON.parse(m[1]);
  if (!Array.isArray(data)) die('template JSON-LD is not an array');

  const org = data.find(x => x['@type'] === 'Organization');
  if (!org) die('template JSON-LD has no Organization');

  const url = 'https://performalytic.com/blog/' + spec.slug + '/';
  const authorId = 'https://performalytic.com/#author-' + spec.author.id;

  const out = [
    org,
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': authorId,
      name: spec.author.name,
      jobTitle: spec.author.jobTitle,
      worksFor: { '@id': 'https://performalytic.com/#organization' },
      knowsAbout: spec.author.knowsAbout,
      url: 'https://performalytic.com/about/'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://performalytic.com/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://performalytic.com/blog/' },
        { '@type': 'ListItem', position: 3, name: spec.breadcrumbName, item: url }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: spec.title,
      description: spec.articleDescription,
      image: spec.img,
      author: { '@id': authorId },
      publisher: { '@id': 'https://performalytic.com/#organization' },
      datePublished: spec.iso,
      dateModified: spec.iso,
      mainEntityOfPage: url
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: spec.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    }
  ];

  return '<script type="application/ld+json" nonce="P3rf0rm4lyt1c">' + JSON.stringify(out, null, 2) + '</script>';
}

function main() {
  const specPath = process.argv[2];
  if (!specPath) die('usage: node make-post.js <spec.js>');
  const spec = require(path.resolve(specPath));

  for (const k of ['slug', 'title', 'h1', 'keywords', 'metaDesc', 'articleDescription', 'categoryLabel',
    'date', 'readTime', 'iso', 'section', 'img', 'imgAlt', 'imgCaption', 'heroDescription',
    'breadcrumbName', 'content', 'faq', 'related', 'prev', 'next', 'ctaTitle', 'ctaSub', 'author']) {
    if (spec[k] === undefined || spec[k] === '') die('spec missing field: ' + k);
  }

  const url = 'https://performalytic.com/blog/' + spec.slug + '/';
  const titleTag = spec.title + ' | Performalytic';

  let h = fs.readFileSync(TEMPLATE, 'utf8');
  const lf = h.replace(/\r\n/g, '\n');

  // --- head -------------------------------------------------------------
  h = replaceRe(h, /<title>[^<]*<\/title>/, '<title>' + escapeHtml(titleTag) + '</title>', 'title');
  h = replaceRe(h, /<meta name="keywords" content="[^"]*" \/>/,
    '<meta name="keywords" content="' + escapeHtml(spec.keywords) + '" />', 'keywords');
  h = replaceRe(h, /<meta name="description" content="[^"]*" \/>/,
    '<meta name="description" content="' + escapeHtml(spec.metaDesc) + '" />', 'description');
  h = replaceRe(h, /<link rel="canonical" href="[^"]*" \/>/,
    '<link rel="canonical" href="' + url + '" />', 'canonical');
  h = replaceRe(h, /<link rel="alternate" hreflang="en" href="[^"]*" \/>/,
    '<link rel="alternate" hreflang="en" href="' + url + '" />', 'hreflang en');
  h = replaceRe(h, /<link rel="alternate" hreflang="x-default" href="[^"]*" \/>/,
    '<link rel="alternate" hreflang="x-default" href="' + url + '" />', 'hreflang x-default');

  h = replaceRe(h, /<meta property="og:title" content="[^"]*" \/>/,
    '<meta property="og:title" content="' + escapeHtml(titleTag) + '" />', 'og:title');
  h = replaceRe(h, /<meta property="og:description" content="[^"]*" \/>/,
    '<meta property="og:description" content="' + escapeHtml(spec.metaDesc) + '" />', 'og:description');
  h = replaceRe(h, /<meta property="og:url" content="[^"]*" \/>/,
    '<meta property="og:url" content="' + url + '" />', 'og:url');
  h = replaceRe(h, /<meta property="og:image" content="[^"]*" \/>/,
    '<meta property="og:image" content="https://performalytic.com' + spec.img + '" />', 'og:image');
  h = replaceRe(h, /<meta property="og:image:alt" content="[^"]*" \/>/,
    '<meta property="og:image:alt" content="' + escapeHtml(spec.imgAlt) + '" />', 'og:image:alt');
  h = replaceRe(h, /<meta property="article:published_time" content="[^"]*" \/>/,
    '<meta property="article:published_time" content="' + spec.iso + '" />', 'published');
  h = replaceRe(h, /<meta property="article:modified_time" content="[^"]*" \/>/,
    '<meta property="article:modified_time" content="' + spec.iso + '" />', 'modified');
  h = replaceRe(h, /<meta property="article:section" content="[^"]*" \/>/,
    '<meta property="article:section" content="' + spec.section + '" />', 'section');

  h = replaceRe(h, /<meta name="twitter:title" content="[^"]*" \/>/,
    '<meta name="twitter:title" content="' + escapeHtml(spec.title) + '" />', 'twitter:title');
  h = replaceRe(h, /<meta name="twitter:description" content="[^"]*" \/>/,
    '<meta name="twitter:description" content="' + escapeHtml(spec.metaDesc) + '" />', 'twitter:description');
  h = replaceRe(h, /<meta name="twitter:image" content="[^"]*" \/>/,
    '<meta name="twitter:image" content="https://performalytic.com' + spec.img + '" />', 'twitter:image');

  // --- JSON-LD ----------------------------------------------------------
  h = replaceRe(h, /<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/,
    buildJsonLd(h, spec), 'json-ld');

  // --- post meta / h1 / hero -------------------------------------------
  h = replaceRe(h, /<span class="post-meta-category">[^<]*<\/span>/,
    '<span class="post-meta-category">' + spec.categoryLabel + '</span>', 'category');
  h = replaceRe(h, /<div class="post-meta">[\s\S]*?<\/div>/,
    '<div class="post-meta">\r\n        <span class="post-meta-category">' + spec.categoryLabel + '</span>\r\n' +
    '        <span>' + spec.date + '</span>\r\n        <span>' + spec.readTime + '</span>\r\n      </div>',
    'post-meta');
  h = replaceRe(h, /<h1>[\s\S]*?<\/h1>/, '<h1>' + spec.h1 + '</h1>', 'h1');
  h = replaceRe(h, /<p class="hero-description">[\s\S]*?<\/p>/,
    '<p class="hero-description">' + spec.heroDescription + '</p>', 'hero-description');

  // --- featured image ---------------------------------------------------
  h = replaceRe(h, /<img src="[^"]*" alt="[^"]*" class="featured-image"[^>]* \/>/,
    '<img src="' + spec.img + '" alt="' + escapeHtml(spec.imgAlt) + '" class="featured-image" width="1200" height="600" fetchpriority="high" loading="eager" decoding="async" />',
    'featured img');
  h = replaceRe(h, /<p class="featured-image-caption">[\s\S]*?<\/p>/,
    '<p class="featured-image-caption">' + spec.imgCaption + '</p>', 'featured caption');

  // --- body (TOC + content + post nav) ----------------------------------
  let content = spec.content.trim();
  if (content.includes('{{FAQ}}')) {
    if (!spec.faq.length) die('content has {{FAQ}} but spec.faq is empty');
    content = content.replace('{{FAQ}}', buildVisibleFaq(spec));
  } else if (spec.faq.length) {
    die('spec.faq is non-empty but content has no {{FAQ}} token');
  }

  const tocItems = buildToc(content);
  const toc = '<nav class="post-toc" aria-label="Table of contents">\r\n        <h3>In this article</h3>\r\n        <ul>\r\n' +
    tocItems.map(t => '          <li><a href="#' + t.href + '">' + t.label + '</a></li>').join('\r\n') +
    '\r\n        </ul>\r\n      </nav>';
  const postNav =
    '<nav class="post-footer-nav" aria-label="Post navigation">\r\n' +
    '        <a href="' + spec.prev.href + '" class="prev">\r\n' +
    '          <span class="nav-label">Previous</span>\r\n' +
    '          <span class="nav-title">' + escapeHtml(spec.prev.title) + '</span>\r\n        </a>\r\n' +
    '        <a href="' + spec.next.href + '" class="next">\r\n' +
    '          <span class="nav-label">Next</span>\r\n' +
    '          <span class="nav-title">' + escapeHtml(spec.next.title) + '</span>\r\n        </a>\r\n      </nav>';

  const startMarker = '      <nav class="post-toc" aria-label="Table of contents">';
  const start = h.indexOf(startMarker);
  if (start === -1) die('body start marker not found');
  const navIdx = h.indexOf('post-footer-nav', start);
  if (navIdx === -1) die('post-footer-nav not found');
  const endTag = '</nav>';
  const end = h.indexOf(endTag, navIdx);
  if (end === -1) die('post-footer-nav close not found');
  h = h.slice(0, start) + toc + '\r\n\r\n' + content + '\r\n\r\n      ' + postNav + h.slice(end + endTag.length);

  // --- related reading --------------------------------------------------
  const relatedHtml = spec.related.map(r =>
    '      <a class="related-card" href="' + r.href + '">\r\n' +
    '        <span class="related-cat">' + r.cat + '</span>\r\n' +
    '        <h3>' + escapeHtml(r.title) + '</h3>\r\n' +
    '        <p>' + escapeHtml(r.blurb) + '</p>\r\n      </a>').join('\r\n');
  const rgStart = h.indexOf('<div class="related-grid">');
  if (rgStart === -1) die('related-grid not found');
  const rgEnd = h.indexOf('\n    </div>', rgStart);
  if (rgEnd === -1) die('related-grid close not found');
  h = h.slice(0, rgStart) + '<div class="related-grid">\r\n' + relatedHtml + h.slice(rgEnd);

  // --- blog CTA ---------------------------------------------------------
  h = replaceRe(h, /<h2 class="section-title">[\s\S]*?<\/h2>/,
    '<h2 class="section-title">' + spec.ctaTitle + '</h2>', 'cta title');
  h = replaceRe(h, /<p class="section-subtitle mx-auto">[\s\S]*?<\/p>/,
    '<p class="section-subtitle mx-auto">' + spec.ctaSub + '</p>', 'cta subtitle');

  // --- normalise line endings to the template's CRLF --------------------
  const crlf = (h.match(/\r\n/g) || []).length;
  const bare = (h.match(/(?<!\r)\n/g) || []).length;
  if (bare > 0) h = h.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');

  const outFile = 'blog/' + spec.slug + '/index.html';
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, h, 'utf8');

  console.log('wrote ' + outFile);
  console.log('  toc entries: ' + tocItems.length + ' | faq: ' + spec.faq.length +
    ' | related: ' + spec.related.length + ' | eol fix: ' + bare);
}

main();
