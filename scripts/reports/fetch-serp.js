'use strict';

const { requestJson, isOurDomain, sleep } = require('./lib');

function provider() {
  if (process.env.SERPAPI_KEY) return 'serpapi';
  if (process.env.GOOGLE_CSE_KEY && process.env.GOOGLE_CSE_CX) return 'google-cse';
  return null;
}

async function serpApi(query) {
  const url =
    'https://serpapi.com/search.json?engine=google' +
    `&q=${encodeURIComponent(query)}` +
    '&num=20&hl=en&gl=us' +
    `&api_key=${encodeURIComponent(process.env.SERPAPI_KEY)}`;
  const json = await requestJson('GET', url);
  if (json.error) throw new Error(`SerpAPI: ${json.error}`);
  return (json.organic_results || []).map((row, index) => ({
    position: row.position || index + 1,
    title: row.title || '',
    link: row.link || ''
  }));
}

async function googleCse(query) {
  const url =
    'https://www.googleapis.com/customsearch/v1' +
    `?key=${encodeURIComponent(process.env.GOOGLE_CSE_KEY)}` +
    `&cx=${encodeURIComponent(process.env.GOOGLE_CSE_CX)}` +
    `&q=${encodeURIComponent(query)}&num=10&hl=en&gl=us`;
  const json = await requestJson('GET', url);
  return (json.items || []).map((row, index) => ({
    position: index + 1,
    title: row.title || '',
    link: row.link || ''
  }));
}

/**
 * Check where performalytic.com / 4dalert.com appear in the top results for
 * each priority keyword. This catches queries Search Console cannot show:
 * ones where we do not rank at all.
 */
async function fetchSerp({ keywords, maxQueries }) {
  const p = provider();
  if (!p) {
    return {
      configured: false,
      provider: null,
      results: [],
      error: 'SERPAPI_KEY or GOOGLE_CSE_KEY + GOOGLE_CSE_CX is not set'
    };
  }

  const limit = Number(process.env.SERP_MAX_QUERIES || maxQueries || 10);
  const list = keywords.slice(0, limit);
  const results = [];

  for (const item of list) {
    try {
      const top = p === 'serpapi' ? await serpApi(item.keyword) : await googleCse(item.keyword);
      const hit = top.find((row) => isOurDomain(row.link));
      results.push({
        query: item.keyword,
        tier: item.tier || '',
        found: Boolean(hit),
        position: hit ? hit.position : null,
        url: hit ? hit.link : '',
        top: top.slice(0, 5)
      });
    } catch (error) {
      results.push({
        query: item.keyword,
        tier: item.tier || '',
        found: false,
        position: null,
        url: '',
        top: [],
        error: error.message
      });
    }
    await sleep(600);
  }

  return { configured: true, provider: p, results, error: null };
}

module.exports = { fetchSerp };
