# Performalytic Keyword Strategy 2026

**Owner:** Marketing + Data Practice  
**Created:** November 19, 2026  
**Scope:** performalytic.com, with a focus on the Knowledge Hub and its seven topic pillars  
**Companion file:** [`keywords.csv`](./keywords.csv) — the machine-readable keyword map

---

## 1. What this document is

This is the working keyword plan for the site. It does four jobs:

1. **Defines the clusters** we want to be known for, and the page that owns each one.
2. **Maps keywords to URLs** so writers know exactly where a term belongs.
3. **Lists the content gaps** — the pages that do not exist yet but should.
4. **Sets the measurement and review cadence** so the plan improves with real data.

It is deliberately opinionated. A keyword list without an owning page and an internal-link plan is just a spreadsheet.

> **Reality check:** no plan can guarantee ranking "in all search results." Search engines decide rankings. What we can control is coverage, relevance, technical quality, internal linking, freshness, and authority. This plan targets those inputs and measures the outputs.

---

## 2. Strategy in one page

### The bet

Performalytic should own the **practitioner-level, implementation-focused** end of enterprise data search, not the generic "what is data" head terms that are dominated by analyst firms and publishers.

That means winning queries where the searcher is:

- evaluating an approach (**"data mesh vs data lakehouse"**),
- planning a project (**"how to implement MDM"**),
- comparing platforms (**"Snowflake vs Databricks 2026"**),
- solving a production problem (**"how to prevent schema drift"**),
- or looking for a credible partner (**"data quality consulting"**).

### The structure

| Layer | Purpose | Examples |
|---|---|---|
| **Topic pillars** | Rank for the cluster head term; pass authority to guides | `/knowledge/master-data-management/` |
| **Deep guides** | Rank for long-tail and comparison queries; earn links | `/blog/entity-resolution-ai/` |
| **Glossary / concepts** | Win answer boxes and AI citations | `/knowledge/#glossary`, topic concept sections |
| **Commercial pages** | Convert high-intent searches | `/products/`, `/compare/`, `/contact/` |
| **Local pages** | Capture geography-qualified demand | `/chicago/` |

### The rules

- One primary keyword per page. Secondary keywords support it; they do not compete with it.
- Every new guide links **up** to its pillar, **across** to 2–3 related guides, and **down** to one commercial next step.
- Every pillar links to its 3 strongest guides above the fold and all guides in the library.
- Comparison and "how to" content gets a visible last-reviewed date and an author.
- We do not publish a page for a keyword unless it can be genuinely useful. Thin pages dilute the whole site.

---

## 3. Cluster map

| # | Cluster | Pillar page | Primary keyword | Intent | Priority |
|---|---|---|---|---|---|
| 1 | Data Architecture & Engineering | `/knowledge/data-architecture-engineering/` | data architecture | Informational / commercial | P1 |
| 2 | Business Intelligence & Analytics | `/knowledge/business-intelligence-analytics/` | business intelligence | Informational / commercial | P1 |
| 3 | AI & Machine Learning | `/knowledge/ai-machine-learning/` | AI and machine learning | Informational / commercial | P1 |
| 4 | Data Governance & Quality | `/knowledge/data-governance-quality/` | data governance | Informational / commercial | P1 |
| 5 | Cloud Data Platforms | `/knowledge/cloud-data-platforms/` | cloud data platform | Commercial investigation | P1 |
| 6 | DataOps & DevOps | `/knowledge/dataops-devops/` | DataOps | Informational / commercial | P1 |
| 7 | Master Data Management | `/knowledge/master-data-management/` | master data management | Informational / commercial | P1 |
| 8 | Brand & product | `/`, `/products/`, `/compare/` | 4DAlert | Navigational / commercial | P1 |
| 9 | Local & services | `/chicago/`, service pages | data analytics consulting Chicago | Commercial / local | P2 |

---

## 4. Keyword map by cluster

Demand is a **qualitative estimate** to prioritize writing, not a volume claim. Validate every term in Google Search Console, Bing Webmaster Tools, or a paid tool before committing budget.

### 4.1 Data Architecture & Engineering

**Pillar:** `/knowledge/data-architecture-engineering/`

