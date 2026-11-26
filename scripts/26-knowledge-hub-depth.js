'use strict';
/*
 * 26-knowledge-hub-depth.js
 * Adds the second content layer to the Knowledge Hub:
 *  - topic pages: metrics, tooling landscape, worked example
 *  - hub: guided learning paths, latest guides, editorial method
 *
 * Idempotent via the `kh:depth` and `kh:paths` markers.
 * Run after 25-knowledge-hub.js.
 */
const fs = require('fs');
const path = require('path');
const { ROOT, SITE, read, write } = require('./lib');

const TODAY = '2026-11-19';
const NONCE = 'P3rf0rm4lyt1c';

const CSS = `
/* ============================================================
   Knowledge Hub v2 - depth layer
   ============================================================ */
.kh-depth{padding:72px 0 48px;background:linear-gradient(180deg,var(--pa-bg-2) 0%,var(--pa-bg) 100%)}
.kh-depth-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:36px}
.kh-depth-card{background:var(--pa-wb-002);border:1px solid var(--pa-wd-006);border-radius:18px;padding:26px;position:relative;overflow:hidden}
.kh-depth-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#2563eb,#7c3aed)}
.kh-depth-card h3{font-size:1rem;font-weight:800;color:var(--pa-t-strong);margin:0 0 6px;line-height:1.4}
.kh-depth-card>p{font-size:.83rem;color:var(--pa-t-muted);line-height:1.6;margin:0 0 16px}
.kh-depth-example{grid-column:1/-1}
.kh-depth-example p{font-size:.92rem;color:var(--pa-t-muted);line-height:1.75;margin:0 0 12px}
.kh-depth-example p:last-child{margin-bottom:0}
.kh-depth-example strong{color:var(--pa-t-strong)}
.kh-depth-note{font-size:.73rem;color:var(--pa-t-dim);line-height:1.55;margin:14px 0 0}
.kh-tools{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:11px}
.kh-tools div{display:grid;grid-template-columns:130px 1fr;gap:12px;align-items:start}
.kh-tools dt{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--pa-t-dim);line-height:1.5}
.kh-tools dd{font-size:.84rem;color:var(--pa-t-muted);line-height:1.55;margin:0}

.kh-paths{background:linear-gradient(180deg,var(--pa-bg) 0%,var(--pa-bg-2) 100%)}
.kh-path-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:36px}
.kh-path{background:var(--pa-wb-002);border:1px solid var(--pa-wd-006);border-radius:20px;padding:26px;display:flex;flex-direction:column;position:relative;overflow:hidden;transition:transform .3s,border-color .3s,background .3s}
.kh-path:hover{transform:translateY(-4px);border-color:rgba(96,165,250,.25);background:var(--pa-wb-004)}
.kh-path-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}
.kh-path-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(37,99,235,.12);border:1px solid rgba(37,99,235,.22);color:var(--pa-at-blue)}
.kh-path-icon svg{width:20px;height:20px}
.kh-path-time{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--pa-t-dim);background:var(--pa-wb-004);border:1px solid var(--pa-wd-006);padding:5px 10px;border-radius:100px;white-space:nowrap}
.kh-path h3{font-size:1.05rem;font-weight:800;color:var(--pa-t-strong);line-height:1.35;margin:0 0 7px}
.kh-path>p{font-size:.83rem;color:var(--pa-t-muted);line-height:1.6;margin:0 0 14px}
.kh-path ol{list-style:none;margin:0 0 16px;padding:0;display:flex;flex-direction:column;gap:2px;flex:1}
.kh-path ol a{display:flex;align-items:flex-start;gap:9px;padding:7px 0;font-size:.82rem;color:var(--pa-t-2);text-decoration:none;line-height:1.5;border-bottom:1px dashed var(--pa-wd-006);transition:color .2s,gap .2s}
.kh-path ol li:last-child a{border-bottom:none}
.kh-path ol a:hover{color:var(--pa-at-blue);gap:12px}
.kh-path ol .n{width:18px;height:18px;border-radius:6px;background:var(--pa-wb-006);color:var(--pa-at-blue);font-size:.66rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
.kh-path-out{font-size:.76rem;font-weight:600;color:var(--pa-t-muted);border-top:1px solid var(--pa-wd-006);padding-top:14px;line-height:1.55}
.kh-path-out strong{color:var(--pa-at-blue);font-weight:700}

.kh-latest{background:linear-gradient(180deg,var(--pa-bg-2) 0%,var(--pa-bg-3) 100%)}
.kh-latest-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:34px}
.kh-latest-card{display:flex;flex-direction:column;background:var(--pa-wb-002);border:1px solid var(--pa-wd-006);border-radius:16px;padding:22px;text-decoration:none;transition:transform .25s,border-color .25s,background .25s}
.kh-latest-card:hover{transform:translateY(-3px);border-color:rgba(96,165,250,.22);background:var(--pa-wb-004)}
.kh-latest-meta{display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--pa-t-dim);margin-bottom:9px}
.kh-latest-tag{color:var(--pa-at-blue);background:rgba(96,165,250,.08);padding:4px 9px;border-radius:6px}
.kh-latest-card h3{font-size:.98rem;font-weight:700;color:var(--pa-t-strong);line-height:1.4;margin:0 0 7px}
.kh-latest-card p{font-size:.82rem;color:var(--pa-t-muted);line-height:1.6;margin:0}
.kh-method{background:linear-gradient(180deg,var(--pa-bg-3) 0%,var(--pa-bg-2) 100%)}
.kh-method-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:34px}
.kh-method-step{background:var(--pa-wb-002);border:1px solid var(--pa-wd-006);border-radius:16px;padding:22px}
.kh-method-step .n{width:30px;height:30px;border-radius:9px;background:var(--accent-grad);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:800;margin-bottom:12px}
.kh-method-step h3{font-size:.92rem;font-weight:700;color:var(--pa-t-strong);line-height:1.4;margin:0 0 6px}
.kh-method-step p{font-size:.8rem;color:var(--pa-t-muted);line-height:1.6;margin:0}
.kh-method-note{max-width:820px;margin:26px auto 0;text-align:center;font-size:.8rem;color:var(--pa-t-muted);line-height:1.7}
.kh-method-note a{color:var(--pa-at-blue);font-weight:600;text-decoration:underline;text-underline-offset:2px}

@media(max-width:900px){
  .kh-path-grid{grid-template-columns:1fr}
  .kh-method-grid{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:768px){
  .kh-depth-grid{grid-template-columns:1fr}
  .kh-depth-example{grid-column:auto}
  .kh-latest-grid{grid-template-columns:1fr}
}
@media(max-width:480px){
  .kh-method-grid{grid-template-columns:1fr}
  .kh-tools div{grid-template-columns:1fr;gap:2px}
  .kh-depth-card,.kh-path{padding:20px}
}
`;

