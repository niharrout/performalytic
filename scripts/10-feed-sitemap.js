'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ROOT, SITE, TODAY, getPosts, read, write, walkHtml } = require('./lib');

// ---------- 1. Sitewide footer links ----------
let footerPatched = 0;
for (const file of walkHtml()) {
  let html = read(file);
  const before = html;
  if (!html.includes('href="/chicago/"')) {
    html = html.replace(/(<a href="\/about\/">About Us<\/a>)/, '$1<a href="/chicago/">Chicago</a>');
  }
  if (!html.includes('href="/authors/"')) {
    html = html.replace(/(<a href="\/about\/">About Us<\/a>)/, '$1<a href="/authors/">Authors</a>');
  }
  if (!html.includes('href="/compare/"')) {
    html = html.replace(/(<a href="\/products\/">Products<\/a>)/, '$1<a href="/compare/">Compare 4DAlert</a>');
  }
  if (html !== before) { write(file, html); footerPatched++; }
}
console.log('footer links added to', footerPatched, 'pages');

// ---------- 2. RSS feed ----------
const posts = getPosts()
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : -1));
const MON = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
const rfc822 = human => {
  const m = human.match(/^([A-Za-z]{3})[a-z]* (\d{1,2}), (\d{4})$/);
  return new Date(Date.UTC(+m[3], +MON[m[1]] - 1, +m[2], 9, 0, 0)).toUTCString();
};
const escXml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const items = posts.map(p => `    <item>
      <title>${escXml(p.title)}</title>
      <link>${SITE}/blog/${p.slug}/</link>
      <guid isPermaLink="true">${SITE}/blog/${p.slug}/</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <dc:creator>${escXml(p.author)}</dc:creator>
      <category>${escXml(p.catLabel)}</category>
      <description>${escXml(p.excerpt)}</description>
    </item>`).join('\n');

