/**
 * wire-heroes.js — point each target post at its new dedicated hero SVG
 * (og:image, twitter:image, JSON-LD image, <img src>, plus the
 * schema-compare-guide inline featured <svg> which becomes an <img>).
 * CRLF-safe: replacements never introduce or remove line breaks.
 */
const fs = require('fs');

const JOBS = [
  { slug: 'schema-drift', from: ['hero-blog-data.svg'], to: 'hero-schema-drift.svg' },
  { slug: 'schema-compare-guide', from: ['schema-compare-hero.svg'], to: 'hero-schema-compare-guide.svg', inline: true },
  { slug: 'database-change-management', from: ['hero-data-infrastructure-bottleneck.svg'], to: 'hero-database-change-management.svg' },
  { slug: 'schema-migration-best-practices', from: ['hero-data-quality-framework.svg'], to: 'hero-schema-migration.svg' },
  { slug: 'agentic-ai-database-devops', from: ['hero-ai-agents.svg'], to: 'hero-agentic-database-devops.svg' },
  { slug: 'database-ci-cd-pipeline', from: ['hero-devops-best-practices.svg'], to: 'hero-database-ci-cd.svg' },
  { slug: 'what-is-master-data-management', from: ['hero-mdm-ai-era-og.png', 'hero-mdm-ai-era.svg'], to: 'hero-what-is-mdm.svg' },
  { slug: 'data-reconciliation-guide', from: ['hero-data-reconciliation-og.png', 'hero-data-reconciliation.svg'], to: 'hero-data-reconciliation-guide.svg' },
];

const ALT = {
  'data-reconciliation-guide':
    'Data reconciliation comparison panel showing matched, mismatched, and missing rows beside the four decisions: match keys, tolerance, grain, and exceptions',
};

let total = 0;
for (const job of JOBS) {
  const p = 'blog/' + job.slug + '/index.html';
  let h = fs.readFileSync(p, 'utf8');
  const before = h;
  const counts = job.from.map(f => {
    const n = h.split(f).length - 1;
    h = h.split(f).join(job.to);
    return f + '=' + n;
  });
  total += counts.reduce((a, c) => a + parseInt(c.split('=')[1], 10), 0);

  if (job.inline) {
    const sec = h.indexOf('<section class="featured-image-section"');
    const s0 = h.indexOf('<svg', sec);
    const s1 = h.indexOf('</svg>', s0) + '</svg>'.length;
    if (sec < 0 || s0 < 0 || s1 < 6) { console.log('!! ' + job.slug + ': featured svg not found'); continue; }
    const img = '<img src="/assets/images/blog/' + job.to + '" alt="Schema comparison dashboard showing database differences between environments" class="featured-image" width="1200" height="600" fetchpriority="high" loading="eager" decoding="async" />';
    h = h.slice(0, s0) + img + h.slice(s1);
    console.log('  ' + job.slug + ': inline featured <svg> (' + (s1 - s0) + ' chars) replaced with <img>');
  }

  if (ALT[job.slug]) {
    const re = new RegExp('(<img src="/assets/images/blog/' + job.to + '" alt=")[^"]*(")');
    const m = h.match(re);
    if (m) h = h.replace(re, '$1' + ALT[job.slug] + '$2');
  }

  // keep og:image:width/height/type consistent with the new file
  const ogM = h.match(/<meta property="og:image" content="[^"]*\/([^"/]+)" \/>/);
  if (ogM) {
    const ext = ogM[1].split('.').pop();
    const type = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/svg+xml';
    const dims = job.to.indexOf('schema-compare-guide') >= 0 || job.slug === 'schema-compare-guide' ? ['1200', '600'] : null;
    h = h.replace(/(<meta property="og:image:type" content=")[^"]*(" \/>)/, '$1' + type + '$2');
    if (dims) {
      h = h.replace(/(<meta property="og:image:width" content=")[^"]*(" \/>)/, '$1' + dims[0] + '$2');
      h = h.replace(/(<meta property="og:image:height" content=")[^"]*(" \/>)/, '$1' + dims[1] + '$2');
    }
  }

  if (h === before) { console.log('!! ' + job.slug + ': unchanged'); continue; }
  fs.writeFileSync(p, h, 'utf8');
  console.log('  ' + job.slug + ': ' + counts.join(', ') + ' -> ' + job.to);
}

// blog index card thumbnails
{
  const p = 'blog/index.html';
  let h = fs.readFileSync(p, 'utf8');
  let n = 0;
  for (const job of JOBS) {
    const lineRe = new RegExp('slug:"' + job.slug + '"[^\\n]*?img:"([^"]*)"');
    const m = h.match(lineRe);
    if (!m) { console.log('!! index entry not found: ' + job.slug); continue; }
    if (m[1] === '/assets/images/blog/' + job.to) continue;
    const lineRe2 = new RegExp('(slug:"' + job.slug + '"[^\\n]*?img:")([^"]*)(")');
    h = h.replace(lineRe2, '$1/assets/images/blog/' + job.to + '$3');
    n++;
    console.log('  index ' + job.slug + ': ' + m[1] + ' -> /assets/images/blog/' + job.to);
  }
  if (n) fs.writeFileSync(p, h, 'utf8');
}

console.log('\npost image refs rewritten: ' + total);
