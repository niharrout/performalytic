'use strict';
const path = require('path');
const { ROOT, read, write, getPosts } = require('./lib');

const posts = getPosts();
const bySlug = Object.fromEntries(posts.map(p => [p.slug, p]));
const report = [];

const CSS = `<style>
.res{padding:72px 0;border-top:1px solid var(--pa-wd-004)}
.res .container{max-width:1100px}
.res h2{font-size:clamp(1.6rem,3vw,2.1rem);font-weight:800;color:var(--pa-t-strong);margin-bottom:10px}
.res .res-sub{color:var(--pa-t-muted);max-width:640px;margin:0 auto 32px;font-size:1rem}
.res-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px}
.res-card{display:block;padding:22px;border:1px solid var(--pa-wd-006);border-radius:14px;background:var(--pa-wb-002);text-decoration:none;transition:border-color .2s,transform .2s}
.res-card:hover{border-color:rgba(96,165,250,.35);transform:translateY(-3px)}
.res-kicker{font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pa-at-blue);display:block;margin-bottom:8px}
.res-card h3{font-size:1rem;line-height:1.4;color:var(--pa-t);margin-bottom:8px}
.res-card p{font-size:.85rem;line-height:1.6;color:var(--pa-t-muted)}
</style>`;

const BLOCKS = {
  '/advanced-analytics-ai/': [
    ['Guide', 'enterprise-rag-architecture'],
    ['Guide', 'ai-agents-enterprise'],
    ['Guide', 'responsible-ai-framework'],
    ['Product', 'products']
  ],
  '/bi-integration/': [
    ['Guide', 'what-is-business-intelligence'],
    ['Comparison', 'databricks-vs-snowflake'],
    ['Guide', 'choose-right-analytics-platform'],
    ['Tool', 'tools/data-roi-calculator']
  ],
  '/enterprise-solution-development/': [
    ['Guide', 'what-is-master-data-management'],
    ['Guide', 'mdm-implementation-patterns'],
    ['Knowledge', 'knowledge/data-governance-quality'],
    ['Case study', 'case-studies']
  ],
  '/application-development-and-system-integration/': [
    ['Guide', 'database-ci-cd-pipeline'],
    ['Guide', 'schema-compare-guide'],
    ['Guide', 'devops-best-practices'],
    ['Case study', 'case-studies']
  ],
  '/products/': [
    ['Comparison', '4dalert-vs-legacy-mdm'],
    ['Guide', 'automated-data-reconciliation'],
    ['Guide', 'schema-compare-tools'],
    ['Case study', 'case-studies']
  ]
};

function resourceCard(kind, target) {
  if (target === 'products') return { href: '/products/', title: '4DAlert product overview', desc: 'Modules, integrations, and deployment options for the 4DAlert data platform.' };
  if (target === 'case-studies') return { href: '/case-studies/', title: 'Customer results', desc: 'Anonymized enterprise engagements with measured outcomes across finance, manufacturing, and healthcare.' };
  if (target === 'knowledge/data-governance-quality') return { href: '/knowledge/data-governance-quality/', title: 'Data governance & quality guides', desc: 'Definitions, frameworks, and implementation guides for trusted enterprise data.' };
  if (target === 'tools/data-roi-calculator') return { href: '/tools/data-roi-calculator/', title: 'Data ROI calculator', desc: 'Estimate the annual cost of poor data quality for your organization.' };
  const p = bySlug[target];
  if (!p) throw new Error('Unknown resource target: ' + target);
  return { href: `/blog/${p.slug}/`, title: p.title, desc: p.excerpt };
}

for (const [page, items] of Object.entries(BLOCKS)) {
  const file = path.join(ROOT, page.replace(/^\//, '').replace(/\/$/, ''), 'index.html');
  let html = read(file);
  if (html.includes('class="res-grid"')) { report.push('SKIP ' + page); continue; }
  const cards = items.map(([kind, t]) => {
    const c = resourceCard(kind, t);
    return `<a class="res-card" href="${c.href}"><span class="res-kicker">${kind}</span><h3>${c.title}</h3><p>${c.desc}</p></a>`;
  }).join('\n      ');
  const block = `<section class="res" aria-label="Guides and resources">
  <div class="container">
    <div class="text-center">
      <h2>Go deeper</h2>
      <p class="res-sub">Practical guides, product detail, and measured customer outcomes related to this service.</p>
    </div>
    <div class="res-grid">
      ${cards}
    </div>
  </div>
</section>

`;
  const marker = html.indexOf('<section class="cta-section"');
  if (marker === -1) { report.push('NO CTA ' + page); continue; }
  html = html.slice(0, marker) + block + html.slice(marker);
  html = html.replace('</head>', CSS + '\n</head>');
  write(file, html);
  report.push('resources -> ' + page);
}

// Homepage: make the insights cards match the real articles, and point the
// featured case study at the new case-study page.
{
  const file = path.join(ROOT, 'index.html');
  let html = read(file);
  const fixes = [
    ['hero-enterprise-rag.svg', 'Enterprise RAG Architecture', '/blog/enterprise-rag-architecture/', 'Enterprise RAG Architecture: Designing for Accuracy, Scale and Trust', 'Jul 19, 2026', '15 min read', 'AI &amp; Generative AI'],
  ];
  // Replace the three insight cards wholesale with accurate data.
  const picks = ['enterprise-rag-architecture', 'data-driven-decision-making', 'signs-data-infrastructure-holding-back'];
  const cards = picks.map(slug => {
    const p = bySlug[slug];
    return `<article class="insight-card" role="listitem">
<div class="insight-thumb">
<img src="${p.img}" alt="${p.title}" width="1200" height="600" loading="lazy" decoding="async" />
</div>
<div class="insight-body">
<span class="insight-tag">${p.catLabel}</span>
<a class="insight-title" href="/blog/${p.slug}/">${p.title}</a>
<span class="insight-meta">${p.date} &middot; ${p.readTime}</span>
<a class="insight-link" href="/blog/${p.slug}/">Read article &rarr;</a>
</div>
</article>`;
  }).join('\n');
  html = html.replace(/<div class="insights-grid" role="list">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, `<div class="insights-grid" role="list">\n${cards}\n</div>\n</div>\n</section>`);
  html = html.replace('<a href="/contact/" class="btn-primary">Read the Full Case Study &rarr;</a>',
    '<a href="/case-studies/financial-services-regulatory-reporting/" class="btn-primary">Read the Full Case Study &rarr;</a>');
  write(file, html);
  report.push('homepage insights + case-study link');
}

// Flagship guide: give it contextual inbound links from the reconciliation cluster.
{
  const flagship = `<a class="related-card" href="/blog/data-reconciliation-guide/">
        <span class="related-cat">Data Engineering</span>
        <h3>Data Reconciliation: The Complete Guide</h3>
        <p>Types, techniques, tooling, and the operating model for reconciliation across enterprise systems.</p>
      </a>`;
  for (const slug of ['automated-data-reconciliation', 'future-of-automated-data-reconciliation', 'cross-cloud-data-reconciliation']) {
    const file = path.join(ROOT, 'blog', slug, 'index.html');
    let html = read(file);
    if (html.includes('href="/blog/data-reconciliation-guide/"') || !html.includes('related-grid')) { report.push('SKIP related ' + slug); continue; }
    html = html.replace(/(<div class="related-grid">[\s\S]*?)(<\/div>)/, `$1\n      ${flagship}\n    $2`);
    write(file, html);
    report.push('related flagship -> ' + slug);
  }
}

console.log(report.join('\n'));
