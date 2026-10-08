const fs = require('fs');
const path = require('path');

const TOPIC_CLUSTERS = {
  'rag': {
    keywords: ['RAG', 'retrieval augmented generation', 'vector database', 'embedding', 'semantic search', 'hybrid search', 're-ranking', 'RAGAS', 'chunking', 'enterprise RAG'],
    pillar: '/blog/enterprise-rag-architecture/',
    related: [
      '/blog/ai-agents-enterprise/',
      '/blog/ai-business-intelligence/',
      '/blog/responsible-ai-framework/',
      '/advanced-analytics-ai/'
    ]
  },
  'data-reconciliation': {
    keywords: ['data reconciliation', 'automated reconciliation', 'cross-cloud reconciliation', 'data matching', 'data quality'],
    pillar: '/blog/automated-data-reconciliation/',
    related: [
      '/blog/future-of-automated-data-reconciliation/',
      '/blog/cross-cloud-data-reconciliation/',
      '/blog/real-cost-of-bad-data/',
      '/blog/data-modeling-crisis/'
    ]
  },
  'ai-ml': {
    keywords: ['machine learning', 'AI', 'artificial intelligence', 'LLM', 'large language model', 'fine-tuning', 'generative AI'],
    pillar: '/blog/ai-agents-enterprise/',
    related: [
      '/blog/enterprise-rag-architecture/',
      '/blog/responsible-ai-framework/',
      '/blog/ai-changing-data-quality/',
      '/knowledge/ai-machine-learning/'
    ]
  },
  'bi-analytics': {
    keywords: ['business intelligence', 'BI', 'analytics', 'data-driven', 'dashboard', 'data visualization', 'databricks', 'snowflake'],
    pillar: '/blog/databricks-vs-snowflake/',
    related: [
      '/blog/what-is-business-intelligence/',
      '/blog/ai-business-intelligence/',
      '/blog/data-driven-decision-making/',
      '/knowledge/business-intelligence-analytics/'
    ]
  },
  'data-governance': {
    keywords: ['data governance', 'data quality', 'master data management', 'MDM', 'data catalog', 'data lineage'],
    pillar: '/blog/what-is-master-data-management/',
    related: [
      '/blog/mdm-ai-era/',
      '/blog/data-modeling-crisis/',
      '/knowledge/data-governance-quality/'
    ]
  },
  'database-cicd': {
    keywords: ['database cicd', 'database ci/cd', 'schema change', 'schema drift', 'schema compare', 'database devops', 'schema migration', 'database deployment', 'migration pipeline'],
    pillar: '/blog/database-ci-cd-pipeline/',
    related: [
      '/blog/schema-compare-guide/',
      '/blog/schema-drift/',
      '/blog/database-change-management/',
      '/blog/schema-migration-best-practices/',
      '/blog/schema-compare-tools/',
      '/blog/agentic-ai-database-devops/',
      '/blog/devops-best-practices/',
      '/knowledge/dataops-devops/',
      '/products/'
    ]
  }
};

function extractText(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function hasLink(html, targetUrl) {
  const pattern = new RegExp('href=["\']' + targetUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\']', 'i');
  return pattern.test(html);
}

function findInternalLinkOpportunities() {
  const blogDir = path.join(process.cwd(), 'blog');
  const files = fs.readdirSync(blogDir).filter(f => fs.statSync(path.join(blogDir, f)).isDirectory());

  console.log('=== INTERNAL LINKING OPPORTUNITIES ===\n');

  for (const file of files) {
    const htmlPath = path.join(blogDir, file, 'index.html');
    if (!fs.existsSync(htmlPath)) continue;

    const content = fs.readFileSync(htmlPath, 'utf-8');
    const text = extractText(content);
    const currentUrl = `/blog/${file}/`;

    for (const [clusterName, cluster] of Object.entries(TOPIC_CLUSTERS)) {
      const matches = cluster.keywords.filter(kw => text.includes(kw.toLowerCase()));
      if (matches.length > 0) {
        const hasPillarLink = hasLink(content, cluster.pillar);
        const missingRelated = cluster.related.filter(r => !hasLink(content, r));

        if (!hasPillarLink || missingRelated.length > 0) {
          console.log(`📝 ${currentUrl} (matches: ${matches.join(', ')})`);
          if (!hasPillarLink) console.log(`   → Missing pillar link: ${cluster.pillar}`);
          if (missingRelated.length > 0) console.log(`   → Missing related: ${missingRelated.join(', ')}`);
          console.log('');
        }
      }
    }
  }
}

findInternalLinkOpportunities();