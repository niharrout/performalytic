'use strict';

const fs = require('fs');
const path = require('path');
const {
  ensureDir,
  writeJson,
  writeCsv,
  sum,
  pct,
  round,
  deltaPct,
  escapeHtml,
  fmt,
  fmtPct,
  isOurDomain
} = require('./lib');

const AI_SOURCE_RE =
  /(chatgpt|openai|perplexity|gemini|bard|copilot|claude|anthropic|you\.com|poe\.com|phind|kagi|duckduckgo)/i;

function norm(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesKeyword(query, keyword) {
  const q = norm(query);
  const k = norm(keyword);
  if (!q || !k) return false;
  if (k === '4dalert') return /4d\s*alert/.test(q);
  return q.includes(k);
}

function aggregateQueries(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!row.query) continue;
    let item = map.get(row.query);
    if (!item) {
      item = {
        query: row.query,
        clicks: 0,
        impressions: 0,
        posWeighted: 0,
        pages: new Map()
      };
      map.set(row.query, item);
    }
    item.clicks += row.clicks || 0;
    item.impressions += row.impressions || 0;
    item.posWeighted += (row.position || 0) * (row.impressions || 0);

    const page = row.page || '';
    let p = item.pages.get(page);
    if (!p) {
      p = { page, clicks: 0, impressions: 0, posWeighted: 0 };
      item.pages.set(page, p);
    }
    p.clicks += row.clicks || 0;
    p.impressions += row.impressions || 0;
    p.posWeighted += (row.position || 0) * (row.impressions || 0);
  }

  for (const item of map.values()) {
    item.position = item.impressions ? item.posWeighted / item.impressions : 0;
    item.ctr = item.impressions ? item.clicks / item.impressions : 0;
    const pages = [...item.pages.values()].sort((a, b) => b.impressions - a.impressions);
    item.topPage = pages[0] || null;
    if (item.topPage) {
      item.topPage.position = item.topPage.impressions
        ? item.topPage.posWeighted / item.topPage.impressions
        : 0;
      item.topPage.ctr = item.topPage.impressions
        ? item.topPage.clicks / item.topPage.impressions
        : 0;
    }
  }
  return map;
}

function aggregatePages(rows) {
  const map = new Map();
  for (const row of rows) {
    const page = row.page || '';
    let item = map.get(page);
    if (!item) {
      item = { page, clicks: 0, impressions: 0, posWeighted: 0 };
      map.set(page, item);
    }
    item.clicks += row.clicks || 0;
    item.impressions += row.impressions || 0;
    item.posWeighted += (row.position || 0) * (row.impressions || 0);
  }
  for (const item of map.values()) {
    item.position = item.impressions ? item.posWeighted / item.impressions : 0;
    item.ctr = item.impressions ? item.clicks / item.impressions : 0;
  }
  return map;
}

function totals(rows) {
  const clicks = sum(rows, 'clicks');
  const impressions = sum(rows, 'impressions');
  return {
    clicks,
    impressions,
    ctr: pct(clicks, impressions) * 100,
    position: impressions
      ? rows.reduce((n, r) => n + (r.position || 0) * (r.impressions || 0), 0) / impressions
      : 0
  };
}

function priorityRows(config, currentMap, previousMap) {
  return (config.priorityKeywords || []).map((item) => {
    const current = [...currentMap.values()].filter((row) =>
      matchesKeyword(row.query, item.keyword)
    );
    const previous = [...previousMap.values()].filter((row) =>
      matchesKeyword(row.query, item.keyword)
    );
    const clicks = sum(current, 'clicks');
    const impressions = sum(current, 'impressions');
    const position = impressions
      ? current.reduce((n, r) => n + r.position * r.impressions, 0) / impressions
      : 0;
    const prevClicks = sum(previous, 'clicks');
    const prevImpressions = sum(previous, 'impressions');
    const prevPosition = prevImpressions
      ? previous.reduce((n, r) => n + r.position * r.impressions, 0) / prevImpressions
      : 0;
    const top = current.sort((a, b) => b.impressions - a.impressions)[0] || null;
    return {
      keyword: item.keyword,
      tier: item.tier || '',
      target: item.target || 10,
      clicks,
      impressions,
      ctr: impressions ? (clicks / impressions) * 100 : 0,
      position,
      prevClicks,
      prevImpressions,
      prevPosition,
      positionChange: prevImpressions ? position - prevPosition : 0,
      clicksChangePct: deltaPct(clicks, prevClicks),
      topPage: top && top.topPage ? top.topPage.page : '',
      seen: current.length > 0,
      status: !current.length
        ? 'no impressions'
        : position <= (item.target || 10) + 0.5
          ? 'on target'
          : 'below target'
    };
  });
}

function topMovers(currentMap, previousMap, minImpressions, limit = 12) {
  const queries = new Set([...currentMap.keys(), ...previousMap.keys()]);
  const rows = [];
  for (const query of queries) {
    const c = currentMap.get(query) || { clicks: 0, impressions: 0, position: 0 };
    const p = previousMap.get(query) || { clicks: 0, impressions: 0, position: 0 };
    if (Math.max(c.impressions, p.impressions) < minImpressions) continue;
    rows.push({
      query,
      clicks: c.clicks,
      prevClicks: p.clicks,
      impressions: c.impressions,
      prevImpressions: p.impressions,
      position: c.position,
      prevPosition: p.position,
      clicksChange: c.clicks - p.clicks,
      positionChange: p.impressions ? c.position - p.position : 0
    });
  }
  return rows.sort((a, b) => Math.abs(b.clicksChange) - Math.abs(a.clicksChange)).slice(0, limit);
}

function opportunities(currentMap, previousMap, thresholds) {
  const minImpressions = thresholds.opportunityMinImpressions || 100;
  const posMin = thresholds.opportunityPositionMin || 8;
  const posMax = thresholds.opportunityPositionMax || 30;
  const lowCtr = thresholds.lowCtr || 0.02;

  const striking = [...currentMap.values()]
    .filter(
      (row) =>
        row.impressions >= minImpressions &&
        row.position >= posMin &&
        row.position <= posMax
    )
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15);

  const lowCtrRows = [...currentMap.values()]
    .filter(
      (row) =>
        row.impressions >= minImpressions &&
        row.position <= 10 &&
        row.ctr < lowCtr
    )
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10);

  const fresh = [...currentMap.values()]
    .filter((row) => !previousMap.has(row.query) && row.impressions >= minImpressions)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10);

  return { striking, lowCtr: lowCtrRows, fresh };
}

