#!/usr/bin/env node
/**
 * 28-design-consistency.js
 *
 * One-off, idempotent visual-consistency pass for the static site.
 *
 * Fixes:
 *  - one canonical desktop and mobile navigation on every page that has a
 *    main nav (the site currently ships two different navs);
 *  - a real SVG chevron instead of the tiny text glyph that renders as a dot;
 *  - a theme-aware, high-resolution nav logo and the same horizontal lockup
 *    in the footer;
 *  - the duplicate "Book a Meeting" pill on Knowledge Hub pages;
 *  - the dead search icon on the blog index;
 *  - missing main.js on normal pages (blog index, testimonials, etc.);
 *  - the missing header on author, case-study, city/comparison, and editorial
 *    templates, plus a real favicon on pages that omitted one;
 *  - a small responsive guard so the seven-item nav never collides with the
 *    logo between 769px and 1100px;
 *  - readable mobile comparison tables (labelled cards instead of a clipped
 *    four-column table) and Knowledge Hub tables that fit at 390px;
 *  - double-escaped ampersands in Knowledge Hub copy.
 *
 * Run from the repository root:
 *   node scripts/28-design-consistency.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['.git', 'node_modules', 'assets', 'scripts']);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = walk(ROOT, []);
let changed = 0;

const CHEVRON = '<svg class="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

const THEME_TOGGLE = '<button type="button" class="theme-toggle" aria-label="Switch to light theme" aria-pressed="false" title="Switch to light theme"><svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg><svg class="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></button>';

const DESKTOP_NAV = `<ul class="nav-links" role="list">
<li><a href="/">Home</a></li>
<li>
<a href="#" aria-haspopup="true" aria-expanded="false">Solutions ${CHEVRON}</a>
<div class="nav-dropdown" role="menu">
<a href="/enterprise-solution-development/" role="menuitem">Enterprise Solution Development</a>
<a href="/advanced-analytics-ai/" role="menuitem">Advanced Analytics &amp; AI</a>
<a href="/bi-integration/" role="menuitem">BI Integration</a>
<a href="/application-development-and-system-integration/" role="menuitem">Application Development &amp; Integration</a>
</div>
</li>
<li><a href="/industries/">Industries</a></li>
<li><a href="/technologies/">Technology</a></li>
<li>
<a href="#" aria-haspopup="true" aria-expanded="false">Insights ${CHEVRON}</a>
<div class="nav-dropdown" role="menu">
<a href="/blog/" role="menuitem">Blog</a>
<a href="/knowledge/" role="menuitem">Knowledge Hub</a>
<a href="/products/" role="menuitem">Products</a>
<a href="/compare/" role="menuitem">Compare 4DAlert</a>
<a href="/tools/" role="menuitem">Tools</a>
</div>
</li>
<li>
<a href="#" aria-haspopup="true" aria-expanded="false">Company ${CHEVRON}</a>
<div class="nav-dropdown" role="menu">
<a href="/about/" role="menuitem">About</a>
<a href="/contact/" role="menuitem">Contact</a>
<a href="/careers/" role="menuitem">Careers</a>
<a href="/faq/" role="menuitem">FAQ</a>
</div>
</li>
<li><a href="/contact/" class="nav-cta">Let's Talk</a></li>
<li class="nav-theme-item">${THEME_TOGGLE}</li></ul>`;

const MOBILE_NAV = `<nav class="mobile-menu" id="mobileMenu" aria-label="Mobile navigation">
<a href="/">Home</a>
<div class="mm-group">
<div class="mm-label">Solutions</div>
<a href="/enterprise-solution-development/">Enterprise Solution Development</a>
<a href="/advanced-analytics-ai/">Advanced Analytics &amp; AI</a>
<a href="/bi-integration/">BI Integration</a>
<a href="/application-development-and-system-integration/">Application Development &amp; Integration</a>
</div>
<a href="/industries/">Industries</a>
<a href="/technologies/">Technology</a>
<div class="mm-group">
<div class="mm-label">Insights</div>
<a href="/blog/">Blog</a>
<a href="/knowledge/">Knowledge Hub</a>
<a href="/products/">Products</a>
<a href="/compare/">Compare 4DAlert</a>
<a href="/tools/">Tools</a>
</div>
<div class="mm-group">
<div class="mm-label">Company</div>
<a href="/about/">About</a>
<a href="/contact/">Contact</a>
<a href="/careers/">Careers</a>
<a href="/faq/">FAQ</a>
</div>
<a href="/contact/" class="nav-cta">Let's Talk</a>
</nav>`;

const NAV_LOGO_MARKUP = `<img src="/assets/images/performalytic-logo-no-bg.png" alt="Performalytic" class="nav-logo-dark" width="411" height="78" fetchpriority="high" decoding="async" />
<img src="/assets/images/performalytic-logo-blue-1.png" alt="Performalytic" class="nav-logo-light" width="1250" height="196" fetchpriority="high" decoding="async" />`;

const MOBILE_THEME_TOGGLE = '<button type="button" class="theme-toggle theme-toggle-mobile" aria-label="Switch to light theme" aria-pressed="false" title="Switch to light theme"><svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg><svg class="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></button>';

const MENU_TOGGLE = '<button class="menu-toggle" id="menuToggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobileMenu"><span></span><span></span><span></span></button>';

const FULL_HEADER = `<header>
<nav aria-label="Main navigation">
<div class="container">
<a href="/" class="nav-logo" aria-label="Performalytic home">
${NAV_LOGO_MARKUP}
</a>
${DESKTOP_NAV}
${MOBILE_THEME_TOGGLE}
${MENU_TOGGLE}
</div>
</nav>
${MOBILE_NAV}
</header>`;

const FOOTER_DARK = '<img src="/assets/images/performalytic-logo-no-bg.png" alt="Performalytic" class="footer-brand-logo footer-brand-logo-dark" width="411" height="78" decoding="async" />';
const FOOTER_LIGHT = '<img src="/assets/images/performalytic-logo-blue-1.png" alt="Performalytic" class="footer-brand-logo footer-brand-logo-light" width="1250" height="196" decoding="async" />';

const FOOTER_SOCIAL = `<div class="footer-social">
<a href="https://www.linkedin.com/company/performalytic-corp/" target="_blank" rel="noopener noreferrer" aria-label="Follow Performalytic on LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
<a href="https://twitter.com/performalytic-corp" target="_blank" rel="noopener noreferrer" aria-label="Follow Performalytic on X"><svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
<a href="https://www.facebook.com/performalytic-corp" target="_blank" rel="noopener noreferrer" aria-label="Follow Performalytic on Facebook"><svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
<a href="https://www.instagram.com/performalytic-corp" target="_blank" rel="noopener noreferrer" aria-label="Follow Performalytic on Instagram"><svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"/></svg></a>
<a href="https://www.youtube.com/@performalytic-corp" target="_blank" rel="noopener noreferrer" aria-label="Follow Performalytic on YouTube"><svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
</div>`;

const POLISH_CSS = `<style id="pa-design-polish" nonce="P3rf0rm4lyt1c">
/* Design consistency pass: one logo lockup, one nav, one CTA. */
.skip-link:focus{top:0!important}
.nav-logo{width:230px;max-width:100%;flex:0 0 auto;justify-content:flex-start}
.nav-logo img{height:36px!important;width:auto!important;max-width:100%;flex:none;object-fit:contain!important;object-position:left center!important;display:block}
.nav-logo .nav-logo-dark{height:40px!important}
.nav-logo .nav-logo-light{height:36px!important}
.nav-logo .nav-logo-light{display:none}
:root[data-theme="light"] .nav-logo .nav-logo-dark{display:none}
:root[data-theme="light"] .nav-logo .nav-logo-light{display:block}
.nav-links>li{position:relative}
.nav-links>li>a{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.nav-dropdown{display:none;position:absolute;top:100%;left:0;background:var(--pa-panel-152342-098,var(--pa-panel,#0b1324));backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);min-width:240px;border-radius:16px;box-shadow:0 20px 60px var(--pa-sh-k-04,rgba(0,0,0,.35));border:1px solid var(--pa-wd-006,rgba(148,163,184,.15));padding:8px;z-index:100}
.nav-dropdown::before{content:'';position:absolute;left:0;right:0;top:-10px;height:10px}
.nav-links>li:hover>.nav-dropdown,.nav-links>li:focus-within>.nav-dropdown,.nav-links>li.is-open>.nav-dropdown{display:block}
.nav-dropdown a{display:block;padding:9px 12px;border-radius:10px;color:var(--pa-t-muted);font-size:.86rem;text-decoration:none;white-space:nowrap}
.nav-dropdown a:hover{background:var(--pa-wb-004,rgba(255,255,255,.05));color:var(--pa-t-strong)}
.nav-cta{white-space:nowrap;flex-shrink:0}
nav.breadcrumb{background:none!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;z-index:auto!important}
.nav-links>li>a .nav-chevron{width:12px;height:12px;flex:none;opacity:.55;transition:transform .2s,opacity .2s}
.nav-links>li:hover>a .nav-chevron,.nav-links>li.is-open>a .nav-chevron{transform:rotate(180deg);opacity:1}
.menu-toggle[aria-expanded="true"] span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.menu-toggle[aria-expanded="true"] span:nth-child(2){opacity:0}
.menu-toggle[aria-expanded="true"] span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.nav-cta{background:#2563eb!important;color:#fff!important;box-shadow:0 4px 14px rgba(37,99,235,.3)!important}
.nav-cta:hover{background:#1d4ed8!important;color:#fff!important}
.footer-brand-logo{width:auto!important;height:40px!important;max-width:100%!important;object-fit:contain!important;object-position:left center!important}
.footer-brand-logo-light{display:none!important}
:root[data-theme="light"] .footer-brand-logo-dark{display:none!important}
:root[data-theme="light"] .footer-brand-logo-light{display:block!important}
.footer-compliance{display:flex;gap:8px;align-items:center;margin:8px 0}
.footer-bottom{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center}
.footer-bottom-links{display:flex;flex-wrap:wrap;gap:10px 18px;max-width:100%}
@media(max-width:768px){.footer-bottom{flex-direction:column;align-items:flex-start}.footer-bottom-links{width:100%;justify-content:flex-start}}
.kh-field-main,.kh-field-aside{min-width:0}
@media(max-width:900px){.kh-field-grid,.kh-start-card{grid-template-columns:minmax(0,1fr)!important}}
@media(max-width:480px){.kh-table{min-width:0!important;font-size:.72rem!important}.kh-table th,.kh-table td{padding:8px 6px!important}}
.compliance-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;text-decoration:none;border:1px solid var(--pa-wd-008,rgba(148,163,184,.2));background:var(--pa-wb-003,rgba(255,255,255,.03));color:var(--pa-t-dim,#94a3b8);transition:all .2s}
.compliance-badge:hover{border-color:rgba(74,222,128,.3);color:var(--pa-at-green-3,#4ade80);background:rgba(74,222,128,.05)}
.footer-social{display:flex;gap:10px;margin-top:20px}
.footer-social a{width:36px;height:36px;border-radius:8px;border:1px solid var(--pa-wd-006,rgba(148,163,184,.15));display:flex;align-items:center;justify-content:center;color:var(--pa-t-dim,#94a3b8);text-decoration:none;transition:all .2s}
.footer-social a:hover{border-color:#2563eb;color:var(--pa-at-blue,#60a5fa);background:rgba(37,99,235,.08);transform:translateY(-2px)}
.floating-meeting-btn{position:fixed;bottom:30px;right:30px;display:flex;align-items:center;justify-content:center;gap:0;width:52px;height:52px;padding:0;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;text-decoration:none;border-radius:50%;font-size:14px;font-weight:600;box-shadow:0 4px 16px rgba(37,99,235,.35);z-index:998;white-space:nowrap;overflow:hidden;transition:width .25s,padding .25s,transform .3s,box-shadow .3s,opacity .3s}
.floating-meeting-btn span{max-width:0;opacity:0;overflow:hidden;white-space:nowrap;transition:max-width .25s,opacity .2s}
.floating-meeting-btn:hover,.floating-meeting-btn:focus-visible{width:176px;padding:0 18px;border-radius:50px;gap:8px;transform:translateY(-3px);box-shadow:0 8px 24px rgba(37,99,235,.5);color:#fff}
.floating-meeting-btn:hover span,.floating-meeting-btn:focus-visible span{max-width:140px;opacity:1}
.floating-meeting-btn svg{flex-shrink:0}
.floating-meeting-btn.is-hidden{opacity:0;pointer-events:none;transform:translateY(12px)}
@media(max-width:1180px){.nav-links{gap:18px}.nav-links>li>a{font-size:.79rem}}
@media(max-width:1000px){nav:not(.mobile-menu) .nav-links,nav:not(.mobile-menu) .nav-cta{display:none}.menu-toggle{display:flex}.theme-toggle-mobile{display:inline-flex!important}nav:not(.mobile-menu) .nav-theme-item{display:none}.nav-logo{width:auto}.nav-logo img{height:32px!important}.nav-logo .nav-logo-dark{height:34px!important}.nav-logo .nav-logo-light{height:32px!important}}
@media(max-width:768px){.nav-logo{width:auto}.nav-logo img{height:30px!important}.nav-logo .nav-logo-dark{height:32px!important}.nav-logo .nav-logo-light{height:30px!important}.floating-meeting-btn{width:48px;height:48px;border-radius:50%;padding:0;justify-content:center;font-size:13px}.floating-meeting-btn:hover,.floating-meeting-btn:focus-visible{width:48px;padding:0;border-radius:50%;gap:0;transform:none}.floating-meeting-btn span{display:none}.footer-compliance{justify-content:center}}
/* Author, case-study, comparison, and editorial pages share a plain template.
   Give that content the same card, type, and spacing language as the rest of
   the site instead of leaving unstyled headings and lists. */
.author-hero,.cs-hero,.lp-hero,.ep-hero{padding:140px 0 64px;border-bottom:1px solid var(--pa-wd-004);background:radial-gradient(circle at 12% 0%,rgba(37,99,235,.12),transparent 46%)}
.author-hero h1,.cs-hero h1,.lp-hero h1,.ep-hero h1{font-size:clamp(2.2rem,4.4vw,3.55rem);line-height:1.08;font-weight:800;letter-spacing:-.035em;color:var(--pa-t-strong);max-width:960px;margin:14px 0 20px}
.author-hero p,.cs-hero>.container>p,.lp-hero>.container>p,.ep-hero>.container>p{font-size:1.12rem;line-height:1.75;color:var(--pa-t-muted);max-width:840px}
.section-label,.cs-kicker,.lp-kicker{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:rgba(37,99,235,.12);border:1px solid rgba(96,165,250,.28);color:var(--pa-at-blue,#60a5fa);font-size:.7rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase}
.author-index-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;padding:64px 0 80px}
.author-card{display:flex;flex-direction:column;gap:11px;padding:26px;border:1px solid var(--pa-wd-006);border-radius:20px;background:var(--pa-wb-002);text-decoration:none;transition:transform .25s,border-color .25s,background .25s,box-shadow .25s}
.author-card:hover{transform:translateY(-4px);border-color:rgba(96,165,250,.38);background:var(--pa-wb-004);box-shadow:0 16px 40px rgba(0,0,0,.16)}
.author-avatar{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.05rem;letter-spacing:.02em;flex:none}
.author-card h2{font-size:1.25rem;font-weight:800;color:var(--pa-t-strong);letter-spacing:-.02em;margin:4px 0 0}
.author-card .role,.author-role{font-size:.76rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--pa-at-blue,#60a5fa)}
.author-card p{font-size:.92rem;line-height:1.65;color:var(--pa-t-muted);flex:1}
.author-card .count{font-size:.84rem;font-weight:700;color:var(--pa-t-strong);margin-top:4px}
.author-profile{display:flex;gap:24px;align-items:flex-start}
.author-profile .author-avatar{width:76px;height:76px;border-radius:20px;font-size:1.3rem}
.author-profile h1{margin-top:2px}
.author-bio{font-size:1.05rem;line-height:1.75;color:var(--pa-t-muted);max-width:760px;margin:10px 0 0}
.author-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.author-tag{padding:5px 10px;border-radius:999px;border:1px solid var(--pa-wd-006);background:var(--pa-wb-003);font-size:.73rem;font-weight:600;color:var(--pa-t-muted)}
.author-posts{padding:56px 0 72px}
.author-post-list{display:grid;gap:14px;margin-top:28px}
.author-post{display:block;padding:22px 24px;border:1px solid var(--pa-wd-006);border-radius:16px;background:var(--pa-wb-002);text-decoration:none;transition:transform .2s,border-color .2s,background .2s}
.author-post:hover{transform:translateY(-2px);border-color:rgba(96,165,250,.35);background:var(--pa-wb-004)}
.author-post h3{font-size:1.05rem;font-weight:750;line-height:1.4;color:var(--pa-t-strong);margin:0 0 7px}
.author-post p{font-size:.9rem;line-height:1.65;color:var(--pa-t-muted);margin:0}
.author-post .meta{font-size:.76rem;color:var(--pa-t-dim);margin-top:10px}
.cs-hero .cs-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:34px}
.cs-metric{padding:20px;border:1px solid var(--pa-wd-006);border-radius:16px;background:var(--pa-wb-002)}
.cs-metric .n{font-size:clamp(1.8rem,3vw,2.35rem);font-weight:800;line-height:1;color:var(--pa-at-blue,#60a5fa);letter-spacing:-.03em}
.cs-metric .l{font-size:.8rem;line-height:1.5;color:var(--pa-t-muted);margin-top:9px}
.cs-body,.lp-body,.ep-body{padding:60px 0 72px}
.cs-body>.container,.lp-body>.container,.ep-body>.container{max-width:1200px}\n.cs-body>.container>*,.lp-body>.container>*,.ep-body>.container>*{max-width:860px}
.cs-body h2,.lp-body h2,.ep-body h2{font-size:1.5rem;line-height:1.25;font-weight:800;letter-spacing:-.02em;color:var(--pa-t-strong);margin:38px 0 14px}
.cs-body h2:first-child,.lp-body h2:first-child,.ep-body h2:first-child{margin-top:0}
.cs-body h3,.lp-body h3{font-size:1.08rem;font-weight:750;color:var(--pa-t-strong);margin:26px 0 10px}
.cs-body p,.lp-body p,.ep-body p{font-size:.98rem;line-height:1.75;color:var(--pa-t-muted);margin:0 0 16px}
.cs-body ul,.lp-body ul,.lp-body ol,.ep-body ul{padding-left:1.25em;margin:0 0 22px;color:var(--pa-t-muted)}
.cs-body li,.lp-body li,.ep-body li{font-size:.96rem;line-height:1.7;margin:8px 0}
.cs-body strong,.lp-body strong,.ep-body strong{color:var(--pa-t-strong);font-weight:700}
.cs-body a,.lp-body a,.ep-body a{color:var(--pa-at-blue,#60a5fa);text-decoration:none;border-bottom:1px solid rgba(96,165,250,.3)}
.cs-body a:hover,.lp-body a:hover,.ep-body a:hover{border-bottom-color:var(--pa-at-blue,#60a5fa)}
.cs-steps{display:grid;gap:14px;margin:18px 0 28px}
.cs-step{padding:20px 22px;border:1px solid var(--pa-wd-006);border-radius:16px;background:var(--pa-wb-002)}
.cs-step h3{margin:0 0 7px}
.cs-step p{margin:0}
.cs-note,.lp-note,.ep-note{padding:18px 20px;border-left:3px solid #2563eb;background:rgba(37,99,235,.07);border-radius:0 12px 12px 0;color:var(--pa-t-muted);font-size:.9rem;line-height:1.7;margin:24px 0}
.cs-links,.lp-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.cs-links a,.lp-links a{padding:9px 14px;border:1px solid var(--pa-wd-006);border-radius:999px;background:var(--pa-wb-002);color:var(--pa-at-blue,#60a5fa);text-decoration:none;font-size:.84rem;font-weight:650;border-bottom:1px solid var(--pa-wd-006)}
.cs-links a:hover,.lp-links a:hover{background:var(--pa-wb-004);border-color:rgba(96,165,250,.35)}
.lp-faq{margin-top:40px;border-top:1px solid var(--pa-wd-004);padding-top:8px}
.lp-faq h2{margin-top:28px}
.lp-faq details{border-bottom:1px solid var(--pa-wd-004);padding:16px 0}
.lp-faq summary{cursor:pointer;font-weight:700;color:var(--pa-t-strong);list-style:none;display:flex;justify-content:space-between;gap:16px}
.lp-faq summary::-webkit-details-marker{display:none}
.lp-faq summary::after{content:'+';color:var(--pa-at-blue,#60a5fa);font-size:1.2rem;line-height:1;flex:none}
.lp-faq details[open] summary::after{content:'−'}
.lp-faq details p{margin:12px 0 0;font-size:.92rem}
.lp-table-wrap{overflow-x:auto;margin:18px 0 28px;border:1px solid var(--pa-wd-006);border-radius:14px}
.lp-table{width:100%;min-width:620px;border-collapse:collapse;font-size:.86rem}
.lp-table th,.lp-table td{padding:12px 14px;text-align:left;vertical-align:top;border-bottom:1px solid var(--pa-wd-006);line-height:1.55}
.lp-table th{font-size:.7rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--pa-t-strong);background:var(--pa-wb-003)}
.lp-table td{color:var(--pa-t-muted)}
.lp-table tr:last-child td{border-bottom:none}
.ep-meta{font-size:.84rem;color:var(--pa-t-dim);margin-top:30px;padding-top:18px;border-top:1px solid var(--pa-wd-004)}
@media(max-width:900px){.cs-hero .cs-metrics{grid-template-columns:1fr}.author-hero,.cs-hero,.lp-hero,.ep-hero{padding:118px 0 48px}.cs-body,.lp-body,.ep-body{padding:44px 0 56px}}
@media(max-width:600px){.author-profile{flex-direction:column;gap:16px}.author-profile .author-avatar{width:64px;height:64px;border-radius:18px;font-size:1.1rem}.author-index-grid{padding:40px 0 56px}.author-card{padding:22px}.author-post{padding:18px 20px}}\n@media(max-width:640px){.lp-table-wrap{overflow:visible;border:0;border-radius:0;margin:18px 0 24px}.lp-table{display:block;min-width:0;font-size:.9rem}.lp-table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.lp-table tbody,.lp-table tr,.lp-table td{display:block;width:100%}.lp-table tr{padding:16px 18px;border:1px solid var(--pa-wd-006);border-radius:14px;background:var(--pa-wb-002);margin-bottom:12px}.lp-table td{border:0;padding:7px 0;line-height:1.6;font-size:.88rem}.lp-table td+td{border-top:1px solid var(--pa-wd-004);margin-top:4px;padding-top:10px}.lp-table td::before{content:attr(data-label);display:block;font-size:.64rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--pa-t-dim);margin-bottom:3px}.lp-table td:first-child{font-size:1rem;font-weight:750;color:var(--pa-t-strong);padding-top:0}.lp-table td:first-child::before{display:none}.lp-table tr:last-child td{border-bottom:0}}
</style>`;

function replaceOnce(html, re, replacement) {
  return html.replace(re, replacement);
}

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  let hasMainNav = /<nav\b[^>]*aria-label="Main navigation"/i.test(html);
  const relFile = path.relative(ROOT, file).replace(/\\/g, '/');

  // Several content templates (author pages, case studies, city/comparison
  // landing pages, editorial policy) were shipped without the shared header
  // entirely, so their fixed-nav CSS had nothing to style. Add the canonical
  // header in one place. The maintenance page is intentionally standalone.
  if (!hasMainNav && !/^maintenance\.html$/i.test(relFile) && /<main\b/i.test(html) && !/<header\b/i.test(html)) {
    html = html.replace(/<main\b/i, `${FULL_HEADER}\n<main`);
    hasMainNav = true;
  }

  if (hasMainNav) {
    // 1. Theme-aware, high-resolution nav logo.
    html = html.replace(
      /(<a\b[^>]*class="[^"]*\bnav-logo\b[^"]*"[^>]*>)([\s\S]*?)(<\/a>)/i,
      (m, open, inner, close) => `${open}\n${NAV_LOGO_MARKUP}\n${close}`
    );

    // 2. Canonical desktop nav (also removes the dead blog search icon).
    html = replaceOnce(html, /<ul\b[^>]*class="[^"]*\bnav-links\b[^"]*"[^>]*>[\s\S]*?<\/ul>/i, DESKTOP_NAV);

    // 2b. Some templates put a second CTA and theme toggle beside the <ul>.
    //     The canonical list already contains both, so drop the extras.
    html = html.replace(/<\/ul>\s*<a\b[^>]*class="[^"]*\bnav-cta\b[^"]*"[^>]*>[\s\S]*?<\/a>/i, '</ul>');
    html = html.replace(/<\/ul>\s*<span\b[^>]*class="[^"]*\bnav-theme-item\b[^"]*"[^>]*>[\s\S]*?<\/span>/i, '</ul>');

    // 3. Canonical mobile nav. Most pages use <nav>, three legacy templates
    //    use a <div> with nested groups; the lookahead stops at the real end.
    if (/<nav\b[^>]*class="[^"]*\bmobile-menu\b/i.test(html)) {
      html = replaceOnce(html, /<nav\b[^>]*class="[^"]*\bmobile-menu\b[^"]*"[^>]*>[\s\S]*?<\/nav>/i, MOBILE_NAV);
    } else {
      html = html.replace(
        /<div\b[^>]*class="[^"]*\bmobile-menu\b[^"]*"[^>]*>[\s\S]*?<\/div>\s*(?=<\/header>|<main\b|<\/body>)/i,
        MOBILE_NAV
      );
    }

    // 4. main.js is what powers the mobile menu, theme toggle and floating CTA.
    //    Keep the CSP nonce on the tag: script-src uses 'strict-dynamic'.
    if (!/assets\/js\/main\.js/.test(html)) {
      if (/<\/body>/i.test(html)) {
        html = html.replace(/<\/body>/i, '<script src="/assets/js/main.js" defer nonce="P3rf0rm4lyt1c"></script>\n</body>');
      } else {
        html += '\n<script src="/assets/js/main.js" defer nonce="P3rf0rm4lyt1c"></script>\n';
      }
    }
    html = html.replace(/<script\s+src="\/assets\/js\/main\.js"([^>]*)><\/script>/gi, (m, attrs) => {
      if (/nonce=/i.test(attrs)) return m;
      return `<script src="/assets/js/main.js"${attrs} nonce="P3rf0rm4lyt1c"></script>`;
    });
  }

  // 5. One horizontal footer lockup, theme-aware, and one social row.
  html = html.replace(/<img\b[^>]*class="[^"]*footer-brand-logo-dark[^"]*"[^>]*>/i, FOOTER_DARK);
  html = html.replace(/<img\b[^>]*class="[^"]*footer-brand-logo-light[^"]*"[^>]*>/i, FOOTER_LIGHT);
  html = html.replace(/<div\b[^>]*class="[^"]*\bfooter-social\b[^"]*"[^>]*>[\s\S]*?<\/div>/i, FOOTER_SOCIAL);

  // 6. Remove the duplicate in-page booking pill from Knowledge Hub pages.
  if (/knowledge\//.test(file.replace(/\\/g, '/'))) {
    html = html.replace(/<a\b[^>]*class="[^"]*\bbook-meeting\b[^"]*"[^>]*>[\s\S]*?<\/a>\s*/gi, '');
    html = html.replace(/\s*\.book-meeting(?::hover|\s+svg)?\{[^}]*\}/g, '');
    // The hub hero's four corner particles read as stray marks around the
    // content instead of decoration. Drop them on Knowledge Hub pages only.
    html = html.replace(/<div class="hero-particles">[\s\S]*?<\/div>\s*/i, '');
  }

  // 7. Fix double-escaped ampersands in the hub copy.
  html = html.replace(/&amp;amp;/g, '&amp;');

  // 7e. Make sure every page advertises the real favicon. A few hand-built
  //     pages (careers/apply) omitted it, which produced a /favicon.ico 404.
  if (!/<link\b[^>]*rel=["'](?:icon|shortcut icon)["']/i.test(html)) {
    const favicon = '<link rel="icon" type="image/png" href="/assets/images/fav-1-e1651044714367.png" sizes="any" />';
    if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, `${favicon}\n</head>`);
    } else if (/<main\b/i.test(html)) {
      html = html.replace(/<main\b/i, `${favicon}\n<main`);
    }
  }

  // 7f. Wrap wide comparison tables so mobile readers can scroll the table
  //     instead of the whole page. The wrapper check keeps this idempotent.
  html = html.replace(/<table\b[^>]*class="[^"]*\blp-table\b[^"]*"[^>]*>[\s\S]*?<\/table>/gi, (table, offset) => {
    const before = html.slice(Math.max(0, offset - 40), offset);
    return before.includes('lp-table-wrap') ? table : `<div class="lp-table-wrap">${table}</div>`;
  });

  // 7g. Add each column heading to its cells as a data-label. On small screens
  //     the comparison tables turn into labelled cards instead of a clipped
  //     four-column table that depends on an undiscoverable horizontal swipe.
  html = html.replace(/<table\b[^>]*class="[^"]*\blp-table\b[^"]*"[^>]*>[\s\S]*?<\/table>/gi, (table) => {
    if (/\bdata-label=/.test(table)) return table;
    const head = table.match(/<thead\b[^>]*>[\s\S]*?<\/thead>/i);
    const body = table.match(/<tbody\b[^>]*>[\s\S]*?<\/tbody>/i);
    if (!head || !body) return table;
    const labels = [...head[0].matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map((m) =>
      m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    );
    if (!labels.length) return table;
    const labelledBody = body[0].replace(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi, (row, attrs, inner) => {
      let index = 0;
      const cells = inner.replace(/<td\b([^>]*)>/gi, (cell, cellAttrs) => {
        const label = labels[index++] || '';
        return `<td${cellAttrs} data-label="${label.replace(/"/g, '&quot;')}">`;
      });
      return `<tr${attrs}>${cells}</tr>`;
    });
    return table.replace(body[0], labelledBody);
  });

  // 7a. A couple of hand-built pages had duplicate self-closing slashes
  //     (`/> />`), which pushed the rest of the metadata out of <head>.
  html = html.replace(/\/>\s*\/>/g, '/>');

  // 7b. Blog templates had page-specific <style> blocks without the CSP
  //     nonce, so the quick-answer and sources styling was silently blocked.
  //     Give every inline style block the same nonce the rest of the page uses.
  html = html.replace(/<style(?![^>]*\bnonce=)([^>]*)>/gi, '<style nonce="P3rf0rm4lyt1c"$1>');

  // 7c. Inline SVG diagrams use style attributes for their fills and strokes.
  //     Allow those attributes explicitly while keeping <style> blocks nonce-gated.
  //     A few hand-built pages (sitemap) omitted script-src entirely, which also
  //     blocked their nonce-tagged theme and page scripts.
  html = html.replace(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, (tag) => {
    return tag.replace(/(content=")([^"]*)(")/i, (m, pre, csp, post) => {
      if (!/style-src-attr/i.test(csp)) {
        csp = csp.replace(/;\s*$/, '') + "; style-src-attr 'unsafe-inline'";
      }
      if (!/script-src(?![-\w])/i.test(csp)) {
        if (/default-src[^;]*/i.test(csp)) {
          csp = csp.replace(/default-src[^;]*/i, "$&; script-src 'self' 'nonce-P3rf0rm4lyt1c'");
        } else {
          csp = "script-src 'self' 'nonce-P3rf0rm4lyt1c'; " + csp;
        }
      } else if (!/nonce-/.test(csp) && !/'unsafe-inline'/.test(csp)) {
        csp = csp.replace(/(script-src(?![-\w])[^;]*)/i, "$1 'nonce-P3rf0rm4lyt1c'");
      }
      return pre + csp + post;
    });
  });

  // 7d. Guard the deferred stylesheet activation on pages whose <link> is
  //     absent (careers/apply), which otherwise throws a null dereference.
  html = html.replace(
    /document\.getElementById\(['"]deferred-styles['"]\)\.rel\s*=\s*['"]stylesheet['"];/g,
    "var __ds=document.getElementById('deferred-styles');if(__ds)__ds.rel='stylesheet';"
  );

  // 8. Insert/update the shared polish CSS as late as possible. A few
  //    hand-built pages omit </head> and <body>, so fall back to the first
  //    landmark element.
  if (/<style id="pa-design-polish"[^>]*>[\s\S]*?<\/style>/i.test(html)) {
    html = html.replace(/<style id="pa-design-polish"[^>]*>[\s\S]*?<\/style>/i, POLISH_CSS);
  } else if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, POLISH_CSS + '\n</head>');
  } else if (/<body\b/i.test(html)) {
    html = html.replace(/<body\b/i, POLISH_CSS + '\n<body');
  } else if (/<main\b/i.test(html)) {
    html = html.replace(/<main\b/i, POLISH_CSS + '\n<main');
  } else if (/<header\b/i.test(html)) {
    html = html.replace(/<header\b/i, POLISH_CSS + '\n<header');
  }

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    changed++;
  }
}

console.log(`design consistency pass complete: ${changed} file(s) updated`);
