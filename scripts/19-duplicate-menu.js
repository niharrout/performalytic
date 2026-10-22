'use strict';
const path = require('path');
const { ROOT, read, write } = require('./lib');

for (const slug of ['automated-data-reconciliation', 'future-of-automated-data-reconciliation']) {
  const file = path.join(ROOT, 'blog', slug, 'index.html');
  let html = read(file);
  const marker = '<div class="mobile-menu" id="mobileMenu" role="navigation" aria-label="Mobile navigation">';
  const start = html.indexOf(marker);
  const main = html.indexOf('<main id="main-content">');
  if (start === -1 || main === -1 || start > main) { console.log('NO MATCH', slug, start, main); continue; }
  const removed = html.slice(start, main);
  html = html.slice(0, start) + html.slice(main);
  write(file, html);
  console.log('removed duplicate mobile menu:', slug, 'chars', removed.length);
}
