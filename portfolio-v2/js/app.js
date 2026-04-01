/* ============================================================
   APP — Main orchestrator for Dhruv Singhal Portfolio v3
   Multi-page architecture: detects data-page and conditionally
   initializes only the modules that page needs.
   ============================================================ */

(function () {
  'use strict';

  var loadingScreen = document.getElementById('loading-screen');
  var loadingBarFill = document.getElementById('loading-bar-fill');
  var loadProgress = 0;

  /* --- Page detection --- */
  var page = (document.body.getAttribute('data-page') || 'home').toLowerCase();

  function setProgress(pct) {
    loadProgress = Math.min(pct, 100);
    if (loadingBarFill) {
      loadingBarFill.style.width = loadProgress + '%';
    }
  }

  function dismissLoading() {
    setProgress(100);
    setTimeout(function () {
      if (loadingScreen) {
        loadingScreen.classList.add('loaded');
      }
    }, 300);
  }

  /* --- Mobile Nav --- */
  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var mobile = document.getElementById('nav-mobile');
    if (!toggle || !mobile) return;

    toggle.addEventListener('click', function () {
      var isOpen = mobile.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    mobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobile.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* --- Nav active state for multi-page --- */
  function initNavActiveState() {
    var navLinks = document.querySelectorAll('.nav-links a, .nav-mobile a');
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var linkPage = href.replace(/.*\//, '').replace('.html', '') || 'index';
      var isActive = false;

      if (page === 'home' && (linkPage === 'index' || href === '/' || href === './')) {
        isActive = true;
      } else if (page === 'case-study' && linkPage === 'projects') {
        isActive = true;
      } else if (page === 'article' && linkPage === 'blog') {
        isActive = true;
      } else if (linkPage === page) {
        isActive = true;
      }

      link.classList.toggle('active', isActive);
    });
  }

  /* --- 3D Tilt Cards --- */
  function initTiltCards() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('ontouchstart' in window) return;

    var cards = document.querySelectorAll('.tilt-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;

        var tiltX = ((y - centerY) / centerY) * -5;
        var tiltY = ((x - centerX) / centerX) * 5;

        card.style.setProperty('--tilt-x', tiltX + 'deg');
        card.style.setProperty('--tilt-y', tiltY + 'deg');
      });

      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  /* --- Smooth scroll for anchor links --- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (href === '#') return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var offset = 80;
          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  /* --- Page-specific module map --- */
  var pageModules = {
    home: function () {
      if (window.DSUtils) {
        window.DSUtils.initTyped();
        window.DSUtils.initCounters();
        window.DSUtils.initCopyEmail();
      }
      if (window.DSThreeHero) window.DSThreeHero.init();
      if (window.DSParticles) window.DSParticles.init();
      if (window.DSCarousel) window.DSCarousel.init();
      initTiltCards();
    },
    about: function () {
      if (window.DSSkillsChart) window.DSSkillsChart.init();
    },
    projects: function () {
      if (window.DSProjectFilters) window.DSProjectFilters.init();
    },
    'case-study': function () {
      if (window.DSCaseStudyCharts) window.DSCaseStudyCharts.init();
      if (window.DSReadingProgress) window.DSReadingProgress.init();
    },
    blog: function () {
      if (window.DSBlogSearch) window.DSBlogSearch.init();
    },
    article: function () {
      if (window.DSReadingProgress) window.DSReadingProgress.init();
    },
    contact: function () {
      if (window.DSContactForm) window.DSContactForm.init();
    },
    now: function () {},
    '404': function () {}
  };

  /* --- Init Sequence --- */
  document.addEventListener('DOMContentLoaded', function () {
    setProgress(10);

    // Phase 1: Core (all pages)
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    setProgress(20);

    initMobileNav();
    initNavActiveState();
    initSmoothScroll();
    setProgress(30);

    // Phase 2: Shared modules (all pages)
    if (window.DSScrollAnimations) window.DSScrollAnimations.init(page);
    setProgress(50);

    if (window.DSPageTransitions) window.DSPageTransitions.init();
    setProgress(60);

    // Phase 3: Page-specific modules
    var initPage = pageModules[page];
    if (initPage) initPage();
    setProgress(90);

    // Phase 4: Post-init
    initTiltCards();
    setProgress(95);

    if (window.DSCursor && window.DSCursor.initMagnetic) {
      window.DSCursor.initMagnetic();
    }

    // Dismiss loading
    dismissLoading();
  });

  // Fallback: dismiss loading after max 4 seconds regardless
  setTimeout(dismissLoading, 4000);

  window.DSApp = { getPage: function () { return page; } };
})();
