# Visibility reporting

This folder runs the ranking and AI-visibility report for Performalytic and 4DAlert.

It answers four different questions, because "ranking" means different things in different surfaces:

| View | Source | Question it answers |
|---|---|---|
| Google organic | Search Console API | Which queries do we already appear for, at what average position, and how is that changing? |
| Bing / Copilot | Bing Webmaster API | Same, for Bing's index. |
| SERP presence | SerpAPI or Google Custom Search | For our priority keywords, are we in the top 10–20 at all? Search Console cannot show queries where we have zero impressions. |
| AI answers | Manual 75-cell audit + optional Perplexity API | When someone asks ChatGPT, Gemini, Copilot, Claude, or Perplexity, are we mentioned, cited, and accurate? |
| AI referrals | GA4 Data API | Which AI assistants actually send sessions, and to which pages? |

The report is deliberately honest about missing data. It runs without credentials and prints exactly which source is not configured.

All sources use the same window, ending two days ago, because Search Console has a 2–3 day lag. GA4 could be fresher, but one shared window keeps the scorecard comparable.

---

## Quick start

```bash
# Weekly report (default)
npm run report

# Daily / monthly
npm run report:daily
npm run report:monthly

# Include the automated Perplexity prompt run
npm run report:ai

# Rebuild from the last cached API response (no network)
node scripts/reports/run.js --period weekly --offline
```

Output:

```
reports/out/<period>/<end-date>/
  report.md          # Markdown report, also appended to the GitHub Actions summary
  dashboard.html     # Self-contained visual dashboard
  summary.json       # Machine-readable totals, alerts, recommendations
  priority-keywords.csv
  gsc-queries-current.csv
  opportunities.csv
  serp.csv
  ai-referrals.csv
  bing-queries.csv
  raw/               # Raw API responses for debugging and offline rebuilds
```

`reports/out/` is git-ignored. Traffic data should not be committed to a public site repository.

---

## Credentials

All credentials are read from environment variables. Nothing is written to disk except the ignored raw cache.

### 1. Google service account (Search Console + GA4)

1. Create a Google Cloud project and enable:
   - **Search Console API**
   - **Google Analytics Data API**
2. Create a service account and download a JSON key.
3. In Search Console, add the service account email (`...@....iam.gserviceaccount.com`) as a user of the property. **Restricted** access is enough.
4. In GA4, add the same email as a **Viewer** on the property.
5. Set:

```bash
# Bash
export GOOGLE_SERVICE_ACCOUNT_JSON="$(cat service-account.json)"
export GSC_SITE_URL="https://performalytic.com/"
export GA4_PROPERTY_ID="123456789"
```

```powershell
# PowerShell
$env:GOOGLE_SERVICE_ACCOUNT_JSON = Get-Content service-account.json -Raw
$env:GSC_SITE_URL = "https://performalytic.com/"
$env:GA4_PROPERTY_ID = "123456789"
```

`GSC_SITE_URL` must match the property exactly:
- URL-prefix property: `https://performalytic.com/`
- Domain property: `sc-domain:performalytic.com`

If the service account has access but the API returns 403, the property URL is usually the mismatch.

### 2. Bing Webmaster

Bing Webmaster Tools → **Settings** → **API access** → generate an API key.

```bash
export BING_API_KEY="..."
export BING_SITE_URL="https://performalytic.com/"
```

Bing's query endpoint has no date range; the report labels it "recent".

### 3. SERP presence (optional but recommended)

Pick one:

```bash
# SerpAPI (paid, reliable, 20 results per query)
export SERPAPI_KEY="..."

# or Google Programmable Search (free tier: 100 queries/day, 10 results per query)
export GOOGLE_CSE_KEY="..."
export GOOGLE_CSE_CX="..."
```

For Google CSE, create a Programmable Search Engine set to search the **entire web**, then copy its CX ID. A site-restricted engine will only return performalytic.com results and is useless for this check.

Only the first `SERP_MAX_QUERIES` priority keywords are checked (default 10) to control cost. Raise it deliberately:

```bash
export SERP_MAX_QUERIES="25"
```

SERP presence runs on **weekly and monthly** reports by default. Daily reports skip it to avoid burning API credits. Set `SERP_DAILY=1` if you really want it daily.

