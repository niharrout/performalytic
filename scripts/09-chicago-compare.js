'use strict';
const path = require('path');
const { ROOT, SITE, TODAY, read, write, esc } = require('./lib');

const shell = read(path.join(ROOT, 'case-studies', 'index.html'));
const head = shell.slice(0, shell.indexOf('</head>'));
const tail = shell.slice(shell.indexOf('</main>') + '</main>'.length);

const CSS = `<style>
.lp-hero{padding:150px 0 56px;background:linear-gradient(180deg,var(--pa-bg),var(--pa-bg-2));border-bottom:1px solid var(--pa-wd-004)}
.lp-hero .container{max-width:900px}
.lp-kicker{display:inline-block;font-size:.72rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--pa-at-blue);margin-bottom:14px}
.lp-hero h1{font-size:clamp(2rem,4.2vw,3rem);line-height:1.15;font-weight:800;color:var(--pa-t-strong);margin-bottom:18px}
.lp-hero p{font-size:1.12rem;line-height:1.75;color:var(--pa-t-muted)}
.lp-body{padding:64px 0}
.lp-body .container{max-width:880px}
.lp-body h2{font-size:1.5rem;font-weight:800;color:var(--pa-t-strong);margin:44px 0 14px}
.lp-body h2:first-child{margin-top:0}
.lp-body h3{font-size:1.15rem;font-weight:700;color:var(--pa-t);margin:28px 0 10px}
.lp-body p{font-size:1rem;line-height:1.8;color:var(--pa-t);margin-bottom:16px}
.lp-body ul,.lp-body ol{margin:0 0 18px 20px}
.lp-body li{font-size:1rem;line-height:1.8;color:var(--pa-t);margin-bottom:8px}
.lp-table{width:100%;border-collapse:collapse;margin:20px 0 26px;font-size:.9rem}
.lp-table th,.lp-table td{padding:12px 14px;border:1px solid var(--pa-wd-008);text-align:left;vertical-align:top}
.lp-table th{background:var(--pa-wb-004);color:var(--pa-t-strong);font-weight:700}
.lp-table td{color:var(--pa-t-muted)}
.lp-faq{border-top:1px solid var(--pa-wd-006);margin-top:44px;padding-top:8px}
.lp-faq details{border-bottom:1px solid var(--pa-wd-006);padding:16px 0}
.lp-faq summary{cursor:pointer;font-weight:600;color:var(--pa-t-strong);font-size:1rem}
.lp-faq p{margin:12px 0 0;color:var(--pa-t-muted);font-size:.95rem}
.lp-note{padding:20px 24px;border-left:3px solid var(--pa-at-blue);background:var(--pa-wb-003);border-radius:0 10px 10px 0;font-size:.9rem;color:var(--pa-t-muted);margin:24px 0}
.lp-links{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
.lp-links a{font-size:.9rem;font-weight:600;color:var(--pa-at-blue);text-decoration:none;border-bottom:1px solid rgba(96,165,250,.35)}
</style>`;

function build({ dir, url, title, desc, kicker, h1, intro, body, schema, ctaTitle, ctaText, ctaLinks }) {
  const headOut = head
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(desc)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<link rel="alternate" hreflang="en" href="[^"]*"\s*\/?>/, `<link rel="alternate" hreflang="en" href="${url}" />`)
    .replace(/<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/?>/, `<link rel="alternate" hreflang="x-default" href="${url}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(desc)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(desc)}" />`)
    .replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .replace('</head>', CSS + '\n</head>');

  const main = `<main id="main-content">
<section class="lp-hero">
  <div class="container">
    <span class="lp-kicker">${kicker}</span>
    <h1>${h1}</h1>
    <p>${intro}</p>
  </div>
</section>
<section class="lp-body">
  <div class="container">
    ${body}
  </div>
</section>
<section class="cta-section" style="padding:72px 0">
  <div class="container text-center">
    <h2 class="section-title">${ctaTitle}</h2>
    <p class="section-subtitle mx-auto">${ctaText}</p>
    <div class="cta-buttons">${ctaLinks}</div>
  </div>
</section>
</main>`;

  write(path.join(ROOT, dir, 'index.html'), headOut + main + tail);
  console.log('built', url);
}

