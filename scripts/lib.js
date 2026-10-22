'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://performalytic.com';
const TODAY = '2026-10-22';

const AUTHORS = {
  'James Carter': {
    slug: 'james-carter',
    role: 'Senior Data Engineer',
    bio: 'James writes about data reconciliation, schema change management, and the engineering practices that keep enterprise data trustworthy. His work focuses on practical implementations across Snowflake, Databricks, SAP, and relational databases.',
    knowsAbout: ['data reconciliation', 'data engineering', 'schema migration', 'database CI/CD', 'data pipelines', 'Snowflake', 'Databricks'],
    sameAs: ['https://www.linkedin.com/company/performalytic-corp/']
  },
  'Sarah Mitchell': {
    slug: 'sarah-mitchell',
    role: 'Data Quality Lead',
    bio: 'Sarah covers data quality, observability, schema tooling, and entity resolution. She writes about the testing and monitoring practices that let data teams catch problems before they reach production.',
    knowsAbout: ['data quality', 'data observability', 'schema compare', 'entity resolution', 'master data management', 'data testing'],
    sameAs: ['https://www.linkedin.com/company/performalytic-corp/']
  },
  'David Kim': {
    slug: 'david-kim',
    role: 'AI Solutions Architect',
    bio: 'David writes about AI agents, retrieval-augmented generation, and the data foundations enterprises need to run AI in production. He focuses on architecture decisions, evaluation, and governance.',
    knowsAbout: ['generative AI', 'RAG architecture', 'AI agents', 'agentic AI', 'AI governance', 'machine learning'],
    sameAs: ['https://www.linkedin.com/company/performalytic-corp/']
  },
  'Priya Nair': {
    slug: 'priya-nair',
    role: 'Data Governance Consultant',
    bio: 'Priya covers data governance, master data management, analytics platforms, and multi-cloud data operations. She helps teams connect governance policy to the engineering work that enforces it.',
    knowsAbout: ['data governance', 'master data management', 'business intelligence', 'data platforms', 'multi-cloud data', 'data strategy'],
    sameAs: ['https://www.linkedin.com/company/performalytic-corp/']
  },
  'Emma Wilson': {
    slug: 'emma-wilson',
    role: 'Data Strategy Consultant',
    bio: 'Emma writes about data culture, AI-native data quality, and the operating models that make analytics stick. Her work focuses on the people and process side of enterprise data programs.',
    knowsAbout: ['data strategy', 'data culture', 'data literacy', 'data quality', 'analytics operating model', 'AI adoption'],
    sameAs: ['https://www.linkedin.com/company/performalytic-corp/']
  }
};

const MONTHS = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };

function isoDate(human) {
  const m = human.match(/^([A-Za-z]{3})[a-z]* (\d{1,2}), (\d{4})$/);
  if (!m) throw new Error('Bad date: ' + human);
  return `${m[3]}-${MONTHS[m[1]]}-${String(m[2]).padStart(2, '0')}`;
}

function getPosts() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'seo-posts.json'), 'utf8'));
}

function walkHtml(dir = ROOT, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'assets', 'scripts'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(p, out);
    else if (e.name === 'index.html') out.push(p);
  }
  return out;
}

function pageUrl(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/').replace(/index\.html$/, '');
  return rel === '' ? '/' : '/' + rel;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, s) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, s); }

function replaceOrThrow(html, re, replacement, label) {
  const before = html;
  html = html.replace(re, replacement);
  if (html === before) throw new Error('No match: ' + label);
  return html;
}

function jsonLdBlocks(html) {
  const re = /<script type="application\/ld\+json"([^>]*)>([\s\S]*?)<\/script>/g;
  const blocks = [];
  let m;
  while ((m = re.exec(html))) blocks.push({ full: m[0], attrs: m[1], json: m[2] });
  return blocks;
}

function mapJsonLd(html, fn) {
  return html.replace(/<script type="application\/ld\+json"([^>]*)>([\s\S]*?)<\/script>/g, (full, attrs, raw) => {
    let data;
    try { data = JSON.parse(raw); } catch (e) { return full; }
    const out = fn(data, full);
    if (out === undefined) return full;
    return `<script type="application/ld+json"${attrs}>${JSON.stringify(out)}</script>`;
  });
}

module.exports = { ROOT, SITE, TODAY, AUTHORS, isoDate, getPosts, walkHtml, pageUrl, esc, read, write, replaceOrThrow, jsonLdBlocks, mapJsonLd };
