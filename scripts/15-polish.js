'use strict';
const path = require('path');
const { ROOT, SITE, read, write, mapJsonLd } = require('./lib');

// ---------- 1. Case studies hub: explain how results are measured ----------
{
  const file = path.join(ROOT, 'case-studies', 'index.html');
  let html = read(file);
  if (!html.includes('How we measure results')) {
    const block = `<section style="padding:0 0 80px">
  <div class="container" style="max-width:820px">
    <h2 class="section-title">How we measure results</h2>
    <p style="color:var(--pa-t-muted);line-height:1.8;margin-bottom:16px">Every engagement starts with a baseline: cycle time, error rate, number of systems in scope, or hours spent on manual checks. We agree the measure with the client before the first release, then report against it after production. That is why the numbers below are specific rather than directional.</p>
    <ul style="color:var(--pa-t-muted);line-height:1.9;margin:0 0 18px 20px">
      <li><strong>Scope</strong> — which systems, domains, and reports are covered</li>
      <li><strong>Baseline</strong> — the client's own pre-project measurement</li>
      <li><strong>Production result</strong> — measured after go-live, not during a pilot</li>
      <li><strong>Ownership</strong> — who runs the process after the engagement ends</li>
    </ul>
    <p style="color:var(--pa-t-muted);line-height:1.8">Client names are withheld under NDA. Where a metric cannot be disclosed, we describe the mechanism instead of inventing a number. For the platform behind these results, see <a href="/products/" style="color:var(--pa-at-blue)">4DAlert</a>; for the methodology, see our <a href="/blog/automated-data-reconciliation/" style="color:var(--pa-at-blue)">automated reconciliation guide</a> and the <a href="/compare/" style="color:var(--pa-at-blue)">platform comparison</a>.</p>
  </div>
</section>
`;
    html = html.replace('<section class="cta-section" style="padding:80px 0">', block + '<section class="cta-section" style="padding:80px 0">');
    write(file, html);
  }
}

// ---------- 2. Testimonials: include the featured testimonial as a Review ----------
{
  const file = path.join(ROOT, 'testimonials', 'index.html');
  let html = read(file);
  const featured = html.match(/<blockquote>([\s\S]*?)<\/blockquote>[\s\S]*?<span class="author-name">([\s\S]*?)<\/span>\s*<span class="author-title">([\s\S]*?)<\/span>/);
  if (!featured) throw new Error('featured testimonial not found');
  const clean = s => s.replace(/<[^>]+>/g, '').replace(/&ldquo;|&rdquo;/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  const name = clean(featured[2]);
  const quote = clean(featured[1]);
  html = mapJsonLd(html, data => {
    const arr = Array.isArray(data) ? data : [data];
    if (arr.some(o => o['@type'] === 'Review' && o.author && o.author.name === name)) return arr;
    const idx = arr.findIndex(o => o['@type'] === 'Review');
    const review = {
      '@context': 'https://schema.org',
      '@type': 'Review',
      itemReviewed: { '@type': 'Service', name: 'Performalytic enterprise data and AI consulting' },
      author: { '@type': 'Person', name },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: quote
    };
    if (idx === -1) arr.push(review); else arr.splice(idx, 0, review);
    return arr;
  });
  write(file, html);
  console.log('featured review added:', name);
}
