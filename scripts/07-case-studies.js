'use strict';
const path = require('path');
const fs = require('fs');
const { ROOT, SITE, TODAY, read, write, esc } = require('./lib');

const shell = read(path.join(ROOT, 'case-studies', 'index.html'));
const head = shell.slice(0, shell.indexOf('</head>'));
const tail = shell.slice(shell.indexOf('</main>') + '</main>'.length);

const CSS = `<style>
.cs-hero{padding:150px 0 64px;background:linear-gradient(180deg,var(--pa-bg),var(--pa-bg-2));border-bottom:1px solid var(--pa-wd-004)}
.cs-hero .container{max-width:900px}
.cs-kicker{display:inline-block;font-size:.72rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--pa-at-blue);margin-bottom:14px}
.cs-hero h1{font-size:clamp(2rem,4.2vw,3rem);line-height:1.15;font-weight:800;color:var(--pa-t-strong);margin-bottom:18px}
.cs-hero p{font-size:1.12rem;line-height:1.75;color:var(--pa-t-muted);max-width:760px}
.cs-metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px;max-width:900px;margin:40px auto 0}
.cs-metric{padding:24px;border:1px solid var(--pa-wd-006);border-radius:14px;background:var(--pa-wb-002)}
.cs-metric .n{font-size:2rem;font-weight:800;color:var(--pa-t-strong);line-height:1}
.cs-metric .l{font-size:.82rem;color:var(--pa-t-muted);margin-top:8px}
.cs-body{padding:64px 0}
.cs-body .container{max-width:820px}
.cs-body h2{font-size:1.5rem;font-weight:800;color:var(--pa-t-strong);margin:44px 0 14px}
.cs-body h2:first-child{margin-top:0}
.cs-body p{font-size:1rem;line-height:1.8;color:var(--pa-t);margin-bottom:16px}
.cs-body ul{margin:0 0 18px 20px}
.cs-body li{font-size:1rem;line-height:1.8;color:var(--pa-t);margin-bottom:8px}
.cs-note{padding:20px 24px;border-left:3px solid var(--pa-at-blue);background:var(--pa-wb-003);border-radius:0 10px 10px 0;font-size:.9rem;color:var(--pa-t-muted);margin:26px 0}
.cs-steps{display:grid;gap:14px;margin:20px 0 10px}
.cs-step{padding:18px 20px;border:1px solid var(--pa-wd-006);border-radius:12px;background:var(--pa-wb-002)}
.cs-step h3{font-size:.95rem;font-weight:700;color:var(--pa-t);margin-bottom:6px}
.cs-step p{font-size:.9rem;color:var(--pa-t-muted);margin:0;line-height:1.65}
.cs-links{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
.cs-links a{font-size:.9rem;font-weight:600;color:var(--pa-at-blue);text-decoration:none;border-bottom:1px solid rgba(96,165,250,.35)}
</style>`;

