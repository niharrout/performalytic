# Search & AI Visibility Plan — Performalytic + 4DAlert

**Created:** 2026-11-27
**Owner:** Marketing (single accountable owner) · Contributors: Content, SEO, PR, Product Marketing
**Horizon:** 90-day sprint, 180-day targets, quarterly re-plan
**Status:** Master execution plan. Supersedes the sequencing in `RANK_REPORT.md` and `digital-presence-roadmap.md`; `KEYWORD_STRATEGY.md` remains the keyword map, `AI_VISIBILITY_AUDIT.md` remains the measurement instrument.

---

## 1. The honest diagnosis

### What is already working

| Layer | State |
|---|---|
| Technical SEO | Strong. 76 URLs in sitemap, canonical tags, Organization/WebSite/WebPage schema, breadcrumbs, RSS. |
| AI crawl access | Strong. `robots.txt` explicitly allows GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended, Bingbot and 15+ others. `Content-Signal` set to allow. |
| AI-readable map | Strong. `llms.txt` + `llms-full.txt` exist and are current. |
| Content depth | Good. 7 knowledge pillars, 32+ guides, 35+ blog posts, product page, comparisons, Chicago page, 3 case studies, named authors, editorial policy. |
| Brand search | Working. 3/3 brand prompts mention and cite us (Oct 2026 baseline). |

### What is actually blocking us

The October 2026 retrieval baseline is the clearest signal we have:

| Group | Prompts | Mentioned | Cited | Read |
|---|---|---|---|---|
| A — Brand | 3 | 100% | 100% | We own our name. |
| B — Competitive | 3 | 0% | 0% | We are on no buying shortlist. |
| C — Topic | 5 | 0% | 0% | Our guides are not retrieved at all. |
| D — Product/trust | 4 | 50% | 50% | Partial, with accuracy risk. |
| **Overall** | **15** | **33%** | **33%** | Strong brand, invisible everywhere else. |

Three binding constraints, in priority order:

1. **Trust/entity layer is broken.** A Gridinsoft page ("Performalytic.com Scam Check: Phishing, 21/100") ranks for legitimacy and review queries. Salary.com reviews describe a *retail & wholesale* division — wrong-industry entity data. There is no Google Business Profile, no Clutch/G2 footprint, and no review corpus. AI engines hedge or omit companies with contradictory entity data. **This blocks every other workstream.**
2. **Content exists but is not extractable or authoritative enough to win.** Group C is 0/5 despite us having pages on every topic. Competitors win with definition-first pages, comparison tables, named standards (ISO 8000/25012, DAMA), and external citations. We have the topics, not the winning format or the link equity.
3. **We cannot measure what we fix.** GA4 (`G-FV09CSCD2C`) is installed **only on `index.html`** and only after cookie consent. Inner pages, blog, knowledge hub, and product pages have no analytics. The 75-cell manual AI audit has never been run. We are optimizing blind.
   *Fixed 2026-11-27: a shared consent-aware loader now runs on every public page and tags AI referrals. See §11.*

### What "top results" realistically means

| Query tier | Example | 180-day goal | Why |
|---|---|---|---|
| Tier 0 — Brand | "Performalytic", "4DAlert" | #1 + accurate AI answer | Fully controllable. |
| Tier 1 — Product category | "data reconciliation software", "MDM platform", "schema compare tool" | Top 10; cited in AI answers | Commercial, winnable with product pages + reviews. |
| Tier 2 — Long-tail how-to / comparison | "how long does MDM implementation take", "4DAlert vs Informatica", "build vs buy data quality" | Top 3–10; ≥50% AI citation | Low competition, high intent. **This is the growth engine.** |
| Tier 3 — Local | "data analytics consulting Chicago" | Top 3 + Maps pack | HQ advantage, cheap to win. |
| Tier 4 — Head terms | "master data management", "business intelligence" | Do **not** chase | Owned by Gartner, IBM, Wikipedia. Enter via Tier 2 instead. |

