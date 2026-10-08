const fs = require('fs');

const updates = {
  'what-is-master-data-management': "Master data management (MDM) is a technology-enabled business discipline in which business and IT work together to ensure the accuracy, stewardship, governance, and consistency of an organization's shared master data across customers, products, suppliers, and locations.",
  'what-is-business-intelligence': 'Business intelligence (BI) is the set of tools, processes, and practices that turn raw data into decisions through dashboards, reports, and analytics that show what happened, why it happened, and what to do next.',
  'data-reconciliation-guide': 'Data reconciliation is the process of comparing and verifying data across two or more systems to confirm that it is accurate, complete, and consistent, typically after data has been moved, transformed, or integrated.',
  'data-quality-framework': 'A data quality framework is a structured approach for ensuring that data is accurate, complete, consistent, timely, valid, and reliable enough for its intended business use.',
  'enterprise-rag-architecture': 'Enterprise RAG architecture is the production system design around retrieval-augmented generation: an offline pipeline that ingests and indexes private documents, an online path that retrieves them with hybrid search and reranking, and a governance layer enforcing permissions and citations.',
  'choose-right-analytics-platform': 'Choosing an analytics platform starts with requirements rather than demos: who will use it, where the data lives, what governance you owe, and total cost of ownership at your projected user count.'
};

for (const [slug, desc] of Object.entries(updates)) {
  const f = 'blog/' + slug + '/index.html';
  let h = fs.readFileSync(f, 'utf8');

  const m = h.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/);
  if (!m) { console.log('SKIP (no json-ld): ' + slug); continue; }
  const j = JSON.parse(m[1]);
  const arr = Array.isArray(j) ? j : [j];
  const art = arr.find(o => o && (o['@type'] === 'Article' || o['@type'] === 'BlogPosting' || o['@type'] === 'TechArticle'));
  if (!art) { console.log('SKIP (no Article): ' + slug); continue; }

  const oldDesc = art.description;
  if (!oldDesc) { console.log('SKIP (no description): ' + slug); continue; }

  const needle = '"description":' + JSON.stringify(oldDesc);
  const count = h.split(needle).length - 1;
  if (count !== 1) { console.log('SKIP (' + count + ' matches): ' + slug); continue; }

  h = h.replace(needle, '"description":' + JSON.stringify(desc));

  // validate JSON-LD still parses after the edit
  const after = h.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/);
  try { JSON.parse(after[1]); } catch (e) { console.log('ERROR (invalid json-ld): ' + slug + ' ' + e.message); continue; }

  fs.writeFileSync(f, h, 'utf8');
  console.log('OK ' + slug);
}