// ---------------- Chicago landing page ----------------
build({
  dir: 'chicago',
  url: SITE + '/chicago/',
  title: 'Data Analytics & AI Consulting in Chicago | Performalytic',
  desc: 'Performalytic is a Chicago-based enterprise data analytics, AI, and MDM consulting firm. Meet the team at 111 W. Jackson Blvd and see how we deliver.',
  kicker: 'Chicago, Illinois',
  h1: 'Enterprise data analytics and AI consulting in Chicago',
  intro: 'Performalytic is headquartered in the Chicago Loop. Our consultants help Chicago-area enterprises modernize data platforms, govern master data, and put AI into production — with delivery teams in the US and India.',
  body: `
<h2>Chicago-based, enterprise-scale</h2>
<p>Our headquarters at 111 W. Jackson Blvd puts our consultants close to the financial services, manufacturing, healthcare, and logistics companies that call Chicago home. We work on-site with client teams in the Loop and across the region, backed by a global delivery center in Bhubaneswar, India.</p>
<p>That combination matters for data programs. Architecture and stakeholder work benefit from being in the room. Engineering, testing, and monitoring benefit from follow-the-sun capacity. We staff both.</p>

<h2>What we do for Chicago enterprises</h2>
<h3>Data strategy and architecture</h3>
<p>Assessments, target-state architecture, platform selection, and roadmaps that connect data investment to a business outcome. We work with Snowflake, Databricks, Microsoft Fabric, SAP, and the analytics stack your teams already run.</p>
<h3>Master data management and governance</h3>
<p>Entity resolution, golden records, match-and-merge, survivorship, and the operating model that keeps master data clean after go-live. Our MDM work is built on 4DAlert, our AI-powered data management platform.</p>
<h3>Data reconciliation and quality</h3>
<p>Automated reconciliation across ERP, warehouse, and analytics systems, with exception routing and audit-ready evidence. Teams use it to close the books faster and to stop reporting from disagreeing across departments.</p>
<h3>AI and analytics in production</h3>
<p>RAG systems, AI agents, and predictive models grounded in governed enterprise data — with evaluation, access control, and monitoring designed in from the start.</p>

<h2>Industries we serve in Chicago</h2>
<ul>
  <li><strong>Financial services and insurance</strong> — regulatory reporting, reconciliation, and risk data controls</li>
  <li><strong>Manufacturing and logistics</strong> — supply chain data, ERP reconciliation, and operational analytics</li>
  <li><strong>Healthcare and life sciences</strong> — clinical and operational reporting with governed, auditable pipelines</li>
  <li><strong>Professional services</strong> — client reporting, utilization analytics, and data platform modernization</li>
</ul>

<h2>Why teams choose a local partner</h2>
<p>Enterprise data programs fail for organizational reasons as often as technical ones. A local team can sit with finance during close, walk a factory floor, or join a steering committee in person. It shortens the feedback loop between the people who own the data and the people who build the pipeline.</p>
<p>We pair that proximity with a delivery model that keeps engineering moving across time zones, so a decision made in Chicago on Tuesday is tested and ready for review on Wednesday.</p>

<h2>Working with us</h2>
<div class="lp-note">Most engagements start with a short discovery: your systems, the decisions the data should support, and the gaps in between. You leave with a scoped plan, not a generic pitch deck.</div>
<p>We work with enterprise teams and with mid-market companies that have outgrown spreadsheet-based operations. Engagements range from a focused reconciliation deployment to multi-year platform modernization.</p>

<div class="lp-faq">
<h2>Chicago data consulting — frequently asked questions</h2>
<details><summary>Where is Performalytic located in Chicago?</summary><p>Our headquarters is at 111 W. Jackson Blvd, Suite 1700, Chicago, IL 60604, in the Chicago Loop. We also have a global delivery center in Bhubaneswar, India.</p></details>
<details><summary>Do you work on-site with Chicago clients?</summary><p>Yes. Architecture, discovery, and stakeholder workshops are typically delivered on-site or hybrid. Engineering and monitoring can be delivered remotely or embedded with your team.</p></details>
<details><summary>What size of company do you work with?</summary><p>We work with enterprise organizations and with mid-market companies that have complex data landscapes — typically multiple source systems, a warehouse or lakehouse, and a reporting layer that needs to be trusted.</p></details>
<details><summary>How quickly can a project start?</summary><p>Discovery can usually begin within two weeks. A first production release for a focused reconciliation or CI/CD deployment typically takes weeks, not quarters, depending on system access and review requirements.</p></details>
</div>

<div class="lp-links">
  <a href="/case-studies/">Customer results &rarr;</a>
  <a href="/products/">4DAlert platform &rarr;</a>
  <a href="/contact/">Contact the Chicago team &rarr;</a>
</div>`,
  schema: [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': SITE + '/chicago/#business',
      name: 'Performalytic — Chicago',
      url: SITE + '/chicago/',
      description: 'Enterprise data analytics, AI, MDM, and data reconciliation consulting in Chicago, Illinois.',
      parentOrganization: { '@id': SITE + '/#organization' },
      address: {
        '@type': 'PostalAddress',
        streetAddress: '111 W. Jackson Blvd, Suite 1700',
        addressLocality: 'Chicago',
        addressRegion: 'IL',
        postalCode: '60604',
        addressCountry: 'US'
      },
      areaServed: [
        { '@type': 'City', name: 'Chicago' },
        { '@type': 'AdministrativeArea', name: 'Illinois' }
      ],
      knowsAbout: ['data analytics', 'business intelligence', 'master data management', 'data reconciliation', 'AI consulting', 'data governance'],
      hasMap: 'https://maps.app.goo.gl/ggkNfK7nmKQZngAB9'
    },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Chicago', item: SITE + '/chicago/' }
    ] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
      ['Where is Performalytic located in Chicago?', 'Our headquarters is at 111 W. Jackson Blvd, Suite 1700, Chicago, IL 60604, in the Chicago Loop. We also have a global delivery center in Bhubaneswar, India.'],
      ['Do you work on-site with Chicago clients?', 'Yes. Architecture, discovery, and stakeholder workshops are typically delivered on-site or hybrid. Engineering and monitoring can be delivered remotely or embedded with your team.'],
      ['What size of company do you work with?', 'We work with enterprise organizations and with mid-market companies that have complex data landscapes, typically multiple source systems, a warehouse or lakehouse, and a reporting layer that needs to be trusted.'],
      ['How quickly can a project start?', 'Discovery can usually begin within two weeks. A first production release for a focused reconciliation or CI/CD deployment typically takes weeks, not quarters, depending on system access and review requirements.']
    ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  ],
  ctaTitle: 'Meet the Chicago team',
  ctaText: 'Tell us what you are trying to fix. We will tell you what a first release looks like.',
  ctaLinks: '<a href="/contact/" class="btn-hero-primary">Start a conversation &rarr;</a><a href="/case-studies/" class="btn-hero-outline">See customer results</a>'
});

