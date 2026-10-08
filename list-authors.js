const fs = require('fs');
const h = fs.readFileSync('blog/index.html', 'utf8');
const objects = h.split('{slug:').slice(1);
const a = [];
const all = [];
for (const o of objects) {
  const slug = (o.match(/^"([^"]+)"/) || [])[1];
  if (!slug) continue;
  all.push(slug);
  const author = (o.match(/author:"([^"]+)"/) || [])[1];
  if (author) a.push([slug, author]);
}
console.log('posts with author in index:', a.length, '/', all.length);
const by = {};
a.forEach(m => { by[m[1]] = (by[m[1]] || 0) + 1; });
console.log(JSON.stringify(by, null, 2));
const have = a.map(m => m[0]);
console.log('slugs missing author field:');
console.log(all.filter(s => !have.includes(s)).join('\n') || '(none)');
console.log('\n--- slug -> author ---');
a.forEach(m => console.log('  ' + m[0] + ' -> ' + m[1]));

