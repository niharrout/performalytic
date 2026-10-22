'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, SITE, read, write, walkHtml, pageUrl, mapJsonLd } = require('./lib');

const FOUNDING_YEAR = '2018';
const report = [];

function transformNode(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach(transformNode); return; }

  if (node.foundingDate !== undefined) node.foundingDate = FOUNDING_YEAR;

  const types = [].concat(node['@type'] || []);
  // Unverifiable self-serving aggregate ratings: remove from Organization and
  // from SoftwareApplication (no visible reviews on the product page).
  if (node.aggregateRating && (types.includes('Organization') || types.includes('SoftwareApplication'))) {
    delete node.aggregateRating;
  }

  // Google requires Offer.price to be a number. "Contact for pricing" is invalid.
  if (types.includes('SoftwareApplication') && node.offers) {
    node.offers = {
      '@type': 'Offer',
      url: 'https://4dalert.com',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD'
    };
  }

  for (const v of Object.values(node)) transformNode(v);
}

function parseCards(html) {
  const cards = [];
  const re = /<article class="testimonial-card">([\s\S]*?)<\/article>/g;
  let m;
  while ((m = re.exec(html))) {
    const block = m[1];
    const q = block.match(/<blockquote>([\s\S]*?)<\/blockquote>/);
    const info = block.match(/<div class="testimonial-info">\s*<div class="name">([\s\S]*?)<\/div>\s*<div class="title">([\s\S]*?)<\/div>/);
    if (!q || !info) continue;
    const clean = s => s.replace(/<[^>]+>/g, '').replace(/&ldquo;|&rdquo;/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    cards.push({ quote: clean(q[1]), name: clean(info[1]), title: clean(info[2]) });
  }
  return cards;
}

for (const file of walkHtml()) {
  let html = read(file);
  const before = html;
  const url = SITE + pageUrl(file);

  // 1. JSON-LD entity fixes
  html = mapJsonLd(html, data => { transformNode(data); return data; });

  // 2. Testimonials: replace the invalid self-authored Review with real,
  //    individually attributed Review items that match the visible cards.
  if (pageUrl(file) === '/testimonials/') {
    const cards = parseCards(html);
    html = mapJsonLd(html, data => {
      const arr = Array.isArray(data) ? data : [data];
      const idx = arr.findIndex(o => o && o['@type'] === 'Review');
      if (idx === -1) return data;
      const reviews = cards.map(c => ({
        '@context': 'https://schema.org',
        '@type': 'Review',
        itemReviewed: { '@type': 'Service', name: 'Performalytic enterprise data and AI consulting' },
        author: { '@type': 'Person', name: c.name },
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody: c.quote
      }));
      arr.splice(idx, 1, ...reviews);
      return arr;
    });
    report.push(`testimonials: ${cards.length} attributed reviews`);
  }

  // 3. Textual founding date leftovers
  html = html.replace(/"foundingDate"\s*:\s*"2023"/g, `"foundingDate": "${FOUNDING_YEAR}"`);

  // 4. Draft pages must not claim a canonical URL that 404s.
  const p = pageUrl(file);
  if (p === '/_case-studies/' || p === '/_partners/') {
    html = html.replace(/<meta name="robots" content="[^"]*"/, '<meta name="robots" content="noindex, nofollow" />');
    html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${SITE}${p}" />`);
    html = html.replace(/<link rel="alternate" hreflang="en" href="[^"]*"/, `<link rel="alternate" hreflang="en" href="${SITE}${p}" />`);
    html = html.replace(/<link rel="alternate" hreflang="x-default" href="[^"]*"/, `<link rel="alternate" hreflang="x-default" href="${SITE}${p}" />`);
    html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${SITE}${p}" />`);
  }

  if (html !== before) { write(file, html); report.push('updated ' + p); }
}

console.log(report.join('\n'));
console.log('done');