| Keyword | Intent | Demand | Target page | Role |
|---|---|---|---|---|
| data architecture | Informational | High | Pillar | Primary |
| data architecture guide | Informational | Medium | Pillar | Secondary |
| modern data architecture | Informational | Medium | Pillar | Secondary |
| data architecture best practices | Informational | Medium | Pillar | Secondary |
| data engineering guide | Informational | Medium | Pillar | Secondary |
| data pipeline architecture | Informational | Medium | Pillar | Secondary |
| data modeling best practices | Informational | Medium | `/blog/data-modeling-crisis/` | Supporting |
| data lakehouse architecture | Informational | Medium | Pillar | Supporting |
| data mesh vs data lakehouse | Comparative | Medium | **Gap** `/blog/data-mesh-vs-data-lakehouse/` | New |
| batch vs streaming pipelines | Comparative | Medium | Pillar concepts | Supporting |
| how to design a data architecture | Question | Medium | Pillar field guide | Answer |
| how to build a scalable data stack | Question | Medium | Pillar field guide | Answer |
| data architecture consulting | Commercial | Low–Medium | `/enterprise-solution-development/` | Conversion |

### 4.2 Business Intelligence & Analytics

**Pillar:** `/knowledge/business-intelligence-analytics/`

| Keyword | Intent | Demand | Target page | Role |
|---|---|---|---|---|
| business intelligence | Informational | High | Pillar | Primary |
| business intelligence guide | Informational | Medium | Pillar | Secondary |
| what is business intelligence | Question | High | `/blog/what-is-business-intelligence/` | Supporting |
| BI vs data analytics | Comparative | High | Pillar concepts | Supporting |
| semantic layer | Informational | Medium | Pillar concepts | Supporting |
| dashboard best practices | Informational | Medium | **Gap** `/blog/dashboard-best-practices/` | New |
| how to choose a BI tool | Commercial investigation | High | `/blog/choose-right-analytics-platform/` | Supporting |
| BI platform comparison 2026 | Comparative | Medium | **Gap** `/blog/bi-platform-comparison/` | New |
| data-driven decision making | Informational | Medium | `/blog/data-driven-decision-making/` | Supporting |
| data-driven culture | Informational | Medium | `/blog/build-data-driven-culture/` | Supporting |
| self-service BI governance | Informational | Low–Medium | Pillar field guide | Supporting |
| BI implementation services | Commercial | Low–Medium | `/bi-integration/` | Conversion |

### 4.3 AI & Machine Learning

**Pillar:** `/knowledge/ai-machine-learning/`

| Keyword | Intent | Demand | Target page | Role |
|---|---|---|---|---|
| AI and machine learning | Informational | High | Pillar | Primary |
| enterprise AI guide | Informational | Medium | Pillar | Secondary |
| retrieval-augmented generation | Informational | High | `/blog/enterprise-rag-architecture/` | Supporting |
| enterprise RAG architecture | Informational | Medium | `/blog/enterprise-rag-architecture/` | Supporting |
| RAG vs fine-tuning | Comparative | High | **Gap** `/blog/rag-vs-fine-tuning/` | New |
| AI agents in the enterprise | Informational | High | `/blog/ai-agents-enterprise/` | Supporting |
| agentic AI workflows | Informational | Medium | `/blog/ai-agents-enterprise/` | Supporting |
| MLOps guide | Informational | Medium | **Gap** `/blog/mlops-guide/` | New |
| responsible AI framework | Informational | Medium | `/blog/responsible-ai-framework/` | Supporting |
| AI governance | Informational | High | `/blog/responsible-ai-framework/` | Supporting |
| AI in business intelligence | Informational | Medium | `/blog/ai-business-intelligence/` | Supporting |
| how to take ML models to production | Question | Medium | Pillar field guide | Answer |
| AI consulting services | Commercial | Medium | `/advanced-analytics-ai/` | Conversion |

### 4.4 Data Governance & Quality

**Pillar:** `/knowledge/data-governance-quality/`

