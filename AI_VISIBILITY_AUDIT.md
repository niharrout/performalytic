# Performalytic — AI Visibility Audit (AEO / GEO measurement)

> Monthly prompt audit that records whether Performalytic is **mentioned** and **cited** by AI assistants, and whether what they say is accurate.
> Complements [AI_SEO_GUIDE.md](./AI_SEO_GUIDE.md). The SEO Site Checkup audit has no AI-visibility check — this is our instrument.

---

## 1. Cadence

| When | What |
|------|------|
| Now | **Baseline run** — first full pass, log to `ai-visibility-audit.csv` |
| Every month | Repeat the same pass, same questions, same engines |
| After every content push | Re-run only the Brand + Topic groups |

One pass (75 cells) takes ~30 minutes.

## 2. Rules for a clean run

- **Fresh session / incognito window** for every engine. No logged-in history, no personalization.
- **Ask questions verbatim** from the question bank. Do not paraphrase between runs, or the numbers stop being comparable.
- **Record the same day** for all engines in a run.
- Log **the first answer only** — do not click "Regenerate" to get a better result.
- If an engine offers a "search the web" toggle, use the **same setting every time** (use search ON for ChatGPT, Gemini and Copilot).

## 3. Engines

| Engine | How to run it |
|--------|---------------|
| ChatGPT | chatgpt.com, web search enabled, fresh chat |
| Perplexity | perplexity.ai, new thread |
| Microsoft Copilot | copilot.microsoft.com, fresh chat |
| Gemini | gemini.google.com, fresh chat, Search grounding on |
| Google AI Overviews | google.com in an incognito window, search the prompt, screenshot the AI Overview |

## 4. Question bank (15 prompts)

### Group A — Brand (are we known at all?)
| ID | Prompt |
|----|--------|
| A1 | What is Performalytic? |
| A2 | Who is Performalytic and what does the company do? |
| A3 | Is Performalytic a legitimate company? What do you know about it? |

### Group B — Competitive (do we appear in the buying shortlist?)
| ID | Prompt |
|----|--------|
| B1 | Best enterprise data analytics consulting firms? |
| B2 | Top firms for master data management implementation? |
| B3 | Best companies for AI and data strategy consulting in Chicago? |

### Group C — Topic (does our content get cited as the answer?)
| ID | Prompt |
|----|--------|
| C1 | What is data reconciliation? |
| C2 | What is a data quality framework? |
| C3 | How do you choose a business intelligence platform? |
| C4 | What is master data management? |
| C5 | What is enterprise RAG architecture? |

### Group D — Product & trust
| ID | Prompt |
|----|--------|
| D1 | What is 4DAlert? |
| D2 | Performalytic reviews |
| D3 | How long does an MDM implementation take? |
| D4 | Build vs buy for a data quality platform? |

**Total per run: 15 prompts × 5 engines = 75 rows.**

## 5. What to record per cell

| Column | Values |
|--------|--------|
| `mentioned` | `yes` / `no` — is Performalytic named in the answer? |
| `cited` | `yes` / `no` — is a `performalytic.com` URL shown as a source? |
| `cited_url` | the exact URL cited (blank if none) |
| `accuracy` | `accurate` / `partial` / `wrong` / `n/a` (n/a when not mentioned) |
| `competitors_named` | comma-separated rivals listed (for Group B) |
| `notes` | anything surprising: wrong facts, stale claims, hallucinated services |

## 6. Scoring

Per run, compute three rates over all 75 cells:

- **Mention rate** = cells with `mentioned=yes` / 75
- **Citation rate** = cells with `cited=yes` / 75
- **Accuracy rate** = cells with `accuracy=accurate` / cells with `mentioned=yes`

Group-level views we care about most:

| Group | Why | Baseline → Month 3 target |
|-------|-----|---------------------------|
| A Brand | "Do they know us exist" | 0% → 100% mention |
| B Competitive | shortlist inclusion | 0% → present in ≥1 of 3 |
| C Topic | content is being retrieved | measure → ≥50% citation |
| D Trust | accuracy of what is said | any `wrong` = fix the source page |

## 7. If the answer is wrong

AI engines copy the source. Fix the page, not the model:

1. Find the passage the answer most likely came from (the first paragraph of the relevant page).
2. Make that passage state the correct fact in one plain sentence.
3. Re-run the prompt after the next crawl (typically 1–4 weeks).

## 8. Supporting checks (same day, 5 minutes)

- [ ] `https://performalytic.com/llms.txt` returns 200 and lists the newest pages
- [ ] `https://performalytic.com/robots.txt` still allows GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended
- [ ] `https://performalytic.com/sitemap.xml` includes every live page
- [ ] GA4 → Reports → Traffic acquisition → filter referral source containing `chatgpt` / `perplexity` / `gemini` / `copilot`
- [ ] Google Search Console → Performance → filter query containing `performalytic` (AI Overview impressions live here)

## 9. Files

- `ai-visibility-audit.csv` — pre-filled with all 75 cells, one `run_date` column to fill per month.

---

*Owner: Performalytic Marketing Team*
