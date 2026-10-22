'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, SITE, TODAY, AUTHORS, isoDate, getPosts, read, write, pageUrl, esc, mapJsonLd } = require('./lib');

const posts = getPosts();
const report = [];
const byAuthor = new Map();

// ---------- 1. Post bylines, <time>, Person schema ----------
for (const post of posts) {
  const file = path.join(ROOT, 'blog', post.slug, 'index.html');
  if (!fs.existsSync(file)) { report.push('MISSING ' + post.slug); continue; }
  const a = AUTHORS[post.author];
  if (!a) throw new Error('Unknown author: ' + post.author);
  const iso = isoDate(post.date);
  const url = `${SITE}/authors/${a.slug}/`;
  const personId = url + '#person';

  let html = read(file);
  const before = html;

  // meta author
  html = html.replace(/<meta name="author" content="[^"]*"\s*\/?>/,
    `<meta name="author" content="${esc(post.author)}" />`);
  html = html.replace(/<meta property="article:author" content="[^"]*"\s*\/?>/,
    `<meta property="article:author" content="${esc(post.author)}" />`);

  // Visible byline + machine-readable date inside the post meta row.
  if (!html.includes('post-meta-author')) {
    html = html.replace(/(<div class="post-meta">)([\s\S]*?)(<\/div>)/, (full, open, inner, close) => {
      if (!/post-meta-category/.test(inner)) return full;
      const dateMatch = inner.match(/<span>(\s*(?:&#128197;\s*)?)([A-Z][a-z]+ \d{1,2}, \d{4})<\/span>/);
      if (!dateMatch) return full;
      let out = inner.replace(dateMatch[0], `<time datetime="${iso}">${dateMatch[2]}</time>`);
      out = out.replace(/(<span class="post-meta-category">[\s\S]*?<\/span>)/,
        `$1\n          <span class="post-meta-author">By <a href="/authors/${a.slug}/" rel="author">${esc(post.author)}</a>, ${esc(a.role)}</span>`);
      return open + out + close;
    });
  }

  // JSON-LD: full Person node + Article linkage
  html = mapJsonLd(html, data => {
    const arr = Array.isArray(data) ? data : [data];
    let person = arr.find(o => o && o['@type'] === 'Person');
    const personNode = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': personId,
      name: post.author,
      jobTitle: a.role,
      description: a.bio,
      url,
      image: `/assets/images/blog/${post.img.split('/').pop()}`,
      worksFor: { '@id': `${SITE}/#organization` },
      knowsAbout: a.knowsAbout,
      mainEntityOfPage: url
    };
    if (person) Object.assign(person, personNode);
    else arr.splice(1, 0, personNode);

    for (const o of arr) {
      if (o && (o['@type'] === 'Article' || o['@type'] === 'BlogPosting')) {
        o.author = { '@id': personId };
      }
    }
    return arr;
  });

  if (html === before) report.push('NOCHANGE ' + post.slug);
  write(file, html);
  byAuthor.set(post.author, (byAuthor.get(post.author) || 0) + 1);
}

// ---------- 2. Author pages ----------
const shellFile = path.join(ROOT, 'case-studies', 'index.html');
const shell = read(shellFile);
const shellHead = shell.slice(0, shell.indexOf('</head>'));
const shellTail = shell.slice(shell.indexOf('</main>') + '</main>'.length);

const AUTHOR_CSS = `<style>
.author-hero{padding:150px 0 56px;background:linear-gradient(180deg,var(--pa-bg),var(--pa-bg-2));border-bottom:1px solid var(--pa-wd-004)}
.author-profile{display:flex;gap:28px;align-items:flex-start;flex-wrap:wrap}
.author-avatar{width:104px;height:104px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#7c3aed);display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem;font-weight:800;flex-shrink:0}
.author-name{font-size:clamp(2rem,4vw,2.6rem);font-weight:800;color:var(--pa-t-strong);line-height:1.15;margin-bottom:6px}
.author-role{color:var(--pa-at-blue);font-weight:600;margin-bottom:14px}
.author-bio{color:var(--pa-t-muted);max-width:720px;line-height:1.75}
.author-tags{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
.author-tag{font-size:.75rem;font-weight:600;padding:5px 12px;border-radius:100px;background:var(--pa-wb-004);border:1px solid var(--pa-wd-008);color:var(--pa-t-muted)}
.author-posts{padding:64px 0}
.author-post-list{display:grid;gap:18px;max-width:900px}
.author-post{display:block;padding:22px 24px;border:1px solid var(--pa-wd-006);border-radius:14px;background:var(--pa-wb-002);text-decoration:none;transition:border-color .2s,transform .2s}
.author-post:hover{border-color:rgba(96,165,250,.3);transform:translateY(-2px)}
.author-post h3{font-size:1.05rem;font-weight:700;color:var(--pa-t);margin-bottom:6px}
.author-post p{font-size:.9rem;color:var(--pa-t-muted);line-height:1.65;margin-bottom:8px}
.author-post .meta{font-size:.78rem;color:var(--pa-t-dim)}
.author-index-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:22px;padding:64px 0}
.author-card{display:block;padding:28px;border:1px solid var(--pa-wd-006);border-radius:16px;background:var(--pa-wb-002);text-decoration:none;transition:border-color .2s,transform .2s}
.author-card:hover{border-color:rgba(96,165,250,.3);transform:translateY(-3px)}
.author-card .author-avatar{width:64px;height:64px;font-size:1.25rem;margin-bottom:16px}
.author-card h2{font-size:1.15rem;color:var(--pa-t);margin-bottom:4px}
.author-card .role{color:var(--pa-at-blue);font-size:.85rem;font-weight:600;margin-bottom:10px}
.author-card p{font-size:.88rem;color:var(--pa-t-muted);line-height:1.65}
.author-card .count{display:inline-block;margin-top:14px;font-size:.75rem;color:var(--pa-t-dim)}
@media(max-width:640px){.author-hero{padding:120px 0 40px}.author-avatar{width:80px;height:80px;font-size:1.55rem}}
</style>`;

function initials(name) { return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(); }

function pageHead({ title, desc, canonical, image, schema }) {
  let head = shellHead;
  head = head.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  head = head.replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(desc)}" />`);
  head = head.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${canonical}" />`);
  head = head.replace(/<link rel="alternate" hreflang="en" href="[^"]*"\s*\/?>/, `<link rel="alternate" hreflang="en" href="${canonical}" />`);
  head = head.replace(/<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/?>/, `<link rel="alternate" hreflang="x-default" href="${canonical}" />`);
  head = head.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${canonical}" />`);
  head = head.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(title)}" />`);
  head = head.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(desc)}" />`);
  head = head.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(title)}" />`);
  head = head.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(desc)}" />`);
  if (image) head = head.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${image}" />`);
  head = head.replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
  return head.replace('</head>', AUTHOR_CSS + '\n</head>');
}

