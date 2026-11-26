#!/usr/bin/env node
/**
 * Replace the generic service-page hero illustrations with compact,
 * theme-aware service identity diagrams and fix the two-column hero
 * grid on every page that still breaks on tablets and phones.
 *
 * Run from the repo root: node scripts/30-service-heroes.js
 * Idempotent: safe to run repeatedly.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const cssHref = '/assets/css/service-heroes.css';

const icons = {
  enterprise: '/assets/images/svg/knowledge-architecture.svg',
  ai: '/assets/images/svg/knowledge-ai.svg',
  bi: '/assets/images/svg/knowledge-bi.svg',
  appdev: '/assets/images/svg/knowledge-devops.svg'
};

const svg = {
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19V3"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v6h-6"/></svg>'
};

const badgeIcons = {
  grid: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pa-at-blue)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  sparkle: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pa-at-green-3)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/></svg>',
  chart: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pa-at-purple)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19V3"/></svg>',
  code: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pa-at-indigo)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="8 6 3 12 8 18"/><polyline points="16 6 21 12 16 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>'
};

function source(label) {
  return `<div class="sha-source"><span class="sha-source-dot"></span><span>${label}</span></div>`;
}

function sources(items) {
  return `<div class="sha-sources" aria-hidden="true">\n${items.map(label => '    ' + source(label)).join('\n')}\n  </div>`;
}

function merge(label, icon) {
  return `<div class="sha-flow" aria-hidden="true">\n    <span class="sha-merge">${icon}${label}</span>\n  </div>`;
}

function metric(label, value, sub) {
  return `<div class="sha-metric"><span>${label}</span><strong>${value}</strong><small>${sub}</small></div>`;
}

function metrics(items) {
  return `<div class="sha-metrics">\n${items.map(m => '        ' + metric(m[0], m[1], m[2])).join('\n')}\n      </div>`;
}

function meter(label, value) {
  return `<div class="sha-meter"><div class="sha-meter-head"><span>${label}</span><strong>${value}</strong></div><div class="sha-meter-track"><span></span></div></div>`;
}

function bars() {
  return `<div class="sha-bars" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>`;
}

function stage(label, status, tone) {
  return `<div class="sha-stage${tone ? ' sha-stage--' + tone : ''}"><span>${label}</span><strong>${status}</strong></div>`;
}

function release(label, value) {
  return `<div class="sha-release"><span>${label}</span><strong>${value}</strong></div>`;
}

function card(config) {
  return `<div class="sha-card" aria-hidden="true">
    <div class="sha-card-head">
      <span class="sha-card-icon"><img src="${config.icon}" alt="" /></span>
      <span class="sha-card-copy"><span class="sha-card-kicker">${config.kicker}</span><span class="sha-card-title">${config.title}</span></span>
      <span class="sha-badge">${config.badge}</span>
    </div>
    <div class="sha-card-body">${config.body}</div>
    <div class="sha-foot">${config.foot.map(t => `<span>${t}</span>`).join('')}</div>
  </div>`;
}

function art(id, variant, title, desc, body) {
  return `<div class="sha sha--${variant}" role="img" aria-labelledby="sha-${id}-title sha-${id}-desc">
    <span id="sha-${id}-title" class="sr-only">${title}</span>
    <span id="sha-${id}-desc" class="sr-only">${desc}</span>
    ${body}
  </div>`;
}

function badge(label, icon) {
  return `<div class="hero-badge" role="text" aria-label="Service">${icon} ${label}</div>`;
}

const servicePages = [
  {
    file: 'enterprise-solution-development/index.html',
    id: 'enterprise',
    variant: 'enterprise',
    badge: badge('Enterprise Solutions', badgeIcons.grid),
    art: art(
      'enterprise',
      'enterprise',
      'Enterprise delivery system',
      'Strategy, custom build, integration, and managed operations combine into a modern enterprise platform.',
      sources(['Strategy', 'Build', 'Integrate', 'Operate']) + '\n  ' +
      merge('Deliver &amp; scale', svg.layers) + '\n  ' +
      card({
        icon: icons.enterprise,
        kicker: 'Enterprise delivery',
        title: 'Modern platform',
        badge: 'End-to-end',
        body: metrics([
          ['Portfolio', '42 apps', 'modernized'],
          ['Uptime', '99.95%', 'SLA'],
          ['Delivery', '3', 'centers']
        ]) + '\n      ' + meter('Modernization coverage', '92%'),
        foot: ['Strategy', 'Custom apps', 'Integration', 'Managed ops']
      })
    )
  },
  {
    file: 'advanced-analytics-ai/index.html',
    id: 'ai',
    variant: 'ai',
    badge: badge('Advanced Analytics &amp; AI', badgeIcons.sparkle),
    art: art(
      'ai',
      'ai',
      'Advanced analytics and AI delivery flow',
      'Data, models, agents, and decisions move through training and evaluation into a grounded production AI system.',
      sources(['Data', 'Models', 'Agents', 'Decisions']) + '\n  ' +
      merge('Train &amp; evaluate', svg.sparkle) + '\n  ' +
      card({
        icon: icons.ai,
        kicker: 'Production AI',
        title: 'Grounded AI',
        badge: 'Live',
        body: metrics([
          ['Productivity', '+40%', 'automated'],
          ['Models', '24', 'in production'],
          ['Evals', '128', 'passed']
        ]) + '\n      ' + meter('Production readiness', '94%'),
        foot: ['RAG', 'MLOps', 'Responsible AI', 'Observability']
      })
    )
  },
  {
    file: 'bi-integration/index.html',
    id: 'bi',
    variant: 'bi',
    badge: badge('BI Integration', badgeIcons.chart),
    art: art(
      'bi',
      'bi',
      'Business intelligence integration flow',
      'ERP, CRM, warehouse, and SaaS data are modelled and governed into one trusted real-time dashboard.',
      sources(['ERP', 'CRM', 'DWH', 'SaaS']) + '\n  ' +
      merge('Model &amp; govern', svg.chart) + '\n  ' +
      card({
        icon: icons.bi,
        kicker: 'Trusted analytics',
        title: 'Live dashboard',
        badge: 'Real-time',
        body: metrics([
          ['Revenue', '$4.2M', '+12%'],
          ['Margin', '31.4%', '+2.1%'],
          ['Churn', '1.8%', '-0.3%']
        ]) + '\n      ' + bars(),
        foot: ['One dataset', 'Semantic layer', 'Governance', 'Adoption']
      })
    )
  },
  {
    file: 'application-development-and-system-integration/index.html',
    id: 'appdev',
    variant: 'appdev',
    badge: badge('Application Development &amp; Integration', badgeIcons.code),
    art: art(
      'appdev',
      'appdev',
      'Application development and integration pipeline',
      'Assessment, build, integration, and deployment stages produce a connected, monitored application stack.',
      sources(['Assess', 'Build', 'Integrate', 'Deploy']) + '\n  ' +
      merge('Integrate &amp; ship', svg.refresh) + '\n  ' +
      card({
        icon: icons.appdev,
        kicker: 'Integration &amp; DevOps',
        title: 'Connected stack',
        badge: 'CI/CD',
        body: `<div class="sha-stages">
        ${stage('Assess', 'Plan', 'done')}
        ${stage('Build', 'Built', 'done')}
        ${stage('Deploy', 'Live', 'live')}
        ${stage('Optimize', 'Tune')}
      </div>
      ${release('Last deploy 12m ago', 'No drift')}`,
        foot: ['APIs', 'Microservices', 'CI/CD', 'Cloud-native']
      })
    )
  }
];

const utilityPages = [
  'contact/index.html',
  'faq/index.html',
  'industries/index.html',
  'technologies/index.html',
  'tools/index.html'
];

function indent(text, spaces) {
  const pad = ' '.repeat(spaces);
  return text.split('\n').map((line) => pad + line).join('\n');
}

let updated = 0;

function addStylesheet(html) {
  if (html.includes(cssHref)) return html;
  return html.replace('</head>', `  <link rel="stylesheet" href="${cssHref}" />\n</head>`);
}

function writeIfChanged(file, before, after) {
  if (after === before) return;
  fs.writeFileSync(file, after, 'utf8');
  updated++;
  console.log('updated:', file);
}

// Service pages: new badge, service diagram, and responsive class.
for (const page of servicePages) {
  const file = path.join(root, page.file);
  if (!fs.existsSync(file)) {
    console.warn('missing:', page.file);
    continue;
  }

  let html = fs.readFileSync(file, 'utf8');
  const before = html;

  html = addStylesheet(html);
  html = html.replace(
    /<section class="hero(?! hero--service)" id="hero">/,
    '<section class="hero hero--service" id="hero">'
  );

  const badgeRe = /<div class="hero-badge"[^>]*>[\s\S]*?<\/div>/;
  if (badgeRe.test(html)) {
    html = html.replace(badgeRe, page.badge);
  } else {
    console.warn('hero badge not found:', page.file);
  }

  const marker = /^[ \t]*<!-- sha-hero-art:start -->[\s\S]*?^[ \t]*<!-- sha-hero-art:end -->/m;
  const artBlock = `        <!-- sha-hero-art:start -->\n${indent(page.art, 8)}\n        <!-- sha-hero-art:end -->`;

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

  writeIfChanged(page.file, before, html);
}

// Utility pages: only need the shared responsive layout rules.
for (const relative of utilityPages) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    console.warn('missing:', relative);
    continue;
  }

  const before = fs.readFileSync(file, 'utf8');
  const after = addStylesheet(before);
  writeIfChanged(file, before, after);
}

console.log(`service hero pass complete: ${updated} file(s) updated`);