function summarizeAi(rows) {
  const byGroup = new Map();
  const byEngine = new Map();
  let total = 0;
  let mentioned = 0;
  let cited = 0;
  let accurate = 0;
  let partial = 0;
  let wrong = 0;
  let errors = 0;

  for (const row of rows) {
    const m = String(row.mentioned || '').toLowerCase();
    if (m === 'error') {
      errors++;
      continue;
    }
    if (!['yes', 'no'].includes(m)) continue;

    total++;
    if (m === 'yes') {
      mentioned++;
      const accuracy = String(row.accuracy || '').toLowerCase();
      if (accuracy === 'accurate') accurate++;
      else if (accuracy === 'partial') partial++;
      else if (accuracy === 'wrong') wrong++;
    }
    if (String(row.cited || '').toLowerCase() === 'yes') cited++;

    const group = row.group || '?';
    if (!byGroup.has(group)) byGroup.set(group, { total: 0, mentioned: 0, cited: 0 });
    const g = byGroup.get(group);
    g.total++;
    if (m === 'yes') g.mentioned++;
    if (String(row.cited || '').toLowerCase() === 'yes') g.cited++;

    const engine = row.engine || '?';
    if (!byEngine.has(engine)) byEngine.set(engine, { total: 0, mentioned: 0, cited: 0 });
    const e = byEngine.get(engine);
    e.total++;
    if (m === 'yes') e.mentioned++;
    if (String(row.cited || '').toLowerCase() === 'yes') e.cited++;
  }

  return {
    total,
    mentioned,
    cited,
    accurate,
    partial,
    wrong,
    errors,
    mentionRate: pct(mentioned, total) * 100,
    citationRate: pct(cited, total) * 100,
    byGroup,
    byEngine
  };
}

function aiRuns(rows) {
  const dates = [...new Set(rows.map((r) => r.run_date).filter(Boolean))].sort();
  const latest = dates.length ? dates[dates.length - 1] : null;
  const previous = dates.length > 1 ? dates[dates.length - 2] : null;
  const latestRows = latest ? rows.filter((r) => r.run_date === latest) : [];
  const previousRows = previous ? rows.filter((r) => r.run_date === previous) : [];
  return {
    dates,
    latest,
    previous,
    latestRows,
    previousRows,
    latestSummary: summarizeAi(latestRows),
    previousSummary: previousRows.length ? summarizeAi(previousRows) : null
  };
}

function aiGaps(rows) {
  return rows
    .filter((r) => String(r.mentioned || '').toLowerCase() !== 'yes')
    .map((r) => ({
      engine: r.engine || '',
      group: r.group || '',
      prompt: r.prompt || '',
      mentioned: r.mentioned || '',
      cited: r.cited || ''
    }));
}

