'use strict';
/*
 * 25-knowledge-hub.js
 * Upgrades the Knowledge Hub (index + 7 topic pages) for search, AI answer
 * engines, and modern UX. Idempotent: pages that already carry the
 * `kh-v2-css` style block are skipped.
 *
 * Run: node scripts/25-knowledge-hub.js
 */
const fs = require('fs');
const path = require('path');
const { ROOT, SITE, read, write, mapJsonLd } = require('./lib');

const TODAY = '2026-11-19';
const HUMAN = 'November 19, 2026';
const NONCE = 'P3rf0rm4lyt1c';

const BASE_CSS = `
/* ============================================================
   Knowledge Hub v2 - shared components (topic + hub pages)
   ============================================================ */
.kh-v2 [hidden]{display:none!important}
.kh-hero-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px 18px;margin-top:22px;font-size:.8rem;color:var(--pa-t-muted);line-height:1.5}
.kh-hero-meta span{display:inline-flex;align-items:center;gap:7px}
.kh-hero-meta strong{color:var(--pa-t-strong);font-weight:700}
.kh-hero-meta a{color:var(--pa-at-blue);text-decoration:none;font-weight:600}
.kh-hero-meta a:hover{text-decoration:underline}
.kh-hero-meta .dot{width:4px;height:4px;border-radius:50%;background:var(--pa-t-dim);display:inline-block}

.kh-start{padding:48px 0 8px;background:linear-gradient(180deg,var(--pa-bg-2) 0%,var(--pa-bg) 100%)}
.kh-start-card{display:grid;grid-template-columns:.9fr 1.1fr;gap:34px;align-items:start;background:var(--pa-wb-002);border:1px solid var(--pa-wd-006);border-radius:24px;padding:36px;position:relative;overflow:hidden;box-shadow:0 18px 50px var(--pa-sh-k-006)}
.kh-start-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#2563eb,#7c3aed,#22d3ee)}
.kh-start-lead .section-label{margin-bottom:12px}
.kh-start-lead h2{font-size:clamp(1.35rem,2.4vw,1.7rem);font-weight:800;letter-spacing:-.5px;line-height:1.25;color:var(--pa-t-strong);margin-bottom:10px}
.kh-start-lead p{font-size:.94rem;color:var(--pa-t-muted);line-height:1.7;margin:0}
.kh-start-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.kh-start-steps a{display:flex;align-items:flex-start;gap:14px;padding:14px 16px;border-radius:14px;border:1px solid var(--pa-wd-006);background:var(--pa-wb-003);text-decoration:none;transition:transform .25s,border-color .25s,background .25s}
.kh-start-steps a:hover{transform:translateX(4px);border-color:rgba(96,165,250,.3);background:var(--pa-wb-006)}
.kh-start-num{width:30px;height:30px;border-radius:9px;background:var(--accent-grad);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.82rem;flex-shrink:0;margin-top:1px}
.kh-start-body{display:block;min-width:0}
.kh-start-body strong{display:block;font-size:.93rem;font-weight:700;color:var(--pa-t-strong);line-height:1.4;margin-bottom:2px}
.kh-start-body span{display:block;font-size:.8rem;color:var(--pa-t-muted);line-height:1.5}

.kh-field{padding:80px 0 48px;background:linear-gradient(180deg,var(--pa-bg) 0%,var(--pa-bg-2) 100%)}
.kh-field-grid{display:grid;grid-template-columns:1.12fr .88fr;gap:34px;align-items:start;margin-top:40px}
.kh-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:18px}
.kh-steps li{display:flex;align-items:flex-start;gap:16px;background:var(--pa-wb-002);border:1px solid var(--pa-wd-006);border-radius:16px;padding:20px 22px;transition:border-color .25s,background .25s,transform .25s}
.kh-steps li:hover{border-color:rgba(96,165,250,.22);background:var(--pa-wb-004);transform:translateY(-2px)}
.kh-step-num{width:32px;height:32px;border-radius:10px;background:rgba(37,99,235,.12);border:1px solid rgba(37,99,235,.25);color:var(--pa-at-blue);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.82rem;flex-shrink:0;margin-top:1px}
.kh-steps h3{font-size:1rem;font-weight:700;color:var(--pa-t-strong);line-height:1.4;margin:0 0 5px}
.kh-steps p{font-size:.88rem;color:var(--pa-t-muted);line-height:1.65;margin:0}
.kh-field-aside{display:flex;flex-direction:column;gap:18px}
.kh-aside-card{background:var(--pa-wb-002);border:1px solid var(--pa-wd-006);border-radius:18px;padding:24px;position:relative;overflow:hidden}
.kh-aside-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#2563eb,#7c3aed)}
.kh-aside-card h3{font-size:1rem;font-weight:700;color:var(--pa-t-strong);margin:0 0 14px;line-height:1.4}
.kh-table-wrap{overflow-x:auto;margin:0 -4px}
.kh-table{width:100%;border-collapse:collapse;font-size:.79rem;min-width:360px}
.kh-table th,.kh-table td{text-align:left;padding:10px 10px;border-bottom:1px solid var(--pa-wd-006);vertical-align:top;line-height:1.5}
.kh-table th{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.55px;color:var(--pa-t-dim);padding-bottom:8px}
.kh-table td{color:var(--pa-t-muted)}
.kh-table td:first-child{color:var(--pa-t-strong);font-weight:600}
.kh-table tr:last-child td{border-bottom:none}
.kh-pitfalls{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.kh-pitfalls li{position:relative;padding-left:22px;font-size:.84rem;color:var(--pa-t-muted);line-height:1.55}
.kh-pitfalls li::before{content:'';position:absolute;left:0;top:.5em;width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#ef4444)}
.kh-field-note{font-size:.83rem;color:var(--pa-t-muted);line-height:1.65;margin:0}
.kh-field-note a{color:var(--pa-at-blue);font-weight:600;text-decoration:underline;text-underline-offset:2px}

@media(max-width:900px){
  .kh-start-card,.kh-field-grid{grid-template-columns:1fr;gap:24px}
  .kh-start-card{padding:28px}
}
@media(max-width:480px){
  .kh-start-card{padding:24px 20px}
  .kh-steps li{padding:16px}
  .kh-aside-card{padding:20px}
  .kh-hero-meta{font-size:.75rem;gap:6px 12px}
}
`;

