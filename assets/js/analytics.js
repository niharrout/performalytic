/* Performalytic analytics loader
 * - Loads GA4 only after cookie consent (GDPR-friendly).
 * - Listens for the `pa:consent` event dispatched by main.js.
 * - Tags AI-assistant referrals (ChatGPT, Perplexity, Gemini, Copilot, Claude).
 * - Tracks outbound clicks to the 4DAlert product site.
 */
(function () {
  'use strict';

  var GA_ID = 'G-FV09CSCD2C';
  var CONSENT_KEY = 'cookie_consent';
  var loaded = false;

  var AI_HOSTS = {
    'chatgpt.com': 'ChatGPT',
    'chat.openai.com': 'ChatGPT',
    'perplexity.ai': 'Perplexity',
    'gemini.google.com': 'Gemini',
    'bard.google.com': 'Gemini',
    'copilot.microsoft.com': 'Microsoft Copilot',
    'claude.ai': 'Claude',
    'you.com': 'You.com',
    'poe.com': 'Poe',
    'phind.com': 'Phind',
    'kagi.com': 'Kagi',
    'duckduckgo.com': 'DuckDuckGo AI'
  };

  function readConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (e) {
      return null;
    }
  }

  function aiSource() {
    var ref = document.referrer || '';
    if (!ref) return null;
    var host;
    try {
      host = new URL(ref).hostname.replace(/^www\./, '');
    } catch (e) {
      return null;
    }
    return AI_HOSTS[host] || null;
  }

  function trackAIReferral() {
    var source = aiSource();
    if (!source || !window.gtag) return;
    try {
      sessionStorage.setItem('pa_ai_source', source);
    } catch (e) {}
    window.gtag('event', 'ai_referral', {
      ai_source: source,
      ai_referrer_host: document.referrer ? new URL(document.referrer).hostname : '',
      page_location: window.location.href,
      page_title: document.title
    });
  }

  function load() {
    if (loaded || readConsent() !== 'accepted') return;
    loaded = true;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });

    trackAIReferral();
  }

  // Outbound click tracking for the product site (delegated, capture phase).
  document.addEventListener(
    'click',
    function (event) {
      var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
      if (!link || !window.gtag) return;
      var href = link.getAttribute('href') || '';
      if (href.indexOf('4dalert.com') === -1) return;
      window.gtag('event', 'outbound_click', {
        link_url: link.href,
        link_domain: '4dalert.com',
        link_text: (link.textContent || '').trim().slice(0, 100)
      });
    },
    true
  );

  window.paLoadAnalytics = load;
  window.paTrackAIReferral = trackAIReferral;

  window.addEventListener('pa:consent', function (event) {
    if (event && event.detail === 'accepted') load();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