// ---------------- Comparison hub ----------------
build({
  dir: 'compare',
  url: SITE + '/compare/',
  title: '4DAlert vs Legacy MDM, dbt Tests, and In-House Builds | Performalytic',
  desc: 'An honest comparison of 4DAlert with legacy MDM suites, dbt tests, Great Expectations, and building data reconciliation in-house.',
  kicker: 'Comparison guide',
  h1: 'How 4DAlert compares to legacy MDM, dbt tests, and building in-house',
  intro: 'Most data teams evaluating 4DAlert are choosing between four options: a legacy MDM suite, open-source testing libraries, a custom build, or a unified platform. Here is how each option differs, and when each one is the right call.',
  body: `
<h2>The short answer</h2>
<ul>
  <li><strong>Legacy MDM suites</strong> are strong for deep, multi-domain governance at very large scale, but implementations are long and stewardship-heavy.</li>
  <li><strong>dbt tests and Great Expectations</strong> are excellent for transformation-level validation. They are not designed for cross-system reconciliation or entity resolution.</li>
  <li><strong>Building in-house</strong> gives you control, but teams typically spend 6–12 months to cover one use case — and own the maintenance forever.</li>
  <li><strong>4DAlert</strong> is a unified platform for reconciliation, quality, MDM, and schema CI/CD, with 100+ pre-built connectors. It is the fastest path when you need more than one of those capabilities.</li>
</ul>

<h2>4DAlert vs legacy MDM suites</h2>
<table class="lp-table">
  <thead><tr><th>Dimension</th><th>Legacy MDM suite</th><th>4DAlert</th></tr></thead>
  <tbody>
    <tr><td>Typical implementation</td><td>Months to years; heavy configuration and stewardship design</td><td>Weeks to first production release, then expand by domain</td></tr>
    <tr><td>Matching</td><td>Rules-first, with add-on matching modules</td><td>Deterministic, probabilistic, and ML-assisted matching with a confidence score per decision</td></tr>
    <tr><td>Reconciliation</td><td>Usually a separate product or custom work</td><td>Built in across source systems and analytics platforms</td></tr>
    <tr><td>Schema change management</td><td>Not typically in scope</td><td>Built-in schema compare and CI/CD for data</td></tr>
    <tr><td>Best fit</td><td>Large, multi-domain programs with dedicated stewardship teams</td><td>Teams that need trusted data in production quickly and want one platform</td></tr>
  </tbody>
</table>
<p><a href="/blog/4dalert-vs-legacy-mdm/">Read the full feature-level comparison &rarr;</a></p>

<h2>4DAlert vs dbt tests and Great Expectations</h2>
<p>dbt tests and Great Expectations are testing frameworks. They validate data inside a transformation or a Python pipeline. That is valuable — and 4DAlert is not a replacement for the tests your engineers already write.</p>
<table class="lp-table">
  <thead><tr><th>Capability</th><th>dbt tests</th><th>Great Expectations</th><th>4DAlert</th></tr></thead>
  <tbody>
    <tr><td>Primary role</td><td>Tests inside dbt models</td><td>Python data validation library</td><td>Cross-system reconciliation, quality, MDM, and CI/CD platform</td></tr>
    <tr><td>Cross-system reconciliation</td><td>Limited; requires custom models</td><td>Possible with engineering effort</td><td>Built in, with connectors to 100+ sources</td></tr>
    <tr><td>Entity resolution / golden records</td><td>No</td><td>No</td><td>Yes — match, merge, survivorship, confidence scoring</td></tr>
    <tr><td>Operational UI and exception routing</td><td>No</td><td>Limited</td><td>Yes — exceptions routed to owners with context</td></tr>
    <tr><td>Maintenance</td><td>Owned by your data team</td><td>Owned by your engineering team</td><td>Vendor-maintained, with your rules on top</td></tr>
  </tbody>
</table>
<div class="lp-note">The practical pattern: keep dbt tests for transformation correctness, and add 4DAlert where you need agreement <em>between</em> systems, entity resolution, and an operational workflow for breaks.</div>

<h2>4DAlert vs building in-house</h2>
<p>A custom build is attractive when requirements are unusual or when engineering capacity is already available. It is expensive when the requirements are common.</p>
<table class="lp-table">
  <thead><tr><th>Consideration</th><th>Build in-house</th><th>4DAlert</th></tr></thead>
  <tbody>
    <tr><td>Time to first result</td><td>6–12 months for a partial solution</td><td>Weeks for a scoped production release</td></tr>
    <tr><td>Connectors</td><td>Built and maintained by your team</td><td>100+ pre-built connectors</td></tr>
    <tr><td>Ongoing ownership</td><td>Engineering, on-call, upgrades, edge cases</td><td>Vendor-maintained platform</td></tr>
    <tr><td>Differentiation</td><td>High, if the logic is genuinely unique</td><td>Focus your engineers on models and business logic instead</td></tr>
    <tr><td>Best fit</td><td>Highly specialized, single-use-case pipelines</td><td>Common enterprise needs across multiple systems and domains</td></tr>
  </tbody>
</table>

<h2>Which option should you choose?</h2>
<ol>
  <li><strong>Choose a legacy MDM suite</strong> if you are running a multi-year, multi-domain governance program with a large stewardship organization and deep customization requirements.</li>
  <li><strong>Choose dbt tests or Great Expectations</strong> if your only requirement is validating transformations inside one warehouse and your engineers want full code control.</li>
  <li><strong>Choose an in-house build</strong> if your reconciliation logic is truly unique and you have spare engineering capacity to own it indefinitely.</li>
  <li><strong>Choose 4DAlert</strong> if you need cross-system reconciliation, data quality, MDM, and schema CI/CD without assembling and maintaining four separate tools.</li>
</ol>

<div class="lp-faq">
<h2>Comparison — frequently asked questions</h2>
<details><summary>Is 4DAlert a replacement for our data warehouse?</summary><p>No. 4DAlert sits on top of your existing stack — Snowflake, BigQuery, Redshift, Databricks, SAP, Oracle, and other systems. It reconciles and governs data across them; it does not store your analytical data.</p></details>
<details><summary>Does 4DAlert replace dbt?</summary><p>No. dbt transforms data; 4DAlert validates agreement across systems and manages quality, MDM, and schema change. Most teams run both.</p></details>
<details><summary>How long does implementation take?</summary><p>A focused first release — for example, reconciliation between two critical systems — typically takes weeks. Expanding to more domains and systems is incremental.</p></details>
<details><summary>Can we start with one module?</summary><p>Yes. Most customers start with reconciliation or data quality and add MDM, schema CI/CD, or the Ask4D assistant as the platform proves itself.</p></details>
</div>

<div class="lp-links">
  <a href="/products/">4DAlert product overview &rarr;</a>
  <a href="/blog/4dalert-vs-legacy-mdm/">Feature-level MDM comparison &rarr;</a>
  <a href="/case-studies/">Customer results &rarr;</a>
</div>`,
  schema: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': SITE + '/compare/#article',
      headline: 'How 4DAlert compares to legacy MDM, dbt tests, and building in-house',
      description: 'An honest comparison of 4DAlert with legacy MDM suites, dbt tests, Great Expectations, and building data reconciliation in-house.',
      url: SITE + '/compare/',
      mainEntityOfPage: SITE + '/compare/',
      datePublished: TODAY + 'T09:00:00+00:00',
      dateModified: TODAY + 'T09:00:00+00:00',
      author: { '@type': 'Organization', name: 'Performalytic', url: SITE + '/' },
      publisher: { '@id': SITE + '/#organization' }
    },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: SITE + '/compare/' }
    ] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
      ['Is 4DAlert a replacement for our data warehouse?', 'No. 4DAlert sits on top of your existing stack — Snowflake, BigQuery, Redshift, Databricks, SAP, Oracle, and other systems. It reconciles and governs data across them; it does not store your analytical data.'],
      ['Does 4DAlert replace dbt?', 'No. dbt transforms data; 4DAlert validates agreement across systems and manages quality, MDM, and schema change. Most teams run both.'],
      ['How long does implementation take?', 'A focused first release, for example reconciliation between two critical systems, typically takes weeks. Expanding to more domains and systems is incremental.'],
      ['Can we start with one module?', 'Yes. Most customers start with reconciliation or data quality and add MDM, schema CI/CD, or the Ask4D assistant as the platform proves itself.']
    ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  ],
  ctaTitle: 'See the comparison on your own stack',
  ctaText: 'A 30-minute walkthrough with your systems in mind is more useful than a feature grid.',
  ctaLinks: '<a href="/contact/" class="btn-hero-primary">Schedule a walkthrough &rarr;</a><a href="/products/" class="btn-hero-outline">Explore 4DAlert</a>'
});