const INDEX_CSS = `
/* Hub-only: search, stat strip, library, glossary */
.kh-hero-stats{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
.kh-hero-stat{display:inline-flex;align-items:baseline;gap:7px;padding:8px 14px;border-radius:12px;background:rgba(37,99,235,.08);border:1px solid rgba(37,99,235,.16);font-size:.78rem;color:var(--pa-t-muted)}
.kh-hero-stat strong{font-size:.95rem;color:var(--pa-t-strong);font-weight:800}
.kh-search{margin-top:22px;max-width:560px;width:100%}
.kh-search label{display:block;font-size:.78rem;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--pa-t-muted);margin-bottom:8px}
.kh-search-form{display:flex;align-items:center;gap:8px;background:var(--pa-wb-004);border:1px solid var(--pa-wd-012);border-radius:14px;padding:5px 5px 5px 15px;transition:border-color .2s,box-shadow .2s}
.kh-search-form:focus-within{border-color:rgba(96,165,250,.5);box-shadow:0 0 0 3px rgba(37,99,235,.16)}
.kh-search-form svg{width:18px;height:18px;color:var(--pa-t-muted);flex-shrink:0}
.kh-search-form input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:var(--pa-t-strong);font:inherit;font-size:.9rem;padding:9px 4px}
.kh-search-form input::placeholder{color:var(--pa-t-muted)}
.kh-search-form button{border:0;background:var(--accent-grad);color:#fff;font:inherit;font-size:.84rem;font-weight:700;padding:10px 18px;border-radius:10px;cursor:pointer;flex-shrink:0}
.kh-search-form button:hover{filter:brightness(1.08)}
.kh-suggest{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
.kh-suggest span{font-size:.74rem;color:var(--pa-t-dim);align-self:center}
.kh-suggest button{border:1px solid var(--pa-wd-008);background:var(--pa-wb-003);color:var(--pa-t-muted);font:inherit;font-size:.74rem;font-weight:600;padding:5px 11px;border-radius:100px;cursor:pointer;transition:all .2s}
.kh-suggest button:hover{border-color:rgba(96,165,250,.35);color:var(--pa-t-strong);background:var(--pa-wb-006)}

.kh-library{background:linear-gradient(180deg,var(--pa-bg-3) 0%,var(--pa-bg) 100%)}
.kh-lib-toolbar{display:flex;flex-direction:column;gap:14px;align-items:center;margin-top:30px}
.kh-lib-search{width:100%;max-width:520px}
.kh-lib-filters{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.kh-lib-filter{border:1px solid var(--pa-wd-008);background:var(--pa-wb-002);color:var(--pa-t-muted);font:inherit;font-size:.8rem;font-weight:600;padding:8px 15px;border-radius:100px;cursor:pointer;transition:all .2s}
.kh-lib-filter:hover{border-color:rgba(96,165,250,.3);color:var(--pa-t-strong)}
.kh-lib-filter[aria-pressed="true"]{background:var(--accent-grad);border-color:transparent;color:#fff;box-shadow:0 6px 18px rgba(37,99,235,.28)}
.kh-search-status{min-height:1.2em;font-size:.8rem;color:var(--pa-t-muted);text-align:center;margin-top:4px}
.kh-lib-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:26px}
.kh-lib-card{background:var(--pa-wb-002);border:1px solid var(--pa-wd-006);border-radius:20px;padding:26px;transition:border-color .3s,background .3s,transform .3s;position:relative;overflow:hidden}
.kh-lib-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--accent-grad);transform:scaleX(0);transform-origin:left;transition:transform .3s}
.kh-lib-card:hover{transform:translateY(-3px);border-color:rgba(96,165,250,.2);background:var(--pa-wb-004)}
.kh-lib-card:hover::before{transform:scaleX(1)}
.kh-lib-card h3{font-size:1.05rem;font-weight:800;color:var(--pa-t-strong);margin:0 0 6px;letter-spacing:-.2px}
.kh-lib-card h3 a{text-decoration:none;color:inherit}
.kh-lib-card>p{font-size:.82rem;color:var(--pa-t-muted);line-height:1.6;margin:0 0 14px}
.kh-lib-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.kh-lib-list a{display:flex;align-items:flex-start;gap:9px;padding:7px 0;text-decoration:none;color:var(--pa-t-2);font-size:.84rem;line-height:1.5;border-bottom:1px dashed var(--pa-wd-006);transition:color .2s,gap .2s}
.kh-lib-list li:last-child a{border-bottom:none}
.kh-lib-list a:hover{color:var(--pa-at-blue);gap:12px}
.kh-lib-list a svg{width:13px;height:13px;flex-shrink:0;margin-top:3px;color:var(--pa-at-blue)}
.kh-lib-more{display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:.8rem;font-weight:700;color:var(--pa-at-blue);text-decoration:none}
.kh-lib-more:hover{gap:10px}
.kh-empty{grid-column:1/-1;text-align:center;padding:40px 20px;color:var(--pa-t-muted);font-size:.9rem}

.kh-glossary{background:linear-gradient(180deg,var(--pa-bg-2) 0%,var(--pa-bg-3) 100%)}
.kh-glossary-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:34px}
.kh-term{background:var(--pa-wb-002);border:1px solid var(--pa-wd-006);border-radius:16px;padding:22px;transition:border-color .25s,background .25s}
.kh-term:hover{border-color:rgba(96,165,250,.22);background:var(--pa-wb-004)}
.kh-term dt{font-size:.95rem;font-weight:700;color:var(--pa-t-strong);margin-bottom:5px}
.kh-term dd{margin:0;font-size:.85rem;color:var(--pa-t-muted);line-height:1.65}
.kh-term dd a{color:var(--pa-at-blue);text-decoration:none;font-weight:600}
.kh-term dd a:hover{text-decoration:underline}
@media(max-width:900px){.kh-lib-grid{grid-template-columns:1fr}.kh-glossary-grid{grid-template-columns:1fr}}
@media(max-width:480px){.kh-search-form{flex-wrap:wrap;padding:10px}.kh-search-form input{width:100%;flex:1 1 100%;padding:6px 4px}.kh-search-form button{width:100%}.kh-lib-card{padding:20px}}
`;

