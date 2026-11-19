'use strict';
/*
 * 27-knowledge-hub-svg.js
 * Adds explanatory SVG diagrams to the Knowledge Hub:
 *   - hub: a three-layer map of the seven topics
 *   - topic pages: a flow / stack diagram for the core concept
 *
 * Inline SVG keeps the diagrams theme-aware, accessible, and request-free.
 * Idempotent via the kh:visual marker and the kh-svg-css style block.
 */
const path = require('path');
const { ROOT, read, write } = require('./lib');

const TODAY = '2026-11-19';
const NONCE = 'P3rf0rm4lyt1c';

const CSS = `
/* ============================================================
   Knowledge Hub v2 - explanatory diagrams
   ============================================================ */
.kh-visual{padding:56px 0 24px;scroll-margin-top:96px;background:linear-gradient(180deg,var(--pa-bg-2) 0%,var(--pa-bg) 100%)}
.kh-visual-head{max-width:820px;margin:0 auto 30px;text-align:center}
.kh-visual-head h2{font-size:clamp(1.45rem,2.7vw,1.95rem);font-weight:800;letter-spacing:-.5px;line-height:1.2;color:var(--pa-t-strong);margin:10px 0 10px}
.kh-visual-head p{font-size:.94rem;color:var(--pa-t-muted);line-height:1.7;margin:0}
.kh-diagram{margin:0;background:var(--pa-wb-002);border:1px solid var(--pa-wd-006);border-radius:22px;padding:18px;box-shadow:0 20px 60px var(--pa-sh-k-02);position:relative;overflow:hidden}
.kh-diagram::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#2563eb,#7c3aed,#22d3ee)}
.kh-diagram-scroll{overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin;padding:6px 2px 2px;border-radius:12px}
.kh-diagram-scroll:focus-visible{outline:2px solid var(--pa-at-blue);outline-offset:4px}
.kh-diagram svg{display:block;width:100%;min-width:760px;height:auto;font-family:inherit}
.kh-diagram figcaption{font-size:.8rem;color:var(--pa-t-muted);line-height:1.65;margin:14px 4px 0;max-width:960px}
.kh-diagram figcaption strong{color:var(--pa-t-strong);font-weight:700}
.kh-diagram-hint{display:none;font-size:.7rem;font-weight:600;color:var(--pa-t-dim);margin:0 0 8px;letter-spacing:.2px}
.kh-dg-box{fill:var(--pa-wb-003);stroke:var(--pa-wd-012);stroke-width:1.5}
.kh-dg-box-hot{fill:rgba(37,99,235,.09);stroke:rgba(96,165,250,.35)}
.kh-dg-blue{fill:rgba(37,99,235,.10);stroke:rgba(96,165,250,.35)}
.kh-dg-purple{fill:rgba(124,58,237,.10);stroke:rgba(167,139,250,.35)}
.kh-dg-cyan{fill:rgba(34,211,238,.08);stroke:rgba(34,211,238,.30)}
.kh-dg-title{fill:var(--pa-t-strong);font-size:14px;font-weight:700}
.kh-dg-sub{fill:var(--pa-t-muted);font-size:11px;font-weight:500}
.kh-dg-num{fill:var(--pa-at-blue);font-size:10.5px;font-weight:800}
.kh-dg-num-bg{fill:rgba(96,165,250,.13);stroke:rgba(96,165,250,.32);stroke-width:1}
.kh-dg-band{fill:var(--pa-wb-002);stroke:var(--pa-wd-01);stroke-width:1.2;stroke-dasharray:6 5}
.kh-dg-band-title{fill:var(--pa-t-dim);font-size:10px;font-weight:800;letter-spacing:.9px}
.kh-dg-band-sub{fill:var(--pa-t-muted);font-size:11.5px;font-weight:500}
.kh-dg-band-text{fill:var(--pa-t-2);font-size:12.5px;font-weight:500}
.kh-dg-arrow{stroke:var(--pa-at-blue);stroke-width:2;fill:none}
.kh-dg-arrow-muted{stroke:var(--pa-wd-03);stroke-width:1.8;fill:none;stroke-dasharray:5 5}
.kh-dg-label{fill:var(--pa-t-dim);font-size:10.5px;font-weight:600}
.kh-dg-layer-title{fill:var(--pa-t-strong);font-size:14px;font-weight:700}
.kh-dg-layer-sub{fill:var(--pa-t-muted);font-size:11.5px;font-weight:500}
.kh-dg-rail{fill:var(--pa-wb-002);stroke:var(--pa-wd-008);stroke-width:1}
.kh-dg-rail-title{fill:var(--pa-t-dim);font-size:10px;font-weight:800;letter-spacing:.9px}
.kh-dg-rail-text{fill:var(--pa-t-2);font-size:12px;font-weight:600}
@media(max-width:820px){
  .kh-visual{padding:44px 0 16px}
  .kh-diagram{padding:14px;border-radius:16px}
  .kh-diagram-hint{display:block}
  .kh-diagram figcaption{font-size:.76rem}
}
`;