**Rule:** we do not promise rankings. We control coverage, relevance, technical quality, entity consistency, authority, and freshness — and we measure the outputs monthly.

---

## 2. Strategy: three reinforcing loops

```
        ENTITY  ──────────────►  EVIDENCE  ──────────────►  EXTRACTION
   consistent facts across      original data, proof,       answer-first pages,
   web, profiles, reviews       named experts, standards   tables, schema, links
        ▲                                                        │
        └──────────────────  more citations & mentions  ◄────────┘
```

- **Entity** — every profile on the web says the same thing about who we are and what 4DAlert is.
- **Evidence** — we publish things only we can publish: benchmark data, measured case studies, practitioner authorship.
- **Extraction** — every important page can be lifted verbatim into an AI answer and cited correctly.

Most agencies do only Extraction. That is why 0/5 topic prompts are still 0/5 after a year of content.

---

## 3. Targets and scorecard

### North-star metrics

| Metric | Baseline (Oct 2026) | 30 days | 90 days | 180 days |
|---|---|---|---|---|
| AI mention rate (75-cell audit) | Not run | Baseline run | 45% | 60% |
| AI citation rate | 33% (proxy) | — | 40% | 55% |
| Group B (competitive) presence | 0/3 | 0/3 | ≥1/3 | ≥2/3 |
| Group C (topic) citation | 0/5 | 0/5 | ≥2/5 | ≥3/5 |
| Priority keywords in top 10 | Unknown | Measure | +10 | +25 |
| Referring domains | Unknown | Audit | +20 | +50 |
| AI referral sessions/mo | Not measurable | GA4 fixed | Baseline | +50% |
| Verified third-party reviews | 0 | 3 | 10 | 25 |
| Branded search volume | Unknown | Baseline | +15% | +40% |

### Leading indicators (weekly)

- Pages shipped vs. plan
- New referring domains
- GSC impressions for the 30 priority queries
- Reviews collected
- Indexed URL count and crawl errors
- Entity-profile consistency checks passed

---

## 4. Workstreams

### W0 — Trust & entity repair (Weeks 1–2, blocking)

Nothing else compounds until this is done. AI engines resolve an entity by cross-referencing sources; contradictions cause omission.

| # | Action | Owner | Done when |
|---|---|---|---|
| 0.1 | Dispute the Gridinsoft phishing listing via `portal.gridinsoft.com` with proof: incorporation docs, SSL Labs A+, securityheaders A+, client references, physical address. | PR | Listing removed or re-scored, or documented refusal |
| 0.2 | Publish `/security/` trust page: certifications, data handling, subprocessors, uptime, security contact, third-party scan results. Link it from footer and `llms.txt`. | Content + Eng | Page live and linked |
| 0.3 | Claim/correct Salary.com, Glassdoor, Comparably, Indeed, AmbitionBox (India). Fix industry, size, HQ, description. | Marketing | All profiles match the canonical boilerplate |
| 0.4 | Claim Google Business Profile (111 W. Jackson Blvd, Suite 1700, Chicago), Bing Places, Apple Maps. Identical NAP everywhere. | Marketing | Verified, 10+ photos, services listed |
| 0.5 | Create/complete Clutch, GoodFirms, G2, TrustRadius, Crunchbase profiles. For 4DAlert: Capterra, Software Advice, Gartner Peer Insights. | Marketing | Profiles live, 100% complete |
| 0.6 | **Entity bridge:** `4DAlert is a product by Performalytic` stated on both domains. `sameAs` cross-links. Organization schema on 4dalert.com with `parentOrganization`. One canonical product URL strategy (see W4). | Eng | Schema validates, both sites cross-reference |
| 0.7 | Launch review program: post-engagement email + direct link, target 10 reviews in 60 days across Clutch/G2/Google. Never incentivize or script reviews. | CS + Marketing | 10 verified reviews |
| 0.8 | Run the manual 5-engine AI baseline into `ai-visibility-audit.csv` (75 cells, fresh sessions, verbatim prompts). | Marketing | CSV complete with `run_date` |

