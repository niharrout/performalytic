'use strict';
const path = require('path');
const { ROOT, read, write, walkHtml, pageUrl } = require('./lib');
const GOOD = 'https://performalytic.com/assets/images/GettyImages-618762080-1.jpg';
let n = 0;
for (const file of walkHtml()) {
  let html = read(file);
  if (!html.includes('og-products.png')) continue;
  html = html.split('https://performalytic.com/assets/images/og-products.png').join(GOOD);
  html = html.split('/assets/images/og-products.png').join('/assets/images/GettyImages-618762080-1.jpg');
  write(file, html);
  n++;
  console.log('og:image fixed', pageUrl(file));
}
console.log('total', n);