const DIAGRAMS = {
  'data-architecture-engineering': {
    id: 'dg-arch',
    heading: 'How data moves through a modern architecture',
    intro: 'Follow one data path from source system to consumption. The controls underneath are what make the path reliable.',
    title: 'Data architecture flow from sources to consumption',
    desc: 'A left-to-right flow. Source systems feed ingestion, which lands data in a lakehouse, models it into a semantic layer, and exposes it to BI, AI, and operational applications. Governance, quality, reconciliation, lineage, and security run across every stage.',
    caption: 'Sources are landed, refined, modeled, and exposed once. Governance, quality, reconciliation, lineage, and security run across every layer - not just at the end.',
    type: 'flow',
    steps: [
      { t: 'Sources', s: 'ERP, CRM, events, files' },
      { t: 'Ingestion', s: 'Batch, CDC, streaming' },
      { t: 'Lakehouse', s: 'Bronze, silver, gold tables' },
      { t: 'Semantic layer', s: 'Metrics, joins, definitions' },
      { t: 'Consumption', s: 'BI, AI, operational apps' }
    ],
    band: { title: 'CONTROLS ACROSS EVERY LAYER', text: 'Governance · Data quality · Reconciliation · Lineage · Security' }
  },
  'business-intelligence-analytics': {
    id: 'dg-bi',
    heading: 'From business question to trusted decision',
    intro: 'A dashboard is the middle of the loop, not the end. This is how a business question becomes a metric a team can act on.',
    title: 'Business intelligence decision loop',
    desc: 'A five-step loop from business question to decision: define the metric, model it in a semantic layer, present it in a dashboard, act on it, then measure the outcome and refine the question. The semantic layer keeps definitions consistent.',
    caption: 'The semantic layer is the trust layer: it holds the definition, owner, grain, and freshness that make a number shareable. The loop closes when the decision is measured.',
    type: 'flow',
    steps: [
      { t: 'Business question', s: 'What decision are we making?' },
      { t: 'Metric definition', s: 'Name, formula, grain, owner' },
      { t: 'Semantic model', s: 'Joins, filters, certification' },
      { t: 'Dashboard', s: 'One number, with context' },
      { t: 'Decision', s: 'Act, measure, refine' }
    ],
    feedback: 'Measure the outcome, then refine the question',
    band: { title: 'THE TRUST LAYER', text: 'A metric is only shareable when its definition, owner, grain, and freshness are visible.' }
  },
  'ai-machine-learning': {
    id: 'dg-ai',
    heading: 'How a grounded AI answer is assembled',
    intro: 'Retrieval, permissions, evaluation, and logging are part of the answer. This is the pipeline behind a grounded response.',
    title: 'Retrieval-augmented generation pipeline',
    desc: 'A six-stage retrieval-augmented generation pipeline. A user question is retrieved against permission-aware sources, grounded in context, passed to a model, verified by evaluation and guardrails, and returned as a cited answer with an audit log.',
    caption: 'A grounded answer is retrieved, assembled, generated, and verified. The audit log and human escalation path are part of the product, not an afterthought.',
    type: 'flow',
    steps: [
      { t: 'User question', s: 'Natural language or app event' },
      { t: 'Retrieve', s: 'Permission-aware search' },
      { t: 'Ground', s: 'Context, policy, citations' },
      { t: 'Generate', s: 'Bounded prompt, chosen model' },
      { t: 'Verify', s: 'Evaluation and guardrails' },
      { t: 'Answer', s: 'Cited, logged, auditable' }
    ],
    band: { title: 'GUARDRAILS AROUND EVERY STEP', text: 'Access control · Freshness · Evaluation · Human escalation · Audit log' }
  },
  'data-governance-quality': {
    id: 'dg-gov',
    heading: 'The governance operating loop',
    intro: 'Governance works when it runs as a monthly routine, not a one-time policy exercise.',
    title: 'Data governance operating loop',
    desc: 'A six-step governance loop: define critical data, assign owners and stewards, set tests, monitor against SLAs, resolve root causes, and report evidence. The loop repeats monthly so governance improves rather than becoming a one-time project.',
    caption: 'The loop closes when root causes are fixed and evidence is reported. Without that, governance becomes a dashboard nobody uses.',
    type: 'flow',
    steps: [
      { t: 'Define', s: 'Critical data elements' },
      { t: 'Assign', s: 'Owner and steward' },
      { t: 'Test', s: 'Quality rules and SLAs' },
      { t: 'Monitor', s: 'Alerts and scorecards' },
      { t: 'Resolve', s: 'Root cause and fix' },
      { t: 'Report', s: 'Evidence and improve' }
    ],
    feedback: 'Repeat monthly and close the loop on root causes',
    band: { title: 'THE OPERATING MODEL', text: 'Policy and standards · Roles and accountability · Controls and tooling · Evidence' }
  },
  'cloud-data-platforms': {
    id: 'dg-cloud',
    heading: 'The layers of a cloud data platform',
    intro: 'Every platform decision sits somewhere in this stack. Use it to compare options on fit, not feature count.',
    title: 'Cloud data platform layers',
    desc: 'A five-layer stack shown from consumption at the top to ingestion at the bottom: consumption, serving, processing, storage, and ingestion. A side rail lists cost and FinOps, security and access, governance and lineage, and reliability and disaster recovery as cross-cutting concerns.',
    caption: 'Storage and compute are separable; cost, security, governance, and reliability are not optional add-ons. Use the layers to compare platforms on fit.',
    type: 'stack',
    layers: [
      { t: 'Consumption', s: 'BI dashboards, AI apps, operational workflows' },
      { t: 'Serving', s: 'Semantic layer, data marts, APIs' },
      { t: 'Processing', s: 'Warehouse and lakehouse compute, Spark, SQL' },
      { t: 'Storage', s: 'Object storage with Iceberg or Delta tables' },
      { t: 'Ingestion', s: 'Batch, CDC, streaming, SaaS connectors' }
    ],
    rail: ['Cost & FinOps', 'Security & access', 'Governance & lineage', 'Reliability & DR']
  },
  'dataops-devops': {
    id: 'dg-ops',
    heading: 'How a data change reaches production',
    intro: 'The path from commit to production should be automated, verified, and reversible.',
    title: 'Data change delivery pipeline',
    desc: 'A six-stage data delivery pipeline: commit code, run CI tests, compare schemas, deploy to a staged environment, reconcile source and target totals, and monitor production. A rollback path returns from monitoring to the previous release.',
    caption: 'A change is not done when it deploys. It is done when it reconciles and stays healthy in production - and when you can reverse it.',
    type: 'flow',
    steps: [
      { t: 'Commit', s: 'SQL, models, config' },
      { t: 'CI tests', s: 'Unit and data tests' },
      { t: 'Schema check', s: 'Diff and data contracts' },
      { t: 'Deploy', s: 'Staged release' },
      { t: 'Reconcile', s: 'Counts, keys, totals' },
      { t: 'Monitor', s: 'Alerts and rollback' }
    ],
    rollback: { from: 5, to: 3, label: 'rollback path' },
    band: { title: 'EVERY CHANGE IS REVERSIBLE', text: 'Versioned migrations · Previous release · Rollback note · Post-incident review' }
  },
  'master-data-management': {
    id: 'dg-mdm',
    heading: 'How a golden record is built and kept',
    intro: 'Matching creates a candidate. Stewardship, survivorship, and verification keep it correct.',
    title: 'Master data management matching pipeline',
    desc: 'A six-stage master data pipeline. Source systems are standardized, matched using deterministic, probabilistic, and machine-learned methods, reviewed by stewards only where uncertain, merged into a golden record via survivorship rules, then published and continuously verified.',
    caption: 'Only uncertain matches go to a human. Golden records are published and verified continuously, not declared once.',
    type: 'flow',
    steps: [
      { t: 'Sources', s: 'CRM, ERP, billing, suppliers' },
      { t: 'Standardize', s: 'Clean, parse, normalize' },
      { t: 'Match', s: 'Deterministic, probabilistic, ML' },
      { t: 'Steward review', s: 'Only uncertain matches' },
      { t: 'Golden record', s: 'Survivorship by attribute' },
      { t: 'Publish & verify', s: 'Sync and reconcile' }
    ],
    band: { title: 'MATCHING ORDER', text: 'Deterministic keys first · Probabilistic scoring second · Machine-learned similarity last · Humans decide edge cases' }
  }
};

