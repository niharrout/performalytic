'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, read, write, TODAY } = require('./lib');

// Author pages: Open Graph profile type
for (const slug of ['james-carter', 'sarah-mitchell', 'david-kim', 'priya-nair', 'emma-wilson']) {
  const file = path.join(ROOT, 'authors', slug, 'index.html');
  let html = read(file);
  html = html.replace(/<meta property="og:type" content="[^"]*"\s*\/?>/, '<meta property="og:type" content="profile" />');
  const name = slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  if (!html.includes('profile:first_name')) {
    html = html.replace('<meta property="og:type" content="profile" />',
      `<meta property="og:type" content="profile" />\n<meta property="profile:first_name" content="${name.split(' ')[0]}" />\n<meta property="profile:last_name" content="${name.split(' ').slice(1).join(' ')}" />`);
  }
  write(file, html);
  console.log('og:type profile', slug);
}

// Case studies + comparison: article type and publish/modified times
for (const rel of [
  'case-studies/financial-services-regulatory-reporting/index.html',
  'case-studies/manufacturing-data-reconciliation/index.html',
  'case-studies/healthcare-dataops-automation/index.html',
  'compare/index.html'
]) {
  const file = path.join(ROOT, rel);
  let html = read(file);
  html = html.replace(/<meta property="og:type" content="[^"]*"\s*\/?>/, '<meta property="og:type" content="article" />');
  if (!html.includes('article:published_time')) {
    html = html.replace('<meta property="og:type" content="article" />',
      `<meta property="og:type" content="article" />\n<meta property="article:published_time" content="${TODAY}T09:00:00+00:00" />\n<meta property="article:modified_time" content="${TODAY}T09:00:00+00:00" />\n<meta property="article:author" content="Performalytic" />`);
  }
  write(file, html);
  console.log('og:type article', rel);
}