**Definition of done for W0:** searching our brand + "reviews" / "legitimate" returns accurate, consistent results from at least 4 independent sources, and no page contradicts our industry.

---

### W1 — Retrieval-ready content (Weeks 1–8)

Pick **8 citation targets** from the queries we already lost. Rewrite to a fixed, extractable template.

#### The 8 targets

| # | Query | Existing page | Action |
|---|---|---|---|
| 1 | What is data reconciliation? | `/blog/data-reconciliation-guide/` | Rewrite answer-first + table + standards |
| 2 | What is a data quality framework? | `/blog/data-quality-framework/` | Rewrite; add ISO 8000/25012, DAMA-DMBOK |
| 3 | How do you choose a BI platform? | `/blog/choose-right-analytics-platform/` | Add weighted scorecard table |
| 4 | What is master data management? | `/blog/what-is-master-data-management/` | Definition block + golden-record example |
| 5 | What is enterprise RAG architecture? | `/blog/enterprise-rag-architecture/` | Add reference architecture + failure modes |
| 6 | How long does MDM implementation take? | `/products/` FAQ | Promote to standalone page with phase table |
| 7 | Build vs buy a data quality platform? | `/products/` FAQ | Standalone comparison + TCO table |
| 8 | 4DAlert alternatives | — | New honest comparison page |

#### The template (every target page)

1. **Standalone answer** in the first 40–60 words — no preamble, names Performalytic and the category.
2. **"Key facts" box** — 3–5 bullets an engine can lift.
3. **Question-shaped H2s**, each answered in the first sentence under it.
4. **One table minimum** — comparison, phases, metrics, or decision criteria.
5. **Named standards and sources** — ISO 8000/25012, DAMA-DMBOK, NIST, vendor docs. Outbound links build trust.
6. **Named author + visible `dateModified`** (already have 5 author profiles).
7. **3–5 internal links** with descriptive anchors; one link to `/products/` or `/contact/`.
8. **FAQ block matching visible text**, with `FAQPage` schema.
9. **A "last reviewed" line** and an editorial-policy link.

#### Supporting content

- **Comparison cluster:** `/compare/4dalert-vs-informatica/`, `/compare/4dalert-vs-reltio/`, `/compare/4dalert-vs-in-house/`, plus an honest "best data reconciliation tools 2026" roundup that includes competitors. Roundups get cited far more than vendor pages.
- **Glossary expansion:** 10 → 40 terms, each a 60–100 word definition with `DefinedTermSet`. Glossary entries are the single most-cited page type in AI answers.
- **Original research:** *State of Enterprise Data Quality 2026* — 100–200 survey responses, published as a stats page with a downloadable dataset. This is the asset journalists and AI engines cite, and the only realistic way to earn links at scale.
- **Case studies:** add 2 more; put the headline number in the first sentence; add `Article` + `Organization` schema.

---

### W2 — Authority and mentions (Weeks 2–12, ongoing)

AI engines and Google both use third-party corroboration. Our own site cannot prove we are credible.

| Tactic | Volume | Target |
|---|---|---|
| Digital PR on the research report | 1 story/quarter | 20 pitches, 3–5 placements |
| HARO / Qwoted / SourceBottle | 3 responses/week | 2–3 expert quotes/quarter |
| Podcasts and webinars | 2/quarter | Practitioner audiences |
| Guest posts | 1/month | Towards Data Science, KDnuggets, CIO.com, InfoWorld — real bylines, no link farms |
| Open-source repo | 1 | `schema-compare` or dbt/Fivetran templates on GitHub |
| Partner/customer co-marketing | 1/quarter | Co-branded case study with a link |
| Community answers | 3/week | Reddit r/dataengineering, Stack Overflow, Quora — genuine answers, no link-dropping |

