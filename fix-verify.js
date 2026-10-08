/**
 * fix-verify.js — repair the pre-existing verify-post failures on
 * schema-compare-guide and devops-best-practices:
 *   · Article author/publisher @id + Person JSON-LD definition
 *   · visible FAQ section matching the existing FAQPage JSON-LD (guide only)
 *   · TOC entry for the new FAQ heading (keeps h2[id] count == TOC entries)
 *   · hero description 50-80 words, meta description <= 165 chars
 */
const fs = require('fs');

function braceEnd(s, openIdx) {
  let depth = 0, inStr = false, esc = false;
  for (let i = openIdx; i < s.length; i++) {
    const c = s[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
  }
  return -1;
}

function person(id, name, jobTitle, knows) {
  const items = knows.map(k => '    "' + k + '"').join(',\r\n');
  return '{\r\n' +
    '  "@context": "https://schema.org",\r\n' +
    '  "@type": "Person",\r\n' +
    '  "@id": "https://performalytic.com/#author-' + id + '",\r\n' +
    '  "name": "' + name + '",\r\n' +
    '  "jobTitle": "' + jobTitle + '",\r\n' +
    '  "worksFor": {\r\n    "@id": "https://performalytic.com/#organization"\r\n  },\r\n' +
    '  "knowsAbout": [\r\n' + items + '\r\n  ],\r\n' +
    '  "url": "https://performalytic.com/about/"\r\n' +
    '}';
}

const JOB = {
  'schema-compare-guide': {
    author: person('sarah-mitchell', 'Sarah Mitchell', 'Data Quality Lead',
      ['schema comparison', 'schema drift', 'data quality', 'database testing', 'data governance', 'CI/CD for databases']),
    hero: 'Undocumented schema changes are one of the leading causes of silent data pipeline failures. A schema comparison runs two databases or two environments side by side and surfaces every structural difference - added, dropped, or renamed columns, type changes, missing constraints, and view drift. This guide covers what to compare, manual versus automated approaches, where schema comparison fits in a CI/CD pipeline, and how 4DAlert keeps environments in sync.',
    meta: 'Learn how schema compare tools detect breaking changes before they reach production, prevent pipeline failures, and keep every environment in sync with CI/CD.',
    faq: [
      ['What is schema comparison?', 'Schema comparison is the process of analyzing two database schemas to identify structural differences such as added, removed, or modified tables, columns, data types, constraints, and indexes. It helps teams detect drift between environments and prevent breaking changes from reaching production.'],
      ['Why is schema comparison important for data teams?', 'Schema comparison is critical because undocumented schema changes are a leading cause of data pipeline failures. When a column is renamed or a data type changes in production, downstream ETL jobs, dashboards, and reports break silently. Automated schema comparison catches these changes before they cause damage.'],
      ['How does 4DAlert handle schema comparison?', '4DAlert provides automated schema CI/CD that continuously monitors schema changes across databases, compares schemas between environments, detects breaking changes, and alerts teams before issues propagate. It integrates with existing CI/CD pipelines and supports SQL Server, PostgreSQL, Oracle, Snowflake, and other major databases.'],
    ],
    toc: true,
  },
  'devops-best-practices': {
    author: person('james-carter', 'James Carter', 'Senior Data Engineer',
      ['DevOps', 'CI/CD', 'data pipelines', 'infrastructure as code', 'data engineering', 'automated testing']),
    hero: 'Learn how to apply DevOps principles to data pipelines and analytics workflows - version control for SQL and transformation code, CI/CD that tests every change against a real database, infrastructure as code, automated data quality gates, and monitoring that treats pipelines like production software. This guide walks through the seven practices that matter most and how to introduce them without boiling the ocean.',
  },
};

for (const [slug, cfg] of Object.entries(JOB)) {
  const p = 'blog/' + slug + '/index.html';
  let h = fs.readFileSync(p, 'utf8');
  const before = h;
  const log = [];

  // 1. give the top-level Organization an @id
  const orgOld = '  "@type": "Organization",\r\n  "name": "Performalytic",';
  if (h.includes(orgOld)) {
    h = h.replace(orgOld, '  "@type": "Organization",\r\n  "@id": "https://performalytic.com/#organization",\r\n  "name": "Performalytic",');
    log.push('org@id');
  } else log.push('!! org@id PATTERN NOT FOUND');

  // 2. define the author Person right after the Organization element
  const authorId = slug === 'schema-compare-guide' ? 'sarah-mitchell' : 'james-carter';
  if (!h.includes('#author-' + authorId)) {
    const oStart = h.indexOf('"@context": "https://schema.org",\r\n  "@type": "Organization",');
    const objStart = h.lastIndexOf('{', oStart);
    const oEnd = braceEnd(h, objStart);
    if (oStart < 0 || oEnd < 0) log.push('!! person INSERT POINT NOT FOUND');
    else { h = h.slice(0, oEnd + 1) + ',\r\n' + cfg.author + h.slice(oEnd + 1); log.push('person'); }
  } else log.push('person already present');

  // 3. Article author / publisher -> @id references
  const aOld = '"author":{"@type":"Organization","name":"Performalytic"}';
  const aNew = '"author":{"@id":"https://performalytic.com/#author-' + authorId + '"}';
  if (h.includes(aOld)) { h = h.replace(aOld, aNew); log.push('author'); } else log.push('!! author PATTERN NOT FOUND');
  const pOld = '"publisher":{"@type":"Organization","name":"Performalytic","logo":{"@type":"ImageObject","url":"/assets/images/performalytic-logo.png"}}';
  const pNew = '"publisher":{"@id":"https://performalytic.com/#organization"}';
  if (h.includes(pOld)) { h = h.replace(pOld, pNew); log.push('publisher'); } else log.push('!! publisher PATTERN NOT FOUND');

  // 4. hero description -> 50-80 words
  const heroRe = /<p class="hero-description">[\s\S]*?<\/p>/;
  if (heroRe.test(h)) { h = h.replace(heroRe, '<p class="hero-description">' + cfg.hero + '</p>'); log.push('hero(' + cfg.hero.split(/\s+/).length + 'w)'); }
  else log.push('!! hero PATTERN NOT FOUND');

  // 5. meta description -> <=165
  if (cfg.meta) {
    if (cfg.meta.length > 165) { console.log('!! meta too long: ' + cfg.meta.length); process.exit(1); }
    h = h.replace(/<meta name="description" content="[^"]*" \/>/, '<meta name="description" content="' + cfg.meta + '" />');
    log.push('meta(' + cfg.meta.length + ')');
  }

  // 6. visible FAQ + TOC entry (only where JSON-LD already declares FAQPage)
  if (cfg.faq) {
    const navMark = '    <nav class="post-footer-nav"';
    const faqHtml = ['    <h2 id="faq">Frequently Asked Questions</h2>']
      .concat(cfg.faq.flatMap(([q, a]) => ['    <h3>' + q + '</h3>', '    <p>' + a + '</p>']))
      .join('\r\n') + '\r\n\r\n';
    if (h.includes('id="faq"')) log.push('faq already present');
    else if (h.includes(navMark)) { h = h.replace(navMark, faqHtml + navMark); log.push('faq(3)'); }
    else log.push('!! nav MARK NOT FOUND');

    const tocMark = '<a href="#getting-started">Getting Started</a></li>';
    if (h.includes(tocMark)) { h = h.replace(tocMark, tocMark + '<li><a href="#faq">Frequently Asked Questions</a></li>'); log.push('toc'); }
    else log.push('!! toc MARK NOT FOUND');
  }

  if (h === before) { console.log('!! ' + slug + ': unchanged'); continue; }
  fs.writeFileSync(p, h, 'utf8');
  console.log(slug + ': ' + log.join(', '));
}