const CASES = [
  {
    slug: 'financial-services-regulatory-reporting',
    kicker: 'Financial services & compliance',
    title: 'Cutting audit preparation time by 60% for a Fortune 500 financial institution',
    intro: 'A Fortune 500 financial institution replaced spreadsheet-based regulatory reconciliation with an automated, auditable control layer across 25+ systems — reducing audit preparation time by 60% and accelerating reporting cycles by 40%.',
    metrics: [
      ['60%', 'Less time spent on audit preparation'],
      ['40%', 'Faster reporting cycles'],
      ['25+', 'Systems brought into one control layer']
    ],
    body: [
      ['The challenge',
        `<p>Regulatory reporting depended on a patchwork of extracts, spreadsheets, and manual checks spread across more than two dozen systems. Every reporting cycle required specialists to reconcile balances by hand, investigate breaks, and rebuild evidence for auditors.</p>
         <p>The process was accurate enough to pass, but it was slow, expensive, and fragile. A single late extract could delay a filing, and audit preparation consumed weeks of senior analyst time each year.</p>`],
      ['The approach',
        `<div class="cs-steps">
          <div class="cs-step"><h3>1. Map every report to its sources</h3><p>The team built a source-to-report inventory so each regulatory figure had an owner, a system of record, and a documented transformation path.</p></div>
          <div class="cs-step"><h3>2. Automate reconciliation, not just extraction</h3><p>4DAlert connectors pulled balances from core banking, general ledger, and downstream reporting systems. Reconciliation rules replaced the manual tie-outs, with exceptions routed to the right analyst.</p></div>
          <div class="cs-step"><h3>3. Make evidence continuous</h3><p>Every reconciliation run produced a timestamped audit trail, so audit preparation became a review of existing evidence rather than a reconstruction exercise.</p></div>
          <div class="cs-step"><h3>4. Add controls before go-live</h3><p>Thresholds, escalation paths, and sign-off gates were configured with the controllership team, keeping the automation inside the institution's existing risk framework.</p></div>
        </div>`],
      ['The results',
        `<p>Audit preparation time fell by 60% and reporting cycles accelerated by 40%. More importantly, the institution gained a repeatable control layer: new reports can reuse the same connectors, rules, and evidence model instead of starting from another spreadsheet.</p>
         <ul>
           <li>25+ systems reconciled through a single platform</li>
           <li>Exceptions routed to named owners with a full audit trail</li>
           <li>Audit evidence generated as part of every run</li>
         </ul>
         <div class="cs-note">The client's identity is withheld under NDA. Metrics reflect the engagement as reported by the client's finance and controls team.</div>`],
      ['What made it work',
        `<p>Three decisions mattered most: treating reconciliation as a control rather than a report, agreeing exception ownership before automation, and keeping the audit trail in the platform instead of in email. Each one reduced the amount of manual work that survived the project.</p>`]
    ],
    links: [
      ['Automated data reconciliation', '/blog/automated-data-reconciliation/'],
      ['Data reconciliation: the complete guide', '/blog/data-reconciliation-guide/'],
      ['4DAlert for financial services', '/products/']
    ]
  },
  {
    slug: 'manufacturing-data-reconciliation',
    kicker: 'Enterprise data reconciliation',
    title: '98% reconciliation accuracy across SAP, Snowflake, and 12 analytics platforms',
    intro: 'A global manufacturer was making decisions on numbers that did not agree between SAP, Snowflake, and a dozen analytics platforms. A continuous reconciliation program lifted accuracy to 98% and gave every team the same version of the truth.',
    metrics: [
      ['98%', 'Reconciliation accuracy across systems'],
      ['12', 'Analytics platforms brought into scope'],
      ['Continuous', 'Validation instead of month-end checks']
    ],
    body: [
      ['The challenge',
        `<p>Manufacturing operations generate data in many places: ERP transactions in SAP, operational metrics in Snowflake, and departmental reporting across a dozen analytics tools. Each system was internally consistent, but they disagreed with each other.</p>
         <p>Month-end reconciliation caught some discrepancies, but by then the numbers had already reached planning, pricing, and executive reporting. Teams spent meetings debating whose extract was correct rather than acting on the result.</p>`],
      ['The approach',
        `<div class="cs-steps">
          <div class="cs-step"><h3>1. Define the critical data elements</h3><p>Finance, supply chain, and commercial teams agreed which fields had to match — revenue, volume, cost, customer, and product identifiers — before any rules were written.</p></div>
          <div class="cs-step"><h3>2. Reconcile at the source-to-report boundary</h3><p>4DAlert compared SAP records with Snowflake models and each analytics platform's output, so breaks were caught where they originated rather than after aggregation.</p></div>
          <div class="cs-step"><h3>3. Route exceptions by business domain</h3><p>Discrepancies were classified and assigned to the owning team, with context on the systems and records involved. Analysts stopped triaging generic error queues.</p></div>
          <div class="cs-step"><h3>4. Monitor continuously</h3><p>Checks moved from a month-end batch to continuous validation, with thresholds tuned to the volatility of each data domain.</p></div>
        </div>`],
      ['The results',
        `<p>Reconciliation accuracy reached 98% across SAP, Snowflake, and 12 analytics platforms. The bigger change was operational: teams now start meetings with a shared number and a short list of owned exceptions, not a debate about which report is right.</p>
         <ul>
           <li>98% accuracy across all in-scope systems</li>
           <li>12 analytics platforms reconciled to a common source of truth</li>
           <li>Exception ownership defined by business domain</li>
         </ul>
         <div class="cs-note">The client's identity is withheld under NDA. Scope and accuracy figures reflect the production deployment.</div>`],
      ['What made it work',
        `<p>The program succeeded because business owners agreed on critical data elements first. Technology came second. That sequencing kept the reconciliation rules defensible and made it clear who owned each break.</p>`]
    ],
    links: [
      ['Automated data reconciliation', '/blog/automated-data-reconciliation/'],
      ['Cross-cloud reconciliation', '/blog/cross-cloud-data-reconciliation/'],
      ['4DAlert product overview', '/products/']
    ]
  },
  {
    slug: 'healthcare-dataops-automation',
    kicker: 'DataOps pipeline automation',
    title: 'Zero schema deployment errors with automated CI/CD for a healthcare data platform',
    intro: 'A healthcare company was shipping database changes through tickets, manual scripts, and late-night deployments. Automated schema CI/CD and version control removed deployment errors and made every change reviewable.',
    metrics: [
      ['Zero', 'Schema deployment errors after rollout'],
      ['Automated', 'Review, test, and deployment pipeline'],
      ['Full', 'Version history for every schema change']
    ],
    body: [
      ['The challenge',
        `<p>Clinical and operational reporting depended on a data platform that changed constantly. Schema updates moved through a ticket queue, were applied by hand, and were verified after the fact. When a change broke a downstream model, the team reconstructed what happened from emails and script folders.</p>
         <p>The risk was not only downtime. In a regulated healthcare environment, every change needs a reviewable history and a clear separation between development, test, and production.</p>`],
      ['The approach',
        `<div class="cs-steps">
          <div class="cs-step"><h3>1. Put the schema in version control</h3><p>Every database object was brought under source control, giving the team a single history and a diffable record of change.</p></div>
          <div class="cs-step"><h3>2. Compare before every release</h3><p>Schema compare ran against each environment before deployment, surfacing drift and unintended changes while they were still cheap to fix.</p></div>
          <div class="cs-step"><h3>3. Automate the pipeline</h3><p>Changes moved through review, automated checks, and staged deployment. Approval gates kept production changes controlled without slowing routine work.</p></div>
          <div class="cs-step"><h3>4. Keep an audit trail</h3><p>Every deployment recorded who changed what, when, and with which approval — useful for both engineering and compliance reviews.</p></div>
        </div>`],
      ['The results',
        `<p>Schema deployment errors dropped to zero after the pipeline went live. Releases became routine: changes are reviewed, compared, and deployed through the same path every time, with a complete history available for audit.</p>
         <ul>
           <li>Zero schema deployment errors after rollout</li>
           <li>Automated review, test, and deployment pipeline</li>
           <li>Complete version history for regulated reviews</li>
         </ul>
         <div class="cs-note">The client's identity is withheld under NDA. Results reflect the production CI/CD rollout.</div>`],
      ['What made it work',
        `<p>The team treated database changes like application code: versioned, reviewed, tested, and deployed through a pipeline. That single shift removed the manual steps where errors were introduced.</p>`]
    ],
    links: [
      ['Database CI/CD pipeline guide', '/blog/database-ci-cd-pipeline/'],
      ['Schema compare guide', '/blog/schema-compare-guide/'],
      ['Schema migration best practices', '/blog/schema-migration-best-practices/']
    ]
  }
];