const HUB = {
  id: 'dg-hub',
  heading: 'A map of the Knowledge Hub',
  intro: 'Seven topics, three layers. Start with the foundation, earn trust, then create outcomes - or jump straight to the topic in front of you.',
  title: 'Map of the seven Knowledge Hub topics',
  desc: 'A three-column map. The foundation column contains data architecture, cloud platforms, and DataOps. The trust column contains governance and quality, and master data. The outcomes column contains BI and analytics, and AI and machine learning. Arrows show that the foundation enables trust, which enables outcomes.',
  caption: 'The hub is organized as a stack: architecture, cloud, and DataOps build the foundation; governance and master data make it trustworthy; BI and AI turn it into outcomes. Every topic links across the others.',
  type: 'hub'
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrap(text, max) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (!line) line = w;
    else if ((line + ' ' + w).length <= max) line += ' ' + w;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

function textLines(x, y, lines, cls, lineH, anchor) {
  return lines.map((line, i) => `<text x="${x}" y="${y + i * lineH}" text-anchor="${anchor || 'middle'}" class="${cls}">${esc(line)}</text>`).join('');
}

function svgShell(cfg, body, height) {
  return `<svg viewBox="0 0 1120 ${height}" role="img" aria-labelledby="${cfg.id}-title ${cfg.id}-desc" xmlns="http://www.w3.org/2000/svg">
  <title id="${cfg.id}-title">${esc(cfg.title)}</title>
  <desc id="${cfg.id}-desc">${esc(cfg.desc)}</desc>
  <defs>
    <linearGradient id="${cfg.id}-accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#2563eb"/><stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
    <marker id="${cfg.id}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--pa-at-blue)"/></marker>
    <marker id="${cfg.id}-arrow-muted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--pa-wd-03)"/></marker>
  </defs>
  ${body}
</svg>`;
}

function flowDiagram(cfg) {
  const n = cfg.steps.length;
  const boxW = n >= 6 ? 158 : 188;
  const gap = (1080 - n * boxW) / (n - 1);
  const startX = 20;
  const y = 50;
  const h = 112;
  let body = '';

  cfg.steps.forEach((step, i) => {
    const x = startX + i * (boxW + gap);
    const titleLines = wrap(step.t, Math.floor((boxW - 24) / 7.2));
    const subLines = wrap(step.s, Math.floor((boxW - 24) / 5.6)).slice(0, 3);
    const contentH = titleLines.length * 18 + 8 + subLines.length * 14;
    const titleStart = y + (h - contentH) / 2 + 14;
    const subStart = titleStart + titleLines.length * 18 + 8;
    body += `<g>`;
    body += `<rect x="${x}" y="${y}" width="${boxW}" height="${h}" rx="14" class="kh-dg-box"/>`;
    body += `<rect x="${x}" y="${y}" width="${boxW}" height="3" rx="1.5" fill="url(#${cfg.id}-accent)"/>`;
    body += `<circle cx="${x + 18}" cy="${y + 20}" r="10" class="kh-dg-num-bg"/>`;
    body += `<text x="${x + 18}" y="${y + 24}" text-anchor="middle" class="kh-dg-num">${i + 1}</text>`;
    body += textLines(x + boxW / 2, titleStart, titleLines, 'kh-dg-title', 18, 'middle');
    body += textLines(x + boxW / 2, subStart, subLines, 'kh-dg-sub', 14, 'middle');
    body += `</g>`;

    if (i < n - 1) {
      const nextX = startX + (i + 1) * (boxW + gap);
      body += `<path d="M${x + boxW + 3} ${y + h / 2} L${nextX - 5} ${y + h / 2}" class="kh-dg-arrow" marker-end="url(#${cfg.id}-arrow)"/>`;
    }
  });

  if (cfg.feedback) {
    const first = startX + boxW / 2;
    const last = startX + (n - 1) * (boxW + gap) + boxW / 2;
    const fy = y + h + 30;
    body += `<path d="M${last} ${y + h} L${last} ${fy} L${first} ${fy} L${first} ${y + h + 4}" class="kh-dg-arrow" marker-end="url(#${cfg.id}-arrow)"/>`;
    body += `<text x="${(first + last) / 2}" y="${fy - 7}" text-anchor="middle" class="kh-dg-label">${esc(cfg.feedback)}</text>`;
  }

  if (cfg.rollback) {
    const fromX = startX + cfg.rollback.from * (boxW + gap) + boxW / 2;
    const toX = startX + cfg.rollback.to * (boxW + gap) + boxW / 2;
    const ry = y + h + 28;
    body += `<path d="M${fromX} ${y + h} L${fromX} ${ry} L${toX} ${ry} L${toX} ${y + h + 4}" class="kh-dg-arrow-muted" marker-end="url(#${cfg.id}-arrow-muted)"/>`;
    body += `<text x="${(fromX + toX) / 2}" y="${ry - 7}" text-anchor="middle" class="kh-dg-label">${esc(cfg.rollback.label)}</text>`;
  }

  const bandY = 220;
  body += `<rect x="20" y="${bandY}" width="1080" height="62" rx="12" class="kh-dg-band"/>`;
  body += `<text x="40" y="${bandY + 24}" class="kh-dg-band-title">${esc(cfg.band.title)}</text>`;
  body += `<text x="40" y="${bandY + 45}" class="kh-dg-band-text">${esc(cfg.band.text)}</text>`;

  return svgShell(cfg, body, 310);
}

function stackDiagram(cfg) {
  const layerX = 30;
  const layerW = 800;
  const layerH = 54;
  const gap = 12;
  const startY = 54;
  const railX = 858;
  const railW = 232;
  const railH = 318;
  let body = '';

  body += `<text x="${layerX}" y="34" class="kh-dg-rail-title">PLATFORM LAYERS</text>`;
  body += `<text x="1090" y="34" text-anchor="end" class="kh-dg-rail-title">CROSS-CUTTING CONCERNS</text>`;
  body += `<path d="M14 372 L14 60" class="kh-dg-arrow" marker-end="url(#${cfg.id}-arrow)"/>`;

  cfg.layers.forEach((layer, i) => {
    const y = startY + i * (layerH + gap);
    body += `<g>`;
    body += `<rect x="${layerX}" y="${y}" width="${layerW}" height="${layerH}" rx="12" class="kh-dg-box"/>`;
    body += `<circle cx="${layerX + 22}" cy="${y + 27}" r="4" fill="var(--pa-at-blue)" opacity=".75"/>`;
    body += `<text x="${layerX + 38}" y="${y + 33}" class="kh-dg-layer-title">${esc(layer.t)}</text>`;
    body += `<text x="${layerX + layerW - 20}" y="${y + 33}" text-anchor="end" class="kh-dg-layer-sub">${esc(layer.s)}</text>`;
    body += `</g>`;
  });

  body += `<rect x="${railX}" y="${startY}" width="${railW}" height="${railH}" rx="16" class="kh-dg-rail"/>`;
  const rowH = (railH - 20 - 24) / 4;
  cfg.rail.forEach((label, i) => {
    const y = startY + 10 + i * (rowH + 8);
    body += `<rect x="${railX + 10}" y="${y}" width="${railW - 20}" height="${rowH}" rx="10" class="kh-dg-box"/>`;
    body += `<text x="${railX + railW / 2}" y="${y + rowH / 2 + 4}" text-anchor="middle" class="kh-dg-rail-text">${esc(label)}</text>`;
  });

  return svgShell(cfg, body, 430);
}

function hubDiagram(cfg) {
  const bands = [
    {
      x: 30,
      label: '1 · BUILD THE FOUNDATION',
      desc: 'Architecture, cloud, and DataOps',
      cls: 'kh-dg-blue',
      items: [
        { t: 'Data architecture', s: 'Pipelines, models, lakehouse' },
        { t: 'Cloud platforms', s: 'Storage, compute, cost' },
        { t: 'DataOps', s: 'CI/CD, tests, reconciliation' }
      ],
      ys: [108, 196, 284]
    },
    {
      x: 395,
      label: '2 · MAKE IT TRUSTWORTHY',
      desc: 'Governance, quality, and master data',
      cls: 'kh-dg-purple',
      items: [
        { t: 'Governance & quality', s: 'Owners, tests, controls' },
        { t: 'Master data', s: 'Golden records, matching' }
      ],
      ys: [150, 244]
    },
    {
      x: 760,
      label: '3 · CREATE OUTCOMES',
      desc: 'BI and AI that people can trust',
      cls: 'kh-dg-cyan',
      items: [
        { t: 'BI & analytics', s: 'Metrics people trust' },
        { t: 'AI & ML', s: 'Grounded, governed AI' }
      ],
      ys: [150, 244]
    }
  ];
  let body = '';
  for (const b of bands) {
    body += `<rect x="${b.x}" y="48" width="330" height="334" rx="18" class="kh-dg-band"/>`;
    body += `<text x="${b.x + 20}" y="76" class="kh-dg-band-title">${esc(b.label)}</text>`;
    body += `<text x="${b.x + 20}" y="95" class="kh-dg-band-sub">${esc(b.desc)}</text>`;
    b.items.forEach((item, i) => {
      const y = b.ys[i];
      body += `<g>`;
      body += `<rect x="${b.x + 18}" y="${y}" width="294" height="70" rx="12" class="kh-dg-box ${b.cls}"/>`;
      body += `<text x="${b.x + 34}" y="${y + 28}" class="kh-dg-title">${esc(item.t)}</text>`;
      body += `<text x="${b.x + 34}" y="${y + 49}" class="kh-dg-sub">${esc(item.s)}</text>`;
      body += `</g>`;
    });
  }
  body += `<path d="M360 215 L393 215" class="kh-dg-arrow" marker-end="url(#${cfg.id}-arrow)"/>`;
  body += `<path d="M725 215 L758 215" class="kh-dg-arrow" marker-end="url(#${cfg.id}-arrow)"/>`;
  return svgShell(cfg, body, 430);
}

function visualSection(cfg, svg) {
  return `<!-- kh:visual -->
<section class="kh-visual" id="visual-guide" aria-label="${esc(cfg.heading)}">
  <div class="container">
    <div class="kh-visual-head reveal">
      <span class="section-label">Visual guide</span>
      <h2>${esc(cfg.heading)}</h2>
      <p>${esc(cfg.intro)}</p>
    </div>
    <figure class="kh-diagram reveal">
      <span class="kh-diagram-hint">Scroll horizontally to see the full diagram.</span>
      <div class="kh-diagram-scroll" tabindex="0" role="region" aria-label="Scrollable diagram: ${esc(cfg.title)}">
        ${svg}
      </div>
      <figcaption><strong>How to read it:</strong> ${esc(cfg.caption)}</figcaption>
    </figure>
  </div>
</section>
<!-- /kh:visual -->`;
}

function build(cfg) {
  if (cfg.type === 'stack') return stackDiagram(cfg);
  if (cfg.type === 'hub') return hubDiagram(cfg);
  return flowDiagram(cfg);
}

function addCss(html) {
  const block = `<style id="kh-svg-css" nonce="${NONCE}">${CSS}</style>`;
  const re = /<style id="kh-svg-css" nonce="[^"]+">[\s\S]*?<\/style>/;
  if (re.test(html)) return html.replace(re, block);
  return html.replace('</head>', block + '\n</head>');
}

