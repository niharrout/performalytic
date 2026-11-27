# Weekly visibility review (30–45 minutes)

Run: `npm run report` (Monday) or `npm run report:ai` to include the Perplexity probe.

## 1. Read the scorecard

- [ ] Clicks / impressions / CTR / average position vs previous 7 days.
- [ ] AI referral sessions vs last week.
- [ ] AI mention and citation rate vs last run.
- [ ] SERP presence count.

## 2. Pick 2–3 actions

- [ ] **Priority keywords:** flag any keyword that moved >5 positions with ≥100 impressions.
- [ ] **Striking distance (8–30):** choose 2 queries. Add a quick-answer block, a comparison table, and 2–3 internal links to the best page.
- [ ] **High impressions, low CTR:** rewrite one title/meta pair. Keep the H1 and URL unchanged.
- [ ] **AI gaps:** choose 1 prompt where we were not mentioned. Add a direct answer, an FAQ entry, and a source-backed claim to the matching page.
- [ ] **SERP gaps:** any brand/product/local keyword "not in top" is a page/entity problem. Assign it; do not just tweak metadata.
- [ ] **Untracked queries:** add any high-demand query to `reports/config.json` if a page can answer it.

## 3. Content queue

- [ ] Create or update one issue per action with the query, page, expected change, and review date.
- [ ] Note the report date and metric baseline in the issue.
- [ ] Do not start more than 3 content changes in one week.

## 4. Measurement hygiene

- [ ] Confirm `ai_referral` and `outbound_click` events are still firing.
- [ ] Confirm the sitemap and `llms.txt` still include the pages changed this week.
- [ ] Run `npm run seo:audit` before merging content changes.

## 5. Log

- [ ] Record: report date, clicks, impressions, AI citation rate, actions chosen, owner.
