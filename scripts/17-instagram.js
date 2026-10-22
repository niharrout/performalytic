'use strict';
const { read, write, walkHtml } = require('./lib');
let n = 0;
for (const file of walkHtml()) {
  let html = read(file);
  const before = html;
  html = html.split('https://www.instagram.com/performalytic-corp/').join('https://www.instagram.com/performalytic-corp');
  if (html !== before) { write(file, html); n++; }
}
console.log('instagram normalized:', n);
