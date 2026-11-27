'use strict';

const { requestJson, getGoogleAccessToken } = require('./lib');

const DIMENSIONS = ['query', 'page', 'date', 'country', 'device'];
const PAGE_SIZE = 25000;

/**
 * Pull Search Console search analytics rows.
 *
 * Returns { configured, rows, error } and never throws for missing credentials.
 */
async function fetchGsc({ siteUrl, startDate, endDate }) {
  const token = await getGoogleAccessToken([
    'https://www.googleapis.com/auth/webmasters.readonly'
  ]);
  if (!token) {
    return { configured: false, rows: [], error: 'GOOGLE_SERVICE_ACCOUNT_JSON is not set' };
  }

  const endpoint =
    'https://searchconsole.googleapis.com/webmasters/v3/sites/' +
    encodeURIComponent(siteUrl) +
    '/searchAnalytics/query';

  const rows = [];
  let startRow = 0;

  for (let page = 0; page < 20; page++) {
    const body = JSON.stringify({
      startDate,
      endDate,
      dimensions: DIMENSIONS,
      rowLimit: PAGE_SIZE,
      startRow,
      type: 'web'
    });

    const json = await requestJson('POST', endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      body
    });

    const batch = json.rows || [];
    for (const row of batch) {
      const keys = row.keys || [];
      rows.push({
        query: keys[0] || '',
        page: keys[1] || '',
        date: keys[2] || '',
        country: keys[3] || '',
        device: keys[4] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      });
    }

    if (batch.length < PAGE_SIZE) break;
    startRow += PAGE_SIZE;
  }

  return { configured: true, rows, error: null };
}

module.exports = { fetchGsc };
