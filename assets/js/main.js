(function(){
  'use strict';

  document.documentElement.classList.add('js');

  /* ============================================
     Scroll Reveal Animations
  ============================================ */
  function initScrollReveal() {
    var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (revealEls.length) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
      });

      revealEls.forEach(function(el) {
        observer.observe(el);
      });
    }

    // Staggered reveal for grid items
    var gridContainers = document.querySelectorAll('.services-grid, .solutions-grid, .tech-grid, .trust-grid, .process-grid, .industries-grid, .tech-card-grid, .features-grid, .use-cases-grid, .tool-grid, .coming-soon-grid, .stats-grid');
    gridContainers.forEach(function(grid) {
      var items = grid.querySelectorAll('.service-card, .solution-card, .tech-item, .trust-item, .process-step, .industry-card, .tech-card, .feature-card, .use-case-card, .tool-card, .placeholder-card, .stat-item');
      if (!items.length) return;

      var gridObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var gridItems = entry.target.querySelectorAll('.service-card, .solution-card, .tech-item, .trust-item, .process-step, .industry-card, .tech-card, .feature-card, .use-case-card, .tool-card, .placeholder-card, .stat-item');
            gridItems.forEach(function(item, index) {
              setTimeout(function() {
                item.classList.add('revealed');
              }, index * 100);
            });
            gridObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      gridObserver.observe(grid);
    });
  }

  /* ============================================
     Back to Top Button
  ============================================ */
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'back-to-top';
      btn.setAttribute('aria-label', 'Back to top');
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
      document.body.appendChild(btn);
    }

    var scrollThreshold = 400;
    var ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          if (window.scrollY > scrollThreshold) {
            btn.classList.add('visible');
          } else {
            btn.classList.remove('visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================
     Lazy Image Load Handler
  ============================================ */
  function initLazyImages() {
    var imgs = document.querySelectorAll('img[loading="lazy"]');
    imgs.forEach(function(img) {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function() {
          img.classList.add('loaded');
        });
        img.addEventListener('error', function() {
          img.classList.add('loaded');
        });
      }
    });
  }

  /* ============================================
     Counter Animation
  ============================================ */
  function animateCounter(el) {
    var text = el.textContent.trim();
    var numStr = text.replace(/[^0-9.]/g, '');
    var suffix = text.replace(/[0-9.]/g, '');
    var target = parseFloat(numStr, 10);
    if (isNaN(target) || target === 0) return;

    var duration = 2000;
    var startTime = null;
    var isDecimal = numStr.indexOf('.') > -1;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = eased * target;
      if (isDecimal) {
        el.textContent = current.toFixed(1) + suffix;
      } else {
        el.textContent = Math.floor(current) + suffix;
      }
      if (progress < 1) {
        window.requestAnimationFrame(animate);
      } else {
        el.textContent = target + suffix;
      }
    }
    window.requestAnimationFrame(animate);
  }

  function initCounters() {
    var counters = document.querySelectorAll('.hero-stat h3, .metric-number');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(function(el) {
      observer.observe(el);
    });
  }

  /* ============================================
     Smooth Anchor Scrolling
  ============================================ */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var navHeight = 80;
          var targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
      });
    });
  }

  /* ============================================
     Nav Dropdown Touch Support
     (Mobile menu toggle is handled by each page's
     inline script — do not bind it here too, or
     each tap toggles the menu twice.)
  ============================================ */
  function initDropdownTouch() {
    if (!('ontouchstart' in window)) return;
    document.querySelectorAll('.nav-links > li > a[aria-haspopup]').forEach(function(trigger) {
      trigger.addEventListener('click', function(e) {
        var li = this.parentElement;
        var dropdown = li.querySelector('.dropdown, .nav-dropdown');
        if (!dropdown) return;
        var isOpen = dropdown.style.display === 'block';
        // Close all first
        document.querySelectorAll('.dropdown, .nav-dropdown').forEach(function(d) {
          d.style.display = '';
        });
        if (!isOpen) {
          e.preventDefault();
          dropdown.style.display = 'block';
        }
      });
    });

    // Close dropdowns when tapping outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.nav-links > li')) {
        document.querySelectorAll('.dropdown, .nav-dropdown').forEach(function(d) {
          d.style.display = '';
        });
      }
    });
  }

  /* ============================================
     Parallax Hero Glow Effect
  ============================================ */
  function initHeroParallax() {
    var hero = document.querySelector('.hero, .blog-hero, .post-hero');
    if (!hero) return;

    hero.addEventListener('mousemove', function(e) {
      var rect = hero.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      var glows = hero.querySelectorAll('::before, ::after');
      // Subtle CSS custom prop approach instead
      hero.style.setProperty('--mouse-x', (x * 20) + 'px');
      hero.style.setProperty('--mouse-y', (y * 20) + 'px');
    });
  }

  /* ============================================
     Navbar Background on Scroll
  ============================================ */
  function initNavScroll() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    var tickingNav = false;

    function updateNav() {
      if (window.scrollY > 10) {
        nav.style.background = 'rgba(8,14,28,0.98)';
        nav.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
      } else {
        nav.style.background = 'rgba(8,14,28,0.92)';
        nav.style.boxShadow = 'none';
      }
    }

    window.addEventListener('scroll', function() {
      if (!tickingNav) {
        window.requestAnimationFrame(function() {
          updateNav();
          tickingNav = false;
        });
        tickingNav = true;
      }
    }, { passive: true });

    updateNav();
  }

  /* ============================================
     Blog Post Reading Progress Bar
  ============================================ */
  function initReadingProgress() {
    var article = document.querySelector('.post-content');
    if (!article) return;

    var bar = document.querySelector('.reading-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'reading-progress';
      document.body.appendChild(bar);
    }

    var ticking = false;
    function update() {
      var rect = article.getBoundingClientRect();
      var articleTop = rect.top + window.scrollY;
      var total = article.offsetHeight - window.innerHeight;
      var scrolled = window.scrollY - articleTop + window.innerHeight * 0.5;
      var pct = total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0;
      bar.style.width = pct + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  /* ============================================
     FAQ Accordion
  ============================================ */
  function initFaqAccordion() {
    var questions = document.querySelectorAll('.faq-question');
    if (!questions.length) return;

    questions.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item = this.parentElement;
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function(openItem) {
          openItem.classList.remove('open');
          var q = openItem.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          this.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ============================================
     Floating Book a Meeting Button
  ============================================ */
  function initFloatingMeetingBtn() {
    if (document.querySelector('.floating-meeting-btn')) return;
    if (window.location.pathname === '/book-meeting/' || window.location.pathname === '/careers/apply/') return;
    
    var btn = document.createElement('a');
    btn.href = '/book-meeting/';
    btn.className = 'floating-meeting-btn';
    btn.setAttribute('aria-label', 'Book a Meeting');
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>Book a Meeting</span>';
    document.body.appendChild(btn);
  }

  /* ============================================
     Dropdown Keyboard Accessibility
  ============================================ */
  function initDropdownKeyboard() {
    var triggers = document.querySelectorAll('.nav-links > li > a[aria-haspopup]');
    if (!triggers.length) return;

    function closeAll(exceptLi) {
      document.querySelectorAll('.nav-links > li').forEach(function(li) {
        if (li !== exceptLi) {
          li.classList.remove('is-open');
          var t = li.querySelector('a[aria-haspopup]');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
    }

    function closeAndRefocus(trigger) {
      var li = trigger.closest('li');
      li.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }

    triggers.forEach(function(trigger) {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        var li = this.parentElement;
        var isOpen = li.classList.contains('is-open');
        closeAll(li);
        if (isOpen) {
          li.classList.remove('is-open');
          this.setAttribute('aria-expanded', 'false');
        } else {
          li.classList.add('is-open');
          this.setAttribute('aria-expanded', 'true');
        }
      });

      trigger.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        } else if (e.key === 'Escape') {
          closeAndRefocus(this);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          var li = this.closest('li');
          var menu = li.querySelector('.nav-dropdown, .dropdown');
          if (!menu) return;
          var items = menu.querySelectorAll('a, button, [tabindex]');
          if (items.length) {
            if (!li.classList.contains('is-open')) {
              this.click();
            }
            items[0].focus();
          }
        } else if (e.key === 'Tab') {
          var li = this.closest('li');
          if (li.classList.contains('is-open')) {
            var menu = li.querySelector('.nav-dropdown, .dropdown');
            var items = menu ? menu.querySelectorAll('a, button, [tabindex]') : [];
            if (items.length) {
              if (e.shiftKey && document.activeElement === this) {
                e.preventDefault();
                closeAndRefocus(this);
              } else if (!e.shiftKey && document.activeElement === items[items.length - 1]) {
                closeAll();
                li.classList.remove('is-open');
                this.setAttribute('aria-expanded', 'false');
              }
            }
          }
        }
      });
    });

    document.querySelectorAll('.nav-dropdown, .dropdown').forEach(function(menu) {
      var menuItems = menu.querySelectorAll('a, button, [tabindex]');
      menuItems.forEach(function(item) {
        item.addEventListener('keydown', function(e) {
          var list = Array.from(menuItems);
          var idx = list.indexOf(this);
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (idx < list.length - 1) {
              list[idx + 1].focus();
            }
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (idx > 0) {
              list[idx - 1].focus();
            } else {
              var trigger = menu.closest('li').querySelector('a[aria-haspopup]');
              if (trigger) trigger.focus();
            }
          } else if (e.key === 'Escape') {
            e.preventDefault();
            var trigger = menu.closest('li').querySelector('a[aria-haspopup]');
            if (trigger) closeAndRefocus(trigger);
          } else if (e.key === 'Tab') {
            var li = menu.closest('li');
            if (e.shiftKey && document.activeElement === menuItems[0]) {
              var trigger = li.querySelector('a[aria-haspopup]');
              if (trigger) {
                e.preventDefault();
                closeAndRefocus(trigger);
              }
            } else if (!e.shiftKey && document.activeElement === menuItems[menuItems.length - 1]) {
              closeAll();
              li.classList.remove('is-open');
              var trigger = li.querySelector('a[aria-haspopup]');
              if (trigger) trigger.setAttribute('aria-expanded', 'false');
            }
          }
        });
      });
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.nav-links > li')) {
        closeAll();
      }
    });

    document.addEventListener('focusin', function(e) {
      if (!e.target.closest('.nav-links > li')) {
        closeAll();
      }
    });
  }

  /* ============================================
     Cookie Consent Banner
  ============================================ */
  function initCookieConsent() {
    if (localStorage.getItem('cookie_consent')) return;

    setTimeout(function() {
      if (document.querySelector('.cookie-consent')) return;

      var banner = document.createElement('div');
      banner.className = 'cookie-consent';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-label', 'Cookie consent');
      banner.innerHTML = '<p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies. <a href="/cookie-policy/">Learn more</a></p><div class="cookie-consent-btns"><button class="btn-accept" aria-label="Accept cookies">Accept</button><button class="btn-decline" aria-label="Decline cookies">Decline</button></div>';
      document.body.appendChild(banner);

      banner.querySelector('.btn-accept').addEventListener('click', function() {
        localStorage.setItem('cookie_consent', 'accepted');
        banner.classList.remove('visible');
      });

      banner.querySelector('.btn-decline').addEventListener('click', function() {
        localStorage.setItem('cookie_consent', 'declined');
        banner.classList.remove('visible');
      });

      requestAnimationFrame(function() {
        banner.classList.add('visible');
      });
    }, 1500);
  }

  /* ============================================
     Initialize Everything
  ============================================ */
  function init() {
    initCookieConsent();
    initScrollReveal();
    initBackToTop();
    initLazyImages();
    initCounters();
    initSmoothAnchors();
    initDropdownTouch();
    initDropdownKeyboard();
    initHeroParallax();
    initNavScroll();
    initFloatingMeetingBtn();
    initReadingProgress();
    initFaqAccordion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
