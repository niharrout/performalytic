'use strict';
const { SITE, read, write, walkHtml, pageUrl, mapJsonLd } = require('./lib');

const SAME_AS = [
  'https://www.linkedin.com/company/performalytic-corp/',
  'https://twitter.com/performalytic-corp',
  'https://www.facebook.com/performalytic-corp',
  'https://www.instagram.com/performalytic-corp',
  'https://www.youtube.com/@performalytic-corp'
];

let n = 0;
for (const file of walkHtml()) {
  let html = read(file);
  const before = html;
  html = mapJsonLd(html, data => {
    const arr = Array.isArray(data) ? data : [data];
    for (const o of arr) {
      if (!o || o['@type'] !== 'Organization') continue;
      o['@id'] = SITE + '/#organization';
      o.name = 'Performalytic';
      o.url = SITE + '/';
      o.logo = '/assets/images/performalytic-logo.png';
      if (!o.foundingDate) o.foundingDate = '2018';
      if (!o.sameAs) o.sameAs = SAME_AS;
      if (!o.address) {
        o.address = {
          '@type': 'PostalAddress',
          streetAddress: '111 W. Jackson Blvd, Suite 1700',
          addressLocality: 'Chicago',
          addressRegion: 'IL',
          postalCode: '60604',
          addressCountry: 'US'
        };
      }
      if (!o.contactPoint) {
        o.contactPoint = {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: 'info@performalytic.com',
          url: SITE + '/contact/'
        };
      }
    }
    return data;
  });
  if (html !== before) { write(file, html); n++; console.log(pageUrl(file)); }
}
console.log('normalized', n, 'pages');
