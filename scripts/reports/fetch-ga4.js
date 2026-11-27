'use strict';

const { requestJson, getGoogleAccessToken } = require('./lib');

function propertyId() {
  const raw = process.env.GA4_PROPERTY_ID || '';
  return raw.replace(/^properties\//, '').trim();
}

async function runReport(token, id, body) {
  return requestJson(
    'POST',
    `https://analyticsdata.googleapis.com/v1beta/properties/${id}:runReport`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(body))
      },
      body: JSON.stringify(body)
    }
  );
}

/**
 * Pull GA4 traffic and event rows.
 *
 * Traffic is aggregated by source / medium / landing page so the report can
 * separate AI assistants from organic search and direct traffic.
 */
async function fetchGa4({ startDate, endDate }) {
  const id = propertyId();
  if (!id) {
    return {
      configured: false,
      traffic: [],
      events: [],
      error: 'GA4_PROPERTY_ID is not set'
    };
  }

  const token = await getGoogleAccessToken([
    'https://www.googleapis.com/auth/analytics.readonly'
  ]);
  if (!token) {
    return {
      configured: false,
      traffic: [],
      events: [],
      error: 'GOOGLE_SERVICE_ACCOUNT_JSON is not set'
    };
  }

  const trafficJson = await runReport(token, id, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'sessionSource' },
      { name: 'sessionMedium' },
      { name: 'landingPage' }
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'screenPageViews' }
    ],
    limit: 10000,
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
  });

  const traffic = (trafficJson.rows || []).map((row) => ({
    source: (row.dimensionValues[0] || {}).value || '(not set)',
    medium: (row.dimensionValues[1] || {}).value || '(not set)',
    landingPage: (row.dimensionValues[2] || {}).value || '(not set)',
    sessions: Number((row.metricValues[0] || {}).value || 0),
    users: Number((row.metricValues[1] || {}).value || 0),
    views: Number((row.metricValues[2] || {}).value || 0)
  }));

  let events = [];
  try {
    const eventsJson = await runReport(token, id, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          inListFilter: {
            values: ['ai_referral', 'outbound_click', 'book_meeting_click']
          }
        }
      },
      limit: 100
    });
    events = (eventsJson.rows || []).map((row) => ({
      eventName: (row.dimensionValues[0] || {}).value || '(not set)',
      count: Number((row.metricValues[0] || {}).value || 0)
    }));
  } catch (error) {
    events = [{ eventName: 'query_error', count: 0, error: error.message }];
  }

  return { configured: true, traffic, events, error: null };
}

module.exports = { fetchGa4 };