/* ------------------------------------------------------------------ */
/* Topic page data                                                     */
/* ------------------------------------------------------------------ */
const CATS = {
  'data-architecture-engineering': {
    name: 'Data Architecture & Engineering',
    title: 'Data Architecture & Engineering Guides (2026) | Performalytic',
    desc: 'Practical data architecture and engineering guides: design a scalable data stack, model data for reuse, build reliable pipelines, and reconcile every load.',
    keywords: 'data architecture, data architecture guide, data engineering guide, data pipeline architecture, data modeling best practices, data lakehouse, scalable data architecture, data stack, data reconciliation',
    heroMeta: '6 in-depth guides',
    startTitle: 'New to data architecture? Read these three guides first.',
    startIntro: 'They build on each other: model the data, make the pipeline trustworthy, then check whether your current stack can carry the next stage of growth.',
    starts: [
      { href: '/blog/data-modeling-crisis/', title: 'The Data Modeling Crisis', desc: 'Why semantic inconsistency breaks analytics, and how conformed models fix it.' },
      { href: '/blog/automated-data-reconciliation/', title: 'Automated Data Reconciliation', desc: 'Add count, key, and checksum controls so pipelines catch bad loads.' },
      { href: '/blog/signs-data-infrastructure-holding-back/', title: '5 Signs Your Infrastructure Is Holding You Back', desc: 'A practical audit for teams outgrowing their current data stack.' }
    ],
    field: {
      label: 'Field guide',
      title: 'How to design a data architecture that scales',
      intro: 'Architecture decisions are expensive to reverse. These are the choices that matter most, and the signals that tell you whether yours will hold up.',
      steps: [
        { h: 'Start from decisions, not tools', p: 'List the ten decisions the business needs to make and the freshness, accuracy, and latency each one requires. That list, not a vendor demo, determines whether you need streaming, a lakehouse, or a warehouse.' },
        { h: 'Define contracts between layers', p: 'Treat source, raw, modeled, and serving layers as separate products with owners. Schema contracts, freshness SLAs, and documented business keys stop small upstream changes from becoming company-wide incidents.' },
        { h: 'Model for reuse', p: 'Build conformed dimensions and a semantic layer so the same customer, order, and revenue definitions serve every dashboard. One pipeline per report is how a data team quietly becomes a reporting factory.' },
        { h: 'Put reconciliation in the pipeline', p: 'Check row counts, key coverage, checksums, and control totals on every load. When a number moves, you want the pipeline to tell you before a stakeholder does.' },
        { h: 'Design for change', p: 'Version schemas, use expand-and-contract migrations, and rehearse backfills. The architecture that survives is the one that can be changed safely on a Tuesday afternoon.' }
      ],
      table: {
        title: 'What good looks like',
        head: ['Decision', 'Healthy signal', 'Warning sign'],
        rows: [
          ['Layer ownership', 'Each layer has an owner and an SLA', 'One team owns everything'],
          ['Data contracts', 'Schema changes reviewed in CI', 'Dashboards discover the breakage'],
          ['Modeling', 'Conformed dimensions and a semantic layer', 'One pipeline per report'],
          ['Reconciliation', 'Automated count, key, and checksum checks', 'Manual checks after complaints']
        ]
      },
      pitfalls: [
        'Choosing a stack before agreeing on the decisions it supports.',
        'Centralizing every pipeline without publishing data products and owners.',
        'Treating backfills and schema migrations as exceptions rather than normal operations.'
      ],
      note: 'Need a starting point? Read the <a href="/blog/data-modeling-crisis/">data modeling guide</a> or see how <a href="/products/">4DAlert</a> builds reconciliation into the pipeline.'
    }
  },
  'business-intelligence-analytics': {
    name: 'Business Intelligence & Analytics',
    title: 'Business Intelligence & Analytics Guides | Performalytic',
    desc: 'Practical BI and analytics guides: define trusted metrics, build dashboards people use, choose the right BI platform, and drive data-driven decisions.',
    keywords: 'business intelligence guide, BI analytics, what is business intelligence, BI vs data analytics, semantic layer, dashboard best practices, choose BI platform, data-driven decision making, data-driven culture',
    heroMeta: '5 in-depth guides',
    startTitle: 'Building an analytics practice? Start here.',
    startIntro: 'Get the fundamentals right first: what BI is, how decisions actually change, then how to choose a platform without overbuying.',
    starts: [
      { href: '/blog/what-is-business-intelligence/', title: 'What Is Business Intelligence?', desc: 'A complete guide to BI, semantic layers, and the modern analytics stack.' },
      { href: '/blog/data-driven-decision-making/', title: 'Data-Driven Decision Making', desc: 'How to connect analytics to the decisions that move the business.' },
      { href: '/blog/choose-right-analytics-platform/', title: 'How to Choose an Analytics Platform', desc: 'A decision framework for enterprise leaders evaluating BI tools.' }
    ],
    field: {
      label: 'Field guide',
      title: 'How to build analytics people actually use',
      intro: 'Most analytics programs fail on adoption, not technology. This is the operating model behind dashboards that get opened and numbers that get trusted.',
      steps: [
        { h: 'Start with decisions and metrics', p: 'A dashboard is only useful if it changes what someone does. Name the decision, the metric, and the action it triggers before you design a single chart.' },
        { h: 'Define metrics once', p: 'Put the name, owner, formula, grain, and source in a semantic layer or metric store. If two teams calculate revenue differently, you do not have a data problem - you have a definition problem.' },
        { h: 'Design for the question', p: 'Lead with the number, then context, then detail. Progressive disclosure beats a wall of charts, especially on mobile.' },
        { h: 'Instrument adoption', p: 'Track weekly active viewers, time to answer core questions, and how often numbers are disputed. A dashboard nobody opens is a maintenance cost, not an asset.' },
        { h: 'Govern self-service with tiers', p: 'Certify the datasets that touch regulated or financial reporting, and let exploratory work run in a clearly labeled sandbox. Tiers prevent chaos without blocking curiosity.' }
      ],
      table: {
        title: 'What good looks like',
        head: ['Signal', 'Healthy', 'Warning sign'],
        rows: [
          ['Metric definition', 'One certified definition and owner', '"Revenue" differs by team'],
          ['Usage', 'Weekly active viewers and repeat visits', 'Launch spike, then silence'],
          ['Time to answer', 'Minutes for core questions', 'Recurring ad hoc SQL requests'],
          ['Trust', 'Freshness and ownership visible', 'Numbers debated in meetings']
        ]
      },
      pitfalls: [
        'Dashboard sprawl: more charts, less clarity.',
        'Vanity metrics with no decision attached.',
        'Self-service without certified datasets or ownership.'
      ],
      note: 'Go deeper with the <a href="/blog/data-quality-framework/">data quality framework</a>, or see how <a href="/bi-integration/">Performalytic BI integration</a> connects metrics to the systems that run the business.'
    }
  },
  'ai-machine-learning': {
    name: 'AI & Machine Learning',
    title: 'AI & Machine Learning Guides (2026) | Performalytic',
    desc: 'Practical AI and machine learning guides: take models to production, architect enterprise RAG, deploy AI agents, and govern AI responsibly.',
    keywords: 'AI and machine learning guide, enterprise RAG architecture, AI agents enterprise, MLOps guide, responsible AI framework, AI governance, production machine learning, AI in business intelligence, AI data quality',
    heroMeta: '5 in-depth guides',
    startTitle: 'Taking AI to production? Start here.',
    startIntro: 'Three guides that cover the path from architecture to operations: retrieval, agents, and the governance that makes them safe to deploy.',
    starts: [
      { href: '/blog/enterprise-rag-architecture/', title: 'Enterprise RAG Architecture', desc: 'Design retrieval-augmented generation that works on real enterprise content.' },
      { href: '/blog/ai-agents-enterprise/', title: 'AI Agents in the Enterprise', desc: 'From copilots to autonomous workflows, with the controls that matter.' },
      { href: '/blog/responsible-ai-framework/', title: 'Building a Responsible AI Framework', desc: 'Governance, evaluation, and compliance for production AI.' }
    ],
    field: {
      label: 'Field guide',
      title: 'How to take AI from pilot to production',
      intro: 'The hard part of enterprise AI is not the model. It is the data, evaluation, operations, and ownership around it. Use this checklist before you scale a pilot.',
      steps: [
        { h: 'Pick a decision with a measurable outcome', p: 'Start with a workflow where better predictions or faster answers change cost, revenue, or risk. A demo that impresses is not the same as a system that earns its keep.' },
        { h: 'Treat data as part of the model', p: 'Training and retrieval data need versioning, permissions, lineage, and quality checks. Most production AI failures are data failures wearing a model costume.' },
        { h: 'Evaluate before and after deployment', p: 'Build a labelled evaluation set and a regression suite before launch, then monitor quality, latency, cost, and drift in production. A handful of demo prompts is not an evaluation.' },
        { h: 'Design for failure and human review', p: 'Set confidence thresholds, fallbacks, and audit logs. High-stakes actions should pause for a human rather than fail silently.' },
        { h: 'Govern the system, not just the model', p: 'Record data sources, prompts, model versions, owners, and incident history. When an answer is wrong, you need to reconstruct why.' }
      ],
      table: {
        title: 'What good looks like',
        head: ['Signal', 'Production-ready', 'Pilot-only'],
        rows: [
          ['Evaluation', 'Labelled set and regression suite', 'Ten ad hoc prompts'],
          ['Data', 'Versioned, permissioned, monitored', 'Copied spreadsheets'],
          ['Monitoring', 'Quality, drift, latency, and cost', 'Uptime only'],
          ['Governance', 'Owners, audit trail, review', 'No record of changes']
        ]
      },
      pitfalls: [
        'Model-first projects without a business decision attached.',
        'No evaluation set, so quality is judged by anecdotes.',
        'Unclear ownership when an answer or action goes wrong.'
      ],
      note: 'See how governed master data feeds AI in the <a href="/blog/ai-master-data-management/">AI-based MDM guide</a>, or explore <a href="/advanced-analytics-ai/">Performalytic AI services</a>.'
    }
  },
  'data-governance-quality': {
    name: 'Data Governance & Quality',
    title: 'Data Governance & Quality Guides (2026) | Performalytic',
    desc: 'Practical data governance and quality guides: build a quality framework, measure the cost of bad data, assign ownership, and earn trust in your data.',
    keywords: 'data governance guide, data quality framework, cost of bad data, data stewardship, data quality dimensions, data quality metrics, data ownership, governance operating model, master data governance',
    heroMeta: '8 in-depth guides',
    startTitle: 'Making data trustworthy? Start here.',
    startIntro: 'Begin with a practical quality framework, understand the cost of getting it wrong, then connect governance to the master data that AI and reporting depend on.',
    starts: [
      { href: '/blog/data-quality-framework/', title: 'Data Quality Framework', desc: 'A step-by-step model for defining, testing, and improving data quality.' },
      { href: '/blog/real-cost-of-bad-data/', title: 'The Real Cost of Bad Data', desc: 'How poor quality shows up in revenue, risk, and wasted engineering time.' },
      { href: '/blog/what-is-master-data-management/', title: 'What Is Master Data Management?', desc: 'How golden records and ownership keep critical entities consistent.' }
    ],
    field: {
      label: 'Field guide',
      title: 'How to make data governance and quality stick',
      intro: 'Governance fails when it lives in a policy document. It works when critical data has an owner, a test, and a route to resolution.',
      steps: [
        { h: 'Start with critical data elements', p: 'Tie governance to the reports, decisions, and regulatory obligations that matter. A catalogue of every column is not governance; a short list of critical elements with owners is.' },
        { h: 'Assign ownership at the data-product level', p: 'Give each critical dataset an accountable owner and a steward who can fix issues. Committees can set policy, but ownership is what changes behavior.' },
        { h: 'Define quality dimensions and thresholds', p: 'Be explicit about completeness, accuracy, timeliness, uniqueness, validity, and consistency. A threshold without an action is just a number.' },
        { h: 'Automate checks and route failures', p: 'Run tests at ingestion and in the warehouse, then send failures to the owner with context. Quality improves when fixing it is part of someone\'s week.' },
        { h: 'Report trust, not only defects', p: 'Publish scorecards, incident trends, and SLA performance. Leaders need to see whether trust is improving, not just how many tests failed.' }
      ],
      table: {
        title: 'Quality checks that earn their keep',
        head: ['Dimension', 'Test', 'Action'],
        rows: [
          ['Completeness', 'Null and blank rate', 'Block or alert above threshold'],
          ['Uniqueness', 'Duplicate business keys', 'Quarantine and resolve'],
          ['Validity', 'Range, format, reference checks', 'Reject at ingestion'],
          ['Timeliness', 'Freshness against SLA', 'Page the owner'],
          ['Consistency', 'Cross-system reconciliation', 'Open a discrepancy']
        ]
      },
      pitfalls: [
        'Policy without enforcement or an owner.',
        'Governance treated as a monthly committee instead of daily operations.',
        'Measuring everything and fixing nothing.'
      ],
      note: 'Start with the <a href="/blog/data-quality-framework/">data quality framework</a>, then see how <a href="/products/">4DAlert</a> monitors quality and reconciliation continuously.'
    }
  },
  'cloud-data-platforms': {
    name: 'Cloud Data Platforms',
    title: 'Cloud Data Platform Guides (2026) | Performalytic',
    desc: 'Choose and run cloud data platforms with confidence: Snowflake vs Databricks, migration planning, multi-cloud reconciliation, and cost control.',
    keywords: 'cloud data platform, Snowflake vs Databricks, choose cloud data platform, data platform migration, cloud data migration, multi-cloud data management, cloud data cost optimization, data lakehouse, Microsoft Fabric',
    heroMeta: '4 in-depth guides',
    startTitle: 'Choosing or migrating a platform? Start here.',
    startIntro: 'Compare the two most common lakehouse choices, use a decision framework for the wider market, then plan for the multi-cloud reality most enterprises end up in.',
    starts: [
      { href: '/blog/databricks-vs-snowflake/', title: 'Databricks vs Snowflake', desc: 'A complete 2026 comparison of architecture, cost, and fit.' },
      { href: '/blog/choose-right-analytics-platform/', title: 'How to Choose an Analytics Platform', desc: 'A leader\'s decision guide for evaluating platforms against real workloads.' },
      { href: '/blog/cross-cloud-data-reconciliation/', title: 'Multi-Cloud Data Reconciliation', desc: 'Keep data consistent when it lives in more than one cloud.' }
    ],
    field: {
      label: 'Field guide',
      title: 'How to choose and run a cloud data platform',
      intro: 'Platform choices are multi-year commitments. Evaluate them on workload fit, total cost, governance, and your ability to operate them - not on a polished demo.',
      steps: [
        { h: 'Match the platform to workloads', p: 'Separate BI, streaming, data science, and operational workloads, then check concurrency, latency, governance, and ecosystem fit. The best platform is the one that fits the work you actually run.' },
        { h: 'Model total cost', p: 'Include storage, compute, egress, seats, migration, and operations. A cheaper per-query price can lose to a platform that forces constant re-engineering.' },
        { h: 'Prove it with a production-shaped pilot', p: 'Use real volume, real concurrency, real security policies, and a real failure. Demos rarely include the awkward queries that decide the bill.' },
        { h: 'Migrate in waves', p: 'Inventory dependencies, dual-run critical pipelines, validate reconciliation, then cut over and decommission. Big-bang migrations turn a technical project into an outage.' },
        { h: 'Operate with guardrails', p: 'Set budgets, isolate workloads, tag spend, and alert on anomalies. Cost control is an operating model, not a monthly spreadsheet review.' }
      ],
      table: {
        title: 'What good looks like',
        head: ['Requirement', 'Ask', 'Why it matters'],
        rows: [
          ['Workload fit', 'Concurrency, latency, ML support', 'Avoids re-platforming in year two'],
          ['Cost visibility', 'Showback by team or workload', 'Prevents surprise bills'],
          ['Governance', 'Lineage, access, residency', 'Closes audit gaps'],
          ['Portability', 'Open formats and export paths', 'Keeps negotiating leverage']
        ]
      },
      pitfalls: [
        'Choosing a platform from a demo instead of a production-shaped pilot.',
        'Ignoring egress, seats, and operations in the cost model.',
        'No owner for spend, so costs grow without accountability.'
      ],
      note: 'Read the <a href="/blog/databricks-vs-snowflake/">Snowflake vs Databricks comparison</a>, or see <a href="/products/">4DAlert</a> for cross-platform reconciliation.'
    }
  },
  'dataops-devops': {
    name: 'DataOps & DevOps',
    title: 'DataOps & DevOps Guides (2026) | Performalytic',
    desc: 'DataOps and DevOps guides for data teams: automate pipelines, test schema changes, prevent drift, and keep data accurate with continuous reconciliation.',
    keywords: 'DataOps guide, CI/CD for data, database CI/CD, schema compare, schema compare tools, schema drift, database change management, data reconciliation, automated data reconciliation, data observability',
    heroMeta: '12 in-depth guides',
    startTitle: 'Bringing CI/CD to data? Start here.',
    startIntro: 'Build the foundation in this order: reconcile what you have, catch schema changes before production, then automate the deployment path.',
    starts: [
      { href: '/blog/data-reconciliation-guide/', title: 'Data Reconciliation: The Complete Guide', desc: 'Why reconciliation matters and how to design controls that scale.' },
      { href: '/blog/schema-compare-guide/', title: 'Schema Compare Guide', desc: 'Catch breaking schema changes before they reach production.' },
      { href: '/blog/database-ci-cd-pipeline/', title: 'Database CI/CD', desc: 'How to build a repeatable schema change pipeline.' }
    ],
    field: {
      label: 'Field guide',
      title: 'How to build a reliable DataOps workflow',
      intro: 'Data teams ship code and data. If only the code is tested, the numbers are still a gamble. These controls make change safe and repeatable.',
      steps: [
        { h: 'Version everything', p: 'Code, schema, configuration, and transformation logic belong in Git. If a pipeline can only be changed on one laptop, it is not a pipeline - it is a liability.' },
        { h: 'Automate the path to production', p: 'Run tests, reviews, and staged deployments in CI. The goal is a repeatable change, not a heroic release.' },
        { h: 'Test data and schema', p: 'Check contracts, freshness, volume, distribution, and reconciliation, not just whether the job exited zero. A green pipeline can still publish wrong numbers.' },
        { h: 'Make changes reversible', p: 'Use expand-and-contract migrations, tested backfills, and documented rollback plans. Safe change is the whole point of DataOps.' },
        { h: 'Observe production', p: 'Track SLAs, failed checks, drift, and on-call load. Alert on symptoms that matter, or the team will learn to ignore the pager.' }
      ],
      table: {
        title: 'What good looks like',
        head: ['Control', 'Mature', 'Fragile'],
        rows: [
          ['Schema change', 'Reviewed in CI, expand/contract', 'Manual ALTER in production'],
          ['Testing', 'Automated data and schema checks', '"It ran"'],
          ['Deployment', 'Repeatable and documented', 'One engineer\'s laptop'],
          ['Recovery', 'Rollback and backfill rehearsed', 'Restore from backup']
        ]
      },
      pitfalls: [
        'CI for application code but not for data.',
        'No ownership when a pipeline fails at 2 a.m.',
        'Alert fatigue from checks nobody acts on.'
      ],
      note: 'Go deeper with the <a href="/blog/automated-data-reconciliation/">automated reconciliation guide</a>, or see how <a href="/products/">4DAlert</a> handles schema compare and reconciliation.'
    }
  },
  'master-data-management': {
    name: 'Master Data Management',
    title: 'Master Data Management (MDM) Guides (2026) | Performalytic',
    desc: 'Practical MDM guides: how golden records and entity resolution work, implementation patterns, platform comparisons, and AI-based master data management.',
    keywords: 'master data management, MDM guide, what is MDM, golden record, entity resolution, AI entity resolution, MDM implementation patterns, registry vs consolidation, customer 360, product 360, survivorship, MDM software',
    heroMeta: '6 in-depth guides',
    startTitle: 'New to MDM? Read these three guides first.',
    startIntro: 'Understand the discipline, then the matching engine behind it, then the implementation pattern that fits your organization.',
    starts: [
      { href: '/blog/what-is-master-data-management/', title: 'What Is Master Data Management?', desc: 'The complete guide to MDM, golden records, and why it matters.' },
      { href: '/blog/entity-resolution-ai/', title: 'AI Entity Resolution', desc: 'How deterministic, probabilistic, and machine-learned matching work together.' },
      { href: '/blog/mdm-implementation-patterns/', title: 'MDM Implementation Patterns', desc: 'Registry, consolidation, and coexistence - when to use each.' }
    ],
    field: {
      label: 'Field guide',
      title: 'How to run an MDM program that survives go-live',
      intro: 'MDM is not a cleanup project. It is an operating capability for keeping entities consistent as systems and data change. Start narrow and verify continuously.',
      steps: [
        { h: 'Choose one domain and a measurable problem', p: 'Duplicate customers, inconsistent products, or vendors paid twice are good starts because the cost is visible. Boiling the ocean is the fastest way to stall.' },
        { h: 'Define the entity model and match keys', p: 'Document source systems, attributes, business keys, and survivorship rules before tuning algorithms. Matching is only as good as the definition of the entity.' },
        { h: 'Match in stages', p: 'Use deterministic keys first, then probabilistic and machine-learned matching. Track precision and recall, and route uncertain matches to stewards instead of guessing.' },
        { h: 'Design stewardship by exception', p: 'A review queue should contain the hard cases, not every record. Good confidence scoring is what makes stewardship affordable.' },
        { h: 'Verify continuously', p: 'Reconcile golden records back to sources after go-live. MDM is an operating capability, not a one-time cleanse.' }
      ],
      table: {
        title: 'What good looks like',
        head: ['Capability', 'Good', 'Weak'],
        rows: [
          ['Matching', 'Precision and recall measured', 'Rules never evaluated'],
          ['Golden record', 'Survivorship per attribute', 'Newest record always wins'],
          ['Stewardship', 'Review by exception', 'Manual dedupe'],
          ['Verification', 'Continuous reconciliation', 'One-time cleanup']
        ]
      },
      pitfalls: [
        'Boiling the ocean across every domain at once.',
        'Treating MDM as a project with an end date.',
        'No business owner, so stewardship becomes an IT side task.'
      ],
      note: 'Compare approaches in <a href="/blog/4dalert-vs-legacy-mdm/">4DAlert vs legacy MDM</a>, or see the <a href="/products/">4DAlert product overview</a>.'
    }
  }
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function mustReplace(html, re, replacement, label) {
  if (typeof re === 'string') {
    if (!html.includes(re)) throw new Error('No match: ' + label);
    return html.split(re).join(replacement);
  }
  if (!re.test(html)) throw new Error('No match: ' + label);
  return html.replace(re, replacement);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function metaKeywords(html) {
  if (/<meta name="keywords" content="[^"]*"\s*\/?>/.test(html)) return true;
  return false;
}

function startBlock(cat) {
  const steps = cat.starts.map((s, i) => `        <li>
          <a href="${s.href}">
            <span class="kh-start-num" aria-hidden="true">${i + 1}</span>
            <span class="kh-start-body"><strong>${esc(s.title)}</strong><span>${esc(s.desc)}</span></span>
          </a>
        </li>`).join('\n');
  return `<!-- kh:start -->
<section class="kh-start" aria-label="Start here">
  <div class="container">
    <div class="kh-start-card reveal">
      <div class="kh-start-lead">
        <span class="section-label">Start here</span>
        <h2>${esc(cat.startTitle)}</h2>
        <p>${esc(cat.startIntro)}</p>
      </div>
      <ol class="kh-start-steps">
${steps}
      </ol>
    </div>
  </div>
</section>
<!-- /kh:start -->`;
}

function fieldBlock(cat) {
  const f = cat.field;
  const steps = f.steps.map((s, i) => `        <li>
          <span class="kh-step-num" aria-hidden="true">${i + 1}</span>
          <div><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div>
        </li>`).join('\n');
  const head = f.table.head.map(h => `<th scope="col">${esc(h)}</th>`).join('');
  const rows = f.table.rows.map(r => `            <tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('\n');
  const pitfalls = f.pitfalls.map(p => `          <li>${esc(p)}</li>`).join('\n');
  return `<!-- kh:field -->
<section class="kh-field" aria-label="${esc(f.title)}">
  <div class="container">
    <div class="text-center reveal">
      <span class="section-label">${esc(f.label)}</span>
      <h2 class="section-title">${esc(f.title)}</h2>
      <p class="section-subtitle mx-auto">${esc(f.intro)}</p>
    </div>
    <div class="kh-field-grid">
      <ol class="kh-steps">
${steps}
      </ol>
      <aside class="kh-field-aside">
        <div class="kh-aside-card">
          <h3>${esc(f.table.title)}</h3>
          <div class="kh-table-wrap">
            <table class="kh-table">
              <thead><tr>${head}</tr></thead>
              <tbody>
${rows}
              </tbody>
            </table>
          </div>
        </div>
        <div class="kh-aside-card">
          <h3>Common pitfalls</h3>
          <ul class="kh-pitfalls">
${pitfalls}
          </ul>
        </div>
        <p class="kh-field-note">${f.note}</p>
      </aside>
    </div>
  </div>
</section>
<!-- /kh:field -->`;
}

function heroMeta(cat, html) {
  const guides = (html.match(/class="article-row/g) || []).length;
  const concepts = (html.match(/class="kh-concept"/g) || []).length;
  return `        <div class="kh-hero-meta">
          <span><strong>${guides}</strong> in-depth guides</span>
          <span class="dot" aria-hidden="true"></span>
          <span><strong>${concepts}</strong> key concepts</span>
          <span class="dot" aria-hidden="true"></span>
          <span>Reviewed <strong>${HUMAN}</strong></span>
          <span class="dot" aria-hidden="true"></span>
          <span><a href="/editorial-policy/">Editorial standards</a></span>
        </div>`;
}

/* ------------------------------------------------------------------ */
/* 1. Upgrade each topic page                                          */
/* ------------------------------------------------------------------ */
for (const [slug, cat] of Object.entries(CATS)) {
  const file = path.join(ROOT, 'knowledge', slug, 'index.html');
  let html = read(file);
  const alreadyUpgraded = html.includes('id="kh-v2-css"');

  html = mustReplace(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(cat.title)}</title>`, slug + ' title');
  html = mustReplace(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(cat.desc)}" />`, slug + ' description');
  if (metaKeywords(html)) {
    html = mustReplace(html, /<meta name="keywords" content="[^"]*"\s*\/?>/, `<meta name="keywords" content="${esc(cat.keywords)}" />`, slug + ' keywords');
  } else {
    html = html.replace(/(<meta name="description" content="[^"]*"\s*\/?>)/, `$1\n<meta name="keywords" content="${esc(cat.keywords)}" />`);
  }
  html = mustReplace(html, /<meta property="article:modified_time" content="[^"]*"\s*\/?>/, `<meta property="article:modified_time" content="${TODAY}T00:00:00+00:00" />`, slug + ' modified');
  html = mustReplace(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(cat.title)}" />`, slug + ' og title');
  html = mustReplace(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(cat.desc)}" />`, slug + ' og desc');
  html = mustReplace(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(cat.title)}" />`, slug + ' twitter title');
  html = mustReplace(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(cat.desc)}" />`, slug + ' twitter desc');

  html = mapJsonLd(html, data => {
    const graph = Array.isArray(data) ? data : (data['@graph'] || [data]);
    for (const node of graph) {
      if (node && (node['@type'] === 'CollectionPage' || node['@type'] === 'WebPage' || node['@type'] === 'Article')) {
        node.dateModified = TODAY;
      }
      if (node && node['@type'] === 'CollectionPage') {
        node.name = `${cat.name} Guides | Performalytic Knowledge Hub`;
        node.description = cat.desc;
      }
    }
    return data;
  });

  if (alreadyUpgraded) {
    write(file, html);
    console.log('metadata refreshed:', slug);
    continue;
  }

  // Shared CSS + class hook on body.
  html = html.replace('</head>', `<style id="kh-v2-css" nonce="${NONCE}">${BASE_CSS}</style>\n</head>`);
  html = html.replace('<body>', '<body class="kh-v2">');

  // Hero meta strip.
  html = mustReplace(
    html,
    /(<div class="hero-btns">[\s\S]*?<\/div>)/,
    `$1\n${heroMeta(cat, html)}`,
    slug + ' hero meta'
  );

  // Start-here block after the hero.
  const heroStart = html.indexOf('<section class="hero">');
  if (heroStart === -1) throw new Error('hero not found: ' + slug);
  const heroEnd = html.indexOf('</section>', heroStart);
  if (heroEnd === -1) throw new Error('hero end not found: ' + slug);
  html = html.slice(0, heroEnd + '</section>'.length) + '\n\n' + startBlock(cat) + html.slice(heroEnd + '</section>'.length);

  // Field guide before the key-concepts section.
  if (html.includes('<!-- kh:concepts -->')) {
    html = html.replace('<!-- kh:concepts -->', fieldBlock(cat) + '\n\n<!-- kh:concepts -->');
  } else {
    html = html.replace('<!-- kh:faq -->', fieldBlock(cat) + '\n\n<!-- kh:faq -->');
  }

  // Refresh schema dates.
  html = mapJsonLd(html, data => {
    const graph = Array.isArray(data) ? data : (data['@graph'] || [data]);
    for (const node of graph) {
      if (node && (node['@type'] === 'CollectionPage' || node['@type'] === 'WebPage' || node['@type'] === 'Article')) {
        node.dateModified = TODAY;
      }
      if (node && node['@type'] === 'CollectionPage') {
        node.name = `${cat.name} Guides | Performalytic Knowledge Hub`;
        node.description = cat.desc;
      }
    }
    return data;
  });

  write(file, html);
  console.log('upgraded:', slug);
}

/* ------------------------------------------------------------------ */
/* 2. Upgrade the Knowledge Hub index                                  */
/* ------------------------------------------------------------------ */
(function upgradeHub() {
  const file = path.join(ROOT, 'knowledge', 'index.html');
  let html = read(file);
  const alreadyUpgraded = html.includes('id="kh-v2-css"');

  const title = 'Knowledge Hub: Data, Analytics & AI Guides | Performalytic';
  const desc = 'Free, practical guides on data architecture, analytics, AI, governance, cloud platforms, DataOps, and master data management - written by practitioners.';
  const keywords = 'data analytics knowledge hub, data engineering guides, business intelligence guides, AI machine learning guides, data governance resources, cloud data platform guides, DataOps guides, master data management guides';

  html = mustReplace(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`, 'hub title');
  html = mustReplace(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(desc)}" />`, 'hub description');
  html = mustReplace(html, /<meta name="keywords" content="[^"]*"\s*\/?>/, `<meta name="keywords" content="${esc(keywords)}" />`, 'hub keywords');
  html = mustReplace(html, /<meta property="article:modified_time" content="[^"]*"\s*\/?>/, `<meta property="article:modified_time" content="${TODAY}T00:00:00+00:00" />`, 'hub modified');
  html = mustReplace(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(title)}" />`, 'hub og title');
  html = mustReplace(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(desc)}" />`, 'hub og desc');
  html = mustReplace(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(title)}" />`, 'hub twitter title');
  html = mustReplace(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(desc)}" />`, 'hub twitter desc');

  html = mapJsonLd(html, data => {
    const graph = Array.isArray(data) ? data : (data['@graph'] || [data]);
    for (const node of graph) {
      if (node && (node['@type'] === 'CollectionPage' || node['@type'] === 'WebPage')) node.dateModified = TODAY;
      if (node && node['@type'] === 'CollectionPage') node.description = desc;
    }
    return data;
  });

  if (alreadyUpgraded) {
    write(file, html);
    console.log('metadata refreshed: knowledge hub');
    return;
  }

  html = html.replace('</head>', `<style id="kh-v2-css" nonce="${NONCE}">${BASE_CSS}${INDEX_CSS}</style>\n</head>`);
  html = html.replace('<body>', '<body class="kh-v2">');

  // Hero heading, copy, stats, and search.
  html = mustReplace(
    html,
    /<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/,
    `<h1>The Knowledge Hub for <span class="gradient-text">Data, Analytics &amp; AI</span></h1>
        <p>Practical, no-fluff guides written by the engineers, analysts, and architects at Performalytic. Learn how to design data platforms, build analytics people trust, ship AI to production, and keep master data clean - with frameworks you can apply this week.</p>`,
    'hub hero copy'
  );

  const heroSearch = `
        <div class="kh-hero-stats" aria-label="Knowledge hub at a glance">
          <span class="kh-hero-stat"><strong>7</strong> topic hubs</span>
          <span class="kh-hero-stat"><strong>32</strong> in-depth guides</span>
          <span class="kh-hero-stat"><strong>6</strong> key-concept sections</span>
          <span class="kh-hero-stat"><strong>Free</strong> no sign-up</span>
        </div>
        <div class="kh-search">
          <label for="kh-hero-search">Search the Knowledge Hub</label>
          <form class="kh-search-form" id="kh-hero-search-form" role="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input type="search" id="kh-hero-search" name="q" placeholder="Search guides, e.g. RAG, schema drift, golden record" autocomplete="off" aria-label="Search the Knowledge Hub" />
            <button type="submit">Search</button>
          </form>
          <div class="kh-suggest" aria-label="Popular searches">
            <span>Popular:</span>
            <button type="button" data-q="data quality">data quality</button>
            <button type="button" data-q="RAG">RAG</button>
            <button type="button" data-q="Snowflake">Snowflake</button>
            <button type="button" data-q="schema drift">schema drift</button>
            <button type="button" data-q="golden record">golden record</button>
          </div>
        </div>`;
  html = mustReplace(
    html,
    /(<div class="hero-btns">[\s\S]*?<\/div>)/,
    `$1\n${heroSearch}`,
    'hub hero search'
  );

  // Featured guides: point at the best actual article in each topic.
  const featured = `<div class="featured-grid">
      <article class="featured-card reveal">
        <div class="featured-img">
          <img src="/assets/images/svg/knowledge-architecture.svg" alt="Data architecture illustration" width="680" height="680" loading="lazy" decoding="async" />
        </div>
        <div class="featured-body">
          <span class="featured-tag">Architecture</span>
          <h3><a href="/blog/data-modeling-crisis/" style="text-decoration:none;color:inherit">The Data Modeling Crisis: Why Teams Struggle with Semantics</a></h3>
          <p>When every team models revenue differently, dashboards disagree and trust collapses. This guide explains the semantic problem and the modeling patterns that fix it.</p>
          <a href="/blog/data-modeling-crisis/" class="featured-link">Read the guide <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
        </div>
      </article>
      <article class="featured-card reveal">
        <div class="featured-img">
          <img src="/assets/images/svg/knowledge-ai.svg" alt="AI and machine learning illustration" width="680" height="680" loading="lazy" decoding="async" />
        </div>
        <div class="featured-body">
          <span class="featured-tag">AI &amp; ML</span>
          <h3><a href="/blog/enterprise-rag-architecture/" style="text-decoration:none;color:inherit">Enterprise RAG Architecture: A Practical Guide for 2026</a></h3>
          <p>Retrieval-augmented generation only works when retrieval, permissions, evaluation, and freshness are designed together. Here is the architecture we use in production.</p>
          <a href="/blog/enterprise-rag-architecture/" class="featured-link">Read the guide <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
        </div>
      </article>
      <article class="featured-card reveal">
        <div class="featured-img">
          <img src="/assets/images/svg/knowledge-governance.svg" alt="Data governance illustration" width="680" height="680" loading="lazy" decoding="async" />
        </div>
        <div class="featured-body">
          <span class="featured-tag">Governance</span>
          <h3><a href="/blog/data-quality-framework/" style="text-decoration:none;color:inherit">Data Quality Framework: A Step-by-Step Guide to Building Trust</a></h3>
          <p>Quality is not a dashboard you buy. It is a set of definitions, tests, owners, and routines. This framework shows how to build all four without slowing delivery.</p>
          <a href="/blog/data-quality-framework/" class="featured-link">Read the guide <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
        </div>
      </article>
    </div>`;
  html = mustReplace(html, /<div class="featured-grid">[\s\S]*?\r?\n    <\/div>\r?\n  <\/div>\r?\n<\/section>/, featured + '\n  </div>\n</section>', 'hub featured');

  // Correct category counts.
  for (const [slug, cat] of Object.entries(CATS)) {
    const countMatch = html.match(new RegExp(`(<a href="/knowledge/${slug}/" class="category-card reveal">[\\s\\S]*?<span class="category-count">)(\\d+)( articles<\\/span>)`));
    const actual = (read(path.join(ROOT, 'knowledge', slug, 'index.html')).match(/class="article-row/g) || []).length;
    if (countMatch) {
      html = html.replace(countMatch[0], `${countMatch[1]}${actual}${countMatch[3]}`);
    }
  }

  // Build the guide library from the topic pages so it never drifts.
  const libCards = [];
  const filters = ['<button type="button" class="kh-lib-filter" data-topic="all" aria-pressed="true">All topics</button>'];
  for (const [slug, cat] of Object.entries(CATS)) {
    const topicHtml = read(path.join(ROOT, 'knowledge', slug, 'index.html'));
    const items = [];
    const rowRe = /<a href="([^"]+)" class="article-row[^"]*">[\s\S]*?<h3>([\s\S]*?)<\/h3>[\s\S]*?<p>([\s\S]*?)<\/p>/g;
    let m;
    while ((m = rowRe.exec(topicHtml)) && items.length < 3) {
      const clean = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      items.push({ href: m[1], title: clean(m[2]), desc: clean(m[3]) });
    }
    const allCount = (topicHtml.match(/class="article-row/g) || []).length;
    const links = items.map(it => `          <li><a href="${it.href}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg><span>${esc(it.title)}</span></a></li>`).join('\n');
    libCards.push(`      <article class="kh-lib-card" data-topic="${slug}">
        <h3><a href="/knowledge/${slug}/">${esc(cat.name)}</a></h3>
        <p>${esc(cat.desc.split(':')[0])}: ${allCount} in-depth guides, plus definitions and answers to common questions.</p>
        <ul class="kh-lib-list">
${links}
        </ul>
        <a href="/knowledge/${slug}/" class="kh-lib-more">View all ${allCount} ${esc(cat.name)} guides <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
      </article>`);
    filters.push(`<button type="button" class="kh-lib-filter" data-topic="${slug}" aria-pressed="false">${esc(cat.name)}</button>`);
  }

  const library = `<!-- kh:library -->
<section class="kh-library" id="library" aria-label="Browse all knowledge hub guides">
  <div class="container">
    <div class="text-center reveal">
      <span class="section-label">The Library</span>
      <h2 class="section-title">Browse every guide by topic</h2>
      <p class="section-subtitle mx-auto">Search 32 in-depth guides across seven topics, or filter to the area you are working on right now.</p>
    </div>
    <div class="kh-lib-toolbar">
      <div class="kh-search kh-lib-search">
        <label for="kh-search-input" class="sr-only">Search all guides</label>
        <form class="kh-search-form" id="kh-lib-search-form" role="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" id="kh-search-input" placeholder="Search all 32 guides..." autocomplete="off" aria-controls="kh-library-grid" />
        </form>
      </div>
      <div class="kh-lib-filters" role="group" aria-label="Filter guides by topic">
        ${filters.join('\n        ')}
      </div>
      <p class="kh-search-status" id="kh-search-status" role="status" aria-live="polite"></p>
    </div>
    <div class="kh-lib-grid" id="kh-library-grid">
${libCards.join('\n')}
      <p class="kh-empty" id="kh-empty" hidden>No guides match that search. Try a broader term like “quality”, “AI”, or “schema”.</p>
    </div>
  </div>
</section>
<!-- /kh:library -->`;

  html = mustReplace(html, '<!-- ========== QUICK WINS ========== -->', library + '\n\n<!-- ========== QUICK WINS ========== -->', 'hub library');

  // Glossary: plain-English definitions, each linking to the deeper topic.
  const terms = [
    ['Data architecture', 'The blueprint for how data is ingested, stored, modeled, governed, and served. Good architecture makes change safe; bad architecture makes every new report a project.', '/knowledge/data-architecture-engineering/'],
    ['Business intelligence', 'The practice of turning data into governed metrics, dashboards, and self-service analysis that people use to make decisions.', '/knowledge/business-intelligence-analytics/'],
    ['Data governance', 'The ownership, policies, and controls that determine who can use data, how it is protected, and what quality standards apply.', '/knowledge/data-governance-quality/'],
    ['Data quality', 'The measurable fitness of data for a purpose, usually assessed across completeness, accuracy, timeliness, uniqueness, validity, and consistency.', '/knowledge/data-governance-quality/'],
    ['Data lakehouse', 'An architecture that combines low-cost object storage with warehouse-style tables, transactions, and governance so BI and machine learning can share one copy of data.', '/knowledge/data-architecture-engineering/'],
    ['Master data management', 'A discipline for creating one trusted, continuously verified record for each customer, product, supplier, and location across systems.', '/knowledge/master-data-management/'],
    ['Golden record', 'The most accurate and complete version of an entity, assembled from matched records and survivorship rules that choose the best value per attribute.', '/knowledge/master-data-management/#golden-record'],
    ['Entity resolution', 'The process of deciding which records refer to the same real-world entity, then merging them without losing provenance.', '/knowledge/master-data-management/#entity-resolution'],
    ['Retrieval-augmented generation (RAG)', 'A pattern that gives a language model relevant, permissioned context at answer time instead of relying only on what it learned during training.', '/knowledge/ai-machine-learning/'],
    ['DataOps', 'The application of version control, CI/CD, testing, observability, and ownership to data pipelines and database changes.', '/knowledge/dataops-devops/']
  ];
  const glossary = `<!-- kh:glossary -->
<section class="kh-glossary" id="glossary" aria-label="Data terms explained">
  <div class="container">
    <div class="text-center reveal">
      <span class="section-label">Glossary</span>
      <h2 class="section-title">Data terms, explained plainly</h2>
      <p class="section-subtitle mx-auto">The concepts that come up across every topic - short definitions, with a path to the full guide.</p>
    </div>
    <dl class="kh-glossary-grid">
${terms.map(([t, d, href]) => `      <div class="kh-term"><dt>${esc(t)}</dt><dd>${esc(d)} <a href="${href}">Go deeper &rarr;</a></dd></div>`).join('\n')}
    </dl>
  </div>
</section>
<!-- /kh:glossary -->`;
  html = mustReplace(html, '<!-- kh:faq -->', glossary + '\n\n<!-- kh:faq -->', 'hub glossary');

  // Extra FAQs targeting question searches.
  const faq = `
      <details>
        <summary>What is the difference between data analytics and business intelligence?</summary>
        <div class="kh-answer"><p>Business intelligence usually refers to the platforms, semantic models, and dashboards that describe what happened. Data analytics is the broader practice of exploring data to explain why it happened and predict what comes next. The <a href="/knowledge/business-intelligence-analytics/">BI &amp; Analytics topic</a> covers both, including metric definitions, semantic layers, and platform selection.</p></div>
      </details>
      <details>
        <summary>How do I choose a cloud data platform?</summary>
        <div class="kh-answer"><p>Start with workloads, concurrency, governance, and total cost - not a vendor demo. Compare Snowflake, Databricks, BigQuery, and Microsoft Fabric against a production-shaped pilot. The <a href="/knowledge/cloud-data-platforms/">Cloud Data Platforms guides</a> include a <a href="/blog/databricks-vs-snowflake/">Snowflake vs Databricks comparison</a> and a platform selection framework.</p></div>
      </details>
      <details>
        <summary>What are the most important data and AI trends for 2026?</summary>
        <div class="kh-answer"><p>Three themes dominate our client work: AI systems that depend on governed, deduplicated data; DataOps practices that make change safe; and platform consolidation driven by cost. The <a href="/knowledge/ai-machine-learning/">AI &amp; Machine Learning</a> and <a href="/knowledge/dataops-devops/">DataOps</a> topic pages go deeper, and the <a href="/blog/ai-master-data-management/">AI-based MDM guide</a> connects the first two.</p></div>
      </details>
      <details>
        <summary>How often is the Knowledge Hub updated?</summary>
        <div class="kh-answer"><p>Guides are reviewed at least monthly and updated when platforms, practices, or our own client experience change. This hub was last reviewed in <strong>November 2026</strong>. Our <a href="/editorial-policy/">editorial policy</a> explains how guides are written, reviewed, and corrected.</p></div>
      </details>`;
  const faqEnd = html.indexOf('<!-- /kh:faq -->');
  if (faqEnd === -1) throw new Error('faq marker not found');
  const lastDetails = html.lastIndexOf('</details>', faqEnd);
  html = html.slice(0, lastDetails + '</details>'.length) + faq + html.slice(lastDetails + '</details>'.length);

  // Stronger author / editorial section.
  const about = `<!-- kh:about -->
<section class="kh-about" aria-label="About Performalytic and 4DAlert">
  <div class="container">
    <div class="kh-about-card">
      <h2>Who writes these guides</h2>
      <p>The Knowledge Hub is written and reviewed by the data engineers, architects, analysts, and AI practitioners at <a href="https://performalytic.com/">Performalytic</a> - an enterprise data analytics, AI, and DevOps consulting firm headquartered in Chicago, Illinois, with a global delivery center in Bhubaneswar, India.</p>
      <p>Every guide is based on client delivery work, not content farms. We name our authors, date our reviews, and correct errors in public. Read our <a href="/editorial-policy/">editorial policy</a>, meet the <a href="/authors/">authors</a>, or see how we handle <a href="/security/">security and compliance</a>.</p>
      <p>Performalytic also builds <a href="https://4dalert.com" target="_blank" rel="noopener">4DAlert</a>, an AI-powered data management platform for automated data reconciliation, data quality and observability, master data management, schema compare, and CI/CD for data.</p>
      <div class="kh-about-links">
        <a href="https://4dalert.com" class="btn-primary" target="_blank" rel="noopener">Explore 4DAlert &rarr;</a>
        <a href="/products/" class="btn-secondary">4DAlert product overview</a>
        <a href="/editorial-policy/" class="btn-secondary">Editorial policy</a>
        <a href="/contact/" class="btn-secondary">Talk to Performalytic</a>
      </div>
    </div>
  </div>
</section>
<!-- /kh:about -->`;
  const aboutStart = html.indexOf('<!-- kh:about -->');
  const aboutEnd = html.indexOf('<!-- /kh:about -->');
  if (aboutStart === -1 || aboutEnd === -1) throw new Error('about markers not found');
  html = html.slice(0, aboutStart) + about + html.slice(aboutEnd + '<!-- /kh:about -->'.length);

  // Search + filter behaviour.
  const js = `
<script nonce="${NONCE}">
(function(){
  'use strict';
  var lib=document.getElementById('library');
  var input=document.getElementById('kh-search-input');
  var status=document.getElementById('kh-search-status');
  var empty=document.getElementById('kh-empty');
  if(!lib||!input)return;
  var cards=[].slice.call(lib.querySelectorAll('.kh-lib-card'));
  var filters=[].slice.call(lib.querySelectorAll('.kh-lib-filter'));

  function activeTopic(){
    for(var i=0;i<filters.length;i++){if(filters[i].getAttribute('aria-pressed')==='true')return filters[i].getAttribute('data-topic');}
    return 'all';
  }
  function apply(){
    var q=(input.value||'').trim().toLowerCase();
    var topic=activeTopic();
    var visible=0;
    for(var c=0;c<cards.length;c++){
      var card=cards[c];
      var topicOk=topic==='all'||card.getAttribute('data-topic')===topic;
      var cardVisible=false;
      var links=card.querySelectorAll('.kh-lib-list li');
      for(var l=0;l<links.length;l++){
        var text=(links[l].textContent||'').toLowerCase();
        var ok=topicOk&&(!q||text.indexOf(q)>-1);
        links[l].hidden=!ok;
        if(ok){cardVisible=true;visible++;}
      }
      card.hidden=!cardVisible;
    }
    if(status)status.textContent=(q||topic!=='all')?(visible+' guide'+(visible===1?'':'s')+' found'):'';
    if(empty)empty.hidden=visible!==0;
  }
  input.addEventListener('input',apply);
  var libForm=document.getElementById('kh-lib-search-form');
  if(libForm){libForm.addEventListener('submit',function(e){e.preventDefault();});}
  for(var f=0;f<filters.length;f++){
    filters[f].addEventListener('click',function(){
      for(var i=0;i<filters.length;i++)filters[i].setAttribute('aria-pressed','false');
      this.setAttribute('aria-pressed','true');
      apply();
    });
  }

  var hero=document.getElementById('kh-hero-search');
  var heroForm=document.getElementById('kh-hero-search-form');
  function goToLibrary(q){
    input.value=q;
    apply();
    lib.scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(function(){input.focus({preventScroll:true});},350);
  }
  if(heroForm){
    heroForm.addEventListener('submit',function(e){
      e.preventDefault();
      goToLibrary((hero&&hero.value||'').trim());
    });
  }
  var chips=document.querySelectorAll('.kh-suggest button');
  for(var s=0;s<chips.length;s++){
    chips[s].addEventListener('click',function(){goToLibrary(this.getAttribute('data-q')||'');});
  }
})();
</script>`;
  html = html.replace('</body>', js + '\n</body>');

  // Schema: refresh dates, add FAQ entries, add glossary DefinedTermSet.
  html = mapJsonLd(html, data => {
    const graph = Array.isArray(data) ? data : (data['@graph'] || [data]);
    for (const node of graph) {
      if (node && (node['@type'] === 'CollectionPage' || node['@type'] === 'WebPage')) {
        node.dateModified = TODAY;
      }
      if (node && node['@type'] === 'CollectionPage') {
        node.description = desc;
      }
    }
    const faqPage = graph.find(n => n && n['@type'] === 'FAQPage');
    if (faqPage && Array.isArray(faqPage.mainEntity)) {
      const additions = [
        {
          '@type': 'Question',
          name: 'What is the difference between data analytics and business intelligence?',
          acceptedAnswer: { '@type': 'Answer', text: 'Business intelligence usually refers to the platforms, semantic models, and dashboards that describe what happened. Data analytics is the broader practice of exploring data to explain why it happened and predict what comes next. See the BI &amp; Analytics topic for metric definitions, semantic layers, and platform selection.' }
        },
        {
          '@type': 'Question',
          name: 'How do I choose a cloud data platform?',
          acceptedAnswer: { '@type': 'Answer', text: 'Start with workloads, concurrency, governance, and total cost rather than a vendor demo. Compare Snowflake, Databricks, BigQuery, and Microsoft Fabric against a production-shaped pilot. See the Cloud Data Platforms guides for a Snowflake vs Databricks comparison and a platform selection framework.' }
        },
        {
          '@type': 'Question',
          name: 'What are the most important data and AI trends for 2026?',
          acceptedAnswer: { '@type': 'Answer', text: 'Three themes dominate client work: AI systems that depend on governed, deduplicated data; DataOps practices that make change safe; and platform consolidation driven by cost. The AI &amp; Machine Learning and DataOps topic pages go deeper.' }
        },
        {
          '@type': 'Question',
          name: 'How often is the Knowledge Hub updated?',
          acceptedAnswer: { '@type': 'Answer', text: 'Guides are reviewed at least monthly and updated when platforms, practices, or client experience change. The hub was last reviewed in November 2026, and the editorial policy explains how guides are written, reviewed, and corrected.' }
        }
      ];
      for (const add of additions) {
        if (!faqPage.mainEntity.some(q => q.name === add.name)) faqPage.mainEntity.push(add);
      }
    }
    if (!graph.some(n => n && n['@type'] === 'DefinedTermSet')) {
      graph.push({
        '@type': 'DefinedTermSet',
        '@id': `${SITE}/knowledge/#glossary`,
        name: 'Data and analytics terms explained',
        hasDefinedTerm: terms.map(([t, d]) => ({ '@type': 'DefinedTerm', name: t, description: d }))
      });
    }
    return data;
  });

  write(file, html);
  console.log('upgraded: knowledge hub');
})();

/* ------------------------------------------------------------------ */
/* 3. Refresh sitemap lastmod for the Knowledge Hub only               */
/* ------------------------------------------------------------------ */
(function refreshSitemap() {
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
