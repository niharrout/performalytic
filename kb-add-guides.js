const fs = require('fs');
const p = 'knowledge/dataops-devops/index.html';
let h = fs.readFileSync(p, 'utf8');
const dry = process.argv.includes('--dry');

if (h.includes('/blog/agentic-ai-database-devops/')) { console.log('already inserted'); process.exit(0); }

const MARK = '<!-- /kh:guides -->';
const i = h.indexOf(MARK);
if (i < 0) { console.log('marker not found'); process.exit(1); }
const at = i + MARK.length;

const arrow = '<span class="read-more">Read the guide <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>';

const items = [
  { slug: 'agentic-ai-database-devops', n: 7, tag: 'Agentic AI', title: 'Agentic AI in Database DevOps: A Practical Guide for 2026', ex: 'Agentic AI plans, drafts, tests, and reviews database changes - humans approve. See where it works today, where it fails, and how to deploy it safely.', date: 'October 8, 2026', read: '14 min read' },
  { slug: 'schema-migration-best-practices', n: 8, tag: 'Schema CI/CD', title: 'Schema Migration Best Practices: Expand, Contract, and Rollback', ex: 'Schema migration best practices for zero-downtime changes: expand-contract, safe rollbacks, backfill strategy, testing, and locking pitfalls to avoid.', date: 'October 7, 2026', read: '13 min read' },
  { slug: 'schema-compare-tools', n: 9, tag: 'Schema CI/CD', title: '12 Schema Compare Tools Compared for 2026', ex: 'We compare 12 schema compare tools - SSMS, pgAdmin, Flyway, Liquibase, Atlas, Redgate, dbForge, Bytebase and more - by engine coverage, diff depth, and CI fit.', date: 'October 7, 2026', read: '14 min read' },
  { slug: 'schema-drift', n: 10, tag: 'Data Quality', title: 'What Is Schema Drift? Causes, Detection, and Prevention', ex: 'Schema drift is any unplanned change to a data structure that downstream consumers never agreed to. Learn the causes, how to detect it, and how to stop it.', date: 'October 6, 2026', read: '13 min read' },
  { slug: 'database-change-management', n: 11, tag: 'Change Management', title: 'Database Change Management: The Complete Guide', ex: 'Database change management is how teams plan, approve, test, and audit every schema change. Learn the lifecycle, roles, risk tiers, and tooling.', date: 'October 6, 2026', read: '14 min read' },
  { slug: 'database-ci-cd-pipeline', n: 12, tag: 'Database CI/CD', title: 'Database CI/CD: How to Build a Schema Change Pipeline', ex: 'Database CI/CD puts schema changes through an automated pipeline instead of a ticket. The seven stages, the tooling, and where agentic AI fits into database DevOps.', date: 'October 6, 2026', read: '14 min read' },
];

const esc = s => s.replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;');
const nl = h.includes('\r\n') ? '\r\n' : '\n';
const block = items.map(it => [
  '',
  '      <a href="/blog/' + it.slug + '/" class="article-row reveal">',
  '        <div class="article-num" aria-hidden="true">' + it.n + '</div>',
  '        <div class="article-row-body">',
  '          <span class="article-tag">' + esc(it.tag) + '</span>',
  '          <h3>' + esc(it.title) + '</h3>',
  '          <p>' + esc(it.ex) + '</p>',
  '          <span class="article-meta"><span>' + it.date + '</span><span>' + it.read + '</span></span>',
  '          ' + arrow,
  '        </div>',
  '      </a>',
].join(nl)).join(nl);

h = h.slice(0, at) + block + h.slice(at);
if (dry) { console.log('[dry] would insert ' + items.length + ' entries'); }
else { fs.writeFileSync(p, h, 'utf8'); console.log('inserted ' + items.length + ' entries after kh:guides'); }