function competitorMentions(rows) {
  const map = new Map();
  for (const row of rows) {
    const names = String(row.competitors_named || '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const name of names) map.set(name, (map.get(name) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
}

function mdTable(headers, rows) {
  const clean = (v) => String(v === undefined || v === null ? '' : v).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const head = `| ${headers.map(clean).join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.map(clean).join(' | ')} |`).join('\n');
  return [head, sep, body].join('\n');
}

function htmlTable(headers, rows) {
  const head = `<tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;
  const body = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
    )
    .join('');
  return `<table><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

function changeLabel(current, previous, invert = false) {
  if (!previous) return '—';
  const change = current - previous;
  if (!change) return '0';
  const good = invert ? change < 0 : change > 0;
  return `${good ? '+' : ''}${round(change, 1)}`;
}

function buildReport({
  config,
  period,
  ranges,
  gsc,
  ga4,
  ga4Previous = { configured: false, traffic: [], events: [] },
  bing,
  serp,
  ai,
  outDir,
  generatedAt
}) {
  ensureDir(outDir);

  const currentRows = (gsc.current && gsc.current.rows) || [];
  const previousRows = (gsc.previous && gsc.previous.rows) || [];
  const currentMap = aggregateQueries(currentRows);
  const previousMap = aggregateQueries(previousRows);
  const currentPages = aggregatePages(currentRows);
  const previousPages = aggregatePages(previousRows);
  const currentTotals = totals(currentRows);
  const previousTotals = totals(previousRows);
  const brandTerms = config.brandTerms || [];
  const isBrandQuery = (query) =>
    brandTerms.some((term) => matchesKeyword(query, term));
  const brandTotals = totals(currentRows.filter((row) => isBrandQuery(row.query)));
  const nonBrandTotals = totals(currentRows.filter((row) => !isBrandQuery(row.query)));
  const prevBrandTotals = totals(previousRows.filter((row) => isBrandQuery(row.query)));
  const prevNonBrandTotals = totals(previousRows.filter((row) => !isBrandQuery(row.query)));
  const thresholds = config.thresholds || {};
  const keywords = priorityRows(config, currentMap, previousMap);
  const movers = topMovers(
    currentMap,
    previousMap,
    thresholds.minImpressionsForMover || 50
  );
  const opps = opportunities(currentMap, previousMap, thresholds);
  const aiInfo = aiRuns(ai.rows || []);
  const autoInfo = aiRuns(ai.autoRows || []);
  const hasManualAi = Boolean(ai.manualRows && ai.manualRows.length);
  const gaps = aiGaps(aiInfo.latestRows);
  const competitors = competitorMentions(aiInfo.latestRows);

  const aiTraffic = (ga4.traffic || []).filter((row) => AI_SOURCE_RE.test(row.source || ''));
  const aiSessions = sum(aiTraffic, 'sessions');
  const totalSessions = sum(ga4.traffic || [], 'sessions');
  const prevAiTraffic = (ga4Previous.traffic || []).filter((row) =>
    AI_SOURCE_RE.test(row.source || '')
  );
  const prevAiSessions = sum(prevAiTraffic, 'sessions');
  const prevTotalSessions = sum(ga4Previous.traffic || [], 'sessions');
  const aiSessionChangePct = prevAiSessions ? deltaPct(aiSessions, prevAiSessions) : null;
  const aiBySource = new Map();
  for (const row of aiTraffic) {
    aiBySource.set(row.source, (aiBySource.get(row.source) || 0) + row.sessions);
  }
  const aiLanding = [...aiTraffic]
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10);
  const events = new Map(
    (ga4.events || [])
      .filter((event) => event.eventName !== 'query_error')
      .map((event) => [event.eventName, event.count])
  );

  const serpRows = serp.results || [];
  const serpFound = serpRows.filter((r) => r.found);
  const serpMissing = serpRows.filter((r) => !r.found && !r.error);

  const bingQueries = (bing.queries || []).map((row) => ({
    ...row,
    ctr: row.impressions ? (row.clicks / row.impressions) * 100 : 0
  }));
  const bingTotals = {
    clicks: sum(bingQueries, 'clicks'),
    impressions: sum(bingQueries, 'impressions')
  };

  const alerts = [];
  const recommendations = [];

  if (!gsc.configured) {
    alerts.push('Search Console is not configured. Add GOOGLE_SERVICE_ACCOUNT_JSON and grant the service account access to the property.');
  } else if (previousTotals.impressions > 0) {
    const clickChange = deltaPct(currentTotals.clicks, previousTotals.clicks);
    if (clickChange <= -(thresholds.clickDropAlertPct || 0.3) * 100) {
      alerts.push(
        `Organic clicks fell ${fmtPct(Math.abs(clickChange))} versus the previous period (${fmt(previousTotals.clicks)} → ${fmt(currentTotals.clicks)}).`
      );
      recommendations.push(
        'Check Search Console for pages that lost the most clicks, then refresh titles, internal links, and publish dates on those pages.'
      );
    }
  }

  for (const item of keywords) {
    if (
      item.prevImpressions >= 100 &&
      item.impressions >= 100 &&
      item.positionChange > (thresholds.positionDropAlert || 5)
    ) {
      alerts.push(
        `"${item.keyword}" dropped ${round(item.positionChange, 1)} positions (${round(item.prevPosition, 1)} → ${round(item.position, 1)}).`
      );
    }
  }

  if (
    aiInfo.previousSummary &&
    aiInfo.latestSummary.citationRate <
      aiInfo.previousSummary.citationRate - (thresholds.aiCitationDropPoints || 10)
  ) {
    alerts.push(
      `AI citation rate fell ${round(
        aiInfo.previousSummary.citationRate - aiInfo.latestSummary.citationRate,
        1
      )} points between ${aiInfo.previous} and ${aiInfo.latest}.`
    );
  }

  const untracked = [...currentMap.values()]
    .filter(
      (row) =>
        row.impressions >= 500 &&
        row.position <= 20 &&
        !(config.priorityKeywords || []).some((item) => matchesKeyword(row.query, item.keyword))
    )
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5);

  for (const row of untracked) {
    alerts.push(
      `Untracked query with demand: "${row.query}" (${fmt(row.impressions)} impressions, position ${round(row.position, 1)}).`
    );
    recommendations.push(
      `Add "${row.query}" to reports/config.json and make sure a page answers it directly.`
    );
  }

  for (const row of serpMissing.filter((r) => ['brand', 'product', 'local'].includes(r.tier))) {
    alerts.push(`Not in the top results for "${row.query}" (${row.tier}).`);
    recommendations.push(
      `Strengthen the page targeting "${row.query}": add a direct answer, comparison table, and internal links from the pillar page.`
    );
  }

  if (ga4.configured && totalSessions > 0 && aiSessions === 0) {
    alerts.push('No AI-assistant referral sessions were recorded in this period.');
  }

  if (currentTotals.impressions === 0) {
    alerts.push('No Search Console impressions in this window. Check the property, date range, and service-account access.');
  }

  for (const row of opps.striking.slice(0, 5)) {
    recommendations.push(
      `"${row.query}" sits at position ${round(row.position, 1)} with ${fmt(row.impressions)} impressions. Add a quick-answer block and a supporting table to ${row.topPage ? row.topPage.page : 'the best matching page'}.`
    );
  }

  for (const row of opps.lowCtr.slice(0, 5)) {
    recommendations.push(
      `Rewrite the title and meta description for ${row.topPage ? row.topPage.page : row.query}: position ${round(row.position, 1)} but CTR ${fmtPct(row.ctr * 100)}.`
    );
  }

  for (const gap of gaps.slice(0, 5)) {
    recommendations.push(
      `AI gap (${gap.engine}, ${gap.group}): "${gap.prompt}" did not mention us. Add a direct answer, FAQ schema, and a source-backed claim to the matching page.`
    );
  }

  if (aiInfo.latestSummary.total === 0) {
    recommendations.push(
      'Run the manual 75-cell AI audit (ai-visibility-audit.csv) or enable PERPLEXITY_API_KEY so the AI section has data.'
    );
  }

  if (!serp.configured) {
    recommendations.push(
      'Add SERPAPI_KEY or GOOGLE_CSE_KEY + GOOGLE_CSE_CX to see rankings for queries where we do not appear at all.'
    );
  }

  const uniqueRecommendations = [...new Set(recommendations)].slice(0, 12);

  const keywordTable = keywords.map((item) => [
    item.keyword,
    item.tier,
    fmt(item.clicks),
    fmt(item.impressions),
    fmtPct(item.ctr),
    item.seen ? round(item.position, 1) : '—',
    item.target,
    item.status,
    item.topPage ? item.topPage.replace(/^https?:\/\/[^/]+/, '') : '—'
  ]);

  const topQueries = [...currentMap.values()]
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15);

  const topQueryTable = topQueries.map((row) => [
    row.query,
    fmt(row.clicks),
    fmt(row.impressions),
    fmtPct(row.ctr * 100),
    round(row.position, 1),
    row.topPage ? row.topPage.page.replace(/^https?:\/\/[^/]+/, '') : ''
  ]);

  const moverTable = movers.map((row) => [
    row.query,
    fmt(row.clicks),
    `${row.clicksChange > 0 ? '+' : ''}${fmt(row.clicksChange)}`,
    fmt(row.impressions),
    row.prevImpressions ? round(row.position, 1) : '—',
    row.prevImpressions ? `${row.positionChange > 0 ? '+' : ''}${round(row.positionChange, 1)}` : '—'
  ]);

  const opportunityTable = opps.striking.map((row) => [
    row.query,
    fmt(row.impressions),
    fmt(row.clicks),
    round(row.position, 1),
    row.topPage ? row.topPage.page.replace(/^https?:\/\/[^/]+/, '') : ''
  ]);

  const pageTable = [...currentPages.values()]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 12)
    .map((row) => {
      const prev = previousPages.get(row.page);
      return [
        row.page.replace(/^https?:\/\/[^/]+/, ''),
        fmt(row.clicks),
        fmt(row.impressions),
        fmtPct(row.ctr * 100),
        round(row.position, 1),
        prev ? changeLabel(row.clicks, prev.clicks) : '—'
      ];
    });

  const aiGroupTable = [...aiInfo.latestSummary.byGroup.entries()]
    .sort()
    .map(([group, value]) => [
      group,
      value.total,
      fmtPct(pct(value.mentioned, value.total) * 100),
      fmtPct(pct(value.cited, value.total) * 100)
    ]);

  const aiEngineTable = [...aiInfo.latestSummary.byEngine.entries()]
    .sort()
    .map(([engine, value]) => [
      engine,
      value.total,
      fmtPct(pct(value.mentioned, value.total) * 100),
      fmtPct(pct(value.cited, value.total) * 100)
    ]);

  const aiTrafficTable = [...aiBySource.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([source, sessions]) => [source, fmt(sessions)]);

  const aiLandingTable = aiLanding.map((row) => [
    row.landingPage,
    row.source,
    fmt(row.sessions)
  ]);

  const serpTable = serpRows.map((row) => [
    row.query,
    row.tier,
    row.found ? row.position : row.error ? 'error' : 'not in top',
    row.found ? row.url.replace(/^https?:\/\/[^/]+/, '') : '—'
  ]);

  const bingTable = bingQueries
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 12)
    .map((row) => [
      row.query,
      fmt(row.clicks),
      fmt(row.impressions),
      fmtPct(row.ctr),
      round(row.avgImpressionPosition, 1)
    ]);

  const alertTable = alerts.map((alert) => [alert]);
  const recommendationTable = uniqueRecommendations.map((item) => [item]);

  const lines = [];
  lines.push(`# Performalytic visibility report — ${period}`);
  lines.push('');
  lines.push(
    `**Window:** ${ranges.current.startDate} → ${ranges.current.endDate} (compared with ${ranges.previous.startDate} → ${ranges.previous.endDate})`
  );
  lines.push('');
  lines.push(`Generated ${generatedAt}.`);
  lines.push('');

  lines.push('## 1. Scorecard');
  lines.push('');
  lines.push(
    mdTable(
      ['Metric', 'Current', 'Previous', 'Change'],
      [
        [
          'Organic clicks',
          fmt(currentTotals.clicks),
          fmt(previousTotals.clicks),
          previousTotals.clicks
            ? `${deltaPct(currentTotals.clicks, previousTotals.clicks) > 0 ? '+' : ''}${round(
                deltaPct(currentTotals.clicks, previousTotals.clicks),
                1
              )}%`
            : '—'
        ],
        [
          'Organic impressions',
          fmt(currentTotals.impressions),
          fmt(previousTotals.impressions),
          previousTotals.impressions
            ? `${deltaPct(currentTotals.impressions, previousTotals.impressions) > 0 ? '+' : ''}${round(
                deltaPct(currentTotals.impressions, previousTotals.impressions),
                1
              )}%`
            : '—'
        ],
        [
          'Brand clicks',
          fmt(brandTotals.clicks),
          fmt(prevBrandTotals.clicks),
          prevBrandTotals.clicks
            ? `${deltaPct(brandTotals.clicks, prevBrandTotals.clicks) > 0 ? '+' : ''}${round(
                deltaPct(brandTotals.clicks, prevBrandTotals.clicks),
                1
              )}%`
            : '—'
        ],
        [
          'Non-brand clicks',
          fmt(nonBrandTotals.clicks),
          fmt(prevNonBrandTotals.clicks),
          prevNonBrandTotals.clicks
            ? `${deltaPct(nonBrandTotals.clicks, prevNonBrandTotals.clicks) > 0 ? '+' : ''}${round(
                deltaPct(nonBrandTotals.clicks, prevNonBrandTotals.clicks),
                1
              )}%`
            : '—'
        ],
        [
          'Brand share of clicks',
          fmtPct(pct(brandTotals.clicks, currentTotals.clicks) * 100),
          fmtPct(pct(prevBrandTotals.clicks, previousTotals.clicks) * 100),
          changeLabel(
            pct(brandTotals.clicks, currentTotals.clicks) * 100,
            pct(prevBrandTotals.clicks, previousTotals.clicks) * 100
          )
        ],
        ['CTR', fmtPct(currentTotals.ctr), fmtPct(previousTotals.ctr), changeLabel(currentTotals.ctr, previousTotals.ctr)],
        [
          'Average position',
          currentTotals.position ? round(currentTotals.position, 1) : '—',
          previousTotals.position ? round(previousTotals.position, 1) : '—',
          previousTotals.position
            ? `${currentTotals.position - previousTotals.position > 0 ? '+' : ''}${round(
                currentTotals.position - previousTotals.position,
                1
              )}`
            : '—'
        ],
        [
          'AI referral sessions',
          ga4.configured ? fmt(aiSessions) : 'not configured',
          ga4Previous.configured ? fmt(prevAiSessions) : '—',
          aiSessionChangePct === null
            ? '—'
            : `${aiSessionChangePct > 0 ? '+' : ''}${round(aiSessionChangePct, 1)}%`
        ],
        [
          'AI mention rate',
          aiInfo.latestSummary.total ? fmtPct(aiInfo.latestSummary.mentionRate) : 'no data',
          aiInfo.previousSummary ? fmtPct(aiInfo.previousSummary.mentionRate) : '—',
          aiInfo.previousSummary
            ? changeLabel(aiInfo.latestSummary.mentionRate, aiInfo.previousSummary.mentionRate)
            : '—'
        ],
        [
          'AI citation rate',
          aiInfo.latestSummary.total ? fmtPct(aiInfo.latestSummary.citationRate) : 'no data',
          aiInfo.previousSummary ? fmtPct(aiInfo.previousSummary.citationRate) : '—',
          aiInfo.previousSummary
            ? changeLabel(aiInfo.latestSummary.citationRate, aiInfo.previousSummary.citationRate)
            : '—'
        ],
        [
          'SERP presence',
          serp.configured
            ? `${serpFound.length}/${serpRows.length} (${fmtPct(pct(serpFound.length, serpRows.length) * 100)})`
            : 'not configured',
          '—',
          '—'
        ]
      ]
    )
  );
  lines.push('');

  lines.push('## 2. Priority keyword rankings');
  lines.push('');
  lines.push(
    'Average position is impression-weighted. "No impressions" means Search Console returned no query rows containing that phrase in the window; it does not prove the page is absent.'
  );
  lines.push('');
  lines.push(
    mdTable(
      ['Keyword', 'Tier', 'Clicks', 'Impr.', 'CTR', 'Avg pos', 'Target', 'Status', 'Top page'],
      keywordTable
    )
  );
  lines.push('');
  lines.push('### Top queries by impressions');
  lines.push('');
  lines.push(
    mdTable(['Query', 'Clicks', 'Impr.', 'CTR', 'Avg pos', 'Page'], topQueryTable)
  );
  lines.push('');

  lines.push('## 3. Biggest movers');
  lines.push('');
  lines.push(mdTable(['Query', 'Clicks', 'Δ clicks', 'Impr.', 'Avg pos', 'Δ pos'], moverTable));
  lines.push('');

  lines.push('## 4. Opportunities');
  lines.push('');
  lines.push('### Striking distance (positions 8–30)');
  lines.push('');
  lines.push(mdTable(['Query', 'Impr.', 'Clicks', 'Avg pos', 'Page'], opportunityTable));
  lines.push('');
  if (opps.lowCtr.length) {
    lines.push('### High impressions, low CTR (position 10 or better)');
    lines.push('');
    lines.push(
      mdTable(
        ['Query', 'Impr.', 'CTR', 'Avg pos', 'Page'],
        opps.lowCtr.map((row) => [
          row.query,
          fmt(row.impressions),
          fmtPct(row.ctr * 100),
          round(row.position, 1),
          row.topPage ? row.topPage.page.replace(/^https?:\/\/[^/]+/, '') : ''
        ])
      )
    );
    lines.push('');
  }
  if (opps.fresh.length) {
    lines.push('### New queries with demand');
    lines.push('');
    lines.push(
      mdTable(
        ['Query', 'Impr.', 'Clicks', 'Avg pos', 'Page'],
        opps.fresh.map((row) => [
          row.query,
          fmt(row.impressions),
          fmt(row.clicks),
          round(row.position, 1),
          row.topPage ? row.topPage.page.replace(/^https?:\/\/[^/]+/, '') : ''
        ])
      )
    );
    lines.push('');
  }

  lines.push('## 5. Page performance');
  lines.push('');
  lines.push(
    mdTable(['Page', 'Clicks', 'Impr.', 'CTR', 'Avg pos', 'Δ clicks'], pageTable)
  );
  lines.push('');

  lines.push('## 6. AI answer visibility');
  lines.push('');
  if (!ai.rows || !ai.rows.length) {
    lines.push(
      'No completed AI audit rows. Fill `ai-visibility-audit.csv` for the manual 75-cell audit, or set `PERPLEXITY_API_KEY` and run with `--with-ai`.'
    );
  } else {
    lines.push(
      `Source: **${hasManualAi ? 'manual multi-engine audit' : 'automated Perplexity probe'}**. Latest run: **${aiInfo.latest}** (${aiInfo.latestSummary.total} cells). ${
        aiInfo.previous ? `Previous run: ${aiInfo.previous}.` : 'No previous run to compare.'
      }`
    );
    lines.push('');
    {
      const judged =
        aiInfo.latestSummary.accurate +
        aiInfo.latestSummary.partial +
        aiInfo.latestSummary.wrong;
      lines.push(
        `Accuracy on mentioned answers: **${aiInfo.latestSummary.accurate} accurate**, ${aiInfo.latestSummary.partial} partial, ${aiInfo.latestSummary.wrong} wrong${
          judged ? ` (${fmtPct((aiInfo.latestSummary.accurate / judged) * 100)} accurate)` : ''
        }.`
      );
      lines.push('');
    }
    if (hasManualAi && aiInfo.latestSummary.total < 75) {
      lines.push(
        `Note: this run has ${aiInfo.latestSummary.total} of 75 cells. Fill the remaining cells for a comparable month-over-month rate.`
      );
      lines.push('');
    }
    if (!aiInfo.latestSummary.total) {
      lines.push(
        `**No valid AI cells in this run.** ${aiInfo.latestSummary.errors} runs failed. Check the API key/model and the raw CSV.`
      );
      lines.push('');
    }
    lines.push(
      mdTable(['Group', 'Cells', 'Mentioned', 'Cited'], aiGroupTable)
    );
    lines.push('');
    lines.push(mdTable(['Engine', 'Cells', 'Mentioned', 'Cited'], aiEngineTable));
    lines.push('');
    if (competitors.length) {
      lines.push('**Competitors named in AI answers:** ' + competitors.map(([name, n]) => `${name} (${n})`).join(', '));
      lines.push('');
    }
    if (gaps.length) {
      lines.push('**Prompts where we were not mentioned:**');
      lines.push('');
      lines.push(
        mdTable(
          ['Engine', 'Group', 'Prompt'],
          gaps.slice(0, 15).map((gap) => [gap.engine, gap.group, gap.prompt])
        )
      );
      lines.push('');
    }
    if (hasManualAi && autoInfo.latest) {
      lines.push('### Automated Perplexity probe (supplement)');
      lines.push('');
      lines.push(
        `Run ${autoInfo.latest}: ${autoInfo.latestSummary.total} prompts, ${fmtPct(
          autoInfo.latestSummary.mentionRate
        )} mentioned, ${fmtPct(autoInfo.latestSummary.citationRate)} cited. Accuracy is not auto-judged.`
      );
      lines.push('');
    }
  }

  lines.push('');
  lines.push('## 7. AI referral traffic (GA4)');
  lines.push('');
  if (!ga4.configured) {
    lines.push(`Not configured: ${ga4.error || 'GA4_PROPERTY_ID missing'}.`);
    lines.push('');
  } else {
    lines.push(
      `${fmt(aiSessions)} AI-assistant sessions out of ${fmt(totalSessions)} total sessions (${fmtPct(
        pct(aiSessions, totalSessions) * 100
      )}).${
        ga4Previous.configured
          ? ` Previous period: ${fmt(prevAiSessions)} (${fmtPct(
              pct(prevAiSessions, prevTotalSessions) * 100
            )} of ${fmt(prevTotalSessions)} sessions).`
          : ''
      }`
    );
    lines.push('');
    if (aiTrafficTable.length) {
      lines.push(mdTable(['Source', 'Sessions'], aiTrafficTable));
      lines.push('');
      lines.push(mdTable(['Landing page', 'Source', 'Sessions'], aiLandingTable));
      lines.push('');
    } else {
      lines.push('No sessions matched the AI-assistant source list in this window.');
      lines.push('');
    }
    if (events.size) {
      lines.push(
        '**Tracked events:** ' +
          [...events.entries()].map(([name, count]) => `${name} (${fmt(count)})`).join(', ')
      );
      lines.push('');
    }
  }

  lines.push('## 8. SERP presence (optional)');
  lines.push('');
  if (!serp.configured) {
    lines.push(`Not configured: ${serp.error || 'no SERP provider'}.`);
  } else {
    lines.push(
      `Provider: **${serp.provider}**. We appear for ${serpFound.length} of ${serpRows.length} checked queries.`
    );
    lines.push('');
    lines.push(mdTable(['Query', 'Tier', 'Position', 'URL'], serpTable));
  }
  lines.push('');

  lines.push('## 9. Bing Webmaster');
  lines.push('');
  if (!bing.configured) {
    lines.push(`Not configured: ${bing.error || 'BING_API_KEY missing'}.`);
  } else {
    lines.push(
      `Recent Bing totals: ${fmt(bingTotals.clicks)} clicks, ${fmt(bingTotals.impressions)} impressions.`
    );
    lines.push('');
    lines.push(mdTable(['Query', 'Clicks', 'Impr.', 'CTR', 'Avg pos'], bingTable));
    const bingDaily = [...(bing.daily || [])]
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .slice(-7);
    if (bingDaily.length) {
      lines.push('');
      lines.push('### Bing daily (last 7 records)');
      lines.push('');
      lines.push(
        mdTable(
          ['Date', 'Clicks', 'Impr.', 'Avg pos'],
          bingDaily.map((row) => [
            row.date,
            fmt(row.clicks),
            fmt(row.impressions),
            row.position ? round(row.position, 1) : '—'
          ])
        )
      );
    }
  }
  lines.push('');

  lines.push('## 10. Alerts');
  lines.push('');
  if (!alerts.length) {
    lines.push('No threshold alerts this period.');
  } else {
    lines.push(mdTable(['Alert'], alertTable));
  }
  lines.push('');

  lines.push('## 11. Recommended actions');
  lines.push('');
  if (!uniqueRecommendations.length) {
    lines.push('No action generated. Keep publishing and re-check next period.');
  } else {
    uniqueRecommendations.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
  }
  lines.push('');

  lines.push('## 12. Data status');
  lines.push('');
  lines.push(
    mdTable(
      ['Source', 'Status', 'Note'],
      [
        ['Search Console', gsc.configured ? 'connected' : 'not configured', gsc.error || ''],
        ['GA4', ga4.configured ? 'connected' : 'not configured', ga4.error || ''],
        ['Bing Webmaster', bing.configured ? 'connected' : 'not configured', bing.error || ''],
        ['SERP provider', serp.configured ? serp.provider : 'not configured', serp.error || ''],
        [
          'AI audit',
          ai.rows && ai.rows.length
            ? `${(ai.manualRows || []).length} manual + ${(ai.autoRows || []).length} auto`
            : 'no data',
          ai.error || ''
        ]
      ]
    )
  );
  lines.push('');

  const report = lines.join('\n');
  const reportPath = path.join(outDir, 'report.md');
  fs.writeFileSync(reportPath, report);

  writeCsv(
    path.join(outDir, 'gsc-queries-current.csv'),
    ['query', 'clicks', 'impressions', 'ctr', 'position', 'top_page'],
    [...currentMap.values()]
      .sort((a, b) => b.impressions - a.impressions)
      .map((row) => ({
        query: row.query,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: round(row.ctr * 100, 2),
        position: round(row.position, 2),
        top_page: row.topPage ? row.topPage.page : ''
      }))
  );

  writeCsv(
    path.join(outDir, 'priority-keywords.csv'),
    ['keyword', 'tier', 'clicks', 'impressions', 'ctr', 'position', 'target', 'status', 'top_page'],
    keywords.map((row) => ({
      keyword: row.keyword,
      tier: row.tier,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: round(row.ctr, 2),
      position: round(row.position, 2),
      target: row.target,
      status: row.status,
      top_page: row.topPage
    }))
  );

  writeCsv(
    path.join(outDir, 'opportunities.csv'),
    ['type', 'query', 'impressions', 'clicks', 'ctr', 'position', 'page'],
    [
      ...opps.striking.map((row) => ({ type: 'striking', ...row, page: row.topPage ? row.topPage.page : '' })),
      ...opps.lowCtr.map((row) => ({ type: 'low_ctr', ...row, page: row.topPage ? row.topPage.page : '' })),
      ...opps.fresh.map((row) => ({ type: 'new', ...row, page: row.topPage ? row.topPage.page : '' }))
    ].map((row) => ({
      type: row.type,
      query: row.query,
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: round(row.ctr * 100, 2),
      position: round(row.position, 2),
      page: row.page
    }))
  );

  writeCsv(
    path.join(outDir, 'serp.csv'),
    ['query', 'tier', 'found', 'position', 'url'],
    serpRows.map((row) => ({
      query: row.query,
      tier: row.tier,
      found: row.found ? 'yes' : 'no',
      position: row.position || '',
      url: row.url || ''
    }))
  );

  writeCsv(
    path.join(outDir, 'ai-referrals.csv'),
    ['source', 'landing_page', 'sessions', 'users', 'views'],
    aiTraffic.map((row) => ({
      source: row.source,
      landing_page: row.landingPage,
      sessions: row.sessions,
      users: row.users,
      views: row.views
    }))
  );

  writeCsv(
    path.join(outDir, 'bing-queries.csv'),
    ['query', 'clicks', 'impressions', 'ctr', 'avg_click_position', 'avg_impression_position'],
    bingQueries.map((row) => ({
      query: row.query,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: round(row.ctr, 2),
      avg_click_position: round(row.avgClickPosition, 2),
      avg_impression_position: round(row.avgImpressionPosition, 2)
    }))
  );

  const summary = {
    generatedAt,
    period,
    ranges,
    gsc: {
      configured: gsc.configured,
      current: currentTotals,
      previous: previousTotals,
      clickChangePct: round(deltaPct(currentTotals.clicks, previousTotals.clicks), 1),
      brandClicks: brandTotals.clicks,
      nonBrandClicks: nonBrandTotals.clicks,
      brandClickShare: round(pct(brandTotals.clicks, currentTotals.clicks) * 100, 1)
    },
    ga4: {
      configured: ga4.configured,
      sessions: totalSessions,
      aiSessions,
      previousSessions: prevTotalSessions,
      previousAiSessions: prevAiSessions,
      aiSessionChangePct: aiSessionChangePct === null ? null : round(aiSessionChangePct, 1)
    },
    ai: {
      latestRun: aiInfo.latest,
      previousRun: aiInfo.previous,
      total: aiInfo.latestSummary.total,
      mentionRate: round(aiInfo.latestSummary.mentionRate, 1),
      citationRate: round(aiInfo.latestSummary.citationRate, 1),
      manualRows: (ai.manualRows || []).length,
      autoRows: (ai.autoRows || []).length,
      autoLatestRun: autoInfo.latest,
      autoMentionRate: round(autoInfo.latestSummary.mentionRate, 1),
      autoCitationRate: round(autoInfo.latestSummary.citationRate, 1)
    },
    serp: {
      configured: serp.configured,
      checked: serpRows.length,
      found: serpFound.length
    },
    alerts,
    recommendations: uniqueRecommendations
  };
  writeJson(path.join(outDir, 'summary.json'), summary);

  const html = renderDashboard({
    config,
    period,
    ranges,
    generatedAt,
    currentTotals,
    previousTotals,
    brandTotals,
    nonBrandTotals,
    keywords,
    movers,
    opps,
    aiInfo,
    autoInfo,
    hasManualAi,
    gaps,
    competitors,
    aiSessions,
    totalSessions,
    prevAiSessions,
    prevTotalSessions,
    aiSessionChangePct,
    aiBySource,
    aiLanding,
    topQueries,
    serp,
    serpRows,
    serpFound,
    bing,
    bingTotals,
    bingQueries,
    alerts,
    recommendations: uniqueRecommendations,
    ga4
  });
  const dashboardPath = path.join(outDir, 'dashboard.html');
  fs.writeFileSync(dashboardPath, html);

  return { reportPath, dashboardPath, summary };
}