**Guardrails:** no paid links, no PBNs, no mass guest posting, no AI-spun content. A single toxic link profile is worse than a small one.

---

### W3 — Measurement and AEO operations (Weeks 1–4)

| # | Action | Why |
|---|---|---|
| 3.1 | Move GA4 + consent banner into a shared include used by **every** page. Verify with GA4 Realtime on a blog post and `/products/`. | Today only the homepage is measured. |
| 3.2 | Create an "AI Assistants" channel group in GA4: `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`, `claude.ai`. Add a landing-page report. | Proves ROI of this plan. |
| 3.3 | Search Console + Bing Webmaster Tools: verify, submit sitemap, monitor the 30 priority queries weekly. | Free demand data. |
| 3.4 | Run IndexNow on every deploy (`scripts/indexnow-changed.js` exists — wire it into the workflow). | Faster indexing of new pages. |
| 3.5 | Auto-generate `llms.txt` from the sitemap at build time. | Prevents drift as pages are added. |
| 3.6 | Schema audit: `SoftwareApplication` + `Offer` + `AggregateRating` (only with real reviews) on product pages; `Person` on authors; `sameAs` on Organization; validate every change. | Rich results + entity resolution. |
| 3.7 | Internal-link audit: every guide links up to its pillar and once to `/products/`; each of the 8 targets receives ≥5 internal links. | Retrieval depends on link signals. |
| 3.8 | Core Web Vitals on mobile for the 8 targets; self-host the font. | Ranking + crawl quality. |
| 3.9 | Monthly AI audit (same 75 prompts, same engines, fresh sessions) and a one-page trend report. | The only honest AI-visibility metric. |

---

### W4 — 4DAlert product visibility (Weeks 2–10)

The product is currently split across two domains with no category ownership. Fix that.

| # | Action | Target query |
|---|---|---|
| 4.1 | Dedicated category pages on `4dalert.com`: data reconciliation software, data quality platform, MDM platform, schema compare tool, CI/CD for data. Each with definition, features, integrations, pricing signal, FAQ. | Tier 1 |
| 4.2 | Integration pages: Snowflake, Databricks, SAP, Microsoft Fabric, dbt. | High-intent long tail |
| 4.3 | Free wedge tool: online schema compare or data-diff (no signup, limited rows). | Links + brand searches |
| 4.4 | Review presence: G2, Capterra, TrustRadius, Gartner Peer Insights. 10+ reviews before any paid push. | Trust + AI corroboration |
| 4.5 | Comparison pages: vs Informatica, vs Reltio, vs in-house, vs dbt tests / Great Expectations. | Tier 2 |
| 4.6 | Canonical entity decision: product pages live on `4dalert.com`; `performalytic.com/products/` is the corporate overview and links out. Both declare the relationship in schema. | Entity clarity |
| 4.7 | Product-led content: templates, benchmarks, migration checklists. | Links + citations |

---

## 5. 90-day sprint calendar

### Weeks 1–2 — Stop the bleeding
- [ ] File Gridinsoft dispute; publish `/security/` page
- [ ] Claim/correct Salary.com + Glassdoor + Comparably
- [ ] Claim Google Business Profile, Bing Places, Apple Maps
- [ ] GA4 site-wide + AI channel group
- [ ] Run manual 75-cell AI baseline
- [ ] Kick off Clutch/G2/GoodFirms/Crunchbase profiles
- [ ] Start review requests to 10 recent clients

### Weeks 3–4 — Fix the foundation
- [ ] Rewrite targets #1–#3 to the template
- [ ] Publish `/compare/4dalert-vs-informatica/`
- [ ] Launch the research survey
- [ ] Wire IndexNow + auto-`llms.txt` into the build
- [ ] Internal-link pass on the 8 targets
- [ ] Schema audit + fixes