function render(c) {
  const url = `${SITE}/case-studies/${c.slug}/`;
  const desc = c.intro.length > 158 ? c.intro.slice(0, 155).replace(/\s+\S*$/, '') + '…' : c.intro;
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': url + '#article',
      headline: c.title,
      description: desc,
      url,
      mainEntityOfPage: url,
      datePublished: TODAY + 'T09:00:00+00:00',
      dateModified: TODAY + 'T09:00:00+00:00',
      author: { '@type': 'Organization', name: 'Performalytic', url: SITE + '/' },
      publisher: { '@id': SITE + '/#organization' },
      about: { '@type': 'Service', name: 'Enterprise data reconciliation and DataOps consulting' }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Case Studies', item: SITE + '/case-studies/' },
        { '@type': 'ListItem', position: 3, name: c.kicker, item: url }
      ]
    }
  ];

  let pageHead = head
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(c.title.length > 58 ? c.title.slice(0, 55).replace(/\s+\S*$/, '') + '…' : c.title)} | Performalytic</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(desc)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<link rel="alternate" hreflang="en" href="[^"]*"\s*\/?>/, `<link rel="alternate" hreflang="en" href="${url}" />`)
    .replace(/<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/?>/, `<link rel="alternate" hreflang="x-default" href="${url}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(c.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(desc)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(c.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(desc)}" />`)
    .replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
  pageHead = pageHead.replace('</head>', CSS + '\n</head>');

  const main = `<main id="main-content">
<section class="cs-hero">
  <div class="container">
    <span class="cs-kicker">${esc(c.kicker)}</span>
    <h1>${esc(c.title)}</h1>
    <p>${esc(c.intro)}</p>
    <div class="cs-metrics">
      ${c.metrics.map(([n, l]) => `<div class="cs-metric"><div class="n">${esc(n)}</div><div class="l">${esc(l)}</div></div>`).join('\n      ')}
    </div>
  </div>
</section>
<section class="cs-body">
  <div class="container">
    ${c.body.map(([h, html]) => `<h2>${esc(h)}</h2>\n${html}`).join('\n')}
    <h2>Related reading</h2>
    <div class="cs-links">
      ${c.links.map(([label, href]) => `<a href="${href}">${esc(label)} &rarr;</a>`).join('\n      ')}
    </div>
  </div>
</section>
<section class="cta-section" style="padding:72px 0">
  <div class="container text-center">
    <h2 class="section-title">Discuss a similar program</h2>
    <p class="section-subtitle mx-auto">We will walk through your systems, the controls you need, and what a first production release would look like.</p>
    <div class="cta-buttons"><a href="/contact/" class="btn-hero-primary">Talk to our team &rarr;</a><a href="/case-studies/" class="btn-hero-outline">All case studies</a></div>
  </div>
</section>
</main>`;

  write(path.join(ROOT, 'case-studies', c.slug, 'index.html'), pageHead + main + tail);
  return url;
}

const urls = CASES.map(render);
fs.writeFileSync(path.join(ROOT, 'scripts', 'seo-cases.json'), JSON.stringify(CASES.map(c => ({ slug: c.slug, title: c.title, intro: c.intro, metrics: c.metrics })), null, 2));
console.log(urls.join('\n'));
