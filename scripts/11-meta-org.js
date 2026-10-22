'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, SITE, read, write, mapJsonLd } = require('./lib');

const report = [];

// ---------- 1. Titles and descriptions ----------
const META = {
  'blog/index.html': {
    title: 'Performalytic Blog | Data, Analytics & AI Insights',
    desc: "Practical guides on data reconciliation, master data management, data quality, AI, and analytics from Performalytic's data practitioners."
  },
  'case-studies/financial-services-regulatory-reporting/index.html': {
    title: 'Financial Services Case Study | Performalytic',
    desc: 'How a Fortune 500 financial institution cut audit preparation time by 60% with automated regulatory reconciliation across 25+ systems.'
  },
  'case-studies/manufacturing-data-reconciliation/index.html': {
    title: 'Manufacturing Data Reconciliation Case Study',
    desc: 'How a global manufacturer reached 98% reconciliation accuracy across SAP, Snowflake, and 12 analytics platforms with continuous validation.'
  },
  'case-studies/healthcare-dataops-automation/index.html': {
    title: 'Healthcare DataOps Automation Case Study',
    desc: 'How a healthcare company reduced schema deployment errors to zero with automated CI/CD, schema compare, and version control.'
  },
  'compare/index.html': {
    title: '4DAlert vs Legacy MDM, dbt & In-House Builds',
    desc: 'An honest comparison of 4DAlert with legacy MDM suites, dbt tests, Great Expectations, and building data reconciliation in-house.'
  },
  '_case-studies/index.html': {
    title: 'Case Studies | Performalytic',
    desc: "Explore Performalytic's enterprise data and AI case studies: regulatory reporting, data reconciliation, and DataOps automation with measured outcomes."
  },
  '_partners/index.html': {
    title: 'Technology Partners | Performalytic',
    desc: "Performalytic's technology partnerships with Microsoft, SAP, Databricks, Snowflake, AWS, and Google Cloud. Certified expertise across leading data platforms."
  }
};

for (const [rel, meta] of Object.entries(META)) {
  const file = path.join(ROOT, rel);
  let html = read(file);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${meta.desc}" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${meta.title}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${meta.desc}" />`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${meta.title}" />`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${meta.desc}" />`);
  write(file, html);
  report.push('meta: ' + rel);
}

// ---------- 2. Organization node on new standalone pages ----------
const ORG = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': SITE + '/#organization',
  name: 'Performalytic',
  url: SITE + '/',
  logo: '/assets/images/performalytic-logo.png',
  foundingDate: '2018',
  sameAs: [
    'https://www.linkedin.com/company/performalytic-corp/',
    'https://twitter.com/performalytic-corp',
    'https://www.facebook.com/performalytic-corp',
    'https://www.instagram.com/performalytic-corp/',
    'https://www.youtube.com/@performalytic-corp'
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '111 W. Jackson Blvd, Suite 1700',
    addressLocality: 'Chicago',
    addressRegion: 'IL',
    postalCode: '60604',
    addressCountry: 'US'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'info@performalytic.com',
    url: SITE + '/contact/'
  }
};

const NEW_PAGES = [
  'authors/index.html', 'authors/james-carter/index.html', 'authors/sarah-mitchell/index.html',
  'authors/david-kim/index.html', 'authors/priya-nair/index.html', 'authors/emma-wilson/index.html',
  'case-studies/financial-services-regulatory-reporting/index.html',
  'case-studies/manufacturing-data-reconciliation/index.html',
  'case-studies/healthcare-dataops-automation/index.html',
  'chicago/index.html', 'compare/index.html'
];

for (const rel of NEW_PAGES) {
  const file = path.join(ROOT, rel);
  let html = read(file);
  html = mapJsonLd(html, data => {
    const arr = Array.isArray(data) ? data : [data];
    if (arr.some(o => o && (o['@type'] === 'Organization' || o['@type'] === 'ProfessionalService'))) return data;
    return [ORG, ...arr];
  });
  write(file, html);
  report.push('org: ' + rel);
}

// ---------- 3. Products page: add the comparison page ----------
{
  const file = path.join(ROOT, 'products', 'index.html');
  let html = read(file);
  if (!html.includes('href="/compare/"')) {
    html = html.replace(/(<div class="res-grid">[\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/,
      `$1\n      <a class="res-card" href="/compare/"><span class="res-kicker">Comparison</span><h3>4DAlert vs legacy MDM, dbt, and in-house builds</h3><p>An honest look at where a unified platform fits and where open-source tests or custom builds are the better call.</p></a>\n    $2`);
    write(file, html);
    report.push('products: compare card');
  }
}

// ---------- 4. Human sitemap: add new sections ----------
{
  const file = path.join(ROOT, 'sitemap.html');
  let html = read(file);
  if (!html.includes('href="/chicago/"')) {
    html = html.replace('<li><a href="/industries/">Industries<span class="url-path">/industries/</span></a></li>',
      '<li><a href="/industries/">Industries<span class="url-path">/industries/</span></a></li>\n          <li><a href="/chicago/">Chicago Data Consulting<span class="url-path">/chicago/</span></a></li>\n          <li><a href="/compare/">Compare 4DAlert<span class="url-path">/compare/</span></a></li>\n          <li><a href="/authors/">Authors<span class="url-path">/authors/</span></a></li>');
  }
  if (!html.includes('href="/case-studies/financial-services-regulatory-reporting/"')) {
    html = html.replace('<li><a href="/tools/data-roi-calculator/">Data ROI Calculator<span class="url-path">/tools/data-roi-calculator/</span></a></li>',
      `<li><a href="/tools/data-roi-calculator/">Data ROI Calculator<span class="url-path">/tools/data-roi-calculator/</span></a></li>
          <li><a href="/case-studies/">Customer Case Studies<span class="url-path">/case-studies/</span></a></li>
          <li><a href="/case-studies/financial-services-regulatory-reporting/">Financial Services Case Study<span class="url-path">/case-studies/financial-services-regulatory-reporting/</span></a></li>
          <li><a href="/case-studies/manufacturing-data-reconciliation/">Manufacturing Reconciliation Case Study<span class="url-path">/case-studies/manufacturing-data-reconciliation/</span></a></li>
          <li><a href="/case-studies/healthcare-dataops-automation/">Healthcare DataOps Case Study<span class="url-path">/case-studies/healthcare-dataops-automation/</span></a></li>`);
  }
  write(file, html);
  report.push('sitemap.html updated');
}

// ---------- 5. Homepage: RSS discovery + explicit locale ----------
{
  const file = path.join(ROOT, 'index.html');
  let html = read(file);
  if (!html.includes('application/rss+xml')) {
    html = html.replace('</head>', '<link rel="alternate" type="application/rss+xml" title="Performalytic Blog" href="/feed.xml" />\n</head>');
  }
  write(file, html);
  report.push('homepage rss link');
}

console.log(report.join('\n'));