### Weeks 5–6 — Ship the answer cluster
- [ ] Rewrite targets #4–#6
- [ ] Publish build-vs-buy page
- [ ] Publish "4DAlert alternatives" (honest)
- [ ] Expand glossary to 25 terms
- [ ] 4DAlert category pages 1–3 live
- [ ] First 5 reviews live

### Weeks 7–8 — Prove and pitch
- [ ] Publish the research report + stats page
- [ ] First digital PR push (20 pitches)
- [ ] Rewrite targets #7–#8
- [ ] 4DAlert integration pages (Snowflake, Databricks, SAP)
- [ ] First monthly AI audit re-run

### Weeks 9–10 — Local + comparisons
- [ ] Upgrade `/chicago/`: local case studies, `areaServed`, `LocalBusiness` schema, Maps embed, NAP block
- [ ] Publish 2 more comparison pages
- [ ] Guest post #1 live
- [ ] Free schema-compare tool live
- [ ] 10 reviews live

### Weeks 11–12 — Measure and re-plan
- [ ] Search Console export → update priority column in `keywords.csv`
- [ ] Prune/merge pages with zero impressions in 90 days
- [ ] Second monthly AI audit
- [ ] 90-day review: what moved, what didn't, re-plan next quarter

---

## 6. Resourcing and budget

| Role | Commitment | Responsibility |
|---|---|---|
| Marketing lead (owner) | 0.5 FTE | Plan, reviews, PR, profiles, reporting |
| Technical writer | 1 FTE | 8 rewrites, glossary, comparisons, research report |
| SEO/dev | 0.25 FTE | GA4, schema, IndexNow, llms.txt, internal links, CWV |
| Product marketing | 0.25 FTE | 4DAlert pages, reviews, wedge tool |
| PR support | 0.25 FTE or agency | Gridinsoft dispute, research launch, podcasts |

| Item | Annual |
|---|---|
| Ahrefs or Semrush | $1,200–1,400 |
| Survey incentive + design | $500–1,000 |
| PR distribution (2 releases) | $800–1,500 |
| Review-platform listings (optional) | $0–1,200 |
| **Essential total** | **~$2,500–3,900** |

---

## 7. Guardrails

1. **Do not chase head terms.** "Master data management" is a losing fight; "how long does MDM implementation take" is winnable and converts better.
2. **Do not buy links or reviews.** Both are detectable and both destroy the trust layer this plan depends on.
3. **Do not publish AI-spun content at volume.** One thin page dilutes the whole site; prune before you publish.
4. **Do not optimize for a single AI answer.** Answers fluctuate. Track 75 cells monthly, judge trends.
5. **Do not let the two domains compete.** One canonical page per intent, cross-linked with schema.
6. **Do not gate the research report.** Gated PDFs do not get cited. Publish the data openly; gate the webinar.

---

## 8. Weekly operating rhythm

| Cadence | Ritual | Output |
|---|---|---|
| Monday 30 min | Metrics standup: GSC, AI referrals, reviews, shipped pages | One-page status |
| Wednesday 60 min | Content review: next target page against the template | Approved draft |
| Friday 30 min | Entity check: new profiles, mentions, contradictions | Updated entity log |
| Monthly 90 min | AI audit (75 cells) + trend report | `ai-visibility-audit.csv` row |
| Quarterly | Re-baseline keywords, prune, re-plan | Updated plan |

---

## 9. Relationship to existing docs

