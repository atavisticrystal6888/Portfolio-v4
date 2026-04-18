/* ============================================================
   CAROUSEL — Testimonials auto-scroll carousel
   ============================================================ */

(function () {
  'use strict';

  function init() {
    var track = document.getElementById('carousel-track');
    var dotsContainer = track ? track.closest('.carousel') : null;
    dotsContainer = dotsContainer ? dotsContainer.querySelector('.carousel-dots') : null;
    var prevBtn = document.querySelector('[data-carousel-prev]');
    var nextBtn = document.querySelector('[data-carousel-next]');
    if (!track) return;

    var cards = track.querySelectorAll('.testimonial-card');
    var total = cards.length;
    if (total === 0) return;

    var current = 0;
    var autoplayInterval = null;
    var isPaused = false;

    // Use existing dots (from HTML) or create them dynamically
    var existingDots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];
    if (dotsContainer && existingDots.length === 0) {
      for (var i = 0; i < total; i++) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
        dot.setAttribute('data-index', i);
        dotsContainer.appendChild(dot);
      }
    }

    function goTo(index) {
      if (index < 0) index = total - 1;
      if (index >= total) index = 0;
      current = index;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';

      // Update dots
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.carousel-dot').forEach(function (d, i) {
          d.classList.toggle('active', i === current);
        });
      }
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // Button handlers
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); resetAutoplay(); });

    // Dot click
    if (dotsContainer) {
      dotsContainer.addEventListener('click', function (e) {
        var dot = e.target.closest('.carousel-dot');
        if (!dot) return;
        var idx = dot.getAttribute('data-carousel-dot') || dot.getAttribute('data-index');
        goTo(parseInt(idx, 10));
        resetAutoplay();
      });
    }

    // Keyboard navigation
    var carousel = track.closest('.carousel');
    if (carousel) {
      carousel.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { prev(); resetAutoplay(); }
        if (e.key === 'ArrowRight') { next(); resetAutoplay(); }
      });
    }

    // Autoplay
    function startAutoplay() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      autoplayInterval = setInterval(function () {
        if (!isPaused) next();
      }, 5000);
    }

    function resetAutoplay() {
      clearInterval(autoplayInterval);
      startAutoplay();
    }

    // Pause on hover/focus
    if (carousel) {
      carousel.addEventListener('mouseenter', function () { isPaused = true; });
      carousel.addEventListener('mouseleave', function () { isPaused = false; });
      carousel.addEventListener('focusin', function () { isPaused = true; });
      carousel.addEventListener('focusout', function () { isPaused = false; });
    }

    startAutoplay();
  }

  window.DSCarousel = { init: init };
})();