function breadcrumbs(name, url) {
  return [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
    { '@type': 'ListItem', position: 2, name: 'Authors', item: SITE + '/authors/' },
    { '@type': 'ListItem', position: 3, name, item: url }
  ];
}

for (const [name, a] of Object.entries(AUTHORS)) {
  const mine = posts.filter(p => p.author === name).sort((x, y) => new Date(isoDate(y.date)) - new Date(isoDate(x.date)));
  const url = `${SITE}/authors/${a.slug}/`;
  const title = `${name} — ${a.role} | Performalytic`;
  const desc = `${name}, ${a.role} at Performalytic, writes about ${a.knowsAbout.slice(0, 3).join(', ')}. Browse all ${mine.length} articles.`;
  const personId = url + '#person';

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      '@id': url,
      url,
      name: `${name} — ${a.role}`,
      description: desc,
      mainEntity: { '@id': personId },
      isPartOf: { '@id': SITE + '/#website' }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': personId,
      name,
      jobTitle: a.role,
      description: a.bio,
      url,
      worksFor: { '@id': SITE + '/#organization' },
      knowsAbout: a.knowsAbout
    },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbs(name, url) },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Articles by ${name}`,
      itemListElement: mine.map((p, i) => ({
        '@type': 'ListItem', position: i + 1,
        url: `${SITE}/blog/${p.slug}/`, name: p.title
      }))
    }
  ];

  const main = `<main id="main-content">
