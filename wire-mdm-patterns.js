const fs = require('fs');
const JOB = { slug: 'mdm-implementation-patterns', from: ['hero-mdm-ai-era-og.png', 'hero-mdm-ai-era.svg'], to: 'hero-mdm-implementation-patterns.svg' };
const p = 'blog/' + JOB.slug + '/index.html';
let h = fs.readFileSync(p, 'utf8');
const before = h;
for (const f of JOB.from) {
  console.log('  ' + f + ' -> ' + (h.split(f).length - 1));
  h = h.split(f).join(JOB.to);
}
h = h.replace(/(<meta property="og:image:type" content=")[^"]*(" \/>)/, '$1image/svg+xml$2');
if (h !== before) { fs.writeFileSync(p, h, 'utf8'); console.log('post updated'); } else console.log('post unchanged');

const ip = 'blog/index.html';
let ih = fs.readFileSync(ip, 'utf8');
const re = new RegExp('(slug:"' + JOB.slug + '"[^\\n]*?img:")([^"]*)(")');
const m = ih.match(re);
if (m && m[2] !== '/assets/images/blog/' + JOB.to) {
  ih = ih.replace(re, '$1/assets/images/blog/' + JOB.to + '$3');
  fs.writeFileSync(ip, ih, 'utf8');
  console.log('index: ' + m[2] + ' -> /assets/images/blog/' + JOB.to);
} else console.log('index: ' + (m ? 'already set' : 'entry NOT FOUND'));
