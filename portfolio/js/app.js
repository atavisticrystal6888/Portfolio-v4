/* ============================================================
   APP — Main orchestrator for Dhruv Singhal Portfolio v2
   Initializes all modules in correct sequence
   ============================================================ */

(function () {
  'use strict';

  var loadingScreen = document.getElementById('loading-screen');
  var loadingBarFill = document.getElementById('loading-bar-fill');
  var loadProgress = 0;

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
        var target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          var offset = 80; // nav height + buffer
          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  /* --- Init Sequence --- */
  document.addEventListener('DOMContentLoaded', function () {
    setProgress(10);

    // Phase 1: Core
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    setProgress(20);

    initMobileNav();
    initSmoothScroll();
    setProgress(30);

    // Phase 2: Utilities
    if (window.DSUtils) {
      window.DSUtils.initTyped();
      window.DSUtils.initCounters();
      window.DSUtils.initCopyEmail();
    }
    setProgress(50);

    // Phase 3: Visual effects
    if (window.DSThreeHero) window.DSThreeHero.init();
    setProgress(60);

    if (window.DSParticles) window.DSParticles.init();
    setProgress(70);

    // Phase 4: Interactive systems
    if (window.DSScrollAnimations) window.DSScrollAnimations.init();
    setProgress(80);

    if (window.DSSkillsChart) window.DSSkillsChart.init();
    if (window.DSCarousel) window.DSCarousel.init();
    setProgress(90);

    initTiltCards();
    setProgress(95);

    // Re-init magnetic for cursor (after all elements rendered)
    if (window.DSCursor && window.DSCursor.initMagnetic) {
      window.DSCursor.initMagnetic();
    }

    // Dismiss loading
    dismissLoading();
  });

  // Fallback: dismiss loading after max 4 seconds regardless
  setTimeout(dismissLoading, 4000);
})();
