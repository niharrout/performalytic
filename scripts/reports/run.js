'use strict';

const fs = require('fs');
const path = require('path');
const {
  ROOT,
  REPORTS,
  loadConfig,
  parseArgs,
  dateRanges,
  ensureDir,
  writeJson,
  parseCsv
} = require('./lib');
const { fetchGsc } = require('./fetch-gsc');
const { fetchGa4 } = require('./fetch-ga4');
const { fetchBing } = require('./fetch-bing');
const { fetchSerp } = require('./fetch-serp');
const { fetchAi } = require('./fetch-ai');
const { buildReport } = require('./build');

function readManualAi(file) {
  if (!fs.existsSync(file)) return [];
  const rows = parseCsv(fs.readFileSync(file, 'utf8'));
  if (!rows.length) return [];
  const header = rows.shift().map((h) => h.replace(/^\uFEFF/, '').trim());
  return rows
    .map((row) => Object.fromEntries(header.map((h, i) => [h, (row[i] || '').trim()])))
    .filter((row) => row.run_date);
}

function safe(loader, fallback) {
  return loader().catch((error) => ({ ...fallback, error: error.message }));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = loadConfig();
  const ranges = dateRanges(args.period);
  const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const outDir = path.join(REPORTS, 'out', args.period, ranges.current.endDate);
  const rawDir = path.join(outDir, 'raw');
  ensureDir(rawDir);

  const siteUrl = process.env.GSC_SITE_URL || config.site;
  const withSerp = args.period !== 'daily' || process.env.SERP_DAILY === '1';

  let gscCurrent;
  let gscPrevious;
  let ga4;
  let ga4Previous;
  let bing;
  let serp;
  let autoAi;

  if (args.offline) {
    const read = (name, fallback) => {
      const file = path.join(rawDir, name);
      return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
    };
    gscCurrent = read('gsc-current.json', { configured: false, rows: [], error: 'offline: no cache' });
    gscPrevious = read('gsc-previous.json', { configured: false, rows: [], error: 'offline: no cache' });
    ga4 = read('ga4.json', { configured: false, traffic: [], events: [], error: 'offline: no cache' });
    ga4Previous = read('ga4-previous.json', { configured: false, traffic: [], events: [], error: 'offline: no cache' });
    bing = read('bing.json', { configured: false, queries: [], daily: [], error: 'offline: no cache' });
    serp = read('serp.json', { configured: false, results: [], error: 'offline: no cache' });
    autoAi = read('ai.json', { configured: false, rows: [], error: 'offline: no cache' });
  } else {
    gscCurrent = await safe(
      () => fetchGsc({ siteUrl, ...ranges.current }),
      { configured: true, rows: [] }
    );
    gscPrevious = gscCurrent.configured
      ? await safe(
          () => fetchGsc({ siteUrl, ...ranges.previous }),
          { configured: true, rows: [] }
        )
      : { configured: false, rows: [], error: gscCurrent.error };

    ga4 = await safe(() => fetchGa4(ranges.current), {
      configured: true,
      traffic: [],
      events: []
    });
    ga4Previous = ga4.configured
      ? await safe(() => fetchGa4(ranges.previous), {
          configured: true,
          traffic: [],
          events: []
        })
      : { configured: false, traffic: [], events: [], error: ga4.error };
    bing = await safe(() => fetchBing(), {
      configured: true,
      queries: [],
      daily: []
    });
    serp = withSerp
      ? await safe(
          () =>
            fetchSerp({
              keywords: config.priorityKeywords || [],
              maxQueries: (config.serp && config.serp.maxQueries) || 10
            }),
          { configured: true, results: [] }
        )
      : {
          configured: false,
          results: [],
          error: 'SERP is skipped for daily reports (weekly/monthly only)'
        };

    const withAi = args.withAi || (config.ai && config.ai.autoRun);
    autoAi = withAi
      ? await safe(() => fetchAi({ config, outDir }), { configured: true, rows: [] })
      : {
          configured: false,
          rows: [],
          error: 'automatic AI run disabled (use --with-ai or set ai.autoRun)'
        };

    writeJson(path.join(rawDir, 'gsc-current.json'), gscCurrent);
    writeJson(path.join(rawDir, 'gsc-previous.json'), gscPrevious);
    writeJson(path.join(rawDir, 'ga4.json'), ga4);
    writeJson(path.join(rawDir, 'ga4-previous.json'), ga4Previous);
    writeJson(path.join(rawDir, 'bing.json'), bing);
    writeJson(path.join(rawDir, 'serp.json'), serp);
    writeJson(path.join(rawDir, 'ai.json'), autoAi);
  }

  const manualAi = readManualAi(
    process.env.AI_AUDIT_CSV || path.join(ROOT, 'ai-visibility-audit.csv')
  );
  const autoRows = (autoAi && autoAi.rows) || [];
  const ai = {
    configured: Boolean((autoAi && autoAi.configured) || manualAi.length),
    rows: manualAi.length ? manualAi : autoRows,
    manualRows: manualAi,
    autoRows,
    error: autoAi ? autoAi.error : null
  };

  const result = buildReport({
    config,
    period: args.period,
    ranges,
    gsc: {
      configured: gscCurrent.configured,
      current: gscCurrent,
      previous: gscPrevious,
      error: gscCurrent.error
    },
    ga4,
    ga4Previous,
    bing,
    serp,
    ai,
    outDir,
    generatedAt
  });

  const summary = result.summary;
  console.log('');
  console.log(`Report:    ${result.reportPath}`);
  console.log(`Dashboard: ${result.dashboardPath}`);
  console.log(
    `Clicks:    ${summary.gsc.current.clicks} (${summary.gsc.clickChangePct > 0 ? '+' : ''}${summary.gsc.clickChangePct}%)`
  );
  console.log(
    `AI:        ${summary.ai.total ? `${summary.ai.mentionRate}% mentioned / ${summary.ai.citationRate}% cited` : 'no audit data'}`
  );
  console.log(`Alerts:    ${summary.alerts.length}`);
  console.log('');

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, fs.readFileSync(result.reportPath, 'utf8'));
  }

  if (args.strict && summary.alerts.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
