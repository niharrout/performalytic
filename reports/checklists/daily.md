# Daily visibility check (10 minutes)

Run: `npm run report:daily` (or open the GitHub Actions artifact).

- [ ] Open `report.md` → **Alerts**. Triage only.
- [ ] Brand queries `performalytic` and `4dalert` still have impressions and position ≤ 2.
- [ ] Organic clicks did not fall more than 30% versus the previous day.
- [ ] Bing clicks are not zero.
- [ ] AI referral sessions are present if total traffic is normal.
- [ ] `ai_referral` event count is non-zero after a known AI referral.
- [ ] Add anything suspicious to the weekly queue. Do not rewrite pages today.

**Escalate immediately if:** brand query disappears, site returns 5xx, robots.txt changes unexpectedly, or Search Console reports a manual action.