| Document | Role now |
|---|---|
| `SEARCH_VISIBILITY_PLAN.md` (this) | **Master execution plan and sequencing** |
| `KEYWORD_STRATEGY.md` + `keywords.csv` | Keyword map and content backlog — unchanged, feeds W1 |
| `AI_VISIBILITY_AUDIT.md` + `ai-visibility-audit.csv` | Measurement instrument — unchanged, feeds W3 |
| `DOMAIN_AUTHORITY_PLAN.md` | Tactical detail for W2 (links, directories, outreach) |
| `AI_SEO_GUIDE.md` | Reference for on-page AEO rules |
| `RANK_REPORT.md`, `SEO_RANKING_GUIDE.md`, `SEO_LAUNCH_GUIDE.md` | Historical baseline; superseded where they conflict with this plan |
| `digital-presence-roadmap.md` | Generic reference; not the operating plan |

---

## 10. The one-sentence version

**Fix the entity, publish eight extractable answers plus one original dataset, earn independent corroboration, and measure AI referrals — in that order.**

*Next review: 2026-12-27*

---

## 11. Implementation status — 2026-11-27

### Shipped in this pass

| Area | Change | Files |
|---|---|---|
| Measurement | Shared consent-aware GA4 loader on every public page; AI-assistant referral event (`ai_referral`) for ChatGPT, Perplexity, Gemini, Copilot, Claude, and others; outbound click event for `4dalert.com`; consent accept now loads analytics without a page reload. | `assets/js/analytics.js`, `assets/js/main.js`, 80 HTML pages |
| Measurement | `scripts/ai-visibility-report.js` turns the 75-cell audit CSV into mention, citation, and accuracy rates by group. | `scripts/ai-visibility-report.js`, `package.json` |
| Quality gate | `scripts/audit-site.js` checks internal links, titles, descriptions, canonicals, H1 count, JSON-LD validity, sitemap coverage, and `llms.txt` links. Wired into GitHub Actions. | `scripts/audit-site.js`, `.github/workflows/seo-audit.yml` |
| Product entity | `SoftwareApplication` now declares `publisher`, `author`, `sameAs`, and `dateModified`; homepage `Organization` declares the 4DAlert brand and offer. | `products/index.html`, `index.html` |
| Product content | Added "How 4DAlert compares", "How long does an MDM implementation take?", and "Build vs buy a data quality platform" tables, plus an MDM-timeline FAQ entry. | `products/index.html` |
| Topic content | Added the six-dimensions table to the data quality guide; added a weighted BI scorecard, visible FAQ, and `FAQPage` schema to the platform-selection guide. | `blog/data-quality-framework/index.html`, `blog/choose-right-analytics-platform/index.html` |
| Trust | Added RFC 9116 `security.txt`; added `WebPage` freshness schema to `/security/`; linked security in `llms.txt` and `llms-full.txt`; added the security contact to `robots.txt`. | `.well-known/security.txt`, `security/index.html`, `llms*.txt`, `robots.txt` |

### Still requires a human (off-site or editorial)

| Item | Owner | Why it cannot be automated |
|---|---|---|
| Gridinsoft phishing-listing dispute | PR | Needs company documents and a platform appeal. |
| Salary.com / Glassdoor / Comparably corrections | Marketing | Requires profile ownership and verification. |
| Google Business Profile, Clutch, G2, TrustRadius, Capterra | Marketing | Account creation and identity verification. |
| 10 verified client reviews | CS + Marketing | Must be genuine and voluntary. |
| Manual 75-cell AI baseline | Marketing | Requires fresh sessions on five consumer engines. |
| *State of Enterprise Data Quality 2026* survey | Content | Needs real respondents and analysis. |
| GA4 admin: "AI Assistants" channel group and `ai_source` custom dimension | Marketing | GA4 configuration, not site code. |
| 4DAlert category and integration pages on `4dalert.com` | Product marketing | Separate repository and domain. |
| Digital PR, podcasts, guest posts, backlinks | PR | Relationship work. |

### Recommended next commit

1. Run `npm run seo:audit` (already passing).
2. Commit and push; the deploy workflow regenerates `sitemap.xml` with real commit dates and submits changed URLs to IndexNow.
3. Run the manual AI baseline within seven days so the 90-day clock starts from a real number.
