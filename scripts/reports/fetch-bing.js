'use strict';

const { requestJson } = require('./lib');

function bingSite() {
  return process.env.BING_SITE_URL || 'https://performalytic.com/';
}

/**
 * Pull Bing Webmaster query and daily traffic stats.
 *
 * Bing has no date-range parameter on these endpoints; the API returns the
 * most recent window it has. The report labels it "recent".
 */
async function fetchBing() {
  const key = process.env.BING_API_KEY;
  if (!key) {
    return { configured: false, queries: [], daily: [], error: 'BING_API_KEY is not set' };
  }

  const site = encodeURIComponent(bingSite());
  const base = 'https://ssl.bing.com/webmaster/api.svc/json';

  const queriesJson = await requestJson(
    'GET',
    `${base}/GetQueryStats?siteUrl=${site}&apikey=${encodeURIComponent(key)}`
  );
  const queries = (Array.isArray(queriesJson.d) ? queriesJson.d : []).map((row) => ({
    query: row.Query || '',
    impressions: row.Impressions || 0,
    clicks: row.Clicks || 0,
    avgClickPosition: row.AvgClickPosition || 0,
    avgImpressionPosition: row.AvgImpressionPosition || 0
  }));

  let daily = [];
  try {
    const dailyJson = await requestJson(
      'GET',
      `${base}/GetRankAndTrafficStats?siteUrl=${site}&apikey=${encodeURIComponent(key)}`
    );
    daily = (Array.isArray(dailyJson.d) ? dailyJson.d : []).map((row) => ({
      date: row.Date || '',
      clicks: row.Clicks || 0,
      impressions: row.Impressions || 0,
      position: row.AvgImpressionPosition || 0
    }));
  } catch (error) {
    daily = [];
  }

  return { configured: true, queries, daily, error: null };
}

module.exports = { fetchBing };
