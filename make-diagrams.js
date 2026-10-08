/**
 * make-diagrams.js — inline concept diagrams for blog posts.
 *
 * Usage:
 *   node make-diagrams.js                # inject/refresh every diagram in DIAGRAMS
 *   node make-diagrams.js --only slug    # just one post
 *   node make-diagrams.js --dry          # print what would change
 *
 * Diagrams are wrapped in <!-- concept-diagram:start/end --> markers so runs are
 * idempotent. Layout is theme-safe: surfaces and text use CSS custom properties
 * (set through `style=`, which supports var()), accents use gradients whose hex
 * values read well on both the dark and light themes.
 */
const fs = require('fs');

const EOL = '\r\n';
const START = '<!-- concept-diagram:start -->';
const END = '<!-- concept-diagram:end -->';
const W = 960;
const FONT = 'Inter,-apple-system,BlinkMacSystemFont,sans-serif';

const GRAD = {
  blue:   ['#2563eb', '#7c3aed'],
  indigo: ['#4f46e5', '#7c3aed'],
  green:  ['#047857', '#10b981'],
  red:    ['#b91c1c', '#ef4444'],
  amber:  ['#b45309', '#f59e0b'],
  cyan:   ['#0e7490', '#0891b2'],
  teal:   ['#0f766e', '#14b8a6'],
  violet: ['#6d28d9', '#a78bfa'],
  slate:  ['#334155', '#64748b']
};
const ACCENT = {
  blue: 'var(--pa-at-blue)', indigo: 'var(--pa-at-indigo)', green: 'var(--pa-at-green)',
  red: 'var(--pa-at-red)', amber: 'var(--pa-at-amber)', cyan: 'var(--pa-at-cyan)',
  teal: 'var(--pa-at-teal)', violet: 'var(--pa-at-purple)', slate: 'var(--pa-t-muted)'
};
const SURFACE = 'var(--pa-surface-2)';
const BORDER = 'var(--pa-wb-012)';
const LANE = 'var(--pa-wb-004)';
const LANE_B = 'var(--pa-wb-008)';
const T_STRONG = 'var(--pa-t-strong)';
const T_MUTED = 'var(--pa-t-muted)';
const T_DIM = 'var(--pa-t-dim)';
const ARROW = 'var(--pa-t-dim)';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function wrap(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}
function textLines(x, y, lines, o) {
  const size = o.size || 11, lh = o.lh || size + 4;
  const fill = o.fill || T_STRONG;
  const anchor = o.anchor || 'middle';
  let s = '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor + '" style="fill:' + fill +
    ';font-family:' + FONT + ';font-size:' + size + 'px;font-weight:' + (o.weight || 600) + '">';
  lines.forEach((l, i) => {
    s += '<tspan x="' + x + '"' + (i ? ' dy="' + lh + '"' : '') + '>' + esc(l) + '</tspan>';
  });
  return s + '</text>';
}
function gradDefs(pid, keys) {
  let s = '<defs>';
  const seen = new Set();
  for (const k of keys) {
    if (!GRAD[k] || seen.has(k)) continue;
    seen.add(k);
    s += '<linearGradient id="' + pid + '-' + k + '" x1="0%" y1="0%" x2="100%" y2="0%">' +
      '<stop offset="0%" stop-color="' + GRAD[k][0] + '"/><stop offset="100%" stop-color="' + GRAD[k][1] + '"/></linearGradient>';
  }
  ['a', 'ag', 'ar'].forEach((id, i) => {
    const col = [ARROW, '#10b981', '#ef4444'][i];
    s += '<marker id="' + pid + '-' + id + '" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">' +
      '<polygon points="0 0, 9 3.5, 0 7" style="fill:' + col + '"/></marker>';
  });
  return s + '</defs>';
}
function markerFor(tone) {
  if (tone === 'green') return 'ag';
  if (tone === 'red') return 'ar';
  return 'a';
}

