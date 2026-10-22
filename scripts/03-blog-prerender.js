'use strict';
const path = require('path');
const { ROOT, AUTHORS, getPosts, read, write, esc, isoDate } = require('./lib');

const file = path.join(ROOT, 'blog', 'index.html');
let html = read(file);
const posts = getPosts();
const featured = posts.find(p => p.featured) || posts[0];
const rest = posts.filter(p => p.slug !== featured.slug);
const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const authorLink = n => `<a href="/authors/${AUTHORS[n].slug}/" rel="author">${esc(n)}</a>`;

function card(p, tag) {
  return `<article class="blog-card" data-category="${p.category}">
  <div class="blog-card-thumb"><img src="${p.img}" alt="${esc(p.title)}" loading="lazy" decoding="async" width="400" height="200" /></div>
  <div class="blog-card-body">
    <span class="post-category">${esc(p.catLabel)}</span>
    <div class="post-meta"><span>${esc(p.readTime)}</span></div>
    <${tag}><a href="/blog/${p.slug}/">${esc(p.title)}</a></${tag}>
    <p>${esc(p.excerpt)}</p>
    <div class="post-author">
      <div class="post-author-avatar">${initials(p.author)}</div>
      <div class="post-author-info">
        <div class="author-name">By ${authorLink(p.author)}</div>
        <div class="author-date">${esc(p.date)}</div>
      </div>
    </div>
    <a href="/blog/${p.slug}/" class="read-more">Read More &rarr;</a>
  </div>
</article>`;
}

function featuredCard(p) {
  return `<article class="featured-post" data-category="${p.category}">
  <div class="featured-post-img">
    <img src="${p.img}" alt="${esc(p.title)}" loading="eager" decoding="async" width="600" height="400" />
    <span class="featured-badge">Featured</span>
  </div>
  <div class="featured-post-body">
    <span class="post-category">${esc(p.catLabel)}</span>
    <div class="post-meta"><span>${esc(p.readTime)}</span></div>
    <h2><a href="/blog/${p.slug}/">${esc(p.title)}</a></h2>
    <p>${esc(p.excerpt)}</p>
    <div class="post-author">
      <div class="post-author-avatar">${initials(p.author)}</div>
      <div class="post-author-info">
        <div class="author-name">By ${authorLink(p.author)}</div>
        <div class="author-date">${esc(p.date)}</div>
      </div>
    </div>
    <a href="/blog/${p.slug}/" class="read-more">Read More &rarr;</a>
  </div>
</article>`;
}

// 1. Pre-render static cards so HTML-only crawlers (GPTBot, ClaudeBot,
//    PerplexityBot) see every article. JS still re-renders the interactive grid.
const featuredBlock = `<div id="featuredPost" data-static-prerender="1">${featuredCard(featured)}</div>`;
html = html.replace(/<div id="featuredPost"><\/div>/, featuredBlock);
html = html.replace(/<div id="blogGrid" class="blog-grid"><\/div>/,
  `<div id="blogGrid" class="blog-grid" data-static-prerender="1">${rest.map(p => card(p, 'h3')).join('\n')}</div>`);

// 2. Update the JS renderers so hydration keeps author links.
html = html.replace(/<div class="author-name">By '\+p\.author\+'<\/div>/,
  `<div class="author-name">By <a href="/authors/'+AUTHOR_SLUGS[p.author]+'/" rel="author">'+p.author+'</a></div>`);
html = html.replace("var POSTS_PER_PAGE=6;",
  `var AUTHOR_SLUGS=${JSON.stringify(Object.fromEntries(Object.entries(AUTHORS).map(([n, a]) => [n, a.slug])))};\nvar POSTS_PER_PAGE=6;`);
html = html.replace(/return catMatch&&searchMatch;\n\}\);\n\}/,
  "return catMatch&&searchMatch;\n});\nfilteredPosts.sort(function(a,b){return (b.featured?1:0)-(a.featured?1:0);});\n}");

// 3. Fix "Popular Posts" sidebar: titles, dates, and destinations now match.
const popular = ['data-reconciliation-guide', 'ai-master-data-management', 'schema-compare-tools', 'enterprise-rag-architecture'];
const popularHtml = popular.map(slug => {
  const p = posts.find(x => x.slug === slug);
  return `<div class="popular-post">
<div class="popular-post-thumb">
<img src="${p.img}" alt="" loading="lazy" decoding="async" width="64" height="32" />
</div>
<div class="popular-post-info">
<h4><a href="/blog/${p.slug}/">${esc(p.title)}</a></h4>
<span class="post-date">${esc(p.date)}</span>
</div>
</div>`;
}).join('\n');
html = html.replace(/<div class="sidebar-card">\s*<h3>Popular Posts<\/h3>[\s\S]*?<\/div>\s*<\/div>\s*<!-- Categories -->/,
  `<div class="sidebar-card">\n<h3>Popular Posts</h3>\n${popularHtml}\n</div>\n\n<!-- Categories -->`);

// 4. RSS discovery
if (!html.includes('application/rss+xml')) {
  html = html.replace('</head>', '<link rel="alternate" type="application/rss+xml" title="Performalytic Blog" href="/feed.xml" />\n</head>');
}

write(file, html);
console.log('featured:', featured.slug, '| static cards:', rest.length, '| popular fixed:', popular.length);
