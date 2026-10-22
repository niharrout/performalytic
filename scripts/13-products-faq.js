'use strict';
const path = require('path');
const { ROOT, SITE, read, write, mapJsonLd } = require('./lib');

const file = path.join(ROOT, 'products', 'index.html');
let html = read(file);

// 1. Add the comparison page to the resources grid.
if (!html.includes('href="/compare/"') || !/<a class="res-card" href="\/compare\/"/.test(html)) {
  html = html.replace(/(<a class="res-card" href="\/case-studies\/">[\s\S]*?<\/a>)/,
    `$1\n      <a class="res-card" href="/compare/"><span class="res-kicker">Comparison</span><h3>4DAlert vs legacy MDM, dbt, and in-house builds</h3><p>An honest look at where a unified platform fits and where open-source tests or custom builds are the better call.</p></a>`);
}

// 2. Point the legacy MDM FAQ at the full comparison page.
html = html.replace('Read the full feature breakdown in our <a href="/blog/4dalert-vs-legacy-mdm/">4DAlert vs legacy MDM comparison</a>.',
  'Read the full feature breakdown in our <a href="/blog/4dalert-vs-legacy-mdm/">4DAlert vs legacy MDM comparison</a>, or see how all four options stack up in the <a href="/compare/">4DAlert comparison guide</a>.');

// 3. Add FAQPage structured data matching the visible FAQ.
const FAQ = [
  ['How is 4DAlert different from dbt tests or Great Expectations?', '4DAlert is a unified platform, not a library. It combines reconciliation, quality monitoring, MDM, and CI/CD in one tool without glue code. dbt tests validate transformations within your warehouse. Great Expectations is a Python library your engineers wire up manually. 4DAlert connects directly to 100+ sources, runs cross-system reconciliation, and delivers production-ready automation out of the box.'],
  ['Why not build this in-house?', 'Teams spend 6–12 months building partial solutions that only cover one use case. 4DAlert delivers production-ready automation in weeks, with 100+ pre-built connectors, anomaly detection, and schema CI/CD included. You avoid the maintenance burden, hiring costs, and technical debt of a custom build while your engineers stay focused on high-impact work.'],
  ['How does 4DAlert compare to manual reconciliation?', 'Manual processes take days, miss edge cases, and rely on tribal knowledge. 4DAlert runs in minutes with 98% accuracy and catches discrepancies humans overlook, including cross-system mismatches, orphaned records, and slow-drift anomalies. Your team gets audit-ready reports instead of spreadsheets.'],
  ['Is 4DAlert a replacement for our data warehouse?', 'No. 4DAlert sits on top of your existing stack — Snowflake, BigQuery, Redshift, Databricks, and 100+ platforms. It adds reconciliation, quality monitoring, MDM, and CI/CD without requiring you to move data or change your architecture.'],
  ['Does 4DAlert support VPC deployment and data residency?', 'Yes. 4DAlert can be deployed inside your Virtual Private Cloud on AWS, GCP, or Azure. Your data never leaves your security perimeter. You choose the region where your data resides to meet sovereignty and compliance requirements.'],
  ['How does 4DAlert compare to legacy MDM platforms?', 'Legacy MDM suites lean on hand-written match rules and services-heavy implementations that commonly run 6–12 months for a first domain. 4DAlert combines deterministic, probabilistic, and ML-assisted matching with confidence-scored stewardship and continuous reconciliation, so a first domain typically goes live in weeks on top of your existing stack with SAP and Salesforce connectors pre-built.']
];

html = mapJsonLd(html, data => {
  const arr = Array.isArray(data) ? data : [data];
  if (!arr.some(o => o && o['@type'] === 'FAQPage')) {
    arr.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({
        '@type': 'Question', name: q,
        acceptedAnswer: { '@type': 'Answer', text: a }
      }))
    });
  }
  return arr;
});

write(file, html);
console.log('products: compare card + FAQPage schema');
