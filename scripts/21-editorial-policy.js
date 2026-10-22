'use strict';
const path = require('path');
const { ROOT, SITE, TODAY, read, write, esc } = require('./lib');

const shell = read(path.join(ROOT, 'case-studies', 'index.html'));
const head = shell.slice(0, shell.indexOf('</head>'));
const tail = shell.slice(shell.indexOf('</main>') + '</main>'.length);

const CSS = `<style>
.ep-hero{padding:150px 0 48px;background:linear-gradient(180deg,var(--pa-bg),var(--pa-bg-2));border-bottom:1px solid var(--pa-wd-004)}
.ep-hero .container{max-width:860px}
.ep-hero h1{font-size:clamp(2rem,4vw,2.8rem);font-weight:800;color:var(--pa-t-strong);margin-bottom:14px}
.ep-hero p{font-size:1.08rem;line-height:1.75;color:var(--pa-t-muted)}
.ep-body{padding:64px 0}
.ep-body .container{max-width:820px}
.ep-body h2{font-size:1.4rem;font-weight:800;color:var(--pa-t-strong);margin:40px 0 12px}
.ep-body h2:first-child{margin-top:0}
.ep-body p{font-size:1rem;line-height:1.8;color:var(--pa-t);margin-bottom:14px}
.ep-body ul{margin:0 0 16px 20px}
.ep-body li{font-size:1rem;line-height:1.8;color:var(--pa-t);margin-bottom:6px}
.ep-meta{font-size:.85rem;color:var(--pa-t-dim);margin-top:24px}
.ep-note{padding:18px 22px;border-left:3px solid var(--pa-at-blue);background:var(--pa-wb-003);border-radius:0 10px 10px 0;color:var(--pa-t-muted);font-size:.92rem;margin:20px 0}
</style>`;

const title = 'Editorial Policy | Performalytic';
const desc = 'How Performalytic researches, writes, reviews, and corrects its data analytics, AI, and MDM guides — including sourcing standards and AI use.';
const url = SITE + '/editorial-policy/';

const schema = [
  {
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
      'https://www.instagram.com/performalytic-corp',
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
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: 'info@performalytic.com', url: SITE + '/contact/' }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url,
    name: title,
    description: desc,
    datePublished: TODAY + 'T09:00:00+00:00',
    dateModified: TODAY + 'T09:00:00+00:00',
    isPartOf: { '@id': SITE + '/#website' },
    publisher: { '@id': SITE + '/#organization' }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Editorial Policy', item: url }
    ]
  }
];

let pageHead = head
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
  .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${desc}" />`)
  .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`)
  .replace(/<link rel="alternate" hreflang="en" href="[^"]*"\s*\/?>/, `<link rel="alternate" hreflang="en" href="${url}" />`)
  .replace(/<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/?>/, `<link rel="alternate" hreflang="x-default" href="${url}" />`)
  .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`)
  .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`)
  .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${desc}" />`)
  .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`)
  .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${desc}" />`)
  .replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
pageHead = pageHead.replace('</head>', CSS + '\n</head>');

const main = `<main id="main-content">
<section class="ep-hero">
  <div class="container">
    <span class="section-label">Editorial policy</span>
    <h1>How we research, write, and review our guides</h1>
    <p>Performalytic publishes practical content for data leaders and engineers. This page explains who writes it, how it is sourced, and how we handle corrections. It applies to every article in our blog and knowledge hub.</p>
  </div>
</section>
<section class="ep-body">
  <div class="container">
    <h2>Who writes our content</h2>
    <p>Every article is attributed to a named practitioner with a public author page listing their role, expertise, and published work. Our writers work on enterprise data programs — reconciliation, MDM, data quality, analytics platforms, and AI delivery — and write about what they implement.</p>
    <p>We do not publish anonymous vendor content or ghostwritten listicles under invented names. If a piece is contributed by a partner, the contribution is disclosed.</p>

    <h2>How we source claims</h2>
    <ul>
      <li><strong>Primary documentation first.</strong> Product behavior is checked against official vendor documentation — Snowflake, Databricks, Microsoft, Google Cloud, dbt, PostgreSQL, Liquibase, and others.</li>
      <li><strong>Standards and research.</strong> Where we cite industry data or frameworks, we link to the source, such as DAMA-DMBOK, ISO 8000, NIST, IBM Institute for Business Value, and the European Commission.</li>
      <li><strong>Visible citations.</strong> Each guide includes a <em>Sources &amp; further reading</em> section, and citations are also declared in the article's structured data.</li>
      <li><strong>No invented statistics.</strong> If we cannot verify a number, we describe the mechanism instead of publishing a precise-sounding figure.</li>
    </ul>
    <div class="ep-note">Client results in our case studies are reported by the client or measured in production. Client identities are withheld under NDA, and we say so on each page.</div>

    <h2>Technical review and updates</h2>
    <p>Guides are reviewed by a second practitioner before publication. We show the published date and the last-updated date on every article, and the same dates are exposed in structured data. When a platform changes materially — a deprecation, a new capability, a pricing shift — we revise the affected section rather than leaving stale guidance in place.</p>

    <h2>Corrections</h2>
    <p>If you find an error, email <a href="mailto:info@performalytic.com">info@performalytic.com</a> with the URL and the correction. We review technical corrections promptly, update the article, and change the modified date. Material corrections are described in the article rather than silently removed.</p>

    <h2>Use of AI</h2>
    <p>Our writers use AI tools for drafting, editing, and research assistance. A named human author is accountable for every published claim, and citations are checked against the original source. We do not publish AI-generated quotations, client stories, or statistics.</p>

    <h2>Independence</h2>
    <p>We publish content about our own platform, 4DAlert, and we say so when we do. Comparisons with legacy MDM, dbt tests, Great Expectations, and in-house builds are written to help a reader choose the right approach, including when that approach is not ours. We do not accept payment for product rankings.</p>

    <p class="ep-meta">Last updated: October 22, 2026 &middot; Questions: <a href="/contact/">contact our team</a> &middot; Meet the <a href="/authors/">authors</a>.</p>
  </div>
</section>
</main>`;

write(path.join(ROOT, 'editorial-policy', 'index.html'), pageHead + main + tail);
console.log('built', url);