function renderDashboard(data) {
  const {
    period,
    ranges,
    generatedAt,
    currentTotals,
    previousTotals,
    brandTotals,
    nonBrandTotals,
    keywords,
    movers,
    opps,
    aiInfo,
    autoInfo,
    hasManualAi,
    gaps,
    competitors,
    aiSessions,
    totalSessions,
    prevAiSessions,
    prevTotalSessions,
    aiSessionChangePct,
    aiBySource,
    aiLanding,
    topQueries,
    serp,
    serpRows,
    serpFound,
    bing,
    bingTotals,
    bingQueries,
    alerts,
    recommendations,
    ga4
  } = data;

  const card = (label, value, sub) =>
    `<div class="card"><div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(
      value
    )}</div><div class="sub">${escapeHtml(sub || '')}</div></div>`;

  const clickChange = previousTotals.clicks
    ? deltaPct(currentTotals.clicks, previousTotals.clicks)
    : 0;

  const keywordTable = htmlTable(
    ['Keyword', 'Tier', 'Clicks', 'Impr.', 'CTR', 'Avg pos', 'Target', 'Status'],
    keywords.map((row) => [
      row.keyword,
      row.tier,
      fmt(row.clicks),
      fmt(row.impressions),
      fmtPct(row.ctr),
      row.seen ? round(row.position, 1) : '—',
      row.target,
      row.status
    ])
  );

  const topQueryTable = htmlTable(
    ['Query', 'Clicks', 'Impr.', 'CTR', 'Avg pos', 'Page'],
    topQueries.map((row) => [
      row.query,
      fmt(row.clicks),
      fmt(row.impressions),
      fmtPct(row.ctr * 100),
      round(row.position, 1),
      row.topPage ? row.topPage.page.replace(/^https?:\/\/[^/]+/, '') : ''
    ])
  );

  const opportunityTable = htmlTable(
    ['Query', 'Impr.', 'Clicks', 'Avg pos', 'Page'],
    opps.striking.map((row) => [
      row.query,
      fmt(row.impressions),
      fmt(row.clicks),
      round(row.position, 1),
      row.topPage ? row.topPage.page.replace(/^https?:\/\/[^/]+/, '') : ''
    ])
  );

  const aiTable = htmlTable(
    ['Group', 'Cells', 'Mentioned', 'Cited'],
    [...aiInfo.latestSummary.byGroup.entries()]
      .sort()
      .map(([group, value]) => [
        group,
        value.total,
        fmtPct(pct(value.mentioned, value.total) * 100),
        fmtPct(pct(value.cited, value.total) * 100)
      ])
  );

  const aiTrafficTable = htmlTable(
    ['Source', 'Sessions'],
    [...aiBySource.entries()].sort((a, b) => b[1] - a[1]).map(([source, sessions]) => [source, fmt(sessions)])
  );

  const serpTable = htmlTable(
    ['Query', 'Tier', 'Position', 'URL'],
    serpRows.map((row) => [
      row.query,
      row.tier,
      row.found ? row.position : row.error ? 'error' : 'not in top',
      row.found ? row.url.replace(/^https?:\/\/[^/]+/, '') : '—'
    ])
  );

  const bingTable = htmlTable(
    ['Query', 'Clicks', 'Impr.', 'CTR', 'Avg pos'],
    bingQueries
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 10)
      .map((row) => [row.query, fmt(row.clicks), fmt(row.impressions), fmtPct(row.ctr), round(row.avgImpressionPosition, 1)])
  );

  const gapList = gaps.length
    ? `<ul>${gaps.slice(0, 10).map((gap) => `<li><strong>${escapeHtml(gap.engine)}</strong> — ${escapeHtml(gap.prompt)}</li>`).join('')}</ul>`
    : '<p class="muted">No AI gaps recorded for the latest run.</p>';

  const alertList = alerts.length
    ? `<ul class="alerts">${alerts.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>`
    : '<p class="muted">No threshold alerts this period.</p>';

  const recommendationList = recommendations.length
    ? `<ol>${recommendations.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ol>`
    : '<p class="muted">No actions generated.</p>';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Performalytic visibility — ${escapeHtml(period)} ${escapeHtml(ranges.current.endDate)}</title>
