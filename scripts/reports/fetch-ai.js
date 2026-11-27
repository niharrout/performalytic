'use strict';

const path = require('path');
const {
  requestJson,
  writeCsv,
  isOurDomain,
  hostOf,
  iso,
  sleep
} = require('./lib');

function mentionsBrand(text) {
  return /\b(performalytic|4d\s*alert)\b/i.test(text || '');
}

function citedUrls(json) {
  const urls = [];
  for (const item of json.citations || []) {
    if (typeof item === 'string') urls.push(item);
    else if (item && item.url) urls.push(item.url);
  }
  for (const item of json.search_results || []) {
    if (item && item.url) urls.push(item.url);
  }
  return [...new Set(urls)];
}

/**
 * Run the prompt bank through Perplexity and record whether Performalytic is
 * mentioned and cited. This is an automated supplement to the manual 75-cell
 * audit across ChatGPT, Gemini, Copilot, Claude, and Perplexity.
 *
 * Accuracy is intentionally left as "n/a": it needs a human to judge.
 */
async function fetchAi({ config, outDir, runDate }) {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) {
    return {
      configured: false,
      rows: [],
      error: 'PERPLEXITY_API_KEY is not set'
    };
  }

  const model = process.env.PERPLEXITY_MODEL || (config.ai && config.ai.model) || 'sonar';
  const max = Number(
    process.env.PERPLEXITY_MAX_PROMPTS || (config.ai && config.ai.maxPrompts) || 15
  );
  const prompts = (config.prompts || []).slice(0, max);
  const rows = [];
  const date = runDate || iso(new Date());

  for (const item of prompts) {
    try {
      const body = JSON.stringify({
        model,
        messages: [{ role: 'user', content: item.prompt }],
        max_tokens: 700,
        temperature: 0.2
      });
      const json = await requestJson('POST', 'https://api.perplexity.ai/chat/completions', {
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        },
        body
      });

      const content =
        (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) ||
        '';
      const urls = citedUrls(json);
      const ourUrl = urls.find((url) => isOurDomain(url)) || '';
      const competitors = (config.competitors || []).filter((name) =>
        content.toLowerCase().includes(String(name).toLowerCase())
      );

      rows.push({
        run_date: date,
        engine: `Perplexity API (${model})`,
        question_id: item.id,
        group: item.group,
        prompt: item.prompt,
        mentioned: mentionsBrand(content) ? 'yes' : 'no',
        cited: ourUrl ? 'yes' : 'no',
        cited_url: ourUrl,
        accuracy: 'n/a',
        competitors_named: competitors.join('; '),
        notes: `auto-run; ${urls.length} citations; review accuracy`
      });
    } catch (error) {
      rows.push({
        run_date: date,
        engine: `Perplexity API (${model})`,
        question_id: item.id,
        group: item.group,
        prompt: item.prompt,
        mentioned: 'error',
        cited: 'error',
        cited_url: '',
        accuracy: 'n/a',
        competitors_named: '',
        notes: error.message
      });
    }
    await sleep(1000);
  }

  const file = path.join(outDir, 'ai-perplexity.csv');
  writeCsv(
    file,
    [
      'run_date',
      'engine',
      'question_id',
      'group',
      'prompt',
      'mentioned',
      'cited',
      'cited_url',
      'accuracy',
      'competitors_named',
      'notes'
    ],
    rows
  );

  return { configured: true, rows, file, error: null };
}

module.exports = { fetchAi };