### 4. AI prompt run (optional)

```bash
export PERPLEXITY_API_KEY="..."
export PERPLEXITY_MODEL="sonar"   # optional
```

Then run `npm run report:ai`, or set `"ai": { "autoRun": true }` in `reports/config.json`.

This is a **proxy**, not the full audit. It runs the 15 prompts through Perplexity and records mention/citation. Accuracy is left as `n/a` because it needs a human. The manual 75-cell audit across five engines remains the source of truth.

Cost control: the runner is limited to 15 prompts per run and sleeps between calls.

---

## Cadence

| Cadence | When | What to read | What to do | Time |
|---|---|---|---|---|
| **Daily** | 06:00 UTC, automated | Alerts, brand clicks, AI referral sessions, Bing clicks | Triage only. Investigate a >30% click drop or a lost brand query. Do not rewrite content daily. | 10 min |
| **Weekly** | Monday 07:00 UTC, automated | 7-day vs previous 7-day: priority keywords, movers, striking-distance queries, AI mention/citation, SERP gaps | Pick 2–3 actions: refresh a title, add a quick answer/table, add internal links, fix an AI gap. Update the content queue. | 30–45 min |
| **Monthly** | 1st of month, 08:00 UTC, automated + manual | 28-day vs previous 28-day, full 75-cell AI audit, competitor mentions, content decay, reviews/backlinks/GBP | Re-baseline the 8 target pages, prune dead content, update `SEARCH_VISIBILITY_PLAN.md`, assign off-site work. | 2–3 hours |
| **Quarterly** | First week of the quarter | Keyword/prompt coverage, entity accuracy, share of voice | Add/remove keywords and prompts, retire pages that never earn impressions, reset targets. | Half day |

### Daily checklist

- [ ] Open the latest `report.md` → **Alerts**.
- [ ] Confirm brand queries (`performalytic`, `4dalert`) still have impressions and position ≤ 2.
- [ ] Confirm `ai_referral` events and AI sessions are non-zero if traffic exists.
- [ ] Check Bing clicks did not drop to zero.
- [ ] Log anything that needs a content change in the weekly queue; do not change pages reactively.

### Weekly checklist

- [ ] Read the **Priority keyword rankings** table. Flag any keyword that moved >5 positions with ≥100 impressions.
- [ ] Read **Striking distance (8–30)**. Choose 2 pages to improve.
- [ ] Read **High impressions, low CTR**. Rewrite title/meta for the worst offender.
- [ ] Read **AI answer visibility**. Choose 1 prompt gap and add a direct answer + FAQ + source to the matching page.
- [ ] Read **SERP presence**. Any brand/product/local keyword "not in top" is a page or entity problem, not a meta-description problem.
- [ ] Update `reports/config.json` if a new query deserves tracking.
- [ ] Record the 2–3 actions in the issue/notes and review them next week.

### Monthly checklist

- [ ] Run the manual 75-cell AI audit (`ai-visibility-audit.csv`) in fresh sessions on ChatGPT, Gemini, Copilot, Claude, and Perplexity.
- [ ] Record accuracy, not just mentions. A wrong answer is worse than no answer.
- [ ] Compare AI citation rate to last month. Target: +10 points per month on topic prompts.
- [ ] Review content decay: pages with clicks down >30% for two consecutive months.
- [ ] Review Google Business Profile insights, reviews, and local rankings manually.
- [ ] Check backlinks and unlinked mentions (Ahrefs/Semrush or Search Console links).
- [ ] Re-check trust risks: Gridinsoft listing, Salary.com/Glassdoor/Comparably descriptions, review profiles.
- [ ] Update `SEARCH_VISIBILITY_PLAN.md` with what shipped and what is blocked.

---

## What the report sections mean