/** rounded node box with optional accent stripe; returns {inner, titleFill, subFill} */
function nodeBox(x, y, w, h, o) {
  const tone = o.tone;
  let inner = '', titleFill = T_STRONG, subFill = T_MUTED;
  if (tone && GRAD[tone]) {
    inner = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10" style="fill:url(#' + o.pid + '-' + tone + ')"/>';
    titleFill = '#ffffff';
    subFill = 'rgba(255,255,255,.86)';
  } else {
    const stroke = o.accent ? ACCENT[o.accent] : BORDER;
    const sw = o.accent ? 1.5 : 1;
    inner = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10" style="fill:' + SURFACE +
      ';stroke:' + stroke + ';stroke-width:' + sw + '"/>';
    if (o.accent) {
      inner += '<rect x="' + (x + 10) + '" y="' + (y + 1) + '" width="' + (w - 20) + '" height="3" rx="1.5" style="fill:' + ACCENT[o.accent] + '"/>';
      titleFill = ACCENT[o.accent];
    }
  }
  const maxC = Math.max(6, Math.floor((w - 14) / ((o.tSize || 12) * 0.56)));
  const tl = wrap(o.t, maxC);
  const startY = y + (o.s ? h / 2 - 8 : h / 2 + 4) - (tl.length - 1) * 7;
  inner += textLines(x + w / 2, startY, tl, { size: o.tSize || 12, weight: 700, fill: titleFill, lh: 15 });
  if (o.s) {
    const sc = Math.max(6, Math.floor((w - 14) / ((o.sSize || 9.5) * 0.52)));
    const sl = wrap(o.s, sc).slice(0, 2);
    inner += textLines(x + w / 2, startY + tl.length * 15 + 3, sl, { size: o.sSize || 9.5, weight: 500, fill: subFill, lh: 12 });
  }
  return inner;
}
function arrow(x1, y1, x2, y2, tone, label, lx, ly) {
  let s = '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" style="fill:none;stroke:' +
    (tone === 'green' ? '#10b981' : tone === 'red' ? '#ef4444' : ARROW) + ';stroke-width:2" marker-end="url(#' + lx + '-' + markerFor(tone) + ')"/>';
  if (label) {
    s += textLines((x1 + x2) / 2, ly, wrap(label, Math.max(6, Math.floor(Math.abs(x2 - x1) / 5))),
      { size: 9.5, weight: 700, fill: tone === 'green' ? 'var(--pa-at-green)' : tone === 'red' ? 'var(--pa-at-red)' : T_MUTED });
  }
  return s;
}

/* ---------------------------------------------------------------- templates */

function tFlow(pid, spec) {
  const nodes = spec.nodes, n = nodes.length;
  const pad = 18, gap = spec.gap || (spec.labels ? 46 : 34), h = spec.h || 88, y = 34;
  const nodeW = (W - pad * 2 - (n - 1) * gap) / n;
  const tSize = spec.tSize || (n >= 6 ? 11.5 : 12);
  const sSize = spec.sSize || (n >= 6 ? 9 : 9.5);
  let s = gradDefs(pid, nodes.map(x => x.tone).filter(Boolean));
  nodes.forEach((nd, i) => {
    const x = pad + i * (nodeW + gap);
    s += nodeBox(x, y, nodeW, h, Object.assign({ pid: pid, tSize: tSize, sSize: sSize }, nd));
    if (i < n - 1) {
      s += arrow(x + nodeW + 4, y + h / 2, x + nodeW + gap - 4, y + h / 2, spec.arrowTone,
        (spec.labels || [])[i], pid, y + h / 2 - 11);
    }
  });
  return { w: W, h: y + h + 34, body: s };
}

function tSteps(pid, spec) {
  const steps = spec.steps, n = steps.length;
  const pad = 16, colW = (W - pad * 2) / n, cy = 54, r = 21;
  let s = gradDefs(pid, steps.map(x => x.tone).filter(Boolean));
  s += '<path d="M' + (pad + colW / 2) + ' ' + cy + ' L' + (pad + (n - 0.5) * colW) + ' ' + cy +
    '" style="fill:none;stroke:' + LANE_B + ';stroke-width:3" stroke-linecap="round"/>';
  let maxLines = 0;
  steps.forEach((st, i) => {
    const cx = pad + (i + 0.5) * colW;
    const tone = st.tone || 'blue';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" style="fill:url(#' + pid + '-' + tone + ')"/>';
    s += '<text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" style="fill:#fff;font-family:' + FONT +
      ';font-size:14px;font-weight:800">' + (i + 1) + '</text>';
    const tl = wrap(st.t, Math.floor((colW - 14) / 6.6)).slice(0, 3);
    s += textLines(cx, cy + r + 24, tl, { size: 12, weight: 700, fill: T_STRONG, lh: 15 });
    let y = cy + r + 24 + tl.length * 15 + 4;
    if (st.s) {
      const sl = wrap(st.s, Math.floor((colW - 14) / 4.9)).slice(0, 3);
      s += textLines(cx, y, sl, { size: 9.5, weight: 500, fill: T_MUTED, lh: 12 });
      y += sl.length * 12;
    }
    maxLines = Math.max(maxLines, y);
  });
  return { w: W, h: maxLines + 26, body: s };
}

function tSplit(pid, spec) {
  const pad = 16, gap = 56, panelW = (W - pad * 2 - gap) / 2;
  const rows = Math.max(spec.left.items.length, spec.right.items.length);
  const headH = 44, rowH = 36, y = 26;
  const panelH = headH + rows * rowH + 16;
  const H = y + panelH + 28;
  let s = gradDefs(pid, [spec.left.tone || 'slate', spec.right.tone || 'slate']);
  [spec.left, spec.right].forEach((p, idx) => {
    const x = pad + idx * (panelW + gap);
    s += '<rect x="' + x + '" y="' + y + '" width="' + panelW + '" height="' + panelH + '" rx="14" style="fill:' + LANE + ';stroke:' + LANE_B + '"/>';
    s += '<rect x="' + x + '" y="' + y + '" width="' + panelW + '" height="' + headH + '" rx="14" style="fill:url(#' + pid + '-' + (p.tone || 'slate') + ')"/>';
    s += '<rect x="' + x + '" y="' + (y + headH - 14) + '" width="' + panelW + '" height="14" style="fill:url(#' + pid + '-' + (p.tone || 'slate') + ')"/>';
    s += textLines(x + panelW / 2, y + headH / 2 + 5, wrap(p.title, Math.floor(panelW / 8)).slice(0, 2),
      { size: 13, weight: 800, fill: '#fff', lh: 15 });
    p.items.forEach((it, i) => {
      const iy = y + headH + 16 + i * rowH + 12;
      s += '<rect x="' + (x + 16) + '" y="' + (iy - 9) + '" width="14" height="14" rx="4" style="fill:' + LANE_B + '"/>';
      s += '<path d="M' + (x + 19.5) + ' ' + (iy - 2) + ' l3 3 l5.5 -6" style="fill:none;stroke:' +
        ACCENT[p.tone === 'slate' ? 'blue' : p.tone] + ';stroke-width:2" stroke-linecap="round" stroke-linejoin="round"/>';
      s += textLines(x + 40, iy + 4, wrap(it, Math.floor((panelW - 56) / 6.4)).slice(0, 2),
        { size: 11.5, weight: 500, fill: T_STRONG, anchor: 'start', lh: 14 });
    });
  });
  const cx = W / 2;
  s += '<circle cx="' + cx + '" cy="' + (y + panelH / 2) + '" r="22" style="fill:' + SURFACE + ';stroke:' + BORDER + ';stroke-width:2"/>';
  s += '<text x="' + cx + '" y="' + (y + panelH / 2 + 5) + '" text-anchor="middle" style="fill:' + T_MUTED +
    ';font-family:' + FONT + ';font-size:13px;font-weight:800">vs</text>';
  return { w: W, h: H, body: s };
}

function tGrid(pid, spec) {
  const cells = spec.cells, cols = spec.cols || 3;
  const pad = 16, gap = 18;
  const cellW = (W - pad * 2 - (cols - 1) * gap) / cols;
  const cellH = spec.cellH || 104;
  const rows = Math.ceil(cells.length / cols);
  const y = 24;
  const H = y + rows * (cellH + gap) + 14;
  let s = gradDefs(pid, cells.map(c => c.tone).filter(Boolean));
  cells.forEach((c, i) => {
    const r = Math.floor(i / cols), col = i % cols;
    const inRow = Math.min(cols, cells.length - r * cols);
    const rowW = inRow * cellW + (inRow - 1) * gap;
    const x0 = (W - rowW) / 2;
    const x = x0 + col * (cellW + gap);
    const yy = y + r * (cellH + gap);
    const tone = c.tone;
    if (tone && GRAD[tone]) {
      s += '<rect x="' + x + '" y="' + yy + '" width="' + cellW + '" height="' + cellH + '" rx="12" style="fill:url(#' + pid + '-' + tone + ')"/>';
      var titleFill = '#fff', subFill = 'rgba(255,255,255,.86)', badge = 'rgba(255,255,255,.25)';
    } else {
      s += '<rect x="' + x + '" y="' + yy + '" width="' + cellW + '" height="' + cellH + '" rx="12" style="fill:' + SURFACE + ';stroke:' + BORDER + '"/>';
      const acc = ACCENT[c.accent || 'blue'];
      s += '<rect x="' + (x + 12) + '" y="' + (yy + 1) + '" width="' + (cellW - 24) + '" height="3" rx="1.5" style="fill:' + acc + '"/>';
      titleFill = acc; subFill = T_MUTED; badge = 'transparent';
    }
    if (c.k) {
      s += '<rect x="' + (x + 12) + '" y="' + (yy + 14) + '" width="' + Math.min(cellW - 24, 30 + c.k.length * 7) + '" height="20" rx="10" style="fill:' + badge + '"/>';
      s += textLines(x + 12 + Math.min(cellW - 24, 30 + c.k.length * 7) / 2, yy + 28, [c.k],
        { size: 9.5, weight: 800, fill: titleFill });
    }
    const tl = wrap(c.t, Math.floor((cellW - 24) / 7.1)).slice(0, 2);
    s += textLines(x + cellW / 2, yy + (c.k ? 58 : 34), tl, { size: 13, weight: 700, fill: titleFill, lh: 16 });
    if (c.s) {
      const sl = wrap(c.s, Math.floor((cellW - 24) / 5.3)).slice(0, 3);
      s += textLines(x + cellW / 2, yy + (c.k ? 58 : 34) + tl.length * 16 + 6, sl, { size: 10, weight: 500, fill: subFill, lh: 13 });
    }
  });
  return { w: W, h: H, body: s };
}

function tLoop(pid, spec) {
  const nodes = spec.nodes, n = nodes.length;
  const pad = 18, gap = 40, h = 86, y = 30;
  const nodeW = (W - pad * 2 - (n - 1) * gap) / n;
  const H = y + h + 96;
  let s = gradDefs(pid, nodes.map(x => x.tone).filter(Boolean));
  nodes.forEach((nd, i) => {
    const x = pad + i * (nodeW + gap);
    s += nodeBox(x, y, nodeW, h, Object.assign({ pid: pid }, nd));
    if (i < n - 1) s += arrow(x + nodeW + 4, y + h / 2, x + nodeW + gap - 4, y + h / 2, spec.arrowTone, null, pid);
  });
  const xFirst = pad + nodeW / 2, xLast = pad + (n - 1) * (nodeW + gap) + nodeW / 2;
  const ry = y + h + 44;
  s += '<path d="M' + xLast + ' ' + (y + h + 4) + ' V' + ry + ' H' + xFirst + ' V' + (y + h + 10) +
    '" style="fill:none;stroke:' + ARROW + ';stroke-width:2;stroke-dasharray:6 5" marker-end="url(#' + pid + '-a)" stroke-linejoin="round"/>';
  if (spec.loopLabel) {
    const ll = wrap(spec.loopLabel, 44);
    const bw = 300, bh = 20 + ll.length * 13;
    s += '<rect x="' + (W / 2 - bw / 2) + '" y="' + (ry - bh / 2) + '" width="' + bw + '" height="' + bh +
      '" rx="10" style="fill:' + SURFACE + ';stroke:' + BORDER + '"/>';
    s += textLines(W / 2, ry + 4 - (ll.length - 1) * 6.5, ll, { size: 10.5, weight: 700, fill: T_MUTED, lh: 13 });
  }
  return { w: W, h: H, body: s };
}

function tTimeline(pid, spec) {
  const pad = 20, labelW = spec.labelW || 168;
  const axisY = 34, rowH = spec.rowH || 64, y0 = 54;
  const plotX = pad + labelW;
  const plotW = W - pad - plotX;
  const lanes = spec.lanes;
  const H = y0 + lanes.length * rowH + 34;
  let s = gradDefs(pid, spec.lanes.flatMap(l => l.bars.map(b => b.tone)).filter(Boolean));
  s += '<rect x="' + plotX + '" y="' + axisY + '" width="' + plotW + '" height="' + (lanes.length * rowH + 6) +
    '" rx="8" style="fill:' + LANE + '"/>';
  (spec.axis || []).forEach((a, i) => {
    const x = plotX + (a.at) * plotW;
    s += '<path d="M' + x + ' ' + axisY + ' V' + (axisY + lanes.length * rowH + 6) + '" style="stroke:' + LANE_B + ';stroke-width:1;stroke-dasharray:4 4"/>';
    s += textLines(x + (i === (spec.axis.length - 1) ? -4 : 6), axisY - 8, wrap(a.t, 20),
      { size: 9.5, weight: 700, fill: T_DIM, anchor: i === (spec.axis.length - 1) ? 'end' : 'start' });
  });
  lanes.forEach((lane, li) => {
    const ly = y0 + li * rowH;
    s += textLines(pad, ly + rowH / 2 - 2, wrap(lane.label, Math.floor(labelW / 6.4)).slice(0, 2),
      { size: 11.5, weight: 700, fill: T_STRONG, anchor: 'start', lh: 14 });
    if (lane.sub) {
      s += textLines(pad, ly + rowH / 2 + 14, wrap(lane.sub, Math.floor(labelW / 5)).slice(0, 2),
        { size: 9, weight: 500, fill: T_MUTED, anchor: 'start', lh: 11 });
    }
    lane.bars.forEach(b => {
      const x = plotX + b.from * plotW, w = (b.to - b.from) * plotW;
      const tone = b.tone || 'plain';
      const by = ly + 10, bh = rowH - 24;
      const bl = wrap(b.t, Math.max(5, Math.floor(w / 6.6))).slice(0, 2);
      const byT = by + bh / 2 + 4 - (bl.length - 1) * 6.5;
      if (tone !== 'plain' && GRAD[tone]) {
        s += '<rect x="' + x + '" y="' + by + '" width="' + Math.max(w, 6) + '" height="' + bh + '" rx="8" style="fill:url(#' + pid + '-' + tone + ')"/>';
        s += textLines(x + w / 2, byT, bl, { size: 10.5, weight: 700, fill: '#fff', lh: 13 });
      } else {
        const acc = ACCENT[b.accent || 'blue'];
        s += '<rect x="' + x + '" y="' + by + '" width="' + Math.max(w, 6) + '" height="' + bh +
          '" rx="8" style="fill:' + LANE_B + ';stroke:' + acc + ';stroke-width:1.5" stroke-dasharray="' + (b.dash ? '6 4' : '0') + '"/>';
        s += textLines(x + w / 2, byT, bl, { size: 10.5, weight: 700, fill: acc, lh: 13 });
      }
    });
  });
  if (spec.legend) {
    let lx = plotX;
    spec.legend.forEach(l => {
      s += '<rect x="' + lx + '" y="' + (H - 24) + '" width="14" height="14" rx="4" style="fill:' +
        (l.tone && GRAD[l.tone] ? 'url(#' + pid + '-' + l.tone + ')' : LANE_B) + ';' +
        (l.tone && GRAD[l.tone] ? '' : 'stroke:' + ACCENT[l.accent || 'blue'] + ';stroke-width:1.5') + '"/>';
      s += textLines(lx + 20, H - 12, [l.t], { size: 9.5, weight: 600, fill: T_MUTED, anchor: 'start' });
      lx += 24 + l.t.length * 5.6;
    });
  }
  return { w: W, h: H, body: s };
}

const TPL = { flow: tFlow, steps: tSteps, split: tSplit, grid: tGrid, loop: tLoop, timeline: tTimeline };

/* ------------------------------------------------------------------- specs */

const DIAGRAMS = [
  {
    slug: '4dalert-vs-legacy-mdm', tpl: 'split', anchor: 'two-philosophies',
    aria: 'Legacy MDM suite and AI-native platform compared side by side',
    caption: 'The two design centres: a legacy suite optimises for comprehensive multi-domain governance, an AI-native platform optimises for reaching a trusted first domain fast on infrastructure you already run.',
    left: { title: 'Legacy MDM suite', tone: 'slate', items: ['Multi-domain modelling depth', 'Formal stewardship hierarchies', 'Mature write-back coexistence', 'Multi-year budget programme'] },
    right: { title: '4DAlert (AI-native)', tone: 'blue', items: ['Trusted first domain, fast', 'Scored and learned matching', 'Exception-driven stewardship', 'Reconciliation built into the module'] }
  },
  {
    slug: 'agentic-ai-database-devops', tpl: 'flow', anchor: 'architecture',
    aria: 'Six components of an agentic database workflow, from scope to human approval',
    caption: 'The six components of an agentic database workflow: scope and live context feed a reviewable plan, a deterministic gate decides, and a named human approves before anything executes.',
    nodes: [
      { t: 'Goal & scope', s: 'Database, objects, change class', tone: 'blue' },
      { t: 'Context layer', s: 'Schema, lineage, history, logs' },
      { t: 'Tool set', s: 'Diff, author, test, provision' },
      { t: 'Plan', s: 'Sequenced actions with reasoning' },
      { t: 'Verification gate', s: 'Deterministic checks decide' },
      { t: 'Approval', s: 'Named human, then pipeline runs' }
    ],
    labels: ['stated', 'read', 'call', 'review', 'pass']
  },
  {
    slug: 'ai-agents-enterprise', tpl: 'loop', anchor: 'how-ai-agents-work-the-core-loop',
    aria: 'The AI agent core loop: perception, reasoning, action and memory',
    caption: 'Every AI agent runs the same core loop — perceive the environment, reason to a plan, act through tools, and write the result back to memory — repeating until the goal is met or a stop condition fires.',
    nodes: [
      { t: '1. Perception', s: 'Databases, APIs, documents, logs', tone: 'blue' },
      { t: '2. Reasoning', s: 'LLM decomposes goal into sub-tasks' },
      { t: '3. Action', s: 'Tools execute the chosen step' },
      { t: '4. Memory', s: 'Results stored for the next turn', tone: 'green' }
    ],
    loopLabel: 'Repeats until the goal is achieved or a stop condition is met'
  },
  {
    slug: 'ai-business-intelligence', tpl: 'flow', anchor: '1-natural-language-querying-nlq',
    aria: 'How AI fits on top of the business intelligence pipeline',
    caption: 'AI sits on top of the same BI pipeline: sources are prepared and modelled once, then natural-language query, prediction and dashboards all read one governed layer.',
    nodes: [
      { t: 'Sources', s: 'CRM, ERP, web, IoT' },
      { t: 'AI data prep', s: 'Automated cleansing and joins', tone: 'cyan' },
      { t: 'Semantic model', s: 'One definition per metric' },
      { t: 'AI features', s: 'NLQ, prediction, discovery', tone: 'blue' },
      { t: 'Decisions', s: 'Dashboards and actions', tone: 'green' }
    ],
    labels: ['ingest', 'model', 'augment', 'act']
  },
  {
    slug: 'ai-changing-data-quality', tpl: 'split', anchor: 'traditional-dq-limits',
    aria: 'Column-level tests compared with context-aware data quality',
    caption: 'Column-level tests are essential guardrails, but they cannot see business context or entity relationships — which is why teams report 40-60% of data quality test failures are false positives.',
    left: { title: 'Column-level tests', tone: 'slate', items: ['NOT NULL, UNIQUE, FK checks', 'No business context', 'No relationship awareness', '40-60% false positives reported'] },
    right: { title: 'Context-aware DQ', tone: 'green', items: ['Reads the entity relationship graph', 'Judges nulls by business domain', 'Thresholds adapt to seasonality', 'Fewer, sharper, trusted alerts'] }
  },
  {
    slug: 'ai-master-data-management', tpl: 'flow', anchor: 'how-ai-works',
    aria: 'How AI changes each stage of master data management',
    caption: 'AI touches every stage: learned standardisation feeds three matching approaches — deterministic, probabilistic and machine-learned — before survivorship produces the golden record.',
    nodes: [
      { t: 'Standardize', s: 'Learned formats and patterns', tone: 'cyan' },
      { t: 'Deterministic', s: 'Exact strong-key matches' },
      { t: 'Probabilistic', s: 'Fellegi-Sunter field weighting' },
      { t: 'Machine-learned', s: 'Trained on accepted decisions', tone: 'blue' },
      { t: 'Survivorship', s: 'Best value per attribute' },
      { t: 'Golden record', s: 'Trusted, complete entity', tone: 'green' }
    ],
    labels: ['clean', 'fast pass', 'score', 'learn', 'merge']
  },
  {
    slug: 'build-data-driven-culture', tpl: 'steps', anchor: 'a-practical-framework-for-building-a',
    aria: 'Six-step framework for building a data-driven culture',
    caption: 'A practical six-step framework: culture change starts with leadership, is carried by literacy and access, and is locked in by governance, visible wins and process — not dashboards alone.',
    steps: [
      { t: 'Leadership buy-in', s: 'CDO with authority, data OKRs', tone: 'blue' },
      { t: 'Data literacy', s: 'Role-specific training', tone: 'indigo' },
      { t: 'Democratise access', s: 'Self-service, no ticket queue' },
      { t: 'Data governance', s: 'Ownership and definitions' },
      { t: 'Celebrate wins', s: 'Share success stories' },
      { t: 'Bake into process', s: 'Data in workflows, not just BI', tone: 'green' }
    ]
  },
  {
    slug: 'choose-right-analytics-platform', tpl: 'steps', anchor: 'a-decision-framework-that-actually-works',
    aria: 'Six-step decision framework for choosing an analytics platform',
    caption: 'A six-step vendor decision framework: know your maturity, fix your non-negotiables, score objectively, prove it with your own data, price the whole lifecycle, then check long-term references.',
    steps: [
      { t: 'Assess maturity', s: 'Where you are, where in 18 months', tone: 'blue' },
      { t: 'Set non-negotiables', s: 'Must-haves vs nice-to-haves' },
      { t: 'Weighted scorecard', s: 'Your criteria, not review sites' },
      { t: 'Real POC', s: 'Your data, use cases, users', tone: 'indigo' },
      { t: 'Total cost', s: 'Build, train, run' },
      { t: 'References', s: 'Customers 12+ months in', tone: 'green' }
    ]
  },
  {
    slug: 'cross-cloud-data-reconciliation', tpl: 'grid', anchor: 'patterns', cols: 3,
    aria: 'Three patterns for reconciling data across cloud platforms',
    caption: 'Three cross-cloud reconciliation patterns, each with a different trade-off between simplicity, resilience and operational overhead.',
    cells: [
      { k: 'Pattern 1', t: 'Hub-and-spoke', s: 'One environment reconciles everything — simple, but a single point of truth and a bottleneck.', accent: 'blue' },
      { k: 'Pattern 2', t: 'Peer-to-peer', s: 'Every environment reconciles with every other — resilient, but n(n-1)/2 comparisons.', accent: 'indigo' },
      { k: 'Pattern 3', t: 'Federated catalog', s: 'A shared catalog carries the profile; each environment answers its own comparisons.', accent: 'teal' }
    ]
  },
  {
    slug: 'data-driven-decision-making', tpl: 'steps', anchor: 'framework',
    aria: 'Five-step data-driven decision making framework',
    caption: 'The five-step DDDM framework: define the decision first, then data, analysis, communication — and only then decide and act.',
    steps: [
      { t: 'Define objectives', s: 'What question, what success', tone: 'blue' },
      { t: 'Collect & integrate', s: 'CRM, ERP, web, IoT, external' },
      { t: 'Analyse & model', s: 'Descriptive through predictive' },
      { t: 'Visualise & communicate', s: 'One story for every level' },
      { t: 'Decide & act', s: 'Then measure the outcome', tone: 'green' }
    ]
  },
  {
    slug: 'data-modeling-crisis', tpl: 'split', anchor: 'semantic-layer-problem',
    aria: 'Metric definitions scattered across BI tools versus a shared semantic layer',
    caption: 'When every tool defines its own metrics, the same name computes differently everywhere — a shared semantic layer between raw data and BI tools is what makes one number stay one number.',
    left: { title: 'Definition per tool', tone: 'red', items: ['Looker, Tableau, Power BI each differ', 'Same name, different maths', 'No way to enforce consistency', 'One-off metrics multiply'] },
    right: { title: 'Shared semantic layer', tone: 'green', items: ['One definition per metric', 'Sits between data and BI tools', 'Governed centrally', 'The same number everywhere'] }
  },
  {
    slug: 'data-quality-framework', tpl: 'grid', anchor: 'six-dimensions', cols: 3,
    aria: 'The six dimensions of data quality',
    caption: 'The industry-standard six dimensions of data quality — define which of them matter for your organisation before you build any rules.',
    cells: [
      { k: 'Dimension 1', t: 'Accuracy', s: 'Does the data match the real-world entity?', accent: 'blue' },
      { k: 'Dimension 2', t: 'Completeness', s: 'Is all required data actually present?', accent: 'indigo' },
      { k: 'Dimension 3', t: 'Consistency', s: 'Is it the same value across every system?', accent: 'teal' },
      { k: 'Dimension 4', t: 'Timeliness', s: 'Is the data available when it is needed?', accent: 'cyan' },
      { k: 'Dimension 5', t: 'Validity', s: 'Does it conform to formats and rules?', accent: 'violet' },
      { k: 'Dimension 6', t: 'Uniqueness', s: 'Are there unwanted duplicate records?', accent: 'green' }
    ]
  },
  {
    slug: 'database-change-management', tpl: 'flow', anchor: 'lifecycle',
    aria: 'The database change management lifecycle from request to audit',
    caption: 'The database change management lifecycle: every change is specified, versioned, reviewed as a diff, tested against a realistic database, approved in proportion to risk, deployed through one path, then verified and audited.',
    nodes: [
      { t: 'Request & spec', s: 'Objects, lock, backfill, reversal', tone: 'blue' },
      { t: 'Author in VCS', s: 'Immutable migration + rollback' },
      { t: 'Peer review', s: 'Generated diff on the PR' },
      { t: 'Test', s: 'Realistic disposable database' },
      { t: 'Approve by risk', s: 'Depth scales with change class' },
      { t: 'Deploy once', s: 'A single promotion path' },
      { t: 'Verify & audit', s: 'Post-deploy check, full trail', tone: 'green' }
    ],
    labels: ['specify', 'commit', 'review', 'test', 'approve', 'release']
  },
  {
    slug: 'databricks-vs-snowflake', tpl: 'split', anchor: 'architecture-lakehouse-vs-data-warehouse',
    aria: 'Lakehouse architecture versus cloud data warehouse architecture',
    caption: 'The difference is philosophy, not features: a lakehouse stores open formats on storage you own with ephemeral compute, while a cloud warehouse is a managed service over a proprietary format.',
    left: { title: 'Databricks — lakehouse', tone: 'cyan', items: ['Open formats: Delta Lake / Parquet', 'You own the cloud storage', 'Decoupled, ephemeral compute', 'Spark, SQL, ML on one copy'] },
    right: { title: 'Snowflake — warehouse', tone: 'indigo', items: ['Proprietary storage format', 'Fully managed SaaS', 'Auto-optimised virtual warehouses', 'SQL-first, zero-ops scaling'] }
  },
  {
    slug: 'devops-best-practices', tpl: 'flow', anchor: '2-implement-cicd-for-data-pipelines',
    aria: 'CI/CD pipeline for data from commit to monitored production',
    caption: 'Data pipelines get the same treatment as application code: every change is versioned, tested, gated on data quality, promoted through matching environments, and observed in production.',
    nodes: [
      { t: 'Commit', s: 'Models and SQL in Git', tone: 'blue' },
      { t: 'Build & test', s: 'Compile, unit and data tests' },
      { t: 'Quality gate', s: 'Schema and DQ checks block', tone: 'amber' },
      { t: 'Staging', s: 'Environment parity' },
      { t: 'Production', s: 'Automated promotion', tone: 'green' },
      { t: 'Monitor', s: 'Freshness, volume, lineage' }
    ],
    labels: ['push', 'validate', 'pass', 'promote', 'watch']
  },
  {
    slug: 'enterprise-rag-architecture', tpl: 'flow', anchor: 'how-rag-works-the-complete-pipeline',
    aria: 'End-to-end production RAG pipeline from documents to grounded answer',
    caption: 'The production RAG pipeline: documents are chunked, embedded and indexed offline; a query triggers retrieval, re-ranking and generation, so the answer is grounded and attributable to a source.',
    nodes: [
      { t: 'Documents', s: 'PDF, HTML, APIs, raw data', tone: 'slate' },
      { t: 'Chunking', s: 'Fixed-size or semantic splits' },
      { t: 'Embedding', s: 'Text turned into vectors' },
      { t: 'Vector DB', s: 'Indexed vectors + metadata', tone: 'indigo' },
      { t: 'Retrieve', s: 'Hybrid search + re-ranking', tone: 'blue' },
      { t: 'Generate', s: 'LLM answer with sources', tone: 'green' }
    ],
    labels: ['ingest', 'split', 'embed', 'query', 'ground']
  },
  {
    slug: 'entity-resolution-ai', tpl: 'flow', anchor: 'anatomy',
    aria: 'Six stages of an AI entity resolution pipeline',
    caption: 'A complete AI entity resolution pipeline has six stages — most failed implementations skip at least two, usually blocking and verification.',
    nodes: [
      { t: 'Standardize', s: 'Case, units, addresses', tone: 'cyan' },
      { t: 'Block', s: 'Candidate pairs; recall ceiling' },
      { t: 'Compare', s: 'Exact, fuzzy, embedding scores' },
      { t: 'Score & classify', s: 'Match / non-match / review', tone: 'blue' },
      { t: 'Merge', s: 'Survivorship + provenance' },
      { t: 'Verify', s: 'Feedback into the matcher', tone: 'green' }
    ],
    labels: ['normalise', 'candidates', 'measure', 'decide', 'learn']
  },
  {
    slug: 'future-of-automated-data-reconciliation', tpl: 'steps', anchor: 'the-shift',
    aria: 'The progression from manual checks to intelligent data quality',
    caption: 'The predictable maturity path: manual checks give way to scripted rules, then to always-on continuous reconciliation, and finally to intelligent, self-tuning data quality.',
    steps: [
      { t: 'Manual checks', s: 'Spreadsheets and ad-hoc SQL', tone: 'slate' },
      { t: 'Automated rules', s: 'Scheduled, consistent, repeatable', tone: 'cyan' },
      { t: 'Continuous reconciliation', s: 'Always on, exception-driven', tone: 'blue' },
      { t: 'Intelligent data quality', s: 'Learns thresholds and context', tone: 'green' }
    ]
  },
  {
    slug: 'mdm-ai-era', tpl: 'flow', anchor: 'golden-record',
    aria: 'AI-powered matching building a golden record from source records',
    caption: 'AI-powered matching replaces hard-coded rules with scored likelihoods and self-tuning thresholds, then automated survivorship assembles the golden record from the winning values.',
    nodes: [
      { t: 'Source records', s: 'CRM, ERP, product, support', tone: 'slate' },
      { t: 'Probabilistic match', s: 'Dozens of signals scored' },
      { t: 'Self-tuning thresholds', s: 'Learned from human decisions', tone: 'blue' },
      { t: 'Automated survivorship', s: 'Best value per attribute' },
      { t: 'Golden record', s: 'Trusted Customer / Product 360', tone: 'green' }
    ],
    labels: ['ingest', 'score', 'adapt', 'merge']
  },
  {
    slug: 'mdm-implementation-patterns', tpl: 'grid', anchor: 'pattern-comparison', cols: 3, cellH: 132,
    aria: 'Registry, consolidation and coexistence MDM patterns compared',
    caption: 'The three canonical MDM patterns trade implementation speed against golden-record readiness — pick on operating model and governance maturity, not on vendor preference.',
    cells: [
      { k: '4-8 weeks', t: 'Registry', s: 'No golden record stored — pointers and virtual assembly. Source systems untouched. Best for quick wins and reference data.', accent: 'cyan' },
      { k: '3-6 months', t: 'Consolidation', s: 'Central hub stores the golden record from read-only feeds. Minimal source impact. Best for analytics, AI and compliance.', accent: 'blue' },
      { k: '6-12 months', t: 'Coexistence', s: 'Hub and sources both hold it, with bi-directional write-back. Highest readiness, highest governance need.', accent: 'indigo' }
    ]
  },
  {
    slug: 'real-cost-of-bad-data', tpl: 'grid', anchor: 'a-framework-for-measuring-the-cost', cols: 3,
    aria: 'Five metrics for measuring what bad data costs an organisation',
    caption: 'Five metrics that turn "bad data is expensive" into a number you can track, report and improve quarter over quarter.',
    cells: [
      { k: 'Metric 1', t: 'Data quality score', s: 'Completeness, accuracy, consistency and timeliness of key datasets.', accent: 'blue' },
      { k: 'Metric 2', t: 'Time-to-insight', s: 'Collection to actionable insight — days means you have a speed problem.', accent: 'indigo' },
      { k: 'Metric 3', t: 'Manual intervention rate', s: 'Share of processes needing a human — every manual step is a failure point.', accent: 'amber' },
      { k: 'Metric 4', t: 'Decision cycle time', s: 'How fast the organisation can act on evidence.', accent: 'teal' },
      { k: 'Metric 5', t: 'Data-related incidents', s: 'Disruptions, rework and complaints caused by data.', accent: 'red' }
    ]
  },
  {
    slug: 'responsible-ai-framework', tpl: 'grid', anchor: 'key-components-of-a-responsible-ai-framework', cols: 3, cellH: 124,
    aria: 'The five pillars of a responsible AI framework',
    caption: 'A responsible AI framework rests on five pillars — each addresses a different category of risk and needs its own controls, governance and documentation.',
    cells: [
      { k: 'Pillar 1', t: 'Fairness', s: 'Context-appropriate fairness metrics, subgroup testing, documented trade-offs, drift monitoring.', accent: 'blue' },
      { k: 'Pillar 2', t: 'Transparency', s: 'What data it was trained on, what it does, and what its limits are.', accent: 'indigo' },
      { k: 'Pillar 3', t: 'Accountability', s: 'Named owners, escalation paths and an audit trail for every decision.', accent: 'violet' },
      { k: 'Pillar 4', t: 'Privacy', s: 'Minimisation, consent, retention limits and controlled access to model data.', accent: 'teal' },
      { k: 'Pillar 5', t: 'Safety', s: 'Red-teaming, abuse cases, human override and bounded autonomy.', accent: 'red' }
    ]
  },
  {
    slug: 'schema-compare-guide', tpl: 'flow', anchor: 'what-to-compare',
    aria: 'What a thorough schema comparison examines across two databases',
    caption: 'A thorough comparison goes past table listings: structure, keys, views, routines, distribution and permissions all need to be diffed, because any of them can break a downstream consumer.',
    nodes: [
      { t: 'Table structure', s: 'Columns, types, nullability' },
      { t: 'Keys & constraints', s: 'PK, FK, unique, check, indexes', tone: 'blue' },
      { t: 'Views', s: 'Definitions and aliases' },
      { t: 'Routines', s: 'Parameters, returns, logic', tone: 'indigo' },
      { t: 'Partitions', s: 'Distribution keys for cloud engines' },
      { t: 'Permissions', s: 'Role access changes', tone: 'amber' }
    ],
    labels: ['diff', 'diff', 'diff', 'diff', 'diff']
  },
  {
    slug: 'schema-compare-tools', tpl: 'grid', anchor: 'categories', cols: 3, cellH: 118,
    aria: 'Five categories of schema comparison tool with their strengths and limits',
    caption: 'The five categories are not interchangeable — knowing which row you need removes most of the shortlist immediately.',
    cells: [
      { k: 'Category 1', t: 'Editor built-ins', s: 'SSMS, pgAdmin, Azure Data Studio. Ad-hoc, by a human, right now. No CI, single engine.', accent: 'blue' },
      { k: 'Category 2', t: 'Migration frameworks', s: 'Flyway diff, Liquibase diff, Atlas. Gates a pipeline and writes migration scripts from a diff.', accent: 'green' },
      { k: 'Category 3', t: 'Dedicated comparators', s: 'Redgate SQL Compare, dbForge. Deep, granular, production-grade synchronisation. GUI-first.', accent: 'indigo' },
      { k: 'Category 4', t: 'IDE diff', s: 'DataGrip, DBeaver. For developers who live in an IDE. Shallow reporting, no automation story.', accent: 'cyan' },
      { k: 'Category 5', t: 'Change platforms', s: 'Bytebase, 4DAlert. Review, approval, audit and continuous monitoring. More than a diff button.', accent: 'violet' }
    ]
  },
  {
    slug: 'schema-drift', tpl: 'grid', anchor: 'drift-vs-evolution', cols: 2, cellH: 122,
    aria: 'Schema drift, schema evolution, data drift and code drift compared',
    caption: 'Conflating these four is expensive, because the fix for each is different: if the columns changed it is schema; if only the contents changed it is data; if someone wrote it down first it is evolution.',
    cells: [
      { k: 'Unplanned', t: 'Schema drift', s: 'Structure changes with no plan. Signal: nulls where values used to be, a failed parse. Fix: diff it, notify the owner, repair the mapping.', accent: 'red' },
      { k: 'Planned', t: 'Schema evolution', s: 'Structure changes on purpose. Signal: a migration, a versioned message, a deprecation notice. Fix: version it and keep readers backward-compatible.', accent: 'green' },
      { k: 'Unplanned', t: 'Data drift', s: 'Columns stay, contents shift. Signal: distribution change, new category, null-rate spike. Fix: monitor quality and retrain models.', accent: 'amber' },
      { k: 'Usually unplanned', t: 'Code drift', s: 'Same job, different results. Signal: two environments disagreeing. Fix: version and deploy through one pipeline.', accent: 'blue' }
    ]
  },
  {
    slug: 'schema-migration-best-practices', tpl: 'timeline', anchor: 'expand-contract', labelW: 176, rowH: 66,
    aria: 'Expand-contract migration timeline showing old and new structures in parallel',
    caption: 'The expand-contract pattern: the new structure is added first and backfilled in batches while the old one stays authoritative, readers switch behind a flag, and the old structure is only removed in a separate release.',
    axis: [
      { at: 0, t: 'Deploy' }, { at: 0.24, t: 'Backfill' }, { at: 0.62, t: 'Switch' }, { at: 0.82, t: 'Later release' }, { at: 1, t: '' }
    ],
    lanes: [
      {
        label: 'Old structure', sub: 'Still authoritative', bars: [
          { from: 0, to: 0.66, t: 'Present and serving reads and writes', accent: 'blue' },
          { from: 0.66, to: 1, t: 'Retained, unused', accent: 'blue', dash: true }
        ]
      },
      {
        label: 'New structure', sub: 'Added, then promoted', bars: [
          { from: 0, to: 0.24, t: '1. Expand', tone: 'cyan' },
          { from: 0.24, to: 0.62, t: '2. Backfill in batches', tone: 'blue' },
          { from: 0.62, to: 0.82, t: '3. Switch behind a flag', tone: 'indigo' },
          { from: 0.82, to: 1, t: '4. Contract', tone: 'green' }
        ]
      }
    ],
    legend: [
      { t: 'Expand — add nullable column', tone: 'cyan' },
      { t: 'Backfill — batched, checkpointed', tone: 'blue' },
      { t: 'Switch — flip the flag', tone: 'indigo' },
      { t: 'Contract — separate release', tone: 'green' }
    ]
  },
  {
    slug: 'signs-data-infrastructure-holding-back', tpl: 'steps', anchor: 'a-practical-path-forward',
    aria: 'A prioritised four-step path forward for fixing data infrastructure',
    caption: 'You do not have to fix everything at once: audit and quantify, fix the single highest-impact problem, modernise in phases, then measure and communicate to build momentum.',
    steps: [
      { t: 'Audit', s: 'Map flows, document pain, quantify impact', tone: 'blue' },
      { t: 'Pick one fix', s: 'Highest-impact improvement first', tone: 'indigo' },
      { t: 'Build incrementally', s: 'Phases, not a big-bang migration' },
      { t: 'Measure & share', s: 'Track gains, publish the wins', tone: 'green' }
    ]
  },
  {
    slug: 'what-is-business-intelligence', tpl: 'flow', anchor: 'how-bi-works',
    aria: 'How business intelligence works from data collection to decisions',
    caption: 'Behind every dashboard is the same flow: collect from many sources, store centrally, clean, analyse, then visualise — and modern BI automates most of it so dashboards stay live.',
    nodes: [
      { t: 'Collect', s: 'Databases, apps, APIs, files', tone: 'slate' },
      { t: 'Store', s: 'Warehouse or data lake' },
      { t: 'Clean', s: 'Format, transform, validate', tone: 'cyan' },
      { t: 'Analyse', s: 'Patterns, trends, anomalies' },
      { t: 'Visualise', s: 'Dashboards and reports', tone: 'blue' },
      { t: 'Decide', s: 'Act on what it shows', tone: 'green' }
    ],
    labels: ['ingest', 'store', 'prepare', 'analyse', 'act']
  },
  {
    slug: 'what-is-master-data-management', tpl: 'flow', anchor: 'how-mdm-works',
    aria: 'How master data management works from collection to golden record',
    caption: 'A typical MDM process: collect from every system, standardise formats, cleanse, match and deduplicate, then publish the golden record back out to the applications that need it.',
    nodes: [
      { t: 'Collect', s: 'CRM, ERP, apps, spreadsheets', tone: 'slate' },
      { t: 'Standardize', s: 'India / IND / IN to one value' },
      { t: 'Cleanse', s: 'Correct, complete, de-duplicate', tone: 'cyan' },
      { t: 'Match', s: 'Same real-world entity?' },
      { t: 'Golden record', s: 'Most trusted, complete version', tone: 'blue' },
      { t: 'Publish', s: 'Back out to consuming systems', tone: 'green' }
    ],
    labels: ['gather', 'normalise', 'repair', 'resolve', 'distribute']
  }
];

/* ----------------------------------------------------------------- runtime */

function render(spec) {
  const pid = 'dg-' + spec.slug;
  const fn = TPL[spec.tpl];
  if (!fn) throw new Error('unknown template ' + spec.tpl);
  const out = fn(pid, spec);
  return START + EOL +
    '      <div class="diagram-section">' + EOL +
    '        <div class="diagram-container">' + EOL +
    '          <svg viewBox="0 0 ' + out.w + ' ' + out.h + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(spec.aria) + '">' + EOL +
    '            ' + out.body + EOL +
    '          </svg>' + EOL +
    '        </div>' + EOL +
    '        <p class="diagram-caption">' + esc(spec.caption) + '</p>' + EOL +
    '      </div>' + EOL +
    '      ' + END;
}

const WS = /[\r\n\t ]/;

/** remove every managed diagram plus the whitespace that precedes it, keeping
 *  only the final line break + indent so the following prose keeps its column */
function stripManaged(html) {
  let i;
  while ((i = html.indexOf(START)) >= 0) {
    const j = html.indexOf(END, i);
    if (j < 0) break;
    let a = i;
    while (a > 0 && WS.test(html[a - 1])) a--;
    let b = j + END.length;
    while (b < html.length && WS.test(html[b])) b++;
    const gap = html.slice(j + END.length, b);
    let nl = gap.lastIndexOf('\n');
    if (nl > 0 && gap[nl - 1] === '\r') nl--;
    const keep = nl >= 0 ? gap.slice(nl) : '';
    html = html.slice(0, a) + keep + html.slice(b);
  }
  return html;
}

function leadRun(str) {
  let n = 0;
  while (n < str.length && WS.test(str[n])) n++;
  return str.slice(0, n);
}

function place(html, anchor, placeMode, block) {
  const key = '<h2 id="' + anchor + '">';
  const i = html.indexOf(key);
  if (i < 0) return null;
  if (placeMode === 'before') {
    let a = i;
    while (a > 0 && WS.test(html[a - 1])) a--;
    const lead = html.slice(a, i) || EOL;
    return html.slice(0, a) + EOL + EOL + '      ' + block + lead + html.slice(i);
  }
  const p = html.indexOf('</p>', i);
  if (p < 0) return null;
  const at = p + 4;
  const lead = leadRun(html.slice(at)) || EOL;
  return html.slice(0, at) + EOL + EOL + '      ' + block + lead + html.slice(at + lead.length);
}

function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
  const list = DIAGRAMS.filter(d => !only || d.slug === only);
  let ok = 0, fail = 0;
  for (const spec of list) {
    const p = 'blog/' + spec.slug + '/index.html';
    if (!fs.existsSync(p)) { console.log('MISSING FILE ' + spec.slug); fail++; continue; }
    const orig = fs.readFileSync(p, 'utf8');
    const cleaned = stripManaged(orig);
    const block = render(spec);
    const next = place(cleaned, spec.anchor, spec.place || 'after', block);
    if (next === null) { console.log('ANCHOR NOT FOUND ' + spec.slug + ' #' + spec.anchor); fail++; continue; }
    if (dry) { console.log('would update ' + spec.slug); ok++; continue; }
    if (next === orig) { console.log('unchanged ' + spec.slug); ok++; continue; }
    fs.writeFileSync(p, next, 'utf8');
    console.log('updated ' + spec.slug + ' [' + spec.tpl + ' @ ' + spec.anchor + ']');
    ok++;
  }
  console.log('\n' + ok + ' ok, ' + fail + ' failed');
}
main();
