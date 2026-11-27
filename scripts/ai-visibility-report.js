/**
 * Summarise the monthly AI visibility audit.
 *
 * Reads ai-visibility-audit.csv (75 cells per run) and prints mention,
 * citation, and accuracy rates by prompt group.
 *
 * Usage:
 *   node scripts/ai-visibility-report.js
 *   node scripts/ai-visibility-report.js --run 2026-11-27
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'ai-visibility-audit.csv');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    if (row.some((v) => v !== '')) rows.push(row);
  }
  return rows;
}

if (!fs.existsSync(FILE)) {
  console.error('Missing ai-visibility-audit.csv');
  process.exit(1);
}

const rows = parseCsv(fs.readFileSync(FILE, 'utf8'));
const header = rows.shift();
const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
const runArg = process.argv.includes('--run')
  ? process.argv[process.argv.indexOf('--run') + 1]
  : null;

const completed = rows
  .map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] || '').trim()])))
  .filter((r) => r.run_date)
  .filter((r) => !runArg || r.run_date === runArg);

if (!completed.length) {
  console.log('No completed runs yet. Fill run_date, mentioned, cited, and accuracy in ai-visibility-audit.csv.');
  process.exit(0);
}

const groups = new Map();
for (const row of completed) {
  const g = row.group || '?';
  if (!groups.has(g)) groups.set(g, { total: 0, mentioned: 0, cited: 0, accurate: 0, partial: 0, wrong: 0 });
  const s = groups.get(g);
  s.total++;
  if (row.mentioned.toLowerCase() === 'yes') {
    s.mentioned++;
    if (row.accuracy === 'accurate') s.accurate++;
    else if (row.accuracy === 'partial') s.partial++;
    else if (row.accuracy === 'wrong') s.wrong++;
  }
  if (row.cited.toLowerCase() === 'yes') s.cited++;
}

const pct = (n, d) => (d ? Math.round((n / d) * 100) + '%' : 'n/a');
const totals = { total: 0, mentioned: 0, cited: 0, accurate: 0, partial: 0, wrong: 0 };

console.log(`\nAI visibility${runArg ? ' — run ' + runArg : ''} (${completed.length} cells)\n`);
console.log('Group  Cells  Mention  Citation  Accurate  Partial  Wrong');
for (const [g, s] of [...groups.entries()].sort()) {
  totals.total += s.total;
  totals.mentioned += s.mentioned;
  totals.cited += s.cited;
  totals.accurate += s.accurate;
  totals.partial += s.partial;
  totals.wrong += s.wrong;
  console.log(
    `${g.padEnd(6)} ${String(s.total).padEnd(6)} ${pct(s.mentioned, s.total).padEnd(8)} ${pct(s.cited, s.total).padEnd(9)} ${String(s.accurate).padEnd(9)} ${String(s.partial).padEnd(8)} ${s.wrong}`
  );
}
console.log(
  `${'ALL'.padEnd(6)} ${String(totals.total).padEnd(6)} ${pct(totals.mentioned, totals.total).padEnd(8)} ${pct(totals.cited, totals.total).padEnd(9)} ${String(totals.accurate).padEnd(9)} ${String(totals.partial).padEnd(8)} ${totals.wrong}`
);
console.log('');