write(path.join(ROOT, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Performalytic Blog — Enterprise Data, Analytics &amp; AI</title>
    <link>${SITE}/blog/</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Practical guides on data reconciliation, master data management, data quality, AI, and analytics from the Performalytic team.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(TODAY + 'T09:00:00Z').toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`);
console.log('feed.xml:', posts.length, 'items');

// ---------- 3. Sitemap with git-based lastmod ----------
const EXCLUDE_DIRS = ['_case-studies', '_partners', 'assets', 'node_modules', '.git', '.github', 'scripts'];
const EXCLUDE_FILES = ['404.html', 'maintenance.html', 'thank-you.html', 'CNAME'];
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!EXCLUDE_DIRS.includes(e.name)) walk(p); }
    else if (e.name.endsWith('.html') && !EXCLUDE_FILES.includes(e.name) && !e.name.startsWith('__')) files.push(p);
  }
})(ROOT);

function gitDate(file) {
  try {
    const d = execSync(`git log -1 --format=%cs -- "${path.relative(ROOT, file).replace(/\\/g, '/')}"`, { cwd: ROOT, encoding: 'utf8' }).trim();
    if (d) return d;
  } catch (e) { /* fall through */ }
  return fs.statSync(file).mtime.toISOString().slice(0, 10);
}

const urls = files.map(file => {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  let u = rel.endsWith('index.html') ? '/' + rel.replace(/index\.html$/, '') : '/' + rel;
  if (u === '/index.html') u = '/';
  const priority = u === '/' ? '1.0'
    : u === '/case-studies/' || u === '/products/' || u === '/about/' || u === '/contact/' || u === '/compare/' || u === '/chicago/' ? '0.8'
    : u.startsWith('/blog/') || u.startsWith('/knowledge/') ? '0.7'
    : u.startsWith('/authors/') ? '0.5'
    : u === '/sitemap.html' ? '0.3'
    : u.includes('privacy-policy') || u.includes('terms-conditions') || u.includes('cookie-policy') ? '0.3'
    : '0.6';
  return { loc: SITE + u, lastmod: process.env.SITEMAP_LASTMOD || gitDate(file), priority };
}).sort((a, b) => a.loc.localeCompare(b.loc));

write(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`);
console.log('sitemap.xml:', urls.length, 'urls');

// Keep the checked-in generator working: root wrapper delegates to this script.
write(path.join(ROOT, 'generate-sitemap.js'), `'use strict';
// Generates sitemap.xml using git commit dates for lastmod.
// Usage: node generate-sitemap.js
require('./scripts/10-feed-sitemap.js');
`);

// ---------- 4. robots.txt ----------
let robots = read(path.join(ROOT, 'robots.txt'));
if (!robots.includes('llms.txt')) {
  robots = robots.replace('# AI / LLM crawlers (explicitly allowed)',
    '# LLM guidance\n# LLMs: https://performalytic.com/llms.txt\n\n# AI / LLM crawlers (explicitly allowed)');
}
if (!robots.includes('Sitemap: https://performalytic.com/sitemap.xml')) {
  robots += '\nSitemap: https://performalytic.com/sitemap.xml\n';
}
write(path.join(ROOT, 'robots.txt'), robots);
console.log('robots.txt updated');

// ---------- 5. IndexNow key + submission script ----------
const KEY = 'b7f4c2e9a1d64f0e8c35b9d2a6e71c48';
write(path.join(ROOT, `${KEY}.txt`), KEY + '\n');
write(path.join(ROOT, 'scripts', 'indexnow.js'), `'use strict';
// Submit every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver).
// Run after deploy: node scripts/indexnow.js
const fs = require('fs');
const path = require('path');
const KEY = '${KEY}';
const SITE = '${SITE}';

(async () => {
  const xml = fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8');
  const urlList = [...xml.matchAll(/<loc>([^<]+)<\\/loc>/g)].map(m => m[1]);
  const body = {
    host: new URL(SITE).host,
    key: KEY,
    keyLocation: SITE + '/' + KEY + '.txt',
    urlList
  };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body)
  });
  console.log('IndexNow', res.status, res.statusText, '| URLs:', urlList.length);
  if (!res.ok) console.log(await res.text());
})();
`);
console.log('IndexNow key file + scripts/indexnow.js');

// ---------- 6. llms.txt additions ----------
const llmsFile = path.join(ROOT, 'llms.txt');
let llms = read(llmsFile);
if (!llms.includes('/authors/')) {
  llms = llms.replace('## Company', `## Authors

- [Authors](https://performalytic.com/authors/): The practitioners who write Performalytic's technical guides
- [James Carter](https://performalytic.com/authors/james-carter/): Senior Data Engineer — reconciliation, schema change, database CI/CD
- [Sarah Mitchell](https://performalytic.com/authors/sarah-mitchell/): Data Quality Lead — data quality, observability, entity resolution
- [David Kim](https://performalytic.com/authors/david-kim/): AI Solutions Architect — RAG, AI agents, production AI
- [Priya Nair](https://performalytic.com/authors/priya-nair/): Data Governance Consultant — MDM, governance, analytics platforms
- [Emma Wilson](https://performalytic.com/authors/emma-wilson/): Data Strategy Consultant — data culture, AI-native quality, operating models

## Comparison & Local

- [4DAlert comparisons](https://performalytic.com/compare/): 4DAlert vs legacy MDM, dbt tests, Great Expectations, and in-house builds
- [Chicago data consulting](https://performalytic.com/chicago/): Chicago HQ, services, industries, and local delivery

## Case Studies

- [Customer results](https://performalytic.com/case-studies/): Anonymized enterprise engagements with measured outcomes
- [Financial services regulatory reporting](https://performalytic.com/case-studies/financial-services-regulatory-reporting/): 60% less audit preparation time across 25+ systems
- [Manufacturing data reconciliation](https://performalytic.com/case-studies/manufacturing-data-reconciliation/): 98% accuracy across SAP, Snowflake, and 12 analytics platforms
- [Healthcare DataOps automation](https://performalytic.com/case-studies/healthcare-dataops-automation/): Zero schema deployment errors with automated CI/CD

## Company`);
  llms = llms.replace('## Company\n\n## Company', '## Company');
}
if (!llms.includes('feed.xml')) {
  llms += '\n## Feeds\n\n- [Blog RSS](https://performalytic.com/feed.xml)\n- [Sitemap](https://performalytic.com/sitemap.xml)\n';
}
write(llmsFile, llms);
console.log('llms.txt updated');

// ---------- 7. llms-full.txt additions ----------
const fullFile = path.join(ROOT, 'llms-full.txt');
let full = read(fullFile);
if (!full.includes('## Authors')) {
  full += `

## Authors

Performalytic's guides are written by practitioners. Author pages list each writer's role, expertise, and published articles.

- James Carter, Senior Data Engineer: https://performalytic.com/authors/james-carter/
- Sarah Mitchell, Data Quality Lead: https://performalytic.com/authors/sarah-mitchell/
- David Kim, AI Solutions Architect: https://performalytic.com/authors/david-kim/
- Priya Nair, Data Governance Consultant: https://performalytic.com/authors/priya-nair/
- Emma Wilson, Data Strategy Consultant: https://performalytic.com/authors/emma-wilson/

## Case Studies

- Financial services regulatory reporting: automated reconciliation across 25+ systems; 60% reduction in audit preparation time and 40% faster reporting cycles. https://performalytic.com/case-studies/financial-services-regulatory-reporting/
- Manufacturing data reconciliation: 98% reconciliation accuracy across SAP, Snowflake, and 12 analytics platforms. https://performalytic.com/case-studies/manufacturing-data-reconciliation/
- Healthcare DataOps automation: zero schema deployment errors after automated CI/CD and version control. https://performalytic.com/case-studies/healthcare-dataops-automation/

## Comparisons

4DAlert compared with legacy MDM suites, dbt tests, Great Expectations, and in-house builds: https://performalytic.com/compare/

## Chicago

Performalytic is headquartered at 111 W. Jackson Blvd, Suite 1700, Chicago, IL 60604. Chicago consulting page: https://performalytic.com/chicago/

## Feeds

- Blog RSS: https://performalytic.com/feed.xml
- Sitemap: https://performalytic.com/sitemap.xml
`;
}
write(fullFile, full);
console.log('llms-full.txt updated');
