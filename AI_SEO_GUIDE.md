# Performalytic — AI Search Optimization (GEO / AEO) Guide

> Actionable playbook for getting found and cited in AI search — ChatGPT, Google AI Overviews, Perplexity, Bing Copilot, and Gemini — and turning AI-driven visibility into enterprise leads.

> Complements: [SEO_RANKING_GUIDE.md](./SEO_RANKING_GUIDE.md), [DOMAIN_AUTHORITY_PLAN.md](./DOMAIN_AUTHORITY_PLAN.md), [AI_VISIBILITY_AUDIT.md](./AI_VISIBILITY_AUDIT.md). Traditional SEO builds rankings; this guide builds **AI citability**.

---

## Table of Contents

1. [Why AI Search Changes Everything](#1-why-ai-search-changes-everything)
2. [Current State: What We Already Have](#2-current-state-what-we-already-have)
3. [Foundation: AI Crawlability](#3-foundation-ai-crawlability)
4. [Structured Data & Entities for AI](#4-structured-data--entities-for-ai)
5. [Content That AI Engines Cite](#5-content-that-ai-engines-cite)
6. [Getting Cited, Not Just Indexed](#6-getting-cited-not-just-indexed)
7. [Channel-Specific Playbook](#7-channel-specific-playbook)
8. [Measurement & Monitoring](#8-measurement--monitoring)
9. [Quick Wins (This Week)](#9-quick-wins-this-week)
10. [90-Day AI Visibility Plan](#10-90-day-ai-visibility-plan)

---

## 1. Why AI Search Changes Everything

Traditional search returns links; AI search returns **answers with citations**. Users increasingly ask conversational questions of ChatGPT, Perplexity, Google AI Overviews (powered by Gemini), and Bing Copilot. When they do:

- The AI summarizes answers from 3-6 trusted sources.
- **Your site only appears if the AI can extract a clear, citable answer from your content.**
- Being the cited source matters more than being the #1 blue link.

**Key insight:** AI engines don't "rank" your homepage — they retrieve *specific passages*. The goal is to make Performalytic the most **extractable, quotable, and trustworthy** source for data-analytics, AI, and DevOps questions.

---

## 2. Current State: What We Already Have

### ✅ Already Done (verified September 2026)
| Asset | Status | AI Value |
|-------|--------|----------|
| `llms.txt` + `llms-full.txt` | ✅ Live | Direct feed for LLM-friendly site understanding; covers every sitemap URL |
| `llms.txt` alternate link | ✅ On 60+ pages | Declares the LLM entry point in `<head>` |
| JSON-LD | ✅ 59 files parse clean | Structured entities for AI extraction |
| Organization / FAQPage / Article / Breadcrumb / Service schema | ✅ Present | Entity graph for AI retrieval |
| Organization enrichment | ✅ Complete on all 59 | `foundingDate`, `numberOfEmployees`, `knowsAbout`, `areaServed`, `contactPoint`, `sameAs` identical everywhere |
| FAQPage on the 4 service pages + homepage | ✅ Added Sep 2026 | Visible Q&A + schema on the money pages |
| Answer-first ledes on the 4 service pages | ✅ Added Sep 2026 | Extractable opening answer under each `<h1>` |
| `SpeakableSpecification` on service pages + homepage | ✅ Added Sep 2026 | Assistants can read a designated passage |
| `robots.txt` AI allowances | ✅ 15 UAs explicitly allowed | AI crawlers admitted |
| Sitemap | ✅ 58 URLs | Indexed surface |
| Blog `datePublished` | ✅ All 26 posts | Freshness signal |
| AI visibility prompt audit kit | ✅ `AI_VISIBILITY_AUDIT.md` | Baseline + monthly measurement |

### ❌ Gaps still open
- [ ] Named author bios + `Person` schema on every blog post (needs real names/credentials — E-E-A-T)
- [ ] Original statistics/research (AI engines cite unique data heavily)
- [ ] Third-party mentions (LinkedIn, Clutch, G2, press) that AI cross-references
- [ ] First prompt-audit baseline run (see [AI_VISIBILITY_AUDIT.md](./AI_VISIBILITY_AUDIT.md))

---

## 3. Foundation: AI Crawlability

AI systems crawl the web like search engines (and increasingly via `llms.txt`). Keep the crawl surface clean:

- [x] **`llms.txt` / `llms-full.txt`** at `https://performalytic.com/llms.txt` — keep current whenever pages/posts change.
- [x] **Sitemap** at `https://performalytic.com/sitemap.xml` — add every new page/post.
- [x] **`robots.txt`** — AI bots explicitly allowed: `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `Claude-User`, `Google-Extended`, `Google-CloudVertexBot`, `Applebot-Extended`, `Bytespider`, `Amazonbot`, `Meta-ExternalAgent`, `cohere-ai` (plus `User-agent: * / Allow: /`).

- [ ] **Clean, semantic HTML** — keep single `<h1>` per page, descriptive headings, and paragraph-based content (avoid heavy JS-only rendering; AI retrieval is HTML-first).
- [ ] **Freshness** — review & update blog posts quarterly; AI engines weight recency heavily.
- [ ] **Canonical URLs** — already present; keep 1:1 page↔canonical.

---

## 4. Structured Data & Entities for AI

Structured data is how AI engines build an entity graph about Performalytic. We already have strong schema; extend it:

### 4.1 Entity Consistency
Maintain **identical** name/address/URL/logo across all schema and all third-party profiles (LinkedIn, Clutch, G2, Google Business Profile, etc.). AI cross-references NAP to confirm "Performalytic" is one real company.

### 4.2 Schema to Add/Complete
- [ ] **Person schema** for leadership (Nihar Rout, Abani Pattanayak) on `/about/` — extend with `jobTitle`, `alumniOf` (Northwestern Kellogg, etc.), `sameAs` (LinkedIn). Boosts expert E-E-A-T.
- [x] **Article schema** completeness on every blog post — `datePublished`, `author`, `publisher` present on all 26; `author` still points at the Organization (needs real named authors).
- [x] **SoftwareApplication** for 4DAlert on `/products/`.
- [x] **Service** schema on each of the 4 service pages — with `provider`, `serviceType`, `areaServed`.
- [x] **FAQPage** schema — now on the 4 service pages, the homepage, `/faq/`, `/knowledge/*`, `/products/` and 18 blog posts.
- [x] **SpeakableSpecification** — service pages, homepage and 3 blog posts.
- [ ] **Review/AggregateRating** on `/testimonials/` — keep the review count current as reviews grow.
- [ ] **ItemList** for case studies (blog index already uses `CollectionPage`).

### 4.3 Validate
Run every page through:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- Confirm zero errors; our 37 JSON-LD blocks are currently valid — keep them that way.

---

## 5. Content That AI Engines Cite

AI engines prefer **clear, self-contained, quotable passages** with specific facts. Rewrite/author content accordingly:

### 5.1 Answer-First Format
Every service page and blog post should open with a **direct answer block**:

> **What does Performalytic do?** Performalytic is an enterprise data, AI, and DevOps consulting firm that helps organizations turn data into a competitive advantage. We serve 500+ enterprise clients with a team of 800+ data professionals, rated 4.9/5 across 150+ reviews.

- Put the answer in the first 50-80 words.
- Use the exact phrasing people search: "How to...", "What is...", "Cost of...".
- Repeat the answer in a clean `<p>` (avoid answers hidden in images or tabs).

### 5.2 Quotable Statistics & Data
AI engines love specific, attributed numbers. Keep a running set:

| Stat | Use in |
|------|--------|
| 4.9/5 from 150+ client reviews | Homepage, testimonials |
| 800+ data professionals | Everywhere |
| 500+ enterprise clients | Everywhere |
| 10,000+ projects delivered | Metrics |
| 25% churn reduction case | Blog/testimonials |
| 89% of teams struggle with data semantics | Blog: data-modeling-crisis |

**Add original research** (e.g., a 2026 data-management survey, benchmark report). Original data is the single strongest backlink + AI-citation magnet.

### 5.3 Question-First Sections (FAQ everywhere)
- Keep `FAQPage` schema on homepage and blog posts (present).
- Mirror FAQ content **in visible text** on the page (not just JSON-LD) — AI retrieves visible text first.

### 5.4 E-E-A-T Signals AI Trusts
- Author bylines with credentials on every blog post (Person schema).
- Cite authoritative external sources (Gartner, Microsoft, NIST, research papers) with links.
- Link to your own case studies and testimonials from service pages.
- Keep exact, consistent company details everywhere.

### 5.5 Internal Linking for AI
- Every blog post → 2-3 related service pages (descriptive anchors).
- Every service page → 1-2 case studies, 1-2 posts, the ROI calculator.
- This helps AI engines connect your content graph.

---

## 6. Getting Cited, Not Just Indexed

Indexing ≠ citation. AI cites sources it trusts, has seen referenced elsewhere, and can extract cleanly.

### 6.1 Build Third-Party Mentions (cross-references)
- LinkedIn company page + founder profiles: post 2-3x/week linking to blog posts.
- Directory profiles: Clutch, G2, GoodFirms, UpCity, Crunchbase — with full NAP + descriptions. (See DOMAIN_AUTHORITY_PLAN.md.)
- Google Business Profile for both offices.
- Guest posts and quotes on industry sites (Forbes Council, Towards Data Science, CIO.com).
- Podcast/video appearances — transcripts get indexed and cited.

### 6.2 Make Content Linkable & Shareable
- Free tools (ROI calculator ✅), templates, checklists, benchmark reports.
- Update the blog every 2 weeks minimum; AI engines weight recent, growing sites.

### 6.3 Monitor Citations & Learn
- Ask AI assistants directly: "Who is Performalytic?" / "Best data analytics consulting firms?" / "How to choose an analytics platform?" and see whether we're cited and what source is used.
- Track which passages get cited; double down on that content format.
- If we're cited with an error, fix the source passage (AI follows the source).

---

## 7. Channel-Specific Playbook

| Channel | How It Retrieves | Performalytic Actions |
|---------|------------------|-----------------------|
| **ChatGPT / ChatGPT Search** | `llms.txt`, web crawl, cross-refs | Keep `llms.txt` current; strong NAP consistency; FAQs; answer-first content |
| **Google AI Overviews** | Google-indexed pages + schema | Traditional SEO foundation (see SEO guide) + schema + clear answers |
| **Perplexity** | Curated crawl + citations | Quotable stats, original research, external links, clean HTML |
| **Bing Copilot** | Bing index | Bing Webmaster Tools, sitemap submission, structured data |
| **Gemini (Google app)** | Google index + entities | Entity consistency, Person/Organization schema, brand mentions |
| **Claude (llms.txt support)** | `llms.txt` | Keep `llms-full.txt` comprehensive and current |

**General rule:** everything that helps traditional SEO (backlinks, domain authority, content depth, technical health) also helps AI search. The AI-specific extras are: `llms.txt`, answer-first writing, entity consistency, and measurable third-party trust.

---

## 8. Measurement & Monitoring

### 8.1 AI Visibility Metrics
| Metric | How to Measure | Target |
|--------|----------------|--------|
| Cited in ChatGPT answers | Manual prompts + question bank | Appear in 30%+ of relevant prompts |
| Cited in Perplexity | Manual search of key questions | Present in key queries |
| AI Overviews traffic | GA4: filter sessions via AI Overviews referral/link | Grow quarterly |
| Brand mentions | Google Alerts, Mention, Ahrefs | +10-25/month |
| `llms.txt` fetch success | Fetch `https://performalytic.com/llms.txt`; check via AI crawler logs | 200 OK, current |
| Citation accuracy | Prompt audit | No factual errors |

### 8.2 Monthly Prompt Audit (15 min)
Ask each AI assistant, monthly, and log answers:
1. "What is Performalytic?" (brand recognition)
2. "Best enterprise data analytics consulting firms?" (competitive citations)
3. "How to choose a data analytics platform?" (content citations)
4. "What is data reconciliation?" (blog citations)
5. "Performalytic reviews" (trust signals)

Record whether we're mentioned, cited, and whether the source is accurate.

### 8.3 Core Technical Checks (monthly)
- [ ] `llms.txt` / `llms-full.txt` valid & current
- [ ] All JSON-LD valid (use a validator)
- [ ] Sitemap updated with new pages
- [ ] No 404s on internal links (AI bots penalize broken links)
- [ ] Core Web Vitals "Good" (fast pages get retrieved more)

---

## 9. Quick Wins (This Week)

1. [x] **Verify AI bots allowed** in `robots.txt` (GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended).
2. [ ] **Submit sitemap** to Bing Webmaster Tools (Bing powers Copilot).
3. [ ] **Run the prompt audit baseline** — 15 prompts x 5 engines, see [AI_VISIBILITY_AUDIT.md](./AI_VISIBILITY_AUDIT.md).
4. [x] **Add answer-first block** to the top of the 4 service pages.
5. [ ] **Extend Person schema** on `/about/` with `sameAs` and `alumniOf`.
6. [x] **Confirm `llms.txt`/`llms-full.txt`** are live, current, and linked from `<head>`.
7. [x] **Dates** — `datePublished` present on all 26 blog posts.
8. [ ] **Refresh the blog index** with the newest 4 posts.

---

## 10. 90-Day AI Visibility Plan

### Month 1 — Foundation
| Week | Action | Outcome |
|------|--------|---------|
| 1 | `llms.txt` live, robots AI bots allowed, sitemap to Bing | AI crawl-ready |
| 2 | Answer-first blocks on 4 service pages + Person schema | Extractable content |
| 3 | Prompt audit baseline (5 questions, 5 AI tools) | Measured starting point |
| 4 | Google Business Profile + directory NAP consistency (Clutch, G2) | Third-party trust |

**Target:** AI crawl-ready, baseline recorded.

### Month 2 — Content & Trust
| Week | Action | Outcome |
|------|--------|---------|
| 1 | Publish 1 original-stat post or benchmark teaser | Data magnet |
| 2 | Add dates/author bylines across blog | Freshness signals |
| 3 | LinkedIn thought-leadership series (4 posts) | Cross-reference growth |
| 4 | Second prompt audit — compare to baseline | Early movement |

**Target:** +2-4 brand mentions, first AI citations.

### Month 3 — Scale & Measure
| Week | Action | Outcome |
|------|--------|---------|
| 1 | Publish original research (survey/benchmark) | High-citation asset |
| 2 | Guest post on 1-2 industry sites | Backlinks + mentions |
| 3 | Update ROI calculator + add data-maturity tool | Linkable assets |
| 4 | Full prompt audit + monthly report | Data-driven next quarter |

**Target:** Cited in 30%+ of tracked prompts, growing referral/AI traffic.

---

## Resources

- [llmstxt.org](https://llmstxt.org/) — the `llms.txt` spec
- [Google Search Central](https://developers.google.com/search) — AI Overviews guidance
- [Schema.org](https://schema.org/) — structured data reference
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [OpenAI: robots.txt and AI crawlers](https://platform.openai.com/docs/bots)

---

*Last updated: September 2026*
*Owner: Performalytic Marketing Team*