const DEPTH = {
  'data-architecture-engineering': {
    intro: 'Architecture is judged in production, not in a diagram. These are the measures, tools, and failure modes we see most often.',
    metrics: [
      ['Pipeline reliability', '99%+ of scheduled runs succeed', 'A pipeline that fails silently is worse than no pipeline'],
      ['Freshness SLA attainment', '95%+ of datasets on time', 'Analytics is only useful when it is current'],
      ['Reconciliation exceptions', 'Under 0.1% unexplained rows', 'Catches corruption the job status misses'],
      ['Change lead time', 'Days, not weeks', 'Shows whether the architecture can respond'],
      ['Cost per workload', 'Tracked and owned', 'Prevents spend creep after launch']
    ],
    tools: [
      ['Transformation', 'dbt, SQLMesh, Apache Spark'],
      ['Table formats', 'Apache Iceberg, Delta Lake, Apache Hudi'],
      ['Orchestration', 'Apache Airflow, Dagster, Prefect'],
      ['Platforms', 'Snowflake, Databricks, BigQuery, Microsoft Fabric'],
      ['Quality', '4DAlert, Great Expectations, Soda'],
      ['Catalog & lineage', 'DataHub, OpenMetadata, Unity Catalog']
    ],
    example: `<p><strong>Consider a retailer</strong> whose executive revenue dashboard disagrees with finance by a few percent. Each team built its own order pipeline, applied different refund rules, and filtered test accounts differently. Nobody is lying; the architecture has three definitions of the same event.</p>
      <p>The fix is not another dashboard. It is a conformed order model with documented business keys, source contracts, and one refund rule owned by finance. Reconciliation checks compare order counts and totals across the warehouse, billing, and the ERP. A semantic layer exposes a single revenue metric. Once the number is defined and verified, the argument ends and the dashboard becomes boring - which is exactly what a good data architecture should be.</p>`
  },
  'business-intelligence-analytics': {
    intro: 'Adoption is the metric that matters. These are the signals that separate a useful analytics product from a dashboard graveyard.',
    metrics: [
      ['Weekly active viewers', '40%+ of licensed users', 'Reach alone is not adoption'],
      ['Time to answer', 'Minutes for core questions', 'The real cost of a BI tool'],
      ['Certified dataset coverage', '80%+ of core reporting', 'Trust scales through certification'],
      ['Metric disputes', 'Falling month over month', 'A signal that definitions are working'],
      ['Dashboard load time', 'Under 5 seconds', 'Slow tools get abandoned']
    ],
    tools: [
      ['BI platforms', 'Power BI, Tableau, Looker, Sigma, Metabase'],
      ['Semantic layer', 'dbt Semantic Layer, Cube, AtScale'],
      ['Embedded analytics', 'Sisense, Apache Superset, Looker'],
      ['Metric stores', 'dbt, Cube, a governed warehouse table'],
      ['Data quality', '4DAlert, Great Expectations, Soda'],
      ['Experimentation', 'Amplitude, Mixpanel, warehouse-native tools']
    ],
    example: `<p><strong>Sales and finance</strong> both report pipeline, but one counts verbal commitments and the other counts signed paperwork. Every forecast meeting turns into a definition debate. The dashboards are technically correct and practically useless.</p>
      <p>The team starts with the decision - forecast accuracy - and writes one definition with the CFO: stage, probability, close date, owner, and exclusions. That definition lives in a semantic layer, not in a spreadsheet. A certified pipeline dashboard shows the number, the trend, and the freshness. Finance keeps a reconciliation view. Adoption is measured weekly. Within a quarter, the meeting shifts from arguing about the number to acting on it, which is the only outcome that matters.</p>`
  },
  'ai-machine-learning': {
    intro: 'Production AI is an operations discipline. These are the measures and tools that keep a promising pilot from becoming an expensive demo.',
    metrics: [
      ['Task accuracy', 'Beats the current baseline', 'Novelty is not an outcome'],
      ['Groundedness', '95%+ answers supported by sources', 'Separates RAG from confident guessing'],
      ['p95 latency', 'Within the workflow budget', 'Slow answers get abandoned'],
      ['Cost per request', 'Tracked per use case', 'Protects unit economics'],
      ['Human escalation rate', 'Stable or falling', 'Shows where confidence is weak'],
      ['Eval coverage', 'Every release runs the suite', 'Prevents silent regressions']
    ],
    tools: [
      ['Model platforms', 'Azure OpenAI, OpenAI, Anthropic, Google Vertex AI'],
      ['Orchestration', 'LangGraph, LlamaIndex, custom services'],
      ['Vector search', 'pgvector, Pinecone, Weaviate, Azure AI Search'],
      ['Evaluation', 'Ragas, DeepEval, Promptfoo, custom labelled sets'],
      ['Observability', 'LangSmith, Arize, OpenTelemetry'],
      ['Governance', '4DAlert, model registries, policy engines']
    ],
    example: `<p><strong>A support team</strong> pilots an assistant over policy documents. The demo is impressive, but agents sometimes cite an outdated policy or expose a document the user should not see. The team pauses the rollout and treats it as an engineering problem.</p>
      <p>They add permission-aware retrieval, document freshness metadata, and a labelled evaluation set of 300 real questions. Every release runs the suite for groundedness and citation accuracy. Answers below a confidence threshold escalate to a human. Logs record the retrieved chunks, model version, and prompt. The pilot returns with measurable quality, a known failure mode, and an audit trail. That is the difference between an AI demo and an AI system.</p>`
  },
  'data-governance-quality': {
    intro: 'Governance is only real when a critical dataset has an owner, a test, and a route to resolution. These measures show whether it is working.',
    metrics: [
      ['Critical data element coverage', '100% with owner and definition', 'The minimum viable governance'],
      ['Quality test pass rate', '95%+ on critical datasets', 'A leading indicator of trust'],
      ['Mean time to resolve', 'Under 2 business days', 'Ownership without speed is theater'],
      ['Duplicate rate', 'Falling for core entities', 'The visible cost of poor master data'],
      ['Incident recurrence', 'No repeat root causes', 'Shows fixes are real'],
      ['Freshness attainment', '95%+ against SLA', 'Stale data is a quality defect']
    ],
    tools: [
      ['Governance & catalog', 'Collibra, Alation, Atlan, DataHub'],
      ['Data quality', '4DAlert, Great Expectations, Soda, Monte Carlo'],
      ['Master data', '4DAlert, Informatica, Reltio, Stibo, Semarchy'],
      ['Lineage', 'DataHub, OpenMetadata, Unity Catalog'],
      ['Policy & access', 'Snowflake Horizon, Databricks Unity Catalog, Purview'],
      ['Stewardship', 'Jira, ServiceNow, native workflow queues']
    ],
    example: `<p><strong>A B2B company</strong> keeps sending the same campaign to the same contact twice. The CRM, ERP, and marketing platform each hold a slightly different version of the customer. Nobody owns the entity, so nobody fixes it.</p>
      <p>The team starts with one critical data element: the customer. They define the business key, assign an accountable owner and a steward, and add completeness and duplicate checks at ingestion. Matching runs deterministically first, then probabilistically, with uncertain matches routed to review. Survivorship rules decide which source wins per attribute. A monthly scorecard reports duplicate rate, freshness, and open incidents. The campaign problem disappears, and the governance program earns the right to expand to products and suppliers.</p>`
  },
  'cloud-data-platforms': {
    intro: 'Platform decisions are multi-year commitments. Measure workload fit, cost, and migration progress, not just query speed on a demo dataset.',
    metrics: [
      ['Cost per workload', 'Tracked by team and product', 'The only way to control spend'],
      ['p95 query latency', 'Within the user SLA', 'Averages hide the pain'],
      ['Migration wave completion', 'On plan, with reconciliation', 'Progress you can audit'],
      ['Egress and storage growth', 'Explained and budgeted', 'The quiet line item'],
      ['Utilization', 'Compute matched to demand', 'Idle capacity is the default'],
      ['Incident rate', 'Falling after cutover', 'Stability is part of fit']
    ],
    tools: [
      ['Warehouses / lakehouses', 'Snowflake, Databricks, BigQuery, Microsoft Fabric, Redshift'],
      ['Open table formats', 'Apache Iceberg, Delta Lake, Apache Hudi'],
      ['Ingestion', 'Fivetran, Airbyte, Kafka, native connectors'],
      ['Transformation', 'dbt, SQLMesh, Spark'],
      ['Reconciliation', '4DAlert, custom control totals'],
      ['FinOps', 'Native budgets, tagging, anomaly alerts']
    ],
    example: `<p><strong>A manufacturer</strong> migrates an on-premise warehouse to a lakehouse. The first cutover looks successful until month-end close, when finance totals do not match the old system. The team had tested queries, but not reconciliation.</p>
      <p>They restart the migration in waves. Each wave inventories dependencies, dual-runs critical pipelines, and compares row counts, key coverage, and control totals before cutover. Cost is tagged by domain from day one, so finance can see which workload drives spend. The old system is decommissioned only after two clean close cycles. The migration takes longer than the demo promised, but it avoids a month-end outage and leaves an operating model that can absorb the next workload.</p>`
  },
  'dataops-devops': {
    intro: 'DataOps is measured like software delivery, with one addition: the data itself has to be correct. Track both.',
    metrics: [
      ['Change failure rate', 'Under 15%', 'The clearest sign of safe delivery'],
      ['Deployment frequency', 'Weekly or better', 'Small changes are safer'],
      ['Mean time to recover', 'Under 1 hour', 'Data incidents do not wait'],
      ['Test coverage', '100% of critical pipelines', 'Green jobs are not enough'],
      ['Schema drift incidents', 'Falling to zero', 'Prevents surprise breakage'],
      ['Reconciliation exceptions', 'Under 0.1% unexplained', 'Catches bad data in flight']
    ],
    tools: [
      ['CI / CD', 'GitHub Actions, GitLab CI, Azure DevOps'],
      ['Orchestration', 'Airflow, Dagster, dbt, Prefect'],
      ['Schema migration', 'Liquibase, Flyway, dbt, native migration tools'],
      ['Quality & reconciliation', '4DAlert, Great Expectations, Soda'],
      ['Observability', 'Monte Carlo, Elementary, OpenLineage'],
      ['Incident response', 'PagerDuty, Opsgenie, Jira']
    ],
    example: `<p><strong>A data team</strong> ships pipeline changes by editing SQL in production and hoping. When a source column is renamed, dashboards break on Monday and the on-call engineer reconstructs the change from memory.</p>
      <p>They move transformations into Git, add CI tests for schema contracts and row counts, and deploy through a staged environment. Schema compare catches breaking changes before merge; reconciliation checks compare source and target totals after every load. Migrations follow an expand-and-contract pattern, and every release has a rollback note. The team still has incidents, but they are smaller, shorter, and explainable. That is the point of DataOps.</p>`
  },
  'master-data-management': {
    intro: 'MDM succeeds when matching is measured, stewardship is affordable, and golden records are verified after go-live. These are the numbers to watch.',
    metrics: [
      ['Duplicate rate', 'Falling by domain', 'The business case in one number'],
      ['Match precision / recall', 'Measured, not assumed', 'Rules without evaluation drift'],
      ['Golden record completeness', 'Rising to target', 'A record is only useful if it is usable'],
      ['Stewardship queue age', 'Under 2 business days', 'Keeps review affordable'],
      ['Cross-system consistency', '95%+ on critical attributes', 'Proves synchronization works'],
      ['Time to onboard a domain', 'Weeks, not quarters', 'Shows the operating model scales']
    ],
    tools: [
      ['MDM platforms', '4DAlert, Informatica, Reltio, Stibo, Semarchy, Ataccama'],
      ['Matching', 'Deterministic keys, probabilistic scoring, ML similarity'],
      ['Data quality', '4DAlert, Great Expectations, Soda'],
      ['Source systems', 'Salesforce, Dynamics 365, SAP, Oracle, NetSuite'],
      ['Stewardship', 'Native review queues, Jira, ServiceNow'],
      ['Verification', '4DAlert continuous reconciliation, control totals']
    ],
    example: `<p><strong>A distributor</strong> has the same customer in the CRM, ERP, and billing system under three spellings. Sales sees one account, finance sees another, and the billing team fixes duplicates by hand every week.</p>
      <p>The MDM program starts with customers only. The team defines the business key and survivorship rules, then runs deterministic matching before adding probabilistic and machine-learned scoring. Only uncertain matches go to stewardship. Golden records are reconciled back to source systems daily, so a change in the ERP does not silently break the customer view. After two clean quarters, the same pattern is reused for suppliers. The program succeeds because it stayed narrow, measured matching quality, and treated verification as part of operations.</p>`
  }
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function injectCss(html) {
  const marker = `<style id="kh-v2-css" nonce="${NONCE}">`;
  const start = html.indexOf(marker);
  if (start === -1) throw new Error('kh-v2-css not found');
  const end = html.indexOf('</style>', start);
  if (end === -1) throw new Error('style end not found');
  return html.slice(0, end) + CSS + html.slice(end);
}

function depthBlock(d) {
  const metrics = d.metrics.map(r => `              <tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('\n');
  const tools = d.tools.map(([k, v]) => `            <div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n');
  return `<!-- kh:depth -->
<section class="kh-depth" id="in-practice" aria-label="Metrics, tools, and examples">
  <div class="container">
    <div class="text-center reveal">
      <span class="section-label">In practice</span>
      <h2 class="section-title">Metrics, tools, and what this looks like in practice</h2>
      <p class="section-subtitle mx-auto">${esc(d.intro)}</p>
    </div>
    <div class="kh-depth-grid">
      <div class="kh-depth-card">
        <h3>Metrics that matter</h3>
        <p>Directional starting points. Set the target from your own baseline and business criticality.</p>
        <div class="kh-table-wrap">
          <table class="kh-table">
            <thead><tr><th scope="col">Metric</th><th scope="col">Healthy target</th><th scope="col">Why it matters</th></tr></thead>
            <tbody>
${metrics}
            </tbody>
          </table>
        </div>
      </div>
      <div class="kh-depth-card">
        <h3>Tooling landscape</h3>
        <p>A representative map, not a ranking. Choose by fit, governance, and total cost.</p>
        <dl class="kh-tools">
${tools}
        </dl>
      </div>
      <div class="kh-depth-card kh-depth-example">
        <h3>What this looks like in practice</h3>
${d.example}
      </div>
    </div>
    <p class="kh-depth-note">Figures are directional operating targets from client delivery work, not universal benchmarks. Use them to start a conversation about your own baseline, then measure what improves.</p>
  </div>
</section>
<!-- /kh:depth -->`;
}

/* ------------------------------------------------------------------ */
/* 1. Add depth sections to topic pages                                */
/* ------------------------------------------------------------------ */
for (const [slug, d] of Object.entries(DEPTH)) {
  const file = path.join(ROOT, 'knowledge', slug, 'index.html');
  let html = read(file);
  if (html.includes('<!-- kh:depth -->')) {
    console.log('skip depth (exists):', slug);
    continue;
  }
  if (!html.includes('id="kh-v2-css"')) throw new Error('Run 25-knowledge-hub.js first: ' + slug);
  html = injectCss(html);
  if (!html.includes('<!-- kh:concepts -->')) throw new Error('concepts marker missing: ' + slug);
  html = html.replace('<!-- kh:concepts -->', depthBlock(d) + '\n\n<!-- kh:concepts -->');
  write(file, html);
  console.log('depth added:', slug);
}

/* ------------------------------------------------------------------ */
/* 2. Add learning paths, latest guides, method to the hub             */
/* ------------------------------------------------------------------ */
(function hubDepth() {
  const file = path.join(ROOT, 'knowledge', 'index.html');
  let html = read(file);
  const hasPaths = html.includes('<!-- kh:paths -->');
  const hasMethod = html.includes('<!-- kh:method -->');
  if (!html.includes('id="kh-v2-css"')) throw new Error('Run 25-knowledge-hub.js first: hub');
  if (!html.includes('.kh-depth{')) html = injectCss(html);

  const paths = `<!-- kh:paths -->
<section class="kh-paths" id="learning-paths" aria-label="Guided learning paths">
  <div class="container">
    <div class="text-center reveal">
      <span class="section-label">Learning paths</span>
      <h2 class="section-title">Not sure where to start? Pick a path.</h2>
      <p class="section-subtitle mx-auto">Three curated sequences for the work in front of you. Each one moves from a core idea to something you can implement.</p>
    </div>
    <div class="kh-path-grid">
      <article class="kh-path">
        <div class="kh-path-top">
          <span class="kh-path-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg></span>
          <span class="kh-path-time">About 50 min</span>
        </div>
        <h3>Build a data foundation</h3>
        <p>For data engineers and architects standing up or repairing a platform.</p>
        <ol>
          <li><a href="/knowledge/data-architecture-engineering/"><span class="n">1</span><span>Data architecture, explained</span></a></li>
          <li><a href="/blog/data-modeling-crisis/"><span class="n">2</span><span>Fix the semantic modeling problem</span></a></li>
          <li><a href="/blog/automated-data-reconciliation/"><span class="n">3</span><span>Add reconciliation to every load</span></a></li>
          <li><a href="/blog/database-ci-cd-pipeline/"><span class="n">4</span><span>Automate schema change</span></a></li>
          <li><a href="/knowledge/cloud-data-platforms/"><span class="n">5</span><span>Choose the right platform</span></a></li>
        </ol>
        <p class="kh-path-out"><strong>Outcome:</strong> a stack you can change safely, with fewer silent data failures.</p>
      </article>
      <article class="kh-path">
        <div class="kh-path-top">
          <span class="kh-path-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg></span>
          <span class="kh-path-time">About 45 min</span>
        </div>
        <h3>Make analytics trustworthy</h3>
        <p>For analytics leaders who need one number everyone can defend.</p>
        <ol>
          <li><a href="/blog/what-is-business-intelligence/"><span class="n">1</span><span>What business intelligence is</span></a></li>
          <li><a href="/blog/data-driven-decision-making/"><span class="n">2</span><span>Connect analytics to decisions</span></a></li>
          <li><a href="/blog/data-quality-framework/"><span class="n">3</span><span>Build a quality framework</span></a></li>
          <li><a href="/blog/real-cost-of-bad-data/"><span class="n">4</span><span>Make the cost visible</span></a></li>
          <li><a href="/blog/choose-right-analytics-platform/"><span class="n">5</span><span>Choose the platform</span></a></li>
        </ol>
        <p class="kh-path-out"><strong>Outcome:</strong> certified metrics, visible ownership, and dashboards people actually use.</p>
      </article>
      <article class="kh-path">
        <div class="kh-path-top">
          <span class="kh-path-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6v6H9z"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></svg></span>
          <span class="kh-path-time">About 55 min</span>
        </div>
        <h3>Ship AI responsibly</h3>
        <p>For AI, product, and data leaders moving from pilot to production.</p>
        <ol>
          <li><a href="/blog/enterprise-rag-architecture/"><span class="n">1</span><span>Design enterprise RAG</span></a></li>
          <li><a href="/blog/ai-agents-enterprise/"><span class="n">2</span><span>Know when to use agents</span></a></li>
          <li><a href="/blog/responsible-ai-framework/"><span class="n">3</span><span>Build the governance layer</span></a></li>
          <li><a href="/blog/ai-master-data-management/"><span class="n">4</span><span>Give AI trusted entities</span></a></li>
          <li><a href="/blog/ai-changing-data-quality/"><span class="n">5</span><span>Upgrade data quality for AI</span></a></li>
        </ol>
        <p class="kh-path-out"><strong>Outcome:</strong> an AI system with evaluation, grounded data, and an audit trail.</p>
      </article>
    </div>
  </div>
</section>
<!-- /kh:paths -->`;

  if (!hasPaths) {
    if (!html.includes('<!-- /kh:library -->')) throw new Error('library marker missing');
    html = html.replace('<!-- /kh:library -->', '<!-- /kh:library -->\n\n' + paths);
  }

  // Latest guides: parse every topic page, dedupe, sort by real article date.
  const seen = new Set();
  const latest = [];
  const MONTHS = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11 };
  for (const slug of Object.keys(DEPTH)) {
    const topic = read(path.join(ROOT, 'knowledge', slug, 'index.html'));
    const rowRe = /<a href="([^"]+)" class="article-row[^"]*">([\s\S]*?)<\/a>/g;
    let m;
    while ((m = rowRe.exec(topic))) {
      const href = m[1];
      if (seen.has(href)) continue;
      const body = m[2];
      const h3 = (body.match(/<h3>([\s\S]*?)<\/h3>/) || [])[1];
      const p = (body.match(/<p>([\s\S]*?)<\/p>/) || [])[1];
      const date = (body.match(/<span>([A-Z][a-z]+ \d{1,2}, \d{4})<\/span>/) || [])[1];
      const readMin = (body.match(/(\d+) min read/) || [])[1];
      if (!h3 || !date) continue;
      const clean = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      const parts = date.match(/^([A-Z][a-z]+) (\d{1,2}), (\d{4})$/);
      if (!parts) continue;
      const ts = Date.UTC(+parts[3], MONTHS[parts[1]], +parts[2]);
      latest.push({ href, title: clean(h3), desc: clean(p || ''), date, read: readMin || '', ts, slug });
      seen.add(href);
    }
  }
  latest.sort((a, b) => b.ts - a.ts);
  // One guide per topic, then the six most recent topics. Avoids a "latest"
  // list that is entirely from one cluster just because it was refreshed last.
  const perTopic = new Map();
  for (const item of latest) {
    if (!perTopic.has(item.slug)) perTopic.set(item.slug, item);
  }
  const top = [...perTopic.values()].sort((a, b) => b.ts - a.ts).slice(0, 6);
  const tagMap = {
    'data-architecture-engineering': 'Architecture',
    'business-intelligence-analytics': 'BI & Analytics',
    'ai-machine-learning': 'AI & ML',
    'data-governance-quality': 'Governance',
    'cloud-data-platforms': 'Cloud',
    'dataops-devops': 'DataOps',
    'master-data-management': 'MDM'
  };
  const catName = slug => tagMap[slug] || 'Guide';
  // Curated one-sentence summaries keep the hub cards readable and avoid
  // cutting a source excerpt in the middle of a clause.
  const latestSummary = {
    '/blog/agentic-ai-database-devops/': 'Agentic AI plans, drafts, tests, and reviews database changes while humans approve. See where it works today, where it fails, and how to deploy it safely.',
    '/blog/ai-master-data-management/': 'How AI transforms the MDM pipeline: standardization, matching, survivorship, and stewardship, and how AI-based MDM differs from legacy platforms.',
    '/blog/mdm-implementation-patterns/': 'The three canonical MDM implementation patterns, when to use each, the trade-offs, and how to migrate between them.',
    '/blog/signs-data-infrastructure-holding-back/': "You don't need a tech meltdown to know your data stack is broken. These are the quiet warning signs, and what to do about them before they become costly.",
    '/blog/choose-right-analytics-platform/': "Picking an analytics platform isn't just a tech decision. It affects every team, so here is how to get it right the first time.",
    '/blog/enterprise-rag-architecture/': 'Build AI systems that actually know your business. This guide covers RAG patterns, vector databases, chunking strategies, and evaluation.'
  };
  const summaryFor = item => {
    if (latestSummary[item.href]) return latestSummary[item.href];
    if (item.desc.length <= 150) return item.desc;
    const cut = item.desc.slice(0, 147).replace(/\s+\S*$/, '').replace(/[,;:.\-–—]+$/, '');
    return cut + '…';
  };
  const latestBlock = `<!-- kh:latest -->
<section class="kh-latest" id="latest" aria-label="Latest guides">
  <div class="container">
    <div class="text-center reveal">
      <span class="section-label">Fresh thinking</span>
      <h2 class="section-title">Latest guides from the team</h2>
      <p class="section-subtitle mx-auto">New and recently reviewed guides, ordered by publication date. Every one is free to read.</p>
    </div>
    <div class="kh-latest-grid">
${top.map(a => `      <a class="kh-latest-card" href="${a.href}">
        <span class="kh-latest-meta"><span class="kh-latest-tag">${esc(catName(a.slug))}</span><span>${esc(a.date)}</span>${a.read ? `<span>${a.read} min read</span>` : ''}</span>
        <h3>${esc(a.title)}</h3>
        <p>${esc(summaryFor(a))}</p>
      </a>`).join('\n')}
    </div>
  </div>
</section>
<!-- /kh:latest -->`;
  const latestStart = html.indexOf('<!-- kh:latest -->');
  const latestEnd = html.indexOf('<!-- /kh:latest -->');
  if (latestStart !== -1 && latestEnd !== -1) {
    html = html.slice(0, latestStart) + latestBlock + html.slice(latestEnd + '<!-- /kh:latest -->'.length);
  } else {
    html = html.replace('<!-- /kh:paths -->', '<!-- /kh:paths -->\n\n' + latestBlock);
  }

  const method = `<!-- kh:method -->
<section class="kh-method" id="method" aria-label="How we create these guides">
  <div class="container">
    <div class="text-center reveal">
      <span class="section-label">Editorial method</span>
      <h2 class="section-title">How we create these guides</h2>
      <p class="section-subtitle mx-auto">The Knowledge Hub is built from delivery work, not content briefs. Here is the process behind every page.</p>
    </div>
    <div class="kh-method-grid">
      <div class="kh-method-step">
        <div class="n" aria-hidden="true">1</div>
        <h3>Start with client work</h3>
        <p>Each guide begins with a problem we have implemented, measured, or fixed on a real engagement.</p>
      </div>
      <div class="kh-method-step">
        <div class="n" aria-hidden="true">2</div>
        <h3>Write for the practitioner</h3>
        <p>We explain the decision, the trade-off, and the implementation step - not just the definition.</p>
      </div>
      <div class="kh-method-step">
        <div class="n" aria-hidden="true">3</div>
        <h3>Review with a second lead</h3>
        <p>A second practitioner checks accuracy, claims, and whether the advice survives contact with production.</p>
      </div>
      <div class="kh-method-step">
        <div class="n" aria-hidden="true">4</div>
        <h3>Date it and correct it</h3>
        <p>Every page shows a review date. When platforms change, we update the guide and log the correction.</p>
      </div>
    </div>
    <p class="kh-method-note">We do not publish AI-generated filler, paid placements, or invented statistics. If a number is directional, we say so. Read the full <a href="/editorial-policy/">editorial policy</a>, meet the <a href="/authors/">authors</a>, or <a href="/contact/">suggest a topic or correction</a>.</p>
  </div>
</section>
<!-- /kh:method -->`;
  if (!hasMethod) html = html.replace('<!-- kh:faq -->', method + '\n\n<!-- kh:faq -->');

  write(file, html);
  console.log('hub depth added; latest guides:', top.length);
})();

/* ------------------------------------------------------------------ */
/* 3. Stable anchor IDs for deep links and answer-engine citations     */
/* ------------------------------------------------------------------ */
for (const slug of Object.keys(DEPTH)) {
  const file = path.join(ROOT, 'knowledge', slug, 'index.html');
  let html = read(file);
  const before = html;
  html = html.replace('<section class="kh-start" aria-label="Start here">', '<section class="kh-start" id="start-here" aria-label="Start here">');
  html = html.replace(/<section class="kh-field" aria-label="/, '<section class="kh-field" id="field-guide" aria-label="');
  html = html.replace('<section class="kh-depth" aria-label=', '<section class="kh-depth" id="in-practice" aria-label=');
  if (html !== before) {
    write(file, html);
    console.log('anchors added:', slug);
  }
}

/* ------------------------------------------------------------------ */
/* 4. Sitemap lastmod                                                  */
/* ------------------------------------------------------------------ */
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
