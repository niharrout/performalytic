const fs = require('fs');
const path = require('path');

const dir = 'blog';
const out = [];
for (const d of fs.readdirSync(dir)) {
  const f = path.join(dir, d, 'index.html');
  if (!fs.existsSync(f)) continue;
  if (!fs.statSync(path.join(dir, d)).isDirectory()) continue;
  const h = fs.readFileSync(f, 'utf8');
  const h1m = h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const heroM = h.match(/class="hero-description"[^>]*>([\s\S]*?)<\/p>/);
  if (!h1m) continue;
  const strip = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  out.push({
    slug: d,
    h1: strip(h1m[1]),
    hero: heroM ? strip(heroM[1]) : '(NO hero-description)',
    hasHero: !!heroM,
    words: heroM ? strip(heroM[1]).split(/\s+/).length : 0
  });
}
out.sort((a, b) => a.slug.localeCompare(b.slug));
for (const p of out) {
  console.log('### ' + p.slug + (p.hasHero ? '' : '  [NO HERO]') + '  (' + p.words + 'w)');
  console.log('  H1:  ' + p.h1);
  console.log('  HERO: ' + p.hero.slice(0, 300));
  console.log('');
}
console.log('total posts:', out.length, '| no hero block:', out.filter(p => !p.hasHero).length);
