# Monthly visibility review (2–3 hours)

Run: `npm run report:monthly` and the manual 75-cell AI audit.

## 1. Organic search

- [ ] 28-day clicks / impressions / CTR / average position vs previous 28 days.
- [ ] Top 10 pages by clicks and their change.
- [ ] Content decay: pages down >30% for two consecutive months.
- [ ] New queries with ≥500 impressions.
- [ ] Brand vs non-brand click share.
- [ ] Local queries and Google Business Profile insights (manual).

## 2. AI visibility (manual 75 cells)

- [ ] Run all 15 prompts in fresh sessions on ChatGPT, Gemini, Copilot, Claude, and Perplexity.
- [ ] Record `mentioned`, `cited`, `cited_url`, `accuracy`, and competitors in `ai-visibility-audit.csv`.
- [ ] Accuracy: `accurate`, `partial`, or `wrong`. Wrong answers are a priority.
- [ ] Compare group rates (A/B/C/D) to last month.
- [ ] Target: +10 points citation rate per month on topic prompts.
- [ ] List the top 3 prompts where competitors are named and we are not.

## 3. Authority and trust

- [ ] Check backlinks and unlinked mentions (Ahrefs/Semrush/Search Console Links).
- [ ] Check review profiles: Google, Clutch, G2, TrustRadius, Capterra.
- [ ] Check Gridinsoft listing and Salary.com/Glassdoor/Comparably descriptions.
- [ ] Confirm the Google Business Profile is verified and the address/hours are correct.
- [ ] Count verified client reviews added this month.

## 4. Content and technical

- [ ] Re-run `npm run seo:audit`.
- [ ] Check Search Console Pages report for new "Crawled – currently not indexed" or "Discovered – currently not indexed".
- [ ] Check Core Web Vitals.
- [ ] Review `llms.txt` and `llms-full.txt` for stale pages.
- [ ] Confirm schema on the 8 target pages still validates.

## 5. Strategy

- [ ] Update `SEARCH_VISIBILITY_PLAN.md` §11 with shipped/blocked items.
- [ ] Re-baseline targets for the next 30 days.
- [ ] Assign off-site work (PR, reviews, directories) with owners and dates.
- [ ] Retire or consolidate pages that earned zero impressions for two consecutive months.

## 6. Log

- [ ] Record: report date, clicks, impressions, AI mention/citation rate, reviews added, backlinks added, actions shipped, blockers.
