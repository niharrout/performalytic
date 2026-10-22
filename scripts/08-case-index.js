'use strict';
const path = require('path');
const { ROOT, SITE, TODAY, read, write, mapJsonLd } = require('./lib');

const file = path.join(ROOT, 'case-studies', 'index.html');
let html = read(file);

const cards = [
  {
    href: '/case-studies/financial-services-regulatory-reporting/',
    icon: '&#128188;',
    h: 'Financial Services &amp; Compliance',
    p: 'How a Fortune 500 financial institution automated regulatory reconciliation and cut audit preparation time by 60% across 25+ systems.',
    tag: '60% faster audit prep'
  },
  {
    href: '/case-studies/manufacturing-data-reconciliation/',
    icon: '&#128200;',
    h: 'Enterprise Data Reconciliation',
    p: 'How a global manufacturer reached 98% reconciliation accuracy across SAP, Snowflake, and 12 analytics platforms.',
    tag: '98% accuracy'
  },
  {
    href: '/case-studies/healthcare-dataops-automation/',
    icon: '&#9881;',
    h: 'DataOps Pipeline Automation',
    p: 'How a healthcare company reduced schema deployment errors to zero with automated CI/CD and version control.',
    tag: 'Zero deployment errors'
  }
];

const grid = cards.map(c => `<a class="coming-soon-card" href="${c.href}" style="text-decoration:none">
        <div class="coming-soon-icon">${c.icon}</div>
        <h3>${c.h}</h3>
        <p>${c.p}</p>
        <span class="coming-soon-badge" style="background:rgba(37,99,235,.12);color:var(--pa-at-blue);border-color:rgba(37,99,235,.25)">${c.tag} &middot; Read case study &rarr;</span>
      </a>`).join('\n      ');

html = html.replace(/<div class="coming-soon-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, `<div class="coming-soon-grid">\n      ${grid}\n    </div>\n  </div>\n</section>`);

html = html.replace(/<p class="section-subtitle mx-auto">Explore how Performalytic and 4DAlert deliver measurable outcomes for enterprises across industries\. Case studies coming soon\.<\/p>/,
  '<p class="section-subtitle mx-auto">Explore how Performalytic and 4DAlert deliver measurable outcomes for enterprises across industries. Client names are withheld under NDA; scope and metrics reflect production deployments.</p>');

html = html.replace(/<span class="section-label">Case Studies<\/span>\s*<h1 class="section-title">Real results\. Real impact\.<\/h1>/,
  '<span class="section-label">Case Studies</span>\n      <h1 class="section-title">Customer results, measured in production</h1>');

// Replace the duplicated CTA buttons.
html = html.replace(/<a href="\/contact\/" class="btn-hero-primary">Contact Sales &rarr;<\/a>\s*<a href="\/contact\/" class="btn-hero-outline">Contact Sales<\/a>/,
  '<a href="/contact/" class="btn-hero-primary">Talk to our team &rarr;</a>\n        <a href="/products/" class="btn-hero-outline">Explore 4DAlert</a>');

// ItemList of case studies for extraction.
html = mapJsonLd(html, data => {
  const arr = Array.isArray(data) ? data : [data];
  arr.push({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Performalytic customer case studies',
    itemListElement: cards.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: SITE + c.href,
      name: c.h.replace(/&amp;/g, '&')
    }))
  });
  return arr;
});

write(file, html);
console.log('case-studies index updated');
