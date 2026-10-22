'use strict';
const path = require('path');
const { ROOT, read, write } = require('./lib');

const report = [];

// ---------- 1. Homepage CTA: add a direct booking option ----------
{
  const file = path.join(ROOT, 'index.html');
  let html = read(file);
  if (!html.includes('href="/book-meeting/"')) {
    html = html.replace('<a href="/contact/" class="btn-primary">Start a Conversation &rarr;</a>',
      '<a href="/contact/" class="btn-primary">Start a Conversation &rarr;</a>\n<a href="/book-meeting/" class="btn-primary" style="background:transparent;border:1px solid var(--pa-wd-008);color:var(--pa-t)">Book a 30-min Meeting</a>');
    write(file, html);
    report.push('homepage book-meeting');
  }
}

// ---------- 2. Contact: booking option + Chicago landing link ----------
{
  const file = path.join(ROOT, 'contact', 'index.html');
  let html = read(file);
  if (!html.includes('href="/book-meeting/"')) {
    html = html.replace('<a href="#form" class="btn-primary">Schedule a Free Consultation &rarr;</a>',
      '<a href="#form" class="btn-primary">Schedule a Free Consultation &rarr;</a>\n                  <a href="/book-meeting/" style="display:inline-flex;align-items:center;gap:8px;padding:14px 24px;border:1px solid var(--pa-wd-008);border-radius:100px;color:var(--pa-t);text-decoration:none;font-weight:600">Book a 30-min Call</a>');
  }
  if (!html.includes('href="/chicago/"')) {
    html = html.replace('<p>111 W. Jackson Blvd, Suite 1700<br/>Chicago, IL 60604</p>',
      '<p>111 W. Jackson Blvd, Suite 1700<br/>Chicago, IL 60604</p>\n        <p style="margin-top:8px"><a href="/chicago/" style="color:var(--pa-at-blue);font-size:.85rem;font-weight:600">Chicago data consulting &rarr;</a></p>');
  }
  write(file, html);
  report.push('contact links');
}

// ---------- 3. About: link to testimonials and case studies ----------
{
  const file = path.join(ROOT, 'about', 'index.html');
  let html = read(file);
  if (!html.includes('href="/testimonials/"')) {
    html = html.replace('<a href="/contact/" class="btn-primary">Get in touch &rarr;</a>',
      '<a href="/contact/" class="btn-primary">Get in touch &rarr;</a>\n      <a href="/testimonials/" style="display:inline-flex;align-items:center;gap:8px;margin-left:12px;padding:14px 24px;border:1px solid var(--pa-wd-008);border-radius:100px;color:var(--pa-t);text-decoration:none;font-weight:600">Read client testimonials</a>');
  }
  write(file, html);
  report.push('about links');
}

// ---------- 4. Case studies hub: link to testimonials ----------
{
  const file = path.join(ROOT, 'case-studies', 'index.html');
  let html = read(file);
  if (!html.includes('href="/testimonials/"')) {
    html = html.replace('For the platform behind these results, see <a href="/products/" style="color:var(--pa-at-blue)">4DAlert</a>;',
      'For the platform behind these results, see <a href="/products/" style="color:var(--pa-at-blue)">4DAlert</a>; for client voices, see <a href="/testimonials/" style="color:var(--pa-at-blue)">testimonials</a>;');
  }
  write(file, html);
  report.push('case hub testimonials');
}

// ---------- 5. Case study pages: cross-link the other engagements ----------
const CASES = [
  ['financial-services-regulatory-reporting', 'Financial services regulatory reporting'],
  ['manufacturing-data-reconciliation', 'Manufacturing data reconciliation'],
  ['healthcare-dataops-automation', 'Healthcare DataOps automation']
];
for (const [slug] of CASES) {
  const file = path.join(ROOT, 'case-studies', slug, 'index.html');
  let html = read(file);
  if (html.includes('More customer results')) continue;
  const others = CASES.filter(([s]) => s !== slug);
  const links = others.map(([s, label]) => `<a href="/case-studies/${s}/">${label} &rarr;</a>`).join(' ');
  html = html.replace(/(<h2>Related reading<\/h2>[\s\S]*?<\/div>)/,
    `$1\n    <p style="margin-top:18px;font-size:.9rem;color:var(--pa-t-muted)">More customer results: ${links}</p>`);
  write(file, html);
  report.push('cross-links ' + slug);
}

// ---------- 6. ROI calculator links from cost/quality guides ----------
for (const [slug, heading, text] of [
  ['real-cost-of-bad-data', 'Estimate the cost for your organization', 'The data ROI calculator turns error rates, rework hours, and team size into an annual cost estimate you can take to a steering committee.'],
  ['data-quality-framework', 'Put a number on poor data quality', 'Use the data ROI calculator to estimate what defects, rework, and reporting delays cost your organization each year.']
]) {
  const file = path.join(ROOT, 'blog', slug, 'index.html');
  let html = read(file);
  if (html.includes('href="/tools/data-roi-calculator/"')) continue;
  const callout = `<div class="container"><div class="quick-answer" style="border-left-color:#7c3aed;border-color:rgba(124,58,237,.25)"><h2>${heading}</h2><p>${text} <a href="/tools/data-roi-calculator/" style="color:var(--pa-at-blue);font-weight:600">Open the data ROI calculator &rarr;</a></p></div></div>\n\n`;
  html = html.replace(/(<section class="post-sources"[\s\S]*?<\/section>\s*)/, `$1${callout}`);
  write(file, html);
  report.push('roi link ' + slug);
}

console.log(report.join('\n'));