| Keyword | Intent | Demand | Target page | Role |
|---|---|---|---|---|
| data governance | Informational | High | Pillar | Primary |
| data governance guide | Informational | Medium | Pillar | Secondary |
| data governance framework | Informational | Medium | Pillar field guide | Secondary |
| data quality framework | Informational | High | `/blog/data-quality-framework/` | Supporting |
| data quality dimensions | Informational | Medium | `/blog/data-quality-framework/` | Supporting |
| data quality metrics | Informational | Medium | Pillar field guide | Supporting |
| cost of bad data | Informational | Medium | `/blog/real-cost-of-bad-data/` | Supporting |
| data governance vs data quality | Comparative | Medium | **Gap** `/blog/data-governance-vs-data-quality/` | New |
| data stewardship model | Informational | Low–Medium | **Gap** `/blog/data-stewardship-model/` | New |
| data ownership | Informational | Medium | Pillar concepts | Supporting |
| how to implement data governance | Question | Medium | Pillar field guide | Answer |
| data quality consulting | Commercial | Low–Medium | `/contact/` | Conversion |

### 4.5 Cloud Data Platforms

**Pillar:** `/knowledge/cloud-data-platforms/`

| Keyword | Intent | Demand | Target page | Role |
|---|---|---|---|---|
| cloud data platform | Commercial investigation | High | Pillar | Primary |
| cloud data platform comparison | Comparative | Medium | Pillar library | Secondary |
| Snowflake vs Databricks | Comparative | High | `/blog/databricks-vs-snowflake/` | Supporting |
| Snowflake vs Databricks 2026 | Comparative | Medium | `/blog/databricks-vs-snowflake/` | Supporting |
| Snowflake vs BigQuery | Comparative | High | **Gap** `/blog/snowflake-vs-bigquery/` | New |
| Databricks vs Microsoft Fabric | Comparative | Medium | **Gap** `/blog/databricks-vs-fabric/` | New |
| data platform migration checklist | Informational | Medium | **Gap** `/blog/cloud-data-migration-checklist/` | New |
| multi-cloud data management | Informational | Medium | `/blog/cross-cloud-data-reconciliation/` | Supporting |
| cloud data cost optimization | Informational | Medium | **Gap** `/blog/cloud-data-cost-optimization/` | New |
| data lakehouse vs data warehouse | Comparative | High | **Gap** `/blog/lakehouse-vs-warehouse/` | New |
| how to choose a cloud data platform | Question | Medium | Pillar field guide | Answer |

### 4.6 DataOps & DevOps

**Pillar:** `/knowledge/dataops-devops/`

| Keyword | Intent | Demand | Target page | Role |
|---|---|---|---|---|
| DataOps | Informational | High | Pillar | Primary |
| DataOps guide | Informational | Medium | Pillar | Secondary |
| CI/CD for data | Informational | Medium | Pillar | Secondary |
| database CI/CD | Informational | Medium | `/blog/database-ci-cd-pipeline/` | Supporting |
| schema compare | Informational | Medium | `/blog/schema-compare-guide/` | Supporting |
| schema compare tools | Commercial investigation | Medium | `/blog/schema-compare-tools/` | Supporting |
| schema drift | Informational | Medium | `/blog/schema-drift/` | Supporting |
| how to prevent schema drift | Question | Medium | `/blog/schema-drift/` | Answer |
| data reconciliation | Informational | High | `/blog/data-reconciliation-guide/` | Supporting |
| automated data reconciliation | Informational | Medium | `/blog/automated-data-reconciliation/` | Supporting |
| data pipeline testing | Informational | Medium | **Gap** `/blog/data-pipeline-testing/` | New |
| data observability | Informational | High | **Gap** `/blog/data-observability-guide/` | New |
| database change management | Informational | Medium | `/blog/database-change-management/` | Supporting |

### 4.7 Master Data Management

**Pillar:** `/knowledge/master-data-management/`

