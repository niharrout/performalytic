'use strict';
const { read, write, walkHtml, pageUrl } = require('./lib');

const report = [];
for (const file of walkHtml()) {
  let html = read(file);
  const m = html.match(/<title>([\s\S]*?)<\/title>/);
  if (!m) continue;
  const oldTitle = m[1];
  if (oldTitle.length <= 60) continue;

  let title = oldTitle
    .replace(/\s*\|\s*Performalytic Knowledge Hub$/, '')
    .replace(/\s*\|\s*Performalytic$/, '')
    .replace(/\s*-\s*Performalytic$/, '');

  if (title === oldTitle) continue;
  if (title.length > 60) {
    // Still long: drop the trailing qualifier after an em/en dash or colon.
    const cut = title.split(/\s+[—–]\s+/)[0];
    if (cut.length >= 30) title = cut;
  }
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`);
  write(file, html);
  report.push(`${pageUrl(file)} :: ${oldTitle.length} -> ${title.length} :: ${title}`);
}
console.log(report.join('\n'));
console.log('trimmed:', report.length);