/* 1. Topic pages ---------------------------------------------------- */
for (const [slug, cfg] of Object.entries(DIAGRAMS)) {
  const file = path.join(ROOT, 'knowledge', slug, 'index.html');
  let html = read(file);
  if (!html.includes('<!-- kh:start -->')) throw new Error('kh:start marker missing: ' + slug);
  html = addCss(html);
  const svg = build(cfg);
  const visual = visualSection(cfg, svg);
  if (html.includes('<!-- kh:visual -->')) {
    html = html.replace(/<!-- kh:visual -->[\s\S]*?<!-- \/kh:visual -->/, visual);
    write(file, html);
    console.log('visual refreshed:', slug);
    continue;
  }
  html = html.replace('<!-- kh:start -->', visual + '\n\n<!-- kh:start -->');
  write(file, html);
  console.log('visual added:', slug);
}

/* 2. Hub ------------------------------------------------------------ */
(function hubVisual() {
  const file = path.join(ROOT, 'knowledge', 'index.html');
  let html = read(file);
  html = addCss(html);
  const svg = build(HUB);
  const visual = visualSection(HUB, svg);
  if (html.includes('<!-- kh:visual -->')) {
    html = html.replace(/<!-- kh:visual -->[\s\S]*?<!-- \/kh:visual -->/, visual);
    write(file, html);
    console.log('visual refreshed: hub');
    return;
  }
  const marker = '<!-- ========== FEATURED GUIDES ========== -->';
  if (!html.includes(marker)) throw new Error('featured marker missing on hub');
  html = html.replace(marker, visual + '\n\n' + marker);
  write(file, html);
  console.log('visual added: hub');
})();

/* 3. Sitemap lastmod ------------------------------------------------ */
(function sitemap() {
  const file = path.join(ROOT, 'sitemap.xml');
  let xml = read(file);
  let count = 0;
  xml = xml.replace(/(<loc>https:\/\/performalytic\.com\/knowledge\/[^<]*<\/loc>\s*<lastmod>)[^<]*(<\/lastmod>)/g, (m, a, b) => {
    count++;
    return a + TODAY + b;
  });
  write(file, xml);
  console.log('sitemap lastmod refreshed for', count, 'knowledge URLs');
})();