| Keyword | Intent | Demand | Target page | Role |
|---|---|---|---|---|
| master data management | Informational | High | Pillar | Primary |
| master data management guide | Informational | Medium | Pillar | Secondary |
| what is master data management | Question | High | `/blog/what-is-master-data-management/` | Supporting |
| what is MDM | Question | Medium | `/blog/what-is-master-data-management/` | Supporting |
| golden record | Informational | Medium | Pillar concepts | Supporting |
| entity resolution | Informational | Medium | `/blog/entity-resolution-ai/` | Supporting |
| AI entity resolution | Informational | Medium | `/blog/entity-resolution-ai/` | Supporting |
| MDM implementation patterns | Informational | Medium | `/blog/mdm-implementation-patterns/` | Supporting |
| registry vs consolidation MDM | Comparative | Low–Medium | `/blog/mdm-implementation-patterns/` | Supporting |
| customer 360 | Informational | Medium | `/blog/mdm-ai-era/` | Supporting |
| product 360 | Informational | Low–Medium | `/blog/mdm-ai-era/` | Supporting |
| survivorship rules | Informational | Low–Medium | Pillar concepts | Supporting |
| how to implement MDM | Question | Medium | Pillar field guide | Answer |
| MDM software comparison | Commercial | Medium | `/blog/4dalert-vs-legacy-mdm/` | Conversion |
| 4DAlert vs Informatica | Comparative | Low–Medium | **Gap** `/compare/` expansion | New |
| 4DAlert vs Reltio | Comparative | Low–Medium | **Gap** `/compare/` expansion | New |

### 4.8 Brand, product & navigational

| Keyword | Intent | Demand | Target page | Role |
|---|---|---|---|---|
| Performalytic | Navigational | Brand | `/` | Brand |
| Performalytic Knowledge Hub | Navigational | Brand | `/knowledge/` | Brand |
| Performalytic data consulting | Navigational / commercial | Low | `/about/` | Brand |
| 4DAlert | Navigational | Brand | `/products/` | Product |
| 4DAlert data management platform | Navigational | Low | `/products/` | Product |
| 4DAlert demo | Transactional | Low | `/book-meeting/` | Conversion |
| data reconciliation platform | Commercial | Medium | `/products/` | Product |
| data quality platform | Commercial | High | `/products/` | Product |
| MDM platform | Commercial | High | `/products/` | Product |

### 4.9 Local & service demand

| Keyword | Intent | Demand | Target page | Role |
|---|---|---|---|---|
| data analytics consulting Chicago | Commercial / local | Medium | `/chicago/` | Local |
| data engineering consulting Chicago | Commercial / local | Low–Medium | `/chicago/` | Local |
| AI consulting Chicago | Commercial / local | Medium | `/chicago/` | Local |
| data governance consulting | Commercial | Medium | `/contact/` | Service |
| BI consulting services | Commercial | Medium | `/bi-integration/` | Service |
| enterprise data strategy consulting | Commercial | Medium | `/enterprise-solution-development/` | Service |
| MDM implementation services | Commercial | Low–Medium | `/contact/` | Service |

---

## 5. Question keywords for answer engines (AEO / GEO)

These are the queries AI assistants and featured snippets are most likely to answer. Every answer should be:

- **Direct** in the first sentence (40–60 words).
- **Attributed** to the page and Performalytic.
- **Linked** to the deeper guide.
- **Structured** with a definition, an example, and a "learn more" link.

| Question | Answer page | Format |
|---|---|---|
| What is data architecture? | Pillar concept | Definition + diagram/alt |
| What is a data lakehouse? | Pillar concept | Definition + comparison |
| What is business intelligence? | `/blog/what-is-business-intelligence/` | Definition + components |
| What is a semantic layer? | Pillar concept | Definition + example metric |
| What is retrieval-augmented generation? | AI pillar concept | Definition + flow |
| What is an AI agent? | AI pillar concept | Definition + example workflow |
| What is MLOps? | AI pillar concept | Definition + lifecycle |
| What is data governance? | Governance pillar concept | Definition + roles |
| What is data quality? | Governance pillar concept | Definition + dimensions |
| What is master data management? | MDM pillar concept | Definition + golden record |
| What is a golden record? | MDM pillar concept | Definition + survivorship |
| What is entity resolution? | MDM pillar concept | Definition + matching stages |
| What is DataOps? | DataOps pillar concept | Definition + controls |
| What is schema drift? | `/blog/schema-drift/` | Definition + detection |
| What is data reconciliation? | `/blog/data-reconciliation-guide/` | Definition + controls |
| How do I choose a cloud data platform? | Cloud pillar field guide | Checklist |
| How do I take ML models to production? | AI pillar field guide | Checklist |
| How do I implement data governance? | Governance pillar field guide | Steps |
| How do I implement MDM? | MDM pillar field guide | Steps |
| What is the difference between BI and analytics? | Hub FAQ | Comparison |

