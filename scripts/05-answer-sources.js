'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, SITE, TODAY, getPosts, read, write, mapJsonLd } = require('./lib');

const SOURCES = {
  reconciliation: [
    ['IBM Institute for Business Value — The business value of data quality', 'https://www.ibm.com/thought-leadership/institute-business-value/en-us/report/data-quality'],
    ['DAMA — Data Management Body of Knowledge (DMBOK)', 'https://dama.org/learning-resources/dama-data-management-body-of-knowledge-dmbok/'],
    ['Great Expectations — data validation documentation', 'https://docs.greatexpectations.io/docs/home/']
  ],
  mdm: [
    ['DAMA — Data Management Body of Knowledge (DMBOK)', 'https://dama.org/learning-resources/dama-data-management-body-of-knowledge-dmbok/'],
    ['ISO 8000 — Data quality standards', 'https://www.iso.org/standard/81745.html'],
    ['Gartner — Master data management research', 'https://www.gartner.com/en/data-analytics/topics/master-data-management']
  ],
  dq: [
    ['IBM Institute for Business Value — The business value of data quality', 'https://www.ibm.com/thought-leadership/institute-business-value/en-us/report/data-quality'],
    ['DAMA — Data Management Body of Knowledge (DMBOK)', 'https://dama.org/learning-resources/dama-data-management-body-of-knowledge-dmbok/'],
    ['Great Expectations — data validation documentation', 'https://docs.greatexpectations.io/docs/home/']
  ],
  ai: [
    ['NIST — AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework'],
    ['European Commission — EU AI Act regulatory framework', 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai'],
    ['Microsoft — Retrieval-augmented generation with your data', 'https://learn.microsoft.com/en-us/azure/foundry-classic/openai/concepts/use-your-data']
  ],
  schema: [
    ['PostgreSQL — official documentation', 'https://www.postgresql.org/docs/'],
    ['Liquibase — database change management documentation', 'https://docs.liquibase.com/'],
    ['Redgate Flyway — database migration documentation', 'https://documentation.red-gate.com/flyway']
  ],
  bi: [
    ['Microsoft Learn — Microsoft Fabric documentation', 'https://learn.microsoft.com/en-us/fabric/'],
    ['dbt Labs — dbt documentation', 'https://docs.getdbt.com/'],
    ['Harvard Business Review — Analytics and data science', 'https://hbr.org/topic/subject/analytics-and-data-science']
  ],
  cloud: [
    ['Snowflake — official documentation', 'https://docs.snowflake.com/en/'],
    ['Databricks — official documentation', 'https://docs.databricks.com/'],
    ['Google Cloud — BigQuery documentation', 'https://cloud.google.com/bigquery/docs']
  ],
  culture: [
    ['McKinsey Digital — data and analytics insights', 'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights'],
    ['Harvard Business Review — Analytics and data science', 'https://hbr.org/topic/subject/analytics-and-data-science'],
    ['DAMA — Data Management Body of Knowledge (DMBOK)', 'https://dama.org/learning-resources/dama-data-management-body-of-knowledge-dmbok/']
  ]
};

const TOPIC = {
  'data-reconciliation-guide': 'reconciliation',
  'automated-data-reconciliation': 'reconciliation',
  'future-of-automated-data-reconciliation': 'reconciliation',
  'cross-cloud-data-reconciliation': 'cloud',
  '4dalert-vs-legacy-mdm': 'mdm',
  'ai-master-data-management': 'mdm',
  'entity-resolution-ai': 'mdm',
  'mdm-ai-era': 'mdm',
  'mdm-implementation-patterns': 'mdm',
  'what-is-master-data-management': 'mdm',
  'data-quality-framework': 'dq',
  'ai-changing-data-quality': 'dq',
  'real-cost-of-bad-data': 'dq',
  'data-modeling-crisis': 'dq',
  'enterprise-rag-architecture': 'ai',
  'ai-agents-enterprise': 'ai',
  'responsible-ai-framework': 'ai',
  'ai-business-intelligence': 'ai',
  'schema-compare-guide': 'schema',
  'schema-compare-tools': 'schema',
  'schema-drift': 'schema',
  'schema-migration-best-practices': 'schema',
  'database-change-management': 'schema',
  'database-ci-cd-pipeline': 'schema',
  'devops-best-practices': 'schema',
  'agentic-ai-database-devops': 'schema',
  'what-is-business-intelligence': 'bi',
  'choose-right-analytics-platform': 'bi',
  'databricks-vs-snowflake': 'bi',
  'build-data-driven-culture': 'culture',
  'data-driven-decision-making': 'culture',
  'signs-data-infrastructure-holding-back': 'culture'
};

const CSS = `<style>
.quick-answer{max-width:820px;margin:0 auto 36px;padding:22px 26px;border:1px solid rgba(37,99,235,.28);border-left:4px solid #2563eb;border-radius:12px;background:var(--pa-wb-003)}
.quick-answer h2{font-size:.72rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--pa-at-blue);margin-bottom:8px}
.quick-answer p{font-size:1rem;line-height:1.7;color:var(--pa-t);margin:0}
.quick-answer .qa-meta{display:block;margin-top:10px;font-size:.75rem;color:var(--pa-t-dim)}
.post-sources{padding:56px 0 24px;border-top:1px solid var(--pa-wd-004);margin-top:48px}
.post-sources .container{max-width:820px}
.post-sources h2{font-size:1.35rem;font-weight:800;color:var(--pa-t-strong);margin-bottom:8px}
.post-sources .src-intro{font-size:.9rem;color:var(--pa-t-muted);margin-bottom:18px}
.post-sources ul{list-style:none;padding:0;margin:0;display:grid;gap:10px}
.post-sources li{font-size:.92rem;line-height:1.6}
.post-sources a{color:var(--pa-at-blue);text-decoration:none;border-bottom:1px solid rgba(96,165,250,.35)}
.post-sources a:hover{border-bottom-color:var(--pa-at-blue)}
.post-sources .src-note{margin-top:18px;font-size:.78rem;color:var(--pa-t-dim)}
.post-meta-updated{color:var(--pa-t-dim);font-size:.78rem}
</style>`;

const posts = getPosts();
const report = [];

for (const post of posts) {
  const file = path.join(ROOT, 'blog', post.slug, 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = read(file);
  const before = html;

  const heroMatch = html.match(/<section class="post-hero"[^>]*>[\s\S]*?<\/section>/);
  const descMatch = html.match(/<p class="hero-description">([\s\S]*?)<\/p>/);
  if (!heroMatch || !descMatch) { report.push('SKIP ' + post.slug); continue; }
  const answer = descMatch[1].replace(/\s+/g, ' ').trim();

  // 1. Answer-first block for posts that lack one.
  if (!/class="quick-answer"/.test(html) && !/(tl;dr|key takeaways)/i.test(html)) {
    const block = `\n<div class="container"><div class="quick-answer"><h2>Quick answer</h2><p>${answer}</p><span class="qa-meta">Reviewed ${new Date(TODAY).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} by the Performalytic editorial team</span></div></div>`;
    html = html.replace(heroMatch[0], heroMatch[0] + block);
  }

  // 2. Visible "Updated" date next to the publish date.
  const prettyToday = 'October 22, 2026';
  if (!html.includes('post-meta-updated')) {
    html = html.replace(/(<\/time>)/, `$1\n          <span class="post-meta-updated">Updated <time datetime="${TODAY}">${prettyToday}</time></span>`);
  }

  // 3. Sources & further reading, before the CTA.
  const key = TOPIC[post.slug] || (post.category === 'ai-machine-learning' ? 'ai' : post.category === 'cloud' ? 'cloud' : 'dq');
  const src = SOURCES[key];
  if (!/class="post-sources"/.test(html)) {
    const block = `<!-- Sources -->
<section class="post-sources" aria-label="Sources and further reading">
  <div class="container">
    <h2>Sources &amp; further reading</h2>
    <p class="src-intro">Primary documentation and research referenced in this guide.</p>
    <ul>
      ${src.map(([label, url]) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></li>`).join('\n      ')}
    </ul>
    <p class="src-note">External sources are cited for context. Product capabilities described here reflect Performalytic's own implementation work.</p>
  </div>
</section>

`;
    const cta = html.match(/<section class="(?:blog-cta|cta-section)"/);
    if (cta) html = html.slice(0, cta.index) + block + html.slice(cta.index);
    else html = html.replace('</article>', block + '</article>');
  }

  // 4. Refresh structured data: abstract, citations, dateModified.
  html = mapJsonLd(html, data => {
    const arr = Array.isArray(data) ? data : [data];
    for (const o of arr) {
      if (o && (o['@type'] === 'Article' || o['@type'] === 'BlogPosting')) {
        o.dateModified = TODAY + 'T09:00:00+00:00';
        o.abstract = answer;
        o.citation = src.map(s => s[1]);
      }
    }
    return arr;
  });
  html = html.replace(/<meta property="article:modified_time" content="[^"]*"\s*\/?>/, `<meta property="article:modified_time" content="${TODAY}T09:00:00+00:00" />`);

  // 5. Inject the scoped styles once.
  if (!html.includes('.quick-answer{')) html = html.replace('</head>', CSS + '\n</head>');

  if (html !== before) { write(file, html); report.push('updated ' + post.slug + ' [' + key + ']'); }
}

console.log(report.join('\n'));
console.log('posts updated:', report.length);