1. **Scorecard** — clicks, impressions, CTR, average position, AI sessions, AI mention/citation rate, SERP presence.
2. **Priority keyword rankings** — one row per tracked keyword. Average position is impression-weighted. "No impressions" means Search Console returned no rows containing that phrase; it does not prove the page is absent.
3. **Biggest movers** — queries with the largest click and position changes above the impression floor.
4. **Opportunities** — striking distance (8–30), high impressions/low CTR, and new queries with demand.
5. **Page performance** — top pages and click change vs the previous period.
6. **AI answer visibility** — latest audit run, by prompt group and engine, plus competitor mentions and gaps.
7. **AI referral traffic** — GA4 sessions whose source matches ChatGPT, Perplexity, Gemini, Copilot, Claude, You.com, Poe, Phind, Kagi, or DuckDuckGo.
8. **SERP presence** — top-20 presence for priority keywords, including queries where we are absent.
9. **Bing Webmaster** — recent Bing query stats.
10. **Alerts** — threshold breaches and setup gaps.
11. **Recommended actions** — generated from the alerts and opportunities. Treat these as a queue, not instructions.
12. **Data status** — which sources are connected.

---

## Configuration

Edit `reports/config.json`:

- `priorityKeywords` — the keywords the business cares about. `tier` is one of `brand`, `product`, `topic`, `local`, `competitive`. `target` is the position you want.
- `prompts` — the AI prompt bank. Keep the A/B/C/D group structure so month-over-month rates are comparable.
- `competitors` — names to count when they appear in AI answers.
- `thresholds` — alert sensitivity.
- `ai.autoRun` — set `true` to run the Perplexity probe on every report.
- `serp.maxQueries` — how many keywords to check per run.

Add a keyword only when you have a page that can plausibly answer it. Otherwise the report will show a permanent "no impressions" row.

---

## GitHub Actions

Workflow: `.github/workflows/rank-report.yml`

It runs on:

- Daily at 06:00 UTC
- Monday at 07:00 UTC
- The 1st of each month at 08:00 UTC
- Manual dispatch with a `period` input

Add these repository secrets:

| Secret | Required | Purpose |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Yes for GSC/GA4 | Full JSON key, one line or pretty-printed |
| `GSC_SITE_URL` | Recommended | Exact Search Console property |
| `GA4_PROPERTY_ID` | Yes for GA4 | Numeric property ID |
| `BING_API_KEY` | Optional | Bing Webmaster |
| `BING_SITE_URL` | Optional | Defaults to `https://performalytic.com/` |
| `SERPAPI_KEY` | Optional | SERP presence |
| `GOOGLE_CSE_KEY` / `GOOGLE_CSE_CX` | Optional | Free SERP alternative |
| `PERPLEXITY_API_KEY` | Optional | Automated AI prompt run |

The workflow uploads `reports/out/<period>/` as a 90-day artifact and appends `report.md` to the job summary. It does not commit traffic data.

Manual dispatch has a **with_ai** checkbox for the Perplexity probe. Scheduled runs do not run it unless `ai.autoRun` is set to `true` in `reports/config.json`.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON is not set` | Secret missing or not passed to the step. |
| `HTTP 403` from Search Console | Service account not added to the property, or `GSC_SITE_URL` does not match the property type. |
| `HTTP 403` from GA4 | Service account not added as Viewer, or wrong numeric property ID. |
| All keywords "no impressions" | Property mismatch, date range before the site had traffic, or the API returned no rows. Check `raw/gsc-current.json`. |
| AI section empty | `ai-visibility-audit.csv` has no `run_date` rows and `--with-ai` was not used. |
| GA4 events empty | `ai_referral` / `outbound_click` have not fired yet, or the event filter is wrong. Confirm in GA4 Realtime. |
| SERP section empty | No `SERPAPI_KEY` and no Google CSE key/cx. |
| Bing section empty | `BING_API_KEY` missing, or the site is not verified in Bing Webmaster. |

---

## Guardrails

- Do not commit `service-account.json`, API keys, or `reports/out/`.
- Use read-only scopes: Search Console read, Analytics read.
- Do not treat "no impressions" as "not indexed". Check `site:performalytic.com` and the URL Inspection tool before rewriting a page.
- Google AI Overviews are not a separate Search Console dimension. Use query-level impressions, CTR, and manual checks; do not invent an "AI Overview position".
- Do not optimize for a single daily fluctuation. Weekly is the decision cadence; monthly is the strategy cadence.
- AI answers are probabilistic. Record the engine, date, and exact prompt. A single run is an anecdote; a monthly series is a trend.
- The report measures visibility, not revenue. Pair it with GA4 conversions and CRM pipeline for business impact.