<style>
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:#0b1220;color:#e6edf7;font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:1180px;margin:0 auto;padding:32px 20px 64px}
h1{font-size:28px;margin:0 0 6px}
h2{font-size:19px;margin:36px 0 12px;border-bottom:1px solid #22304a;padding-bottom:8px}
.muted{color:#8fa3bf}
.meta{color:#8fa3bf;font-size:13px;margin-bottom:24px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.card{background:#111c30;border:1px solid #22304a;border-radius:12px;padding:16px}
.card .label{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#8fa3bf}
.card .value{font-size:26px;font-weight:700;margin:6px 0 2px}
.card .sub{font-size:12px;color:#8fa3bf}
table{width:100%;border-collapse:collapse;background:#111c30;border:1px solid #22304a;border-radius:12px;overflow:hidden}
th,td{padding:9px 10px;text-align:left;border-bottom:1px solid #1b2940;font-size:13px;vertical-align:top}
th{background:#16243b;color:#b9c9e0;font-weight:600}
tr:last-child td{border-bottom:0}
.alerts li{color:#ffb4b4}
ol li,ul li{margin:6px 0}
.note{background:#111c30;border:1px solid #22304a;border-radius:12px;padding:14px 16px;margin:12px 0}
</style>
</head>
<body>
<div class="wrap">
<h1>Performalytic visibility report</h1>
<div class="meta">${escapeHtml(period)} · ${escapeHtml(ranges.current.startDate)} → ${escapeHtml(
    ranges.current.endDate
  )} · generated ${escapeHtml(generatedAt)}</div>

<div class="cards">
${card('Organic clicks', fmt(currentTotals.clicks), previousTotals.clicks ? `${clickChange > 0 ? '+' : ''}${round(clickChange, 1)}% vs previous` : 'no previous data')}
${card('Brand clicks', fmt(brandTotals.clicks), `${fmtPct(pct(brandTotals.clicks, currentTotals.clicks) * 100)} of clicks`)}
${card('Non-brand clicks', fmt(nonBrandTotals.clicks), `${fmtPct(pct(nonBrandTotals.clicks, currentTotals.clicks) * 100)} of clicks`)}
${card('Impressions', fmt(currentTotals.impressions), 'Search Console')}
${card('Average position', currentTotals.position ? round(currentTotals.position, 1) : '—', 'impression-weighted')}
${card('AI referral sessions', ga4.configured ? fmt(aiSessions) : '—', ga4.configured ? `${fmtPct(pct(aiSessions, totalSessions) * 100)} of ${fmt(totalSessions)} sessions${aiSessionChangePct === null ? '' : ` · ${aiSessionChangePct > 0 ? '+' : ''}${round(aiSessionChangePct, 1)}% vs previous`}` : 'GA4 not configured')}
${card('AI mention rate', aiInfo.latestSummary.total ? fmtPct(aiInfo.latestSummary.mentionRate) : '—', aiInfo.latest ? `run ${aiInfo.latest}` : 'no audit rows')}
${card('AI citation rate', aiInfo.latestSummary.total ? fmtPct(aiInfo.latestSummary.citationRate) : '—', aiInfo.latest ? `run ${aiInfo.latest}` : 'no audit rows')}
${card('SERP presence', serp.configured ? `${serpFound.length}/${serpRows.length}` : '—', serp.configured ? serp.provider : 'no SERP provider')}
${card('Bing clicks', bing.configured ? fmt(bingTotals.clicks) : '—', bing.configured ? `${fmt(bingTotals.impressions)} impressions` : 'Bing not configured')}
</div>

<h2>Alerts</h2>
${alertList}

<h2>Recommended actions</h2>
${recommendationList}

<h2>Priority keywords</h2>
${keywordTable}

<h2>Top queries</h2>
${topQueryTable}

<h2>Striking distance (positions 8–30)</h2>
${opportunityTable}

<h2>AI answer visibility</h2>
<p class="muted">Latest run: ${escapeHtml(aiInfo.latest || 'none')}${aiInfo.previous ? ` · previous: ${escapeHtml(aiInfo.previous)}` : ''}</p>
<p class="muted">Accuracy on mentioned answers: ${aiInfo.latestSummary.accurate} accurate, ${aiInfo.latestSummary.partial} partial, ${aiInfo.latestSummary.wrong} wrong.</p>
${hasManualAi && autoInfo.latest ? `<p class="muted">Automated Perplexity probe: ${fmtPct(autoInfo.latestSummary.mentionRate)} mentioned, ${fmtPct(autoInfo.latestSummary.citationRate)} cited (${escapeHtml(autoInfo.latest)}).</p>` : ''}
${aiTable}
${
  competitors.length
    ? `<p class="muted">Competitors named: ${escapeHtml(
        competitors.map(([name, n]) => `${name} (${n})`).join(', ')
      )}</p>`
    : ''
}
${gapList}

<h2>AI referral traffic</h2>
${ga4.configured ? aiTrafficTable : '<p class="muted">GA4 not configured.</p>'}
${
  aiLanding.length
    ? `<p class="muted">Top AI landing pages: ${escapeHtml(
        aiLanding.map((row) => `${row.landingPage} (${row.sessions})`).join(', ')
      )}</p>`
    : ''
}

<h2>SERP presence</h2>
${serp.configured ? serpTable : '<p class="muted">Add SERPAPI_KEY or Google CSE keys to enable this section.</p>'}

<h2>Bing Webmaster</h2>
${bing.configured ? bingTable : '<p class="muted">Add BING_API_KEY to enable this section.</p>'}

<div class="note muted">Data sources: Google Search Console, GA4, Bing Webmaster, optional SERP API, and the AI visibility audit. Reports are generated locally or in GitHub Actions; raw data stays in the ignored <code>reports/out</code> folder.</div>
</div>
</body>
</html>`;
}

module.exports = { buildReport };