---

## 6. Content gap backlog

Ordered by expected impact. Each entry needs an author, a review date, and a link plan before writing.

| # | Proposed URL | Working title | Primary keyword | Internal links in | Priority |
|---|---|---|---|---|---|
| 1 | `/blog/data-mesh-vs-data-lakehouse/` | Data Mesh vs Data Lakehouse: Which Architecture Fits? | data mesh vs data lakehouse | Architecture pillar, modeling guide | P1 |
| 2 | `/blog/rag-vs-fine-tuning/` | RAG vs Fine-Tuning: How to Choose in 2026 | RAG vs fine-tuning | AI pillar, RAG guide, agents guide | P1 |
| 3 | `/blog/snowflake-vs-bigquery/` | Snowflake vs BigQuery: A Practical Comparison | Snowflake vs BigQuery | Cloud pillar, Databricks comparison | P1 |
| 4 | `/blog/lakehouse-vs-warehouse/` | Data Lakehouse vs Data Warehouse: The Real Difference | lakehouse vs warehouse | Architecture pillar, cloud pillar | P1 |
| 5 | `/blog/data-governance-vs-data-quality/` | Data Governance vs Data Quality: What's the Difference? | governance vs quality | Governance pillar, quality framework | P1 |
| 6 | `/blog/data-observability-guide/` | Data Observability: A Practical Guide | data observability | DataOps pillar, quality framework | P1 |
| 7 | `/blog/cloud-data-cost-optimization/` | How to Reduce Cloud Data Costs Without Breaking Analytics | cloud data cost optimization | Cloud pillar, migration checklist | P1 |
| 8 | `/blog/data-pipeline-testing/` | Data Pipeline Testing: Contracts, Checks, and CI | data pipeline testing | DataOps pillar, schema compare | P2 |
| 9 | `/blog/dashboard-best-practices/` | Dashboard Best Practices That Improve Adoption | dashboard best practices | BI pillar, semantic layer guide | P2 |
| 10 | `/blog/mlops-guide/` | MLOps Guide: From Notebook to Production | MLOps guide | AI pillar, RAG guide | P2 |
| 11 | `/blog/data-mesh-vs-data-lakehouse/` | (see #1) | — | — | — |
| 12 | `/blog/data-stewardship-model/` | Designing a Data Stewardship Model That Works | data stewardship model | Governance pillar, MDM pillar | P2 |
| 13 | `/blog/databricks-vs-fabric/` | Databricks vs Microsoft Fabric for Enterprise Analytics | Databricks vs Fabric | Cloud pillar, Databricks comparison | P2 |
| 14 | `/blog/cloud-data-migration-checklist/` | Cloud Data Migration Checklist: Waves, Cutover, Validation | data migration checklist | Cloud pillar, reconciliation guide | P2 |
| 15 | `/blog/bi-platform-comparison/` | BI Platform Comparison 2026: Power BI, Tableau, Looker | BI platform comparison | BI pillar, choose platform | P2 |
| 16 | `/blog/semantic-layer-guide/` | Semantic Layer Guide: Define Metrics Once | semantic layer | BI pillar, modeling guide | P2 |
| 17 | `/blog/customer-360-architecture/` | Customer 360 Architecture: A Practical Blueprint | customer 360 architecture | MDM pillar, MDM AI era | P2 |
| 18 | `/blog/data-contracts-guide/` | Data Contracts: A Practical Implementation Guide | data contracts | Architecture pillar, DataOps pillar | P2 |
| 19 | `/blog/ai-evaluation-guide/` | Evaluating Enterprise AI: Offline, Online, and Guardrails | AI evaluation | AI pillar, responsible AI | P3 |
| 20 | `/blog/data-quality-metrics/` | Data Quality Metrics That Leaders Actually Use | data quality metrics | Governance pillar, quality framework | P3 (covered) |
| 21 | `/compare/4dalert-vs-informatica/` | 4DAlert vs Informatica | 4DAlert vs Informatica | `/compare/`, MDM pillar | P2 |
| 22 | `/compare/4dalert-vs-reltio/` | 4DAlert vs Reltio | 4DAlert vs Reltio | `/compare/`, MDM pillar | P2 |

**Status note:** #20 is now covered by the "Metrics that matter" table on the governance pillar. Keep the article only if it can add a distinct benchmark, template, or dataset.

**Rule:** do not start a gap article until the pillar it supports has (a) a field guide, (b) a start-here path, and (c) at least three internal links pointing to the new URL. All three now exist for the seven pillars.

---

## 7. 90-day execution plan

### Weeks 1–2: foundations

- [x] Upgrade all seven pillars with start-here paths, field guides, and FAQs.
- [x] Add the full guide library, search, glossary, and stronger editorial attribution to `/knowledge/`.
- [x] Update titles, descriptions, Open Graph, and `dateModified` across the hub.
- [ ] Submit the updated sitemap in Google Search Console and Bing Webmaster Tools.
- [ ] Run IndexNow for the eight Knowledge Hub URLs.
- [ ] Verify rich results for FAQ, CollectionPage, ItemList, and DefinedTermSet.

### Weeks 3–6: fill P1 gaps

- [ ] Publish content gaps #1–#5.
- [ ] Add 3 internal links to each new guide from the matching pillar and related guides.
- [ ] Add a "Related guides" block to the five highest-traffic blog posts.
- [ ] Refresh the top 10 guides with a visible review date and one new section each.

### Weeks 7–10: comparisons and commercial intent

- [ ] Publish gaps #6–#8 and the two `/compare/` pages.
- [ ] Add a comparison table component to all comparison articles.
- [ ] Link every comparison article to `/products/`, `/compare/`, and one case study.
- [ ] Add `Product` and `Offer` schema where appropriate on commercial pages.

### Weeks 11–13: authority and measurement

- [ ] Build 10 link-worthy assets (templates, checklists, benchmark explainers).
- [ ] Pitch 20 podcasts, newsletters, and industry roundups with a specific angle.
- [ ] Review Search Console: queries with impressions but position 8–20; improve those pages first.
- [ ] Prune or merge pages with zero impressions after 90 days.

---

## 8. On-page rules

### Titles

- 50–60 characters where possible; never exceed 65.
- Primary keyword near the front.
- Brand at the end for commercial pages; omit brand when it would crowd out the keyword.

### Meta descriptions

- 140–155 characters.
- Include the primary keyword, the outcome, and an implicit reason to click.
- No "click here", no unsupported superlatives.

### Headings

- Exactly one `<h1>`.
- `<h2>` for major sections; `<h3>` for sub-points. Never skip levels.
- Questions as headings are encouraged when the section answers them directly.

### Content

- Answer-first paragraph under each question heading.
- At least one table, checklist, or numbered framework per guide.
- Named author, review date, and editorial-policy link.
- 3–5 internal links with descriptive anchor text.
- One clear next step (guide, product, or contact) — not three competing CTAs.

### Structured data

- `CollectionPage` + `ItemList` on pillars.
- `FAQPage` only where the questions are visible on the page.
- `DefinedTermSet` for concept sections and the glossary.
- `BreadcrumbList` on every nested page.
- `Article` with `author`, `datePublished`, and `dateModified` on every guide.
- Validate every change in the Rich Results Test.

---

## 9. Internal linking model

```
Home
 └── Knowledge Hub (/knowledge/)
      ├── Topic pillar (7)
      │    ├── Start-here path (3 guides)
      │    ├── Field guide (steps + table + pitfalls)
      │    ├── All guides (3–12)
      │    ├── Key concepts (4–6)
      │    └── FAQ (5–9)
      ├── Full library (search + filters)
      └── Glossary (10 terms)
```

**Link rules**

1. Pillar → its guides: every guide appears at least once.
2. Guide → pillar: every blog post links back to its pillar in the first screen or the conclusion.
3. Guide → guide: 2–3 contextual links to adjacent topics.
4. Hub → pillar: all seven, above the fold and in the library.
5. Commercial pages → proof: `/products/` links to guides and case studies; guides link to `/products/` or `/contact/` once.

**Anchor text**

- Use the target page's primary keyword or a natural variant.
- Avoid "read more", "click here", and repeated identical anchors.
- Vary between exact match, partial match, and descriptive phrases.

---

## 10. AI search (AEO / GEO) playbook

AI assistants cite pages that are easy to extract, verify, and attribute. The Knowledge Hub now does the following; keep it up:

- **Definition blocks** in plain English on every pillar and in the glossary.
- **Question-shaped headings** with direct answers underneath.
- **Visible dates and authorship** so a model can judge freshness and trust.
- **`llms.txt`** with a concise map of the site.
- **FAQ schema** matching visible content.
- **Comparison tables** that answer "X vs Y" in a scannable format.
- **Explanatory SVG diagrams** on every pillar and the hub, with accessible titles, descriptions, and a plain-English caption.
- **Canonical URLs** and clean internal links so citations point to the right page.

When publishing a new guide, also:

- Add a 2–3 sentence summary at the top that can stand alone as an answer.
- Include the entity name (Performalytic, 4DAlert) and the category in the first 100 words.
- Add the guide to `llms.txt` if it is a flagship resource.
- Keep facts dated. Replace "recently" with a year or month.

---

## 11. Measurement

### Weekly

- Search Console: impressions, clicks, CTR, average position for priority queries.
- New queries with impressions but no clicks (title/description opportunity).
- Indexed page count and crawl errors.
- AI referrals (`chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`, `gemini.google.com`) in analytics.

### Monthly

- Ranking distribution: top 3, 4–10, 11–20, 21+ for the priority list.
- Which pillars and guides earn links or mentions.
- Conversion rate from organic to consultation or demo.
- Content decay: pages losing impressions for two consecutive months.

### Quarterly

- Re-run keyword research and update `keywords.csv`.
- Merge or prune pages with no impressions and no links.
- Re-check competitor coverage for the comparison and "how to" clusters.
- Update the 90-day plan based on what actually moved.

### Targets (directional, not guarantees)

| Metric | Baseline | 90 days | 180 days |
|---|---|---|---|
| Indexed Knowledge Hub URLs | 8 | 8 + 8 new guides | 8 + 20 new guides |
| Queries with impressions | Measure at start | +50% | +150% |
| Top-10 priority keywords | Measure at start | +10 | +25 |
| Organic sessions to `/knowledge/` | Measure at start | +30% | +100% |
| Referring domains to guides | Measure at start | +5 | +15 |

---

## 12. What shipped in this pass

- New keyword plan (`KEYWORD_STRATEGY.md`) and 125-row keyword map (`keywords.csv`), including live pages, content gaps, question keywords, brand terms, and local/service demand.
- Seven pillar pages upgraded with:
  - keyword-led titles, descriptions, Open Graph, and Twitter metadata;
  - a "Start here" reading path with three ordered guides;
  - a practitioner field guide (steps, comparison table, common pitfalls);
  - a "Metrics that matter" table, tooling landscape, and worked example;
  - an accessible inline SVG diagram explaining the core concept;
  - visible review dates and editorial-standards links;
  - refreshed `CollectionPage` schema and `dateModified`.
- Knowledge Hub index upgraded with:
  - a keyword-led H1 and hero copy;
  - a 7-topic / 32-guide stat strip;
  - hero search with popular queries;
  - featured cards pointing at real guides instead of category pages;
  - a filterable, searchable library of every topic;
  - a three-layer SVG map of the seven topics;
  - three guided learning paths with outcomes and time estimates;
  - a "Latest guides" block driven by real publication dates;
  - a 10-term glossary with `DefinedTermSet` schema;
  - four new FAQs and matching FAQ schema;
  - an editorial-method section and stronger author attribution.
- Sitemap `lastmod` refreshed for all eight Knowledge Hub URLs.
- All internal links, JSON-LD, SVG accessibility labels, and anchor IDs validated.

---

## 13. Next actions

1. Review the keyword map with the delivery team; remove any term we cannot credibly support.
2. Assign owners for content gaps #1–#5.
3. Deploy, submit the sitemap, and run IndexNow.
4. After 30 days, export Search Console queries and update the priority column in `keywords.csv` with real impressions.
5. Add the `Related guides` block to the top 10 blog posts.

**Do not** add keywords to pages that do not answer the query. Coverage without usefulness is how sites get ignored.
