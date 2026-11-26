#!/usr/bin/env node
/**
 * Replace the oversized Knowledge Hub topic icons with purpose-built,
 * theme-aware hero diagrams and normalise topic-page hero metadata.
 *
 * Run from the repo root: node scripts/29-knowledge-heroes.js
 * Idempotent: safe to run repeatedly.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const cssHref = '/assets/css/knowledge-heroes.css';

const icons = {
  ai: '/assets/images/svg/knowledge-ai.svg',
  bi: '/assets/images/svg/knowledge-bi.svg',
  cloud: '/assets/images/svg/knowledge-cloud.svg',
  architecture: '/assets/images/svg/knowledge-architecture.svg',
  governance: '/assets/images/svg/knowledge-governance.svg',
  dataops: '/assets/images/svg/knowledge-devops.svg'
};

const svg = {
  sparkle: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19V3"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.5 19H7a5 5 0 1 1 1.1-9.9A6 6 0 0 1 19 11.5 4 4 0 0 1 17.5 19z"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.4-3 7.5-7 9-4-1.5-7-4.6-7-9V6l7-3z"/><path d="m9 12 2 2 4-4"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v6h-6"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
};

function source(label, dot) {
  return `<div class="kha-source"><span class="kha-source-dot${dot ? ' ' + dot : ''}"></span><span>${label}</span></div>`;
}

function sources(items) {
  return `<div class="kha-sources" aria-hidden="true">\n${items.map(s => '    ' + s).join('\n')}\n  </div>`;
}

function merge(label, icon) {
  return `<div class="kha-flow" aria-hidden="true">\n    <span class="kha-merge">${icon}${label}</span>\n  </div>`;
}

function card(config) {
  const badgeClass = config.badgeClass ? ' ' + config.badgeClass : '';
  const icon = config.icon
    ? `<img src="${config.icon}" alt="" />`
    : config.iconSvg || '';
  return `<div class="kha-card" aria-hidden="true">
    <div class="kha-card-head">
      <span class="kha-card-icon">${icon}</span>
      <span class="kha-card-copy"><span class="kha-card-kicker">${config.kicker}</span><span class="kha-card-title">${config.title}</span></span>
      <span class="kha-badge${badgeClass}">${config.badge}</span>
    </div>
    <div class="kha-card-body">${config.body}</div>
    <div class="kha-foot">${config.foot.map(t => `<span>${t}</span>`).join('')}</div>
  </div>`;
}

function art(id, title, desc, body) {
  return `<div class="kha" role="img" aria-labelledby="kha-${id}-title kha-${id}-desc">
    <span id="kha-${id}-title" class="sr-only">${title}</span>
    <span id="kha-${id}-desc" class="sr-only">${desc}</span>
    ${body}
  </div>`;
}

function metric(label, value, sub) {
  return `<div class="kha-metric"><span>${label}</span><strong>${value}</strong><small>${sub}</small></div>`;
}

function layer(name, detail, tone) {
  return `<div class="kha-layer${tone ? ' kha-layer--' + tone : ''}"><strong>${name}</strong><small>${detail}</small></div>`;
}

function check(label, value, warn) {
  return `<div class="kha-check${warn ? ' kha-check--warn' : ''}"><span>${label}</span><strong>${value}</strong></div>`;
}

function stage(label, status, tone) {
  return `<div class="kha-stage${tone ? ' kha-stage--' + tone : ''}"><span>${label}</span><strong>${status}</strong></div>`;
}

// Master Data Management keeps its dedicated source -> match/merge -> golden record map.
const pages = [
  {
    file: 'knowledge/ai-machine-learning/index.html',
    id: 'ai',
    title: 'AI and machine learning production flow',
    desc: 'Business documents, tickets, SQL, and APIs are grounded, evaluated, and guarded before reaching a production AI model.',
    art: art('ai', 'AI and machine learning production flow', 'Business documents, tickets, SQL, and APIs are grounded, evaluated, and guarded before reaching a production AI model.',
      sources([
        source('Docs', ''),
        source('Tickets', 'kha-dot--purple'),
        source('SQL', 'kha-dot--cyan'),
        source('APIs', 'kha-dot--teal')
      ]) + '\n  ' + merge('Ground &amp; evaluate', svg.sparkle) + '\n  ' + card({
        icon: icons.ai,
        kicker: 'Production AI',
        title: 'Grounded model',
        badge: 'Live',
        body: `<div class="kha-metrics">
        ${metric('Latency', '1.2s', 'p95')}
        ${metric('Evals', '128', 'passed')}
        ${metric('Guardrails', 'On', 'PII · safety')}
      </div>
      <div class="kha-meter"><div class="kha-meter-head"><span>Production readiness</span><strong>94%</strong></div><div class="kha-meter-track"><span></span></div></div>`,
        foot: ['RAG', 'Evals', 'Guardrails', 'Observability']
      })),
    meta: { label: 'AI & Machine Learning hub facts', guides: 10, concepts: 4 }
  },
  {
    file: 'knowledge/business-intelligence-analytics/index.html',
    id: 'bi',
    title: 'Business intelligence analytics flow',
    desc: 'Warehouse, CRM, ERP, and file data are modeled and governed into an executive dashboard with trusted metrics.',
    art: art('bi', 'Business intelligence analytics flow', 'Warehouse, CRM, ERP, and file data are modeled and governed into an executive dashboard with trusted metrics.',
      sources([
        source('DWH', ''),
        source('CRM', 'kha-dot--purple'),
        source('ERP', 'kha-dot--cyan'),
        source('Files', 'kha-dot--teal')
      ]) + '\n  ' + merge('Model &amp; govern', svg.chart) + '\n  ' + card({
        icon: icons.bi,
        kicker: 'Trusted analytics',
        title: 'Executive dashboard',
        badge: 'Live',
        body: `<div class="kha-metrics">
        ${metric('Revenue', '$4.2M', '+12%')}
        ${metric('Margin', '31.4%', '+2.1%')}
        ${metric('Churn', '1.8%', '-0.3%')}
      </div>
      <div class="kha-bars" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>`,
        foot: ['Metrics', 'Semantic layer', 'Storytelling', 'Adoption']
      })),
    meta: { label: 'Business Intelligence & Analytics hub facts', guides: 10, concepts: 4 }
  },
  {
    file: 'knowledge/cloud-data-platforms/index.html',
    id: 'cloud',
    title: 'Multi-cloud data platform flow',
    desc: 'AWS, Azure, Google Cloud, and on-premises sources feed ingestion, a lakehouse, and analytics and AI workloads.',
    art: art('cloud', 'Multi-cloud data platform flow', 'AWS, Azure, Google Cloud, and on-premises sources feed ingestion, a lakehouse, and analytics and AI workloads.',
      sources([
        source('AWS', ''),
        source('Azure', 'kha-dot--purple'),
        source('GCP', 'kha-dot--cyan'),
        source('On-prem', 'kha-dot--amber')
      ]) + '\n  ' + merge('Store &amp; scale', svg.cloud) + '\n  ' + card({
        icon: icons.cloud,
        kicker: 'Multi-cloud',
        title: 'Lakehouse platform',
        badge: '3 clouds',
        badgeClass: 'kha-badge--blue',
        body: `<div class="kha-chips"><span>AWS</span><span>Azure</span><span>Google Cloud</span></div>
      <div class="kha-layers">
        ${layer('Consumption', 'BI · AI · Apps')}
        ${layer('Lakehouse', 'Storage · Compute · Catalog')}
        ${layer('Ingestion', 'Batch · Streaming · CDC')}
      </div>`,
        foot: ['FinOps', 'Migration', 'Governance', 'Elasticity']
      })),
    meta: { label: 'Cloud Data Platforms hub facts', guides: 8, concepts: 4 }
  },
  {
    file: 'knowledge/data-architecture-engineering/index.html',
    id: 'architecture',
    title: 'Data architecture and medallion pipeline',
    desc: 'Applications, events, files, and APIs flow through bronze, silver, and gold layers into trusted data products.',
    art: art('architecture', 'Data architecture and medallion pipeline', 'Applications, events, files, and APIs flow through bronze, silver, and gold layers into trusted data products.',
      sources([
        source('Apps', ''),
        source('Events', 'kha-dot--purple'),
        source('Files', 'kha-dot--cyan'),
        source('APIs', 'kha-dot--teal')
      ]) + '\n  ' + merge('Transform &amp; model', svg.layers) + '\n  ' + card({
        icon: icons.architecture,
        kicker: 'Data foundation',
        title: 'Medallion pipeline',
        badge: 'Gold',
        badgeClass: 'kha-badge--gold',
        body: `<div class="kha-layers">
        ${layer('Gold', 'Trusted data products', 'gold')}
        ${layer('Silver', 'Cleaned &amp; modeled', 'silver')}
        ${layer('Bronze', 'Raw ingest', 'bronze')}
      </div>
      <div class="kha-chips"><span>Batch</span><span>Streaming</span><span>dbt</span></div>`,
        foot: ['Modeling', 'Orchestration', 'Data products', 'Quality']
      })),
    meta: { label: 'Data Architecture & Engineering hub facts', guides: 12, concepts: 4 }
  },
  {
    file: 'knowledge/data-governance-quality/index.html',
    id: 'governance',
    title: 'Data governance and quality scorecard',
    desc: 'Catalog, policy, lineage, and access controls feed a quality scorecard and a trusted data product.',
    art: art('governance', 'Data governance and quality scorecard', 'Catalog, policy, lineage, and access controls feed a quality scorecard and a trusted data product.',
      sources([
        source('Catalog', ''),
        source('Policies', 'kha-dot--purple'),
        source('Lineage', 'kha-dot--cyan'),
        source('Access', 'kha-dot--teal')
      ]) + '\n  ' + merge('Validate &amp; protect', svg.shield) + '\n  ' + card({
        icon: icons.governance,
        kicker: 'Data trust',
        title: 'Quality scorecard',
        badge: 'Trusted',
        body: `<div class="kha-gov">
        <div class="kha-score"><strong>98</strong><span>quality</span></div>
        <div class="kha-checks">
          ${check('Completeness', '99.2%')}
          ${check('Freshness', '2m ago')}
          ${check('Validity', '96.8%', true)}
          ${check('Lineage', 'Mapped')}
        </div>
      </div>`,
        foot: ['Policies', 'Stewardship', 'Retention', 'Access']
      })),
    meta: { label: 'Data Governance & Quality hub facts', guides: 16, concepts: 4 }
  },
  {
    file: 'knowledge/dataops-devops/index.html',
    id: 'dataops',
    title: 'DataOps and DevOps release pipeline',
    desc: 'Git, tests, configuration, and artifacts pass through build, test, and deploy stages into a monitored production pipeline.',
    art: art('dataops', 'DataOps and DevOps release pipeline', 'Git, tests, configuration, and artifacts pass through build, test, and deploy stages into a monitored production pipeline.',
      sources([
        source('Git', ''),
        source('Tests', 'kha-dot--purple'),
        source('Config', 'kha-dot--cyan'),
        source('Artifacts', 'kha-dot--teal')
      ]) + '\n  ' + merge('Build &amp; deploy', svg.refresh) + '\n  ' + card({
        icon: icons.dataops,
        kicker: 'Release pipeline',
        title: 'Production delivery',
        badge: 'Stable',
        body: `<div class="kha-stages">
        ${stage('Commit', 'Passed', 'done')}
        ${stage('Build', 'Passed', 'done')}
        ${stage('Test', 'Passed', 'done')}
        ${stage('Deploy', 'Live', 'live')}
      </div>
      <div class="kha-release"><span>Last release 4m ago</span><strong>No drift</strong></div>`,
        foot: ['CI/CD', 'Orchestration', 'Observability', 'Rollbacks']
      })),
    meta: { label: 'DataOps & DevOps hub facts', guides: 24, concepts: 4 }
  },
  {
    file: 'knowledge/index.html',
    id: 'hub',
    title: 'Knowledge Hub topic map',
    desc: 'Guides, glossary entries, FAQs, and learning paths connect seven topic hubs across data, analytics, and AI.',
    art: art('hub', 'Knowledge Hub topic map', 'Guides, glossary entries, FAQs, and learning paths connect seven topic hubs across data, analytics, and AI.',
      sources([
        source('Guides', ''),
        source('Glossary', 'kha-dot--purple'),
        source('FAQs', 'kha-dot--cyan'),
        source('Paths', 'kha-dot--teal')
      ]) + '\n  ' + merge('Search &amp; learn', svg.search) + '\n  ' + card({
        iconSvg: svg.book,
        kicker: 'Start anywhere',
        title: 'Knowledge Hub',
        badge: '7 hubs',
        badgeClass: 'kha-badge--blue',
        body: `<div class="kha-topics">
        <span class="kha-topic">AI &amp; ML</span>
        <span class="kha-topic">BI &amp; Analytics</span>
        <span class="kha-topic">Cloud Platforms</span>
        <span class="kha-topic">Architecture</span>
        <span class="kha-topic">Governance</span>
        <span class="kha-topic">DataOps</span>
        <span class="kha-topic">Master Data</span>
      </div>
      <div class="kha-searchbar">${svg.search}<span>Search 32 in-depth guides</span></div>`,
        foot: ['32 guides', '6 key concepts', 'Free', 'No sign-up']
      }))
  }
];

function indent(text, spaces) {
  const pad = ' '.repeat(spaces);
  return text.split('\n').map((line) => pad + line).join('\n');
}

function metaBlock(meta) {
  const label = meta.label.replace(/&/g, '&amp;');
  return `<div class="kh-hero-meta" aria-label="${label}">
          <span><strong>${meta.guides}</strong> in-depth guides</span>
          <span><strong>${meta.concepts}</strong> key concepts</span>
          <span>Updated <strong>Nov 19, 2026</strong></span>
          <a href="/editorial-policy/">Editorial standards</a>
        </div>`;
}

let updated = 0;
for (const page of pages) {
  const file = path.join(root, page.file);
  if (!fs.existsSync(file)) {
    console.warn('missing:', page.file);
    continue;
  }
  let html = fs.readFileSync(file, 'utf8');
  const before = html;

  // Shared component stylesheet, loaded after the page's inline styles.
  if (!html.includes(cssHref)) {
    html = html.replace('</head>', `  <link rel="stylesheet" href="${cssHref}" />\n</head>`);
  }

  // Replace the old hero illustration with the new diagram.
  const marker = /^[ \t]*<!-- kh-hero-art:start -->[\s\S]*?^[ \t]*<!-- kh-hero-art:end -->/m;
  const artBlock = `        <!-- kh-hero-art:start -->\n${indent(page.art, 8)}\n        <!-- kh-hero-art:end -->`;
  if (marker.test(html)) {
    html = html.replace(marker, artBlock);
  } else {
    const visual = /<div class="hero-visual">[\s\S]*?<\/div>/;
    if (!visual.test(html)) {
      console.warn('hero visual not found:', page.file);
      continue;
    }
    html = html.replace(visual, `<div class="hero-visual">\n${artBlock}\n      </div>`);
  }

  // Normalise the topic-page metadata to the same compact pill row.
  if (page.meta) {
    const meta = /<div class="kh-hero-meta"[^>]*>[\s\S]*?<\/div>/;
    if (meta.test(html)) {
      html = html.replace(meta, metaBlock(page.meta));
    } else {
      console.warn('hero meta not found:', page.file);
    }
  }

  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    updated++;
    console.log('updated:', page.file);
  }
}

console.log(`knowledge hero pass complete: ${updated} file(s) updated`);