<section class="author-hero">
  <div class="container">
    <div class="author-profile">
      <div class="author-avatar" aria-hidden="true">${initials(name)}</div>
      <div>
        <h1 class="author-name">${esc(name)}</h1>
        <div class="author-role">${esc(a.role)} at Performalytic</div>
        <p class="author-bio">${esc(a.bio)}</p>
        <div class="author-tags">${a.knowsAbout.map(k => `<span class="author-tag">${esc(k)}</span>`).join('')}</div>
      </div>
    </div>
  </div>
</section>
<section class="author-posts">
  <div class="container">
    <h2 class="section-title">Articles by ${esc(name)}</h2>
    <p class="section-subtitle">${mine.length} published ${mine.length === 1 ? 'guide' : 'guides'} on enterprise data, analytics, and AI.</p>
    <div class="author-post-list">
      ${mine.map(p => `<a class="author-post" href="/blog/${p.slug}/">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.excerpt)}</p>
        <div class="meta">${esc(p.date)} &middot; ${esc(p.readTime)}</div>
      </a>`).join('\n      ')}
    </div>
  </div>
</section>
<section class="cta-section" style="padding:72px 0">
  <div class="container text-center">
    <h2 class="section-title">Work with ${esc(name.split(' ')[0])} and the Performalytic team</h2>
    <p class="section-subtitle mx-auto">Talk to the people who build and write about enterprise data systems every day.</p>
    <div class="cta-buttons"><a href="/contact/" class="btn-hero-primary">Start a conversation &rarr;</a></div>
  </div>
</section>
</main>`;

  write(path.join(ROOT, 'authors', a.slug, 'index.html'),
    pageHead({ title, desc, canonical: url, image: SITE + '/assets/images/og-products.png', schema }) + main + shellTail);
  report.push(`author page: ${a.slug} (${mine.length} posts)`);
}

// Author hub
{
  const url = SITE + '/authors/';
  const title = 'Authors — Performalytic Data & AI Experts';
  const desc = 'Meet the Performalytic engineers, architects, and consultants who write our data reconciliation, MDM, AI, and analytics guides.';
  const schema = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': url, url, name: title, description: desc },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Authors', item: url }
    ] },
    { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: Object.entries(AUTHORS).map(([name, a], i) => ({
      '@type': 'ListItem', position: i + 1, url: `${SITE}/authors/${a.slug}/`, name
    })) }
  ];
  const main = `<main id="main-content">
<section class="author-hero">
  <div class="container">
    <span class="section-label">Authors</span>
    <h1 class="author-name">The people behind our guides</h1>
    <p class="author-bio">Every Performalytic article is written by a practitioner who works on enterprise data systems. Meet the team and browse their writing.</p>
  </div>
</section>
<section>
  <div class="container">
    <div class="author-index-grid">
      ${Object.entries(AUTHORS).map(([name, a]) => {
        const n = posts.filter(p => p.author === name).length;
        return `<a class="author-card" href="/authors/${a.slug}/">
        <div class="author-avatar" aria-hidden="true">${initials(name)}</div>
        <h2>${esc(name)}</h2>
        <div class="role">${esc(a.role)}</div>
        <p>${esc(a.bio)}</p>
        <span class="count">${n} ${n === 1 ? 'article' : 'articles'} &rarr;</span>
      </a>`;
      }).join('\n      ')}
    </div>
  </div>
</section>
</main>`;
  write(path.join(ROOT, 'authors', 'index.html'),
    pageHead({ title, desc, canonical: url, image: SITE + '/assets/images/og-products.png', schema }) + main + shellTail);
  report.push('author hub');
}

console.log(report.join('\n'));
console.log('authors:', Object.entries(Object.fromEntries(byAuthor)).map(([k, v]) => `${k}=${v}`).join(', '));
