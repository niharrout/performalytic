'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, read, write, walkHtml, pageUrl } = require('./lib');

let footer = 0;
for (const file of walkHtml()) {
  let html = read(file);
  const before = html;
  if (!html.includes('href="/editorial-policy/"')) {
    html = html.replace(/(<a href="\/authors\/">Authors<\/a>)/, '$1<a href="/editorial-policy/">Editorial Policy</a>');
  }
  if (html !== before) { write(file, html); footer++; }
}
console.log('footer editorial links:', footer);

for (const slug of ['james-carter', 'sarah-mitchell', 'david-kim', 'priya-nair', 'emma-wilson']) {
  const file = path.join(ROOT, 'authors', slug, 'index.html');
  let html = read(file);
  if (!html.includes('href="/editorial-policy/"')) {
    html = html.replace('</main>', '<p class="ep-meta" style="max-width:820px;margin:0 auto;padding:0 24px 40px;color:var(--pa-t-dim);font-size:.85rem">All Performalytic guides follow our <a href="/editorial-policy/" style="color:var(--pa-at-blue)">editorial policy</a>.</p>\n</main>');
    write(file, html);
    console.log('author editorial link', slug);
  }
}

{
  const file = path.join(ROOT, 'sitemap.html');
  let html = read(file);
  if (!html.includes('href="/editorial-policy/"')) {
    html = html.replace('<li><a href="/authors/">Authors<span class="url-path">/authors/</span></a></li>',
      '<li><a href="/authors/">Authors<span class="url-path">/authors/</span></a></li>\n          <li><a href="/editorial-policy/">Editorial Policy<span class="url-path">/editorial-policy/</span></a></li>');
    write(file, html);
    console.log('sitemap.html editorial link');
  }
}

{
  const file = path.join(ROOT, 'llms.txt');
  let llms = read(file);
  if (!llms.includes('/editorial-policy/')) {
    llms = llms.replace('## Comparison & Local', '## Editorial\n\n- [Editorial policy](https://performalytic.com/editorial-policy/): How Performalytic researches, reviews, updates, and corrects its guides\n\n## Comparison & Local');
    write(file, llms);
    console.log('llms.txt editorial link');
  }
}
