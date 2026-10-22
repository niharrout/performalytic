'use strict';
const path = require('path');
const { ROOT, read, write } = require('./lib');

const CSS = `.roi-callout{max-width:820px;margin:0 auto 36px;padding:22px 26px;border:1px solid rgba(124,58,237,.28);border-left:4px solid #7c3aed;border-radius:12px;background:var(--pa-wb-003)}\n.roi-callout h2{font-size:.72rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#a78bfa;margin-bottom:8px}\n.roi-callout p{font-size:1rem;line-height:1.7;color:var(--pa-t);margin:0}\n`;

for (const slug of ['data-quality-framework', 'real-cost-of-bad-data']) {
  const file = path.join(ROOT, 'blog', slug, 'index.html');
  let html = read(file);
  html = html.replace('<div class="quick-answer" style="border-left-color:#7c3aed;border-color:rgba(124,58,237,.25)">', '<div class="roi-callout">');
  if (!html.includes('.roi-callout{')) html = html.replace('</head>', `<style>${CSS}</style>\n</head>`);
  write(file, html);
  console.log('roi callout class:', slug);
}
